import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

// yeah this is written by gemini

// Calculate bounding box of a path, including thickness tolerance
function getPathBoundingBox(path) {
    if (!path || path.type !== 'path' || !path.points || path.points.length === 0) {
        return null;
    }
    let minX = path.points[0].x,
        maxX = path.points[0].x;
    let minY = path.points[0].y,
        maxY = path.points[0].y;
    for (let i = 1; i < path.points.length; i++) {
        minX = Math.min(minX, path.points[i].x);
        maxX = Math.max(maxX, path.points[i].x);
        minY = Math.min(minY, path.points[i].y);
        maxY = Math.max(maxY, path.points[i].y);
    }
    // Add padding based on thickness + a small buffer for clicking
    const padding = path.thickness / 2 + 5; // 5px tolerance around the line
    return {
        minX: minX - padding,
        minY: minY - padding,
        maxX: maxX + padding,
        maxY: maxY + padding,
    };
}

// Calculate bounding box for a text element
// Note: Requires a canvas context (ctx) for text measurement
function getTextBoundingBox(textItem, ctx) {
    if (!textItem || textItem.type !== 'text' || !ctx) {
        return null;
    }
    // Estimate font size based on thickness (adjust multiplier as needed)
    const fontSize = Math.max(10, textItem.thickness * 2); // Example mapping
    ctx.save();
    ctx.font = `${fontSize}px sans-serif`;
    const metrics = ctx.measureText(textItem.text);
    ctx.restore();

    const width = metrics.width;
    const height = fontSize; // Approximate height

    // Add some padding for easier clicking
    const padding = 5;

    return {
        minX: textItem.x - padding,
        minY: textItem.y - padding, // Assuming text is drawn with baseline 'top'
        maxX: textItem.x + width + padding,
        maxY: textItem.y + height + padding,
    };
}

// Check if a point is inside a rectangle
function isPointInRect(point, rect) {
    if (!rect) return false;
    return point.x >= rect.minX && point.x <= rect.maxX && point.y >= rect.minY && point.y <= rect.maxY;
}

// Check if two rectangles overlap
function doRectsOverlap(rect1, rect2) {
    if (!rect1 || !rect2) return false;
    return rect1.minX < rect2.maxX && rect1.maxX > rect2.minX && rect1.minY < rect2.maxY && rect1.maxY > rect2.minY;
}

// --- Canvas Element ---

class CanvasElement extends LitElement {
    static styles = css`
        /* --- Existing styles --- */
        * {
            user-select: none;
            box-sizing: border-box;
        }
        :host,
        .host {
            display: block;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            overflow: hidden;
            position: relative;
        }
        .host {
            transition: border 0.3s;
            border: 1px solid var(--bg-3);
            border-radius: var(--radius);
            background-color: var(--bg-1);
        }
        #toolbar {
            display: flex;
            padding: var(--padding-2) var(--padding-3);
            background-color: var(--bg-2);
            align-items: center;
            position: absolute;
            bottom: 10px;
            z-index: 10;
            left: 50%;
            transform: translate(-50%, 0);
            border: 1px solid var(--border-1);
            border-radius: calc(var(--radius) * 20);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease-in-out;
        }
        .host:hover #toolbar {
            opacity: 1;
            pointer-events: auto;
        }
        #drawing-canvas {
            display: block;
            width: 100%;
            height: 100%;
            cursor: crosshair;
            background-color: transparent;
            touch-action: none; /* Prevent browser touch actions */
        }
        #toolbar button img {
            height: 16px;
            width: 16px;
            filter: var(--themed-svg);
            pointer-events: none;
        }
        .tbn {
            height: 28px;
            width: 28px;
            outline: none;
            border-radius: var(--radius);
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: transparent;
            cursor: pointer;
            margin: 0 2px;
        }
        .button-active {
            background-color: var(--bg-3);
        }
        #toolbar button:hover {
            background-color: var(--bg-2);
        }
        #thickness-slider-wrapper {
            position: relative;
            width: 100px;
            display: flex;
            align-items: center;
            padding: 0 8px;
        }
        #thickness-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 4px;
            border-radius: var(--radius);
            background: var(--fg-2);
            outline: none;
        }
        #thickness-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: var(--fg-1);
            border: 2px solid var(--accent);
            cursor: pointer;
            border: none;
            transition: transform 0.1s;
        }
        #thickness-slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--accent);
            cursor: pointer;
            border: none;
            transition: transform 0.1s;
        }
        #thickness-slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
        }
        #thickness-slider::-moz-range-thumb:hover {
            transform: scale(1.1);
        }
        #thickness-slider:active::-webkit-slider-thumb {
            transform: scale(0.9);
        }
        #thickness-slider:active::-moz-range-thumb {
            transform: scale(0.9);
        }
        .hidden {
            display: none !important;
        }
        .color-picker-wrapper {
            display: flex;
            gap: 4px;
            align-items: center;
            padding: 0 8px;
        }

        .color-button {
            width: 16px;
            height: 16px;
            border-radius: 20px;
            cursor: pointer;
            transition:
                transform 0.1s,
                width 0.1s,
                height 0.1s;
            border: 2px solid transparent;
            box-sizing: border-box;
        }

        .color-button.active {
            border-color: var(--accent);
            transform: scale(1.1);
        }

        .max-out {
            position: fixed;
            top: 0;
            border: none;
            border-radius: 0;
            left: 0;
            height: 100%;
            width: 100%;
            z-index: 100;
        }
        .max-out #drawing-canvas {
            width: 100%;
            height: 100%;
        }

        .color-red {
            background-color: var(--fg-red);
        }
        .color-green {
            background-color: var(--fg-green);
        }
        .color-blue {
            background-color: var(--fg-blue);
        }
        .color-yellow {
            background-color: var(--fg-yellow);
        }
        .color-purple {
            background-color: var(--fg-purple);
        }
        .color-cyan {
            background-color: var(--fg-cyan);
        }
        .color-orange {
            background-color: var(--fg-orange);
        }
        .color-default {
            background-color: var(--fg-1);
        }
    `;

