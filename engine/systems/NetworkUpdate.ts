import { System, SystemNames } from '.';
import { Game } from '../Game';
import { ComponentNames } from '../components';
import {
  type MessageQueueProvider,
  type MessagePublisher,
  type MessageProcessor,
  MessageType,
  EntityUpdateBody
} from '../network';

export class NetworkUpdate extends System {
  private queueProvider: MessageQueueProvider;
  private publisher: MessagePublisher;
  private messageProcessor: MessageProcessor;

  private entityUpdateTimers: Map<string, number>;

  constructor(
    queueProvider: MessageQueueProvider,
    publisher: MessagePublisher,
    messageProcessor: MessageProcessor
  ) {
    super(SystemNames.NetworkUpdate);

    this.queueProvider = queueProvider;
    this.publisher = publisher;
    this.messageProcessor = messageProcessor;

    this.entityUpdateTimers = new Map();
  }

  public update(dt: number, game: Game) {
    // 1. process new messages
    this.queueProvider
      .getNewMessages()
      .forEach((message) => this.messageProcessor.process(message));
    this.queueProvider.clearMessages();

    // 2. send entity updates
    const updateMessages: EntityUpdateBody[] = [];
    game.forEachEntityWithComponent(
      ComponentNames.NetworkUpdateable,
      (entity) => {
        let timer = this.entityUpdateTimers.get(entity.id) ?? dt;
        timer -= dt;
        this.entityUpdateTimers.set(entity.id, timer);

        if (timer > 0) return;
        this.entityUpdateTimers.set(entity.id, this.getNextUpdateTimeMs());

        if (entity.hasComponent(ComponentNames.NetworkUpdateable)) {
          updateMessages.push({
            id: entity.id,
            args: entity.serialize()
          });
        }
      }
    );
    this.publisher.addMessage({
      type: MessageType.UPDATE_ENTITIES,
      body: updateMessages
    });

    // 3. publish changes
    this.publisher.publish();
  }

  private getNextUpdateTimeMs() {
    return Math.random() * 70 + 50;
  }
}
