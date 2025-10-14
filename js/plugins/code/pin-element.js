class PinElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Properties
        this.dragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.posX = 50; // Percentage of container width
        this.posY = 100; // Pixels from top of container
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
        const container = this.shadowRoot.querySelector('.pin-container');
        const closeButton = this.shadowRoot.querySelector('.pin-close');

        container.addEventListener('mousedown', this.onMouseDown);
        closeButton.addEventListener('click', e => {
            e.stopPropagation(); // Prevent dragging when clicking close
            this.onClose();
        });
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
                position: absolute;
                z-index: ${this.initialZIndex};
                min-width: 200px;
                max-width: 300px;
                border-radius: var(--radius-large);
                font-family: var(--font);
            }
            
            :host([dragging]) {
                opacity: 0.8;
                cursor: grabbing;
            }
            
            .pin-container {
                position: relative;
                display: flex;
                flex-direction: column;
                height: 100%;
                width: 100%;
                background-color: var(--bg-2);
                color: var(--fg-1);
                border-radius: var(--radius-large);
                overflow: clip;
                cursor: grab;
                user-select: none;
                border: 2px solid transparent;
            }

            :host(:hover) .pin-container {
                border: 2px solid var(--fg-1);
            }
            

            .pin-container:active {
                cursor: grabbing;
            }

            .pin-close {
                position: absolute;
                top: -18px;
                right: 16px;
                z-index: 10;
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 4px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .pin-close img {
                width: 28px;
                height: 28px;
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
                :host {
                    display: none;
                }
            }
        </style>
        <button class="pin-close" title="Unpin">
            <img src="/a7/plugins/options-element/pin-tack.svg" alt="Close" />
        </button>
        <div class="pin-container">
            <div class="pin-content"></div>
        </div>
        `;
    }

    onMouseDown(e) {
        // Don't start dragging if clicking on the close button
        if (e.target.closest('.pin-close')) {
            return;
        }

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

        // Get the parent container (should be .editor)
        const parent = this.parentElement;
        if (!parent) return;

        const parentRect = parent.getBoundingClientRect();

        // Calculate new position relative to parent
        const x = e.clientX - parentRect.left - this.offsetX;
        const y = e.clientY - parentRect.top - this.offsetY + parent.scrollTop;

        // Convert X to percentage, keep Y as pixels
        const percentX = (x / parentRect.width) * 100;
        const pixelsY = y;

        // Update position
        this.updatePosition(percentX, pixelsY);

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
        // Reapply position on window resize (X percentage, Y pixels)
        this.updatePosition(this.posX, this.posY);
    }

    updatePosition(percentX, pixelsY) {
        // Constrain X position (percentage)
        percentX = Math.max(0, Math.min(percentX, 95));

        // Constrain Y position (pixels, minimum 0)
        pixelsY = Math.max(0, pixelsY);

        // Store position (X as percentage, Y as pixels)
        this.posX = percentX;
        this.posY = pixelsY;

        // Apply mixed positioning: X as percentage, Y as pixels
        this.style.left = `${percentX}%`;
        this.style.top = `${pixelsY}px`;
    }

    updateStyle(bgColor, fgColor) {
        this.bgColor = bgColor;
        this.fgColor = fgColor;

        const container = this.shadowRoot.querySelector('.pin-container');
        if (container) {
            container.style.backgroundColor = bgColor;
            container.style.color = fgColor;
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
