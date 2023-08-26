import type { Force2D } from '../interfaces';
import { Component } from './Component';
import { ComponentNames } from '.';

/**
 * A list of forces and torque, (in newtons, and newton-meters respectively)
 * to apply on one Physics system update (after which, they are cleared).
 */
export class Forces extends Component {
  public forces: Force2D[];

  constructor(forces?: Force2D[]) {
    super(ComponentNames.Forces);

    this.forces = forces ?? [];
  }
}
