/**
 * @author Javier Huang
 */

import Vector from 'vector2js';
import { SIGNALS } from '../constants/signalconstants';
import { removeElementFrom } from '../utils/arrayutils';
import { getFrictionVelocity, getTimeElapsed, isColliding, randElement, randRange } from '../utils/mathutils';
import { messageLog } from '../utils/logutils';
import { Rock } from './rock';
import { Team } from './team';
import { Bullet } from './bullet';

export class Room {
    static MAP_SIZE = 2500; // will need to tune
    static NUM_ROCKS = 500; // will need to tune
    static ROCK_GRID_SIZE = 2.5;
    static MIN_ROCK_SIZE = 5;
    static MAX_ROCK_SIZE = 50;
    static MAX_ROOM_SIZE = 20;
    static TEAM_NUMBER = 2;
    static TIMEOUT_TIME = 25; // in minutes
    static DAY_NIGHT_SWITCH_TIME = 2; // in minutes

    roomId = 0;
    teams = [];
    rocks = [];
    bullets = [];
    colorChoice = 0;
    baseLocations = [];
    mapSize = Room.MAP_SIZE;
    numRocks = Room.NUM_ROCKS;
    rockGridSize = Room.ROCK_GRID_SIZE;
    minRockSize = Room.MIN_ROCK_SIZE;
    maxRockSize = Room.MAX_ROCK_SIZE;
    maxRoomSize = Room.MAX_ROOM_SIZE;
    teamNumber = Room.TEAM_NUMBER;
    startTime = 0;
    timeoutTime = Room.TIMEOUT_TIME;
    isDay = true;
    dayNightSwitchTime = Room.DAY_NIGHT_SWITCH_TIME;
    nextBulletId = 0;
    died = false;    

    constructor(roomId) {
        this.roomId = roomId;
        this.teams = [];
        this.rocks = [];
        this.bullets = [];
        this.baseLocations = [
            new Vector(-this.mapSize * 2/3, 0),
            new Vector(this.mapSize * 2/3, 0)
        ];
        this.colorChoice = randRange(0, Team.COLORS.length - 1, true);
        this.mapSize = Room.MAP_SIZE;
        this.numRocks = Room.NUM_ROCKS;
        this.maxRoomSize = Room.MAX_ROOM_SIZE;
        this.rockGridSize = Room.ROCK_GRID_SIZE;
        this.minRockSize = Room.MIN_ROCK_SIZE;
        this.maxRockSize = Room.MAX_ROCK_SIZE;
        this.maxRoomSize = Room.MAX_ROOM_SIZE;
        this.teamNumber = Room.TEAM_NUMBER;
        this.startTime = new Date();
        this.timeoutTime = Room.TIMEOUT_TIME; // time until team automatically dies of no players
        this.lastDayNightSwitchTime = new Date();
        this.isDay = true;
        this.dayNightSwitchTime = Room.DAY_NIGHT_SWITCH_TIME;
        this.nextBulletId = 0;
        this.died = false;

        for (let i = 0; i < Room.TEAM_NUMBER; i++) {
            let team = new Team(i, this.baseLocations[i], this.colorChoice);
            this.teams.push(team);
        }
        for (let i = 0; i < Room.NUM_ROCKS; i++) {
            let rock = new Rock(
                i,
                new Vector(
                    randRange(-Room.MAP_SIZE / this.rockGridSize, Room.MAP_SIZE + 1 / this.rockGridSize, true) * this.rockGridSize,
                    randRange(-Room.MAP_SIZE / this.rockGridSize, Room.MAP_SIZE / this.rockGridSize, true) * this.rockGridSize
                ), // position
                Vector.zero, // velocity
                randRange(0, Math.PI * 2, false), // rotation
                randRange(this.minRockSize, this.maxRockSize, false) // radius
            );
            this.rocks.push(rock);
        }
    }

    toJSON() {
        var t = [];
        for (let team of this.teams) {
            t.push(team.toJSON());
        }
        
        let b = [];
        for (let bullet of this.bullets) {
            b.push(bullet.toJSON());
        }

        return {
            roomId: this.roomId,
            teams: t,
            rocks: this.rocks,
            bullets: b,
            colorChoice: this.colorChoice,
            mapSize: this.mapSize,
            maxRoomSize: this.maxRoomSize,
            isDay: this.isDay,
        }
    }

