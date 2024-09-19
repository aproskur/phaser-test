import { Schema, defineTypes } from '@colyseus/schema';

// Define the Player schema
class Player extends Schema {
    constructor() {
        super();
        this.x = 750;
        this.y = 450;
        this.position = 0;
        this.spriteType = "default";
    }
}

// Define the types for Player schema using defineTypes
defineTypes(Player, {
    x: "number",
    y: "number",
    position: "number",
    spriteType: "string"
});

export default Player;
