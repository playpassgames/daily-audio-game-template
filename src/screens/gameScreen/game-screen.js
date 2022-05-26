import * as playpass from "playpass";
import { asyncHandler, showScreen } from "../../boilerplate/screens";
import state from "../../state";
import { songs, autocomplete } from "../../../content/songs.json";

import "./game-screen.css";

let progressUpdateInterval, currentRange;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

const template = document.querySelector("#game-screen");
const player = document.querySelector('audio-ext');

const timeline = template.querySelector('#progress .fill[name=range]');
const progressBar = template.querySelector('#progress .fill[name=time]');
const nowLabel = template.querySelector('span[name=now]');
const durationLabel = template.querySelector('span[name=duration]');
const guessInput = template.querySelector("auto-complete");

guessInput.choices = [
    // pad with extra song names to make the game more challenging
    ...autocomplete,
    // always include the actual songs that you can guess
    ...songs.map(({ name }) => name),
];

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

const playSong = () => {
    player.play();
}

template.querySelector("button[name=play]").onclick = () => {
    playSong();
};

template.querySelector("button[name=skip]").onclick = (e) => {
    e.preventDefault();

    state.submit();

    if (state.isDone()) {
        showScreen("#results-screen");
    } else {
        guessInput.value = "";
        updatePlayingScreen();
    }
};

template.addEventListener(
    "active",
    asyncHandler(async ({ detail: { previous } }) => {
        // Take new users to help screen first
        const sawTutorial = await playpass.storage.get("sawTutorial");
        if (!sawTutorial) {
            showScreen("#help-screen");
            return;
        }

        if (state.isDone()) {
            showScreen("#results-screen");
            return;
        }

        progressUpdateInterval = setInterval(() => {
            const { begin } = state.getCurrentRange();
            const songDuration = player.duration;
        
            progressBar.style.left = `${(begin / songDuration) * 100}%`;
            progressBar.style.right = `${(1 - ((begin + player.time) / songDuration)) * 100}%`;

            nowLabel.textContent = formatTime(player.time);

        }, 1000.0 / 60.0);

        updatePlayingScreen();

        if (previous === "#help-screen") {
            playSong();
        }
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
            if (state.isSolved() && ii === state.store.guesses.length - 1) {
                guess.setAttribute("s", "b");
            } else if (!state.store.guesses[ii]) {
                guess.setAttribute("s", "_");
            } else {
                guess.setAttribute("s", "c");
            }
            
            guess.textContent = state.store.guesses[ii] ?? 'Skipped';
        }
        results.appendChild(guess);
    }

    const { begin, end } = state.getCurrentRange();

    const duration = end - begin;
    const songDuration = player.duration;
    
    currentRange = { begin, end };
    player.clear(currentRange);

    durationLabel.textContent = formatTime(duration);

    timeline.style.left = `${(begin / songDuration) * 100}%`;
    timeline.style.right = `${(1 - end / songDuration) * 100}%`;
}
