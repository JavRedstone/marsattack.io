/**
 * @author Javier Huang
 */

import Vector from 'vector2js';

export class Base {
    static REGENERATION = 20;
    static MAX_HEALTH = 10000;
    static RADIUS = 250;

    id = 0;
    team = 0;
    group = 'teammodules';
    type = 'base';
    originalPosition = Vector.zero;
    position = Vector.zero;
    rotation = Vector.zero;
    regeneration = Base.REGENERATION;
    health = Base.MAX_HEALTH;
    maxHealth = Base.MAX_HEALTH;
    radius = Base.RADIUS;
    disabled = false;
   
    constructor(id, team, position, rotation) {
        this.id = id;
        this.team = team;
        this.group = 'teammodules';
        this.type = 'base';
        this.originalPosition = position;
        this.position = position;
        this.rotation = rotation;
        this.regeneration = Base.REGENERATION;
        this.health = Base.MAX_HEALTH;
        this.maxHealth = Base.MAX_HEALTH;
        this.radius = Base.RADIUS;
        this.disabled = false;
    }

    upgradeSelf(upgrades) {
        this.health = Base.MAX_HEALTH * upgrades.healthMultiplier;
        this.maxHealth = Base.MAX_HEALTH * upgrades.healthMultiplier;
    }
}