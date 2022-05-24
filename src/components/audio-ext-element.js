/* global YT */

export default class AudioExtElement extends HTMLElement {
    ref = 'youtube::'
    done = false;

    constructor() {
        super();
        
        this.innerHTML = `
           <iframe id="player" src=""></iframe>
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

                this.innerHTML = `
                    <div id="player"></div>
                `;

                await new Promise((resolve) => {
                    this._prepareYoutube(src, resolve);
                });
                break;
            }
            case "soundcloud": {
                if (!SC) {
                    return;
                }

                await new Promise((resolve) => {
                    this._prepareSoundcloud(src, resolve);
                })
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

    async _prepareSoundcloud(src, cb) {  
        this.innerHTML = `
            <iframe id="player" src="https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/${src}&show_artwork=false&auto_play=false" width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay"></iframe>
        `;
        const iframe = this.querySelector('#player');
        const player = SC.Widget(iframe);

        this.loading = true;
        player.bind(SC.Widget.Events.READY, async () => {
            this.loading = false;

            this.duration = await new Promise((resolve) => player.getDuration(resolve)) / 1000.0;
            cb?.();
        });

        player.bind(SC.Widget.Events.PLAY, () => {
            this.ready?.();
        });

        this.play = (range) => {
            const { begin, end } = range ?? { begin: 0.0, end: 1.0 };

            const duration = (end - begin) * 1000;

            this.done = false;

            this.ready = () => {
                this.start = Date.now();
                this.end = this.start + duration;
    
                this.timeout = setTimeout(() => this.stop(), duration);
            }

            player.seekTo(begin * 1000); // seek is in ms
            player.play();
        };

        this.reset = () => {
            player.pause();
            player.seekTo(0);

            delete this.ready;
        }

        this.stop = () => {
            player.pause();
            this.done = true;
        }
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
