import {
  EntityUpdateBody,
  MessageProcessor,
  MessageType
} from '@engine/network';
import { ServerMessage, SessionManager } from '.';
import { Game } from '@engine/Game';

export class ServerMessageProcessor implements MessageProcessor {
  private game: Game;
  private sessionManager: SessionManager;

  constructor(game: Game, sessionManager: SessionManager) {
    this.game = game;
    this.sessionManager = sessionManager;
  }

  public process(message: ServerMessage) {
    switch (message.type) {
      case MessageType.NEW_INPUT: {
        const { sessionId } = message.sessionData;
        const session = this.sessionManager.getSession(sessionId);
        session?.inputSystem.keyPressed(message.body as string);
        break;
      }
      case MessageType.REMOVE_INPUT: {
        const { sessionId } = message.sessionData;
        const session = this.sessionManager.getSession(sessionId);
        session?.inputSystem.keyReleased(message.body as string);
        break;
      }
      case MessageType.UPDATE_ENTITIES: {
        const entityUpdates = message.body as unknown as EntityUpdateBody[];
        entityUpdates.forEach(({ id, args }) =>
          this.game.getEntity(id)?.setFrom(args)
        );
        break;
      }
      default: {
        break;
      }
    }
  }
}
