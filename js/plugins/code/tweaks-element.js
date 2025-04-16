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
            height: 120px;
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
            left: 19px;
            top: 8px;
        }
        .plus-icon::after {
            width: 24px;
            height: 2px;
            top: 19px;
            left: 8px;
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
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadSavedBackgrounds();
        // Get current background if set
        this.getCurrentBackground();
    }

    async loadSavedBackgrounds() {
        try {
            // Load saved background settings
            const savedData = await wisk.db.getPluginItem(this.identifier);
            if (savedData && savedData.uploadedImages) {
                this.uploadedImages = [...savedData.uploadedImages];
            }
            if (savedData && savedData.currentBackground) {
                this.currentBackground = savedData.currentBackground;
            }
        } catch (error) {
            console.error('Error loading saved backgrounds:', error);
        }
    }

    async saveSettings() {
        try {
            await wisk.db.setPluginItem(this.identifier, {
                uploadedImages: this.uploadedImages,
                currentBackground: this.currentBackground,
            });
        } catch (error) {
            console.error('Error saving background settings:', error);
        }
    }

    getCurrentBackground() {
        const bgImage = document.body.style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
            // Extract URL from the background-image property
            const urlMatch = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
            if (urlMatch && urlMatch[1]) {
                this.currentBackground = urlMatch[1];
            }
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

                    // Generate a unique URL for this image
                    const imageId = `user_bg_${Date.now()}_${file.name.replace(/[^a-z0-9]/gi, '_')}`;
                    const imageUrl = `wisk://assets/${imageId}`;

                    // Store the image in the asset store
                    await wisk.db.saveAsset(imageUrl, blob);

                    // Add to uploadedImages list
                    const newImage = {
                        src: imageUrl,
                        text: file.name,
                        link: null,
                        isUploaded: true,
                    };

                    this.uploadedImages = [...this.uploadedImages, newImage];
                    this.saveSettings();

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
            // Remove from asset store if it's a user-uploaded image
            if (image.src.startsWith('wisk://assets/')) {
                await wisk.db.removeAsset(image.src);
            }

            // Remove from array
            this.uploadedImages.splice(index, 1);
            this.uploadedImages = [...this.uploadedImages];

            // Update settings
            this.saveSettings();

            // Show success message
            this.showStatusMessage('Image removed successfully!');

            // If the removed image was the current background, reset background
            if (this.currentBackground === image.src) {
                this.resetBackground();
            }
        } catch (error) {
            console.error('Error removing image:', error);
            this.showStatusMessage('Error removing image. Please try again.', 'error');
        }
    }

    showStatusMessage(message, type = 'success') {
        this.statusMessage = message;
        this.showStatus = true;

        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.showStatus = false;
        }, 3000);
    }

    async changeBackground(image) {
        try {
            let imageUrl = image.src;

            // For uploaded images that use the wisk:// protocol, we need to get the actual blob
            if (imageUrl.startsWith('wisk://assets/')) {
                const blob = await wisk.db.getAsset(imageUrl);
                if (blob) {
                    // Create a temporary object URL
                    imageUrl = URL.createObjectURL(blob);
                }
            }

            document.body.style.backgroundColor = 'transparent';
            document.body.style.background = `url(${imageUrl}) no-repeat center center fixed`;
            document.body.style.backgroundSize = 'cover';

            // Store the current background preference
            this.currentBackground = image.src;
            this.saveSettings();

            this.showStatusMessage('Background changed successfully!');
        } catch (error) {
            console.error('Error changing background:', error);
            this.showStatusMessage('Error changing background. Please try again.', 'error');
        }
    }

    resetBackground() {
        document.body.style.background = '';
        document.body.style.backgroundColor = 'var(--bg-1)';
        this.currentBackground = '';
        this.saveSettings();
        this.showStatusMessage('Background reset to default');
    }

    render() {
        const allImages = [...this.images, ...this.uploadedImages];

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

                    <div class="controls">
                        <div class="section-title">Background Images</div>
                        <button class="btn btn-danger" @click=${this.resetBackground}>Reset Background</button>
                    </div>

                    <div class="bgs">
                        ${allImages.map(
                            (image, index) => html`
                                <button
                                    class="bg ${this.currentBackground === image.src ? 'active' : ''}"
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
                                                      <img src="/a7/iconoir/trash.svg" alt="Delete" style="width: 16px; height: 16px;" />
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
