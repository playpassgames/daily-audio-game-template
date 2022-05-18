import * as playpass from "playpass";
import { showScreen } from "../../boilerplate/screens";
import * as timer from "../../boilerplate/timer";
import state from "../../state";
import { ranks } from "../../../content/songs.json";

const DICE_EMOJI = [ "⚀", "⚁", "⚂", "⚃", "⚄", "⚅" ];

function share() {
    // Create a link to our game
    const link = playpass.createLink();

    // Share some text along with our link
    playpass.share({
        text: `Today's dice ${state.rolledDice.map(roll => DICE_EMOJI[roll]).join(" ")} ${link}`,
    });
}

let timerUpdate;

const template = document.querySelector("#results-screen");

template.querySelector("button[name=share]").onclick = share;
template.addEventListener("active", () => {
    if (!state.isDone()) {
        showScreen("#game-screen");
        return;
    }

    // Set the first results line
    template.querySelector("#resultLine1").textContent = state.getCurrentAnswer();

    // Set the second results line
    template.querySelector("#resultLine2").textContent = ranks[state.store.guesses.length - 1];

    const nextGameAt = timer.getNextGameTime();
    timerUpdate = setInterval(() => {
        const until = timer.getUntil(nextGameAt);
        template.querySelector("#timeLeft").textContent = `${until.hours}h ${until.minutes}m ${until.seconds}s until next roll`;
    }, 1000);
});

template.addEventListener("inactive", () => {
    if (timerUpdate) {
        clearInterval(timerUpdate);
    }
});
