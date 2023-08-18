import type { Coord2D, Dimension2D } from "../interfaces";

export interface BoxedEntry {
  id: string;
  dimension: Dimension2D;
  center: Coord2D;
}

export interface RefreshingCollisionFinderBehavior {
  public clear(): void;
  public insert(boxedEntry: BoxedEntry): void;
  public getNeighborIds(boxedEntry: BoxedEntry): Set<string>;
  public setTopLeft(topLeft: Coord2d): void;
}
