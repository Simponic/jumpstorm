import {
  ComponentNames,
  Velocity,
  FacingDirection as FacingDirectionComponent,
} from "../components";
import { Game } from "../Game";
import type { Entity } from "../entities";
import { System, SystemNames } from "./";

export class FacingDirection extends System {
  constructor() {
    super(SystemNames.FacingDirection);
  }

  public update(_dt: number, game: Game) {
    game.componentEntities
      .get(ComponentNames.FacingDirection)
      ?.forEach((entityId) => {
        const entity = game.entities.get(entityId);
        if (!entity.hasComponent(ComponentNames.Velocity)) {
          return;
        }

        const velocity = entity.getComponent<Velocity>(ComponentNames.Velocity);
        const facingDirection = entity.getComponent<FacingDirectionComponent>(
          ComponentNames.FacingDirection
        );

        if (velocity.dCartesian.dx > 0) {
          entity.addComponent(facingDirection.facingRightSprite);
        } else if (velocity.dCartesian.dx < 0) {
          entity.addComponent(facingDirection.facingLeftSprite);
        }
      });
  }
}