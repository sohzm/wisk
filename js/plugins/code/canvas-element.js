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

const STATES = {
    IDLE: 'idle',
    PANNING: 'panning',
    DRAWING: 'drawing',
    MOVING_SELECTION: 'moving_selection',
    MARQUEE_SELECTING: 'marquee_selecting',
    TEXT_EDITING: 'text_editing',
    RESIZING_SELECTION: 'resizing_selection',
    ROTATING_SELECTION: 'rotating_selection',
    ERASING: 'erasing',
    DRAWING_SHAPE: 'drawing_shape',
};

const MODES = {
    PAN: 'pan',
    DRAW: 'draw',
    SELECT: 'select',
    TEXT: 'text',
    ERASER: 'eraser',
    SHAPE: 'shape',
    LASER: 'laser',
};

const SHAPE_TYPES = {
    RECTANGLE: 'rectangle',
    CIRCLE: 'circle',
    LINE: 'line',
    ARROW: 'arrow',
    STAR: 'star',
    DIAMOND: 'diamond',
    HEXAGON: 'hexagon',
    HEART: 'heart',
};

const CONFIG = {
    DOUBLE_TAP_DELAY: 300,
    UPDATE_DEBOUNCE: 50,
    MIN_ZOOM: 0.1,
    MAX_ZOOM: 10,
    ZOOM_INTENSITY: 0.1,
    BBOX_PADDING: 5,
    PATH_SIMPLIFICATION_TOLERANCE: 0.5,
    MIN_POINT_DISTANCE: 0.5,
    MAX_UNDO_HISTORY: 50,
    NUDGE_AMOUNT: 5,
    RESIZE_HANDLE_SIZE: 12,
    RESIZE_HANDLE_HIT_PADDING: 4,
};

const RESIZE_HANDLES = {
    TOP_LEFT: 'tl',
    TOP_RIGHT: 'tr',
    BOTTOM_LEFT: 'bl',
    BOTTOM_RIGHT: 'br',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// Douglas-Peucker path simplification algorithm
function simplifyPath(points, tolerance = CONFIG.PATH_SIMPLIFICATION_TOLERANCE) {
    if (points.length <= 2) return points;

    const sqTolerance = tolerance * tolerance;

    function getSqSegDist(p, p1, p2) {
        let x = p1.x,
            y = p1.y,
            dx = p2.x - x,
            dy = p2.y - y;

        if (dx !== 0 || dy !== 0) {
            const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
            if (t > 1) {
                x = p2.x;
                y = p2.y;
            } else if (t > 0) {
                x += dx * t;
                y += dy * t;
            }
        }

        dx = p.x - x;
        dy = p.y - y;

        return dx * dx + dy * dy;
    }

    function simplifyDPStep(points, first, last, sqTolerance, simplified) {
        let maxSqDist = sqTolerance,
            index;

        for (let i = first + 1; i < last; i++) {
            const sqDist = getSqSegDist(points[i], points[first], points[last]);
            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
            simplified.push(points[index]);
            if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
        }
    }

    const last = points.length - 1;
    const simplified = [points[0]];
    simplifyDPStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);

    return simplified;
}

// Calculate bounding box of a path
function calculatePathBoundingBox(path) {
    if (!path || !path.points || path.points.length === 0) {
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
    // Account for variable thickness if points have pressure data
    const maxThickness = path.thickness || 2;
    const padding = maxThickness / 2 + CONFIG.BBOX_PADDING;
    return {
        minX: minX - padding,
        minY: minY - padding,
        maxX: maxX + padding,
        maxY: maxY + padding,
    };
}

// Calculate bounding box for a text element
function calculateTextBoundingBox(textItem, ctx) {
    if (!textItem || !ctx) {
        return null;
    }
    const fontSize = Math.max(10, textItem.thickness * 2);
    ctx.save();
    ctx.font = `${fontSize}px sans-serif`;
    const metrics = ctx.measureText(textItem.text);
    ctx.restore();

    const width = metrics.width;
    const height = fontSize;
    const padding = CONFIG.BBOX_PADDING;

    const rotation = textItem.rotation || 0;

    if (rotation === 0) {
        return {
            minX: textItem.x - padding,
            minY: textItem.y - padding,
            maxX: textItem.x + width + padding,
            maxY: textItem.y + height + padding,
        };
    }

    // Rotate the 4 corners using cos/sin
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const corners = [
        { dx: -padding, dy: -padding },
        { dx: width + padding, dy: -padding },
        { dx: width + padding, dy: height + padding },
        { dx: -padding, dy: height + padding },
    ];

    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

    for (const corner of corners) {
        const rx = corner.dx * cos - corner.dy * sin;
        const ry = corner.dx * sin + corner.dy * cos;
        const x = textItem.x + rx;
        const y = textItem.y + ry;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    }

    return { minX, minY, maxX, maxY };
}

// Calculate bounding box for a shape element
function calculateShapeBoundingBox(shape) {
    if (!shape) {
        return null;
    }
    const padding = (shape.thickness || 2) / 2 + CONFIG.BBOX_PADDING;
    const rotation = shape.rotation || 0;

    if (rotation === 0) {
        return {
            minX: Math.min(shape.x1, shape.x2) - padding,
            minY: Math.min(shape.y1, shape.y2) - padding,
            maxX: Math.max(shape.x1, shape.x2) + padding,
            maxY: Math.max(shape.y1, shape.y2) + padding,
        };
    }

    // Rotate the 4 corners using cos/sin
    const centerX = (shape.x1 + shape.x2) / 2;
    const centerY = (shape.y1 + shape.y2) / 2;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const corners = [
        { dx: Math.min(shape.x1, shape.x2) - padding - centerX, dy: Math.min(shape.y1, shape.y2) - padding - centerY },
        { dx: Math.max(shape.x1, shape.x2) + padding - centerX, dy: Math.min(shape.y1, shape.y2) - padding - centerY },
        { dx: Math.max(shape.x1, shape.x2) + padding - centerX, dy: Math.max(shape.y1, shape.y2) + padding - centerY },
        { dx: Math.min(shape.x1, shape.x2) - padding - centerX, dy: Math.max(shape.y1, shape.y2) + padding - centerY },
    ];

    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

    for (const corner of corners) {
        const rx = corner.dx * cos - corner.dy * sin;
        const ry = corner.dx * sin + corner.dy * cos;
        const x = centerX + rx;
        const y = centerY + ry;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    }

    return { minX, minY, maxX, maxY };
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

// ============================================================================
// COMMAND PATTERN FOR UNDO/REDO
// ============================================================================

class Command {
    execute() {}
    undo() {}
}

class AddElementCommand extends Command {
    constructor(canvas, element) {
        super();
        this.canvas = canvas;
        this.element = element;
    }

    execute() {
        this.canvas.elements.push(this.element);
        this.canvas.invalidateBoundingBoxCache(this.element.id);
        this.canvas.scheduleRedraw();
    }

    undo() {
        const index = this.canvas.elements.findIndex(el => el.id === this.element.id);
        if (index !== -1) {
            this.canvas.elements.splice(index, 1);
            this.canvas.invalidateBoundingBoxCache(this.element.id);
            this.canvas.scheduleRedraw();
        }
    }
}

class DeleteElementsCommand extends Command {
    constructor(canvas, elementIds) {
        super();
        this.canvas = canvas;
        this.elementIds = Array.from(elementIds);
        this.deletedElements = [];
    }

    execute() {
        this.deletedElements = [];
        this.elementIds.forEach(id => {
            const index = this.canvas.elements.findIndex(el => el.id === id);
            if (index !== -1) {
                this.deletedElements.push({ element: this.canvas.elements[index], index });
                this.canvas.elements.splice(index, 1);
                this.canvas.invalidateBoundingBoxCache(id);
            }
        });
        this.canvas.selectedElementIds.clear();
        this.canvas.scheduleRedraw();
    }

    undo() {
        this.deletedElements.sort((a, b) => a.index - b.index);
        this.deletedElements.forEach(({ element, index }) => {
            this.canvas.elements.splice(index, 0, element);
            this.canvas.invalidateBoundingBoxCache(element.id);
        });
        this.canvas.scheduleRedraw();
    }
}

class MoveElementsCommand extends Command {
    constructor(canvas, elementIds, deltaX, deltaY) {
        super();
        this.canvas = canvas;
        this.elementIds = Array.from(elementIds);
        this.deltaX = deltaX;
        this.deltaY = deltaY;
    }

    execute() {
        this.elementIds.forEach(id => {
            const element = this.canvas.elements.find(el => el.id === id);
            if (!element) return;

            if (element.type === 'path') {
                element.points = element.points.map(p => ({ x: p.x + this.deltaX, y: p.y + this.deltaY }));
            } else if (element.type === 'text') {
                element.x += this.deltaX;
                element.y += this.deltaY;
            } else if (element.type === 'shape') {
                element.x1 += this.deltaX;
                element.y1 += this.deltaY;
                element.x2 += this.deltaX;
                element.y2 += this.deltaY;
            }
            this.canvas.invalidateBoundingBoxCache(id);
        });
        this.canvas.scheduleRedraw();
    }

    undo() {
        this.elementIds.forEach(id => {
            const element = this.canvas.elements.find(el => el.id === id);
            if (!element) return;

            if (element.type === 'path') {
                element.points = element.points.map(p => ({ x: p.x - this.deltaX, y: p.y - this.deltaY }));
            } else if (element.type === 'text') {
                element.x -= this.deltaX;
                element.y -= this.deltaY;
            } else if (element.type === 'shape') {
                element.x1 -= this.deltaX;
                element.y1 -= this.deltaY;
                element.x2 -= this.deltaX;
                element.y2 -= this.deltaY;
            }
            this.canvas.invalidateBoundingBoxCache(id);
        });
        this.canvas.scheduleRedraw();
    }
}

class EditTextCommand extends Command {
    constructor(canvas, elementId, oldText, newText) {
        super();
        this.canvas = canvas;
        this.elementId = elementId;
        this.oldText = oldText;
        this.newText = newText;
    }

    execute() {
        const element = this.canvas.elements.find(el => el.id === this.elementId);
        if (element && element.type === 'text') {
            element.text = this.newText;
            this.canvas.invalidateBoundingBoxCache(this.elementId);
            this.canvas.scheduleRedraw();
        }
    }

    undo() {
        const element = this.canvas.elements.find(el => el.id === this.elementId);
        if (element && element.type === 'text') {
            element.text = this.oldText;
            this.canvas.invalidateBoundingBoxCache(this.elementId);
            this.canvas.scheduleRedraw();
        }
    }
}

class ClearAllCommand extends Command {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.savedElements = [];
    }

    execute() {
        this.savedElements = [...this.canvas.elements];
        this.canvas.elements = [];
        this.canvas.selectedElementIds.clear();
        this.canvas.bboxCache.clear();
        this.canvas.scheduleRedraw();
    }

    undo() {
        this.canvas.elements = [...this.savedElements];
        this.canvas.bboxCache.clear();
        this.canvas.scheduleRedraw();
    }
}

class CommandHistory {
    constructor(maxSize = CONFIG.MAX_UNDO_HISTORY) {
        this.undoStack = [];
        this.redoStack = [];
        this.maxSize = maxSize;
    }

    execute(command) {
        command.execute();
        this.undoStack.push(command);
        if (this.undoStack.length > this.maxSize) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length === 0) return false;
        const command = this.undoStack.pop();
        command.undo();
        this.redoStack.push(command);
        return true;
    }

    redo() {
        if (this.redoStack.length === 0) return false;
        const command = this.redoStack.pop();
        command.execute();
        this.undoStack.push(command);
        return true;
    }

    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
}

// ============================================================================
// CANVAS ELEMENT
// ============================================================================

