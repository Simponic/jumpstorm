import type { Coord2D, Dimension2D } from "./";

export interface DrawArgs {
  center: Coord2D;
  dimension: Dimension2D;
  tint?: string;
  opacity?: number;
  rotation?: number;
}
