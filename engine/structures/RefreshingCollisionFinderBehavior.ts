import type { Coord2D, Dimension2D } from '../interfaces';

export interface BoxedEntry {
  id: string;
  dimension: Dimension2D;
  center: Coord2D;
}

export interface RefreshingCollisionFinderBehavior {
  clear(): void;
  insert(boxedEntry: BoxedEntry): void;
  getNeighborIds(boxedEntry: BoxedEntry): Set<string>;
  setTopLeft(topLeft: Coord2D): void;
  setDimension(dimension: Dimension2D): void;
}
