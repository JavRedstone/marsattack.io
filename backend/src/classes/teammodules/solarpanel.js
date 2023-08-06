/**
 * @author Javier Huang
 */

import Vector from 'vector2js';

export class SolarPanel {
    static MAX_HEALTH = 1000;
    static DIMENSIONS = {
        width: 200,
        height: 200
    };
    static BATTERY_GAIN_RATE = 1;

    id = '';
    team = 0;
    group = 'teammodules';
    type = 'solarpanel';
    originalPosition = Vector.zero;
    position = Vector.zero;
    rotation = Vector.zero;
    health = SolarPanel.MAX_HEALTH;
    maxHealth = SolarPanel.MAX_HEALTH;
    dimensions = SolarPanel.DIMENSIONS;
    disabled = false;
    batteryGainRate = SolarPanel.BATTERY_GAIN_RATE;
   
    constructor(id, team, position, rotation) {
        this.id = id;
        this.team = team;
        this.group = 'teammodules';
        this.type = 'solarpanel';
        this.originalPosition = position;
        this.position = position;
        this.rotation = rotation;
        this.health = SolarPanel.MAX_HEALTH;
        this.maxHealth = SolarPanel.MAX_HEALTH;
        this.dimensions = SolarPanel.DIMENSIONS;
        this.disabled = false;
        this.batteryGainRate = SolarPanel.BATTERY_GAIN_RATE;
    }
    
    upgradeSelf(upgrades) {
        this.health = SolarPanel.MAX_HEALTH * upgrades.healthMultiplier;
        this.maxHealth = SolarPanel.MAX_HEALTH * upgrades.healthMultiplier;
    }
}