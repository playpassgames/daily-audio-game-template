/* global YT */

export default class AudioExtElement extends HTMLElement {
    ref = 'youtube::'
    done = false;

    constructor() {
        super();
        
        this.innerHTML = `
           <div id="player"></div>
        `;

        this.play = () => {};
        this.stop = () => {};
    }

    async setSong({ type, src }) {
        if (`${type}::${src}` === this.ref) {
            return;
        }

        switch (type) {
            case "youtube": {
                // embed youtube
                if (!YT) {
                    return;
                }

                await new Promise((resolve) => {
                    this._prepareYoutube(src, resolve);
                });
                break;
            }
            default: {
                break;
            }
        }
    }

    _prepareYoutube(src, cb) {
        const player = new YT.Player('player', {
            width: 600,
            height: 400,
            videoId: src,
            playerVars: {
                playsinline: 1,
            },
            events: {
                onReady: () => {
                    this.duration = player.getDuration();
                    cb();
                },
                onStateChange: (e) => {
                    if (e.data === YT.PlayerState.PLAYING) {
                        this.ready?.();
                        this.loading = false;
                    }
                }
            },
        });

        this.play = (range) => {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }

            const { begin, end } = range ?? { begin: 0.0, end: 1.0 };

            this.loading = true;

            this.done = false;
            const duration = (end - begin) * 1000;
            
            this.ready = () => {
                this.start = Date.now();
                this.end = this.start + duration;

                this.timeout = setTimeout(() => this.stop(), duration);
            }

            player.seekTo(begin, true);
            player.playVideo();
        };

        this.reset = () => {
            player.pauseVideo();
            player.seekTo(0, true);

            delete this.ready;
        }

        this.stop = () => {
            player.pauseVideo();
            this.done = true;
        };
    }

    clear() {
        this.start = null;
        this.end = null;
        this.done = false;

        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    get progress() {
        if (this.done) {
            return 1.0;
        }
        const distance = (Date.now() - this.start) / (this.end - this.start);
        return Math.min(1.0, distance);
    }

    get time() {
        if (this.done) {
            return (this.end - this.start) / 1000.0;
        }

        if (!this.start || this.loading) {
            return 0.0;
        }

        return Math.min( (this.end - this.start) / 1000.0, (Date.now() - this.start) / 1000.0 );
    }
}

export const elementTagName = "audio-ext";

window.customElements.define(elementTagName, AudioExtElement);
