import { Game } from "@engine/Game";
import { Entity } from "@engine/entities";
import { Grid } from "@engine/structures";
import {
  WallBounds,
  FacingDirection,
  Render,
  Physics,
  Input,
  Collision,
  NetworkUpdate,
} from "@engine/systems";
import {
  type MessageQueueProvider,
  type MessagePublisher,
  type MessageProcessor,
  type Message,
  type EntityAddBody,
  MessageType,
} from "@engine/network";
import { stringify, parse } from "@engine/utils";

class ClientMessageProcessor implements MessageProcessor {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  public process(message: Message) {
    switch (message.type) {
      case MessageType.NEW_ENTITY:
        const entityAddBody = message.body as unknown as EntityAddBody;
        this.game.addEntity(
          Entity.from(entityAddBody.entityName, entityAddBody.args),
        );
        break;
    }

    console.log(message);
  }
}

class ClientSocketMessageQueueProvider implements MessageQueueProvider {
  private socket: WebSocket;
  private messages: Message[];

  constructor(socket: WebSocket) {
    this.socket = socket;
    this.messages = [];

    this.socket.addEventListener("message", (e) => {
      const message = parse<Message>(e.data);
      this.messages.push(message);
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
    this.messages.forEach((message: Message) =>
      this.socket.send(stringify(message)),
    );
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
    host: string,
  ) {
    await fetch(`${httpMethod}://${host}/assign`)
      .then((resp) => {
        if (resp.ok) {
          return resp.text();
        }
        throw resp;
      })
      .then((cookie) => {
        this.clientId = cookie;
      });

    const grid = new Grid();

    const socket = new WebSocket(`${wsMethod}://${host}/game`);
    const clientSocketMessageQueueProvider =
      new ClientSocketMessageQueueProvider(socket);
    const clientSocketMessagePublisher = new ClientSocketMessagePublisher(
      socket,
    );
    const clientMessageProcessor = new ClientMessageProcessor(this.game);
    [
      this.createInputSystem(),
      new FacingDirection(),
      new Physics(),
      new Collision(grid),
      new WallBounds(ctx.canvas.width),
      new NetworkUpdate(
        clientSocketMessageQueueProvider,
        clientSocketMessagePublisher,
        clientMessageProcessor,
      ),
      new Render(ctx),
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

  private createInputSystem(): Input {
    const inputSystem = new Input(this.clientId);

    window.addEventListener("keydown", (e) => {
      if (!e.repeat) {
        inputSystem.keyPressed(e.key);
      }
    });

    window.addEventListener("keyup", (e) => inputSystem.keyReleased(e.key));

    return inputSystem;
  }
}
