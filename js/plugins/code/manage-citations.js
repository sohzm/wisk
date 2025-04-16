import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class ManageCitations extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        .container {
            height: 100%;
            display: flex;
            flex-direction: column;
            background-color: var(--bg-1);
            padding: var(--padding-4);
        }
        .reference {
            padding: var(--padding-3);
            background: var(--bg-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            margin-bottom: var(--gap-2);
            flex: 1;
            overflow: auto;
        }
        .field {
            margin-bottom: var(--gap-1);
        }
        .field-label {
            font-weight: bold;
            font-size: 12px;
            color: var(--fg-2);
        }
        .field-value {
            font-size: 14px;
            color: var(--fg-1);
            line-height: 1.5;
        }
        .button {
            padding: var(--padding-w1);
            background: var(--bg-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            color: var(--fg-1);
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
            white-space: nowrap;
        }
        .button:hover {
            background: var(--bg-3);
        }
        .button-primary {
            background: var(--fg-1);
            color: var(--bg-1);
            border-radius: var(--radius);
            border: 1px solid var(--fg-1);
            padding: var(--padding-w1);
        }
        .button-primary:hover {
            background: var(--bg-1);
            color: var(--fg-1);
        }
        .actions {
            display: flex;
            justify-content: flex-end;
            margin-top: var(--gap-2);
            gap: var(--gap-2);
        }
        .header-actions {
            display: flex;
            justify-content: space-between;
            margin-bottom: var(--gap-3);
        }
        .form {
        }
        .input,
        .textarea,
        .format-select {
            width: 100%;
            padding: var(--padding-2);
            margin-bottom: var(--gap-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            font-size: 14px;
            background: var(--bg-1);
            color: var(--fg-1);
        }
        .format-select {
            margin-bottom: 0;
            background: var(--bg-2);
        }
        .textarea {
            height: 100px;
        }
        .preview {
            margin-top: var(--gap-2);
            padding: var(--padding-3);
            background: var(--bg-2);
            border-radius: var(--radius);
            font-size: 14px;
            color: var(--fg-1);
        }
        .field-group {
            margin-bottom: var(--gap-3);
            padding: var(--padding-2);
            border: 1px solid var(--border-2);
            border-radius: var(--radius);
        }
        .field-group-title {
            font-weight: bold;
            margin-bottom: var(--gap-2);
            color: var(--fg-2);
        }
        .citation-text {
            font-size: 14px;
            line-height: 1.6;
            color: var(--fg-1);
            margin-bottom: var(--gap-2);
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

        .paste-area {
            width: 100%;
            height: 150px;
            margin-bottom: var(--gap-2);
            padding: var(--padding-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background: var(--bg-1);
            color: var(--fg-1);
            font-family: monospace;
            font-size: 14px;
        }

        .modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-1);
            padding: var(--padding-4);
            border-radius: var(--radius);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            width: 90%;
            max-width: 600px;
        }

        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--gap-3);
        }

        .modal-title {
            font-size: 18px;
            font-weight: bold;
            color: var(--fg-1);
        }
    `;

    static properties = {
        references: { type: Array },
        editingId: { type: String },
        selectedFormat: { type: String },
        isCreating: { type: Boolean },
        showBibtexModal: { type: Boolean },
    };

    constructor() {
        super();
        this.references = [];
        this.editingId = null;
        this.selectedFormat = 'apa7';
        this.isCreating = false;
        this.showBibtexModal = false;
        this.identifier = 'pl_manage_citations';
    }

    getCitations() {
        return this.references;
    }

    getCitationData(citationId) {
        return this.references.find(ref => ref.id === citationId);
    }

    getFormattedCitation(citationId) {
        return this.formatCitation(this.getCitationData(citationId));
    }

    parseBibtex(bibtex) {
        const entry = {};

        const typeMatch = bibtex.match(/@(\w+)\s*{\s*([^,]*),/);
        if (typeMatch) {
            entry.type = typeMatch[1];
            entry.citationKey = typeMatch[2];
        }

        const fieldRegex = /(\w+)\s*=\s*[{"]([^}"]*)[}"]/g;
        let match;
        while ((match = fieldRegex.exec(bibtex)) !== null) {
            entry[match[1].toLowerCase()] = match[2];
        }

        return entry;
    }

    highlight(id) {
        console.log('-- Highlighting', id);

        const el = this.shadowRoot.getElementById('c-' + id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.border = '1px solid var(--fg-red)';
            setTimeout(() => (el.style.border = '1px solid var(--border-1)'), 2000);
        }
    }

    addReferenceExt(ref) {
        console.log('Adding reference', ref);
        this.references = [...this.references, ref];
        this.highlight(ref.id);

        this.savePluginData();
    }

    loadData(data) {
        var obj = JSON.parse(data);
        this.references = obj.references;
    }

    formatInlineCitation(citation) {
        if (!citation.authors || !citation.authors.length) {
            return '(Unknown, n.d.)';
        }

        const year = citation.publish_date ? new Date(citation.publish_date).getFullYear() : 'n.d.';

        if (citation.authors.length === 1) {
            return `(${citation.authors[0]}, ${year})`;
        } else if (citation.authors.length === 2) {
            const lastName1 = citation.authors[0].split(' ').pop();
            const lastName2 = citation.authors[1].split(' ').pop();
            return `(${lastName1} & ${lastName2}, ${year})`;
        } else {
            const firstAuthorLastName = citation.authors[0].split(' ').pop();
            return `(${firstAuthorLastName} et al., ${year})`;
        }
    }

    handleBibtexImport(event) {
        event.preventDefault();
        const bibtexText = event.target.bibtex.value;
        try {
            const bibtexEntry = this.parseBibtex(bibtexText);
            const newReference = this.convertBibtexToReference(bibtexEntry);
            this.references = [...this.references, newReference];

            this.savePluginData();
            this.showBibtexModal = false;
            event.target.reset();
        } catch (error) {
            console.error('Failed to parse BibTeX:', error);
            alert('Failed to parse BibTeX. Please check the format and try again.');
        }
    }

    renderBibtexModal() {
        return html`
            <div class="modal-backdrop" @click=${() => (this.showBibtexModal = false)}>
                <div class="modal" @click=${e => e.stopPropagation()}>
                    <div class="modal-header">
                        <div class="modal-title">Paste BibTeX Entry</div>
                        <button class="button" @click=${() => (this.showBibtexModal = false)}>Close</button>
                    </div>
                    <form @submit=${this.handleBibtexImport}>
                        <textarea class="paste-area" name="bibtex" placeholder="Paste your BibTeX entry here..." required></textarea>
                        <button class="button button-primary" type="submit">Import Citation</button>
                    </form>
                </div>
            </div>
        `;
    }

    convertBibtexToReference(bibtexEntry) {
        return {
            id: Date.now().toString(),
            title: bibtexEntry.title || '',
            authors: bibtexEntry.author ? bibtexEntry.author.split(' and ').map(author => author.trim()) : [],
            publish_date: bibtexEntry.year ? `${bibtexEntry.year}-01-01` : '',
            journal_conference: bibtexEntry.journal || bibtexEntry.booktitle || '',
            volume: bibtexEntry.volume || '',
            issue: bibtexEntry.number || '',
            pages: bibtexEntry.pages || '',
            doi: bibtexEntry.doi || '',
            url: bibtexEntry.url || '',
            publisher_name: bibtexEntry.publisher || '',
            publisher_location: bibtexEntry.address || '',
        };
    }

    formatDate(dateString) {
        if (!dateString) return '';

        // Handle both ISO date string and date-only formats
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const shortMonths = months.map(m => m.substring(0, 3));

        return {
            year: date.getFullYear(),
            month: months[date.getMonth()],
            shortMonth: shortMonths[date.getMonth()],
            day: date.getDate(),
        };
    }

    formatAuthors(authors, format) {
        if (!authors || authors.length === 0) return '';

        const formatAuthor = author => {
            const parts = author.trim().split(' ');
            const lastName = parts.pop();
            const firstNames = parts.join(' ');

            switch (format) {
                case 'mla':
                    return authors.length === 1
                        ? `${lastName}, ${firstNames}`
                        : authors.indexOf(author) === 0
                          ? `${lastName}, ${firstNames}, et al`
                          : '';
                case 'chicago':
                    return `${firstNames} ${lastName}`;
                case 'harvard':
                    return `${lastName}, ${firstNames.charAt(0)}.`;
                default:
                    return author;
            }
        };

        return authors
            .map(formatAuthor)
            .filter(a => a)
            .join(', ');
    }

    formatCitation(reference) {
        if (!reference || !reference.title) return '';

        const date = this.formatDate(reference.publish_date);
        const authors = this.formatAuthors(reference.authors, this.selectedFormat);

        switch (this.selectedFormat) {
            case 'apa7':
                return `${authors}. (${date.year || 'n.d.'}). ${reference.title}. ${
                    reference.journal_conference ? `${reference.journal_conference}, ` : ''
                }${reference.volume ? `${reference.volume}` : ''}${
                    reference.issue ? `(${reference.issue})` : ''
                }${reference.pages ? `, ${reference.pages}` : ''}.${
                    reference.doi ? ` https://doi.org/${reference.doi}` : reference.url ? ` ${reference.url}` : ''
                }`;

            case 'vancouver':
                return `${reference.authors.map((_, i) => i + 1).join('')}. ${authors}. ${reference.title}. ${
                    reference.journal_conference || ''
                } ${date.year || ''};${reference.volume || ''}${
                    reference.issue ? `(${reference.issue})` : ''
                }:${reference.pages || ''}.${reference.doi ? ` doi: ${reference.doi}` : ''}`;

            case 'asa':
                return `${authors}. ${date.year || 'N.d.'}. "${reference.title}." ${
                    reference.journal_conference ? `${reference.journal_conference} ` : ''
                }${reference.volume || ''}${
                    reference.issue ? `(${reference.issue})` : ''
                }:${reference.pages || ''}.${reference.doi ? ` doi: ${reference.doi}` : ''}`;

            case 'aaa':
                return `${authors}\n${date.year || 'N.d.'} ${reference.title}. ${
                    reference.journal_conference ? `${reference.journal_conference} ` : ''
                }${reference.volume || ''}${reference.issue ? `(${reference.issue})` : ''}:${reference.pages || ''}.`;

            case 'nlm':
                return `${authors}. ${reference.title}. ${
                    reference.journal_conference ? `${reference.journal_conference}. ` : ''
                }${date.year || ''};${reference.volume || ''}${
                    reference.issue ? `(${reference.issue})` : ''
                }:${reference.pages || ''}.${reference.doi ? ` doi: ${reference.doi}` : ''}`;

            case 'cse':
                return `${authors}. ${reference.title}. ${
                    reference.journal_conference ? `${reference.journal_conference}. ` : ''
                }${date.year || ''};${reference.volume || ''}${reference.issue ? `(${reference.issue})` : ''}:${reference.pages || ''}.`;

            case 'ama':
                return `${authors}. ${reference.title}. ${
                    reference.journal_conference ? `${reference.journal_conference}. ` : ''
                }${date.year || ''};${reference.volume || ''}${
                    reference.issue ? `(${reference.issue})` : ''
                }:${reference.pages || ''}.${reference.doi ? ` doi:${reference.doi}` : ''}`;

            case 'acm':
                return `${authors}. ${date.year || 'n.d.'}. ${reference.title}. ${
                    reference.journal_conference ? `${reference.journal_conference} ` : ''
                }${reference.volume || ''}${reference.issue ? `, ${reference.issue}` : ''}${
                    reference.pages ? ` (${date.year}), ${reference.pages}` : ''
                }${reference.doi ? `. DOI:https://doi.org/${reference.doi}` : ''}.`;

            case 'ieee':
                return `${authors}, "${reference.title}," ${
                    reference.journal_conference ? `${reference.journal_conference}, ` : ''
                }${reference.volume ? `vol. ${reference.volume}, ` : ''}${
                    reference.issue ? `no. ${reference.issue}, ` : ''
                }${reference.pages ? `pp. ${reference.pages}, ` : ''}${date.year ? `${date.year}` : ''}${reference.doi ? `. DOI: ${reference.doi}` : ''}.`;

            case 'mla':
                return `${authors}. "${reference.title}." ${reference.journal_conference || ''}${reference.volume ? `, vol. ${reference.volume}` : ''}${
                    reference.issue ? `, no. ${reference.issue}` : ''
                }${date.year ? `, ${date.year}` : ''}, pp. ${reference.pages || 'n.p.'}${
                    reference.doi ? `, doi:${reference.doi}` : reference.url ? `, ${reference.url}` : ''
                }. Accessed ${new Date().toLocaleDateString()}.`;

            case 'chicago':
                return `${authors}. "${reference.title}." ${
                    reference.journal_conference ? `${reference.journal_conference} ` : ''
                }${reference.volume ? `${reference.volume}, ` : ''}${reference.issue ? `no. ${reference.issue} ` : ''}(${date.year || 'n.d.'}): ${
                    reference.pages || 'n.p.'
                }${reference.doi ? `. DOI:${reference.doi}` : ''}.`;

            case 'harvard':
                return `${authors} ${date.year ? `(${date.year})` : ''} '${reference.title}', ${
                    reference.journal_conference ? `${reference.journal_conference}, ` : ''
                }${reference.volume ? `vol. ${reference.volume}, ` : ''}${reference.issue ? `no. ${reference.issue}, ` : ''}${
                    reference.pages ? `pp. ${reference.pages}` : ''
                }${reference.doi ? `. doi: ${reference.doi}` : ''}.`;

            case 'turabian':
                return `${authors}. "${reference.title}." ${reference.journal_conference ? `${reference.journal_conference} ` : ''}${reference.volume || ''}${
                    reference.issue ? `, no. ${reference.issue}` : ''
                } (${date.year || 'n.d.'}): ${reference.pages || ''}${reference.doi ? `. DOI: ${reference.doi}` : ''}.`;

            default:
                return '';
        }
    }

    toggleCreateForm() {
        this.isCreating = !this.isCreating;
        this.editingId = null; // Close any open edit forms
        this.requestUpdate();
    }

    addReference(event) {
        event.preventDefault();
        const form = event.target;
        // Ensure the publish_date is in YYYY-MM-DD format
        const publishDate = form.publish_date.value ? new Date(form.publish_date.value).toISOString().split('T')[0] : '';
        const newReference = {
            title: form.title.value,
            authors: form.authors.value.split(',').map(author => author.trim()),
            url: form.url.value,
            doi: form.doi.value,
            publish_date: publishDate, // Using formatted date
            journal_conference: form.journal_conference.value,
            volume: form.volume.value,
            issue: form.issue.value,
            pages: form.pages.value,
            publisher_name: form.publisher_name.value,
            publisher_location: form.publisher_location.value,
            language: form.language.value,
            top_image: form.top_image.value,
            summary: form.summary.value,
            content: form.content.value, // text content
            id: Date.now().toString(),
        };
        this.references = [...this.references, newReference];
        this.savePluginData();

        form.reset();
        this.isCreating = false;
    }

    savePluginData() {
        wisk.editor.savePluginData(this.identifier, JSON.stringify({ references: this.references }));
    }

    editReference(id) {
        this.editingId = id;
        this.isCreating = false;
        this.requestUpdate();
    }

    updateReference(event) {
        event.preventDefault();
        const form = event.target;
        // Ensure the publish_date is in YYYY-MM-DD format
        const publishDate = form.publish_date.value ? new Date(form.publish_date.value).toISOString().split('T')[0] : '';
        const updatedReference = {
            title: form.title.value,
            authors: form.authors.value.split(',').map(author => author.trim()),
            url: form.url.value,
            doi: form.doi.value,
            publish_date: publishDate, // Using formatted date
            journal_conference: form.journal_conference.value,
            volume: form.volume.value,
            issue: form.issue.value,
            pages: form.pages.value,
            publisher_name: form.publisher_name.value,
            publisher_location: form.publisher_location.value,
            language: form.language.value,
            top_image: form.top_image.value,
            summary: form.summary.value,
            content: form.content.value,
            id: this.editingId,
        };
        this.references = this.references.map(ref => (ref.id === this.editingId ? updatedReference : ref));
        window.dispatchEvent(new CustomEvent('citation-updated', { detail: { id: this.editingId } }));

        this.savePluginData();
        this.editingId = null;
    }

    deleteReference(id) {
        if (confirm('Are you sure you want to delete this citation?')) {
            this.references = this.references.filter(ref => ref.id !== id);
            this.savePluginData();
        }
    }

    renderForm(reference = {}) {
        return html`
            <form class="form" @submit=${reference.id ? this.updateReference : this.addReference}>
                <div class="field-group">
                    <div class="field-group-title">Essential Information</div>
                    <input class="input" name="title" placeholder="Title *" value=${reference.title || ''} required />
                    <input
                        class="input"
                        name="authors"
                        placeholder="Authors (comma-separated) *"
                        value=${reference.authors ? reference.authors.join(', ') : ''}
                        required
                    />
                    <input class="input" name="publish_date" type="date" placeholder="Publication Date" value=${reference.publish_date || ''} />
                </div>

                <div class="field-group">
                    <div class="field-group-title">Publication Details</div>
                    <input
                        class="input"
                        name="journal_conference"
                        placeholder="Journal/Conference Name"
                        value=${reference.journal_conference || ''}
                    />
                    <input class="input" name="volume" placeholder="Volume" value=${reference.volume || ''} />
                    <input class="input" name="issue" placeholder="Issue Number" value=${reference.issue || ''} />
                    <input class="input" name="pages" placeholder="Page Range (e.g., 123-145)" value=${reference.pages || ''} />
                </div>

                <div class="field-group">
                    <div class="field-group-title">Digital Identifiers</div>
                    <input class="input" name="doi" placeholder="DOI" value=${reference.doi || ''} />
                    <input class="input" name="url" placeholder="URL" value=${reference.url || ''} />
                </div>

                <div class="field-group">
                    <div class="field-group-title">Publisher Information</div>
                    <input class="input" name="publisher_name" placeholder="Publisher Name" value=${reference.publisher_name || ''} />
                    <input class="input" name="publisher_location" placeholder="Publisher Location" value=${reference.publisher_location || ''} />
                </div>

                <div class="field-group">
                    <div class="field-group-title">Additional Information</div>
                    <input class="input" name="language" placeholder="Language" value=${reference.language || ''} />
                    <input class="input" name="top_image" placeholder="Top Image URL" value=${reference.top_image || ''} />
                    <textarea class="textarea" name="summary" placeholder="Summary">${reference.summary || ''}</textarea>
                    <textarea class="textarea" name="content" placeholder="Content">${reference.content || ''}</textarea>
                </div>

                <button class="button" type="submit">${reference.id ? 'Update' : 'Add'} Citation</button>
            </form>
        `;
    }

    render() {
        return html`
            <div class="container">
                <div class="header-actions">
                    <div style="display: flex; gap: var(--gap-2);">
                        <select class="format-select" @change=${e => (this.selectedFormat = e.target.value)}>
                            <option value="apa7">APA 7</option>
                            <option value="mla">MLA</option>
                            <option value="chicago">Chicago</option>
                            <option value="harvard">Harvard</option>
                            <option value="ieee">IEEE</option>
                            <option value="vancouver">Vancouver</option>
                            <option value="asa">ASA</option>
                            <option value="aaa">AAA</option>
                            <option value="nlm">NLM</option>
                            <option value="cse">CSE</option>
                            <option value="ama">AMA</option>
                            <option value="acm">ACM</option>
                            <option value="turabian">Turabian</option>
                        </select>
                        <button class="button" @click=${() => (this.showBibtexModal = true)}>Paste BibTeX</button>
                    </div>
                    <button class="button button-primary" @click=${this.toggleCreateForm}>${this.isCreating ? 'Cancel' : 'Add New Citation'}</button>
                </div>

                ${this.showBibtexModal ? this.renderBibtexModal() : ''}
                ${this.isCreating
                    ? html`<div class="reference">${this.renderForm()}</div>`
                    : html`
                          ${this.references.length == 0 ? html`<div>No citations added yet.</div>` : ''}
                          ${this.references.map(
                              ref => html`
                                  <div
                                      class="reference"
                                      style="flex: ${this.editingId === ref.id ? '1' : 'none'};
                                min-height: ${this.editingId === ref.id ? '200px' : 'auto'}"
                                      id=${'c-' + ref.id}
                                  >
                                      ${this.editingId === ref.id
                                          ? this.renderForm(ref)
                                          : html`
                                                <div class="citation-text">${this.formatCitation(ref)}</div>
                                                <div class="actions">
                                                    <button class="button" @click=${() => this.editReference(ref.id)}>Edit</button>
                                                    <button class="button" @click=${() => this.deleteReference(ref.id)}>Delete</button>
                                                </div>
                                            `}
                                  </div>
                              `
                          )}
                      `}
            </div>
        `;
    }
}

customElements.define('manage-citations', ManageCitations);
