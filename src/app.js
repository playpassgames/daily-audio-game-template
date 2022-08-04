import * as playpass from "playpass";
import content from "./boilerplate/content";
import share from "./share";

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

function show(screens) {
    screens.forEach(screen => document.querySelector(screen).show())
}

function hide(screens) {
    screens.forEach(screen => document.querySelector(screen).hide())
}

function showShare() {
    share();
    hide(["#stats", "#about-screen", "#help-prompt"]);
}

function hideShare() {
    let elements = document.getElementsByTagName("playpass-share");
    if (elements && elements.length > 0) {
        elements.item(0).remove();
    }
}

function onHomeClick () {
    playpass.analytics.track('PageShow', {page: "#about-screen", gameMode: state.gameMode});
    show(["#about-screen"]);
    hide(["#help-prompt", "#stats"]);
    hideShare();
}

function onHelpClick () {
    playpass.analytics.track('PageShow', {page: "#help-prompt", gameMode: state.gameMode});
    show(["#help-prompt"]);
    hide(["#about-screen", "#stats"]);
    hideShare();
}

function onStatsClick () {
    playpass.analytics.track('PageShow', {page: "#stats", gameMode: state.gameMode});
    show(["#stats"]);
    hide(["#about-screen", "#help-prompt"]);
    hideShare();
}

function showGame() {
    showScreen("#game-screen");
    hide(["#stats", "#about-screen", "#help-prompt"]);
    hideShare();
}

function showResults() {
    showScreen("#results-screen");
    hide(["#stats", "#about-screen", "#help-prompt"]);
    hideShare();
}

function onSettingsClick () {
    showScreen("#settings-screen");
    hide(["#stats", "#about-screen", "#help-prompt"]);
    hideShare();
}

const screens = {
    home: onHomeClick,
    help: onHelpClick,
    stats: onStatsClick,
    settings: onSettingsClick,
    game: showGame,
    results: showResults,
    share: showShare
}

// Add UI event listeners
document.querySelector("game-header .button[name=home]").onclick = onHomeClick;
document.querySelector("game-header .button[name=help]").onclick = onHelpClick;
document.querySelector("game-header .button[name=stats]").onclick = onStatsClick;
document.querySelector("game-header .button[name=settings]").onclick = onSettingsClick;

const bootstrap = async () => {
    await state.init();
    console.log(state.getCurrentAnswer());

    // get mode and type from share link
    const { mode } = playpass.getLinkData() ?? {};

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

    readyGame();
}

(async function () {
    content.eventHandler('playpass-content-cms', async () => {
        await state.init();
        showScreen("#game-screen");
        readyGame();
    });

    content.eventHandler('playpass-style-cms-screen', async (event) => {
        const screenName = event.data.screenName;
        const handler = screens[screenName];
        if (handler) {
            handler();
        }
    });

    await bootstrap();
})();
