import { Component, ComponentNames } from ".";

export class Jump extends Component {
  public canJump: boolean;

  constructor() {
    super(ComponentNames.Jump);
    this.canJump = false;
  }
}
