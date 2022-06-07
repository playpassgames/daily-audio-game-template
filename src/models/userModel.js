import { Model } from "../boilerplate/state";

export default class extends Model {
    name = 'user';

    data() {
        return {
            wins: 0, // correct guess streak (daily)
        };
    }
}