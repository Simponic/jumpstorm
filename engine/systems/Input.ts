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
import { MessagePublisher, MessageType } from '../network';
import { Entity } from '../entities';

export class Input extends System {
  public clientId: string;

  private keys: Set<string>;
  private actionTimeStamps: Map<Action, number>;
  private messagePublisher?: MessagePublisher;

  constructor(clientId: string, messagePublisher?: MessagePublisher) {
    super(SystemNames.Input);

    this.clientId = clientId;
    this.keys = new Set();
    this.actionTimeStamps = new Map();

    this.messagePublisher = messagePublisher;
  }

  public keyPressed(key: string) {
    this.keys.add(key);

    if (this.messagePublisher) {
      this.messagePublisher.addMessage({
        type: MessageType.NEW_INPUT,
        body: key
      });
    }
  }

  public keyReleased(key: string) {
    this.keys.delete(key);

    if (this.messagePublisher) {
      this.messagePublisher.addMessage({
        type: MessageType.REMOVE_INPUT,
        body: key
      });
    }
  }

  public update(_dt: number, game: Game) {
    game.forEachEntityWithComponent(ComponentNames.Control, (entity) =>
      this.handleInput(entity)
    );
  }

  public handleInput(entity: Entity) {
    const controlComponent = entity.getComponent<Control>(
      ComponentNames.Control
    );
    controlComponent.isControllable =
      controlComponent.controllableBy === this.clientId;

    if (!controlComponent.isControllable) return;

    if (this.hasSomeKey(KeyConstants.ActionKeys.get(Action.MOVE_RIGHT))) {
      controlComponent.controlVelocityComponent.velocity.dCartesian.dx +=
        PhysicsConstants.PLAYER_MOVE_VEL;
    }

    if (this.hasSomeKey(KeyConstants.ActionKeys.get(Action.MOVE_LEFT))) {
      controlComponent.controlVelocityComponent.velocity.dCartesian.dx +=
        -PhysicsConstants.PLAYER_MOVE_VEL;
    }

    if (
      entity.hasComponent(ComponentNames.Jump) &&
      this.hasSomeKey(KeyConstants.ActionKeys.get(Action.JUMP))
    ) {
      this.performJump(entity);
    }
  }

  private performJump(entity: Entity) {
    const velocity = entity.getComponent<Velocity>(
      ComponentNames.Velocity
    ).velocity;
    const jump = entity.getComponent<Jump>(ComponentNames.Jump);

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

      const jumpForce = {
        fCartesian: {
          fy: mass * PhysicsConstants.PLAYER_JUMP_ACC,
          fx: 0
        },
        torque: 0
      };
      entity
        .getComponent<Forces>(ComponentNames.Forces)
        ?.forces.push(jumpForce);
    }
  }

  private hasSomeKey(keys?: string[]): boolean {
    if (keys) {
      return keys.some((key) => this.keys.has(key));
    }
    return false;
  }
}
