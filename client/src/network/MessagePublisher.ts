import type { Message, MessagePublisher } from '@engine/network';
import { serialize } from '@engine/utils';

export class ClientSocketMessagePublisher implements MessagePublisher {
  private socket: WebSocket;
  private messages: Message[];

  constructor(socket: WebSocket) {
    this.socket = socket;
    this.messages = [];
  }

  public addMessage(message: Message) {
    this.messages.push(message);
  }

  public publish() {
    if (this.socket.readyState == WebSocket.OPEN) {
      this.messages.forEach((message: Message) =>
        this.socket.send(serialize(message))
      );
      this.messages = [];
    }
  }
}
