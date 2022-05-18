import { DailyModel } from "../boilerplate/daily";

export default class extends DailyModel {
    data() {
        return {
            ...super.data(),
            guesses: [],
        };
    }
}