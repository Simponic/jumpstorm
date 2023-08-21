import { Floor, Player } from "@engine/entities";
import { Game } from "@engine/Game";
import { Grid } from "@engine/structures";
import { Miscellaneous } from "@engine/config";
import {
  WallBounds,
  FacingDirection,
  Render,
  Physics,
  Input,
  Collision,
  MessageQueueProvider,
  MessagePublisher,
  NetworkUpdate,
} from "@engine/systems";

class ClientSocketMessageQueueProvider implements MessageQueueProvider {
  private socket: WebSocket;
  private messages: any[];

  constructor(socket: WebSocket) {
    this.socket = socket;
    this.messages = [];

    this.socket.addEventListener("message", (e) => {
      console.log(e);
    });
  }

  getNewMessages() {
    return this.messages;
  }

  clearMessages() {
    this.messages = [];
  }
}

class ClientSocketMessagePublisher implements MessagePublisher {
  private socket: WebSocket;
  private messages: any[];

  constructor(socket: WebSocket) {
    this.socket = socket;
    this.messages = [];

    this.socket.addEventListener("message", (e) => {
      console.log(e);
    });
  }

  addMessage(_message: any) {}

  publish() {}
}

export class JumpStorm {
  private game: Game;

  constructor(ctx: CanvasRenderingContext2D) {
    this.game = new Game();

    const socket = new WebSocket("ws://localhost:8080");
    const clientSocketMessageQueueProvider =
      new ClientSocketMessageQueueProvider(socket);
    const clientSocketMessagePublisher = new ClientSocketMessagePublisher(
      socket
    );

    const grid = new Grid(
      { width: Miscellaneous.WIDTH, height: Miscellaneous.HEIGHT },
      { width: 30, height: 30 }
    );

    [
      this.createInputSystem(),
      new FacingDirection(),
      new Physics(),
      new Collision(grid),
      new WallBounds(ctx.canvas.width),
      new NetworkUpdate(
        clientSocketMessageQueueProvider,
        clientSocketMessagePublisher
      ),
      new Render(ctx),
    ].forEach((system) => this.game.addSystem(system));

    [new Floor(160), new Player()].forEach((entity) =>
      this.game.addEntity(entity)
    );
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
    const inputSystem = new Input();

    window.addEventListener("keydown", (e) => {
      if (!e.repeat) {
        inputSystem.keyPressed(e.key);
      }
    });

    window.addEventListener("keyup", (e) => inputSystem.keyReleased(e.key));

    return inputSystem;
  }
}
