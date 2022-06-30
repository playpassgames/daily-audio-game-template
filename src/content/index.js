import content from "../boilerplate/content";
import { songs } from "./songs";

export default {
    songs,
    startDate: content.getDailyContent('startDate')
    ? Date.parse(content.getDailyContent('startDate'))
    : new Date(),
    emojis: {
        goodGuess: content.getGameContent('goodGuess'),
        badGuess: content.getGameContent('badGuess'),
        skipGuess: content.getGameContent('skipGuess'),
    },
};
