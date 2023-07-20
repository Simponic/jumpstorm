import { Component, ComponentNames } from ".";
import type { Coord2D, Dimension2D } from "../interfaces";
import { dotProduct, rotateVector, normalizeVector } from "../utils";

export class BoundingBox extends Component {
  public center: Coord2D;
  public dimension: Dimension2D;
  public rotation: number;

  constructor(center: Coord2D, dimension: Dimension2D, rotation?: number) {
    super(ComponentNames.BoundingBox);

    this.center = center;
    this.dimension = dimension;
    this.rotation = rotation ?? 0;
  }

  public isCollidingWith(box: BoundingBox): boolean {
    const boxes = [this.getVertices(), box.getVertices()];
    for (const poly of boxes) {
      for (let i = 0; i < poly.length; ++i) {
        const [A, B] = [poly[i], poly[(i + 1) % poly.length]];
        const normal: Coord2D = { x: B.y - A.y, y: A.x - B.x };

        const [[minThis, maxThis], [minBox, maxBox]] = boxes.map((box) =>
          box.reduce(
            ([min, max], vertex) => {
              const projection = dotProduct(normal, vertex);
              return [Math.min(min, projection), Math.max(max, projection)];
            },
            [Infinity, -Infinity]
          )
        );

        if (maxThis < minBox || maxBox < minThis) return false;
      }
    }

    return true;
  }

  public getVertices(): Coord2D[] {
    return [
      { x: -this.dimension.width / 2, y: -this.dimension.height / 2 },
      { x: -this.dimension.width / 2, y: this.dimension.height / 2 },
      { x: this.dimension.width / 2, y: this.dimension.height / 2 },
      { x: this.dimension.width / 2, y: -this.dimension.height / 2 },
    ]
      .map((vertex) => rotateVector(vertex, this.rotation))
      .map((vertex) => {
        return {
          x: vertex.x + this.center.x,
          y: vertex.y + this.center.y,
        };
      });
  }

  private getAxes() {
    const corners: Coord2D[] = this.getVerticesRelativeToCenter();
    const axes: Coord2D[] = [];

    for (let i = 0; i < corners.length; ++i) {
      const [cornerA, cornerB] = [
        corners[i],
        corners[(i + 1) % corners.length],
      ].map((corner) => rotateVector(corner, this.rotation));

      axes.push(
        normalizeVector({
          x: cornerB.y - cornerA.y,
          y: -(cornerB.x - cornerA.x),
        })
      );
    }

    return axes;
  }

  private project(axis: Coord2D): [number, number] {
    const corners = this.getCornersRelativeToCenter();
    let [min, max] = [Infinity, -Infinity];

    for (const corner of corners) {
      const rotated = rotateVector(corner, this.rotation);
      const translated = {
        x: rotated.x + this.center.x,
        y: rotated.y + this.center.y,
      };
      const projection = dotProduct(translated, axis);

      min = Math.min(projection, min);
      max = Math.max(projection, max);
    }

    return [min, max];
  }
}
