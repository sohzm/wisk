import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

var threeReady = new Promise(resolve => {
    if (window.THREE) {
        resolve();
        return;
    }

    const loadScripts = async () => {
        // Load Three.js core
        await new Promise(resolve => {
            const threeScript = document.createElement('script');
            threeScript.src = '/a7/cdn/three-0.128.0.min.js';
            threeScript.onload = resolve;
            document.head.appendChild(threeScript);
        });

        // Load OrbitControls from separate module
        await new Promise(resolve => {
            const orbitScript = document.createElement('script');
            orbitScript.src = '/a7/cdn/three-0.128.0-OrbitControls.js';
            orbitScript.onload = resolve;
            document.head.appendChild(orbitScript);
        });

        // Load model loaders
        const loaderScripts = ['/a7/cdn/three-0.128.0-GLTFLoader.js', '/a7/cdn/three-0.128.0-OBJLoader.js'];

        for (const src of loaderScripts) {
            await new Promise(resolve => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                document.head.appendChild(script);
            });
        }

        resolve();
    };

    loadScripts();
});

class ThreeViewerElement extends LitElement {
    static styles = css`
        :host {
            display: block;
            position: relative;
        }
        .viewer-container {
            border: none;
            width: 100%;
            position: relative;
            min-height: 200px;
            transition: height 0.3s ease;
            border-radius: var(--radius);
            border: 1px solid transparent;
        }
        .viewer-container:hover {
            background: var(--bg-2);
            border: 1px solid var(--border-1);
        }
        .error {
            color: var(--fg-red);
        }
        .upload-area {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: repeating-linear-gradient(-45deg, var(--bg-1), var(--bg-1) 5px, var(--bg-3) 5px, var(--bg-3) 10px);
            border-radius: var(--radius);
            cursor: pointer;
        }
        #file-input {
            display: none;
        }
        canvas {
            width: 100%;
            height: 100%;
            border-radius: var(--radius);
        }
        .upload-button {
            padding: var(--padding-w2);
            background-color: var(--bg-1);
            color: var(--fg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            cursor: pointer;
            margin-top: 10px;
        }
        .loading {
            opacity: 0.5;
            pointer-events: none;
        }
        .resize-handle {
            position: absolute;
            height: 10px;
            width: 100%;
            background: transparent;
            cursor: ns-resize;
            z-index: 10;
        }
        .resize-handle:hover {
            background: var(--fg-accent);
            opacity: 0.5;
        }
        .top-handle {
            top: 0;
        }
        .bottom-handle {
            bottom: 0;
        }
    `;

    static properties = {
        modelUrl: { type: String },
        error: { type: String },
        _theme: { type: Object, state: true },
        loading: { type: Boolean, state: true },
        height: { type: Number },
        isDragging: { type: Boolean, state: true },
        currentResizeHandle: { type: Object, state: true },
        startY: { type: Number, state: true },
        startHeight: { type: Number, state: true },
    };

    constructor() {
        super();
        this.modelUrl = null;
        this.error = '';
        this._theme = wisk.theme.getThemeData(wisk.theme.getTheme());
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.loading = false;
        this.height = 400;
        this.isDragging = false;
        this.currentResizeHandle = null;
        this.startY = 0;
        this.startHeight = 0;
        this.MIN_HEIGHT = 200;
        this.MAX_HEIGHT = 800;
    }

    getFileExtension(filename) {
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    }

    async storeModelFile(file) {
        try {
            // Generate unique ID for the model file
            const fileExt = this.getFileExtension(file.name);
            const uniqueUrl = 'model-' + Date.now() + '.' + fileExt;

            // Save to IndexedDB asset store
            await wisk.db.saveAsset(uniqueUrl, file);

            return uniqueUrl;
        } catch (error) {
            console.error('Error storing model file:', error);
            throw error;
        }
    }

