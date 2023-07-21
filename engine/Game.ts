import { Entity } from "./entities";
import { System } from "./systems";

export class Game {
  private systemOrder: string[];

  private running: boolean;
  private lastTimeStamp: number;

  public entities: Map<number, Entity>;
  public systems: Map<string, System>;
  public componentEntities: Map<string, Set<number>>;

  constructor() {
    this.running = false;
    this.systemOrder = [];
    this.systems = new Map();
    this.entities = new Map();
    this.componentEntities = new Map();
  }

  public start() {
    this.lastTimeStamp = performance.now();
    this.running = true;
  }

  public addEntity(entity: Entity) {
    this.entities.set(entity.id, entity);
  }

  public getEntity(id: number): Entity {
    return this.entities.get(id);
  }

  public removeEntity(id: number) {
    this.entities.delete(id);
  }

  public addSystem(system: System) {
    if (!this.systemOrder.includes(system.name)) {
      this.systemOrder.push(system.name);
    }
    this.systems.set(system.name, system);
  }

  public getSystem(name: string): System {
    return this.systems.get(name);
  }

  public doGameLoop = (timeStamp: number) => {
    if (!this.running) {
      return;
    }

    const dt = timeStamp - this.lastTimeStamp;
    this.lastTimeStamp = timeStamp;

    this.componentEntities.clear();
    this.entities.forEach((entity) =>
      entity.getComponents().forEach((component) => {
        if (!this.componentEntities.has(component.name)) {
          this.componentEntities.set(
            component.name,
            new Set<number>([entity.id])
          );
          return;
        }
        this.componentEntities.get(component.name).add(entity.id);
      })
    );

    this.systemOrder.forEach((systemName) => {
      this.systems.get(systemName).update(dt, this);
    });
  };
}