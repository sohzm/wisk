class LinkElement extends HTMLElement {
    static instances = new Set();

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['url', 'title', 'icon', 'display'];
    }

    connectedCallback() {
        LinkElement.instances.add(this);
        this.render();
        this.bindEvents();
        if (this.isInternal) {
            setTimeout(() => this.fetchInternalPageTitle(), 100);
        }
    }

    disconnectedCallback() {
        if (this._titleUpdateTimer) {
            clearTimeout(this._titleUpdateTimer);
            this._titleUpdateTimer = null;
        }

        LinkElement.instances.delete(this);
    }

    attributeChangedCallback(name, oldVal, newVal) {
        
        if (oldVal !== newVal && this.isConnected) {
            this.render();
            this.bindEvents();
        }
    }

    get url() {
        return this.getAttribute('url') || '';
    }

    get title() {
        return this.getAttribute('title') || '';
    }

    get icon() {
        return this.getAttribute('icon') || '';
    }

    get displayMode() {
        return this.getAttribute('display') || 'inline';
    }

    get isInternal() {
        if (!this.url) return false;
        if (this.url.startsWith('https://app.wisk.cc')) return true;
        
        try {
            const urlObj = new URL(this.url);
            const currentOrigin = window.location.origin;
            
            if (urlObj.origin === currentOrigin && urlObj.searchParams.has('id')) return true;
        } catch {}
        
        return false;
    }

    async fetchInternalPageTitle() {
        
        if (!this.isInternal) {
            return;
        }

        try {
            const urlObj = new URL(this.url);
            const pageId = urlObj.searchParams.get('id');
            if (!pageId) {
                return;
            }
            const pageData = await wisk.db.getPage(pageId);

            if (!pageData || !pageData.data || !pageData.data.config) {
                return;
            }

            const pageTitle = pageData.data.config.name || 'Untitled';
            let pageIcon = '/js/plugins/icons/page.svg';
            
            if (pageData.data.elements && 
                pageData.data.elements.length > 0 && 
                pageData.data.elements[0].value && 
                pageData.data.elements[0].value.emoji) {
                pageIcon = pageData.data.elements[0].value.emoji;
            }

            if (this.title !== pageTitle) {
                this.setAttribute('title', pageTitle);
            }
            
            if (this.icon !== pageIcon) {
                this.setAttribute('icon', pageIcon);
            }
            
            if (this.id && typeof wisk.editor.justUpdates === 'function') {
                wisk.editor.justUpdates(this.id);
            }

        } catch (error) {
            console.error('[LinkElement] ✗ Error fetching page title:', error);
        }
    }

    static refreshAllInternalLinks() {
        LinkElement.instances.forEach((link) => {
            if (link.isInternal) {
                link.fetchInternalPageTitle();
            }
        });
    }

    getValue() {
        const value = {
            url: this.url,
            display: this.displayMode
        };

        if (this.title) {
            value.title = this.title;
        }

        if (this.isInternal && this.icon) {
            value.icon = this.icon;
        }
        return value;
    }

    setValue(path, value) {

        if (value.url) this.setAttribute('url', value.url);
        if (value.title) this.setAttribute('title', value.title);
        if (value.icon) this.setAttribute('icon', value.icon);
        if (value.display) this.setAttribute('display', value.display);

        if (this.isInternal) {
            setTimeout(() => this.fetchInternalPageTitle(), 100);
        }
    }

    getTextContent() {
        const displayText = this.title || this.url;
        return {
            html: this.escapeHtml(displayText),
            text: displayText,
            markdown: `[${displayText}](${this.url})`
        };
    }

    focus(identifier) {
        const editable = this.shadowRoot.querySelector('[contenteditable="true"]');
        if (editable) {
            editable.focus();
            if (identifier && typeof identifier.x === 'number') {
                try {
                    const sel = this.shadowRoot.getSelection?.() || window.getSelection() || document.getSelection();

                    if (!sel) {
                        console.warn('[LinkElement] Selection API not available');
                        return;
                    }

                    const range = document.createRange();
                    const textNode = editable.firstChild;
                    if (textNode) {
                        const pos = Math.min(identifier.x, textNode.length);
                        range.setStart(textNode, pos);
                        range.setEnd(textNode, pos);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                } catch (error) {
                    console.warn('[LinkElement] Failed to set cursor position:', error);
                }
            }
        } else {
            const wrapper = this.shadowRoot.querySelector('.link-wrapper');
            if (wrapper) {
                wrapper.focus();
            }
        }
    }

    bindEvents() {
        const wrapper = this.shadowRoot.querySelector('.link-wrapper');
        if (wrapper) {
            wrapper.onclick = (e) => {
                if (e.target.closest('[contenteditable="true"]')) return;
                this.openLink();
            };

            if (this.displayMode === 'block' && !this.isInternal) {
                wrapper.setAttribute('tabindex', '0');
                wrapper.onkeydown = (e) => {
                    this.handleBlockKeyDown(e);
                };
            }
        }

        const openBtn = this.shadowRoot.querySelector('.open-btn');
        if (openBtn) {
            openBtn.onclick = (e) => {
                e.stopPropagation();
                this.openLink();
            };
        }

        const editable = this.shadowRoot.querySelector('[contenteditable="true"]');
        if (editable) {
            editable.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    wisk.editor.createNewBlock(this.id, 'text-element', { textContent: '' }, { x: 0 });
                }
                if (e.key === 'Backspace' && editable.innerText.length === 0) {
                    e.preventDefault();
                    wisk.editor.deleteBlock(this.id);
                }
                if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    const sel = this.shadowRoot.getSelection?.() || window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                        const range = sel.getRangeAt(0);
                        if (range.collapsed && range.startOffset === 0) {
                            e.preventDefault();
                            const prevElement = wisk.editor.prevElement(this.id);
                            if (prevElement) {
                                wisk.editor.focusBlock(prevElement.id, { x: prevElement.value?.textContent?.length || 0 });
                            }
                        }
                    }
                }
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    const sel = this.shadowRoot.getSelection?.() || window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                        const range = sel.getRangeAt(0);
                        if (range.collapsed && range.startOffset === editable.innerText.length) {
                            e.preventDefault();
                            const nextElement = wisk.editor.nextElement(this.id);
                            if (nextElement) {
                                wisk.editor.focusBlock(nextElement.id, { x: 0 });
                            }
                        }
                    }
                }
            };

            editable.oninput = () => {
                const newTitle = editable.innerText;
                this.setAttribute('title', newTitle);

                if (this.isInternal) {
                    if (this._titleUpdateTimer) {
                        clearTimeout(this._titleUpdateTimer);
                    }
                    this._titleUpdateTimer = setTimeout(() => {
                        if (this._lastSavedTitle !== newTitle) {
                            this._lastSavedTitle = newTitle;
                            this.updateLinkedPageTitle(newTitle);
                        }
                    }, 400);
                }

                wisk.editor.justUpdates(this.id);
            };
        }
    }

    handleBlockKeyDown(event) {
        switch (event.key) {
            case 'Backspace':
            case 'Delete':
                event.preventDefault();
                wisk.editor.deleteBlock(this.id);
                break;
            case 'Enter':
                event.preventDefault();
                wisk.editor.createNewBlock(this.id, 'text-element', { textContent: '' }, { x: 0 });
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                event.preventDefault();
                const prevElement = wisk.editor.prevElement(this.id);
                if (prevElement) {
                    wisk.editor.focusBlock(prevElement.id, { x: prevElement.value?.textContent?.length || 0 });
                }
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                event.preventDefault();
                const nextElement = wisk.editor.nextElement(this.id);
                if (nextElement) {
                    wisk.editor.focusBlock(nextElement.id, { x: 0 });
                }
                break;
        }
    }

    async updateLinkedPageTitle(newTitle) {
        try {
            const urlObj = new URL(this.url);
            const pageId = urlObj.searchParams.get('id');
            
            if (!pageId) return;

            const pageData = await wisk.db.getPage(pageId);
            
            if (pageData && pageData.data && pageData.data.config) {
                pageData.data.config.name = newTitle;
                pageData.lastUpdated = Date.now();
                await wisk.db.setPage(pageId, pageData);
            }
        } catch (error) {
            console.error('[LinkElement] ✗ Error updating linked page title:', error);
        }
    }

    openLink() {
        
        if (!this.url) return;

        if (this.isInternal) {
            window.location.href = this.url;
        } else {
            let url = this.url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            window.open(url, '_blank');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    render() {
        const isBlock = this.displayMode === 'block';
        if (isBlock) {
            if (this.isInternal) {
                const displayTitle = this.escapeHtml(this.title || 'Untitled');

                this.shadowRoot.innerHTML = `
                    <style>
                        :host { display: block; }
                        * { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--font); }
                        .link-wrapper {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            padding: 12px;
                            border-radius: var(--radius);
                            cursor: pointer;
                            transition: background 0.15s;
                        }
                        .link-wrapper:hover { background: var(--bg-2); }
                        .icon {
                            width: 20px;
                            height: 20px;
                            flex-shrink: 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .icon img {
                            width: 100%;
                            height: 100%;
                            object-fit: contain;
                            filter: var(--themed-svg);
                        }
                        .icon .emoji { font-size: 18px; line-height: 1; }
                        .title {
                            flex: 1;
                            outline: none;
                            color: var(--fg-1);
                            min-width: 0;
                        }
                        .title:empty:before {
                            content: 'Untitled';
                            color: var(--fg-3);
                        }
                        /* .open-btn {
                            opacity: 0;
                            padding: 4px 8px;
                            background: var(--bg-3);
                            border: none;
                            border-radius: var(--radius);
                            cursor: pointer;
                            font-size: 12px;
                            color: var(--fg-2);
                            transition: opacity 0.15s;
                        }
                        .link-wrapper:hover .open-btn { opacity: 1; }
                        .open-btn:hover { background: var(--bg-accent); color: var(--fg-accent); } */
                    </style>
                    <div class="link-wrapper">
                        <div class="icon"></div>
                        <div class="title">${displayTitle}</div>
                        <!-- <button class="open-btn">Open</button> -->
                    </div>
                `;
                const iconContainer = this.shadowRoot.querySelector('.icon');
                const iconValue = this.icon || '/js/plugins/icons/page.svg';
                const isEmoji = iconValue && !iconValue.endsWith('.svg') && !iconValue.startsWith('/') && !iconValue.startsWith('http');

                if (isEmoji) {
                    const emojiSpan = document.createElement('span');
                    emojiSpan.className = 'emoji';
                    emojiSpan.textContent = iconValue;
                    iconContainer.appendChild(emojiSpan);
                } else {
                    const img = document.createElement('img');
                    if (iconValue.startsWith('/') || iconValue.startsWith('http://localhost') || iconValue.startsWith('https://')) {
                        img.src = iconValue;
                    } else {
                        img.src = '/js/plugins/icons/page.svg';
                    }
                    img.alt = '';
                    iconContainer.appendChild(img);
                }
            } else {
                const displayUrl = this.escapeHtml(this.url);

                this.shadowRoot.innerHTML = `
                    <style>
                        :host { display: block; }
                        * { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--font); }
                        .link-wrapper {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            padding: 12px;
                            border: 1px solid var(--border-1);
                            border-radius: var(--radius);
                            cursor: pointer;
                            transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
                            outline: none;
                        }
                        .link-wrapper:hover { background: var(--bg-2); }
                        .link-wrapper:focus {
                            border-color: var(--fg-accent);
                            box-shadow: 0 0 0 2px var(--bg-accent);
                        }
                        .link-icon {
                            width: 16px;
                            height: 16px;
                            flex-shrink: 0;
                            color: var(--fg-2);
                        }
                        .url {
                            flex: 1;
                            color: var(--fg-accent);
                            text-decoration: underline;
                            word-break: break-all;
                            min-width: 0;
                        }
                        .open-btn {
                            opacity: 0;
                            padding: 4px 8px;
                            background: var(--bg-3);
                            border: none;
                            border-radius: var(--radius);
                            cursor: pointer;
                            font-size: 12px;
                            color: var(--fg-2);
                            transition: opacity 0.15s;
                        }
                        .link-wrapper:hover .open-btn { opacity: 1; }
                        .open-btn:hover { background: var(--bg-accent); color: var(--fg-accent); }
                    </style>
                    <div class="link-wrapper">
                        <svg class="link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        <span class="url">${displayUrl}</span>
                        <button class="open-btn">Open ↗</button>
                    </div>
                `;
            }
        } else {
            const displayText = this.escapeHtml(this.title || this.url);

            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: inline;
                        cursor: pointer;
                        pointer-events: auto;
                    }
                    .link-wrapper {
                        color: var(--fg-accent);
                        text-decoration: underline;
                        display: inline;
                    }
                    .link-wrapper:hover { opacity: 0.8; }
                </style>
                <span class="link-wrapper">${displayText}</span>
            `;
        }
    }
}

customElements.define('link-element', LinkElement);

// Auto-refresh all links when page loads
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        LinkElement.refreshAllInternalLinks();
    }, 500);
});
