import { Entity, EntityNames } from '.';
import { IMAGES, SPRITE_SPECS, Sprites, type SpriteSpec } from '../config';
import {
  Jump,
  FacingDirection,
  BoundingBox,
  Sprite,
  Velocity,
  Gravity,
  WallBounded,
  Forces,
  Collide,
  Control,
  Mass,
  Moment
} from '../components';
import { Direction } from '../interfaces';

export class Player extends Entity {
  private static MASS: number = 10;
  private static MOI: number = 100;

  private static spriteSpec: SpriteSpec = SPRITE_SPECS.get(
    Sprites.COFFEE
  ) as SpriteSpec;

  constructor(playerId: string) {
    super(EntityNames.Player);

    this.addComponent(
      new BoundingBox(
        {
          x: 300,
          y: 100
        },
        { width: Player.spriteSpec.width, height: Player.spriteSpec.height },
        0
      )
    );

    this.addComponent(
      new Velocity({ dCartesian: { dx: 0, dy: 0 }, dTheta: 0 })
    );

    this.addComponent(new Mass(Player.MASS));
    this.addComponent(new Moment(Player.MOI));
    this.addComponent(new Forces());
    this.addComponent(new Gravity());

    this.addComponent(new Jump());
    this.addComponent(new Control(playerId));

    this.addComponent(new Collide());
    this.addComponent(new WallBounded());

    this.addFacingDirectionComponents();
  }

  private addFacingDirectionComponents() {
    const [leftSprite, rightSprite] = [Direction.LEFT, Direction.RIGHT].map(
      (direction) =>
        new Sprite(
          IMAGES.get(Player.spriteSpec.states?.get(direction)?.sheet as string),
          { x: 0, y: 0 },
          { width: Player.spriteSpec.width, height: Player.spriteSpec.height },
          Player.spriteSpec.msPerFrame,
          Player.spriteSpec.frames
        )
    );

    this.addComponent(new FacingDirection(leftSprite, rightSprite));
    this.addComponent(leftSprite); // face Left by default
  }
}
