import type { Velocity2D } from "../interfaces";
import { Component } from "./Component";
import { ComponentNames } from ".";

export class Velocity extends Component {
  public dCartesian: Velocity2D;
  public dTheta: number;

  constructor(dCartesian: Velocity2D, dTheta: number) {
    super(ComponentNames.Velocity);

    this.dCartesian = dCartesian;
    this.dTheta = dTheta;
  }
}
