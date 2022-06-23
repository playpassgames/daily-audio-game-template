import * as playpass from "playpass";

import "./boilerplate/header.js";
import "./boilerplate/controls.js";
import "./boilerplate/modal.js";
import "./boilerplate/toggle.js";
import "./components/audio-ext-element";
import "./components/autocomplete-element";

import "./boilerplate/screens";
import "./screens/gameScreen/game-screen";
import "./screens/resultsScreen/results-screen";
import "./screens/homeScreen/home-screen";
import "./screens/statsScreen/stats-screen";
import "./screens/settingsScreen/settings-screen";

import { readyGame, showScreen } from "./boilerplate/screens";
import state from "./state";

function onHomeClick () {
    playpass.analytics.track('PageShow', {page: "#home-prompt", gameMode: state.gameMode});
    document.querySelector("#home-prompt").show();
}

function onHelpClick () {
    playpass.analytics.track('PageShow', {page: "#help-prompt", gameMode: state.gameMode});
    document.querySelector("#help-prompt").show();
}

function onStatsClick () {
    playpass.analytics.track('PageShow', {page: "#stats", gameMode: state.gameMode});
    document.querySelector("#stats").show();
}

function onSettingsClick () {
    showScreen("#settings-screen");
}

(async function () {
    // get mode and type from share link
    const { mode } = playpass.getLinkData() ?? {};

    // Initialize the Playpass SDK
    await playpass.init({
        gameId: "YOUR_GAME_ID", // Do not edit!
    });

    await state.init();

    state.setMode(mode ?? state.gameMode);
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
    document.querySelector("game-header .button[name=home]").onclick = onHomeClick;
    document.querySelector("game-header .button[name=help]").onclick = onHelpClick;
    document.querySelector("game-header .button[name=stats]").onclick = onStatsClick;
    document.querySelector("game-header .button[name=settings]").onclick = onSettingsClick;

    readyGame();
})();
