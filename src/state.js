import * as playpass from "playpass";
import { State } from "./boilerplate/state";
import UserModel from "./models/userModel";
import DailyModel from "./models/dailyModel";

import { songs, hints, startDate } from "../content/songs.json";

const MAX_ATTEMPTS = 6;

const state = new State(
    "daily",
    new UserModel(MAX_ATTEMPTS),
    new DailyModel(Date.parse(startDate)),
); 

// The dice the player rolled today
export default {
    store: null,
    currentGuess: "",
    correctAnswer: null,
    
    async init() {
        this.store = await state.loadObject();
        this.correctAnswer = songs[this.store.day % songs.length];
    },
    get attempts() {
        return (this.correctAnswer.hints ?? hints).length;
    },
    isSolved() {
        return this.store.guesses[this.store.guesses.length - 1]?.toUpperCase() === this.getCurrentAnswer().toUpperCase();
    },
    isDone() {
        return this.store.guesses.length >= this.attempts || this.isSolved();
    },
    getCurrentAnswer() {
        const word = this.correctAnswer;
        if (!word) {
            return songs[0].name;
        }
        return word.name;
    },
    getCurrentRange() {
        return (this.correctAnswer.hints ?? hints)[this.store.guesses.length];
    },
    submit(currentGuess) {
        this.store.guesses.push(currentGuess);

        if (this.isSolved()) {
            this.store.wins[this.store.guesses.length - 1] += 1;
        }

        this.save();
    },
    async login() {
        if (await playpass.account.login()) {
            document.body.classList.add("isLoggedIn");
        }
    },
    async logout() {
        playpass.account.logout();
        document.body.classList.remove("isLoggedIn");
        this.rolledDice = [];
    },
    save() {
        state.saveObject(this.store);
    }
}
