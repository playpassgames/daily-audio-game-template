import * as playpass from "playpass";
import { initGCInstant } from 'playpass/dist/esm/gcinstant';

import "./boilerplate/header.js";
import "./boilerplate/controls.js";
import "./boilerplate/modal.js";
import "./boilerplate/toggle.js";
import "./components/audio-ext-element";
import "./components/autocomplete-element";

import "./boilerplate/screens";
import "./screens/gameScreen/game-screen";
import "./screens/resultsScreen/results-screen";
import "./screens/helpScreen/help-screen";
import "./screens/statsScreen/stats-screen";
import "./screens/settingsScreen/settings-screen";

import { readyGame, showScreen } from "./boilerplate/screens";
import state from "./state";

function onHelpClick () {
    showScreen("#help-screen");
}

function onStatsClick () {
    showScreen("#stats-screen");
}

function onSettingsClick () {
    showScreen("#settings-screen");
}

(async function () {
    // Initialize the Playpass SDK
    await playpass.init({
        gameId: "YOUR_GAME_ID", // Do not edit!
    });

    await initGCInstant({
        amplitude: import.meta.env.VITE_AMPLITUDE_KEY,
    });

    await initGCInstant({
        amplitude: import.meta.env.VITE_AMPLITUDE_KEY,
    });

    await state.init();

    if (state.isDone()) {
        showScreen("#results-screen");
    } else {
        showScreen("#game-screen");
    }

    // Set the login state for our UI
    if (playpass.account.isLoggedIn()) {
        document.body.classList.add("isLoggedIn");
    }

    // Add UI event listeners
    document.querySelector("game-header .button[name=help]").onclick = onHelpClick;
    document.querySelector("game-header .button[name=stats]").onclick = onStatsClick;
    document.querySelector("game-header .button[name=settings]").onclick = onSettingsClick;

    readyGame();
})();
