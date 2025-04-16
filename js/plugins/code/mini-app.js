import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class MiniAppEditor extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
            display: block;
            height: 100%;
            width: 100%;
        }
        .container {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        }
        .tabs {
            display: flex;
            gap: 8px;
            padding: 8px;
            background: #f5f5f5;
            border-bottom: 1px solid #ddd;
        }
        .tab {
            padding: 8px 16px;
            cursor: pointer;
            border-radius: 4px;
            background: white;
            border: 1px solid #ddd;
        }
        .tab.active {
            background: #e0e0e0;
            border-color: #bbb;
        }
        .editor {
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
            padding: 16px;
        }
        textarea {
            width: 100%;
            flex: 1;
            padding: 8px;
            font-family: monospace;
            resize: none;
            border: 1px solid #ddd;
            border-radius: 4px;
            min-height: 0;
        }
        .render-container {
            width: 100%;
            border: none;
            display: block;
        }
        .assets-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 16px;
            max-height: 400px;
            overflow-y: auto;
        }
        .asset-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
        }
        .asset-item:hover {
            border-color: #0066cc;
        }
        .asset-name {
            flex: 1;
            font-size: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .asset-actions {
            display: flex;
            gap: 8px;
        }
        .asset-button {
            padding: 6px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-size: 12px;
            color: #333;
        }
        .asset-button:hover {
            background: #f5f5f5;
            border-color: #bbb;
        }
        .asset-button.delete {
            color: #dc3545;
            border-color: #dc3545;
        }
        .asset-button.delete:hover {
            background: #dc3545;
            color: white;
        }
        .upload-area {
            width: 100%;
            padding: 32px;
            border: 2px dashed #ddd;
            border-radius: 4px;
            text-align: center;
            margin-bottom: 16px;
            cursor: pointer;
        }
        .upload-area:hover {
            border-color: #0066cc;
            background: #f5f5f5;
        }
        .upload-input {
            display: none;
        }
        .loading {
            text-align: center;
            padding: 20px;
        }
    `;

    static properties = {
        activeTab: { type: String },
        value: { type: Object },
        formValues: { type: Object },
        assets: { type: Array },
    };

    constructor() {
        super();
        this.activeTab = 'html';
        this.value = {
            html: '',
            css: '',
            javascript: '',
            inputs: [],
            assets: [],
            formValues: {},
        };
        this.loading = false;

        // Listen for resize messages from iframe
        window.addEventListener('message', event => {
            if (event.data.type === 'resize') {
                const iframe = this.shadowRoot.querySelector('.render-container');
                if (iframe) {
                    iframe.style.height = `${event.data.height}px`;
                }
            }
        });
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const user = await document.querySelector('auth-component').getUserInfo();
            const response = await fetch(wisk.editor.backendUrl + '/v1/files', {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: 'Bearer ' + user.token,
                },
            });

            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            this.value.assets = [...this.value.assets, data];
            this.requestUpdate();
            this.sendUpdates();
            return data.url;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.uploadFile(file);
        }
    }

    handleDrop(event) {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            this.uploadFile(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.style.borderColor = '#0066cc';
        event.currentTarget.style.background = '#f5f5f5';
    }

    handleDragLeave(event) {
        event.currentTarget.style.borderColor = '#ddd';
        event.currentTarget.style.background = 'none';
    }

    getValue() {
        return this.value;
    }

    sendUpdates() {
        setTimeout(() => {
            wisk.editor.justUpdates(this.id);
        }, 0);
    }

    validateValue(newValue) {
        const validatedValue = {
            html: typeof newValue.html === 'string' ? newValue.html : '',
            css: typeof newValue.css === 'string' ? newValue.css : '',
            javascript: typeof newValue.javascript === 'string' ? newValue.javascript : '',
            inputs: Array.isArray(newValue.inputs) ? newValue.inputs : [],
            assets: Array.isArray(newValue.assets)
                ? newValue.assets.filter(asset => asset && typeof asset === 'object' && typeof asset.url === 'string')
                : [],
            formValues: newValue.formValues && typeof newValue.formValues === 'object' ? newValue.formValues : {},
        };
        return validatedValue;
    }

    setValue(path, newValue) {
        if (!newValue || typeof newValue !== 'object') {
            console.error('Invalid value provided to setValue');
            return;
        }

        const validatedValue = this.validateValue(newValue);
        this.value = {
            ...this.value,
            ...validatedValue,
        };
        this.requestUpdate();
    }

    handleTabClick(tab) {
        this.activeTab = tab;
        if (tab === 'assets') {
            //this.loadAssets();
        }
    }

    async loadAssets() {
        try {
            this.loading = true;
            const user = await document.querySelector('auth-component').getUserInfo();
            const response = await fetch(wisk.editor.backendUrl + '/v1/files', {
                headers: {
                    Authorization: 'Bearer ' + user.token,
                },
            });
            if (!response.ok) throw new Error('Failed to load assets');
            const data = await response.json();
            this.value.assets = data;
            this.requestUpdate();
            this.sendUpdates();
        } catch (error) {
            console.error('Failed to load assets:', error);
        } finally {
            this.loading = false;
            this.requestUpdate();
        }
    }

    handleEditorChange(event, field) {
        this.value = {
            ...this.value,
            [field]: event.target.value,
        };
        this.sendUpdates();
    }

    handleInputChange(name, value) {
        this.value.formValues = {
            ...this.value.formValues,
            [name]: value,
        };
        this.requestUpdate();
        this.sendUpdates();
    }

    renderInputForm() {
        return html`
            <div class="input-form">
                ${this.value.inputs.map(
                    input => html`
                        <div class="input-field">
                            <label>${input.label}</label>
                            <input
                                type=${input.type || 'text'}
                                .value=${this.formValues[input.name] || ''}
                                @input=${e => this.handleInputChange(input.name, e.target.value)}
                            />
                        </div>
                    `
                )}
            </div>
        `;
    }

    renderAssets() {
        return html`
            <div
                class="upload-area"
                @drop=${this.handleDrop}
                @dragover=${this.handleDragOver}
                @dragleave=${this.handleDragLeave}
                @click=${() => this.shadowRoot.querySelector('.upload-input').click()}
            >
                Drop files here or click to upload
                <input type="file" class="upload-input" accept="image/*" @change=${this.handleFileSelect} />
            </div>
            ${this.loading
                ? html`<div class="loading">Loading assets...</div>`
                : html`
                      <div class="assets-container">
                          ${this.value.assets.map(
                              asset => html`
                                  <div class="asset-item">
                                      <div class="asset-name">${this.getAssetName(asset.url)}</div>
                                      <div class="asset-actions">
                                          <button class="asset-button" @click=${e => this.openAssetInNewTab(asset, e)}>Open</button>
                                          <button class="asset-button" @click=${e => this.copyAssetUrl(asset, e)}>Copy URL</button>
                                          <button class="asset-button delete" @click=${e => this.deleteAsset(asset, e)}>Delete</button>
                                      </div>
                                  </div>
                              `
                          )}
                      </div>
                  `}
        `;
    }

    copyAssetUrl(asset, event) {
        event.stopPropagation();
        navigator.clipboard.writeText(asset.url);
        const button = event.target;
        const originalText = button.innerText;
        button.innerText = 'Copied!';
        setTimeout(() => (button.innerText = originalText), 2000);
    }

    openAssetInNewTab(asset, event) {
        event.stopPropagation();
        window.open(asset.url, '_blank');
    }

    deleteAsset(asset, event) {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this asset?')) {
            this.value.assets = this.value.assets.filter(a => a.url !== asset.url);
            this.requestUpdate();
            this.sendUpdates();
        }
    }

    getAssetName(url) {
        try {
            return decodeURIComponent(url.split('/').pop());
        } catch {
            return url.split('/').pop();
        }
    }

    renderEditor() {
        switch (this.activeTab) {
            case 'html':
            case 'css':
            case 'javascript':
                return html`
                    <textarea
                        .value=${this.value[this.activeTab]}
                        @input=${e => this.handleEditorChange(e, this.activeTab)}
                        placeholder=${`Enter ${this.activeTab} here...`}
                    ></textarea>
                `;
            case 'inputs':
                return this.renderInputForm();
            case 'assets':
                return this.renderAssets();
            case 'render':
                const fullHtml = `
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <style>${this.value.css}</style>
                        </head>
                        <body>
                            ${this.value.html}
                            <script>
                                window.values = ${JSON.stringify(this.formValues)};
                                const jsCode = ${JSON.stringify(this.value.javascript)};
                                try {
                                    eval(jsCode);
                                } catch (error) {
                                    console.error('Error executing JavaScript:', error);
                                }

                                // Send height to parent
                                window.parent.postMessage({
                                    type: 'resize',
                                    height: document.documentElement.scrollHeight
                                }, '*');
                            </script>
                        </body>
                    </html>
                `;

                const blob = new Blob([fullHtml], { type: 'text/html' });
                const url = URL.createObjectURL(blob);

                return html` <iframe class="render-container" src=${url}></iframe> `;
        }
    }

    render() {
        const tabs = ['html', 'css', 'javascript', 'inputs', 'assets', 'render'];

        return html`
            <div class="container">
                <div class="tabs">
                    ${tabs.map(
                        tab => html`
                            <div class="tab ${tab === this.activeTab ? 'active' : ''}" @click=${() => this.handleTabClick(tab)}>
                                ${tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </div>
                        `
                    )}
                </div>
                <div class="editor">${this.renderEditor()}</div>
            </div>
        `;
    }
}

customElements.define('mini-app', MiniAppEditor);
