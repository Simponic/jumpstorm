import type { Coord2D, Dimension2D } from "../interfaces";
import { ComponentNames, BoundingBox } from "../components";
import { Entity } from "../entities";

interface BoxedEntry {
  id: number;
  dimension: Dimension2D;
  center: Coord2D;
}

enum Quadrant {
  I,
  II,
  III,
  IV,
}

export class QuadTree {
  private maxLevels: number;
  private splitThreshold: number;
  private level: number;
  private topLeft: Coord2D;
  private dimension: Dimension2D;

  private children: Map<Quadrant, QuadTree>;
  private objects: BoxedEntry[];

  constructor(
    topLeft: Coord2D,
    dimension: Dimension2D,
    maxLevels: number,
    splitThreshold: number,
    level?: number
  ) {
    this.children = [];
    this.objects = [];

    this.maxLevels = maxLevels;
    this.splitThreshold = splitThreshold;
    this.level = level ?? 0;
  }

  public insert(id: number, dimension: Dimension2D, center: Coord2D): void {
    if (this.hasChildren()) {
      this.getIndices(boundingBox).forEach((i) =>
        this.children[i].insert(id, dimension, center)
      );
      return;
    }

    this.objects.push({ id, dimension, center });

    if (
      this.objects.length > this.splitThreshold &&
      this.level < this.maxLevels
    ) {
      if (!this.hasChildren()) {
        this.performSplit();
      }
      this.realignObjects();
    }
  }

  public clear(): void {
    this.objects = [];
    if (this.hasChildren()) {
      this.children.forEach((child) => child.clear());
      this.children.clear();
    }
  }

  public getNeighborIds(boxedEntry: BoxedEntry): number[] {
    const neighbors: number[] = this.objects.map(({ id }) => id);

    if (this.hasChildren()) {
      this.getQuadrants(boxedEntry).forEach((quadrant) => {
        this.children
          .get(quadrant)
          .getNeighborIds(boxedEntry)
          .forEach((id) => neighbors.push(id));
      });
    }

    return neighbors;
  }

  private performSplit(): void {
    const halfWidth = this.dimension.width / 2;
    const halfHeight = this.dimension.height / 2;

    [
      [Quadrant.I, { x: this.topLeft.x + halfWidth, y: this.topLeft.y }],
      [Quadrant.II, { ...this.topLeft }],
      [Quadrant.III, { x: this.topLeft.x, y: this.topLeft.y + halfHeight }],
      [
        Quadrant.IV,
        { x: this.topLeft.x + halfWidth, y: this.topLeft.y + halfHeight },
      ],
    ].forEach(([quadrant, pos]) => {
      this.children.set(
        quadrant,
        new QuadTree(
          pos,
          { width: halfWidth, height: halfHeight },
          this.maxLevels,
          this.splitThreshold,
          this.level + 1
        )
      );
    });
  }

  private getQuandrants(boxedEntry: BoxedEntry): Quadrant[] {
    const treeCenter: Coord2D = {
      x: this.topLeft.x + this.dimension.width / 2,
      y: this.topLeft.y + this.dimension.height / 2,
    };

    return [
      [Quadrant.I, (x, y) => x >= treeCenter.x && y < treeCenter.y],
      [Quadrant.II, (x, y) => x < treeCenter.x && y < treeCenter.y],
      [Quadrant.III, (x, y) => x < treeCenter.x && y >= treeCenter.y],
      [Quadrant.IV, (x, y) => x >= treeCenter.x && y >= treeCenter.y],
    ]
      .filter(
        ([_quadrant, condition]) =>
          condition(
            boxedEntry.center.x + boxedEntry.dimension.width / 2,
            boxedEntry.center.y + boxedEntry.dimension.height / 2
          ) ||
          condition(
            boxedEntry.center.x - boxedEntry.dimension.width / 2,
            boxedEntry.center.y - boxedEntry.dimension.height / 2
          )
      )
      .map(([quadrant]) => quadrant);
  }

  private realignObjects(): void {
    this.objects.forEach((boxedEntry) => {
      this.getQuadrants(boxedEntry).forEach((direction) => {
        this.children
          .get(direction)
          .insert(boxedEntry.id, boxedEntry.dimension, boxedEntry.center);
      });
    });

    this.objects = [];
  }

  private hasChildren() {
    return this.children && this.children.length > 0;
  }
}