import { EntityNames, Player } from ".";
import type { Component } from "../components";

export abstract class Entity {
  public id: string;
  public components: Map<string, Component>;
  public name: string;

  constructor(name: string, id: string = crypto.randomUUID()) {
    this.name = name;
    this.id = id;
    this.components = new Map();
  }

  public addComponent(component: Component) {
    this.components.set(component.name, component);
  }

  public getComponent<T extends Component>(name: string): T {
    if (!this.hasComponent(name)) {
      throw new Error("Entity does not have component " + name);
    }
    return this.components.get(name) as T;
  }

  public getComponents(): Component[] {
    return Array.from(this.components.values());
  }

  public hasComponent(name: string): boolean {
    return this.components.has(name);
  }

  static from(entityName: string, args: any): Entity {
    switch (entityName) {
      case EntityNames.Player:
        return new Player(args.playerId);
      default:
        throw new Error(".from() Entity type not implemented: " + entityName);
    }
  }
}
