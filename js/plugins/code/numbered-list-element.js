class NumberedListElement extends BaseTextElement {
    constructor() {
        super();
        this.indent = 0;
        this.number = 1;
        this.render();

        this.numberElement = this.shadowRoot.querySelector('#number');
        this.updateIndent();
        this.updateNumber();
    }

    connectedCallback() {
        super.connectedCallback();
        this.numberElement = this.shadowRoot.querySelector('#number');
        this.updateIndent();
        this.updateNumber();
    }

    getNumberStyle(num, level) {
        const styles = [
            // Level 0: 1, 2, 3...
            n => n,
            // Level 1: i, ii, iii...
            n => this.toRoman(n).toLowerCase(),
            // Level 2: a, b, c...
            n => String.fromCharCode(96 + n),
            // Level 3: 1, 2, 3... (repeat)
            n => n,
            // Level 4: i, ii, iii... (repeat)
            n => this.toRoman(n).toLowerCase(),
        ];

        return styles[level % styles.length](num);
    }

    // Convert number to Roman numerals
    toRoman(num) {
        const romanNumerals = [
            { value: 1000, symbol: 'M' },
            { value: 900, symbol: 'CM' },
            { value: 500, symbol: 'D' },
            { value: 400, symbol: 'CD' },
            { value: 100, symbol: 'C' },
            { value: 90, symbol: 'XC' },
            { value: 50, symbol: 'L' },
            { value: 40, symbol: 'XL' },
            { value: 10, symbol: 'X' },
            { value: 9, symbol: 'IX' },
            { value: 5, symbol: 'V' },
            { value: 4, symbol: 'IV' },
            { value: 1, symbol: 'I' },
        ];

        let result = '';
        for (let numeral of romanNumerals) {
            while (num >= numeral.value) {
                result += numeral.symbol;
                num -= numeral.value;
            }
        }
        return result;
    }

    getValue() {
        return {
            textContent: this.editable?.innerHTML || '',
            indent: this.indent,
            number: this.number,
        };
    }

    setValue(path, value) {
        if (!this.editable) {
            return;
        }

        if (path === 'value.append') {
            this.editable.innerHTML += value.textContent;
        } else {
            this.editable.innerHTML = value.textContent;
            this.indent = value.indent || 0;
            this.number = value.number || 1;
        }

        this.updateIndent();
        this.updateNumber();
    }

    updateIndent() {
        const indentWidth = 24;
        const numberWidth = 24;
        if (this.numberElement && this.editable) {
            this.numberElement.style.left = `${this.indent * indentWidth}px`;
            this.editable.style.paddingLeft = `${this.indent * indentWidth + numberWidth + 8}px`;
            this.updateNumber(); // Update number style when indent changes
        }
    }

    updateNumber() {
        if (this.numberElement) {
            const formattedNumber = this.getNumberStyle(this.number, this.indent);
            this.numberElement.textContent = formattedNumber + '.';
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
                'numbered-list-element',
                {
                    textContent: afterContainer.innerHTML,
                    indent: this.indent,
                    number: this.number + 1,
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
                const prevDomElement = wisk.editor.getElement(prevElement.id);
                if (prevElement) {
                    const prevComponentDetail = wisk.plugins.getPluginDetail(prevElement.component);
                    if (prevComponentDetail.textual) {
                        const len = prevDomElement.value.textContent.length;
                        wisk.editor.updateBlock(prevElement.id, 'value.append', {
                            textContent: this.editable.innerHTML,
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

    render() {
        const style = `
            <style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                font-family: var(--font);
            }
            #container {
                position: relative;
            }
            #number {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                color: var(--fg-1);
                font-size: 14px;
                min-width: 20px;
                text-align: right;
            }
            #editable {
                line-height: 1.5;
                outline: none;
                transition: padding-left 0.1s ease-in-out;
                min-height: 24px;
            }
            #editable.empty:empty:before {
                content: attr(data-placeholder);
                color: var(--text-3);
                pointer-events: none;
                position: absolute;
                opacity: 0.6;
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
            <div id="container">
                <div id="number">1.</div>
                <div id="editable" contenteditable="${!wisk.editor.readonly}" spellcheck="false" data-placeholder="${this.placeholder || 'Add a list item...'}" ></div>
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
        const indentation = '  '.repeat(this.indent);
        const formattedNumber = this.getNumberStyle(this.number, this.indent);
        const markdown = indentation + `${formattedNumber}. ` + wisk.editor.htmlToMarkdown(this.editable.innerHTML);
        return {
            html: this.editable.innerHTML,
            text: this.editable.innerText,
            markdown: markdown,
        };
    }
}

customElements.define('numbered-list-element', NumberedListElement);
