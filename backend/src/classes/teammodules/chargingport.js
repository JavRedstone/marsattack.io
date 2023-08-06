/**
 * @author Javier Huang
 */

import Vector from 'vector2js';

export class ChargingPort {
    static MAX_HEALTH = 1500;
    static RADIUS = 100;
    static CHARGING_RATE = 10;
    static SCORE_GIVEN = 5;

    id = '';
    team = 0;
    group = 'teammodules';
    type = 'chargingport';
    originalPosition = Vector.zero;
    position = Vector.zero;
    rotation = Vector.zero;
    health = ChargingPort.MAX_HEALTH;
    radius = ChargingPort.RADIUS;
    disabled = false;
    chargingRate = ChargingPort.CHARGING_RATE;
    scoreGiven = ChargingPort.SCORE_GIVEN;
   
    constructor(id, team, position, rotation) {
        this.id = id;
        this.team = team;
        this.group = 'teammodules';
        this.type = 'chargingport';
        this.originalPosition = position;
        this.position = position;
        this.rotation = rotation;
        this.health = ChargingPort.MAX_HEALTH;
        this.radius = ChargingPort.RADIUS;
        this.disabled = false;
        this.chargingRate = ChargingPort.CHARGING_RATE;
        this.scoreGiven = ChargingPort.SCORE_GIVEN;
    }

    upgradeSelf(upgrades) {
        this.health = ChargingPort.MAX_HEALTH * upgrades.healthMultiplier;
        this.maxHealth = ChargingPort.MAX_HEALTH * upgrades.healthMultiplier;
    }
}