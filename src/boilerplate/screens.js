const template = document.createElement('template');
template.innerHTML = `
    <style>
        ::slotted(*) {
            display: none;
        }

        :host {
            display: block;
            flex: 1;
        }

        :host(:not([loading])) ::slotted(*[active]) {
            display: block;
        }

        :host([loading]) ::slotted([slot="load-spinner"]) {
            display: block;
        }
    </style>
    <slot name="load-spinner"></slot>
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

                next.dispatchEvent(new CustomEvent("active"));
            }
        }
    }
);

export function asyncHandler(fn){
    return async (e) => {
        document.querySelector(routerTagName).setAttribute("loading", "");
        await fn(e);
        document.querySelector(routerTagName).removeAttribute("loading");
    };
}

export function showScreen(name) {
    document.querySelector(routerTagName).setAttribute("open", name);
}
