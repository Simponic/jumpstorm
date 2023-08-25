import { ComponentNames, Component } from '.';

export class Gravity extends Component {
  private static DEFAULT_TERMINAL_VELOCITY = 4.5;

  public terminalVelocity: number;

  constructor(terminalVelocity?: number) {
    super(ComponentNames.Gravity);
    this.terminalVelocity =
      terminalVelocity ?? Gravity.DEFAULT_TERMINAL_VELOCITY;
  }
}