    updateGameState(io, delta) {
        for (let team of this.teams) {
            team.isDay = this.isDay;
            team.updateGameState(io, delta);
        }
        for (let rock of this.rocks) {
            rock.velocity = getFrictionVelocity(rock.velocity, 0.6);
            rock.position.addSelf(rock.velocity.mulScalar(delta));

            if (rock.health <= 0) {
                removeElementFrom(this.rocks, rock);
            }
        }
        if (getTimeElapsed(this.lastDayNightSwitchTime, 'minutes') >= this.dayNightSwitchTime) {
            this.isDay = !this.isDay;
            this.lastDayNightSwitchTime = new Date();
        }
        
        for (let team of this.teams) {
            if (team.dead) {
                this.removeTeam(team, io);
            }

            for (let socket of team.players) {

                if (socket.player.health <= 0) {
                    socket.player.score = Math.floor(socket.player.score / 2);
                    socket.player.health = socket.player.maxHealth;
                    socket.player.battery = socket.player.maxBattery;
                    socket.player.resources = 0;
                    let spawnLocation = randElement(team.spawnLocations);
                    socket.player.position = spawnLocation.clone();
                }

                for (let rock of this.rocks) {
                    if (isColliding(rock, socket.player)) {
                        socket.player.health -= rock.playerDamage * delta;
                        rock.health -= rock.playerDamage * delta;
                        if (rock.health <= 0) {
                            socket.player.resources += rock.resourcesGiven;
                        }
                        if (socket.player.health <= 0) {
                            socket.emit(SIGNALS.CLIENT_MESSAGE, 'You died to a rock');
                        }
                    }
                }

                if (socket.player.shooting && socket.player.shootingCooldown <= 0) {
                    socket.player.shootingCooldown = socket.player.maxShootingCooldown;
                    for (let bulletStat of socket.player.bulletStats) {
                        let bullet = new Bullet(
                            'bullet' + this.nextBulletId + 'team' + this.team,
                            socket.player.position.add(bulletStat.position.rotateRadians(socket.player.rotation - Math.PI / 2)), // position
                            socket.player.velocity.add(bulletStat.velocity.rotateRadians(socket.player.rotation - Math.PI / 2)), // velocity
                            bulletStat.rotation + Math.PI / 2 + socket.player.rotation, // rotation
                            bulletStat.damage, // damage
                            socket // shooter
                        );
                        this.bullets.push(bullet)
                        this.nextBulletId++;
                    }
                }
            }
        }

        for (let bullet of this.bullets) {
            bullet.position.addSelf(bullet.velocity.mulScalar(delta));
            bullet.explosionTimer -= delta;

            if (bullet.explosionTimer <= 0) {
                removeElementFrom(this.bullets, bullet);
            }

            for (let rock of this.rocks) {
                if (isColliding(rock, bullet)) {
                    bullet.explosionTimer = 0;
                    rock.health -= bullet.damage;
                    if (rock.health <= 0) {
                        bullet.shooter.player.score += rock.scoreGiven;
                        bullet.shooter.player.resources += rock.resourcesGiven;
                    }
                }
            }
            for (let team of this.teams) {
                for (let socket of team.players) {
                    if (isColliding(socket.player, bullet) && bullet.shooter.player.team != team.team) {
                        bullet.explosionTimer = 0;
                        socket.player.health -= bullet.damage;
                        if (socket.player.health <= 0) {
                            socket.emit(SIGNALS.CLIENT_MESSAGE, "You were killed by " + bullet.shooter.player.name);
                            bullet.shooter.emit(SIGNALS.CLIENT_MESSAGE, "You killed " + socket.player.name);
                            bullet.shooter.player.numKills++;
                            bullet.shooter.player.resources += socket.player.resources / 2;
                            bullet.shooter.player.score += Math.ceil(socket.player.score / 2); // shooters get greater score lol
                        }
                    }
                }
                if (isColliding(team.base, bullet) && bullet.shooter.player.team != team.team) {
                    bullet.explosionTimer = 0;
                    team.base.health -= bullet.damage;
                }
                for (let module of team.modules) {
                    if (isColliding(module, bullet) && bullet.shooter.player.team != team.team && !module.disabled) {
                        bullet.explosionTimer = 0;
                        module.health -= bullet.damage;
                        if (module.health <= 0) {
                            module.disabled = true;
                        }
                    }
                }
            }
        }
    }

    joinRoom(socket) {
        if (socket.player != null) {
            this.teams.sort((a, b) => {  // helps balance
                return a.calculateScore() < b.calculateScore() ? -1 : 1;
            });
            socket.player.team = this.teams[0].team;
            let spawnLocation = randElement(this.teams[0].spawnLocations);
            socket.player.position = spawnLocation.clone();
            this.teams[0].players.push(socket);
        }
    }

    leaveRoom(socket, io) {
        if (socket.player != null) {
            for (let team of this.teams) {
                removeElementFrom(team.players, socket);
                if (getTimeElapsed(this.startTime, 'minutes') >= Room.TIMEOUT_TIME && team.players.length == 0) {
                    this.removeTeam(team, io);
                    return true;
                }
            }
        }
        messageLog('Player ' + socket.id + ' with name ' + socket.player.name + ' left room ' + this.roomId);
        return false;
    }

    removeTeam(team, io) {
        if (this.teams.includes(team)) {
            team.dead =  true;
            // io.to(this.roomId).emit(SIGNALS.TEAM_DEATH, team);
            for (let socket of team.players) {
                if (socket.connected) {
                    socket.player.gameOver = true; // just in case this message doesn't get sent
                    socket.emit(SIGNALS.GAME_OVER, { win: false });
                }
                socket.leave(this.roomId);
                socket.disconnect();
            }
        }
        messageLog('Team ' + team.color + ' in room ' + this.roomId + ' died.');
        this.checkGameOver(io);
    }

    checkGameOver(io) {
        let teamsAlive = [];
        for (let team of this.teams) {
            if (!team.dead) {
                teamsAlive.push(team);
            }
        }
        if (teamsAlive.length == Room.TEAM_NUMBER - 1) {
            for (let socket of teamsAlive[0].players) {
                socket.player.gameWin = true; // just in case this message doesn't get sent
                if (socket.connected) {
                    socket.emit(SIGNALS.GAME_OVER, { win: true });
                }
                socket.leave(this.roomId);
                socket.disconnect();
            }
        }
        this.died = true;
        messageLog('Room ' + this.roomId + ' closed.');
        io.in(this.roomId).socketsLeave(this.roomId);
    }
}