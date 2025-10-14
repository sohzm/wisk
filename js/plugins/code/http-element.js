import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class HttpElement extends LitElement {
    static styles = [
        css`
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
            }

            :host {
                display: block;
                width: 100%;
                border-radius: var(--radius-large);
                overflow: hidden;
                border: 1px solid var(--border-1);
                background: var(--bg-1);
                font-family: var(--font);
            }

            .http-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                width: 100%;
            }

            .request-section {
                padding: var(--padding-4);
                background: var(--bg-1);
            }
            .request-header {
                display: flex;
                gap: var(--gap-2);
            }

            .method-select {
                border-radius: var(--radius);
                border: 2px solid var(--bg-3);
                background: var(--bg-2);
                color: var(--fg-1);
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                font-family: var(--font);
                min-width: 90px;
                text-align: center;
                padding: var(--padding-w2);
                transition: all 0.2s ease;
            }
            .method-select:focus {
                outline: none;
                background-color: var(--bg-1);
                border-color: var(--fg-accent);
            }

            .url-input {
                flex: 1;
                padding: var(--padding-w2);
                border-radius: var(--radius);
                border: 2px solid var(--bg-3);
                background: var(--bg-2);
                color: var(--fg-1);
                font-size: 14px;
                font-family: var(--font);
                transition: all 0.2s ease;
            }
            .url-input:focus {
                outline: none;
                background-color: var(--bg-1);
                border-color: var(--fg-accent);
            }
            .url-input::placeholder {
                color: var(--fg-2);
            }

            .send-button {
                padding: var(--padding-w2);
                border-radius: calc(var(--radius-large) * 20);
                border: 2px solid transparent;
                background: var(--fg-1);
                color: var(--bg-1);
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                font-family: var(--font);
                width: 80px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: var(--gap-2);
                transition: all 0.2s ease;
            }
            .send-button:hover:not(:disabled) {
                background-color: transparent;
                border: 2px solid var(--fg-1);
                color: var(--fg-1);
            }
            .send-button:disabled {
                background-color: var(--bg-3);
                color: var(--fg-2);
                border: 2px solid transparent;
                cursor: not-allowed;
            }

            .body-section,
            .headers-section {
                background: var(--bg-1);
            }
            .body-toggle,
            .headers-toggle {
                display: flex;
                align-items: center;
                gap: var(--gap-1);
                padding: var(--padding-4);
                padding-top: 0;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                color: var(--fg-1);
                background: var(--bg-1);
            }

            .body-toggle input[type='checkbox'],
            .headers-toggle input[type='checkbox'] {
                width: 16px;
                height: 16px;
                border-radius: var(--radius);
                border: 2px solid var(--border-1);
                background: var(--bg-1);
                cursor: pointer;
                appearance: none;
                position: relative;
            }
            .body-toggle input[type='checkbox']:checked,
            .headers-toggle input[type='checkbox']:checked {
                background: var(--fg-1);
                border-color: var(--fg-1);
            }
            .body-toggle input[type='checkbox']:checked::after,
            .headers-toggle input[type='checkbox']:checked::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: var(--bg-1);
                font-size: 10px;
                font-weight: bold;
            }

            .body-content,
            .headers-content {
                display: none;
                padding: 0 var(--padding-4) var(--padding-4);
            }
            .body-content.visible,
            .headers-content.visible {
                display: block;
            }

            .headers-table {
                width: 100%;
                border-collapse: collapse;
            }
            .headers-row {
                display: flex;
                gap: var(--gap-2);
                margin-bottom: var(--gap-2);
            }
            .headers-row input {
                padding: var(--padding-w2);
                border-radius: var(--radius);
                border: 2px solid var(--bg-3);
                background: var(--bg-2);
                color: var(--fg-1);
                font-size: 14px;
                font-family: var(--font);
                transition: all 0.2s ease;
            }
            .headers-row input:focus {
                outline: none;
                background-color: var(--bg-1);
                border-color: var(--fg-accent);
            }
            .headers-row input::placeholder {
                color: var(--fg-2);
            }
            .header-key-input {
                flex: 1;
            }
            .header-value-input {
                flex: 2;
            }
            .remove-header-btn {
                padding: var(--padding-w2);
                border-radius: var(--radius);
                border: 2px solid transparent;
                background: var(--bg-3);
                color: var(--fg-1);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 32px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .remove-header-btn:hover {
                background-color: var(--bg-red);
                color: var(--fg-red);
            }
            .add-header-btn {
                padding: var(--padding-w2);
                border-radius: calc(var(--radius-large) * 20);
                border: 2px solid var(--bg-3);
                background: var(--bg-1);
                color: var(--fg-1);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: var(--gap-2);
                margin-top: var(--gap-2);
            }
            .add-header-btn:hover {
                background-color: var(--bg-3);
            }

            .body-textarea {
                width: 100%;
                min-height: 100px;
                padding: var(--padding-w2);
                border-radius: var(--radius);
                border: 2px solid var(--bg-3);
                background: var(--bg-2);
                color: var(--fg-1);
                font-family: var(--font-mono);
                font-size: 13px;
                resize: vertical;
                transition: all 0.2s ease;
            }
            .body-textarea:focus {
                outline: none;
                background-color: var(--bg-1);
                border-color: var(--fg-accent);
            }
            .body-textarea::placeholder {
                color: var(--fg-2);
            }

            .response-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                border-top: 1px solid var(--border-1);
            }
            .response-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--padding-4);
                padding-bottom: 0;
                background: var(--bg-1);
            }
            .status-info {
                display: flex;
                align-items: center;
                gap: var(--gap-1);
                font-size: 14px;
                font-weight: 600;
            }
            .status-code {
                padding: var(--padding-1) var(--padding-2);
                border-radius: var(--radius);
                font-weight: 700;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .status-code.success {
                background: var(--bg-green);
                color: var(--fg-green);
            }
            .status-code.error {
                background: var(--bg-red);
                color: var(--fg-red);
            }
            .status-code.info {
                background: var(--bg-blue);
                color: var(--fg-blue);
            }

            .response-content {
                flex: 1;
                overflow: auto;
                padding: var(--padding-4);
                font-family: var(--font-mono);
                white-space: pre-wrap;
                word-break: break-word;
                background: var(--bg-1);
                color: var(--fg-1);
                user-select: text;
            }
            .response-content.json {
                white-space: pre;
            }

            .loading {
                display: none;
                padding: var(--padding-3) var(--padding-4);
                text-align: center;
                font-size: 14px;
                font-weight: 600;
                color: var(--fg-1);
                background: var(--bg-1);
                border-top: 1px solid var(--border-1);
            }
            .loading.visible {
                display: block;
            }

            .error-message {
                color: var(--fg-red);
                background: var(--bg-red);
                padding: var(--padding-3) var(--padding-4);
                font-size: 14px;
                font-weight: 600;
                display: none;
                border-top: 1px solid var(--border-1);
            }
            .error-message.visible {
                display: block;
            }

            .curl-dialog-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999;
            }
            .curl-dialog {
                background: var(--bg-1);
                border-radius: var(--radius-large);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                padding: var(--padding-4);
                width: 90%;
                max-width: 600px;
            }
            .curl-dialog h3 {
                margin-bottom: var(--padding-3);
                font-size: 18px;
                color: var(--fg-1);
            }
            .curl-textarea {
                width: 100%;
                height: 150px;
                padding: var(--padding-w2);
                border-radius: var(--radius);
                border: 2px solid var(--bg-3);
                font-family: var(--font-mono);
                font-size: 13px;
                background: var(--bg-2);
                color: var(--fg-1);
                transition: all 0.2s ease;
            }
            .curl-textarea:focus {
                outline: none;
                background-color: var(--bg-1);
                border-color: var(--fg-accent);
            }
            .curl-submit-button {
                margin-top: var(--padding-3);
                padding: var(--padding-w2);
                border-radius: calc(var(--radius-large) * 20);
                border: 2px solid transparent;
                background: var(--fg-1);
                color: var(--bg-1);
                margin-left: auto;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: var(--gap-2);
                transition: all 0.2s ease;
            }
            .curl-submit-button:hover {
                background-color: transparent;
                border: 2px solid var(--fg-1);
                color: var(--fg-1);
            }
        `,
    ];

    static properties = {
        _method: { type: String, state: true },
        _url: { type: String, state: true },
        _body: { type: String, state: true },
        _showBody: { type: Boolean, state: true },
        _response: { type: String, state: true },
        _status: { type: Number, state: true },
        _statusText: { type: String, state: true },
        _loading: { type: Boolean, state: true },
        _error: { type: String, state: true },
        _headers: { type: Array, state: true },
        _showHeaders: { type: Boolean, state: true },
        _savedResponse: { type: Object, state: true },
        _showCurlDialog: { type: Boolean, state: true },
    };

    constructor() {
        super();
        this._method = 'GET';
        this._url = '';
        this._body = '';
        this._showBody = false;
        this._response = '';
        this._status = 0;
        this._statusText = '';
        this._loading = false;
        this._error = '';
        this._headers = [{ key: 'Content-Type', value: 'application/json', id: Date.now() }];
        this._showHeaders = false;
        this._savedResponse = null;
        this._showCurlDialog = false;
    }

    connectedCallback() {
        super.connectedCallback();
        if (this._savedResponse) {
            this._url = this._savedResponse.url || '';
            this._method = this._savedResponse.method || 'GET';
            this._status = this._savedResponse.status || 0;
            this._statusText = this._savedResponse.statusText || '';
            this._response = this._savedResponse.response || '';
            this._body = this._savedResponse.body || '';
            this._showBody = this._savedResponse.showBody !== undefined ? this._savedResponse.showBody : !!this._body;
            this._headers = this._savedResponse.headers || [{ key: 'Content-Type', value: 'application/json', id: Date.now() }];
            this._showHeaders = this._savedResponse.showHeaders !== undefined ? this._savedResponse.showHeaders : false;
        }
    }

    getValue() {
        return {
            method: this._method,
            url: this._url,
            body: this._body,
            showBody: this._showBody,
            headers: this._headers,
            showHeaders: this._showHeaders,
            savedResponse: this._savedResponse,
        };
    }

    async setValue(path, value) {
        if (value.method !== undefined) this._method = value.method;
        if (value.url !== undefined) this._url = value.url;
        if (value.body !== undefined) this._body = value.body;
        if (value.showBody !== undefined) this._showBody = value.showBody;
        if (value.headers !== undefined) this._headers = value.headers;
        if (value.showHeaders !== undefined) this._showHeaders = value.showHeaders;
        if (value.savedResponse !== undefined) {
            this._savedResponse = value.savedResponse;
            // Restore saved state
            if (this._savedResponse) {
                this._url = this._savedResponse.url || this._url;
                this._method = this._savedResponse.method || this._method;
                this._status = this._savedResponse.status || 0;
                this._statusText = this._savedResponse.statusText || '';
                this._response = this._savedResponse.response || '';
                this._body = this._savedResponse.body || this._body;
                this._showBody = this._savedResponse.showBody !== undefined ? this._savedResponse.showBody : this._showBody;
                this._headers = this._savedResponse.headers || this._headers;
                this._showHeaders = this._savedResponse.showHeaders !== undefined ? this._savedResponse.showHeaders : this._showHeaders;
            }
        }
        this.requestUpdate();
    }

    sendUpdates() {
        setTimeout(() => {
            wisk.editor.justUpdates(this.id);
        }, 0);
    }

    handleMethodChange(e) {
        this._method = e.target.value;
        this._showBody = ['POST', 'PUT', 'PATCH'].includes(this._method);
        this.sendUpdates();
    }
    handleUrlChange(e) {
        this._url = e.target.value;
        this.sendUpdates();
    }
    handleBodyChange(e) {
        this._body = e.target.value;
        this.sendUpdates();
    }
    toggleBody() {
        this._showBody = !this._showBody;
        this.sendUpdates();
    }

    toggleHeaders() {
        this._showHeaders = !this._showHeaders;
        this.sendUpdates();
    }

    addHeader() {
        this._headers = [...this._headers, { key: '', value: '', id: Date.now() }];
        this.sendUpdates();
    }

    removeHeader(id) {
        this._headers = this._headers.filter(h => h.id !== id);
        this.sendUpdates();
    }

    updateHeaderKey(id, key) {
        this._headers = this._headers.map(h => (h.id === id ? { ...h, key } : h));
        this.sendUpdates();
    }

    updateHeaderValue(id, value) {
        this._headers = this._headers.map(h => (h.id === id ? { ...h, value } : h));
        this.sendUpdates();
    }

    saveResponse() {
        if (this._response && this._status > 0) {
            this._savedResponse = {
                url: this._url,
                method: this._method,
                status: this._status,
                statusText: this._statusText,
                response: this._response,
                timestamp: new Date().toISOString(),
                body: this._body,
                headers: this._headers,
                showBody: this._showBody,
                showHeaders: this._showHeaders,
            };
            this.sendUpdates();
        }
    }

    runArg(action) {
        switch (action) {
            case 'paste-curl':
                return this.handlePasteCurl();
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    async handlePasteCurl() {
        this._showCurlDialog = true;
        await this.updateComplete;
        this.renderRoot.querySelector('.curl-textarea').focus();
    }

    closeCurlDialog() {
        this._showCurlDialog = false;
        this.requestUpdate();
    }

    handleCurlSubmit() {
        const textarea = this.renderRoot.querySelector('.curl-textarea');
        const curl = textarea.value.trim();

        if (!curl.startsWith('curl')) {
            wisk.utils.showToast('Invalid cURL command. Please start with "curl".', 3000);
            return;
        }

        // Split while preserving quoted segments
        const tokens = [];
        let current = '';
        let inQuote = null;

        for (let i = 0; i < curl.length; i++) {
            const char = curl[i];
            if (char === '"' || char === "'") {
                if (inQuote === char) {
                    inQuote = null;
                } else if (!inQuote) {
                    inQuote = char;
                } else {
                    current += char;
                }
            } else if (char === '\\' && inQuote) {
                // Handle escape sequences
                if (i + 1 < curl.length) {
                    current += curl[++i];
                }
            } else if (!inQuote && /\s/.test(char)) {
                if (current) tokens.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        if (current) tokens.push(current);

        let method = 'GET';
        let headers = [];
        let body = '';
        let url = '';
        const used = new Array(tokens.length).fill(false);

        // First token is 'curl' - mark as used
        used[0] = true;

        // Parse options
        for (let i = 1; i < tokens.length; i++) {
            if (used[i]) continue;
            const token = tokens[i];

            if (token === '-X' || token === '--request') {
                if (i + 1 < tokens.length) {
                    method = tokens[i + 1].toUpperCase();
                    used[i] = true;
                    used[i + 1] = true;
                    i++;
                }
            } else if (token === '-H' || token === '--header') {
                if (i + 1 < tokens.length) {
                    const header = tokens[i + 1].split(':', 2);
                    if (header.length === 2) {
                        headers.push({
                            key: header[0].trim(),
                            value: header[1].trim(),
                            id: Date.now() + headers.length,
                        });
                    }
                    used[i] = true;
                    used[i + 1] = true;
                    i++;
                }
            } else if (token === '-d' || token === '--data' || token === '--data-raw') {
                if (i + 1 < tokens.length) {
                    body = tokens[i + 1];
                    used[i] = true;
                    used[i + 1] = true;
                    i++;
                }
            }
        }

        // Find URL (last unused token starting with http)
        for (let i = tokens.length - 1; i > 0; i--) {
            if (!used[i] && tokens[i].toLowerCase().startsWith('http')) {
                url = tokens[i];
                break;
            }
        }

        // Apply parsed values
        this._url = url;
        this._method = method;
        this._headers = headers.length ? headers : [{ key: 'Content-Type', value: 'application/json', id: Date.now() }];
        this._body = body;
        this._showBody = !!body;
        this._showHeaders = headers.length > 0;
        this._showCurlDialog = false;
        this.sendUpdates();
    }

    async sendRequest() {
        if (!this._url) {
            this._error = 'Please enter a URL';
            this._loading = false;
            this.requestUpdate();
            return;
        }

        this._loading = true;
        this._error = '';
        this.requestUpdate();
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            // Convert headers array to object
            const headersObj = {};
            this._headers.forEach(h => {
                if (h.key && h.value) {
                    headersObj[h.key] = h.value;
                }
            });

            const options = { method: this._method, headers: headersObj, signal: controller.signal };
            if (this._showBody && this._body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(this._method)) options.body = this._body;

            const response = await fetch(this._url, options);
            clearTimeout(timeoutId);

            this._status = response.status;
            this._statusText = response.statusText;
            const ct = response.headers.get('content-type');
            if (ct && ct.includes('application/json')) this._response = JSON.stringify(await response.json(), null, 2);
            else this._response = await response.text();

            this._loading = false;
            this.saveResponse();
            this.sendUpdates();
        } catch (err) {
            this._loading = false;
            this._error = err.name === 'AbortError' ? 'Request timeout (30s)' : err.message || 'An error occurred';
            this._status = 0;
            this._response = '';
            this.sendUpdates();
        }
    }

    getStatusClass() {
        if (this._status >= 200 && this._status < 300) return 'success';
        if (this._status >= 400) return 'error';
        if (this._status > 0) return 'info';
        return '';
    }

    render() {
        return html`
            <div class="http-container">
                <div class="request-section">
                    <div class="request-header">
                        <select class="method-select" .value="${this._method}" @change="${this.handleMethodChange}">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                            <option value="HEAD">HEAD</option>
                            <option value="OPTIONS">OPTIONS</option>
                        </select>
                        <input
                            class="url-input"
                            type="text"
                            placeholder="https://api.example.com/endpoint"
                            .value="${this._url}"
                            @input="${this.handleUrlChange}"
                        />
                        <button class="send-button" @click="${this.sendRequest}" ?disabled="${this._loading}">
                            ${this._loading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>

                <div class="headers-section">
                    <div class="headers-toggle" @click="${this.toggleHeaders}">
                        <input type="checkbox" .checked="${this._showHeaders}" @change="${this.toggleHeaders}" />
                        <span>Headers</span>
                    </div>
                    <div class="headers-content ${this._showHeaders ? 'visible' : ''}">
                        <div class="headers-table">
                            ${this._headers.map(
                                header => html`
                                    <div class="headers-row">
                                        <input
                                            type="text"
                                            class="header-key-input"
                                            placeholder="Header Key"
                                            .value="${header.key}"
                                            @input="${e => this.updateHeaderKey(header.id, e.target.value)}"
                                        />
                                        <input
                                            type="text"
                                            class="header-value-input"
                                            placeholder="Header Value"
                                            .value="${header.value}"
                                            @input="${e => this.updateHeaderValue(header.id, e.target.value)}"
                                        />
                                        <button class="remove-header-btn" @click="${() => this.removeHeader(header.id)}">×</button>
                                    </div>
                                `
                            )}
                        </div>
                        <button class="add-header-btn" @click="${this.addHeader}">+ Add Header</button>
                    </div>
                </div>

                <div class="body-section">
                    <div class="body-toggle" @click="${this.toggleBody}">
                        <input type="checkbox" .checked="${this._showBody}" @change="${this.toggleBody}" />
                        <span>Request Body</span>
                    </div>
                    <div class="body-content ${this._showBody ? 'visible' : ''}">
                        <textarea
                            class="body-textarea"
                            placeholder='{"key": "value"}'
                            .value="${this._body}"
                            @input="${this.handleBodyChange}"
                        ></textarea>
                    </div>
                </div>

                ${this._loading ? html`<div class="loading visible">Sending request...</div>` : ''}
                ${this._error ? html`<div class="error-message visible">${this._error}</div>` : ''}

                <div class="response-section" style="display: ${this._response ? 'block' : 'none'};">
                    <div class="response-header">
                        <div class="status-info">
                            ${this._status > 0
                                ? html` <span class="status-code ${this.getStatusClass()}">${this._status}</span>
                                      <span>${this._statusText}</span>`
                                : html`<span>Response</span>`}
                        </div>
                    </div>
                    <div class="response-content ${this._response && this._response.trim().startsWith('{') ? 'json' : ''}">${this._response}</div>
                </div>
            </div>

            ${this._showCurlDialog
                ? html` <div class="curl-dialog-backdrop" @click="${this.closeCurlDialog}">
                      <div class="curl-dialog" @click="${e => e.stopPropagation()}">
                          <h3>Paste cURL Command</h3>
                          <textarea class="curl-textarea" placeholder="Paste your cURL command here..."></textarea>
                          <button class="curl-submit-button" @click="${this.handleCurlSubmit}">Submit</button>
                      </div>
                  </div>`
                : ''}
        `;
    }
}

customElements.define('http-element', HttpElement);
