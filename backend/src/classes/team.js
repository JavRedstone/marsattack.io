/**
 * @author Javier Huang
 */

import Vector from 'vector2js';
import { Base } from './teammodules/base';
import { SpawnPort } from './teammodules/spawnport';
import { ChargingPort } from './teammodules/chargingport';
import { ResourcePort } from './teammodules/resourceport';
import { SolarPanel } from './teammodules/solarpanel';
import { RTG } from './teammodules/rtg';
import { clamp, degToRad, getFrictionVelocity as getFrictionVelocity, isColliding } from '../utils/mathutils';
import { SIGNALS } from '../constants/signalconstants';
export class Team {
    static COLORS = [
        ['red', 'blue'],
        ['green', 'purple']
    ];
    static UPGRADES = [
        {
            maxBattery: 500,
            maxResources: 250,
            healthMultiplier: 1
        },
        {
            maxBattery: 750,
            maxResources: 500,
            healthMultiplier: 1.5
        },
        {
            maxBattery: 1000,
            maxResources: 1000,
            healthMultiplier: 2
        },
        {
            maxBattery: 1250,
            maxResources: 1500,
            healthMultiplier: 2.5
        }
    ];

    team = 0;
    players = [];
    base = null;
    modules = [];
    level = 1;
    color = Team.COLORS[0][0];
    baseLocation = Vector.zero;
    spawnLocations = [];
    battery = Team.UPGRADES[0].maxBattery;
    maxBattery = Team.UPGRADES[0].maxBattery;
    resources = 0;
    maxResources = Team.UPGRADES[0].maxResources;
    upgrades = Team.UPGRADES;
    dead = false;
    isDay = false;

    constructor(team, baseLocation, colorChoice) {
        this.team = team;
        this.players = [];
        this.level = 1;
        this.baseLocation = baseLocation;
        this.color = Team.COLORS[colorChoice][team];
        this.spawnLocations = [];
        this.battery = Team.UPGRADES[0].maxBattery;
        this.maxBattery = Team.UPGRADES[0].maxBattery;
        this.resources = 0;
        this.maxResources = Team.UPGRADES[0].maxResources;
        this.upgrades = Team.UPGRADES;
        this.dead = false;
        this.isDay = false;

        this.base = new Base('base' + this.team, this.team, this.baseLocation, degToRad(0));
        this.modules = [
            new SpawnPort(
                'spawnport0' + this.team,
                this.team,
                new Vector(this.baseLocation.x - 500, this.baseLocation.y),
                degToRad(0)
            ),
            new SpawnPort(
                'spawnport1' + this.team,
                this.team,
                new Vector(this.baseLocation.x + 500, this.baseLocation.y),
                degToRad(0)
            ),
            new ChargingPort(
                'chargingport0' + this.team,
                this.team,
                new Vector(this.baseLocation.x, this.baseLocation.y - 500,),
                degToRad(0)
            ),
            new ResourcePort(
                'resourceport0' + this.team,
                this.team,
                new Vector(this.baseLocation.x, this.baseLocation.y + 500,),
                degToRad(0)
            ),
            new SolarPanel(
                'solarpanel0' + this.team,
                this.team,
                new Vector(this.baseLocation.x - 500, this.baseLocation.y - 500,),
                degToRad(0)
            ),
            new RTG(
                'rtg0' + this.team,
                this.team,
                new Vector(this.baseLocation.x + 500, this.baseLocation.y + 500,),
                degToRad(0)
            )
        ];
        this.base.upgradeSelf(this.upgrades[0]);
        for (let module of this.modules) {
            module.upgradeSelf(this.upgrades[0]);
            if (module.type == 'spawnport') {
                this.spawnLocations.push(module.position);
            }
        }
    }

    toJSON() {
        var p = [];
        for (let socket of this.players) {
            p.push(socket.player.toJSON());
        }

        return {
            room: this.room,
            team: this.team,
            players: p,
            base: this.base,
            modules: this.modules,
            level: this.level,
            color: this.color,
            battery: this.battery,
            maxBattery: this.maxBattery,
            resources: this.resources,
            maxResources: this.maxResources,
            dead: this.dead
        }
    }

