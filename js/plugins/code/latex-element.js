import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

var katexReady = new Promise(resolve => {
    if (window.katex) {
        resolve();
        return;
    }
    if (!document.querySelector('link[href*="katex"]')) {
        const katexCSS = document.createElement('link');
        katexCSS.rel = 'stylesheet';
        katexCSS.href = '/a7/cdn/katex-0.16.9.min.css';
        document.head.appendChild(katexCSS);
    }
    if (!document.querySelector('script[src*="katex"]')) {
        const katexScript = document.createElement('script');
        katexScript.src = '/a7/cdn/katex-0.16.9.min.js';
        katexScript.onload = () => resolve();
        document.head.appendChild(katexScript);
    }
});

class LatexElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            user-select: text;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        :host {
            display: block;
            position: relative;
        }
        .latex-container {
            border-radius: var(--radius);
            padding: var(--padding-4);
            font-size: 21px;
            background: var(--bg-1);
        }
        .latex-container:hover {
            background: var(--bg-2);
        }
        .error {
            color: var(--fg-red);
            margin-top: var(--padding-2);
            font-size: 14px;
        }
        .edit-button {
            position: absolute;
            top: var(--padding-3);
            right: var(--padding-3);
            opacity: 0;
            transition: opacity 0.15s ease;
            background: var(--bg-2);
            color: var(--fg-1);
            border: 1px solid var(--bg-3);
            padding: var(--padding-w1);
            border-radius: var(--radius);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }
        :host(:hover) .edit-button {
            opacity: 1;
        }
        .dialog {
            background: var(--bg-1);
            padding: var(--padding-4);
            border-radius: var(--radius-large);
            border: 1px solid var(--bg-3);
            margin-top: var(--padding-3);
            filter: var(--drop-shadow);
            padding-bottom: calc(var(--padding-4) - var(--padding-3));
        }
        textarea {
            width: 100%;
            padding: var(--padding-3);
            color: var(--fg-1);
            background: var(--bg-2);
            border-radius: var(--radius);
            font-size: 14px;
            resize: vertical;
            border: 1px solid var(--bg-3);
            transition: border-color 0.15s ease;
            outline: none;
        }
        textarea:focus {
            border-color: var(--bg-3);
        }
        .dialog-buttons {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
        .button {
            background: transparent;
            color: var(--fg-1);
            border: none;
            padding: var(--padding-2);
            border-radius: var(--radius);
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.15s ease;
        }
        .button img {
            width: 18px;
            height: 18px;
            opacity: 0.8;
        }
        .ai-input-container {
            display: flex;
            flex-direction: column;
            gap: var(--padding-3);
        }
        .loading-spinner {
            width: 24px;
            height: 24px;
            border: 3px solid var(--fg-accent);
            border-radius: 50%;
            border-top-color: var(--bg-accent);
            animation: spin 0.8s linear infinite;
            margin: calc(var(--padding-3) - 2px);
        }
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
        .suggestion-preview {
            margin: var(--padding-3) 0;
            padding: var(--padding-3);
            background: var(--bg-2);
            border-radius: var(--radius);
            border: 1px solid var(--bg-3);
        }
        .preview-label {
            font-size: 14px;
            color: var(--fg-2);
            margin-bottom: var(--padding-2);
        }
        .primary-button {
            background: transparent;
            color: var(--fg-accent);
            border: none;
            font-weight: 600;
        }
        .primary-button:hover {
            background: var(--bg-accent);
            border: none;
        }
        .katex-html {
            display: none;
        }
        .inner-buttons {
            padding: var(--padding-3);
        }
        .inner-buttons:hover {
            background-color: var(--bg-2);
        }
        .inner-buttons img {
            width: 22px;
            height: 22px;
            filter: var(--themed-svg);
        }
    `;

    static properties = {
        _latex: { type: String, state: true },
        error: { type: String },
        _showDialog: { type: Boolean, state: true },
        _showAiInput: { type: Boolean, state: true },
        _showCodeEditor: { type: Boolean, state: true },
        _isLoading: { type: Boolean, state: true },
        _aiSuggestion: { type: String, state: true },
        _showAiSuggestion: { type: Boolean, state: true },
    };

    constructor() {
        super();
        this._latex = '\\sum_{i=1}^n i = \\frac{n(n+1)}{2}';
        this.backup = '';
        this.error = '';
        this._showDialog = false;
        this._showAiInput = false;
        this._showCodeEditor = false;
        this._isLoading = false;
        this._aiSuggestion = '';
        this._showAiSuggestion = false;
    }

    setValue(identifier, value) {
        if (!value || typeof value !== 'object') return;

        if (value.latex !== undefined) {
            this._latex = value.latex;
            this.backup = value.latex;
        }

        this.requestUpdate();
        this.updateLatex();
    }

    getValue() {
        var value = {
            latex: this._latex,
        };
        return value;
    }

    getTextContent() {
        return {
            html: '',
            text: '',
            markdown: '$$\n' + this._latex + '\n$$',
        };
    }

    sendUpdates() {
        setTimeout(() => {
            wisk.editor.justUpdates(this.id);
        }, 0);
    }

    async renderLatex() {
        const container = this.shadowRoot.querySelector('.latex-display');
        if (!container) return;
        try {
            await katexReady;
            container.innerHTML = '';
            // Use AI suggestion for preview if it exists, otherwise use current latex
            const latexToRender = this._showAiSuggestion && this._aiSuggestion ? this._aiSuggestion : this._latex;
            window.katex.render(latexToRender, container, {
                throwOnError: false,
                displayMode: true,
            });
            this.error = '';
        } catch (e) {
            console.error('LaTeX Error:', e);
            this.error = `LaTeX Error: ${e.message}`;
        }
    }

    async handleEdit() {
        this._showAiInput = true;
        this._showCodeEditor = false;

        await this.requestUpdate();
        const textarea = this.shadowRoot.querySelector('.ai-input');
        if (textarea) {
            textarea.focus();
        }
    }

    async handleAiUpdate() {
        try {
            this._isLoading = true;
            this.requestUpdate();

            var user = await document.querySelector('auth-component').getUserInfo();
            var token = user.token;

            const aiPrompt = this.shadowRoot.querySelector('.ai-input').value;

            const response = await fetch(wisk.editor.backendUrl + '/v2/plugins/latex', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    command: aiPrompt,
                    latex: this._latex,
                }),
            });

            this._isLoading = false;

            if (response.status !== 200) {
                wisk.utils.showToast('Error updating LaTeX', 5000);
                return;
            }

            var latexContent = await response.text();

            let inCodeBlock = false;
            const lines = latexContent.split('\n');
            const contentLines = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Toggle code block state when we hit any ``` marker
                if (line.includes('```')) {
                    inCodeBlock = !inCodeBlock;
                    continue;
                }

                // Only keep lines that are NOT in code blocks
                if (inCodeBlock) {
                    contentLines.push(line);
                }
            }

            latexContent = contentLines.join('\n');

            // if ``` is still present, replace it with empty string
            latexContent = latexContent.replace(/```/g, '');

            this._aiSuggestion = latexContent;
            this._showAiSuggestion = true;
            this.requestUpdate();
        } catch (error) {
            console.error('Error:', error);
            wisk.utils.showToast('Error updating LaTeX', 5000);
            this._isLoading = false;
            this.requestUpdate();
        }
    }

    handleShowCodeEditor() {
        this._showCodeEditor = true;
        this._showAiInput = false;
    }

    handleSave() {
        const textarea = this.shadowRoot.querySelector('.code-editor');
        if (textarea) {
            this._latex = textarea.value;
        }
        this._showAiInput = false;
        this._showCodeEditor = false;
        this.sendUpdates();
        this.requestUpdate();
        this.renderLatex();
    }

    handleCancel() {
        this._showAiInput = false;
        this._showCodeEditor = false;
        this._showAiSuggestion = false;
        this._aiSuggestion = '';
    }

    handleAcceptAiChanges() {
        this._latex = this._aiSuggestion;
        this.backup = this._aiSuggestion;
        this._showAiSuggestion = false;
        this._showAiInput = false;
        this.sendUpdates();
        this.requestUpdate();
        this.renderLatex();
    }

    updated() {
        this.renderLatex();
    }

    updateLatex() {
        const codeEditor = this.shadowRoot.querySelector('.code-editor');
        if (codeEditor) {
            this._latex = codeEditor.value;
            this.renderLatex();
            this.requestUpdate();
        }
    }

    handleReset() {
        this._latex = this.backup;
        this.requestUpdate();
        this.renderLatex();
    }

    handleRejectAiChanges() {
        this._showAiSuggestion = false;
        this._aiSuggestion = '';
    }

    render() {
        return html`
            <div class="latex-container">
                <div class="latex-display"></div>
                ${this.error ? html`<div class="error">${this.error}</div>` : ''}
                <button class="button edit-button" style="${wisk.editor.readonly ? 'display: none;' : ''}" @click=${this.handleEdit}>
                    <img src="/a7/plugins/latex-element/pencil.svg" alt="Edit" style="filter: var(--themed-svg);" />
                </button>
            </div>

            ${this._showAiInput
                ? html`
                      <div class="dialog">
                          <div class="ai-input-container">
                              <textarea
                                  class="ai-input"
                                  placeholder="Ask AI for any changes ..."
                                  ?disabled=${this._isLoading || this._showAiSuggestion}
                              ></textarea>
                              <div class="dialog-buttons">
                                  ${this._isLoading
                                      ? html`<div class="loading-spinner"></div>`
                                      : this._showAiSuggestion
                                        ? html`
                                              <button @click=${this.handleRejectAiChanges} class="button inner-buttons">
                                                  <img src="/a7/plugins/latex-element/discard.svg" alt="Discard" />
                                                  Discard
                                              </button>
                                              <button class="primary-button button inner-buttons" @click=${this.handleAcceptAiChanges}>
                                                  <img src="/a7/plugins/latex-element/accept.svg" alt="Accept" style="filter: var(--accent-svg);" />
                                                  Accept
                                              </button>
                                          `
                                        : html`
                                              <button class="button" @click=${this.handleCancel}>Cancel</button>
                                              <div style="flex: 1"></div>
                                              <button class="button inner-buttons" @click=${this.handleShowCodeEditor}>
                                                  <img src="/a7/plugins/latex-element/code.svg" alt="Code" />
                                              </button>
                                              <button class="button primary-button inner-buttons" @click=${this.handleAiUpdate}>
                                                  <img src="/a7/plugins/latex-element/up.svg" alt="AI" />
                                              </button>
                                          `}
                              </div>
                          </div>
                      </div>
                  `
                : ''}
            ${this._showCodeEditor
                ? html`
                      <div class="dialog">
                          <textarea class="code-editor" .value=${this._latex} @input=${this.updateLatex}></textarea>
                          <div class="dialog-buttons">
                              <button class="button inner-buttons" @click=${this.handleReset}>Reset</button>
                              <button class="button inner-buttons" @click=${this.handleCancel}>Cancel</button>
                              <button class="button inner-buttons primary-button" @click=${this.handleSave}>Save</button>
                          </div>
                      </div>
                  `
                : ''}
        `;
    }
}

customElements.define('latex-element', LatexElement);
