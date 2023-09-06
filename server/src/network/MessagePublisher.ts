import { Message, MessagePublisher } from '@engine/network';
import { Server } from 'bun';
import { Constants } from '../constants';
import { serialize } from '@engine/utils';

export class ServerSocketMessagePublisher implements MessagePublisher {
  private server?: Server;
  private messages: Message[];

  constructor(server?: Server) {
    this.messages = [];

    if (server) this.setServer(server);
  }

  public setServer(server: Server) {
    this.server = server;
  }

  public addMessage(message: Message) {
    this.messages.push(message);
  }

  public publish() {
    if (this.messages.length) {
      this.server?.publish(Constants.GAME_TOPIC, serialize(this.messages));

      this.messages = [];
    }
  }
}
