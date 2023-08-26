import { Game } from '@engine/Game';
import { Entity } from '@engine/entities';
import { Grid } from '@engine/structures';
import {
  WallBounds,
  FacingDirection,
  Render,
  Physics,
  Input,
  Collision,
  NetworkUpdate
} from '@engine/systems';
import {
  type MessageQueueProvider,
  type MessagePublisher,
  type MessageProcessor,
  type Message,
  type EntityAddBody,
  MessageType,
  type EntityUpdateBody
} from '@engine/network';
import { stringify, parse } from '@engine/utils';

class ClientMessageProcessor implements MessageProcessor {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  public process(message: Message) {
    switch (message.type) {
      case MessageType.NEW_ENTITIES:
        const entityAdditions = message.body as unknown as EntityAddBody[];
        entityAdditions.forEach((addBody) =>
          this.game.addEntity(
            Entity.from(addBody.entityName, addBody.id, addBody.args)
          )
        );
        break;
      case MessageType.REMOVE_ENTITIES:
        const ids = message.body as unknown as string[];
        ids.forEach((id) => this.game.removeEntity(id));
        break;
      case MessageType.UPDATE_ENTITIES:
        const entityUpdates = message.body as unknown as EntityUpdateBody[];
        entityUpdates.forEach(
          ({ id, args }) => this.game.getEntity(id)?.setFrom(args)
        );
        break;
      default:
        break;
    }
  }
}

class ClientSocketMessageQueueProvider implements MessageQueueProvider {
  private socket: WebSocket;
  private messages: Message[];

  constructor(socket: WebSocket) {
    this.socket = socket;
    this.messages = [];

    this.socket.addEventListener('message', (e) => {
      const messages = parse<Message[]>(e.data);
      this.messages = this.messages.concat(messages);
    });
  }

  public getNewMessages() {
    return this.messages;
  }

  public clearMessages() {
    this.messages = [];
  }
}

class ClientSocketMessagePublisher implements MessagePublisher {
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
        this.socket.send(stringify(message))
      );
      this.messages = [];
    }
  }
}

export class JumpStorm {
  private game: Game;
  private clientId: string;

  constructor(game: Game) {
    this.game = game;
  }

  public async init(
    ctx: CanvasRenderingContext2D,
    httpMethod: string,
    wsMethod: string,
    host: string
  ) {
    this.clientId = await this.getAssignedCookie(
      `${httpMethod}://${host}/assign`
    );
    const socket = new WebSocket(`${wsMethod}://${host}/game`);
    const clientSocketMessageQueueProvider =
      new ClientSocketMessageQueueProvider(socket);
    const clientSocketMessagePublisher = new ClientSocketMessagePublisher(
      socket
    );
    const clientMessageProcessor = new ClientMessageProcessor(this.game);

    const inputSystem = new Input(this.clientId, clientSocketMessagePublisher);
    this.addWindowEventListenersToInputSystem(inputSystem);

    const grid = new Grid();

    [
      new NetworkUpdate(
        clientSocketMessageQueueProvider,
        clientSocketMessagePublisher,
        clientMessageProcessor
      ),
      inputSystem,
      new FacingDirection(),
      new Physics(),
      new Collision(grid),
      new WallBounds(),
      new Render(ctx)
    ].forEach((system) => this.game.addSystem(system));
  }

  public play() {
    this.game.start();

    const loop = (timestamp: number) => {
      this.game.doGameLoop(timestamp);
      requestAnimationFrame(loop); // tail call recursion! /s
    };
    requestAnimationFrame(loop);
  }

  private addWindowEventListenersToInputSystem(input: Input) {
    window.addEventListener('keydown', (e) => {
      if (!e.repeat) {
        input.keyPressed(e.key.toLowerCase());
      }
    });

    window.addEventListener('keyup', (e) =>
      input.keyReleased(e.key.toLowerCase())
    );
  }

  private async getAssignedCookie(endpoint: string): Promise<string> {
    return fetch(endpoint)
      .then((resp) => {
        if (resp.ok) {
          return resp.text();
        }
        throw resp;
      })
      .then((cookie) => cookie);
  }
}
