import { System, SystemNames } from ".";
import { BoundingBox, ComponentNames, Sprite } from "../components";
import type { Entity } from "../entities";
import type { DrawArgs } from "../interfaces";

export class Render extends System {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    super(SystemNames.Render);
    this.ctx = ctx;
  }

  public update(
    dt: number,
    entityMap: Map<number, Entity>,
    componentEntities: Map<string, Set<number>>
  ) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    componentEntities.get(ComponentNames.Sprite)?.forEach((entityId) => {
      const entity = entityMap.get(entityId);
      const sprite = entity.getComponent<Sprite>(ComponentNames.Sprite);
      sprite.update(dt);

      let drawArgs: DrawArgs;
      if (entity.hasComponent(ComponentNames.BoundingBox)) {
        const boundingBox = entity.getComponent<BoundingBox>(
          ComponentNames.BoundingBox
        );

        drawArgs = {
          center: boundingBox.center,
          dimension: boundingBox.dimension,
          rotation: boundingBox.rotation,
        };
      }
      sprite.draw(this.ctx, drawArgs);
    });
  }
}
