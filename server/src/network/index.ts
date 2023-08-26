import { Message } from '@engine/network';
import { Input } from '@engine/systems';

export * from './MessageProcessor';
export * from './MessagePublisher';
export * from './MessageReceiver';
export * from './SessionManager';
export * from './SessionInputSystem';

export type SessionData = { sessionId: string };

export type Session = {
  sessionId: string;
  controllableEntities: Set<string>;
  inputSystem: Input;
};

export interface ServerMessage extends Message {
  sessionData: SessionData;
}

export interface SessionManager {
  uniqueSessionId(): string;
  getSession(id: string): Session | undefined;
  getSessions(): string[];
  putSession(id: string, session: Session): void;
  removeSession(id: string): void;
  numSessions(): number;
}
