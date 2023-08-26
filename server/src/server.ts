import { Game } from '@engine/Game';
import { Player } from '@engine/entities';
import { Message, MessageType } from '@engine/network';
import { Constants } from './constants';
import {
  ServerSocketMessageReceiver,
  ServerSocketMessagePublisher,
  SessionData,
  ServerMessage,
  Session,
  SessionManager
} from './network';
import { parse } from '@engine/utils';
import { Server, ServerWebSocket } from 'bun';
import { Input } from '@engine/systems';
import { Control, NetworkUpdateable } from '@engine/components';
import { stringify } from '@engine/utils';

export class GameServer {
  private server?: Server;
  private game: Game;
  private messageReceiver: ServerSocketMessageReceiver;
  private messagePublisher: ServerSocketMessagePublisher;
  private sessionManager: SessionManager;

  constructor(
    game: Game,
    messageReceiver: ServerSocketMessageReceiver,
    messagePublisher: ServerSocketMessagePublisher,
    sessionManager: SessionManager
  ) {
    this.game = game;
    this.messageReceiver = messageReceiver;
    this.messagePublisher = messagePublisher;
    this.sessionManager = sessionManager;
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

    const sessionEntities =
      this.sessionManager.getSession(sessionId)!.controllableEntities;
    this.sessionManager.removeSession(sessionId);

    if (!sessionEntities) return;
    sessionEntities.forEach((id) => this.game.removeEntity(id));

    this.messagePublisher.addMessage({
      type: MessageType.REMOVE_ENTITIES,
      body: Array.from(sessionEntities)
    });
  }

  private openWebsocket(websocket: ServerWebSocket<SessionData>) {
    websocket.subscribe(Constants.GAME_TOPIC);

    const { sessionId } = websocket.data;
    if (this.sessionManager.getSession(sessionId)) {
      return;
    }

    const newSession: Session = {
      sessionId,
      controllableEntities: new Set(),
      inputSystem: new Input(sessionId)
    };

    const player = new Player();
    player.addComponent(new Control(sessionId));
    player.addComponent(new NetworkUpdateable());
    this.game.addEntity(player);

    newSession.controllableEntities.add(player.id);
    this.sessionManager.putSession(sessionId, newSession);

    const addCurrentEntities: Message[] = [
      {
        type: MessageType.NEW_ENTITIES,
        body: Array.from(this.game.entities.values())
          .filter((entity) => entity.id != player.id)
          .map((entity) => {
            return {
              id: entity.id,
              entityName: entity.name,
              args: entity.serialize()
            };
          })
      }
    ];
    websocket.sendText(stringify(addCurrentEntities));

    const addNewPlayer: Message = {
      type: MessageType.NEW_ENTITIES,
      body: [
        {
          id: player.id,
          entityName: player.name,
          args: player.serialize()
        }
      ]
    };
    this.messagePublisher.addMessage(addNewPlayer);
  }

  private fetchHandler(req: Request, server: Server): Response {
    const url = new URL(req.url);

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');

    if (url.pathname == '/assign') {
      if (this.sessionManager.numSessions() > Constants.MAX_PLAYERS)
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
