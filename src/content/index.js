import content from "../boilerplate/content";
import { songs } from "./songs";

export default {
    songs,
    gameName: content.getGameContent('name'),
    startDate: new Date(content.getDailyContent('startDate') || Date.now()),
    emojis: {
        goodGuess: content.getGameContent('goodGuess'),
        badGuess: content.getGameContent('badGuess'),
        skipGuess: content.getGameContent('skipGuess'),
    },
};
