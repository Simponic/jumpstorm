import { Floor, Player } from "./entities";
import { Game } from "./Game";
import {
  WallBounds,
  FacingDirection,
  Render,
  Physics,
  Input,
  Collision,
} from "./systems";

export class JumpStorm {
  private game: Game;

  constructor(ctx: CanvasRenderingContext2D) {
    this.game = new Game();

    [
      this.createInputSystem(),
      new FacingDirection(),
      new Physics(),
      new Collision(),
      new WallBounds(ctx.canvas.width),
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