    async loadModelFromUrl(url, fileType) {
        this.loading = true;
        this.requestUpdate();

        try {
            let loader;
            switch (fileType) {
                case 'gltf':
                    wisk.utils.showToast('GLTF files are not supported. Please use GLB files instead.', 5000);
                    return;
                case 'glb':
                    loader = new THREE.GLTFLoader();
                    break;
                case 'obj':
                    // loader = new THREE.OBJLoader();
                    wisk.utils.showToast('OBJ files are not supported. Please use GLB files instead.', 5000);
                    return;
                default:
                    wisk.utils.showToast('Unsupported file type. Please use GLB files.', 5000);
                    return;
            }

            // Clear existing model
            if (this.model) {
                this.scene.remove(this.model);
                this.model.traverse(child => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => material.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }

            // Fetch model data from IndexedDB
            const modelBlob = await wisk.db.getAsset(url);
            if (!modelBlob) {
                throw new Error('Model not found in storage');
            }

            // Create object URL from blob
            const objectUrl = URL.createObjectURL(modelBlob);

            // Store for cleanup
            if (this._currentObjectUrl) {
                URL.revokeObjectURL(this._currentObjectUrl);
            }
            this._currentObjectUrl = objectUrl;

            const result = await new Promise((resolve, reject) => {
                loader.load(
                    objectUrl,
                    loaded => resolve(loaded),
                    undefined,
                    error => reject(error)
                );
            });

            this.model = fileType === 'obj' ? result : result.scene;

            // Apply default materials for objects without textures
            this.model.traverse(child => {
                if (child.isMesh) {
                    // Check if the material is default white or missing
                    const needsDefaultMaterial =
                        !child.material ||
                        (child.material.type === 'MeshBasicMaterial' && child.material.color.getHex() === 0xffffff) ||
                        (child.material.map === null && child.material.color.getHex() === 0xffffff);

                    if (needsDefaultMaterial) {
                        // Create a new material with better default appearance
                        child.material = new THREE.MeshPhongMaterial({
                            color: 0x808080, // Medium gray color
                            shininess: 30,
                            flatShading: false,
                            side: THREE.DoubleSide, // Render both sides of faces
                        });
                    }
                }
            });

            // Center and scale model
            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;

            this.model.position.sub(center);
            this.model.scale.multiplyScalar(scale);

            this.scene.add(this.model);

            // Set initial camera position
            this.camera.position.set(2, 2, 5);
            this.camera.lookAt(0, 0, 0);
            this.controls.target.set(0, 0, 0);
            this.controls.update();

            this.error = '';
        } catch (error) {
            console.error('Error loading model:', error);
            this.error = `Error loading model: ${error.message}`;
        }

        this.loading = false;
        this.requestUpdate();
    }

    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!this.scene) {
            await this.initThreeJS();
        }

        this.loading = true;
        const uploadButton = this.shadowRoot.querySelector('.upload-button');
        if (uploadButton) {
            uploadButton.textContent = 'Uploading...';
        }

