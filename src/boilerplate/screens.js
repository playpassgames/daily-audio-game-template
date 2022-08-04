import * as playpass from "playpass";
import state from "../state";
import share from "../share";

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host([loading]) ::slotted(*),
        :host(:not([loading])) ::slotted([slot="screen"]:not([active])),
        :host(:not([loading])) ::slotted([slot="load-spinner"]) {
            display: none !important;
            flex: 0;
        }

        :host {
            display: flex;
            flex-direction: column;
            flex: 1;
        }

        :host(:not([loading])) ::slotted([slot="screen"][active]),
        :host(:not([loading])) ::slotted([slot="shared"]) {
            display: block;
        }

        :host(:not([loading])) ::slotted([slot="screen"][active]) {
            flex: 1;
        }

        :host([loading]) ::slotted([slot="load-spinner"]) {
            display: block !important;
        }
    </style>
    <slot name="load-spinner"></slot>
    <slot name="shared"></slot>
    <slot name="screen"></slot>
`;

const routerTagName = "screen-router";

window.customElements.define(
    routerTagName,
    class extends HTMLElement {
        constructor() {
            super();

            this.attachShadow({mode: 'open'});
            this.shadowRoot.appendChild(template.content.cloneNode(true));
        }

        static get observedAttributes() {
            return ["open"];
        }

        async attributeChangedCallback(name, oldValue, newValue) {
            if (name === "open") {
                const prev = this.querySelector(oldValue);
                if (prev) {
                    prev.removeAttribute("active");
                    prev.dispatchEvent(new CustomEvent("inactive"));
                }

                const next = this.querySelector(newValue);
                next.setAttribute("active", "");

                next.dispatchEvent(new CustomEvent("active", {
                    detail: {
                        previous: oldValue,
                    }
                }));
            }
        }
    }
);

export function asyncHandler(fn) {
    return async (e) => {
        document.querySelector(routerTagName).setAttribute("loading", "");
        await fn(e);
        document.querySelector(routerTagName).removeAttribute("loading");
    };
}

export function showScreen(name) {
    playpass.analytics.track('PageShow', {page: name, gameMode: state.gameMode});
    document.querySelector(routerTagName).setAttribute("open", name);
    document.querySelectorAll("[screen]").forEach(e => e.classList.add('hide'));
    document.querySelectorAll(`[screen="${name}"]`).forEach(e => e.classList.remove('hide'));
}

export function readyGame() {
    playpass.analytics.track('GameReady')
    document.querySelector("body").setAttribute("ready", "");
}

function show(screens) {
    screens.forEach(screen => document.querySelector(screen).show())
}

function hide(screens) {
    screens.forEach(screen => document.querySelector(screen).hide())
}

function hideShare() {
    let elements = document.getElementsByTagName("playpass-share");
    if (elements && elements.length > 0) {
        elements.item(0).remove();
    }
}

function hideAll() {
    hide(["#stats", "#about-screen", "#help-prompt"]);
    hideShare();
}

function showShare() {
    hideAll();
    share();
}

export function onHomeClick() {
    playpass.analytics.track('PageShow', {page: "#about-screen", gameMode: state.gameMode});
    hideAll();
    show(["#about-screen"]);
}

export function onHelpClick () {
    playpass.analytics.track('PageShow', {page: "#help-prompt", gameMode: state.gameMode});
    hideAll();
    show(["#help-prompt"]);
}

export function onStatsClick () {
    playpass.analytics.track('PageShow', {page: "#stats", gameMode: state.gameMode});
    hideAll();
    show(["#stats"]);
}

export function onSettingsClick () {
    hideAll();
    showScreen("#settings-screen");
}

export const screenHandlers = {
    share: {
        show: showShare,
        hide: hideAll
    },
    home: {
        show: onHomeClick,
        hide: hideAll
    },
    help: {
        show: onHelpClick,
        hide: hideAll
    }
}