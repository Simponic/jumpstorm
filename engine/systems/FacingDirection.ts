import {
  ComponentNames,
  Velocity,
  FacingDirection as FacingDirectionComponent,
  Control
} from '../components';
import { Game } from '../Game';
import { System, SystemNames } from './';

export class FacingDirection extends System {
  constructor() {
    super(SystemNames.FacingDirection);
  }

  public update(_dt: number, game: Game) {
    game.forEachEntityWithComponent(
      ComponentNames.FacingDirection,
      (entity) => {
        if (!entity.hasComponent(ComponentNames.Velocity)) {
          return;
        }

        const totalVelocityComponent = new Velocity();
        const control = entity.getComponent<Control>(ComponentNames.Control);
        const velocity = entity.getComponent<Velocity>(
          ComponentNames.Velocity
        ).velocity;

        totalVelocityComponent.add(velocity);
        if (control) {
          totalVelocityComponent.add(control.controlVelocityComponent.velocity);
        }

        const facingDirection = entity.getComponent<FacingDirectionComponent>(
          ComponentNames.FacingDirection
        );

        if (totalVelocityComponent.velocity.dCartesian.dx > 0) {
          entity.addComponent(facingDirection.facingRightSprite);
        } else if (totalVelocityComponent.velocity.dCartesian.dx < 0) {
          entity.addComponent(facingDirection.facingLeftSprite);
        }
      }
    );
  }
}
