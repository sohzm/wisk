import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const THEME_COLORS = {
    red: { cssVar: '--fg-red' },
    green: { cssVar: '--fg-green' },
    blue: { cssVar: '--fg-blue' },
    yellow: { cssVar: '--fg-yellow' },
    purple: { cssVar: '--fg-purple' },
    cyan: { cssVar: '--fg-cyan' },
    orange: { cssVar: '--fg-orange' },
    default: { cssVar: '--fg-1' },
};

const MODES = {
    NORMAL: 'normal',
    PENCIL: 'pencil',
    ERASER: 'eraser',
};

const BRUSH_SIZES = [3, 6, 9, 12]; // Available brush sizes

// ============================================================================
// MS PAINT ELEMENT
// ============================================================================

class MsPaintElement extends LitElement {
    static styles = css`
        :host {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 50;
        }

        .mspaint-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
            pointer-events: auto;
        }

        .mspaint-canvas.normal-mode {
            pointer-events: none;
        }

        .mspaint-toolbar {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--bg-1);
            border-radius: calc(2 * var(--radius-large));
            border: 2px solid var(--border-1);
            padding: 6px;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 8px;
            pointer-events: auto;
            z-index: 51;
        }

        .mspaint-toolbar.has-controls {
            padding-right: 12px;
        }

        .mode-buttons {
            display: flex;
            flex-direction: row;
            gap: 2px;
        }

        .mode-button {
            width: 32px;
            height: 32px;
            border: none;
            background: transparent;
            border-radius: calc(20 * var(--radius));
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;
            padding: 0;
        }

        .mode-button:hover {
            background: var(--bg-3);
            opacity: 1;
        }

        .mode-button.active {
            background: var(--bg-3);
            opacity: 1;
        }

        .mode-button img {
            width: 18px;
            height: 18px;
            filter: var(--themed-svg);
        }

        .color-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 3px;
        }

        .color-button {
            width: 20px;
            height: 20px;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            transition:
                transform 0.2s ease,
                opacity 0.2s ease;
            position: relative;
        }

        .color-button.active {
            transform: scale(1.2);
        }

        .color-red {
            background: var(--fg-red);
        }
        .color-green {
            background: var(--fg-green);
        }
        .color-blue {
            background: var(--fg-blue);
        }
        .color-yellow {
            background: var(--fg-yellow);
        }
        .color-purple {
            background: var(--fg-purple);
        }
        .color-cyan {
            background: var(--fg-cyan);
        }
        .color-orange {
            background: var(--fg-orange);
        }
        .color-default {
            background: var(--fg-1);
        }

        .size-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 3px;
        }

        .size-button {
            width: 20px;
            height: 20px;
            border: none;
            border-radius: calc(20 * var(--radius));
            background: transparent;
            cursor: pointer;
            transition: background 0.2s ease;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .size-button:hover {
            background: var(--bg-3);
        }

        .size-button.active {
            background: var(--bg-3);
        }

        .size-indicator {
            background: var(--fg-1);
            border-radius: 50%;
        }

        .size-button.active .size-indicator {
            opacity: 1;
        }

        @media (max-width: 768px) {
            .mspaint-toolbar {
                bottom: 10px;
                left: 10px;
                padding: 5px;
                gap: 5px;
            }

            .mode-button {
                width: 30px;
                height: 30px;
            }

            .mode-button img {
                width: 16px;
                height: 16px;
            }

            .color-button {
                width: 14px;
                height: 14px;
            }

            .size-button {
                width: 14px;
                height: 14px;
            }
        }
    `;

    static properties = {
        currentMode: { type: String },
        currentColor: { type: String },
        brushSize: { type: Number },
        strokes: { type: Array },
        isDrawing: { type: Boolean },
    };

