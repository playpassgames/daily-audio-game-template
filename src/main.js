import * as playpass from "playpass";

import "./boilerplate/common.css";
import "./boilerplate/header.js";
import "./main.css";

import "./boilerplate/screens";
import "./screens/gameScreen/game-screen";
import "./screens/resultsScreen/results-screen";
import "./screens/helpScreen/help-screen";
import "./screens/statsScreen/stats-screen";
import "./screens/settingsScreen/settings-screen";

import { showScreen } from "./boilerplate/screens";
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

    await state.init();

    showScreen("#game-screen");

    // Set the login state for our UI
    if (playpass.account.isLoggedIn()) {
        document.body.classList.add("isLoggedIn");
    }

    // Add UI event listeners
    document.querySelector("game-header .button[name=help]").onclick = onHelpClick;
    document.querySelector("game-header .button[name=stats]").onclick = onStatsClick;
    document.querySelector("game-header .button[name=settings]").onclick = onSettingsClick;
})();
