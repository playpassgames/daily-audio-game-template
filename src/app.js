import * as playpass from "playpass";
import content from "./boilerplate/content";

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

import {
    onHelpClick,
    onHomeClick,
    onSettingsClick,
    onStatsClick,
    readyGame,
    screenHandlers,
    showScreen
} from "./boilerplate/screens";
import state from "./state";

// Add UI event listeners
document.querySelector("game-header .button[name=home]").onclick = onHomeClick;
document.querySelector("game-header .button[name=help]").onclick = onHelpClick;
document.querySelector("game-header .button[name=stats]").onclick = onStatsClick;
document.querySelector("game-header .button[name=settings]").onclick = onSettingsClick;

const bootstrap = async () => {
    await state.init();

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
        const action = event.data.action;
        const handler = screenHandlers[screenName][action];
        if (handler) {
            handler();
        }
    });

    await bootstrap();
})();
