import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class TweaksElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            user-select: none;
        }
        :host {
            display: block;
            position: relative;
            height: 100%;
            overflow: hidden;
        }
        .container {
            position: relative;
            height: 100%;
            width: 100%;
        }
        .content-area {
            padding: var(--padding-4);
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            overflow: hidden;
        }
        .header {
            display: flex;
            flex-direction: row;
            color: var(--fg-1);
            gap: var(--gap-2);
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 20px;
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
        .bgs {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            margin-top: 1rem;
            overflow-y: auto;
            padding-right: var(--padding-2);
        }
        .bg {
            background: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            cursor: pointer;
            display: block;
            overflow: hidden;
            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease;
        }
        .bg.active {
            border: 2px solid var(--fg-accent);
        }
        img {
            object-fit: cover;
            width: 100%;
            height: 120px;
        }
        a {
            color: var(--fg-blue);
            padding: var(--padding-w2);
            display: block;
            text-decoration: none;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        input[type='file'] {
            display: none;
        }
        .upload-tile {
            width: 100%;
            height: 100%;
            background: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition:
                background-color 0.2s,
                transform 0.2s ease;
        }
        .upload-tile:hover {
            background: var(--bg-2);
        }
        .plus-icon {
            width: 40px;
            height: 40px;
            border: 2px solid var(--fg-1);
            border-radius: 50%;
            position: relative;
            margin-bottom: 8px;
        }
        .plus-icon::before,
        .plus-icon::after {
            content: '';
            position: absolute;
            background-color: var(--fg-1);
        }
        .plus-icon::before {
            width: 2px;
            height: 24px;
            left: 17px;
            top: 6px;
        }
        .plus-icon::after {
            width: 24px;
            height: 2px;
            top: 17px;
            left: 6px;
        }
        .upload-text {
            color: var(--fg-1);
            font-size: 0.9em;
        }
        .section-title {
            font-size: 18px;
            color: var(--fg-1);
            font-weight: 500;
        }
        .controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .btn {
            outline: none;
            border: none;
            cursor: pointer;
            padding: var(--padding-w3);
            border-radius: var(--radius);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }
        .btn-primary {
            background-color: var(--fg-accent);
            color: var(--bg-1);
            font-weight: 600;
            border: 2px solid transparent;
        }
        .btn-primary:hover {
            background-color: var(--fg-accent-hover);
        }
        .btn-danger {
            background-color: var(--fg-red);
            color: var(--bg-red);
            font-weight: 600;
            border: 2px solid transparent;
        }
        .btn-danger:hover {
            background-color: var(--bg-red);
            color: var(--fg-red);
            border: 2px solid var(--fg-red);
        }
        .status-message {
            padding: 10px;
            margin-top: 10px;
            border-radius: var(--radius);
            background-color: var(--bg-green);
            color: var(--fg-green);
            text-align: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .status-message.show {
            opacity: 1;
        }
        .toggle-container {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 10px 0;
        }
        .toggle-label {
            color: var(--fg-1);
            font-size: 16px;
        }
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--bg-3);
            transition: 0.4s;
            border-radius: 24px;
        }
        .toggle-slider:before {
            position: absolute;
            content: '';
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: var(--bg-1);
            transition: 0.4s;
            border-radius: 50%;
        }
        input:checked + .toggle-slider {
            background-color: var(--fg-accent);
        }
        input:checked + .toggle-slider:before {
            transform: translateX(26px);
        }

        /* Custom scrollbar for webkit browsers */
        @media (hover: hover) {
            *::-webkit-scrollbar {
                width: 8px;
            }
            *::-webkit-scrollbar-track {
                background: var(--bg-1);
            }
            *::-webkit-scrollbar-thumb {
                background-color: var(--bg-3);
                border-radius: 20px;
                border: 2px solid var(--bg-1);
            }
            *::-webkit-scrollbar-thumb:hover {
                background-color: var(--fg-1);
            }
        }
        img[src*='/a7/forget/dialog-x.svg'] {
            width: unset;
            height: unset;
            filter: var(--themed-svg);
        }
        @media (max-width: 900px) {
            img[src*='/a7/forget/dialog-x.svg'] {
                display: none;
            }
            .header-title {
                width: 100%;
                text-align: center;
                margin-top: 20px;
                font-size: 20px;
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
            }
        }
    `;

    static properties = {
        images: { type: Array },
        uploadedImages: { type: Array },
        currentBackground: { type: String },
        statusMessage: { type: String },
        showStatus: { type: Boolean },
        blobCache: { type: Object },
        currentPageId: { type: String },
        globalBackground: { type: Boolean },
    };

    constructor() {
        super();
        this.identifier = 'pl_tweaks_element';
        this.images = [
            {
                src: '/a7/plugins/tweaks/pexels-codioful-7130469.jpg',
                text: 'Photo by Codioful (formerly Gradienta)',
                link: 'https://www.pexels.com/photo/multicolor-photo-7130469/',
            },
            {
                src: '/a7/plugins/tweaks/pexels-fotios-photos-1414573.jpg',
                text: 'Photo by Lisa Fotios',
                link: 'https://www.pexels.com/photo/gray-cloudy-sky-with-gray-clouds-1414573/',
            },
        ];
        this.uploadedImages = [];
        this.currentBackground = '';
        this.statusMessage = '';
        this.showStatus = false;
        this.blobCache = {}; // Cache for blob URLs
        this.currentPageId = '';
        this.globalBackground = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this.currentPageId = wisk.editor.pageId || '';
        this.loadSavedBackgrounds();
    }

    async loadSavedBackgrounds() {
        try {
            // Load saved background settings
            const savedData = (await wisk.db.getPlugin(this.identifier)) || {};

            // Initialize structure if not exists
            if (!savedData.assets) {
                savedData.assets = [];
            }
            if (!savedData.selectedAssets) {
                savedData.selectedAssets = [];
            }
            if (savedData.globalBackground === undefined) {
                savedData.globalBackground = false;
            }

            // Set global background preference
            this.globalBackground = savedData.globalBackground;

            // Load the uploaded assets
            this.uploadedImages = savedData.assets || [];

            // Find the current background for this page
            const pageBackground = savedData.selectedAssets.find(item => item.pageId === this.currentPageId);

            if (pageBackground) {
                this.currentBackground = pageBackground.asset;
                this.applyBackground(this.currentBackground);
            } else if (this.globalBackground && savedData.globalAsset) {
                // If global background is enabled and exists, use it
                this.currentBackground = savedData.globalAsset;
                this.applyBackground(this.currentBackground);
            }
        } catch (error) {
            console.error('Error loading saved backgrounds:', error);
        }
    }

    async saveSettings() {
        try {
            // Get current settings
            const savedData = (await wisk.db.getPlugin(this.identifier)) || {};

            // Initialize structure if not exists
            if (!savedData.assets) {
                savedData.assets = [];
            }
            if (!savedData.selectedAssets) {
                savedData.selectedAssets = [];
            }

            // Update assets
            savedData.assets = this.uploadedImages;

            // Update global setting
            savedData.globalBackground = this.globalBackground;

            // Update current page's background
            if (this.currentBackground) {
                // If global background is enabled, save to globalAsset
                if (this.globalBackground) {
                    savedData.globalAsset = this.currentBackground;

                    // Clear any page-specific backgrounds if needed
                    // Or keep them for when global is turned off
                } else {
                    // Find if we already have a setting for this page
                    const existingIndex = savedData.selectedAssets.findIndex(item => item.pageId === this.currentPageId);

                    if (existingIndex >= 0) {
                        // Update existing entry
                        savedData.selectedAssets[existingIndex].asset = this.currentBackground;
                    } else {
                        // Add new entry
                        savedData.selectedAssets.push({
                            pageId: this.currentPageId,
                            asset: this.currentBackground,
                        });
                    }
                }
            } else {
                // No background selected, remove entry if exists
                if (!this.globalBackground) {
                    savedData.selectedAssets = savedData.selectedAssets.filter(item => item.pageId !== this.currentPageId);
                } else {
                    // Clear global background
                    savedData.globalAsset = null;
                }
            }

            // Save to database
            await wisk.db.setPlugin(this.identifier, savedData);
        } catch (error) {
            console.error('Error saving background settings:', error);
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            try {
                const reader = new FileReader();
                reader.onload = async e => {
                    // Convert to blob for storage
                    const dataUrl = e.target.result;
                    const response = await fetch(dataUrl);
                    const blob = await response.blob();

                    // Generate a unique ID for this image
                    const imageId = `user_bg_${Date.now()}_${file.name.replace(/[^a-z0-9]/gi, '_')}`;

                    // Store the image in the asset store
                    await wisk.db.setAsset(imageId, blob);

                    // Create a blob URL for display
                    const blobUrl = URL.createObjectURL(blob);
                    this.blobCache[imageId] = blobUrl;

                    // Add to uploadedImages list
                    const newImage = {
                        id: imageId,
                        src: blobUrl, // For display in the UI
                        text: file.name,
                        isUploaded: true,
                    };

                    this.uploadedImages = [...this.uploadedImages, newImage];
                    await this.saveSettings();

                    // Show success message
                    this.showStatusMessage('Image uploaded successfully!');
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Error uploading image:', error);
                this.showStatusMessage('Error uploading image. Please try again.', 'error');
            }
        }
    }

    async removeUploadedImage(image, index) {
        try {
            // Remove from asset store
            if (image.id) {
                await wisk.db.removeAsset(image.id);
            }

            // Revoke blob URL if it exists in cache
            if (this.blobCache[image.id]) {
                URL.revokeObjectURL(this.blobCache[image.id]);
                delete this.blobCache[image.id];
            }

            // Remove from array
            this.uploadedImages.splice(index, 1);
            this.uploadedImages = [...this.uploadedImages];

            // Get saved data to update
            const savedData = (await wisk.db.getPlugin(this.identifier)) || {};

            // If this was the current background for any page, reset it
            if (savedData.selectedAssets) {
                savedData.selectedAssets = savedData.selectedAssets.filter(item => item.asset !== image.id);
            }

            // If this was the global background, reset it
            if (savedData.globalAsset === image.id) {
                savedData.globalAsset = null;
            }

            // Update assets list
            savedData.assets = this.uploadedImages;

            // Save changes
            await wisk.db.setPlugin(this.identifier, savedData);

            // If the removed image was the current background, reset background
            if (this.currentBackground === image.id) {
                this.resetBackground();
            }

            // Show success message
            this.showStatusMessage('Image removed successfully!');
        } catch (error) {
            console.error('Error removing image:', error);
            this.showStatusMessage('Error removing image. Please try again.', 'error');
        }
    }

    showStatusMessage(message, type = 'success') {
        wisk.utils.showToast(message, 3000);
    }

    async applyBackground(imageId) {
        try {
            // Check if it's a built-in image
            const builtIn = this.images.find(img => img.src === imageId);

            if (builtIn) {
                // Use the src directly for built-in images
                document.body.style.backgroundColor = 'transparent';
                document.body.style.background = `url(${builtIn.src}) no-repeat center center fixed`;
                document.body.style.backgroundSize = 'cover';
                return;
            }

            // For uploaded images, we need to check by ID
            let blob = null;
            let blobUrl = null;

            // Check if we have it in cache first
            if (this.blobCache[imageId]) {
                blobUrl = this.blobCache[imageId];
            } else {
                // Get the asset from the database
                blob = await wisk.db.getAsset(imageId);

                if (blob) {
                    // Create a blob URL and cache it
                    blobUrl = URL.createObjectURL(blob);
                    this.blobCache[imageId] = blobUrl;
                }
            }

            if (blobUrl) {
                document.body.style.backgroundColor = 'transparent';
                document.body.style.background = `url(${blobUrl}) no-repeat center center fixed`;
                document.body.style.backgroundSize = 'cover';
            }
        } catch (error) {
            console.error('Error applying background:', error);
        }
    }

    async changeBackground(image) {
        try {
            // Set the current background ID (either src for built-in or id for uploaded)
            const imageId = image.isUploaded ? image.id : image.src;
            this.currentBackground = imageId;

            // Apply the background
            await this.applyBackground(imageId);

            // Save the settings
            await this.saveSettings();

            this.showStatusMessage('Background changed successfully!');
        } catch (error) {
            console.error('Error changing background:', error);
            this.showStatusMessage('Error changing background. Please try again.', 'error');
        }
    }

    async resetBackground() {
        document.body.style.background = '';
        document.body.style.backgroundColor = 'var(--bg-1)';
        this.currentBackground = '';
        await this.saveSettings();
        this.showStatusMessage('Background reset to default');
    }

    async toggleGlobalBackground(e) {
        this.globalBackground = e.target.checked;
        await this.saveSettings();

        // If enabling global background, apply current background to all pages
        if (this.globalBackground && this.currentBackground) {
            this.showStatusMessage('Global background enabled - same background will be used for all pages');
        } else if (!this.globalBackground) {
            this.showStatusMessage('Page-specific backgrounds enabled');
        }
    }

    render() {
        const allImages = [...this.images, ...this.uploadedImages];

        // Determine active image by checking current background
        const activeImageId = this.currentBackground;

        return html`
            <div class="container">
                <div class="content-area">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <label class="header-title">Background Tweaks</label>
                                <img
                                    src="/a7/forget/dialog-x.svg"
                                    alt="Close"
                                    @click="${() => wisk.editor.hideMiniDialog()}"
                                    class="icon"
                                    draggable="false"
                                    style="padding: var(--padding-3);"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="toggle-container">
                        <label class="toggle-label">Use same background for all pages:</label>
                        <label class="toggle-switch">
                            <input type="checkbox" ?checked=${this.globalBackground} @change=${this.toggleGlobalBackground} />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="controls">
                        <div class="section-title">Background Images</div>
                        <button class="btn btn-danger" @click=${this.resetBackground}>Reset Background</button>
                    </div>

                    <div class="bgs">
                        ${allImages.map(
                            (image, index) => html`
                                <button
                                    class="bg ${activeImageId === (image.isUploaded ? image.id : image.src) ? 'active' : ''}"
                                    @click="${() => this.changeBackground(image)}"
                                >
                                    <img src="${image.src}" alt="${image.text}" />
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        ${image.link
                                            ? html`<a href="${image.link}" target="_blank" @click="${e => e.stopPropagation()}">${image.text}</a>`
                                            : html`<a>${image.text}</a>`}
                                        ${image.isUploaded
                                            ? html`
                                                  <button
                                                      class="note-action"
                                                      @click="${e => {
                                                          e.stopPropagation();
                                                          this.removeUploadedImage(image, index);
                                                      }}"
                                                      style="background: transparent; border: none; cursor: pointer; padding: 5px;"
                                                  >
                                                      <img
                                                          src="/a7/iconoir/trash.svg"
                                                          alt="Delete"
                                                          style="width: 16px; height: 16px; filter: var(--themed-svg)"
                                                      />
                                                  </button>
                                              `
                                            : ''}
                                    </div>
                                </button>
                            `
                        )}
                        <input type="file" id="imageUpload" accept="image/*" @change="${this.handleFileUpload}" />
                        <label for="imageUpload" class="bg upload-tile">
                            <div class="plus-icon"></div>
                            <span class="upload-text">Upload Image</span>
                        </label>
                    </div>

                    <div class="status-message ${this.showStatus ? 'show' : ''}">${this.statusMessage}</div>
                </div>
            </div>
        `;
    }
}

customElements.define('tweaks-element', TweaksElement);
