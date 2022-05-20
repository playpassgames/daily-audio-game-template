import * as playpass from "playpass";
import { showScreen } from "../../boilerplate/screens";
import * as timer from "../../boilerplate/timer";
import state from "../../state";
import { ranks } from "../../../content/songs.json";

function share() {
    // Create a link to our game
    const link = playpass.createLink();

    const emojis = state.isSolved() ? "✅" : "❌";

    // Share some text along with our link
    playpass.share({
        text: `🎵 Daily Song #${(state.store.day + 1).toString()}\n${emojis}\n${link}`,
    });
}

let timerUpdate;

const template = document.querySelector("#results-screen");
const player = document.querySelector('audio-ext');

template.querySelector("button[name=share]").onclick = share;
template.addEventListener("active", () => {
    if (!state.isDone()) {
        showScreen("#game-screen");
        return;
    }

    // Set the first results line
    template.querySelector("#resultLine1").textContent = state.getCurrentAnswer();

    // Set the second results line
    template.querySelector("#resultLine2").textContent = state.isSolved() ? ranks[state.store.guesses.length - 1] : 'Failed';

    const nextGameAt = timer.getNextGameTime();
    timerUpdate = setInterval(() => {
        const until = timer.getUntil(nextGameAt);
        template.querySelector("#timeLeft").textContent = `${until.hours}h ${until.minutes}m ${until.seconds}s until next song`;
    }, 1000);

    player.reset();
});

template.addEventListener("inactive", () => {
    if (timerUpdate) {
        clearInterval(timerUpdate);
    }
});
