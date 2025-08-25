import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class ToolbarElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
            transition: none;
            outline: none;
        }

        :host {
            --dialog-margin-top--dont-mess-with-this: 40px;
        }

        .toolbar {
            position: fixed;
            background: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: calc(var(--radius-large) * 10);
            filter: var(--drop-shadow);
            padding: var(--padding-2);
            gap: var(--gap-2);
            z-index: 99;
            display: none;
            width: max-content;
            transform: translateZ(0); /* Prevents jittering */
            transition: all 0.2s ease;
        }

        @media (max-width: 1150px) {
            .toolbar {
                position: fixed;
                background: var(--bg-3);
                border: none;
                border-radius: var(--radius-large);
                padding: var(--padding-4);
                gap: var(--gap-2);
                filter: none;
                z-index: 99;
                display: none;
                transform: translateZ(0);
                width: calc(100% - 2 * var(--padding-4));
                bottom: var(--padding-4);
                flex-direction: column;
                height: 90%;
                height: 500px;
            }
        }

        @media (max-width: 500px) {
            .toolbar {
                position: fixed;
                width: 60vw;
                height: 400px;
            }
        }

        .toolbar.visible {
            display: flex;
        }

        .toolbar button {
            background: var(--bg-1);
            border: none;
            width: 28px;
            height: 26px;
            border-radius: calc(var(--radius-large) * 10);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--fg-1);
            transition: background 0.2s ease-in-out;
            gap: var(--gap-1);
            opacity: 1;
            user-select: none;
        }

        @media (max-width: 1150px) {
            .toolbar button {
                min-height: 30px;
                border-radius: var(--radius);
                flex: 1;
            }
        }

        .toolbar button[data-wide] {
            padding: 2px 6px;
            width: auto;
        }

        .toolbar button:hover {
            background: var(--bg-3);
            opacity: 1;
        }

        .separator {
            background: var(--border-1);
            height: auto;
            width: 1px;
            opacity: 0.5;
        }

        img {
            filter: var(--themed-svg);
            height: 19px;
        }

        .dialog-container {
            top: 100%;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg-1);
            border-radius: var(--radius);
            display: flex;
        }

        @media (max-width: 1150px) {
            .dialog-container {
                flex: 1;
                overflow: auto;
                background: var(--bg-3);
            }
        }

        @media (min-width: 1150px) {
            .dialog-container {
                position: absolute;
                top: 100%;
                left: 0;
                margin-top: var(--dialog-margin-top--dont-mess-with-this, 40px);
                width: 100%;
                max-height: 500px;
                background: var(--bg-1);
                border: 1px solid var(--border-1);
                border-radius: var(--radius);
                filter: var(--drop-shadow);
                padding: var(--padding-3);
                display: flex;
                height: auto;
            }
        }

        .dialog {
            z-index: 1001;
            width: 100%;
            min-width: 200px;
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .dialog-buttons {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            margin-top: 8px;
        }

        .dialog button {
            padding: 8px 16px;
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            cursor: pointer;
            color: var(--fg-1);
            width: auto;
            height: auto;
        }

        .dialog button.cancel {
            background: var(--bg-1);
            border: none;
        }

        .ai-commands {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .ai-commands button {
            width: 100%;
            text-align: left;
            padding: 8px;
            background: var(--bg-1);
            justify-content: flex-start;
        }

        .source-item {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            border-bottom: 1px solid var(--border-1);
            padding: var(--padding-3) 0;
        }

        .source-item:last-child {
            border-bottom: none;
            margin-bottom: 8px;
        }

        .source-item h3 {
            font-size: 14px;
            margin-bottom: 4px;
        }

        .source-item p {
            font-size: 12px;
            color: var(--fg-2);
            word-wrap: break-word;
            width: 100%;
        }

        .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: calc(var(--radius-large) * 10);
        }

        @media (max-width: 1150px) {
            .loading-overlay {
                border-radius: var(--radius-large);
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
            }
        }

        .loading-indicator {
            width: 24px;
            height: 24px;
            border: 2px solid var(--bg-3);
            border-top: 2px solid var(--fg-1);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }

        .backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 99;
        }

        .source-item * {
            margin: 0;
            padding: 0;
            word-wrap: break-word;
        }

        .url {
            color: var(--fg-2);
            font-size: 12px;
        }

        @media (hover: hover) {
            *::-webkit-scrollbar {
                width: 15px;
            }
            *::-webkit-scrollbar-track {
                background: var(--bg-1);
            }
            *::-webkit-scrollbar-thumb {
                background-color: var(--bg-3);
                border-radius: 20px;
                border: 4px solid var(--bg-1);
            }
            *::-webkit-scrollbar-thumb:hover {
                background-color: var(--fg-1);
            }
        }

        .command-section {
            display: flex;
            flex-direction: column;
        }

        .command-section h3 {
            font-size: 11px;
            color: var(--fg-2);
            margin-bottom: 4px;
            font-weight: 500;
        }

        .ai-input {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background: var(--bg-1);
            color: var(--fg-1);
            margin-bottom: 16px;
            flex: 1;
            width: auto;
            margin-bottom: 0;
            border: none;
            background-color: transparent;
        }

        .ai-commands button {
            display: flex;
            align-items: center;
            width: 100%;
            text-align: left;
            padding: var(--padding-2);
            background: var(--bg-1);
            border: none;
            border-radius: 4px;
            color: var(--fg-1);
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s ease;
        }

        .ai-commands button:hover {
            background: var(--bg-2);
        }

        .submenu-container {
            position:relative;
        }

        .submenu-container:hover .submenu {
            display: block;
        }

        .submenu {
            display: none;
            position: absolute;
            left: 100%;
            top: 0;
            background: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            box-shadow: var(--drop-shadow);
            min-width: 150px;
            z-index: 1002;
            overflow: hidden;
        }

        .font-size-menu {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: 100%;
            margin-top: 8px;
            max-height: 300px;
            overflow-y: auto;
        }

        .submenu-container.font-size-container {
            position: relative;
        }

        .submenu-container.font-size-container:hover .font-size-menu,
        .submenu-container.font-size-container.keep-open .font-size-menu {
            display: block;
        }

        @media (min-width: 1150px) {
            .submenu {
                position: absolute;
            }
        }

        .submenu button {
            padding: var(--padding-2) var(--padding-3);
            width: 100%;
            text-align: left;
            border: none;
            background: transparent;
            color: var(--fg-1);
            cursor: pointer;
        }

        .submenu button:hover {
            background: var(--bg-2);
        }

        .submenu-trigger {
            position: relative;
        }

        .translate-menu {
            left: 90%;
            top: 20%;
        }

        .paraphrase-menu {
            left: 90%;
            top: 30%;
        }

        .tone-menu {
            left: 90%;
            top: 70%;
        }

        input {
            outline: none;
        }

        .preview-container {
            max-height: 300px;
            overflow-y: auto;
        }

        .preview-content {
            padding: var(--padding-3);
            border-radius: var(--radius);
            margin-bottom: var(--padding-3);
            white-space: pre-wrap;
            user-select: text;
        }

        .preview-buttons {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }

        .preview-buttons button {
            padding: 8px 16px;
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            cursor: pointer;
            color: var(--bg-1);
        }

        .preview-buttons button.accept {
            background: var(--fg-accent);
            border: none;
        }

        .preview-buttons button.accept:hover {
            background: var(--fg-2);
        }

        .preview-buttons button.discard {
            background: transparent;
            color: var(--fg-1);
            border: none;
        }

        .od {
            color: var(--fg-1);
            background-color: var(--bg-2);
            border-radius: var(--radius);
            outline: none;
            border: 2px solid var(--bg-3);
            transition: all 0.2s ease;
            margin: 2px;
            display: flex;
            gap: var(--gap-1);
            align-items: center;
            flex-wrap: wrap;
            padding: var(--padding-1) var(--padding-3);
            margin-bottom: 16px;
        }

        .od:has(input:focus) {
            border-color: var(--fg-accent);
            background-color: var(--bg-1);
        }

        .save {
            background: var(--bg-2);
            border: 1px solid var(--border-1);
            color: var(--fg-1);
        }

        .save:hover {
            background: var(--bg-3);
        }

        .dialog-buttons button.save {
            background: var(--bg-2);
            border: 1px solid var(--border-1);
        }

        .color-menu {
            display: none;
            position: absolute;
            left: 100%;
            transform: translateX(-50%);
            top: 100%;
            background: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            box-shadow: var(--drop-shadow);
            padding: var(--padding-4);
            z-index: 1002;
            margin-top: calc(var(--padding-2) * -1);
        }

        .submenu-container:hover .color-menu {
            display: block;
        }

        .color-section {
            margin-bottom: var(--padding-4);
        }

        .color-section:last-child {
            margin-bottom: 0;
        }

        .color-section h3 {
            font-size: 11px;
            text-transform: uppercase;
            color: var(--fg-2);
            margin-bottom: 4px;
            font-weight: 500;
        }

        .color-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: var(--gap-2);
        }

        .color-option {
            width: 30px;
            height: 30px;
            border-radius: var(--radius);
            cursor: pointer;
            transition: transform 0.2s;
            position: relative;
        }

        .color-option:hover {
            transform: scale(1.1);
        }

        .font-size-menu {
            left: 50%;
            transform: translateX(-50%);
            top: 100%;
            margin-top: 8px;
            max-height: 300px;
            overflow-y: auto;
        }

        .submenu-container:hover .color-submenu {
            display: block;
        }

        .selected-text-mob {
            border: 1px solid var(--border-1);
            padding: var(--padding-4);
            border-radius: var(--radius-large);
            background: var(--bg-2);
            text-align: center;
        }

        @media (max-width: 1150px) {
            @starting-style {
                .toolbar {
                    bottom: -100%;
                }
            }
            .color-menu {
                left: 0;
                width: 100%;
                transform: none;
                top: unset;
            }
            .color-option {
                width: 100%;
                height: 20px;
            }
            .color-grid {
                grid-template-columns: repeat(8, 1fr);
                gap: var(--gap-1);
            }
        }

        @media (max-width: 1150px) {
            .ai-commands button,
            .submenu {
                background: var(--bg-3);
            }
        }

        .mob-input {
            display: none;
        }

        @media (max-width: 1150px) {
            .submenu {
                margin: var(--padding-1);
                margin-left: 21px;
                display: block;
            }
            .mobhide {
                display: none;
            }
            .mob-input {
                display: block;
                width: 100%;
                padding: var(--padding-w2);
                border: 2px solid transparent;
                border-radius: calc(var(--radius-large) * 10);
                background: var(--bg-1);
                color: var(--fg-1);
            }
            .mob-input:focus {
                border-color: var(--fg-accent);
                background-color: var(--bg-1);
            }
        }
    `;

    static properties = {
        mode: { type: String, reflect: true },
        dialogName: { type: String, reflect: true },
        selectedText: { type: String, reflect: true },
        elementId: { type: String, reflect: true },
        elementText: { type: String, reflect: true },
        visible: { type: Boolean, reflect: true },
        linkUrl: { type: String, state: true },
        sources: { type: Array, state: true },
        loading: { type: Boolean, state: true },
        previewText: { type: String, state: true },
        citations: { type: Array, state: true },
        showCitationsDialog: { type: Boolean, state: true },
        activeTextColor: { type: String, state: true },
        activeBackgroundColor: { type: String, state: true },
        isMobile: { type: Boolean, state: true },
        currentFontSize: { type: String, state: true },
    };

    constructor() {
        super();
        this.mode = 'simple';
        this.dialogName = '';
        this.selectedText = '';
        this.elementId = '';
        this.elementText = '';
        this.visible = false;
        this.linkUrl = '';
        this.sources = [];
        this.loading = false;
        this.previewText = '';
        this.citations = [];
        this.showCitationsDialog = false;
        this.isMobile = window.innerWidth < 1150;

        this.colorOptions = {
            red: { fg: 'var(--fg-red)', bg: 'var(--bg-red)', name: 'Red' },
            green: { fg: 'var(--fg-green)', bg: 'var(--bg-green)', name: 'Green' },
            blue: { fg: 'var(--fg-blue)', bg: 'var(--bg-blue)', name: 'Blue' },
            yellow: { fg: 'var(--fg-yellow)', bg: 'var(--bg-yellow)', name: 'Yellow' },
            purple: { fg: 'var(--fg-purple)', bg: 'var(--bg-purple)', name: 'Purple' },
            cyan: { fg: 'var(--fg-cyan)', bg: 'var(--bg-cyan)', name: 'Cyan' },
            orange: { fg: 'var(--fg-orange)', bg: 'var(--bg-orange)', name: 'Orange' },
            white: { fg: 'var(--fg-1)', bg: 'var(--bg-1)', name: 'Default' },
        };

        this.activeTextColor = 'var(--fg-1)';
        this.activeBackgroundColor = 'var(--bg-1)';
        this.currentFontSize = '12';
    }

    handleFontSizeMouseEnter() {
        // Clear any existing timeout
        if (this.fontSizeTimeout) {
            clearTimeout(this.fontSizeTimeout);
            this.fontSizeTimeout = null;
        }
        
        // Add class to keep dropdown open
        const container = this.shadowRoot.querySelector('.font-size-container');
        if (container) {
            container.classList.add('keep-open');
        }
    }

    handleFontSizeMouseLeave() {
        this.fontSizeTimeout = setTimeout(() => {
            const container = this.shadowRoot.querySelector('.font-size-container');
            if (container) {
                container.classList.remove('keep-open');
            }
            this.fontSizeTimeout = null;
        }, 2000);
    }

    handleFontSizeClick(event, size) {
        event.preventDefault();
        event.stopPropagation();
        
        this.handleToolbarAction('fontSize', size);
        
        const container = this.shadowRoot.querySelector('.font-size-container');
        if (container) {
            container.classList.remove('keep-open');
        }
 
        if (this.fontSizeTimeout) {
            clearTimeout(this.fontSizeTimeout);
            this.fontSizeTimeout = null;
        }
    }

    connectedCallback() {
        super.connectedCallback();
        const editor = document.querySelector('.editor');
        if (editor) {
            this._scrollListener = this.updateToolbarPosition.bind(this);
            editor.addEventListener('scroll', this._scrollListener);
        }

        this._resizeListener = () => {
            this.isMobile = window.innerWidth < 1150;
            this.updateToolbarPosition();
        };
        window.addEventListener('resize', this._resizeListener);
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        // Clean up event listeners when component is disconnected
        const editor = document.querySelector('.editor');
        if (editor && this._scrollListener) {
            editor.removeEventListener('scroll', this._scrollListener);
        }

        if (this._resizeListener) {
            window.removeEventListener('resize', this._resizeListener);
        }
    }

    updated(changedProperties) {
        if (changedProperties.has('visible') && this.visible) {
            this.updateToolbarPosition();
        }
    }

    async fetchCitations() {
        const citationsManager = document.querySelector('manage-citations');
        if (citationsManager) {
            this.citations = citationsManager.references;
        }
    }

    handleInsertCitation(citation) {
        this.dispatchEvent(
            new CustomEvent('insert-citation', {
                detail: {
                    elementId: this.elementId,
                    citation: citation,
                    selectedText: this.selectedText,
                },
                bubbles: true,
                composed: true,
            })
        );
        this.closeDialog();
    }

    updateToolbarPosition() {
        if (!this.visible || !this.elementId) return;

        const toolbar = this.shadowRoot.querySelector('.toolbar');
        if (!toolbar) return;

        if (this.isMobile) {
            toolbar.style.left = 'var(--padding-4)';
            toolbar.style.top = 'unset';
            return;
        }

        // Helper function to search across shadow roots
        const getElementAcrossShadowRoots = (targetId, root = document) => {
            // First try to find in current root
            const directElement = root.getElementById(targetId);
            if (directElement) return directElement;

            // Search through shadow roots recursively
            const shadowElements = root.querySelectorAll('*');
            for (const el of shadowElements) {
                if (el.shadowRoot) {
                    const shadowResult = getElementAcrossShadowRoots(targetId, el.shadowRoot);
                    if (shadowResult) return shadowResult;
                }
            }
            return null;
        };

        const element = getElementAcrossShadowRoots(this.elementId);

        if (!element?.getSelectionPosition) {
            this.style.setProperty('--dialog-margin-top--dont-mess-with-this', '40px');
            return;
        }

        const position = element.getSelectionPosition();
        if (!position || !position.selectedText.trim()) {
            this.hideToolbar();
            return;
        }

        this.style.setProperty('--dialog-margin-top--dont-mess-with-this', `${(position.height > 200 ? 200 : position.height) + 20}px`);

        toolbar.style.left = `${Math.max(10, Math.min(position.x - toolbar.offsetWidth / 2, window.innerWidth - toolbar.offsetWidth - 10))}px`;
        toolbar.style.top = `${Math.max(10, position.y - 45)}px`;
    }

    async handleToolbarAction(action, operation) {
        switch (action) {
            case 'subscript':
            case 'superscript':
                this.dispatchEvent(
                    new CustomEvent('toolbar-action', {
                        detail: { action, elementId: this.elementId, selectedText: this.selectedText },
                        bubbles: true,
                        composed: true,
                    })
                );
                break;

            case 'fontSize':
                this.currentFontSize = operation;
                
                this.dispatchEvent(
                    new CustomEvent('toolbar-action', {
                        detail: {
                            action: 'fontSize',
                            operation: operation,
                            elementId: this.elementId,
                            selectedText: this.selectedText
                        },
                        bubbles: true,
                        composed: true,
                    })
                );
                
                // Close the entire toolbar after font size selection
                this.hideToolbar();
                break;

            case 'show-citations':
                this.mode = 'dialog';
                this.dialogName = 'citations';
                this.fetchCitations();
                break;

            case 'link':
                this.mode = 'dialog';
                this.dialogName = 'link';
                break;

            case 'ai-improve':
                this.mode = 'dialog';
                this.dialogName = 'ai-chat';
                break;

            case 'find-source':
                this.mode = 'dialog';
                this.dialogName = 'sources';
                this.fetchSources();
                break;

            case 'make-longer':
            case 'make-shorter':
            case 'fix-spelling-grammar':
            case 'improve-writing':
            case 'summarize':
                await this.handleAIOperation(action);
                break;

            case 'ai-operation':
                await this.handleAIOperation(operation);
                break;

            case 'ai-submenu':
                // Handle submenu operations (translate/tone)
                break;

            case 'ai-custom':
                await this.handleAIOperation(operation);
                break;

            default:
                this.dispatchEvent(
                    new CustomEvent('toolbar-action', {
                        detail: { action, elementId: this.elementId, selectedText: this.selectedText },
                        bubbles: true,
                        composed: true,
                    })
                );
        }
    }

    handleLinkKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent newline insertion
            this.handleLinkSubmit();
        }
    }

    async handleAIOperation(operation) {
        this.mode = 'loading';

        try {
            const response = await fetch(wisk.editor.backendUrl + '/v1/toolbar-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    operation: operation,
                    selectedText: this.selectedText,
                }),
            });

            if (response.ok) {
                const data = await response.json();

                // Instead of dispatching event, show preview
                this.previewText = data.response;
                this.mode = 'preview';
                this.dialogName = 'preview';
            } else {
                throw new Error('AI operation failed');
            }
        } catch (error) {
            this.mode = 'dialog';
            console.error('AI operation error:', error);
            wisk.utils.showToast('AI operation failed', 3000);
        } finally {
            this.loading = false;
        }
    }

    handleAcceptPreview() {
        // Dispatch event with improved text
        this.dispatchEvent(
            new CustomEvent('ai-operation-complete', {
                detail: {
                    elementId: this.elementId,
                    newText: this.previewText,
                },
                bubbles: true,
                composed: true,
            })
        );

        this.closeDialog();
    }

    handleDiscardPreview() {
        this.previewText = '';
        this.closeDialog();
    }

    async fetchSources() {
        this.mode = 'loading';
        try {
            const auth = await document.getElementById('auth').getUserInfo();
            const response = await fetch(wisk.editor.backendUrl + '/v1/source', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + auth.token,
                },
                body: JSON.stringify({ ops: 'find-source', selectedText: this.selectedText }),
            });

            if (response.ok) {
                const data = await response.json();
                this.sources = data.results;
                this.mode = 'dialog';
                this.dialogName = 'sources';
            } else {
                throw new Error('Failed to fetch sources');
            }
        } catch (error) {
            console.error('Error:', error);
            wisk.utils.showToast('Failed to load sources', 3000);
            this.mode = 'simple';
        }
    }

    handleLinkSubmit(e) {
        e?.preventDefault();

        let url = this.linkUrl;

        if (url.trim() === '') {
            wisk.utils.showToast('URL is empty', 3000);
            return;
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        this.dispatchEvent(
            new CustomEvent('create-link', {
                detail: { url, elementId: this.elementId },
                bubbles: true,
                composed: true,
            })
        );

        this.mode = 'simple';
        this.linkUrl = '';
    }

    closeDialog() {
        this.mode = 'simple';
        this.dialogName = '';
        this.hideToolbar();
    }

    showToolbar(x, y, elementId, selectedText, elementText) {
        if (wisk.editor.readonly) {
            return;
        }

        this.shadowRoot.querySelector('.mob-input').value = '';

        this.selectedText = selectedText;
        this.elementId = elementId;
        this.elementText = elementText;
        this.visible = true;

        // Run in next frame to ensure DOM is updated
        setTimeout(() => {
            this.updateToolbarPosition();
        }, 0);
    }

    hideToolbar() {
        this.visible = false;
        this.mode = 'simple';
        this.dialogName = '';
    }

    async handleCreateReference(source) {
        event?.preventDefault();
        event?.stopPropagation();

        wisk.utils.showLoading('Adding source...');

        try {
            const user = await document.getElementById('auth').getUserInfo();
            const response = await fetch(wisk.editor.backendUrl + '/v1/source', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + user.token,
                },
                body: JSON.stringify({ ops: 'get-url', url: source.url }),
            });

            if (!response.ok) {
                wisk.utils.showToast('Failed to load sources', 3000);
                wisk.utils.hideLoading();
                return;
            }

            const data = (await response.json())[0];

            // Format the publish date properly
            const publishDate = data.publish_date ? new Date(data.publish_date).toISOString().split('T')[0] : '';

            // Create citation object with formatted date
            const citation = {
                id: 'cite-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(),
                title: source.title,
                authors: data.authors || [],
                publish_date: publishDate,
                journal_conference: data.meta_site_name || '',
                url: source.url,
                publisher_name: data.meta_site_name || '',
                doi: data.doi || '',
                volume: data.volume || '',
                issue: data.issue || '',
                pages: data.pages || '',
                publisher_location: data.publisher_location || '',
                language: data.language || '',
                summary: data.summary || '',
                content: data.text || '',
            };

            // Save selection before adding citation
            this.dispatchEvent(
                new CustomEvent('save-selection', {
                    detail: { elementId: this.elementId },
                    bubbles: true,
                    composed: true,
                })
            );

            const citationsManager = document.querySelector('manage-citations');
            if (!citationsManager) {
                wisk.utils.showToast('Citations manager not found', 3000);
                wisk.utils.hideLoading();
                return;
            }

            citationsManager.addReferenceExt(citation);
            const inlineCitation = citationsManager.formatInlineCitation(citation);

            this.dispatchEvent(
                new CustomEvent('create-reference', {
                    detail: {
                        elementId: this.elementId,
                        citation: citation,
                        inlineCitation: inlineCitation,
                    },
                    bubbles: true,
                    composed: true,
                })
            );

            this.closeDialog();
        } catch (error) {
            console.error('Error creating reference:', error);
            wisk.utils.showToast('Failed to create reference', 3000);
        } finally {
            wisk.utils.hideLoading();
        }
    }

    async updateSearch() {
        wisk.utils.showToast('Searching for sources...', 3000);
        this.loading = true;
        this.sources = [];

        try {
            const user = await document.getElementById('auth').getUserInfo();
            const searchInput = this.shadowRoot.getElementById('source-search');
            const search = searchInput ? searchInput.value : this.selectedText;

            const response = await fetch(wisk.editor.backendUrl + '/v1/source', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + user.token,
                },
                body: JSON.stringify({ ops: 'find-source', selectedText: search }),
            });

            if (response.ok) {
                const data = await response.json();
                this.sources = data.results;
            } else {
                wisk.utils.showToast('Failed to load sources', 3000);
            }
        } catch (error) {
            console.error('Error searching sources:', error);
            wisk.utils.showToast('Search failed', 3000);
        } finally {
            this.loading = false;
        }
    }

    renderColorMenu() {
        return html`
            <div class="color-menu">
                <div class="color-section">
                    <h3 style="user-select: none;">Text Color</h3>
                    <div class="color-grid">
                        ${Object.entries(this.colorOptions).map(
            ([key, color]) => html`
                                <div
                                    class="color-option ${color.fg === this.activeTextColor ? 'active' : ''}"
                                    style="background-color: ${color.fg}"
                                    @click=${() => this._handleTextColorClick(color.fg)}
                                    title="${color.name}"
                                ></div>
                            `
        )}
                    </div>
                </div>
                <div class="color-section">
                    <h3 style="user-select: none;">Background Color</h3>
                    <div class="color-grid">
                        ${Object.entries(this.colorOptions).map(
            ([key, color]) => html`
                                <div
                                    class="color-option ${color.bg === this.activeBackgroundColor ? 'active' : ''}"
                                    style="background-color: ${color.bg}"
                                    @click=${() => this._handleBackgroundColorClick(color.bg)}
                                    title="${color.name}"
                                ></div>
                            `
        )}
                    </div>
                </div>
            </div>
        `;
    }

    // yeah i know this is a mess, but i don't want to refactor it right now
    renderNonAbsoluteColorMenu() {
        return html`
                    <div class="color-grid">
                        ${Object.entries(this.colorOptions).map(
            ([key, color]) => html`
                                <div
                                    class="color-option ${color.fg === this.activeTextColor ? 'active' : ''}"
                                    style="background-color: ${color.fg}"
                                    @click=${() => this._handleTextColorClick(color.fg)}
                                    title="${color.name}"
                                ></div>
                            `
        )}
                    </div>
                    <div style="margin-top: var(--gap-2);"></h3>
                    <div class="color-grid">
                        ${Object.entries(this.colorOptions).map(
            ([key, color]) => html`
                                <div
                                    class="color-option ${color.bg === this.activeBackgroundColor ? 'active' : ''}"
                                    style="background-color: ${color.bg}"
                                    @click=${() => this._handleBackgroundColorClick(color.bg)}
                                    title="${color.name}"
                                ></div>
                            `
        )}
                    </div>
        `;
    }

    _handleTextColorClick(color) {
        this.activeTextColor = color;
        this.dispatchEvent(
            new CustomEvent('toolbar-action', {
                detail: {
                    action: 'foreColor',
                    elementId: this.elementId,
                    selectedText: this.selectedText,
                    formatValue: color,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    _handleBackgroundColorClick(color) {
        this.activeBackgroundColor = color;
        this.dispatchEvent(
            new CustomEvent('toolbar-action', {
                detail: {
                    action: 'backColor',
                    elementId: this.elementId,
                    selectedText: this.selectedText,
                    formatValue: color,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    renderDialog() {
        switch (this.dialogName) {
            case 'preview':
                return html`
                    <div class="dialog">
                        <div class="preview-container">
                            <div class="preview-content">${this.previewText}</div>
                            <div class="preview-buttons">
                                <button class="discard" @click=${this.handleDiscardPreview}>Discard</button>
                                <button class="accept" @click=${this.handleAcceptPreview}>Accept</button>
                            </div>
                        </div>
                    </div>
                `;

            case 'citations':
                return html`
                    <div class="dialog">
                        <div class="dialog-header">
                            <h3 style="margin-bottom: var(--gap-3)">Select Citation</h3>
                        </div>
                        <div style="overflow: auto; max-height: 400px;">
                            ${this.citations.length === 0
                        ? html`<p style="line-height: 1.5; font-size: 14px">
                                      No citations available. Add citations using the Citations Manager. Or add new using
                                      <span
                                          style="background: var(--bg-3); padding: 2px 4px; border-radius: 4px; color: var(--fg-1); display: inline-flex; align-items: center;"
                                      >
                                          <img src="/a7/forget/source.svg" alt="Source" style="height: 14px; margin-right: 4px;" /> Find Source</span
                                      >
                                      option.
                                  </p>`
                        : this.citations.map(
                            citation => html`
                                          <div class="source-item">
                                              <div style="display: flex; justify-content: space-between; align-items: start; width: 100%;">
                                                  <div style="flex: 1;">
                                                      <h3 style="font-size: 14px; margin-bottom: var(--gap-1);">${citation.title}</h3>
                                                      <p style="font-size: 12px; color: var(--fg-2);">
                                                          ${citation.authors.join(', ')}
                                                          ${citation.publish_date ? ` • ${new Date(citation.publish_date).getFullYear()}` : ''}
                                                      </p>
                                                  </div>
                                                  <button
                                                      @click=${() => this.handleInsertCitation(citation)}
                                                      class="button"
                                                      style="white-space: nowrap; margin-left: var(--gap-2);"
                                                  >
                                                      Insert
                                                  </button>
                                              </div>
                                          </div>
                                      `
                        )}
                        </div>
                    </div>
                `;

            case 'link':
                return html`
                    <div class="dialog">
                        <div class="od">
                            <img src="/a7/forget/link.svg" alt="Link" style="height: 18px; filter: var(--themed-svg);" />
                            <input
                                type="text"
                                placeholder="Enter URL"
                                .value=${this.linkUrl}
                                @input=${e => (this.linkUrl = e.target.value)}
                                @keydown=${this.handleLinkKeyDown}
                                class="ai-input"
                            />
                        </div>
                        <div class="dialog-buttons">
                            <button class="cancel" @click=${this.closeDialog}>Cancel</button>
                            <button @click=${this.handleLinkSubmit} class="save">Save</button>
                        </div>
                    </div>
                `;

            case 'ai-chat':
                return html`
                    <div class="dialog">
                        <div class="od">
                            <img src="/a7/plugins/toolbar/ai.svg" alt="AI" style="height: 24px;" />
                            <input
                                type="text"
                                placeholder="Ask AI anything..."
                                class="ai-input"
                                @keydown=${e => e.key === 'Enter' && this.handleToolbarAction('ai-custom', e.target.value)}
                            />
                        </div>
                        <div class="ai-commands">
                            <div class="command-section">
                                <h3>Suggested</h3>
                                <button @click=${() => this.handleToolbarAction('ai-operation', 'autocomplete-this-paragraph')}>
                                    <img src="/a7/plugins/toolbar/autocomplete.svg" alt="wand" style="height: 16px;" /> AI Autocomplete
                                </button>
                                <button @click=${() => this.handleToolbarAction('ai-operation', 'improve-writing')}>
                                    <img src="/a7/plugins/toolbar/wand.svg" alt="wand" style="height: 16px;" /> Improve writing
                                </button>
                                <button @click=${() => this.handleToolbarAction('ai-operation', 'fix-spelling-grammar')}>
                                    <img src="/a7/plugins/toolbar/check.svg" alt="check" style="height: 16px;" /> Fix spelling & grammar
                                </button>
                                <div class="submenu-container">
                                    <button class="submenu-trigger">
                                        <img src="/a7/plugins/toolbar/translate.svg" alt="Translate" style="height: 16px;" /> Translate to
                                        <div style="flex: 1"></div>
                                        <img src="/a7/plugins/toolbar/right.svg" alt=">" style="height: 14px;" />
                                    </button>
                                    <div class="submenu translate-menu">
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-ko')}>Korean</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-zh')}>Chinese</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-ja')}>Japanese</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-en')}>English</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-es')}>Spanish</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-fr')}>French</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-de')}>German</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-it')}>Italian</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-pt')}>Portuguese</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-id')}>Indonesian</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-vi')}>Vietnamese</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-th')}>Thai</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-hi')}>Hindi</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-mr')}>Marathi</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-ar')}>Arabic</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-ru')}>Russian</button>
                                    </div>
                                </div>
                                <div class="submenu-container">
                                    <button class="submenu-trigger">
                                        <img src="/a7/plugins/toolbar/refresh.svg" alt="Translate" style="height: 16px;" /> Paraphrase
                                        <div style="flex: 1"></div>
                                        <img src="/a7/plugins/toolbar/right.svg" alt=">" style="height: 14px;" />
                                    </button>
                                    <div class="submenu paraphrase-menu">
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-academically')}>
                                            Academically
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-casually')}>Casually</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-persuasively')}>
                                            Persuasively
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-boldly')}>Boldly</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-straightforwardly')}>
                                            Straightforwardly
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-friendly')}>Friendly</button>
                                    </div>
                                </div>
                            </div>

                            <div class="command-section">
                                <h3>Research</h3>
                                <button @click=${() => this.handleToolbarAction('ai-operation', 'define/explain')}>
                                    <img src="/a7/plugins/toolbar/mean.svg" alt="check" style="height: 16px;" /> Define/Explain
                                </button>
                                <button @click=${() => this.handleToolbarAction('ai-operation', 'improve-writing')}>
                                    <img src="/a7/plugins/toolbar/edit.svg" alt="wand" style="height: 16px;" /> Write opposing argument
                                </button>
                            </div>

                            <div class="command-section">
                                <h3>Edit</h3>
                                <button @click=${() => this.handleToolbarAction('ai-operation', 'make-shorter')}>
                                    <img src="/a7/plugins/toolbar/shorter.svg" alt="Shorten" style="height: 16px;" /> Make shorter
                                </button>
                                <button @click=${() => this.handleToolbarAction('ai-operation', 'make-longer')}>
                                    <img src="/a7/plugins/toolbar/longer.svg" alt="Lengthen" style="height: 16px;" /> Make longer
                                </button>
                                <div class="submenu-container">
                                    <button class="submenu-trigger">
                                        <img src="/a7/plugins/toolbar/tone.svg" alt="Tone" style="height: 16px;" /> Change tone
                                        <div style="flex: 1"></div>
                                        <img src="/a7/plugins/toolbar/right.svg" alt=">" style="height: 14px;" />
                                    </button>
                                    <div class="submenu tone-menu">
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'tone-professional')}>Professional</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'tone-casual')}>Casual</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'tone-straightforward')}>
                                            Straightforward
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'tone-confident')}>Confident</button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'tone-friendly')}>Friendly</button>
                                    </div>
                                </div>
                                <button @click=${() => this.handleToolbarAction('ai-operation', 'simplify')}>
                                    <img src="/a7/plugins/toolbar/simplify.svg" alt="Simplify" style="height: 16px;" /> Simplify language
                                </button>
                            </div>
                        </div>
                    </div>
                `;

            case 'sources':
                return html`
                    <div class="dialog">
                        <div style="display: flex; gap: 8px; margin-bottom: 8px; flex-direction: column">
                            <div class="od" style="margin-bottom: 0; flex: 1; padding: var(--padding-1) var(--padding-2)">
                                <input type="text" placeholder="Search sources" id="source-search" .value=${this.selectedText} class="ai-input" />
                                <button
                                    style="border: none; font-size: 12px; padding: var(--padding-3); background: transparent"
                                    @click=${this.updateSearch}
                                >
                                    <img src="/a7/plugins/toolbar/search.svg" alt="Search" style="height: 16px; filter: var(--themed-svg)" />
                                </button>
                            </div>

                            <button
                                @click=${() => this.handleToolbarAction('show-citations')}
                                title="Add Existing Citation"
                                data-wide
                                style="border: none; color: var(--fg-1);"
                            >
                                <img src="/a7/forget/list.svg" alt="Citation" style="filter: var(--themed-svg)" /> Show current citations
                            </button>
                        </div>
                        <div style="overflow: auto; padding: var(--padding-3) 0">
                            ${this.loading
                        ? html`<div style="display: flex; justify-content: center; padding: 20px;">
                                      <div class="loading-indicator"></div>
                                  </div>`
                        : this.sources.map(
                            source => html`
                                          <div class="source-item">
                                              <h3 style="user-select: text">${source.title}</h3>
                                              <p style="user-select: text">${source.content}</p>
                                              <div
                                                  style="display: flex; flex-direction: row; justify-content: space-between; width: 100%; align-items: center;"
                                              >
                                                  <a class="url" href=${source.url} target="_blank"
                                                      >${source.url.length > 40 ? source.url.slice(0, 40) + '...' : source.url}</a
                                                  >
                                                  <button
                                                      @click=${() => this.handleCreateReference(source)}
                                                      style="border: 1px solid var(--border-1); color: var(--fg-1)"
                                                  >
                                                      Add Source
                                                  </button>
                                              </div>
                                          </div>
                                      `
                        )}
                        </div>
                    </div>
                `;
            default:
                return null;
        }
    }

    render() {
        return html`
            ${this.mode === 'dialog' || this.mode === 'preview' ? html`<div class="backdrop" @click=${this.closeDialog}></div>` : ''}

            <div class="toolbar ${this.visible ? 'visible' : ''}">
                <div style="display: flex; gap: var(--gap-2); flex-wrap: wrap; justify-content: space-between; ">
                    <button
                        @click=${() => this.handleToolbarAction('ai-improve')}
                        title="Improve with AI"
                        data-wide
                        style="${this.isMobile ? 'display: none;' : ''}"
                    >
                        <img src="/a7/forget/ai.svg" alt="AI" draggable="false" /> Neo AI
                    </button>
                    <div class="separator" style="${this.isMobile ? 'display: none;' : ''}"></div>

                    <div style="display: flex; width: 100%; flex: 1; justify-content: space-between; gap: var(--gap-1);">
                        <button @click=${() => this.handleToolbarAction('bold')} title="Bold">
                            <img src="/a7/forget/bold.svg" alt="Bold" draggable="false" />
                        </button>
                        <button @click=${() => this.handleToolbarAction('italic')} title="Italic">
                            <img src="/a7/forget/italics.svg" alt="Italic" draggable="false" />
                        </button>
                        <button @click=${() => this.handleToolbarAction('underline')} title="Underline">
                            <img src="/a7/forget/underline.svg" alt="Underline" draggable="false" />
                        </button>
                        <div class="submenu-container font-size-container"
                        @mouseenter=${this.handleFontSizeMouseEnter}
                        @mouseleave=${this.handleFontSizeMouseLeave}>
                            <button class="submenu-trigger" title="Font Size" style="width: auto; padding: 0 8px; min-width: 40px;">
                                <span style="font-size: 12px; font-weight: 500;">${this.currentFontSize}</span>
                                <img src="/a7/plugins/toolbar/down.svg" alt=">" draggable="false" style="margin-left: 4px;" />
                            </button>
                            <div class="submenu font-size-menu"
                            @mouseenter=${this.handleFontSizeMouseEnter}
                            @mouseleave=${this.handleFontSizeMouseLeave}>
                                <button @click=${(e) => this.handleFontSizeClick(e, '8')}>8px</button>
                                <button @click=${(e) => this.handleFontSizeClick(e, '10')}>10px</button>
                                <button @click=${(e) => this.handleFontSizeClick(e, '12')}>12px</button>
                                <button @click=${(e) => this.handleFontSizeClick(e, '14')}>14px</button>
                                <button @click=${(e) => this.handleFontSizeClick(e, '16')}>16px</button>
                                <button @click=${(e) => this.handleFontSizeClick(e, '18')}>18px</button>
                                <button @click=${(e) => this.handleFontSizeClick(e, '20')}>20px</button>
                                <button @click=${(e) => this.handleFontSizeClick(e, '24')}>24px</button>
                                <button @click=${(e) => this.handleFontSizeClick(e, '28')}>28px</button>
                                <button @click=${(e) => this.handleFontSizeClick(e, '32')}>32px</button>
                                <button @click=${(e) => this.handleFontSizeClick(e, '36')}>36px</button>
                                <button @click=${(e) => this.handleFontSizeClick(e, '40')}>40px</button>
                                <button @click=${(e) => this.handleFontSizeClick(e, '48')}>48px</button>
                                <button @click=${(e) => this.handleFontSizeClick(e, '56')}>56px</button>
                                <button @click=${(e) => this.handleFontSizeClick(e, '64')}>64px</button>
                            </div>
                        </div>
                        <button @click=${() => this.handleToolbarAction('strikeThrough')} title="Strikethrough">
                            <img src="/a7/forget/strikethrough.svg" alt="Strikethrough" draggable="false" />
                        </button>
                        <button @click=${() => this.handleToolbarAction('link')} title="Add Link">
                            <img src="/a7/forget/link.svg" alt="Link" draggable="false" />
                        </button>
                        <button @click=${() => this.handleToolbarAction('subscript')} title="Subscript">
                            <img src="/a7/plugins/toolbar/subscript.svg" alt="Subscript" draggable="false" />
                        </button>
                        <button @click=${() => this.handleToolbarAction('superscript')} title="Superscript">
                            <img src="/a7/plugins/toolbar/superscript.svg" alt="Superscript" draggable="false" />
                        </button>
                        <div class="submenu-container mobhide">
                            <button class="submenu-trigger" title="Colors" style="width: auto; padding: 0 5px">
                                <img src="/a7/plugins/toolbar/color.svg" alt="Colors" draggable="false" />
                                <img src="/a7/plugins/toolbar/down.svg" alt="Colors" draggable="false" />
                            </button>
                            ${this.renderColorMenu()}
                        </div>
                    </div>
                </div>

                <div style="${this.isMobile ? '' : 'display: none'};">${this.renderNonAbsoluteColorMenu()}</div>

                <input
                    type="text"
                    placeholder="Ask AI anything..."
                    class="mob-input"
                    @keydown=${e => e.key === 'Enter' && this.handleToolbarAction('ai-custom', e.target.value)}
                />

                ${this.mode === 'loading' ? html`<div class="loading-overlay"><div class="loading-indicator"></div></div>` : ''}
                ${this.mode === 'dialog' || this.mode === 'preview'
                ? html`
                          <div class="dialog-container">
                              <div style="overflow: auto; width: 100%;">${this.renderDialog()}</div>
                          </div>
                      `
                : ''}
            </div>
        `;
    }
}

customElements.define('toolbar-element', ToolbarElement);
