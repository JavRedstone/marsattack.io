/**
 * @author Javier Huang
 */

const socket = io('http://localhost:3000/');

const SIGNALS = {
    USER_JOIN: 'user_join', // when user first joins game
    CLIENT_UPDATE: 'client_update', // update messages from client
    SERVER_UPDATE: 'server_update', // update messages from server
    CLIENT_MESSAGE: 'client_message', // just a message
    CLIENT_UPGRADE: 'client_upgrade', // upgrade message
    SERVER_UPGRADE: 'server_upgrade',
    GAME_OVER: 'game_over' // you can't respawn
};

// Create PixiJS application
const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    transparent: false,
    antialias: true,
    resizeTo: window,
    backgroundColor: 0xe77d11
});
const gameObjectsContainer = new PIXI.Container();
app.stage.addChild(gameObjectsContainer);

const sendNameToServer = () => {
    const playerName = document.getElementById('name-input').value;
    if (playerName.trim() !== '') {
      socket.emit(SIGNALS.USER_JOIN, { name: playerName });
      document.getElementById('center-box').style.display = 'none';
  
      runGame();
    }
    else {
      alert('Name cannot be empty!');
    }
  };

let mouseX = 0;
let mouseY = 0;
let moving = false;
let shooting = false;

app.view.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

// Mousemove event
app.view.addEventListener('mousemove', (event) => {
    mouseX = event.clientX - app.view.width / 2;
    mouseY = event.clientY - app.view.height / 2;
});
  
// Mousedown event
app.view.addEventListener('mousedown', (event) => {
    if (event.button === 2) {
        moving = true;
    } else if (event.button === 0) {
        shooting = true;
    }
});
  
// Mouseup event
app.view.addEventListener('mouseup', (event) => {
    if (event.button === 2) {
        moving = false;
    } else if (event.button === 0) {
        shooting = false;
    }
});

document.getElementById('play-button').addEventListener('click', () => {
    sendNameToServer();
});


let game;

let currentPlayer = null;

// object maps
let playersOM = new Map();
let rocksOM = new Map();
let bulletsOM = new Map();
let basesOM = new Map();
let chargingportsOM = new Map();
let resourceportsOM = new Map();
let spawnportsOM = new Map();
let solarpanelsOM = new Map();
let rtgsOM = new Map();

// sprite maps
let playersSM = new Map();
let rocksSM = new Map();
let bulletsSM = new Map();
let basesSM = new Map();
let chargingportsSM = new Map();
let resourceportsSM = new Map();
let spawnportsSM = new Map();
let solarpanelsSM = new Map();
let rtgsSM = new Map();

