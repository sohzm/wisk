class MainElement extends BaseTextElement {
    constructor() {
        super();
        this.placeholder = this.getAttribute('placeholder') || wisk.editor.readonly ? '' : 'edit me';
        this.bannerSize = 'small'; // Can be 'smallest', 'small', 'big', 'bigger', 'biggest'
        this.emoji = this.getAttribute('emoji') || '';
        this.backgroundUrl = null;
        this.MAX_WIDTH = 1920;
        this.MAX_HEIGHT = 1080;
        this.loading = false;

        // Bind the emoji selection handler
        this.handleEmojiSelection = this.handleEmojiSelection.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        this.emojiElement = this.shadowRoot.querySelector('#emoji');
        this.fileInput = this.shadowRoot.querySelector('#background-file');
        this.backgroundUploadButton = this.shadowRoot.querySelector('#background-upload-button');
        this.headerContainer = this.shadowRoot.querySelector('.header-container');
        this.bindHeaderEvents();

        // Add event listener for emoji selection
        window.addEventListener('emoji-selector', this.handleEmojiSelection);
        this.setValue('', { textContent: '' });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        // Clean up event listener
        window.removeEventListener('emoji-selector', this.handleEmojiSelection);

        // Clean up any object URLs
        if (this._currentObjectUrl) {
            URL.revokeObjectURL(this._currentObjectUrl);
        }
    }

    handleEmojiSelection(event) {
        // Only handle events meant for this instance
        if (event.detail.id === this.id) {
            this.emoji = event.detail.emoji;
            this.updateEmoji();
            this.sendUpdates();
        }
    }

    getValue() {
        return {
            textContent: this.editable.innerHTML,
            emoji: this.emoji,
            backgroundUrl: this.backgroundUrl,
            bannerSize: this.bannerSize,
        };
    }

    setValue(path, value) {
        if (path === 'value.append') {
            this.editable.innerHTML += value.textContent;
        } else {
            this.editable.innerHTML = value.textContent;
            if (value.emoji) {
                this.emoji = value.emoji;
                this.updateEmoji();
            }
            if (value.backgroundUrl) {
                this.backgroundUrl = value.backgroundUrl;
                this.updateBackground();
            }
            if (value.bannerSize) {
                this.bannerSize = value.bannerSize;
                this.updateBannerSize();
            }
        }
        this.updatePlaceholder();
    }

    updateBannerSize() {
        if (this.headerContainer) {
            // Remove all size classes first
            this.headerContainer.classList.remove('big-banner', 'bigger-banner', 'biggest-banner', 'smallest-banner');

            // Add appropriate class based on size
            if (this.bannerSize === 'big') {
                this.headerContainer.classList.add('big-banner');
            } else if (this.bannerSize === 'bigger') {
                this.headerContainer.classList.add('bigger-banner');
            } else if (this.bannerSize === 'biggest') {
                this.headerContainer.classList.add('biggest-banner');
            } else if (this.bannerSize === 'smallest') {
                this.headerContainer.classList.add('smallest-banner');
            }

            // Toggle text overlay class
            if (this.bannerSize === 'biggest') {
                this.editable.classList.add('text-overlay');
            } else {
                this.editable.classList.remove('text-overlay');
            }
        }

        if (wisk.editor.readonly) return;

        const bannerSizeButton = this.shadowRoot.querySelector('#banner-size-button');
        bannerSizeButton.textContent = `${this.bannerSize.charAt(0).toUpperCase() + this.bannerSize.slice(1)} Banner`;
    }

    bindHeaderEvents() {
        if (wisk.editor.readonly) return;
        // Emoji picker click handler
        this.emojiElement.addEventListener('click', () => {
            if (wisk.editor.readonly) return;

            // Get the emoji selector component and show it
            const emojiSelector = document.querySelector('emoji-selector');
            if (emojiSelector) {
                emojiSelector.show(this.id);
            }
        });

        // Background image upload handlers
        if (!wisk.editor.readonly) {
            this.fileInput.addEventListener('change', this.onBackgroundSelected.bind(this));
            this.backgroundUploadButton.addEventListener('click', e => {
                e.stopPropagation();
                this.fileInput.click();
            });

            // Drag and drop for background
            this.headerContainer.addEventListener('dragover', e => {
                e.preventDefault();
                this.headerContainer.style.opacity = '0.7';
            });

            this.headerContainer.addEventListener('dragleave', () => {
                this.headerContainer.style.opacity = '1';
            });

            this.headerContainer.addEventListener('drop', e => {
                e.preventDefault();
                this.headerContainer.style.opacity = '1';
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.processBackgroundFile(file);
                }
            });
        }

        const bannerSizeButton = this.shadowRoot.querySelector('#banner-size-button');
        bannerSizeButton.addEventListener('click', () => {
            // Cycle through sizes
            switch (this.bannerSize) {
                case 'small':
                    this.bannerSize = 'big';
                    break;
                case 'big':
                    this.bannerSize = 'bigger';
                    break;
                case 'bigger':
                    this.bannerSize = 'biggest';
                    break;
                case 'biggest':
                    this.bannerSize = 'smallest';
                    break;
                case 'smallest':
                    this.bannerSize = 'small';
                    break;
            }
            this.updateBannerSize();
            this.sendUpdates();
        });
    }

    async onBackgroundSelected(event) {
        const file = event.target.files[0];
        if (file) {
            await this.processBackgroundFile(file);
        }
    }

    getFileExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : 'jpg';
    }

    async processBackgroundFile(file) {
        if (this.loading) return;
        this.loading = true;
        this.backgroundUploadButton.innerText = 'Uploading...';

        try {
            const blobUrl = URL.createObjectURL(file);
            const resizedBlob = await this.resizeImage(blobUrl, file.type);

            // Generate a unique ID for the background image
            const uniqueUrl = 'bg-' + Date.now() + '.' + this.getFileExtension(file.name);

            // Save to IndexedDB asset store
            await wisk.db.setAsset(uniqueUrl, resizedBlob);

            this.backgroundUrl = uniqueUrl;
            this.updateBackground();
            this.sendUpdates();
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Failed to process background:', error);
            this.backgroundUploadButton.innerText = 'Upload failed';
        } finally {
            this.loading = false;
            this.backgroundUploadButton.innerText = 'Add Cover';
        }
    }

    resizeImage(src, fileType) {
        return new Promise((resolve, reject) => {
            if (fileType === 'image/gif') {
                fetch(src)
                    .then(res => res.blob())
                    .then(blob => resolve(blob))
                    .catch(err => reject(err));
                return;
            }

            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                const widthRatio = width / this.MAX_WIDTH;
                const heightRatio = height / this.MAX_HEIGHT;

                if (widthRatio > 1 || heightRatio > 1) {
                    if (widthRatio > heightRatio) {
                        height = Math.round(height * (this.MAX_WIDTH / width));
                        width = this.MAX_WIDTH;
                    } else {
                        width = Math.round(width * (this.MAX_HEIGHT / height));
                        height = this.MAX_HEIGHT;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(blob => resolve(blob), fileType, 0.7);
            };
            img.onerror = reject;
            img.src = src;
        });
    }

    updateEmoji() {
        if (this.emojiElement) {
            if (this.emoji && this.emoji.trim()) {
                this.emojiElement.innerHTML = this.emoji;
                this.emojiElement.classList.remove('empty-emoji');
            } else {
                this.emojiElement.innerHTML = `<span class="add-emoji-text"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width=20 height=20 fill="currentColor" class="size-5"> <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.536-4.464a.75.75 0 1 0-1.061-1.061 3.5 3.5 0 0 1-4.95 0 .75.75 0 0 0-1.06 1.06 5 5 0 0 0 7.07 0ZM9 8.5c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S7.448 7 8 7s1 .672 1 1.5Zm3 1.5c.552 0 1-.672 1-1.5S12.552 7 12 7s-1 .672-1 1.5.448 1.5 1 1.5Z" clip-rule="evenodd" /> </svg>Add emoji</span>`;
                this.emojiElement.classList.add('empty-emoji');
            }
        }
    }

    async updateBackground() {
        if (this.backgroundUrl) {
            try {
                // Retrieve the blob from IndexedDB
                const blob = await wisk.db.getAsset(this.backgroundUrl);
                if (blob) {
                    // Create an object URL for display
                    const objectUrl = URL.createObjectURL(blob);

                    // Store the current object URL to revoke it later
                    if (this._currentObjectUrl) {
                        URL.revokeObjectURL(this._currentObjectUrl);
                    }
                    this._currentObjectUrl = objectUrl;

                    this.headerContainer.style.backgroundImage = `url(${objectUrl})`;
                    this.headerContainer.classList.add('has-background');
                }
            } catch (error) {
                console.error('Error retrieving background from storage:', error);
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
            .header-container {
                padding: 0 max(calc((100% - var(--width)) / 2), var(--padding-4));
                padding-top: 49px;
                background-size: cover;
                background-position: center;
                transition: opacity 0.3s;
                position: relative;
            }
            @media (max-width: 1150px) {
                .header-container {
                    margin-top: 59px;
                    padding-top: 29px;
                    padding-left: 0;
                    padding-right: 0;
                }
            }

            .has-background {
                padding-top: 99px;
                transition: padding-top 0.3s ease;
            }

            .has-background.big-banner {
                padding-top: 228px;
            }

            .has-background.bigger-banner {
                padding-top: 357px;
            }

            .has-background.smallest-banner {
                padding-top: 40px;
            }

            .has-background.biggest-banner {
                padding-top: 486px;
            }

            @media (max-width: 1150px) {
                .header-container {
                    border-radius: var(--radius);
                }
                .has-background {
                    padding-top: 49px;
                }
                .has-background.big-banner {
                    padding-top: 123px;
                }
                .has-background.bigger-banner {
                    padding-top: 197px;
                }
                .has-background.smallest-banner {
                    padding-top: 20px;
                }
                .has-background.biggest-banner {
                    padding-top: 271px;
                }
            }

            .header-content {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                flex-direction: column;
                min-height: 100px;
                position: relative;
            }
            #emoji {
                font-size: 49px;
                cursor: pointer;
                user-select: none;
                background: transparent;
                border-radius: var(--radius);
                transition: background-color 0.2s;
                position: absolute;
                bottom: -27px;
                min-width: 60px;
                min-height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .add-emoji-text {
                font-size: 14px;
                color: var(--text-3);
                opacity: 0.8;
                padding: 4px 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--gap-1);
            }
            .empty-emoji {
                background: var(--bg-2) !important;
                padding: 8px 12px;
            }
            #emoji:hover {
                background: var(--bg-2);
            }
            #editable {
                outline: none;
                position: relative;
                line-height: 1.5;
                font-size: 2.5em;
                font-weight: 700;
                flex-grow: 1;
                background: transparent;
                padding: 8px 12px;
                border-radius: var(--radius);
                padding: 0 max(calc((100% - var(--width)) / 2), var(--padding-4));
                margin-top: 28px;
                transition: all 0.3s ease;
            }
            #editable.text-overlay-x { /* gotta think more about it */
                position: absolute;
                bottom: 40px;
                color: white;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                margin: 0;
                width: 100%;
                left: 0;
            }
            #editable.empty:before {
                content: attr(data-placeholder);
                color: var(--text-3);
                pointer-events: none;
                position: absolute;
                opacity: 0.6;
            }
            #background-upload-button {
                position: absolute;
                bottom: 12px;
                right: 0;
                padding: var(--padding-w1);
                background-color: var(--bg-2);
                color: var(--fg-1);
                border-radius: var(--radius);
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.3s;
                border: none;
            }
            .header-container:hover #background-upload-button {
                opacity: 1;
            }
            #background-upload-button:hover {
                background-color: var(--bg-3);
            }
            #background-file {
                display: none;
            }
            a {
                color: var(--fg-blue);
                text-decoration: underline;
            }
            .add-emoji-text {
                visibility: hidden;
            }
            .header-container:hover .add-emoji-text {
                visibility: visible;
            }
            .emoji-suggestions {
                position: absolute;
                background: var(--bg-1);
                border: 1px solid var(--border-1);
                border-radius: var(--radius);
                padding: var(--padding-2);
                box-shadow: var(--shadow-1);
                display: none;
                z-index: 1000;
                max-height: 200px;
                overflow-y: auto;
                width: max-content;
                min-width: 200px;
            }
            .emoji-suggestion {
                padding: var(--padding-2);
                display: flex;
                align-items: center;
                gap: var(--gap-2);
                cursor: pointer;
                border-radius: var(--radius);
            }
            .emoji-suggestion.selected {
                background: var(--bg-3);
            }
            .emoji-suggestion:hover {
                background: var(--bg-3);
            }
                            .emoji-name {
                color: var(--fg-2);
                font-size: 0.9em;
            }
            .emoji {
                width: 30px;
                text-align: center;
            }
            #banner-size-button {
                position: absolute;
                bottom: 12px;
                right: 94px;
                padding: var(--padding-w1);
                background-color: var(--bg-2);
                border: none;
                color: var(--fg-1);
                border-radius: var(--radius);
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.3s;
            }
            .header-container:hover #banner-size-button {
                opacity: 1;
            }

            #banner-size-button:hover {
                background-color: var(--bg-3);
            }

            @media (hover: hover) {
                *::-webkit-scrollbar { width: 15px; }
                *::-webkit-scrollbar-track { background: var(--bg-1); }
                *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
                *::-webkit-scrollbar-thumb:hover { background-color: var(--fg-1); }
            }
            @media (max-width: 1150px) {
               #editable {
                        padding-left: 0;
                        padding-right: 0;
                }
            }
            .suggestion-text {
                opacity: 0.8;
                color: var(--fg-accent);
            }
            .suggestion-container {
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                padding: var(--padding-2);
                margin-top: 4px;
                display: none;
                z-index: 1;
            }
            .suggestion-actions {
                display: flex;
                gap: var(--gap-2);
                justify-content: center;
            }
            .suggestion-button {
                padding: var(--padding-2) var(--padding-3);
                border-radius: var(--radius);
                border: none;
                background: var(--bg-1);
                outline: none;
                color: var(--fg-1);
                cursor: pointer;
            }
            .suggestion-button:hover {
                background: var(--bg-3);
            }
            .accept-button {
                background: var(--bg-accent);
                color: var(--fg-accent);
                font-weight: bold;
            }
            </style>
        `;
        const content = `
            <div class="header-container">
                ${
                    !wisk.editor.readonly
                        ? `
                    <input type="file" id="background-file" accept="image/*" />
                `
                        : ''
                }
                <div class="header-content">
                    <div id="emoji">${this.emoji && this.emoji.trim() ? this.emoji : '<span class="add-emoji-text"><svg xmlns="http://www.w3.org/2000/svg" width=20 height=20 viewBox="0 0 20 20" fill="currentColor" class="size-5"> <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.536-4.464a.75.75 0 1 0-1.061-1.061 3.5 3.5 0 0 1-4.95 0 .75.75 0 0 0-1.06 1.06 5 5 0 0 0 7.07 0ZM9 8.5c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S7.448 7 8 7s1 .672 1 1.5Zm3 1.5c.552 0 1-.672 1-1.5S12.552 7 12 7s-1 .672-1 1.5.448 1.5 1 1.5Z" clip-rule="evenodd" /> </svg>Add emoji</span>'}</div>
                    ${
                        !wisk.editor.readonly
                            ? `
                        <button id="background-upload-button">Add Cover</button>
                        <button id="banner-size-button">Small Banner</button>
                    `
                            : ''
                    }
                </div>
            </div>
            <h1 id="editable" contenteditable="${!wisk.editor.readonly}" spellcheck="false" data-placeholder="${this.placeholder}"></h1>
            <div class="suggestion-container">
                <div class="suggestion-actions">
                    <button class="suggestion-button accept-button">Accept</button>
                    <button class="suggestion-button discard-button">Discard</button>
                </div>
            </div>
            <div class="emoji-suggestions"></div>`;
        this.shadowRoot.innerHTML = style + content;
    }

    getTextContent() {
        return {
            html: `<h1>${this.emoji} ${this.editable.innerHTML}</h1>`,
            text: `${this.emoji} ${this.editable.innerText}`,
            markdown: `# ${this.emoji} ${this.editable.innerText}`,
        };
    }

    showEmojiSuggestions(query, range) {
        const emojiSelector = document.querySelector('emoji-selector');
        if (!emojiSelector) return;

        this.emojiSuggestions = emojiSelector.searchDiscordEmojis(query);

        if (this.emojiSuggestions.length > 0) {
            const editableRect = this.editable.getBoundingClientRect();
            const rangeRect = range.getBoundingClientRect();

            this.emojiSuggestionsContainer.style.display = 'block';

            this.emojiSuggestionsContainer.style.left = `max(calc((100% - var(--width)) / 2), var(--padding-4))`;
            this.emojiSuggestionsContainer.style.top = `100%`;
            this.emojiSuggestionsContainer.style.width = `calc(100% - calc(max(calc((100% - var(--width)) / 2), var(--padding-4)) * 2))`;

            this.renderEmojiSuggestions();
            this.showingEmojiSuggestions = true;
            this.selectedEmojiIndex = 0;
        } else {
            this.hideEmojiSuggestions();
        }
    }

    getTextContent() {
        return {
            html: this.editable.innerHTML,
            text: this.editable.innerText,
            markdown: '# ' + wisk.editor.htmlToMarkdown(this.editable.innerHTML),
        };
    }
}

customElements.define('main-element', MainElement);
