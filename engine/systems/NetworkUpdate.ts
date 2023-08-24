import { System, SystemNames } from ".";
import { Game } from "../Game";
import { ComponentNames, NetworkUpdateable } from "../components";
import {
  type MessageQueueProvider,
  type MessagePublisher,
  type MessageProcessor,
} from "../network";

export class NetworkUpdate extends System {
  private queueProvider: MessageQueueProvider;
  private publisher: MessagePublisher;
  private messageProcessor: MessageProcessor;

  constructor(
    queueProvider: MessageQueueProvider,
    publisher: MessagePublisher,
    messageProcessor: MessageProcessor,
  ) {
    super(SystemNames.NetworkUpdate);

    this.queueProvider = queueProvider;
    this.publisher = publisher;
    this.messageProcessor = messageProcessor;
  }

  public update(_dt: number, game: Game) {
    this.queueProvider
      .getNewMessages()
      .forEach((message) => this.messageProcessor.process(message));
    this.queueProvider.clearMessages();

    game.forEachEntityWithComponent(
      ComponentNames.NetworkUpdateable,
      (entity) => {
        const networkUpdateComponent = entity.getComponent<NetworkUpdateable>(
          ComponentNames.NetworkUpdateable,
        );
      },
    );

    this.publisher.publish();
  }
}
