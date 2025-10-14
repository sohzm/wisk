import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class GettingStarted extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
            user-select: none;
            outline: none;
            transition: all 0.3s ease;
        }

        #getting-started {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
        }

        .button {
            padding: var(--padding-w2);
            border-radius: 100px;
            background-color: var(--bg-accent);
            border: none;
            color: var(--fg-accent);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--gap-2);
            font-size: 15px;
        }

        .button img {
            width: 20px;
            filter: var(--accent-svg);
        }

        .button:hover {
            background-color: var(--bg-2);
        }

        #tip {
            color: var(--fg-2);
            pointer-events: none;
            font-size: 0.9rem;
        }

        .dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--fg-2);
            opacity: 0.3;
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 999;
        }

        .dialog-content {
            background: var(--bg-1);
            padding: var(--padding-4);
            border-radius: var(--radius-large);
            max-width: 669px; /* nice */
            max-height: min(700px, 90%);
            width: 90%;
            position: absolute;
            z-index: 1000;
            opacity: 1;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
        }

        .dialog-close {
            position: absolute;
            top: var(--padding-3);
            right: var(--padding-3);
            display: flex;
            width: 24px;
            height: 24px;
            background: none;
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            color: var(--fg-1);
            font-size: 1.5rem;
            align-items: center;
            justify-content: center;
        }

        .dialog-close:hover {
            background: var(--bg-3);
        }

        .dialog-title {
            font-size: 1.5rem;
            margin-bottom: var(--gap-3);
            color: var(--fg-1);
            font-weight: 500;
        }

        .header {
            display: flex;
            flex-direction: row;
            color: var(--fg-1);
            gap: var(--gap-2);
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: calc(20px + var(--gap-3));
        }

        .header-wrapper {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            width: 100%;
        }

        .header-controls {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .header-title {
            font-size: 30px;
            font-weight: 500;
        }

        .icon {
            cursor: pointer;
            transition: transform 0.2s ease;
            width: 22px;
        }

        .main-group {
            overflow-y: auto;
            height: inherit;
            flex: 1;
        }

        .generate-button {
            background: var(--fg-1);
            color: var(--bg-1);
            padding: var(--padding-w2);
            font-weight: 600;
            border: none;
            border-radius: calc(var(--radius-large) * 20);
            border: 2px solid transparent;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
            margin-left: auto;
        }

        .generate-button:hover {
            background-color: transparent;
            border: 2px solid var(--fg-1);
            color: var(--fg-1);
        }

        .generate-button:disabled {
            background-color: var(--bg-3);
            color: var(--fg-2);
            border: 2px solid transparent;
            cursor: not-allowed;
        }

        .drop-zone {
            border-radius: var(--radius);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: var(--bg-3);
            min-height: 200px;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .drop-zone.drag-over {
            border-color: var(--bg-accent);
            background: var(--bg-3);
        }

        .drop-text {
            color: var(--fg-1);
            font-size: 1.1rem;
            margin-bottom: var(--gap-2);
        }

        .supported-formats {
            color: var(--fg-2);
            font-size: 0.9rem;
            margin-bottom: var(--gap-3);
        }

        .selected-file {
            margin-top: var(--gap-3);
            padding: var(--padding-3);
            background: var(--bg-2);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--gap-2);
        }

        .file-info {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            flex: 1;
            min-width: 0;
        }

        .file-icon {
            width: 24px;
            height: 24px;
            filter: var(--themed-svg);
        }

        .file-name {
            color: var(--fg-1);
            font-size: 0.9rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .remove-file {
            background: none;
            border: none;
            padding: var(--padding-1);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius);
        }

        .remove-file:hover {
            background: var(--bg-3);
        }

        .file-size {
            color: var(--fg-2);
            font-size: 0.8rem;
            white-space: nowrap;
        }

        .warning-text {
            color: var(--fg-red);
            font-size: 0.8rem;
        }

        img[src*='/a7/forget/dialog-x.svg'] {
            width: unset;
            height: unset;
            filter: var(--themed-svg);
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
            margin-bottom: var(--gap-3);
        }

        .input-label {
            color: var(--fg-1);
            font-size: 0.9rem;
            font-weight: 500;
        }

        .input-field {
            padding: var(--padding-3);
            background: var(--bg-2);
            border: 2px solid var(--border-1);
            border-radius: var(--radius);
            color: var(--fg-1);
            font-size: 0.9rem;
            resize: none;
            min-height: 200px;
            outline: none;
        }

        .input-field:focus {
            border-color: var(--fg-1);
        }

        .preview-container {
            margin-top: var(--gap-3);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            max-height: 200px;
            overflow-y: auto;
            padding: var(--padding-3);
            background: var(--bg-2);
            color: var(--fg-1);
            font-size: 0.9rem;
            user-select: text;
            display: none;
        }

        .preview-container.shown {
            display: block;
        }

        .loading-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--gap-2);
            color: var(--fg-1);
            font-size: 0.9rem;
            margin: var(--gap-3) 0;
        }

        .spinner {
            width: 18px;
            height: 18px;
            border: 2px solid var(--fg-2);
            border-top-color: var(--bg-accent);
            border-radius: 50%;
            animation: spinner 0.8s linear infinite;
        }

        .gen-div {
            display: flex;
            gap: var(--gap-2);
            margin-top: var(--gap-3);
        }

        .hidden {
            display: none;
        }

        @keyframes spinner {
            to {
                transform: rotate(360deg);
            }
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
        activeDialog: { type: String },
        selectedFile: { type: Object },
        reportQuery: { type: String },
        reportFormat: { type: String },
        reportContent: { type: String },
        isGenerating: { type: Boolean },
        previewVisible: { type: Boolean },
    };

    constructor() {
        super();
        this.tips = [
            'You can use the command palette by pressing Ctrl+Shift+P or Cmd+Shift+P',
            'You can create and install plugins to extend the functionality of your editor',
            'You can create and use custom themes to personalize your editor',
            "When AI Chat gets too long, clear the chat by clicking the Clear Chat button, that'll improve the results",
            "You can autocite your content by selecting text and clicking on the 'Find Sources' button",
            "Generate complete reports with AI by clicking the 'Generate Report' button",
        ].sort(() => Math.random() - 0.5)[0];
        this.activeDialog = null;
        this.selectedFile = null;
        this.reportQuery = '';
        this.reportFormat = 'default';
        this.reportContent = '';
        this.isGenerating = false;
        this.previewVisible = false;
    }

    updated() {
        if (wisk.editor.readonly) return;
    }

    showDialog(type) {
        this.activeDialog = type;
        this.requestUpdate();
    }

    closeDialog() {
        this.activeDialog = null;
        this.reportQuery = '';
        this.reportFormat = 'default';
        this.reportContent = '';
        this.previewVisible = false;
        this.requestUpdate();
    }

    handleBackdropClick(e) {
        // Close the dialog if the click is on the backdrop (not on the dialog content)
        if (e.target.classList.contains('dialog-overlay')) {
            this.closeDialog();
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = e.currentTarget;
        dropZone.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = e.currentTarget;
        dropZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = e.currentTarget;
        dropZone.classList.remove('drag-over');

        const file = e.dataTransfer.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
        e.target.value = '';
    }

    removeFile() {
        this.selectedFile = null;
        this.requestUpdate();
    }

    triggerFileInput() {
        this.shadowRoot.getElementById('fileInput').click();
    }

    processFile(file) {
        const validExtensions = ['.pdf', '.docx', '.md', '.markdown'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();

        if (validExtensions.includes(ext)) {
            this.selectedFile = file;
            this.requestUpdate();
        } else {
            wisk.utils.showToast('Invalid file format', 5000);
        }
    }

    handleQueryChange(e) {
        this.reportQuery = e.target.value;
    }

    async generateReport() {
        if (!this.reportQuery.trim()) {
            wisk.utils.showToast('Please enter a topic for your report', 5000);
            return;
        }

        try {
            this.isGenerating = true;
            this.reportContent = '';
            this.previewVisible = false;
            this.requestUpdate();

            const response = await fetch(wisk.editor.backendUrl + '/v1/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Origin: window.location.origin,
                },
                body: JSON.stringify({
                    query: this.reportQuery,
                    format: this.reportFormat,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate report');
            }

            const data = await response.json();
            this.reportContent = data.report;
            this.previewVisible = true;
            this.requestUpdate();
        } catch (error) {
            console.error('Error generating report:', error);
            wisk.utils.showToast('Error generating report: ' + error.message, 5000);
        } finally {
            this.isGenerating = false;
            this.requestUpdate();
        }
    }

    async importReport() {
        if (!this.reportContent) {
            wisk.utils.showToast('No report content to import', 5000);
            return;
        }

        try {
            wisk.utils.showLoading('Importing report...');

            const elements = wisk.editor.convertMarkdownToElements(this.reportContent);

            for (let i = 0; i < elements.length; i++) {
                if (elements[i].component !== 'main-element') {
                    wisk.editor.createBlockNoFocus('', elements[i].component, elements[i].value);
                } else {
                    document.getElementById('abcdxyz').setValue('', elements[i].value);
                    document.getElementById('abcdxyz').sendUpdates();
                }
            }

            this.closeDialog();
            wisk.utils.showToast('Report imported successfully', 5000);
        } catch (error) {
            console.error('Error importing report:', error);
            wisk.utils.showToast('Error importing report', 5000);
        } finally {
            wisk.utils.hideLoading();
        }
    }

    async importMd() {
        if (!this.selectedFile) {
            wisk.utils.showToast('No file selected', 5000);
            return;
        }

        try {
            wisk.utils.showLoading('Importing markdown...');

            const fileContent = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = e => reject(e);
                reader.readAsText(this.selectedFile);
            });

            const elements = wisk.editor.convertMarkdownToElements(fileContent);
            console.log('----- Elements:', elements);

            for (let i = 0; i < elements.length; i++) {
                if (elements[i].component !== 'main-element') {
                    wisk.editor.createBlockNoFocus('', elements[i].component, elements[i].value);
                } else {
                    document.getElementById('abcdxyz').setValue('', elements[i].value);
                    document.getElementById('abcdxyz').sendUpdates();
                }
            }

            this.closeDialog();
            wisk.utils.showToast('File imported successfully', 5000);
        } catch (error) {
            console.error('Error importing markdown:', error);
            wisk.utils.showToast('Error importing file', 5000);
        } finally {
            wisk.utils.hideLoading();
        }
    }

    renderImportDialog() {
        return html`
            <div class="dialog-content">
                <div class="header">
                    <div class="header-wrapper">
                        <div class="header-controls">
                            <label class="header-title">Import from File</label>
                            <img
                                src="/a7/forget/dialog-x.svg"
                                alt="Close"
                                @click="${this.closeDialog}"
                                class="icon"
                                draggable="false"
                                style="padding: var(--padding-3);"
                            />
                        </div>
                    </div>
                </div>

                <div class="main-group">
                    ${this.selectedFile
                        ? html`
                              <div class="selected-file">
                                  <div class="file-info">
                                      <img src="/a7/forget/gs-import.svg" alt="File" class="file-icon" />
                                      <span class="file-name">${this.selectedFile.name}</span>
                                      <span class="file-size">${this.formatFileSize(this.selectedFile.size)}</span>
                                  </div>
                                  <button class="remove-file" @click=${this.removeFile}>
                                      <img src="/a7/forget/dialog-x.svg" alt="Remove" style="width: 16px; height: 16px; filter: var(--themed-svg)" />
                                  </button>
                              </div>

                              <div style="display: flex; gap: var(--gap-2); margin-top: var(--gap-3)">
                                  <button class="generate-button" @click=${this.importMd}>Import</button>
                              </div>
                          `
                        : html`
                              <div
                                  class="drop-zone"
                                  @dragover=${this.handleDragOver}
                                  @drop=${this.handleDrop}
                                  @dragleave=${this.handleDragLeave}
                                  @click=${this.triggerFileInput}
                              >
                                  <img
                                      src="/a7/forget/gs-import.svg"
                                      alt="Upload"
                                      style="width: 48px; height: 48px; filter: var(--themed-svg); margin-bottom: var(--gap-3)"
                                  />
                                  <p class="drop-text">Drag and drop a markdown file here</p>
                                  <input type="file" id="fileInput" accept=".md,.markdown" style="display: none;" @change=${this.handleFileSelect} />
                              </div>
                          `}

                    <div style="margin-top: var(--gap-3)">
                        <p class="warning-text">Note: Experimental feature, might not work as expected.</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderReportDialog() {
        return html`
            <div class="dialog-content">
                <div class="header">
                    <div class="header-wrapper">
                        <div class="header-controls">
                            <label class="header-title">Draft Anything</label>
                            <img
                                src="/a7/forget/dialog-x.svg"
                                alt="Close"
                                @click="${this.closeDialog}"
                                class="icon"
                                draggable="false"
                                style="padding: var(--padding-3);"
                            />
                        </div>
                    </div>
                </div>

                <div class="main-group">
                    <div class="input-group ${this.previewVisible ? 'hidden' : ''}">
                        <textarea
                            class="input-field"
                            placeholder="${['Prepare an outline for ...', 'Yeah just paste that assignment here', 'Write 500 words report on ...'][
                                Math.floor(Math.random() * 3)
                            ]}"
                            rows="3"
                            .value=${this.reportQuery}
                            @input=${this.handleQueryChange}
                        ></textarea>
                    </div>

                    ${this.isGenerating
                        ? html`
                              <div class="loading-indicator">
                                  <div class="spinner"></div>
                                  <span>Neo is writing, just wait...</span>
                              </div>
                          `
                        : html`
                              <div class="gen-div ${this.previewVisible ? 'hidden' : ''}">
                                  <button class="generate-button" @click=${this.generateReport} ?disabled=${!this.reportQuery.trim()}>
                                      Generate
                                  </button>
                              </div>
                          `}

                    <div class="preview-container ${this.previewVisible ? 'shown' : ''}">
                        <pre style="white-space: pre-wrap; font-family: var(--font);">${this.reportContent}</pre>
                    </div>

                    ${this.reportContent
                        ? html`
                              <div style="display: flex; gap: var(--gap-2); margin-top: var(--gap-3)">
                                  <button class="generate-button" @click=${this.importReport}>Import</button>
                              </div>
                          `
                        : ''}
                </div>
            </div>
        `;
    }

    async pluginPacks(usecase) {
        var plugins = [];
        switch (usecase) {
            case 'student':
                plugins = ['word-count', 'symbols'];
                break;
            case 'student-but-cooler':
                plugins = ['word-count', 'symbols', 'nightwave-plaza-radio', 'brainrot', 'powerlevel'];
                break;
            case 'blog':
                plugins = ['table-of-contents', 'super-divider', 'accordion-element'];
                break;
            default:
                break;
        }

        var str = '';

        for (let i = 0; i < plugins.length; i++) {
            str += wisk.plugins.getPluginGroupDetail(plugins[i]).title + (i < plugins.length - 1 ? ', ' : '');
            await wisk.plugins.loadPlugin(plugins[i]);
            await wisk.editor.addConfigChange('document.config.plugins.add', plugins[i]);
        }

        wisk.utils.showDialog('Installed plugins: ' + str, 'Info');
    }

    render() {
        if (wisk.editor.readonly) {
            return html``;
        }

        return html`
            <div id="getting-started">
                <div style="display: flex; gap: var(--gap-3); flex-wrap: wrap; align-items: center;">
                    Get started with
                    <div style="display: flex; gap: var(--gap-2); flex-wrap: wrap">
                        <button onboarding-template-button class="button" @click=${() => document.querySelector('template-dialog').show()}>
                            <img src="/a7/forget/gs-templates.svg" alt="" /> Start with Templates
                        </button>
                        <button class="button" @click=${() => this.showDialog('report')}>
                            <img src="/a7/forget/gs-draft-anything.svg" alt="" /> Draft anything
                        </button>
                        <button class="button" @click=${() => this.showDialog('report')}>
                            <img src="/a7/forget/gs-ai.svg" alt="" /> Start with AI
                        </button>
                        <button class="button" @click=${() => this.showDialog('import')}>
                            <img src="/a7/forget/gs-import.svg" alt="" /> Import from file
                        </button>
                        <button class="button" @click=${() => document.querySelector('help-dialog').show()}>
                            <img src="/a7/forget/gs-help.svg" alt="" /> Help
                        </button>
                    </div>
                </div>

                <div style="display: none; gap: var(--gap-3); flex-wrap: wrap; align-items: center;">
                    1 click install plugins for
                    <div style="display: flex; gap: var(--gap-2); flex-wrap: wrap">
                        <button class="button" @click=${() => this.pluginPacks('student')}>Academic Assignment</button>
                        <button class="button" @click=${() => this.pluginPacks('student-but-cooler')}>Academic Assignment (Cool)</button>
                        <button class="button" @click=${() => this.pluginPacks('blog')}>Blogging</button>
                    </div>
                </div>
                <p style="display: flex; margin-top: 20px; align-items: center; gap: var(--gap-1);">
                    <img src="/a7/forget/gs-info.svg" alt="Tip" style="height: 16px; filter: var(--accent-svg)" title="Tip" />
                    <span id="tip"> ${this.tips} </span>
                </p>

                <div class="dialog-overlay" style="display: ${this.activeDialog ? 'flex' : 'none'}" @click=${this.handleBackdropClick}></div>
                ${this.activeDialog === 'import' ? this.renderImportDialog() : ''} ${this.activeDialog === 'report' ? this.renderReportDialog() : ''}
            </div>
        `;
    }
}

customElements.define('getting-started', GettingStarted);
