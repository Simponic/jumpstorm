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

class Server {
  private server: any;
  private game: Game;

  constructor() {
    this.game = new Game();

    [
      new Physics(),
      new Collision({
        width: Miscellaneous.WIDTH,
        height: Miscellaneous.HEIGHT,
      }),
      new WallBounds(Miscellaneous.WIDTH),
    ].forEach((system) => this.game.addSystem(system));

    [new Floor(160), new Player()].forEach((entity) =>
      this.game.addEntity(entity),
    );

    this.game.start();
    setInterval(() => {
      this.game.doGameLoop(performance.now());
    }, TICK_RATE);

    this.server = Bun.serve<any>({
      websocket: {
        open(ws) {
          ws.subscribe("the-group-chat");
          ws.publish("the-group-chat", msg);
        },
        message(ws, message) {
          // this is a group chat
          // so the server re-broadcasts incoming message to everyone
          ws.publish("the-group-chat", `${ws.data.username}: ${message}`);
        },
        close(ws) {
          const msg = `${ws.data.username} has left the chat`;
          ws.unsubscribe("the-group-chat");
          ws.publish("the-group-chat", msg);
        },
      },
    });
  }
}

new Server();
