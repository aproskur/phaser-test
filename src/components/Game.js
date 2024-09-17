import React, { useEffect } from 'react';
import Phaser from 'phaser';
import playerImage from '../assets/Biplane.png';
import mapImage from '../assets/example_map.png';
import dice1 from '../assets/1_dot.png';
import dice2 from '../assets/2_dots.png';
import dice3 from '../assets/3_dots.png';
import dice4 from '../assets/4_dots.png';
import dice5 from '../assets/5_dots.png';
import dice6 from '../assets/6_dots.png';

const Game = () => {
    useEffect(() => {
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
            this.load.image('background', mapImage);
            this.load.image('player', playerImage);

            this.load.image('dice1', dice1);
            this.load.image('dice2', dice2);
            this.load.image('dice3', dice3);
            this.load.image('dice4', dice4);
            this.load.image('dice5', dice5);
            this.load.image('dice6', dice6);
        }

        let player;
        let playerPosition = 0; // Initialise player position along the path
        let rollDiceButton; // Reference to the "Roll Dice" button
        let diceSprite;

        function create() {
            const scene = this; // Store the scene reference

            // Add the background image
            const bg = scene.add.image(400, 250, 'background');
            bg.setDisplaySize(800, 500); // Scale to fit the game window

            // Create the path
            const path = new Phaser.Curves.Spline([
                750, 450,  // Start point at the bottom right corner
                650, 350,
                500, 300,
                350, 200,
                200, 100,
                50, 50    // End point near the top left
            ]);

            // Draw the path for visualization (optional)
            const graphics = scene.add.graphics();
            graphics.lineStyle(2, 0xffffff, 1);
            path.draw(graphics, 64);

            // Add the player as a follower of the path
            player = scene.add.follower(path, 750, 450, 'player');
            player.setScale(0.1);

            // Create the "Roll Dice" button and position it
            rollDiceButton = scene.add.text(650, 450, 'Бросить кубик', { fill: '#fff', fontSize: '18px' })
                .setInteractive()
                .on('pointerdown', () => rollDice(scene)); // Pass the sene reference to rollDice

            // Create a sprite to show the dice roll (initially hidden)
            diceSprite = scene.add.sprite(400, 100, 'dice1').setVisible(false).setScale(0.5);
        }

        function rollDice(scene) {
            // Prevent multiple rolls while moving
            if (player.isMoving) return;

            const diceValue = Phaser.Math.Between(1, 6);
            console.log('Dice rolled:', diceValue);

            // Show the dice with result value
            diceSprite.setTexture('dice' + diceValue);
            diceSprite.setVisible(true); // Show the dice

            const moveDistance = diceValue * 0.05; //Distance
            let newPlayerPosition = playerPosition + moveDistance;

            // Ensure playerPosition does not exceed 1 . 1 is en of path
            if (newPlayerPosition > 1) newPlayerPosition = 1;

            // Mark the player as moving!!!
            player.isMoving = true;
            rollDiceButton.disableInteractive(); // Disable the button during movement

            // Tween to move the player along the path
            player.startFollow({
                duration: diceValue * 1000,
                positionOnPath: true,
                from: playerPosition, // Start from current position
                to: newPlayerPosition, // Move to the new position along the path
                ease: 'Linear',
                onComplete: () => {
                    playerPosition = newPlayerPosition; // Update the current player position
                    console.log('Player position after move:', playerPosition);

                    // Check for win condition
                    if (playerPosition >= 1) {
                        alert('Победа!');
                    }

                    // Allow another roll
                    player.isMoving = false;
                    rollDiceButton.setInteractive(); // Reenable the button
                }
            });
        }

        function update() {

        }

        // Clean up Phaser on component unmounting
        return () => {
            game.destroy(true);
        };
    }, []);

    return <div id="phaser-game" style={{ width: '800px', height: '500px' }} />;
};

export default Game;
