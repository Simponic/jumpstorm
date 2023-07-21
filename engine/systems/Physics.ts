import { System, SystemNames } from ".";
import {
  Acceleration,
  BoundingBox,
  ComponentNames,
  Forces,
  Gravity,
  Velocity,
  Mass,
  Jump,
} from "../components";
import { PhysicsConstants } from "../config";
import type { Entity } from "../entities";
import type { Force2D } from "../interfaces";
import { Game } from "../Game";

export class Physics extends System {
  constructor() {
    super(SystemNames.Physics);
  }

  public update(dt: number, game: Game): void {
    game.componentEntities.get(ComponentNames.Forces)?.forEach((entityId) => {
      const entity = game.entities.get(entityId);

      const mass = entity.getComponent<Mass>(ComponentNames.Mass).mass;
      const forces = entity.getComponent<Forces>(ComponentNames.Forces).forces;
      const velocity = entity.getComponent<Velocity>(ComponentNames.Velocity);
      const inertia = entity.getComponent<Moment>(
        ComponentNames.Moment
      ).inertia;

      // F_g = mg, applied only until terminal velocity is reached
      if (entity.hasComponent(ComponentNames.Gravity)) {
        const gravity = entity.getComponent<Gravity>(ComponentNames.Gravity);
        if (velocity.dCartesian.dy <= gravity.terminalVelocity) {
          forces.push({
            fCartesian: {
              fy: mass * PhysicsConstants.GRAVITY,
            },
          });
        }
      }

      // ma = Σ(F), Iα = Σ(T)
      const sumOfForces = forces.reduce(
        (accum: Force2D, { fCartesian, torque }: Force2D) => ({
          fCartesian: {
            fx: accum.fCartesian.fx + (fCartesian?.fx ?? 0),
            fy: accum.fCartesian.fy + (fCartesian?.fy ?? 0),
          },
          torque: accum.torque + (torque ?? 0),
        }),
        { fCartesian: { fx: 0, fy: 0 }, torque: 0 }
      );

      // integrate accelerations
      const [ddy, ddx] = [
        sumOfForces.fCartesian.fy,
        sumOfForces.fCartesian.fx,
      ].map((x) => x / mass);
      velocity.dCartesian.dx += ddx * dt;
      velocity.dCartesian.dy += ddy * dt;
      velocity.dTheta += (sumOfForces.torque * dt) / inertia;
      // clear the forces
      entity.getComponent<Forces>(ComponentNames.Forces).forces = [];

      // maybe we fell off the floor
      if (ddy > 0 && entity.hasComponent(ComponentNames.Jump)) {
        entity.getComponent<Jump>(ComponentNames.Jump).canJump = false;
      }
    });

    game.componentEntities.get(ComponentNames.Velocity)?.forEach((entityId) => {
      const entity = game.entities.get(entityId);
      const velocity = entity.getComponent<Velocity>(ComponentNames.Velocity);
      const boundingBox = entity.getComponent<BoundingBox>(
        ComponentNames.BoundingBox
      );

      // integrate velocity
      boundingBox.center.x += velocity.dCartesian.dx * dt;
      boundingBox.center.y += velocity.dCartesian.dy * dt;
      boundingBox.rotation += velocity.dTheta * dt;
      boundingBox.rotation =
        (boundingBox.rotation < 0
          ? 360 + boundingBox.rotation
          : boundingBox.rotation) % 360;
    });
  }
}