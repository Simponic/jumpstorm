import { System, SystemNames } from '.';
import { BoundingBox, ComponentNames } from '../components';
import { Game } from '../Game';
import { clamp } from '../utils';
import { Miscellaneous } from '../config';

export class WallBounds extends System {
  constructor() {
    super(SystemNames.WallBounds);
  }

  public update(_dt: number, game: Game) {
    game.forEachEntityWithComponent(ComponentNames.WallBounded, (entity) => {
      const boundingBox = entity.getComponent<BoundingBox>(
        ComponentNames.BoundingBox
      );

      boundingBox.center.x = clamp(
        boundingBox.center.x,
        boundingBox.dimension.width / 2,
        Miscellaneous.WIDTH - boundingBox.dimension.width / 2
      );
    });
  }
}
