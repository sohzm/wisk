import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class PowerLevelElement extends LitElement {
    static styles = css`
        @keyframes pl_powerlevel_shake {
            0%,
            100% {
                transform: translate(0, 0) rotate(0);
            }
            10% {
                transform: translate(calc(var(--shake-intensity) * -2px), calc(var(--shake-intensity) * -2px))
                    rotate(calc(var(--shake-intensity) * -0.5deg));
            }
            20% {
                transform: translate(calc(var(--shake-intensity) * 2px), calc(var(--shake-intensity) * 2px))
                    rotate(calc(var(--shake-intensity) * 0.5deg));
            }
            30% {
                transform: translate(calc(var(--shake-intensity) * -2px), calc(var(--shake-intensity) * 1px))
                    rotate(calc(var(--shake-intensity) * -0.25deg));
            }
            40% {
                transform: translate(calc(var(--shake-intensity) * 2px), calc(var(--shake-intensity) * -1px))
                    rotate(calc(var(--shake-intensity) * 0.25deg));
            }
            50% {
                transform: translate(calc(var(--shake-intensity) * -1px), calc(var(--shake-intensity) * 2px))
                    rotate(calc(var(--shake-intensity) * -0.5deg));
            }
            60% {
                transform: translate(calc(var(--shake-intensity) * 1px), calc(var(--shake-intensity) * -2px))
                    rotate(calc(var(--shake-intensity) * 0.5deg));
            }
            70% {
                transform: translate(calc(var(--shake-intensity) * -2px), calc(var(--shake-intensity) * -1px))
                    rotate(calc(var(--shake-intensity) * -0.25deg));
            }
            80% {
                transform: translate(calc(var(--shake-intensity) * 2px), calc(var(--shake-intensity) * 1px))
                    rotate(calc(var(--shake-intensity) * 0.25deg));
            }
            90% {
                transform: translate(calc(var(--shake-intensity) * -1px), calc(var(--shake-intensity) * -2px))
                    rotate(calc(var(--shake-intensity) * -0.5deg));
            }
        }

        * {
            box-sizing: border-box;
            font-family: var(--font-mono);
            margin: 0px;
            padding: 0px;
            user-select: none;
            pointer-events: none;
            transition: all 0.3s ease;
        }
        :host {
            position: fixed;
            top: 40px;
            right: 10px;
            transform-origin: top right;
        }
        .power-container {
            background: transparent;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
            transform-origin: top right;
        }
        .power-bar {
            height: 8px;
            background: transparent;
            width: 100%;
            min-width: 69px;
            overflow: hidden;
        }
        .power-fill {
            height: 100%;
            width: 100%;
            margin-left: 100%;
            transition: margin-left 0.1s ease;
        }
        .combo-text {
            font-size: 22px;
            text-align: right;
            font-weight: 700;
        }
    `;

    static properties = {
        powerLevel: { type: Number },
        comboCount: { type: Number },
        charCount: { type: Number },
        scale: { type: Number },
    };

    constructor() {
        super();
        this.POWER_INCREASE_PER_KEY = 15;
        this.POWER_DECAY_RATE = 2;
        this.DECAY_INTERVAL_MS = 100;
        this.MIN_SCALE = 1;
        this.MAX_SCALE = 3.5;
        this.SCALE_FACTOR = 0.045;
        this.SHAKE_THRESHOLD = 30;
        this.MAX_SHAKE_INTENSITY = 3; // Maximum multiplier for shake effect

        this.powerLevel = 0;
        this.comboCount = 0;
        this.charCount = 0;
        this.scale = this.MIN_SCALE;
        this.pressedKeys = new Set();
        this.decayInterval = null;
        this.setupListeners();
    }

    getColorStyles(powerLevel) {
        const isHighPower = powerLevel > 50;
        return {
            backgroundColor: isHighPower ? 'var(--bg-red)' : 'var(--bg-blue)',
            color: isHighPower ? 'var(--fg-red)' : 'var(--fg-blue)',
        };
    }

    shakeDocument() {
        // Calculate shake intensity based on combo count
        const baseIntensity = Math.min(1, this.powerLevel / 100);
        const comboMultiplier = Math.min(this.MAX_SHAKE_INTENSITY, 1 + this.comboCount * 0.5);
        const intensity = baseIntensity * comboMultiplier;

        const duration = 200 + Math.random() * 300;

        // Set the shake intensity as a CSS variable
        document.documentElement.style.setProperty('--shake-intensity', intensity);

        document.body.style.animation = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.animation = `pl_powerlevel_shake ${duration}ms ease-in-out`;

        setTimeout(() => {
            document.body.style.animation = 'none';
        }, duration);
    }

    setupListeners() {
        window.addEventListener('keydown', e => {
            if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Space') {
                this.charCount++;
                this.powerLevel = Math.min(100, this.powerLevel + this.POWER_INCREASE_PER_KEY);
                const scaleRange = this.MAX_SCALE - this.MIN_SCALE;
                this.scale = this.MIN_SCALE + (this.powerLevel / 100) * scaleRange;

                if (this.powerLevel > this.SHAKE_THRESHOLD) {
                    this.shakeDocument();
                }
            }

            if (!this.pressedKeys.has(e.code)) {
                this.pressedKeys.add(e.code);
                this.comboCount = this.pressedKeys.size;
            }

            this.requestUpdate();
        });

        window.addEventListener('keyup', e => {
            this.pressedKeys.delete(e.code);
            this.comboCount = this.pressedKeys.size;
            this.requestUpdate();
        });

        this.decayInterval = setInterval(() => {
            if (this.powerLevel > 0) {
                this.powerLevel = Math.max(0, this.powerLevel - this.POWER_DECAY_RATE);
                if (this.powerLevel === 0) {
                    this.charCount = 0;
                }
                this.scale = 1 + this.powerLevel * 0.005;
                this.requestUpdate();
            }
        }, this.DECAY_INTERVAL_MS);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.decayInterval) {
            clearInterval(this.decayInterval);
        }
    }

    render() {
        const colors = this.getColorStyles(this.powerLevel);
        return html`
            <div class="power-container" style="transform: scale(${this.scale})">
                <div class="power-bar">
                    <div
                        class="power-fill"
                        style="margin-left: ${100 - this.powerLevel}%; 
                                background-color: ${colors.color};"
                    ></div>
                </div>
                <div class="combo-text" style="color: ${colors.color}">${this.charCount}x</div>
            </div>
        `;
    }
}

