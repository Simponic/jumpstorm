import { System, SystemNames } from ".";
import { BoundingBox, ComponentNames } from "../components";
import type { Entity } from "../entities";

export class WallBounds extends System {
  private screenWidth: number;

  constructor(screenWidth: number) {
    super(SystemNames.WallBounds);

    this.screenWidth = screenWidth;
  }

  public update(
    _dt: number,
    entityMap: Map<number, Entity>,
    componentEntities: Map<string, Set<number>>
  ) {
    componentEntities.get(ComponentNames.WallBounded)?.forEach((entityId) => {
      const entity = entityMap.get(entityId);
      if (!entity.hasComponent(ComponentNames.BoundingBox)) {
        return;
      }

      const boundingBox = entity.getComponent<BoundingBox>(
        ComponentNames.BoundingBox
      );

      boundingBox.center.x = Math.min(
        this.screenWidth - boundingBox.dimension.width / 2,
        Math.max(boundingBox.dimension.width / 2, boundingBox.center.x)
      );
    });
  }
}
