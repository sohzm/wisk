import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class DatabasePage extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
        }
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--fg-2);
            opacity: 0.3;
            z-index: 98;
        }
        .iframe-o {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 100;
            justify-content: center;
            align-items: center;
            display: flex;
        }
        .iframe-div {
            border-radius: var(--radius-large);
            box-shadow: var(--drop-shadow);
            background-color: var(--bg-1);
            z-index: 99;
            height: 90%;
            width: 90%;
            max-width: 957px; /* yeah i just copied this from what my notion was showing */
            max-height: 818px;
            overflow: hidden;
            position: relative;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        .expand {
            filter: var(--themed-svg);
            pointer-events: none;
        }
        .expand-btn {
            position: absolute;
            top: var(--padding-4);
            right: var(--padding-4);
            cursor: pointer;
            background-color: var(--bg-1);
            padding: var(--padding-3);
            border: none;
            outline: none;
            display: flex;
            border-radius: calc(var(--radius-large) * 10);
            overflow: hidden;
        }
        .hidden {
            display: none;
        }
    `;

    static properties = {
        url: { type: String },
    };

    constructor() {
        super();
        this.url = '';
    }

    open() {
        var x = this.shadowRoot.querySelector('iframe').contentWindow.location.href;
        var id = new URLSearchParams(x.split('?')[1]).get('id');
        window.open(`?id=${id}`, '_blank');
    }

    firstUpdated() {
        this.hide();
    }

    show(url) {
        this.url = url;
        this.classList.remove('hidden');
        this.requestUpdate();
    }

    hide() {
        this.url = '';
        this.classList.add('hidden');
    }

    render() {
        if (new URLSearchParams(window.location.search).get('zen') === 'true') {
            return ``;
        }

        return html`
            <div class="iframe-o">
                <div class="overlay" @click="${() => this.hide()}"></div>
                <div class="iframe-div">
                    <button class="expand-btn" @click="${() => this.open()}">
                        <img src="/a7/forget/open-3.svg" class="expand" />
                    </button>

                    <iframe src="${this.url}"></iframe>
                </div>
            </div>
        `;
    }
}

customElements.define('database-page', DatabasePage);

document.body.appendChild(document.createElement('database-page'));
document.querySelector('database-page').style.zIndex = 99;
