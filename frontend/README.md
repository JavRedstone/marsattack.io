# MarsAttack.io Frontend
Author: Javier Huang
## Inspiration

This project was mainly inspired by the movie *The Martian* directed by Ridley Scott, as well as Elon Musk's SpaceX's recent endeavors in achieving colonization of Mars.

*The Martian* inspired my project since it tells the story of an astronaut, Mark Watney, who is stranded on the surface of Mars, and wants to return home. Mark's journey is centered around his Hab a well as his rover, which are both central elements in MarsAttacks.io — the players are rovers trying to level up their respective Habs in their teams with the end goal of conquering the other team(s). In addition, the recurring theme of saving and effectively managing resources is shown in my game as resources and battery energy, which players need to be aware of and manage.

![The Martian — View of the Hab and rover, both central elements in the movie](https://payload.cargocollective.com/1/15/492915/10883984/mrtn_sat_dev_03_1340_c.jpg)
##### The Martian — View of the Hab and rover, both central elements in the movie (Image credit: *The Martian*)

SpaceX's recent endeavors in achieving colonization of Mars is also a great point of inspiration. With the anticipation of the second Starship launch underway, I wanted to express my genuine interest in the progress of Starship's development through this game. If SpaceX succeeds, we may establish several colonies on Mars, and my game, MarsAttacks.io, creates a hypothetical question: What happens if there is war on Mars?

![Artist's rendition of a SpaceX Mars colony (Image credit: Spacex)](https://ichef.bbci.co.uk/news/976/cpsprodpb/130B9/production/_116390087_48954139137_58c801ccbd_k.jpg)
##### Artist's rendition of a SpaceX Mars colony (Image credit: SpaceX)

## What it does

MarsAttacks.io is designed to be a fast-paced, multiplayer IO game with novel and interesting game mechanics. Here are the features of the game:
- The game mode is team mode.
- Each team has a base, which comprises of:
	- A Hab
	- Solar panels
	- Radioisotope thermoelectric generators (RTG)
	- Spawn ports where players spawn
	- Charging ports where players charge their rover batteries
	- Resource ports where players deposit their resources into the base in order to level up their base.
- Players gather resources by shooting at rocks, and they attack by shooting at enemies or at their base modules. If a base module has no health remaining, it is disabled.
- The players' goal is to destroy the enemy bases in order to win, but to do that, they have to upgrade their rover, and subsequently upgrade their base. Rover levels depend on base levels, which can be upgraded by players depositing enough resources to meet the next requirement.
- The game has a day-night cycle. In the day, the solar panels of the base recharge the base battery, and the solar panels of the rover recharge player batteries. At night, however, only the base RTG is running and players have to effectively manage their battery to get through the night.
- The team balancing system works by combining the team level, team resources, and the cumulative player scores with different weights in order to generate a score that will be used to determine if a team is winning or losing.
- New rooms open when previous rooms are full or if their games have ended.

![Screenshot of MarsAttack.io](https://i.imgur.com/j0CUkZp.png)
##### Screenshot of MarsAttack.io; The player rover, Hab, modules, and rocks are visible.

## How I built it

MarsAttacks.io is built using a NodeJS server / backend connected to a native JavaScript Webserver client / frontend, using a Socket.io WebSocket. I opted to using a very simple approach in order for the game to have as low of a response time as possible, as it is a fast-paced IO game. The server is heavily based off of object-oriented programming, where I had objects representing each module of the base, each rock that can be mined, and each player in the scene.

![Game application structure for MarsAttacks.io](https://i.imgur.com/vZBCBsF.png)
##### Game application structure for MarsAttacks.io
### Installation Guide:
To run MarsAttacks.io, perform the following steps:
#### Frontend:
1. Navigate your terminal to the `./frontend` folder.
2. Type: `http-server` inside the terminal.
3. Your project should open at http://127.0.0.1:8080/
#### Backend:
1. Navigate your terminal to the `./backend` folder
2. If no `node_modules` folder is present, run the command `npm install`.
3. Once it is finished, run `npm start` in order to start the backend.
4. The backend is located at http://localhost:3000/.
## Challenges I ran into

The main challenge that I ran into was finding the right library — or no library to use — for drawing the game on the client side, since I was new to rendering games. I needed a client that was fast as well as easy to understand and use. I started with a basic canvas. Although it was easy to use, the game grinded to a halt after a few minutes of multiplayer, as a result of the quick refresh rate and the large amount of objects used. Next, I tried out using native WebGL to speed up the rendering, however the sheer complexity of drawing simple shapes (like the background) ruled this option out. Finally, I ended up using PixiJS, which is simple to use, and also fast as uses WebGL for rendering.

## Accomplishments that I am proud of

I am proud of making this game a reality, as I've only had previous experience using game engines (Godot, Unity) to create them. This project is certainly a leap from what I am used to, and I am proud of myself for achieving what I wanted.

Using a JavaScript web server approach, I can expand this game to any lengths that I want, compared to game engines, which are generally restrictive beyond making the game scenes themselves.

## What I learned

This entire process has taught me a lot about game development in general, as I reached beyond my programming bubble in order to create this unique game. In fact, for the new games that I will be making in the future, I am going to adopt this web application structure, and use it to expand on my game creation endeavors.

## What's next for MarsAttack.io?

**MarsAttack.io has a lot of potential.** At the moment, it is still only a team mode based game. However, these game modes can be expanded to include many others. The following are just examples:
- **Survival Mode** - An FFA match with charging ports located at the center and a shrinking border. The last person standing wins.
- **Raid Mode** - Aliens raid a central base, and players have to protect their base.
- **Battle Royale** - Crates that come from Starships contain valuable resources which players can loot (rocks no longer drop resources); perhaps there can be auxiliary weapons that can come from the crates or gained from  team bases in Team Mode.

I think the true potential of this game comes from its **modding capabilities**. Since it is built right for the web, there can be a page dedicated for users to use an API to host their own mods within the game. This can greatly increase the diversity of gameplay and perhaps some mods can be featured to help expand the playerbase.
