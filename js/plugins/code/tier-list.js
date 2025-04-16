import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class TierList extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
            display: block;
            width: 100%;
        }
        .tier-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
        }
        .tier-row {
            display: flex;
            gap: 8px;
            align-items: stretch;
            min-height: 90px;
        }
        .tier-label {
            width: 90px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            color: black;
            font-weight: 500;
            font-size: 24px;
        }
        .tier-content {
            flex: 1;
            background: var(--bg-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            padding: 4px;
            min-height: 90px;
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            align-content: flex-start;
        }
        .image-pool {
            background: var(--bg-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            padding: 8px;
            min-height: 100px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .tier-image {
            width: 80px;
            height: 80px;
            object-fit: contain;
            border-radius: var(--radius);
            cursor: move;
            background: var(--bg-1);
        }
        .image-wrapper {
            position: relative;
            width: 80px;
            height: 80px;
        }
        .delete-button {
            position: absolute;
            top: 4px;
            right: 4px;
            background: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            width: 20px;
            height: 20px;
            display: none;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--fg-1);
            font-size: 14px;
            padding: 0;
            line-height: 1;
        }
        .delete-button:hover {
            background: var(--bg-3);
        }
        .image-wrapper:hover .delete-button {
            display: flex;
        }
        .upload-wrapper {
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            cursor: pointer;
        }
        .upload-wrapper:hover {
            background: var(--bg-3);
        }
        input[type='file'] {
            display: none;
        }
        .dragging {
            opacity: 0.5;
        }
        .tier-content.dragover {
            background: var(--bg-3);
        }
        .upload-icon {
            width: 24px;
            height: 24px;
            color: var(--fg-2);
        }
    `;

    static properties = {
        images: { type: Array },
        tiers: { type: Object },
    };

    constructor() {
        super();
        this.images = [];
        this.tierOrder = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
        this.tiers = {
            S: [],
            A: [],
            B: [],
            C: [],
            D: [],
            E: [],
            F: [],
        };
        this.tierBgColors = {
            S: 'rgb(255, 127, 127)',
            A: 'rgb(255, 191, 127)',
            B: 'rgb(255, 223, 127)',
            C: '#FFFF7F',
            D: 'rgb(191, 255, 127)',
            E: 'rgb(127, 255, 127)',
            F: 'rgb(127, 255, 255)',
        };
        this.draggedImage = null;
    }

    firstUpdated() {
        this.setupDragAndDrop();
    }

    sendUpdates() {
        setTimeout(() => {
            wisk.editor.justUpdates(this.id);
        }, 0);
    }

    setupDragAndDrop() {
        window.addEventListener('dragend', this.handleDragEnd.bind(this));
        this.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.addEventListener('dragover', this.handleDragOver.bind(this));
        this.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.addEventListener('drop', this.handleDrop.bind(this));
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('dragend', this.handleDragEnd.bind(this));
    }

    handleDragStart(e) {
        if (e.target.classList.contains('tier-image')) {
            this.draggedImage = e.target;
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            // Clear any previous dragover states
            this.clearDragStates();
        }
    }

    handleDragEnd(e) {
        this.clearDragStates();
        this.draggedImage = null;
    }

    clearDragStates() {
        const allImages = this.shadowRoot.querySelectorAll('.tier-image');
        allImages.forEach(img => img.classList.remove('dragging'));

        const allDropTargets = this.shadowRoot.querySelectorAll('.tier-content, .image-pool');
        allDropTargets.forEach(target => target.classList.remove('dragover'));
    }

    handleDragOver(e) {
        e.preventDefault();
        const dropTarget = e.target.closest('.tier-content') || e.target.closest('.image-pool');
        if (dropTarget && this.draggedImage) {
            this.shadowRoot.querySelectorAll('.tier-content, .image-pool').forEach(el => {
                el.classList.remove('dragover');
            });
            dropTarget.classList.add('dragover');
        }
    }

    handleDragLeave(e) {
        const dropTarget = e.target.closest('.tier-content') || e.target.closest('.image-pool');
        if (dropTarget) {
            dropTarget.classList.remove('dragover');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const dropTarget = e.target.closest('.tier-content') || e.target.closest('.image-pool');

        if (dropTarget && this.draggedImage) {
            const imageData = this.draggedImage.src;
            const targetTier = dropTarget.dataset.tier;

            Object.keys(this.tiers).forEach(tier => {
                this.tiers[tier] = this.tiers[tier].filter(img => img !== imageData);
            });
            this.images = this.images.filter(img => img !== imageData);

            if (targetTier) {
                this.tiers = {
                    ...this.tiers,
                    [targetTier]: [...this.tiers[targetTier], imageData],
                };
            } else {
                this.images = [...this.images, imageData];
            }
            this.clearDragStates();
            this.draggedImage = null;

            this.requestUpdate();
            this.sendUpdates();
        }
    }

    async handleFileSelect(e) {
        const files = e.target.files || e.dataTransfer.files;
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                await this.processImage(file);
            }
        }
        this.sendUpdates();
    }

    async processImage(file) {
        const reader = new FileReader();
        reader.onload = async e => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > 80) {
                        height = Math.round(height * (80 / width));
                        width = 80;
                    }
                } else {
                    if (height > 80) {
                        width = Math.round(width * (80 / height));
                        height = 80;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const resizedImage = canvas.toDataURL(file.type);
                this.images = [...this.images, resizedImage];
                this.requestUpdate();
                this.sendUpdates();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    setValue(path, value) {
        if (value.images) {
            this.images = value.images;
        }
        if (value.tiers) {
            this.tiers = value.tiers;
        }
        this.requestUpdate();
    }

    getValue() {
        return {
            images: this.images,
            tiers: this.tiers,
        };
    }

    deleteImage(imageToDelete) {
        this.images = this.images.filter(image => image !== imageToDelete);
        this.requestUpdate();
        this.sendUpdates();
    }

    render() {
        return html`
            <input type="file" accept="image/*" multiple @change="${this.handleFileSelect}" />

            <div class="tier-container">
                ${this.tierOrder.map(
                    tier => html`
                        <div class="tier-row">
                            <div class="tier-label" style="background: ${this.tierBgColors[tier]}">${tier}</div>
                            <div
                                class="tier-content"
                                data-tier="${tier}"
                                @dragover="${this.handleDragOver}"
                                @dragleave="${this.handleDragLeave}"
                                @drop="${this.handleDrop}"
                            >
                                ${this.tiers[tier].map(
                                    image => html` <img src="${image}" class="tier-image" draggable="true" @dragstart="${this.handleDragStart}" /> `
                                )}
                            </div>
                        </div>
                    `
                )}
            </div>

            <div class="image-pool" @dragover="${this.handleDragOver}" @dragleave="${this.handleDragLeave}" @drop="${this.handleDrop}">
                <div class="upload-wrapper" @click="${() => this.shadowRoot.querySelector('input[type="file"]').click()}">
                    <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
                ${this.images.map(
                    image => html`
                        <div class="image-wrapper">
                            <img src="${image}" class="tier-image" draggable="true" @dragstart="${this.handleDragStart}" />
                            <button class="delete-button" @click="${() => this.deleteImage(image)}" title="Delete image">×</button>
                        </div>
                    `
                )}
            </div>
        `;
    }
}

customElements.define('tier-list', TierList);
