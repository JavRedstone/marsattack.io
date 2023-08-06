/**
 * @author Javier Huang
 */

import Vector from "vector2js";
import { SIGNALS } from "../constants/signalconstants";

// function assumes mouse origin is in the center of the screen. Frontend will adjust for that.
export function moveToMouse(data, socket) {
    if (data.moving) {
        if (socket.player.battery <= 0) {
            socket.emit(SIGNALS.CLIENT_MESSAGE, "You're out of battery!")
        }
        else {
            if (socket.player.velocity.length() < socket.player.maxSpeed) {
                let appliedAcceleration = new Vector(data.x, data.y).normalize().mulScalarSelf(socket.player.acceleration);
                socket.player.velocity.addSelf(appliedAcceleration);     
            }
        }
    }
    return socket.player;
}

// function assumes mouse origin is in the center of the screen. Frontend will adjust for that.
export function turnToMouse(data, socket) {
    if (socket.player.battery <= 0) {
        socket.emit(SIGNALS.CLIENT_MESSAGE, "You're out of battery!")
    }
    else {
        let rotation = Math.atan2(data.y, data.x);
        socket.player.rotation = rotation;
    }
    return socket.player;
}

export function shoot(data, socket) {
    socket.player.shooting = data.shooting;
    return socket.player;
}