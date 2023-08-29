import { Game } from '@engine/Game';
import { SessionManager } from '.';
import { System } from '@engine/systems';
import { ComponentNames } from '@engine/components';

export class SessionInputSystem extends System {
  private sessionManager: SessionManager;

  constructor(sessionManager: SessionManager) {
    super('SessionInputSystem');

    this.sessionManager = sessionManager;
  }

  public update(_dt: number, game: Game) {
    this.sessionManager.getSessions().forEach((sessionId) => {
      const session = this.sessionManager.getSession(sessionId);

      if (!session) return;

      const { inputSystem } = session;
      session.controllableEntities.forEach((entityId) => {
        const entity = game.getEntity(entityId);
        if (!entity) return;

        if (entity.hasComponent(ComponentNames.Control)) {
          inputSystem.handleInput(entity);
        }
      });
    });
  }
}
