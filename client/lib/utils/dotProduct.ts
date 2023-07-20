import type { Coord2D } from "../interfaces";

export const dotProduct = (vector1: Coord2D, vector2: Coord2D): number =>
  vector1.x * vector2.x + vector1.y * vector2.y;
