import { Component, ComponentNames } from '.';

export class Mass extends Component {
  public mass: number;

  constructor(mass: number) {
    super(ComponentNames.Mass);
    this.mass = mass;
  }
}
