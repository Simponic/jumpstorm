import { Game } from "../../engine/Game";
import { Floor, Player } from "../../engine/entities";
import {
  WallBounds,
  FacingDirection,
  Physics,
  Input,
  Collision,
} from "../../engine/systems";
import { Miscellaneous } from "../../engine/config";

const TICK_RATE = 60 / 1000;

const game = new Game();

[new Physics(), new Collision(), new WallBounds(Miscellaneous.WIDTH)].forEach(
  (system) => game.addSystem(system)
);

[new Floor(160), new Player()].forEach((entity) => game.addEntity(entity));

game.start();
setInterval(() => {
  game.doGameLoop(performance.now());
}, TICK_RATE);

const server = Bun.serve<>({
  port: 8080,
  fetch(req, server) {
    server.upgrade(req, {
      data: {},
    });
  },
  websocket: {
    // handler called when a message is received
    async message(ws, message) {
      console.log(`Received ${message}`);
    },
  },
});
console.log(`Listening on localhost:${server.port}`);
