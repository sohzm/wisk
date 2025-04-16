class SomeElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    setValue(value) {}

    getValue() {
        return {};
    }

    getCurrentIndex() {
        return 0;
    }

    focusOnIndex(index) {}

    render() {
        const innerHTML = `
            <style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
            }
            </style>
            <div></div>
        `;

        this.shadowRoot.innerHTML = innerHTML;
    }
}

customElements.define('some-element', SomeElement);
