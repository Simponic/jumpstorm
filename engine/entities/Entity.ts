import type { Component } from "../components";

export abstract class Entity {
  public readonly id: string;
  public readonly components: Map<string, Component>;

  constructor() {
    this.id = crypto.randomUUID();
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
