import type { Coord2D, Dimension2D } from "../interfaces";

interface BoxedEntry {
  id: string;
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
    level?: number,
  ) {
    this.children = new Map<Quadrant, QuadTree>();
    this.objects = [];

    this.maxLevels = maxLevels;
    this.splitThreshold = splitThreshold;
    this.level = level ?? 0;

    this.topLeft = topLeft;
    this.dimension = dimension;
  }

  public insert(boxedEntry: BoxedEntry): void {
    if (this.hasChildren()) {
      this.getQuadrants(boxedEntry).forEach((quadrant) => {
        const quadrantBox = this.children.get(quadrant);
        quadrantBox?.insert(boxedEntry);
      });
      return;
    }

    this.objects.push(boxedEntry);

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

  public getNeighborIds(boxedEntry: BoxedEntry): string[] {
    const neighbors: string[] = this.objects.map(({ id }) => id);

    if (this.hasChildren()) {
      this.getQuadrants(boxedEntry).forEach((quadrant) => {
        const quadrantBox = this.children.get(quadrant);

        quadrantBox
          ?.getNeighborIds(boxedEntry)
          .forEach((id) => neighbors.push(id));
      });
    }

    return neighbors;
  }

  private performSplit(): void {
    const halfWidth = this.dimension.width / 2;
    const halfHeight = this.dimension.height / 2;

    (
      [
        [Quadrant.I, { x: this.topLeft.x + halfWidth, y: this.topLeft.y }],
        [Quadrant.II, { ...this.topLeft }],
        [Quadrant.III, { x: this.topLeft.x, y: this.topLeft.y + halfHeight }],
        [
          Quadrant.IV,
          { x: this.topLeft.x + halfWidth, y: this.topLeft.y + halfHeight },
        ],
      ] as [[Quadrant, Coord2D]]
    ).forEach(([quadrant, pos]) => {
      this.children.set(
        quadrant,
        new QuadTree(
          pos,
          { width: halfWidth, height: halfHeight },
          this.maxLevels,
          this.splitThreshold,
          this.level + 1,
        ),
      );
    });
  }

  private getQuadrants(boxedEntry: BoxedEntry): Quadrant[] {
    const treeCenter: Coord2D = {
      x: this.topLeft.x + this.dimension.width / 2,
      y: this.topLeft.y + this.dimension.height / 2,
    };

    return (
      [
        [
          Quadrant.I,
          (x: number, y: number) => x >= treeCenter.x && y < treeCenter.y,
        ],
        [
          Quadrant.II,
          (x: number, y: number) => x < treeCenter.x && y < treeCenter.y,
        ],
        [
          Quadrant.III,
          (x: number, y: number) => x < treeCenter.x && y >= treeCenter.y,
        ],
        [
          Quadrant.IV,
          (x: number, y: number) => x >= treeCenter.x && y >= treeCenter.y,
        ],
      ] as [[Quadrant, (x: number, y: number) => boolean]]
    )
      .filter(
        ([_quadrant, condition]) =>
          condition(
            boxedEntry.center.x + boxedEntry.dimension.width / 2,
            boxedEntry.center.y + boxedEntry.dimension.height / 2,
          ) ||
          condition(
            boxedEntry.center.x - boxedEntry.dimension.width / 2,
            boxedEntry.center.y - boxedEntry.dimension.height / 2,
          ),
      )
      .map(([quadrant]) => quadrant);
  }

  private realignObjects(): void {
    this.objects.forEach((boxedEntry) => {
      this.getQuadrants(boxedEntry).forEach((direction) => {
        const quadrant = this.children.get(direction);
        quadrant?.insert(boxedEntry);
      });
    });

    this.objects = [];
  }

  private hasChildren() {
    return this.children && this.children.size > 0;
  }
}
