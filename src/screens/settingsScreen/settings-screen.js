import { showScreen } from "../../boilerplate/screens";
import state from "../../state";

async function login () {
    await state.login();
}

function logout () {
    state.logout();
}

function back() {
    showScreen("#game-screen");
}

const template = document.querySelector("#settings-screen");

template.querySelector("button[name=back]").onclick = back;
template.querySelector("button[name=login]").onclick = login;
template.querySelector("button[name=logout]").onclick = logout;
