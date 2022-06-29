export default {
    _dailyContent: null,
    _gameContent: null,

    async init() {
        await this.loadContent();
        this.loadFavicon();
        this.applyContent();
    },

    async loadContent() {
        if (!this._dailyContent) {
            this._dailyContent = await this.loadJson('playpass-content.json');
        }

        if (!this._gameContent) {
            this._gameContent = await this.loadJson('playpass-customisation.json');
        }
    },

    async loadJson(name) {
        const result = await fetch(name);
        return await result.json();
    },

    getGameContent(key) {
        return this._gameContent[key];
    },

    getDailyContent() {
        return this._dailyContent.elements;
    },

    getDailyContentStartDate() {
        return this._dailyContent.startDate;
    },

    applyContent() {
        const keys = Object.keys(this._gameContent);

        for (let key of keys) {
            const elements = document.getElementsByClassName(`playpass-cms-${key}`);

            if (!elements || elements.length === 0) {
                continue;
            }

            let value = this._gameContent[key];
            let newValue = value;
            let regex = /\{\{ ?([A-Za-z]*) ?\}\}/g;

            let match;
            do {
                match = regex.exec(value);
                if (match && keys.includes(match[1])) {
                    newValue = newValue.replace(match[0], this._gameContent[match[1]]);
                }
            } while (match);

            for (let ele of elements) {
                ele.innerText = newValue;
            }
        }
    },

    loadFavicon() {
        if (!this._gameContent.favicon) {
            return;
        }

        switch (this._gameContent.favicon.type) {
            case "emoji":
                this.emojiFavicon(this._gameContent.favicon);
                break;
            case "base64":
                this.base64Favicon(this._gameContent.favicon);
                break;
            case "url":
                this.urlFavicon(this._gameContent.favicon);
                break;
        }
    },

    emojiFavicon({ value }) {
        const link = document.createElement('link');
        link.rel = "icon";
        link.type = "image/svg+xml";
        link.sizes = "any";
        link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${value}</text></svg>`
        document.head.appendChild(link);
    },

    base64Favicon({ value, mime }) {
        const link = document.createElement('link');
        link.rel = "icon";
        link.href = `data:${mime};base64,${value}`
        document.head.appendChild(link);
    },

    urlFavicon({ value }) {
        const link = document.createElement('link');
        link.rel = "icon";
        link.href = value;
        document.head.appendChild(link);
    }
}