/* global YT */
/* global SC */

export default class AudioExtElement extends HTMLElement {
    ref = 'youtube::'
    done = false;

    constructor() {
        super();

        this.innerHTML = `
           <iframe src=""></iframe>
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
                    <div></div>
                `;

                const e = this.querySelector('div')

                await new Promise((resolve) => {
                    this._prepareYoutube(e, src, resolve);
                });
                break;
            }
            case "soundcloud": {
                if (!SC) {
                    return;
                }

                await new Promise((resolve) => {
                    this._prepareSoundcloud(src, resolve);
                });
                break;
            }
            default: {
                break;
            }
        }
    }

    async _prepareYoutube(element, src, cb) {
        let duration, begin;

        await new Promise((resolve) => YT.ready(resolve));
        const player = new YT.Player(element, {
            width: 600,
            height: 400,
            videoId: src,
            playerVars: {
                playsinline: 1,
                autoplay: 1,
            },
            events: {
                onReady: () => {
                    this.duration = player.getDuration();
                    cb();
                },
                onStateChange: (e) => {
                    if (e.data === YT.PlayerState.PLAYING) {
                        this.start = Date.now();
                        this.end = this.start + duration;
                        this.done = false;

                        if (duration > 0) {
                            this.timeout = setTimeout(() => {
                                player.pauseVideo();
                                // loop back
                                player.seekTo(begin, true);
                                this.done = true;
                            }, duration);
                        }

                        this.loading = false;
                    }
                    if (e.data === YT.PlayerState.ENDED) {
                        this.dispatchEvent(new CustomEvent("end"));
                    }
                }
            },
        });

        this.play = () => {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }

            this.loading = true;

            player.seekTo(begin, true);
            player.playVideo();
        };

        this.stop = () => {
            player.destroy();
        };

        this.reset = (range = { begin: 0.0, end: 1.0 }) => {
            player.pauseVideo();

            duration = (range.end - range.begin) * 1000;
            begin = range.begin;

            player.seekTo(begin, true);
        }
    }

    async _prepareSoundcloud(src, cb) {
        this.innerHTML = `
            <iframe id="player" src="https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/${src}&show_artwork=false&auto_play=false" width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay"></iframe>
        `;
        const iframe = this.querySelector('#player');
        const player = SC.Widget(iframe);

        let duration, begin;

        this.loading = true;
        player.bind(SC.Widget.Events.READY, async () => {
            this.loading = false;

            this.duration = await new Promise((resolve) => player.getDuration(resolve)) / 1000.0;
            cb?.();
        });

        player.bind(SC.Widget.Events.PLAY, () => {
            this.done = false;
            this.start = Date.now();
            this.end = this.start + duration;

            this.timeout = setTimeout(() => {
                player.pause();
                // loop back
                player.seekTo(begin * 1000);
                this.done = true;
            }, duration);
        });

        this.play = (range) => {
            const { begin, end } = range ?? { begin: 0.0, end: 1.0 };

            const duration = (end - begin) * 1000;

            this.done = false;

            this.ready = () => {
                this.start = Date.now();
                this.end = this.start + duration;

                this.timeout = setTimeout(() => {
                    player.pause();
                    // loop back
                    player.seekTo(begin * 1000);
                    this.done = true;
                }, duration);
            }
            
            player.seekTo(begin * 1000); // seek is in ms
            player.play();
        };

        this.reset = (begin) => {
            player.pause();
            player.seekTo(begin * 1000);

            delete this.ready;
        }
    }

    clear(begin) {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        this.reset?.(begin)
        this.start = null;
        this.end = null;
        this.done = false;
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
