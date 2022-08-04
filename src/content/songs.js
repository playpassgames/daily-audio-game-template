import normalizeUrl from "normalize-url";
import content from "../boilerplate/content";

const YOUTUBE_REGEX = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/

const hostMap = {
    'www.youtube.com': 'youtube',
    'm.youtube.com': 'youtube',
    'music.youtube.com': 'youtube',
    'youtube.com': 'youtube',
    'youtu.be': 'youtube',
    'www.soundcloud.com': 'soundcloud',
    'api.soundcloud.com': 'soundcloud',
    'soundcloud.com': 'soundcloud'
};

const adapters = {
    'youtube': function handleYoutubeSong({ songLink, songName, songArtist }) {
        const parsedMusicLink = YOUTUBE_REGEX.exec(songLink);
        if (!parsedMusicLink) {
            return null;
        }

        const song = {
            songLink,
            name: songName,
            artist: songArtist,
            src: parsedMusicLink[5],
            type: 'youtube',
        };


        return song;
    },
    'soundcloud': function handleSoundcloudSong({ songLink, songName, songArtist }) {
        return {
            songLink,
            name: songName,
            artist: songArtist,
            src: songLink,
            type: 'soundcloud'
        };
    },
};

export const songs = () => content.getDailyContent('elements').reduce(
    (songs, record) => {
        const {songLink, musicVideoLink} = record;

        const normalizedSongLink = normalizeUrl(songLink, {forceHttps: true});

        const url = new URL(normalizedSongLink);

        const type = hostMap[url.host];

        if (!(type in adapters)) {
            return songs;
        }

        const song = adapters[type](record);
        if (!song) {
            return songs;
        }

        if (musicVideoLink) {
            const parsedVideoLink = YOUTUBE_REGEX.exec(musicVideoLink);
            Object.assign(song, {
                musicVideoLink,
                mv: parsedVideoLink[5],
            });
        }

        songs.push(song);

        return songs;
    },
    [],
);
