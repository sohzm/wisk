import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class WordCount extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            cursor: unset;
            font-weight: 600;
        }
        :host {
            display: block;
            padding: 1rem;
            background-color: var(--bg-1);
        }
        .x {
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            position: relative;
        }
        .x > div {
            display: flex;
            justify-content: space-between;
            color: var(--fg-1);
        }
        .hover-stats {
            visibility: hidden;
            opacity: 0;
            position: absolute;
            top: 150%;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--bg-3);
            padding: 8px;
            border-radius: var(--radius);
            filter: var(--drop-shadow);
            z-index: 1000;
            white-space: nowrap;
            transition:
                visibility 0s,
                opacity 0.2s ease-in-out;
            pointer-events: none;
        }
        .x:hover .hover-stats {
            visibility: visible;
            opacity: 1;
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
        ::placeholder {
            color: var(--fg-2);
        }
    `;

    static properties = {
        wordCount: { type: Number },
        charCount: { type: Number },
        charNoSpaces: { type: Number },
    };

    constructor() {
        super();
        this.wordCount = 0;
        this.charCount = 0;
        this.charNoSpaces = 0;
        this.updateTimer = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.startUpdateTimer();
        this.updateCounts();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.stopUpdateTimer();
    }

    startUpdateTimer() {
        this.updateCounts();
        this.updateTimer = setInterval(() => {
            this.updateCounts();
        }, 1000);
    }

    stopUpdateTimer() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    updateCounts() {
        this.wordCount = this.countWords(wisk.editor.document.data.elements);
        this.charCount = this.countCharacters(wisk.editor.document.data.elements);
        this.charNoSpaces = this.countCharactersExcludingSpaces(wisk.editor.document.data.elements);
        this.requestUpdate();
    }

    getWords(text) {
        return text
            .trim()
            .replace(/\s+/g, ' ')
            .split(' ')
            .filter(word => word.length > 0);
    }

    countWords(elements) {
        var words = 0;
        for (const element of elements) {
            var e = document.getElementById(element.id);
            if (e.getTextContent) {
                words += this.getWords(e.getTextContent().text).length;
            }
        }
        return words;
    }

    countCharacters(elements) {
        var characters = 0;
        for (const element of elements) {
            var e = document.getElementById(element.id);
            if (e.getTextContent) {
                characters += e.getTextContent().text.length;
            }
        }
        return characters;
    }

    countCharactersExcludingSpaces(elements) {
        var characters = 0;
        for (const element of elements) {
            var e = document.getElementById(element.id);
            if (e.getTextContent) {
                characters += e.getTextContent().text.replace(/\s/g, '').length;
            }
        }
        return characters;
    }

    render() {
        return html`
            <div class="x">
                ${this.wordCount === 1
                    ? html`<div style="white-space: nowrap;"><span style="margin-right: 4px">${this.wordCount}</span>word</div>`
                    : html` <div style="white-space: nowrap;"><span style="margin-right: 4px">${this.wordCount}</span>words</div>`}
                <div class="hover-stats">
                    characters: ${this.charCount}<br />
                    characters (no spaces): ${this.charNoSpaces}
                </div>
            </div>
        `;
    }
}

customElements.define('word-count', WordCount);
