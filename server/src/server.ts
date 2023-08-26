import { Game } from '@engine/Game';
import { EntityNames, Player } from '@engine/entities';
import { MessageType } from '@engine/network';
import { Constants } from './constants';
import {
  ServerSocketMessageReceiver,
  ServerSocketMessagePublisher,
  SessionData,
  ServerMessage,
  Session
} from './network';
import { parse } from '@engine/utils';
import { Server, ServerWebSocket } from 'bun';

export class GameServer {
  private sessions: Map<string, Session>;

  private server?: Server;
  private game: Game;
  private messageReceiver: ServerSocketMessageReceiver;
  private messagePublisher: ServerSocketMessagePublisher;

  constructor(
    game: Game,
    messageReceiver: ServerSocketMessageReceiver,
    messagePublisher: ServerSocketMessagePublisher
  ) {
    this.sessions = new Map();

    this.game = game;
    this.messageReceiver = messageReceiver;
    this.messagePublisher = messagePublisher;
  }

  public serve() {
    if (!this.server)
      this.server = Bun.serve<SessionData>({
        port: Constants.SERVER_PORT,
        fetch: (req, srv) => this.fetchHandler(req, srv),
        websocket: {
          open: (ws) => this.openWebsocket(ws),
          message: (ws, msg) => this.websocketMessage(ws, msg),
          close: (ws) => this.closeWebsocket(ws)
        }
      });

    this.messagePublisher.setServer(this.server);

    console.log(`Listening on ${this.server.hostname}:${this.server.port}`);
  }

  private websocketMessage(
    websocket: ServerWebSocket<SessionData>,
    message: string | Uint8Array
  ) {
    if (typeof message == 'string') {
      const receivedMessage = parse<ServerMessage>(message);
      receivedMessage.sessionData = websocket.data;

      this.messageReceiver.addMessage(receivedMessage);
    }
  }

  private closeWebsocket(websocket: ServerWebSocket<SessionData>) {
    const { sessionId } = websocket.data;

    const sessionEntities = this.sessions.get(sessionId)!.controllableEntities;

    this.sessions.delete(sessionId);

    if (!sessionEntities) return;
    this.messagePublisher.addMessage({
      type: MessageType.REMOVE_ENTITIES,
      body: Array.from(sessionEntities)
    });
  }

  private openWebsocket(websocket: ServerWebSocket<SessionData>) {
    websocket.subscribe(Constants.GAME_TOPIC);

    const { sessionId } = websocket.data;
    if (this.sessions.has(sessionId)) {
      return;
    }

    this.sessions.set(sessionId, {
      sessionId,
      controllableEntities: new Set()
    });

    const player = new Player(sessionId);
    this.game.addEntity(player);
    this.messagePublisher.addMessage({
      type: MessageType.NEW_ENTITIES,
      body: [
        {
          entityName: EntityNames.Player,
          args: { playerId: sessionId, id: player.id }
        }
      ]
    });

    this.sessions.get(sessionId)!.controllableEntities.add(player.id);
  }

  private fetchHandler(
    req: Request,
    server: Server
  ): Promise<Response> | Response {
    const url = new URL(req.url);

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');

    if (url.pathname == '/assign') {
      if (this.sessions.size > Constants.MAX_PLAYERS)
        return new Response('too many players', { headers, status: 400 });

      const sessionId = crypto.randomUUID();
      headers.set('Set-Cookie', `SessionId=${sessionId};`);

      return new Response(sessionId, { headers });
    }

    const cookie = req.headers.get('cookie');
    if (!cookie) {
      return new Response('No session', { headers, status: 401 });
    }

    const sessionId = cookie.split(';').at(0)!.split('SessionId=').at(1);

    if (url.pathname == '/game') {
      headers.set(
        'Set-Cookie',
        `SessionId=${sessionId}; HttpOnly; SameSite=Strict;`
      );
      server.upgrade(req, {
        headers,
        data: {
          sessionId
        }
      });

      return new Response('upgraded to ws', { headers });
    }

    if (url.pathname == '/me') {
      return new Response(sessionId, { headers });
    }

    return new Response('Not found', { headers, status: 404 });
  }
}