    static properties = {
        isInitialized: { type: Boolean },
        currentMode: { type: String },
        currentThemeColor: { type: String },
        currentColor: { type: String },
        currentThickness: { type: Number },
        isPanning: { type: Boolean },
        isDrawing: { type: Boolean }, // For paths
        isMovingSelection: { type: Boolean },
        isMarqueeSelecting: { type: Boolean },
        isTouchDevice: { type: Boolean },
        zoom: { type: Number },
        id: { type: String, reflect: true },
    };

    constructor() {
        super();
        this.isInitialized = false;
        this.pendingValue = null;
        this.isPanning = false;
        this.isDrawing = false; // Only for paths now
        this.isMovingSelection = false;
        this.isMarqueeSelecting = false;
        this.currentMode = 'draw'; // Default mode
        this.currentThemeColor = 'default';
        this.currentColor = '';
        this.currentThickness = 2; // Used for path thickness and text size base
        this.zoom = 1;
        this.panOffset = { x: 0, y: 0 };
        this.lastPanPosition = { x: 0, y: 0 };
        this.marqueeStart = null;
        this.marqueeEnd = null;
        this.moveStartPoint = null;
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        this.elements = []; // Changed from 'paths' to hold both paths and text
        this.currentPath = null; // Only used during path drawing
        this.selectedElementIndices = new Set(); // Changed from 'selectedPathIndices'
        this.touchData = {
            touches: [],
            lastDistance: 0,
            isDragging: false,
            lastPoint: null,
            lastTap: 0, // For double tap detection
            tapTimeout: null, // For double tap detection
        };

        this.themeColors = {
            red: { cssVar: '--fg-red' },
            green: { cssVar: '--fg-green' },
            blue: { cssVar: '--fg-blue' },
            yellow: { cssVar: '--fg-yellow' },
            purple: { cssVar: '--fg-purple' },
            cyan: { cssVar: '--fg-cyan' },
            orange: { cssVar: '--fg-orange' },
            default: { cssVar: '--fg-1' },
        };

        window.addEventListener('wisk-theme-changed', () => this.handleThemeChange());
    }

