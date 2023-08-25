import { Game } from '../Game';

export abstract class System {
  public readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract update(dt: number, game: Game): void;
}
