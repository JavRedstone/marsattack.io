/**
 * @author Javier Huang
 */

import Vector from 'vector2js';

export class ResourcePort {
    static MAX_HEALTH = 1500;
    static RADIUS = 100;
    static RESOURCE_RATE = 15;
    static SCORE_GIVEN = 7;

    id = '';
    team = 0;
    group = 'teammodules';
    type = 'resourceport';
    originalPosition = Vector.zero;
    position = Vector.zero;
    rotation = Vector.zero;
    health = ResourcePort.MAX_HEALTH;
    maxHealth = ResourcePort.MAX_HEALTH;
    radius = ResourcePort.RADIUS;
    disabled = false;
    resourceRate = ResourcePort.RESOURCE_RATE;
    scoreGiven = ResourcePort.SCORE_GIVEN;
   
    constructor(id, team, position, rotation) {
        this.id = id;
        this.team = team;
        this.group = 'teammodules';
        this.type = 'resourceport';
        this.originalPosition = position;
        this.position = position;
        this.rotation = rotation;
        this.health = ResourcePort.MAX_HEALTH;
        this.maxHealth = ResourcePort.MAX_HEALTH;
        this.radius = ResourcePort.RADIUS;
        this.disabled = false;
        this.resourceRate = ResourcePort.RESOURCE_RATE;
        this.scoreGiven = ResourcePort.SCORE_GIVEN;
    }

    upgradeSelf(upgrades) {
        this.health = ResourcePort.MAX_HEALTH * upgrades.healthMultiplier;
        this.maxHealth = ResourcePort.MAX_HEALTH * upgrades.healthMultiplier;
    }
}