    // --- Lifecycle Methods (connectedCallback, disconnectedCallback) ---
    // No changes needed here

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('wisk-theme-changed', this.handleThemeChange);
        window.removeEventListener('mousemove', this.handleGlobalMouseMove);
        window.removeEventListener('mouseup', this.handleGlobalMouseUp);
        window.removeEventListener('touchmove', this.handleGlobalTouchMove);
        window.removeEventListener('touchend', this.handleGlobalTouchEnd);
        window.removeEventListener('touchcancel', this.handleGlobalTouchEnd);
    }

    firstUpdated() {
        this.canvas = this.shadowRoot.getElementById('drawing-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.hostElement = this.shadowRoot.querySelector('.host');

        this.resizeCanvas();
        this.bindEvents();
        this.setMode(this.currentMode);
        this.updateCurrentColor(this.currentThemeColor);

        this.isInitialized = true;
        if (this.pendingValue) {
            this.setValue('', this.pendingValue);
            this.pendingValue = null;
        } else {
            this.redrawCanvas();
        }

        // Bind global event handlers
        this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
        this.handleGlobalMouseUp = this.handleGlobalMouseUp.bind(this);
        this.handleGlobalTouchMove = this.handleGlobalTouchMove.bind(this);
        this.handleGlobalTouchEnd = this.handleGlobalTouchEnd.bind(this);

        // Add global event listeners
        window.addEventListener('mousemove', this.handleGlobalMouseMove);
        window.addEventListener('mouseup', this.handleGlobalMouseUp);
        window.addEventListener('touchmove', this.handleGlobalTouchMove, { passive: false });
        window.addEventListener('touchend', this.handleGlobalTouchEnd);
        window.addEventListener('touchcancel', this.handleGlobalTouchEnd);
    }

    // --- Canvas Drawing and State ---

    resizeCanvas() {
        // No changes needed here
        if (!this.canvas || !this.hostElement) return;

        const isMaxOut = this.hostElement.classList.contains('max-out');
        const dpr = window.devicePixelRatio || 1;

        let newWidth, newHeight;

        if (isMaxOut) {
            newWidth = window.innerWidth;
            newHeight = window.innerHeight;
        } else {
            const rect = this.hostElement.getBoundingClientRect();
            newWidth = rect.width;
            newHeight = rect.height;
        }

        if (newWidth <= 0 || newHeight <= 0) {
            console.warn('Invalid canvas dimensions:', newWidth, newHeight);
            return;
        }

        this.canvas.width = newWidth * dpr;
        this.canvas.height = newHeight * dpr;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.redrawCanvas();
    }

    redrawCanvas() {
        if (!this.ctx || !this.canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = this.canvas.width / dpr;
        const canvasHeight = this.canvas.height / dpr;

        this.ctx.save();

        // Scale for high DPI
        this.ctx.scale(dpr, dpr);

        // Clear canvas
        const backgroundColor = getComputedStyle(this.hostElement).getPropertyValue('--bg-1').trim();
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Apply zoom and pan
        this.ctx.translate(this.panOffset.x, this.panOffset.y);
        this.ctx.scale(this.zoom, this.zoom);

        // --- Draw all elements (paths and text) ---
        this.elements.forEach((element, index) => {
            if (!element) return;

            let bbox = null; // For selection highlight

            if (element.type === 'path') {
                if (element.points.length < 1) return;

                this.ctx.beginPath();
                this.ctx.strokeStyle = element.color;
                this.ctx.lineWidth = element.thickness;
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';

                this.ctx.moveTo(element.points[0].x, element.points[0].y);
                for (let i = 1; i < element.points.length; i++) {
                    this.ctx.lineTo(element.points[i].x, element.points[i].y);
                }
                this.ctx.stroke();
                bbox = getPathBoundingBox(element);
            } else if (element.type === 'text') {
                const fontSize = Math.max(10, element.thickness * 2); // Use thickness as base for size
                this.ctx.fillStyle = element.color;
                this.ctx.font = `${fontSize}px sans-serif`;
                this.ctx.textAlign = 'left';
                this.ctx.textBaseline = 'top'; // Draw text from top-left corner
                this.ctx.fillText(element.text, element.x, element.y);
                // Use the specific context for measurement during redraw
                bbox = getTextBoundingBox(element, this.ctx);
            }

            // Draw selection highlight for both types
            if (this.selectedElementIndices.has(index) && this.currentMode === 'select') {
                if (bbox) {
                    const computedStyle = getComputedStyle(document.documentElement);
                    const accentColor = computedStyle.getPropertyValue('--fg-accent').trim();

                    this.ctx.strokeStyle = accentColor;
                    this.ctx.lineWidth = 2 / this.zoom;
                    this.ctx.strokeRect(bbox.minX, bbox.minY, bbox.maxX - bbox.minX, bbox.maxY - bbox.minY);
                }
            }
        });

        // --- Draw marquee selection ---
        if (this.isMarqueeSelecting && this.marqueeStart && this.marqueeEnd) {
            // Restore transforms before drawing screen-space marquee
            this.ctx.restore(); // Restore from zoom/pan
            this.ctx.restore(); // Restore from dpr scaling
            this.ctx.save(); // Save clean state

            // Re-apply DPR scaling only for screen-space drawing
            this.ctx.scale(dpr, dpr);

            const rectX = Math.min(this.marqueeStart.screenX, this.marqueeEnd.screenX);
            const rectY = Math.min(this.marqueeStart.screenY, this.marqueeEnd.screenY);
            const rectW = Math.abs(this.marqueeStart.screenX - this.marqueeEnd.screenX);
            const rectH = Math.abs(this.marqueeStart.screenY - this.marqueeEnd.screenY);

            // get accent color for marquee
            const computedStyle = getComputedStyle(document.documentElement);
            const accentColor = computedStyle.getPropertyValue('--fg-accent').trim();
            const accentBgColor = computedStyle.getPropertyValue('--bg-accent').trim();

            // convert from hex to rgb
            const r = parseInt(accentColor.slice(1, 3), 16);
            const g = parseInt(accentColor.slice(3, 5), 16);
            const b = parseInt(accentColor.slice(5, 7), 16);

            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.1)`;
            this.ctx.fillRect(rectX, rectY, rectW, rectH);
            this.ctx.strokeStyle = accentColor;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(rectX, rectY, rectW, rectH);
            this.ctx.restore();
            return;
        }

        this.ctx.restore();
    }

    getComputedColor(cssVariable) {
        if (!this.hostElement) return '#000000';
        const computedStyle = getComputedStyle(this.hostElement);
        return computedStyle.getPropertyValue(cssVariable).trim() || '#000000';
    }

    updateCurrentColor(colorName) {
        // No changes needed here
        const colorInfo = this.themeColors[colorName];
        if (!colorInfo) {
            console.warn(`Color name "${colorName}" not found in themeColors.`);
            colorName = 'default';
        }
        const cssVar = this.themeColors[colorName].cssVar;
        this.currentColor = this.getComputedColor(cssVar);
        this.currentThemeColor = colorName;

        const colorButtons = this.shadowRoot.querySelectorAll('.color-button');
        colorButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === colorName);
        });
    }

    handleThemeChange() {
        // Update current drawing color
        this.updateCurrentColor(this.currentThemeColor);

        // Update colors of existing elements
        this.elements = this.elements.map(element => {
            const colorName = element.colorName || 'default';
            const newColor = this.getComputedColor(this.themeColors[colorName].cssVar);
            return { ...element, color: newColor, colorName: colorName };
        });

        this.redrawCanvas();
    }

    // --- Event Binding and Handling ---

    bindEvents() {
        const toolbar = this.shadowRoot.getElementById('toolbar');
        toolbar.addEventListener('click', this.handleToolbarClick.bind(this));

        // Canvas mouse events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this)); // Add double click listener
        this.canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

        // Touch events
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });

        // Color buttons
        const colorButtons = this.shadowRoot.querySelectorAll('.color-button');
        colorButtons.forEach(button => {
            button.addEventListener('click', e => {
                const colorName = e.target.dataset.color;
                this.updateCurrentColor(colorName);
            });
        });

        // Thickness slider
        const thicknessSlider = this.shadowRoot.getElementById('thickness-slider');
        thicknessSlider.addEventListener('input', e => {
            this.currentThickness = parseInt(e.target.value);
        });
    }

    handleToolbarClick(e) {
        const button = e.target.closest('button');
        if (!button) return;
        const action = button.dataset.action;
        if (!action) return;

        const readonly = typeof wisk !== 'undefined' && wisk.editor && wisk.editor.readonly;
        if (readonly && ['draw', 'text', 'select', 'delete-selected', 'clear-all'].includes(action)) {
            console.log('Readonly mode: Action disabled', action);
            return;
        }

        switch (action) {
            case 'home':
                this.resetView();
                break;
            case 'pan':
            case 'draw':
            case 'select':
            case 'text': // Handle new text mode
                this.setMode(action);
                break;
            case 'delete-selected':
                this.deleteSelectedElements(); // Updated function name
                break;
            case 'clear-all':
                this.clearAllElements(); // Updated function name
                break;
            case 'max-out':
                this.hostElement.classList.toggle('max-out');
                setTimeout(() => this.resizeCanvas(), 50);
                break;
        }
    }

    deleteSelectedElements() {
        if (this.selectedElementIndices.size === 0) return;

        const selectedIndicesArray = Array.from(this.selectedElementIndices).sort((a, b) => b - a); // Sort descending

        selectedIndicesArray.forEach(index => {
            this.elements.splice(index, 1); // Remove element at index
        });

        this.selectedElementIndices.clear();
        this.redrawCanvas();
        this.sendUpdates();
    }

    clearAllElements() {
        this.elements = [];
        this.selectedElementIndices.clear();
        this.redrawCanvas();
        this.sendUpdates();
    }

    resetView() {
        this.zoom = 1;
        this.panOffset = { x: 0, y: 0 };
        this.selectedElementIndices.clear();
        this.redrawCanvas();
    }

    setMode(mode) {
        this.currentMode = mode;
        this.isDrawing = false;
        this.isPanning = false;
        this.isMovingSelection = false;
        this.isMarqueeSelecting = false;
        this.currentPath = null; // Clear any unfinished path

        const buttons = this.shadowRoot.querySelectorAll('#toolbar button[data-action]');
        buttons.forEach(button => {
            const action = button.dataset.action;
            if (['pan', 'draw', 'select', 'text'].includes(action)) {
                // Include text mode
                button.classList.toggle('button-active', action === mode);
            }
        });

        // Update cursor
        switch (mode) {
            case 'pan':
                this.canvas.style.cursor = 'grab';
                break;
            case 'draw':
                this.canvas.style.cursor = 'crosshair';
                break;
            case 'text':
                this.canvas.style.cursor = 'text'; // Text cursor
                break;
            case 'select':
                this.canvas.style.cursor = 'default';
                break;
            default:
                this.canvas.style.cursor = 'default';
                break;
        }
        this.redrawCanvas(); // Redraw needed if selection highlights change based on mode
    }

    // --- Coordinate Conversion ---

    getCanvasPoint(clientX, clientY) {
        // No changes needed here
        const rect = this.canvas.getBoundingClientRect();
        const x = (clientX - rect.left - this.panOffset.x) / this.zoom;
        const y = (clientY - rect.top - this.panOffset.y) / this.zoom;
        return { x, y };
    }

    getScreenPoint(clientX, clientY) {
        // No changes needed here
        const rect = this.canvas.getBoundingClientRect();
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    // --- Mouse Event Handlers ---

    onMouseDown(e) {
        const startPoint = this.getCanvasPoint(e.clientX, e.clientY);
        const startScreenPoint = this.getScreenPoint(e.clientX, e.clientY);
        const readonly = typeof wisk !== 'undefined' && wisk.editor && wisk.editor.readonly;

        if (this.currentMode === 'pan' || e.button === 1) {
            // Middle mouse always pans
            this.isPanning = true;
            this.lastPanPosition = { x: e.clientX, y: e.clientY };
            this.canvas.style.cursor = 'grabbing';
        } else if (this.currentMode === 'draw' && e.button === 0 && !readonly) {
            // Left click draw path
            this.isDrawing = true;
            this.selectedElementIndices.clear();
            const newPath = {
                type: 'path', // Add type
                points: [startPoint],
                color: this.currentColor,
                colorName: this.currentThemeColor,
                thickness: this.currentThickness,
            };
            this.currentPath = newPath;
            this.elements.push(newPath); // Add to elements array
            this.redrawCanvas();
        } else if (this.currentMode === 'text' && e.button === 0 && !readonly) {
            // Left click add text
            const text = window.prompt('Enter text:', 'Hello');
            if (text !== null && text.trim() !== '') {
                // Check if prompt wasn't cancelled or empty
                const newTextElement = {
                    type: 'text', // Add type
                    text: text,
                    x: startPoint.x,
                    y: startPoint.y,
                    color: this.currentColor,
                    colorName: this.currentThemeColor,
                    thickness: this.currentThickness, // Use thickness for size base
                };
                this.elements.push(newTextElement); // Add to elements array
                this.selectedElementIndices.clear(); // Deselect others
                this.redrawCanvas();
                this.sendUpdates(); // Send update after adding text
            }
        } else if (this.currentMode === 'select' && e.button === 0) {
            // Left click select
            let clickedOnSelection = false;
            let clickedElementIndex = -1;

            // Check if clicked on an already selected element's bounding box
            if (this.selectedElementIndices.size > 0) {
                for (const index of this.selectedElementIndices) {
                    const element = this.elements[index];
                    const bbox = element.type === 'path' ? getPathBoundingBox(element) : getTextBoundingBox(element, this.ctx);
                    if (isPointInRect(startPoint, bbox)) {
                        clickedOnSelection = true;
                        break; // No need to check others if clicked on one
                    }
                }
            }

            if (clickedOnSelection && !readonly) {
                // Start moving the current selection (if not readonly)
                this.isMovingSelection = true;
                this.moveStartPoint = startPoint;
            } else {
                // Check if clicked on any element's bounding box (check in reverse for top-most)
                for (let i = this.elements.length - 1; i >= 0; i--) {
                    const element = this.elements[i];
                    const bbox = element.type === 'path' ? getPathBoundingBox(element) : getTextBoundingBox(element, this.ctx);
                    if (isPointInRect(startPoint, bbox)) {
                        clickedElementIndex = i;
                        break;
                    }
                }

                if (clickedElementIndex !== -1) {
                    // Clicked on an element, update selection
                    if (e.shiftKey) {
                        // Toggle selection with Shift key
                        if (this.selectedElementIndices.has(clickedElementIndex)) {
                            this.selectedElementIndices.delete(clickedElementIndex);
                        } else {
                            this.selectedElementIndices.add(clickedElementIndex);
                        }
                    } else {
                        // Regular click: clear previous selection, select only this element
                        this.selectedElementIndices.clear();
                        this.selectedElementIndices.add(clickedElementIndex);
                    }
                    if (!readonly) {
                        this.isMovingSelection = true; // Allow moving if not readonly
                        this.moveStartPoint = startPoint;
                    }
                } else {
                    // Clicked on empty space: start marquee selection or clear selection
                    if (!e.shiftKey) {
                        this.selectedElementIndices.clear();
                    }
                    this.isMarqueeSelecting = true;
                    this.marqueeStart = { canvasX: startPoint.x, canvasY: startPoint.y, screenX: startScreenPoint.x, screenY: startScreenPoint.y };
                    this.marqueeEnd = { screenX: startScreenPoint.x, screenY: startScreenPoint.y };
                }
                this.redrawCanvas();
            }
        }
    }

    handleGlobalMouseMove(e) {
        if (!this.isInitialized || (!this.isPanning && !this.isDrawing && !this.isMovingSelection && !this.isMarqueeSelecting)) {
            return;
        }

        const currentPoint = this.getCanvasPoint(e.clientX, e.clientY);
        const currentScreenPoint = this.getScreenPoint(e.clientX, e.clientY);

        if (this.isPanning) {
            const deltaX = e.clientX - this.lastPanPosition.x;
            const deltaY = e.clientY - this.lastPanPosition.y;
            this.panOffset.x += deltaX;
            this.panOffset.y += deltaY;
            this.lastPanPosition = { x: e.clientX, y: e.clientY };
            this.redrawCanvas();
        } else if (this.isDrawing && this.currentPath) {
            // Drawing a path
            const lastPoint = this.currentPath.points[this.currentPath.points.length - 1];
            if (Math.abs(currentPoint.x - lastPoint.x) > 0.5 || Math.abs(currentPoint.y - lastPoint.y) > 0.5) {
                this.currentPath.points.push(currentPoint);
                this.redrawCanvas(); // Redraw frequently while drawing path
            }
        } else if (this.isMovingSelection && this.moveStartPoint) {
            // Moving selected elements
            const deltaX = currentPoint.x - this.moveStartPoint.x;
            const deltaY = currentPoint.y - this.moveStartPoint.y;

            this.selectedElementIndices.forEach(index => {
                const element = this.elements[index];
                if (element.type === 'path') {
                    element.points = element.points.map(p => ({ x: p.x + deltaX, y: p.y + deltaY }));
                } else if (element.type === 'text') {
                    element.x += deltaX;
                    element.y += deltaY;
                }
            });

            this.redrawCanvas();
            this.moveStartPoint = currentPoint; // Update start point for continuous move
        } else if (this.isMarqueeSelecting && this.marqueeStart) {
            // Updating marquee rectangle
            this.marqueeEnd = { screenX: currentScreenPoint.x, screenY: currentScreenPoint.y };
            this.redrawCanvas(); // Redraw to show marquee updating
        }
    }

    handleGlobalMouseUp(e) {
        if (this.isPanning) {
            this.isPanning = false;
            if (this.currentMode === 'pan') this.canvas.style.cursor = 'grab'; // Reset cursor if in pan mode
            // No update needed for just panning
        } else if (this.isDrawing) {
            this.isDrawing = false;
            if (this.currentPath && this.currentPath.points.length > 1) {
                // Path finished, simplify if needed? (Optional)
                this.sendUpdates(); // Send update for the new path
            } else if (this.currentPath) {
                // Path was just a dot, remove it
                this.elements.pop(); // Remove the single-point path
                this.redrawCanvas(); // Redraw without the dot
            }
            this.currentPath = null;
        } else if (this.isMovingSelection) {
            this.isMovingSelection = false;
            this.moveStartPoint = null;
            this.sendUpdates(); // Send update after moving elements
        } else if (this.isMarqueeSelecting) {
            this.isMarqueeSelecting = false;
            const marqueeCanvasEnd = this.getCanvasPoint(e.clientX, e.clientY);
            const marqueeRect = {
                minX: Math.min(this.marqueeStart.canvasX, marqueeCanvasEnd.x),
                minY: Math.min(this.marqueeStart.canvasY, marqueeCanvasEnd.y),
                maxX: Math.max(this.marqueeStart.canvasX, marqueeCanvasEnd.x),
                maxY: Math.max(this.marqueeStart.canvasY, marqueeCanvasEnd.y),
            };

            if (!e.shiftKey) {
                this.selectedElementIndices.clear();
            }

            // Select elements whose bounding boxes intersect the marquee
            this.elements.forEach((element, index) => {
                const bbox = element.type === 'path' ? getPathBoundingBox(element) : getTextBoundingBox(element, this.ctx);
                if (bbox && doRectsOverlap(bbox, marqueeRect)) {
                    this.selectedElementIndices.add(index);
                }
            });

            this.marqueeStart = null;
            this.marqueeEnd = null;
            this.redrawCanvas(); // Redraw to show final selection
            // No update needed for just selecting
        }
    }

    onDoubleClick(e) {
        const readonly = typeof wisk !== 'undefined' && wisk.editor && wisk.editor.readonly;
        if (readonly || this.currentMode !== 'select') {
            // Only allow editing in select mode and if not readonly
            return;
        }

        const point = this.getCanvasPoint(e.clientX, e.clientY);

        // Find the top-most text element under the double-click
        let targetElementIndex = -1;
        for (let i = this.elements.length - 1; i >= 0; i--) {
            const element = this.elements[i];
            if (element.type === 'text') {
                const bbox = getTextBoundingBox(element, this.ctx);
                if (isPointInRect(point, bbox)) {
                    targetElementIndex = i;
                    break;
                }
            }
        }

        if (targetElementIndex !== -1) {
            const element = this.elements[targetElementIndex];
            const newText = window.prompt('Edit text:', element.text);

            if (newText !== null) {
                // Check if prompt wasn't cancelled
                if (newText.trim() === '') {
                    // If text is empty, delete the element
                    this.elements.splice(targetElementIndex, 1);
                    this.selectedElementIndices.delete(targetElementIndex); // Deselect if it was selected
                    // Adjust indices in selection set if needed
                    const newSelection = new Set();
                    this.selectedElementIndices.forEach(idx => {
                        if (idx > targetElementIndex) {
                            newSelection.add(idx - 1);
                        } else if (idx < targetElementIndex) {
                            newSelection.add(idx);
                        }
                    });
                    this.selectedElementIndices = newSelection;
                } else {
                    // Update the text
                    element.text = newText;
                }
                this.redrawCanvas();
                this.sendUpdates();
            }
        }
    }

    onWheel(e) {
        // No changes needed here
        e.preventDefault();

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.offsetX ?? e.clientX - rect.left;
        const mouseY = e.offsetY ?? e.clientY - rect.top;

        const zoomIntensity = 0.1;
        const scroll = e.deltaY < 0 ? 1 : -1;
        const zoomFactor = Math.exp(scroll * zoomIntensity);

        const newZoom = Math.max(0.1, Math.min(10, this.zoom * zoomFactor));

        const mousePoint = {
            x: (mouseX - this.panOffset.x) / this.zoom,
            y: (mouseY - this.panOffset.y) / this.zoom,
        };

        this.panOffset.x = mouseX - mousePoint.x * newZoom;
        this.panOffset.y = mouseY - mousePoint.y * newZoom;
        this.zoom = newZoom;

        this.redrawCanvas();
    }

    // --- Touch Event Handlers (Simplified - Double tap edit not implemented) ---

    onTouchStart(e) {
        e.preventDefault();
        const touches = e.touches;
        const readonly = typeof wisk !== 'undefined' && wisk.editor && wisk.editor.readonly;

        // Update touch data
        this.touchData.touches = Array.from(touches).map(touch => ({
            id: touch.identifier,
            clientX: touch.clientX,
            clientY: touch.clientY,
        }));

        if (touches.length === 1) {
            const touch = touches[0];
            const touchPoint = this.getCanvasPoint(touch.clientX, touch.clientY);
            const touchScreenPoint = this.getScreenPoint(touch.clientX, touch.clientY);
            this.touchData.lastPoint = touchPoint;

            // --- Double Tap Detection ---
            const currentTime = new Date().getTime();
            const tapLength = currentTime - this.touchData.lastTap;
            clearTimeout(this.touchData.tapTimeout);
            if (tapLength < 300 && tapLength > 0 && !readonly && this.currentMode === 'select') {
                // Double tap detected - simulate double click for editing text
                this.onDoubleClick({ clientX: touch.clientX, clientY: touch.clientY }); // Use simulated event
                this.touchData.lastTap = 0; // Reset tap time
                return; // Don't process as single tap
            } else {
                // Set timeout for single tap action, allows double tap to cancel it
                this.touchData.tapTimeout = setTimeout(() => {
                    // --- Single Tap Actions ---
                    if (this.currentMode === 'pan') {
                        this.isPanning = true;
                        this.lastPanPosition = { x: touch.clientX, y: touch.clientY };
                    } else if (this.currentMode === 'draw' && !readonly) {
                        this.isDrawing = true;
                        this.selectedElementIndices.clear();
                        const newPath = {
                            type: 'path',
                            points: [touchPoint],
                            color: this.currentColor,
                            colorName: this.currentThemeColor,
                            thickness: this.currentThickness,
                        };
                        this.currentPath = newPath;
                        this.elements.push(newPath);
                        this.redrawCanvas();
                    } else if (this.currentMode === 'text' && !readonly) {
                        // Text on touch: Maybe prompt immediately or require a second tap?
                        // For now, let's prompt immediately like mouse click.
                        const text = window.prompt('Enter text:', 'Hello');
                        if (text !== null && text.trim() !== '') {
                            const newTextElement = {
                                type: 'text',
                                text: text,
                                x: touchPoint.x,
                                y: touchPoint.y,
                                color: this.currentColor,
                                colorName: this.currentThemeColor,
                                thickness: this.currentThickness,
                            };
                            this.elements.push(newTextElement);
                            this.selectedElementIndices.clear();
                            this.redrawCanvas();
                            this.sendUpdates();
                        }
                    } else if (this.currentMode === 'select') {
                        // Selection logic similar to mousedown
                        let clickedOnSelection = false;
                        let clickedElementIndex = -1;

                        // Check selected elements first
                        if (this.selectedElementIndices.size > 0) {
                            for (const index of this.selectedElementIndices) {
                                const element = this.elements[index];
                                const bbox = element.type === 'path' ? getPathBoundingBox(element) : getTextBoundingBox(element, this.ctx);
                                if (isPointInRect(touchPoint, bbox)) {
                                    clickedOnSelection = true;
                                    break;
                                }
                            }
                        }

                        if (clickedOnSelection && !readonly) {
                            this.isMovingSelection = true;
                            this.moveStartPoint = touchPoint;
                            this.touchData.isDragging = true; // Flag for touch move
                        } else {
                            // Check all elements
                            for (let i = this.elements.length - 1; i >= 0; i--) {
                                const element = this.elements[i];
                                const bbox = element.type === 'path' ? getPathBoundingBox(element) : getTextBoundingBox(element, this.ctx);
                                if (isPointInRect(touchPoint, bbox)) {
                                    clickedElementIndex = i;
                                    break;
                                }
                            }

                            if (clickedElementIndex !== -1) {
                                // Tapped on an element
                                this.selectedElementIndices.clear(); // Single tap clears previous selection on mobile usually
                                this.selectedElementIndices.add(clickedElementIndex);
                                if (!readonly) {
                                    this.isMovingSelection = true; // Prepare for potential drag
                                    this.moveStartPoint = touchPoint;
                                    this.touchData.isDragging = true;
                                }
                            } else {
                                // Tapped on empty space - clear selection
                                this.selectedElementIndices.clear();
                                // Don't start marquee on single tap, maybe require long press? (Keep simple for now)
                            }
                            this.redrawCanvas();
                        }
                    }
                }, 300); // Wait 300ms for a potential double tap
            }
            this.touchData.lastTap = currentTime;
        } else if (touches.length === 2) {
            // Two-finger pinch zoom/pan setup
            this.isPanning = false; // Stop single touch pan/draw/move if active
            this.isDrawing = false;
            this.isMovingSelection = false;
            this.isMarqueeSelecting = false;
            this.currentPath = null;
            clearTimeout(this.touchData.tapTimeout); // Cancel any pending single tap

            const touch1 = touches[0];
            const touch2 = touches[1];

            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            this.touchData.lastDistance = Math.sqrt(dx * dx + dy * dy);

            const midX = (touch1.clientX + touch2.clientX) / 2;
            const midY = (touch1.clientY + touch2.clientY) / 2;
            // Store screen midpoint for panning during zoom
            this.touchData.pinchPanStart = { x: midX, y: midY };
        }
    }

    handleGlobalTouchMove(e) {
        if (!this.isInitialized) return;

        e.preventDefault(); // Prevent scrolling etc.
        const touches = e.touches;

        if (touches.length === 1 && (this.isPanning || this.isDrawing || this.isMovingSelection)) {
            // Single touch move (pan, draw path, move selection)
            const touch = touches[0];
            const currentPoint = this.getCanvasPoint(touch.clientX, touch.clientY);

            if (this.isPanning) {
                const deltaX = touch.clientX - this.lastPanPosition.x;
                const deltaY = touch.clientY - this.lastPanPosition.y;
                this.panOffset.x += deltaX;
                this.panOffset.y += deltaY;
                this.lastPanPosition = { x: touch.clientX, y: touch.clientY };
                this.redrawCanvas();
            } else if (this.isDrawing && this.currentPath) {
                const lastPoint = this.currentPath.points[this.currentPath.points.length - 1];
                if (Math.hypot(currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y) > 1 / this.zoom) {
                    // Add point if moved enough
                    this.currentPath.points.push(currentPoint);
                    this.redrawCanvas();
                }
            } else if (this.isMovingSelection && this.moveStartPoint) {
                const deltaX = currentPoint.x - this.moveStartPoint.x;
                const deltaY = currentPoint.y - this.moveStartPoint.y;

                this.selectedElementIndices.forEach(index => {
                    const element = this.elements[index];
                    if (element.type === 'path') {
                        element.points = element.points.map(p => ({ x: p.x + deltaX, y: p.y + deltaY }));
                    } else if (element.type === 'text') {
                        element.x += deltaX;
                        element.y += deltaY;
                    }
                });
                this.redrawCanvas();
                this.moveStartPoint = currentPoint; // Update for continuous move
            }
            this.touchData.lastPoint = currentPoint;
        } else if (touches.length === 2) {
            // Pinch zoom and two-finger pan
            const touch1 = touches[0];
            const touch2 = touches[1];

            // Calculate new distance and midpoint
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            const newDistance = Math.sqrt(dx * dx + dy * dy);
            const midX = (touch1.clientX + touch2.clientX) / 2;
            const midY = (touch1.clientY + touch2.clientY) / 2;

            // --- Zooming ---
            const zoomFactor = newDistance / this.touchData.lastDistance;
            this.touchData.lastDistance = newDistance;

            const newZoom = Math.max(0.1, Math.min(10, this.zoom * zoomFactor));

            // Calculate mouse position relative to canvas before zoom
            const mousePointBeforeZoom = {
                x: (midX - this.panOffset.x) / this.zoom,
                y: (midY - this.panOffset.y) / this.zoom,
            };

            // --- Panning ---
            const panDeltaX = midX - this.touchData.pinchPanStart.x;
            const panDeltaY = midY - this.touchData.pinchPanStart.y;

            // Apply pan and zoom adjustment
            this.panOffset.x = midX - mousePointBeforeZoom.x * newZoom + panDeltaX;
            this.panOffset.y = midY - mousePointBeforeZoom.y * newZoom + panDeltaY;
            this.zoom = newZoom;

            // Update pan start for next move event
            this.touchData.pinchPanStart = { x: midX, y: midY };

            this.redrawCanvas();
        }
    }

    handleGlobalTouchEnd(e) {
        clearTimeout(this.touchData.tapTimeout); // Clear any pending single tap action

        const endedAllTouches = e.touches.length === 0;

        if (this.isPanning) {
            if (endedAllTouches) this.isPanning = false;
        } else if (this.isDrawing) {
            if (endedAllTouches) {
                this.isDrawing = false;
                if (this.currentPath && this.currentPath.points.length > 1) {
                    this.sendUpdates();
                } else if (this.currentPath) {
                    this.elements.pop(); // Remove dot
                    this.redrawCanvas();
                }
                this.currentPath = null;
            }
        } else if (this.isMovingSelection) {
            if (endedAllTouches) {
                this.isMovingSelection = false;
                this.moveStartPoint = null;
                this.touchData.isDragging = false;
                this.sendUpdates();
            }
        }
        // No equivalent end action needed for text or select (handled on start/double tap)
        // No marquee selection implemented for touch yet

        if (endedAllTouches) {
            // Reset touch tracking state
            this.touchData = {
                touches: [],
                lastDistance: 0,
                isDragging: false,
                lastPoint: null,
                lastTap: this.touchData.lastTap,
                tapTimeout: null,
                pinchPanStart: null,
            }; // Keep lastTap for next potential double tap
        } else {
            // Update touch array if some touches remain (e.g., lifting one finger during pinch)
            this.touchData.touches = Array.from(e.touches).map(touch => ({
                id: touch.identifier,
                clientX: touch.clientX,
                clientY: touch.clientY,
            }));
            // If transitioning from 2 fingers to 1, reset pinch state and potentially prepare for single-touch pan/move
            if (e.touches.length === 1) {
                this.touchData.lastDistance = 0;
                this.touchData.pinchPanStart = null;
                const touch = e.touches[0];
                this.touchData.lastPoint = this.getCanvasPoint(touch.clientX, touch.clientY);
                // Re-check mode and state to see if single-touch pan/move should resume
                if (this.currentMode === 'pan') {
                    this.isPanning = true;
                    this.lastPanPosition = { x: touch.clientX, y: touch.clientY };
                } else if (this.currentMode === 'select' && this.selectedElementIndices.size > 0 && this.touchData.isDragging) {
                    // If a drag was in progress before lifting the second finger
                    this.isMovingSelection = true;
                    this.moveStartPoint = this.touchData.lastPoint;
                } else {
                    this.isPanning = false;
                    this.isMovingSelection = false;
                }
            }
        }
    }

    // --- Save and Load Canvas Data ---

    getValue() {
        if (!this.isInitialized) {
            return this.pendingValue || { canvasContent: null };
        }

        // Filter out any temporary drawing state (e.g., single-point paths)
        const validElements = this.elements.filter(el => {
            if (el.type === 'path') return el.points && el.points.length > 1;
            if (el.type === 'text') return el.text && el.text.trim() !== '';
            return false;
        });

        const canvasData = {
            elements: validElements
                .map(element => {
                    if (element.type === 'path') {
                        return {
                            type: 'path',
                            points: element.points,
                            colorName: element.colorName || 'default',
                            thickness: element.thickness,
                        };
                    } else if (element.type === 'text') {
                        return {
                            type: 'text',
                            text: element.text,
                            x: element.x,
                            y: element.y,
                            colorName: element.colorName || 'default',
                            thickness: element.thickness, // Save thickness used for size
                        };
                    }
                    return null; // Should not happen with filter
                })
                .filter(el => el !== null), // Filter out any nulls just in case
            zoom: this.zoom,
            panOffset: this.panOffset,
        };

        return {
            canvasContent: JSON.stringify(canvasData),
        };
    }

    setValue(identifier, value) {
        if (!this.isInitialized) {
            this.pendingValue = value;
            return;
        }
        this.pendingValue = null;

        if (!value || !value.canvasContent) {
            this.clearAllElements(); // Use updated clear function
            this.resetView();
            return;
        }

        try {
            const canvasData = JSON.parse(value.canvasContent);

            if (canvasData.elements) {
                this.elements = canvasData.elements
                    .map(elementData => {
                        const colorName = elementData.colorName || 'default';
                        const color = this.getComputedColor(this.themeColors[colorName].cssVar);

                        if (elementData.type === 'path') {
                            return {
                                type: 'path',
                                points: elementData.points || [],
                                colorName: colorName,
                                color: color,
                                thickness: elementData.thickness || 2,
                            };
                        } else if (elementData.type === 'text') {
                            return {
                                type: 'text',
                                text: elementData.text || '',
                                x: elementData.x || 0,
                                y: elementData.y || 0,
                                colorName: colorName,
                                color: color,
                                thickness: elementData.thickness || 2, // Load thickness for size
                            };
                        }
                        return null; // Ignore unknown types
                    })
                    .filter(el => el !== null); // Filter out ignored types
            } else {
                this.elements = [];
            }

            this.zoom = canvasData.zoom || 1;
            this.panOffset = canvasData.panOffset || { x: 0, y: 0 };

            this.selectedElementIndices.clear();
            this.redrawCanvas();
        } catch (error) {
            console.error('Error parsing canvas data:', error, value.canvasContent);
            this.clearAllElements();
            this.resetView();
        }
    }

    sendUpdates() {
        // No changes needed here
        clearTimeout(this.updateDebounceTimer);
        this.updateDebounceTimer = setTimeout(() => {
            if (typeof wisk !== 'undefined' && wisk.editor && !wisk.editor.readonly) {
                console.log('Sending updates for:', this.id);
                wisk.editor.justUpdates(this.id);
            }
        }, 50);
    }

    // --- Render Method ---

    render() {
        const readonly = typeof wisk !== 'undefined' && wisk.editor && wisk.editor.readonly;

        // Update conditions for button states
        const canDelete = !readonly && this.selectedElementIndices.size > 0;
        const canClearAll = !readonly && this.elements.length > 0;

        return html`
            <div class="host" id="host-${this.id}">
                <div id="toolbar">
                    <button class="tbn" data-action="home" title="Reset View">
                        <img draggable="false" src="/a7/plugins/canvas-element/home.svg" alt="Home" />
                    </button>
                    <button
                        class="tbn ${this.currentMode === 'pan' ? 'button-active' : ''}"
                        data-action="pan"
                        title="Pan Tool (Hold Middle Mouse / 2-Finger Drag)"
                    >
                        <img draggable="false" src="/a7/plugins/canvas-element/pan.svg" alt="Pan" />
                    </button>
                    <button
                        class="tbn ${this.currentMode === 'select' ? 'button-active' : ''}"
                        data-action="select"
                        title="Select Tool (Double Click/Tap Text to Edit)"
                    >
                        <img draggable="false" src="/a7/plugins/canvas-element/select.svg" alt="Select" />
                    </button>
                    <button
                        class="tbn ${this.currentMode === 'draw' ? 'button-active' : ''}"
                        data-action="draw"
                        title="Draw Tool"
                        ?hidden=${readonly}
                    >
                        <img draggable="false" src="/a7/plugins/canvas-element/draw.svg" alt="Draw" />
                    </button>
                    <button
                        class="tbn ${this.currentMode === 'text' ? 'button-active' : ''}"
                        data-action="text"
                        title="Text Tool (Click/Tap to Add)"
                        ?hidden=${readonly}
                    >
                        <img draggable="false" src="/a7/plugins/canvas-element/text.svg" alt="Text" />
                    </button>
                    <button class="tbn" data-action="delete-selected" title="Delete Selected" ?disabled=${!canDelete} ?hidden=${readonly}>
                        <img draggable="false" src="/a7/plugins/canvas-element/trash.svg" alt="Delete Selected" />
                    </button>
                    <button class="tbn" data-action="clear-all" title="Clear All" ?disabled=${!canClearAll} ?hidden=${readonly}>
                        <img draggable="false" src="/a7/plugins/canvas-element/clear-all.svg" alt="Clear All" />
                    </button>
                    <button class="tbn" data-action="max-out" title="Toggle Fullscreen">
                        <img draggable="false" src="/a7/plugins/canvas-element/max.svg" alt="Maximize" />
                    </button>

                    <div style="flex: 1"></div>
                    <!-- Spacer -->

                    <div class="color-picker-wrapper" ?hidden=${readonly}>
                        ${Object.keys(this.themeColors).map(
                            colorName => html`
                                <div
                                    class="color-button color-${colorName} ${this.currentThemeColor === colorName ? 'active' : ''}"
                                    data-color="${colorName}"
                                    title="${colorName.charAt(0).toUpperCase() + colorName.slice(1)}"
                                ></div>
                            `
                        )}
                    </div>
                    <div id="thickness-slider-wrapper" ?hidden=${readonly} title="Line Thickness / Text Size">
                        <input
                            type="range"
                            id="thickness-slider"
                            min="1"
                            max="20"
                            .value=${this.currentThickness}
                            @input=${e => (this.currentThickness = parseInt(e.target.value))}
                            title="Line Thickness / Text Size"
                        />
                    </div>
                </div>
                <canvas id="drawing-canvas"></canvas>
            </div>
        `;
    }
}

customElements.define('canvas-element', CanvasElement);
