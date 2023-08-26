import { Grid } from '@engine/structures';
import {
  ServerMessageProcessor,
  ServerSocketMessagePublisher,
  ServerSocketMessageReceiver
} from './network';
import { Collision, NetworkUpdate, Physics, WallBounds } from '@engine/systems';
import { Game } from '@engine/Game';
import { Constants } from './constants';
import { GameServer } from './server';

const messageReceiver = new ServerSocketMessageReceiver();
const messagePublisher = new ServerSocketMessagePublisher();
const messageProcessor = new ServerMessageProcessor();

const game = new Game();

const server = new GameServer(game, messageReceiver, messagePublisher);

[
  new Physics(),
  new Collision(new Grid()),
  new WallBounds(),
  new NetworkUpdate(messageReceiver, messagePublisher, messageProcessor)
].forEach((system) => game.addSystem(system));

game.start();
setInterval(() => {
  game.doGameLoop(performance.now());
}, Constants.SERVER_TICK_RATE);

server.serve();
