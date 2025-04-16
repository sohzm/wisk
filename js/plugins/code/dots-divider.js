class DotsDivider extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }
    setValue(pr, value) {}
    getValue() {
        return {};
    }
    getCurrentIndex() {
        return 0;
    }
    focusOnIndex(index) {}
    focus(identifier) {}
    getTextContent() {
        return {
            html: '',
            text: '',
            markdown: '---',
        };
    }
    render() {
        const innerHTML = `<style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
            }
            .divider {
                width: 100%;
                height: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                justify-content: center;
            }
            .dot {
                width: 4px;
                height: 4px;
                background-color: var(--fg-2);
                border-radius: 50%;
            }
            </style>
            <div class="divider">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;
        this.shadowRoot.innerHTML = innerHTML;
    }
}

customElements.define('dots-divider', DotsDivider);
