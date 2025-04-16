import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class MusicMaker extends LitElement {
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
        .sequencer-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
        }
        .track-row {
            display: flex;
            gap: 8px;
            align-items: stretch;
            height: 60px;
        }
        .track-label {
            width: 90px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            color: var(--fg-1);
            font-weight: 500;
            font-size: 16px;
        }
        .track-steps {
            flex: 1;
            display: flex;
            gap: 4px;
        }
        .step {
            flex: 1;
            background: var(--bg-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            cursor: pointer;
            transition: all 0.1s ease;
        }
        .step.active {
            background: var(--fg-1);
            border-color: var(--fg-2);
        }
        .step.playing {
            background: var(--text-3);
        }
        .controls {
            display: flex;
            gap: 16px;
            margin-bottom: 16px;
            padding: 16px;
            background: var(--bg-2);
            border-radius: var(--radius);
            align-items: center;
            flex-wrap: wrap;
        }
        button {
            padding: 8px 16px;
            background: var(--bg-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            color: var(--fg-1);
            cursor: pointer;
            font-size: 14px;
            min-width: 80px;
        }
        button:hover {
            background: var(--bg-3);
        }
        button.playing {
            background: var(--fg-1);
            color: var(--bg-1);
        }
        .slider-control {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            min-width: 200px;
        }
        .slider-control label {
            font-size: 14px;
            color: var(--fg-1);
        }
        .slider-wrapper {
            flex: 1;
            position: relative;
        }
        input[type='range'] {
            -webkit-appearance: none;
            width: 100%;
            height: 6px;
            background: var(--bg-3);
            border-radius: 3px;
            outline: none;
        }
        input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            background: var(--fg-1);
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid var(--border-1);
            transition: all 0.2s ease;
        }
        input[type='range']::-webkit-slider-thumb:hover {
            background: var(--fg-2);
        }
        .value-display {
            font-size: 14px;
            color: var(--fg-2);
            min-width: 60px;
            text-align: right;
        }
    `;

    static properties = {
        tracks: { type: Array },
        playing: { type: Boolean },
        currentStep: { type: Number },
        tempo: { type: Number },
        stepCount: { type: Number },
    };

    constructor() {
        super();
        this.tracks = [
            { name: 'Kick', pattern: new Array(16).fill(false) },
            { name: 'Snare', pattern: new Array(16).fill(false) },
            { name: 'Hi-hat', pattern: new Array(16).fill(false) },
            { name: 'Clap', pattern: new Array(16).fill(false) },
        ];
        this.playing = false;
        this.currentStep = 0;
        this.tempo = 120;
        this.stepCount = 16;
        this.intervalId = null;
    }

    handleStepCountChange(e) {
        const newStepCount = parseInt(e.target.value);
        // Update each track's pattern array
        this.tracks = this.tracks.map(track => ({
            ...track,
            pattern:
                track.pattern.length < newStepCount
                    ? [...track.pattern, ...new Array(newStepCount - track.pattern.length).fill(false)]
                    : track.pattern.slice(0, newStepCount),
        }));
        this.stepCount = newStepCount;
        this.sendUpdates();
    }

    connectedCallback() {
        super.connectedCallback();
        // Initialize Web Audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.initializeSounds();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.stop();
    }

    async initializeSounds() {
        // Simple oscillator-based sounds
        this.sounds = {
            Kick: await this.createKickSound(),
            Snare: await this.createSnareSound(),
            'Hi-hat': await this.createHihatSound(),
            Clap: await this.createClapSound(),
        };
    }

    handleTempoChange(e) {
        this.tempo = parseInt(e.target.value);
        if (this.playing) {
            this.stop();
            this.play();
        }
        this.sendUpdates();
    }

    async createKickSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.frequency.value = 100;
        oscillator.type = 'sawtooth';
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        return { oscillator, gainNode };
    }

    async createSnareSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.frequency.value = 200;
        oscillator.type = 'square';
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        return { oscillator, gainNode };
    }

    async createHihatSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.frequency.value = 1000;
        oscillator.type = 'square';
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        return { oscillator, gainNode };
    }

    async createClapSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.frequency.value = 300;
        oscillator.type = 'triangle';
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        return { oscillator, gainNode };
    }

    playSound(trackName) {
        const sound = this.sounds[trackName];
        if (sound) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.frequency.value = sound.oscillator.frequency.value;
            oscillator.type = sound.oscillator.type;
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start();
            gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

            setTimeout(() => {
                oscillator.stop();
                oscillator.disconnect();
                gainNode.disconnect();
            }, 100);
        }
    }

    toggleStep(trackIndex, stepIndex) {
        this.tracks[trackIndex].pattern[stepIndex] = !this.tracks[trackIndex].pattern[stepIndex];
        if (this.tracks[trackIndex].pattern[stepIndex]) {
            this.playSound(this.tracks[trackIndex].name);
        }
        this.requestUpdate();
        this.sendUpdates();
    }

    play() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.playing = true;
        const stepTime = 60000 / this.tempo / 4;

        this.intervalId = setInterval(() => {
            this.tracks.forEach((track, trackIndex) => {
                if (track.pattern[this.currentStep]) {
                    this.playSound(track.name);
                }
            });

            this.currentStep = (this.currentStep + 1) % this.stepCount;
            this.requestUpdate();
        }, stepTime);
    }

    stop() {
        this.playing = false;
        this.currentStep = 0;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.requestUpdate();
    }

    handleTempoChange(e) {
        this.tempo = parseInt(e.target.value);
        if (this.playing) {
            this.stop();
            this.play();
        }
    }

    sendUpdates() {
        setTimeout(() => {
            wisk.editor.justUpdates(this.id);
        }, 0);
    }

    handleAudioLengthChange(e) {
        this.audioLength = parseInt(e.target.value);
        this.sendUpdates();
    }

    setValue(path, value) {
        if (value.tracks) {
            this.tracks = value.tracks;
        }
        if (value.tempo) {
            this.tempo = value.tempo;
        }
        if (value.stepCount) {
            this.stepCount = value.stepCount;
        }
        this.requestUpdate();
    }

    getValue() {
        return {
            tracks: this.tracks,
            tempo: this.tempo,
            stepCount: this.stepCount,
        };
    }

    togglePlaying() {
        if (this.playing) {
            this.stop();
        } else {
            this.play();
        }
    }

    render() {
        return html`
            <div class="controls">
                <button @click="${this.togglePlaying}" class="${this.playing ? 'playing' : ''}">${this.playing ? 'Stop' : 'Play'}</button>

                <div class="slider-control">
                    <label>Tempo</label>
                    <div class="slider-wrapper">
                        <input type="range" min="60" max="200" .value="${this.tempo}" @input="${this.handleTempoChange}" />
                    </div>
                    <div class="value-display">${this.tempo} BPM</div>
                </div>

                <div class="slider-control">
                    <label>Steps</label>
                    <div class="slider-wrapper">
                        <input type="range" min="4" max="32" step="4" .value="${this.stepCount}" @input="${this.handleStepCountChange}" />
                    </div>
                    <div class="value-display">${this.stepCount}</div>
                </div>
            </div>

            <div class="sequencer-container">
                ${this.tracks.map(
                    (track, trackIndex) => html`
                        <div class="track-row">
                            <div class="track-label">${track.name}</div>
                            <div class="track-steps">
                                ${track.pattern
                                    .slice(0, this.stepCount)
                                    .map(
                                        (active, stepIndex) => html`
                                            <div
                                                class="step ${active ? 'active' : ''} ${this.currentStep === stepIndex && this.playing
                                                    ? 'playing'
                                                    : ''}"
                                                @click="${() => this.toggleStep(trackIndex, stepIndex)}"
                                            ></div>
                                        `
                                    )}
                            </div>
                        </div>
                    `
                )}
            </div>
        `;
    }
}

customElements.define('music-maker', MusicMaker);
