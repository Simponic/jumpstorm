import type { Component } from "../components";
import { ComponentNotFoundError } from "../exceptions";

export abstract class Entity {
  private static ID = 0;

  public readonly id: number;
  public readonly components: Map<string, Component>;

  constructor() {
    this.id = Entity.ID++;
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
}
