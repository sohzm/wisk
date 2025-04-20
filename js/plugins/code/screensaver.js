class BouncingDvdElement extends HTMLElement {
    constructor() {
        super();

        // Configuration - can be adjusted
        this.idleTime = 60000; // Default: 1 minute (in milliseconds)
        this.logoSize = 150; // Size of the logo in pixels

        // Create shadow DOM
        this.attachShadow({ mode: 'open' });

        // Animation variables
        this.x = Math.random() * (window.innerWidth - this.logoSize);
        this.y = Math.random() * (window.innerHeight - this.logoSize);
        this.dx = 2 + Math.random() * 2; // horizontal speed
        this.dy = 2 + Math.random() * 2; // vertical speed
        this.currentColorIndex = 0;
        this.animationId = null;
        this.idleTimer = null;
        this.isVisible = false;

        // Array of available color variables
        this.colorPairs = [
            { fg: '--fg-red', bg: '--bg-red' },
            { fg: '--fg-green', bg: '--bg-green' },
            { fg: '--fg-blue', bg: '--bg-blue' },
            { fg: '--fg-yellow', bg: '--bg-yellow' },
            { fg: '--fg-purple', bg: '--bg-purple' },
            { fg: '--fg-cyan', bg: '--bg-cyan' },
            { fg: '--fg-orange', bg: '--bg-orange' },
        ];

        // Bind methods
        this.animate = this.animate.bind(this);
        this.resetIdleTimer = this.resetIdleTimer.bind(this);
        this.showOnIdle = this.showOnIdle.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // Initialize component
        this.initComponent();
    }

    initComponent() {
        // Create styles
        const style = document.createElement('style');
        style.textContent = `
      :host {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        background-color: var(--bg-1, transparent);
        overflow: hidden;
        display: none;
      }
      
      .bouncing-dvd {
        position: absolute;
        width: ${this.logoSize}px;
        height: ${this.logoSize}px;
        color: var(--fg-red);
        transition: color 0.5s ease;
      }
      
      svg {
        width: 100%;
        height: 100%;
      }
    `;

        // Create container for the bouncing logo
        const svgContainer = document.createElement('div');
        svgContainer.className = 'bouncing-dvd';

        // We'll fetch the SVG content and inject it
        fetch('/a7/forget/wisk-dvd-like.svg')
            .then(response => response.text())
            .then(svgText => {
                svgContainer.innerHTML = svgText;
                this.changeColor(); // Set initial color
            })
            .catch(error => {
                console.error('Error loading SVG:', error);
            });

        // Append elements to shadow DOM
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(svgContainer);

        // Store references
        this.svgContainer = svgContainer;

        // Set up event listeners for user activity
        this.setupEventListeners();
    }

    connectedCallback() {
        // Start idle timer when component is connected to DOM
        this.resetIdleTimer();
    }

    disconnectedCallback() {
        // Clean up when component is removed
        this.clearIdleTimer();
        this.stopAnimation();
        this.removeEventListeners();
    }

    setupEventListeners() {
        // User activity events
        const resetEvents = ['mousedown', 'mousemove', 'keypress', 'touchstart', 'touchmove', 'scroll', 'click'];

        for (const event of resetEvents) {
            document.addEventListener(event, this.resetIdleTimer);
        }

        // Handle window resize
        window.addEventListener('resize', this.handleResize);
    }

    removeEventListeners() {
        const resetEvents = ['mousedown', 'mousemove', 'keypress', 'touchstart', 'touchmove', 'scroll', 'click'];

        for (const event of resetEvents) {
            document.removeEventListener(event, this.resetIdleTimer);
        }

        window.removeEventListener('resize', this.handleResize);
    }

    resetIdleTimer() {
        // Clear existing timer
        this.clearIdleTimer();

        // Hide the animation if it's visible
        if (this.isVisible) {
            this.hide();
        }

        // Set new timer
        this.idleTimer = setTimeout(this.showOnIdle, this.idleTime);
    }

    clearIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
    }

    showOnIdle() {
        this.show();
    }

    show() {
        if (!this.isVisible) {
            this.style.display = 'block';
            this.isVisible = true;
            this.startAnimation();
        }
    }

    hide() {
        if (this.isVisible) {
            this.style.display = 'none';
            this.isVisible = false;
            this.stopAnimation();
        }
    }

    startAnimation() {
        if (!this.animationId) {
            this.animate();
        }
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    changeColor() {
        this.currentColorIndex = (this.currentColorIndex + 1) % this.colorPairs.length;
        const colorPair = this.colorPairs[this.currentColorIndex];
        this.svgContainer.style.color = `var(${colorPair.fg})`;
    }

    animate() {
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;

        // Update position
        this.x += this.dx;
        this.y += this.dy;

        // Check for collisions with edges
        let collision = false;

        if (this.x <= 0 || this.x + this.logoSize >= containerWidth) {
            this.dx = -this.dx;
            collision = true;
        }

        if (this.y <= 0 || this.y + this.logoSize >= containerHeight) {
            this.dy = -this.dy;
            collision = true;
        }

        // If collision occurred, change color
        if (collision) {
            this.changeColor();
        }

        // Apply new position
        this.svgContainer.style.transform = `translate(${this.x}px, ${this.y}px)`;

        // Continue animation
        this.animationId = requestAnimationFrame(this.animate);
    }

    handleResize() {
        // Keep the element within bounds after resize
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;

        if (this.x + this.logoSize > containerWidth) {
            this.x = containerWidth - this.logoSize;
        }

        if (this.y + this.logoSize > containerHeight) {
            this.y = containerHeight - this.logoSize;
        }
    }

    // Public method to set idle time
    setIdleTime(milliseconds) {
        this.idleTime = milliseconds;
        this.resetIdleTimer();
    }
}

// Register the custom element
customElements.define('bouncing-dvd', BouncingDvdElement);

// Initialize the component
(function () {
    const bouncingDvd = document.createElement('bouncing-dvd');
    document.body.appendChild(bouncingDvd);

    // Expose the component instance to window for later configuration
    window.bouncingDvd = bouncingDvd;
})();