class CanvasElement extends LitElement {
    static styles = css`
        * {
            user-select: none;
            box-sizing: border-box;
        }
        :host,
        .host {
            display: block;
            width: 100%;
            height: 400px;
            box-sizing: border-box;
            overflow: hidden;
            position: relative;
        }
        .host {
            transition:
                border 0.3s,
                width 0.3s ease-in-out,
                top 0.3s ease-in-out,
                left 0.3s ease-in-out,
                border-radius 0.3s ease-in-out;
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
            overflow: visible;
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
            touch-action: none;
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
        #text-input {
            position: absolute;
            min-width: 100px;
            min-height: 20px;
            padding: 4px 8px;
            border: 2px solid var(--accent);
            background: var(--bg-1);
            color: var(--fg-1);
            outline: none;
            border-radius: var(--radius);
            font-family: sans-serif;
            z-index: 20;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
            max-width: 500px;
        }
        #text-input:empty:before {
            content: attr(data-placeholder);
            color: var(--fg-3);
        }
        .toolbar-separator {
            width: 1px;
            height: 20px;
            background-color: var(--border-1);
            margin: 0 8px;
        }
        .resize-handle {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 8px;
            cursor: ns-resize;
            z-index: 5;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .resize-handle:hover {
            background-color: var(--bg-3);
        }
        .resize-handle::after {
            content: '';
            width: 40px;
            height: 3px;
            background-color: var(--border-1);
            border-radius: 2px;
        }
        .max-out .resize-handle {
            display: none;
        }
        .shapes-dropdown-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }
        .shapes-dropdown {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-bottom: 8px;
            background-color: var(--bg-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            padding: 4px;
            display: none;
            flex-direction: column;
            gap: 4px;
            z-index: 100;
            max-height: 300px;
            overflow-y: auto;
        }
        .shapes-dropdown.active {
            display: flex;
        }
        .shape-option {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: var(--radius);
            cursor: pointer;
            white-space: nowrap;
            background-color: transparent;
            border: none;
            color: var(--fg-1);
            font-size: 13px;
        }
        .shape-option:hover {
            background-color: var(--bg-3);
        }
        .shape-option img {
            height: 14px;
            width: 14px;
            filter: var(--themed-svg);
        }
        .chevron-up {
            height: 12px;
            width: 12px;
            filter: var(--themed-svg);
            transition: transform 0.2s;
        }
        .shapes-dropdown-wrapper.active .chevron-up {
            transform: rotate(180deg);
        }
    `;

    static properties = {
        isInitialized: { type: Boolean },
        currentMode: { type: String },
        currentThemeColor: { type: String },
        currentColor: { type: String },
        currentThickness: { type: Number },
        state: { type: String },
        zoom: { type: Number },
        id: { type: String, reflect: true },
        shapesDropdownOpen: { type: Boolean },
        selectedShapeType: { type: String },
    };

    constructor() {
        super();
        this.isInitialized = false;
        this.pendingValue = null;

        // State machine
        this.state = STATES.IDLE;
        this.currentMode = MODES.DRAW;

        // Drawing state
        this.currentThemeColor = 'default';
        this.currentColor = '';
        this.currentThickness = 3;
        this.zoom = 1;
        this.panOffset = { x: 0, y: 0 };
        this.canvasHeight = 400;
        this.shapesDropdownOpen = false;
        this.selectedShapeType = null;
        this.shapeStartPoint = null;

        // Data
        this.elements = [];
        this.selectedElementIds = new Set();
        this.bboxCache = new Map();

        // Command history for undo/redo
        this.commandHistory = new CommandHistory();

        // Temporary state during operations
        this.currentPath = null;
        this.marqueeStart = null;
        this.marqueeEnd = null;
        this.moveStartPoint = null;
        this.moveAccumulatedDelta = { x: 0, y: 0 };
        this.lastPanPosition = { x: 0, y: 0 };

        // Laser state
        this.lasers = []; // Array of active lasers
        this.currentLaser = null; // Current laser being drawn
        this.laserDecayRate = 0.01; // Points removed per frame (FIFO)
        this.laserAnimationFrameId = null; // Animation frame ID for decay

        // Resize handle state
        this.isResizingHandle = false;
        this.resizeHandle = null;
        this.resizeStartBounds = null;
        this.resizeStartElements = null;

        // Container resize state
        this.isResizing = false;
        this.resizeStartY = 0;
        this.resizeStartHeight = 0;

        // Clipboard
        this.clipboard = null;

        // Touch handling
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.touchData = {
            touches: [],
            lastDistance: 0,
            lastTap: 0,
            tapTimeout: null,
            pinchPanStart: null,
            didPinchZoom: false,
        };

        // Cached styles (will be populated on mount)
        this.cachedStyles = {};

        // Rendering optimization
        this.redrawScheduled = false;
        this.isComponentMounted = false;

        // Bind methods for event listeners
        this._boundHandleThemeChange = this.handleThemeChange.bind(this);
        this._boundHandleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
        this._boundHandleGlobalMouseUp = this.handleGlobalMouseUp.bind(this);
        this._boundHandleGlobalTouchMove = this.handleGlobalTouchMove.bind(this);
        this._boundHandleGlobalTouchEnd = this.handleGlobalTouchEnd.bind(this);
        this._boundHandleKeyDown = this.handleKeyDown.bind(this);

        window.addEventListener('wisk-theme-changed', this._boundHandleThemeChange);
    }

    connectedCallback() {
        super.connectedCallback();
        this.isComponentMounted = true;

        // Add global event listeners
        window.addEventListener('mousemove', this._boundHandleGlobalMouseMove);
        window.addEventListener('mouseup', this._boundHandleGlobalMouseUp);
        window.addEventListener('touchmove', this._boundHandleGlobalTouchMove, { passive: false });
        window.addEventListener('touchend', this._boundHandleGlobalTouchEnd);
        window.addEventListener('touchcancel', this._boundHandleGlobalTouchEnd);
        window.addEventListener('keydown', this._boundHandleKeyDown);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.isComponentMounted = false;

        // Remove global event listeners
        window.removeEventListener('wisk-theme-changed', this._boundHandleThemeChange);
        window.removeEventListener('mousemove', this._boundHandleGlobalMouseMove);
        window.removeEventListener('mouseup', this._boundHandleGlobalMouseUp);
        window.removeEventListener('touchmove', this._boundHandleGlobalTouchMove);
        window.removeEventListener('touchend', this._boundHandleGlobalTouchEnd);
        window.removeEventListener('touchcancel', this._boundHandleGlobalTouchEnd);
        window.removeEventListener('keydown', this._boundHandleKeyDown);

        // Clear any pending timeouts
        clearTimeout(this.updateDebounceTimer);
        clearTimeout(this.touchData.tapTimeout);
    }

