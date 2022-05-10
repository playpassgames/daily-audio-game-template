const template = document.createElement('template');
template.innerHTML = `
<style>
    :host {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 1px solid var(--text-muted);
        padding: 12px 0;
    }

    :host .brand {
        display: flex;
        justify-content: center;
        flex: 2;
        text-align: center;
    }

    :host .button-group {
        display: flex;
        flex: 1;
        gap: 0.5em;
    }

    :host .button-group.left {
        justify-content: flex-start;
    }

    :host .button-group.right {
        justify-content: flex-end;
    }
</style>
<div class="button-group left">
    <slot name="buttons-left"></slot>
</div>
<div class="brand">
    <slot name="brand"></slot>
</div>
<div class="button-group right">
    <slot name="buttons-right"></slot>
</div>
`;

window.customElements.define(
    "game-header",
    class extends HTMLElement {
        constructor() {
            super();

            this.attachShadow({mode: 'open'});
            this.shadowRoot.appendChild(template.content.cloneNode(true));
        }
    }
);
