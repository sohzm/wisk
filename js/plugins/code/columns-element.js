class ColumnsElement extends HTMLElement {
    constructor() {
        super();
        this.columns = [];
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `uwu`;
    }
}

customElements.define('columns-element', ColumnsElement);
