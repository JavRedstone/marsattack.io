/**
 * @author Javier Huang
 */

export function randRange(min, max, isOnlyInteger) {
    if (isOnlyInteger) {
        return Math.floor(min + Math.random() * (max - min + 1)); // inclusive
    }
    else {
        return min + Math.random() * (max - min + 1); // inclusive
    }
}

export function randElement(array) {
    return array[randRange(0, array.length - 1, true)];
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function degToRad(value) {
    return value * Math.PI / 180;
}

export function radToDeg(value) {
    return value * 180 / Math.PI;
}

export function isColliding(body1, body2) {
    if (body1.radius == null) { // solar panel cannot be destroyed
        return body2.position.x >= body1.position.x - body1.dimensions.width / 2 && body2.position.x <= body1.position.x + body1.dimensions.width / 2 && body2.position.y >= body1.position.y - body1.dimensions.width / 2 && body2.position.y <= body1.position.y + body1.dimensions.width / 2;
    }
    else {
        return (body1.position.sub(body2.position)).length() <= body1.radius + body2.radius;
    }
}

export function getFrictionVelocity(velocity, coefficient) {
    return velocity.add(velocity.invert().mulScalar(coefficient));
}

export function getTimeElapsed(startTime, conversion = 'milliseconds') {
    let endTime = new Date();
    var timeDiff = endTime - startTime; //in ms
    if (conversion == 'microseconds') {
        timeDiff /= 0.001;
    }
    else if (conversion == 'milliseconds') {
        timeDiff /= 1;
    }
    else if (conversion == 'seconds') {
        timeDiff /= 1000;
    }
    else if (conversion == 'minutes') {
        timeDiff /= 60000;
    }
    else if (conversion == 'hours') {
        timeDiff /= 360000;
    }
    return timeDiff;
}
