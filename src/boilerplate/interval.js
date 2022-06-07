import { Model } from "./state";

export function Frequency(rate, start = new Date(0)) {
    return {
        current(time = Date.now(), startAt = start) {
            const relative = time - startAt;
            return Math.floor(relative / rate);
        },
        next(time = Date.now(), startAt = start) {
            return Math.floor(this.nextTime(time, startAt) / rate);
        },
        nextTime(time = Date.now(), startAt = start) {
            const relative = time - startAt;
            const remainder = relative % rate;
            const next = relative + rate - remainder;
            return next;
        }
    };
}

export const Daily = (start = new Date(0)) => Frequency(24 * 60 * 60 * 1000, start);
export const Hourly = (start = new Date(0)) => Frequency(60 * 60 * 1000, start);
export const Weekly = (start = new Date(0)) => Frequency(7 * 24 * 60 * 60 * 1000, start);

/**
 * A daily state manager
 */
export class IntervalModel extends Model {
    constructor (interval = Daily) {
        super();
        this._interval = interval;
        this.name = 'interval';
    }

    get current() {
        return this._interval.current(Date.now());
    }

    data() {
        return {
            currentInterval: this.current
        };
    }

    onLoad(state) {
        if (state.currentInterval !== this.current) {
            return {
                ...state,
                ...this.data(),
            };
        }
        
        return state;
    }
    
    /** Gets a random number between 0 and 1 unique to this day. */
    random () {
        return ((1103515245*this.current + 12345) >>> 0) / 0xffffffff;
    }

    randomInt() {
        return Math.floor(this.random() * Number.MAX_SAFE_INTEGER);
    }
}