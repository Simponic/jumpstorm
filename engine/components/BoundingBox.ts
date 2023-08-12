import { Component, ComponentNames } from ".";
import type { Coord2D, Dimension2D } from "../interfaces";
import { dotProduct, rotateVector } from "../utils";

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

  // https://en.wikipedia.org/wiki/Hyperplane_separation_theorem
  public isCollidingWith(box: BoundingBox): boolean {
    const boxes = [this.getVertices(), box.getVertices()];
    for (const poly of boxes) {
      for (let i = 0; i < poly.length; i++) {
        const [A, B] = [poly[i], poly[(i + 1) % poly.length]];
        const normal: Coord2D = { x: B.y - A.y, y: A.x - B.x };

        const [[minThis, maxThis], [minBox, maxBox]] = boxes.map((box) =>
          box.reduce(
            ([min, max], vertex) => {
              const projection = dotProduct(normal, vertex);
              return [Math.min(min, projection), Math.max(max, projection)];
            },
            [Infinity, -Infinity],
          ),
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

  public getRotationInPiOfUnitCircle() {
    let rads = this.rotation * (Math.PI / 180);
    if (rads >= Math.PI) {
      rads -= Math.PI;
    }
    return rads;
  }

  public getOutscribedBoxDims(): Dimension2D {
    let rads = this.getRotationInPiOfUnitCircle();
    const { width, height } = this.dimension;

    if (rads <= Math.PI / 2) {
      return {
        width: Math.abs(height * Math.sin(rads) + width * Math.cos(rads)),
        height: Math.abs(width * Math.sin(rads) + height * Math.cos(rads)),
      };
    }

    rads -= Math.PI / 2;
    return {
      width: Math.abs(height * Math.cos(rads) + width * Math.sin(rads)),
      height: Math.abs(width * Math.cos(rads) + height * Math.sin(rads)),
    };
  }
}
