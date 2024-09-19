import { Schema, defineTypes, MapSchema } from '@colyseus/schema';
import Player from './Player'; // Import Player schema

// Define the State schema
class State extends Schema {
    constructor() {
        super();
        this.players = new MapSchema();
    }
}

// Define the types for State schema using defineTypes
defineTypes(State, {
    players: { map: Player }
});

export default State;
