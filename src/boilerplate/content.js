export default {
    _dailyContent: null,
    _gameContent: null,
    _eventHandlers: {},

    async init() {
        await this.loadContent();
        this.loadFavicon();
        this.applyContent();
        await this.eventListeners();
    },

    eventHandler(event, eventHandler) {
        this._eventHandlers[event] = eventHandler;
    },

    async eventListeners() {
        window.addEventListener('message', (event) => {
            const parsed = JSON.parse(event.data);
            let handler;
            switch (parsed.type) {
                case 'playpass-content-cms':
                    this._dailyContent = parsed.data;
                    handler = this._eventHandlers['playpass-content-cms'];
                    break;

                case 'playpass-style-cms':
                    this._gameContent = parsed.data;
                    this.loadFavicon();
                    this.applyContent();
                    handler = this._eventHandlers['playpass-style-cms'];
                    break;

                case 'playpass-style-cms-screen':
                    handler = this._eventHandlers['playpass-style-cms-screen'];
                    break;

                default:
                    return;
            }
            if (handler) {
                handler(parsed);
            }
        });
    },

    async loadContent() {
        if (!this._dailyContent) {
            this._dailyContent = await this.loadJson('playpass-content.json');
        }

        if (!this._gameContent) {
            this._gameContent = await this.loadJson('playpass.json');
        }
    },

    async loadJson(name) {
        const result = await fetch(name);
        return await result.json();
    },

    getGameContent(key) {
        let gameContentElement = this._gameContent[key];

        if (gameContentElement) {
            return Object.assign(gameContentElement);
        }

        return gameContentElement;
    },

    getDailyContent(key) {
        let dailyContentElement = this._dailyContent[key];

        if (dailyContentElement) {
            return Object.assign(dailyContentElement);
        }

        return dailyContentElement;
    },

    applyContent() {
        const keys = Object.keys(this._gameContent);

        const theme = this._gameContent.theme ?? 'default';
        if (theme) {
            document.documentElement.setAttribute('playpass-cms-theme', theme);
        }

        for (let key of keys) {
            if (key === 'theme') {
                continue;
            }

            const elements = document.getElementsByClassName(`playpass-cms-${key}`);
            const styles = getComputedStyle(document.body).getPropertyValue(`--playpass-cms-${key}`);

            if ((!elements || elements.length === 0) && styles === '') {
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

            if (styles) {
                document.documentElement.style.setProperty(`--playpass-cms-${key}`, newValue);
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
