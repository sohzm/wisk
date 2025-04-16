class BaseTextElement extends HTMLElement {
    constructor() {
        super();
        this.typingTimer = null;
        this.TYPING_DELAY = 1000;
        this.suggestionText = '';
        this.suggestionActive = false;
        this.isEditableFocused = false;
        this.defaultNextElement = 'text-element';

        this.attachShadow({ mode: 'open' });
        this.render();
        this.updatePlaceholder();
        this.isMouseOverSuggestions = false;
        this.isVirtualKeyboard = this.checkIfVirtualKeyboard();
        this.savedRange = null;
        this.savedSelection = null;
        this.placeholder = this.getAttribute('placeholder') || wisk.editor.readonly ? '' : "Write something or press '/' for commands";
        this.toolbar = document.getElementById('formatting-toolbar');
        this.toolbar.addEventListener('toolbar-action', e => {
            if (e.detail.elementId === this.id) {
                console.log('Toolbar action received', e.detail);
                this.handleToolbarAction(e.detail);
            }
        });
        this.toolbar.addEventListener('save-selection', e => {
            if (e.detail.elementId === this.id) {
                this.saveSelection();
            }
        });
        this.toolbar.addEventListener('create-link', e => {
            if (e.detail.elementId === this.id) {
                this.handleCreateLink(e.detail.url);
            }
        });
        this.toolbar.addEventListener('create-reference', e => {
            if (e.detail.elementId === this.id) {
                this.handleCreateReference(e.detail);
            }
        });
        this.toolbar.addEventListener('ai-operation-complete', e => {
            if (e.detail.elementId === this.id) {
                this.handleAIOperationComplete(e.detail);
            }
        });
        window.addEventListener('cite-element-updated', e => {
            if (this.editable.innerHTML.includes(e.detail.referenceId)) {
                this.sendUpdates();
            }
        });

        // emoji support if its not obvious by name
        this.emojiSuggestions = [];
        this.showingEmojiSuggestions = false;
        this.selectedEmojiIndex = 0;
        this.currentEmojiQuery = '';
    }

    getSurroundingText() {
        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) return null;

        const cursorPosition = this.getFocus();
        const text = this.editable.innerText;

        // get the first 3 and after 3 elements text from this.id
        var bef = [];
        var aft = [];
        for (const elm of wisk.editor.document.data.elements) {
            if (elm.id === this.id) {
                bef = wisk.editor.document.data.elements.slice(
                    Math.max(0, wisk.editor.document.data.elements.indexOf(elm) - 3),
                    wisk.editor.document.data.elements.indexOf(elm)
                );
                aft = wisk.editor.document.data.elements.slice(
                    wisk.editor.document.data.elements.indexOf(elm) + 1,
                    wisk.editor.document.data.elements.indexOf(elm) + 4
                );
            }
        }

        var before = '';
        var after = '';
        for (const elm of bef) {
            before += document.getElementById(elm.id).getTextContent().text + '\n';
        }
        for (const elm of aft) {
            after += document.getElementById(elm.id).getTextContent().text + '\n';
        }

        return {
            before: before + text.substring(0, cursorPosition),
            after: text.substring(cursorPosition, text.length) + after,
        };
    }

    async fetchAutoComplete(before, after) {
        const user = await document.querySelector('auth-component').getUserInfo();

        if (before.trim() === '' && after.trim() === '') return null;

        try {
            const response = await fetch(wisk.editor.backendUrl + '/v2/autocomplete', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ before, after, gpt_zero: wisk.editor.gptZero }),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            return await response.text();
        } catch (error) {
            this.discardSuggestion();
            console.error('Autocomplete error:', error);
            wisk.utils.showToast('Error fetching autocomplete suggestions', 3000);
            return null;
        } finally {
        }
    }

    handleTyping = async () => {
        clearTimeout(this.typingTimer);

        this.typingTimer = setTimeout(async () => {
            if (!wisk.editor.aiAutocomplete) return;
            if (this.suggestionActive) return;
            if (!this.isEditableFocused) return;

            this.suggestionActive = true;

            const surroundingText = this.getSurroundingText();
            if (!surroundingText) return;

            this.suggestionText = await this.fetchAutoComplete(surroundingText.before, surroundingText.after);
            if (!this.suggestionText) return;

            if (this.isEditableFocused) {
                this.showSuggestion(this.suggestionText);
            } else {
                this.suggestionActive = false;
            }
        }, this.TYPING_DELAY);
    };

    showSuggestion(suggestion) {
        const container = this.shadowRoot.querySelector('.suggestion-container');
        var textEl = document.createElement('span');
        textEl.classList.add('suggestion-text');

        const selection = this.shadowRoot.getSelection();

        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.insertNode(textEl);

            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            this.editable.appendChild(textEl);
        }

        textEl.textContent = suggestion;
        container.style.display = 'inline';
    }

    getSelectionPosition() {
        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) return null;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        return {
            x: rect.left + rect.width / 2,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            selectedText: selection.toString(),
        };
    }

    handleAIOperationComplete(detail) {
        if (!this.restoreSelection()) {
            console.warn('No saved selection for AI operation');
            return;
        }

        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        try {
            // Replace the selected content with the AI-improved text
            const textNode = document.createTextNode(detail.newText);
            range.deleteContents();
            range.insertNode(textNode);

            // Clean up selection
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);

            // Clear the saved selection
            this.clearSelection();

            // Update the content
            this.sendUpdates();
        } catch (error) {
            console.error('Error applying AI operation:', error);
            this.handleAIOperationFallback(detail.newText, selection);
        }
    }

    handleAIOperationFallback(newText, selection) {
        try {
            // Fallback method using execCommand
            document.execCommand('insertText', false, newText);
            this.sendUpdates();
        } catch (fallbackError) {
            console.error('AI operation fallback failed:', fallbackError);
        }
    }

    handleCreateReference(detail) {
        if (!this.restoreSelection()) {
            console.warn('No saved selection for citation');
            return;
        }

        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        try {
            const spaceNode = document.createTextNode(' ');

            const citeElement = document.createElement('cite-element');
            citeElement.contentEditable = 'false';
            citeElement.setAttribute('reference-id', detail.citation.id);
            citeElement.setAttribute('citation', detail.inlineCitation);

            range.collapse(false);

            range.insertNode(citeElement);
            range.insertNode(spaceNode);

            range.setStartAfter(citeElement);
            range.setEndAfter(citeElement);
            selection.removeAllRanges();
            selection.addRange(range);

            this.sendUpdates();
        } catch (error) {
            console.error('Error creating citation:', error);
            this.handleReferenceFallback(detail, selection);
        }
    }

    handleReferenceFallback(detail, selection) {
        try {
            const text = selection.toString();
            document.execCommand('insertText', false, text);

            const range = selection.getRangeAt(0);
            const citeElement = document.createElement('cite-element');
            citeElement.contentEditable = 'false';
            citeElement.setAttribute('reference-id', detail.citation.id);
            citeElement.setAttribute('citation', detail.inlineCitation);

            range.insertNode(citeElement);

            this.sendUpdates();
        } catch (fallbackError) {
            console.error('Reference fallback failed:', fallbackError);
        }
    }

    handleCreateLink(url) {
        if (!this.restoreSelection()) {
            console.warn('No saved selection to create link from');
            return;
        }

        const selection = this.shadowRoot.getSelection();
        const range = selection.getRangeAt(0);

        if (!this.editable.contains(range.commonAncestorContainer)) {
            console.warn('Selection is outside the editable area');
            return;
        }

        try {
            const link = document.createElement('a');
            link.href = this.normalizeUrl(url);
            link.target = '_blank';
            link.contentEditable = 'false';

            const fragment = range.extractContents();
            link.appendChild(fragment);

            range.insertNode(link);

            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);

            this.clearSelection();

            this.sendUpdates();
        } catch (error) {
            console.error('Error creating link:', error);
            this.handleLinkFallback(url, selection);
        }
    }

    handleLinkFallback(url, selection) {
        try {
            const text = selection.toString();
            document.execCommand('insertText', false, text);

            const range = selection.getRangeAt(0);
            const link = document.createElement('a');
            link.href = this.normalizeUrl(url);
            link.target = '_blank';
            link.contentEditable = 'false';

            const newRange = document.createRange();
            newRange.setStart(range.startContainer, range.startOffset - text.length);
            newRange.setEnd(range.startContainer, range.startOffset);

            newRange.surroundContents(link);

            this.sendUpdates();
        } catch (fallbackError) {
            console.error('Link fallback failed:', fallbackError);
        }
    }

    connectedCallback() {
        this.editable = this.shadowRoot.querySelector('#editable');
        this.emojiSuggestionsContainer = this.shadowRoot.querySelector('.emoji-suggestions');

        this.updatePlaceholder();
        this.bindEvents();
    }

    saveSelection() {
        const selection = this.shadowRoot.getSelection();
        if (selection.rangeCount > 0) {
            this.savedSelection = {
                range: selection.getRangeAt(0).cloneRange(),
                text: selection.toString(),
            };
        }
    }

    restoreSelection() {
        if (this.savedSelection) {
            const selection = this.shadowRoot.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.savedSelection.range);
            return true;
        }
        return false;
    }

    clearSelection() {
        this.savedSelection = null;
    }

    normalizeUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return 'https://' + url;
        }
        return url;
    }

    findParentLink(node) {
        while (node && node !== this.editable) {
            if (node.tagName === 'A') {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    createLink(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        try {
            const fragment = range.extractContents();
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(fragment);
            const plainText = tempDiv.textContent;
            const textNode = document.createTextNode(plainText);
            const link = document.createElement('a');
            link.href = url;
            link.contentEditable = 'false';
            link.target = '_blank';

            link.appendChild(textNode);
            range.insertNode(link);
            range.collapse(false);
        } catch (error) {
            console.error('Error creating link:', error);
            try {
                document.execCommand('insertText', false, selection.toString());
                const newRange = document.createRange();
                newRange.setStartBefore(range.startContainer);
                newRange.setEndAfter(range.startContainer);
                const link = document.createElement('a');
                link.href = url;
                link.contentEditable = 'false';
                link.target = '_blank';
                newRange.surroundContents(link);
            } catch (fallbackError) {
                console.error('Fallback link creation failed:', fallbackError);
            }
        }

        this.sendUpdates();
    }

    applyFormat(format) {
        document.execCommand(format, false, null);
        this.sendUpdates();
    }

    bindEvents() {
        this.editable.addEventListener('beforeinput', this.handleBeforeInput.bind(this));
        this.editable.addEventListener('input', this.onValueUpdated.bind(this));
        this.editable.addEventListener('keydown', this.handleKeyDown.bind(this));

        this.editable.addEventListener('focus', () => {
            this.isEditableFocused = true;
            if (this.editable.innerText.trim() === '') {
                this.editable.classList.add('empty');
            }
        });

        this.editable.addEventListener('blur', () => {
            this.isEditableFocused = false;
            this.updatePlaceholder();
        });

        this.editable.addEventListener('paste', this.handlePaste.bind(this));

        const handleSelectionChange = () => {
            const selection = this.shadowRoot.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const container = range.commonAncestorContainer;
                if (this.shadowRoot.contains(container)) {
                    this.updateToolbarPosition();
                }
            }
        };

        const observer = new MutationObserver(() => {
            handleSelectionChange();
        });

        observer.observe(this.editable, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        this.shadowRoot.addEventListener('selectionchange', handleSelectionChange);

        this.editable.addEventListener('mouseup', handleSelectionChange);
        this.editable.addEventListener('keyup', e => {
            if (e.key === 'Shift' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a')) {
                handleSelectionChange();
            }
        });

        this.editable.addEventListener('keydown', e => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        this.applyFormat('bold');
                        break;
                    case 'd':
                        e.preventDefault();
                        this.applyFormat('strikeThrough');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.applyFormat('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.applyFormat('underline');
                        break;
                    case 'a':
                        setTimeout(handleSelectionChange, 0);
                        break;
                }
            }
        });

        this.editable.addEventListener('keydown', e => {
            this.handleMarkdown(e);
        });

        this.disconnectedCallback = () => {
            observer.disconnect();
            this.shadowRoot.removeEventListener('selectionchange', handleSelectionChange);
        };

        document.addEventListener('click', e => {
            if (!this.editable.contains(e.target) && !this.emojiSuggestionsContainer.contains(e.target)) {
                this.hideEmojiSuggestions();
            }
        });

        this.editable.addEventListener('blur', () => {
            setTimeout(() => {
                if (!this.emojiSuggestionsContainer.contains(document.activeElement) && !this.emojiSuggestionsContainer.matches(':hover')) {
                    this.hideEmojiSuggestions();
                }
            }, 0);
            this.updatePlaceholder();
        });

        this.emojiSuggestionsContainer.addEventListener('mouseenter', () => {
            this.isMouseOverSuggestions = true;
        });

        this.emojiSuggestionsContainer.addEventListener('mouseleave', () => {
            this.isMouseOverSuggestions = false;
        });

        this.editable.addEventListener('input', this.handleTyping);
        this.shadowRoot.querySelector('.accept-button').addEventListener('click', () => {
            this.acceptSuggestion();
        });
        this.shadowRoot.querySelector('.discard-button').addEventListener('click', () => {
            this.discardSuggestion();
        });
    }

    discardSuggestion() {
        this.shadowRoot.querySelector('.suggestion-container').style.display = 'none';
        if (this.shadowRoot.querySelector('.suggestion-text')) {
            this.shadowRoot.querySelector('.suggestion-text').remove();
        }
        this.suggestionActive = false;
    }

    acceptSuggestion() {
        if (!this.suggestionText || !this.suggestionActive) {
            return;
        }

        const tempFocused = this.isEditableFocused;
        this.isEditableFocused = true;

        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) {
            const textNode = document.createTextNode(this.suggestionText);
            this.editable.appendChild(textNode);
        } else {
            const range = selection.getRangeAt(0);
            try {
                const existingSuggestion = this.shadowRoot.querySelector('.suggestion-text');
                if (existingSuggestion) {
                    existingSuggestion.remove();
                }

                const textNode = document.createTextNode(this.suggestionText);
                range.insertNode(textNode);

                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (error) {
                console.error('Error inserting suggestion:', error);
                document.execCommand('insertText', false, this.suggestionText);
            }
        }

        this.shadowRoot.querySelector('.suggestion-container').style.display = 'none';
        this.discardSuggestion();
        this.suggestionText = '';
        this.updatePlaceholder();
        this.sendUpdates();

        this.isEditableFocused = tempFocused;
    }

    handleMarkdown(event) {
        if (this.editable.innerText == '``' && event.key == '`') {
            console.log('Changing to code element');
            wisk.editor.changeBlockType(this.id, { textContent: '' }, 'code-element');
            return;
        }

        if (event.key != ' ') return;

        var newType = 'uwu';
        switch (this.editable.innerText.trim()) {
            case '#':
                newType = 'heading1-element';
                break;
            case '##':
                newType = 'heading2-element';
                break;
            case '###':
                newType = 'heading3-element';
                break;
            case '####':
                newType = 'heading4-element';
                break;
            case '#####':
                newType = 'heading5-element';
                break;
            case '-':
                newType = 'list-element';
                break;
            case '+':
                newType = 'list-element';
                break;
            case '*':
                newType = 'list-element';
                break;
            case '1.':
                newType = 'numbered-list-element';
                break;
            case '1)':
                newType = 'numbered-list-element';
                break;
            case '>':
                newType = 'quote-element';
                break;
            case '```':
                newType = 'code-element';
                break;
            case '---':
                newType = 'divider-element';
                break;
            case '***':
                newType = 'divider-element';
                break;
            case '___':
                newType = 'divider-element';
                break;
            case '- [ ]':
                newType = 'checkbox-element';
                break;
            case '- [x]':
                newType = 'checkbox-element';
                break;
        }

        if (newType != 'uwu') {
            var val = { textContent: '' };
            if (this.editable.innerText.trim() === '- [x]') {
                val.checked = true;
            }

            wisk.editor.changeBlockType(this.id, val, newType);

            const elementToFocus = document.getElementById(this.id);
            if (elementToFocus) {
                elementToFocus.focus();
            }
        }
    }

    getValue() {
        if (!this.editable) {
            return { textContent: '' };
        }
        return {
            textContent: this.editable.innerHTML,
        };
    }

    setValue(path, value) {
        if (!this.editable) {
            return;
        }

        if (path == 'value.append') {
            this.editable.innerHTML += value.textContent;
        } else {
            this.editable.innerHTML = value.textContent;
        }

        this.updatePlaceholder();
    }

    getTextContent() {
        return {
            html: this.editable.innerHTML,
            text: this.editable.innerText,
            markdown: '# ' + wisk.editor.htmlToMarkdown(this.editable.innerHTML),
        };
    }

    setTextContent(content) {
        const newText = content.text;
        const editable = this.editable;
        const currentText = editable.innerText;
        let cutIndex = currentText.length;

        const cutText = () => {
            if (cutIndex > 0) {
                editable.innerHTML = currentText.slice(0, cutIndex - 1);
                this.updatePlaceholder();
                cutIndex--;
                setTimeout(cutText, 10);
            } else {
                typeText();
            }
        };

        let typeIndex = 0;

        const typeText = () => {
            if (typeIndex < newText.length) {
                editable.innerHTML += newText[typeIndex];
                typeIndex++;
                setTimeout(typeText, 10);
            } else {
                this.updatePlaceholder();
                this.sendUpdates();
            }
        };

        cutText();
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
                position: relative;
                line-height: 1.5;
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
            .suggestion {
                opacity: 0.6;
                font-style: italic;
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
                justify-content: flex-end;
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
            <div id="editable" contenteditable="${!wisk.editor.readonly}" spellcheck="false" data-placeholder="${this.placeholder}"></div>
            <div class="suggestion-container">
                <div class="suggestion-actions">
                    <button class="suggestion-button discard-button">Discard</button>
                    <button class="suggestion-button accept-button"> Accept [Tab or Enter] </button>
                </div>
            </div>
            <div class="emoji-suggestions"></div>
        `;
        this.shadowRoot.innerHTML = style + content;
    }

    handleBeforeInput(event) {
        if (event.inputType === 'insertText' && event.data === '/' && this.editable.innerText.trim() === '') {
            event.preventDefault();
            wisk.editor.showSelector(this.id);
        }
    }

    checkIfVirtualKeyboard() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    navigateEmojiSuggestions(direction) {
        if (direction === 'up') {
            this.selectedEmojiIndex = Math.max(0, this.selectedEmojiIndex - 1);
        } else {
            this.selectedEmojiIndex = Math.min(this.emojiSuggestions.length - 1, this.selectedEmojiIndex + 1);
        }
        this.renderEmojiSuggestions();
    }

    insertSelectedEmoji() {
        if (!this.showingEmojiSuggestions || !this.emojiSuggestions.length) return;

        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedEmoji = this.emojiSuggestions[this.selectedEmojiIndex];

        try {
            const findColonPosition = (node, targetOffset) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    const colonIndex = text.lastIndexOf(':', targetOffset);
                    if (colonIndex !== -1) {
                        return { node, offset: colonIndex };
                    }
                }

                if (!node.childNodes) return null;

                for (let i = node.childNodes.length - 1; i >= 0; i--) {
                    const child = node.childNodes[i];
                    const result = findColonPosition(child, child.textContent.length);
                    if (result) return result;
                }

                return null;
            };

            const colonPos = findColonPosition(this.editable, range.startOffset);
            if (!colonPos) return;

            const replaceRange = document.createRange();
            replaceRange.setStart(colonPos.node, colonPos.offset);
            replaceRange.setEnd(range.endContainer, range.endOffset);

            replaceRange.deleteContents();
            const emojiNode = document.createTextNode(selectedEmoji.emoji);
            replaceRange.insertNode(emojiNode);

            const newRange = document.createRange();
            newRange.setStartAfter(emojiNode);
            newRange.setEndAfter(emojiNode);
            selection.removeAllRanges();
            selection.addRange(newRange);

            this.hideEmojiSuggestions();
            this.sendUpdates();
        } catch (error) {
            console.error('Error inserting emoji:', error);
            document.execCommand('insertText', false, selectedEmoji.emoji);
            this.hideEmojiSuggestions();
            this.sendUpdates();
        }
    }

    handleKeyDown(event) {
        if (this.showingEmojiSuggestions) {
            this.discardSuggestion();
            switch (event.key) {
                case 'Enter':
                    event.preventDefault();
                    this.insertSelectedEmoji();
                    return;
                case 'ArrowUp':
                    event.preventDefault();
                    this.navigateEmojiSuggestions('up');
                    return;
                case 'ArrowDown':
                    event.preventDefault();
                    this.navigateEmojiSuggestions('down');
                    return;
                case 'Escape':
                    this.hideEmojiSuggestions();
                    return;
            }
        }

        const keyHandlers = {
            Enter: () => this.handleEnterKey(event),
            Backspace: () => this.handleBackspace(event),
            Tab: () => this.handleTab(event),
            ArrowLeft: () => this.handleArrowKey(event, 'next-up', 0),
            ArrowRight: () => this.handleArrowKey(event, 'next-down', this.editable.innerText.length),
            ArrowUp: () => this.handleVerticalArrow(event, 'next-up'),
            ArrowDown: () => this.handleVerticalArrow(event, 'next-down'),
        };

        if ((event.key === 'Enter' || event.key === 'Tab') && this.suggestionActive) {
            // my mind isn't working right now
        } else {
            this.discardSuggestion();
        }

        const handler = keyHandlers[event.key];
        if (handler) {
            handler();
        }
    }

    updateToolbarPosition() {
        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) {
            this.toolbar.hideToolbar();
            return;
        }

        const selectedText = selection.toString();
        if (selectedText.trim() === '') {
            this.toolbar.hideToolbar();
            return;
        }

        this.saveSelection();

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top - 45;

        this.toolbar.showToolbar(Math.max(20, x), y, this.id, selectedText, this.editable.innerText);

        setTimeout(() => {
            const newSelection = this.shadowRoot.getSelection();
            if (newSelection.toString().trim() === '') {
                this.toolbar.hideToolbar();
                this.clearSelection();
            }
        }, 0);
    }

    handleToolbarAction(detail) {
        if (!this.restoreSelection()) {
            console.warn('No saved selection for toolbar action');
            return;
        }

        const { action, formatValue } = detail;

        try {
            // Add debug logging
            console.log(`Applying format: ${action} with value: ${formatValue}`);

            switch (action) {
                case 'bold':
                case 'italic':
                case 'underline':
                case 'strikeThrough':
                case 'subscript':
                case 'superscript':
                    document.execCommand(action, false, null);
                    break;
                case 'foreColor':
                    document.execCommand('styleWithCSS', false, true);
                    document.execCommand('foreColor', false, formatValue);
                    document.execCommand('styleWithCSS', false, false);
                    break;
                case 'backColor':
                    const selection = this.shadowRoot.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const span = document.createElement('span');
                        span.style.backgroundColor = formatValue;

                        const content = range.extractContents();
                        span.appendChild(content);
                        range.insertNode(span);

                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                    break;
                case 'make-longer':
                case 'make-shorter':
                case 'fix-spelling-grammar':
                case 'improve-writing':
                case 'summarize':
                    break;
            }
        } catch (error) {
            console.error('Error applying format:', error, error.stack);
            this.handleFormatFallback(action, formatValue);
        }

        this.clearSelection();
        this.sendUpdates();
    }

    handleFormatFallback(action, formatValue) {
        try {
            const selection = this.shadowRoot.getSelection();
            const range = selection.getRangeAt(0);

            if (action === 'backColor') {
                const span = document.createElement('span');
                span.style.backgroundColor = formatValue;

                const fragment = range.extractContents();
                span.appendChild(fragment);
                range.insertNode(span);

                const emptySpans = span.querySelectorAll('span:empty');
                emptySpans.forEach(emptySpan => emptySpan.remove());

                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                const span = document.createElement('span');
                switch (action) {
                    case 'foreColor':
                        span.style.color = formatValue;
                        break;
                    case 'subscript':
                        span.style.verticalAlign = 'sub';
                        span.style.fontSize = '0.8em';
                        break;
                    case 'superscript':
                        span.style.verticalAlign = 'super';
                        span.style.fontSize = '0.8em';
                        break;
                }
                range.surroundContents(span);
            }
        } catch (fallbackError) {
            console.error('Format fallback failed:', fallbackError);
            try {
                const selection = this.shadowRoot.getSelection();
                if (selection.toString()) {
                    const text = selection.toString();
                    const span = document.createElement('span');
                    if (action === 'backColor') {
                        span.style.backgroundColor = formatValue;
                    }
                    span.textContent = text;
                    range.deleteContents();
                    range.insertNode(span);
                }
            } catch (e) {
                console.error('Ultimate fallback failed:', e);
            }
        }
    }

    handleEnterKey(event) {
        event.preventDefault();
        console.log('Enter key pressed, suggestion active:', this.suggestionActive);
        if (this.suggestionActive) {
            this.acceptSuggestion();
            return;
        }
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

        wisk.editor.createNewBlock(this.id, this.defaultNextElement, { textContent: afterContainer.innerHTML }, { x: 0 });
    }

    handleBackspace(event) {
        if (this.getFocus() === 0) {
            event.preventDefault();
            const prevElement = wisk.editor.prevElement(this.id);
            const prevDomElement = document.getElementById(prevElement.id);
            if (!prevElement) return;

            const prevComponentDetail = wisk.plugins.getPluginDetail(prevElement.component);
            if (prevComponentDetail.textual) {
                const len = prevDomElement.getTextContent().text.length;
                wisk.editor.updateBlock(prevElement.id, 'value.append', { textContent: this.editable.innerHTML });
                wisk.editor.focusBlock(prevElement.id, { x: len });
            }
            wisk.editor.deleteBlock(this.id);
        }
    }

    handleTab(event) {
        event.preventDefault();
        if (this.suggestionActive) {
            this.acceptSuggestion();
            return;
        }
        document.execCommand('insertText', false, '    ');
        wisk.editor.justUpdates(this.id);
    }

    handleArrowKey(event, direction, targetOffset) {
        const pos = this.getFocus();
        if (pos === targetOffset) {
            event.preventDefault();
            const adjacentElement = direction === 'next-up' ? wisk.editor.prevElement(this.id) : wisk.editor.nextElement(this.id);

            if (adjacentElement) {
                const componentDetail = wisk.plugins.getPluginDetail(adjacentElement.component);
                if (componentDetail.textual) {
                    const focusPos = direction === 'next-up' ? adjacentElement.value.textContent.length : 0;
                    wisk.editor.focusBlock(adjacentElement.id, { x: focusPos });
                }
            }
        }
    }

    focus(identifier) {
        if (!identifier) {
            this.editable.focus();
            return;
        }
        console.log('Focus called with identifier', identifier, this.id);
        if (typeof identifier.x != 'number') {
            identifier.x = 0;
        }

        this.editable.focus();

        if (identifier.x === 0) {
            const selection = this.shadowRoot.getSelection();
            const range = document.createRange();

            let firstNode = this.editable;
            let offset = 0;

            const findFirstTextNode = node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    return node;
                }
                for (const child of node.childNodes) {
                    const result = findFirstTextNode(child);
                    if (result) return result;
                }
                return null;
            };

            const firstTextNode = findFirstTextNode(this.editable);
            if (firstTextNode) {
                firstNode = firstTextNode;
                offset = 0;
            }

            try {
                range.setStart(firstNode, offset);
                range.setEnd(firstNode, offset);
                selection.removeAllRanges();
                selection.addRange(range);
                return;
            } catch (e) {
                console.warn('Failed to set cursor at beginning:', e);
            }
        }

        if (!this.editable.childNodes.length) {
            return;
        }

        const selection = this.shadowRoot.getSelection();
        const range = document.createRange();

        let currentOffset = 0;
        let targetNode = null;
        let nodeOffset = 0;
        let skipToNext = false;

        const findPosition = node => {
            if (currentOffset >= identifier.x) {
                return true;
            }

            if (node.nodeType === Node.TEXT_NODE) {
                if (currentOffset + node.length >= identifier.x) {
                    targetNode = node;
                    nodeOffset = identifier.x - currentOffset;
                    return true;
                }
                currentOffset += node.length;
            } else if (node.nodeType === Node.ELEMENT_NODE && node.contentEditable === 'false') {
                const length = node.textContent.length;
                if (currentOffset <= identifier.x && currentOffset + length >= identifier.x) {
                    targetNode = node.parentNode;
                    nodeOffset = Array.from(node.parentNode.childNodes).indexOf(node) + 1;
                    skipToNext = true;
                    return true;
                }
                currentOffset += length;
            } else if (node.childNodes) {
                for (const child of node.childNodes) {
                    if (findPosition(child)) {
                        return true;
                    }
                }
            }
            return false;
        };

        findPosition(this.editable);

        if (!targetNode) {
            const lastChild = this.editable.lastChild;
            if (lastChild) {
                if (lastChild.nodeType === Node.TEXT_NODE) {
                    targetNode = lastChild;
                    nodeOffset = lastChild.length;
                } else {
                    targetNode = this.editable;
                    nodeOffset = this.editable.childNodes.length;
                }
            } else {
                targetNode = this.editable;
                nodeOffset = 0;
            }
        }

        try {
            range.setStart(targetNode, nodeOffset);
            range.setEnd(targetNode, nodeOffset);
            selection.removeAllRanges();
            selection.addRange(range);

            if (skipToNext) {
                this.editable.scrollIntoView({ block: 'nearest' });
            }
        } catch (e) {
            console.warn('Failed to set cursor position:', e);
            range.selectNodeContents(this.editable);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    handleVerticalArrow(event, direction) {
        console.log('Vertical arrow key pressed', direction);
        const pos = this.getFocus();
        setTimeout(() => {
            const newPos = this.getFocus();
            if ((direction === 'next-up' && newPos === 0) || (direction === 'next-down' && newPos === this.editable.innerText.length)) {
                console.log('Moving to adjacent element');
                const adjacentElement = direction === 'next-up' ? wisk.editor.prevElement(this.id) : wisk.editor.nextElement(this.id);

                if (adjacentElement) {
                    const componentDetail = wisk.plugins.getPluginDetail(adjacentElement.component);
                    if (componentDetail.textual) {
                        wisk.editor.focusBlock(adjacentElement.id, { x: pos });
                    }
                }
            }
        }, 0);
    }

    onValueUpdated(event) {
        const selection = this.shadowRoot.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const text = this.editable.textContent;
            const cursorPosition = this.getFocus();

            const beforeCursor = text.substring(0, cursorPosition);
            const colonIndex = beforeCursor.lastIndexOf(':');

            if (colonIndex !== -1) {
                const query = beforeCursor.substring(colonIndex + 1);

                if (!query.includes(' ') && query.length > 0) {
                    this.currentEmojiQuery = query;
                    this.showEmojiSuggestions(query, range);
                    return;
                }
            }
        }

        this.hideEmojiSuggestions();

        this.updatePlaceholder();
        this.sendUpdates();
    }

    updatePlaceholder() {
        if (this.editable) {
            const isEmpty = this.editable.innerText.trim() === '';
            this.editable.classList.toggle('empty', isEmpty);
            this.editable.dataset.placeholder = this.getAttribute('placeholder') || this.placeholder;
        }
    }

    sendUpdates() {
        console.log('Sending updates', this.id);
        setTimeout(() => {
            wisk.editor.justUpdates(this.id);
        }, 0);
    }

    static get observedAttributes() {
        return ['placeholder'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'placeholder' && oldValue !== newValue) {
            this.placeholder = newValue;
            if (this.editable) {
                this.editable.dataset.placeholder = newValue;
            }
        }
    }

    getFocus() {
        const sel = this.shadowRoot.getSelection();
        if (!sel.rangeCount) return 0;
        const range = sel.getRangeAt(0).cloneRange();
        range.setStart(this.editable, 0);
        return range.toString().length;
    }

    showEmojiSuggestions(query, range) {
        const emojiSelector = document.querySelector('emoji-selector');
        if (!emojiSelector) return;

        this.emojiSuggestions = emojiSelector.searchDiscordEmojis(query);

        if (this.emojiSuggestions.length > 0) {
            const editableRect = this.editable.getBoundingClientRect();
            const rangeRect = range.getBoundingClientRect();

            this.emojiSuggestionsContainer.style.display = 'block';

            this.emojiSuggestionsContainer.style.left = `0px`;
            this.emojiSuggestionsContainer.style.bottom = `100%`;
            this.emojiSuggestionsContainer.style.width = `100%`;

            this.renderEmojiSuggestions();
            this.showingEmojiSuggestions = true;
            this.selectedEmojiIndex = 0;
        } else {
            this.hideEmojiSuggestions();
        }
    }

    hideEmojiSuggestions() {
        this.emojiSuggestionsContainer.style.display = 'none';
        this.showingEmojiSuggestions = false;
        this.emojiSuggestions = [];
        this.currentEmojiQuery = '';
    }

    renderEmojiSuggestions() {
        this.emojiSuggestionsContainer.innerHTML = this.emojiSuggestions
            .map(
                (emoji, index) => `
            <div class="emoji-suggestion ${index === this.selectedEmojiIndex ? 'selected' : ''}"
                 data-index="${index}">
                <span class="emoji">${emoji.emoji}</span>
                <span class="emoji-name">${emoji.name}</span>
            </div>
        `
            )
            .join('');

        // Add click handlers
        this.emojiSuggestionsContainer.querySelectorAll('.emoji-suggestion').forEach(suggestion => {
            suggestion.addEventListener('mousedown', e => {
                e.preventDefault(); // Prevent blur
                this.selectedEmojiIndex = parseInt(suggestion.dataset.index);
                this.insertSelectedEmoji();
            });
        });
    }

    navigateEmojiSuggestions(direction) {
        if (direction === 'up') {
            this.selectedEmojiIndex = Math.max(0, this.selectedEmojiIndex - 1);
        } else {
            this.selectedEmojiIndex = Math.min(this.emojiSuggestions.length - 1, this.selectedEmojiIndex + 1);
        }
        this.renderEmojiSuggestions();
        // scroll to selected emoji
        const selectedEmoji = this.emojiSuggestionsContainer.querySelector('.emoji-suggestion.selected');
        if (selectedEmoji) {
            selectedEmoji.scrollIntoView({ block: 'nearest' });
        }
    }

    insertSelectedEmoji() {
        if (!this.showingEmojiSuggestions || !this.emojiSuggestions.length) return;

        const selection = this.shadowRoot.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const selectedEmoji = this.emojiSuggestions[this.selectedEmojiIndex];

        try {
            const findColonPosition = (node, targetOffset) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    const colonIndex = text.lastIndexOf(':', targetOffset);
                    if (colonIndex !== -1) {
                        return { node, offset: colonIndex };
                    }
                }

                if (!node.childNodes) return null;

                for (let i = node.childNodes.length - 1; i >= 0; i--) {
                    const child = node.childNodes[i];
                    const result = findColonPosition(child, child.textContent.length);
                    if (result) return result;
                }

                return null;
            };

            const colonPos = findColonPosition(this.editable, range.startOffset);
            if (!colonPos) return;

            const replaceRange = document.createRange();
            replaceRange.setStart(colonPos.node, colonPos.offset);
            replaceRange.setEnd(range.endContainer, range.endOffset);

            replaceRange.deleteContents();
            const emojiNode = document.createTextNode(selectedEmoji.emoji);
            replaceRange.insertNode(emojiNode);

            const newRange = document.createRange();
            newRange.setStartAfter(emojiNode);
            newRange.setEndAfter(emojiNode);
            selection.removeAllRanges();
            selection.addRange(newRange);

            this.hideEmojiSuggestions();
            this.sendUpdates();
        } catch (error) {
            console.error('Error inserting emoji:', error);
            document.execCommand('insertText', false, selectedEmoji.emoji);
            this.hideEmojiSuggestions();
            this.sendUpdates();
        }
    }

    handlePaste(event) {
        const clipboardData = event.clipboardData || window.clipboardData;
        const htmlData = clipboardData.getData('text/html');
        console.log('Pasting:', clipboardData, htmlData);

        if (htmlData) {
            event.preventDefault();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlData, 'text/html');
            const structuredElements = [];

            const processListItems = items => {
                return Array.from(items).map(li => ({
                    text: li.textContent.trim(),
                    indent: getIndentLevel(li),
                }));
            };

            const getIndentLevel = element => {
                let indent = 0;
                let parent = element.parentElement;
                while (parent) {
                    if (parent.tagName === 'UL' || parent.tagName === 'OL') {
                        indent++;
                    }
                    parent = parent.parentElement;
                }
                return Math.max(0, indent - 1);
            };

            const isPartOfProcessedList = node => {
                let parent = node.parentElement;
                while (parent) {
                    if (parent._processed) {
                        return true;
                    }
                    parent = parent.parentElement;
                }
                return false;
            };

            const processNode = node => {
                console.log('Processing node:', node);

                if (node.nodeType !== Node.ELEMENT_NODE) return;

                let element = null;

                switch (node.tagName.toLowerCase()) {
                    case 'h1':
                        element = { elementName: 'heading1-element', value: node.textContent.trim() };
                        break;
                    case 'h2':
                        element = { elementName: 'heading2-element', value: node.textContent.trim() };
                        break;
                    case 'h3':
                        element = { elementName: 'heading3-element', value: node.textContent.trim() };
                        break;
                    case 'h4':
                        element = { elementName: 'heading4-element', value: node.textContent.trim() };
                        break;
                    case 'h5':
                        element = { elementName: 'heading5-element', value: node.textContent.trim() };
                        break;
                    case 'ul':
                    case 'ol':
                        node._processed = true; // Mark as processed
                        const isCheckboxList = Array.from(node.querySelectorAll('li')).some(
                            li => li.textContent.startsWith('[ ]') || li.textContent.startsWith('[x]') || li.querySelector('input[type="checkbox"]')
                        );

                        if (isCheckboxList && node.tagName.toLowerCase() === 'ul') {
                            element = {
                                elementName: 'checkbox-element',
                                value: Array.from(node.querySelectorAll('li')).map(li => {
                                    const isChecked = li.textContent.startsWith('[x]') || li.querySelector('input[type="checkbox"]')?.checked;
                                    return {
                                        text: li.textContent.replace(/^\[[\sx]\]\s*/, '').trim(),
                                        checked: isChecked,
                                        indent: getIndentLevel(li),
                                    };
                                }),
                            };
                        } else {
                            element = {
                                elementName: node.tagName.toLowerCase() === 'ul' ? 'list-element' : 'numbered-list-element',
                                value: processListItems(node.querySelectorAll('li')),
                            };
                        }
                        break;
                    case 'li':
                        if (!isPartOfProcessedList(node)) {
                            const isCheckbox =
                                node.textContent.startsWith('[ ]') ||
                                node.textContent.startsWith('[x]') ||
                                node.querySelector('input[type="checkbox"]');

                            if (isCheckbox) {
                                element = {
                                    elementName: 'checkbox-element',
                                    value: [
                                        {
                                            text: node.textContent.replace(/^\[[\sx]\]\s*/, '').trim(),
                                            checked: node.textContent.startsWith('[x]') || node.querySelector('input[type="checkbox"]')?.checked,
                                            indent: getIndentLevel(node),
                                        },
                                    ],
                                };
                            } else {
                                element = {
                                    elementName: 'list-element',
                                    value: [
                                        {
                                            text: node.textContent.trim(),
                                            indent: getIndentLevel(node),
                                        },
                                    ],
                                };
                            }
                        }
                        break;
                    case 'blockquote':
                        element = { elementName: 'quote-element', value: node.textContent.trim() };
                        break;
                    case 'pre':
                    case 'code':
                        element = { elementName: 'code-element', value: node.textContent.trim() };
                        break;
                    case 'hr':
                        element = { elementName: 'divider-element', value: '' };
                        break;
                    case 'img':
                        if (node.src) {
                            element = {
                                elementName: 'image-element',
                                value: node.src.startsWith('data:') ? node.src : node.src,
                            };
                        }
                        break;
                    case 'p':
                        if (node.textContent.trim()) {
                            element = { elementName: 'text-element', value: node.textContent.trim() };
                        }
                        break;
                }

                if (element) {
                    structuredElements.push(element);
                }

                node.childNodes.forEach(childNode => {
                    processNode(childNode);
                });
            };

            processNode(doc.body);

            const flattenedElements = [];

            structuredElements.forEach(element => {
                if (Array.isArray(element.value)) {
                    element.value.forEach(item => {
                        if (typeof item === 'object') {
                            const newElement = {
                                elementName: element.elementName,
                                value: {
                                    textContent: item.text || '',
                                    indent: typeof item.indent === 'number' ? item.indent : 0,
                                },
                            };

                            if (element.elementName === 'checkbox-element') {
                                newElement.value.checked = !!item.checked;
                            }

                            flattenedElements.push(newElement);
                        } else {
                            flattenedElements.push({
                                elementName: element.elementName,
                                value: {
                                    textContent: item,
                                },
                            });
                        }
                    });
                } else if (element.elementName === 'image-element') {
                    // Handle images
                    flattenedElements.push({
                        elementName: element.elementName,
                        value: {
                            imageUrl: element.value,
                            textContent: '',
                        },
                    });
                } else {
                    flattenedElements.push({
                        elementName: element.elementName,
                        value: {
                            textContent: element.value,
                        },
                    });
                }
            });

            console.log('Flattened elements:', JSON.parse(JSON.stringify(flattenedElements)));
            if (flattenedElements.length === 0) {
                const text = clipboardData.getData('text') || clipboardData.getData('text/plain');
                if (text) {
                    event.preventDefault();
                    const cleanedText = text.replace(/[\r\n]+/g, ' ').trim();
                    document.execCommand('insertText', false, cleanedText);
                }
                return;
            }

            var inx = 0;
            if (flattenedElements[0].value.textContent != '') {
                wisk.editor.updateBlock(this.id, 'value.append', flattenedElements[0].value);
                inx = 1;
            }

            var lastId = this.id;
            for (var i = inx; i < flattenedElements.length; i++) {
                lastId = wisk.editor.createBlockNoFocus(lastId, flattenedElements[i].elementName, flattenedElements[i].value);
            }

            return flattenedElements;
        } else {
            const text = clipboardData.getData('text') || clipboardData.getData('text/plain');
            if (text) {
                event.preventDefault();
                const cleanedText = text.replace(/[\r\n]+/g, ' ').trim();
                document.execCommand('insertText', false, cleanedText);
            }
        }
        return [];
    }
}

customElements.define('base-text-element', BaseTextElement);
