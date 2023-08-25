export enum MessageType {
  NEW_ENTITIES = 'NEW_ENTITIES',
  REMOVE_ENTITIES = 'REMOVE_ENTITIES',
  UPDATE_ENTITY = 'UPDATE_ENTITY'
}

export type EntityAddBody = {
  entityName: string;
  args: any;
};

export type Message = {
  type: MessageType;
  body: any;
};

export interface MessageQueueProvider {
  getNewMessages(): Message[];
  clearMessages(): void;
}

export interface MessagePublisher {
  addMessage(message: Message): void;
  publish(): void;
}

export interface MessageProcessor {
  process(message: Message): void;
}
