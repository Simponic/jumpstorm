import { MessageProcessor } from '@engine/network';
import { ServerMessage } from '.';

export class ServerMessageProcessor implements MessageProcessor {
  constructor() {}

  public process(_message: ServerMessage) {}
}
