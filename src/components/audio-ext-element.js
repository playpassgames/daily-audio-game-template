import { ReactiveElement, attr } from "../boilerplate/reactive";

export default class AudioExtElement extends HTMLElement {
    ref = 'youtube::'
    range = [0.0, 1.0];
    done = false;

    constructor() {
        super();
        
        this.innerHTML = `
           <div id="player"></div>
        `;

        this.play = () => {};
        this.stop = () => {};
    }

    setSong({ type, src, range }) {
        this.range = range;

        if (`${type}::${src}` === this.ref) {
            return;
        }

        switch (type) {
            case "youtube": {
                // embed youtube
                if (!YT) {
                    return;
                }

                this._prepareYoutube(src, range);
                break;
            }
            default: {
                break;
            }
        }
    }

    _prepareYoutube(src) {
        const player = new YT.Player('player', {
            width: 600,
            height: 400,
            videoId: src,
            playerVars: {
                playsinline: 1,
            },
            events: {
                onReady: () => { this.ready = true; },
            },
        });

        this.play = () => {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            const { begin, end } = this.range ?? { begin: 0.0, end: 1.0 };

            player.seekTo(begin, true);

            this.done = false;
            const duration = (end - begin) * 1000;
            this.start = Date.now();
            this.end = this.start + duration;
            this.timeout = setTimeout(() => {
                player.stopVideo();
                this.done = true;
            }, duration);
        };

        this.stop = () => {
            player.stopVideo();
            this.done = true;
        };
    }

    get progress() {
        if (this.done) {
            return 1.0;
        }
        const distance = (Date.now() - this.start) / (this.end - this.start);
        return Math.min(1.0, distance);
    }
}

export const elementTagName = "audio-ext";

window.customElements.define(elementTagName, AudioExtElement);
