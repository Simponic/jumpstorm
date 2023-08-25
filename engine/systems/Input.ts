import {
  Jump,
  Forces,
  ComponentNames,
  Velocity,
  Mass,
  Control
} from '../components';
import { Game } from '../Game';
import { KeyConstants, PhysicsConstants } from '../config';
import { Action } from '../interfaces';
import { System, SystemNames } from '.';

export class Input extends System {
  public clientId: string;
  private keys: Set<string>;
  private actionTimeStamps: Map<Action, number>;

  constructor(clientId: string) {
    super(SystemNames.Input);

    this.clientId = clientId;
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
      const controlComponent = entity.getComponent<Control>(
        ComponentNames.Control
      );
      if (controlComponent.controllableBy != this.clientId) return;

      if (this.hasSomeKey(KeyConstants.ActionKeys.get(Action.MOVE_RIGHT))) {
        controlComponent.controlVelocityComponent.velocity.dCartesian.dx +=
          PhysicsConstants.PLAYER_MOVE_VEL;
      }

      if (this.hasSomeKey(KeyConstants.ActionKeys.get(Action.MOVE_LEFT))) {
        controlComponent.controlVelocityComponent.velocity.dCartesian.dx +=
          -PhysicsConstants.PLAYER_MOVE_VEL;
      }

      if (entity.hasComponent(ComponentNames.Jump)) {
        const velocity = entity.getComponent<Velocity>(
          ComponentNames.Velocity
        ).velocity;
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
                fx: 0
              },
              torque: 0
            });
          }
        }
      }
    });
  }
}
