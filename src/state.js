import * as playpass from "playpass";
import {State} from "./boilerplate/state";
import UserModel from "./models/userModel";
import DailyModel from "./models/dailyModel";

import {challenge, hints, languages} from "../content/songs.json";
import {Daily} from "./boilerplate/interval";
import normalizeUrl from 'normalize-url';

const MAX_ATTEMPTS = 6;

let state;

export const Mode = { Time: "timed", Free: "free" }

const YOUTUBE_REGEX = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/

const hostMap = {
    'www.youtube.com': 'youtube',
    'm.youtube.com': 'youtube',
    'music.youtube.com': 'youtube',
    'youtube.com': 'youtube',
    'youtube.be': 'youtube',
    'www.soundcloud.com': 'soundcloud',
    'api.soundcloud.com': 'soundcloud',
    'soundcloud.com': 'soundcloud'
}

// The dice the player rolled today
export default {
    interval: Daily(new Date()),
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
    songs: [],

    handleYoutubeSong(songLink, songName) {
        const parsedMusicLink = YOUTUBE_REGEX.exec(songLink);
        if (!parsedMusicLink) {
            return null;
        }

        return {
            songLink,
            songName,
            src: parsedMusicLink[5],
            type: 'youtube'
        };
    },

    handleSoundcloudSong(songLink, songName) {
        return {
            songLink,
            songName,
            src: songLink,
            type: 'soundcloud'
        };
    },

    async init() {
        const result = await fetch('playpass-content.json');
        const playpassContent = await result.json();
        this.songs = playpassContent.elements
            .map(({songLink, songName, musicVideoLink}) => {
                const normalizedSongLink = normalizeUrl(songLink, {forceHttps: true});

                const url = new URL(normalizedSongLink);

                const type = hostMap[url.host];

                let song;
                switch (type) {
                    case 'youtube':
                        song = this.handleYoutubeSong(songLink, songName);
                        break;
                    case 'soundcloud':
                        song = this.handleSoundcloudSong(songLink, songName, musicVideoLink);
                        break;
                    default:
                        return null;
                }

                if (musicVideoLink) {
                    const parsedVideoLink = YOUTUBE_REGEX.exec(musicVideoLink);
                    song.musicVideoLink = musicVideoLink;
                    song.musicVideoSrc = parsedVideoLink[5];
                }

                return song;
            })
            .filter(it => it !== null);
        this.interval = Daily(Date.parse(playpassContent.startDate) ?? new Date());

        state = new State(
            "daily",
            new UserModel(MAX_ATTEMPTS),
            new DailyModel(this.interval),
        );
        this.random = state.getModel('interval').randomInt();
        this.store = await state.loadObject();
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
        const word = this.correctAnswer;
        if (!word) {
            return this.songs[0].songName;
        }
        return word.songName;
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
            }

            score /= this.attempts;

            score *= (this.attempts - this.guesses.length) + 1;

            this.score += score;
        }

        this.save();
    },
    nextSong() {
        if (this.gameMode === Mode.Time) {
            const today = challenge.find(({number}) => number === this.store.currentInterval);
            let answer;
            if (today) {
                const song = this.songs.find((s) => s.songName === today.songName);
                if (song) {
                    answer = Object.assign({}, song, today);
                }
            }

            if (!answer) {
                answer = this.songs[this.random % this.songs.length];
            }

            this.correctAnswer = Object.assign({ hints }, answer);
            return;
        }

        const r = Math.floor(Math.random() * this.songs.length)
        this.correctAnswer = this.songs[r];
        this.resetGame();
    },
    resetGame(full = false) {
        this.guesses.length = 0;

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
