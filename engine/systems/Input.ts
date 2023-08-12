import {
  Jump,
  Forces,
  ComponentNames,
  Velocity,
  Mass,
  Control,
} from "../components";
import { Game } from "../Game";
import { KeyConstants, PhysicsConstants } from "../config";
import { Action } from "../interfaces";
import { System, SystemNames } from "./";

export class Input extends System {
  private keys: Set<string>;
  private actionTimeStamps: Map<Action, number>;

  constructor() {
    super(SystemNames.Input);

    this.keys = new Set<string>();
    this.actionTimeStamps = new Map<Action, number>();
  }

  public keyPressed(key: string) {
    this.keys.add(key);
  }

  public keyReleased(key: string) {
    this.keys.delete(key);
  }

  private hasSomeKey(keys?: string[]): boolean {
    if (keys) {
      return keys.some((key) => this.keys.has(key));
    }
    return false;
  }

  public update(_dt: number, game: Game) {
    game.forEachEntityWithComponent(ComponentNames.Control, (entity) => {
      const control = entity.getComponent<Control>(ComponentNames.Control);

      if (this.hasSomeKey(KeyConstants.ActionKeys.get(Action.MOVE_RIGHT))) {
        control.controlVelocity.dCartesian.dx +=
          PhysicsConstants.PLAYER_MOVE_VEL;
      }

      if (this.hasSomeKey(KeyConstants.ActionKeys.get(Action.MOVE_LEFT))) {
        control.controlVelocity.dCartesian.dx +=
          -PhysicsConstants.PLAYER_MOVE_VEL;
      }

      if (entity.hasComponent(ComponentNames.Jump)) {
        const velocity = entity.getComponent<Velocity>(ComponentNames.Velocity);
        const jump = entity.getComponent<Jump>(ComponentNames.Jump);

        if (this.hasSomeKey(KeyConstants.ActionKeys.get(Action.JUMP))) {
          if (jump.canJump) {
            this.actionTimeStamps.set(Action.JUMP, performance.now());

            velocity.dCartesian.dy += PhysicsConstants.PLAYER_JUMP_INITIAL_VEL;
            jump.canJump = false;
          }

          if (
            performance.now() - (this.actionTimeStamps.get(Action.JUMP) || 0) <
            PhysicsConstants.MAX_JUMP_TIME_MS
          ) {
            const mass = entity.getComponent<Mass>(ComponentNames.Mass).mass;
            entity.getComponent<Forces>(ComponentNames.Forces)?.forces.push({
              fCartesian: {
                fy: mass * PhysicsConstants.PLAYER_JUMP_ACC,
                fx: 0,
              },
              torque: 0,
            });
          }
        }
      }
    });
  }
}
