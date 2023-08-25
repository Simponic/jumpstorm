import { Component, ComponentNames } from '.';

export class Moment extends Component {
  public inertia: number;

  constructor(inertia: number) {
    super(ComponentNames.Moment);
    this.inertia = inertia;
  }
}