    constructor() {
        super();
        this.identifier = 'pl_mspaint';
        this.currentMode = MODES.NORMAL;
        this.currentColor = 'red';
        this.brushSize = 3; // Default brush size
        this.strokes = []; // Array of stroke objects
        this.currentStroke = null; // Current stroke being drawn
        this.isDrawing = false;
        this.canvas = null;
        this.ctx = null;
        this.debouncer = null;
        this.cachedStyles = {}; // Cache for theme colors

        // Bind methods
        this._boundHandleMouseDown = this.handleMouseDown.bind(this);
        this._boundHandleMouseMove = this.handleMouseMove.bind(this);
        this._boundHandleMouseUp = this.handleMouseUp.bind(this);
        this._boundHandleTouchStart = this.handleTouchStart.bind(this);
        this._boundHandleTouchMove = this.handleTouchMove.bind(this);
        this._boundHandleTouchEnd = this.handleTouchEnd.bind(this);
        this._boundHandleResize = this.handleResize.bind(this);
        this._boundHandleThemeChange = this.handleThemeChange.bind(this);
        this._boundHandleEditorChange = this.handleEditorChange.bind(this);

        // Listen for theme changes
        window.addEventListener('wisk-theme-changed', this._boundHandleThemeChange);

        // Listen for editor changes that affect element positions
        window.addEventListener('block-created', this._boundHandleEditorChange);
        window.addEventListener('block-updated', this._boundHandleEditorChange);
        window.addEventListener('block-deleted', this._boundHandleEditorChange);
        window.addEventListener('block-moved', this._boundHandleEditorChange);
        window.addEventListener('editor-refreshed', this._boundHandleEditorChange);

        // Load data after construction
        this.initializeData();
    }

    async initializeData() {
        try {
            if (typeof wisk === 'undefined' || !wisk.editor) {
                console.log('Wisk not ready, retrying...');
                setTimeout(() => this.initializeData(), 100);
                return;
            }

            const data = await wisk.editor.getPluginData(this.identifier);
            console.log('---------------------------------- Loading MS Paint data:', data);

            if (data && data.strokes && Array.isArray(data.strokes)) {
                this.strokes = data.strokes;
                this.requestUpdate();
                // Redraw after a short delay to ensure canvas is ready
                setTimeout(() => {
                    if (this.ctx) this.redrawCanvas();
                }, 100);
            }
        } catch (error) {
            console.error('Error loading MS Paint data:', error);
        }
    }

    savePluginData() {
        if (typeof wisk === 'undefined' || !wisk.editor) {
            console.warn('Cannot save MS Paint data: wisk.editor not available');
            return;
        }

        if (this.debouncer) clearTimeout(this.debouncer);
        this.debouncer = setTimeout(() => {
            try {
                wisk.editor.savePluginData(this.identifier, {
                    strokes: this.strokes,
                    version: 2,
                });
                console.log('MS Paint data saved:', this.strokes.length, 'strokes');
            } catch (error) {
                console.error('Error saving MS Paint data:', error);
            }
        }, 500);
    }

