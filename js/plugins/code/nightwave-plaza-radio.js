import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class NightwavePlazaRadioElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            font-weight: 500;
        }
        :host {
            display: inline-block;
        }
        .radio-container {
            display: flex;
            align-items: center;
            gap: var(--gap-1);
            padding: 0;
            background-color: transparent;
            border-radius: var(--radius-large);
            box-shadow: var(--drop-shadow);
        }
        button {
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background-color: transparent;
            border-radius: var(--radius);
            cursor: pointer;
            transition: filter 0.2s;
            padding: 0;
            color: var(--bg-1);
        }
        .station-name {
            font-family: var(--font-mono);
            width: 7ch;
            overflow: hidden;
            user-select: text;
            cursor: text;
        }
        img {
            filter: var(--themed-svg);
        }
        a {
            color: var(--fg-1);
        }
        .support {
            margin-top: var(--padding-4);
            display: flex;
            flex-direction: column;
            gap: var(--gap-1);
        }
    `;

    static properties = {
        isPlaying: { type: Boolean },
        currentText: { type: String },
        windowSize: { type: Number },
        position: { type: Number },
    };

    constructor() {
        super();
        this.isPlaying = false;
        this.audioElement = null;
        this.fullText = 'Nightwave Plaza ';
        this.windowSize = 7;
        this.position = 0;
        this.currentText = this.fullText.slice(0, this.windowSize);
        this.intervalId = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.startRotation();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    startRotation() {
        this.intervalId = setInterval(() => {
            this.position = (this.position + 1) % this.fullText.length;
            let text = this.fullText + this.fullText; // Double the text to handle wrap-around
            this.currentText = text.slice(this.position, this.position + this.windowSize);
            this.requestUpdate();
        }, 500); // Adjust timing (milliseconds) as needed
    }

    firstUpdated() {
        this.audioElement = new Audio('https://radio.plaza.one/mp3');
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audioElement.pause();
        } else {
            this.audioElement.play();
        }
        this.isPlaying = !this.isPlaying;
    }

    opened() {
        this.requestUpdate();
    }

    render() {
        return html`
            <div class="radio-container">
                <button @click=${this.togglePlay} aria-label=${this.isPlaying ? 'Pause' : 'Play'} title="Nightwave Plaza Radio">
                    ${this.isPlaying
                        ? html`<img src="/a7/plugins/nightwave-plaza/pause.svg" alt="Pause" />`
                        : html`<img src="/a7/plugins/nightwave-plaza/play.svg" alt="Play" />`}
                </button>
                <span class="station-name" style="display: none">${this.currentText}</span>
            </div>
        `;
    }
}

customElements.define('nightwave-plaza-radio', NightwavePlazaRadioElement);
