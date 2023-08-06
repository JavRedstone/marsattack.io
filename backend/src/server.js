/**
 * @author Javier Huang
 */

import express from 'express';
const app = express();

import { createServer } from 'http';

const server = createServer(app);
import { Server } from 'socket.io';

import { moveToMouse, shoot, turnToMouse } from './helpers/playerhelper';

import { messageLog } from './utils/logutils';
import { joinRoom, leaveRoom } from './helpers/roomhelper';

import { Player } from './classes/player';
import { SIGNALS } from './constants/signalconstants';
import { removeElementFrom } from './utils/arrayutils';

const io = new Server(server, {
  cors: {
    origins: ['*']
  }
});

const PORT = 3000;
const TPS = 60;

let rooms = [];

app.get('/', (req, res) => {
  res.send('<h1>Welcome to the MarsAttack.io Backend. Nothing to see here though.</h1>');
});

io.on('connection', (socket) => {
  messageLog('Websocket connected with id ' + socket.id);

  socket.on(SIGNALS.USER_JOIN, (data) => {
    messageLog('New player: ' + data.name);
    socket.player = new Player(socket.id, data.name);
    let room = joinRoom(socket, rooms);
    messageLog('Player with id ' + socket.id + ' and name ' + data.name + ' joined room ' + room.roomId);
  });

  socket.on(SIGNALS.CLIENT_UPDATE, (data) => {
    if (socket.player != null) {
      socket.player = moveToMouse(data, socket);
      socket.player = turnToMouse(data, socket);
      socket.player = shoot(data, socket);
    }
  });

  socket.on(SIGNALS.CLIENT_UPGRADE, (idx) => {
    socket.player.upgradeSelf(idx);
  });

  socket.on('disconnect', () => {
    messageLog('Websocket disconnected with id ' + socket.id);
    leaveRoom(socket, rooms, io);
  });
});

server.listen(PORT, () => {
  messageLog(`Server is running on port ${PORT}`);
});

const gameLoopInterval = 1000 / TPS; // TPS times a second
setInterval(updateGameState, gameLoopInterval);

function updateGameState() {
  for (let room of rooms) {
    if (!room.died) {
      room.updateGameState(io, 1/TPS); // next tick
      io.to(room.roomId).emit(SIGNALS.SERVER_UPDATE, {
        game: room.toJSON()
      });
    }
    else {
      removeElementFrom(rooms, room);
    }
  }
}