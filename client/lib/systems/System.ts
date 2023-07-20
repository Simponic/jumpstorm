import { Entity } from "../entities";

export abstract class System {
  public readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract update(
    dt: number,
    entityMap: Map<number, Entity>,
    componentEntities: Map<string, Set<number>>
  ): void;
}
