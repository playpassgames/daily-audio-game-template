import * as playpass from "playpass";
import { asyncHandler, showScreen } from "../../boilerplate/screens";
import state from "../../state";
import { songs, hints } from "../../../content/songs.json";

import "./game-screen.css";

const template = document.querySelector("#game-screen");

const player = document.querySelector('audio-ext');
const progressBar = template.querySelector('.progress .fill');
let progressUpdateInterval;

template.querySelector("button[name=play]").onclick = () => {
    player.play();
};

template.addEventListener(
    "active",
    asyncHandler(async () => {
        // Take new users to help screen first
        const sawTutorial = await playpass.storage.get("sawTutorial");
        if (!sawTutorial) {
            showScreen("#help-screen");
            return;
        }

        if (state.isSolved()) {
            showScreen("#results-screen");
            return;
        }

        const guessInput = template.querySelector("auto-complete");
        guessInput.choices = songs.map(({ name }) => name);

        progressUpdateInterval = setInterval(() => {
            progressBar.style.width = `${(player.progress * 100) ?? 0}%`;
        }, 1000.0 / 60.0);

        template.querySelector("form").onsubmit = event => {
            event.preventDefault();

            const guess = guessInput.value?.trim();
            
            // ignore empty forms
            if (!guess) {
                return;
            }

            state.submit(guess);

            if (state.isDone()) {
                showScreen("#results-screen");
            } else {
                guessInput.value = "";
                updatePlayingScreen();
            }
        };

        updatePlayingScreen();
    }),
);

template.addEventListener(
    "inactive",
    () => {
        clearInterval(progressUpdateInterval);
    }
);

function updatePlayingScreen () {
    const results = template.querySelector(`.results`);
    results.innerHTML = '';

    for (let ii = 0; ii < state.attempts; ++ii) {
        const guess = document.createElement("li");
        guess.classList.add('result');
        if (ii < state.store.guesses.length) {
            guess.setAttribute("s", state.isSolved() && i === state.store.guesses.length - 1 ? "b" : "c");
            guess.textContent = state.store.guesses[ii];
        }
        results.appendChild(guess);
    }

    player.setSong({
        type: state.correctAnswer.type,
        src: state.correctAnswer.src,
        range: (state.correctAnswer.hints ?? hints)[
            state.store.guesses.length
        ],
    });
}