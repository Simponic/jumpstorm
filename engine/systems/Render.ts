import { System, SystemNames } from '.';
import { BoundingBox, ComponentNames, Sprite } from '../components';
import { Game } from '../Game';
import { clamp } from '../utils';

export class Render extends System {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    super(SystemNames.Render);
    this.ctx = ctx;
  }

  public update(dt: number, game: Game) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    game.forEachEntityWithComponent(ComponentNames.Sprite, (entity) => {
      const sprite = entity.getComponent<Sprite>(ComponentNames.Sprite);
      sprite.update(dt);

      const boundingBox = entity.getComponent<BoundingBox>(
        ComponentNames.BoundingBox
      );

      // don't render if we're outside the screen
      if (
        clamp(
          boundingBox.center.y,
          -boundingBox.dimension.height / 2,
          this.ctx.canvas.height + boundingBox.dimension.height / 2
        ) != boundingBox.center.y ||
        clamp(
          boundingBox.center.x,
          -boundingBox.dimension.width / 2,
          this.ctx.canvas.width + boundingBox.dimension.width / 2
        ) != boundingBox.center.x
      ) {
        return;
      }

      const drawArgs = {
        center: boundingBox.center,
        dimension: boundingBox.dimension,
        rotation: boundingBox.rotation
      };

      sprite.draw(this.ctx, drawArgs);
    });
  }
}
