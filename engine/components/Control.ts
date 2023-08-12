import { Component, ComponentNames, Velocity } from ".";

export class Control extends Component {
  public controlVelocity: Velocity;

  constructor(controlVelocity: Velocity = new Velocity()) {
    super(ComponentNames.Control);

    this.controlVelocity = controlVelocity;
  }
}
