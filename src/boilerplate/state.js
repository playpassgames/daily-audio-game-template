import * as playpass from "playpass";

export class Model {
    name = 'model'; // override this name for any unique model you have

    /** 
     * Defines the base object for user state
     * 
     * Override with your own implementation to customize what is persisted
     * @abstract
     */
    data() {
        return {};
    }

    /**
     * Additional checks this model may perform when loading state from storage
     * @param {*} state 
     * @returns 
     */
    onLoad(state) {
        return state;
    }
}

/**
 * A simple state manager
 */
export class State {
    constructor (name, ...models) {
        this.name = name;
        this.models = models;
    }

    getModel(name) {
        return this.models.find((m) => m.name === name);
    }

    data() {
        return {};
    }

    /**
     * A fresh representation of a user's state
     * 
     * @returns 
     */
    newState() {
        return Object.assign({}, ...this.models.map(m => m.data()));
    }

    /** Loads an object from storage, returning null if there was no object previously saved today. */
    async loadObject () {
        const oldState = (await playpass.storage.get(this.name)) || {};
        const newState = this.newState();
        
        const state = {
            ...newState,
            ...oldState
        };
        
        this.models.forEach(m => Object.assign(state, m.onLoad(state)));
        
        return state;
    }

    /** Saves an object to storage, which will expire the next day. */
    async saveObject (state) {
        await playpass.storage.set(this.name, state);
    }
}