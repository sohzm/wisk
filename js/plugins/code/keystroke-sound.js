import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class KeystrokeSound extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font-mono);
            margin: 0px;
            padding: 0px;
        }
        .sound-container {
            background: var(--bg-blue);
            padding: 10px;
            border-radius: 8px;
            display: flex;
            gap: 8px;
            align-items: center;
        }
        select {
            background: var(--bg-default);
            color: var(--fg-default);
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid var(--bg-subtle);
            cursor: pointer;
        }
    `;

    static properties = {
        soundType: { type: String },
    };

    constructor() {
        super();
        this.soundType = 'typewriter';
        this.audioContext = null;
        this.setupAudioContext();
    }

    setupAudioContext() {
        const initContext = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            document.removeEventListener('click', initContext);
        };
        document.addEventListener('click', initContext);
    }

    createTypewriterSound() {
        const time = this.audioContext.currentTime;

        // Create deeper reverb for wooden body with enhanced bass
        const reverbLength = 0.4; // Slightly longer reverb for bass
        const reverbBuffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate * reverbLength, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = reverbBuffer.getChannelData(channel);
            for (let i = 0; i < reverbBuffer.length; i++) {
                const progress = i / reverbBuffer.length;
                // Enhanced wooden case resonance with more bass
                channelData[i] =
                    (Math.random() * 2 - 1) *
                    Math.exp(-6 * progress) * // Slower decay for more bass
                    (1 - progress) *
                    (1 +
                        Math.sin(progress * 100) + // Lower frequency resonance
                        Math.sin(progress * 50) * 0.5); // Additional sub-bass resonance
            }
        }

        const convolver = this.audioContext.createConvolver();
        convolver.buffer = reverbBuffer;

        // 1. Key sliding down sound (unchanged)
        const slideBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.03, this.audioContext.sampleRate);
        const slideData = slideBuffer.getChannelData(0);
        for (let i = 0; i < slideBuffer.length; i++) {
            const progress = i / slideBuffer.length;
            slideData[i] = (Math.random() * 2 - 1) * 0.3 * (1 - progress) + Math.sin(progress * 1000) * 0.1 * (1 - progress);
        }

        // 2. Type bar mechanism sound with added weight
        const mechanismBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.04, this.audioContext.sampleRate);
        const mechanismData = mechanismBuffer.getChannelData(0);
        for (let i = 0; i < mechanismBuffer.length; i++) {
            const progress = i / mechanismBuffer.length;
            mechanismData[i] =
                Math.sin(i * 0.5) * 0.3 * (1 - progress) + // Spring vibration
                Math.sin(i * 0.2) * 0.2 * (1 - progress) + // Added low frequency component
                (Math.random() * 2 - 1) * 0.4 * Math.exp(-10 * progress);
        }

        // 3. Impact sound with enhanced bass response
        const impactBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.15, this.audioContext.sampleRate);
        const impactData = impactBuffer.getChannelData(0);
        for (let i = 0; i < impactBuffer.length; i++) {
            const progress = i / impactBuffer.length;
            impactData[i] =
                (Math.random() * 2 - 1) * 0.7 * Math.exp(-30 * progress) + // Sharp impact
                Math.sin(i * 0.1) * 0.5 * Math.exp(-6 * progress) + // Enhanced low wooden resonance
                Math.sin(i * 0.05) * 0.3 * Math.exp(-4 * progress) + // New sub-bass thump
                Math.sin(i * 0.3) * 0.2 * Math.exp(-15 * progress); // Metal ring
        }

        // Create and connect sources
        const slideSource = this.audioContext.createBufferSource();
        const mechanismSource = this.audioContext.createBufferSource();
        const impactSource = this.audioContext.createBufferSource();
        const returnSource = this.audioContext.createBufferSource();

        slideSource.buffer = slideBuffer;
        mechanismSource.buffer = mechanismBuffer;
        impactSource.buffer = impactBuffer;
        returnSource.buffer = impactBuffer;
        returnSource.playbackRate.value = 0.5; // Even deeper return sound

        // Enhanced filters for better bass response
        const slideFilter = this.audioContext.createBiquadFilter();
        slideFilter.type = 'bandpass';
        slideFilter.frequency.value = 2000;
        slideFilter.Q.value = 2;

        const mechanismFilter = this.audioContext.createBiquadFilter();
        mechanismFilter.type = 'peaking';
        mechanismFilter.frequency.value = 600; // Lower frequency peak
        mechanismFilter.Q.value = 2;
        mechanismFilter.gain.value = 4;

        // New bass enhancement filter
        const bassFilter = this.audioContext.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.value = 200;
        bassFilter.gain.value = 6;

        const impactFilter = this.audioContext.createBiquadFilter();
        impactFilter.type = 'lowshelf';
        impactFilter.frequency.value = 300; // Lower frequency boost
        impactFilter.gain.value = 8;

        // Gains with adjusted values
        const slideGain = this.audioContext.createGain();
        slideGain.gain.setValueAtTime(0.15, time);

        const mechanismGain = this.audioContext.createGain();
        mechanismGain.gain.setValueAtTime(0.35, time + 0.02);

        const impactGain = this.audioContext.createGain();
        impactGain.gain.setValueAtTime(0.8, time + 0.05);

        const returnGain = this.audioContext.createGain();
        returnGain.gain.setValueAtTime(0.6, time + 0.12);

        // Adjusted Dry/Wet mix for more presence
        const dryGain = this.audioContext.createGain();
        dryGain.gain.value = 0.7;

        const wetGain = this.audioContext.createGain();
        wetGain.gain.value = 0.5;

        // Connect everything including the new bass filter
        [slideSource, mechanismSource, impactSource, returnSource].forEach(source => {
            source.connect(bassFilter);
            source.connect(dryGain);
            source.connect(convolver);
        });

        bassFilter.connect(this.audioContext.destination);
        convolver.connect(wetGain);
        dryGain.connect(this.audioContext.destination);
        wetGain.connect(this.audioContext.destination);

        // Start all sounds in sequence
        slideSource.start(time);
        mechanismSource.start(time + 0.02);
        impactSource.start(time + 0.05);
        returnSource.start(time + 0.12);
    }

    createMeowSound() {
        const time = this.audioContext.currentTime;
        const duration = 0.8; // Extended duration

        // Create oscillator bank for vocal cords
        const fundamentalOsc = this.audioContext.createOscillator();
        const harmonic1 = this.audioContext.createOscillator();
        const harmonic2 = this.audioContext.createOscillator();

        // Reduced noise for less breathiness
        const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBuffer.length; i++) {
            noiseData[i] = Math.random() * 2 - 1;
        }
        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        // Create formant filters for each vowel sound
        const formantM = this.audioContext.createBiquadFilter();
        const formantE = this.audioContext.createBiquadFilter();
        const formantO = this.audioContext.createBiquadFilter();
        const formantW = this.audioContext.createBiquadFilter();

        [formantM, formantE, formantO, formantW].forEach(filter => {
            filter.type = 'bandpass';
            filter.Q.value = 10;
        });

        // Initial oscillator setup
        fundamentalOsc.type = 'sawtooth';
        harmonic1.type = 'sine';
        harmonic2.type = 'sine';

        // Frequency envelope for distinct M-E-O-W shape
        const mFreq = 200; // Low for 'M'
        const eFreq = 600; // Higher for 'E'
        const oFreq = 400; // Mid for 'O'
        const wFreq = 300; // Lower for 'W'

        // Main pitch envelope with distinct sections
        fundamentalOsc.frequency.setValueAtTime(mFreq, time); // M
        fundamentalOsc.frequency.linearRampToValueAtTime(mFreq, time + 0.1);
        fundamentalOsc.frequency.linearRampToValueAtTime(eFreq, time + 0.25); // E
        fundamentalOsc.frequency.linearRampToValueAtTime(oFreq, time + 0.5); // O
        fundamentalOsc.frequency.linearRampToValueAtTime(wFreq, time + duration); // W

        // Harmonics follow with appropriate ratios
        [harmonic1, harmonic2].forEach((osc, i) => {
            const multiplier = i + 2;
            osc.frequency.setValueAtTime(mFreq * multiplier, time);
            osc.frequency.linearRampToValueAtTime(mFreq * multiplier, time + 0.1);
            osc.frequency.linearRampToValueAtTime(eFreq * multiplier, time + 0.25);
            osc.frequency.linearRampToValueAtTime(oFreq * multiplier, time + 0.5);
            osc.frequency.linearRampToValueAtTime(wFreq * multiplier, time + duration);
        });

        // Formant movements for each phoneme
        // M (nasal resonance)
        formantM.frequency.setValueAtTime(800, time);
        formantM.Q.setValueAtTime(15, time);

        // E (high front vowel)
        formantE.frequency.setValueAtTime(2500, time + 0.1);
        formantE.Q.setValueAtTime(20, time + 0.1);

        // O (back vowel)
        formantO.frequency.setValueAtTime(1000, time + 0.4);
        formantO.Q.setValueAtTime(10, time + 0.4);

        // W (rounded back glide)
        formantW.frequency.setValueAtTime(600, time + 0.6);
        formantW.Q.setValueAtTime(8, time + 0.6);

        // Amplitude envelopes for each section
        const mainGain = this.audioContext.createGain();
        const noiseGain = this.audioContext.createGain();

        // ADSR envelope with distinct sections
        mainGain.gain.setValueAtTime(0, time);
        // M section
        mainGain.gain.linearRampToValueAtTime(0.2, time + 0.1);
        // E section (peak)
        mainGain.gain.linearRampToValueAtTime(0.4, time + 0.25);
        // O section
        mainGain.gain.linearRampToValueAtTime(0.3, time + 0.5);
        // W section (fade)
        mainGain.gain.linearRampToValueAtTime(0, time + duration);

        // Minimal noise for slight breathiness
        noiseGain.gain.setValueAtTime(0, time);
        noiseGain.gain.linearRampToValueAtTime(0.02, time + 0.1);
        noiseGain.gain.linearRampToValueAtTime(0, time + duration);

        // Connect oscillators through all formants
        [fundamentalOsc, harmonic1, harmonic2].forEach(osc => {
            osc.connect(formantM);
            osc.connect(formantE);
            osc.connect(formantO);
            osc.connect(formantW);
        });

        // Mix everything
        const formantGains = [];
        [formantM, formantE, formantO, formantW].forEach((formant, i) => {
            const gain = this.audioContext.createGain();
            formantGains.push(gain);
            formant.connect(gain);
            gain.connect(mainGain);

            // Crossfade between formants
            gain.gain.setValueAtTime(i === 0 ? 1 : 0, time);
            if (i > 0) {
                gain.gain.linearRampToValueAtTime(1, time + i * 0.2);
                if (i < 3) gain.gain.linearRampToValueAtTime(0, time + (i + 1) * 0.2);
            }
        });

        noiseSource.connect(noiseGain);
        mainGain.connect(this.audioContext.destination);
        noiseGain.connect(this.audioContext.destination);

        // Start and stop everything
        [fundamentalOsc, harmonic1, harmonic2].forEach(osc => {
            osc.start(time);
            osc.stop(time + duration);
        });
        noiseSource.start(time);
        noiseSource.stop(time + duration);
    }

    createBubbleSound() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);

        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    createChirpSound() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(4000, this.audioContext.currentTime + 0.05);
        osc.frequency.exponentialRampToValueAtTime(2000, this.audioContext.currentTime + 0.1);

        gain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    createClickSound() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(2000, this.audioContext.currentTime);

        gain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.02);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.02);
    }

    handleKeyPress(e) {
        if (!this.audioContext || this.soundType === 'none') return;

        if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Space') {
            switch (this.soundType) {
                case 'typewriter':
                    this.createTypewriterSound();
                    break;
                case 'meow':
                    this.createMeowSound();
                    break;
                case 'bubble':
                    this.createBubbleSound();
                    break;
                case 'chirp':
                    this.createChirpSound();
                    break;
                case 'click':
                    this.createClickSound();
                    break;
            }
        }
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('keydown', this.handleKeyPress.bind(this));
    }

    render() {
        return html`
            <div class="sound-container">
                <select @change=${e => (this.soundType = e.target.value)} .value=${this.soundType}>
                    <option value="none">No Sound</option>
                    <option value="typewriter">Typewriter</option>
                    <option value="meow">Cat Meow</option>
                    <option value="bubble">Bubble</option>
                    <option value="chirp">Chirp</option>
                    <option value="click">Click</option>
                </select>
            </div>
        `;
    }
}

customElements.define('keystroke-sound', KeystrokeSound);
