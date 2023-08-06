/**
 * @author Javier Huang
 */

import Vector from 'vector2js';

export class Rock {
    static PLAYER_DAMAGE = 25;

    id = 0;
    room = null;
    position = Vector.zero;
    velocity = Vector.zero;
    rotation = 0;
    radius = 0;
    health = 0;
    maxHealth = 0;
    playerDamage = Rock.PLAYER_DAMAGE;
    resourcesGiven = 0;
    scoreGiven = 0;

    constructor(id, position, velocity, rotation, radius) {
        this.id = id;
        this.position = position;
        this.velocity = velocity;
        this.rotation = rotation;
        this.radius = radius;
        this.health = radius * 5; // health dependent on size
        this.maxHealth = this.health;
        this.playerDamage = Rock.PLAYER_DAMAGE;
        this.resourcesGiven = Math.round(radius / 2); // resources dependent on size
        this.scoreGiven = Math.round(radius * 5); // score dependent on size
    }
}