    firstUpdated() {
        this.canvas = this.shadowRoot.getElementById('drawing-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.hostElement = this.shadowRoot.querySelector('.host');

        // Cache computed styles
        this.updateCachedStyles();

        this.resizeCanvas();
        this.bindEvents();
        this.setMode(this.currentMode);
        this.updateCurrentColor(this.currentThemeColor);

        // Close dropdown when clicking outside
        this.addEventListener('click', e => {
            const shapesWrapper = this.shadowRoot.querySelector('.shapes-dropdown-wrapper');
            if (shapesWrapper && !shapesWrapper.contains(e.target) && this.shapesDropdownOpen) {
                this.shapesDropdownOpen = false;
            }
        });

        this.isInitialized = true;
        if (this.pendingValue) {
            this.setValue('', this.pendingValue);
            this.pendingValue = null;
        } else {
            this.scheduleRedraw();
        }
    }

    // ========================================================================
    // RENDERING WITH RAF BATCHING
    // ========================================================================

    scheduleRedraw() {
        if (this.redrawScheduled || !this.isInitialized) return;
        this.redrawScheduled = true;
        requestAnimationFrame(() => {
            this.redrawScheduled = false;
            this.redrawCanvas();
        });
    }

    resizeCanvas() {
        if (!this.canvas || !this.hostElement) return;

        const isMaxOut = this.hostElement.classList.contains('max-out');
        const dpr = window.devicePixelRatio || 1;

        let newWidth, newHeight;

        if (isMaxOut) {
            newWidth = window.innerWidth;
            newHeight = window.innerHeight;
        } else {
            // Force a reflow to get accurate dimensions after transition
            const rect = this.hostElement.getBoundingClientRect();
            newWidth = rect.width;
            newHeight = rect.height;
        }

        if (newWidth <= 0 || newHeight <= 0) {
            // Retry after a short delay if dimensions aren't ready
            setTimeout(() => this.resizeCanvas(), 50);
            return;
        }

        this.canvas.width = newWidth * dpr;
        this.canvas.height = newHeight * dpr;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.scheduleRedraw();
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
        this.ctx.fillStyle = this.cachedStyles.bgColor || '#ffffff';
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Apply zoom and pan
        this.ctx.translate(this.panOffset.x, this.panOffset.y);
        this.ctx.scale(this.zoom, this.zoom);

        // Draw all elements
        this.elements.forEach(element => {
            if (!element) return;

            if (element.type === 'path') {
                this.drawPath(element);
            } else if (element.type === 'text') {
                this.drawText(element);
            } else if (element.type === 'shape') {
                this.drawShape(element);
            }
        });

        // Draw shape preview while drawing
        if (this.state === STATES.DRAWING_SHAPE && this.shapeStartPoint && this.currentShapePreview) {
            this.drawShape(this.currentShapePreview);
        }

        // Draw lasers (temporary, non-saved elements)
        this.lasers.forEach(laser => {
            this.drawLaser(laser);
        });

        // Draw selection box with handles (combined for all selected elements)
        if (this.selectedElementIds.size > 0 && this.currentMode === MODES.SELECT) {
            const combinedBbox = this.getCombinedBoundingBox();
            if (combinedBbox) {
                this.drawSelectionBox(combinedBbox);
            }
        }

        // Draw marquee selection
        if (this.state === STATES.MARQUEE_SELECTING && this.marqueeStart && this.marqueeEnd) {
            this.ctx.restore();
            this.ctx.restore();
            this.ctx.save();
            this.ctx.scale(dpr, dpr);

            const rectX = Math.min(this.marqueeStart.screenX, this.marqueeEnd.screenX);
            const rectY = Math.min(this.marqueeStart.screenY, this.marqueeEnd.screenY);
            const rectW = Math.abs(this.marqueeStart.screenX - this.marqueeEnd.screenX);
            const rectH = Math.abs(this.marqueeStart.screenY - this.marqueeEnd.screenY);

            const accentColor = this.cachedStyles.accentColor || '#0066ff';
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

    drawPath(element) {
        if (element.points.length < 1) return;

        // Check if points have pressure data (new brush style)
        const hasPressure = element.points[0].pressure !== undefined;

        if (!hasPressure) {
            // Old style: simple line
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
            return;
        }

        // New brush style: variable thickness with tapering
        if (element.points.length < 2) {
            // Draw single point as circle
            const p = element.points[0];
            const radius = (element.thickness * (p.pressure || 0.5)) / 2;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = element.color;
            this.ctx.fill();
            return;
        }

        // Draw variable-thickness stroke
        this.ctx.fillStyle = element.color;
        this.ctx.strokeStyle = element.color;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        for (let i = 0; i < element.points.length - 1; i++) {
            const p1 = element.points[i];
            const p2 = element.points[i + 1];

            // Apply tapering to start and end
            let pressure1 = p1.pressure || 0.5;
            let pressure2 = p2.pressure || 0.5;

            const totalPoints = element.points.length;
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

            const thickness1 = element.thickness * pressure1;
            const thickness2 = element.thickness * pressure2;

            // Draw line segment with varying thickness
            this.ctx.lineWidth = (thickness1 + thickness2) / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
        }
    }

    drawText(element) {
        const fontSize = Math.max(10, element.thickness * 2);
        this.ctx.fillStyle = element.color;
        this.ctx.font = `${fontSize}px sans-serif`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        // Apply rotation if present
        const rotation = element.rotation || 0;
        if (rotation !== 0) {
            this.ctx.save();
            this.ctx.translate(element.x, element.y);
            this.ctx.rotate(rotation);
            this.ctx.fillText(element.text, 0, 0);
            this.ctx.restore();
        } else {
            this.ctx.fillText(element.text, element.x, element.y);
        }
    }

    drawShape(element) {
        this.ctx.strokeStyle = element.color;
        this.ctx.fillStyle = element.color;
        this.ctx.lineWidth = element.thickness;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        const { x1, y1, x2, y2 } = element;

        // Apply rotation if present
        const rotation = element.rotation || 0;
        if (rotation !== 0) {
            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(rotation);
            this.ctx.translate(-centerX, -centerY);
        }

        switch (element.shapeType) {
            case SHAPE_TYPES.RECTANGLE:
                this.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                break;
            case SHAPE_TYPES.CIRCLE:
                const centerX = (x1 + x2) / 2;
                const centerY = (y1 + y2) / 2;
                const radiusX = Math.abs(x2 - x1) / 2;
                const radiusY = Math.abs(y2 - y1) / 2;
                this.ctx.beginPath();
                this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
            case SHAPE_TYPES.LINE:
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
                break;
            case SHAPE_TYPES.ARROW:
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();

                // Draw arrowhead
                const angle = Math.atan2(y2 - y1, x2 - x1);
                const arrowLength = 15;
                const arrowAngle = Math.PI / 6;

                this.ctx.beginPath();
                this.ctx.moveTo(x2, y2);
                this.ctx.lineTo(x2 - arrowLength * Math.cos(angle - arrowAngle), y2 - arrowLength * Math.sin(angle - arrowAngle));
                this.ctx.moveTo(x2, y2);
                this.ctx.lineTo(x2 - arrowLength * Math.cos(angle + arrowAngle), y2 - arrowLength * Math.sin(angle + arrowAngle));
                this.ctx.stroke();
                break;
            case SHAPE_TYPES.STAR: {
                const starCenterX = (x1 + x2) / 2;
                const starCenterY = (y1 + y2) / 2;
                const outerRadius = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
                const innerRadius = outerRadius * 0.4;
                const points = 5;

                this.ctx.beginPath();
                for (let i = 0; i < points * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angleOffset = (Math.PI / points) * i - Math.PI / 2;
                    const px = starCenterX + Math.cos(angleOffset) * radius;
                    const py = starCenterY + Math.sin(angleOffset) * radius;

                    if (i === 0) {
                        this.ctx.moveTo(px, py);
                    } else {
                        this.ctx.lineTo(px, py);
                    }
                }
                this.ctx.closePath();
                this.ctx.stroke();
                break;
            }
            case SHAPE_TYPES.DIAMOND: {
                const diamondCenterX = (x1 + x2) / 2;
                const diamondCenterY = (y1 + y2) / 2;
                const diamondWidth = Math.abs(x2 - x1) / 2;
                const diamondHeight = Math.abs(y2 - y1) / 2;

                this.ctx.beginPath();
                this.ctx.moveTo(diamondCenterX, diamondCenterY - diamondHeight);
                this.ctx.lineTo(diamondCenterX + diamondWidth, diamondCenterY);
                this.ctx.lineTo(diamondCenterX, diamondCenterY + diamondHeight);
                this.ctx.lineTo(diamondCenterX - diamondWidth, diamondCenterY);
                this.ctx.closePath();
                this.ctx.stroke();
                break;
            }
            case SHAPE_TYPES.HEXAGON: {
                const hexCenterX = (x1 + x2) / 2;
                const hexCenterY = (y1 + y2) / 2;
                const hexRadius = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;

                this.ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angleHex = (Math.PI / 3) * i - Math.PI / 2;
                    const px = hexCenterX + Math.cos(angleHex) * hexRadius;
                    const py = hexCenterY + Math.sin(angleHex) * hexRadius;

                    if (i === 0) {
                        this.ctx.moveTo(px, py);
                    } else {
                        this.ctx.lineTo(px, py);
                    }
                }
                this.ctx.closePath();
                this.ctx.stroke();
                break;
            }
            case SHAPE_TYPES.HEART: {
                const heartCenterX = (x1 + x2) / 2;
                const heartTop = Math.min(y1, y2);
                const heartWidth = Math.abs(x2 - x1);
                const heartHeight = Math.abs(y2 - y1);

                this.ctx.beginPath();
                // Start at center (dip between lobes)
                this.ctx.moveTo(heartCenterX, heartTop + heartHeight * 0.333);

                // Left lobe
                this.ctx.bezierCurveTo(
                    heartCenterX,
                    heartTop,
                    heartCenterX - heartWidth * 0.5,
                    heartTop,
                    heartCenterX - heartWidth * 0.5,
                    heartTop + heartHeight * 0.333
                );

                // Left side to bottom
                this.ctx.bezierCurveTo(
                    heartCenterX - heartWidth * 0.5,
                    heartTop + heartHeight * 0.667,
                    heartCenterX,
                    heartTop + heartHeight * 0.722,
                    heartCenterX,
                    heartTop + heartHeight
                );

                // Bottom to right side
                this.ctx.bezierCurveTo(
                    heartCenterX,
                    heartTop + heartHeight * 0.722,
                    heartCenterX + heartWidth * 0.5,
                    heartTop + heartHeight * 0.667,
                    heartCenterX + heartWidth * 0.5,
                    heartTop + heartHeight * 0.333
                );

                // Right lobe back to center
                this.ctx.bezierCurveTo(
                    heartCenterX + heartWidth * 0.5,
                    heartTop,
                    heartCenterX,
                    heartTop,
                    heartCenterX,
                    heartTop + heartHeight * 0.333
                );

                this.ctx.stroke();
                break;
            }
        }

        // Restore context if rotation was applied
        if (rotation !== 0) {
            this.ctx.restore();
        }
    }

    drawLaser(laser) {
        if (laser.points.length < 1) return;

        // Get --fg-red color
        const redColor = getComputedStyle(document.documentElement).getPropertyValue('--fg-red').trim();

        this.ctx.strokeStyle = redColor || '#ff0000';
        this.ctx.lineWidth = 4 / this.zoom; // Keep thickness constant regardless of zoom
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Draw the laser trail
        this.ctx.beginPath();
        this.ctx.moveTo(laser.points[0].x, laser.points[0].y);

        for (let i = 1; i < laser.points.length; i++) {
            this.ctx.lineTo(laser.points[i].x, laser.points[i].y);
        }

        this.ctx.stroke();
    }

    drawSelectionBox(bbox) {
        if (!bbox) return;

        const accentColor = this.cachedStyles.accentColor || '#0066ff';

        // Draw selection rectangle
        this.ctx.strokeStyle = accentColor;
        this.ctx.lineWidth = 2 / this.zoom;
        this.ctx.strokeRect(bbox.minX, bbox.minY, bbox.maxX - bbox.minX, bbox.maxY - bbox.minY);

        // Draw resize handles at 4 corners
        const handleSize = CONFIG.RESIZE_HANDLE_SIZE / this.zoom;
        const handles = this.getResizeHandles(bbox);

        this.ctx.fillStyle = accentColor;
        this.ctx.strokeStyle = this.cachedStyles.bgColor || '#ffffff';
        this.ctx.lineWidth = 1 / this.zoom;

        Object.values(handles).forEach(handlePos => {
            this.ctx.fillRect(handlePos.x - handleSize / 2, handlePos.y - handleSize / 2, handleSize, handleSize);
            this.ctx.strokeRect(handlePos.x - handleSize / 2, handlePos.y - handleSize / 2, handleSize, handleSize);
        });

        // Draw rotation handle at top center
        const rotationHandleOffset = 15 / this.zoom;
        const centerX = (bbox.minX + bbox.maxX) / 2;
        const rotationY = bbox.minY - rotationHandleOffset;
        const rotationHandleRadius = 6 / this.zoom;

        this.ctx.fillStyle = accentColor;
        this.ctx.strokeStyle = this.cachedStyles.bgColor || '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(centerX, rotationY, rotationHandleRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
    }

    // ========================================================================
    // BOUNDING BOX CACHING
    // ========================================================================

    getBoundingBox(element) {
        if (!element) return null;

        // Check cache
        if (this.bboxCache.has(element.id)) {
            return this.bboxCache.get(element.id);
        }

        // Calculate and cache
        let bbox = null;
        if (element.type === 'path') {
            bbox = calculatePathBoundingBox(element);
        } else if (element.type === 'text') {
            bbox = calculateTextBoundingBox(element, this.ctx);
        } else if (element.type === 'shape') {
            bbox = calculateShapeBoundingBox(element);
        }

        if (bbox) {
            this.bboxCache.set(element.id, bbox);
        }

        return bbox;
    }

    getCombinedBoundingBox() {
        if (this.selectedElementIds.size === 0) return null;

        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;

        this.selectedElementIds.forEach(id => {
            const element = this.elements.find(el => el.id === id);
            if (!element) return;

            const bbox = this.getBoundingBox(element);
            if (bbox) {
                minX = Math.min(minX, bbox.minX);
                minY = Math.min(minY, bbox.minY);
                maxX = Math.max(maxX, bbox.maxX);
                maxY = Math.max(maxY, bbox.maxY);
            }
        });

        if (minX === Infinity) return null;

        return { minX, minY, maxX, maxY };
    }

    getResizeHandles(bbox) {
        if (!bbox) return null;

        const size = CONFIG.RESIZE_HANDLE_SIZE / this.zoom;

        return {
            [RESIZE_HANDLES.TOP_LEFT]: { x: bbox.minX, y: bbox.minY },
            [RESIZE_HANDLES.TOP_RIGHT]: { x: bbox.maxX, y: bbox.minY },
            [RESIZE_HANDLES.BOTTOM_LEFT]: { x: bbox.minX, y: bbox.maxY },
            [RESIZE_HANDLES.BOTTOM_RIGHT]: { x: bbox.maxX, y: bbox.maxY },
        };
    }

    getResizeHandleAtPoint(point, bbox) {
        if (!bbox) return null;

        const handles = this.getResizeHandles(bbox);
        const hitPadding = (CONFIG.RESIZE_HANDLE_SIZE + CONFIG.RESIZE_HANDLE_HIT_PADDING) / this.zoom;

        for (const [handleName, handlePos] of Object.entries(handles)) {
            const dx = Math.abs(point.x - handlePos.x);
            const dy = Math.abs(point.y - handlePos.y);
            if (dx <= hitPadding && dy <= hitPadding) {
                return handleName;
            }
        }

        return null;
    }

    getRotationHandle(bbox) {
        if (!bbox) return null;

        const rotationHandleOffset = 15 / this.zoom;
        const centerX = (bbox.minX + bbox.maxX) / 2;
        const rotationY = bbox.minY - rotationHandleOffset;

        return { x: centerX, y: rotationY };
    }

    isPointOverRotationHandle(point, bbox) {
        if (!bbox) return false;

        const handle = this.getRotationHandle(bbox);
        const hitRadius = 8 / this.zoom;

        const dx = point.x - handle.x;
        const dy = point.y - handle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= hitRadius;
    }

    invalidateBoundingBoxCache(elementId) {
        if (elementId) {
            this.bboxCache.delete(elementId);
        } else {
            this.bboxCache.clear();
        }
    }

    // ========================================================================
    // STYLE CACHING
    // ========================================================================

    updateCachedStyles() {
        if (!this.hostElement) return;
        const computedStyle = getComputedStyle(this.hostElement);
        this.cachedStyles.bgColor = computedStyle.getPropertyValue('--bg-1').trim() || '#ffffff';
        this.cachedStyles.accentColor = computedStyle.getPropertyValue('--fg-accent').trim() || '#0066ff';

        // Cache all theme colors
        Object.keys(THEME_COLORS).forEach(colorName => {
            const cssVar = THEME_COLORS[colorName].cssVar;
            this.cachedStyles[colorName] = computedStyle.getPropertyValue(cssVar).trim() || '#000000';
        });
    }

    getComputedColor(cssVariable) {
        const colorName = Object.keys(THEME_COLORS).find(name => THEME_COLORS[name].cssVar === cssVariable);
        if (colorName && this.cachedStyles[colorName]) {
            return this.cachedStyles[colorName];
        }
        // Fallback
        if (!this.hostElement) return '#000000';
        const computedStyle = getComputedStyle(this.hostElement);
        return computedStyle.getPropertyValue(cssVariable).trim() || '#000000';
    }

    updateCurrentColor(colorName) {
        const colorInfo = THEME_COLORS[colorName];
        if (!colorInfo) {
            colorName = 'default';
        }
        this.currentColor = this.getComputedColor(THEME_COLORS[colorName].cssVar);
        this.currentThemeColor = colorName;

        const colorButtons = this.shadowRoot.querySelectorAll('.color-button');
        colorButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === colorName);
        });
    }

    handleThemeChange() {
        this.updateCachedStyles();
        this.updateCurrentColor(this.currentThemeColor);

        // Update colors of existing elements
        this.elements = this.elements.map(element => {
            const colorName = element.colorName || 'default';
            const newColor = this.getComputedColor(THEME_COLORS[colorName].cssVar);
            return { ...element, color: newColor };
        });

        this.bboxCache.clear();
        this.scheduleRedraw();
    }

    // ========================================================================
    // EVENT BINDING
    // ========================================================================

    bindEvents() {
        const toolbar = this.shadowRoot.getElementById('toolbar');
        toolbar.addEventListener('click', this.handleToolbarClick.bind(this));

        // Canvas events
        this.canvas.addEventListener('mousedown', this.onPointerDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onCanvasMouseMove.bind(this));
        this.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
        this.canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
        this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });

        // Color buttons
        const colorButtons = this.shadowRoot.querySelectorAll('.color-button');
        colorButtons.forEach(button => {
            button.addEventListener('click', e => {
                const colorName = e.target.dataset.color;
                this.updateCurrentColor(colorName);

                // Apply color to selected elements
                if (this.selectedElementIds.size > 0) {
                    const newColor = this.getComputedColor(THEME_COLORS[colorName].cssVar);
                    this.selectedElementIds.forEach(id => {
                        const element = this.elements.find(el => el.id === id);
                        if (element) {
                            element.color = newColor;
                            element.colorName = colorName;
                            this.invalidateBoundingBoxCache(id);
                        }
                    });
                    this.scheduleRedraw();
                    this.sendUpdates();
                }
            });
        });

        // Thickness slider
        const thicknessSlider = this.shadowRoot.getElementById('thickness-slider');
        thicknessSlider.addEventListener('input', e => {
            this.currentThickness = parseInt(e.target.value);

            // Apply thickness to selected elements
            if (this.selectedElementIds.size > 0) {
                this.selectedElementIds.forEach(id => {
                    const element = this.elements.find(el => el.id === id);
                    if (element) {
                        element.thickness = this.currentThickness;
                        this.invalidateBoundingBoxCache(id);
                    }
                });
                this.scheduleRedraw();
                this.sendUpdates();
            }
        });

        // Resize handle
        const resizeHandle = this.shadowRoot.querySelector('.resize-handle');
        if (resizeHandle) {
            resizeHandle.addEventListener('mousedown', this.onResizeStart.bind(this));
            resizeHandle.addEventListener('touchstart', this.onResizeStart.bind(this), { passive: false });
        }
    }

    handleToolbarClick(e) {
        const button = e.target.closest('button');
        if (!button) return;
        const action = button.dataset.action;
        if (!action) return;

        const readonly = typeof wisk !== 'undefined' && wisk.editor && wisk.editor.readonly;
        if (readonly && ['draw', 'text', 'select', 'eraser', 'clear-all'].includes(action)) {
            return;
        }

        switch (action) {
            case 'home':
                this.resetView();
                break;
            case 'pan':
            case 'draw':
            case 'select':
            case 'text':
            case 'eraser':
                this.setMode(action);
                break;
            case 'clear-all':
                this.clearAllElements();
                break;
            case 'max-out':
                const isMaxOut = this.hostElement.classList.toggle('max-out');
                if (isMaxOut) {
                    // Going fullscreen
                    this.style.height = '100vh';
                    this.style.width = '100vw';
                } else {
                    // Exiting fullscreen - restore saved height
                    this.style.width = '100%';
                    this.applyHeight();
                }
                setTimeout(() => this.refreshCanvas(), 300);
                break;
        }
    }

    handleShapeSelect(shapeType) {
        this.selectedShapeType = shapeType;
        this.setMode(MODES.SHAPE);
        this.shapesDropdownOpen = false;
    }

    handleLaserSelect() {
        this.setMode(MODES.LASER);
        this.shapesDropdownOpen = false;
    }

    startLaserDecayAnimation() {
        if (!this.laserAnimationFrameId) {
            this.laserAnimationFrameId = requestAnimationFrame(this.animateLaserDecay.bind(this));
        }
    }

    animateLaserDecay() {
        let hasDecayingLasers = false;

        // Process each laser
        this.lasers = this.lasers.filter(laser => {
            if (!laser.isDecaying) {
                return true; // Keep non-decaying lasers
            }

            // Remove points from the beginning (FIFO - first in, first out)
            // Points were added to the end, so we remove from the beginning
            const pointsToRemove = Math.ceil(laser.points.length * this.laserDecayRate);

            if (pointsToRemove > 0 && laser.points.length > 0) {
                // Remove from the beginning (first points added are first to be removed)
                laser.points.splice(0, pointsToRemove);
                hasDecayingLasers = true;
            }

            // Remove laser if no points left
            return laser.points.length > 0;
        });

        if (hasDecayingLasers) {
            this.scheduleRedraw();
        }

        // Continue animation if there are still decaying lasers
        if (this.lasers.some(l => l.isDecaying)) {
            this.laserAnimationFrameId = requestAnimationFrame(this.animateLaserDecay.bind(this));
        } else {
            this.laserAnimationFrameId = null;
        }
    }

    // ========================================================================
    // UNDO/REDO
    // ========================================================================

    undo() {
        if (this.commandHistory.undo()) {
            this.sendUpdates();
        }
    }

    redo() {
        if (this.commandHistory.redo()) {
            this.sendUpdates();
        }
    }

    // ========================================================================
    // MODE AND STATE MANAGEMENT
    // ========================================================================

    setMode(mode) {
        // Clean up laser state if switching away from laser mode
        if (this.currentMode === MODES.LASER && mode !== MODES.LASER) {
            if (this.currentLaser) {
                if (this.currentLaser.decayTimeout) {
                    clearTimeout(this.currentLaser.decayTimeout);
                }
                this.currentLaser.isDecaying = true;
                this.startLaserDecayAnimation();
                this.currentLaser = null;
            }
        }

        this.currentMode = mode;
        this.setState(STATES.IDLE);
        this.currentPath = null;
        this.selectedElementIds.clear();

        const buttons = this.shadowRoot.querySelectorAll('#toolbar button[data-action]');
        buttons.forEach(button => {
            const action = button.dataset.action;
            if (Object.values(MODES).includes(action)) {
                button.classList.toggle('button-active', action === mode);
            }
        });

        // Update cursor
        this.updateCursor();
        this.scheduleRedraw();
    }

    setState(newState) {
        this.state = newState;
        this.updateCursor();
    }

    updateCursor(overrideHandle = null) {
        if (this.state === STATES.PANNING) {
            this.canvas.style.cursor = 'grabbing';
        } else if (this.state === STATES.RESIZING_SELECTION) {
            this.canvas.style.cursor = this.getResizeCursor(this.resizeHandle);
        } else if (this.state === STATES.ROTATING_SELECTION) {
            this.canvas.style.cursor = 'grabbing';
        } else if (this.currentMode === MODES.PAN) {
            this.canvas.style.cursor = 'grab';
        } else if (this.currentMode === MODES.DRAW) {
            this.canvas.style.cursor = 'crosshair';
        } else if (this.currentMode === MODES.ERASER) {
            this.canvas.style.cursor = 'crosshair';
        } else if (this.currentMode === MODES.TEXT) {
            this.canvas.style.cursor = 'text';
        } else if (this.currentMode === MODES.SHAPE) {
            this.canvas.style.cursor = 'crosshair';
        } else if (this.currentMode === MODES.LASER) {
            this.canvas.style.cursor = 'crosshair';
        } else if (this.currentMode === MODES.SELECT && overrideHandle) {
            this.canvas.style.cursor = this.getResizeCursor(overrideHandle);
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    getResizeCursor(handle) {
        switch (handle) {
            case RESIZE_HANDLES.TOP_LEFT:
            case RESIZE_HANDLES.BOTTOM_RIGHT:
                return 'nwse-resize';
            case RESIZE_HANDLES.TOP_RIGHT:
            case RESIZE_HANDLES.BOTTOM_LEFT:
                return 'nesw-resize';
            default:
                return 'default';
        }
    }

    resetView() {
        this.zoom = 1;
        this.panOffset = { x: 0, y: 0 };
        this.selectedElementIds.clear();
        this.scheduleRedraw();
    }

    deleteSelectedElements() {
        if (this.selectedElementIds.size === 0) return;

        const command = new DeleteElementsCommand(this, this.selectedElementIds);
        this.commandHistory.execute(command);
        this.sendUpdates();
    }

    eraseAtPoint(point) {
        // Find elements that intersect with the eraser point
        const elementsToDelete = new Set();

        for (let i = this.elements.length - 1; i >= 0; i--) {
            const element = this.elements[i];
            const bbox = this.getBoundingBox(element);

            if (bbox && isPointInRect(point, bbox)) {
                elementsToDelete.add(element.id);
            }
        }

        // Delete the elements
        if (elementsToDelete.size > 0) {
            const command = new DeleteElementsCommand(this, elementsToDelete);
            this.commandHistory.execute(command);
            this.sendUpdates();
        }
    }

    clearAllElements() {
        if (this.elements.length === 0) return;

        const command = new ClearAllCommand(this);
        this.commandHistory.execute(command);
        this.sendUpdates();
    }

    // ========================================================================
    // COORDINATE CONVERSION
    // ========================================================================

    getCanvasPoint(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (clientX - rect.left - this.panOffset.x) / this.zoom;
        const y = (clientY - rect.top - this.panOffset.y) / this.zoom;
        return { x, y };
    }

    getScreenPoint(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    // ========================================================================
    // UNIFIED POINTER EVENT HANDLERS
    // ========================================================================

    onCanvasMouseMove(e) {
        // Update cursor when hovering over resize/rotation handles in select mode
        if (this.currentMode === MODES.SELECT && this.state === STATES.IDLE && this.selectedElementIds.size > 0) {
            const point = this.getCanvasPoint(e.clientX, e.clientY);
            const combinedBbox = this.getCombinedBoundingBox();

            // Check rotation handle first
            if (this.isPointOverRotationHandle(point, combinedBbox)) {
                this.canvas.style.cursor = 'grab';
            } else {
                const handle = this.getResizeHandleAtPoint(point, combinedBbox);

                if (handle) {
                    this.updateCursor(handle);
                } else if (combinedBbox && isPointInRect(point, combinedBbox)) {
                    this.canvas.style.cursor = 'move';
                } else {
                    this.updateCursor();
                }
            }
        }
    }

    onPointerDown(e) {
        const startPoint = this.getCanvasPoint(e.clientX, e.clientY);
        const startScreenPoint = this.getScreenPoint(e.clientX, e.clientY);
        const readonly = typeof wisk !== 'undefined' && wisk.editor && wisk.editor.readonly;

        // Pan mode or middle mouse button
        if (this.currentMode === MODES.PAN || e.button === 1) {
            this.setState(STATES.PANNING);
            this.lastPanPosition = { x: e.clientX, y: e.clientY };
            return;
        }

        // Draw mode
        if (this.currentMode === MODES.DRAW && e.button === 0 && !readonly) {
            this.setState(STATES.DRAWING);
            this.selectedElementIds.clear();
            const newPath = {
                id: generateUUID(),
                type: 'path',
                points: [{ ...startPoint, pressure: 0.3, timestamp: Date.now() }],
                color: this.currentColor,
                colorName: this.currentThemeColor,
                thickness: this.currentThickness,
            };
            this.currentPath = newPath;
            this.elements.push(newPath);
            this.scheduleRedraw();
            return;
        }

        // Text mode
        if (this.currentMode === MODES.TEXT && e.button === 0 && !readonly) {
            this.showTextInput(startPoint, startScreenPoint);
            return;
        }

        // Eraser mode
        if (this.currentMode === MODES.ERASER && e.button === 0 && !readonly) {
            this.setState(STATES.ERASING);
            this.eraseAtPoint(startPoint);
            return;
        }

        // Shape mode
        if (this.currentMode === MODES.SHAPE && e.button === 0 && !readonly && this.selectedShapeType) {
            this.setState(STATES.DRAWING_SHAPE);
            this.shapeStartPoint = startPoint;
            this.currentShapePreview = {
                type: 'shape',
                shapeType: this.selectedShapeType,
                x1: startPoint.x,
                y1: startPoint.y,
                x2: startPoint.x,
                y2: startPoint.y,
                color: this.currentColor,
                colorName: this.currentThemeColor,
                thickness: this.currentThickness,
                rotation: 0,
            };
            this.scheduleRedraw();
            return;
        }

        // Laser mode
        if (this.currentMode === MODES.LASER && e.button === 0 && !readonly) {
            const newLaser = {
                id: generateUUID(),
                points: [{ ...startPoint, timestamp: Date.now() }],
                isDecaying: false,
                decayIndex: 0,
            };
            this.currentLaser = newLaser;
            this.lasers.push(newLaser);
            this.scheduleRedraw();
            return;
        }

        // Select mode
        if (this.currentMode === MODES.SELECT && e.button === 0) {
            this.handleSelectPointerDown(startPoint, startScreenPoint, e.shiftKey, readonly);
            return;
        }
    }

    handleSelectPointerDown(startPoint, startScreenPoint, shiftKey, readonly) {
        // Check if clicked on rotation or resize handle first
        if (this.selectedElementIds.size > 0 && !readonly) {
            const combinedBbox = this.getCombinedBoundingBox();

            // Check rotation handle first
            if (this.isPointOverRotationHandle(startPoint, combinedBbox)) {
                this.setState(STATES.ROTATING_SELECTION);
                this.rotationCenter = {
                    x: (combinedBbox.minX + combinedBbox.maxX) / 2,
                    y: (combinedBbox.minY + combinedBbox.maxY) / 2,
                };

                // Store initial state of elements for rotation
                this.rotateStartElements = [];
                this.selectedElementIds.forEach(id => {
                    const element = this.elements.find(el => el.id === id);
                    if (element) {
                        this.rotateStartElements.push({
                            id: element.id,
                            data: JSON.parse(JSON.stringify(element)),
                        });
                    }
                });
                return;
            }

            const handle = this.getResizeHandleAtPoint(startPoint, combinedBbox);

            if (handle) {
                this.setState(STATES.RESIZING_SELECTION);
                this.resizeHandle = handle;
                this.resizeStartBounds = { ...combinedBbox };

                // Store initial state of elements for resizing
                this.resizeStartElements = [];
                this.selectedElementIds.forEach(id => {
                    const element = this.elements.find(el => el.id === id);
                    if (element) {
                        this.resizeStartElements.push({
                            id: element.id,
                            data: JSON.parse(JSON.stringify(element)),
                        });
                    }
                });
                return;
            }
        }

        let clickedOnSelection = false;

        // Check if clicked on already selected element
        if (this.selectedElementIds.size > 0) {
            const combinedBbox = this.getCombinedBoundingBox();
            if (isPointInRect(startPoint, combinedBbox)) {
                clickedOnSelection = true;
            }
        }

        if (clickedOnSelection && !readonly) {
            this.setState(STATES.MOVING_SELECTION);
            this.moveStartPoint = startPoint;
            this.moveAccumulatedDelta = { x: 0, y: 0 };
        } else {
            // Check if clicked on any element
            let clickedElementId = null;
            for (let i = this.elements.length - 1; i >= 0; i--) {
                const element = this.elements[i];
                const bbox = this.getBoundingBox(element);
                if (isPointInRect(startPoint, bbox)) {
                    clickedElementId = element.id;
                    break;
                }
            }

            if (clickedElementId) {
                if (shiftKey) {
                    if (this.selectedElementIds.has(clickedElementId)) {
                        this.selectedElementIds.delete(clickedElementId);
                    } else {
                        this.selectedElementIds.add(clickedElementId);
                    }
                } else {
                    this.selectedElementIds.clear();
                    this.selectedElementIds.add(clickedElementId);
                }
                if (!readonly) {
                    this.setState(STATES.MOVING_SELECTION);
                    this.moveStartPoint = startPoint;
                    this.moveAccumulatedDelta = { x: 0, y: 0 };
                }
            } else {
                if (!shiftKey) {
                    this.selectedElementIds.clear();
                }
                this.setState(STATES.MARQUEE_SELECTING);
                this.marqueeStart = { canvasX: startPoint.x, canvasY: startPoint.y, screenX: startScreenPoint.x, screenY: startScreenPoint.y };
                this.marqueeEnd = { screenX: startScreenPoint.x, screenY: startScreenPoint.y };
            }
            this.scheduleRedraw();
        }
    }

    handleGlobalMouseMove(e) {
        // Handle laser mode separately - track all mouse movements
        if (this.currentMode === MODES.LASER && this.currentLaser && this.isInitialized) {
            const currentPoint = this.getCanvasPoint(e.clientX, e.clientY);
            const lastPoint = this.currentLaser.points[this.currentLaser.points.length - 1];
            const dist = Math.hypot(currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y);

            if (dist > CONFIG.MIN_POINT_DISTANCE) {
                this.currentLaser.points.push({ ...currentPoint, timestamp: Date.now() });
                this.currentLaser.isDecaying = false; // Reset decay if moving again
                this.scheduleRedraw();

                // Clear any existing decay timeout
                if (this.currentLaser.decayTimeout) {
                    clearTimeout(this.currentLaser.decayTimeout);
                }

                // Set timeout to start decaying when cursor stops
                this.currentLaser.decayTimeout = setTimeout(() => {
                    if (this.currentLaser) {
                        this.currentLaser.isDecaying = true;
                        this.startLaserDecayAnimation();
                    }
                }, 200); // Start decaying 200ms after cursor stops
            }
        }

        if (!this.isInitialized || this.state === STATES.IDLE) return;

        const currentPoint = this.getCanvasPoint(e.clientX, e.clientY);
        const currentScreenPoint = this.getScreenPoint(e.clientX, e.clientY);

        if (this.state === STATES.PANNING) {
            const deltaX = e.clientX - this.lastPanPosition.x;
            const deltaY = e.clientY - this.lastPanPosition.y;
            this.panOffset.x += deltaX;
            this.panOffset.y += deltaY;
            this.lastPanPosition = { x: e.clientX, y: e.clientY };
            this.scheduleRedraw();
        } else if (this.state === STATES.RESIZING_SELECTION && this.resizeHandle && this.resizeStartBounds) {
            this.handleResize(currentPoint);
        } else if (this.state === STATES.ROTATING_SELECTION && this.rotationCenter && this.rotateStartElements) {
            this.handleRotate(currentPoint);
        } else if (this.state === STATES.DRAWING && this.currentPath) {
            const lastPoint = this.currentPath.points[this.currentPath.points.length - 1];
            const dist = Math.hypot(currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y);
            if (dist > CONFIG.MIN_POINT_DISTANCE) {
                // Calculate velocity-based pressure (slower = slightly thicker)
                const now = Date.now();
                const timeDelta = Math.max(1, now - lastPoint.timestamp);
                const velocity = dist / timeDelta;
                // Map velocity to pressure (0.75 to 1.0, much more subtle range)
                const pressure = Math.max(0.75, Math.min(1.0, 1.0 - Math.min(velocity * 0.5, 0.25)));

                this.currentPath.points.push({ ...currentPoint, pressure, timestamp: now });
                this.invalidateBoundingBoxCache(this.currentPath.id);
                this.scheduleRedraw();
            }
        } else if (this.state === STATES.ERASING) {
            this.eraseAtPoint(currentPoint);
        } else if (this.state === STATES.DRAWING_SHAPE && this.currentShapePreview) {
            this.currentShapePreview.x2 = currentPoint.x;
            this.currentShapePreview.y2 = currentPoint.y;
            this.scheduleRedraw();
        } else if (this.state === STATES.MOVING_SELECTION && this.moveStartPoint) {
            const deltaX = currentPoint.x - this.moveStartPoint.x;
            const deltaY = currentPoint.y - this.moveStartPoint.y;

            this.selectedElementIds.forEach(id => {
                const element = this.elements.find(el => el.id === id);
                if (!element) return;

                if (element.type === 'path') {
                    element.points = element.points.map(p => ({ x: p.x + deltaX, y: p.y + deltaY }));
                } else if (element.type === 'text') {
                    element.x += deltaX;
                    element.y += deltaY;
                } else if (element.type === 'shape') {
                    element.x1 += deltaX;
                    element.y1 += deltaY;
                    element.x2 += deltaX;
                    element.y2 += deltaY;
                }
                this.invalidateBoundingBoxCache(id);
            });

            this.moveAccumulatedDelta.x += deltaX;
            this.moveAccumulatedDelta.y += deltaY;
            this.moveStartPoint = currentPoint;
            this.scheduleRedraw();
        } else if (this.state === STATES.MARQUEE_SELECTING && this.marqueeStart) {
            this.marqueeEnd = { screenX: currentScreenPoint.x, screenY: currentScreenPoint.y };
            this.scheduleRedraw();
        }
    }

    handleGlobalMouseUp(e) {
        // Handle laser mode
        if (this.currentMode === MODES.LASER && this.currentLaser) {
            // Clear decay timeout if exists
            if (this.currentLaser.decayTimeout) {
                clearTimeout(this.currentLaser.decayTimeout);
            }
            // Start decaying immediately when mouse is released
            this.currentLaser.isDecaying = true;
            this.startLaserDecayAnimation();
            this.currentLaser = null; // Allow new laser to be created on next click
            return;
        }

        if (this.state === STATES.PANNING) {
            this.setState(STATES.IDLE);
            this.sendUpdates();
        } else if (this.state === STATES.ERASING) {
            this.setState(STATES.IDLE);
        } else if (this.state === STATES.DRAWING_SHAPE) {
            this.setState(STATES.IDLE);
            if (this.currentShapePreview && this.shapeStartPoint) {
                // Only add shape if it has some size
                const width = Math.abs(this.currentShapePreview.x2 - this.currentShapePreview.x1);
                const height = Math.abs(this.currentShapePreview.y2 - this.currentShapePreview.y1);
                if (width > 5 || height > 5) {
                    const newShape = {
                        ...this.currentShapePreview,
                        id: generateUUID(),
                    };
                    const addCommand = new AddElementCommand(this, newShape);
                    this.commandHistory.execute(addCommand);
                    this.sendUpdates();
                }
            }
            this.currentShapePreview = null;
            this.shapeStartPoint = null;
            this.selectedShapeType = null;
            // Switch back to select mode after placing shape
            this.setMode(MODES.SELECT);
        } else if (this.state === STATES.RESIZING_SELECTION) {
            this.setState(STATES.IDLE);
            this.resizeHandle = null;
            this.resizeStartBounds = null;
            this.resizeStartElements = null;
            this.sendUpdates();
        } else if (this.state === STATES.ROTATING_SELECTION) {
            this.setState(STATES.IDLE);
            this.rotationCenter = null;
            this.rotateStartElements = null;
            this.sendUpdates();
        } else if (this.state === STATES.DRAWING) {
            this.setState(STATES.IDLE);
            if (this.currentPath && this.currentPath.points.length > 1) {
                // Simplify path
                this.currentPath.points = simplifyPath(this.currentPath.points);
                this.invalidateBoundingBoxCache(this.currentPath.id);

                // Wrap in command for undo
                const addCommand = new AddElementCommand(this, this.currentPath);
                // Remove from elements first since we already added it
                this.elements.pop();
                this.commandHistory.execute(addCommand);

                this.sendUpdates();
            } else if (this.currentPath) {
                // Remove single-point path
                this.elements.pop();
                this.scheduleRedraw();
            }
            this.currentPath = null;
        } else if (this.state === STATES.MOVING_SELECTION) {
            this.setState(STATES.IDLE);
            if (this.moveAccumulatedDelta.x !== 0 || this.moveAccumulatedDelta.y !== 0) {
                const command = new MoveElementsCommand(this, this.selectedElementIds, this.moveAccumulatedDelta.x, this.moveAccumulatedDelta.y);
                // The move already happened, so we need to undo it first, then execute the command
                this.selectedElementIds.forEach(id => {
                    const element = this.elements.find(el => el.id === id);
                    if (!element) return;
                    if (element.type === 'path') {
                        element.points = element.points.map(p => ({
                            x: p.x - this.moveAccumulatedDelta.x,
                            y: p.y - this.moveAccumulatedDelta.y,
                        }));
                    } else if (element.type === 'text') {
                        element.x -= this.moveAccumulatedDelta.x;
                        element.y -= this.moveAccumulatedDelta.y;
                    } else if (element.type === 'shape') {
                        element.x1 -= this.moveAccumulatedDelta.x;
                        element.y1 -= this.moveAccumulatedDelta.y;
                        element.x2 -= this.moveAccumulatedDelta.x;
                        element.y2 -= this.moveAccumulatedDelta.y;
                    }
                    this.invalidateBoundingBoxCache(id);
                });
                this.commandHistory.execute(command);
                this.sendUpdates();
            }
            this.moveStartPoint = null;
            this.moveAccumulatedDelta = { x: 0, y: 0 };
        } else if (this.state === STATES.MARQUEE_SELECTING) {
            this.setState(STATES.IDLE);
            const marqueeCanvasEnd = this.getCanvasPoint(e.clientX, e.clientY);
            const marqueeRect = {
                minX: Math.min(this.marqueeStart.canvasX, marqueeCanvasEnd.x),
                minY: Math.min(this.marqueeStart.canvasY, marqueeCanvasEnd.y),
                maxX: Math.max(this.marqueeStart.canvasX, marqueeCanvasEnd.x),
                maxY: Math.max(this.marqueeStart.canvasY, marqueeCanvasEnd.y),
            };

            this.elements.forEach(element => {
                const bbox = this.getBoundingBox(element);
                if (bbox && doRectsOverlap(bbox, marqueeRect)) {
                    this.selectedElementIds.add(element.id);
                }
            });

            this.marqueeStart = null;
            this.marqueeEnd = null;
            this.scheduleRedraw();
        }
    }

    onDoubleClick(e) {
        const readonly = typeof wisk !== 'undefined' && wisk.editor && wisk.editor.readonly;
        if (readonly || this.currentMode !== MODES.SELECT) return;

        const point = this.getCanvasPoint(e.clientX, e.clientY);
        const screenPoint = this.getScreenPoint(e.clientX, e.clientY);

        // Find text element under double-click
        for (let i = this.elements.length - 1; i >= 0; i--) {
            const element = this.elements[i];
            if (element.type === 'text') {
                const bbox = this.getBoundingBox(element);
                if (isPointInRect(point, bbox)) {
                    this.showTextInput(point, screenPoint, element);
                    return;
                }
            }
        }
    }

    onWheel(e) {
        e.preventDefault();

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.offsetX ?? e.clientX - rect.left;
        const mouseY = e.offsetY ?? e.clientY - rect.top;

        const scroll = e.deltaY < 0 ? 1 : -1;
        const zoomFactor = Math.exp(scroll * CONFIG.ZOOM_INTENSITY);

        const newZoom = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, this.zoom * zoomFactor));

        const mousePoint = {
            x: (mouseX - this.panOffset.x) / this.zoom,
            y: (mouseY - this.panOffset.y) / this.zoom,
        };

        this.panOffset.x = mouseX - mousePoint.x * newZoom;
        this.panOffset.y = mouseY - mousePoint.y * newZoom;
        this.zoom = newZoom;

        this.scheduleRedraw();
        this.sendUpdates();
    }

    // ========================================================================
    // RESIZE SELECTION
    // ========================================================================

    handleResize(currentPoint) {
        if (!this.resizeHandle || !this.resizeStartBounds || !this.resizeStartElements) return;

        const startBounds = this.resizeStartBounds;
        const handle = this.resizeHandle;

        // Determine the anchor point (opposite corner that stays fixed)
        let anchorX, anchorY;
        let newX = currentPoint.x;
        let newY = currentPoint.y;

        switch (handle) {
            case RESIZE_HANDLES.TOP_LEFT:
                // Anchor is bottom-right
                anchorX = startBounds.maxX;
                anchorY = startBounds.maxY;
                break;
            case RESIZE_HANDLES.TOP_RIGHT:
                // Anchor is bottom-left
                anchorX = startBounds.minX;
                anchorY = startBounds.maxY;
                break;
            case RESIZE_HANDLES.BOTTOM_LEFT:
                // Anchor is top-right
                anchorX = startBounds.maxX;
                anchorY = startBounds.minY;
                break;
            case RESIZE_HANDLES.BOTTOM_RIGHT:
                // Anchor is top-left
                anchorX = startBounds.minX;
                anchorY = startBounds.minY;
                break;
        }

        // Calculate new bounds with anchor fixed
        const newBounds = {
            minX: Math.min(anchorX, newX),
            minY: Math.min(anchorY, newY),
            maxX: Math.max(anchorX, newX),
            maxY: Math.max(anchorY, newY),
        };

        // Calculate scale factors from the original bounds
        const oldWidth = startBounds.maxX - startBounds.minX;
        const oldHeight = startBounds.maxY - startBounds.minY;
        const newWidth = newBounds.maxX - newBounds.minX;
        const newHeight = newBounds.maxY - newBounds.minY;

        const scaleX = newWidth / oldWidth;
        const scaleY = newHeight / oldHeight;

        // Apply scaling to all selected elements, using anchor as the fixed point
        this.resizeStartElements.forEach(({ id, data }) => {
            const element = this.elements.find(el => el.id === id);
            if (!element) return;

            if (element.type === 'path') {
                element.points = data.points.map(p => ({
                    x: anchorX + (p.x - anchorX) * scaleX,
                    y: anchorY + (p.y - anchorY) * scaleY,
                }));
                // Scale thickness proportionally (min 1)
                element.thickness = Math.max(1, data.thickness * Math.min(Math.abs(scaleX), Math.abs(scaleY)));
            } else if (element.type === 'text') {
                element.x = anchorX + (data.x - anchorX) * scaleX;
                element.y = anchorY + (data.y - anchorY) * scaleY;
                // Scale text size proportionally (min 1)
                element.thickness = Math.max(1, data.thickness * Math.min(Math.abs(scaleX), Math.abs(scaleY)));
            } else if (element.type === 'shape') {
                element.x1 = anchorX + (data.x1 - anchorX) * scaleX;
                element.y1 = anchorY + (data.y1 - anchorY) * scaleY;
                element.x2 = anchorX + (data.x2 - anchorX) * scaleX;
                element.y2 = anchorY + (data.y2 - anchorY) * scaleY;
                element.thickness = Math.max(1, data.thickness * Math.min(Math.abs(scaleX), Math.abs(scaleY)));
            }

            this.invalidateBoundingBoxCache(id);
        });

        this.scheduleRedraw();
    }

    // ========================================================================
    // ROTATE SELECTION
    // ========================================================================

    handleRotate(currentPoint) {
        if (!this.rotationCenter || !this.rotateStartElements) return;

        // Calculate angle from vertical up (where rotation handle was initially)
        // atan2(x - centerX, centerY - y) gives 0 for straight up, positive for clockwise
        const angle = Math.atan2(currentPoint.x - this.rotationCenter.x, this.rotationCenter.y - currentPoint.y);

        // Standard rotation matrix (works for y-down canvas with clockwise rotation)
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // Apply rotation to all selected elements
        this.rotateStartElements.forEach(({ id, data }) => {
            const element = this.elements.find(el => el.id === id);
            if (!element) return;

            if (element.type === 'path') {
                element.points = data.points.map(p => {
                    const dx = p.x - this.rotationCenter.x;
                    const dy = p.y - this.rotationCenter.y;
                    return {
                        ...p,
                        x: this.rotationCenter.x + (dx * cos - dy * sin),
                        y: this.rotationCenter.y + (dx * sin + dy * cos),
                    };
                });
            } else if (element.type === 'text') {
                // Keep position fixed, only update rotation property
                element.x = data.x;
                element.y = data.y;
                element.rotation = angle + (data.rotation || 0);
            } else if (element.type === 'shape') {
                // Keep anchor points fixed, only update rotation property
                element.x1 = data.x1;
                element.y1 = data.y1;
                element.x2 = data.x2;
                element.y2 = data.y2;
                element.rotation = angle + (data.rotation || 0);
            }

            this.invalidateBoundingBoxCache(id);
        });

        this.scheduleRedraw();
    }

    // ========================================================================
    // TEXT INPUT HANDLING
    // ========================================================================

    showTextInput(canvasPoint, screenPoint, existingElement = null) {
        this.setState(STATES.TEXT_EDITING);

        // Remove any existing text input
        const existingInput = this.shadowRoot.getElementById('text-input');
        if (existingInput) {
            existingInput.remove();
        }

        // Create input element
        const textInput = document.createElement('div');
        textInput.id = 'text-input';
        textInput.contentEditable = 'true';
        textInput.spellcheck = false;
        textInput.setAttribute('data-placeholder', 'Type text...');

        // Position and setup
        const fontSize = Math.max(10, this.currentThickness * 2);
        textInput.style.fontSize = `${fontSize}px`;
        textInput.style.color = this.currentColor;
        textInput.style.left = `${screenPoint.x}px`;
        textInput.style.top = `${screenPoint.y}px`;
        textInput.textContent = existingElement ? existingElement.text : '';

        // Store context
        textInput.dataset.canvasX = canvasPoint.x;
        textInput.dataset.canvasY = canvasPoint.y;
        textInput.dataset.elementId = existingElement ? existingElement.id : '';

        // Append to DOM
        this.hostElement.appendChild(textInput);

        // Handle blur and enter
        const handleComplete = () => {
            const text = textInput.textContent.trim();
            const canvasX = parseFloat(textInput.dataset.canvasX);
            const canvasY = parseFloat(textInput.dataset.canvasY);
            const elementId = textInput.dataset.elementId;

            textInput.remove();
            this.setState(STATES.IDLE);

            if (elementId) {
                // Editing existing text
                const element = this.elements.find(el => el.id === elementId);
                if (element && element.text !== text) {
                    if (text === '') {
                        // Delete if empty
                        const command = new DeleteElementsCommand(this, new Set([elementId]));
                        this.commandHistory.execute(command);
                    } else {
                        const command = new EditTextCommand(this, elementId, element.text, text);
                        this.commandHistory.execute(command);
                    }
                    this.sendUpdates();
                }
            } else {
                // New text
                if (text !== '') {
                    const newTextElement = {
                        id: generateUUID(),
                        type: 'text',
                        text: text,
                        x: canvasX,
                        y: canvasY,
                        color: this.currentColor,
                        colorName: this.currentThemeColor,
                        thickness: this.currentThickness,
                        rotation: 0,
                    };
                    const command = new AddElementCommand(this, newTextElement);
                    this.commandHistory.execute(command);
                    this.sendUpdates();
                }
            }
        };

        const handleKeyDown = e => {
            // Stop propagation to prevent canvas keyboard handlers
            e.stopPropagation();

            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                textInput.blur();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                textInput.textContent = existingElement ? existingElement.text : '';
                textInput.blur();
            }
        };

        textInput.addEventListener('blur', handleComplete, { once: true });
        textInput.addEventListener('keydown', handleKeyDown);

        // Focus after a short delay to ensure it's in the DOM
        setTimeout(() => {
            textInput.focus();
            if (existingElement) {
                // Select all text for editing
                const range = document.createRange();
                range.selectNodeContents(textInput);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else {
                // Place cursor at end
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(textInput);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }, 10);
    }

    // ========================================================================
    // KEYBOARD SUPPORT
    // ========================================================================

    handleKeyDown(e) {
        // Only handle if canvas is focused or no other input has focus
        const activeElement = document.activeElement;
        const isInputFocused =
            activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.contentEditable === 'true');

        // Allow keyboard shortcuts even when input is focused in shadow DOM
        const shadowActiveElement = this.shadowRoot.activeElement;
        const isShadowInputFocused = shadowActiveElement && shadowActiveElement.contentEditable === 'true';

        const readonly = typeof wisk !== 'undefined' && wisk.editor && wisk.editor.readonly;

        // Delete and Backspace keys
        if ((e.key === 'Delete' || e.key === 'Backspace') && !readonly && !isInputFocused && !isShadowInputFocused) {
            if (this.selectedElementIds.size > 0) {
                e.preventDefault();
                this.deleteSelectedElements();
            }
        }

        // Escape key
        if (e.key === 'Escape') {
            if (this.state !== STATES.IDLE) {
                e.preventDefault();
                this.setState(STATES.IDLE);
                this.selectedElementIds.clear();
                this.currentPath = null;
                this.marqueeStart = null;
                this.marqueeEnd = null;
                this.scheduleRedraw();
            }
        }

        // Undo/Redo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !readonly && !isInputFocused && !isShadowInputFocused) {
            e.preventDefault();
            this.undo();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' || (e.key === 'z' && e.shiftKey)) && !readonly && !isInputFocused && !isShadowInputFocused) {
            e.preventDefault();
            this.redo();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'y' && !readonly && !isInputFocused && !isShadowInputFocused) {
            e.preventDefault();
            this.redo();
        }

        // Copy
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !isInputFocused && !isShadowInputFocused) {
            if (this.selectedElementIds.size > 0) {
                e.preventDefault();
                this.copySelectedElements();
            }
        }

        // Cut
        if ((e.ctrlKey || e.metaKey) && e.key === 'x' && !readonly && !isInputFocused && !isShadowInputFocused) {
            if (this.selectedElementIds.size > 0) {
                e.preventDefault();
                this.cutSelectedElements();
            }
        }

        // Paste
        if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !readonly && !isInputFocused && !isShadowInputFocused) {
            e.preventDefault();
            this.pasteElements(e);
        }

        // Arrow keys to nudge selection
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !readonly && !isInputFocused && !isShadowInputFocused) {
            if (this.selectedElementIds.size > 0) {
                e.preventDefault();
                let deltaX = 0,
                    deltaY = 0;
                const amount = e.shiftKey ? CONFIG.NUDGE_AMOUNT * 2 : CONFIG.NUDGE_AMOUNT;

                if (e.key === 'ArrowUp') deltaY = -amount / this.zoom;
                if (e.key === 'ArrowDown') deltaY = amount / this.zoom;
                if (e.key === 'ArrowLeft') deltaX = -amount / this.zoom;
                if (e.key === 'ArrowRight') deltaX = amount / this.zoom;

                const command = new MoveElementsCommand(this, this.selectedElementIds, deltaX, deltaY);
                this.commandHistory.execute(command);
                this.sendUpdates();
            }
        }

        // Select all
        if ((e.ctrlKey || e.metaKey) && e.key === 'a' && this.currentMode === MODES.SELECT && !isInputFocused && !isShadowInputFocused) {
            e.preventDefault();
            this.selectedElementIds.clear();
            this.elements.forEach(el => this.selectedElementIds.add(el.id));
            this.scheduleRedraw();
        }
    }

    // ========================================================================
    // CLIPBOARD OPERATIONS
    // ========================================================================

    copySelectedElements() {
        if (this.selectedElementIds.size === 0) return;

        this.clipboard = [];
        this.selectedElementIds.forEach(id => {
            const element = this.elements.find(el => el.id === id);
            if (element) {
                // Deep copy the element
                this.clipboard.push(JSON.parse(JSON.stringify(element)));
            }
        });
    }

    cutSelectedElements() {
        this.copySelectedElements();
        this.deleteSelectedElements();
    }

    async pasteElements(e) {
        // Try to get text from system clipboard first
        try {
            const clipboardText = await navigator.clipboard.readText();
            if (clipboardText && clipboardText.trim() !== '') {
                // Paste as text element at center of view
                const centerX = (this.canvas.width / 2 / window.devicePixelRatio - this.panOffset.x) / this.zoom;
                const centerY = (this.canvas.height / 2 / window.devicePixelRatio - this.panOffset.y) / this.zoom;

                const newTextElement = {
                    id: generateUUID(),
                    type: 'text',
                    text: clipboardText,
                    x: centerX,
                    y: centerY,
                    color: this.currentColor,
                    colorName: this.currentThemeColor,
                    thickness: this.currentThickness,
                    rotation: 0,
                };

                const command = new AddElementCommand(this, newTextElement);
                this.commandHistory.execute(command);
                this.sendUpdates();
                return;
            }
        } catch (err) {
            // Clipboard API might not be available or permission denied
            console.log('Clipboard read failed, using internal clipboard');
        }

        // If no text in clipboard, use internal clipboard
        if (!this.clipboard || this.clipboard.length === 0) return;

        const centerX = (this.canvas.width / 2 / window.devicePixelRatio - this.panOffset.x) / this.zoom;
        const centerY = (this.canvas.height / 2 / window.devicePixelRatio - this.panOffset.y) / this.zoom;

        // Calculate offset to paste at center
        let minX = Infinity,
            minY = Infinity;
        this.clipboard.forEach(el => {
            if (el.type === 'path') {
                el.points.forEach(p => {
                    minX = Math.min(minX, p.x);
                    minY = Math.min(minY, p.y);
                });
            } else if (el.type === 'text') {
                minX = Math.min(minX, el.x);
                minY = Math.min(minY, el.y);
            }
        });

        const offsetX = centerX - minX;
        const offsetY = centerY - minY;

        // Clear selection and paste
        this.selectedElementIds.clear();

        this.clipboard.forEach(element => {
            const newElement = JSON.parse(JSON.stringify(element));
            newElement.id = generateUUID();

            if (newElement.type === 'path') {
                newElement.points = newElement.points.map(p => ({ x: p.x + offsetX, y: p.y + offsetY }));
            } else if (newElement.type === 'text') {
                newElement.x += offsetX;
                newElement.y += offsetY;
            }

            // Update color to current theme
            const colorName = newElement.colorName || 'default';
            newElement.color = this.getComputedColor(THEME_COLORS[colorName].cssVar);

            const command = new AddElementCommand(this, newElement);
            this.commandHistory.execute(command);
            this.selectedElementIds.add(newElement.id);
        });

        this.sendUpdates();
        this.scheduleRedraw();
    }

    // ========================================================================
    // TOUCH EVENT HANDLERS
    // ========================================================================

    onTouchStart(e) {
        e.preventDefault();
        const touches = e.touches;
        const readonly = typeof wisk !== 'undefined' && wisk.editor && wisk.editor.readonly;

        this.touchData.touches = Array.from(touches).map(touch => ({
            id: touch.identifier,
            clientX: touch.clientX,
            clientY: touch.clientY,
        }));

        if (touches.length === 1) {
            const touch = touches[0];
            const touchPoint = this.getCanvasPoint(touch.clientX, touch.clientY);
            const touchScreenPoint = this.getScreenPoint(touch.clientX, touch.clientY);

            // Double tap detection
            const currentTime = new Date().getTime();
            const tapLength = currentTime - this.touchData.lastTap;
            clearTimeout(this.touchData.tapTimeout);

            if (tapLength < CONFIG.DOUBLE_TAP_DELAY && tapLength > 0 && !readonly && this.currentMode === MODES.SELECT) {
                // Double tap - edit text
                this.onDoubleClick({ clientX: touch.clientX, clientY: touch.clientY });
                this.touchData.lastTap = 0;
                return;
            } else {
                // Single tap - set timeout
                this.touchData.tapTimeout = setTimeout(() => {
                    // Treat as mouse down
                    this.onPointerDown({ clientX: touch.clientX, clientY: touch.clientY, button: 0 });
                }, CONFIG.DOUBLE_TAP_DELAY);
            }
            this.touchData.lastTap = currentTime;
        } else if (touches.length === 2) {
            // Two fingers - pinch zoom/pan
            this.setState(STATES.IDLE);
            this.currentPath = null;
            clearTimeout(this.touchData.tapTimeout);

            const touch1 = touches[0];
            const touch2 = touches[1];

            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            this.touchData.lastDistance = Math.sqrt(dx * dx + dy * dy);

            const midX = (touch1.clientX + touch2.clientX) / 2;
            const midY = (touch1.clientY + touch2.clientY) / 2;
            this.touchData.pinchPanStart = { x: midX, y: midY };
            this.touchData.didPinchZoom = false;
        }
    }

    handleGlobalTouchMove(e) {
        if (!this.isInitialized) return;
        e.preventDefault();

        const touches = e.touches;

        if (touches.length === 1 && this.state !== STATES.IDLE) {
            const touch = touches[0];
            this.handleGlobalMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        } else if (touches.length === 2) {
            const touch1 = touches[0];
            const touch2 = touches[1];

            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            const newDistance = Math.sqrt(dx * dx + dy * dy);
            const midX = (touch1.clientX + touch2.clientX) / 2;
            const midY = (touch1.clientY + touch2.clientY) / 2;

            // Zoom
            const zoomFactor = newDistance / this.touchData.lastDistance;
            this.touchData.lastDistance = newDistance;

            const newZoom = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, this.zoom * zoomFactor));

            const mousePointBeforeZoom = {
                x: (midX - this.panOffset.x) / this.zoom,
                y: (midY - this.panOffset.y) / this.zoom,
            };

            // Pan
            const panDeltaX = midX - this.touchData.pinchPanStart.x;
            const panDeltaY = midY - this.touchData.pinchPanStart.y;

            this.panOffset.x = midX - mousePointBeforeZoom.x * newZoom + panDeltaX;
            this.panOffset.y = midY - mousePointBeforeZoom.y * newZoom + panDeltaY;
            this.zoom = newZoom;

            this.touchData.pinchPanStart = { x: midX, y: midY };
            this.touchData.didPinchZoom = true;
            this.scheduleRedraw();
        }
    }

    handleGlobalTouchEnd(e) {
        clearTimeout(this.touchData.tapTimeout);

        const endedAllTouches = e.touches.length === 0;

        if (endedAllTouches) {
            // Send updates if we did pinch zoom/pan
            if (this.touchData.didPinchZoom) {
                this.sendUpdates();
            }

            // Treat as mouse up
            this.handleGlobalMouseUp({ clientX: 0, clientY: 0 });

            this.touchData = {
                touches: [],
                lastDistance: 0,
                lastTap: this.touchData.lastTap,
                tapTimeout: null,
                pinchPanStart: null,
                didPinchZoom: false,
            };
        } else {
            this.touchData.touches = Array.from(e.touches).map(touch => ({
                id: touch.identifier,
                clientX: touch.clientX,
                clientY: touch.clientY,
            }));

            if (e.touches.length === 1) {
                // Send updates if we just finished pinch zoom (went from 2 fingers to 1)
                if (this.touchData.didPinchZoom) {
                    this.sendUpdates();
                }
                this.touchData.lastDistance = 0;
                this.touchData.pinchPanStart = null;
                this.touchData.didPinchZoom = false;
            }
        }
    }

    // ========================================================================
    // RESIZE HANDLE
    // ========================================================================

    onResizeStart(e) {
        e.preventDefault();
        e.stopPropagation();

        this.isResizing = true;
        this.resizeStartY = e.clientY || (e.touches && e.touches[0].clientY);
        this.resizeStartHeight = this.hostElement.offsetHeight;

        // Add global listeners for resize
        const handleResizeMove = this.handleResizeMove.bind(this);
        const handleResizeEnd = () => {
            this.isResizing = false;
            window.removeEventListener('mousemove', handleResizeMove);
            window.removeEventListener('mouseup', handleResizeEnd);
            window.removeEventListener('touchmove', handleResizeMove);
            window.removeEventListener('touchend', handleResizeEnd);
            this.sendUpdates();
        };

        window.addEventListener('mousemove', handleResizeMove);
        window.addEventListener('mouseup', handleResizeEnd);
        window.addEventListener('touchmove', handleResizeMove, { passive: false });
        window.addEventListener('touchend', handleResizeEnd);
    }

    handleResizeMove(e) {
        if (!this.isResizing) return;
        e.preventDefault();

        const currentY = e.clientY || (e.touches && e.touches[0].clientY);
        const deltaY = currentY - this.resizeStartY;
        const newHeight = Math.max(200, this.resizeStartHeight + deltaY);

        this.canvasHeight = newHeight;
        this.applyHeight();
        this.resizeCanvas();
    }

    applyHeight() {
        this.style.height = `${this.canvasHeight}px`;
        if (this.hostElement) {
            this.hostElement.style.height = `${this.canvasHeight}px`;
        }
    }

    refreshCanvas() {
        // Force a proper reflow and redraw
        if (this.hostElement) {
            this.hostElement.offsetHeight; // Force reflow
        }
        this.resizeCanvas();
    }

    // ========================================================================
    // DATA PERSISTENCE
    // ========================================================================

    getValue() {
        if (!this.isInitialized) {
            return this.pendingValue || { canvasContent: null };
        }

        const validElements = this.elements.filter(el => {
            if (el.type === 'path') return el.points && el.points.length > 1;
            if (el.type === 'text') return el.text && el.text.trim() !== '';
            if (el.type === 'shape') return true;
            return false;
        });

        const canvasData = {
            elements: validElements
                .map(element => {
                    if (element.type === 'path') {
                        return {
                            id: element.id,
                            type: 'path',
                            points: element.points,
                            colorName: element.colorName || 'default',
                            thickness: element.thickness,
                        };
                    } else if (element.type === 'text') {
                        return {
                            id: element.id,
                            type: 'text',
                            text: element.text,
                            x: element.x,
                            y: element.y,
                            colorName: element.colorName || 'default',
                            thickness: element.thickness,
                            rotation: element.rotation || 0,
                        };
                    } else if (element.type === 'shape') {
                        return {
                            id: element.id,
                            type: 'shape',
                            shapeType: element.shapeType,
                            x1: element.x1,
                            y1: element.y1,
                            x2: element.x2,
                            y2: element.y2,
                            colorName: element.colorName || 'default',
                            thickness: element.thickness,
                            rotation: element.rotation || 0,
                        };
                    }
                    return null;
                })
                .filter(el => el !== null),
            zoom: this.zoom,
            panOffset: this.panOffset,
            height: this.canvasHeight,
        };

        return {
            canvasContent: canvasData,
        };
    }

    setValue(identifier, value) {
        if (!this.isInitialized) {
            this.pendingValue = value;
            return;
        }
        this.pendingValue = null;

        if (!value || !value.canvasContent) {
            this.clearAllElementsWithoutCommand();
            this.resetView();
            return;
        }

        try {
            // Support both old format (JSON string) and new format (object)
            const canvasData = typeof value.canvasContent === 'string' ? JSON.parse(value.canvasContent) : value.canvasContent;

            if (canvasData.elements) {
                this.elements = canvasData.elements
                    .map(elementData => {
                        const colorName = elementData.colorName || 'default';
                        const color = this.getComputedColor(THEME_COLORS[colorName].cssVar);
                        const id = elementData.id || generateUUID();

                        if (elementData.type === 'path') {
                            return {
                                id,
                                type: 'path',
                                points: elementData.points || [],
                                colorName: colorName,
                                color: color,
                                thickness: elementData.thickness || 2,
                            };
                        } else if (elementData.type === 'text') {
                            return {
                                id,
                                type: 'text',
                                text: elementData.text || '',
                                x: elementData.x || 0,
                                y: elementData.y || 0,
                                colorName: colorName,
                                color: color,
                                thickness: elementData.thickness || 2,
                                rotation: elementData.rotation || 0,
                            };
                        } else if (elementData.type === 'shape') {
                            return {
                                id,
                                type: 'shape',
                                shapeType: elementData.shapeType,
                                x1: elementData.x1 || 0,
                                y1: elementData.y1 || 0,
                                x2: elementData.x2 || 0,
                                y2: elementData.y2 || 0,
                                colorName: colorName,
                                color: color,
                                thickness: elementData.thickness || 2,
                                rotation: elementData.rotation || 0,
                            };
                        }
                        return null;
                    })
                    .filter(el => el !== null);
            } else {
                this.elements = [];
            }

            this.zoom = canvasData.zoom || 1;
            this.panOffset = canvasData.panOffset || { x: 0, y: 0 };
            this.canvasHeight = canvasData.height || 400;

            this.selectedElementIds.clear();
            this.bboxCache.clear();
            this.commandHistory.clear();

            // Apply the saved height and refresh canvas
            this.applyHeight();
            this.refreshCanvas();
        } catch (error) {
            console.error('Error parsing canvas data:', error);
            this.clearAllElementsWithoutCommand();
            this.resetView();
        }
    }

    clearAllElementsWithoutCommand() {
        this.elements = [];
        this.selectedElementIds.clear();
        this.bboxCache.clear();
        this.scheduleRedraw();
    }

    sendUpdates() {
        if (!this.isComponentMounted) return;

        clearTimeout(this.updateDebounceTimer);
        this.updateDebounceTimer = setTimeout(() => {
            if (!this.isComponentMounted) return;
            if (typeof wisk !== 'undefined' && wisk.editor && !wisk.editor.readonly) {
                wisk.editor.justUpdates(this.id);
            }
        }, CONFIG.UPDATE_DEBOUNCE);
    }

    // ========================================================================
    // RENDER
    // ========================================================================

    render() {
        const readonly = typeof wisk !== 'undefined' && wisk.editor && wisk.editor.readonly;
        const canDelete = !readonly && this.selectedElementIds.size > 0;
        const canClearAll = !readonly && this.elements.length > 0;

        return html`
            <div class="host" id="host-${this.id}">
                <div id="toolbar">
                    <!-- Navigation Group -->
                    <button class="tbn" data-action="home" title="Reset View">
                        <img draggable="false" src="/a7/plugins/canvas-element/home.svg" alt="Home" />
                    </button>
                    <button
                        class="tbn ${this.currentMode === MODES.SELECT ? 'button-active' : ''}"
                        data-action="select"
                        title="Select (Double Click Text to Edit)"
                    >
                        <img draggable="false" src="/a7/plugins/canvas-element/select.svg" alt="Select" />
                    </button>

                    <button class="tbn ${this.currentMode === MODES.DRAW ? 'button-active' : ''}" data-action="draw" title="Draw" ?hidden=${readonly}>
                        <img draggable="false" src="/a7/plugins/canvas-element/draw.svg" alt="Draw" />
                    </button>

                    <button
                        class="tbn ${this.currentMode === MODES.ERASER ? 'button-active' : ''}"
                        data-action="eraser"
                        title="Eraser"
                        ?hidden=${readonly}
                    >
                        <img draggable="false" src="/a7/plugins/canvas-element/trash.svg" alt="Eraser" />
                    </button>

                    <button class="tbn ${this.currentMode === MODES.TEXT ? 'button-active' : ''}" data-action="text" title="Text" ?hidden=${readonly}>
                        <img draggable="false" src="/a7/plugins/canvas-element/text.svg" alt="Text" />
                    </button>

                    <div class="shapes-dropdown-wrapper ${this.shapesDropdownOpen ? 'active' : ''}" ?hidden=${readonly}>
                        <button
                            class="tbn"
                            @click=${e => {
                                e.stopPropagation();
                                this.shapesDropdownOpen = !this.shapesDropdownOpen;
                            }}
                            title="Shapes"
                        >
                            <img draggable="false" class="chevron-up" src="/a7/plugins/canvas-element/chevron-up.svg" alt="Shapes" />
                        </button>
                        <div class="shapes-dropdown ${this.shapesDropdownOpen ? 'active' : ''}" @click=${e => e.stopPropagation()}>
                            <button
                                class="shape-option"
                                @click=${e => {
                                    e.stopPropagation();
                                    this.handleShapeSelect(SHAPE_TYPES.RECTANGLE);
                                }}
                            >
                                <img draggable="false" src="/a7/plugins/canvas-element/rectangle.svg" alt="Rectangle" />
                                <span>Rectangle</span>
                            </button>
                            <button
                                class="shape-option"
                                @click=${e => {
                                    e.stopPropagation();
                                    this.handleShapeSelect(SHAPE_TYPES.CIRCLE);
                                }}
                            >
                                <img draggable="false" src="/a7/plugins/canvas-element/circle.svg" alt="Circle" />
                                <span>Circle</span>
                            </button>
                            <button
                                class="shape-option"
                                @click=${e => {
                                    e.stopPropagation();
                                    this.handleShapeSelect(SHAPE_TYPES.LINE);
                                }}
                            >
                                <img draggable="false" src="/a7/plugins/canvas-element/line.svg" alt="Line" />
                                <span>Line</span>
                            </button>
                            <button
                                class="shape-option"
                                @click=${e => {
                                    e.stopPropagation();
                                    this.handleShapeSelect(SHAPE_TYPES.ARROW);
                                }}
                            >
                                <img draggable="false" src="/a7/plugins/canvas-element/arrow.svg" alt="Arrow" />
                                <span>Arrow</span>
                            </button>
                            <button
                                class="shape-option"
                                @click=${e => {
                                    e.stopPropagation();
                                    this.handleShapeSelect(SHAPE_TYPES.STAR);
                                }}
                            >
                                <img draggable="false" src="/a7/plugins/canvas-element/star.svg" alt="Star" />
                                <span>Star</span>
                            </button>
                            <button
                                class="shape-option"
                                @click=${e => {
                                    e.stopPropagation();
                                    this.handleShapeSelect(SHAPE_TYPES.DIAMOND);
                                }}
                            >
                                <img draggable="false" src="/a7/plugins/canvas-element/diamond.svg" alt="Diamond" />
                                <span>Diamond</span>
                            </button>
                            <button
                                class="shape-option"
                                @click=${e => {
                                    e.stopPropagation();
                                    this.handleShapeSelect(SHAPE_TYPES.HEXAGON);
                                }}
                            >
                                <img draggable="false" src="/a7/plugins/canvas-element/hexagon.svg" alt="Hexagon" />
                                <span>Hexagon</span>
                            </button>
                            <button
                                class="shape-option"
                                @click=${e => {
                                    e.stopPropagation();
                                    this.handleShapeSelect(SHAPE_TYPES.HEART);
                                }}
                            >
                                <img draggable="false" src="/a7/plugins/canvas-element/heart.svg" alt="Heart" />
                                <span>Heart</span>
                            </button>
                            <button
                                class="shape-option"
                                @click=${e => {
                                    e.stopPropagation();
                                    this.handleLaserSelect();
                                }}
                            >
                                <img draggable="false" src="/a7/plugins/canvas-element/laser.svg" alt="Laser" />
                                <span>Laser</span>
                            </button>
                        </div>
                    </div>

                    <div class="color-picker-wrapper" ?hidden=${readonly}>
                        ${Object.keys(THEME_COLORS).map(
                            colorName => html`
                                <div
                                    class="color-button color-${colorName} ${this.currentThemeColor === colorName ? 'active' : ''}"
                                    data-color="${colorName}"
                                    title="${colorName.charAt(0).toUpperCase() + colorName.slice(1)}"
                                ></div>
                            `
                        )}
                    </div>
                    <div id="thickness-slider-wrapper" ?hidden=${readonly} title="Thickness">
                        <input
                            type="range"
                            id="thickness-slider"
                            min="1"
                            max="20"
                            .value=${this.currentThickness}
                            @input=${e => (this.currentThickness = parseInt(e.target.value))}
                        />
                    </div>
                </div>
                <canvas id="drawing-canvas"></canvas>
                <div class="resize-handle"></div>
            </div>
        `;
    }
}

customElements.define('canvas-element', CanvasElement);
