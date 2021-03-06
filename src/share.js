import * as playpass from "playpass";
import state, { Mode } from "./state";

export function getEmojis() {
    let emotes = 'š';
    for (let i = 0; i < state.attempts; i++) {
        if (i === state.guesses.length - 1 && state.isSolved()) {
            emotes += 'š©';
        } else if (i < state.guesses.length) {
            emotes += 'š„'
        } else {
            emotes += 'ā¬'
        }
    }

    return emotes;
}

export default function share() {
    // Create a link to our game
    const link = playpass.createLink();

    if (state.gameMode === Mode.Time) {
        const emojis = getEmojis();

        // Share some text along with our link
        playpass.share({
            text: `šµ Daily Song #${(state.store.currentInterval + 1).toString()}\nš${emojis}\n${link}`,
        });
    } else if (state.gameMode === Mode.Free) {
        playpass.share({
            text: `šµ Daily Song : Free Play\nScore ${state.score}\nGuessed ${state.wins} songs\n${link}`,
        });
    }
}
