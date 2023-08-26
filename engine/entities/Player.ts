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
  Mass,
  Moment,
  ComponentNames,
  Control
} from '../components';
import { Direction } from '../interfaces';

export class Player extends Entity {
  private static MASS: number = 10;
  private static MOI: number = 100;

  private static spriteSpec: SpriteSpec = SPRITE_SPECS.get(
    Sprites.COFFEE
  ) as SpriteSpec;

  constructor() {
    super(EntityNames.Player);

    this.addComponent(
      new BoundingBox(
        {
          x: 0,
          y: 0
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
    this.addComponent(leftSprite); // face left by default
  }

  public serialize(): Record<string, any> {
    return {
      control: this.getComponent<Control>(ComponentNames.Control),
      boundingBox: this.getComponent<BoundingBox>(ComponentNames.BoundingBox),
      velocity: this.getComponent<Velocity>(ComponentNames.Velocity),
      forces: this.getComponent<Forces>(ComponentNames.Forces)
    };
  }

  public setFrom(args: Record<string, any>) {
    const { control, velocity, forces, boundingBox } = args;

    let center = boundingBox.center;

    const myCenter = this.getComponent<BoundingBox>(
      ComponentNames.BoundingBox
    ).center;
    const distance = Math.sqrt(
      Math.pow(center.y - myCenter.y, 2) + Math.pow(center.x - myCenter.x, 2)
    );
    if (distance < 30) center = myCenter;

    [
      Object.assign(new Control(control.controllableBy), control),
      new Velocity(velocity.velocity),
      new Forces(forces.forces),
      new BoundingBox(center, boundingBox.dimension, boundingBox.rotation)
    ].forEach((component) => this.addComponent(component));
  }
}
