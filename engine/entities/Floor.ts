import { IMAGES, SPRITE_SPECS, Sprites, type SpriteSpec } from '../config';
import { BoundingBox, ComponentNames, Sprite } from '../components';
import { TopCollidable } from '../components/TopCollidable';
import { Entity, EntityNames } from '../entities';

export class Floor extends Entity {
  private static spriteSpec: SpriteSpec = SPRITE_SPECS.get(
    Sprites.FLOOR
  ) as SpriteSpec;

  private width: number;

  constructor(width: number) {
    super(EntityNames.Floor);

    this.width = width;

    this.addComponent(
      new Sprite(
        IMAGES.get((Floor.spriteSpec?.states?.get(width) as SpriteSpec).sheet),
        { x: 0, y: 0 },
        { width, height: Floor.spriteSpec.height },
        Floor.spriteSpec.msPerFrame,
        Floor.spriteSpec.frames
      )
    );

    this.addComponent(new TopCollidable());
  }

  public serialize() {
    return {
      floorWidth: this.width,
      boundingBox: this.getComponent<BoundingBox>(ComponentNames.BoundingBox)
    };
  }

  public setFrom(args: any) {
    const { boundingBox } = args;
    this.addComponent(
      new BoundingBox(
        boundingBox.center,
        boundingBox.dimension,
        boundingBox.rotation
      )
    );
  }

  public getNextUpdateInterval() {
    return Math.random() * 500;
  }
}
