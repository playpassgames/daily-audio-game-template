import * as playpass from "playpass";
import { State } from "./boilerplate/state";
import UserModel from "./models/userModel";
import DailyModel from "./models/dailyModel";

import { songs, challenge, hints, startDate, languages } from "../content/songs.json";
import { Daily } from "./boilerplate/interval";

const MAX_ATTEMPTS = 6;

let state;

export const Mode = { Time: "timed", Free: "free" }

// The dice the player rolled today
export default {
    interval: Daily(Date.parse(startDate)),
    store: null,
    currentGuess: "",
    correctAnswer: null,
    gameMode: localStorage.getItem("gameMode") ?? Mode.Time,
    language: localStorage.getItem("language") ?? (
        languages.find((l) => l.default === true) ?? languages[0]
    ).code,
    random: 0,

    // free mode temp storage
    _guesses: [],
    wins: 0,
    score: 0,

    async init() {
        state = new State(
            "daily",
            new UserModel(MAX_ATTEMPTS),
            new DailyModel(this.interval),
        );
        this.random = state.getModel('interval').randomInt();
        this.store = await state.loadObject();

        if (this.store.currentInterval - this.lastPlayed > 1) {
            this.store.winStreak = 0;
        }

        this.store.lastPlayed = this.store.currentInterval;

        this.setMode(this.gameMode);
    },
    get attempts() {
        if (this.gameMode !== Mode.Time) {
            return hints.length;
        }
        return (this.correctAnswer.hints ?? hints).length;
    },
    get guesses() {
        if (this.gameMode !== Mode.Time) {
            return this._guesses;
        }
        return this.store.guesses;
    },
    isSolved() {
        return this.guesses[this.guesses.length - 1]?.toUpperCase() === this.getCurrentAnswer().toUpperCase();
    },
    isDone() {
        return this.guesses.length >= this.attempts || this.isSolved();
    },
    getCurrentAnswer() {
        const word = this.correctAnswer ?? songs[0];
        return `${word.artist} - ${word.name}`;
    },
    getCurrentRange() {
        if (this.gameMode !== Mode.Time) {
            return hints[this.guesses.length];
        }
        return (this.correctAnswer.hints ?? hints)[this.guesses.length];
    },
    submit(currentGuess) {
        this.guesses.push(currentGuess);

        if (this.isSolved()) {
            let score = 0;
            if (this.gameMode === Mode.Free) {
                score = 1000;
                this.wins += 1;
            } else {
                this.store.wins += 1;
                this.store.winStreak += 1;
                this.store.lastWin = this.store.currentInterval;
            }

            score /= this.attempts;

            score *= (this.attempts - this.guesses.length) + 1;

            this.score += score;
        } else if (this.isDone()) {
            if (this.gameMode === Mode.Free) {
                this.store.freePlayHighScore = Math.max(this.score, this.store.freePlayHighScore);
                this.store.freePlayHighStreak = Math.max(this.wins, this.store.freePlayHighStreak);
            } else {
                this.store.winStreak = 0;
            }
        }

        this.save();
    },
    nextSong() {
        if (this.gameMode === Mode.Time) {
            const today = challenge.find(({number}) => number === this.store.currentInterval);
            let answer;
            if (today) {
                const song = songs.find((s) => s.name === today.name);
                answer = Object.assign({}, song ?? {}, today ?? songs[0]);
            } else {
                answer = songs[this.random % songs.length];
            }

            this.correctAnswer = Object.assign({ hints }, answer);
            return;
        }

        const r = Math.floor(Math.random() * songs.length)
        this.correctAnswer = songs[r];
        this.resetGame();
    },
    resetGame(full = false) {
        this.guesses.length = 0;
        this.puzzleStarted = false;

        if (full) {
            this.score = 0;
        }
    },
    setMode(mode = Mode.Time) {
        this.gameMode = mode;

        localStorage.setItem("gameMode", this.gameMode);
        document.body.setAttribute("mode", this.gameMode);

        if (this.gameMode !== Mode.Time) {
            this.wins = 0;
            this.score = 0;
        }

        this.nextSong();
    },
    async login() {
        if (await playpass.account.login()) {
            document.body.classList.add("isLoggedIn");
        }
    },
    async logout() {
        playpass.account.logout();
        document.body.classList.remove("isLoggedIn");
    },
    save() {
        state.saveObject(this.store);
    }
}
