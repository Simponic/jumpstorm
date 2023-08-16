import { System, SystemNames } from ".";
import { Game } from "../Game";
import { ComponentNames, NetworkUpdateable } from "../components";

export interface MessageQueueProvider {
  getNewMessages(): any[];
  clearMessages(): void;
}

export interface MessagePublisher {
  addMessage(message: any): void;
  publish(): void;
}

export class NetworkUpdate extends System {
  private queueProvider: MessageQueueProvider;
  private publisher: MessagePublisher;

  constructor(
    queueProvider: MessageQueueProvider,
    publisher: MessagePublisher,
  ) {
    super(SystemNames.NetworkUpdate);

    this.queueProvider = queueProvider;
    this.publisher = publisher;
  }

  public update(_dt: number, game: Game) {
    const messages = this.queueProvider.getNewMessages();
    this.queueProvider.clearMessages();

    game.forEachEntityWithComponent(
      ComponentNames.NetworkUpdateable,
      (entity) => {
        const networkUpdateComponent = entity.getComponent<NetworkUpdateable>(
          ComponentNames.NetworkUpdateable,
        );
      },
    );
  }
}
