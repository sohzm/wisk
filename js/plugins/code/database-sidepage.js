import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class DatabaseSidepage extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
            height: 100%;
            width: 100%;
        }
    `;

    static properties = {
        url: { type: String },
    };

    constructor() {
        super();
        this.url = '/';
    }

    render() {
        return html` <iframe url="${this.url}" style="width: 100%; height: 100%; border: none;"></iframe> `;
    }
}

customElements.define('database-sidepage', DatabaseSidepage);
