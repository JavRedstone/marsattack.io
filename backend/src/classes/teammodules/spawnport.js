/**
 * @author Javier Huang
 */

import Vector from 'vector2js';

export class SpawnPort {
    static MAX_HEALTH = 1500;
    static RADIUS = 100;

    id = '';
    team = 0;
    group = 'teammodules';
    type = 'spawnport';
    originalPosition = Vector.zero;
    position = Vector.zero;
    rotation = Vector.zero;
    health = SpawnPort.MAX_HEALTH;
    maxHealth = SpawnPort.MAX_HEALTH;
    radius = SpawnPort.RADIUS;
    disabled = false;
   
    constructor(id, team, position, rotation) {
        this.id = id;
        this.team = team;
        this.group = 'teammodules';
        this.type = 'spawnport';
        this.originalPosition = position;
        this.position = position;
        this.rotation = rotation;
        this.health = SpawnPort.MAX_HEALTH;
        this.maxHealth = SpawnPort.MAX_HEALTH;
        this.radius = SpawnPort.RADIUS;
        this.disabled = false;
    }
    
    upgradeSelf(upgrades) {
        this.health = SpawnPort.MAX_HEALTH * upgrades.healthMultiplier;
        this.maxHealth = SpawnPort.MAX_HEALTH * upgrades.healthMultiplier;
    }
}