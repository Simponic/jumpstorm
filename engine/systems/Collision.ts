import { SystemNames, System } from '.';
import {
  Mass,
  BoundingBox,
  ComponentNames,
  Jump,
  Velocity,
  Forces
} from '../components';
import { Game } from '../Game';
import { Miscellaneous, PhysicsConstants } from '../config';
import { Entity } from '../entities';
import type { Coord2D, Dimension2D, Velocity2D } from '../interfaces';
import { BoxedEntry, RefreshingCollisionFinderBehavior } from '../structures';

export class Collision extends System {
  private static readonly COLLIDABLE_COMPONENT_NAMES = [
    ComponentNames.Collide,
    ComponentNames.TopCollidable
  ];

  private collisionFinder: RefreshingCollisionFinderBehavior;

  constructor(refreshingCollisionFinder: RefreshingCollisionFinderBehavior) {
    super(SystemNames.Collision);

    this.collisionFinder = refreshingCollisionFinder;
  }

  public update(_dt: number, game: Game) {
    this.collisionFinder.clear();

    const entitiesToAddToCollisionFinder: Entity[] = [];

    Collision.COLLIDABLE_COMPONENT_NAMES.map((componentName) =>
      game.forEachEntityWithComponent(componentName, (entity) => {
        if (!entity.hasComponent(ComponentNames.BoundingBox)) {
          return;
        }
        entitiesToAddToCollisionFinder.push(entity);
      })
    );

    this.insertEntitiesAndUpdateBounds(entitiesToAddToCollisionFinder);
    this.findCollidingEntitiesAndCollide(entitiesToAddToCollisionFinder, game);
  }

  private insertEntitiesAndUpdateBounds(entities: Entity[]) {
    const collisionFinderInsertions: BoxedEntry[] = [];

    const topLeft: Coord2D = { x: Infinity, y: Infinity };
    const bottomRight: Coord2D = { x: -Infinity, y: -Infinity };

    entities.forEach((entity) => {
      const boundingBox = entity.getComponent<BoundingBox>(
        ComponentNames.BoundingBox
      );

      let dimension = { ...boundingBox.dimension };
      if (boundingBox.rotation != 0) {
        dimension = boundingBox.getOutscribedBoxDims();
      }

      const { center } = boundingBox;
      const topLeftBoundingBox = boundingBox.getTopLeft();
      const bottomRightBoundingBox = boundingBox.getBottomRight();

      topLeft.x = Math.min(topLeftBoundingBox.x, topLeft.x);
      topLeft.y = Math.min(topLeftBoundingBox.y, topLeft.y);
      bottomRight.x = Math.max(bottomRightBoundingBox.x, bottomRight.x);
      bottomRight.y = Math.max(bottomRightBoundingBox.y, bottomRight.y);

      collisionFinderInsertions.push({
        id: entity.id,
        dimension,
        center
      });
    });

    // set bounds first
    if (entities.length > 0) {
      this.collisionFinder.setTopLeft(topLeft);
      this.collisionFinder.setDimension({
        width: bottomRight.x - topLeft.x,
        height: bottomRight.y - topLeft.y
      });
    }

    // then, begin insertions
    collisionFinderInsertions.forEach((boxedEntry: BoxedEntry) =>
      this.collisionFinder.insert(boxedEntry)
    );
  }

  private findCollidingEntitiesAndCollide(entities: Entity[], game: Game) {
    const collidingEntities = this.getCollidingEntities(entities, game);

    collidingEntities.forEach(([entityAId, entityBId]) => {
      const [entityA, entityB] = [entityAId, entityBId].map((id) =>
        game.entities.get(id)
      );
      if (entityA && entityB) {
        this.performCollision(entityA, entityB);
      }
    });
  }

  private performCollision(entityA: Entity, entityB: Entity) {
    const [entityABoundingBox, entityBBoundingBox] = [entityA, entityB].map(
      (entity) => entity.getComponent<BoundingBox>(ComponentNames.BoundingBox)
    );

    let velocity: Velocity2D = { dCartesian: { dx: 0, dy: 0 }, dTheta: 0 };
    if (entityA.hasComponent(ComponentNames.Velocity)) {
      velocity = entityA.getComponent<Velocity>(
        ComponentNames.Velocity
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
          `entity with id ${entityB.id} has TopCollidable component and a non-zero rotation. that is not (yet) supported.`
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
          torque: 0
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
    game: Game
  ): [string, string][] {
    const collidingEntityIds: [string, string][] = [];

    for (const entity of collidableEntities) {
      const boundingBox = entity.getComponent<BoundingBox>(
        ComponentNames.BoundingBox
      );

      const neighborIds = this.collisionFinder.getNeighborIds({
        id: entity.id,
        dimension: boundingBox.dimension,
        center: boundingBox.center
      });

      for (const neighborId of neighborIds) {
        const neighbor = game.getEntity(neighborId);
        if (!neighbor) return;

        const neighborBoundingBox = neighbor.getComponent<BoundingBox>(
          ComponentNames.BoundingBox
        );

        if (boundingBox.isCollidingWith(neighborBoundingBox)) {
          collidingEntityIds.push([entity.id, neighborId]);
        }
      }
    }

    return collidingEntityIds;
  }

  // ramblings: https://excalidraw.com/#json=z-xD86Za4a3duZuV2Oky0,KaGe-5iHJu1Si8inEo4GLQ
  private getDyToPushOutOfFloor(
    entityBoundingBox: BoundingBox,
    floorBoundingBox: BoundingBox
  ): number {
    const {
      dimension: { width, height },
      center: { x }
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
        clippedX
      );
      return (
        outScribedRectangle.height / 2 -
        Math.max((clippedX - boundedCollisionX) * Math.tan(rads), 0)
      );
    }

    boundedCollisionX = Math.max(
      floorBoundingBox.center.x - floorBoundingBox.dimension.width / 2,
      clippedX
    );

    return (
      outScribedRectangle.height / 2 -
      Math.max((boundedCollisionX - clippedX) * Math.tan(Math.PI / 2 - rads), 0)
    );
  }
}
