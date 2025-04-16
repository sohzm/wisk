class ExpText extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.content = [
            { t: 'Hello, World!', p: 'b' },
            { t: 'This is a custom element ', p: 'i' },
            { t: 'and custom events ', p: 'n' },
            { t: 'with shadow DOM ', p: 'u' },
            { t: 'and custom events ', p: 'l', u: 'https://developer.mozilla.org/' },
            { t: 'and custom events ', p: 'n' },
        ];
        this.render();
        this.shadowRoot.addEventListener('mouseup', event => this.handleSelection(event));
        this.shadowRoot.addEventListener('input', event => this.handleEdit(event));
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                * {
                    outline: none;
                    font-family: 'Arial', sans-serif;
                    font-size: 16px;
                }
                .span-b { font-weight: bold; }
                .span-i { font-style: italic; }
                .span-u { text-decoration: underline; }
                .span-l { color: blue; text-decoration: underline; }
                #styleBox {
                    position: absolute;
                    background: white;
                    border: 1px solid black;
                    padding: 5px;
                    display: none;
                }
                #styleBox button {
                    margin: 0 2px;
                    cursor: pointer;
                }
            </style>
            <div id="styleBox">
                <button data-style="n">N</button>
                <button data-style="b">B</button>
                <button data-style="i">I</button>
                <button data-style="u">U</button>
                <button data-style="l">L</button>
            </div>
            <p contenteditable="true" id="content">
                ${this.renderContent()}
            </p>
        `;

        this.styleBox = this.shadowRoot.getElementById('styleBox');
        this.styleBox.addEventListener('click', event => this.applyStyle(event));
    }

    renderContent() {
        return this.content
            .map(item => {
                if (item.p === 'b') {
                    return `<span class="span-b">${item.t}</span>`;
                } else if (item.p === 'i') {
                    return `<span class="span-i">${item.t}</span>`;
                } else if (item.p === 'u') {
                    return `<span class="span-u">${item.t}</span>`;
                } else if (item.p === 'l' && item.u) {
                    return `<a href="${item.u}" class="span-l">${item.t}</a>`;
                } else {
                    return item.t;
                }
            })
            .join('');
    }

    handleSelection(event) {
        const selection = this.shadowRoot.getSelection();
        if (selection.toString().length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            this.styleBox.style.display = 'block';
            this.styleBox.style.left = `${rect.left}px`;
            this.styleBox.style.top = `${rect.top - 30}px`;
        } else {
            this.styleBox.style.display = 'none';
        }
    }

    applyStyle(event) {
        if (event.target.tagName === 'BUTTON') {
            const style = event.target.getAttribute('data-style');
            const selection = this.shadowRoot.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const selectedText = range.toString();
                const startContainer = range.startContainer;
                const startOffset = range.startOffset;

                // Find the index in the content array
                let currentLength = 0;
                let targetIndex = -1;
                for (let i = 0; i < this.content.length; i++) {
                    if (currentLength + this.content[i].t.length >= startOffset) {
                        targetIndex = i;
                        break;
                    }
                    currentLength += this.content[i].t.length;
                }

                if (targetIndex !== -1) {
                    const item = this.content[targetIndex];
                    const splitIndex = startOffset - currentLength;

                    // Split the content item if necessary
                    if (splitIndex > 0 && splitIndex < item.t.length) {
                        this.content.splice(
                            targetIndex,
                            1,
                            { t: item.t.slice(0, splitIndex), p: item.p },
                            { t: selectedText, p: style },
                            { t: item.t.slice(splitIndex + selectedText.length), p: item.p }
                        );
                    } else {
                        this.content[targetIndex] = { t: selectedText, p: style };
                    }

                    // If it's a link, prompt for URL
                    if (style === 'l') {
                        const url = prompt('Enter URL:');
                        if (url) {
                            this.content[targetIndex].u = url;
                        } else {
                            // If no URL provided, revert to normal style
                            this.content[targetIndex].p = 'n';
                        }
                    }

                    // Re-render the content
                    this.shadowRoot.getElementById('content').innerHTML = this.renderContent();
                    this.styleBox.style.display = 'none';

                    // Dispatch update event
                    this.dispatchEvent(
                        new CustomEvent('text-update', {
                            bubbles: true,
                            composed: true,
                            detail: { text: this.shadowRoot.getElementById('content').innerHTML },
                        })
                    );
                }
            }
        }
    }

    handleEdit(event) {
        // Update the content model based on the edited HTML
        const editedHtml = event.target.innerHTML;
        this.content = this.parseHtml(editedHtml);

        // Dispatch update event
        const updateEvent = new CustomEvent('text-update', {
            bubbles: true,
            composed: true,
            detail: { text: editedHtml },
        });
        this.dispatchEvent(updateEvent);
    }

    parseHtml(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const parsedContent = [];

        const parseNode = node => {
            if (node.nodeType === Node.TEXT_NODE) {
                parsedContent.push({ t: node.textContent, p: 'n' });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                let style = 'n';
                if (node.classList.contains('span-b')) style = 'b';
                else if (node.classList.contains('span-i')) style = 'i';
                else if (node.classList.contains('span-u')) style = 'u';
                else if (node.classList.contains('span-l')) {
                    style = 'l';
                    parsedContent.push({ t: node.textContent, p: style, u: node.href });
                    return;
                }
                parsedContent.push({ t: node.textContent, p: style });
            }
        };

        tempDiv.childNodes.forEach(parseNode);
        return parsedContent;
    }
}

customElements.define('exp-text', ExpText);
