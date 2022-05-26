import * as playpass from "playpass";

import "./boilerplate/header.js";
import "./boilerplate/controls.js";
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
        gameId: "3e7645a1-c7e1-401b-a36f-cbdf7624d13d", // Do not edit!
    });

    await state.init();

    await document.querySelector('audio-ext').setSong({
        type: state.correctAnswer.type,
        src: state.correctAnswer.src,
    });

    showScreen("#game-screen");

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
