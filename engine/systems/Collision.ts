import { SystemNames, System } from ".";
import {
  Mass,
  BoundingBox,
  ComponentNames,
  Jump,
  Velocity,
  Forces,
} from "../components";
import { Game } from "../Game";
import { PhysicsConstants } from "../config";
import { Entity } from "../entities";
import type { Coord2D, Dimension2D, Velocity2D } from "../interfaces";
import { QuadTree, BoxedEntry } from "../structures";

export class Collision extends System {
  private static readonly COLLIDABLE_COMPONENT_NAMES = [
    ComponentNames.Collide,
    ComponentNames.TopCollidable,
  ];
  private static readonly QUADTREE_MAX_LEVELS = 10;
  private static readonly QUADTREE_SPLIT_THRESHOLD = 10;

  private quadTree: QuadTree;

  constructor(screenDimensions: Dimension2D) {
    super(SystemNames.Collision);

    this.quadTree = new QuadTree(
      { x: 0, y: 0 },
      screenDimensions,
      Collision.QUADTREE_MAX_LEVELS,
      Collision.QUADTREE_SPLIT_THRESHOLD,
    );
  }

  public update(_dt: number, game: Game) {
    // rebuild the quadtree
    this.quadTree.clear();

    const entitiesToAddToQuadtree: Entity[] = [];

    Collision.COLLIDABLE_COMPONENT_NAMES.map((componentName) =>
      game.forEachEntityWithComponent(componentName, (entity) => {
        if (!entity.hasComponent(ComponentNames.BoundingBox)) {
          return;
        }
        entitiesToAddToQuadtree.push(entity);
      }),
    );

    this.insertEntitiesInQuadTreeAndUpdateBounds(entitiesToAddToQuadtree);

    this.findCollidingEntitiesAndCollide(entitiesToAddToQuadtree, game);
  }

  private insertEntitiesInQuadTreeAndUpdateBounds(entities: Entity[]) {
    const topLeft: Coord2D = { x: Infinity, y: Infinity };
    const bottomRight: Coord2D = { x: -Infinity, y: -Infinity };

    const quadTreeInsertions: BoxedEntry[] = [];

    entities.forEach((entity) => {
      const boundingBox = entity.getComponent<BoundingBox>(
        ComponentNames.BoundingBox,
      );

      let dimension = { ...boundingBox.dimension };
      if (boundingBox.rotation != 0) {
        dimension = boundingBox.getOutscribedBoxDims();
      }

      const { center } = boundingBox;
      const topLeftBoundingBox = {
        x: center.x - dimension.width / 2,
        y: center.y - dimension.height / 2,
      };
      const bottomRightBoundingBox = {
        x: center.x + dimension.width / 2,
        y: center.y + dimension.height / 2,
      };

      topLeft.x = Math.min(topLeftBoundingBox.x, topLeft.x);
      topLeft.y = Math.min(topLeftBoundingBox.y, topLeft.y);
      bottomRight.x = Math.max(bottomRightBoundingBox.x, bottomRight.x);
      bottomRight.y = Math.min(bottomRightBoundingBox.y, bottomRight.y);

      quadTreeInsertions.push({
        id: entity.id,
        dimension,
        center,
      });
    });

    // set bounds first
    if (entities.length > 0) {
      this.quadTree.setTopLeft(topLeft);
      this.quadTree.setDimension({
        width: bottomRight.x - topLeft.x,
        height: bottomRight.y - topLeft.y,
      });
    }

    // then, begin insertions
    quadTreeInsertions.forEach((boxedEntry: BoxedEntry) =>
      this.quadTree.insert(boxedEntry),
    );
  }

  private findCollidingEntitiesAndCollide(entities: Entity[], game: Game) {
    const collidingEntities = this.getCollidingEntities(entities, game);

    collidingEntities.forEach(([entityAId, entityBId]) => {
      const [entityA, entityB] = [entityAId, entityBId].map((id) =>
        game.entities.get(id),
      );
      if (entityA && entityB) {
        this.performCollision(entityA, entityB);
      }
    });
  }

