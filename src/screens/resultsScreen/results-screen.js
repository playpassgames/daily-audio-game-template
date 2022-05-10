import * as playpass from "playpass";
import { showScreen } from "../../boilerplate/screens";
import * as timer from "../../boilerplate/timer";
import state from "../../state";

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
    if (state.rolledDice.length === 0) {
        showScreen("#game-screen");
        return;
    }

    // Set the first results line
    const points = state.rolledDice.reduce((sum, roll) => sum + (roll + 1), 0);
    template.querySelector("#resultLine1").textContent = `${state.rolledDice.map(roll => DICE_EMOJI[roll]).join(" + ")} = ${points}`;

    // Set the second results line
    let rank;
    if (points > 16) {
        rank = "LEGENDARY LUCK!";
    } else if (points > 14) {
        rank = "Golden Luck!";
    } else if (points > 12) {
        rank = "Favored Luck";
    } else if (points > 10) {
        rank = "Average Luck";
    } else if (points > 8) {
        rank = "Slightly Unlucky";
    } else if (points > 6) {
        rank = "Luckless";
    } else if (points > 4) {
        rank = "Unfavored Luck";
    } else if (points > 2) {
        rank = "Disastrous Luck!";
    } else {
        rank = "CURSED!";
    }
    template.querySelector("#resultLine2").textContent = rank;

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
