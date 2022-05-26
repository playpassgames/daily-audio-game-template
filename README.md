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

List of possible songs that will be given as challenges for the game.  The names of the songs are also used for the autocomplete entry field.

Currently supported for song sources are [Youtube videos](https://developers.google.com/youtube/iframe_api_reference) and [Soundcloud audio](https://developers.soundcloud.com/docs/api/html5-widget) using each platforms respective Widget API.

The IDs for each correspond to the APIs requirements.  When configuring your song list, you can find these IDs easily using the following methods
  - Youtube IDs are visible in their URLs, just copy from there
  - Soundcloud is a little more difficult.  When using the web interface, you can inspect your network traffic to `https://api-v2.soundcloud.com/me/play-history` after you play a song.  The ID is the numeric value as part of `soundcloud:tracks:<id>` in the payload

```
{
    "songs": [
        {
            "src": id,
            "type": youtube | soundcloud,
            "name": text,
            "hints": Hint[] (optional),
        },
        ...
    ]
}
```

Example

```
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

## Links

- [Documentation](https://docs.playpass.games/): Learn more about Playpass.
- [GitHub](https://github.com/playpassgames/playpass): Submit an issue or PR. Contributions are welcome!
