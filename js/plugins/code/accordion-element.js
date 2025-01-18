class AccordionElement extends BaseTextElement {
    constructor() {
        const initialEmoji = "🍏";
        super();
        
        this.value = {
            textContent: "",
            emoji: initialEmoji
        };

        // Bind the emoji selection handler
        this.handleEmojiSelection = this.handleEmojiSelection.bind(this);
        
        this.render();
    }

    connectedCallback() {
        super.connectedCallback();
        // Add event listener for emoji selection
        window.addEventListener("emoji-selector", this.handleEmojiSelection);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        // Clean up event listener
        window.removeEventListener("emoji-selector", this.handleEmojiSelection);
    }

    handleEmojiSelection(event) {
        // Only handle events meant for this instance
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
            .accordion-header {
                display: flex;
                align-items: center;
                width: 100%;
                padding: var(--padding-4);
                padding-bottom: 0;
            }
            .question {
                flex: 1;
                outline: none;
                line-height: 1.5;
                border: none;
                font-weight: 600;
                font-size: 18px;
                color: var(--text-1);
                background-color: transparent;
                outline: none;
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
            #editable {
                outline: none;
                line-height: 1.5;
                border: none;
                padding: var(--padding-4);
                display: none;
                color: var(--text-2);
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
            ::placeholder {
                color: var(--text-2);
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
                color: var(--text-2);
                font-size: 0.9em;
            }
            .emoji {
                width: 30px;
                text-align: center;
            }
            *::-webkit-scrollbar { width: 15px; }
            *::-webkit-scrollbar-track { background: var(--bg-1); }
            *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
            *::-webkit-scrollbar-thumb:hover { background-color: var(--text-1); }

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
            </style>
        `;
        
        const content = `
            <div style="display: flex">
                <div style="padding: var(--padding-4); padding-right: 0; padding-top: var(--padding-3); padding-left: 0;">
                    <button class="emoji-button" ?disabled="${window.wisk.editor.wiskSite}">${this.value?.emoji || "📌"}</button>
                </div>
                <div style="flex: 1">
                    <div class="accordion-header">
                        <input class="question" type="text" placeholder="Question" value="${this.question || ''}" ${window.wisk.editor.wiskSite ? "disabled" : ""} />
                        <img src="/a7/plugins/accordion/down.svg" class="toggle-btn" />
                    </div>
                    <div id="editable" contenteditable="${!window.wisk.editor.wiskSite}" spellcheck="false" data-placeholder="${this.placeholder}"></div>
                    <div class="emoji-suggestions"></div>
                </div>
            </div>
        `;
        
        this.shadowRoot.innerHTML = style + content;

        this.emojiButton = this.shadowRoot.querySelector('.emoji-button');
        this.emojiButton.addEventListener('click', (e) => {
            if (window.wisk.editor.wiskSite) return;
            
            e.stopPropagation();
            // Get the emoji selector component and show it
            const emojiSelector = document.querySelector('emoji-selector');
            if (emojiSelector) {
                emojiSelector.show(this.id);
            }
        });

        this.setupToggleListener();
    }

    setupToggleListener() {
        var toggleBtn = this.shadowRoot.querySelector('.toggle-btn');
        if (wisk.editor.wiskSite) {
            toggleBtn = this.shadowRoot.querySelector('.accordion-header');
        }

        const editable = this.shadowRoot.querySelector('#editable');
        
        toggleBtn.addEventListener('click', () => {
            const isVisible = editable.classList.contains('visible');
            editable.classList.toggle('visible');
            toggleBtn.classList.toggle('open');
        });
    }

    getValue() {
        if (!this.editable) {
            return { textContent: "", question: "", emoji: this.value?.emoji || "📌" };
        }
        return {
            textContent: this.editable.innerHTML,
            question: this.shadowRoot.querySelector('.question').value,
            emoji: this.value?.emoji || "📌"
        };
    }

    setValue(path, value) {
        if (!this.editable) {
            return;
        }
        if (path === "value.append") {
            this.editable.innerHTML += value.textContent;
            if (value.question) {
                this.shadowRoot.querySelector('.question').value = value.question;
            }
            if (value.emoji) {
                this.value.emoji = value.emoji;
                this.emojiButton.textContent = value.emoji;
            }
        } else {
            this.editable.innerHTML = value.textContent;
            if (value.question) {
                this.shadowRoot.querySelector('.question').value = value.question;
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
            html: this.shadowRoot.querySelector('.question').value + "?<br>" + this.editable.innerHTML,
            text: this.shadowRoot.querySelector('.question').value + "? " + this.editable.textContent,
            markdown: "# " + this.shadowRoot.querySelector('.question').value + "?\n" + window.wisk.editor.htmlToMarkdown(this.editable.innerHTML),
        }
    }
}

customElements.define("accordion-element", AccordionElement);