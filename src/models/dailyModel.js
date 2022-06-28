import { IntervalModel } from "../boilerplate/interval";

export default class extends IntervalModel {
    constructor(interval) {
        super(interval);
    }

    data() {
        return {
            ...super.data(),
            guesses: [],
        };
    }
}
