class EmbedElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.link = '';
    this.render();
  }

  connectedCallback() {
    this.iframe = this.shadowRoot.querySelector('iframe');
    this.container = this.shadowRoot.querySelector('.embed-container');
    this.inputDialog = this.shadowRoot.querySelector('.input-dialog');
    this.urlInput = this.shadowRoot.querySelector('.url-input');
    this.submitBtn = this.shadowRoot.querySelector('.submit-btn');
    this.bindEvents();
    this.updateView();
  }

  bindEvents() {
    this._removeAllListeners();

    if (!this.container) return;

    this.container.setAttribute('tabindex', '0');
    this._onContainerKeyDown = (event) => {
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
    this.container.addEventListener('keydown', this._onContainerKeyDown);

    if (this.urlInput) {
      this.urlInput.addEventListener('keydown', this._onUrlInputKeyDown);
    }

    if (this.submitBtn) {
      this.submitBtn.addEventListener('click', this._onSubmitBtnClick);
    }
  }

  _removeAllListeners() {
    if (this.container && this._onContainerKeyDown) {
      this.container.removeEventListener('keydown', this._onContainerKeyDown);
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
    if (url) {
      this.link = url;
      this.updateView();
      this.sendUpdates();
    }
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

  extractSrcFromIframe(iframeCode) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(iframeCode, 'text/html');
    const iframe = doc.querySelector('iframe');
    if (iframe && iframe.src) {
      return iframe.src.replace(/^https?:\/\//, '');
    }
    return null;
  }

  setValue(path, value) {
    let content = value.textContent || '';

    // Handle iframe embed code
    if (content && content.includes('<iframe')) {
      const extracted = this.extractSrcFromIframe(content);
      if (extracted) {
        content = extracted;
      }
    }

    if (path === 'value.append') {
      this.link += content;
    } else {
      this.link = content;
    }

    this.updateView();
  }

  getValue() {
    return {
      textContent: this.link,
    };
  }

  sendUpdates() {
    setTimeout(() => {
      wisk.editor.justUpdates(this.id);
    }, 0);
  }

  convertToEmbedUrl(url) {
    // YouTube
    if (url.includes('youtube.com/watch')) {
      const videoId = url.match(/[?&]v=([^&]+)/);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId[1]}`;
      }
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split(/[?&]/)[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // Google Maps
    if (url.includes('google.com/maps')) {
      if (url.includes('/embed')) {
        return url.startsWith('http') ? url : 'https://' + url;
      }
      return url.startsWith('http') ? url : 'https://' + url;
    }

    // Google Drive
    if (url.includes('drive.google.com/file')) {
      const fileId = url.match(/\/d\/([^/]+)/);
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId[1]}/preview`;
      }
    }

    // GitHub Gist
    if (url.includes('gist.github.com')) {
      return url.startsWith('http') ? url : 'https://' + url;
    }

    // Default: return URL as is
    return url.startsWith('http') ? url : 'https://' + url;
  }

  updateView() {
    if (!this.iframe || !this.inputDialog) return;

    if (this.link && this.link.trim()) {
      // Show embed, hide input dialog
      this.inputDialog.style.display = 'none';

      let url = this.link.trim();
      url = url.replace(/^https?:\/\//, '');
      url = this.convertToEmbedUrl(url);

      if (url && url !== 'https://') {
        this.iframe.src = url;
        this.iframe.style.display = 'block';
      }
    } else {
      // Show input dialog, hide embed
      this.inputDialog.style.display = 'block';
      this.iframe.style.display = 'none';
      this.iframe.src = '';
    }
  }

  focus(identifier) {
    if (this.link && this.link.trim()) {
      // Focus container when showing embed
      if (this.container) {
        this.container.focus();
      }
    } else {
      // Focus input when showing dialog
      if (this.urlInput) {
        this.urlInput.focus();
      }
    }
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

        :host {
          display: block;
        }

        .embed-container {
          display: flex;
          flex-direction: column;
          gap: 0;
          width: 100%;
          border: 1px solid var(--border-1);
          border-radius: var(--radius-large);
          overflow: hidden;
          transition: all 0.15s ease;
          outline: none;
        }

        .embed-container:focus {
          border-color: var(--fg-accent);
          box-shadow: 0 0 0 2px var(--bg-accent);
        }

        .input-dialog {
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          background: var(--bg-2);
        }

        .url-input {
          width: 100%;
          max-width: 300px;
          padding: 10px 12px;
          border: 1px solid var(--border-1);
          border-radius: var(--radius);
          background: var(--bg-1);
          color: var(--fg-1);
          font-size: 14px;
          font-family: var(--font);
          outline: none;
        }

        .url-input:focus {
          border-color: var(--fg-accent);
        }

        .url-input::placeholder {
          color: var(--fg-3);
        }

        .submit-btn {
          width: 100%;
          max-width: 300px;
          padding: 10px 16px;
          background: var(--fg-accent);
          color: var(--bg-accent);
          border: none;
          border-radius: var(--radius);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.15s ease;
          font-family: var(--font);
        }

        .submit-btn:hover {
          opacity: 0.9;
        }

        .helper-text {
          font-size: 12px;
          color: var(--fg-3);
          text-align: center;
        }

        iframe {
          width: 100%;
          height: 450px;
          border: none;
          border-radius: 0;
          display: none;
          background: #000;
        }
      </style>
    `;

    const content = `
      <div class="embed-container">
        <div class="input-dialog">
          <input type="text" class="url-input" placeholder="Paste in https://..." />
          <button class="submit-btn">Embed link</button>
          <div class="helper-text">Works with links of PDFs, Google Drive, Google Maps, CodePen...</div>
        </div>
        <iframe sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation" allowfullscreen></iframe>
      </div>
    `;

    this.shadowRoot.innerHTML = style + content;
  }
}

customElements.define('embed-element', EmbedElement);
