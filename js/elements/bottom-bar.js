import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class BottomBar extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            user-select: none;
        }
        :host {
            z-index: 50;
        }
        @media (min-width: 768px) {
            :host {
                display: none;
            }
        }
        .bottom-bar {
            position: fixed;
            bottom: var(--padding-4);
            width: calc(100% - var(--padding-4) * 2);
            left: var(--padding-4);
            display: flex;
            justify-content: space-around;
            align-items: center;
            border-radius: calc(var(--radius) * 20);
            /*backdrop-filter: blur(40px) contrast(0.9);*/
            background-color: var(--bg-2);
            padding: var(--padding-3);
        }
        .bottom-bar button {
            background-color: transparent;
            border: none;
            cursor: pointer;
            height: 100%;
            outline: none;
            padding: var(--padding-2);
            display: flex;
        }

        .bottom-bar button img {
            height: 22px;
            width: 22px;
            filter: var(--themed-svg);
            opacity: 0.9;
        }
    `;

    static properties = {};

    constructor() {
        super();
    }

    buttonClicked(arg) {
        switch (arg) {
            case 'home':
                window.location.href = '/?id=home';
                break;
            case 'search':
                document.querySelector('search-element').show();
                break;
            case 'plus':
                window.location.href = '/';
                break;
            case 'more':
                // if url id is home return
                if (window.location.href.includes('id=home')) {
                    wisk.utils.showToast('uwu', 1000);
                    return;
                }
                toggleMiniDialogNew('options-component', 'Options');
                break;
            default:
                wisk.utils.showToast('feature in works', 5000);
        }
    }

    render() {
        return html`
            <div class="bottom-bar">
                <button @click="${() => this.buttonClicked('home')}"><img src="/a7/plugins/bottom-bar/home.svg" alt="Home" /></button>
                <button @click="${() => this.buttonClicked('search')}"><img src="/a7/plugins/bottom-bar/search.svg" alt="Home" /></button>
                <button @click="${() => this.buttonClicked('plus')}"><img src="/a7/plugins/bottom-bar/plus.svg" alt="Home" /></button>
                <button @click="${() => this.buttonClicked('more')}">
                    <img src="/a7/plugins/bottom-bar/more.svg" alt="Home" onboarding-options-button />
                </button>
            </div>
        `;
    }
}

customElements.define('bottom-bar', BottomBar);
