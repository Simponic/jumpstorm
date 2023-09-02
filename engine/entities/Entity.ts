import { EntityNames, Floor, Player } from '.';
import { type Component } from '../components';

const randomId = () => (Math.random() * 1_000_000_000).toString();

export abstract class Entity {
  public id: string;
  public components: Map<string, Component>;
  public name: string;

  constructor(name: string, id: string = randomId()) {
    this.name = name;
    this.id = id;
    this.components = new Map();
  }

  public addComponent(component: Component) {
    this.components.set(component.name, component);
  }

  public getComponent<T extends Component>(name: string): T {
    if (!this.hasComponent(name)) {
      throw new Error('Entity does not have component ' + name);
    }
    return this.components.get(name) as T;
  }

  public getComponents(): Component[] {
    return Array.from(this.components.values());
  }

  public hasComponent(name: string): boolean {
    return this.components.has(name);
  }

  public static from(entityName: string, id: string, args: any): Entity {
    let entity: Entity;

    switch (entityName) {
      case EntityNames.Player:
        const player = new Player();
        player.setFrom(args);
        entity = player;
        break;
      case EntityNames.Floor:
        const floor = new Floor(args.floorWidth);
        floor.setFrom(args);
        entity = floor;
        break;
      default:
        throw new Error('.from() Entity type not implemented: ' + entityName);
    }

    entity.id = id;
    return entity;
  }

  public abstract setFrom(args: Record<string, any>): void;

  public abstract serialize(): Record<string, any>;
}
