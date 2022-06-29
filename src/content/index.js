import content from "../boilerplate/content";
import { getSongList } from "./songs";

const data = {
    songs: [],
    emojis: {
        goodGuess: null,
        badGuess: null,
        skipGuess: null,
    }
};

export async function init() {
    await content.init();

    // update exported content module
    Object.assign(data, {
        songs: getSongList(),
        startDate: content.getDailyContent('startDate')
            ? Date.parse(content.getDailyContent('startDate'))
            : new Date(),
        emojis: {
            goodGuess: content.getGameContent('goodGuess'),
            badGuess: content.getGameContent('badGuess'),
            skipGuess: content.getGameContent('skipGuess'),
        },
    });
}

export default data;
