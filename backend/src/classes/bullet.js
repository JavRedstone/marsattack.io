/**
 * @author Javier Huang
 */

import Vector from 'vector2js';

export class Bullet {
    id = 0;
    position = Vector.zero;
    velocity = Vector.zero;
    rotation = Vector.zero;
    damage = 0;
    radius = 0;
    shooter = null;
    explosionTimer = 1; // second

    constructor(id, position, velocity, rotation, damage, shooter) {
        this.id = id;
        this.position = position;
        this.velocity = velocity;
        this.rotation = rotation;
        this.damage = damage;
        this.radius = damage; // size of bullet depends on dmg
        this.shooter = shooter;
        this.explosionTimer = 1;
    }

    toJSON() {
        return {
            id: this.id,
            position: this.position,
            velocity: this.velocity,
            rotation: this.rotation,
            radius: this.radius
        }
    }
}