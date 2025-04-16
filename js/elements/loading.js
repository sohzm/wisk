import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class CyLoading extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
        }
        :host {
            display: block;
            width: min-content;
            --loader-width: 20px;
            --loader-thickness: 4px;
        }
        .loader {
            border: var(--loader-thickness) solid var(--fg-1);
            border-top: var(--loader-thickness) solid transparent;
            border-radius: 50%;
            width: var(--loader-width);
            height: var(--loader-width);
            animation: spin 2s linear infinite;
        }
        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
    `;

    static properties = {
        width: { type: String, reflect: true },
        thickness: { type: String, reflect: true },
    };

    constructor() {
        super();
        this.width = '20px';
        this.thickness = '4px';
        this.dark = false;
    }

    updated(changedProperties) {
        if (changedProperties.has('width')) {
            this.style.setProperty('--loader-width', this.width);
        }
        if (changedProperties.has('thickness')) {
            this.style.setProperty('--loader-thickness', this.thickness);
        }
    }

    render() {
        return html` <div class="loader ${this.dark ? 'dark' : ''}"></div> `;
    }
}

customElements.define('cy-loading', CyLoading);
