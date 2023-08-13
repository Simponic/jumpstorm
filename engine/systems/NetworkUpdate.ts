import { System, SystemNames } from ".";
import { Game } from "../Game";

export class NetworkUpdate extends System {
  constructor() {
    super(SystemNames.NetworkUpdate);
  }

  public update(_dt: number, _game: Game) {}
}
