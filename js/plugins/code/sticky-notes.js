import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class StickyNotes extends LitElement {
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
            margin-bottom: 20px;
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

        .notes-container {
            flex: 1;
            overflow-y: auto;
            display: flex;
            padding-right: var(--padding-2);
            margin-bottom: var(--padding-2);
        }

        .masonry-layout {
            width: 100%;
            display: flex;
            flex-direction: row;
            gap: var(--gap-3);
        }

        .masonry-column {
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            flex: 1;
        }

        .note {
            border: 2px solid transparent;
            border-radius: var(--radius);
            padding: var(--padding-3);
            position: relative;
            display: flex;
            flex-direction: column;
            transition: all 0.2s ease;
            background-color: var(--bg-2);
            width: 100%;
        }

        .note:focus-within {
            border: 2px solid var(--fg-accent);
        }

        .note-content {
            border: none;
            flex: 1;
            outline: none;
            resize: none;
            background-color: transparent;
            font-family: inherit;
            font-size: 1rem;
            line-height: 1.5;
            overflow-y: auto;
            padding: var(--padding-2) 0;
            user-select: text;
            min-height: 60px;
        }

        .note-header {
            display: flex;
            justify-content: space-between;
            padding-bottom: var(--padding-2);
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            margin-bottom: var(--padding-2);
        }

        .note-toolbar {
            display: flex;
            gap: var(--gap-1);
            visibility: hidden;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .note:hover .note-toolbar {
            visibility: visible;
            opacity: 1;
        }

        .note:focus-within .note-toolbar {
            visibility: visible;
            opacity: 1;
        }

        .note-action {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: var(--padding-1);
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
            transition:
                opacity 0.2s ease,
                background-color 0.2s ease;
        }

        .note-action:hover {
            opacity: 1;
            background-color: rgba(0, 0, 0, 0.05);
        }

        .note-action img {
            width: 16px;
            height: 16px;
            filter: var(--themed-svg);
        }

        .note-timestamp {
            font-size: 0.8rem;
            color: var(--fg-2);
            opacity: 0.8;
        }

        .control-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--padding-3) 0;
        }

        .left-controls,
        .right-controls {
            display: flex;
            gap: var(--gap-2);
            align-items: center;
        }

        .btn {
            outline: none;
            border: none;
            cursor: pointer;
            padding: var(--padding-w3);
            border-radius: var(--radius);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }

        .btn-primary {
            background: var(--fg-1);
            color: var(--bg-1);
            font-weight: 600;
            border-radius: calc(var(--radius-large) * 20);
            border: 2px solid transparent;
            transition: all 0.2s ease;
        }

        .btn-primary:hover {
            background-color: transparent;
            border: 2px solid var(--fg-1);
            color: var(--fg-1);
        }

        .btn-danger {
            background-color: var(--fg-red);
            color: var(--bg-red);
            font-weight: 600;
        }

        .btn-danger:hover {
            background-color: var(--bg-red);
            color: var(--fg-red);
            border: 2px solid var(--fg-red);
        }

        .search-input {
            width: 100%;
            max-width: 400px;
            padding: var(--padding-w2);
            border: 2px solid var(--bg-3);
            border-radius: calc(var(--radius) * 20);
            outline: none;
            background-color: var(--bg-2);
            color: var(--fg-1);
            transition: all 0.2s ease;
        }
        .search-input:focus {
            border: 2px solid var(--fg-accent);
            background-color: var(--bg-1);
        }

        .search-input:focus::placeholder {
            color: var(--fg-2);
        }

        .color-palette {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: var(--gap-2);
            padding: var(--padding-3);
            background-color: var(--bg-1);
            border: 2px solid var(--bg-3);
            border-radius: var(--radius);
            position: absolute;
            top: 100%;
            right: 0;
            z-index: 10;
            box-shadow: var(--drop-shadow);
        }

        .color-option {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.2s ease;
        }

        .color-option:hover {
            transform: scale(1.2);
            border-color: var(--fg-2);
        }

        .color-option[selected] {
            border: 3px solid var(--fg-1);
            transform: scale(1.1);
        }

        .color-toggle {
            position: relative;
        }

        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: var(--gap-3);
            opacity: 0.7;
            width: 100%;
        }

        .empty-state img {
            width: 80px;
            height: 80px;
            filter: var(--themed-svg);
        }

        /* Custom scrollbar for webkit browsers */
        @media (hover: hover) {
            *::-webkit-scrollbar {
                width: 8px;
            }
            *::-webkit-scrollbar-track {
                background: var(--bg-1);
            }
            *::-webkit-scrollbar-thumb {
                background-color: var(--bg-3);
                border-radius: 20px;
                border: 2px solid var(--bg-1);
            }
            *::-webkit-scrollbar-thumb:hover {
                background-color: var(--fg-1);
            }
        }
        @media (max-width: 900px) {
            .masonry-layout {
                flex-direction: column;
            }
        }
        img[src*='/a7/forget/dialog-x.svg'] {
            width: unset;
            filter: var(--themed-svg);
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
        notes: { type: Array },
        searchTerm: { type: String },
        showColorPaletteForNote: { type: String },
        sortOrder: { type: String },
        pinnedNotes: { type: Array },
    };

    constructor() {
        super();
        this.identifier = 'pl_sticky_notes';
        this.notes = [];
        this.pinnedNotes = [];
        this.searchTerm = '';
        this.showColorPaletteForNote = null; // Store note ID instead of index
        this.sortOrder = 'newest';
        this.debouncer = null;
        this.boundCloseDialogs = this.closeDialogs.bind(this);
        this.colors = [
            { fg: 'var(--fg-1)', bg: 'var(--bg-2)' },
            { fg: 'var(--fg-red)', bg: 'var(--bg-red)' },
            { fg: 'var(--fg-green)', bg: 'var(--bg-green)' },
            { fg: 'var(--fg-blue)', bg: 'var(--bg-blue)' },
            { fg: 'var(--fg-yellow)', bg: 'var(--bg-yellow)' },
            { fg: 'var(--fg-purple)', bg: 'var(--bg-purple)' },
            { fg: 'var(--fg-cyan)', bg: 'var(--bg-cyan)' },
            { fg: 'var(--fg-orange)', bg: 'var(--bg-orange)' },
        ];
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
        console.log('---------------------------------- Loading sticky notes data:', data);
        try {
            if (!data) {
                this.notes = [];
                this.pinnedNotes = [];
                return;
            }

            // Convert old format to new format if needed
            if (data.notes && Array.isArray(data.notes)) {
                this.notes = data.notes.map(note => {
                    if (!note.timestamp) {
                        note.timestamp = Date.now();
                    }
                    if (!note.id) {
                        note.id = this.generateId();
                    }
                    return note;
                });
            } else {
                this.notes = [];
            }

            // Load pinned notes if available
            if (data.pinnedNotes && Array.isArray(data.pinnedNotes)) {
                this.pinnedNotes = data.pinnedNotes;
                // Restore pinned notes to the document
                this.pinnedNotes.forEach(pinnedNote => {
                    this.createPinnedNote(pinnedNote);
                });
            } else {
                this.pinnedNotes = [];
            }

            this.sortNotes();
            this.requestUpdate();
        } catch (error) {
            console.error('Error loading sticky notes data:', error);
            this.notes = [];
            this.pinnedNotes = [];
        }
    }

    generateId() {
        return 'note_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }

    savePluginData() {
        if (this.debouncer) clearTimeout(this.debouncer);
        this.debouncer = setTimeout(() => {
            wisk.editor.savePluginData(this.identifier, {
                notes: this.notes,
                pinnedNotes: this.pinnedNotes,
            });
        }, 1000);
    }

    opened() {
        this.showColorPaletteForNote = null;
        this.sortNotes();
        this.requestUpdate();
    }

    sortNotes() {
        if (this.sortOrder === 'newest') {
            this.notes.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        } else if (this.sortOrder === 'oldest') {
            this.notes.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        }
    }

    async addNote() {
        const newNote = {
            text: this.generateRandomInitalText(),
            fg: 'var(--fg-1)',
            bg: 'var(--bg-2)',
            timestamp: Date.now(),
            id: this.generateId(),
        };

        this.notes.unshift(newNote);
        this.sortNotes();
        await this.requestUpdate();
        this.savePluginData();

        // focus the new note
        await this.updateComplete;
        const firstNote = this.shadowRoot.querySelector(`.note:first-child .note-content`);
        if (firstNote) {
            firstNote.focus();
        }
    }

    updateNote(id, value) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            this.notes[noteIndex].text = value;
            this.notes[noteIndex].timestamp = Date.now();
            this.savePluginData();

            // Also update the pinned note if it exists
            const pinnedNoteIndex = this.pinnedNotes.findIndex(note => note.id === id);
            if (pinnedNoteIndex !== -1) {
                this.pinnedNotes[pinnedNoteIndex].text = value;
                this.savePluginData();

                // Update the pinned element in the DOM
                const pinnedElement = document.querySelector(`pin-element[data-note-id="${id}"]`);
                if (pinnedElement) {
                    pinnedElement.updateContent(value);
                }
            }
        }
    }

    deleteNote(id) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            this.notes.splice(noteIndex, 1);
            this.showColorPaletteForNote = null;

            // Also remove from pinned notes if it exists
            this.unpinNote(id);

            this.requestUpdate();
            this.savePluginData();
        }
    }

    changeColor(id, color) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            this.notes[noteIndex].fg = color.fg;
            this.notes[noteIndex].bg = color.bg;
            this.notes[noteIndex].timestamp = Date.now();
            this.showColorPaletteForNote = null;
            this.requestUpdate();
            this.savePluginData();

            // Update pinned note color if it exists
            const pinnedNoteIndex = this.pinnedNotes.findIndex(note => note.id === id);
            if (pinnedNoteIndex !== -1) {
                this.pinnedNotes[pinnedNoteIndex].fg = color.fg;
                this.pinnedNotes[pinnedNoteIndex].bg = color.bg;
                this.savePluginData();

                // Update the pinned element in the DOM
                const pinnedElement = document.querySelector(`pin-element[data-note-id="${id}"]`);
                if (pinnedElement) {
                    pinnedElement.updateStyle(color.bg, color.fg);
                }
            }

            // After changing color, focus the note
            setTimeout(() => {
                const note = this.shadowRoot.querySelector(`[data-note-id="${id}"] .note-content`);
                if (note) note.focus();
            }, 100);
        }
    }

    pinNote(id) {
        const noteIndex = this.notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            const note = this.notes[noteIndex];

            // Check if already pinned
            const pinnedIndex = this.pinnedNotes.findIndex(pinned => pinned.id === id);
            if (pinnedIndex !== -1) {
                return; // Already pinned
            }

            // Add to pinned notes (x is percentage, y is pixels)
            // Generate random rotation of -8 or 8 degrees
            const rotation = Math.random() < 0.5 ? -8 : 8;
            // Generate random initial position (x: 20-70%, y: 100-400px)
            const randomX = 20 + Math.random() * 50;
            const randomY = 100 + Math.random() * 300;
            const pinnedNote = { ...note, position: { x: randomX, y: randomY }, rotation: rotation };
            this.pinnedNotes.push(pinnedNote);
            this.requestUpdate();
            this.savePluginData();

            // Create the pinned note element
            this.createPinnedNote(pinnedNote);
        }
    }

    unpinNote(id) {
        const pinnedIndex = this.pinnedNotes.findIndex(note => note.id === id);
        if (pinnedIndex !== -1) {
            this.pinnedNotes.splice(pinnedIndex, 1);
            this.requestUpdate();
            this.savePluginData();

            // Remove the pinned element from DOM
            const pinnedElement = document.querySelector(`pin-element[data-note-id="${id}"]`);
            if (pinnedElement) {
                pinnedElement.remove();
            }
        }
    }

    createPinnedNote(note) {
        // Create a new pin-element and add it to the editor
        const pinnedElement = document.createElement('pin-element');

        // Set attributes (x is percentage, y is pixels)
        pinnedElement.setAttribute('data-note-id', note.id);
        pinnedElement.setAttribute('position-x', note.position ? note.position.x : 50);
        pinnedElement.setAttribute('position-y', note.position ? note.position.y : 100);
        pinnedElement.setAttribute('bg-color', note.bg);
        pinnedElement.setAttribute('fg-color', note.fg);
        pinnedElement.setAttribute('content', note.text);

        // Apply stored rotation or default to 8 degrees for backwards compatibility
        const rotation = note.rotation !== undefined ? note.rotation : 8;
        pinnedElement.style.transform = `rotate(${rotation}deg)`;

        // Set up the callback for position updates
        pinnedElement.onPositionChange = (x, y) => {
            const pinnedIndex = this.pinnedNotes.findIndex(n => n.id === note.id);
            if (pinnedIndex !== -1) {
                this.pinnedNotes[pinnedIndex].position = { x, y };
                this.savePluginData();
            }
        };

        // Set up the callback for closing/unpinning
        pinnedElement.onClose = () => {
            this.unpinNote(note.id);
        };

        // Add to .editor instead of body
        const editor = document.querySelector('.editor');
        if (editor) {
            editor.appendChild(pinnedElement);
        } else {
            // Fallback to body if .editor not found
            document.body.appendChild(pinnedElement);
        }
    }

    toggleColorPalette(event, id) {
        this.showColorPaletteForNote = this.showColorPaletteForNote === id ? null : id;
        event.stopPropagation();
        this.requestUpdate();
    }

    handleSearch(e) {
        this.searchTerm = e.target.value.toLowerCase();
        this.requestUpdate();
    }

    changeSortOrder(order) {
        this.sortOrder = order;
        this.sortNotes();
        this.requestUpdate();
    }

    getFilteredNotes() {
        if (!this.searchTerm) {
            return this.notes;
        }

        return this.notes.filter(note => note.text.toLowerCase().includes(this.searchTerm));
    }

    formatDate(timestamp) {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    closeDialogs(e) {
        // Close color palette when clicking outside
        if (this.showColorPaletteForNote && !e.target.closest('.color-toggle')) {
            this.showColorPaletteForNote = null;
            this.requestUpdate();
        }
    }

    firstUpdated() {
        document.addEventListener('click', this.boundCloseDialogs);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('click', this.boundCloseDialogs);
    }

    // Distribute notes evenly between columns based on content length
    distributeNotes(notes, columnCount = 2) {
        if (!notes.length)
            return Array(columnCount)
                .fill()
                .map(() => []);

        // Initialize columns
        const columns = Array(columnCount)
            .fill()
            .map(() => []);
        const columnHeights = Array(columnCount).fill(0);

        // Distribute notes to columns based on their expected height
        notes.forEach(note => {
            // Simple height estimation based on text length
            const estimatedHeight = Math.max(100, 60 + note.text.length / 3);

            // Find the column with the smallest height
            const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));

            // Add the note to the shortest column
            columns[shortestColumnIndex].push(note);
            columnHeights[shortestColumnIndex] += estimatedHeight;
        });

        return columns;
    }

    render() {
        const filteredNotes = this.getFilteredNotes();
        const columnCount = window.innerWidth < 900 ? 1 : 2;
        const distributedNotes = this.distributeNotes(filteredNotes, columnCount);

        return html`
            <div class="container">
                <div class="content-area">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <label class="header-title">Sticky Notes</label>
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

                    <div class="control-bar">
                        <div class="left-controls">
                            <button class="btn btn-primary" @click=${this.addNote}>New Note</button>
                        </div>
                        <div class="right-controls">
                            <input
                                type="text"
                                class="search-input"
                                placeholder="Search notes..."
                                .value=${this.searchTerm}
                                @input=${this.handleSearch}
                            />
                        </div>
                    </div>

                    <div class="notes-container">
                        ${filteredNotes.length === 0
                            ? html`
                                  <div class="empty-state">
                                      <img src="/a7/plugins/options-element/puzzled.svg" alt="No notes" />
                                      <p>No notes found</p>
                                      ${this.searchTerm
                                          ? html`<p>Try adjusting your search term</p>`
                                          : html`<p>Click "New Note" to create your first note</p>`}
                                  </div>
                              `
                            : html`
                                  <div class="masonry-layout">
                                      ${distributedNotes.map(
                                          column => html`
                                              <div class="masonry-column">
                                                  ${column.map(note => {
                                                      const isPinned = this.pinnedNotes.some(pinned => pinned.id === note.id);
                                                      return html`
                                                          <div
                                                              class="note"
                                                              style="background-color: ${note.bg}; color: var(--fg-1);"
                                                              data-note-id="${note.id}"
                                                          >
                                                              <div class="note-header">
                                                                  <div class="note-timestamp">${this.formatDate(note.timestamp)}</div>
                                                                  <div class="note-toolbar">
                                                                      <button
                                                                          class="note-action"
                                                                          @click=${() => (isPinned ? this.unpinNote(note.id) : this.pinNote(note.id))}
                                                                      >
                                                                          <img
                                                                              src="/a7/plugins/options-element/${isPinned ? 'pin-tack' : 'pin'}.svg"
                                                                              alt="${isPinned ? 'Unpin' : 'Pin'}"
                                                                          />
                                                                      </button>
                                                                      <div class="color-toggle">
                                                                          <button
                                                                              class="note-action"
                                                                              @click=${e => this.toggleColorPalette(e, note.id)}
                                                                          >
                                                                              <img src="/a7/plugins/options-element/theme.svg" alt="Change color" />
                                                                          </button>
                                                                          ${this.showColorPaletteForNote === note.id
                                                                              ? html`
                                                                                    <div class="color-palette">
                                                                                        ${this.colors.map(
                                                                                            color => html`
                                                                                                <div
                                                                                                    class="color-option"
                                                                                                    style="background-color: ${color.fg};"
                                                                                                    ?selected=${note.bg === color.bg}
                                                                                                    @click=${() => this.changeColor(note.id, color)}
                                                                                                ></div>
                                                                                            `
                                                                                        )}
                                                                                    </div>
                                                                                `
                                                                              : ''}
                                                                      </div>
                                                                      <button class="note-action" @click=${() => this.deleteNote(note.id)}>
                                                                          <img src="/a7/iconoir/trash.svg" alt="Delete" />
                                                                      </button>
                                                                  </div>
                                                              </div>
                                                              <div
                                                                  class="note-content"
                                                                  contenteditable="true"
                                                                  spellcheck="false"
                                                                  @input=${e => this.updateNote(note.id, e.target.innerText)}
                                                                  .innerText=${note.text}
                                                              ></div>
                                                          </div>
                                                      `;
                                                  })}
                                              </div>
                                          `
                                      )}
                                  </div>
                              `}
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('sticky-notes', StickyNotes);
