import { Component, ComponentNames, Velocity } from ".";

export class Control extends Component {
  public controlVelocityComponent: Velocity;

  constructor(
    controlVelocityComponent: Velocity = new Velocity(),
    controllableBy: string
  ) {
    super(ComponentNames.Control);

    this.controlVelocityComponent = controlVelocityComponent;
  }
}