  private performCollision(entityA: Entity, entityB: Entity) {
    const [entityABoundingBox, entityBBoundingBox] = [entityA, entityB].map(
      (entity) => entity.getComponent<BoundingBox>(ComponentNames.BoundingBox),
    );

    let velocity: Velocity2D = { dCartesian: { dx: 0, dy: 0 }, dTheta: 0 };
    if (entityA.hasComponent(ComponentNames.Velocity)) {
      velocity = entityA.getComponent<Velocity>(
        ComponentNames.Velocity,
      ).velocity;
    }

    if (
      entityA.hasComponent(ComponentNames.Collide) &&
      entityB.hasComponent(ComponentNames.TopCollidable) &&
      entityABoundingBox.center.y <= entityBBoundingBox.center.y &&
      velocity.dCartesian.dy >= 0 // don't apply "floor" logic when coming through the bottom
    ) {
      if (entityBBoundingBox.rotation != 0) {
        throw new Error(
          `entity with id ${entityB.id} has TopCollidable component and a non-zero rotation. that is not (yet) supported.`,
        );
      }

      // remove previous velocity in the y axis
      if (velocity) velocity.dCartesian.dy = 0;

      // apply normal force
      if (entityA.hasComponent(ComponentNames.Gravity)) {
        const mass = entityA.getComponent<Mass>(ComponentNames.Mass).mass;
        const F_n = -mass * PhysicsConstants.GRAVITY;

        entityA.getComponent<Forces>(ComponentNames.Forces).forces.push({
          fCartesian: { fy: F_n, fx: 0 },
          torque: 0,
        });
      }

      // reset the entities' jump
      if (entityA.hasComponent(ComponentNames.Jump)) {
        entityA.getComponent<Jump>(ComponentNames.Jump).canJump = true;
      }

      entityABoundingBox.center.y =
        entityBBoundingBox.center.y -
        entityBBoundingBox.dimension.height / 2 -
        this.getDyToPushOutOfFloor(entityABoundingBox, entityBBoundingBox);
    }
  }

  private getCollidingEntities(
    collidableEntities: Entity[],
    game: Game,
  ): [string, string][] {
    const collidingEntityIds: [string, string][] = [];

    for (const entity of collidableEntities) {
      const boundingBox = entity.getComponent<BoundingBox>(
        ComponentNames.BoundingBox,
      );

      const neighborIds = this.quadTree
        .getNeighborIds({
          id: entity.id,
          dimension: boundingBox.dimension,
          center: boundingBox.center,
        })
        .filter((neighborId) => neighborId != entity.id);

      neighborIds.forEach((neighborId) => {
        const neighbor = game.getEntity(neighborId);
        if (!neighbor) return;

        const neighborBoundingBox = neighbor.getComponent<BoundingBox>(
          ComponentNames.BoundingBox,
        );

        if (boundingBox.isCollidingWith(neighborBoundingBox)) {
          collidingEntityIds.push([entity.id, neighborId]);
        }
      });
    }

    return collidingEntityIds;
  }

  // ramblings: https://excalidraw.com/#json=z-xD86Za4a3duZuV2Oky0,KaGe-5iHJu1Si8inEo4GLQ
  private getDyToPushOutOfFloor(
    entityBoundingBox: BoundingBox,
    floorBoundingBox: BoundingBox,
  ): number {
    const {
      dimension: { width, height },
      center: { x },
    } = entityBoundingBox;

    const outScribedRectangle = entityBoundingBox.getOutscribedBoxDims();

    let rads = entityBoundingBox.getRotationInPiOfUnitCircle();
    let dx = (width * Math.cos(rads) - height * Math.sin(rads)) / 2;

    if (rads >= Math.PI / 2) {
      rads -= Math.PI / 2;
      dx = (height * Math.cos(rads) - width * Math.sin(rads)) / 2;
    }

    const clippedX = x + dx; // x coordinate of the vertex below the surface (if existant)
    let boundedCollisionX = 0; // bounded x on the surface from width

    if (x >= floorBoundingBox.center.x) {
      boundedCollisionX = Math.min(
        floorBoundingBox.center.x + floorBoundingBox.dimension.width / 2,
        clippedX,
      );
      return (
        outScribedRectangle.height / 2 -
        Math.max((clippedX - boundedCollisionX) * Math.tan(rads), 0)
      );
    }

    boundedCollisionX = Math.max(
      floorBoundingBox.center.x - floorBoundingBox.dimension.width / 2,
      clippedX,
    );

    return (
      outScribedRectangle.height / 2 -
      Math.max((boundedCollisionX - clippedX) * Math.tan(Math.PI / 2 - rads), 0)
    );
  }
}
