class LinkPreviewElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.link = '';
        this.metadata = null;
        this.status = 'idle';
        this._hasConnected = false;
        this.render();
    }

    connectedCallback() {
        this.outer = this.shadowRoot.querySelector('.outer');
        this.inputDialog = this.shadowRoot.querySelector('.input-dialog');
        this.previewContent = this.shadowRoot.querySelector('.preview-content');
        this.urlInput = this.shadowRoot.querySelector('.url-input');
        this.submitBtn = this.shadowRoot.querySelector('.submit-btn');
        this.bindEvents();
        this._hasConnected = true;
        this.updateView();

        if (this.link && this.link.trim() && !this.metadata && this.status === 'idle') {
            this.updateLinkPreview();
        }
    }

    bindEvents() {
        this._removeAllListeners();

        if (!this.outer) return;

        this.outer.setAttribute('tabindex', '0');
        this._onOuterClick = (event) => {
            if (this.link && !event.target.closest('.input-dialog')) {
                let url = this.link;
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        };

        this._onOuterKeyDown = (event) => {
            if (!this.link) return;
            this.handleKeyDown(event);
        };

        this._onUrlInputKeyDown = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.submitUrl();
            } else if (event.key === 'Backspace' && this.urlInput.value === '') {
                event.preventDefault();
                const prevElement = wisk.editor.prevElement(this.id);
                const nextElement = wisk.editor.nextElement(this.id);
                wisk.editor.deleteBlock(this.id);
                const elementToFocus = prevElement || nextElement;
                if (elementToFocus) {
                    const focusPos = prevElement ? (prevElement.value?.textContent?.length || 0) : 0;
                    wisk.editor.focusBlock(elementToFocus.id, { x: focusPos });
                }
            } else if (event.key === 'ArrowUp' || (event.key === 'ArrowLeft' && this.urlInput.selectionStart === 0)) {
                if (this.urlInput.selectionStart === 0) {
                    event.preventDefault();
                    const prevElement = wisk.editor.prevElement(this.id);
                    if (prevElement) {
                        wisk.editor.focusBlock(prevElement.id, { x: prevElement.value?.textContent?.length || 0 });
                    }
                }
            } else if (event.key === 'ArrowDown' || (event.key === 'ArrowRight' && this.urlInput.selectionStart === this.urlInput.value.length)) {
                if (this.urlInput.selectionStart === this.urlInput.value.length) {
                    event.preventDefault();
                    const nextElement = wisk.editor.nextElement(this.id);
                    if (nextElement) {
                        wisk.editor.focusBlock(nextElement.id, { x: 0 });
                    }
                }
            }
        };

        this._onSubmitBtnClick = () => {
            this.submitUrl();
        };
        this.outer.addEventListener('click', this._onOuterClick);
        this.outer.addEventListener('keydown', this._onOuterKeyDown);

        if (this.urlInput) {
            this.urlInput.addEventListener('keydown', this._onUrlInputKeyDown);
        }

        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', this._onSubmitBtnClick);
        }
    }

    _removeAllListeners() {
        if (this.outer) {
            if (this._onOuterClick) {
                this.outer.removeEventListener('click', this._onOuterClick);
            }
            if (this._onOuterKeyDown) {
                this.outer.removeEventListener('keydown', this._onOuterKeyDown);
            }
        }
        if (this.urlInput && this._onUrlInputKeyDown) {
            this.urlInput.removeEventListener('keydown', this._onUrlInputKeyDown);
        }
        if (this.submitBtn && this._onSubmitBtnClick) {
            this.submitBtn.removeEventListener('click', this._onSubmitBtnClick);
        }
    }

    disconnectedCallback() {
        this._removeAllListeners();
    }

    submitUrl() {
        const url = this.urlInput.value.trim();
        if (!url) return;

        const normalized = url;

        if (normalized !== this.link) {
            this.link = normalized;
            this.metadata = null;
            this.status = 'idle';
        } else {
            if (!this.metadata) this.status = 'idle';
        }

        this.updateView();

        if (this.link && this.link.trim() && !this.metadata && this.status === 'idle') {
            this.updateLinkPreview();
        }

        this.sendUpdates();
    }

    handleKeyDown(event) {
        switch (event.key) {
            case 'Backspace':
            case 'Delete': {
                event.preventDefault();
                const prevElement = wisk.editor.prevElement(this.id);
                const nextElement = wisk.editor.nextElement(this.id);
                wisk.editor.deleteBlock(this.id);
                const elementToFocus = prevElement || nextElement;
                if (elementToFocus) {
                    const focusPos = prevElement ? (prevElement.value?.textContent?.length || 0) : 0;
                    wisk.editor.focusBlock(elementToFocus.id, { x: focusPos });
                }
                break;
            }
            case 'Enter':
                event.preventDefault();
                wisk.editor.createNewBlock(this.id, 'text-element', { textContent: '' }, { x: 0 });
                break;
            case 'ArrowUp':
            case 'ArrowLeft': {
                event.preventDefault();
                const prevElement = wisk.editor.prevElement(this.id);
                if (prevElement) {
                    wisk.editor.focusBlock(prevElement.id, { x: prevElement.value?.textContent?.length || 0 });
                }
                break;
            }
            case 'ArrowDown':
            case 'ArrowRight': {
                event.preventDefault();
                const nextElement = wisk.editor.nextElement(this.id);
                if (nextElement) {
                    wisk.editor.focusBlock(nextElement.id, { x: 0 });
                }
                break;
            }
        }
    }

    focus(identifier) {
        if (this.link && this.link.trim()) {
            if (this.outer) {
                this.outer.focus();
            }
        } else {
            if (this.urlInput) {
                this.urlInput.focus();
            }
        }
    }

    setValue(path, value) {
        if (path === 'value.append') {
            const appendText = value?.textContent || '';
            const nextLink = (this.link || '') + appendText;
            const linkChanged = nextLink !== this.link;

            this.link = nextLink;

            if (linkChanged) {
                this.metadata = null;
                this.status = 'idle';
            }
        } else {
            const incomingLink = value?.textContent || '';
            const linkChanged = incomingLink !== this.link;

            this.link = incomingLink;

            if (value && Object.prototype.hasOwnProperty.call(value, 'metadata')) {
                this.metadata = value.metadata || null;
            }

            if (value && Object.prototype.hasOwnProperty.call(value, 'status')) {
                this.status = value.status || 'idle';
            }

            if (linkChanged) {
                this.metadata = null;
                this.status = 'idle';
            }

            if (this.metadata) {
                this.status = 'ok';
            }
        }

        this.updateView();

        if (this._hasConnected && this.link && this.link.trim() && !this.metadata && this.status === 'idle') {
            this.updateLinkPreview();
        }
    }

    getValue() {
        return {
            textContent: this.link,
            metadata: this.metadata,
            status: this.status,
        };
    }

    updateView() {
        if (!this.inputDialog || !this.previewContent) return;

        if (this.link && this.link.trim()) {
            this.inputDialog.style.display = 'none';
            this.previewContent.style.display = 'flex';

            if (this.metadata) {
                this.updatePreviewWithMetadata(this.metadata);
                return;
            }

            if (this.status === 'error') {
                this.showErrorState();
                return;
            }

            this.showLoadingState();
        } else {
            this.inputDialog.style.display = 'flex';
            this.previewContent.style.display = 'none';
        }
    }

    updatePreviewWithMetadata(metadata) {
        const titleElement = this.shadowRoot.querySelector('.link-preview-title');
        const descElement = this.shadowRoot.querySelector('.link-preview-description');
        const imageElement = this.shadowRoot.querySelector('.link-preview-image');
        const metaElement = this.shadowRoot.querySelector('.link-preview-meta');

        if (titleElement) {
            titleElement.textContent = metadata.title || 'No title available';
        }

        if (descElement) {
            if (metadata.description) {
                descElement.textContent = metadata.description;
                descElement.style.display = 'block';
            } else {
                descElement.style.display = 'none';
            }
        }

        if (imageElement) {
            if (metadata.favicon) {
                imageElement.src = metadata.favicon;
                imageElement.style.display = 'block';
                imageElement.onerror = () => {
                    imageElement.style.display = 'none';
                };
            } else {
                imageElement.style.display = 'none';
            }
        }

        if (metaElement) {
            let metaInfo = [];
            if (metadata.siteName) metaInfo.push(metadata.siteName);
            if (metadata.author) metaInfo.push(`By ${metadata.author}`);
            if (metadata.publishDate) {
                const date = new Date(metadata.publishDate);
                metaInfo.push(date.toLocaleDateString());
            }

            if (metaInfo.length > 0) {
                metaElement.textContent = metaInfo.join(' • ');
                metaElement.style.display = 'block';
            } else {
                metaElement.style.display = 'none';
            }
        }
    }

    async updateLinkPreview() {
        if (!this.link || !this.link.trim() || this.metadata) return;
        if (this.status === 'loading' || this.status === 'ok' || this.status === 'error') return;

        this.status = 'loading';
        this.showLoadingState();
        this.sendUpdates();

        try {
            let url = this.link;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }

            const response = await fetch('https://render.wisk.cc/fetch-metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch metadata');
            }

            const metadata = await response.json();

            if (metadata.error) {
                throw new Error(metadata.error);
            }

            this.metadata = metadata;
            this.status = 'ok';
            this.updatePreviewWithMetadata(metadata);
            this.sendUpdates();
        } catch (error) {
            console.error('Error fetching metadata:', error);
            this.metadata = null;
            this.status = 'error';
            this.showErrorState();
            this.sendUpdates();
        }
    }

    showLoadingState() {
        if (this.inputDialog && this.previewContent) {
            this.inputDialog.style.display = 'none';
            this.previewContent.style.display = 'flex';
        }

        const titleElement = this.shadowRoot.querySelector('.link-preview-title');
        const descElement = this.shadowRoot.querySelector('.link-preview-description');
        const imageElement = this.shadowRoot.querySelector('.link-preview-image');
        const metaElement = this.shadowRoot.querySelector('.link-preview-meta');

        if (titleElement) {
            titleElement.textContent = 'Loading preview...';
        }
        if (descElement) {
            descElement.style.display = 'none';
        }
        if (imageElement) {
            imageElement.style.display = 'none';
        }
        if (metaElement) {
            metaElement.style.display = 'none';
        }
    }

    showErrorState() {
        if (this.inputDialog && this.previewContent) {
            this.inputDialog.style.display = 'none';
            this.previewContent.style.display = 'flex';
        }

        const titleElement = this.shadowRoot.querySelector('.link-preview-title');
        const descElement = this.shadowRoot.querySelector('.link-preview-description');
        const imageElement = this.shadowRoot.querySelector('.link-preview-image');
        const metaElement = this.shadowRoot.querySelector('.link-preview-meta');

        if (titleElement) {
            titleElement.textContent = 'Unable to load preview';
        }

        if (descElement && this.link) {
            descElement.textContent = this.link.startsWith('http') ? this.link : 'https://' + this.link;
            descElement.style.display = 'block';
        } else if (descElement) {
            descElement.style.display = 'none';
        }

        if (imageElement) {
            imageElement.style.display = 'none';
        }

        if (metaElement) {
            metaElement.textContent = 'Click to open link';
            metaElement.style.display = 'block';
        }
    }

    sendUpdates() {
        setTimeout(() => {
            wisk.editor.justUpdates(this.id);
        }, 0);
    }

    render() {
        const style = `
            <style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                font-family: var(--font);
            }
            .outer {
                border: 1px solid var(--border-1);
                border-radius: var(--radius-large);
                overflow: hidden;
                transition: all 0.15s ease;
                background: var(--bg-1);
                cursor: pointer;
                outline: none;
            }
            .outer:focus {
                border-color: var(--fg-accent);
                box-shadow: 0 0 0 2px var(--bg-accent);
            }
            .input-dialog {
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding: 20px;
                background: var(--bg-1);
            }
            .url-input {
                padding: 12px 16px;
                border: 1px solid var(--border-1);
                border-radius: var(--radius);
                background: var(--bg-2);
                color: var(--fg-1);
                font-size: 14px;
                font-family: var(--font);
                outline: none;
                transition: border-color 0.15s ease;
            }
            .url-input:focus {
                border-color: var(--fg-accent);
            }
            .url-input::placeholder {
                color: var(--fg-3);
            }
            .submit-btn {
                padding: 12px 16px;
                border: none;
                border-radius: var(--radius);
                background: var(--bg-accent);
                color: var(--fg-accent);
                font-size: 14px;
                font-weight: 600;
                font-family: var(--font);
                cursor: pointer;
                transition: opacity 0.15s ease;
            }
            .submit-btn:hover {
                opacity: 0.9;
            }
            .helper-text {
                font-size: 13px;
                color: var(--fg-2);
                text-align: center;
            }
            .preview-content {
                display: none;
                flex-direction: column;
            }
            .preview-header {
                padding: 16px;
                background: var(--bg-2);
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .preview-title-row {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .link-preview-image {
                width: 20px;
                height: 20px;
                object-fit: contain;
                flex-shrink: 0;
                border-radius: 4px;
            }
            .link-preview-content {
                flex: 1;
                min-width: 0;
            }
            .link-preview-title {
                word-break: break-word;
                color: var(--fg-1);
                font-weight: 600;
                font-size: 14px;
                line-height: 1.4;
            }
            .link-preview-description {
                font-size: 13px;
                color: var(--fg-2);
                margin-bottom: 8px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                line-height: 1.5;
            }
            .link-preview-meta {
                font-size: 12px;
                color: var(--fg-3);
                margin-bottom: 8px;
            }
            </style>
        `;

        const content = `
            <div class="outer">
                <div class="input-dialog">
                    <input type="text" class="url-input" placeholder="Paste in https://...">
                    <button class="submit-btn">Create bookmark</button>
                    <div class="helper-text">Create a visual bookmark from a link.</div>
                </div>
                <div class="preview-content">
                    <div class="preview-header">
                        <div class="preview-title-row">
                            <img class="link-preview-image" src="" alt="">
                            <div class="link-preview-title">Link Preview</div>
                        </div>
                        <div class="link-preview-description"></div>
                        <div class="link-preview-meta"></div>
                    </div>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = style + content;
    }
}

customElements.define('link-preview-element', LinkPreviewElement);
