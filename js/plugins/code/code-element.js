import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class CodeElement extends LitElement {
    static styles = css`
        :host {
            display: block;
            position: relative;
        }
        .language-selector {
            position: absolute;
            top: var(--padding-2);
            right: var(--padding-2);
            z-index: 1;
            opacity: 0;
            transition: opacity 0.2s;
        }
        :host(:hover) .language-selector {
            opacity: 1;
        }
        @media (max-width: 768px) {
            .language-selector {
                opacity: 1;
            }
        }
        .selector-button {
            font-family: var(--font-mono);
            padding: var(--padding-w1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background: var(--bg-2);
            color: var(--fg-1);
            cursor: pointer;
            outline: none;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }
        .selector-button:hover {
            background: var(--bg-3);
        }
        .selector-button:focus {
            border-color: var(--fg-accent);
        }
        .dropdown-icon {
            width: 12px;
            height: 12px;
            transition: transform 0.2s;
        }
        .dropdown-icon.open {
            transform: rotate(180deg);
        }
        .dropdown-menu {
            position: absolute;
            top: calc(100% + 4px);
            right: 0;
            background: var(--bg-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-height: 300px;
            overflow-y: auto;
            min-width: 150px;
            opacity: 0;
            transform: translateY(-8px);
            pointer-events: none;
            transition: opacity 0.2s, transform 0.2s;
        }
        .dropdown-menu.open {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
        }
        .dropdown-item {
            font-family: var(--font-mono);
            padding: var(--padding-w1) var(--padding-2);
            cursor: pointer;
            color: var(--fg-1);
            font-size: 14px;
            transition: background 0.15s;
        }
        .dropdown-item:hover {
            background: var(--bg-3);
        }
        .dropdown-item.selected {
            background: var(--bg-accent);
            color: var(--fg-accent);
        }
        .dropdown-item:first-child {
            border-radius: var(--radius) var(--radius) 0 0;
        }
        .dropdown-item:last-child {
            border-radius: 0 0 var(--radius) var(--radius);
        }
        .CodeMirror {
            height: auto;
            font-family: var(--font-mono);
            background: var(--bg-1);
            color: var(--fg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            padding: var(--padding-3);
            caret-color: var(--fg-1);
            font-size: 14px;
        }
        .cm-matchingbracket {
            background-color: var(--bg-green);
            color: var(--fg-green) !important;
        }
        .cm-nonmatchingbracket {
            background-color: var(--bg-red);
            color: var(--fg-red) !important;
        }
        .CodeMirror-selected {
            background-color: var(--bg-accent) !important;
        }
        .cm-variable {
            color: var(--fg-1);
        }
        .cm-keyword {
            color: var(--fg-purple);
        }
        .cm-def {
            color: var(--fg-blue);
        }
        .cm-operator {
            color: var(--fg-red);
        }
        .cm-number {
            color: var(--fg-orange);
        }
        .cm-string {
            color: var(--fg-accent);
        }
        .cm-property {
            color: var(--fg-cyan);
        }
        .cm-comment {
            color: var(--fg-2);
        }
        .CodeMirror-gutters {
            display: none;
        }
        .CodeMirror-cursor {
            border-left: 1px solid var(--fg-1);
        }
    `;

    static properties = {
        supportedLanguages: { type: Object },
        editor: { type: Object },
        valueBuffer: { type: Object },
        selectedLang: { type: String },
        dropdownOpen: { type: Boolean },
    };

    constructor() {
        super();
        this.supportedLanguages = {
            javascript: 'JavaScript',
            python: 'Python',
            typescript: 'TypeScript',
            java: 'Java',
            go: 'Go',
            cpp: 'C++',
            csharp: 'C#',
            php: 'PHP',
            ruby: 'Ruby',
            swift: 'Swift',
            kotlin: 'Kotlin',
            sql: 'SQL',
            html: 'HTML',
            css: 'CSS',
            markdown: 'Markdown',
        };
        this.valueBuffer = null;
        this.selectedLang = 'javascript';
        this.dropdownOpen = false;
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    async firstUpdated() {
        await this.initializeCodeMirror();
        document.addEventListener('click', this.handleClickOutside);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('click', this.handleClickOutside);
    }

    handleClickOutside(e) {
        if (!this.renderRoot.contains(e.target)) {
            this.dropdownOpen = false;
        }
    }

    toggleDropdown(e) {
        e.stopPropagation();
        this.dropdownOpen = !this.dropdownOpen;
    }

    selectLanguage(lang) {
        this.selectedLang = lang;
        this.dropdownOpen = false;
        const mode = this.getModeForLanguage(this.selectedLang);
        this.editor.setOption('mode', mode);
        this.sendUpdates();
    }

    async initializeCodeMirror() {
        await import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js');

        const modes = ['javascript', 'xml', 'css', 'python', 'clike', 'markdown', 'go', 'sql', 'php', 'ruby', 'swift'];

        await Promise.all([
            ...modes.map(mode => import(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/${mode}/${mode}.min.js`)),
            import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/closebrackets.min.js'),
            import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/matchbrackets.min.js'),
            import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/closetag.min.js'),
            import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/comment/comment.min.js'),
            import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/fold/foldcode.min.js'),
            import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/fold/brace-fold.min.js'),
        ]);

        const editorContainer = this.renderRoot.querySelector('#editor');

        this.editor = CodeMirror(editorContainer, {
            lineNumbers: false,
            theme: 'custom',
            mode: this.getModeForLanguage(this.selectedLang),
            lineWrapping: true,
            indentUnit: 4,
            tabSize: 4,
            scrollbarStyle: null,
            viewportMargin: Infinity,
            autoCloseBrackets: true,
            matchBrackets: true,
            autoCloseTags: true,
            foldGutter: true,
            gutters: ['CodeMirror-foldgutter'],
            extraKeys: {
                Tab: cm => cm.execCommand('indentMore'),
                'Shift-Tab': cm => cm.execCommand('indentLess'),
                'Ctrl-/': 'toggleComment',
                'Cmd-/': 'toggleComment',
                'Ctrl-J': 'toMatchingTag',
                'Ctrl-Space': 'autocomplete',
            },
        });

        this.editor.on('change', () => {
            this.sendUpdates();
        });

        if (this.valueBuffer) {
            this.setValue(null, this.valueBuffer);
            this.valueBuffer = null;
        }
    }

    updated(changedProperties) {
        if (changedProperties.has('selectedLang') && this.editor) {
            const mode = this.getModeForLanguage(this.selectedLang);
            this.editor.setOption('mode', mode);
        }
    }

    getModeForLanguage(lang) {
        const modeMap = {
            javascript: 'javascript',
            typescript: 'javascript',
            java: 'text/x-java',
            cpp: 'text/x-c++src',
            csharp: 'text/x-csharp',
            python: 'python',
            go: 'go',
            php: 'php',
            ruby: 'ruby',
            swift: 'swift',
            kotlin: 'text/x-kotlin',
            sql: 'sql',
            html: 'xml',
            css: 'css',
            markdown: 'markdown',
        };
        return modeMap[lang] || lang;
    }

    setValue(path, value) {
        if (!this.editor) {
            this.valueBuffer = value;
            return;
        }
        const content = value.textContent || '';
        this.editor.setValue(content);
        this.selectedLang = value.language || 'javascript';
    }

    getValue() {
        if (!this.editor) return this.valueBuffer;
        return {
            textContent: this.editor.getValue(),
            language: this.selectedLang,
        };
    }

    getTextContent() {
        if (!this.editor) return { html: '', text: '', markdown: '' };

        return {
            html: `<pre><code class="language-${this.selectedLang}">${this.editor.getValue()}</code></pre>`,
            text: this.editor.getValue(),
            markdown: '```' + this.selectedLang + '\n' + this.editor.getValue() + '\n```',
        };
    }

    focus() {
        if (this.editor) {
            this.editor.focus();
        }
    }

    sendUpdates() {
        setTimeout(() => {
            wisk?.editor?.justUpdates(this.id);
        }, 0);
    }

    render() {
        return html`
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css" />
            ${!wisk.editor.readonly ? html`
                <div class="language-selector">
                    <button 
                        class="selector-button" 
                        @click=${this.toggleDropdown}
                        aria-haspopup="true"
                        aria-expanded=${this.dropdownOpen}
                    >
                        <span>${this.supportedLanguages[this.selectedLang]}</span>
                        <svg class="dropdown-icon ${this.dropdownOpen ? 'open' : ''}" viewBox="0 0 12 12" fill="none" stroke="currentColor">
                            <path d="M2 4l4 4 4-4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <div class="dropdown-menu ${this.dropdownOpen ? 'open' : ''}" role="menu">
                        ${Object.entries(this.supportedLanguages).map(
                            ([value, label]) => html`
                                <div 
                                    class="dropdown-item ${value === this.selectedLang ? 'selected' : ''}"
                                    role="menuitem"
                                    @click=${() => this.selectLanguage(value)}
                                >
                                    ${label}
                                </div>
                            `
                        )}
                    </div>
                </div>
            ` : ''}
            <div id="editor"></div>
        `;
    }
}

customElements.define('code-element', CodeElement);