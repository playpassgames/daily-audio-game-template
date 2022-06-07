const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            padding: 16px;
            overflow: auto;
            z-index: 9999;
            pointer-events: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            opacity: 0;
            box-sizing: border-box;
            transition: opacity .2s;
        }

        :host([open]) {
            pointer-events: unset;
            opacity: 1.0;
        }

        :host([open]) .modal-fade:hover {
            cursor: pointer;
        }

        .modal-fade {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,.3);
        }

        .modal-body {
            pointer-events: filled;
            background: white;
            width: 100%;
            max-width: 400px;
            border: 0px solid transparent;
            box-shadow: 0px 3px 3px rgba(0,0,0,.3);
            border-radius: 12px;

            opacity: 0;
            transform: translateY(-20px);

            transition: opacity .2s, transform .2s;
        }

        :host([open]) .modal-body {
            opacity: 1;
            transform: translateY(0);
            transition: opacity .2s .2s, transform .3s .2s;
        }

        .modal-controls:empty {
            display: none;
        }

        .modal-controls {
            padding: 8px 8px;
            justify-content: end;
            display: flex;
        }

        .modal-controls:last-child {
            margin-top: 16px;
            justify-content: center;
        }

        button:hover {
            cursor: pointer;
        }
    </style>
    <div class="modal-fade"></div>
    <div class="modal-body">
        <form>
            <div class="modal-controls">
                <button type="submit" style="background: transparent; border: none;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16" style="pointer-events: none">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </button>
            </div>
            <slot></slot>
            <div class="modal-controls">
                <slot name="input"></slot>
            </div>
        </form>
    </div>
`;

const tagName = "x-modal";

window.customElements.define(
    tagName, 
    class extends HTMLElement {
        constructor() {
            super();
    
            this.attachShadow({mode: 'open'});
            this.shadowRoot.appendChild(template.content.cloneNode(true));

            this.shadowRoot.querySelector(".modal-fade").onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.hide();
            };

            this.shadowRoot.querySelector("form").onsubmit = (e) => {
                e.preventDefault();
                this.hide();
            };
        }

        show() {
            this.setAttribute("open", "");
        }

        hide() {
            this.removeAttribute("open");
        }

        toggle() {
            if (this.hasAttribute("open")) {
                this.hide();
            } else {
                this.show();   
            }
        }
    }
);