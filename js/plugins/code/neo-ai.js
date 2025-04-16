import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class NeoAI extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            scroll-behavior: smooth;
        }
    `;

    static properties = {};

    constructor() {
        super();
    }

    render() {
        if (wisk.editor.readonly) {
            return html``;
        }

        return html``;
    }
}

customElements.define('neo-ai', NeoAI);

document.querySelector('.editor').appendChild(document.createElement('neo-ai'));
