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
            border-radius: calc(20 * var(--radius-large));
            filter: var(--drop-shadow);
            padding: var(--padding-1);
            gap: var(--gap-1);
            z-index: 99;
            display: none;
            width: max-content;
            transform: translateZ(0);
            transition: all 0.2s ease;
        }

        @media (max-width: 500px) {
            .toolbar {
                position: fixed;
                background: var(--bg-1);
                border: none;
                border-radius: 0;
                border-top-left-radius: var(--radius-large);
                border-top-right-radius: var(--radius-large);
                padding: var(--padding-3);
                gap: var(--gap-2);
                filter: var(--drop-shadow);
                z-index: 9999;
                display: none;
                transform: translateZ(0);
                width: 100%;
                bottom: 0;
                left: 0;
                right: 0;
                margin: 0;
                height: 90svh;
                max-height: 90svh;
                flex-direction: column;
            }
        }

        .toolbar.visible {
            display: flex;
        }

        /* Standard toolbar button pattern */
        .toolbar-btn {
            background: transparent;
            border: none;
            padding: var(--padding-2);
            border-radius: calc(var(--radius-large) * 20);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--fg-1);
            transition: all 0.2s ease;
            user-select: none;
        }

        .toolbar-btn:hover {
            background: var(--bg-3);
        }

        .toolbar-btn.wide {
            padding: var(--padding-w1);
            gap: var(--gap-2);
            width: auto;
            font-size: 14px;
            font-weight: 500;
        }

        img {
            filter: var(--themed-svg);
        }

        .toolbar-btn img {
            width: 16px;
            height: 16px;
        }

        .separator {
            background: var(--border-1);
            height: auto;
            width: 1px;
            opacity: 0.3;
        }

        /* AI command/dialog button icons */
        .ai-commands-btn {
            width: 100%;
            text-align: left;
            padding: var(--padding-2);
            background: transparent;
            justify-content: flex-start;
            gap: var(--gap-2);
            border-radius: var(--radius);
            font-size: 14px;
            font-weight: 500;
            border: none;
            color: var(--fg-1);
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
        }

        .ai-commands-btn:hover {
            background: var(--bg-3);
        }

        .ai-commands-btn img {
            width: 16px;
            height: 16px;
        }

        /* Submenu buttons */
        .submenu-btn {
            padding: var(--padding-w1);
            width: 100%;
            text-align: left;
            border: none;
            background: transparent;
            color: var(--fg-1);
            cursor: pointer;
            border-radius: var(--radius);
            font-size: 14px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }

        .submenu-btn:hover {
            background: var(--bg-3);
        }

        .submenu-btn img {
            width: 16px;
            height: 16px;
        }

        /* Dialog action buttons */
        .dialog-buttons img {
            width: 16px;
            height: 16px;
        }

        /* Mobile sections */
        .mobile-section {
            display: none;
        }

        @media (max-width: 500px) {
            .mobile-section {
                display: flex;
                flex-direction: column;
                gap: var(--gap-2);
            }

            .desktop-only {
                display: none;
            }
        }

        .section-title {
            font-size: 11px;
            font-weight: 500;
            color: var(--fg-2);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: var(--gap-1);
        }

        .selected-text-preview {
            padding: var(--padding-3);
            border-radius: var(--radius);
            background: var(--bg-2);
            color: var(--fg-2);
            font-size: 14px;
            text-align: center;
            max-height: 100px;
            overflow-y: auto;
            word-break: break-word;
            flex-shrink: 0;
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

        @media (max-width: 500px) {
            .dialog-container {
                flex: 1;
                overflow: auto;
                background: var(--bg-1);
            }
        }

        @media (min-width: 501px) {
            .dialog-container {
                position: absolute;
                top: 100%;
                left: 0;
                margin-top: var(--dialog-margin-top--dont-mess-with-this, 40px);
                width: 100%;
                max-height: 500px;
                background: var(--bg-1);
                border: 1px solid var(--border-1);
                border-radius: var(--radius-large);
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

        .dialog-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--fg-1);
            margin-bottom: var(--gap-3);
            display: none;
        }

        .dialog-buttons {
            display: flex;
            gap: var(--gap-2);
            justify-content: flex-end;
            margin-top: var(--gap-3);
        }

        /* Button styles following design system */
        .btn-primary {
            background: var(--fg-1);
            color: var(--bg-1);
            padding: var(--padding-w2);
            font-weight: 600;
            border-radius: calc(var(--radius-large) * 20);
            border: 2px solid transparent;
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
            font-size: 14px;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .btn-primary:hover {
            background-color: transparent;
            border: 2px solid var(--fg-1);
            color: var(--fg-1);
        }

        .btn-secondary {
            background-color: var(--bg-1);
            border: 2px solid var(--bg-3);
            color: var(--fg-1);
            font-weight: 500;
            padding: var(--padding-w2);
            border-radius: calc(var(--radius-large) * 20);
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
            font-size: 14px;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .btn-secondary:hover {
            background-color: var(--bg-3);
        }

        .btn-tertiary {
            background-color: transparent;
            border: 2px solid transparent;
            color: var(--fg-1);
            font-weight: 500;
            padding: var(--padding-w2);
            border-radius: calc(var(--radius-large) * 20);
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
            font-size: 14px;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .btn-tertiary:hover {
            background-color: var(--bg-3);
        }

        .ai-commands {
            display: flex;
            flex-direction: column;
            gap: 0;
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

        @media (max-width: 500px) {
            .loading-overlay {
                border-top-left-radius: var(--radius-large);
                border-top-right-radius: var(--radius-large);
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
            gap: 0;
        }

        /* Form input following design system */
        .form-input {
            padding: var(--padding-w2);
            border: 2px solid var(--bg-3);
            border-radius: calc(var(--radius) * 20);
            background-color: var(--bg-2);
            color: var(--fg-1);
            font-size: 14px;
            outline: none;
            transition: all 0.2s ease;
            width: 100%;
        }

        .form-input:focus {
            background-color: var(--bg-1);
            border-color: var(--fg-accent);
        }

        .form-input::placeholder {
            color: var(--fg-2);
        }

        .input-container {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-w2);
            border: 2px solid var(--bg-3);
            border-radius: var(--radius);
            background-color: var(--bg-2);
            transition: all 0.2s ease;
        }

        .input-container:has(input:focus) {
            border-color: var(--fg-accent);
            background-color: var(--bg-1);
        }

        .input-container input {
            flex: 1;
            border: none;
            background: transparent;
            color: var(--fg-1);
            outline: none;
            font-size: 14px;
        }

        .submenu-container:hover .submenu {
            display: block;
        }

        .submenu {
            display: none;
            background: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            box-shadow: var(--drop-shadow);
            min-width: 150px;
            z-index: 1002;
            overflow: hidden;
            padding: var(--padding-1);
        }

        @media (min-width: 501px) {
            .submenu-container {
                position: relative;
            }

            .submenu {
                position: absolute;
                left: calc(100% - 8px);
                top: 0;
            }
        }

        @media (max-width: 500px) {
            .submenu {
                position: static;
                margin-left: var(--padding-3);
                margin-top: var(--gap-2);
                border: none;
                box-shadow: none;
                padding: 0;
                background: transparent;
            }

            .submenu-container:hover .submenu,
            .submenu {
                display: block;
            }
        }

        .submenu-trigger {
            position: relative;
        }

        .preview-container {
            max-height: 300px;
            overflow-y: auto;
        }

        .preview-content {
            padding: var(--padding-3);
            border-radius: var(--radius);
            background: var(--bg-2);
            margin-bottom: var(--gap-3);
            white-space: pre-wrap;
            user-select: text;
            font-size: 14px;
            line-height: 1.6;
        }

        .color-menu {
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
        }

        .color-section {
            margin-bottom: var(--gap-2);
        }

        .color-section:last-child {
            margin-bottom: 0;
        }

        .color-section h3 {
            font-size: 11px;
            text-transform: uppercase;
            color: var(--fg-2);
            margin-bottom: var(--gap-1);
            font-weight: 500;
            letter-spacing: 0.5px;
        }

        .color-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: var(--gap-2);
        }

        .color-option {
            height: 32px;
            border-radius: var(--radius);
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            border: 2px solid transparent;
        }

        .color-option:hover {
            transform: scale(1.05);
            border-color: var(--fg-1);
        }

        /* Color indicator previews inside dropdown */
        .color-preview-row {
            display: flex;
            gap: var(--gap-2);
            margin-bottom: var(--gap-2);
            align-items: center;
        }

        .color-preview-item {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: var(--padding-2);
            background: var(--bg-2);
            border-radius: var(--radius);
            flex: 1;
        }

        .color-preview-text {
            font-family: Georgia, serif;
            font-weight: 600;
            font-size: 18px;
        }

        .color-preview-bg {
            width: 24px;
            height: 24px;
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
        }

        .color-preview-label {
            font-size: 12px;
            color: var(--fg-2);
            font-weight: 500;
        }

        @media (max-width: 500px) {
            @starting-style {
                .toolbar {
                    transform: translateY(100%);
                }
            }

            .backdrop {
                background: rgba(0, 0, 0, 0.5);
            }
        }

        /* Mobile sheet handle */
        .sheet-handle {
            display: none;
        }

        @media (max-width: 500px) {
            .sheet-handle {
                display: flex;
                justify-content: center;
                padding: var(--padding-2) 0;
                margin-bottom: var(--gap-2);
            }

            .sheet-handle-bar {
                width: 40px;
                height: 4px;
                background: var(--fg-2);
                border-radius: 2px;
                opacity: 0.4;
            }
        }

        /* Mobile-specific button styles */
        .mobile-action-btn {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-w1);
            background: transparent;
            border: none;
            border-radius: var(--radius);
            color: var(--fg-1);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            width: 100%;
            text-align: left;
            justify-content: flex-start;
        }

        .mobile-action-btn:hover {
            background: var(--bg-3);
        }

        .mobile-action-btn img {
            width: 20px;
            height: 20px;
        }

        .mobile-header {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            margin-bottom: var(--gap-3);
            padding-bottom: var(--padding-2);
            border-bottom: 1px solid var(--border-1);
        }

        .mobile-back-btn {
            background: transparent;
            border: none;
            padding: var(--padding-2);
            border-radius: var(--radius);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--fg-1);
            transition: all 0.2s ease;
        }

        .mobile-back-btn:hover {
            background: var(--bg-3);
        }

        .mobile-back-btn img {
            width: 20px;
            height: 20px;
        }

        .mobile-header-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--fg-1);
        }

        .mobile-section-divider {
            height: 1px;
            background: var(--border-1);
            margin: var(--gap-2) 0;
            opacity: 0.5;
        }

        /* Mobile scrollable content wrapper */
        .mobile-scrollable-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
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
        mobileView: { type: String, state: true }, // 'main', 'translate', 'tone', 'paraphrase', 'color', 'link'
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
        this.isMobile = window.innerWidth < 500;
        this.mobileView = 'main';

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
    }

    connectedCallback() {
        super.connectedCallback();

        // Add event listeners when component is connected
        const editor = document.querySelector('.editor');
        if (editor) {
            this._scrollListener = this.updateToolbarPosition.bind(this);
            editor.addEventListener('scroll', this._scrollListener);
        }

        this._resizeListener = () => {
            this.isMobile = window.innerWidth < 500;
            this.updateToolbarPosition();
        };
        window.addEventListener('resize', this._resizeListener);

        // Add popstate listener for back button on mobile
        this._popstateListener = e => {
            // When user presses back and toolbar is visible
            if (this.visible && this.isMobile) {
                // Check if we're in a submenu
                if (this.mobileView !== 'main') {
                    // Go back to main view
                    this.mobileView = 'main';
                } else {
                    // Close toolbar completely
                    this.hideToolbar(true);
                }
            }
        };
        window.addEventListener('popstate', this._popstateListener);
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

        if (this._popstateListener) {
            window.removeEventListener('popstate', this._popstateListener);
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

    navigateToMobileView(view) {
        // Navigate to a mobile submenu and add to history
        if (this.isMobile && view !== 'main') {
            history.pushState({ toolbarOpen: true, mobileView: view }, '');
        }
        this.mobileView = view;
    }

    goBackInMobileView(fromButton = false) {
        // If triggered from UI button, just go back in history
        // The popstate handler will set mobileView to 'main'
        if (fromButton && window.history.state?.mobileView) {
            history.back();
        } else {
            // If not from button (e.g., from popstate), update the view
            this.mobileView = 'main';
        }
    }

    updateToolbarPosition() {
        if (!this.visible || !this.elementId) return;

        const toolbar = this.shadowRoot.querySelector('.toolbar');
        if (!toolbar) return;

        if (this.isMobile) {
            // CSS handles mobile positioning (bottom sheet)
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

            case 'color':
                this.mode = 'dialog';
                this.dialogName = 'color';
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

        // Don't render toolbar on mobile (width < 500)
        if (window.innerWidth < 500) {
            return;
        }

        // Clear mobile AI input if it exists
        const mobileInput = this.shadowRoot.querySelector('.mobile-section .form-input');
        if (mobileInput) {
            mobileInput.value = '';
        }

        this.selectedText = selectedText;
        this.elementId = elementId;
        this.elementText = elementText;
        this.visible = true;

        // Add to history on mobile so back button closes the toolbar
        if (this.isMobile) {
            history.pushState({ toolbarOpen: true }, '');
        }

        // Run in next frame to ensure DOM is updated
        setTimeout(() => {
            this.updateToolbarPosition();
        }, 0);
    }

    hideToolbar(fromPopstate = false) {
        if (!this.visible) return; // Don't do anything if already hidden

        const wasInSubview = this.mobileView !== 'main';

        this.visible = false;
        this.mode = 'simple';
        this.dialogName = '';
        this.mobileView = 'main';

        // If on mobile and not triggered by popstate, go back in history
        if (this.isMobile && !fromPopstate) {
            // If we were in a subview, we need to pop twice (subview + toolbar open)
            // If we were in main view, we only need to pop once (toolbar open)
            if (wasInSubview && window.history.state?.mobileView) {
                history.go(-2);
            } else if (window.history.state?.toolbarOpen) {
                history.back();
            }
        }
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
                    <h3>Text Color</h3>
                    <div class="color-grid">
                        ${Object.entries(this.colorOptions).map(
                            ([key, color]) => html`
                                <div
                                    class="color-option ${color.fg === this.activeTextColor ? 'active' : ''}"
                                    style="color: ${color.fg}; display: flex; align-items: center; justify-content: center; border: 1px solid ${color.fg};"
                                    @click=${() => this._handleTextColorClick(color.fg)}
                                    title="${color.name}"
                                >
                                    Aa
                                </div>
                            `
                        )}
                    </div>
                </div>
                <div class="color-section">
                    <h3>Background Color</h3>
                    <div class="color-grid">
                        ${Object.entries(this.colorOptions).map(
                            ([key, color]) => html`
                                <div
                                    class="color-option ${color.bg === this.activeBackgroundColor ? 'active' : ''}"
                                    style="background-color: ${color.bg}; border: 1px solid ${color.fg}"
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
                        <h3 class="dialog-title">AI Preview</h3>
                        <div class="preview-container">
                            <div class="preview-content">${this.previewText}</div>
                            <div class="dialog-buttons">
                                <button class="btn-tertiary" @click=${this.handleDiscardPreview}>Discard</button>
                                <button class="btn-primary" @click=${this.handleAcceptPreview}>Accept</button>
                            </div>
                        </div>
                    </div>
                `;

            case 'citations':
                return html`
                    <div class="dialog">
                        <h3 class="dialog-title">Select Citation</h3>
                        <div style="overflow: auto; max-height: 400px;">
                            ${this.citations.length === 0
                                ? html`<p style="line-height: 1.5; font-size: 14px">
                                      No citations available. Add citations using the Citations Manager. Or add new using
                                      <span
                                          style="background: var(--bg-3); padding: 2px 4px; border-radius: 4px; color: var(--fg-1); display: inline-flex; align-items: center;"
                                      >
                                          <img src="/a7/forget/source.svg" alt="Source" style="width: 14px; height: 14px; margin-right: 4px;" /> Find
                                          Source</span
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
                                                      class="btn-secondary"
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
                        <h3 class="dialog-title">Add Link</h3>
                        <div class="input-container">
                            <img src="/a7/forget/link.svg" alt="Link" />
                            <input
                                type="text"
                                placeholder="Enter URL"
                                .value=${this.linkUrl}
                                @input=${e => (this.linkUrl = e.target.value)}
                                @keydown=${this.handleLinkKeyDown}
                            />
                        </div>
                        <div class="dialog-buttons">
                            <button class="btn-tertiary" @click=${this.closeDialog}>Cancel</button>
                            <button class="btn-primary" @click=${this.handleLinkSubmit}>Save</button>
                        </div>
                    </div>
                `;

            case 'color':
                return html`
                    <div class="dialog">
                        <h3 class="dialog-title">Text Colors</h3>
                        ${this.renderColorMenu()}
                        <div class="dialog-buttons">
                            <button class="btn-primary" @click=${this.closeDialog}>Done</button>
                        </div>
                    </div>
                `;

            case 'ai-chat':
                return html`
                    <div class="dialog">
                        <h3 class="dialog-title">Neo AI</h3>
                        <input
                            type="text"
                            placeholder="Ask AI anything..."
                            class="form-input"
                            @keydown=${e => e.key === 'Enter' && this.handleToolbarAction('ai-custom', e.target.value)}
                            style="margin-bottom: var(--gap-3);"
                        />
                        <div class="ai-commands">
                            <div class="command-section">
                                <button
                                    @click=${() => this.handleToolbarAction('ai-operation', 'autocomplete-this-paragraph')}
                                    class="ai-commands-btn"
                                >
                                    <img src="/a7/plugins/toolbar/autocomplete.svg" alt="wand" /> AI Autocomplete
                                </button>
                                <button @click=${() => this.handleToolbarAction('ai-operation', 'improve-writing')} class="ai-commands-btn">
                                    <img src="/a7/plugins/toolbar/wand.svg" alt="wand" /> Improve writing
                                </button>
                                <button @click=${() => this.handleToolbarAction('ai-operation', 'fix-spelling-grammar')} class="ai-commands-btn">
                                    <img src="/a7/plugins/toolbar/check.svg" alt="check" /> Fix spelling & grammar
                                </button>
                                <div class="submenu-container">
                                    <button class="ai-commands-btn submenu-trigger">
                                        <img src="/a7/plugins/toolbar/translate.svg" alt="Translate" /> Translate to
                                        <div style="flex: 1"></div>
                                        <img src="/a7/plugins/toolbar/right.svg" alt=">" />
                                    </button>
                                    <div class="submenu translate-menu">
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-ko')} class="submenu-btn">
                                            Korean
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-zh')} class="submenu-btn">
                                            Chinese
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-ja')} class="submenu-btn">
                                            Japanese
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-en')} class="submenu-btn">
                                            English
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-es')} class="submenu-btn">
                                            Spanish
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-fr')} class="submenu-btn">
                                            French
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-de')} class="submenu-btn">
                                            German
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-it')} class="submenu-btn">
                                            Italian
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-pt')} class="submenu-btn">
                                            Portuguese
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-id')} class="submenu-btn">
                                            Indonesian
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-vi')} class="submenu-btn">
                                            Vietnamese
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-th')} class="submenu-btn">
                                            Thai
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-hi')} class="submenu-btn">
                                            Hindi
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-mr')} class="submenu-btn">
                                            Marathi
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-ar')} class="submenu-btn">
                                            Arabic
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-ru')} class="submenu-btn">
                                            Russian
                                        </button>
                                    </div>
                                </div>
                                <div class="submenu-container">
                                    <button class="ai-commands-btn submenu-trigger">
                                        <img src="/a7/plugins/toolbar/refresh.svg" alt="Paraphrase" /> Paraphrase
                                        <div style="flex: 1"></div>
                                        <img src="/a7/plugins/toolbar/right.svg" alt=">" />
                                    </button>
                                    <div class="submenu paraphrase-menu">
                                        <button
                                            @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-academically')}
                                            class="submenu-btn"
                                        >
                                            Academically
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-casually')} class="submenu-btn">
                                            Casually
                                        </button>
                                        <button
                                            @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-persuasively')}
                                            class="submenu-btn"
                                        >
                                            Persuasively
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-boldly')} class="submenu-btn">
                                            Boldly
                                        </button>
                                        <button
                                            @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-straightforwardly')}
                                            class="submenu-btn"
                                        >
                                            Straightforwardly
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-friendly')} class="submenu-btn">
                                            Friendly
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="command-section">
                                <button @click=${() => this.handleToolbarAction('ai-operation', 'define/explain')} class="ai-commands-btn">
                                    <img src="/a7/plugins/toolbar/mean.svg" alt="check" /> Define/Explain
                                </button>
                                <button @click=${() => this.handleToolbarAction('ai-operation', 'improve-writing')} class="ai-commands-btn">
                                    <img src="/a7/plugins/toolbar/edit.svg" alt="wand" /> Write opposing argument
                                </button>
                            </div>

                            <div class="command-section">
                                <button @click=${() => this.handleToolbarAction('ai-operation', 'make-shorter')} class="ai-commands-btn">
                                    <img src="/a7/plugins/toolbar/shorter.svg" alt="Shorten" /> Make shorter
                                </button>
                                <button @click=${() => this.handleToolbarAction('ai-operation', 'make-longer')} class="ai-commands-btn">
                                    <img src="/a7/plugins/toolbar/longer.svg" alt="Lengthen" /> Make longer
                                </button>
                                <div class="submenu-container">
                                    <button class="ai-commands-btn submenu-trigger">
                                        <img src="/a7/plugins/toolbar/tone.svg" alt="Tone" /> Change tone
                                        <div style="flex: 1"></div>
                                        <img src="/a7/plugins/toolbar/right.svg" alt=">" />
                                    </button>
                                    <div class="submenu tone-menu">
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'tone-professional')} class="submenu-btn">
                                            Professional
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'tone-casual')} class="submenu-btn">
                                            Casual
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'tone-straightforward')} class="submenu-btn">
                                            Straightforward
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'tone-confident')} class="submenu-btn">
                                            Confident
                                        </button>
                                        <button @click=${() => this.handleToolbarAction('ai-operation', 'tone-friendly')} class="submenu-btn">
                                            Friendly
                                        </button>
                                    </div>
                                </div>
                                <button @click=${() => this.handleToolbarAction('ai-operation', 'simplify')} class="ai-commands-btn">
                                    <img src="/a7/plugins/toolbar/simplify.svg" alt="Simplify" /> Simplify language
                                </button>
                            </div>
                        </div>
                    </div>
                `;

            case 'sources':
                return html`
                    <div class="dialog">
                        <h3 class="dialog-title">Find Sources</h3>
                        <div style="display: flex; gap: var(--gap-2); margin-bottom: var(--gap-3); flex-direction: column">
                            <div class="input-container">
                                <input type="text" placeholder="Search sources" id="source-search" .value=${this.selectedText} />
                                <button
                                    style="border: none; padding: var(--padding-2); background: transparent; min-width: auto;"
                                    @click=${this.updateSearch}
                                >
                                    <img src="/a7/plugins/toolbar/search.svg" alt="Search" />
                                </button>
                            </div>

                            <button @click=${() => this.handleToolbarAction('show-citations')} class="btn-secondary" style="width: 100%;">
                                <img src="/a7/forget/list.svg" alt="Citation" /> Show current citations
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
                                                  <button @click=${() => this.handleCreateReference(source)} class="btn-secondary">Add Source</button>
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

    renderMobile() {
        // Main view - show all options
        if (this.mobileView === 'main') {
            return html`
                <!-- Sheet Handle -->
                <div class="sheet-handle">
                    <div class="sheet-handle-bar"></div>
                </div>

                <!-- Selected Text Preview -->
                <div class="selected-text-preview" style="margin-bottom: var(--gap-3);">${this.selectedText}</div>

                <!-- Scrollable Content -->
                <div class="mobile-scrollable-content">
                    <!-- Ask AI Input -->
                    <input
                        type="text"
                        placeholder="Ask AI anything..."
                        class="form-input"
                        @keydown=${e => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                                this.handleToolbarAction('ai-custom', e.target.value);
                                e.target.value = '';
                            }
                        }}
                    />

                    <!-- Formatting Options -->
                    <button @click=${() => this.handleToolbarAction('bold')} class="mobile-action-btn">
                        <img src="/a7/forget/bold.svg" alt="Bold" /> Bold
                    </button>
                    <button @click=${() => this.handleToolbarAction('italic')} class="mobile-action-btn">
                        <img src="/a7/forget/italics.svg" alt="Italic" /> Italic
                    </button>
                    <button @click=${() => this.handleToolbarAction('underline')} class="mobile-action-btn">
                        <img src="/a7/forget/underline.svg" alt="Underline" /> Underline
                    </button>
                    <button @click=${() => this.handleToolbarAction('strikeThrough')} class="mobile-action-btn">
                        <img src="/a7/forget/strikethrough.svg" alt="Strikethrough" /> Strikethrough
                    </button>
                    <button @click=${() => this.navigateToMobileView('link')} class="mobile-action-btn">
                        <img src="/a7/forget/link.svg" alt="Link" /> Add Link
                        <div style="flex: 1"></div>
                        <img src="/a7/plugins/toolbar/right.svg" alt=">" style="width: 16px; height: 16px;" />
                    </button>
                    <button @click=${() => this.handleToolbarAction('subscript')} class="mobile-action-btn">
                        <img src="/a7/plugins/toolbar/subscript.svg" alt="Subscript" /> Subscript
                    </button>
                    <button @click=${() => this.handleToolbarAction('superscript')} class="mobile-action-btn">
                        <img src="/a7/plugins/toolbar/superscript.svg" alt="Superscript" /> Superscript
                    </button>
                    <button @click=${() => this.navigateToMobileView('color')} class="mobile-action-btn">
                        <img src="/a7/plugins/toolbar/color.svg" alt="Colors" /> Text Colors
                        <div style="flex: 1"></div>
                        <img src="/a7/plugins/toolbar/right.svg" alt=">" style="width: 16px; height: 16px;" />
                    </button>

                    <div class="mobile-section-divider"></div>

                    <!-- AI Options -->
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'autocomplete-this-paragraph')} class="mobile-action-btn">
                        <img src="/a7/plugins/toolbar/autocomplete.svg" alt="Autocomplete" /> AI Autocomplete
                    </button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'improve-writing')} class="mobile-action-btn">
                        <img src="/a7/plugins/toolbar/wand.svg" alt="Improve" /> Improve Writing
                    </button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'fix-spelling-grammar')} class="mobile-action-btn">
                        <img src="/a7/plugins/toolbar/check.svg" alt="Fix" /> Fix Spelling & Grammar
                    </button>
                    <button @click=${() => this.navigateToMobileView('translate')} class="mobile-action-btn">
                        <img src="/a7/plugins/toolbar/translate.svg" alt="Translate" /> Translate to
                        <div style="flex: 1"></div>
                        <img src="/a7/plugins/toolbar/right.svg" alt=">" style="width: 16px; height: 16px;" />
                    </button>
                    <button @click=${() => this.navigateToMobileView('paraphrase')} class="mobile-action-btn">
                        <img src="/a7/plugins/toolbar/refresh.svg" alt="Paraphrase" /> Paraphrase
                        <div style="flex: 1"></div>
                        <img src="/a7/plugins/toolbar/right.svg" alt=">" style="width: 16px; height: 16px;" />
                    </button>
                    <button @click=${() => this.navigateToMobileView('tone')} class="mobile-action-btn">
                        <img src="/a7/plugins/toolbar/tone.svg" alt="Tone" /> Change Tone
                        <div style="flex: 1"></div>
                        <img src="/a7/plugins/toolbar/right.svg" alt=">" style="width: 16px; height: 16px;" />
                    </button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'make-shorter')} class="mobile-action-btn">
                        <img src="/a7/plugins/toolbar/shorter.svg" alt="Shorter" /> Make Shorter
                    </button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'make-longer')} class="mobile-action-btn">
                        <img src="/a7/plugins/toolbar/longer.svg" alt="Longer" /> Make Longer
                    </button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'simplify')} class="mobile-action-btn">
                        <img src="/a7/plugins/toolbar/simplify.svg" alt="Simplify" /> Simplify Language
                    </button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'define/explain')} class="mobile-action-btn">
                        <img src="/a7/plugins/toolbar/mean.svg" alt="Define" /> Define/Explain
                    </button>
                    <button @click=${() => this.handleToolbarAction('find-source')} class="mobile-action-btn">
                        <img src="/a7/forget/source.svg" alt="Source" /> Find Sources
                    </button>
                </div>
            `;
        }

        // Translate submenu
        if (this.mobileView === 'translate') {
            return html`
                <!-- Sheet Handle -->
                <div class="sheet-handle">
                    <div class="sheet-handle-bar"></div>
                </div>

                <!-- Header with back button -->
                <div class="mobile-header">
                    <button @click=${() => this.goBackInMobileView(true)} class="mobile-back-btn">
                        <img src="/a7/plugins/toolbar/left.svg" alt="Back" />
                    </button>
                    <div class="mobile-header-title">Translate to</div>
                </div>

                <!-- Scrollable Content -->
                <div class="mobile-scrollable-content">
                    <!-- Translation options -->
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-en')} class="mobile-action-btn">English</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-es')} class="mobile-action-btn">Spanish</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-fr')} class="mobile-action-btn">French</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-de')} class="mobile-action-btn">German</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-it')} class="mobile-action-btn">Italian</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-pt')} class="mobile-action-btn">Portuguese</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-zh')} class="mobile-action-btn">Chinese</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-ja')} class="mobile-action-btn">Japanese</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-ko')} class="mobile-action-btn">Korean</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-id')} class="mobile-action-btn">Indonesian</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-vi')} class="mobile-action-btn">Vietnamese</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-th')} class="mobile-action-btn">Thai</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-hi')} class="mobile-action-btn">Hindi</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-mr')} class="mobile-action-btn">Marathi</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-ar')} class="mobile-action-btn">Arabic</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'translate-ru')} class="mobile-action-btn">Russian</button>
                </div>
            `;
        }

        // Paraphrase submenu
        if (this.mobileView === 'paraphrase') {
            return html`
                <!-- Sheet Handle -->
                <div class="sheet-handle">
                    <div class="sheet-handle-bar"></div>
                </div>

                <!-- Header with back button -->
                <div class="mobile-header">
                    <button @click=${() => this.goBackInMobileView(true)} class="mobile-back-btn">
                        <img src="/a7/plugins/toolbar/left.svg" alt="Back" />
                    </button>
                    <div class="mobile-header-title">Paraphrase</div>
                </div>

                <!-- Scrollable Content -->
                <div class="mobile-scrollable-content">
                    <!-- Paraphrase options -->
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-academically')} class="mobile-action-btn">
                        Academically
                    </button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-casually')} class="mobile-action-btn">
                        Casually
                    </button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-persuasively')} class="mobile-action-btn">
                        Persuasively
                    </button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-boldly')} class="mobile-action-btn">Boldly</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-straightforwardly')} class="mobile-action-btn">
                        Straightforwardly
                    </button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'paraphrase-friendly')} class="mobile-action-btn">
                        Friendly
                    </button>
                </div>
            `;
        }

        // Tone submenu
        if (this.mobileView === 'tone') {
            return html`
                <!-- Sheet Handle -->
                <div class="sheet-handle">
                    <div class="sheet-handle-bar"></div>
                </div>

                <!-- Header with back button -->
                <div class="mobile-header">
                    <button @click=${() => this.goBackInMobileView(true)} class="mobile-back-btn">
                        <img src="/a7/plugins/toolbar/left.svg" alt="Back" />
                    </button>
                    <div class="mobile-header-title">Change Tone</div>
                </div>

                <!-- Scrollable Content -->
                <div class="mobile-scrollable-content">
                    <!-- Tone options -->
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'tone-professional')} class="mobile-action-btn">
                        Professional
                    </button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'tone-casual')} class="mobile-action-btn">Casual</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'tone-straightforward')} class="mobile-action-btn">
                        Straightforward
                    </button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'tone-confident')} class="mobile-action-btn">Confident</button>
                    <button @click=${() => this.handleToolbarAction('ai-operation', 'tone-friendly')} class="mobile-action-btn">Friendly</button>
                </div>
            `;
        }

        // Color submenu
        if (this.mobileView === 'color') {
            return html`
                <!-- Sheet Handle -->
                <div class="sheet-handle">
                    <div class="sheet-handle-bar"></div>
                </div>

                <!-- Header with back button -->
                <div class="mobile-header">
                    <button @click=${() => this.goBackInMobileView(true)} class="mobile-back-btn">
                        <img src="/a7/plugins/toolbar/left.svg" alt="Back" />
                    </button>
                    <div class="mobile-header-title">Text Colors</div>
                </div>

                <!-- Scrollable Content -->
                <div class="mobile-scrollable-content">
                    <!-- Color Preview -->
                    <div style="display: flex; gap: var(--gap-2); margin-bottom: var(--gap-3); flex-direction: column;">
                        <div
                            style="display: flex; align-items: center; gap: var(--gap-2); padding: var(--padding-2); background: var(--bg-2); border-radius: var(--radius);"
                        >
                            <span style="color: ${this.activeTextColor}; font-family: Georgia, serif; font-weight: 600; font-size: 18px;">Aa</span>
                            <span style="font-size: 12px; color: var(--fg-2); font-weight: 500;">Text Color</span>
                        </div>
                        <div
                            style="display: flex; align-items: center; gap: var(--gap-2); padding: var(--padding-2); background: var(--bg-2); border-radius: var(--radius);"
                        >
                            <div
                                style="width: 24px; height: 24px; border-radius: var(--radius); border: 1px solid var(--border-1); background-color: ${this
                                    .activeBackgroundColor};"
                            ></div>
                            <span style="font-size: 12px; color: var(--fg-2); font-weight: 500;">Background Color</span>
                        </div>
                    </div>

                    <!-- Text Color Section -->
                    <div style="margin-bottom: var(--gap-3);">
                        <div
                            style="font-size: 11px; text-transform: uppercase; color: var(--fg-2); margin-bottom: var(--gap-2); font-weight: 500; letter-spacing: 0.5px;"
                        >
                            Text Color
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--gap-2);">
                            ${Object.entries(this.colorOptions).map(
                                ([key, color]) => html`
                                    <button
                                        @click=${() => this._handleTextColorClick(color.fg)}
                                        style="width: 100%; aspect-ratio: 1; border-radius: var(--radius); cursor: pointer; border: 2px solid ${color.fg ===
                                        this.activeTextColor
                                            ? 'var(--fg-1)'
                                            : 'transparent'}; background-color: ${color.fg}; padding: 0; transition: all 0.2s ease;"
                                        title="${color.name}"
                                    ></button>
                                `
                            )}
                        </div>
                    </div>

                    <!-- Background Color Section -->
                    <div>
                        <div
                            style="font-size: 11px; text-transform: uppercase; color: var(--fg-2); margin-bottom: var(--gap-2); font-weight: 500; letter-spacing: 0.5px;"
                        >
                            Background Color
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--gap-2);">
                            ${Object.entries(this.colorOptions).map(
                                ([key, color]) => html`
                                    <button
                                        @click=${() => this._handleBackgroundColorClick(color.bg)}
                                        style="width: 100%; aspect-ratio: 1; border-radius: var(--radius); cursor: pointer; border: 2px solid ${color.bg ===
                                        this.activeBackgroundColor
                                            ? 'var(--fg-1)'
                                            : 'transparent'}; background-color: ${color.bg}; padding: 0; transition: all 0.2s ease;"
                                        title="${color.name}"
                                    ></button>
                                `
                            )}
                        </div>
                    </div>
                </div>
            `;
        }

        // Link submenu
        if (this.mobileView === 'link') {
            return html`
                <!-- Sheet Handle -->
                <div class="sheet-handle">
                    <div class="sheet-handle-bar"></div>
                </div>

                <!-- Header with back button -->
                <div class="mobile-header">
                    <button @click=${() => this.goBackInMobileView(true)} class="mobile-back-btn">
                        <img src="/a7/plugins/toolbar/left.svg" alt="Back" />
                    </button>
                    <div class="mobile-header-title">Add Link</div>
                </div>

                <!-- Scrollable Content -->
                <div class="mobile-scrollable-content">
                    <!-- Link Input -->
                    <div class="input-container" style="margin-bottom: var(--gap-3);">
                        <img src="/a7/forget/link.svg" alt="Link" style="width: 20px; height: 20px; filter: var(--themed-svg);" />
                        <input
                            type="text"
                            placeholder="Enter URL"
                            .value=${this.linkUrl}
                            @input=${e => (this.linkUrl = e.target.value)}
                            @keydown=${e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    this.handleLinkSubmit();
                                    this.goBackInMobileView(true);
                                }
                            }}
                        />
                    </div>

                    <!-- Action Buttons -->
                    <button
                        @click=${() => {
                            this.handleLinkSubmit();
                            this.goBackInMobileView(true);
                        }}
                        class="btn-primary"
                        style="width: 100%;"
                    >
                        Save Link
                    </button>
                </div>
            `;
        }
    }

    renderDesktop() {
        return html`
            <!-- Desktop: Formatting Buttons -->
            <div style="display: flex; gap: var(--gap-1); flex-wrap: wrap; align-items: center;">
                <button @click=${() => this.handleToolbarAction('ai-improve')} title="Improve with AI" class="toolbar-btn wide">
                    <img src="/a7/forget/ai.svg" alt="AI" /> Neo AI
                </button>
                <div class="separator"></div>

                <button @click=${() => this.handleToolbarAction('bold')} title="Bold" class="toolbar-btn">
                    <img src="/a7/forget/bold.svg" alt="Bold" />
                </button>
                <button @click=${() => this.handleToolbarAction('italic')} title="Italic" class="toolbar-btn">
                    <img src="/a7/forget/italics.svg" alt="Italic" />
                </button>
                <button @click=${() => this.handleToolbarAction('underline')} title="Underline" class="toolbar-btn">
                    <img src="/a7/forget/underline.svg" alt="Underline" />
                </button>
                <button @click=${() => this.handleToolbarAction('strikeThrough')} title="Strikethrough" class="toolbar-btn">
                    <img src="/a7/forget/strikethrough.svg" alt="Strikethrough" />
                </button>
                <button @click=${() => this.handleToolbarAction('link')} title="Add Link" class="toolbar-btn">
                    <img src="/a7/forget/link.svg" alt="Link" />
                </button>
                <button @click=${() => this.handleToolbarAction('subscript')} title="Subscript" class="toolbar-btn">
                    <img src="/a7/plugins/toolbar/subscript.svg" alt="Subscript" />
                </button>
                <button @click=${() => this.handleToolbarAction('superscript')} title="Superscript" class="toolbar-btn">
                    <img src="/a7/plugins/toolbar/superscript.svg" alt="Superscript" />
                </button>
                <button @click=${() => this.handleToolbarAction('color')} title="Colors" class="toolbar-btn">
                    <img src="/a7/plugins/toolbar/color.svg" alt="Colors" />
                </button>
            </div>
        `;
    }

    render() {
        return html`
            ${this.mode === 'dialog' || this.mode === 'preview' ? html`<div class="backdrop" @click=${this.closeDialog}></div>` : ''}
            ${this.visible && this.isMobile && this.mode === 'simple' ? html`<div class="backdrop" @click=${this.hideToolbar}></div>` : ''}

            <div class="toolbar ${this.visible ? 'visible' : ''}">
                ${this.isMobile ? this.renderMobile() : this.renderDesktop()}
                ${this.mode === 'loading' ? html`<div class="loading-overlay"><div class="loading-indicator"></div></div>` : ''}
                ${this.mode === 'dialog' || this.mode === 'preview'
                    ? html`
                          <div class="dialog-container">
                              <div style="width: 100%;">${this.renderDialog()}</div>
                          </div>
                      `
                    : ''}
            </div>
        `;
    }
}

customElements.define('toolbar-element', ToolbarElement);
