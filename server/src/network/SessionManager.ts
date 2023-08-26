import { Session, SessionManager } from '.';

export class MemorySessionManager implements SessionManager {
  private sessions: Map<string, Session>;

  constructor() {
    this.sessions = new Map();
  }

  public getSessions() {
    return Array.from(this.sessions.keys());
  }

  public uniqueSessionId() {
    return crypto.randomUUID();
  }

  public getSession(id: string) {
    return this.sessions.get(id);
  }

  public putSession(id: string, session: Session) {
    return this.sessions.set(id, session);
  }

  public numSessions() {
    return this.sessions.size;
  }

  public removeSession(id: string) {
    this.sessions.delete(id);
  }
}
