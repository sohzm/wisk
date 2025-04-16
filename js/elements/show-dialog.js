import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class ShowDialog extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            user-select: none;
        }
        :host {
            z-index: 99999;
        }

        .bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            display: none;
            height: 100%;
            background: var(--fg-1);
            opacity: 0.3;
            z-index: 99;
        }

        .dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 400px;
            height: auto;
            max-height: 200px;
            background: var(--bg-1);
            border-radius: var(--radius-large);
            padding: var(--padding-4);
            filter: var(--drop-shadow);
            border: 1px solid var(--border-1);
            display: none;
            z-index: 100;
            color: var(--fg-1);
            flex-direction: column;
            gap: var(--gap-2);
        }

        .show {
            display: flex;
        }

        .dialog-msg {
            height: 100%;
            overflow: auto;
            user-select: text;
        }

        button {
            width: fit-content;
            cursor: pointer;
            margin-left: auto;
            padding: var(--padding-w1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background: var(--bg-2);
            color: var(--fg-1);
        }

        @media (hover: hover) {
            *::-webkit-scrollbar {
                width: 15px;
            }
            *::-webkit-scrollbar-track {
                background: var(--bg-1);
            }
            *::-webkit-scrollbar-thumb {
                background-color: var(--bg-3);
                border-radius: 20px;
                border: 4px solid var(--bg-1);
            }
            *::-webkit-scrollbar-thumb:hover {
                background-color: var(--fg-1);
            }
        }
    `;

    static properties = {};

    constructor() {
        super();
        this.callback = null;
        wisk.utils.showDialog = this.showDialog.bind(this);
    }

    showDialog(message, title = 'Message', callback = null) {
        this.shadowRoot.querySelector('.dialog-msg').innerHTML = message;
        this.shadowRoot.querySelector('.dialog h3').innerText = title;

        if (callback) {
            this.callback = callback;
        }

        this.shadowRoot.querySelector('.dialog').classList.add('show');
        this.shadowRoot.querySelector('.bg').classList.add('show');
    }

    hideDialog() {
        this.shadowRoot.querySelector('.dialog').classList.remove('show');
        this.shadowRoot.querySelector('.bg').classList.remove('show');
        if (this.callback) {
            try {
                this.callback();
            } catch (error) {
                console.error('Dialog callback error:', error);
            } finally {
                this.callback = null;
            }
        }
    }

    render() {
        return html`
            <div class="bg"></div>
            <div class="dialog">
                <h3>Dialog</h3>
                <div class="dialog-msg">Lorem ipsum dolor sit amet.</div>
                <button @click="${() => this.hideDialog()}">Okay</button>
            </div>
        `;
    }
}

customElements.define('show-dialog', ShowDialog);
