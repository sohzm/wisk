class ImageElement extends BaseTextElement {
    constructor() {
        super();
        this.imageUrl = null;
        this.MAX_WIDTH = 1920;
        this.MAX_HEIGHT = 1080;
        this.loading = false;
        this.isDragging = false;
        this.currentResizeHandle = null;
        this.startX = 0;
        this.startWidth = 0;
    }

    connectedCallback() {
        super.connectedCallback();
        this.imageElement = this.shadowRoot.querySelector('#img-editable');
        this.fileInput = this.shadowRoot.querySelector('#file');
        this.uploadArea = this.shadowRoot.querySelector('.upload-img');
        this.uploadButton = this.shadowRoot.querySelector('#upload-button');
        this.linkButton = this.shadowRoot.querySelector('#link-button');
        this.searchGifsButton = this.shadowRoot.querySelector('#search-gifs-btn');
        this.optionsButton = this.shadowRoot.querySelector('#options-button');
        this.optionsDialog = this.shadowRoot.querySelector('#options-dialog');
        this.bindImageEvents();
        this.bindOptionEvents();
        this.bindResizeEvents();
        this.bindLinkDialogEvents();
    }

    bindLinkDialogEvents() {
        const linkDialog = this.shadowRoot.querySelector('#link-dialog');
        const linkButton = this.shadowRoot.querySelector('#link-button');
        const closeLinkDialog = this.shadowRoot.querySelector('#close-link-dialog');
        const cancelLink = this.shadowRoot.querySelector('#cancel-link');
        const addLink = this.shadowRoot.querySelector('#add-link');
        const imageUrlInput = this.shadowRoot.querySelector('#image-url-input');

        const closeDialog = () => {
            linkDialog.style.display = 'none';
            imageUrlInput.value = '';
        };

        linkButton?.addEventListener('click', () => {
            linkDialog.style.display = 'flex';
            imageUrlInput.focus();
        });

        closeLinkDialog?.addEventListener('click', closeDialog);
        cancelLink?.addEventListener('click', closeDialog);

        // Close dialog when clicking outside
        linkDialog?.addEventListener('click', e => {
            if (e.target === linkDialog) {
                closeDialog();
            }
        });

        addLink?.addEventListener('click', async () => {
            const url = imageUrlInput.value.trim();
            if (url) {
                // Show loading state
                addLink.textContent = 'Loading...';
                addLink.disabled = true;

                try {
                    // Create a fetch request to download the image
                    const response = await fetch(url);

                    if (!response.ok) {
                        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
                    }

                    // Get the image as a blob
                    const blob = await response.blob();

                    // Validate that it's an image
                    if (!blob.type.startsWith('image/')) {
                        throw new Error('The URL did not point to a valid image');
                    }

                    // Generate a unique filename with the correct extension
                    const extension = this.getFileExtension(url);
                    const uniqueUrl = 'image-' + Date.now() + '.' + extension;

                    // Save to asset store
                    await wisk.db.setAsset(uniqueUrl, blob);

                    // Update the component with the new image
                    this.imageUrl = uniqueUrl;
                    this.updateImage();
                    this.sendUpdates();

                    // Close the dialog
                    closeDialog();

                    wisk.utils.showToast('Image successfully added', 3000);
                } catch (error) {
                    console.error('Error loading image:', error);
                    wisk.utils.showToast('Failed to load image. Please check the URL and try again.', 5000);
                } finally {
                    // Reset the button state
                    addLink.textContent = 'Add Image';
                    addLink.disabled = false;
                }
            }
        });

        // Handle Enter key in input
        imageUrlInput?.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                addLink.click();
            }
        });
    }

    bindResizeEvents() {
        const container = this.shadowRoot.querySelector('.image-container');
        if (!container) return;

        // Mouse down event for resize handles
        container.addEventListener('mousedown', e => {
            if (e.target.classList.contains('resize-handle')) {
                this.isDragging = true;
                this.currentResizeHandle = e.target;
                this.startX = e.clientX;
                this.startWidth = this.imageElement.offsetWidth;
                e.preventDefault();
            }
        });

        // Mouse move event for resizing
        document.addEventListener('mousemove', e => {
            if (!this.isDragging) return;

            const deltaX = e.clientX - this.startX;
            let newWidth;

            if (this.currentResizeHandle.classList.contains('right-handle')) {
                newWidth = this.startWidth + deltaX;
            } else if (this.currentResizeHandle.classList.contains('left-handle')) {
                newWidth = this.startWidth - deltaX;
            }

            // Ensure width stays within reasonable bounds
            newWidth = Math.min(Math.max(100, newWidth), this.MAX_WIDTH);
            this.imageElement.style.width = `${newWidth}px`;
        });

        // Mouse up event to stop resizing
        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.currentResizeHandle = null;
                this.sendUpdates();
            }
        });
    }

    getFileExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : 'jpg';
    }

    async searchGifs(query) {
        if (!query.trim()) {
            this.shadowRoot.querySelector('.gif-results').innerHTML = '';
            return;
        }

        try {
            const response = await fetch(wisk.editor.backendUrl + '/v1/gif', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                throw new Error('GIF search failed');
            }

            const gifs = await response.json();
            this.displayGifResults(gifs);
        } catch (error) {
            console.error('GIF search error:', error);
            this.shadowRoot.querySelector('.gif-results').innerHTML =
                '<div style="color: var(--fg-2); text-align: center; grid-column: 1/-1;">Error searching GIFs</div>';
        }
    }

    displayGifResults(gifs) {
        const resultsContainer = this.shadowRoot.querySelector('.gif-results');
        resultsContainer.innerHTML = '';

        if (!gifs.gifs || !gifs.gifs.length) {
            resultsContainer.innerHTML = '<div style="color: var(--fg-2); text-align: center; grid-column: 1/-1;">No GIFs found</div>';
            return;
        }

        gifs.gifs.forEach(gif => {
            const gifElement = document.createElement('div');
            gifElement.className = 'gif-item';
            gifElement.innerHTML = `<img src="${gif.mini_url}" alt="${gif.title || 'GIF'}" loading="lazy">`;

            gifElement.addEventListener('click', async () => {
                try {
                    // Download and store the GIF in IndexedDB
                    const response = await fetch(gif.url);
                    const blob = await response.blob();
                    const uniqueUrl = 'gif-' + Date.now() + '.gif';

                    // Save to asset store
                    await wisk.db.setAsset(uniqueUrl, blob);

                    this.imageUrl = uniqueUrl;
                    this.updateImage();
                    this.sendUpdates();

                    this.shadowRoot.querySelector('#gif-search-dialog').style.display = 'none';
                } catch (error) {
                    console.error('Error selecting GIF:', error);
                }
            });

            resultsContainer.appendChild(gifElement);
        });
    }

    bindOptionEvents() {
        const optionsButton = this.shadowRoot.querySelector('#options-button');
        const optionsDialog = this.shadowRoot.querySelector('#options-dialog');
        const changeImageBtn = this.shadowRoot.querySelector('#change-image');
        const searchGifBtn = this.shadowRoot.querySelector('#search-gif');
        const addLinkMenuBtn = this.shadowRoot.querySelector('#add-link-menu'); // Changed ID here
        const linkImageBtn = this.shadowRoot.querySelector('#link-button');
        const searchGifBtn2 = this.shadowRoot.querySelector('#search-gifs-btn');
        const fullscreenBtn = this.shadowRoot.querySelector('#fullscreen');
        const downloadBtn = this.shadowRoot.querySelector('#download-image');
        const borderToggle = this.shadowRoot.querySelector('#border-toggle');
        const gifSearchDialog = this.shadowRoot.querySelector('#gif-search-dialog');
        const gifSearchInput = this.shadowRoot.querySelector('#gif-search-input');
        const closeGifSearch = this.shadowRoot.querySelector('#close-gif-search');

        // Ensure the dialog is accessible in the DOM
        if (!gifSearchDialog) {
            console.error('GIF search dialog not found in the DOM');
            return;
        }

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

        changeImageBtn?.addEventListener('click', () => {
            this.fileInput.click();
            optionsDialog.style.display = 'none';
        });

        fullscreenBtn?.addEventListener('click', async () => {
            if (this.imageUrl) {
                try {
                    // Retrieve the actual blob from the asset store
                    const blob = await wisk.db.setAsset(this.imageUrl);
                    if (blob) {
                        const objectUrl = URL.createObjectURL(blob);
                        window.open(objectUrl, '_blank');
                        // Clean up the object URL after it's opened
                        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
                    }
                } catch (error) {
                    console.error('Error opening fullscreen image:', error);
                }
            }
            optionsDialog.style.display = 'none';
        });

        downloadBtn?.addEventListener('click', async () => {
            if (this.imageUrl) {
                try {
                    wisk.utils.showToast('Downloading image...', 3000);

                    // Get the blob from IndexedDB
                    const blob = await wisk.db.getAsset(this.imageUrl);
                    if (!blob) {
                        throw new Error('Image not found in storage');
                    }

                    const blobUrl = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = blobUrl;

                    // Create a filename from the stored key
                    const filename = this.imageUrl;
                    a.download = filename;

                    document.body.appendChild(a);
                    a.click();

                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(blobUrl);
                } catch (error) {
                    console.error('Error downloading image:', error);
                    wisk.utils.showToast('Failed to download image', 3000);
                }
            }
            this.shadowRoot.querySelector('#options-dialog').style.display = 'none';
        });

        borderToggle?.addEventListener('change', e => {
            const img = this.shadowRoot.querySelector('#img-editable');
            if (e.target.checked) {
                img.style.border = '1px solid var(--border-1)';
            } else {
                img.style.border = 'none';
            }
            this.sendUpdates();
        });

        // GIF search functionality
        searchGifBtn?.addEventListener('click', () => {
            gifSearchDialog.style.display = 'flex';
            optionsDialog.style.display = 'none';
            gifSearchInput?.focus();
        });

        addLinkMenuBtn?.addEventListener('click', () => {
            this.shadowRoot.querySelector('#link-dialog').style.display = 'flex';
            optionsDialog.style.display = 'none';
        });

        searchGifBtn2?.addEventListener('click', () => {
            gifSearchDialog.style.display = 'flex';
            gifSearchInput?.focus();
        });

        closeGifSearch?.addEventListener('click', () => {
            gifSearchDialog.style.display = 'none';
        });

        let searchTimeout;
        gifSearchInput?.addEventListener('input', e => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchGifs(this.shadowRoot.querySelector('#gif-search-input').value);
            }, 500);
        });
    }

    onImageSelected(event) {
        const file = event.target.files[0];
        if (file) {
            this.processSelectedFile(file);
        }
    }

    async processSelectedFile(file, isGif = false) {
        if (!this.loading) {
            this.loading = true;
        } else {
            return;
        }

        this.shadowRoot.querySelector('#upload-button').innerText = 'Uploading...';

        try {
            const blobUrl = URL.createObjectURL(file);
            let finalBlob;

            if (isGif) {
                finalBlob = file;
            } else {
                finalBlob = await this.resizeImage(blobUrl, file.type);
            }

            // Generate a unique filename with timestamp
            const uniqueUrl = 'image-' + Date.now() + '.' + this.getFileExtension(file.name);

            // Save the blob to IndexedDB asset store
            await wisk.db.setAsset(uniqueUrl, finalBlob);

            this.imageUrl = uniqueUrl;
            this.updateImage();
            this.sendUpdates();
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Failed to process image:', error);
            this.shadowRoot.querySelector('#upload-button').innerText = 'Upload failed';
        } finally {
            this.loading = false;
            this.shadowRoot.querySelector('#upload-button').innerText = 'Upload Image';
        }
    }

    resizeImage(src, fileType) {
        return new Promise((resolve, reject) => {
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

                const steps = Math.ceil(Math.log2(Math.max(img.width / width, img.height / height)));
                let currentWidth = img.width;
                let currentHeight = img.height;
                let currentCanvas = document.createElement('canvas');
                let currentContext = currentCanvas.getContext('2d');

                currentCanvas.width = img.width;
                currentCanvas.height = img.height;
                currentContext.imageSmoothingEnabled = true;
                currentContext.imageSmoothingQuality = 'high';
                currentContext.drawImage(img, 0, 0);

                for (let i = 0; i < steps; i++) {
                    const targetWidth = Math.max(width, Math.floor(currentWidth / 2));
                    const targetHeight = Math.max(height, Math.floor(currentHeight / 2));

                    const nextCanvas = document.createElement('canvas');
                    nextCanvas.width = targetWidth;
                    nextCanvas.height = targetHeight;

                    const nextContext = nextCanvas.getContext('2d');
                    nextContext.imageSmoothingEnabled = true;
                    nextContext.imageSmoothingQuality = 'high';
                    nextContext.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);

                    currentCanvas = nextCanvas;
                    currentContext = nextContext;
                    currentWidth = targetWidth;
                    currentHeight = targetHeight;
                }

                if (currentWidth !== width || currentHeight !== height) {
                    const finalCanvas = document.createElement('canvas');
                    finalCanvas.width = width;
                    finalCanvas.height = height;

                    const finalContext = finalCanvas.getContext('2d');
                    finalContext.imageSmoothingEnabled = true;
                    finalContext.imageSmoothingQuality = 'high';

                    finalContext.drawImage(currentCanvas, 0, 0, width, height);
                    currentCanvas = finalCanvas;
                }

                currentCanvas.toBlob(blob => resolve(blob), fileType, 0.9);
            };

            img.onerror = reject;
            img.src = src;
        });
    }

    async updateImage() {
        if (this.imageUrl) {
            try {
                // Get the blob from IndexedDB
                const blob = await wisk.db.getAsset(this.imageUrl);
                if (blob) {
                    // Create an object URL for display
                    const objectUrl = URL.createObjectURL(blob);
                    this.imageElement.src = objectUrl;

                    // Store the object URL to revoke it later
                    if (this._currentObjectUrl) {
                        URL.revokeObjectURL(this._currentObjectUrl);
                    }
                    this._currentObjectUrl = objectUrl;

                    this.imageElement.style.display = 'block';
                    this.uploadArea.classList.remove('empty');
                    this.uploadArea.classList.add('has-image');
                    this.fileInput.style.display = 'none';
                    this.uploadButton.style.display = 'none';
                    this.searchGifsButton.style.display = 'none';
                    this.linkButton.style.display = 'none';
                    this.optionsButton.style.display = 'block';

                    const container = this.shadowRoot.querySelector('.image-container');
                    if (container) {
                        container.style.display = 'table';
                    }
                }
            } catch (error) {
                console.error('Error retrieving image from storage:', error);
            }
        } else {
            this.uploadArea.classList.add('empty');
            this.uploadArea.classList.remove('has-image');
            this.optionsButton.style.display = 'none';
            this.imageElement.style.display = 'none';
            const container = this.shadowRoot.querySelector('.image-container');
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

    bindImageEvents() {
        this.fileInput.addEventListener('change', this.onImageSelected.bind(this));
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
            if (!this.imageUrl) {
                this.uploadArea.style.background = 'var(--bg-2)';
            }
        });

        this.uploadArea.addEventListener('drop', e => {
            e.preventDefault();
            if (!this.imageUrl) {
                this.uploadArea.style.background = 'var(--bg-2)';
            }
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.processSelectedFile(file);
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
            .upload-img {
                width: 100%;
                position: relative;
                border-radius: var(--radius);
                min-height: 100px;
            }
            .upload-img.empty {
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
            .upload-img.has-image {
                padding: 0;
                border: none;
            }
            .upload-img.has-image:hover #options-button {
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
            #upload-button, #search-gifs-btn, #link-button {
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
                .upload-img.empty {
                    flex-direction: column;
                }
                #upload-button, #search-gifs-btn, #link-button {
                    width: 100%;
                }
            }
            #upload-button:hover, #search-gifs-btn:hover, #link-button:hover {
                background-color: var(--bg-2);
            }
            img {
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
            .image-container {
                position: relative;
                display: table;
                max-width: 100%;
                margin: 0 auto;
            }

            .resize-handle {
                position: absolute;
                top: 0;
                bottom: 0;
                width: 10px;
                background: transparent;
                cursor: ew-resize;
            }

            .left-handle {
                left: 0;
            }

            .right-handle {
                right: 0;
            }

            .resize-handle:hover {
                background: var(--fg-accent);
            }

            #img-editable {
                max-width: 100%;
                width: auto;
                height: auto;
            }

            #gif-search-dialog {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) translateZ(0px);
                background: var(--bg-1);
                border: 1px solid var(--border-1);
                border-radius: var(--radius-large);
                padding: var(--padding-4);
                filter: var(--drop-shadow) var(--drop-shadow);
                z-index: 1000;
                width: 90%;
                height: 80%;
                max-width: 600px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                gap: var(--gap-2);
            }

            @media (max-width: 768px) {
                #gif-search-dialog {
                    top: 20%;
                    left: 0;
                    transform: unset;
                    width: 100%;
                    height: calc(80% - 50px);
                    max-width: unset;
                    max-height: unset;
                    border-radius: 0;
                    border-top-right-radius: var(--radius-large);
                    border-top-left-radius: var(--radius-large);
                    border: none;
                    border-top: 1px solid var(--border-1);
                }
            }

            .gif-search-header {
                display: flex;
                gap: var(--gap-1);
                align-items: center;
                border-radius: var(--radius);
                background: var(--bg-3);
            }

            #gif-search-input {
                flex: 1;
                padding: var(--padding-w2);
                outline: none;
                border: none;
                border-radius: 0;
                background: transparent;
                color: var(--fg-1);
            }

            #close-gif-search {
                background: none;
                border: none;
                border-radius: 100px;
                color: var(--fg-1);
                font-size: 24px;
                cursor: pointer;
                padding: var(--padding-2);
            }

            #close-gif-search:hover {
                background: var(--bg-2);
            }


            #close-gif-search img {
                width: 20px;
                height: 20px;
                filter: var(--themed-svg);
            }

            .gif-results {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: var(--gap-2);
                overflow-y: auto;
                max-height: calc(80vh - 100px);
                padding: var(--padding-2);
            }

            .gif-item {
                cursor: pointer;
                border-radius: var(--radius);
                transition: transform 0.2s;
            }

            .gif-item:hover {
            }

            .gif-item img {
                width: 100%;
                height: 150px;
                object-fit: cover;
            }

            .image-container:has(img[src=""]), .image-container:has(img:not([src])), img[src=""], img:not([src]) {
                display: none;
            }

            .modal-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }

            .link-dialog-content {
                background: var(--bg-1);
                border: 1px solid var(--border-1);
                border-radius: var(--radius-large);
                padding: var(--padding-4);
                width: 90%;
                max-width: 500px;
                cursor: default;
            }

            .link-dialog-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--padding-4);
            }

            .link-dialog-header h3 {
                margin: 0;
                color: var(--fg-1);
            }

            .link-dialog-header button {
                background: none;
                border: none;
                cursor: pointer;
                padding: var(--padding-2);
                border-radius: 100px;
            }

            .link-dialog-header button:hover {
                background: var(--bg-2);
            }

            .link-dialog-body {
                display: flex;
                flex-direction: column;
                gap: var(--gap-3);
            }

            #image-url-input {
                width: 100%;
                padding: var(--padding-3);
                border: 1px solid var(--border-1);
                border-radius: var(--radius);
                outline: none;
                background: var(--bg-2);
                color: var(--fg-1);
            }

            .link-dialog-buttons {
                display: flex;
                justify-content: flex-end;
                gap: var(--gap-2);
            }

            .secondary-button, .primary-button {
                padding: var(--padding-2) var(--padding-4);
                border-radius: var(--radius);
                cursor: pointer;
                border: 1px solid var(--border-1);
            }

            .secondary-button {
                background: var(--bg-2);
                color: var(--fg-1);
            }

            .primary-button {
                background: var(--bg-accent);
                color: var(--fg-accent);
                border: none;
            }

            .secondary-button:hover {
                background: var(--bg-3);
            }

            .primary-button:hover {
                opacity: 0.9;
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
            <div class="upload-img empty">
                <input type="file" id="file" accept="image/*" />
                <div class="image-container">
                    <div class="resize-handle left-handle" ${wisk.editor.readonly ? 'style="display: none;"' : ''}></div>
                    <img src="" id="img-editable" alt="Uploaded image" />
                    <div class="resize-handle right-handle" ${wisk.editor.readonly ? 'style="display: none;"' : ''}></div>
                </div>
                <button id="upload-button"><img src="/a7/plugins/image-element/upload.svg" width="30" height="30" style="filter: var(--themed-svg);">Upload Image</button>
                <button id="link-button"><img src="/a7/plugins/image-element/link.svg" width="30" height="30" style="filter: var(--themed-svg);">Link Image</button>
                <button id="search-gifs-btn"><img src="/a7/plugins/image-element/gif.svg" width="30" height="30" style="filter: var(--themed-svg);">Search GIFs</button>
                <button id="options-button" style="display: none;">
                    <img src="/a7/forget/morex.svg" width="22" height="22" style="filter: var(--themed-svg);">
                </button>
                <!-- Modified options dialog -->
                <div id="options-dialog">
                    <button class="dialog-option" ${wisk.editor.readonly ? 'style="display: none;"' : ''} id="change-image">Change Image</button>
                    <button class="dialog-option" id="download-image">Download Image</button>
                    <button class="dialog-option" ${wisk.editor.readonly ? 'style="display: none;"' : ''} id="search-gif">Search GIFs</button>
                    <button class="dialog-option" ${wisk.editor.readonly ? 'style="display: none;"' : ''} id="add-link-menu">Add Image URL</button>
                    <button class="dialog-option" id="fullscreen">View Full Size</button>
                    <div class="dialog-option border-toggle" ${wisk.editor.readonly ? 'style="display: none;"' : ''}>
                        <label for="border-toggle">Show Border</label>
                        <input type="checkbox" id="border-toggle" />
                    </div>
                </div>
                <!-- Add GIF search dialog -->
                <div id="gif-search-dialog" style="display: none;">
                    <div class="gif-search-header">
                        <input type="text" id="gif-search-input" placeholder="Search GIFs..." autocomplete="off" />
                        <button id="close-gif-search"><img src="/a7/forget/close.svg" alt="Close" width="20" height="20" style="filter: var(--themed-svg);"></button>
                    </div>
                    <p style="text-align: end; color: var(--fg-2); font-size: small;">Powered by Tenor</p>
                    <div class="gif-results">
                    </div>
                </div>

                <div id="link-dialog" style="display: none;" class="modal-dialog">
                    <div class="link-dialog-content">
                        <div class="link-dialog-header">
                            <h3>Add Image URL</h3>
                            <button id="close-link-dialog">
                                <img src="/a7/forget/close.svg" alt="Close" width="20" height="20" style="filter: var(--themed-svg);" />
                            </button>
                        </div>
                        <div class="link-dialog-body">
                            <input type="text" id="image-url-input" placeholder="Paste image URL here...">
                            <div class="link-dialog-buttons">
                                <button id="cancel-link" class="secondary-button">Cancel</button>
                                <button id="add-link" class="primary-button">Add Image</button>
                            </div>
                        </div>
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
        const imageUrl = this.imageUrl || '';

        return {
            html: `<img src="${imageUrl}" alt="${caption}"/><p>${caption}</p>`,
            text: caption,
            markdown: `![${caption}](${imageUrl})${caption ? '\n\n' + caption : ''}`,
        };
    }

    getValue() {
        return {
            textContent: this.editable.innerHTML,
            imageUrl: this.imageUrl,
            showBorder: this.shadowRoot.querySelector('#border-toggle')?.checked || false,
            imageWidth: this.imageElement?.style.width || 'auto',
        };
    }

    setValue(path, value) {
        if (path === 'value.append') {
            this.editable.innerHTML += value.textContent;
        } else {
            this.editable.innerHTML = value.textContent;
            if (value.imageUrl) {
                this.imageUrl = value.imageUrl;
                this.updateImage();
                if (value.imageWidth) {
                    this.imageElement.style.width = value.imageWidth;
                }
            }
            if (value.showBorder !== undefined) {
                const borderToggle = this.shadowRoot.querySelector('#border-toggle');
                if (borderToggle) {
                    borderToggle.checked = value.showBorder;
                    const img = this.shadowRoot.querySelector('#img-editable');
                    img.style.border = value.showBorder ? '1px solid var(--border-1)' : 'none';
                }
            }
        }
    }

    async moveImageToLocal(imageUrl) {
        try {
            // Fetch the image
            const response = await fetch(imageUrl);
            const blob = await response.blob();

            // Generate a unique filename
            const extension = this.getFileExtension(imageUrl);
            const localUrl = 'image-' + Date.now() + '.' + extension;

            // Save to IndexedDB
            await wisk.db.setAsset(localUrl, blob);

            // Set the new URL
            this.imageUrl = localUrl;
            this.updateImage();
            this.sendUpdates();

            return localUrl;
        } catch (error) {
            console.error('Error storing image locally:', error);
            throw error;
        }
    }
}

customElements.define('image-element', ImageElement);
