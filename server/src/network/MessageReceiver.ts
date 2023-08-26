import { MessageQueueProvider } from '@engine/network';
import type { ServerMessage } from '.';

export class ServerSocketMessageReceiver implements MessageQueueProvider {
  private messages: ServerMessage[];

  constructor() {
    this.messages = [];
  }

  public addMessage(message: ServerMessage) {
    this.messages.push(message);
  }

  public getNewMessages() {
    return this.messages;
  }

  public clearMessages() {
    this.messages = [];
  }
}
