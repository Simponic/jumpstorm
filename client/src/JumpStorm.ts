import { Game } from '@engine/Game';
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
  ClientMessageProcessor,
  ClientSocketMessagePublisher,
  ClientSocketMessageQueueProvider
} from './network';

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

    [
      new Physics(),
      new NetworkUpdate(
        clientSocketMessageQueueProvider,
        clientSocketMessagePublisher,
        clientMessageProcessor
      ),
      inputSystem,
      new FacingDirection(),
      new Collision(new Grid()),
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
