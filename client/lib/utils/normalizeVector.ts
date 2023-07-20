import type { Coord2D } from "../interfaces";

export const normalizeVector = (vector: Coord2D): Coord2D => {
  const { x, y } = vector;
  const length = Math.sqrt(x * x + y * y);

  return { x: x / length, y: y / length };
};
