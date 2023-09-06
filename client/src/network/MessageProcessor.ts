import type { Game } from '@engine/Game';
import { ComponentNames, Control, NetworkUpdateable } from '@engine/components';
import { Entity } from '@engine/entities';
import {
  MessageType,
  type Message,
  type EntityAddBody,
  type EntityUpdateBody,
  type MessageProcessor
} from '@engine/network';
import { Input, SystemNames } from '@engine/systems';

export class ClientMessageProcessor implements MessageProcessor {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  public process(message: Message) {
    switch (message.type) {
      case MessageType.NEW_ENTITIES:
        const entityAdditions = message.body as unknown as EntityAddBody[];
        entityAdditions.forEach((addBody) => {
          const entity = Entity.from(
            addBody.entityName,
            addBody.id,
            addBody.args
          );
          if (entity.hasComponent(ComponentNames.Control)) {
            const clientId = this.game.getSystem<Input>(
              SystemNames.Input
            ).clientId;
            const control = entity.getComponent<Control>(
              ComponentNames.Control
            );

            if (control.controllableBy === clientId) {
              entity.addComponent(new NetworkUpdateable());
            }
          }

          this.game.addEntity(entity);
        });
        break;
      case MessageType.REMOVE_ENTITIES:
        const ids = message.body as unknown as string[];
        ids.forEach((id) => this.game.removeEntity(id));
        break;
      case MessageType.UPDATE_ENTITIES:
        const entityUpdates = message.body as unknown as EntityUpdateBody[];
        entityUpdates.forEach(({ id, args }) => {
          const entity = this.game.getEntity(id);
          if (!entity) return;

          if (entity && entity.hasComponent(ComponentNames.Control)) {
            const clientId = this.game.getSystem<Input>(
              SystemNames.Input
            ).clientId;
            const control = entity.getComponent<Control>(
              ComponentNames.Control
            );

            // don't listen to entities which we control
            if (control.controllableBy === clientId) return;
          }
          entity.setFrom(args);
        });
        break;
      default:
        break;
    }
  }
}
