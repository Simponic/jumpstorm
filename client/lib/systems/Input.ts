import {
  Jump,
  Forces,
  Acceleration,
  ComponentNames,
  Velocity,
  Mass,
} from "../components";
import { KeyConstants, PhysicsConstants } from "../config";
import type { Entity } from "../entities";
import { Action } from "../interfaces";
import { System, SystemNames } from "./";

export class Input extends System {
  private keys: Set<string>;
  private actionTimeStamps: Map<Action, number>;

  constructor() {
    super(SystemNames.Input);

    this.keys = new Set<number>();
    this.actionTimeStamps = new Map<Action, number>();
  }

  public keyPressed(key: string) {
    this.keys.add(key);
  }

  public keyReleased(key: string) {
    this.keys.delete(key);
  }

  private hasSomeKey(keys: string[]): boolean {
    return keys.some((key) => this.keys.has(key));
  }

  public update(
    dt: number,
    entityMap: Map<number, Entity>,
    componentEntities: Map<string, Set<number>>
  ) {
    componentEntities.get(ComponentNames.Control)?.forEach((entityId) => {
      const entity = entityMap.get(entityId);
      if (!entity.hasComponent(ComponentNames.Velocity)) {
        return;
      }

      const velocity = entity.getComponent<Velocity>(ComponentNames.Velocity);

      if (this.hasSomeKey(KeyConstants.ActionKeys.get(Action.MOVE_RIGHT))) {
        velocity.dCartesian.dx = PhysicsConstants.PLAYER_MOVE_VEL;
      } else if (
        this.hasSomeKey(KeyConstants.ActionKeys.get(Action.MOVE_LEFT))
      ) {
        velocity.dCartesian.dx = -PhysicsConstants.PLAYER_MOVE_VEL;
      } else {
        velocity.dCartesian.dx = 0;
      }
    });

    componentEntities.get(ComponentNames.Jump)?.forEach((entityId) => {
      const entity = entityMap.get(entityId);
      const jump = entity.getComponent<Jump>(ComponentNames.Jump);
      const velocity = entity.getComponent<Velocity>(ComponentNames.Velocity);

      if (this.hasSomeKey(KeyConstants.ActionKeys.get(Action.JUMP))) {
        if (jump.canJump) {
          this.actionTimeStamps.set(Action.JUMP, performance.now());

          velocity.dCartesian.dy = PhysicsConstants.PLAYER_JUMP_INITIAL_VEL;
          jump.canJump = false;
        }

        if (
          performance.now() - this.actionTimeStamps.get(Action.JUMP) <
          PhysicsConstants.MAX_JUMP_TIME_MS
        ) {
          const mass = entity.getComponent<Mass>(ComponentNames.Mass).mass;
          entity.getComponent<Forces>(ComponentNames.Forces)?.forces.push({
            fCartesian: { fy: mass * PhysicsConstants.PLAYER_JUMP_ACC },
          });
        }
      }
    });
  }
}
