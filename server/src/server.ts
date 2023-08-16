import { Game } from "../../engine/Game";
import { Floor, Player } from "../../engine/entities";
import {
  WallBounds,
  Physics,
  Collision,
  MessageQueueProvider,
  MessagePublisher,
} from "../../engine/systems";
import { Miscellaneous } from "../../engine/config";

const TICK_RATE = 60 / 1000;

const game = new Game();

[new Physics(), new Collision(), new WallBounds(Miscellaneous.WIDTH)].forEach(
  (system) => game.addSystem(system),
);

[new Floor(160), new Player()].forEach((entity) => game.addEntity(entity));

game.start();

setInterval(() => {
  game.doGameLoop(performance.now());
}, TICK_RATE);

const server = Bun.serve({
  port: 8080,
  fetch(req, server) {
    const sessionId = Math.floor(Math.random() * 1e10).toString();

    server.upgrade(req, {
      headers: {
        "Set-Cookie": `SessionId=${sessionId}`,
      },
    });
  },
  websocket: {
    open(ws) {},
    message(ws, message) {
      console.log(message);
    },
    close(ws) {},
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