        try {
            const fileType = file.name.split('.').pop().toLowerCase();

            if (fileType === 'gltf') {
                // Handle GLTF with binary file
                const binFile = await new Promise(resolve => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.bin';
                    input.onchange = e => resolve(e.target.files[0]);
                    input.click();
                });

                if (!binFile) {
                    throw new Error('Binary file required for GLTF');
                }

                // Store both files in IndexedDB
                const [gltfUrl, binUrl] = await Promise.all([this.storeModelFile(file), this.storeModelFile(binFile)]);

                // Store the main URL
                this.modelUrl = gltfUrl;

                // Create URL map for the binary file
                const binFileName = file.name.replace('.gltf', '.bin');
                const urlMap = {
                    [binFileName]: binUrl,
                };

                // Load the model using stored URL
                this.sendUpdates();
                await this.loadModelFromUrl(gltfUrl, fileType);
            } else {
                // Handle single file formats (GLB, OBJ)
                const url = await this.storeModelFile(file);
                this.modelUrl = url;
                this.sendUpdates();
                await this.loadModelFromUrl(url, fileType);
            }
        } catch (error) {
            this.error = `Upload failed: ${error.message}`;
        } finally {
            this.loading = false;
            if (uploadButton) {
                uploadButton.textContent = 'Upload 3D Model';
            }
            this.requestUpdate();
        }
    }

    firstUpdated() {
        this.bindResizeEvents();
    }

    bindResizeEvents() {
        // Add event listener to the shadowRoot instead of the component itself
        this.shadowRoot.addEventListener('mousedown', e => {
            if (e.target.classList.contains('resize-handle')) {
                this.isDragging = true;
                this.currentResizeHandle = e.target;
                this.startY = e.clientY;
                this.startHeight = this.height;
                e.preventDefault();
            }
        });

        // Mouse move event for resizing
        document.addEventListener('mousemove', this.handleMouseMove);

        // Mouse up event to stop resizing
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    handleMouseMove = e => {
        if (!this.isDragging) return;

        const deltaY = e.clientY - this.startY;
        let newHeight;

        if (this.currentResizeHandle.classList.contains('bottom-handle')) {
            newHeight = this.startHeight + deltaY;
        } else if (this.currentResizeHandle.classList.contains('top-handle')) {
            newHeight = this.startHeight - deltaY;
        }

        // Ensure height stays within reasonable bounds
        newHeight = Math.min(Math.max(this.MIN_HEIGHT, newHeight), this.MAX_HEIGHT);
        this.height = newHeight;
        this.updateContainerHeight();
    };

    handleMouseUp = () => {
        if (this.isDragging) {
            this.isDragging = false;
            this.currentResizeHandle = null;
            this.sendUpdates();
        }
    };

    changeSize(newHeight) {
        this.height = Math.min(Math.max(this.MIN_HEIGHT, newHeight), this.MAX_HEIGHT);
        this.updateContainerHeight();
        this.sendUpdates();
    }

    updateContainerHeight() {
        const container = this.shadowRoot.querySelector('.viewer-container');
        if (container) {
            container.style.height = `${this.height}px`;
            if (this.camera) {
                this.camera.aspect = container.clientWidth / this.height;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(container.clientWidth, this.height);
            }
        }
    }

    render() {
        return html`
            <div class="viewer-container ${this.loading ? 'loading' : ''}" style="height: ${this.height}px;">
                ${this.model
                    ? html`
                          <div class="resize-handle top-handle"></div>
                          <div class="resize-handle bottom-handle"></div>
                      `
                    : ''}
                ${!this.model
                    ? html`
                          <div class="upload-area" @click=${() => this.shadowRoot.querySelector('#file-input').click()}>
                              <input type="file" id="file-input" accept=".glb" @change=${this.handleFileSelect} />
                              <button class="upload-button">Upload 3D Model</button>
                              <div>Supported formats: GLB</div>
                          </div>
                      `
                    : ''}
                ${this.error ? html`<div class="error">${this.error}</div>` : ''}
            </div>
        `;
    }

    getTextContent() {
        return {
            html: '',
            text: '',
            markdown: this.modelUrl ? `[3D Model: ${this.modelUrl}]` : '',
        };
    }

    async connectedCallback() {
        super.connectedCallback();
        await threeReady;
        this.initThreeJS();
        window.addEventListener('wisk-theme-changed', this._handleThemeChange.bind(this));
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('wisk-theme-changed', this._handleThemeChange.bind(this));

        // Remove resize event listeners
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);

        // Clean up any object URLs
        if (this._currentObjectUrl) {
            URL.revokeObjectURL(this._currentObjectUrl);
        }

        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.controls) {
            this.controls.dispose();
        }
    }

    _handleThemeChange(event) {
        this._theme = event.detail.theme;
        this.requestUpdate();
    }

    async initThreeJS() {
        await threeReady;
        console.log('Initializing Three.js');
        const container = this.shadowRoot.querySelector('.viewer-container');
        container.style.height = `${this.height}px`;

        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this._theme['--bg-1']);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / this.height, 0.1, 1000);
        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, this.height);
        const existingCanvas = container.querySelector('canvas');
        if (existingCanvas) {
            container.removeChild(existingCanvas);
        }
        container.appendChild(this.renderer.domElement);

        // Enhanced controls setup
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = true; // Enable screen space panning
        this.controls.enablePan = true; // Enable panning
        this.controls.panSpeed = 1.0; // Adjust pan speed
        this.controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.PAN,
        };
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.DOLLY,
        };
        this.controls.target.set(0, 0, 0);
        this.controls.update();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(ambientLight, directionalLight);

        // Handle window resize
        const handleResize = () => {
            const newWidth = container.clientWidth;
            this.camera.aspect = newWidth / this.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(newWidth, this.height);
        };

        window.addEventListener('resize', handleResize);
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);

        // Start animation loop
        this.animate();

        console.log('Three.js initialized', this.modelUrl);
        if (this.modelUrl) {
            console.log('Loading model from URL:', this.modelUrl);
            const fileType = this.modelUrl.split('.').pop().toLowerCase();
            await this.loadModelFromUrl(this.modelUrl, fileType);
        }
    }

    animate() {
        if (!this.renderer) return;

        requestAnimationFrame(() => this.animate());
        if (this.controls) {
            this.controls.update();
        }
        if (this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    setValue(path, value) {
        if (!value || typeof value !== 'object') return;

        if (value.modelUrl !== undefined && value.modelUrl !== this.modelUrl) {
            console.log('Setting model URL: three', value.modelUrl);
            this.modelUrl = value.modelUrl;
            if (this.modelUrl) {
                // Load the model from the stored URL
                const fileType = this.modelUrl.split('.').pop().toLowerCase();
                this.initThreeJS().then(() => {
                    this.loadModelFromUrl(this.modelUrl, fileType);
                });
            }
            this.requestUpdate();
        }

        if (value.height !== undefined && value.height !== this.height) {
            this.height = value.height;
            this.updateContainerHeight();
        }
    }

    getValue() {
        return {
            modelUrl: this.modelUrl || '',
            height: this.height,
        };
    }

    sendUpdates() {
        setTimeout(() => {
            wisk.editor.justUpdates(this.id);
        }, 0);
    }
}

customElements.define('three-viewer-element', ThreeViewerElement);
