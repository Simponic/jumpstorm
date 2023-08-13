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
import type { Dimension2D, Velocity2D } from "../interfaces";
import { QuadTree } from "../structures";

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
      game.componentEntities.get(componentName),
    ).forEach(
      (entityIds?: Set<number>) =>
        entityIds?.forEach((id) => {
          const entity = game.entities.get(id);
          if (!entity || !entity.hasComponent(ComponentNames.BoundingBox)) {
            return;
          }
          entitiesToAddToQuadtree.push(entity);
        }),
    );

    entitiesToAddToQuadtree.forEach((entity) => {
      const boundingBox = entity.getComponent<BoundingBox>(
        ComponentNames.BoundingBox,
      );

      let dimension = { ...boundingBox.dimension };
      if (boundingBox.rotation != 0) {
        dimension = boundingBox.getOutscribedBoxDims();
      }

      this.quadTree.insert({
        id: entity.id,
        dimension,
        center: boundingBox.center,
      });
    });

    // find colliding entities and perform collisions
    const collidingEntities = this.getCollidingEntities(
      entitiesToAddToQuadtree,
      game,
    );

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
  ): [number, number][] {
    const collidingEntityIds: [number, number][] = [];

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