    updateGameState(io, delta) {
        for (let socket of this.players) {
            // Leaderboard stuff

            this.players.sort((a, b) => {
                return a.score > b.score ? -1 : 1;
            });

            if (this.isDay) {
                socket.player.battery += socket.player.batteryGainRate * delta;
            }
            socket.player.battery -= socket.player.batteryLossRate * delta;
            socket.player.velocity = getFrictionVelocity(socket.player.velocity, 0.6);
            socket.player.position.addSelf(socket.player.velocity.mulScalar(delta));
            socket.player.health += socket.player.regeneration * delta;
            socket.player.shootingCooldown -= delta;
    
            if (socket.player.health <= 0) {
                socket.player.numDeaths++;
            }

            if (socket.player.resources >= socket.player.maxResources && this.level > socket.player.level && socket.player.level < 3) {
                socket.emit(SIGNALS.SERVER_UPGRADE);
            }
            
            socket.player.resources = clamp(socket.player.resources, 0, socket.player.maxResources);
            socket.player.health = clamp(socket.player.health, 0, socket.player.maxHealth);
            socket.player.battery = clamp(socket.player.battery, 0, socket.player.maxBattery);
        }

        this.base.health += this.base.regeneration * delta;        
        this.base.health = clamp(this.base.health, 0, this.base.maxHealth);
        if (this.base.health <= 0) {
            this.dead = true;
        }
        for (let module of this.modules) {
            if (module.health <= 0) {
                module.disabled = true;
            }
            else {
                module.disabled = false;
            }
            if (module.type == 'chargingport' && !module.disabled) {
                let playersInModule = this.getPlayersInRadius(module);
                for (let socket of playersInModule) {
                    if (this.battery > 0 && socket.player.battery < socket.player.maxBattery) {
                        socket.emit(SIGNALS.CLIENT_MESSAGE, 'Charging battery...');
                        socket.player.battery += module.chargingRate * delta;
                        socket.player.battery = clamp(socket.player.battery, 0, socket.player.maxBattery);
                        socket.player.score += module.scoreGiven * delta;
                        this.battery -= module.chargingRate * delta;
                    }
                }
            }
            else if (module.type == 'resourceport' && !module.disabled) {
                let playersInModule = this.getPlayersInRadius(module);
                for (let socket of playersInModule) {
                    if (socket.player.resources > 0) {
                        socket.emit(SIGNALS.CLIENT_MESSAGE, 'Depositing resources...');
                        socket.player.resources -= module.resourceRate * delta;
                        socket.player.resources = clamp(socket.player.resources, 0, socket.player.maxResources);
                        socket.player.score += module.scoreGiven * delta;
                        this.resources += module.resourceRate * delta;
                    }
                    if (this.resources >= this.maxResources) {
                        if (this.level < 4) {
                            this.level++;
                            for (let socket of this.players) {
                                socket.emit(SIGNALS.CLIENT_MESSAGE, 'Base level upgraded to ' + this.level);
                                socket.upgraded = false;
                            }
                            this.battery = Team.UPGRADES[this.level - 1].maxBattery;
                            this.maxBattery = Team.UPGRADES[this.level - 1].maxBattery;
                            this.resources = 0;
                            this.maxResources = Team.UPGRADES[this.level - 1].maxResources;

                            this.base.upgradeSelf(Team.UPGRADES[this.level - 1]);
                            for (let m of this.modules) {
                                m.upgradeSelf(Team.UPGRADES[this.level - 1]);
                            }
                        }
                    }
                }
            }
            else if (module.type == 'solarpanel' && !module.disabled) {
                if (this.isDay) {
                    this.battery += module.batteryGainRate * delta;
                }
            }
            else if (module.type == 'rtg' && !module.disabled) {
                this.battery += module.batteryGainRate * delta;
            }
            module.health = clamp(module.health, 0, module.maxHealth);
        }
        this.battery = clamp(this.battery, 0, this.maxBattery);
        this.resources = clamp(this.resources, 0, this.maxResources);
    }

    getPlayersInRadius(module) {
        let playersInModule = [];
        for (let socket of this.players) {
            if (isColliding(socket.player, module)) {
                playersInModule.push(socket);
            }
        }
        return playersInModule;
    }

    calculateScore() {
        // score is determined by the level, resources, health, the number of players, and the sum of all players' scores, weights are given
        let sumOfScores = 0;
        for (let socket of this.players) {
            sumOfScores += socket.player.score;
        }
        return this.level * 10000 + this.resources * 5 + this.players.length * 10 + sumOfScores;
    }
}