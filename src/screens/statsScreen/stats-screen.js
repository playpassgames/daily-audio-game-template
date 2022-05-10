import { showScreen } from "../../boilerplate/screens";

function back() {
    showScreen("#game-screen");
}

const template = document.querySelector("#stats-screen");

template.querySelector("button[name=back]").onclick = back;
