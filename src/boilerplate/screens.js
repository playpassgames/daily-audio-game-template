import * as playpass from "playpass";
import state from "../state";

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