    connectedCallback() {
        super.connectedCallback();
        // Add event listeners
        window.addEventListener('resize', this._boundHandleResize);

        // Observe editor-main size changes
        this.editorMain = document.querySelector('.editor');
        if (this.editorMain) {
            this.resizeObserver = new ResizeObserver(() => {
                this.handleResize();
            });
            this.resizeObserver.observe(this.editorMain);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        // Remove event listeners
        window.removeEventListener('resize', this._boundHandleResize);
        window.removeEventListener('wisk-theme-changed', this._boundHandleThemeChange);
        window.removeEventListener('block-created', this._boundHandleEditorChange);
        window.removeEventListener('block-deleted', this._boundHandleEditorChange);
        window.removeEventListener('block-moved', this._boundHandleEditorChange);
        window.removeEventListener('editor-refreshed', this._boundHandleEditorChange);
        this.removeDrawingListeners();

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    firstUpdated() {
        this.canvas = this.shadowRoot.querySelector('.mspaint-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.updateCachedStyles();
        this.resizeCanvas();
        this.redrawCanvas();
        this.addDrawingListeners();

        // Set initial mode
        if (this.currentMode === MODES.NORMAL) {
            this.canvas.classList.add('normal-mode');
        }
    }

    updateCachedStyles() {
        const computedStyle = getComputedStyle(document.documentElement);

        // Cache all theme colors
        Object.keys(THEME_COLORS).forEach(colorName => {
            const cssVar = THEME_COLORS[colorName].cssVar;
            this.cachedStyles[colorName] = computedStyle.getPropertyValue(cssVar).trim() || '#000000';
        });
    }

    handleThemeChange() {
        this.updateCachedStyles();
        this.redrawCanvas();
    }

    handleEditorChange() {
        // Redraw canvas when editor elements change position
        this.redrawCanvas();
    }

    addDrawingListeners() {
        if (!this.canvas) return;

        // Mouse events
        this.canvas.addEventListener('mousedown', this._boundHandleMouseDown);
        window.addEventListener('mousemove', this._boundHandleMouseMove);
        window.addEventListener('mouseup', this._boundHandleMouseUp);

        // Touch events
        this.canvas.addEventListener('touchstart', this._boundHandleTouchStart, { passive: false });
        window.addEventListener('touchmove', this._boundHandleTouchMove, { passive: false });
        window.addEventListener('touchend', this._boundHandleTouchEnd);
    }

    removeDrawingListeners() {
        if (!this.canvas) return;

        // Mouse events
        this.canvas.removeEventListener('mousedown', this._boundHandleMouseDown);
        window.removeEventListener('mousemove', this._boundHandleMouseMove);
        window.removeEventListener('mouseup', this._boundHandleMouseUp);

        // Touch events
        this.canvas.removeEventListener('touchstart', this._boundHandleTouchStart);
        window.removeEventListener('touchmove', this._boundHandleTouchMove);
        window.removeEventListener('touchend', this._boundHandleTouchEnd);
    }

    handleResize() {
        this.resizeCanvas();
        this.redrawCanvas();
    }

    resizeCanvas() {
        if (!this.canvas) return;

        const editorMain = document.querySelector('.editor');
        if (!editorMain) return;

        const dpr = window.devicePixelRatio || 1;
        const width = editorMain.clientWidth;
        const height = editorMain.scrollHeight;

        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.ctx.scale(dpr, dpr);

        // Update host element size
        this.style.width = `${width}px`;
        this.style.height = `${height}px`;
    }

    // ========================================================================
    // DRAWING LOGIC
    // ========================================================================

    getCanvasCoords(clientX, clientY) {
        const editorMain = document.querySelector('.editor');
        if (!editorMain) return { x: clientX, y: clientY };

        const rect = editorMain.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top + editorMain.scrollTop;

        return { x, y };
    }

    // Convert absolute coords to center-relative coords for storage
    toCenterRelative(x, y) {
        const editorMain = document.querySelector('.editor');
        if (!editorMain) return { x, y };

        const centerX = editorMain.clientWidth / 2;
        // X relative to center (+ is right of center, - is left of center)
        return { x: x - centerX, y };
    }

    // Convert center-relative coords back to absolute for drawing
    toAbsolute(x, y) {
        const editorMain = document.querySelector('.editor');
        if (!editorMain) return { x, y };

        const centerX = editorMain.clientWidth / 2;
        return { x: x + centerX, y };
    }

    // Calculate bounding box center of a stroke
    getStrokeBoundingCenter(points) {
        if (!points || points.length === 0) return null;

        let minX = points[0].x;
        let maxX = points[0].x;
        let minY = points[0].y;
        let maxY = points[0].y;

        points.forEach(p => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        });

        return {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2,
        };
    }

    // Find element at given absolute coordinates
    findElementAtPoint(x, y) {
        console.log('Finding element at point:', x, y);
        const editorMain = document.querySelector('.editor');
        if (!editorMain) return null;

        // Convert to viewport coordinates
        const editorRect = editorMain.getBoundingClientRect();
        const viewportX = editorRect.left + x;
        const viewportY = editorRect.top + y - editorMain.scrollTop;
        console.log('Viewport coords:', viewportX, viewportY);

        // Temporarily hide canvas so we can see elements underneath
        const originalPointerEvents = this.canvas ? this.canvas.style.pointerEvents : null;
        if (this.canvas) {
            this.canvas.style.pointerEvents = 'none';
        }

        // Find element at point
        const elementAtPoint = document.elementFromPoint(viewportX, viewportY);
        console.log('Element at point:', elementAtPoint);

        // Restore canvas pointer events
        if (this.canvas && originalPointerEvents !== null) {
            this.canvas.style.pointerEvents = originalPointerEvents;
        }

        if (!elementAtPoint) return null;

        // Find closest .rndr container
        const rndrContainer = elementAtPoint.closest('.rndr');
        console.log('Closest .rndr container:', rndrContainer);
        if (!rndrContainer) return null;

        // Extract element ID from div-${elementId}
        const elementId = rndrContainer.id?.replace('div-', '');
        console.log('Found element ID:', elementId);
        return elementId || null;
    }

    // Get element's current top position (absolute Y in editor coords)
    getElementTopPosition(elementId) {
        const editorMain = document.querySelector('.editor');
        if (!editorMain) return null;

        const elementDiv = document.getElementById(`div-${elementId}`);
        if (!elementDiv) return null;

        const editorRect = editorMain.getBoundingClientRect();
        const elementRect = elementDiv.getBoundingClientRect();

        // Calculate absolute Y position in editor coordinates
        return elementRect.top - editorRect.top + editorMain.scrollTop;
    }

    handleMouseDown(e) {
        if (this.currentMode === MODES.NORMAL) return;

        this.isDrawing = true;
        const coords = this.getCanvasCoords(e.clientX, e.clientY);
        this.currentStroke = {
            points: [{ ...coords, pressure: 0.3, timestamp: Date.now() }],
            colorName: this.currentColor,
            mode: this.currentMode,
            size: this.brushSize,
        };
    }

    handleMouseMove(e) {
        if (!this.isDrawing || this.currentMode === MODES.NORMAL) return;

        const coords = this.getCanvasCoords(e.clientX, e.clientY);
        const lastPoint = this.currentStroke.points[this.currentStroke.points.length - 1];
        const dist = Math.hypot(coords.x - lastPoint.x, coords.y - lastPoint.y);

        // Only add point if it's far enough from the last one
        if (dist > 2) {
            // Calculate velocity-based pressure (slower = thicker)
            const now = Date.now();
            const timeDelta = Math.max(1, now - lastPoint.timestamp);
            const velocity = dist / timeDelta;
            // Map velocity to pressure (0.75 to 1.0, subtle range)
            const pressure = Math.max(0.75, Math.min(1.0, 1.0 - Math.min(velocity * 0.5, 0.25)));

            this.currentStroke.points.push({ ...coords, pressure, timestamp: now });
            this.redrawCanvas();
        }
    }

    handleMouseUp(e) {
        if (!this.isDrawing || this.currentMode === MODES.NORMAL) return;

        this.isDrawing = false;
        if (this.currentStroke && this.currentStroke.points.length > 0) {
            // Calculate bounding box center of the stroke
            const center = this.getStrokeBoundingCenter(this.currentStroke.points);

            // Find element at the center point
            let attachedElementId = null;
            let elementOffsetY = null;
            let fallbackY = center ? center.y : 0;

            if (center) {
                attachedElementId = this.findElementAtPoint(center.x, center.y);

                if (attachedElementId) {
                    const elementTopY = this.getElementTopPosition(attachedElementId);
                    if (elementTopY !== null) {
                        elementOffsetY = center.y - elementTopY;
                    }
                }
            }

            // Convert all points to center-relative coords before storing
            const centerRelativeStroke = {
                ...this.currentStroke,
                points: this.currentStroke.points.map(p => ({
                    ...this.toCenterRelative(p.x, p.y),
                    pressure: p.pressure,
                    timestamp: p.timestamp,
                })),
                attachedElementId: attachedElementId,
                elementOffsetY: elementOffsetY,
                fallbackY: fallbackY,
            };

            this.strokes.push(centerRelativeStroke);
            this.currentStroke = null;
            this.savePluginData();
        }
    }

    handleTouchStart(e) {
        if (this.currentMode === MODES.NORMAL) return;

        e.preventDefault();
        const touch = e.touches[0];
        const coords = this.getCanvasCoords(touch.clientX, touch.clientY);
        this.isDrawing = true;
        this.currentStroke = {
            points: [{ ...coords, pressure: 0.3, timestamp: Date.now() }],
            colorName: this.currentColor,
            mode: this.currentMode,
            size: this.brushSize,
        };
    }

    handleTouchMove(e) {
        if (!this.isDrawing || this.currentMode === MODES.NORMAL) return;

        e.preventDefault();
        const touch = e.touches[0];
        const coords = this.getCanvasCoords(touch.clientX, touch.clientY);
        const lastPoint = this.currentStroke.points[this.currentStroke.points.length - 1];
        const dist = Math.hypot(coords.x - lastPoint.x, coords.y - lastPoint.y);

        // Only add point if it's far enough from the last one
        if (dist > 2) {
            // Calculate velocity-based pressure (slower = thicker)
            const now = Date.now();
            const timeDelta = Math.max(1, now - lastPoint.timestamp);
            const velocity = dist / timeDelta;
            // Map velocity to pressure (0.75 to 1.0, subtle range)
            const pressure = Math.max(0.75, Math.min(1.0, 1.0 - Math.min(velocity * 0.5, 0.25)));

            this.currentStroke.points.push({ ...coords, pressure, timestamp: now });
            this.redrawCanvas();
        }
    }

    handleTouchEnd(e) {
        if (!this.isDrawing || this.currentMode === MODES.NORMAL) return;

        this.isDrawing = false;
        if (this.currentStroke && this.currentStroke.points.length > 0) {
            // Calculate bounding box center of the stroke
            const center = this.getStrokeBoundingCenter(this.currentStroke.points);

            // Find element at the center point
            let attachedElementId = null;
            let elementOffsetY = null;
            let fallbackY = center ? center.y : 0;

            if (center) {
                attachedElementId = this.findElementAtPoint(center.x, center.y);

                if (attachedElementId) {
                    const elementTopY = this.getElementTopPosition(attachedElementId);
                    if (elementTopY !== null) {
                        elementOffsetY = center.y - elementTopY;
                    }
                }
            }

            // Convert all points to center-relative coords before storing
            const centerRelativeStroke = {
                ...this.currentStroke,
                points: this.currentStroke.points.map(p => ({
                    ...this.toCenterRelative(p.x, p.y),
                    pressure: p.pressure,
                    timestamp: p.timestamp,
                })),
                attachedElementId: attachedElementId,
                elementOffsetY: elementOffsetY,
                fallbackY: fallbackY,
            };

            this.strokes.push(centerRelativeStroke);
            this.currentStroke = null;
            this.savePluginData();
        }
    }

    drawStroke(stroke, isCenterRelative = true) {
        if (!stroke || !stroke.points || stroke.points.length === 0) return;

        // Get color from colorName (supports both old 'color' and new 'colorName' format)
        const colorName = stroke.colorName || stroke.color || 'default';
        const colorValue = this.getColorValue(colorName);
        const brushSize = stroke.size || 3; // Default to 3 if not specified

        // Multiply brush size by 3 for eraser
        const actualBrushSize = stroke.mode === MODES.ERASER ? brushSize * 3 : brushSize;

        // Calculate Y offset for element-attached strokes
        let yOffset = 0;
        if (stroke.attachedElementId && stroke.elementOffsetY !== null && stroke.elementOffsetY !== undefined) {
            const elementTopY = this.getElementTopPosition(stroke.attachedElementId);
            if (elementTopY !== null) {
                // Element exists, calculate where it should be drawn
                const targetY = elementTopY + stroke.elementOffsetY;
                yOffset = targetY - stroke.fallbackY;
            }
            // If element doesn't exist, yOffset remains 0 and fallbackY is used
        }

        // Check if points have pressure data (new brush style)
        const hasPressure = stroke.points[0].pressure !== undefined;

        if (!hasPressure) {
            // Old style: simple line
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.lineWidth = actualBrushSize;

            if (stroke.mode === MODES.ERASER) {
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.strokeStyle = colorValue;
            }

            // Get first point (convert if center-relative, apply Y offset)
            let firstPoint;
            if (isCenterRelative) {
                const converted = this.toAbsolute(stroke.points[0].x, stroke.points[0].y);
                firstPoint = { x: converted.x, y: converted.y + yOffset };
            } else {
                firstPoint = stroke.points[0];
            }

            this.ctx.beginPath();
            this.ctx.moveTo(firstPoint.x, firstPoint.y);

            for (let i = 1; i < stroke.points.length; i++) {
                // Convert point if center-relative, apply Y offset
                let point;
                if (isCenterRelative) {
                    const converted = this.toAbsolute(stroke.points[i].x, stroke.points[i].y);
                    point = { x: converted.x, y: converted.y + yOffset };
                } else {
                    point = stroke.points[i];
                }
                this.ctx.lineTo(point.x, point.y);
            }

            this.ctx.stroke();
            this.ctx.globalCompositeOperation = 'source-over';
            return;
        }

        // New brush style: variable thickness with tapering
        if (stroke.points.length < 2) {
            // Draw single point as circle
            const p = stroke.points[0];
            let point;
            if (isCenterRelative) {
                const converted = this.toAbsolute(p.x, p.y);
                point = { x: converted.x, y: converted.y + yOffset };
            } else {
                point = p;
            }
            const radius = (actualBrushSize * (p.pressure || 0.5)) / 2;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            if (stroke.mode === MODES.ERASER) {
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.fillStyle = 'rgba(0,0,0,1)';
            } else {
                this.ctx.fillStyle = colorValue;
            }
            this.ctx.fill();
            this.ctx.globalCompositeOperation = 'source-over';
            return;
        }

        // Draw variable-thickness stroke
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        if (stroke.mode === MODES.ERASER) {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.strokeStyle = 'rgba(0,0,0,1)';
            this.ctx.fillStyle = 'rgba(0,0,0,1)';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = colorValue;
            this.ctx.fillStyle = colorValue;
        }

        for (let i = 0; i < stroke.points.length - 1; i++) {
            const p1 = stroke.points[i];
            const p2 = stroke.points[i + 1];

            // Apply tapering to start and end
            let pressure1 = p1.pressure || 0.5;
            let pressure2 = p2.pressure || 0.5;

            const totalPoints = stroke.points.length;
            const taperLength = Math.min(5, Math.floor(totalPoints * 0.2));

            // Taper start
            if (i < taperLength) {
                const taperFactor = i / taperLength;
                pressure1 *= taperFactor;
            }
            // Taper end
            if (i >= totalPoints - taperLength - 1) {
                const taperFactor = (totalPoints - 1 - i) / taperLength;
                pressure2 *= taperFactor;
            }

            const thickness1 = actualBrushSize * pressure1;
            const thickness2 = actualBrushSize * pressure2;

            // Convert points if center-relative, apply Y offset
            let point1, point2;
            if (isCenterRelative) {
                const converted1 = this.toAbsolute(p1.x, p1.y);
                const converted2 = this.toAbsolute(p2.x, p2.y);
                point1 = { x: converted1.x, y: converted1.y + yOffset };
                point2 = { x: converted2.x, y: converted2.y + yOffset };
            } else {
                point1 = p1;
                point2 = p2;
            }

            // Draw line segment with varying thickness
            this.ctx.lineWidth = (thickness1 + thickness2) / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(point1.x, point1.y);
            this.ctx.lineTo(point2.x, point2.y);
            this.ctx.stroke();
        }

        // Reset composite operation
        this.ctx.globalCompositeOperation = 'source-over';
    }

    redrawCanvas() {
        if (!this.ctx || !this.canvas) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all saved strokes (center-relative coords)
        this.strokes.forEach(stroke => this.drawStroke(stroke, true));

        // Draw current stroke being drawn (absolute coords)
        if (this.currentStroke) {
            this.drawStroke(this.currentStroke, false);
        }
    }

    getColorValue(colorName) {
        // Use cached color value for performance
        if (this.cachedStyles[colorName]) {
            return this.cachedStyles[colorName];
        }

        // Fallback to 'default' color
        return this.cachedStyles['default'] || '#000000';
    }

    // ========================================================================
    // MODE SWITCHING
    // ========================================================================

    setMode(mode) {
        this.currentMode = mode;
        this.isDrawing = false;
        this.currentStroke = null;

        // Update canvas pointer-events based on mode
        if (this.canvas) {
            if (mode === MODES.NORMAL) {
                this.canvas.classList.add('normal-mode');
            } else {
                this.canvas.classList.remove('normal-mode');
            }
        }

        this.requestUpdate();
    }

    setColor(color) {
        this.currentColor = color;

        // If in eraser mode, switch to pencil when selecting a color
        if (this.currentMode === MODES.ERASER) {
            this.setMode(MODES.PENCIL);
        }

        this.requestUpdate();
    }

    setBrushSize(size) {
        this.brushSize = size;
        this.requestUpdate();
    }

    clearAll() {
        if (confirm('Clear all doodles? This cannot be undone.')) {
            this.strokes = [];
            this.currentStroke = null;
            this.redrawCanvas();
            this.savePluginData();
        }
    }

    // ========================================================================
    // RENDER
    // ========================================================================

    render() {
        // Disable entire plugin on screens below 900px
        if (window.innerWidth < 900) {
            return html``;
        }

        return html`
            <canvas class="mspaint-canvas"></canvas>

            <div class="mspaint-toolbar ${this.currentMode !== MODES.NORMAL ? 'has-controls' : ''}">
                <!-- Mode buttons (vertical) -->
                <div class="mode-buttons">
                    <button
                        class="mode-button ${this.currentMode === MODES.NORMAL ? 'active' : ''}"
                        @click=${() => this.setMode(MODES.NORMAL)}
                        title="Normal (Mouse)"
                    >
                        <img src="/a7/plugins/mspaint/cursor.svg" alt="Normal" draggable="false" />
                    </button>
                    <button
                        class="mode-button ${this.currentMode === MODES.PENCIL ? 'active' : ''}"
                        @click=${() => this.setMode(MODES.PENCIL)}
                        title="Pencil"
                    >
                        <img src="/a7/plugins/mspaint/pencil.svg" alt="Pencil" draggable="false" />
                    </button>
                    <button
                        class="mode-button ${this.currentMode === MODES.ERASER ? 'active' : ''}"
                        @click=${() => this.setMode(MODES.ERASER)}
                        title="Eraser"
                    >
                        <img src="/a7/plugins/mspaint/eraser.svg" alt="Eraser" draggable="false" />
                    </button>
                </div>

                <!-- Color picker (grid on right) -->
                ${this.currentMode !== MODES.NORMAL
                    ? html`
                          ${Object.keys(THEME_COLORS).map(
                              colorName => html`
                                  <div
                                      class="color-button color-${colorName} ${this.currentColor === colorName ? 'active' : ''}"
                                      @click=${() => this.setColor(colorName)}
                                      title="${colorName.charAt(0).toUpperCase() + colorName.slice(1)}"
                                  ></div>
                              `
                          )}
                      `
                    : ''}

                <!-- Brush size selector -->
                ${this.currentMode !== MODES.NORMAL
                    ? html`
                          ${BRUSH_SIZES.map(
                              size => html`
                                  <div
                                      class="size-button ${this.brushSize === size ? 'active' : ''}"
                                      @click=${() => this.setBrushSize(size)}
                                      title="${size}px"
                                  >
                                      <div class="size-indicator" style="width: ${Math.min(size, 12)}px; height: ${Math.min(size, 12)}px;"></div>
                                  </div>
                              `
                          )}
                      `
                    : ''}
            </div>
        `;
    }
}

customElements.define('mspaint-element', MsPaintElement);

// Auto-load the plugin when the module is imported
function initMsPaint() {
    const editorMain = document.querySelector('.editor');
    if (editorMain) {
        const mspaintElement = document.createElement('mspaint-element');
        mspaintElement.id = 'pl_mspaint';
        editorMain.appendChild(mspaintElement);
    } else {
        console.warn('========================= Cannot initialize MS Paint plugin: .editor not found ===============');
    }
}

initMsPaint();
