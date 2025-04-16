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

class PythonCodeBlock extends LitElement {
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
            gap: var(--gap-2);
        }
        .controls {
            display: flex;
            gap: var(--gap-2);
            align-items: flex-start;
        }
        textarea {
            width: 100%;
            min-height: 200px;
            outline: none;
            font-family: var(--font-mono);
            padding: 0;
            background-color: transparent;
            color: var(--fg-1);
            border: none;
            resize: vertical;
            tab-size: 4;
        }
        .op {
            border: 1px solid var(--border-1);
            border-radius: var(--radius-large);
            background: var(--bg-1);
            padding: var(--padding-4);
        }
        .output {
            padding: var(--padding-4);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background: var(--bg-2);
            font-family: var(--font-mono);
            white-space: pre-wrap;
            display: none;
        }
        .output.has-content {
            display: block;
        }
        .error {
            color: var(--fg-red);
        }
        .success {
            color: var(--fg-green);
        }
        .btn {
            padding: var(--padding-w1);
            background: var(--bg-2);
            color: var(--fg-1);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            cursor: pointer;
            font-size: 14px;
        }
        .dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: var(--bg-1);
            padding: var(--padding-4);
            border: 1px solid var(--border-1);
            filter: var(--drop-shadow);
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
            background-color: var(--bg-3);
            opacity: 0.5;
            z-index: 999;
        }
        input {
            outline: none;
            border: 1px solid var(--border-1);
            padding: var(--padding-w1);
            border-radius: var(--radius);
            background: transparent;
            color: var(--fg-1);
        }
        .btnx {
            background: var(--bg-2);
            color: var(--fg-1);
            border-radius: 200px;
            border: 1px solid var(--border-1);
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            padding: var(--padding-3);
        }
    `;

    static properties = {
        code: { type: String },
        output: { type: String },
        outputType: { type: String },
        showDialog: { type: Boolean },
        packageName: { type: String },
        isInitializing: { type: Boolean },
        importedPackages: { type: Array },
    };

    constructor() {
        super();
        this.code = '';
        this.output = '';
        this.outputType = '';
        this.showDialog = false;
        this.packageName = '';
        this.isInitializing = false;
        this.importedPackages = [];

        this.initializePyodide();
    }

    async initializePyodide() {
        this.isInitializing = true;
        try {
            const pyodide = await pyodideReady;
            this.pyodide = pyodide;
            this.isInitializing = false;
            if (this.code) {
                this.executeCode();
            }
        } catch (error) {
            this.output = `Error initializing Pyodide: ${error}`;
            this.outputType = 'error';
            this.isInitializing = false;
        }
        this.requestUpdate();
    }

    async importPackage() {
        if (!this.pyodide) {
            this.output = 'Pyodide is not initialized yet';
            this.outputType = 'error';
            return;
        }

        const packageName = this.packageName.trim();
        if (!packageName) {
            this.output = 'Please enter a package name';
            this.outputType = 'error';
            return;
        }

        if (this.importedPackages.includes(packageName)) {
            this.output = `Package ${packageName} is already imported`;
            this.outputType = 'success';
            this.showDialog = false;
            return;
        }

        try {
            await this.pyodide.loadPackage('micropip');
            const micropip = this.pyodide.pyimport('micropip');
            await micropip.install(packageName);

            this.importedPackages = [...this.importedPackages, packageName];
            this.output = `Successfully imported ${packageName}`;
            this.outputType = 'success';
            this.showDialog = false;
            this.packageName = '';

            if (wisk?.editor?.justUpdates) {
                wisk.editor.justUpdates(this.id);
            }
        } catch (error) {
            this.output = `Error importing ${packageName}: ${error}`;
            this.outputType = 'error';
        }

        this.requestUpdate();
    }

    handleCodeChange(e) {
        this.code = e.target.value;
        if (wisk?.editor?.justUpdates) {
            wisk.editor.justUpdates(this.id);
        }
    }

    async executeCode() {
        if (!this.pyodide) {
            this.output = 'Pyodide is not initialized yet';
            this.outputType = 'error';
            return;
        }

        try {
            this.pyodide.runPython(`
                import sys
                import io
                sys.stdout = io.StringIO()
            `);

            const result = this.pyodide.runPython(this.code);
            const stdout = this.pyodide.runPython('sys.stdout.getvalue()');

            this.output = stdout || (result !== undefined ? `Return value: ${result}` : '');
            this.outputType = 'success';

            this.pyodide.runPython('sys.stdout = sys.__stdout__');
        } catch (error) {
            this.output = `${error}`;
            this.outputType = 'error';
        }

        this.requestUpdate();
    }

    async setValue(identifier, value) {
        if (!value || typeof value !== 'object') return;

        const shouldExecute = value.code !== this.code;

        if (value.code !== undefined) this.code = value.code;
        if (value.importedPackages !== undefined) {
            this.importedPackages = value.importedPackages;
            if (this.pyodide) {
                for (const pkg of value.importedPackages) {
                    try {
                        await this.pyodide.loadPackage('micropip');
                        const micropip = this.pyodide.pyimport('micropip');
                        await micropip.install(pkg);
                    } catch (error) {
                        console.error(`Error reimporting package ${pkg}:`, error);
                    }
                }
            }
        }

        this.requestUpdate();

        if (shouldExecute && this.code) {
            await new Promise(resolve => setTimeout(resolve, 100));
            await this.executeCode();
        }
    }

    getValue() {
        return {
            code: this.code,
            importedPackages: this.importedPackages,
        };
    }

    handleTabKey(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = e.target;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const spaces = '    ';
            const newValue = textarea.value.substring(0, start) + spaces + textarea.value.substring(end);
            textarea.value = newValue;
            this.code = newValue;
            textarea.selectionStart = textarea.selectionEnd = start + 4;

            if (wisk?.editor?.justUpdates) {
                wisk.editor.justUpdates(this.id);
            }
        }
    }

    render() {
        return html`
            <div class="op">
                <div class="controls">
                    <button
                        class="btn"
                        @click=${() => {
                            this.showDialog = true;
                            this.requestUpdate();
                        }}
                    >
                        Import Package
                    </button>
                    <div style="flex: 1;"></div>
                    <button class="btn btnx" @click=${this.executeCode}>
                        <img src="/a7/plugins/nightwave-plaza/play.svg" style="width: 26px; height: 26px; filter: var(--themed-svg);" alt="Run" />
                    </button>
                </div>

                <textarea
                    @input=${this.handleCodeChange}
                    @keydown=${this.handleTabKey}
                    .value=${this.code}
                    spellcheck="false"
                    placeholder="print('Hello, World!')"
                ></textarea>

                <div class="output ${this.output ? 'has-content' : ''} ${this.outputType}">${this.output}</div>
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
                                  class="btn"
                                  @click=${() => {
                                      this.showDialog = false;
                                      this.requestUpdate();
                                  }}
                              >
                                  Cancel
                              </button>
                              <button class="btn" @click=${this.importPackage}>Import</button>
                          </div>
                      </div>
                  `
                : ''}
        `;
    }
}

customElements.define('python-code-block', PythonCodeBlock);
