const template = document.createElement('template');
template.innerHTML = `
<style>
    :host {
        display: flex;
        align-items: center;
        margin-top: 10px;
        padding: 10px 0px;
        bottom: 0;
        left: 0;
        right: 0;
        position: sticky;
        width: 100%;
    }
</style>
<slot>
`;

window.customElements.define(
    "game-controls",
    class extends HTMLElement {
        constructor() {
            super();

            this.attachShadow({mode: 'open'});
            this.shadowRoot.appendChild(template.content.cloneNode(true));
        }
    }
);
