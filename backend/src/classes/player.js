/**
 * @author Javier Huang
 */

import Vector from 'vector2js'
import { degToRad } from '../utils/mathutils';

export class Player {
    static RADIUS = 25;
    static REGENERATION = 5;
    static MAX_SPEED = 2500;
    static ACCELERATION = 2500;
    static MAX_HEALTH = 150;
    static MAX_RESOURCES = 100;
    static MAX_BATTERY = 100;
    static BATTERY_GAIN_RATE = 3.5;
    static BATTERY_LOSS_RATE = 3;
    static BULLET_STATS = [
        {
            position: new Vector(-20, 20),
            velocity: new Vector(0, 1000),
            damage: 5,
            rotation: degToRad(0)
        },
        {
            position: new Vector(20, 20),
            velocity: new Vector(0, 1000),
            damage: 5,
            rotation: degToRad(0)
        }
    ];
    static UPGRADES = [
        [
            {
                name: 'Bullet Combo Level 1',
                radiusMultiplier: 1.5,
                resourceMultiplier: 1.5,

                bulletDamageMultiplier: 2,
                bulletVelocityMultiplier: 2,
                shootingCooldownMultiplier: 0.95,
                healthMultiplier: 1,
                regenerationMultiplier: 1,
                batteryMultiplier: 1,
                batteryGainRateMultiplier: 1,
                batteryLossRateMultiplier: 1,
                maxSpeedMultiplier: 1,
                accelerationMultiplier: 1
            },
            {
                name: 'Rover Combo Level 1',
                radiusMultiplier: 1.5,
                resourceMultiplier: 1.5,

                bulletDamageMultiplier: 1,
                bulletVelocityMultiplier: 1,
                shootingCooldownMultiplier: 1,
                healthMultiplier: 1.5,
                regenerationMultiplier: 1.5,
                batteryMultiplier: 1.5,
                batteryGainRateMultiplier: 1.5,
                batteryLossRateMultiplier: 0.75,
                maxSpeedMultiplier: 1.25,
                accelerationMultiplier: 1.5
            }
        ],
        [
            {
                name: 'Bullet Combo Level 2',
                radiusMultiplier: 2,
                resourceMultiplier: 2,

                bulletDamageMultiplier: 3,
                bulletVelocityMultiplier: 3,
                shootingCooldownMultiplier: 0.85,
                healthMultiplier: 1,
                regenerationMultiplier: 1,
                batteryMultiplier: 1,
                batteryGainRateMultiplier: 1,
                batteryLossRateMultiplier: 1,
                maxSpeedMultiplier: 1,
                accelerationMultiplier: 1
            },
            {
                name: 'Rover Combo Level 2',
                radiusMultiplier: 2,
                resourceMultiplier: 2,

                bulletDamageMultiplier: 1,
                bulletVelocityMultiplier: 1,
                shootingCooldownMultiplier: 1,
                healthMultiplier: 2,
                regenerationMultiplier: 2,
                batteryMultiplier: 2,
                batteryGainRateMultiplier: 2,
                batteryLossRateMultiplier: 0.5,
                maxSpeedMultiplier: 1.5,
                accelerationMultiplier: 2
            }
        ],
        [
            {
                name: 'Bullet Combo Level 3',
                radiusMultiplier: 3,
                resourceMultiplier: 3,

                bulletDamageMultiplier: 4,
                bulletVelocityMultiplier: 4,
                shootingCooldownMultiplier: 0.75,
                healthMultiplier: 1,
                regenerationMultiplier: 1,
                batteryMultiplier: 1,
                batteryGainRateMultiplier: 1,
                batteryLossRateMultiplier: 1,
                maxSpeedMultiplier: 1,
                accelerationMultiplier: 1
            },
            {
                name: 'Rover Combo Level 3',
                radiusMultiplier: 3,
                resourceMultiplier: 3,

                bulletDamageMultiplier: 1,
                bulletVelocityMultiplier: 1,
                shootingCooldownMultiplier: 1,
                healthMultiplier: 4,
                regenerationMultiplier: 4,
                batteryMultiplier: 4,
                batteryGainRateMultiplier: 3,
                batteryLossRateMultiplier: 0.25,
                maxSpeedMultiplier: 2,
                accelerationMultiplier: 2.5
            }
        ]
    ];
    static MAX_SHOOTING_COOLDOWN = 0.15;
    id = '';
    name = '';
    level = 1;
    team = 0;
    position = Vector.zero;
    velocity = Vector.zero;
    rotation = 0;
    maxSpeed = Player.MAX_SPEED;
    acceleration = Player.ACCELERATION;
    bulletStats = Player.BULLET_STATS
    score = 0;
    radius = Player.RADIUS;
    resources = 0;
    maxResources = Player.MAX_RESOURCES;
    health = Player.MAX_HEALTH;
    maxHealth = Player.MAX_HEALTH;
    battery = Player.MAX_BATTERY;
    batteryGainRate = Player.BATTERY_GAIN_RATE;
    batteryLossRate = Player.BATTERY_LOSS_RATE;
    maxBattery = Player.MAX_BATTERY;
    gameOver = false;
    gameWin = false;
    shooting = false;
    shootingCooldown = Player.MAX_SHOOTING_COOLDOWN;
    maxShootingCooldown = Player.MAX_SHOOTING_COOLDOWN;
    numKills = 0;
    numDeaths = 0;
    upgraded = false;
    upgrades = Player.UPGRADES;
    selectedUpgrades = [];

    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.level = 1;
        this.team = 0;
        this.position = Vector.zero;
        this.velocity = Vector.zero;
        this.rotation = 0;
        this.maxSpeed = Player.MAX_SPEED;
        this.acceleration = Player.ACCELERATION;
        this.score = 0;
        this.radius = Player.RADIUS;
        this.bulletStats = Player.BULLET_STATS;
        this.resources = 0;
        this.maxResources = Player.MAX_RESOURCES;
        this.regeneration = Player.REGENERATION;
        this.health = Player.MAX_HEALTH;
        this.maxHealth = Player.MAX_HEALTH;
        this.battery = Player.MAX_BATTERY;
        this.batteryGainRate = Player.BATTERY_GAIN_RATE;
        this.batteryLossRate = Player.BATTERY_LOSS_RATE;
        this.maxBattery = Player.MAX_BATTERY;
        this.gameOver = false;
        this.gameWin = false;
        this.shooting = false;
        this.shootingCooldown = 0;
        this.maxShootingCooldown = Player.MAX_SHOOTING_COOLDOWN;
        this.numKills = 0;
        this.numDeaths = 0;
        this.upgraded = false;
        this.upgrades = Player.UPGRADES;
        this.selectedUpgrades = [];
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            level: this.level,
            team: this.team,
            position: this.position,
            rotation: this.rotation,
            maxSpeed: this.maxSpeed,
            bulletStats: this.bulletStats,
            score: this.score,
            radius: this.radius,
            resources: this.resources,
            maxResources: this.maxResources,
            health: this.health,
            maxHealth: this.maxHealth,
            battery: this.battery,
            maxBattery: this.maxBattery,
            gameOver: this.gameOver,
            gameWin: this.gameWin,
            shooting: this.shooting,
            numKills: this.numKills,
            numDeaths: this.numDeaths,
            upgrades: this.upgrades
        }
    }

    upgradeSelf(idx) {
        if (this.level < 4) {
            let upgrade = this.upgrades[this.level - 1][idx];
            this.level++;
            this.selectedUpgrades.push(upgrade);
            
            this.radius = Player.RADIUS * upgrade.radiusMultiplier;
            this.resources = 0;
            this.maxResources = Player.MAX_RESOURCES * upgrade.resourceMultiplier;

            this.maxSpeed = Player.MAX_SPEED * upgrade.maxSpeedMultiplier;
            this.acceleration = Player.ACCELERATION * upgrade.accelerationMultiplier;
            let newBulletStats = JSON.parse(JSON.stringify(Player.BULLET_STATS));
            for (let bulletStat of newBulletStats) {
                bulletStat.position = new Vector(bulletStat.position.x, bulletStat.position.y).mulScalar(upgrade.radiusMultiplier);

                bulletStat.damage *= upgrade.bulletDamageMultiplier;
                bulletStat.velocity = new Vector(bulletStat.velocity.x, bulletStat.velocity.y).mulScalar(upgrade.bulletVelocityMultiplier);
            }
            // I wont reset shooting cooldown
            this.maxShootingCooldown = Player.MAX_SHOOTING_COOLDOWN * upgrade.shootingCooldownMultiplier;
            this.bulletStats = newBulletStats;
            this.regeneration = Player.REGENERATION * upgrade.regenerationMultiplier;
            this.health = Player.MAX_HEALTH * upgrade.healthMultiplier;
            this.maxHealth = Player.MAX_HEALTH * upgrade.healthMultiplier;
            this.battery = Player.MAX_BATTERY * upgrade.batteryMultiplier;
            this.batteryGainRate = Player.BATTERY_GAIN_RATE * upgrade.batteryGainRateMultiplier;
            this.batteryLossRate = Player.BATTERY_LOSS_RATE * upgrade.batteryLossRateMultiplier;
            this.maxBattery = Player.MAX_BATTERY * upgrade.batteryMultiplier;
        }
    }
}