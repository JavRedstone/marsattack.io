/**
 * @author Javier Huang
 */

import Vector from 'vector2js';

export class RTG {
    static MAX_HEALTH = 5000;
    static RADIUS = 150;
    static BATTERY_GAIN_RATE = 2.5;

    id = '';
    team = 0;
    group = 'teammodules';
    type = 'rtg';
    originalPosition = Vector.zero;
    position = Vector.zero;
    rotation = Vector.zero;
    health = RTG.MAX_HEALTH;
    maxHealth = RTG.MAX_HEALTH;
    radius = RTG.RADIUS;
    disabled = false;
    batteryGainRate = RTG.BATTERY_GAIN_RATE;
   
    constructor(id, team, position, rotation) {
        this.id = id;
        this.team = team;
        this.group = 'teammodules';
        this.type = 'rtg';
        this.originalPosition = position;
        this.position = position;
        this.rotation = rotation;
        this.health = RTG.MAX_HEALTH;
        this.maxHealth = RTG.MAX_HEALTH;
        this.radius = RTG.RADIUS;
        this.disabled = false;
        this.batteryGainRate = RTG.BATTERY_GAIN_RATE;
    }
    
    upgradeSelf(upgrades) {
        this.health = RTG.MAX_HEALTH * upgrades.healthMultiplier;
        this.maxHealth = RTG.MAX_HEALTH * upgrades.healthMultiplier;
    }
}