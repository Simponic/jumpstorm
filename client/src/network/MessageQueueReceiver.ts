import type { Message, MessageQueueProvider } from '@engine/network';
import { parse } from '@engine/utils';

export class ClientSocketMessageQueueProvider implements MessageQueueProvider {
  private socket: WebSocket;
  private messages: Message[];

  constructor(socket: WebSocket) {
    this.socket = socket;
    this.messages = [];

    this.socket.addEventListener('message', (e) => {
      e.data.arrayBuffer().then((buffer) => {
        const messages = parse<Message[]>(new Uint8Array(buffer));
        this.messages = this.messages.concat(messages);
      });
    });
  }

  public getNewMessages() {
    return this.messages;
  }

  public clearMessages() {
    this.messages = [];
  }
}
