import * as playpass from "playpass";
import { asyncHandler, showScreen } from "../../boilerplate/screens";
import state from "../../state";

async function roll() {
    await state.rollDice();
    showScreen("#results-screen");
}

const template = document.querySelector("#game-screen");

template.querySelector("button[name=roll]").onclick = roll;
template.addEventListener(
    "active",
    asyncHandler(async () => {
        // Take new users to help screen first
        const sawTutorial = await playpass.storage.get("sawTutorial");
        if (!sawTutorial) {
            showScreen("#help-screen");
            return;
        }

        const lastDay = await playpass.storage.get("lastDay");
        if (lastDay == state.getCurrentDay()) {
            // The player has already played today, load the dice and show the results screen
            state.rolledDice = await playpass.storage.get("lastDice");
            showScreen("#results-screen");
        } else {
            // The player hasn't yet played today, show the playing screen
            state.rolledDice = [];
        }
    }),
);