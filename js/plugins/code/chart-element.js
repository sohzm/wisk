import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

var chartjsReady = new Promise(resolve => {
    if (window.Chart) {
        resolve();
        return;
    }
    if (!document.querySelector('script[src*="chart.js"]')) {
        const chartScript = document.createElement('script');
        chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        chartScript.onload = () => resolve();
        document.head.appendChild(chartScript);
    }
});

class ChartElement extends LitElement {
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
        .chart-container {
            border-radius: var(--radius);
            padding: var(--padding-4);
            font-size: 16px;
            background: var(--bg-1);
        }
        .chart-container:hover {
            background: var(--bg-2);
        }
        canvas {
            width: 100% !important;
            height: 400px !important;
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
        .button img {
            width: 18px;
            height: 18px;
            opacity: 0.8;
        }
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
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
        .input-row {
            display: flex;
            gap: var(--padding-3);
            align-items: flex-start;
        }
        select {
            padding: var(--padding-3);
            background: var(--bg-2);
            color: var(--fg-1);
            border: 1px solid var(--bg-3);
            border-radius: var(--radius);
            outline: none;
            min-width: 120px;
        }
    `;

    static properties = {
        _chartConfig: { type: String, state: true },
        error: { type: String },
        _showDialog: { type: Boolean, state: true },
        _theme: { type: Object, state: true },
        _showAiInput: { type: Boolean, state: true },
        _showCodeEditor: { type: Boolean, state: true },
        _isLoading: { type: Boolean, state: true },
        _aiSuggestion: { type: String, state: true },
        _showAiSuggestion: { type: Boolean, state: true },
        _selectedType: { type: String, state: true },
    };

    async getBase64Png() {
        var b64 = await this._chart.toBase64Image();
        return b64;
    }

    constructor() {
        super();
        this._chartConfig = JSON.stringify(
            {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'Dataset',
                            data: [12, 19, 3, 5, 2, 3],
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                },
            },
            null,
            2
        );
        this.backup = this._chartConfig;
        this.error = '';
        this._showDialog = false;
        this._theme = wisk.theme.getThemeData(wisk.theme.getTheme());
        this._showAiInput = false;
        this._showCodeEditor = false;
        this._isLoading = false;
        this._aiSuggestion = '';
        this._showAiSuggestion = false;
        this._selectedType = 'line';
        this._chart = null;
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

            var response = await fetch(wisk.editor.backendUrl + '/v2/plugins/chartjs', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    command: aiPrompt,
                    chartjs: this._chartConfig,
                    type: this._selectedType,
                }),
            });

            this._isLoading = false;

            if (response.status !== 200) {
                wisk.utils.showToast('Error updating chart', 5000);
                return;
            }

            var chartContent = await response.text();

            let inCodeBlock = false;
            const lines = chartContent.split('\n');
            const contentLines = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes('```')) {
                    inCodeBlock = !inCodeBlock;
                    continue;
                }
                if (inCodeBlock) {
                    contentLines.push(line);
                }
            }

            chartContent = contentLines.join('\n');
            chartContent = chartContent.replace(/```/g, '');

            this._aiSuggestion = chartContent;
            this._showAiSuggestion = true;
            this.requestUpdate();
            this.renderChart();
        } catch (error) {
            console.error('Error:', error);
            wisk.utils.showToast('Error updating chart', 5000);
            this._isLoading = false;
            this.requestUpdate();
        }
    }

    handleShowCodeEditor() {
        this._showCodeEditor = true;
        this._showAiInput = false;
    }

    handleAcceptAiChanges() {
        this._chartConfig = this._aiSuggestion;
        this.backup = this._aiSuggestion;
        this._showAiSuggestion = false;
        this._showAiInput = false;
        this.sendUpdates();
        this.requestUpdate();
        this.renderChart();
    }

    handleRejectAiChanges() {
        this._showAiSuggestion = false;
        this._aiSuggestion = '';
        this.renderChart();
    }

    handleCancel() {
        this._showAiInput = false;
        this._showCodeEditor = false;
        this._showAiSuggestion = false;
        this._aiSuggestion = '';
    }

    async renderChart() {
        const canvas = this.shadowRoot.querySelector('canvas');
        if (!canvas) return;

        try {
            await chartjsReady;

            const config = JSON.parse(this._showAiSuggestion ? this._aiSuggestion : this._chartConfig);

            if (this._chart) {
                this._chart.destroy();
            }

            this._chart = new window.Chart(canvas, {
                ...config,
                options: {
                    ...config.options,
                    responsive: true,
                    maintainAspectRatio: false,
                },
            });

            this.error = '';
        } catch (e) {
            console.error('Chart Error:', e);
            this.error = `Chart Error: ${e.message}`;
            if (this._chart) {
                this._chart.destroy();
                this._chart = null;
            }
        }
    }

    setValue(identifier, value) {
        if (!value || typeof value !== 'object') return;

        if (value.chartConfig !== undefined) {
            this._chartConfig = value.chartConfig;
            this.backup = value.chartConfig;
        }

        this.requestUpdate();
        this.updateChart();
    }

    getValue() {
        return {
            chartConfig: this._chartConfig,
        };
    }

    getTextContent() {
        return {
            html: '',
            text: '',
            markdown: '```json\n' + this._chartConfig + '\n```',
        };
    }

    sendUpdates() {
        setTimeout(() => {
            wisk.editor.justUpdates(this.id);
        }, 0);
    }

    handleSave() {
        const textarea = this.shadowRoot.querySelector('.code-editor');
        if (textarea) {
            this._chartConfig = textarea.value;
        }
        this._showDialog = false;
        this._showCodeEditor = false;
        this.sendUpdates();
        this.requestUpdate();
        this.renderChart();
    }

    handleReset() {
        this._chartConfig = this.backup;
        this.requestUpdate();
        this.renderChart();
    }

    updated() {
        this.renderChart();
    }

    updateChart() {
        const codeEditor = this.shadowRoot.querySelector('.code-editor');
        if (codeEditor) {
            this._chartConfig = codeEditor.value;
            this.renderChart();
            this.requestUpdate();
        }
    }

    handleTypeChange(e) {
        this._selectedType = e.target.value;
    }

    render() {
        return html`
            <div class="chart-container">
                <canvas></canvas>
                ${this.error ? html`<div class="error">${this.error}</div>` : ''}
                <button class="button edit-button" style="${wisk.editor.readonly ? 'display: none;' : ''}" @click=${this.handleEdit}>
                    <img src="/a7/plugins/latex-element/pencil.svg" alt="Edit" style="filter: var(--themed-svg);" />
                </button>
            </div>

            ${this._showAiInput
                ? html`
                      <div class="dialog">
                          <div class="ai-input-container">
                              <div class="input-row">
                                  <textarea
                                      class="ai-input"
                                      placeholder="Ask AI for any changes ..."
                                      ?disabled=${this._isLoading || this._showAiSuggestion}
                                      style="flex: 1;"
                                  ></textarea>
                              </div>
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

                                              <select
                                                  .value=${this._selectedType}
                                                  @change=${this.handleTypeChange}
                                                  ?disabled=${this._isLoading || this._showAiSuggestion}
                                              >
                                                  <option value="line">Line Chart</option>
                                                  <option value="bar">Bar Chart</option>
                                                  <option value="pie">Pie Chart</option>
                                                  <option value="doughnut">Doughnut Chart</option>
                                                  <option value="radar">Radar Chart</option>
                                                  <option value="scatter">Scatter Plot</option>
                                              </select>
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
                          <textarea class="code-editor" .value=${this._chartConfig} @input=${this.updateChart}></textarea>
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

customElements.define('chart-element', ChartElement);
