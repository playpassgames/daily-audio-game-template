import * as playpass from "playpass";
import { showScreen } from "../../boilerplate/screens";
import state, { Mode } from "../../state";

const template = document.querySelector("#help-screen");

template.querySelector("button[name=timedMode]").addEventListener('click', () => {
    state.setMode(Mode.Time);
    showScreen("#game-screen");
});

template.querySelector("button[name=freeMode]").addEventListener('click', () => {
    state.setMode(Mode.Free);
    showScreen("#game-screen");
});

template.addEventListener("active", () => {
    playpass.storage.set("sawTutorial", true);
});
