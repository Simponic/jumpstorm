import { Grid } from '@engine/structures';
import {
  ServerMessageProcessor,
  ServerSocketMessagePublisher,
  ServerSocketMessageReceiver,
  MemorySessionManager,
  SessionInputSystem
} from './network';
import { Collision, NetworkUpdate, Physics, WallBounds } from '@engine/systems';
import { Game } from '@engine/Game';
import { Constants } from './constants';
import { GameServer } from './server';
import { Floor } from '@engine/entities';
import { BoundingBox } from '@engine/components';
import { Miscellaneous } from '@engine/config';

const game = new Game();

const sessionManager = new MemorySessionManager();

const messageReceiver = new ServerSocketMessageReceiver();
const messagePublisher = new ServerSocketMessagePublisher();
const messageProcessor = new ServerMessageProcessor(game, sessionManager);

const server = new GameServer(
  game,
  messageReceiver,
  messagePublisher,
  sessionManager
);

[
  new Physics(),
  new SessionInputSystem(sessionManager),
  new NetworkUpdate(messageReceiver, messagePublisher, messageProcessor),
  new Collision(new Grid()),
  new WallBounds()
].forEach((system) => game.addSystem(system));

const floor = new Floor(160);
const floorHeight = 200;

floor.addComponent(
  new BoundingBox(
    {
      x: Miscellaneous.WIDTH / 2,
      y: Miscellaneous.HEIGHT - floorHeight / 2
    },
    { width: Miscellaneous.WIDTH / 2, height: floorHeight }
  )
);
game.addEntity(floor);

game.start();
setInterval(() => {
  game.doGameLoop(performance.now());
}, Constants.SERVER_TICK_RATE);

server.serve();
