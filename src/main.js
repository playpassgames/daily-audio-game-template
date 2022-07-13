import * as playpass from "playpass";

import content from "./boilerplate/content";

import { PLAYPASS_GAME_ID } from "./constants";

Promise.all([
    // Initialize the Playpass SDK
    playpass.init({
        gameId: PLAYPASS_GAME_ID, // Do not edit!
    }),
    // preload content before loading any other modules
    content.init(),
]).then(() => {
    // load the game
    import("./app.js");
});
