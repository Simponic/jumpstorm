import { IMAGES, SPRITE_SPECS, Sprites, type SpriteSpec } from "../config";
import { BoundingBox, Sprite } from "../components";
import { TopCollidable } from "../components/TopCollidable";
import { Entity } from "../entities";

export class Floor extends Entity {
  private static spriteSpec: SpriteSpec = SPRITE_SPECS.get(Sprites.FLOOR);

  constructor(width: number) {
    super();

    this.addComponent(
      new Sprite(
        IMAGES.get(Floor.spriteSpec.states[width].sheet),
        { x: 0, y: 0 },
        { width, height: Floor.spriteSpec.height },
        Floor.spriteSpec.msPerFrame,
        Floor.spriteSpec.frames
      )
    );

    this.addComponent(
      new BoundingBox(
        { x: 300, y: 300 },
        { width, height: Floor.spriteSpec.height }
      )
    );

    this.addComponent(new TopCollidable());
  }
}
