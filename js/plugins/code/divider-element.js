class DividerElement extends HTMLElement {
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
            }
            </style>
            <div class="divider">
                <div style="width: 100%; height: 1px; background-color: var(--border-1);"></div>
            </div>
        `;
        this.shadowRoot.innerHTML = innerHTML;
    }
}

customElements.define('divider-element', DividerElement);
