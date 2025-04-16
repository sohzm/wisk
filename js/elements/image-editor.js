import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class ImageEditor extends LitElement {
    static styles = css`
        :host {
            display: block;
            font-family: system-ui, sans-serif;
        }
        .container {
            padding: 16px;
        }
        .controls {
            margin-bottom: 16px;
        }
        .radio-group {
            margin: 8px 0;
        }
        .slider-group {
            margin: 8px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .button-group {
            margin: 16px 0;
            display: flex;
            gap: 8px;
        }
        .canvas-container {
            position: relative;
            display: inline-block;
        }
        canvas {
            border: 1px solid #ccc;
        }
        #previewCanvas {
            position: absolute;
            left: 0;
            top: 0;
            pointer-events: none;
        }
    `;

    static properties = {
        image: { type: Object },
        _isDrawing: { state: true },
        _lastPreviewX: { state: true },
        _lastPreviewY: { state: true },
        _undoStack: { state: true },
        _originalImageData: { state: true },
    };

    constructor() {
        super();
        this._isDrawing = false;
        this._lastPreviewX = -1;
        this._lastPreviewY = -1;
        this._undoStack = [];
        this._maxUndoSteps = 50;
    }

    firstUpdated() {
        this.canvas = this.shadowRoot.querySelector('#canvas');
        this.previewCanvas = this.shadowRoot.querySelector('#previewCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.previewCtx = this.previewCanvas.getContext('2d');

        if (this.image) {
            this._loadImage();
        }
    }

    updated(changedProperties) {
        if (changedProperties.has('image') && this.image) {
            this._loadImage();
        }
    }

    _loadImage() {
        this.canvas.width = this.image.width;
        this.canvas.height = this.image.height;
        this.previewCanvas.width = this.image.width;
        this.previewCanvas.height = this.image.height;

        this.ctx.drawImage(this.image, 0, 0);
        this._originalImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this._undoStack = [];
        this._saveState();
        this._updateCursor();
    }

    _getActiveMode() {
        return this.shadowRoot.querySelector('input[name="mode"]:checked').value;
    }

    _updateCursor() {
        const mode = this._getActiveMode();
        const size = this.shadowRoot.querySelector('#brushSize').value;

        if (mode === 'wand') {
            this.canvas.style.cursor = 'crosshair';
        } else {
            const color = mode === 'erase' ? 'black' : 'green';
            this.canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="none" stroke="${color}" /></svg>') ${size / 2} ${size / 2}, auto`;
        }
    }

    _saveState() {
        if (this._undoStack.length >= this._maxUndoSteps) {
            this._undoStack.shift();
        }
        this._undoStack.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
    }

    _undo() {
        if (this._undoStack.length > 0) {
            this.ctx.putImageData(this._undoStack.pop(), 0, 0);
        }
    }

    _colorDistance(r1, g1, b1, r2, g2, b2) {
        return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
    }

    _removeIsolatedPixels(imageData) {
        const pixels = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const visited = new Set();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pos = y * width + x;
                const idx = pos * 4;

                if (pixels[idx + 3] === 0 || visited.has(pos)) continue;

                const component = new Set();
                const queue = [pos];
                let size = 0;

                while (queue.length > 0) {
                    const currentPos = queue.shift();
                    if (visited.has(currentPos)) continue;

                    const cx = currentPos % width;
                    const cy = Math.floor(currentPos / width);
                    const currentIdx = currentPos * 4;

                    if (pixels[currentIdx + 3] !== 0) {
                        visited.add(currentPos);
                        component.add(currentPos);
                        size++;

                        const neighbors = [
                            cy > 0 ? currentPos - width : null,
                            cy < height - 1 ? currentPos + width : null,
                            cx > 0 ? currentPos - 1 : null,
                            cx < width - 1 ? currentPos + 1 : null,
                        ];

                        for (const neighbor of neighbors) {
                            if (neighbor !== null && !visited.has(neighbor)) {
                                queue.push(neighbor);
                            }
                        }
                    }
                }

                if (size < 100) {
                    for (const pos of component) {
                        const idx = pos * 4;
                        pixels[idx + 3] = 0;
                    }
                }
            }
        }

        return imageData;
    }

    _brushAt(x, y, isRestore) {
        const size = parseInt(this.shadowRoot.querySelector('#brushSize').value);
        const radius = size / 2;
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        for (let py = Math.max(0, y - radius); py < Math.min(this.canvas.height, y + radius); py++) {
            for (let px = Math.max(0, x - radius); px < Math.min(this.canvas.width, x + radius); px++) {
                const dx = px - x;
                const dy = py - y;
                if (dx * dx + dy * dy <= radius * radius) {
                    const idx = (py * this.canvas.width + px) * 4;
                    if (isRestore) {
                        const origIdx = idx;
                        imageData.data[idx] = this._originalImageData.data[origIdx];
                        imageData.data[idx + 1] = this._originalImageData.data[origIdx + 1];
                        imageData.data[idx + 2] = this._originalImageData.data[origIdx + 2];
                        imageData.data[idx + 3] = this._originalImageData.data[origIdx + 3];
                    } else {
                        imageData.data[idx + 3] = 0;
                    }
                }
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    _showBrushPreview(x, y) {
        this.previewCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const size = parseInt(this.shadowRoot.querySelector('#brushSize').value);
        this.previewCtx.beginPath();
        this.previewCtx.arc(x, y, size / 2, 0, Math.PI * 2);
        this.previewCtx.strokeStyle = this._getActiveMode() === 'restore' ? 'green' : 'black';
        this.previewCtx.stroke();
    }

    _floodFill(startX, startY, tolerance, imageData, previewMode = false) {
        const pixels = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        const startPos = (startY * width + startX) * 4;
        const startR = pixels[startPos];
        const startG = pixels[startPos + 1];
        const startB = pixels[startPos + 2];

        const visited = new Array(width * height).fill(false);
        const queue = [];
        const affectedPixels = new Set();

        queue.push(startY * width + startX);

        while (queue.length > 0) {
            const pos = queue.shift();
            if (visited[pos]) continue;

            const x = pos % width;
            const y = Math.floor(pos / width);
            const idx = pos * 4;

            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];

            if (this._colorDistance(r, g, b, startR, startG, startB) < tolerance * 2.55) {
                affectedPixels.add(pos);

                if (!previewMode) {
                    pixels[idx + 3] = 0;
                }

                const neighbors = [
                    x > 0 ? pos - 1 : null,
                    x < width - 1 ? pos + 1 : null,
                    y > 0 ? pos - width : null,
                    y < height - 1 ? pos + width : null,
                    x > 0 && y > 0 ? pos - width - 1 : null,
                    x < width - 1 && y > 0 ? pos - width + 1 : null,
                    x > 0 && y < height - 1 ? pos + width - 1 : null,
                    x < width - 1 && y < height - 1 ? pos + width + 1 : null,
                ];

                for (const neighbor of neighbors) {
                    if (neighbor !== null && !visited[neighbor]) {
                        queue.push(neighbor);
                    }
                }
            }

            visited[pos] = true;
        }

        return { imageData, affectedPixels };
    }

    _updatePreview(x, y) {
        const mode = this._getActiveMode();

        if (mode !== 'wand') {
            this._showBrushPreview(x, y);
            return;
        }

        if (x === this._lastPreviewX && y === this._lastPreviewY) return;

        this._lastPreviewX = x;
        this._lastPreviewY = y;

        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const threshold = this.shadowRoot.querySelector('#threshold').value;
        const { affectedPixels } = this._floodFill(x, y, threshold, imageData, true);

        this.previewCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const previewImageData = this.previewCtx.createImageData(this.canvas.width, this.canvas.height);
        for (const pos of affectedPixels) {
            const idx = pos * 4;
            previewImageData.data[idx] = 255;
            previewImageData.data[idx + 3] = 128;
        }

        this.previewCtx.putImageData(previewImageData, 0, 0);
    }

    _performAction(x, y) {
        const mode = this._getActiveMode();

        if (mode === 'wand') {
            if (this._isDrawing) return;
            this._saveState();
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const threshold = this.shadowRoot.querySelector('#threshold').value;
            const { imageData: updatedImageData } = this._floodFill(x, y, threshold, imageData);
            const cleanedImageData = this._removeIsolatedPixels(updatedImageData);
            this.ctx.putImageData(cleanedImageData, 0, 0);
            this.previewCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            if (!this._isDrawing) this._saveState();
            this._brushAt(x, y, mode === 'restore');
        }
    }

    _handleMouseDown(e) {
        this._isDrawing = true;
        const mode = this._getActiveMode();
        if (mode !== 'wand') {
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor(e.clientX - rect.left);
            const y = Math.floor(e.clientY - rect.top);
            this._performAction(x, y);
        }
    }

    _handleMouseUp() {
        this._isDrawing = false;
    }

    _handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);

        if (this._isDrawing && this._getActiveMode() !== 'wand') {
            this._performAction(x, y);
        }
        this._updatePreview(x, y);
    }

    _handleMouseLeave() {
        this._isDrawing = false;
        this.previewCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this._lastPreviewX = -1;
        this._lastPreviewY = -1;
    }

    _handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        this._performAction(x, y);
    }

    _handleReset() {
        if (this.image) {
            this.ctx.drawImage(this.image, 0, 0);
            this.previewCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this._undoStack = [];
            this._saveState();
        }
    }

    _handleSave() {
        this.canvas.toBlob(blob => {
            const event = new CustomEvent('save-image', {
                detail: { blob },
                bubbles: true,
                composed: true,
            });
            this.dispatchEvent(event);
        }, 'image/png');
    }

    render() {
        return html`
            <div class="container">
                <div class="controls">
                    <div class="radio-group">
                        <label>
                            <input type="radio" name="mode" value="erase" checked @change=${() => this._updateCursor()} />
                            Erase
                        </label>
                        <label>
                            <input type="radio" name="mode" value="wand" @change=${() => this._updateCursor()} />
                            Magic Wand
                        </label>
                        <label>
                            <input type="radio" name="mode" value="restore" @change=${() => this._updateCursor()} />
                            Restore
                        </label>
                    </div>

                    <div class="slider-group">
                        <label>
                            Threshold:
                            <input
                                type="range"
                                id="threshold"
                                min="1"
                                max="100"
                                value="30"
                                @input=${e => {
                                    if (this._lastPreviewX !== -1 && this._lastPreviewY !== -1) {
                                        this._updatePreview(this._lastPreviewX, this._lastPreviewY);
                                    }
                                }}
                            />
                            <span id="thresholdValue">30</span>
                        </label>
                    </div>

                    <div class="slider-group">
                        <label>
                            Brush Size:
                            <input type="range" id="brushSize" min="5" max="50" value="20" @input=${() => this._updateCursor()} />
                            <span id="brushSizeValue">20</span>px
                        </label>
                    </div>
                </div>

                <div class="button-group">
                    <button @click=${() => this._undo()}>Undo</button>
                    <button @click=${() => this._handleReset()}>Reset Image</button>
                    <button @click=${() => this._handleSave()}>Save</button>
                </div>

                <div class="canvas-container">
                    <canvas
                        id="canvas"
                        @mousedown=${this._handleMouseDown}
                        @mouseup=${this._handleMouseUp}
                        @mousemove=${this._handleMouseMove}
                        @mouseleave=${this._handleMouseLeave}
                        @click=${this._handleClick}
                    ></canvas>
                    <canvas id="previewCanvas"></canvas>
                </div>
            </div>
        `;
    }
}

customElements.define('image-editor', ImageEditor);
