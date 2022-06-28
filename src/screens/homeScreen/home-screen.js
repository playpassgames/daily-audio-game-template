import * as playpass from "playpass";
import { showScreen } from "../../boilerplate/screens";
import state, { Mode } from "../../state";

const template = document.querySelector("#home-prompt");

template.querySelector("button[name=timedMode]").addEventListener('click', () => {
    playpass.analytics.track('DailyPlaySongClicked', {gameMode: state.gameMode});
    state.setMode(Mode.Time);
    showScreen("#game-screen");
});

template.querySelector("button[name=freeMode]").addEventListener('click', () => {
    playpass.analytics.track('FreePlaySongClicked', {gameMode: state.gameMode});
    state.setMode(Mode.Free);
    showScreen("#game-screen");
});

template.addEventListener("active", () => {
    playpass.storage.set("sawTutorial", true);
});
