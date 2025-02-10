class CheckboxElement extends BaseTextElement {
    constructor() {
        super();
        this.indent = 0;
        this.checked = false;
        this.render();

        this.checkbox = this.shadowRoot.querySelector('#checkbox');
        this.updateIndent();
        this.updateCheckbox();

        this.updatePlaceholder();
    }

    connectedCallback() {
        super.connectedCallback();
        this.checkbox = this.shadowRoot.querySelector('#checkbox');
        this.updateIndent();
        this.updateCheckbox();
        this.updatePlaceholder();

        this.checkbox.addEventListener('change', this.onCheckboxChange.bind(this));
    }

    updatePlaceholder() {
        if (this.editable) {
            const isEmpty = !this.editable.innerHTML.trim();
            this.editable.classList.toggle('empty', isEmpty);
            this.editable.dataset.placeholder = this.getAttribute('placeholder') || this.placeholder;
        }
    }

    updateIndent() {
        const indentWidth = 20;
        this.shadowRoot.querySelectorAll('.indent').forEach(el => el.remove());
        const container = this.shadowRoot.querySelector('#list-outer');
        for (let i = 0; i < this.indent; i++) {
            const indentSpan = document.createElement('span');
            indentSpan.className = 'indent';
            container.insertBefore(indentSpan, container.firstChild);
        }
    }

    updateCheckbox() {
        if (this.checkbox) {
            this.checkbox.checked = this.checked;
        }
    }

    onCheckboxChange(event) {
        if (wisk.editor.readonly) return;

        this.checked = event.target.checked;
        this.sendUpdates();
    }

    getValue() {
        return {
            textContent: this.editable?.innerHTML || '',
            indent: this.indent,
            checked: this.checked,
            references: this.references || [],
        };
    }

    setValue(path, value) {
        if (!this.editable) {
            return;
        }

        if (path === 'value.append') {
            this.editable.innerHTML += value.textContent;
            if (value.references && value.references.length) {
                this.references = this.references.concat(value.references);
            }
        } else {
            this.editable.innerHTML = value.textContent;
            this.indent = value.indent || 0;
            this.checked = value.checked || false;
            this.references = value.references || [];
        }

        this.updateIndent();
        this.updateCheckbox();
    }

    handleEnterKey(event) {
        event.preventDefault();
        const selection = this.shadowRoot.getSelection();
        const range = selection.getRangeAt(0);

        const beforeRange = document.createRange();
        beforeRange.setStart(this.editable, 0);
        beforeRange.setEnd(range.startContainer, range.startOffset);

        const afterRange = document.createRange();
        afterRange.setStart(range.endContainer, range.endOffset);
        afterRange.setEnd(this.editable, this.editable.childNodes.length);

        const beforeContainer = document.createElement('div');
        const afterContainer = document.createElement('div');

        beforeContainer.appendChild(beforeRange.cloneContents());
        afterContainer.appendChild(afterRange.cloneContents());

        this.editable.innerHTML = beforeContainer.innerHTML;
        this.sendUpdates();

        if (this.editable.innerText.trim().length === 0) {
            wisk.editor.changeBlockType(this.id, { textContent: afterContainer.innerHTML }, 'text-element');
        } else {
            wisk.editor.createNewBlock(
                this.id,
                'checkbox-element',
                {
                    textContent: afterContainer.innerHTML,
                    indent: this.indent,
                    checked: false,
                },
                { x: 0 }
            );
        }
    }

    handleBackspace(event) {
        if (this.getFocus() === 0) {
            event.preventDefault();

            if (this.indent > 0) {
                this.indent--;
                this.updateIndent();
                this.sendUpdates();
            } else {
                const prevElement = wisk.editor.prevElement(this.id);
                const prevDomElement = document.getElementById(prevElement.id);
                if (prevElement) {
                    const prevComponentDetail = wisk.plugins.getPluginDetail(prevElement.component);
                    if (prevComponentDetail.textual) {
                        const len = prevDomElement.getTextContent().text.length;
                        wisk.editor.updateBlock(prevElement.id, 'value.append', {
                            textContent: this.editable.innerHTML,
                            references: this.references,
                        });
                        wisk.editor.focusBlock(prevElement.id, { x: len });
                    }
                    wisk.editor.deleteBlock(this.id);
                }
            }
        }
    }

    handleTab(event) {
        event.preventDefault();
        if (this.getFocus() === 0) {
            this.indent++;
            this.updateIndent();
            this.sendUpdates();
        } else {
            document.execCommand('insertText', false, '    ');
        }
    }

    handleBeforeInput(event) {
        if (event.inputType === 'insertText' && event.data === '/' && this.editable.innerText.trim() === '') {
            event.preventDefault();
            wisk.editor.showSelector(this.id);
        } else if (event.inputType === 'insertText' && event.data === ' ' && this.getFocus() === 0) {
            event.preventDefault();
            this.indent++;
            this.updateIndent();
            this.sendUpdates();
        }
    }

    render() {
        const style = `
            <style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                font-family: var(--font);
            }
            #editable {
                outline: none;
                flex: 1;
                line-height: 1.5;
                position: relative;
                min-height: 24px;
                transition: opacity 0.2s ease;
            }
            #list-outer {
                width: 100%;
                border: none;
                display: flex;
                flex-direction: row;
                gap: 8px;
                align-items: flex-start;
                position: relative;
            }
            .indent {
                width: 20px;
            }
            #checkbox {
                appearance: none;
                -webkit-appearance: none;
                width: 18px;
                height: 18px;
                border: 2px solid var(--fg-2);
                border-radius: var(--radius);
                background: var(--bg-accent);
                cursor: pointer;
                position: relative;
                margin-top: 3px; /* because 2+2 is 4-1 that's 3 quick maths */
                transition: all 0.2s ease;
            }
            #checkbox:checked {
                background: var(--fg-accent);
                border-color: var(--fg-accent);
            }
            #checkbox:checked:after {
                content: '';
                position: absolute;
                left: 5px;
                top: 2px;
                width: 4px;
                height: 8px;
                border: solid var(--bg-accent);
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
            }
            #checkbox:checked ~ #editable {
                text-decoration: line-through;
                opacity: 0.6;
            }
            #checkbox:hover {
                border-color: var(--fg-accent);
            }
            a {
                color: var(--fg-blue);
                text-decoration: underline;
            }
            .reference-number {
                color: var(--fg-blue);
                cursor: pointer;
                text-decoration: none;
                margin: 0 1px;
                font-family: var(--font-mono);
            }
            #editable.empty:empty:before {
                content: attr(data-placeholder);
                color: var(--text-3);
                pointer-events: none;
                position: absolute;
                opacity: 0.6;
                top: 0;
                left: 0;
            }
            .emoji-suggestions {
                position: absolute;
                background: var(--bg-1);
                border: 1px solid var(--border-1);
                border-radius: var(--radius);
                padding: var(--padding-2);
                box-shadow: var(--shadow-1);
                display: none;
                z-index: 1000;
                max-height: 200px;
                overflow-y: auto;
                width: max-content;
                min-width: 200px;
            }
            .emoji-suggestion {
                padding: var(--padding-2);
                display: flex;
                align-items: center;
                gap: var(--gap-2);
                cursor: pointer;
                border-radius: var(--radius);
            }
            .emoji-suggestion.selected {
                background: var(--bg-3);
            }
            .emoji-suggestion:hover {
                background: var(--bg-3);
            }
            .emoji-name {
                color: var(--fg-2);
                font-size: 0.9em;
            }
            .emoji {
                width: 30px;
                text-align: center;
            }

            @media (hover: hover) {
                *::-webkit-scrollbar { width: 15px; }
                *::-webkit-scrollbar-track { background: var(--bg-1); }
                *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
                *::-webkit-scrollbar-thumb:hover { background-color: var(--fg-1); }
            }
            .suggestion-text {
                opacity: 0.8;
                color: var(--fg-accent);
            }
            .suggestion-container {
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                padding: var(--padding-2);
                margin-top: 4px;
                display: none;
                z-index: 1;
            }
            .suggestion-actions {
                display: flex;
                gap: var(--gap-2);
                justify-content: center;
            }
            .suggestion-button {
                padding: var(--padding-2) var(--padding-3);
                border-radius: var(--radius);
                border: none;
                background: var(--bg-1);
                outline: none;
                color: var(--fg-1);
                cursor: pointer;
            }
            .suggestion-button:hover {
                background: var(--bg-3);
            }
            .accept-button {
                background: var(--bg-accent);
                color: var(--fg-accent);
                font-weight: bold;
            }
            </style>
        `;
        const content = `
            <div id="list-outer">
                <input type="checkbox" id="checkbox" name="checkbox" value="checkbox" ${wisk.editor.readonly ? 'onclick="return false"' : ''} />
                <div id="editable" contenteditable="${!wisk.editor.readonly}" spellcheck="false" data-placeholder="${this.placeholder || 'Add a task...'}"></div>
                <div class="suggestion-container">
                    <div class="suggestion-actions">
                        <button class="suggestion-button discard-button">Discard</button>
                        <button class="suggestion-button accept-button"> Accept [Tab or Enter] </button>
                    </div>
                </div>
                <div class="emoji-suggestions"></div>
            </div>
        `;
        this.shadowRoot.innerHTML = style + content;
    }

    getTextContent() {
        const indentation = '  '.repeat(this.indent); // Two spaces per indent level
        const checkboxMarker = this.checked ? '[x]' : '[ ]';
        const markdown = indentation + `- ${checkboxMarker} ` + wisk.editor.htmlToMarkdown(this.editable.innerHTML);

        return {
            html: this.editable.innerHTML,
            text: this.editable.innerText,
            markdown: markdown,
        };
    }
}

customElements.define('checkbox-element', CheckboxElement);
