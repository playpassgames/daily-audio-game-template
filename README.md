# Daily Audio Game project template

This is an example of how to use the Playpass SDK to build a simple daily level game that involves guessing a song title from various audio snippets.

Preview: https://daily-audio-template.playpass.games

## Setup

Clone this template by running:

```shell
playpass create --template playpassgames/daily-audio-game-template
```

For more info about using Playpass, see the [quickstart guide](https://docs.playpass.games/).

## Building

Test the game locally by running:

```shell
npm start
```

Deploy the game by running:

```shell
playpass deploy
```

## Debug Mode

You can put the game in debug mode by setting the flag in the browser's local storage.

Open up the browser's Dev Tools (F12) and in the console enter

```
localStorage.setItem("debug", true)
```

Afterwards refresh your page and the game will now be in debug mode.  In debug mode you can access certain features such as the AB Test manual override for your user in the Settings view.

## Configuration (content/songs.json)

### Hints

This controls the default hint parameters that players will hear per song.  This can be overridden on any songs where you want to make the challenge easier or harder if the defaults are not suitable.

Times specificed are in seconds relative to the beginning of the song.

```
{
    "hints": [
        {
            "begin": number,
            "end": number
        },
        ...
    ]
}
```

### Songs

List of possible songs that will be given as challenges for the game.  The names of the songs are also used for the autocomplete entry field.  Names must be unique identifiers for the songs.  If you have multiple songs with the same name, try to give the name a unique value and then use the [titles field](#multi-language-support) to give it a human readable name for autocomplete

Currently supported for song sources are [Youtube videos](https://developers.google.com/youtube/iframe_api_reference) and [Soundcloud audio](https://developers.soundcloud.com/docs/api/html5-widget) using each platforms respective Widget API.

The IDs for each correspond to the APIs requirements.  When configuring your song list, you can find these IDs easily using the following methods
  - Youtube IDs are visible in their URLs, just copy from there
  - Soundcloud is a little more difficult.  When using the web interface, you can inspect your network traffic to `https://api-v2.soundcloud.com/me/play-history` after you play a song.  The ID is the numeric value as part of `soundcloud:tracks:<id>` in the payload

```json
{
    "songs": [
        {
            "src": id,
            "type": youtube | soundcloud,
            "name": text, (unique)
            "hints": Hint[] (optional),
            "title": Map<text,text> (optional),
            "mv" youtube-id (optional)
        },
        ...
    ]
}
```

Example

```json
{
    "songs": [
        {
            "src": "aetXqd9B8WE",
            "type": "youtube",
            "name": "Q",
            "hints": [
                {
                    "begin": 56.0,
                    "end": 58.0
                },
                {
                    "begin": 85.9,
                    "end": 88.8
                },
                {
                    "begin": 64.8,
                    "end": 69.0
                },
                {
                    "begin": 24.0,
                    "end": 30.0
                },
                {
                    "begin": 100.0,
                    "end": 120.0
                }
            ]
        },
        {
            "src": "1230511906",
            "type": "soundcloud",
            "name": "Be With You"
        }
    ]
}
```

### Unique MVs

Sometimes songs on Youtube have music videos that would be better to show the user in the results screen.
Your audio guesses should be based off of the album versions of songs as opposed to MVs wherever possible, as music videos may have additional sound effects or silence not present in the album release.

To control what is used for the audio guessing and the resulting video you can decorate the song record with additional fields

```
{
    "type": "youtube",
    "src" "youtube-music-id", // used in the audio guessing gameplay,
    "mv": "youtube-id", // used for results screen
}
```

### Multi-language Support

Songs in other languages my have different titles in their native language.  You can configure multiple acceptible titles for a song using a dictionary of language maps.

Supported languages can be declared in the configuration as well, which will be visible in the language dropdown on the settings page.

```json
{
    "languages": [
        {
            "code": "en", // used to map to language in the song title map
            "label": "English", // name that appears in the language select dropdown
            "default": true // optional field, indicates this language as the default fallback language for titles
        },
        ...
    ],
    "songs": [
        {
            ...
            "titles": {
                "en": "Plastic Love",
                "jp": "プラスティック・ラヴ"
            }
        }
    ]
}
```

If a song does not have titles declared, or the fallback language record doesn't exist in the titles map, then the "name" field is used.

### Daily Challenges

By default the daily challenge is randomly selected from the list of songs.  If you wish to specify specific times for when a certain song is played as the challenge, you can specify it in the daily list.

```json
{
    "challenge": {
        {
            // the interval number since the start date
            "number": 2,
            // song id from the songs list
            "name": "Be With You",
            // you can have custom hints for the day too
            "hints": [
                ...
            ]
        }
    }
}

```

## Links

- [Documentation](https://docs.playpass.games/): Learn more about Playpass.
- [GitHub](https://github.com/playpassgames/playpass): Submit an issue or PR. Contributions are welcome!
