class MainElement extends BaseTextElement {
    constructor() {
        super();
        this.placeholder = this.getAttribute('placeholder') || wisk.editor.readonly ? '' : 'edit me';
        this.bannerSize = 'big'; // Can be 'smallest', 'small', 'big', 'bigger', 'biggest'
        this.emoji = this.getAttribute('emoji') || '';
        this.backgroundUrl = null;
        this.gradientData = null;
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
        this.renderDatabaseProps();
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
            gradientData: this.gradientData,
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
            if (value.gradientData) {
                this.gradientData = value.gradientData;
                this.applyGradient();
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

        const removeCoverButton = this.shadowRoot.querySelector('#remove-cover-button');
        if (removeCoverButton) {
            removeCoverButton.addEventListener('click', () => {
                this.removeCover();
            });
        }

        const gradientButton = this.shadowRoot.querySelector('#gradient-button');
        if (gradientButton) {
            gradientButton.addEventListener('click', () => {
                this.openGradientMaker();
            });
        }
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

            // Clear gradient if switching to image
            this.gradientData = null;

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
                    this.updateBannerSize();
                }
            } catch (error) {
                console.error('Error retrieving background from storage:', error);
            }
        }
    }

    async removeCover() {
        // Clean up current object URL
        if (this._currentObjectUrl) {
            URL.revokeObjectURL(this._currentObjectUrl);
            this._currentObjectUrl = null;
        }

        // Remove background from IndexedDB if it exists
        if (this.backgroundUrl) {
            try {
                await wisk.db.deleteAsset(this.backgroundUrl);
            } catch (error) {
                console.error('Error deleting background from storage:', error);
            }
        }

        // Clear background styling
        this.backgroundUrl = null;
        this.gradientData = null;
        this.headerContainer.style.backgroundImage = '';
        this.headerContainer.classList.remove('has-background');
        this.updateBannerSize();
        this.sendUpdates();
    }

    openGradientMaker() {
        const dialog = this.shadowRoot.querySelector('.gradient-dialog');
        dialog.classList.add('show');

        // Initialize gradient data if not exists
        if (!this.gradientData) {
            this.gradientData = {
                type: 'linear',
                angle: 90,
                stops: [
                    { color: '#667eea', position: 0 },
                    { color: '#764ba2', position: 100 },
                ],
            };
        }

        // Setup dialog event listeners
        this.setupGradientDialogListeners();

        // Set UI values based on current gradient data
        const typeBtns = dialog.querySelectorAll('.type-btn');
        typeBtns.forEach(btn => {
            if (btn.dataset.type === this.gradientData.type) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const angleInput = dialog.querySelector('#angle-input');
        const angleValue = dialog.querySelector('#angle-value');
        angleInput.value = this.gradientData.angle;
        angleValue.textContent = this.gradientData.angle;

        this.updateAngleVisibility();

        // Render initial state
        this.renderColorStops();
        this.updateGradientPreview();
    }

    setupGradientDialogListeners() {
        const dialog = this.shadowRoot.querySelector('.gradient-dialog');

        // Close button
        const closeBtn = dialog.querySelector('.gradient-close');
        closeBtn.onclick = () => this.closeGradientMaker();

        // Cancel button
        const cancelBtn = dialog.querySelector('#gradient-cancel');
        cancelBtn.onclick = () => this.closeGradientMaker();

        // Apply button
        const applyBtn = dialog.querySelector('#gradient-apply');
        applyBtn.onclick = () => this.applyGradientFromMaker();

        // Type buttons
        const typeBtns = dialog.querySelectorAll('.type-btn');
        typeBtns.forEach(btn => {
            btn.onclick = () => {
                typeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.gradientData.type = btn.dataset.type;
                this.updateAngleVisibility();
                this.updateGradientPreview();
            };
        });

        // Angle slider
        const angleInput = dialog.querySelector('#angle-input');
        const angleValue = dialog.querySelector('#angle-value');
        angleInput.oninput = () => {
            this.gradientData.angle = parseInt(angleInput.value);
            angleValue.textContent = angleInput.value;
            this.updateGradientPreview();
        };

        // Add color stop button
        const addStopBtn = dialog.querySelector('#add-color-stop');
        addStopBtn.onclick = () => this.addColorStop();

        // Close on backdrop click
        dialog.onclick = e => {
            if (e.target === dialog) {
                this.closeGradientMaker();
            }
        };
    }

    updateAngleVisibility() {
        const angleControl = this.shadowRoot.querySelector('#angle-control');
        if (this.gradientData.type === 'linear') {
            angleControl.style.display = 'flex';
        } else {
            angleControl.style.display = 'none';
        }
    }

    closeGradientMaker() {
        const dialog = this.shadowRoot.querySelector('.gradient-dialog');
        dialog.classList.remove('show');
    }

    renderColorStops() {
        const container = this.shadowRoot.querySelector('#color-stops-container');
        container.innerHTML = '';

        this.gradientData.stops.forEach((stop, index) => {
            const stopEl = document.createElement('div');
            stopEl.className = 'color-stop';

            stopEl.innerHTML = `
                <input type="color" value="${stop.color}" data-index="${index}" />
                <input type="range" min="0" max="100" value="${stop.position}" data-index="${index}" />
                <span class="color-stop-position">${stop.position}%</span>
                ${
                    this.gradientData.stops.length > 2
                        ? `
                    <button class="delete-stop-btn" data-index="${index}">
                        <img src="/a7/forget/trash-mini.svg" width="20" height="20" />
                    </button>
                `
                        : ''
                }
            `;

            container.appendChild(stopEl);

            // Add event listeners
            const colorInput = stopEl.querySelector('input[type="color"]');
            const rangeInput = stopEl.querySelector('input[type="range"]');
            const positionText = stopEl.querySelector('.color-stop-position');
            const deleteBtn = stopEl.querySelector('.delete-stop-btn');

            colorInput.oninput = () => {
                this.gradientData.stops[index].color = colorInput.value;
                this.updateGradientPreview();
            };

            rangeInput.oninput = () => {
                this.gradientData.stops[index].position = parseInt(rangeInput.value);
                positionText.textContent = rangeInput.value + '%';
                this.updateGradientPreview();
            };

            if (deleteBtn) {
                deleteBtn.onclick = () => this.removeColorStop(index);
            }
        });
    }

    addColorStop() {
        if (this.gradientData.stops.length >= 5) return;

        // Find a good position for the new stop
        const positions = this.gradientData.stops.map(s => s.position).sort((a, b) => a - b);
        let newPosition = 50;

        for (let i = 0; i < positions.length - 1; i++) {
            const gap = positions[i + 1] - positions[i];
            if (gap > 20) {
                newPosition = positions[i] + Math.floor(gap / 2);
                break;
            }
        }

        this.gradientData.stops.push({
            color: '#ffffff',
            position: newPosition,
        });

        this.renderColorStops();
        this.updateGradientPreview();
    }

    removeColorStop(index) {
        if (this.gradientData.stops.length <= 2) return;
        this.gradientData.stops.splice(index, 1);
        this.renderColorStops();
        this.updateGradientPreview();
    }

    updateGradientPreview() {
        const preview = this.shadowRoot.querySelector('#gradient-preview');
        const gradient = this.generateGradientString();
        preview.style.backgroundImage = gradient;
    }

    generateGradientString() {
        const { type, angle, stops } = this.gradientData;
        const sortedStops = [...stops].sort((a, b) => a.position - b.position);
        const stopString = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');

        if (type === 'linear') {
            return `linear-gradient(${angle}deg, ${stopString})`;
        } else if (type === 'radial') {
            return `radial-gradient(circle, ${stopString})`;
        } else if (type === 'conic') {
            return `conic-gradient(from 0deg, ${stopString})`;
        }
    }

    applyGradientFromMaker() {
        // Clear image background if exists
        if (this.backgroundUrl) {
            if (this._currentObjectUrl) {
                URL.revokeObjectURL(this._currentObjectUrl);
                this._currentObjectUrl = null;
            }
            this.backgroundUrl = null;
        }

        this.applyGradient();
        this.closeGradientMaker();
        this.sendUpdates();
    }

    applyGradient() {
        if (this.gradientData && this.headerContainer) {
            const gradient = this.generateGradientString();
            this.headerContainer.style.backgroundImage = gradient;
            this.headerContainer.classList.add('has-background');
            this.updateBannerSize();
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
                    margin-top: ${new URLSearchParams(window.location.search).get('zen') === 'true' ? 'var(--padding-4)' : '59px'};
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
            .header-actions {
                position: absolute;
                bottom: 12px;
                right: 0;
                display: flex;
                gap: var(--gap-2);
                opacity: 0;
                transition: opacity 0.3s;
            }
            .header-container:hover .header-actions {
                opacity: 1;
            }

            .header-btn {
                padding: var(--padding-w1);
                background-color: var(--bg-2);
                color: var(--fg-1);
                border-radius: var(--radius);
                cursor: pointer;
                border: none;
                font-size: 14px;
                transition: background-color 0.2s;
            }

            .header-btn:hover {
                background-color: var(--bg-3);
            }

            .header-btn.remove-cover,
            .header-btn.banner-size {
                display: none;
            }

            .has-background .header-btn.remove-cover,
            .has-background .header-btn.banner-size {
                display: block;
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

            .gradient-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }

            .gradient-dialog.show {
                display: flex;
            }

            .gradient-content {
                background-color: var(--bg-1);
                border-radius: var(--radius-large);
                padding: var(--padding-4);
                max-width: 500px;
                width: 90%;
                filter: var(--drop-shadow);
                display: flex;
                flex-direction: column;
                gap: var(--gap-3);
            }

            .gradient-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .gradient-title {
                font-size: 18px;
                font-weight: 600;
            }

            .gradient-close {
                background: none;
                border: none;
                color: var(--fg-1);
                cursor: pointer;
                padding: var(--padding-2);
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .gradient-close:hover {
                background-color: var(--bg-3);
            }

            .gradient-preview {
                width: 100%;
                height: 120px;
                border-radius: var(--radius);
                border: 2px solid var(--bg-3);
            }

            .gradient-type-selector {
                display: flex;
            }

            .type-btn {
                flex: 1;
                padding: var(--padding-w2);
                color: var(--fg-2);
                cursor: pointer;
                position: relative;
                user-select: none;
                border: none;
                border-bottom: 4px solid var(--bg-3);
                text-align: center;
                font-weight: 500;
                font-size: 14px;
                background: transparent;
                transition: all 0.2s ease;
            }

            .type-btn.active {
                color: var(--fg-1);
                border-bottom: 4px solid var(--fg-1);
            }

            .angle-control {
                display: flex;
                flex-direction: column;
                gap: var(--gap-2);
            }

            .angle-control label {
                font-size: 14px;
                color: var(--fg-2);
            }

            .angle-input {
                width: 100%;
                padding: var(--padding-w2);
                border: 2px solid var(--bg-3);
                border-radius: var(--radius);
                background-color: var(--bg-2);
                color: var(--fg-1);
            }

            .color-stops {
                display: flex;
                flex-direction: column;
                gap: var(--gap-2);
            }

            .color-stop {
                display: flex;
                align-items: center;
                gap: var(--gap-2);
            }

            .color-stop input[type="color"] {
                width: 60px;
                height: 40px;
                border: 2px solid var(--bg-3);
                border-radius: var(--radius);
                cursor: pointer;
                background: none;
            }

            .color-stop input[type="range"] {
                flex: 1;
            }

            .color-stop-position {
                min-width: 40px;
                text-align: center;
                font-size: 14px;
                color: var(--fg-2);
            }

            .delete-stop-btn {
                background: none;
                border: none;
                color: var(--fg-red);
                cursor: pointer;
                padding: var(--padding-2);
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .delete-stop-btn img, .gradient-close img {
                filter: var(--themed-svg);
            }

            .delete-stop-btn:hover {
                background-color: var(--bg-3);
            }

            .add-stop-btn {
                padding: var(--padding-w2);
                background-color: var(--bg-2);
                border: 2px solid var(--bg-3);
                color: var(--fg-1);
                border-radius: var(--radius);
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
            }

            .add-stop-btn:hover {
                background-color: var(--bg-3);
            }

            .gradient-actions {
                display: flex;
                gap: var(--gap-2);
                justify-content: flex-end;
            }

            .btn-primary-gradient {
                background: var(--fg-1);
                color: var(--bg-1);
                padding: var(--padding-w2);
                font-weight: 600;
                border-radius: calc(var(--radius-large) * 20);
                border: 2px solid transparent;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
            }

            .btn-primary-gradient:hover {
                background-color: transparent;
                border: 2px solid var(--fg-1);
                color: var(--fg-1);
            }

            .btn-tertiary-gradient {
                background-color: transparent;
                border: 2px solid transparent;
                color: var(--fg-1);
                font-weight: 500;
                padding: var(--padding-w2);
                border-radius: calc(var(--radius-large) * 20);
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s ease;
            }

            .btn-tertiary-gradient:hover {
                background-color: var(--bg-3);
            }

            @media (hover: hover) {
                *::-webkit-scrollbar { width: 15px; }
                *::-webkit-scrollbar-track { background: var(--bg-1); }
                *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
                *::-webkit-scrollbar-thumb:hover { background-color: var(--fg-1); }
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
            * {
                user-select: none;
            }
            .database-props {
                padding: 0 max(calc((100% - var(--width)) / 2), var(--padding-4));
            }
            @media (max-width: 1150px) {
               #editable, .database-props {
                        padding-left: 0;
                        padding-right: 0;
                }
            }
            .db-prop {
                display: flex;
                align-items: center;
                width: fit-content;
                min-width: 500px;
                padding-bottom: var(--padding-2);
            }
            .db-prop label {
                flex-basis: 160px;
                flex-grow: 0;
                flex-shrink: 0;
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
                    <div id="emoji">${
                        this.emoji && this.emoji.trim()
                            ? this.emoji
                            : '<span class="add-emoji-text"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5"> <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.536-4.464a.75.75 0 1 0-1.061-1.061 3.5 3.5 0 0 1-4.95 0 .75.75 0 0 0-1.06 1.06 5 5 0 0 0 7.07 0ZM9 8.5c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S7.448 7 8 7s1 .672 1 1.5Zm3 1.5c.552 0 1-.672 1-1.5S12.552 7 12 7s-1 .672-1 1.5.448 1.5 1 1.5Z" clip-rule="evenodd" /> </svg>Add emoji</span>'
                    }</div>
                    ${
                        !wisk.editor.readonly
                            ? `
                        <div class="header-actions">
                            <button class="header-btn" id="background-upload-button">Add Image</button>
                            <button class="header-btn" id="gradient-button">Add Gradient</button>
                            <button class="header-btn remove-cover" id="remove-cover-button">Remove Cover</button>
                            <button class="header-btn banner-size" id="banner-size-button">Small Banner</button>
                        </div>
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
            <div class="emoji-suggestions"></div>
            <div class="database-props"></div>
            <div class="gradient-dialog">
                <div class="gradient-content">
                    <div class="gradient-header">
                        <div class="gradient-title">Gradient Maker</div>
                        <button class="gradient-close">
                            <img src="/a7/forget/dialog-x.svg" width="22" height="22" />
                        </button>
                    </div>
                    <div class="gradient-preview" id="gradient-preview"></div>
                    <div class="gradient-type-selector">
                        <button class="type-btn active" data-type="linear">Linear</button>
                        <button class="type-btn" data-type="radial">Radial</button>
                        <button class="type-btn" data-type="conic">Conic</button>
                    </div>
                    <div class="angle-control" id="angle-control">
                        <label>Angle: <span id="angle-value">90</span>°</label>
                        <input type="range" class="angle-input" id="angle-input" min="0" max="360" value="90" />
                    </div>
                    <div>
                        <label style="font-size: 14px; color: var(--fg-2); margin-bottom: var(--gap-2); display: block;">Color Stops</label>
                        <div class="color-stops" id="color-stops-container"></div>
                    </div>
                    <button class="add-stop-btn" id="add-color-stop">+ Add Color Stop</button>
                    <div class="gradient-actions">
                        <button class="btn-tertiary-gradient" id="gradient-cancel">Cancel</button>
                        <button class="btn-primary-gradient" id="gradient-apply">Apply</button>
                    </div>
                </div>
            </div>`;
        this.shadowRoot.innerHTML = style + content;
    }

    async renderDatabaseProps() {
        const cfg = wisk.editor.document.data.config.databaseProps;
        if (!cfg?.identifier) return;

        // fetch database + entry
        const db = await wisk.db.getDatabase(cfg.identifier);
        let entry = db.entries.find(e => e.pageId === wisk.editor.pageId) || {};

        const container = this.shadowRoot.querySelector('.database-props');
        container.innerHTML = '';

        db.properties.forEach(prop => {
            // wrapper & label (unchanged)
            const wrapper = document.createElement('div');
            wrapper.classList.add('db-prop');
            const id = `db-prop-${prop.name.replace(/\s+/g, '-').toLowerCase()}`;
            const label = document.createElement('label');
            label.htmlFor = id;
            label.textContent = (prop.emoji ? prop.emoji + ' ' : '') + prop.name;
            wrapper.appendChild(label);

            // pick the right control
            let control;
            const currentValue = entry[prop.name];

            switch (prop.type) {
                case 'select':
                    control = document.createElement('jalebi-select');
                    control.id = id;
                    prop.options.forEach(opt => {
                        const o = document.createElement('option');
                        o.value = opt;
                        o.textContent = opt;
                        if (currentValue === opt) o.selected = true;
                        control.appendChild(o);
                    });
                    break;

                case 'multi-select':
                    control = document.createElement('jalebi-multiselect');
                    control.id = id;
                    prop.options.forEach(opt => {
                        const o = document.createElement('option');
                        o.value = opt;
                        o.textContent = opt;
                        control.appendChild(o);
                    });

                    control.setAttribute('value', currentValue.join(','));
                    break;

                case 'checkbox':
                    control = document.createElement('jalebi-checkbox');
                    control.id = id;
                    control.checked = Boolean(currentValue);
                    break;

                case 'date':
                    // ← NEW: use jalebi-datepicker + setAttribute('value',…)
                    control = document.createElement('jalebi-datepicker');
                    control.id = id;
                    control.setAttribute('placeholder', 'YYYY-MM-DD');
                    if (currentValue) {
                        const d = new Date(currentValue);
                        if (!isNaN(d)) {
                            control.setAttribute('value', d.toISOString().slice(0, 10));
                        }
                    }
                    break;

                case 'datetime-local':
                    // ← NEW: use jalebi-datetimepicker + setAttribute('value',…)
                    control = document.createElement('jalebi-datetimepicker');
                    control.id = id;
                    // optional: override format or time-format here if you like
                    // e.g. control.setAttribute('format','yyyy-mm-dd hh:mm');
                    if (currentValue) {
                        const d2 = new Date(currentValue);
                        if (!isNaN(d2)) {
                            // full ISO string always works
                            control.setAttribute('value', d2.toISOString());
                        }
                    }
                    break;

                default:
                    control = document.createElement('jalebi-input');
                    control.id = id;
                    // map prop.type → input.type
                    const typeMap = {
                        text: 'text',
                        number: 'number',
                        url: 'url',
                        email: 'email',
                        phone: 'tel',
                    };
                    control.type = typeMap[prop.type] || 'text';
                    control.setAttribute('placeholder', prop.name);
                    if (currentValue != null) control.value = currentValue;
                    break;
            }

            // hook the right event
            const eventName = ['input', 'change'].find(e => e === (/^(text|number|url|email|phone)$/.test(prop.type) ? 'input' : 'change'));

            control.addEventListener(eventName, e => {
                let newValue;
                console.log('eventName', eventName, 'prop.type', prop.type, 'newValue', e.target);
                if (prop.type === 'checkbox') {
                    newValue = e.target.checked;
                } else if (prop.type === 'multi-select') {
                    newValue = e.target.values;
                } else if (prop.type === 'number') {
                    newValue = e.target.value === '' ? null : parseFloat(e.target.value);
                } else if (prop.type === 'date' || prop.type === 'datetime-local') {
                    // use the string the picker just emitted
                    newValue = e.detail.value || null;
                } else {
                    newValue = e.target.value;
                }
                this.updateDatabaseProp(prop.name, newValue);
            });

            wrapper.appendChild(control);
            container.appendChild(wrapper);
        });
    }

    async updateDatabaseProp(propName, value) {
        const cfg = wisk.editor.document.data.config.databaseProps;
        if (!cfg?.identifier) return;

        // 1) fetch
        const db = await wisk.db.getDatabase(cfg.identifier);

        // 2) find or create entry for this page
        let entry = db.entries.find(e => e.pageId === wisk.editor.pageId);
        if (!entry) {
            entry = { id: 'entry-' + Date.now(), pageId: wisk.editor.pageId };
            db.entries.push(entry);
        }

        // 3) update the field
        entry[propName] = value;

        // 4) write back
        await wisk.db.setDatabase(cfg.identifier, db);
        console.log(`⤷ Saved ${propName} =`, value);
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
