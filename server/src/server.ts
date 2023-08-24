import { Game } from "@engine/Game";
import { EntityNames, Player } from "@engine/entities";
import { WallBounds, Physics, Collision, NetworkUpdate } from "@engine/systems";
import {
  type MessageQueueProvider,
  type MessagePublisher,
  MessageType,
  type MessageProcessor,
  type Message,
} from "@engine/network";
import { stringify, parse } from "@engine/utils";
import { Grid } from "@engine/structures";
import { Miscellaneous } from "@engine/config";
import { Server } from "bun";

const SERVER_PORT = 8080;
const SERVER_TICK_RATE = (1 / 100) * 1000;
const GAME_TOPIC = "game";

type SessionData = { sessionId: string };

interface ServerMessage extends Message {
  sessionData: SessionData;
}

class ServerSocketMessageReceiver implements MessageQueueProvider {
  private messages: ServerMessage[];

  constructor() {
    this.messages = [];
  }

  public addMessage(message: ServerMessage) {
    this.messages.push(message);
  }

  public getNewMessages() {
    return this.messages;
  }

  public clearMessages() {
    this.messages = [];
  }
}

class ServerMessageProcessor implements MessageProcessor {
  constructor() {}

  public process(_message: ServerMessage) {}
}

class ServerSocketMessagePublisher implements MessagePublisher {
  private server?: Server;
  private messages: Message[];

  constructor(server?: Server) {
    if (server) {
      this.server = server;
    }

    this.messages = [];
  }

  public setServer(server: Server) {
    this.server = server;
  }

  public addMessage(message: Message) {
    this.messages.push(message);
  }

  public publish() {
    this.messages.forEach(
      (message) => this.server?.publish(GAME_TOPIC, stringify(message)),
    );

    this.messages = [];
  }
}

const game = new Game();

const messageReceiver = new ServerSocketMessageReceiver();
const messagePublisher = new ServerSocketMessagePublisher();
const messageProcessor = new ServerMessageProcessor();
const sessionControllableEntities: Map<string, Set<string>> = new Map();

const server = Bun.serve<SessionData>({
  port: SERVER_PORT,
  fetch: async (req, server): Promise<Response> => {
    const url = new URL(req.url);

    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");

    if (url.pathname == "/assign") {
      const sessionId = crypto.randomUUID();
      headers.set("Set-Cookie", `SessionId=${sessionId};`);

      return new Response(sessionId, { headers });
    }

    const cookie = req.headers.get("cookie");
    if (!cookie) {
      return new Response("No session", { headers, status: 401 });
    }

    const sessionId = cookie.split(";").at(0)!.split("SessionId=").at(1);

    if (url.pathname == "/game") {
      headers.set(
        "Set-Cookie",
        `SessionId=${sessionId}; HttpOnly; SameSite=Strict;`,
      );
      server.upgrade(req, {
        headers,
        data: {
          sessionId,
        },
      });

      return new Response("upgraded", { headers });
    }
    if (url.pathname == "/me") {
      return new Response(sessionId, { headers });
    }

    return new Response("Not found", { headers, status: 404 });
  },
  websocket: {
    open(ws) {
      const { sessionId } = ws.data;

      if (sessionControllableEntities.has(sessionId)) {
        // no need to add player
        return;
      }

      const player = new Player(sessionId);
      game.addEntity(player);
      sessionControllableEntities.set(sessionId, new Set(player.id));

      messagePublisher.addMessage({
        type: MessageType.NEW_ENTITY,
        body: {
          entityName: EntityNames.Player,
          args: { playerId: sessionId },
        },
      });

      ws.subscribe(GAME_TOPIC);
    },
    message(ws, message) {
      if (typeof message == "string") {
        const receivedMessage = parse<ServerMessage>(message);
        receivedMessage.sessionData = ws.data;

        messageReceiver.addMessage(receivedMessage);
      }
    },
    close(_ws) {},
  },
});

messagePublisher.setServer(server);

[
  new Physics(),
  new Collision(new Grid()),
  new WallBounds(Miscellaneous.WIDTH),
  new NetworkUpdate(messageReceiver, messagePublisher, messageProcessor),
].forEach((system) => game.addSystem(system));

game.start();
setInterval(() => {
  game.doGameLoop(performance.now());
}, SERVER_TICK_RATE);

console.log(`Listening on ${server.hostname}:${server.port}`);
