import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class StickyNotes extends LitElement {
    static styles = css`
        :host {
            display: flex;
            font-family: var(--font);
            background-color: var(--bg-1);
            color: var(--fg-1);
            padding: var(--padding-3);
            border-radius: var(--radius-large);
            box-shadow: var(--drop-shadow);
        }

        .note-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: var(--gap-2);
            padding-bottom: var(--padding-4);
        }

        .note {
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            padding: var(--padding-3);
            position: relative;
            display: flex;
            flex-direction: column;
            min-height: 100px;
        }

        .note[focused] {
            outline: 2px solid var(--fg-accent);
        }

        .note div[contenteditable] {
            border: none;
            flex: 1;
            outline: none;
            resize: none;
            background-color: transparent;
            font-family: inherit;
            font-size: 1rem;
        }

        .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: var(--radius);
            margin-bottom: var(--gap-2);
        }

        .toolbar button {
            background-color: var(--bg-accent);
            color: var(--fg-accent);
            border: none;
            padding: var(--padding-w1);
            border-radius: var(--radius);
            cursor: pointer;
            font-family: inherit;
            font-size: 1rem;
        }

        .color-options {
            display: flex;
            gap: var(--gap-1);
            visibility: hidden;
        }

        .toolbar[focused] .color-options {
            visibility: visible;
        }

        .color-option {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid transparent;
        }

        .color-option[selected] {
            border-color: black;
        }
    `;

    static properties = {
        focusedNoteIndex: { type: Number },
    };

    constructor() {
        super();
        this.identifier = 'pl_sticky_notes';
        this.notes = [];
        this.debouncer = null;
        this.focusedNoteIndex = null;
        this.colors = [
            { fg: 'var(--fg-1)', bg: 'var(--bg-1)' },
            { fg: 'var(--fg-red)', bg: 'var(--bg-red)' },
            { fg: 'var(--fg-green)', bg: 'var(--bg-green)' },
            { fg: 'var(--fg-blue)', bg: 'var(--bg-blue)' },
            { fg: 'var(--fg-yellow)', bg: 'var(--bg-yellow)' },
            { fg: 'var(--fg-purple)', bg: 'var(--bg-purple)' },
            { fg: 'var(--fg-cyan)', bg: 'var(--bg-cyan)' },
            { fg: 'var(--fg-orange)', bg: 'var(--bg-orange)' },
        ];
        this.textIndex = 0;
    }

    generateRandomInitalText() {
        const texts = [
            'Stay curious, create magic!',
            'Every idea starts with a spark.',
            'Write your thoughts, shape your world.',
            'Inspiration is everywhere.',
            'Dream big, jot it down.',
            'Your creativity is your superpower.',
            'A new note, a new beginning.',
            'Let the ideas flow.',
            'The world is your canvas.',
            'Create, inspire, repeat.',
            'You are a creator.',
            'Make today amazing!',
            'The best is yet to come.',
            'You are unstoppable.',
            'Create your own sunshine.',
            'Dream, create, inspire.',
            'The world needs your creativity.',
            'You are a masterpiece.',
        ];
        const randomIndex = Math.floor(Math.random() * texts.length);
        return texts[randomIndex];
    }

    loadData(data) {
        const obj = JSON.parse(data);
        this.notes = obj.notes || [];
        this.requestUpdate();
    }

    savePluginData() {
        if (this.debouncer) clearTimeout(this.debouncer);
        this.debouncer = setTimeout(() => {
            wisk.editor.savePluginData(this.identifier, JSON.stringify({ notes: this.notes }));
        }, 2000);
    }

    opened() {
        this.focusedNoteIndex = null;
        this.requestUpdate();
    }

    async addNote() {
        this.notes.push({ text: this.generateRandomInitalText(), fg: 'var(--fg-1)', bg: 'var(--bg-1)' });
        await this.requestUpdate();
        this.savePluginData();

        // focus the new note
        await this.updateComplete;
        const newNote = this.shadowRoot.querySelector(`.note:last-child div[contenteditable]`);
        if (newNote) newNote.focus();
    }

    updateNote(index, value) {
        this.notes[index].text = value;
        this.savePluginData();
    }

    deleteNote() {
        if (this.focusedNoteIndex !== null) {
            this.notes.splice(this.focusedNoteIndex, 1);
            this.focusedNoteIndex = null;
            this.requestUpdate();
            this.savePluginData();
        }
    }

    setFocus(index) {
        this.focusedNoteIndex = index;
        this.requestUpdate();
    }

    changeColor(index, color) {
        this.notes[index].fg = color.fg;
        this.notes[index].bg = color.bg;
        this.requestUpdate();
        this.savePluginData();

        // after changing color, focus the note
        setTimeout(() => {
            const note = this.shadowRoot.querySelector(`.note:nth-child(${index + 1}) div[contenteditable]`);
            if (note) note.focus();
        }, 100);
    }

    clearFocus() {
        setTimeout(() => {
            const activeElement = document.activeElement;
            if (!this.shadowRoot.contains(activeElement) || activeElement.closest('.toolbar')) {
                return;
            }
            this.focusedNoteIndex = null;
            this.requestUpdate();
        }, 100);
    }

    render() {
        return html`
            <div class="toolbar" ?focused=${this.focusedNoteIndex !== null}>
                <button @click=${this.addNote}>Add Note</button>
                ${this.focusedNoteIndex !== null ? html`<button @click=${this.deleteNote}>Delete Note</button>` : ''}
                <div class="color-options">
                    ${this.colors.map(
                        color => html`
                            <div
                                class="color-option"
                                style="background-color: ${color.fg}; border-color: ${this.focusedNoteIndex !== null &&
                                this.notes[this.focusedNoteIndex]?.bg === color.bg
                                    ? 'black'
                                    : 'transparent'};"
                                @click=${() => this.changeColor(this.focusedNoteIndex, color)}
                            ></div>
                        `
                    )}
                </div>
            </div>

            <div class="note-container">
                ${this.notes.map(
                    (note, index) => html`
                        <div
                            class="note"
                            style="background-color: ${note.bg}; color: ${note.fg}; ${this.focusedNoteIndex === index
                                ? 'outline: 2px solid var(--fg-accent);'
                                : ''}"
                            @focusin=${() => this.setFocus(index)}
                            ?focused=${this.focusedNoteIndex === index}
                            @focusout=${() => this.clearFocus()}
                            tabindex="0"
                        >
                            <div
                                contenteditable="true"
                                spellcheck="false"
                                @input=${e => this.updateNote(index, e.target.innerText)}
                                .innerText=${note.text}
                            ></div>
                        </div>
                    `
                )}
            </div>
        `;
    }
}

customElements.define('sticky-notes', StickyNotes);
