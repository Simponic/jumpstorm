import type { Velocity2D } from "../interfaces";
import { Component } from "./Component";
import { ComponentNames } from ".";

export class Velocity extends Component {
  public velocity: Velocity2D;

  constructor(
    velocity: Velocity2D = { dCartesian: { dx: 0, dy: 0 }, dTheta: 0 },
  ) {
    super(ComponentNames.Velocity);

    this.velocity = velocity;
  }

  public add(velocity?: Velocity2D) {
    if (velocity) {
      this.velocity.dCartesian.dx += velocity.dCartesian.dx;
      this.velocity.dCartesian.dy += velocity.dCartesian.dy;
      this.velocity.dTheta += velocity.dTheta;
    }
  }
}
