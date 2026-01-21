import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class CodeElement extends LitElement {
    static styles = css`
        :host {
            display: block;
            position: relative;
            margin: var(--padding-2) 0;
        }
        select {
            font-family: var(--font-mono);
            font-size: 12px;
            padding: var(--padding-2) var(--padding-3);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background: var(--bg-2);
            color: var(--fg-2);
            cursor: pointer;
            position: absolute;
            top: var(--padding-2);
            right: var(--padding-2);
            z-index: 1;
            outline: none;
            opacity: 0;
            transition: opacity 0.2s;
        }
        select:focus {
            outline: none;
            border-color: var(--fg-accent);
        }
        :host(:hover) select,
        select:focus {
            opacity: 1;
        }
        @media (max-width: 768px) {
            select {
                opacity: 1;
            }
        }
        .CodeMirror {
            height: auto;
            font-family: var(--font-mono);
            background: var(--bg-2);
            color: var(--fg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            padding: var(--padding-3);
            padding-top: var(--padding-4);
            padding-bottom: var(--padding-4);
            caret-color: var(--fg-1);
            font-size: 14px;
            line-height: 1.5;
        }
        .CodeMirror pre {
            padding: 0 var(--padding-2);
        }
        .CodeMirror-scroll {
            overflow: visible !important;
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
            background-color: var(--bg-3) !important;
        }
        .CodeMirror-focused .CodeMirror-selected {
            background-color: var(--bg-accent) !important;
        }
        .cm-variable {
            color: var(--fg-1);
        }
        .cm-variable-2 {
            color: var(--fg-blue);
        }
        .cm-variable-3 {
            color: var(--fg-cyan);
        }
        .cm-keyword {
            color: var(--fg-purple);
            font-weight: 500;
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
            color: var(--fg-green);
        }
        .cm-string-2 {
            color: var(--fg-orange);
        }
        .cm-property {
            color: var(--fg-cyan);
        }
        .cm-attribute {
            color: var(--fg-purple);
        }
        .cm-comment {
            color: var(--fg-2);
            font-style: italic;
        }
        .cm-tag {
            color: var(--fg-red);
        }
        .cm-builtin {
            color: var(--fg-purple);
        }
        .cm-atom {
            color: var(--fg-orange);
        }
        .cm-meta {
            color: var(--fg-2);
        }
        .cm-qualifier {
            color: var(--fg-orange);
        }
        .cm-type {
            color: var(--fg-cyan);
        }
        .CodeMirror-gutters {
            display: none;
        }
        .CodeMirror-cursor {
            border-left: 2px solid var(--fg-1);
        }
        .CodeMirror-lines {
            padding: var(--padding-2) 0;
        }
    `;

    static properties = {
        supportedLanguages: { type: Object },
        editor: { type: Object },
        valueBuffer: { type: Object },
        selectedLang: { type: String },
    };

    constructor() {
        super();
        this.supportedLanguages = {
            javascript: 'JavaScript',
            typescript: 'TypeScript',
            python: 'Python',
            java: 'Java',
            cpp: 'C++',
            c: 'C',
            csharp: 'C#',
            go: 'Go',
            rust: 'Rust',
            php: 'PHP',
            ruby: 'Ruby',
            swift: 'Swift',
            kotlin: 'Kotlin',
            scala: 'Scala',
            sql: 'SQL',
            html: 'HTML',
            css: 'CSS',
            scss: 'SCSS',
            xml: 'XML',
            json: 'JSON',
            yaml: 'YAML',
            markdown: 'Markdown',
            bash: 'Bash',
            shell: 'Shell',
            powershell: 'PowerShell',
            dockerfile: 'Dockerfile',
            plaintext: 'Plain Text',
        };
        this.valueBuffer = null;
        this.selectedLang = 'javascript';
    }

    async firstUpdated() {
        await this.initializeCodeMirror();
        this.initializeLanguageSelector();
    }

    async initializeCodeMirror() {
        await import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js');

        // Load simple mode addon first (required by rust and some other modes)
        await import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/mode/simple.min.js');

        const modes = [
            'javascript', 'xml', 'css', 'python', 'clike', 'markdown',
            'go', 'sql', 'php', 'ruby', 'swift', 'rust', 'yaml',
            'shell', 'powershell', 'dockerfile', 'sass'
        ];

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

        // Auto-focus the editor after initialization
        requestAnimationFrame(() => {
            this.editor.focus();
            this.editor.setCursor(this.editor.lineCount(), 0);
        });
    }

    initializeLanguageSelector() {
        const select = this.renderRoot.querySelector('#language-select');
        select.value = this.selectedLang;
        select.addEventListener('change', e => {
            this.selectedLang = e.target.value;
            const mode = this.getModeForLanguage(this.selectedLang);
            this.editor.setOption('mode', mode);
            this.sendUpdates();
        });
    }

    updated(changedProperties) {
        if (changedProperties.has('selectedLang') && this.editor) {
            const mode = this.getModeForLanguage(this.selectedLang);
            this.editor.setOption('mode', mode);
            const select = this.renderRoot.querySelector('#language-select');
            if (select && select.value !== this.selectedLang) {
                select.value = this.selectedLang;
            }
        }
    }

    getModeForLanguage(lang) {
        const modeMap = {
            javascript: 'javascript',
            typescript: 'text/typescript',
            python: 'python',
            java: 'text/x-java',
            cpp: 'text/x-c++src',
            c: 'text/x-csrc',
            csharp: 'text/x-csharp',
            go: 'go',
            rust: 'rust',
            php: 'php',
            ruby: 'ruby',
            swift: 'swift',
            kotlin: 'text/x-kotlin',
            scala: 'text/x-scala',
            sql: 'sql',
            html: 'xml',
            css: 'css',
            scss: 'text/x-scss',
            xml: 'xml',
            json: 'application/json',
            yaml: 'yaml',
            markdown: 'markdown',
            bash: 'shell',
            shell: 'shell',
            powershell: 'powershell',
            dockerfile: 'dockerfile',
            plaintext: 'text/plain',
        };
        return modeMap[lang] || 'text/plain';
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
            <select id="language-select" style="${wisk.editor.readonly ? 'display: none' : ''}">
                ${Object.entries(this.supportedLanguages).map(
                    ([value, label]) => html`<option value="${value}" ?selected=${value === this.selectedLang}>${label}</option>`
                )}
            </select>
            <div id="editor"></div>
        `;
    }
}

customElements.define('code-element', CodeElement);
