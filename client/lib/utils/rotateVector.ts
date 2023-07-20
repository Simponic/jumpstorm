import type { Coord2D } from "../interfaces";

/**
 * ([[cos(θ), -sin(θ),])  ([x,)
 * ([sin(θ),  cos(θ)] ])  ( y])
 */
export const rotateVector = (vector: Coord2D, theta: number): Coord2D => {
  const rads = (theta * Math.PI) / 180;
  const [cos, sin] = [Math.cos(rads), Math.sin(rads)];

  return {
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos,
  };
};
