import * as playpass from "playpass";
import {asyncHandler, showScreen} from "../../boilerplate/screens";
import state, {Mode} from "../../state";
import {songs, autocomplete} from "../../../content/songs.json";

import "./game-screen.css";

let progressUpdateInterval, currentRange;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

const template = document.querySelector("#game-screen");
const player = template.querySelector('audio-ext');

const timeline = template.querySelector('#progress .fill[name=range]');
const progressBar = template.querySelector('#progress .fill[name=time]');
const nowLabel = template.querySelector('span[name=now]');
const durationLabel = template.querySelector('span[name=duration]');
const guessInput = template.querySelector("auto-complete");
const submitButton = template.querySelector("game-controls form button[name=submit]");

let puzzleStarted = false;

guessInput.choices = [
    // pad with extra song names to make the game more challenging
    ...autocomplete.map(value => {
        if (typeof value === "string") {
            const artist = value.substring(value.lastIndexOf("/") + 1).trim();
            const name = value.substring(0, value.lastIndexOf("/")).trim();
            return { key: name, value: `${artist} - ${name}`, extra: artist };
        }
        const { name, artist } = value;
        return {key: name, value: `${artist} - ${name}`, extra: artist};
    }),
    // always include the actual songs that you can guess
    ...songs.map(({name, artist}) => ({key: name, value: `${artist} - ${name}`, extra: artist})),
];

guessInput.input.addEventListener("change", (e) => {
    var guess = e.target.value;

    const isBlank = guess === '';
    const invalidGuess = !guessInput.isValidValue(guess);

    // ignore empty forms
    // ignore guesses that do not match anything in autocomplete
    submitButton.disabled = isBlank || invalidGuess;
});

const focusInput = () => {
    guessInput.input.focus();
};

template.querySelector("game-controls form").onsubmit = event => {
    playpass.analytics.track('SubmitClicked');
    event.preventDefault();

    const guess = guessInput.value?.trim();

    // ignore empty forms
    if (!guess) {
        return;
    }

    state.submit(guess);
    guessInput.clear();

    if (state.isDone()) {
        endGameAnalytics();
        showScreen("#results-screen");
    } else {
        guessInput.value = "";
        updatePlayingScreen();
    }
};

const playSong = () => {
    player.play();
    focusInput();
}

template.querySelector("button[name=play]").onclick = (e) => {
    playpass.analytics.track('PlayClicked');
    e.preventDefault();
    e.stopPropagation();

    playSong();
};

template.querySelector("button[name=skip]").onclick = (e) => {
    playpass.analytics.track('SkipClicked');
    e.preventDefault();

    startPuzzleAnalytics();
    state.submit();

    if (state.isDone()) {
        endGameAnalytics();
        showScreen("#results-screen");
    } else {
        guessInput.value = "";
        updatePlayingScreen();
    }
};

guessInput.addEventListener('input', () => {
    startPuzzleAnalytics();
});

template.addEventListener(
    "active",
    asyncHandler(async ({detail: {previous}}) => {
        if (state.isDone()) {
            showScreen("#results-screen");
            return;
        }

        // Take new users to help screen first
        const sawTutorial = await playpass.storage.get("sawTutorial");
        if (!sawTutorial) {
            template.querySelector("#help-prompt").show();
        }

        guessInput.clear();

        if (state.gameMode !== Mode.Time) {
            template.querySelector("p[mode=free]").textContent = `Song #${state.wins + 1}`;
        }

        await player.setSong({
            type: state.correctAnswer.type,
            src: state.correctAnswer.src,
        });

        progressUpdateInterval = setInterval(() => {
            const {begin} = currentRange;
            const songDuration = player.duration;

            progressBar.style.left = `${(begin / songDuration) * 100}%`;
            progressBar.style.right = `${(1 - ((begin + player.time) / songDuration)) * 100}%`;

            nowLabel.textContent = formatTime(player.time);

        }, 1000.0 / 60.0);

        updatePlayingScreen();

        // autoplay the current clip if user is actively within the game
        if (previous) {
            playpass.analytics.track('SongAutoPlay', {'previousScreen': previous});
            playSong();
        }
    }),
);

template.addEventListener(
    "inactive",
    () => {
        clearInterval(progressUpdateInterval);
        player.stop();
    }
);

function updatePlayingScreen() {
    const results = template.querySelector(`.results`);
    results.replaceChildren([]);

    for (let i = 0; i < state.attempts; ++i) {
        const guess = document.createElement("li");
        guess.classList.add('result');
        if (i < state.guesses.length) {
            if (state.isSolved() && i === state.guesses.length - 1) {
                guess.setAttribute("s", "b");
            } else if (!state.guesses[i]) {
                guess.setAttribute("s", "_");
            } else {
                guess.setAttribute("s", "c");
            }

            guess.textContent = state.guesses[i] ?? 'Skipped';
        }

        guess.addEventListener('click', focusInput);
        results.appendChild(guess);
    }

    let {begin, end} = state.getCurrentRange();
    const duration = end - begin;
    const songDuration = player.duration;

    if (state.gameMode === Mode.Free) {
        begin = Math.random() * (songDuration - duration);
        end = begin + duration;
    }

    currentRange = {begin, end};

    player.clear(currentRange);

    durationLabel.textContent = formatTime(duration);

    timeline.style.left = `${(begin / songDuration) * 100}%`;
    timeline.style.right = `${(1 - end / songDuration) * 100}%`;
}

function endGameAnalytics() {
    if (!state.isDone()) {
        return;
    }

    playpass.analytics.track('PuzzleComplete', {
        puzzleResult: state.isSolved() ? "success" : "fail",
        numGuesses: state.guesses.length,
        gameMode: state.gameMode
    });

    //reset for starting the next puzzle
    puzzleStarted = false;
}

function startPuzzleAnalytics(){
    if (!puzzleStarted) {
        playpass.analytics.track('PuzzleStarted', {gameMode: state.gameMode});
        puzzleStarted = true;
    }
}
