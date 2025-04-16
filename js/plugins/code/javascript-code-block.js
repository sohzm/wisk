import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class JavaScriptCodeBlock extends LitElement {
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
            position: relative;
        }
        .output {
            padding: var(--padding-4);
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
            background: var(--bg-3);
        }
        .success {
            color: var(--fg-1);
            background: var(--bg-3);
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
            position: absolute;
            top: 10px;
            right: 10px;
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
        output: { type: String },
        outputType: { type: String },
    };

    constructor() {
        super();
        this.code = '';
        this.output = '';
        this.outputType = '';
    }

    handleCodeChange(e) {
        this.code = e.target.value;
        if (wisk?.editor?.justUpdates) {
            wisk.editor.justUpdates(this.id);
        }
    }

    executeCode() {
        try {
            const originalConsoleLog = console.log;
            let output = '';

            console.log = (...args) => {
                output += args.join(' ') + '\n';
            };

            const result = eval(this.code);
            console.log = originalConsoleLog;

            this.output = output + (result !== undefined ? `Return value: ${result}` : '');
            this.outputType = 'success';
        } catch (error) {
            this.output = `${error}`;
            this.outputType = 'error';
        }

        this.requestUpdate();
    }

    setValue(identifier, value) {
        if (!value || typeof value !== 'object') return;

        const shouldExecute = value.code !== this.code;

        if (value.code !== undefined) {
            this.code = value.code;
        }

        this.requestUpdate();

        if (shouldExecute && this.code) {
            setTimeout(() => this.executeCode(), 100);
        }
    }

    getValue() {
        return {
            code: this.code,
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
                <button
                    class="btn btnx"
                    @click=${() => {
                        if (wisk.editor.readonly) return;
                        this.executeCode();
                    }}
                >
                    <img src="/a7/plugins/nightwave-plaza/play.svg" style="width: 26px; height: 26px; filter: var(--themed-svg);" alt="Run" />
                </button>

                <textarea
                    @input=${this.handleCodeChange}
                    @keydown=${this.handleTabKey}
                    .value=${this.code}
                    spellcheck="false"
                    placeholder="console.log('Hello, World!')"
                    ${wisk.editor.readonly ? 'readonly' : ''}
                ></textarea>

                <div class="output ${this.output ? 'has-content' : ''} ${this.outputType}">${this.output}</div>
            </div>
        `;
    }
}

customElements.define('javascript-code-block', JavaScriptCodeBlock);
