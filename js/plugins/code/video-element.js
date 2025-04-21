class VideoElement extends BaseTextElement {
    constructor() {
        super();
        this.videoUrl = null;
        this.MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
        this.loading = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this.videoElement = this.shadowRoot.querySelector('#video-editable');
        this.fileInput = this.shadowRoot.querySelector('#file');
        this.uploadArea = this.shadowRoot.querySelector('.upload-video');
        this.uploadButton = this.shadowRoot.querySelector('#upload-button');
        this.optionsButton = this.shadowRoot.querySelector('#options-button');
        this.optionsDialog = this.shadowRoot.querySelector('#options-dialog');
        this.bindVideoEvents();
        this.bindOptionEvents();
    }

    bindOptionEvents() {
        const optionsButton = this.shadowRoot.querySelector('#options-button');
        const optionsDialog = this.shadowRoot.querySelector('#options-dialog');
        const changeVideoBtn = this.shadowRoot.querySelector('#change-video');
        const fullscreenBtn = this.shadowRoot.querySelector('#fullscreen');
        const downloadBtn = this.shadowRoot.querySelector('#download-video');
        const borderToggle = this.shadowRoot.querySelector('#border-toggle');

        optionsButton?.addEventListener('click', e => {
            e.stopPropagation();
            optionsDialog.style.display = optionsDialog.style.display !== 'flex' ? 'flex' : 'none';
        });

        // Close options dialog when clicking outside
        document.addEventListener('click', e => {
            if (!optionsDialog.contains(e.target) && e.target !== optionsButton) {
                optionsDialog.style.display = 'none';
            }
        });

        changeVideoBtn?.addEventListener('click', () => {
            this.fileInput.click();
            optionsDialog.style.display = 'none';
        });

        fullscreenBtn?.addEventListener('click', async () => {
            if (this.videoUrl) {
                try {
                    // Retrieve the actual blob from the asset store
                    const blob = await wisk.db.getAsset(this.videoUrl);
                    if (blob) {
                        const objectUrl = URL.createObjectURL(blob);
                        window.open(objectUrl, '_blank');
                        // Clean up the object URL after it's opened
                        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
                    }
                } catch (error) {
                    console.error('Error opening fullscreen video:', error);
                }
            }
            optionsDialog.style.display = 'none';
        });

        downloadBtn?.addEventListener('click', async () => {
            if (this.videoUrl) {
                try {
                    wisk.utils.showToast('Downloading video...', 3000);

                    // Get the blob from IndexedDB
                    const blob = await wisk.db.getAsset(this.videoUrl);
                    if (!blob) {
                        throw new Error('Video not found in storage');
                    }

                    const blobUrl = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = blobUrl;

                    // Create a filename from the stored key
                    const filename = this.videoUrl;
                    a.download = filename;

                    document.body.appendChild(a);
                    a.click();

                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(blobUrl);
                } catch (error) {
                    console.error('Error downloading video:', error);
                    wisk.utils.showToast('Failed to download video', 3000);
                }
            }
            this.shadowRoot.querySelector('#options-dialog').style.display = 'none';
        });

        borderToggle?.addEventListener('change', e => {
            const video = this.shadowRoot.querySelector('#video-editable');
            if (e.target.checked) {
                video.style.border = '1px solid var(--border-1)';
            } else {
                video.style.border = 'none';
            }
            this.sendUpdates();
        });
    }

    onVideoSelected(event) {
        const file = event.target.files[0];
        if (file) {
            this.processSelectedFile(file);
        }
    }

    async processSelectedFile(file) {
        if (!this.loading) {
            this.loading = true;
        } else {
            return;
        }

        this.shadowRoot.querySelector('#upload-button').innerText = 'Uploading...';

        try {
            // Check file size
            if (file.size > this.MAX_FILE_SIZE) {
                throw new Error(`File size exceeds the maximum limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
            }

            // Check if it's a video file
            if (!file.type.startsWith('video/')) {
                throw new Error('Selected file is not a valid video');
            }

            // Generate a unique filename with timestamp
            const uniqueUrl = 'video-' + Date.now() + '.' + this.getFileExtension(file.name);

            // Save the blob to IndexedDB asset store
            await wisk.db.saveAsset(uniqueUrl, file);

            this.videoUrl = uniqueUrl;
            this.updateVideo();
            this.sendUpdates();
        } catch (error) {
            console.error('Failed to process video:', error);
            this.shadowRoot.querySelector('#upload-button').innerText = 'Upload failed';
            wisk.utils.showToast(error.message, 5000);
        } finally {
            this.loading = false;
            this.shadowRoot.querySelector('#upload-button').innerText = 'Upload Video';
        }
    }

    getFileExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : 'mp4';
    }

    async updateVideo() {
        if (this.videoUrl) {
            try {
                // Get the blob from IndexedDB
                const blob = await wisk.db.getAsset(this.videoUrl);
                if (blob) {
                    // Create an object URL for display
                    const objectUrl = URL.createObjectURL(blob);
                    this.videoElement.src = objectUrl;

                    // Store the object URL to revoke it later
                    if (this._currentObjectUrl) {
                        URL.revokeObjectURL(this._currentObjectUrl);
                    }
                    this._currentObjectUrl = objectUrl;

                    this.videoElement.style.display = 'block';
                    this.uploadArea.classList.remove('empty');
                    this.uploadArea.classList.add('has-video');
                    this.fileInput.style.display = 'none';
                    this.uploadButton.style.display = 'none';
                    this.optionsButton.style.display = 'block';

                    const container = this.shadowRoot.querySelector('.video-container');
                    if (container) {
                        container.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Error retrieving video from storage:', error);
            }
        } else {
            this.uploadArea.classList.add('empty');
            this.uploadArea.classList.remove('has-video');
            this.optionsButton.style.display = 'none';
            this.videoElement.style.display = 'none';
            const container = this.shadowRoot.querySelector('.video-container');
            if (container) {
                container.style.display = 'none';
            }
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback && super.disconnectedCallback();
        // Clean up any object URLs
        if (this._currentObjectUrl) {
            URL.revokeObjectURL(this._currentObjectUrl);
        }
    }

    bindVideoEvents() {
        this.fileInput.addEventListener('change', this.onVideoSelected.bind(this));
        this.uploadButton.addEventListener('click', e => {
            e.stopPropagation();
            this.fileInput.click();
        });

        // Handle drag and drop
        this.uploadArea.addEventListener('dragover', e => {
            e.preventDefault();
            this.uploadArea.style.background = 'rgba(0, 123, 255, 0.1)';
        });

        this.uploadArea.addEventListener('dragleave', () => {
            if (!this.videoUrl) {
                this.uploadArea.style.background = 'var(--bg-2)';
            }
        });

        this.uploadArea.addEventListener('drop', e => {
            e.preventDefault();
            if (!this.videoUrl) {
                this.uploadArea.style.background = 'var(--bg-2)';
            }
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('video/')) {
                this.processSelectedFile(file);
            } else {
                wisk.utils.showToast('Please drop a valid video file', 3000);
            }
        });
    }

    render() {
        const style = `
            <style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                font-family: var(--font);
                user-select: none;
            }
            .upload-video {
                width: 100%;
                position: relative;
                border-radius: var(--radius);
                min-height: 100px;
            }
            .upload-video.empty {
                padding: var(--padding-4);
                border: 2px dashed var(--border-1);
                flex-wrap: wrap;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: row;
                gap: var(--padding-4);
                cursor: pointer;
            }
            .upload-video.has-video {
                padding: 0;
                border: none;
            }
            .upload-video.has-video:hover #options-button {
                opacity: 1;
            }
            #options-button {
                position: absolute;
                top: 10px;
                right: 10px;
                background: var(--bg-1);
                border: 1px solid var(--border-1);
                border-radius: 100px;
                padding: var(--padding-2);
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.2s;
                z-index: 2;
            }
            #options-dialog {
                position: absolute;
                top: 50px;
                right: 10px;
                background: var(--bg-1);
                border: 1px solid var(--border-1);
                border-radius: var(--radius-large);
                padding: var(--padding-3);
                box-shadow: var(--drop-shadow);
                z-index: 3;
                display: none;
                flex-direction: column;
                gap: var(--gap-1);
            }
            .dialog-option {
                padding: var(--padding-w1);
                display: block;
                width: 100%;
                text-align: left;
                background: none;
                border: none;
                border-radius: var(--radius);
                cursor: pointer;
                color: var(--fg-1);
            }
            .dialog-option:hover {
                background: var(--bg-2);
            }
            .border-toggle {
                display: flex;
                align-items: center;
                font-size: smaller;
            }
            .border-toggle input[type="checkbox"] {
                margin: 0;
            }
            .border-toggle label {
                cursor: pointer;
                padding-right: var(--gap-2);
            }
            #editable {
                outline: none;
                color: var(--fg-2);
                font-size: 14px;
                text-align: left;
                line-height: 1.5;
                margin-top: var(--padding-3);
            }
            #file {
                display: none;
            }
            #upload-button {
                display: flex;
                align-items: flex-start;
                flex-direction: column;
                gap: var(--gap-1);
                padding: var(--padding-3);
                background-color: var(--bg-1);
                color: var(--fg-1);
                border: 1px solid var(--border-1);
                border-radius: var(--radius);
                cursor: pointer;
                flex: 1;
            }

            @media (max-width: 768px) {
                .upload-video.empty {
                    flex-direction: column;
                }
                #upload-button {
                    width: 100%;
                }
            }
            #upload-button:hover {
                background-color: var(--bg-2);
            }
            video {
                max-width: 100%;
                border-radius: var(--radius);
                display: block;
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

            @media (hover: hover) {
                *::-webkit-scrollbar { width: 15px; }
                *::-webkit-scrollbar-track { background: var(--bg-1); }
                *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
                *::-webkit-scrollbar-thumb:hover { background-color: var(--fg-1); }
            }
            .video-container {
                position: relative;
                display: block;
                max-width: 100%;
                margin: 0 auto;
            }

            #video-editable {
                max-width: 100%;
                width: 100%;
                height: auto;
            }

            .video-controls {
                margin-top: 5px;
                display: flex;
                justify-content: space-between;
                align-items: center;
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
            <div class="upload-video empty">
                <input type="file" id="file" accept="video/*" />
                <div class="video-container">
                    <video id="video-editable" controls>
                        Your browser does not support the video tag.
                    </video>
                </div>
                <button id="upload-button"><img src="/a7/plugins/image-element/upload.svg" width="30" height="30" style="filter: var(--themed-svg);">Upload Video</button>
                <button id="options-button" style="display: none;">
                    <img src="/a7/forget/morex.svg" width="22" height="22" style="filter: var(--themed-svg);">
                </button>
                <!-- Options dialog -->
                <div id="options-dialog">
                    <button class="dialog-option" ${wisk.editor.readonly ? 'style="display: none;"' : ''} id="change-video">Change Video</button>
                    <button class="dialog-option" id="download-video">Download Video</button>
                    <button class="dialog-option" id="fullscreen">View Full Size</button>
                    <div class="dialog-option border-toggle" ${wisk.editor.readonly ? 'style="display: none;"' : ''}>
                        <label for="border-toggle">Show Border</label>
                        <input type="checkbox" id="border-toggle" />
                    </div>
                </div>
            </div>
            <p id="editable" contenteditable="${!wisk.editor.readonly}" spellcheck="false" data-placeholder="${this.placeholder}"></p>
                <div class="suggestion-container">
                    <div class="suggestion-actions">
                        <button class="suggestion-button discard-button">Discard</button>
                        <button class="suggestion-button accept-button"> Accept [Tab or Enter] </button>
                    </div>
                </div>
            <div class="emoji-suggestions"></div>
        `;
        this.shadowRoot.innerHTML = style + content;
    }

    getTextContent() {
        const caption = this.editable.innerHTML.trim();
        const videoUrl = this.videoUrl || '';

        return {
            html: `<video src="${videoUrl}" controls></video><p>${caption}</p>`,
            text: caption,
            markdown: `[Video](${videoUrl})${caption ? '\n\n' + caption : ''}`,
        };
    }

    getValue() {
        return {
            textContent: this.editable.innerHTML,
            videoUrl: this.videoUrl,
            showBorder: this.shadowRoot.querySelector('#border-toggle')?.checked || false,
        };
    }

    setValue(path, value) {
        if (path === 'value.append') {
            this.editable.innerHTML += value.textContent;
        } else {
            this.editable.innerHTML = value.textContent;
            if (value.videoUrl) {
                this.videoUrl = value.videoUrl;
                this.updateVideo();
            }
            if (value.showBorder !== undefined) {
                const borderToggle = this.shadowRoot.querySelector('#border-toggle');
                if (borderToggle) {
                    borderToggle.checked = value.showBorder;
                    const video = this.shadowRoot.querySelector('#video-editable');
                    video.style.border = value.showBorder ? '1px solid var(--border-1)' : 'none';
                }
            }
        }
    }
}

customElements.define('video-element', VideoElement);
