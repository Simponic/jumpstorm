import { System, SystemNames } from ".";
import { BoundingBox, ComponentNames } from "../components";
import { Game } from "../Game";
import type { Entity } from "../entities";
import { clamp } from "../utils";

export class WallBounds extends System {
  private screenWidth: number;

  constructor(screenWidth: number) {
    super(SystemNames.WallBounds);

    this.screenWidth = screenWidth;
  }

  public update(_dt: number, game: Game) {
    game.forEachEntityWithComponent(ComponentNames.WallBounded, (entity) => {
      const boundingBox = entity.getComponent<BoundingBox>(
        ComponentNames.BoundingBox,
      );

      boundingBox.center.x = clamp(
        boundingBox.center.x,
        boundingBox.dimension.width / 2,
        this.screenWidth - boundingBox.dimension.width / 2,
      );
    });
  }
}
