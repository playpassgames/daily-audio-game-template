import {showScreen} from "../../boilerplate/screens";
import * as timer from "../../boilerplate/timer";
import state, {Mode} from "../../state";
import share, {getEmojis} from "../../share";

import "./results-screen.css";
import * as playpass from "playpass";

let timerUpdate;

const template = document.querySelector("#results-screen");
const player = template.querySelector("audio-ext");

const modalReminder = () => {
    template.querySelector(".modal").show();
};

template.querySelectorAll("button[name=share]").forEach(e => e.addEventListener("click", () => share()));
template.querySelectorAll("button[name=shareTwitter]").forEach(e => e.addEventListener("click", () => share("twitter")));
template.querySelectorAll("button[name=shareReddit]").forEach(e => e.addEventListener("click", () => share("reddit")));

Array.from(template.querySelectorAll("button[name=next]")).forEach(e => {
    e.onclick = () => {
        playpass.analytics.track('FreePlayNextSongClicked', {gameMode: state.gameMode});
        state.resetGame();
        state.nextSong();
        showScreen("#game-screen");
    };
});
Array.from(template.querySelectorAll("button[name=restart]")).forEach(e => {
    e.onclick = () => {
        playpass.analytics.track('FreePlayTryAgainClicked', {gameMode: state.gameMode});
        state.resetGame(true);
        state.nextSong();
        showScreen("#game-screen");
    };
});

Array.from(template.querySelectorAll("button[name=dailyAudio]")).forEach(e => {
    e.onclick = () => {
        playpass.analytics.track('DailyPlaySongClicked', {gameMode: state.gameMode});
        state.setMode(Mode.Time);
        state.nextSong();
        showScreen("#game-screen");
    }
});

Array.from(template.querySelectorAll("button[name=free]")).forEach(e => {
    e.onclick = () => {
        playpass.analytics.track('FreePlaySongClicked', {gameMode: state.gameMode});
        state.setMode(Mode.Free);
        state.nextSong();
        showScreen("#game-screen");
    }
});

template.addEventListener("active", async ({detail: {previous}}) => {
    // since free mode songs are non-deterministic, on page refresh we should
    // redirect to the mode select screen else we will end up with a song
    // that might not match what was last played
    if (!previous && state.gameMode !== Mode.Time) {
        showScreen("#help-screen");
        return;
    }

    if (!state.isDone()) {
        showScreen("#game-screen");
        return;
    }

    if (state.gameMode !== Mode.Time && state.isSolved()) {
        template.setAttribute("result", "solved");
    } else {
        template.setAttribute("result", "gameover");
    }

    template.querySelector("#resultLine1").textContent = state.getCurrentAnswer();
    template.querySelector("#resultLine2").textContent = getEmojis();
    template.querySelector("#resultLine3").innerHTML = `Guessed ${state.wins} song(s) correctly<br>Score: ${state.score}`;
    template.querySelector("#resultLineModal").innerHTML = `
        ${state.getCurrentAnswer()}<br>
        ${state.gameMode === Mode.Time ? 'Daily Audio' : ''}<br>
        ${
            state.gameMode === Mode.Free
                ? `Guessed ${state.wins} song(s) correctly<br>Score: ${state.score}`
                : getEmojis()
        }
    `;

    const results = template.querySelector(`.results`);
    results.replaceChildren([]);

    for (let ii = 0; ii < state.attempts; ++ii) {
        const guess = document.createElement("li");
        guess.classList.add('result');
        if (ii < state.guesses.length) {
            if (state.isSolved() && ii === state.guesses.length - 1) {
                guess.setAttribute("s", "b");
            } else if (!state.guesses[ii]) {
                guess.setAttribute("s", "_");
            } else {
                guess.setAttribute("s", "c");
            }

            guess.textContent = state.guesses[ii] ?? 'Skipped';
        }
        results.appendChild(guess);
    }

    if (state.gameMode === Mode.Time) {
        const nextGameAt = timer.getNextGameTime();
        timerUpdate = setInterval(() => {
            const until = timer.getUntil(nextGameAt);
            template.querySelector("#timeLeft").textContent = `${until.hours}h ${until.minutes}m ${until.seconds}s until next song`;
        }, 1000);
    }

    // autoplay the video if we are aware of the user being actively within the game's context
    await player.setSong({
        type: state.correctAnswer.mv ? 'youtube' : state.correctAnswer.type,
        src: state.correctAnswer.mv ?? state.correctAnswer.src,
    });

    player.clear({begin: 0, end: 0});

    if (previous) {
        player.play();
    }

    if (state.gameMode !== Mode.Time) {
        setTimeout(() => {
            player.addEventListener("end", modalReminder, {once: true});
        }, 5000);
    }

    playpass.analytics.track('ShareModalSeen', {
        gameMode: state.gameMode,
    });
    template.querySelector("#share-prompt").show();
});

template.addEventListener("inactive", () => {
    if (timerUpdate) {
        clearInterval(timerUpdate);
        player.stop();
    }

    player.removeEventListener("end", modalReminder);
    player.stop();
});
