import { System, SystemNames } from '.';
import { Game } from '../Game';
import { ComponentNames, NetworkUpdateable } from '../components';
import {
  type MessageQueueProvider,
  type MessagePublisher,
  type MessageProcessor,
  MessageType,
  EntityUpdateBody
} from '../network';
import { stringify } from '../utils';

type EntityUpdateInfo = { timer: number; hash: string };

export class NetworkUpdate extends System {
  private queueProvider: MessageQueueProvider;
  private publisher: MessagePublisher;
  private messageProcessor: MessageProcessor;
  private entityUpdateInfo: Map<string, EntityUpdateInfo>;

  private nextPublishInterval: number;

  constructor(
    queueProvider: MessageQueueProvider,
    publisher: MessagePublisher,
    messageProcessor: MessageProcessor
  ) {
    super(SystemNames.NetworkUpdate);

    this.queueProvider = queueProvider;
    this.publisher = publisher;
    this.messageProcessor = messageProcessor;

    this.entityUpdateInfo = new Map();
    this.nextPublishInterval = 0;
  }

  public update(dt: number, game: Game) {
    // 0. remove unnecessary info for removed entities
    const networkUpdateableEntities = game.componentEntities.get(
      ComponentNames.NetworkUpdateable
    );
    for (const entityId of this.entityUpdateInfo.keys()) {
      if (!networkUpdateableEntities?.has(entityId)) {
        this.entityUpdateInfo.delete(entityId);
      }
    }

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
        const networkUpdateableComponent =
          entity.getComponent<NetworkUpdateable>(
            ComponentNames.NetworkUpdateable
          );
        const nextUpdateTime = networkUpdateableComponent.getNextUpdateTime();

        const newHash = stringify(entity.serialize());
        let updateInfo: EntityUpdateInfo = this.entityUpdateInfo.get(
          entity.id
        ) ?? {
          timer: nextUpdateTime,
          hash: newHash
        };

        // update timer
        updateInfo.timer -= dt;
        this.entityUpdateInfo.set(entity.id, updateInfo);
        if (updateInfo.timer > 0) return;
        updateInfo.timer = nextUpdateTime;
        this.entityUpdateInfo.set(entity.id, updateInfo);

        // maybe update, if hash is not consistent
        if (updateInfo.hash == newHash) return;
        updateInfo.hash = newHash;
        this.entityUpdateInfo.set(entity.id, updateInfo);

        updateMessages.push({
          id: entity.id,
          args: entity.serialize()
        });
      }
    );

    if (updateMessages.length)
      this.publisher.addMessage({
        type: MessageType.UPDATE_ENTITIES,
        body: updateMessages
      });

    // 3. maybe publish changes - we don't want to overload the socket
    this.nextPublishInterval -= dt;
    if (this.nextPublishInterval < 0) {
      this.publisher.publish();
      this.nextPublishInterval = this.getNextUpdateInterval();
    }
  }

  private getNextUpdateInterval() {
    return Math.random() * 30 + 20;
  }
}
