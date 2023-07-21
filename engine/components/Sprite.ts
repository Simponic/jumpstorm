import { Component, ComponentNames } from ".";
import type { Dimension2D, DrawArgs, Coord2D } from "../interfaces";

export class Sprite extends Component {
  private sheet: HTMLImageElement;

  private spriteImgPos: Coord2D;
  private spriteImgDimensions: Dimension2D;

  private msPerFrame: number;
  private msSinceLastFrame: number;
  private currentFrame: number;
  private numFrames: number;

  constructor(
    sheet: HTMLImageElement,
    spriteImgPos: Coord2D,
    spriteImgDimensions: Dimension2D,
    msPerFrame: number,
    numFrames: number
  ) {
    super(ComponentNames.Sprite);

    this.sheet = sheet;
    this.spriteImgPos = spriteImgPos;
    this.spriteImgDimensions = spriteImgDimensions;
    this.msPerFrame = msPerFrame;
    this.numFrames = numFrames;

    this.msSinceLastFrame = 0;
    this.currentFrame = 0;
  }

  public update(dt: number) {
    this.msSinceLastFrame += dt;
    if (this.msSinceLastFrame >= this.msPerFrame) {
      this.currentFrame = (this.currentFrame + 1) % this.numFrames;
      this.msSinceLastFrame = 0;
    }
  }

  public draw(ctx: CanvasRenderingContext2D, drawArgs: DrawArgs) {
    const { center, rotation, tint, opacity } = drawArgs;

    ctx.save();
    ctx.translate(center.x, center.y);
    if (rotation != 0) {
      ctx.rotate(rotation * (Math.PI / 180));
    }
    ctx.translate(-center.x, -center.y);

    if (opacity) {
      ctx.globalAlpha = opacity;
    }

    ctx.drawImage(
      this.sheet,
      ...this.getSpriteArgs(),
      ...this.getDrawArgs(drawArgs)
    );

    if (tint) {
      ctx.globalAlpha = 0.5;
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = tint;
      ctx.fillRect(...this.getDrawArgs(drawArgs));
    }

    ctx.restore();
  }

  private getSpriteArgs(): [sx: number, sy: number, sw: number, sh: number] {
    return [
      this.spriteImgPos.x + this.currentFrame * this.spriteImgDimensions.width,
      this.spriteImgPos.y,
      this.spriteImgDimensions.width,
      this.spriteImgDimensions.height,
    ];
  }

  private getDrawArgs({
    center,
    dimension,
  }: DrawArgs): [dx: number, dy: number, dw: number, dh: number] {
    return [
      center.x - dimension.width / 2,
      center.y - dimension.height / 2,
      dimension.width,
      dimension.height,
    ];
  }
}
