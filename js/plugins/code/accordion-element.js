class AccordionElement extends BaseTextElement {
    constructor() {
        const initialEmoji = '🍏';
        super();

        this.value = {
            textContent: '',
            emoji: initialEmoji,
        };

        this.handleEmojiSelection = this.handleEmojiSelection.bind(this);
        this.handleClick = this.handleClick.bind(this);

        this.render();
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('emoji-selector', this.handleEmojiSelection);
        if (wisk.editor.readonly) {
            this.addEventListener('click', this.handleClick);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('emoji-selector', this.handleEmojiSelection);
        if (wisk.editor.readonly) {
            this.removeEventListener('click', this.handleClick);
        }
    }

    handleClick(event) {
        if (wisk.editor.readonly) {
            const editable = this.shadowRoot.querySelector('#editable');
            const toggleBtn = this.shadowRoot.querySelector('.toggle-btn');
            editable.classList.toggle('visible');
            toggleBtn.classList.toggle('open');
        }
    }

    handleEmojiSelection(event) {
        if (event.detail.id === this.id) {
            this.value.emoji = event.detail.emoji;
            this.emojiButton.textContent = event.detail.emoji;
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
            :host {
                position: relative;
            }
            .accordion-header {
                display: flex;
                align-items: center;
                width: 100%;
                padding: var(--padding-4);
                padding-bottom: 0;
                padding-right: 0;
            }
            .question {
                flex: 1;
                outline: none;
                line-height: 1.5;
                border: none;
                font-weight: 600;
                font-size: 18px;
                color: var(--fg-1);
                background-color: transparent;
                white-space: pre-wrap;
                word-wrap: break-word;
                min-height: 1.5em;
            }
            .question:empty:before {
                content: "Question";
                color: var(--fg-2);
                pointer-events: none;
                position: absolute;
                opacity: 0.6;
            }
            .toggle-btn {
                cursor: pointer;
                transition: transform 0.3s ease;
                filter: var(--themed-svg);
                opacity: 0.6;
            }
            .toggle-btn.open {
                transform: rotate(180deg);
            }
            .accordion-header.open .toggle-btn {
                transform: rotate(180deg);
            }
            #editable {
                outline: none;
                line-height: 1.5;
                border: none;
                padding: var(--padding-4);
                display: none;
                color: var(--fg-2);
            }
            #editable.visible {
                display: block;
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

            .emoji-button {
                font-size: 36px;
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
            <div style="display: flex">
                <div style="padding: var(--padding-4); padding-right: 0; padding-top: var(--padding-3); padding-left: 0;">
                    <button class="emoji-button" ?disabled="${wisk.editor.readonly}">${this.value?.emoji || '📌'}</button>
                </div>
                <div style="flex: 1">
                    <div class="accordion-header">
                        <div class="question" contenteditable="${!wisk.editor.readonly}" spellcheck="false">${this.question || ''}</div>
                        <img src="/a7/plugins/accordion/down.svg" class="toggle-btn" />
                    </div>
                    <div id="editable" contenteditable="${!wisk.editor.readonly}" spellcheck="false" data-placeholder="${this.placeholder}"></div>
                    <div class="suggestion-container">
                        <div class="suggestion-actions">
                            <button class="suggestion-button discard-button">Discard</button>
                            <button class="suggestion-button accept-button"> Accept [Tab or Enter] </button>
                        </div>
                    </div>
                    <div class="emoji-suggestions"></div>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = style + content;

        this.emojiButton = this.shadowRoot.querySelector('.emoji-button');
        this.emojiButton.addEventListener('click', e => {
            if (!wisk.editor.readonly) {
                e.stopPropagation();
                const emojiSelector = document.querySelector('emoji-selector');
                if (emojiSelector) {
                    emojiSelector.show(this.id);
                }
            }
        });

        if (!wisk.editor.readonly) {
            this.setupToggleListener();
        } else {
            for (const el of this.shadowRoot.querySelectorAll('*')) {
                el.style.cursor = 'pointer';
            }
        }
    }

    setupToggleListener() {
        const toggleBtn = this.shadowRoot.querySelector('.toggle-btn');
        const editable = this.shadowRoot.querySelector('#editable');

        toggleBtn.addEventListener('click', () => {
            editable.classList.toggle('visible');
            toggleBtn.classList.toggle('open');
        });
    }

    getValue() {
        if (!this.editable) {
            return { textContent: '', question: '', emoji: this.value?.emoji || '📌' };
        }
        return {
            textContent: this.editable.innerHTML,
            question: this.shadowRoot.querySelector('.question').innerHTML,
            emoji: this.value?.emoji || '📌',
        };
    }

    setValue(path, value) {
        if (!this.editable) {
            return;
        }
        if (path === 'value.append') {
            this.editable.innerHTML += value.textContent;
            if (value.question) {
                this.shadowRoot.querySelector('.question').innerHTML = value.question;
            }
            if (value.emoji) {
                this.value.emoji = value.emoji;
                this.emojiButton.textContent = value.emoji;
            }
        } else {
            this.editable.innerHTML = value.textContent;
            if (value.question) {
                this.shadowRoot.querySelector('.question').innerHTML = value.question;
            }
            if (value.emoji) {
                this.value.emoji = value.emoji;
                this.emojiButton.textContent = value.emoji;
            }
        }
        this.updatePlaceholder();
    }

    getTextContent() {
        return {
            html: this.shadowRoot.querySelector('.question').innerHTML + '?<br>' + this.editable.innerHTML,
            text: this.shadowRoot.querySelector('.question').textContent + '? ' + this.editable.textContent,
            markdown: '# ' + this.shadowRoot.querySelector('.question').textContent + '?\n' + wisk.editor.htmlToMarkdown(this.editable.innerHTML),
        };
    }
}

customElements.define('accordion-element', AccordionElement);
