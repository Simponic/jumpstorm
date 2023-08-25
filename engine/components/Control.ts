import { Component, ComponentNames, Velocity } from '.';

export class Control extends Component {
  public controlVelocityComponent: Velocity;
  public controllableBy: string;

  constructor(
    controllableBy: string,
    controlVelocityComponent: Velocity = new Velocity()
  ) {
    super(ComponentNames.Control);

    this.controllableBy = controllableBy;
    this.controlVelocityComponent = controlVelocityComponent;
  }
}
