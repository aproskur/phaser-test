import React, { useEffect } from 'react';
import Phaser from 'phaser';
import { Client } from 'colyseus.js';
import Player from '../schemas/Player'; // Import Player schema
import State from '../schemas/State'; // Import State schema
import playerImage from '../assets/PNG/1.png';
import mapImage from '../assets/example_map.png';
import redCity from '../assets/red-city.png';
import dice1 from '../assets/1_dot.png';
import dice2 from '../assets/2_dots.png';
import dice3 from '../assets/3_dots.png';
import dice4 from '../assets/4_dots.png';
import dice5 from '../assets/5_dots.png';
import dice6 from '../assets/6_dots.png';
import beeImage from '../assets/1.png';

const Game = () => {
    useEffect(() => {
        const client = new Client('ws://localhost:2567'); // Connect to Colyseus server
        let room;
        const players = {}; // Store player sprites
        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 500,
            parent: 'phaser-game',
            scene: {
                preload: preload,
                create: create,
                update: update
            }
        };

        const game = new Phaser.Game(config);

        function preload() {
            //this.load.image('background', redCity);
            this.load.image('background', mapImage);
            this.load.image('player', playerImage);
            this.load.image('sprite1', playerImage);
            this.load.image('sprite2', beeImage);
            this.load.image('dice1', dice1);
            this.load.image('dice2', dice2);
            this.load.image('dice3', dice3);
            this.load.image('dice4', dice4);
            this.load.image('dice5', dice5);
            this.load.image('dice6', dice6);
        }

        function create() {
            const scene = this;

            // Add the background image
            const bg = scene.add.image(400, 250, 'background');
            bg.setDisplaySize(800, 500);

            // Create the path
            const path = new Phaser.Curves.Spline([
                750, 450,
                650, 350,
                500, 300,
                350, 200,
                200, 100,
                50, 50
            ]);

            console.log('Path points:', path.getPoints());

            const graphics = scene.add.graphics();
            graphics.lineStyle(5, 0xffffff, 1);
            path.draw(graphics, 64);

            // Create a sprite to show the dice roll (initially hidden)
            let diceSprite = scene.add.sprite(400, 100, 'dice1').setVisible(true).setScale(0.25);
            console.log('Dice sprite created');


            /*
            // Create a message text for "Not your turn yet!"
            let notYourTurnText = scene.add.text(500, 500, 'Подожди свой ход, пожалуйста!', { fill: '#ff0000', fontSize: '24px' });
            notYourTurnText.setVisible(false); // Initially hide it */

            // Attempt to join the room
            client.joinOrCreate('game_room').then((joinedRoom) => {
                room = joinedRoom;


                /*
                // Listen for the "newTurn" message
                room.onMessage("newTurn", (data) => {
                    const currentTurn = data.sessionId;

                    if (currentTurn === room.sessionId) {
                        console.log("It's your turn!");
                        rollDiceButton.setVisible(true);
                    } else {
                        console.log(`It's ${currentTurn}'s turn.`);
                        rollDiceButton.setVisible(false);
                    }
                });  */
                console.log('Joined room:', room);
                room.onMessage("diceRolled", (data) => {
                    console.log(`Player ${data.sessionId} rolled a ${data.diceValue} and moved to position ${data.position}`);

                    if (players[data.sessionId]) {
                        const playerSprite = players[data.sessionId];

                        // Clamp the new position to ensure it's valid
                        const newPosition = Math.max(0, Math.min(1, data.position)); // Ensure it's between 0 and 1

                        // Get the current t value (position on the path)
                        const fromPosition = playerSprite.t; // This should be between 0 and 1

                        // Ensure the path is set (IT WAS ALREADY SET)
                        //playerSprite.setPath(path); // Set the path for the player sprite

                        console.log(`Current t value before moving: ${fromPosition}`);

                        // Start following the path
                        playerSprite.startFollow({
                            duration: data.diceValue * 1000, // Duration based on dice value
                            positionOnPath: true,
                            from: fromPosition, // Start from the current position
                            to: newPosition,     // Move to the new position
                            ease: 'Linear',
                            onComplete: () => {
                                console.log(`Player ${data.sessionId} finished moving to position ${newPosition}`);
                                playerSprite.t = newPosition; // Update the t value to the new position
                            }
                        });
                    } else {
                        console.error(`Player sprite for ${data.sessionId} not found.`);
                    }
                });






                // Handle the 'end' message
                room.onMessage('end', (message) => {
                    const { id } = message;
                    if (id === room.sessionId) {
                        alert('Ура! Победа!');
                    } else {
                        console.log(`Player ${id} reached the end of the path.`);
                    }
                });


                // Handle state changes
                room.state.players.onAdd((player, sessionId) => {
                    console.log('Player added:', player);
                    console.log('Player ID:', sessionId);
                    console.log('Player Schema:', player.toJSON());
                    console.log(`Client: Player ${sessionId} added with initial position: ${player.position}`);
                    createPlayerSprite(scene, path, player, sessionId);

                    /*
                                        player.onChange = (changes) => {
                                            changes.forEach(change => {
                                                if (change.field === "position" && players[sessionId]) {
                                                    console.log(`Client: Player ${sessionId} position changed to: ${player.position}`);
                                                    players[sessionId].startFollow({
                                                        duration: (player.position - players[sessionId].t) * 1000,
                                                        t: player.position,
                                                        ease: 'Linear',
                                                        onComplete: () => {
                                                            console.log(`Client: Player ${sessionId} finished moving to position ${player.position}`);
                                                        }
                                                    });
                                                }
                                            });
                                        }; */
                });


                function rollDice(scene) {
                    if (room) {
                        console.log('Rolling dice...');
                        const diceValue = Math.floor(Math.random() * 6) + 1; // Roll a number between 1 and 6

                        // Update the dice sprite based on the rolled value
                        diceSprite.setTexture(`dice${diceValue}`); // Set the texture to the corresponding dice face

                        // Send a dice roll message to the server
                        room.send('rollDice');

                        scene.tweens.add({
                            targets: diceSprite,
                            scale: 0.5,
                            duration: 100,
                            yoyo: true,
                            repeat: 0,
                            onComplete: () => {
                                console.log(`Dice rolled: ${diceValue}`);
                            }
                        });
                    }
                }

                /*
                                // Create the "Roll Dice" button and position it
                                let rollDiceButton = scene.add.text(300, 450, 'Бросить Кубик', { fill: '#fff', fontSize: '18px' })
                                    .setInteractive()
                                    .on('pointerdown', () => {
                                        if (room.state.currentTurn === room.sessionId) {
                                            rollDice(scene);
                                        } else {
                                            // Show "Not your turn" message
                                            notYourTurnText.setVisible(true);
                
                
                                            scene.time.delayedCall(3000, () => {
                                                notYourTurnText.setVisible(false);
                                            });
                                        }
                                    });
                            }).catch((err) => {
                                console.error('Error joining room:', err);
                            });
                        }
                */ // Create the "Roll Dice" button and position it
                let rollDiceButton = scene.add.text(300, 450, 'Бросить Кубик', { fill: '#fff', fontSize: '18px' })
                    .setInteractive()
                    .on('pointerdown', () => rollDice(scene));
            }).catch((err) => {
                console.error('Error joining room:', err);
            });
        }



        function createPlayerSprite(scene, path, player, sessionId) {
            console.log("CREATING PLAYER")
            console.log(`Attempting to create sprite for player ${sessionId} at (${player.x}, ${player.y})`);
            let spriteKey = player.spriteType;
            console.log("SPRITE", spriteKey);

            // Create the player sprite
            const playerSprite = scene.add.follower(path, player.x, player.y, spriteKey);
            //
            playerSprite.t = player.position;
            playerSprite.setScale(0.2);

            // Store the sprite reference for future updates
            players[sessionId] = playerSprite;
            console.log(`Sprite created for player ${sessionId} at (${player.x}, ${player.y})`);
        }

        function update() {
            // Logic to update every frame if needed
        }

        return () => {
            game.destroy(true);
            if (room) {
                room.leave();
            }
        };
    }, []);

    return <div id="phaser-game" style={{ width: '800px', height: '500px' }} />;
};

export default Game;
