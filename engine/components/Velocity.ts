import type { Velocity2D } from "../interfaces";
import { Component } from "./Component";
import { ComponentNames } from ".";

export class Velocity extends Component {
  public dCartesian: Velocity2D;
  public dTheta: number;

  constructor(dCartesian: Velocity2D = { dx: 0, dy: 0 }, dTheta: number = 0) {
    super(ComponentNames.Velocity);

    this.dCartesian = dCartesian;
    this.dTheta = dTheta;
  }

  public add(velocity?: Velocity) {
    if (velocity) {
      this.dCartesian.dx += velocity.dCartesian.dx;
      this.dCartesian.dy += velocity.dCartesian.dy;
      this.dTheta += velocity.dTheta;
    }
  }
}
