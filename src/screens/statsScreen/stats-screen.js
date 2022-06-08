import { showScreen } from "../../boilerplate/screens";
import state from "../../state";

function back() {
    showScreen("#game-screen");
}

const template = document.querySelector("#stats-screen");

template.querySelector("button[name=back]").onclick = back;
template.addEventListener("active", () => {
    const numWins = state.store.wins.reduce((cur, prev) => (cur + prev) || 0, 0);
    template.querySelector("#winStats").textContent = `You won ${numWins} times.`;
});