socket.on('connect', () => {
    console.log('Connected to server');
  
    socket.on(SIGNALS.SERVER_UPDATE, (data) => {
        playersOM = new Map();
        rocksOM = new Map();
        bulletsOM = new Map();
        basesOM = new Map();
        chargingportsOM = new Map();
        resourceportsOM = new Map();
        spawnportsOM = new Map();
        solarpanelsOM = new Map();
        rtgsOM = new Map();


        game = data.game;

        socket.emit(SIGNALS.CLIENT_UPDATE, {
            x: mouseX,
            y: mouseY,
            moving: moving,
            shooting: shooting,
        });

        for (let team of game.teams) {
            for (let player of team.players) {
                if (!playersOM.has(player.id)) {
                    playersOM.set(player.id, player);
                }
                if (player.id == socket.id) {
                    currentPlayer = player;
                }
            }
        }

        for (let rock of game.rocks) {
            if (!rocksOM.has(rock.id)) {
                rocksOM.set(rock.id, rock);
            }
        }

        for (let bullet of game.bullets) {
            if (!bulletsOM.has(bullet.id)) {
                bulletsOM.set(bullet.id, bullet);
            }
        }

        for (let team of game.teams) {
            if (!basesOM.has(team.base.id)) {
                basesOM.set(team.base.id, team.base);
            }
        }

        for (let team of game.teams) {
            for (let module of team.modules) {
                switch(module.type) {
                    case 'chargingport':
                        if (!chargingportsOM.has(module.id)) {
                            chargingportsOM.set(module.id, module);
                        }
                        break;
                    case 'resourceport':
                        if (!resourceportsOM.has(module.id)) {
                            resourceportsOM.set(module.id, module);
                        }
                        break;
                    case 'spawnport':
                        if (!spawnportsOM.has(module.id)) {
                            spawnportsOM.set(module.id, module);
                        }
                        break;
                    case 'solarpanel':
                        if (!solarpanelsOM.has(module.id)) {
                            solarpanelsOM.set(module.id, module);
                        }
                        break;
                    case 'rtg':
                        if (!rtgsOM.has(module.id)) {
                            rtgsOM.set(module.id, module);
                        }
                        break;
                }
            }
        }
    });

    socket.on(SIGNALS.SERVER_UPGRADE, () => {
        displayUpgradeOptions();
    });

    socket.on(SIGNALS.CLIENT_MESSAGE, (message) => {
        displayPlayerMessage(message);
    });    

    socket.on(SIGNALS.GAME_OVER, (data) => {
        console.log("WHJAT")
        showGameOverScreen(data.win, currentPlayer.score, currentPlayer.numKills, currentPlayer.numDeaths);
    });
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

let tick = 0;

function runGame() {
    document.body.appendChild(app.view);
    const loader = PIXI.Loader.shared;
    loader.add('rover', './assets/rover.png');
    loader.add('rock', './assets/rock.png');
    loader.add('bullet', './assets/bullet.png');
    loader.add('base', './assets/base.png');
    loader.add('chargingport', './assets/chargingport.png');
    loader.add('resourceport', './assets/resourceport.png');
    loader.add('spawnport', './assets/spawnport.png');
    loader.add('solarpanel', './assets/solarpanel.png');
    loader.add('rtg', './assets/rtg.png');

    loader.load(() => {
        const roverTexture = PIXI.Texture.from('rover');
        const rockTexture = PIXI.Texture.from('rock');
        const bulletTexture = PIXI.Texture.from('bullet');
        const baseTexture = PIXI.Texture.from('base');
        const chargingportTexture = PIXI.Texture.from('chargingport');
        const resourceportTexture = PIXI.Texture.from('resourceport');
        const spawnportTexture = PIXI.Texture.from('spawnport');
        const solarpanelTexture = PIXI.Texture.from('solarpanel');
        const rtgTexture = PIXI.Texture.from('rtg');

        /*
        const roverSprite = new PIXI.Sprite(roverTexture);
        const rockSprite = new PIXI.Sprite(rockTexture);
        const bulletSprite = new PIXI.Sprite(bulletTexture);
        const baseSprite = new PIXI.Sprite(baseTexture);
        const chargingportSprite = new PIXI.Sprite(chargingportTexture);
        const resourceportSprite = new PIXI.Sprite(resourceportTexture);
        const spawnportSprite = new PIXI.Sprite(spawnportTexture);
        const solarpanelSprite = new PIXI.Sprite(solarpanelTexture);
        const rtgSprite = new PIXI.Sprite(rtgTexture);
        */

        app.ticker.add((time) => {
            if (game != null){
                if (game != null) {
                    if (tick % 60 === 0) {
                        updateLeaderboard();
                        updateDayNightCycle();
                    }
                }
    
                updateBases(baseTexture);
                updateChargingPorts(chargingportTexture);
                updateResourcePorts(resourceportTexture);
                updateSpawnPorts(spawnportTexture);
                updateSolarPanels(solarpanelTexture);
                updateRTGs(rtgTexture);
                updateRocks(rockTexture);
                updateBullets(bulletTexture);
                updatePlayers(roverTexture);
            }
        });          
    });
}

let buttonContainer = null;

function displayUpgradeOptions() {
    // Assuming player.upgrades is defined and contains the upgrades array
    const upgrades = currentPlayer.upgrades[currentPlayer.level];
    
    if (!buttonContainer) {
        buttonContainer = new PIXI.Container();
        buttonContainer.position.set(app.view.width / 2, 10); // Adjust Y position as needed
        app.stage.addChild(buttonContainer);

        // Create a button for each upgrade option
        for (let i = 0; i < upgrades.length; i++) {
            const upgradeOption = upgrades[i];

            const button = new PIXI.Text(upgradeOption.name, {
                fill: "white",
                fontSize: 20,
                fontFamily: "Tektur, cursive",
                align: "center",
            });

            button.x = -button.width / 2; // since the container is already at app.view.width / 2
            button.y = 10 + i * 20;
            button.interactive = true;
            button.buttonMode = true;

            // Handle the click event for the button
            button.on("pointerdown", () => {
                // Emit the CLIENT_UPGRADE signal with the selected upgrade index
                socket.emit(SIGNALS.CLIENT_UPGRADE, i);

                // Hide the buttons after the upgrade is selected
                buttonContainer.visible = false;
            });

            buttonContainer.addChild(button);
        }
    }
}

let playerMessageText = null;
let playerMessageQueue = []; // Queue to store player messages
let isPlayerMessageShowing = false; // Flag to track if a message is currently being displayed
let playerMessageTimeout = null;

function displayPlayerMessage(message) {
    // Check if the new message is the same as the currently displayed message
    if (isPlayerMessageShowing && playerMessageText.text === message) {
        // If it's the same message, reset the timer for hiding the message
        clearTimeout(playerMessageTimeout);
        playerMessageTimeout = setTimeout(hidePlayerMessage, 3000);
    } else {
        // If it's a new message or the first message to be displayed, add it to the queue
        playerMessageQueue.push(message);

        // If there is no message being displayed, start displaying messages from the queue
        if (!isPlayerMessageShowing) {
            showNextPlayerMessage();
        }
    }
}

function showNextPlayerMessage() {
    // Check if there are messages in the queue
    if (playerMessageQueue.length > 0) {
        // Get the next message from the queue and remove it from the queue
        const message = playerMessageQueue.shift();

        if (!playerMessageText) {
            const style = new PIXI.TextStyle({
                fill: "#000000", // Text color (white)
                fontSize: 24, // Font size
                fontFamily: "Tektur, cursive", // Specify the 'Tektur' font family
                align: "center", // Align the text to the center horizontally
            });
            playerMessageText = new PIXI.Text("", style);
            playerMessageText.x = app.view.width / 2 - playerMessageText.width / 2;
            playerMessageText.y = 50; // Position the message near the top
            app.stage.addChild(playerMessageText);
        }

        playerMessageText.text = message;
        playerMessageText.x = app.view.width / 2 - playerMessageText.width / 2;

        // Set the flag to indicate that a message is currently being displayed
        isPlayerMessageShowing = true;

        // Hide the message after a certain amount of time
        playerMessageTimeout = setTimeout(hidePlayerMessage, 1000);
    }
}

function hidePlayerMessage() {
    playerMessageText.text = "";
    // Set the flag to indicate that the message display is complete
    isPlayerMessageShowing = false;
    // Show the next message, if any, in the queue
    showNextPlayerMessage();
}

let teamResourcesBar;
let teamBatteryBar;
let teamResourcesText;
let teamBatteryText;
let teamLeaderboardText;

let currentTeamIndex = -1; // Index of the current team's leaderboard being shown

function updateLeaderboard() {
    if (currentTeamIndex == -1) {
        currentTeamIndex = currentPlayer.team;
    }

    let team = null;
    for (let t of game.teams) {
        if (t.team === currentTeamIndex) {
            team = t;
        }
    }

    if (team) {
        if (!teamLeaderboardText) {
            // Initialize the leaderboard text for the current team
            currentTeamIndex = currentPlayer.team;
            const style = {
                fill: "#ffffff", // Text color (white)
                fontSize: 12, // Font size
                fontFamily: "Tektur, cursive", // Specify the 'Tektur' font family
                align: "left", // Align the text to the right
            };
            teamLeaderboardText = new PIXI.Text("", style);
            teamLeaderboardText.x = 10;
            teamLeaderboardText.y = 10; // Position the leaderboard text in the top right corner
            app.stage.addChild(teamLeaderboardText); // Add the leaderboard text to the stage
        }

        teamLeaderboardText.text = team.team == currentPlayer.team ? `Your Team (${team.color}) | ${team.players.length} Players | Level ${team.level}\n` :`Team ${team.color} | ${team.players.length} Players | Level ${team.level}\n`;
        for (let i = 0; i < team.players.length; i++) {
            const player = team.players[i];
            teamLeaderboardText.text += `${i + 1}. ${player.name}: ${Math.round(player.score)}\n`;
        }

        // Update team resources bar
        const resourcesBarWidth = 100;
        const resourcesBarHeight = 10;
        const resourcesBarColor = 0x00bfff;
        const resourcesBarBorderRadius = 4;
        if (!teamResourcesBar) {

            teamResourcesBar = new PIXI.Graphics();
            teamResourcesBar.beginFill(resourcesBarColor);
            teamResourcesBar.drawRoundedRect(0, 0, resourcesBarWidth, resourcesBarHeight, resourcesBarBorderRadius);
            teamResourcesBar.endFill();
            teamResourcesBar.x = 10;
            teamResourcesBar.y = teamLeaderboardText.y + teamLeaderboardText.height;
            app.stage.addChild(teamResourcesBar);
        }
        teamResourcesBar.scale.x = Math.max(0, team.resources / team.maxResources);

        // Update team resources text
        if (!teamResourcesText) {
            const style = {
                fill: "#ffffff",
                fontSize: 12,
                fontFamily: "Tektur, cursive",
                align: "right", // Align the text to the right
            };
            teamResourcesText = new PIXI.Text("", style);
            teamResourcesText.x = teamResourcesBar.x + resourcesBarWidth + 5;
            teamResourcesText.y = teamResourcesBar.y;
            app.stage.addChild(teamResourcesText);
        }
        teamResourcesText.text = `🪨 ${Math.round(team.resources)}/${Math.round(team.maxResources)}`;

        // Update team battery bar

        const batteryBarWidth = 100;
        const batteryBarHeight = 10;
        const batteryBarColor = 0xffd700;
        const batteryBarBorderRadius = 4;
        if (!teamBatteryBar) {

            teamBatteryBar = new PIXI.Graphics();
            teamBatteryBar.beginFill(batteryBarColor);
            teamBatteryBar.drawRoundedRect(0, 0, batteryBarWidth, batteryBarHeight, batteryBarBorderRadius);
            teamBatteryBar.endFill();
            teamBatteryBar.x = 10;
            teamBatteryBar.y = teamResourcesBar.y + teamResourcesBar.height + 5;
            app.stage.addChild(teamBatteryBar);
        }
        teamBatteryBar.scale.x = Math.max(0, team.battery / team.maxBattery);

        // Update team battery text
        if (!teamBatteryText) {
            const style = {
                fill: "#ffffff",
                fontSize: 12,
                fontFamily: "Tektur, cursive",
                align: "right", // Align the text to the right
            };
            teamBatteryText = new PIXI.Text("", style);
            teamBatteryText.x = teamBatteryBar.x + batteryBarWidth + 5; // Adjusted position for right-align
            teamBatteryText.y = teamBatteryBar.y;
            app.stage.addChild(teamBatteryText);
        }
        teamBatteryText.text = `🔋 ${Math.round(team.battery)}/${Math.round(team.maxBattery)}`;

    } else {
        teamLeaderboardText.text = "";

        // Reset bar values and texts to zero/empty
        if (teamResourcesBar) {
            teamResourcesBar.scale.x = 0;
        }
        if (teamBatteryBar) {
            teamBatteryBar.scale.x = 0;
        }
        if (teamResourcesText) {
            teamResourcesText.text = "";
        }
        if (teamBatteryText) {
            teamBatteryText.text = "";
        }
    }
}


document.addEventListener('keydown', (event) => {
    if ((event.key === "Q" || event.key === "q") && game && game.teams.length > 0) {
        currentTeamIndex = (currentTeamIndex + 1) % (game.teams.length);
        updateLeaderboard();
    }
});

function updateDayNightCycle() {
    let targetColor = game.isDay ? 0xe77d11 : 0x451804;
    app.renderer.backgroundColor = targetColor;
}

function createOrUpdateSprite(object, texture, spriteMap) {
    if (!spriteMap.has(object.id)) {
        spriteMap.set(object.id, [new PIXI.Sprite(texture), null, null, null, null, null, null, null]); // Create an array to hold sprite, health bar, health text, battery bar, battery text, resource bar, resource text, and score text
        gameObjectsContainer.addChild(spriteMap.get(object.id)[0]); // Add the sprite to the container
    }

    let [sprite, healthBar, healthText, batteryBar, batteryText, resourceBar, resourceText, scoreLevelText, nameText] = spriteMap.get(object.id);

    sprite.anchor.set(0.5, 0.5); // Set the anchor point to the center
    if (!object.radius) {
        sprite.scale.set(object.dimensions.width / 720, object.dimensions.height / 720);
    } else {
        sprite.scale.set(object.radius / 720 * 2, object.radius / 720 * 2);
    }

    // Update the position based on the currentPlayer's location
    if (object.id !== currentPlayer.id) {
        sprite.x = app.view.width / 2 - currentPlayer.position.x + object.position.x;
        sprite.y = app.view.height / 2 - currentPlayer.position.y + object.position.y;
    } else {
        // Center the currentPlayer in the middle of the screen
        sprite.x = app.view.width / 2;
        sprite.y = app.view.height / 2;
    }
    sprite.rotation = object.rotation;

    if (object.health != null) {
        // Health bar update
        const healthBarWidth = 50; // Set the width of the health bar
        const healthBarHeight = 5; // Set the height of the health bar
        const healthBarColorAlly = 0x00ff00; // Set the color of the health bar ally (green)
        const healthBarColorEnemy = 0xff0000; // Set the color of the health bar enemy (red)
        const healthBarBorderRadius = 4; // Set the border radius of the health bar

        if (!healthBar) {
            // Create a new health bar sprite and add it to the array
            
            const newHealthBar = new PIXI.Graphics();
            newHealthBar.beginFill(object.team != null && object.team == currentPlayer.team ? healthBarColorAlly : healthBarColorEnemy);
            newHealthBar.drawRoundedRect(0, 0, healthBarWidth, healthBarHeight, healthBarBorderRadius);
            newHealthBar.endFill();
            spriteMap.get(object.id)[1] = newHealthBar; // Add the health bar to the array
            gameObjectsContainer.addChild(newHealthBar); // Add the health bar to the container
        }

        const updatedHealthBar = spriteMap.get(object.id)[1];

        // Update the health bar size based on the object's health
        // const healthBarWidth = updatedHealthBar.width; // Get the width of the health bar sprite
        updatedHealthBar.scale.x = Math.max(0, object.health / object.maxHealth); // Update the health bar scale

        if (object.health < 0) {
            object.health = 0;
        }

        // Position the health bar below the sprite
        updatedHealthBar.x = sprite.x - healthBarWidth; // left align
        updatedHealthBar.y = sprite.y + sprite.height / 2 + 10;

        // Fraction text update
        if (!healthText) {
            // Create a new text object and add it to the array
            const style = new PIXI.TextStyle({
                fill: "#ffffff", // Text color (white)
                fontSize: 12, // Font size
                fontFamily: "Tektur, cursive", // Specify the 'Tektur' font family
            });
            healthText = new PIXI.Text("", style);
            spriteMap.get(object.id)[2] = healthText; // Add the text object to the array
            gameObjectsContainer.addChild(healthText); // Add the text object to the container
        }

        // Update the text content to display the current health as a fraction
        healthText.text = `🧡 ${Math.round(object.health)}/${Math.round(object.maxHealth)}`;

        // Position the text next to the health bar
        healthText.x = updatedHealthBar.x + healthBarWidth + 5;
        healthText.y = updatedHealthBar.y - 2;
    }

    if (object.battery != null && object.maxBattery != null) {
        // Battery bar update
        
        // Create a new battery bar sprite and add it to the array
        const batteryBarWidth = 50; // Set the width of the battery bar
        const batteryBarHeight = 5; // Set the height of the battery bar
        const batteryBarColor = 0xffd700; // Set the color of the battery bar (gold)
        const batteryBarBorderRadius = 4; // Set the border radius of the battery bar
        
        if (!batteryBar) {

            const newBatteryBar = new PIXI.Graphics();
            newBatteryBar.beginFill(batteryBarColor);
            newBatteryBar.drawRoundedRect(0, 0, batteryBarWidth, batteryBarHeight, batteryBarBorderRadius);
            newBatteryBar.endFill();
            spriteMap.get(object.id)[3] = newBatteryBar; // Add the battery bar to the array
            gameObjectsContainer.addChild(newBatteryBar); // Add the battery bar to the container
        }

        const updatedBatteryBar = spriteMap.get(object.id)[3];

        // Update the battery bar size based on the object's battery level
        // const batteryBarWidth = updatedBatteryBar.width; // Get the width of the battery bar sprite
        updatedBatteryBar.scale.x = Math.max(0, object.battery / object.maxBattery); // Update the battery bar scale

        if (object.battery < 0) {
            object.battery = 0;
        }

        // Position the battery bar below the sprite
        updatedBatteryBar.x = sprite.x - batteryBarWidth; // left align
        updatedBatteryBar.y = sprite.y + sprite.height / 2 + 25;

        // Battery text update
        if (!batteryText) {
            // Create a new text object and add it to the array
            const style = new PIXI.TextStyle({
                fill: "#ffffff", // Text color (white)
                fontSize: 12, // Font size
                fontFamily: "Tektur, cursive", // Specify the 'Tektur' font family
            });
            batteryText = new PIXI.Text("", style);
            spriteMap.get(object.id)[4] = batteryText; // Add the text object to the array
            gameObjectsContainer.addChild(batteryText); // Add the text object to the container
        }

        // Update the text content to display the current battery as a fraction
        batteryText.text = `🔋 ${Math.round(object.battery)}/${Math.round(object.maxBattery)}`;

        // Position the text next to the battery bar
        batteryText.x = updatedBatteryBar.x + batteryBarWidth + 5;
        batteryText.y = updatedBatteryBar.y - 2;
    }

    if (object.resources != null && object.maxResources != null) {
        // Resource bar update
        const resourceBarWidth = 50; // Set the width of the resource bar
        const resourceBarHeight = 5; // Set the height of the resource bar
        const resourceBarColor = 0x00bfff; // Set the color of the resource bar (blue)
        const resourceBarBorderRadius = 4; // Set the border radius of the resource bar

        if (!resourceBar) {
            // Create a new resource bar sprite and add it to the array

            const newResourceBar = new PIXI.Graphics();
            newResourceBar.beginFill(resourceBarColor);
            newResourceBar.drawRoundedRect(0, 0, resourceBarWidth, resourceBarHeight, resourceBarBorderRadius);
            newResourceBar.endFill();
            spriteMap.get(object.id)[5] = newResourceBar; // Add the resource bar to the array
            gameObjectsContainer.addChild(newResourceBar); // Add the resource bar to the container
        }

        const updatedResourceBar = spriteMap.get(object.id)[5];

        // Update the resource bar size based on the object's resource level
        // const resourceBarWidth = updatedResourceBar.width; // Get the width of the resource bar sprite
        updatedResourceBar.scale.x = Math.max(0, object.resources / object.maxResources); // Update the resource bar scale

        if (object.resources < 0) {
            object.resources = 0;
        }

        // Position the resource bar below the sprite
        updatedResourceBar.x = sprite.x - resourceBarWidth; // left align
        updatedResourceBar.y = sprite.y + sprite.height / 2 + 40;

        // Resource text update
        if (!resourceText) {
            // Create a new text object and add it to the array
            const style = new PIXI.TextStyle({
                fill: "#ffffff", // Text color (white)
                fontSize: 12, // Font size
                fontFamily: "Tektur, cursive", // Specify the 'Tektur' font family
            });
            resourceText = new PIXI.Text("", style);
            spriteMap.get(object.id)[6] = resourceText; // Add the text object to the array
            gameObjectsContainer.addChild(resourceText); // Add the text object to the container
        }

        // Update the text content to display the current resources
        resourceText.text = `🪨 ${Math.round(object.resources)}/${Math.round(object.maxResources)}`;

        // Position the text below the sprite
        resourceText.x = updatedResourceBar.x + resourceBarWidth + 5;
        resourceText.y = updatedResourceBar.y - 2;
    }

    if (object.score != null && object.level != null) {
        // Score and level text update
        if (!scoreLevelText) {
            // Create a new text object and add it to the array
            const style = new PIXI.TextStyle({
                fill: "#ffffff", // Text color (white)
                fontSize: 12, // Font size
                fontFamily: "Tektur, cursive", // Specify the 'Tektur' font family
                align: "center", // Align the text to the center horizontally
            });
            scoreLevelText = new PIXI.Text("", style);
            spriteMap.get(object.id)[7] = scoreLevelText; // Add the score and level text object to the array
            gameObjectsContainer.addChild(scoreLevelText); // Add the score and level text object to the container
        }

        const updatedScoreText = spriteMap.get(object.id)[7];

        // Update the text content to display the current score
        updatedScoreText.text = `Score: ${Math.round(object.score)} | Level: ${object.level}`;

        // Position the text below the sprite
        updatedScoreText.x = sprite.x - updatedScoreText.width / 2; // center align
        updatedScoreText.y = sprite.y - sprite.height / 2 - 25;
    }

    if (object.name != null) {
        // Name text update
        if (!nameText) {
            // Create a new text object and add it to the array
            const style = new PIXI.TextStyle({
                fill: "#ffffff", // Text color (white)
                fontSize: 14, // Font size
                fontFamily: "Tektur, cursive", // Specify the 'Tektur' font family
                align: "center", // Align the text to the center horizontally
            });
            nameText = new PIXI.Text("", style);
            spriteMap.get(object.id)[8] = nameText; // Add the score text object to the array
            gameObjectsContainer.addChild(nameText); // Add the score text object to the container
        }

        const updatedNameText = spriteMap.get(object.id)[8];

        // Update the text content to display the current score
        updatedNameText.text = `${object.name}`;

        // Position the text below the sprite
        updatedNameText.x = sprite.x - updatedNameText.width / 2; // center align
        updatedNameText.y = sprite.y - sprite.height / 2 - 50;
    }
}

function cleanupSprites(spriteMap, objectMap) {
    for (const [objectId, spriteArray] of spriteMap) {
        if (!objectMap.has(objectId)) {
            for (let thing of spriteArray) {
                if (thing != null) {
                    thing.destroy();
                }
            }
            spriteMap.delete(objectId);
            objectMap.delete(objectId);
        }
    }
}
  
function updatePlayers(roverTexture) {
    for (let [playerId, player] of playersOM) {
        createOrUpdateSprite(player, roverTexture, playersSM);
    }
    cleanupSprites(playersSM, playersOM);
}

function updateRocks(rockTexture) {
    for (let [rockId, rock] of rocksOM) {
        createOrUpdateSprite(rock, rockTexture, rocksSM);
    }
    cleanupSprites(rocksSM, rocksOM);
}

function updateBullets(bulletTexture) {
    for (let [bulletId, bullet] of bulletsOM) {
        createOrUpdateSprite(bullet, bulletTexture, bulletsSM);
    }
    cleanupSprites(bulletsSM, bulletsOM);
}

function updateBases(baseTexture) {
    for (let [baseId, base] of basesOM) {
        createOrUpdateSprite(base, baseTexture, basesSM);
    }
    cleanupSprites(basesSM, basesOM);
}

function updateChargingPorts(chargingportTexture) {
    for (let [chargingPortId, chargingPort] of chargingportsOM) {
        createOrUpdateSprite(chargingPort, chargingportTexture, chargingportsSM);
    }
    cleanupSprites(chargingportsSM, chargingportsOM);
}

function updateResourcePorts(resourceportTexture) {
    for (let [resourcePortId, resourcePort] of resourceportsOM) {
        createOrUpdateSprite(resourcePort, resourceportTexture, resourceportsSM);
    }
    cleanupSprites(resourceportsSM, resourceportsOM);
}

function updateSpawnPorts(spawnportTexture) {
    for (let [spawnPortId, spawnPort] of spawnportsOM) {
        createOrUpdateSprite(spawnPort, spawnportTexture, spawnportsSM);
    }
    cleanupSprites(spawnportsSM, spawnportsOM);
}

function updateSolarPanels(solarpanelTexture) {
    for (let [solarPanelId, solarPanel] of solarpanelsOM) {
        createOrUpdateSprite(solarPanel, solarpanelTexture, solarpanelsSM);
    }
    cleanupSprites(solarpanelsSM, solarpanelsOM);
}

function updateRTGs(rtgTexture) {
    for (let [rtgId, rtg] of rtgsOM) {
        createOrUpdateSprite(rtg, rtgTexture, rtgsSM);
    }
    cleanupSprites(rtgsSM, rtgsOM);
}

function showGameOverScreen(win, score, numKills, numDeaths) {
    // Create a new div element for the overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '999';

    // Create a new div element for the content
    const content = document.createElement('div');
    content.style.textAlign = 'center';
    content.style.color = '#fff';

    // Create the message based on win value
    const message = document.createElement('h1');
    message.textContent = win ? 'You Won!' : 'You Lost!';
    content.appendChild(message);

    // Create the score display
    const scoreText = document.createElement('p');
    scoreText.textContent = `Score: ${Math.round(score)}`;
    content.appendChild(scoreText);

    // Create the kills and deaths display
    const fragsText = document.createElement('p');
    fragsText.textContent = `Frags: ${numKills}, Deaths: ${numDeaths}`;
    content.appendChild(fragsText);

    // Create the "New Game" button
    const newGameButton = document.createElement('button');
    newGameButton.textContent = 'New Game';
    newGameButton.addEventListener('click', () => {
        // Reload the page to start a new game
        location.reload();
    });
    content.appendChild(newGameButton);

    // Add the content to the overlay
    overlay.appendChild(content);

    // Append the overlay to the body
    document.body.appendChild(overlay);
}