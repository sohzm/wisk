import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class KeystrokeSound extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
            user-select: none;
        }
        :host {
            display: block;
            position: relative;
            height: 100%;
            overflow: hidden;
        }
        .container {
            position: relative;
            height: 100%;
            width: 100%;
        }
        .content-area {
            padding: var(--padding-4);
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            overflow: hidden;
        }
        .header {
            display: flex;
            flex-direction: row;
            color: var(--fg-1);
            gap: var(--gap-2);
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }
        .header-wrapper {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            width: 100%;
        }
        .header-controls {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .header-title {
            font-size: 30px;
            font-weight: 500;
        }
        .icon {
            cursor: pointer;
            transition: transform 0.2s ease;
            width: 22px;
        }
        .sound-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--gap-3);
            flex: 1;
            padding-top: 30px;
            padding-bottom: 30px;
        }
        select {
            background: var(--bg-2);
            color: var(--fg-1);
            padding: var(--padding-3);
            border-radius: var(--radius);
            border: 1px solid var(--bg-subtle);
            cursor: pointer;
            width: 200px;
            font-size: 1rem;
        }
        select:hover {
            background: var(--bg-3);
        }
        select:focus {
            outline: none;
            border-color: var(--fg-accent);
        }
        img {
            filter: var(--themed-svg);
        }
        img[src*='/a7/forget/dialog-x.svg'] {
            width: unset;
        }
        @media (max-width: 900px) {
            img[src*='/a7/forget/dialog-x.svg'] {
                display: none;
            }
            .header-title {
                width: 100%;
                text-align: center;
                margin-top: 20px;
                font-size: 20px;
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
            }
        }
    `;

    static properties = {
        soundType: { type: String },
    };

    constructor() {
        super();
        this.identifier = 'pl_keystroke_sound';
        this.soundType = 'typewriter1';
        this.audioContext = null;
        this.setupAudioContext();
        this.loadData();
    }

    async loadData() {
        try {
            const data = await wisk.editor.getPluginData(this.identifier);
            if (data) {
                const obj = JSON.parse(data);
                if (obj.soundType) {
                    this.soundType = obj.soundType;
                }
            }
        } catch (error) {
            console.error('Error loading keystroke sound data:', error);
        }
    }

    savePluginData() {
        wisk.editor.savePluginData(
            this.identifier,
            JSON.stringify({
                soundType: this.soundType,
            })
        );
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

    createTypewriter1Sound() {
        // Mechanical Precision Typewriter - Sharp, crisp impacts
        const time = this.audioContext.currentTime;

        // 1. Key press mechanism - sharp click
        const clickOsc = this.audioContext.createOscillator();
        const clickGain = this.audioContext.createGain();
        const clickFilter = this.audioContext.createBiquadFilter();

        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(1800, time);
        clickOsc.frequency.exponentialRampToValueAtTime(800, time + 0.01);

        clickFilter.type = 'highpass';
        clickFilter.frequency.value = 400;

        clickGain.gain.setValueAtTime(0.3, time);
        clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

        // 2. Type hammer strike - metallic ping
        const hammerOsc = this.audioContext.createOscillator();
        const hammerGain = this.audioContext.createGain();
        const hammerFilter = this.audioContext.createBiquadFilter();

        hammerOsc.type = 'sine';
        hammerOsc.frequency.setValueAtTime(2400, time + 0.01);
        hammerOsc.frequency.exponentialRampToValueAtTime(1200, time + 0.03);

        hammerFilter.type = 'peaking';
        hammerFilter.frequency.value = 2000;
        hammerFilter.Q.value = 8;
        hammerFilter.gain.value = 10;

        hammerGain.gain.setValueAtTime(0.4, time + 0.01);
        hammerGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

        // 3. Carriage vibration - subtle resonance
        const carriageOsc = this.audioContext.createOscillator();
        const carriageGain = this.audioContext.createGain();

        carriageOsc.type = 'triangle';
        carriageOsc.frequency.value = 120;

        carriageGain.gain.setValueAtTime(0, time + 0.02);
        carriageGain.gain.linearRampToValueAtTime(0.1, time + 0.04);
        carriageGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        // Connect everything
        clickOsc.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(this.audioContext.destination);

        hammerOsc.connect(hammerFilter);
        hammerFilter.connect(hammerGain);
        hammerGain.connect(this.audioContext.destination);

        carriageOsc.connect(carriageGain);
        carriageGain.connect(this.audioContext.destination);

        // Start sounds
        clickOsc.start(time);
        clickOsc.stop(time + 0.02);
        hammerOsc.start(time + 0.01);
        hammerOsc.stop(time + 0.08);
        carriageOsc.start(time + 0.02);
        carriageOsc.stop(time + 0.15);
    }

    createTypewriter2Sound() {
        // Vintage Typewriter - Warm, woody resonance
        const time = this.audioContext.currentTime;

        // Create impulse response for wooden case resonance
        const impulseLength = 0.3;
        const impulseBuffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate * impulseLength, this.audioContext.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulseBuffer.getChannelData(channel);
            for (let i = 0; i < impulseBuffer.length; i++) {
                const progress = i / impulseBuffer.length;
                // Warm wooden resonance
                channelData[i] = (Math.random() * 2 - 1) * Math.exp(-4 * progress) * (Math.sin(progress * 60) + Math.sin(progress * 80) * 0.7);
            }
        }

        const convolver = this.audioContext.createConvolver();
        convolver.buffer = impulseBuffer;

        // 1. Key depression - soft mechanical sound
        const keyOsc = this.audioContext.createOscillator();
        const keyGain = this.audioContext.createGain();

        keyOsc.type = 'sawtooth';
        keyOsc.frequency.setValueAtTime(300, time);
        keyOsc.frequency.linearRampToValueAtTime(150, time + 0.02);

        keyGain.gain.setValueAtTime(0.2, time);
        keyGain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);

        // 2. Type bar impact - mellow thunk
        const impactOsc1 = this.audioContext.createOscillator();
        const impactOsc2 = this.audioContext.createOscillator();
        const impactGain = this.audioContext.createGain();
        const impactFilter = this.audioContext.createBiquadFilter();

        impactOsc1.type = 'triangle';
        impactOsc1.frequency.value = 200;
        impactOsc2.type = 'sine';
        impactOsc2.frequency.value = 400;

        impactFilter.type = 'lowpass';
        impactFilter.frequency.setValueAtTime(800, time + 0.02);
        impactFilter.frequency.exponentialRampToValueAtTime(300, time + 0.1);

        impactGain.gain.setValueAtTime(0, time + 0.02);
        impactGain.gain.linearRampToValueAtTime(0.5, time + 0.025);
        impactGain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

        // 3. Bell resonance - subtle ring
        const bellOsc = this.audioContext.createOscillator();
        const bellGain = this.audioContext.createGain();
        const bellFilter = this.audioContext.createBiquadFilter();

        bellOsc.type = 'sine';
        bellOsc.frequency.value = 1800;

        bellFilter.type = 'bandpass';
        bellFilter.frequency.value = 1800;
        bellFilter.Q.value = 15;

        bellGain.gain.setValueAtTime(0, time + 0.03);
        bellGain.gain.linearRampToValueAtTime(0.15, time + 0.035);
        bellGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

        // Dry/Wet mixing
        const dryGain = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        dryGain.gain.value = 0.6;
        wetGain.gain.value = 0.4;

        // Connect everything
        keyOsc.connect(keyGain);
        [impactOsc1, impactOsc2].forEach(osc => osc.connect(impactFilter));
        impactFilter.connect(impactGain);
        bellOsc.connect(bellFilter);
        bellFilter.connect(bellGain);

        [keyGain, impactGain, bellGain].forEach(gain => {
            gain.connect(dryGain);
            gain.connect(convolver);
        });

        convolver.connect(wetGain);
        dryGain.connect(this.audioContext.destination);
        wetGain.connect(this.audioContext.destination);

        // Start sounds
        keyOsc.start(time);
        keyOsc.stop(time + 0.03);
        impactOsc1.start(time + 0.02);
        impactOsc1.stop(time + 0.12);
        impactOsc2.start(time + 0.02);
        impactOsc2.stop(time + 0.12);
        bellOsc.start(time + 0.03);
        bellOsc.stop(time + 0.2);
    }

    createTypewriter3Sound() {
        // Heavy Industrial Typewriter - Deep, powerful strikes
        const time = this.audioContext.currentTime;

        // 1. Massive key press - deep thud
        const keyThudOsc = this.audioContext.createOscillator();
        const keyThudGain = this.audioContext.createGain();
        const keyThudFilter = this.audioContext.createBiquadFilter();

        keyThudOsc.type = 'triangle';
        keyThudOsc.frequency.setValueAtTime(60, time);
        keyThudOsc.frequency.exponentialRampToValueAtTime(40, time + 0.05);

        keyThudFilter.type = 'lowpass';
        keyThudFilter.frequency.value = 150;

        keyThudGain.gain.setValueAtTime(0.4, time);
        keyThudGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

        // 2. Heavy mechanism clank
        const clankBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.06, this.audioContext.sampleRate);
        const clankData = clankBuffer.getChannelData(0);

        for (let i = 0; i < clankBuffer.length; i++) {
            const progress = i / clankBuffer.length;
            // Heavy metallic clank
            clankData[i] =
                (Math.random() * 2 - 1) * 0.8 * Math.exp(-15 * progress) +
                Math.sin(i * 0.8) * 0.4 * Math.exp(-10 * progress) +
                Math.sin(i * 0.3) * 0.6 * Math.exp(-8 * progress);
        }

        const clankSource = this.audioContext.createBufferSource();
        clankSource.buffer = clankBuffer;
        const clankGain = this.audioContext.createGain();
        const clankFilter = this.audioContext.createBiquadFilter();

        clankFilter.type = 'bandpass';
        clankFilter.frequency.value = 800;
        clankFilter.Q.value = 3;

        clankGain.gain.setValueAtTime(0.6, time + 0.01);

        // 3. Powerful impact resonance
        const impactOsc = this.audioContext.createOscillator();
        const impactGain = this.audioContext.createGain();
        const impactFilter = this.audioContext.createBiquadFilter();

        impactOsc.type = 'sawtooth';
        impactOsc.frequency.setValueAtTime(180, time + 0.03);
        impactOsc.frequency.exponentialRampToValueAtTime(90, time + 0.15);

        impactFilter.type = 'peaking';
        impactFilter.frequency.value = 140;
        impactFilter.Q.value = 4;
        impactFilter.gain.value = 8;

        impactGain.gain.setValueAtTime(0, time + 0.03);
        impactGain.gain.linearRampToValueAtTime(0.7, time + 0.04);
        impactGain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);

        // 4. Heavy return mechanism
        const returnOsc = this.audioContext.createOscillator();
        const returnGain = this.audioContext.createGain();

        returnOsc.type = 'square';
        returnOsc.frequency.setValueAtTime(450, time + 0.15);
        returnOsc.frequency.exponentialRampToValueAtTime(200, time + 0.18);

        returnGain.gain.setValueAtTime(0.3, time + 0.15);
        returnGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

        // Connect everything
        keyThudOsc.connect(keyThudFilter);
        keyThudFilter.connect(keyThudGain);
        keyThudGain.connect(this.audioContext.destination);

        clankSource.connect(clankFilter);
        clankFilter.connect(clankGain);
        clankGain.connect(this.audioContext.destination);

        impactOsc.connect(impactFilter);
        impactFilter.connect(impactGain);
        impactGain.connect(this.audioContext.destination);

        returnOsc.connect(returnGain);
        returnGain.connect(this.audioContext.destination);

        // Start sounds
        keyThudOsc.start(time);
        keyThudOsc.stop(time + 0.08);
        clankSource.start(time + 0.01);
        clankSource.stop(time + 0.07);
        impactOsc.start(time + 0.03);
        impactOsc.stop(time + 0.25);
        returnOsc.start(time + 0.15);
        returnOsc.stop(time + 0.2);
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

    createArcadeSound() {
        const time = this.audioContext.currentTime;
        const duration = 0.15;

        // Create main oscillator
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // Create a second oscillator for richer sound
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();

        // Main oscillator setup
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, time);
        osc.frequency.exponentialRampToValueAtTime(880, time + duration * 0.5);
        osc.frequency.exponentialRampToValueAtTime(440, time + duration);

        // Second oscillator setup
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(220, time);
        osc2.frequency.exponentialRampToValueAtTime(440, time + duration * 0.5);
        osc2.frequency.exponentialRampToValueAtTime(220, time + duration);

        // Filter setup
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, time);
        filter.frequency.exponentialRampToValueAtTime(1000, time + duration);

        // Gain setup
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        gain2.gain.setValueAtTime(0.1, time);
        gain2.gain.exponentialRampToValueAtTime(0.01, time + duration);

        // Connect everything
        osc.connect(filter);
        filter.connect(gain);
        osc2.connect(gain2);
        gain.connect(this.audioContext.destination);
        gain2.connect(this.audioContext.destination);

        // Start and stop
        osc.start(time);
        osc2.start(time);
        osc.stop(time + duration);
        osc2.stop(time + duration);
    }

    createLaserSound() {
        const time = this.audioContext.currentTime;
        const duration = 0.2;

        // Create oscillators
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // Main oscillator setup
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(2000, time);
        osc1.frequency.exponentialRampToValueAtTime(100, time + duration);

        // Second oscillator for richness
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1000, time);
        osc2.frequency.exponentialRampToValueAtTime(50, time + duration);

        // Filter setup
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, time);
        filter.frequency.exponentialRampToValueAtTime(200, time + duration);
        filter.Q.value = 10;

        // Gain setup
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        // Connect everything
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        // Start and stop
        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + duration);
        osc2.stop(time + duration);
    }

    createPianoSound() {
        const time = this.audioContext.currentTime;
        const duration = 0.3;

        // Create oscillators for rich piano sound
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const osc3 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // Random piano key frequency between C4 and C5
        const baseFreq = 261.63 * Math.pow(2, Math.random());

        // Main oscillators setup
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, time);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(baseFreq * 2, time);

        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(baseFreq * 3, time);

        // Filter setup for piano-like timbre
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, time);
        filter.frequency.exponentialRampToValueAtTime(1000, time + duration);
        filter.Q.value = 5;

        // Gain setup with piano-like envelope
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        // Connect everything
        [osc1, osc2, osc3].forEach(osc => {
            osc.connect(filter);
        });
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        // Start and stop
        [osc1, osc2, osc3].forEach(osc => {
            osc.start(time);
            osc.stop(time + duration);
        });
    }

    createThunderSound() {
        const time = this.audioContext.currentTime;
        const duration = 1.2;

        // Create thunder rumble with filtered noise
        const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);

        for (let i = 0; i < noiseBuffer.length; i++) {
            const progress = i / noiseBuffer.length;
            // Create rumbling noise with varying intensity
            noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-3 * progress) * (1 + Math.sin(progress * 20) * 0.5);
        }

        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        // Low pass filter for deep rumble
        const lowPass = this.audioContext.createBiquadFilter();
        lowPass.type = 'lowpass';
        lowPass.frequency.setValueAtTime(150, time);
        lowPass.frequency.exponentialRampToValueAtTime(50, time + duration);

        // High pass to remove extreme lows
        const highPass = this.audioContext.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.value = 30;

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        noiseSource.connect(lowPass);
        lowPass.connect(highPass);
        highPass.connect(gain);
        gain.connect(this.audioContext.destination);

        noiseSource.start(time);
        noiseSource.stop(time + duration);
    }

    createCorkPopSound() {
        const time = this.audioContext.currentTime;

        // Create the "pop" with a quick frequency sweep
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, time);
        osc.frequency.exponentialRampToValueAtTime(300, time + 0.01);
        osc.frequency.exponentialRampToValueAtTime(150, time + 0.05);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, time);
        filter.Q.value = 2;

        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        // Add some noise for the cork texture
        const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.05, this.audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBuffer.length; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * Math.exp((-i / noiseBuffer.length) * 20);
        }

        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.value = 0.2;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        noiseSource.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);

        osc.start(time);
        osc.stop(time + 0.1);
        noiseSource.start(time);
        noiseSource.stop(time + 0.05);
    }

    createWindChimeSound() {
        const time = this.audioContext.currentTime;
        const duration = 2.0;

        // Create multiple chime tones
        const frequencies = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
        const chimes = [];

        for (let i = 0; i < 3; i++) {
            const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.value = freq;

            filter.type = 'peaking';
            filter.frequency.value = freq * 2;
            filter.Q.value = 10;
            filter.gain.value = 6;

            const startTime = time + i * 0.1;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
            chimes.push({ osc, gain, filter });
        }
    }

    createWaterDropSound() {
        const time = this.audioContext.currentTime;

        // Main drop sound
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(800, time);
        osc1.frequency.exponentialRampToValueAtTime(200, time + 0.1);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1600, time);
        osc2.frequency.exponentialRampToValueAtTime(400, time + 0.1);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, time);
        filter.frequency.exponentialRampToValueAtTime(800, time + 0.2);

        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

        // Add ripple effect
        for (let i = 0; i < 3; i++) {
            const rippleOsc = this.audioContext.createOscillator();
            const rippleGain = this.audioContext.createGain();

            rippleOsc.type = 'sine';
            rippleOsc.frequency.value = 400 - i * 100;

            const rippleTime = time + 0.1 + i * 0.05;
            rippleGain.gain.setValueAtTime(0, rippleTime);
            rippleGain.gain.linearRampToValueAtTime(0.1, rippleTime + 0.01);
            rippleGain.gain.exponentialRampToValueAtTime(0.001, rippleTime + 0.2);

            rippleOsc.connect(rippleGain);
            rippleGain.connect(this.audioContext.destination);
            rippleOsc.start(rippleTime);
            rippleOsc.stop(rippleTime + 0.2);
        }

        [osc1, osc2].forEach(osc => osc.connect(filter));
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.3);
        osc2.stop(time + 0.3);
    }

    createVinylScratchSound() {
        const time = this.audioContext.currentTime;
        const duration = 0.25;

        // Create scratch noise
        const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);

        for (let i = 0; i < noiseBuffer.length; i++) {
            const progress = i / noiseBuffer.length;
            // Create scratchy texture
            noiseData[i] = (Math.random() * 2 - 1) * Math.sin(progress * 200) * (1 - progress * 0.5);
        }

        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        // Band pass filter for vinyl scratch frequency range
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, time);
        filter.frequency.linearRampToValueAtTime(800, time + duration);
        filter.Q.value = 5;

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.linearRampToValueAtTime(0.01, time + duration);

        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        noiseSource.start(time);
        noiseSource.stop(time + duration);
    }

    createHeartbeatSound() {
        const time = this.audioContext.currentTime;

        // Two-part heartbeat: lub-dub
        const createBeat = (startTime, frequency, duration) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.value = frequency;

            filter.type = 'lowpass';
            filter.frequency.value = 200;

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        // Lub (lower, longer)
        createBeat(time, 60, 0.15);
        // Dub (higher, shorter)
        createBeat(time + 0.1, 80, 0.1);
    }

    createCoinDropSound() {
        const time = this.audioContext.currentTime;

        // Initial impact
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(2000, time);
        osc1.frequency.exponentialRampToValueAtTime(1000, time + 0.05);

        gain1.gain.setValueAtTime(0.3, time);
        gain1.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        // Spinning/rolling sound
        for (let i = 0; i < 6; i++) {
            const spinOsc = this.audioContext.createOscillator();
            const spinGain = this.audioContext.createGain();

            spinOsc.type = 'sine';
            spinOsc.frequency.value = 1500 - i * 150;

            const spinTime = time + 0.05 + i * 0.08;
            const spinDuration = 0.06 - i * 0.005;

            spinGain.gain.setValueAtTime(0, spinTime);
            spinGain.gain.linearRampToValueAtTime(0.2 - i * 0.02, spinTime + 0.01);
            spinGain.gain.exponentialRampToValueAtTime(0.001, spinTime + spinDuration);

            spinOsc.connect(spinGain);
            spinGain.connect(this.audioContext.destination);
            spinOsc.start(spinTime);
            spinOsc.stop(spinTime + spinDuration);
        }

        osc1.connect(gain1);
        gain1.connect(this.audioContext.destination);
        osc1.start(time);
        osc1.stop(time + 0.1);
    }

    createFireCrackleSound() {
        const time = this.audioContext.currentTime;
        const duration = 0.4;

        // Create crackling noise
        const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);

        for (let i = 0; i < noiseBuffer.length; i++) {
            const progress = i / noiseBuffer.length;
            // Create random crackling with bursts
            const burst = Math.random() < 0.1 ? 3 : 1;
            noiseData[i] = (Math.random() * 2 - 1) * burst * Math.exp(-2 * progress) * (0.5 + Math.random() * 0.5);
        }

        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        // Multiple filters for fire texture
        const lowPass = this.audioContext.createBiquadFilter();
        lowPass.type = 'lowpass';
        lowPass.frequency.setValueAtTime(800, time);
        lowPass.frequency.exponentialRampToValueAtTime(200, time + duration);

        const highPass = this.audioContext.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.value = 100;

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        noiseSource.connect(highPass);
        highPass.connect(lowPass);
        lowPass.connect(gain);
        gain.connect(this.audioContext.destination);

        noiseSource.start(time);
        noiseSource.stop(time + duration);
    }

    handleKeyPress(e) {
        if (!this.audioContext || this.soundType === 'none') return;

        if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Space') {
            switch (this.soundType) {
                case 'typewriter1':
                    this.createTypewriter1Sound();
                    break;
                case 'typewriter2':
                    this.createTypewriter2Sound();
                    break;
                case 'typewriter3':
                    this.createTypewriter3Sound();
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
                case 'arcade':
                    this.createArcadeSound();
                    break;
                case 'laser':
                    this.createLaserSound();
                    break;
                case 'piano':
                    this.createPianoSound();
                    break;
                case 'thunder':
                    this.createThunderSound();
                    break;
                case 'cork':
                    this.createCorkPopSound();
                    break;
                case 'windchime':
                    this.createWindChimeSound();
                    break;
                case 'waterdrop':
                    this.createWaterDropSound();
                    break;
                case 'vinyl':
                    this.createVinylScratchSound();
                    break;
                case 'heartbeat':
                    this.createHeartbeatSound();
                    break;
                case 'coin':
                    this.createCoinDropSound();
                    break;
                case 'fire':
                    this.createFireCrackleSound();
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
        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    render() {
        return html`
            <div class="container">
                <div class="content-area">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <label class="header-title">Keystroke Sound</label>
                                <img
                                    src="/a7/forget/dialog-x.svg"
                                    alt="Close"
                                    @click="${() => wisk.editor.hideMiniDialog()}"
                                    class="icon"
                                    draggable="false"
                                    style="padding: var(--padding-3);"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="sound-container">
                        <select
                            @change=${e => {
                                this.soundType = e.target.value;
                                this.savePluginData();
                            }}
                            .value=${this.soundType}
                        >
                            <option value="none">No Sound</option>
                            <option value="typewriter1">Typewriter - Precision</option>
                            <option value="typewriter2">Typewriter - Vintage</option>
                            <option value="typewriter3">Typewriter - Heavy</option>
                            <option value="meow">Cat Meow</option>
                            <option value="bubble">Bubble</option>
                            <option value="chirp">Chirp</option>
                            <option value="click">Click</option>
                            <option value="arcade">Arcade</option>
                            <option value="laser">Laser</option>
                            <option value="piano">Piano</option>
                            <option value="thunder">Thunder</option>
                            <option value="cork">Cork Pop</option>
                            <option value="windchime">Wind Chime</option>
                            <option value="waterdrop">Water Drop</option>
                            <option value="vinyl">Vinyl Scratch</option>
                            <option value="heartbeat">Heartbeat</option>
                            <option value="coin">Coin Drop</option>
                            <option value="fire">Fire Crackle</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('keystroke-sound', KeystrokeSound);
