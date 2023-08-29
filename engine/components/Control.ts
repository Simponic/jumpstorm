import { Component, ComponentNames, Velocity } from '.';

export class Control extends Component {
  public controlVelocityComponent: Velocity;
  public controllableBy: string;
  public isControllable?: boolean; // updated by the input system

  constructor(
    controllableBy: string,
    controlVelocityComponent: Velocity = new Velocity(),
    isControllable?: boolean
  ) {
    super(ComponentNames.Control);

    this.controllableBy = controllableBy;
    this.isControllable = isControllable;
    this.controlVelocityComponent = controlVelocityComponent;
  }
}
