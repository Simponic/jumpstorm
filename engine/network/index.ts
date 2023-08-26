export enum MessageType {
  NEW_ENTITIES = 'NEW_ENTITIES',
  REMOVE_ENTITIES = 'REMOVE_ENTITIES',
  UPDATE_ENTITIES = 'UPDATE_ENTITIES',
  NEW_INPUT = 'NEW_INPUT',
  REMOVE_INPUT = 'REMOVE_INPUT'
}

export type EntityAddBody = {
  entityName: string;
  id: string;
  args: Record<string, any>;
};

export type EntityUpdateBody = {
  id: string;
  args: Record<string, any>;
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
