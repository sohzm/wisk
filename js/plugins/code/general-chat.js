import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class GeneralChat extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            scroll-behavior: smooth;
        }
        .container {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .tabs {
            display: flex;
            background-color: var(--bg-1);
            border-bottom: 1px solid var(--border-1);
        }
        .add-ppl {
            width: 100%;
            max-width: 500px;
            margin: auto;
            border: 1px solid var(--border-1);
            border-radius: var(--radius-large);
        }
        .tab {
            padding: var(--padding-3) var(--padding-4);
            cursor: pointer;
            color: var(--fg-2);
            border-bottom: 2px solid transparent;
            transition: all 0.2s ease;
        }
        .tab.active {
            color: var(--fg-1);
            border-bottom: 2px solid var(--fg-blue);
        }
        .chat-container {
            flex: 1;
            overflow-y: auto;
            background-color: var(--bg-1);
            padding: var(--padding-4);
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
        }
        .video-container {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .video-participants {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--padding-4);
            position: relative;
            overflow: auto;
            flex: 1;
            padding: var(--padding-4);
        }
        .video-participant {
            background-color: var(--bg-3);
            border-radius: var(--radius-large);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            border: 1px solid var(--border-1);
            max-height: 300px;
        }
        .participant-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .participant-name {
            position: absolute;
            bottom: var(--padding-3);
            left: var(--padding-3);
            color: var(--fg-accent);
            background-color: var(--bg-accent);
            font-size: 14px;
            padding: var(--padding-w1);
            border-radius: var(--radius);
            opacity: 0;
        }
        .video-participant:hover .participant-name {
            opacity: 1;
        }
        .message {
            display: flex;
            gap: var(--gap-2);
            align-items: flex-start;
        }
        .message.sent {
            flex-direction: row-reverse;
        }
        .message-bubble {
            background-color: var(--bg-3);
            padding: var(--padding-3);
            border-radius: var(--radius);
            max-width: 70%;
            font-size: 14px;
            color: var(--fg-1);
            white-space: break-spaces;
        }
        .message.sent .message-bubble {
            background-color: var(--bg-blue);
            color: var(--fg-blue);
        }
        .input-container {
            padding: var(--padding-4);
            background-color: var(--bg-1);
            display: flex;
        }
        .input-wrapper {
            display: flex;
            align-items: stretch;
            width: 100%;
        }
        .input-textarea {
            flex: 1;
            padding: var(--padding-3);
            border-radius: var(--radius);
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            border: 1px solid var(--border-1);
            border-right: none;
            background-color: var(--bg-3);
            color: var(--fg-1);
            font-size: 14px;
            resize: none;
            outline: none;
            display: flex;
            max-height: 200px;
            overflow: auto;
        }
        .send-button {
            padding: var(--padding-3);
            background-color: var(--bg-3);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            border-top-left-radius: 0;
            cursor: pointer;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom-left-radius: 0;
            border-left: none;
        }
        .video-controls {
            display: flex;
            gap: var(--gap-2);
            padding: var(--padding-4);
            border-radius: var(--radius);
            align-items: center;
            justify-content: center;
        }
        .control-button {
            padding: var(--padding-4);
            border-radius: 50%;
            border: none;
            cursor: pointer;
            background-color: var(--bg-3);
            color: var(--fg-1);
            width: 54px;
            height: 54px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        .control-button.end-call {
            background-color: #ff4444;
            color: white;
        }
        .control-button.disabled {
            background-color: var(--bg-2);
            cursor: not-allowed;
        }
        .control-button:hover {
            filter: brightness(0.9);
        }
        .join-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--gap-4);
            height: 100%;
        }
        .join-button {
            padding: var(--padding-3) var(--padding-4);
            background-color: var(--fg-accent);
            color: var(--bg-accent);
            border: 2px solid var(--fg-accent);
            border-radius: var(--radius);
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
        }

        .join-button:hover {
            color: var(--fg-accent);
            background-color: var(--bg-accent);
        }

        .info {
            margin: var(--padding-4);
            border: 1px solid var(--border-1);
            border-radius: var(--radius-large);
            padding: var(--padding-4);
            font-size: 0.9em;
            color: var(--fg-2);
            max-width: 400px;
        }

        .filter-select {
            padding: var(--padding-2);
            border-radius: var(--radius);
            background-color: var(--bg-3);
            color: var(--fg-1);
            border: 1px solid var(--border-1);
            outline: none;
            font-size: 14px;
        }

        .hidden-canvas {
            display: none;
        }

        .more {
            position: absolute;
            right: 50%;
            top: 50%;
            transform: translate(50%, -50%);
            padding: var(--padding-3);
            cursor: pointer;
            color: var(--fg-2);
            display: none;
            background-color: var(--bg-1);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            min-width: 100px;
            flex-direction: column;
            gap: var(--gap-3);
            min-width: 250px;
            filter: var(--drop-shadow) var(--drop-shadow) var(--drop-shadow);
            display: none;
        }

        .show-more {
            display: flex;
        }

        .more-horz {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .close-more {
            cursor: pointer;
            color: var(--fg-2);
            background-color: transparent;
            outline: none;
            border: none;
            padding: 0;
            color: var(--fg-2);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        [contenteditable='true']:empty:before {
            content: attr(placeholder);
            pointer-events: none;
            display: block; /* For Firefox */
        }

        @media (hover: hover) {
            *::-webkit-scrollbar {
                width: 15px;
            }
            *::-webkit-scrollbar-track {
                background: var(--bg-1);
            }
            *::-webkit-scrollbar-thumb {
                background-color: var(--bg-3);
                border-radius: 20px;
                border: 4px solid var(--bg-1);
            }
            *::-webkit-scrollbar-thumb:hover {
                background-color: var(--fg-1);
            }
        }
    `;

    static properties = {
        activeTab: { type: String },
        messages: { type: Array },
        participants: { type: Array },
        isJoined: { type: Boolean },
        localStream: { type: Object },
        peerConnections: { type: Object },
        wsConnection: { type: Object },
        isCameraOn: { type: Boolean },
        isMicOn: { type: Boolean },
        currentFilter: { type: String },
        processedStream: { type: Object },
    };

    constructor() {
        super();
        this.activeTab = 'video';
        this.messages = [];
        this.participants = [];
        this.isJoined = false;
        this.isCameraOn = true;
        this.isMicOn = true;
        this.peerConnections = new Map();
        this.localStream = null;
        this.ws = null;
        this.u = '';
        this.userId = '';

        // Configuration for WebRTC
        this.rtcConfig = {
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        };

        this.currentFilter = 'none';
        this.processedStream = null;
        this.videoProcessor = null;
        this.canvas = null;
        this.ctx = null;
    }

    async setUser() {
        this.u = await document.getElementById('auth').getUserInfo();
        this.userId = this.u.email;
    }

    applyGrayscale() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    applySepia() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
            data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
            data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    applyBrightness() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const brightness = 1.3;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * brightness);
            data[i + 1] = Math.min(255, data[i + 1] * brightness);
            data[i + 2] = Math.min(255, data[i + 2] * brightness);
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    applyVignette() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.height / 3,
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.height
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    applyInvert() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    applyDuotone() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg < 128 ? 0 : 255; // Red channel
            data[i + 1] = avg < 128 ? 0 : 130; // Green channel
            data[i + 2] = avg < 128 ? 255 : 0; // Blue channel
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    applyPixelate() {
        const pixelSize = 8;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        tempCtx.drawImage(this.canvas, 0, 0);

        // Pixelate
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < this.canvas.height; y += pixelSize) {
            for (let x = 0; x < this.canvas.width; x += pixelSize) {
                const imageData = tempCtx.getImageData(x, y, pixelSize, pixelSize);
                const data = imageData.data;
                let r = 0,
                    g = 0,
                    b = 0;

                // Get average color
                for (let i = 0; i < data.length; i += 4) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                }

                r = r / (pixelSize * pixelSize);
                g = g / (pixelSize * pixelSize);
                b = b / (pixelSize * pixelSize);

                this.ctx.fillStyle = `rgb(${r},${g},${b})`;
                this.ctx.fillRect(x, y, pixelSize, pixelSize);
            }
        }
    }

    applyRainbow() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const time = Date.now() / 1000;

        for (let y = 0; y < this.canvas.height; y++) {
            const hue = ((y / this.canvas.height) * 360 + time * 50) % 360;
            for (let x = 0; x < this.canvas.width; x++) {
                const i = (y * this.canvas.width + x) * 4;
                const [r, g, b] = this.hslToRgb(hue / 360, 0.5, 0.5);
                data[i] = (data[i] + r) / 2;
                data[i + 1] = (data[i + 1] + g) / 2;
                data[i + 2] = (data[i + 2] + b) / 2;
            }
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    applyGlitch() {
        const sliceHeight = 10;
        const numSlices = Math.floor(this.canvas.height / sliceHeight);
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        tempCtx.drawImage(this.canvas, 0, 0);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < numSlices; i++) {
            const y = i * sliceHeight;
            const offset = Math.random() * 20 - 10;
            const rgb = [Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10];

            const imageData = tempCtx.getImageData(0, y, this.canvas.width, sliceHeight);
            const data = imageData.data;

            // Color shift
            for (let j = 0; j < data.length; j += 4) {
                data[j] = Math.max(0, Math.min(255, data[j] + rgb[0]));
                data[j + 1] = Math.max(0, Math.min(255, data[j + 1] + rgb[1]));
                data[j + 2] = Math.max(0, Math.min(255, data[j + 2] + rgb[2]));
            }

            this.ctx.putImageData(imageData, offset, y);
        }
    }

    applyVintage() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Sepia
            data[i] = r * 0.393 + g * 0.769 + b * 0.189;
            data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
            data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;

            // Add noise
            const noise = (Math.random() - 0.5) * 50;
            data[i] += noise;
            data[i + 1] += noise;
            data[i + 2] += noise;

            // Ensure values stay within bounds
            data[i] = Math.min(255, Math.max(0, data[i]));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1]));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2]));
        }
        this.ctx.putImageData(imageData, 0, 0);

        // Add vignette
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            Math.max(this.canvas.width, this.canvas.height) / 2
        );
        gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    async handleFilterChange(event) {
        this.currentFilter = event.target.value;
        this.requestUpdate();
    }

    async setupVideoProcessing(stream) {
        // Create canvas for video processing
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        // Get video dimensions from the stream
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        this.canvas.width = settings.width;
        this.canvas.height = settings.height;

        // Create a video element to draw from
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.playsInline = true;

        // Process video frames
        const processFrame = () => {
            if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                // Draw the video frame to canvas
                this.ctx.drawImage(videoElement, 0, 0, this.canvas.width, this.canvas.height);

                // Apply filters based on currentFilter
                switch (this.currentFilter) {
                    case 'grayscale':
                        this.applyGrayscale();
                        break;
                    case 'sepia':
                        this.applySepia();
                        break;
                    case 'brightness':
                        this.applyBrightness();
                        break;
                    case 'vignette':
                        this.applyVignette();
                        break;
                    case 'invert':
                        this.applyInvert();
                        break;
                    case 'duotone':
                        this.applyDuotone();
                        break;
                    case 'pixelate':
                        this.applyPixelate();
                        break;
                    case 'rainbow':
                        this.applyRainbow();
                        break;
                    case 'glitch':
                        this.applyGlitch();
                        break;
                    case 'vintage':
                        this.applyVintage();
                        break;
                    case 'cyberpunk':
                        this.applyCyberpunk();
                        break;
                    case 'noise':
                        this.applyNoise();
                        break;
                    case 'underwater':
                        this.applyUnderwater();
                        break;
                    case 'nightvision':
                        this.applyNightvision();
                        break;
                    case 'thermal':
                        this.applyThermal();
                        break;
                    default:
                        break;
                }
            }
            this.videoProcessor = requestAnimationFrame(processFrame);
        };

        videoElement.onloadedmetadata = () => {
            videoElement.play();
            processFrame();
        };

        // Create a processed stream from the canvas
        this.processedStream = this.canvas.captureStream(30); // 30 FPS

        // Add audio tracks from original stream to processed stream
        stream.getAudioTracks().forEach(track => {
            this.processedStream.addTrack(track);
        });

        return this.processedStream;
    }

    opened() {
        this.setUser();
    }

    toggleCamera() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                this.isCameraOn = videoTrack.enabled;
                this.requestUpdate();
            }
        }
    }

    toggleMic() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                this.isMicOn = audioTrack.enabled;
                this.requestUpdate();
            }
        }
    }

    switchTab(tab) {
        this.activeTab = tab;
    }

    applyCyberpunk() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Enhance blues and pinks
            if (data[i + 2] > data[i] && data[i + 2] > data[i + 1]) {
                data[i + 2] *= 1.2; // Enhance blue
                data[i] *= 1.1; // Add some red
            }
            // Add pink/purple tint
            if (data[i] > data[i + 1]) {
                data[i] *= 1.2; // Enhance red
                data[i + 2] *= 1.1; // Add some blue
            }

            // Add slight bloom effect
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            if (brightness > 200) {
                data[i] = Math.min(255, data[i] * 1.2);
                data[i + 1] = Math.min(255, data[i + 1] * 1.2);
                data[i + 2] = Math.min(255, data[i + 2] * 1.2);
            }
        }
        this.ctx.putImageData(imageData, 0, 0);

        // Add scan lines
        for (let y = 0; y < this.canvas.height; y += 3) {
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            this.ctx.fillRect(0, y, this.canvas.width, 1);
        }
    }

    applyNoise() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const intensity = 30;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * intensity;
            data[i] += noise;
            data[i + 1] += noise;
            data[i + 2] += noise;

            // Ensure values stay within bounds
            data[i] = Math.min(255, Math.max(0, data[i]));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1]));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2]));
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    applyUnderwater() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Reduce red (underwater absorption)
            data[i] *= 0.7;
            // Enhance blue and green
            data[i + 1] *= 1.1;
            data[i + 2] *= 1.2;
        }
        this.ctx.putImageData(imageData, 0, 0);

        // Add ripple effect
        const time = Date.now() / 1000;
        this.ctx.fillStyle = 'rgba(0, 150, 255, 0.1)';
        for (let y = 0; y < this.canvas.height; y += 20) {
            const offset = Math.sin(y * 0.04 + time) * 5;
            this.ctx.fillRect(0, y + offset, this.canvas.width, 10);
        }
    }

    applyNightvision() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Convert to green-tinted grayscale
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg * 0.1; // Almost no red
            data[i + 1] = avg * 1.5; // Enhanced green
            data[i + 2] = avg * 0.1; // Almost no blue
        }
        this.ctx.putImageData(imageData, 0, 0);

        // Add noise
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const brightness = Math.random() * 255;
            this.ctx.fillStyle = `rgba(0, ${brightness}, 0, 0.1)`;
            this.ctx.fillRect(x, y, 1, 1);
        }

        // Add vignette
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.width / 1.5
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    applyThermal() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

            // Create thermal color mapping
            if (avg < 64) {
                data[i] = 0; // Red
                data[i + 1] = 0; // Green
                data[i + 2] = avg * 4; // Blue
            } else if (avg < 128) {
                data[i] = 0; // Red
                data[i + 1] = (avg - 64) * 4; // Green
                data[i + 2] = 255 - (avg - 64) * 4; // Blue
            } else if (avg < 192) {
                data[i] = (avg - 128) * 4; // Red
                data[i + 1] = 255; // Green
                data[i + 2] = 0; // Blue
            } else {
                data[i] = 255; // Red
                data[i + 1] = 255 - (avg - 192) * 4; // Green
                data[i + 2] = 0; // Blue
            }
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    // Helper function for rainbow effect
    hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    sendMessage(event) {
        event.preventDefault();
        const textarea = this.shadowRoot.querySelector('.input-textarea');
        const message = textarea.innerText.trim();

        if (!message) return;

        this.messages = [
            ...this.messages,
            {
                id: this.messages.length + 1,
                text: message,
                sender: 'Me',
                sent: true,
            },
        ];

        textarea.innerText = '';
    }

    connectSignalingServer() {
        this.ws = new WebSocket(wisk.editor.wsBackendUrl + '/v2/plugins/call');
        const roomId = wisk.editor.pageId;

        this.ws.onopen = () => {
            // Join room
            this.ws.send(
                JSON.stringify({
                    type: 'join',
                    roomId: roomId,
                    userId: this.userId,
                })
            );
        };

        this.ws.onmessage = async event => {
            const message = JSON.parse(event.data);
            await this.handleSignalingMessage(message);
        };
    }

    async handleSignalingMessage(message) {
        switch (message.type) {
            case 'user-joined':
                await this.handleUserJoined(message.userId);
                break;
            case 'user-left':
                this.handleUserLeft(message.userId);
                break;
            case 'offer':
                await this.handleOffer(message.userId, message.offer);
                break;
            case 'answer':
                await this.handleAnswer(message.userId, message.answer);
                break;
            case 'ice-candidate':
                await this.handleIceCandidate(message.userId, message.candidate);
                break;
        }
    }

    async handleUserJoined(userId) {
        if (userId === this.userId) return;

        const peerConnection = new RTCPeerConnection(this.rtcConfig);
        this.peerConnections.set(userId, peerConnection);

        // Add all local tracks to the peer connection
        this.localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, this.localStream);
        });

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                this.ws.send(
                    JSON.stringify({
                        type: 'ice-candidate',
                        userId: this.userId,
                        targetUserId: userId,
                        candidate: event.candidate,
                    })
                );
            }
        };

        peerConnection.ontrack = event => {
            const existingParticipant = this.participants.find(p => p.id === userId);

            if (!existingParticipant) {
                this.participants = [
                    ...this.participants,
                    {
                        id: userId,
                        name: userId.split('@')[0],
                        stream: event.streams[0],
                    },
                ];
                this.requestUpdate();
            }
        };

        if (this.userId > userId) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            this.ws.send(
                JSON.stringify({
                    type: 'offer',
                    userId: this.userId,
                    targetUserId: userId,
                    offer,
                })
            );
        }
    }

    async handleOffer(userId, offer) {
        const peerConnection = new RTCPeerConnection(this.rtcConfig);
        this.peerConnections.set(userId, peerConnection);

        this.localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, this.localStream);
        });

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                this.ws.send(
                    JSON.stringify({
                        type: 'ice-candidate',
                        userId: this.userId,
                        targetUserId: userId,
                        candidate: event.candidate,
                    })
                );
            }
        };

        peerConnection.ontrack = event => {
            const existingParticipant = this.participants.find(p => p.id === userId);

            if (!existingParticipant) {
                this.participants = [
                    ...this.participants,
                    {
                        id: userId,
                        name: userId.split('@')[0],
                        stream: event.streams[0],
                    },
                ];
                this.requestUpdate();
            }
        };

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        this.ws.send(
            JSON.stringify({
                type: 'answer',
                userId: this.userId,
                targetUserId: userId,
                answer,
            })
        );
    }

    async handleAnswer(userId, answer) {
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    async handleIceCandidate(userId, candidate) {
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    handleUserLeft(userId) {
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection) {
            peerConnection.close();
            this.peerConnections.delete(userId);
        }

        this.participants = this.participants.filter(p => p.id !== userId);
        this.requestUpdate();
    }

    async joinCall() {
        try {
            // Get user media
            const originalStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            // Process the video stream with filters
            this.localStream = await this.setupVideoProcessing(originalStream);

            // Add local video
            this.participants = [
                ...this.participants,
                {
                    id: 'local',
                    name: 'You',
                    stream: this.localStream,
                },
            ];

            // Connect to signaling server
            this.connectSignalingServer();
            this.isJoined = true;
            this.requestUpdate();
        } catch (err) {
            console.error('Error joining call:', err);
            alert('Error joining call: ' + err.message);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.videoProcessor) {
            cancelAnimationFrame(this.videoProcessor);
        }
    }

    endCall() {
        if (this.videoProcessor) {
            cancelAnimationFrame(this.videoProcessor);
        }
        // Previous endCall logic remains the same
        if (this.ws) {
            this.ws.send(
                JSON.stringify({
                    type: 'leave',
                    roomId: wisk.editor.pageId,
                    userId: this.userId,
                })
            );
            this.ws.close();
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }

        this.peerConnections.forEach(pc => pc.close());
        this.peerConnections.clear();
        this.participants = [];
        this.isJoined = false;
        this.localStream = null;
        this.processedStream = null;
        this.ws = null;
        this.requestUpdate();
    }

    render() {
        return html`
            <div class="container">
                <div class="tabs">
                    <div class="tab ${this.activeTab === 'text' ? 'active' : ''}" style="display: none" @click=${() => this.switchTab('text')}>
                        Text Chat
                    </div>
                    <div class="tab ${this.activeTab === 'video' ? 'active' : ''}" @click=${() => this.switchTab('video')}>Video Call</div>
                </div>

                ${this.activeTab === 'text'
                    ? html`
                          <div class="chat-container">
                              ${this.messages.length === 0
                                  ? html` <p style="margin: auto; text-align: center">No messages yet<br />Add friends and start talking</p> `
                                  : html``}
                              ${this.messages.map(
                                  message => html`
                                      <div class="message ${message.sent ? 'sent' : ''}">
                                          <div class="message-bubble">
                                              ${!message.sent ? html`<strong>${message.sender}:</strong> ` : ''}${message.text}
                                          </div>
                                      </div>
                                  `
                              )}
                          </div>
                          <div class="input-container">
                              <div class="input-wrapper">
                                  <div
                                      class="input-textarea"
                                      placeholder="Type a message..."
                                      @keyup=${e => {
                                          if (e.target.innerHTML.trim() === '<br>') {
                                              e.target.innerHTML = '';
                                          }
                                      }}
                                      @keydown=${e => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                              this.sendMessage(e);
                                          }
                                          if (e.target.innerHTML.trim() === '<br>') {
                                              e.target.innerHTML = '';
                                          }
                                      }}
                                      contenteditable="true"
                                  ></div>
                                  <button class="send-button" @click=${this.sendMessage}>
                                      <img src="/a7/plugins/general-chat/up.svg" style="filter: var(--themed-svg); width: 24px;" />
                                  </button>
                              </div>
                          </div>
                      `
                    : html`
                          <div class="video-container">
                              ${!this.isJoined
                                  ? html`
                            <div class="join-container">
                                <button class="join-button" @click=${this.joinCall}>
                                    Join Video Call
                                </button>

                                <div class="info">
                                    <div style="margin-bottom: var(--padding-4);">
                                        <p><strong>How it works</strong></p>
                                        <p>Click the button above to join the video call.</p>
                                        <p>Make sure to allow camera and microphone access.</p>
                                    </div>

                                    <div>
                                        <p><strong>Share this page</strong></p>
                                        <p>Anyone you add as editors to this page can join the call. You can do that from the "Share" in navigation bar.</p>
                                    </div>
                                </div>

                                </div>
                            </div>
                        `
                                  : html`
                                        <div class="video-participants">
                                            ${this.participants.map(
                                                participant => html`
                                                    <div
                                                        class="video-participant ${participant.id === 'local'
                                                            ? `local-video ${this.currentFilter}`
                                                            : ''}"
                                                    >
                                                        <video
                                                            id="${participant.id}-video"
                                                            class="participant-video"
                                                            ?muted=${participant.id === 'local'}
                                                            autoplay
                                                            playsinline
                                                            .srcObject=${participant.stream}
                                                        ></video>
                                                        <span class="participant-name">${participant.name}</span>
                                                    </div>
                                                `
                                            )}
                                        </div>

                                        <div class="video-controls">
                                            <button class="control-button ${!this.localStream ? 'disabled' : ''}" @click=${this.toggleCamera}>
                                                <img
                                                    src=${this.isCameraOn
                                                        ? '/a7/plugins/general-chat/cam-on.svg'
                                                        : '/a7/plugins/general-chat/cam-off.svg'}
                                                    style="filter: var(--themed-svg)"
                                                />
                                            </button>
                                            <button class="control-button ${!this.localStream ? 'disabled' : ''}" @click=${this.toggleMic}>
                                                <img
                                                    src=${this.isMicOn
                                                        ? '/a7/plugins/general-chat/mic-on.svg'
                                                        : '/a7/plugins/general-chat/mic-off.svg'}
                                                    style="filter: var(--themed-svg)"
                                                />
                                            </button>
                                            <button class="control-button end-call" @click=${this.endCall}>
                                                <img src="/a7/plugins/general-chat/phone-exit.svg" style="filter: invert(1)" />
                                            </button>

                                            <button class="control-button" @click=${this.toggleMore}>
                                                <img src="/a7/plugins/general-chat/more.svg" style="filter: var(--themed-svg)" />
                                            </button>
                                        </div>

                                        <div class="more">
                                            <div class="more-horz">
                                                <h3>Video Settings</h3>
                                                <button class="close-more" @click=${this.toggleMore}>close</button>
                                            </div>

                                            <div class="more-horz">
                                                <label>Filter</label>
                                                <select class="filter-select" @change=${this.handleFilterChange} .value=${this.currentFilter}>
                                                    <option value="none">No Filter</option>
                                                    <option value="grayscale">Grayscale</option>
                                                    <option value="sepia">Sepia</option>
                                                    <option value="brightness">Brightness</option>
                                                    <option value="vignette">Vignette</option>
                                                    <option value="invert">Invert</option>
                                                    <option value="duotone">Duotone</option>
                                                    <option value="pixelate">Pixelate</option>
                                                    <option value="rainbow">Rainbow</option>
                                                    <option value="glitch">Glitch</option>
                                                    <option value="vintage">Vintage</option>
                                                    <option value="cyberpunk">Cyberpunk</option>
                                                    <option value="noise">Noise</option>
                                                    <option value="scanlines">Scanlines</option>
                                                    <option value="underwater">Underwater</option>
                                                    <option value="nightvision">Night Vision</option>
                                                    <option value="thermal">Thermal</option>
                                                </select>
                                            </div>
                                        </div>
                                    `}
                          </div>
                      `}
            </div>
        `;
    }

    toggleMore() {
        this.shadowRoot.querySelector('.more').classList.toggle('show-more');
    }
}

customElements.define('general-chat', GeneralChat);