customElements.define('power-level-element', PowerLevelElement);

// Add styles to document head
const style = document.createElement('style');
style.textContent = `
    @keyframes pl_powerlevel_shake {
        0%, 100% { transform: translate(0, 0) rotate(0); }
        10% { transform: translate(calc(var(--shake-intensity) * -2px), calc(var(--shake-intensity) * -2px)) rotate(calc(var(--shake-intensity) * -0.5deg)); }
        20% { transform: translate(calc(var(--shake-intensity) * 2px), calc(var(--shake-intensity) * 2px)) rotate(calc(var(--shake-intensity) * 0.5deg)); }
        30% { transform: translate(calc(var(--shake-intensity) * -2px), calc(var(--shake-intensity) * 1px)) rotate(calc(var(--shake-intensity) * -0.25deg)); }
        40% { transform: translate(calc(var(--shake-intensity) * 2px), calc(var(--shake-intensity) * -1px)) rotate(calc(var(--shake-intensity) * 0.25deg)); }
        50% { transform: translate(calc(var(--shake-intensity) * -1px), calc(var(--shake-intensity) * 2px)) rotate(calc(var(--shake-intensity) * -0.5deg)); }
        60% { transform: translate(calc(var(--shake-intensity) * 1px), calc(var(--shake-intensity) * -2px)) rotate(calc(var(--shake-intensity) * 0.5deg)); }
        70% { transform: translate(calc(var(--shake-intensity) * -2px), calc(var(--shake-intensity) * -1px)) rotate(calc(var(--shake-intensity) * -0.25deg)); }
        80% { transform: translate(calc(var(--shake-intensity) * 2px), calc(var(--shake-intensity) * 1px)) rotate(calc(var(--shake-intensity) * 0.25deg)); }
        90% { transform: translate(calc(var(--shake-intensity) * -1px), calc(var(--shake-intensity) * -2px)) rotate(calc(var(--shake-intensity) * -0.5deg)); }
    }
`;
document.head.appendChild(style);

document.querySelector('.editor').appendChild(document.createElement('power-level-element'));
document.querySelector('power-level-element').style = 'z-index: 1000;';
