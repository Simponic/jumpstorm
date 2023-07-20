import { Component, ComponentNames, Sprite } from ".";

export class FacingDirection extends Component {
  public readonly facingLeftSprite: Sprite;
  public readonly facingRightSprite: Sprite;

  constructor(facingLeftSprite: Sprite, facingRightSprite: Sprite) {
    super(ComponentNames.FacingDirection);

    this.facingLeftSprite = facingLeftSprite;
    this.facingRightSprite = facingRightSprite;
  }
}
