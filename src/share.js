import * as playpass from "playpass";
import state, { Mode } from "./state";
import content from "./content";

export function getEmojis() {
    let emotes = '🔊';
    for (let i = 0; i < state.attempts; i++) {
        if (i === state.guesses.length - 1 && state.isSolved()) {
            emotes += content.emojis.goodGuess();
        } else if (i < state.guesses.length) {
            emotes += content.emojis.badGuess();
        } else {
            emotes += content.emojis.skipGuess();
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
        const currentInterval = (state.store.currentInterval === null ? 0 : state.store.currentInterval) + 1;
        playpass.share({
            text: `🎵 ${content.gameName()} #${currentInterval.toString()}\n${emojis}\n${link}`,
        });
    } else if (state.gameMode === Mode.Free) {
        playpass.share({
            text: `🎵 ${content.gameName()} : Free Play\nScore ${state.score}\nGuessed ${state.wins} songs\n${link}`,
        });
    }
}
