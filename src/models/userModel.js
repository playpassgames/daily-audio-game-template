import { Model } from "../boilerplate/state";

export default class extends Model {
    name = 'user';

    data() {
        return {
            wins: 0, // correct guesses
            winStreak: 0, // correct guess streak
            lastWin: 0, // date of last win
            freePlayHighScore: 0,
            freePlayHighStreak: 0,
            lastPlayed: 0,
        };
    }
}
