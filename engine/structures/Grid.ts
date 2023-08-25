import type { Coord2D, Dimension2D } from '../interfaces';
import type { BoxedEntry, RefreshingCollisionFinderBehavior } from '.';
import { Miscellaneous } from '../config/constants';

export class Grid implements RefreshingCollisionFinderBehavior {
  private cellEntities: Map<number, string[]>;

  private gridDimension: Dimension2D;
  private cellDimension: Dimension2D;
  private topLeft: Coord2D;

  constructor(
    gridDimension: Dimension2D = {
      width: Miscellaneous.WIDTH,
      height: Miscellaneous.HEIGHT
    },
    cellDimension: Dimension2D = {
      width: Miscellaneous.DEFAULT_GRID_WIDTH,
      height: Miscellaneous.DEFAULT_GRID_HEIGHT
    },
    topLeft = { x: 0, y: 0 }
  ) {
    this.gridDimension = gridDimension;
    this.cellDimension = cellDimension;
    this.topLeft = topLeft;

    this.cellEntities = new Map();
  }

  public insert(boxedEntry: BoxedEntry) {
    this.getOverlappingCells(boxedEntry).forEach((gridIdx) => {
      if (!this.cellEntities.has(gridIdx)) {
        this.cellEntities.set(gridIdx, []);
      }
      this.cellEntities.get(gridIdx)!.push(boxedEntry.id);
    });
  }

  public getNeighborIds(boxedEntry: BoxedEntry): Set<string> {
    const neighborIds: Set<string> = new Set();
    this.getOverlappingCells(boxedEntry).forEach((gridIdx) => {
      if (this.cellEntities.has(gridIdx)) {
        this.cellEntities.get(gridIdx)!.forEach((id) => neighborIds.add(id));
      }
    });
    return neighborIds;
  }

  public clear() {
    this.cellEntities.clear();
  }

  public setTopLeft(topLeft: Coord2D) {
    this.topLeft = topLeft;
  }

  public setDimension(dimension: Dimension2D) {
    this.gridDimension = dimension;
  }

  public setCellDimension(cellDimension: Dimension2D) {
    this.cellDimension = cellDimension;
  }

  private getOverlappingCells(boxedEntry: BoxedEntry): number[] {
    const { center, dimension } = boxedEntry;
    const yBoxes = Math.ceil(
      this.gridDimension.height / this.cellDimension.height
    );
    const xBoxes = Math.ceil(
      this.gridDimension.width / this.cellDimension.width
    );

    const translated: Coord2D = {
      y: center.y - this.topLeft.y,
      x: center.x - this.topLeft.x
    };

    const topLeftBox = {
      x: Math.floor(
        (translated.x - dimension.width / 2) / this.cellDimension.width
      ),
      y: Math.floor(
        (translated.y - dimension.height / 2) / this.cellDimension.height
      )
    };
    const bottomRightBox = {
      x: Math.floor(
        (translated.x + dimension.width / 2) / this.cellDimension.width
      ),
      y: Math.floor(
        (translated.y + dimension.height / 2) / this.cellDimension.height
      )
    };

    const cells: number[] = [];

    for (let y = topLeftBox.y; y <= bottomRightBox.y; ++y)
      for (let x = topLeftBox.x; x <= bottomRightBox.x; ++x)
        cells.push(yBoxes * y + x);

    return cells;
  }
}
