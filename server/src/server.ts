import { Game } from "@engine/Game";
import { Floor, Player } from "@engine/entities";
import {
  WallBounds,
  Physics,
  Collision,
  NetworkUpdate,
  MessageQueueProvider,
  MessagePublisher,
} from "@engine/systems";
import { Grid } from "@engine/structures";
import { Miscellaneous } from "@engine/config";
import { Server } from "bun";

class ServerSocketMessageReceiver implements MessageQueueProvider {
  private messages: any[];

  constructor() {
    this.messages = [];
  }

  addMessage(message: any) {
    this.messages.push(message);
  }

  getNewMessages() {
    return this.messages;
  }

  clearMessages() {
    this.messages = [];
  }
}

class ServerSocketMessagePublisher implements MessagePublisher {
  private server: Server;
  private messages: any[];

  constructor(server: Server) {
    this.server = server;
    this.messages = [];
  }

  addMessage(_message: any) {}

  publish() {}
}

const game = new Game();

const messageReceiver = new ServerSocketMessageReceiver();

const server = Bun.serve<{ sessionId: string }>({
  port: 8080,
  fetch: async (req, server): Promise<string> => {
    const sessionId = crypto.randomUUID();

    server.upgrade(req, {
      headers: {
        "Set-Cookie": `SessionId=${sessionId}`,
      },
      data: {
        sessionId,
      },
    });

    return sessionId;
  },
  websocket: {
    open(ws) {
      const { sessionId } = ws.data;

      if (sessionControllableEntities.has(sessionId)) {
        return;
      }

      const player = new Player();
      game.addEntity(player);

      sessionControllableEntities.set(sessionId, new Set(player.id));
    },
    message(ws, message) {
      console.log(JSON.parse(message));
      messageReceiver.addMessage(message);
    },
    close(ws) {},
  },
});

const messagePublisher = new ServerSocketMessagePublisher(server);

[
  new Physics(),
  new Collision(new Grid()),
  new WallBounds(Miscellaneous.WIDTH),
  new NetworkUpdate(messageReceiver, messagePublisher),
].forEach((system) => game.addSystem(system));

[new Floor(160), new Player()].forEach((entity) => game.addEntity(entity));

game.start();

setInterval(() => {
  game.doGameLoop(performance.now());
}, Miscellaneous.SERVER_TICK_RATE);

const sessionControllableEntities: Map<string, Set<string>> = new Map();

console.log(`Listening on ${server.hostname}:${server.port}`);
