export interface Coord2D {
  x: number;
  y: number;
}

export interface Dimension2D {
  width: number;
  height: number;
}

export interface Velocity2D {
  dx: number;
  dy: number;
}

export interface Force2D {
  fCartesian: {
    fx: number;
    fy: number;
  };
  torque: number;
}
