/**
 * @author Javier Huang
 */

import { Room } from '../classes/room';

import { removeElementFrom } from '../utils/arrayutils';
import { randRange } from '../utils/mathutils';

export function joinRoom(socket, rooms) {
  for (let room of rooms) {
    let roomPlayerCount = 0;
    for (let team of room.teams) {
      roomPlayerCount += team.players.length;
    }
    if (roomPlayerCount < Room.MAX_ROOM_SIZE) {
      socket.join(room.roomId);
      socket.room = room;
      room.joinRoom(socket);
      return room;
    }
  }
  let roomId = generateRoomId(rooms);
  let newRoom = new Room(roomId);
  rooms.push(newRoom);
  socket.join(roomId);
  socket.room = newRoom;
  newRoom.joinRoom(socket);
  return newRoom;
}

export function leaveRoom(socket, rooms, io) {
  if (socket.room != null && socket.room.leaveRoom(socket, io)) { // returns if the room can close after this player disconnects
    removeElementFrom(rooms, socket.room);
  }
}

export function generateRoomId(rooms) {
  let roomId = 0;
  do {
    roomId = randRange(1000, 9999, true); // random 4 digit number
  } while (hasRoomId(roomId, rooms)); // i have to do this to prevent iterating through my list and finding the id
  return roomId;
}

export function hasRoomId(roomId, rooms) {
  for (let room of rooms) {
    if (room.roomId == roomId) {
      return true;
    }
  }
  return false;
}