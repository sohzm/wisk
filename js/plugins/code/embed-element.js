class EmbedElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.link = 'wisk.cc';
        this.render();
        this.isVirtualKeyboard = this.checkIfVirtualKeyboard();
    }

    checkIfVirtualKeyboard() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    connectedCallback() {
        this.editable = this.shadowRoot.querySelector('#editable');
        this.iframe = this.shadowRoot.querySelector('iframe');
        this.bindEvents();
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
        let content = value.textContent;
        if (content.includes('<iframe')) {
            const extractedSrc = this.extractSrcFromIframe(content);
            if (extractedSrc) {
                content = extractedSrc;
            }
        }

        if (path === 'value.append') {
            this.editable.innerText += content;
        } else {
            this.editable.innerText = content;
        }
        this.link = this.editable.innerText;
        this.updateIframeSource();
    }

    getValue() {
        return {
            textContent: this.editable.innerText,
        };
    }

    updateIframeSource() {
        this.iframe.src = `https://${this.editable.innerText}`;
    }

    onValueUpdated(event) {
        let text = this.editable.innerText;
        if (text.includes('<iframe')) {
            const extractedSrc = this.extractSrcFromIframe(text);
            if (extractedSrc) {
                text = extractedSrc;
                this.editable.innerText = text;
            }
        }

        if (this.handleSpecialKeys(event) || event.key.includes('Arrow')) {
            return;
        }

        this.link = text;
        this.sendUpdates();
        setTimeout(() => {
            this.updateIframeSource();
        }, 0);
    }

    focus(identifier) {
        this.editable.focus();
    }

    handleSpecialKeys(event) {
        const keyHandlers = {
            Enter: () => this.handleEnterKey(event),
            Backspace: () => this.handleBackspace(event),
            Tab: () => this.handleTab(event),
            ArrowLeft: () => this.handleArrowKey(event, 'next-up', 0),
            ArrowRight: () => this.handleArrowKey(event, 'next-down', this.editable.innerText.length),
            ArrowUp: () => this.handleVerticalArrow(event, 'next-up'),
            ArrowDown: () => this.handleVerticalArrow(event, 'next-down'),
        };

        const handler = keyHandlers[event.key];
        return handler ? handler() : false;
    }

    handleEnterKey(event) {
        if (!this.isVirtualKeyboard) {
            event.preventDefault();
            wisk.editor.createNewBlock(this.id, 'text-element', { textContent: '' }, { x: 0 });
            return true;
        }
        return false;
    }

    handleBackspace(event) {
        if (this.editable.innerText.length === 0) {
            event.preventDefault();
            wisk.editor.deleteBlock(this.id);
            return true;
        }
        return false;
    }

    handleTab(event) {
        event.preventDefault();
        return true;
    }

    handleVerticalArrow(event, direction) {
        if (direction === 'next-up') {
            var prevElement = wisk.editor.prevElement(this.id);
            if (prevElement != null) {
                const prevComponentDetail = wisk.plugins.getPluginDetail(prevElement.component);
                if (prevComponentDetail.textual) {
                    wisk.editor.focusBlock(prevElement.id, { x: prevElement.value.textContent.length });
                }
            }
        } else if (direction === 'next-down') {
            var nextElement = wisk.editor.nextElement(this.id);
            if (nextElement != null) {
                const nextComponentDetail = wisk.plugins.getPluginDetail(nextElement.component);
                if (nextComponentDetail.textual) {
                    wisk.editor.focusBlock(nextElement.id, { x: 0 });
                }
            }
        }
    }

    handleArrowKey(event, direction, targetOffset) {
        const currentOffset = this.getCurrentOffset();
        if (currentOffset === targetOffset) {
            event.preventDefault();
            if (direction === 'next-up') {
                var prevElement = wisk.editor.prevElement(this.id);
                if (prevElement != null) {
                    const prevComponentDetail = wisk.plugins.getPluginDetail(prevElement.component);
                    if (prevComponentDetail.textual) {
                        wisk.editor.focusBlock(prevElement.id, { x: prevElement.value.textContent.length });
                    }
                }
            } else if (direction === 'next-down') {
                var nextElement = wisk.editor.nextElement(this.id);
                if (nextElement != null) {
                    const nextComponentDetail = wisk.plugins.getPluginDetail(nextElement.component);
                    if (nextComponentDetail.textual) {
                        wisk.editor.focusBlock(nextElement.id, { x: 0 });
                    }
                }
            }
            return true;
        }
        return false;
    }

    getCurrentOffset() {
        const selection = this.shadowRoot.getSelection();
        return selection.rangeCount ? selection.getRangeAt(0).startOffset : 0;
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
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            }
            .browser-toolbar {
                padding: 8px 12px;
                border-bottom: 1px solid var(--border-1);
                display: flex;
                align-items: center;
                gap: 8px;
                position: relative;
            }
            .window-controls {
                display: flex;
                gap: 6px;
                margin-right: 8px;
            }
            @media (min-width: 700px) {
                .window-controls {
                    position: absolute;
                }
            }
            .window-button {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 1px solid rgba(0, 0, 0, 0.1);
            }
            .close-button {
                background-color: var(--fg-red);
            }
            .minimize-button {
                background-color: var(--fg-yellow);
            }
            .maximize-button {
                background-color: var(--fg-green);
            }
            .address-bar {
                background-color: var(--bg-1);
                border: 1px solid var(--bg-3);
                border-radius: var(--radius);
                padding: 4px 8px;
                flex-grow: 1;
                display: flex;
                align-items: center;
                height: 28px;
                max-width: 369px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin: 0 auto;
            }
            .link {
                outline: none;
                border: none;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
                font-size: 13px;
                color: var(--fg-1);
            }
            #editable {
                flex-grow: 1;
            }
            iframe {
                width: 100%;
                height: 500px;
                outline: none;
                display: block;
                background-color: white;
            }
            .https-text {
                color: var(--fg-2);
                font-size: 13px;
            }
            </style>
        `;
        const content = `
            <div class="outer">
                <div class="browser-toolbar">
                    <div class="window-controls">
                        <div class="window-button close-button"></div>
                        <div class="window-button minimize-button"></div>
                        <div class="window-button maximize-button"></div>
                    </div>
                    <div class="address-bar">
                        <span class="https-text">https://</span>
                        <div class="link" id="editable" contenteditable="${!wisk.editor.readonly}" spellcheck="false">${this.link}</div>
                    </div>
                </div>
                <iframe src="https://${this.link}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        `;
        this.shadowRoot.innerHTML = style + content;
    }

    bindEvents() {
        const eventType = this.isVirtualKeyboard ? 'input' : 'keyup';
        this.editable.addEventListener(eventType, this.onValueUpdated.bind(this));
        this.editable.addEventListener('focus', () => {
            if (this.editable.innerText.trim() === '') {
                this.editable.classList.add('empty');
            }
        });
    }
}

customElements.define('embed-element', EmbedElement);
