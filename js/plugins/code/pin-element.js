class PinElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Properties
        this.dragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.posX = 50; // Percentage of viewport width
        this.posY = 50; // Percentage of viewport height
        this.bgColor = 'var(--bg-2)';
        this.fgColor = 'var(--fg-1)';
        this.content = '';
        this.initialZIndex = 90;

        // Bind methods
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onResize = this.onResize.bind(this);

        // Initialize
        this.render();
        this.setupEventListeners();
    }

    // Lifecycle callbacks
    connectedCallback() {
        // Get attributes
        if (this.hasAttribute('position-x')) {
            this.posX = parseFloat(this.getAttribute('position-x')) || 50;
        }
        if (this.hasAttribute('position-y')) {
            this.posY = parseFloat(this.getAttribute('position-y')) || 50;
        }
        if (this.hasAttribute('bg-color')) {
            this.bgColor = this.getAttribute('bg-color');
        }
        if (this.hasAttribute('fg-color')) {
            this.fgColor = this.getAttribute('fg-color');
        }
        if (this.hasAttribute('content')) {
            this.content = this.getAttribute('content');
        }

        // Set initial position
        this.updatePosition(this.posX, this.posY);
        this.updateStyle(this.bgColor, this.fgColor);
        this.updateContent(this.content);

        // Add document-level event listeners
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('resize', this.onResize);
    }

    disconnectedCallback() {
        // Remove document-level event listeners
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('resize', this.onResize);
    }

    // Custom element methods
    setupEventListeners() {
        const header = this.shadowRoot.querySelector('.pin-header');
        const closeButton = this.shadowRoot.querySelector('.pin-close');

        header.addEventListener('mousedown', this.onMouseDown);
        closeButton.addEventListener('click', this.onClose);
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                color: var(--fg-1);            
            }
            :host {
                position: fixed;
                z-index: ${this.initialZIndex};
                min-width: 200px;
                max-width: 300px;
                border-radius: var(--radius);
                overflow: hidden;
                font-family: var(--font);
            }
            
            :host(:hover) {
                filter: var(--drop-shadow);
            }
            
            :host([dragging]) {
                opacity: 0.8;
                cursor: grabbing;
            }
            
            .pin-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                width: 100%;
                background-color: var(--bg-2);
                color: var(--fg-1);
                border-radius: var(--radius);
                overflow: clip;
            }
            
            .pin-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                cursor: grab;
                user-select: none;
            }

            .pin-header:active {
                cursor: grabbing;
            }
            
            .pin-title {
                font-size: 14px;
                font-weight: 500;
                opacity: 0.7;
            }
            
            .pin-actions {
                display: flex;
                gap: 8px;
            }
            
            .pin-action-button {
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 4px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.7;
                transition: all 0.2s ease;
            }
            
            .pin-action-button:hover {
                opacity: 1;
                background-color: rgba(0, 0, 0, 0.05);
            }
            
            .pin-close img {
                width: 18px;
                height: 18px;
                filter: var(--themed-svg);
            }
            
            .pin-content {
                padding: 12px;
                font-size: 14px;
                line-height: 1.5;
                overflow-y: auto;
                max-height: 200px;
                white-space: pre-wrap;
            }
            
            /* Custom scrollbar for webkit browsers */
            @media (hover: hover) {
                *::-webkit-scrollbar {
                    width: 6px;
                }
                *::-webkit-scrollbar-track {
                    background: transparent;
                }
                *::-webkit-scrollbar-thumb {
                    background-color: rgba(0, 0, 0, 0.2);
                    border-radius: 20px;
                }
                *::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(0, 0, 0, 0.4);
                }
            }

            @media (max-width: 900px) {
                .pin-container {
                    display: none;
                }
            }
        </style>
        <div class="pin-container">
            <div class="pin-header">
                <div class="pin-title">Pinned Note</div>
                <div class="divider"></div>
                <div class="pin-actions">
                    <button class="pin-action-button pin-close" title="Unpin">
                        <img src="/a7/forget/dialog-x.svg" alt="Close" />
                    </button>
                </div>
            </div>
            <div class="pin-content"></div>
        </div>
        `;
    }

    onMouseDown(e) {
        // Start dragging
        this.dragging = true;
        this.setAttribute('dragging', '');

        // Calculate the offset position
        const rect = this.getBoundingClientRect();
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;

        // Bring to front by increasing z-index
        this.style.zIndex = (this.initialZIndex + 10).toString();

        e.preventDefault();
    }

    onMouseMove(e) {
        if (!this.dragging) return;

        // Calculate new position in pixels
        const x = e.clientX - this.offsetX;
        const y = e.clientY - this.offsetY;

        // Convert to percentages
        const percentX = (x / window.innerWidth) * 100;
        const percentY = (y / window.innerHeight) * 100;

        // Update position
        this.updatePosition(percentX, percentY);

        e.preventDefault();
    }

    onMouseUp(e) {
        if (!this.dragging) return;

        // Stop dragging
        this.dragging = false;
        this.removeAttribute('dragging');

        // Reset z-index after a delay
        setTimeout(() => {
            this.style.zIndex = this.initialZIndex.toString();
        }, 300);

        // Call position change callback if defined
        if (typeof this.onPositionChange === 'function') {
            this.onPositionChange(this.posX, this.posY);
        }

        e.preventDefault();
    }

    onClose() {
        // Call close callback if defined
        if (typeof this.onClose === 'function') {
            this.onClose();
        }

        // Remove element from DOM
        this.remove();
    }

    onResize() {
        // Reapply the percentage-based position on window resize
        this.updatePosition(this.posX, this.posY);
    }

    updatePosition(percentX, percentY) {
        // Constrain position to viewport (using percentages)
        percentX = Math.max(0, Math.min(percentX, 95));
        percentY = Math.max(0, Math.min(percentY, 95));

        // Store position as percentages
        this.posX = percentX;
        this.posY = percentY;

        // Apply percentage-based positioning
        this.style.left = `${percentX}%`;
        this.style.top = `${percentY}%`;
    }

    updateStyle(bgColor, fgColor) {
        this.bgColor = bgColor;
        this.fgColor = fgColor;

        const container = this.shadowRoot.querySelector('.pin-container');
        if (container) {
            container.style.backgroundColor = bgColor;
            container.style.color = fgColor;
            container.style.border = `2px solid ${fgColor}`;
            container.style.overflow = 'hidden';
        }
    }

    updateContent(text) {
        this.content = text;

        const contentElement = this.shadowRoot.querySelector('.pin-content');
        if (contentElement) {
            contentElement.textContent = text;
        }
    }
}

customElements.define('pin-element', PinElement);
