import { Message } from '@engine/network';

export * from './MessageProcessor';
export * from './MessagePublisher';
export * from './MessageReceiver';

export type SessionData = { sessionId: string };

export type Session = {
  sessionId: string;
  controllableEntities: Set<string>;
};

export interface ServerMessage extends Message {
  sessionData: SessionData;
}
