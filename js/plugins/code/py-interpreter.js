import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

// Global promise for Pyodide initialization
var pyodideReady = new Promise(resolve => {
    if (window.pyodide) {
        resolve(window.pyodide);
        return;
    }
    if (!document.querySelector('script[src*="pyodide"]')) {
        const pyodideScript = document.createElement('script');
        pyodideScript.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
        pyodideScript.onload = async () => {
            window.pyodide = await loadPyodide();
            resolve(window.pyodide);
        };
        document.head.appendChild(pyodideScript);
    }
});

class PyInterpreter extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            font-size: 14px;
            color: var(--fg-1);
            user-select: text;
        }
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        #history {
            flex-grow: 1;
            overflow-y: auto;
            padding: var(--padding-4) 0;
            /*height: 400px;*/
            border-radius: var(--radius);
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            position: relative;
            border-bottom: none;
        }
        .history-item {
            font-family: var(--font-mono);
        }
        .input {
            color: #0000ff;
        }
        .output {
            color: #006400;
        }
        .error {
            color: #ff0000;
        }
        textarea {
            width: 100%;
            outline: none;
            font-family: var(--font-mono);
            padding: var(--padding-4);
            background-color: transparent;
            color: var(--fg-1);
            border: none;
            resize: vertical;
            tab-size: 4;
        }
        button {
            user-select: none;
        }
        .dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: var(--bg-1);
            padding: var(--padding-4);
            z-index: 1000;
            border-radius: var(--radius-large);
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            width: 100%;
            max-width: 400px;
        }
        .dialog-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--fg-2);
            opacity: 0.3;
            z-index: 999;
        }
        pre {
            font-family: var(--font-mono);
        }
        button {
            outline: none;
            border: none;
            background: var(--bg-1);
            color: var(--fg-1);
            padding: var(--padding-w2);
            border-radius: var(--radius);
            font-weight: 500;
            cursor: pointer;
        }
        input {
            outline: none;
            border: 1px solid var(--border-1);
            padding: var(--padding-w1);
            border-radius: var(--radius);
            background: transparent;
            color: var(--fg-1);
        }
        #cancel {
            color: var(--fg-1);
        }
        #import {
            border: 1px solid var(--border-1);
            color: var(--bg-1);
            background: var(--fg-1);
        }
        .uwu {
            display: flex;
            border-radius: var(--radius-large);
            overflow: hidden;
            background: var(--bg-2);
            align-items: center;
        }
        #run {
            padding: var(--padding-w2);
            background: transparent;
        }
        #run:hover {
            background: var(--bg-1);
        }
        .input {
            padding: var(--padding-w2);
            background-color: var(--bg-2);
        }
        .input pre {
            color: var(--fg-2);
        }
        .output {
            padding: var(--padding-w2);
            background-color: var(--bg-2);
        }
        .output pre {
            color: var(--fg-1);
        }
        .input,
        .output {
            border-radius: var(--radius);
            margin-bottom: var(--gap-3);
        }
        .input + .output {
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            margin-top: calc(var(--gap-3) * -1);
        }
        .input:has(+ .output) {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            border-bottom: none;
        }
        .error {
            padding: var(--padding-w2);
            border-radius: var(--radius);
            margin-bottom: var(--gap-3);
            background-color: var(--bg-red);
        }
        .error pre {
            color: var(--fg-red);
        }
        .btn {
            background: var(--bg-3);
            color: var(--fg-1);
            border-radius: var(--radius);
            border: none;
            cursor: pointer;
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
    `;

    static properties = {
        code: { type: String },
        history: { type: Array },
        showDialog: { type: Boolean },
        packageName: { type: String },
        isInitializing: { type: Boolean },
    };

    constructor() {
        super();
        this.code = 'print("Hello, World!")';
        this.history = [];
        this.showDialog = false;
        this.packageName = '';
        this.isInitializing = true;
        this.importedPackages = [];
        this.pendingHistory = [];
    }

    handleTabKey(e) {
        if (e.key === 'Tab') {
            e.preventDefault();

            const textarea = e.target;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            // Insert 4 spaces at cursor position
            const spaces = '    ';
            const newValue = textarea.value.substring(0, start) + spaces + textarea.value.substring(end);

            // Update the textarea value
            textarea.value = newValue;
            this.code = newValue;

            // Move cursor after the inserted spaces
            textarea.selectionStart = textarea.selectionEnd = start + 4;
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.initializePyodide();
    }

    async initializePyodide() {
        this.addToHistory('Initializing Pyodide...', 'output');

        try {
            const pyodide = await pyodideReady;
            this.pyodide = pyodide;
            this.isInitializing = false;
            this.addToHistory('Pyodide initialized and ready!', 'output');

            // Process any pending imports and history
            await this.processPendingImports();
            await this.processPendingHistory();
        } catch (error) {
            this.addToHistory(`Error initializing Pyodide: ${error}`, 'error');
            this.isInitializing = false;
        }

        this.requestUpdate();
    }

    async processPendingImports() {
        if (this.importedPackages.length === 0) return;

        await this.pyodide.loadPackage('micropip');
        const micropip = this.pyodide.pyimport('micropip');

        for (const pkg of this.importedPackages) {
            try {
                await micropip.install(pkg);
                this.addToHistory(`Imported package: ${pkg}`, 'output');
            } catch (error) {
                this.addToHistory(`Error importing ${pkg}: ${error}`, 'error');
            }
        }
    }

    async processPendingHistory() {
        if (this.pendingHistory.length === 0) return;

        for (const item of this.pendingHistory) {
            if (item.type === 'input') {
                this.addToHistory(item.content, 'input');
                await this.executePythonCode(item.content);
            }
        }
        this.pendingHistory = [];
    }

    addToHistory(content, type) {
        this.history = [...this.history, { content, type }];
        this.requestUpdate();
        this.updateComplete.then(() => {
            const history = this.shadowRoot.getElementById('history');
            if (history) history.scrollTop = history.scrollHeight;
        });
    }

    async executePythonCode(code) {
        if (!this.pyodide) {
            this.addToHistory('Pyodide is not initialized yet', 'error');
            return;
        }

        try {
            this.pyodide.runPython(`
                import sys
                import io
                sys.stdout = io.StringIO()
            `);

            const result = this.pyodide.runPython(code);
            const stdout = this.pyodide.runPython('sys.stdout.getvalue()');

            if (stdout) {
                this.addToHistory(stdout.trim(), 'output');
            }

            if (result !== undefined && result !== null) {
                this.addToHistory(`Return value: ${result}`, 'output');
            }

            this.pyodide.runPython('sys.stdout = sys.__stdout__');
        } catch (error) {
            this.addToHistory(`${error}`, 'error');
        }
    }

    async setValue(identifier, value) {
        if (!value || typeof value !== 'object') return;

        if (value.code !== undefined) this.code = value.code;
        if (value.importedPackages !== undefined) this.importedPackages = value.importedPackages;

        if (value.history !== undefined) {
            if (this.pyodide) {
                this.history = [];
                for (const item of value.history) {
                    if (item.type === 'input') {
                        this.addToHistory(item.content, 'input');
                        await this.executePythonCode(item.content);
                    }
                }
            } else {
                this.pendingHistory = value.history;
            }
        }

        this.requestUpdate();
    }

    getValue() {
        return {
            code: this.code,
            history: this.history,
            importedPackages: this.importedPackages,
        };
    }

    async importPackage() {
        if (!this.pyodide) {
            this.addToHistory('Pyodide is not initialized yet', 'error');
            return;
        }

        const packageName = this.packageName.trim();
        if (!packageName) {
            this.addToHistory('Please enter a package name', 'error');
            return;
        }

        if (this.importedPackages.includes(packageName)) {
            this.addToHistory(`Package ${packageName} is already imported`, 'output');
            this.showDialog = false;
            return;
        }

        try {
            await this.pyodide.loadPackage('micropip');
            const micropip = this.pyodide.pyimport('micropip');
            await micropip.install(packageName);

            this.importedPackages.push(packageName);
            this.addToHistory(`Successfully imported ${packageName}`, 'output');
            this.showDialog = false;
            this.packageName = '';

            if (wisk?.editor?.justUpdates) {
                wisk.editor.justUpdates(this.id);
            }
        } catch (error) {
            this.addToHistory(`Error importing ${packageName}: ${error}`, 'error');
        }

        this.requestUpdate();
    }

    async evaluatePython() {
        if (!this.code.trim()) return;

        if (!this.pyodide) {
            this.addToHistory('Pyodide is not initialized yet', 'error');
            return;
        }

        this.addToHistory(this.code, 'input');
        await this.executePythonCode(this.code);

        this.code = '';
        if (wisk?.editor?.justUpdates) {
            wisk.editor.justUpdates(this.id);
        }

        const textarea = this.shadowRoot.querySelector('textarea');
        if (textarea) textarea.value = '';

        this.requestUpdate();
    }

    render() {
        return html`
            <div id="history">
                ${this.history.map(
                    item => html`
                        <div class="history-item ${item.type}">
                            <pre>${item.content}</pre>
                        </div>
                    `
                )}
                <div style="padding: var(--padding-w1); display: flex; justify-content: center; gap: 10px">
                    <button
                        class="btn"
                        @click=${() => {
                            this.history = [];
                            this.requestUpdate();
                            if (wisk?.editor?.justUpdates) {
                                wisk.editor.justUpdates(this.id);
                            }
                        }}
                        style="${wisk.editor.readonly ? 'display: none;' : ''}"
                    >
                        Clear History
                    </button>
                    <button
                        class="btn"
                        @click=${() => {
                            this.showDialog = true;
                            this.requestUpdate();
                        }}
                        style="${wisk.editor.readonly ? 'display: none;' : ''}"
                    >
                        Import Package
                    </button>
                </div>
            </div>
            <div class="uwu" style="${wisk.editor.readonly ? 'display: none;' : ''}">
                <textarea
                    placeholder="print('hello world')"
                    rows="2"
                    @input=${e => (this.code = e.target.value)}
                    @keydown=${this.handleTabKey}
                    .value=${this.code}
                    spellcheck="false"
                ></textarea>
                <button
                    id="run"
                    @click=${this.evaluatePython}
                    ?disabled=${this.isInitializing}
                    style="${wisk.editor.readonly ? 'display: none;' : ''}"
                >
                    ${this.isInitializing ? 'Initializing...' : 'Run'}
                </button>
            </div>
            ${this.showDialog
                ? html`
                      <div
                          class="dialog-backdrop"
                          @click=${() => {
                              this.showDialog = false;
                              this.requestUpdate();
                          }}
                      ></div>
                      <div class="dialog">
                          <h3>Import Package</h3>
                          <input
                              placeholder="Enter package name"
                              @input=${e => {
                                  this.packageName = e.target.value;
                                  this.requestUpdate();
                              }}
                              .value=${this.packageName}
                          />
                          <div style="display: flex; gap: var(--gap-3); justify-content: flex-end;">
                              <button
                                  id="cancel"
                                  @click=${() => {
                                      this.showDialog = false;
                                      this.requestUpdate();
                                  }}
                              >
                                  Cancel
                              </button>
                              <button id="import" @click=${this.importPackage}>Import</button>
                          </div>
                      </div>
                  `
                : ''}
        `;
    }
}

customElements.define('py-interpreter', PyInterpreter);
