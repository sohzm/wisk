class HelloWorld extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.items = ['Editable Item 1', 'Editable Item 2', 'Editable Item 3']; // Example array
        this.render();
        this.shadowRoot.addEventListener('input', event => this.handleEdit(event));
    }

    render() {
        this.shadowRoot.innerHTML = `
                    <style>
                        span {
                            color: darkblue;
                            font-size: 20px;
                            font-family: 'Arial', sans-serif;
                        }
                        .item {
                            color: darkred;
                            font-size: 16px;
                            margin-left: 20px;
                            cursor: text;
                        }
                    </style>
                    <span contenteditable="true">Hello, World!</span>
                    <ul>
                        ${this.items.map(item => `<li class="item" contenteditable="true">${item}</li>`).join('')}
                    </ul>
                `;
    }

    handleEdit(event) {
        // Custom event with detail containing the text
        const updateEvent = new CustomEvent('text-update', {
            bubbles: true,
            composed: true, // allows the event to cross the shadow DOM boundary
            detail: { text: event.target.innerText },
        });
        this.dispatchEvent(updateEvent);
    }
}

customElements.define('hello-world', HelloWorld);
