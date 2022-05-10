import * as playpass from "playpass";

// The dice the player rolled today
export default {
    rolledDice: [],

    async init() {
        if (await this.hasRolledDice()) {
            this.rolledDice = await playpass.storage.get("lastDice");
        } else {
            this.rolledDice = [];
        }
    },
    async hasRolledDice() {
        const lastDay = playpass.storage.get("lastDay", this.getCurrentDay());

        return lastDay === this.getCurrentDay();
    },
    // Gets the current day number
    getCurrentDay () {
        return Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    },
    rollDice() {
        // Generate 3 random dice
        this.rolledDice = [
            Math.floor(Math.random()*6),
            Math.floor(Math.random()*6),
            Math.floor(Math.random()*6),
        ];

        // Save the current day
        playpass.storage.set("lastDay", this.getCurrentDay());
        playpass.storage.set("lastDice", this.rolledDice);
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
    }
}
