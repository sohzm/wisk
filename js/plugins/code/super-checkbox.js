// TODO add timers to checkbox so that it can be used to track time spent on tasks or play alarms
class SuperCheckbox extends BaseTextElement {
    constructor() {
        const initialEmoji = document.querySelector('emoji-selector').randomEmoji() || '📌';
        super();

        this.value = {
            textContent: '',
            emoji: initialEmoji,
            checked: false,
        };

        this.handleEmojiSelection = this.handleEmojiSelection.bind(this);
        this.defaultNextElement = 'super-checkbox';

        this.render();

        this.checkbox = this.shadowRoot.querySelector('#checkbox');
        this.updateCheckbox();

        this.updatePlaceholder();
    }

    connectedCallback() {
        super.connectedCallback();
        this.editable = this.shadowRoot.querySelector('#editable');
        window.addEventListener('emoji-selector', this.handleEmojiSelection);
        this.render();
        this.updatePlaceholder();

        this.checkbox = this.shadowRoot.querySelector('#checkbox');
        this.updateCheckbox();
        this.updatePlaceholder();

        this.checkbox.addEventListener('change', this.onCheckboxChange.bind(this));
        this.bindEvents();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('emoji-selector', this.handleEmojiSelection);
    }

    handleEmojiSelection(event) {
        if (event.detail.id === this.id) {
            this.value.emoji = event.detail.emoji != '' ? event.detail.emoji : '📌';
            this.emojiButton.textContent = this.value.emoji;
            this.sendUpdates();
        }
    }

    updateCheckbox() {
        if (this.checkbox) {
            this.checkbox.checked = this.value.checked;
        }
    }

    onCheckboxChange(event) {
        if (wisk.editor.readonly) return;

        this.value.checked = event.target.checked;

        if (this.value.checked) {
            this.editable.classList.add('checked');
        } else {
            this.editable.classList.remove('checked');
        }

        this.sendUpdates();
    }

    getValue() {
        var ret = {
            textContent: this.editable.innerHTML,
            emoji: this.value?.emoji || '📌',
            checked: this.value.checked,
        };

        console.log('GET VALUE', ret);
        return ret;
    }

    setValue(path, value) {
        console.log('SET VALUE', path, value);
        if (!this.editable) {
            return;
        }

        if (path == 'value.append') {
            this.editable.innerHTML += value.textContent;
        } else {
            this.editable.innerHTML = value.textContent;
        }

        if (value.emoji) {
            this.value = this.value || {};
            this.value.emoji = value.emoji;
            if (this.emojiButton) {
                this.emojiButton.textContent = value.emoji;
            }
        }

        this.value.checked = value.checked || false;
        this.updatePlaceholder();
        this.updateCheckbox();
    }

    render() {
        var colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'cyan'];
        console.log(this.id);
        var colorIndex = 0;
        if (this.id) {
            colorIndex = this.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % colors.length;
        }

        console.log(colorIndex, colors[colorIndex]);
        const bgColor = '--bg-' + colors[colorIndex];
        const fgColor = '--fg-' + colors[colorIndex];

        const style = `
            <style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                font-family: var(--font);
            }
            .container {
                display: flex;
                align-items: flex-start;
                gap: var(--padding-4);
                background-color: var(${bgColor});
                border-radius: var(--radius-large);
                padding: var(--padding-4);
                align-items: center;
                position: relative;
            }
            .emoji-button {
                font-size: 24px;
                background: none;
                border: none;
                cursor: pointer;
                padding: var(--padding-2);
                border-radius: var(--radius);
                transition: background-color 0.2s;
                line-height: 1;
                z-index: 1;
            }
            .emoji-button:hover {
                background-color: var(--bg-2);
            }
            #editable {
                flex: 1;
                font-size: 16px;
                line-height: 1.5;
                border: none;
                border-radius: var(--radius);
                background-color: transparent;
                outline: none;
                line-height: 1.5;
                padding: 0;
                color: var(--fg-1);
            }
            #editable.empty:before {
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
            ::placeholder {
                color: var(--text-3);
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

            #checkbox {
                appearance: none;
                -webkit-appearance: none;
                width: 20px;
                height: 20px;
                border: 2px solid var(--fg-2);
                border-radius: var(--radius-large);
                background: var(--bg-1);
                cursor: pointer;
                position: relative;
                transition: all 0.2s ease;
                outline: none;
            }
            #checkbox:checked {
                background: var(--fg-1);
                border-color: var(--fg-1);
            }
            #checkbox:checked:after {
                content: '';
                position: absolute;
                left: 5px;
                top: 2px;
                width: 4px;
                height: 8px;
                border: solid var(--bg-1);
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
            }
            #editable.checked {
                text-decoration: line-through;
                opacity: 0.6;
            }
            #checkbox:hover {
                border-color: var(--fg-1);
            }

            .suggestion-text {
                opacity: 0.8;
                color: var(--fg-1);
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
                background: var(--bg-1);
                color: var(--fg-1);
                font-weight: bold;
            }
            </style>
        `;
        const content = `
            <div class="container">
                <button class="emoji-button">${this.value?.emoji || '📌'}</button>
                <div id="editable" contenteditable="${!wisk.editor.readonly}" spellcheck="false" data-placeholder="${this.placeholder}"></div>
                <input type="checkbox" id="checkbox" name="checkbox" value="checkbox" ${wisk.editor.readonly ? 'onclick="return false"' : ''} />
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

        this.emojiButton = this.shadowRoot.querySelector('.emoji-button');
        this.emojiButton.addEventListener('click', e => {
            if (wisk.editor.readonly) return;

            e.stopPropagation();
            // Get the emoji selector component and show it
            const emojiSelector = document.querySelector('emoji-selector');
            if (emojiSelector) {
                emojiSelector.show(this.id);
            }
        });

        this.editable = this.shadowRoot.querySelector('#editable');
    }

    getTextContent() {
        return {
            html: this.editable.innerHTML,
            text: this.editable.innerText,
            markdown: '> ' + wisk.editor.htmlToMarkdown(this.editable.innerHTML),
        };
    }
}

customElements.define('super-checkbox', SuperCheckbox);
