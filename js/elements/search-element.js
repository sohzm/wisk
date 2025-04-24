import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class SearchElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            padding: 0;
            margin: 0;
            font-family: var(--font);
        }
        #selector-bg {
            width: 100%;
            height: 100%;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 99;
            background: var(--fg-2);
            opacity: 0.4;
        }
        #selector {
            top: 10%;
            left: 50%;
            width: 90%;
            max-width: 720px;
            position: fixed;
            transform: translate(-50%, 0) translateZ(0);
            background-color: var(--bg-1);
            border-radius: var(--radius-large);
            z-index: 100;
            padding: 0;
            overflow: hidden;
            transition: all 0.1s;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
        }
        @starting-style {
            #selector {
                top: 20%;
                opacity: 0;
            }
        }
        .displayNone {
            display: none;
        }
        #selector-input {
            width: 100%;
            outline: none;
            font-size: 20px;
            font-weight: 500;
            padding: var(--padding-3);
            border: none;
            background-color: transparent;
            color: var(--fg-1);
        }
        .results {
            display: flex;
            flex-direction: column;
            max-height: 400px;
            overflow-y: auto;
            padding: var(--padding-4);
        }
        .search-result {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--padding-3) var(--padding-4);
            border-radius: var(--radius);
            margin-bottom: var(--padding-4);
            cursor: pointer;
            background-color: var(--bg-2);
        }
        .search-result-focused {
            background-color: var(--bg-3);
        }
        .result-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: var(--gap-1);
        }
        .component-type {
            font-size: 12px;
            color: var(--fg-2);
            font-weight: 500;
        }
        .result-snippet {
            font-size: 14px;
            color: var(--fg-2);
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 500px;
        }
        .highlight {
            background-color: var(--fg-accent);
            color: var(--bg-accent);
            padding: 0 2px;
            border-radius: 2px;
            font-weight: 500;
        }
        .open-button {
            background-color: var(--fg-accent);
            color: var(--bg-accent);
            border: none;
            padding: var(--padding-2) var(--padding-3);
            border-radius: var(--radius);
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            white-space: nowrap;
        }
        .open-button:hover {
            opacity: 0.9;
        }
        .search-div {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-2);
            border-radius: var(--radius-large);
            background-color: var(--bg-1);
            border: none;
            border-bottom: 1px solid var(--bg-3);
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            padding: var(--padding-4) calc(var(--padding-4) * 2);
        }
        .page-header {
            color: var(--fg-1);
            font-size: 16px;
            font-weight: 500;
            margin: var(--padding-4) 0;
            text-align: center;
            display: none;
        }
        .search-status {
            padding: var(--padding-3) var(--padding-4);
            text-align: center;
            font-size: 14px;
            color: var(--fg-2);
            border-top: 1px solid var(--bg-3);
        }
        .navigation {
            padding: var(--padding-3);
            text-align: center;
            font-size: 12px;
            color: var(--fg-2);
            user-select: none;
            border-top: 1px solid var(--bg-3);
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
        isVisible: { type: Boolean },
        searchQuery: { type: String },
        searchStatus: { type: String },
        resultsByPage: { type: Object },
        focusedResultId: { type: String },
    };

    constructor() {
        super();
        this.isVisible = false;
        this.searchQuery = '';
        this.searchStatus = 'Type to search documents...';
        this.resultsByPage = {};
        this.focusedResultId = null;
        this._searchDebounceTimeout = null;
        this._allResults = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this.addGlobalShortcut();
    }

    addGlobalShortcut() {
        document.addEventListener('keydown', e => {
            // ctrl shift f
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 70) {
                e.preventDefault();
                this.show();
            }
        });
    }

    show() {
        this.isVisible = true;
        this.searchQuery = '';
        this.resultsByPage = {};
        this.searchStatus = 'Type to search documents...';
        this.focusedResultId = null;
        // Focus on the input after the component updates
        this.updateComplete.then(() => {
            this.renderRoot.querySelector('#selector-input').focus();
        });
    }

    hide() {
        this.isVisible = false;
    }

    async _performSearch(query) {
        if (!query || query.trim() === '') {
            this.resultsByPage = {};
            this.searchStatus = 'Type to search documents...';
            this._allResults = [];
            return;
        }

        this.searchStatus = 'Searching...';

        try {
            const searchResults = await this.searchWiskDatabase(query);
            this._allResults = searchResults;

            if (searchResults.length === 0) {
                this.resultsByPage = {};
                this.searchStatus = 'No results found';
                return;
            }

            // Group results by page
            const newResultsByPage = {};
            searchResults.forEach(result => {
                if (!newResultsByPage[result.id]) {
                    newResultsByPage[result.id] = {
                        pageName: result.pageName,
                        matches: [],
                    };
                }
                newResultsByPage[result.id].matches.push({
                    ...result,
                    uniqueId: `result-${result.id}-${result.elementId}`, // Create a unique ID for each result
                });
            });

            this.resultsByPage = newResultsByPage;
            this.searchStatus = `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`;

            // Focus the first result after update
            this.updateComplete.then(() => {
                const firstResult = Object.values(this.resultsByPage)[0]?.matches[0];
                if (firstResult) {
                    this.focusedResultId = firstResult.uniqueId;
                }
            });
        } catch (error) {
            console.error('Search error:', error);
            this.searchStatus = 'Error searching documents';
            this.resultsByPage = {};
        }
    }

    handleSearchInput(e) {
        this.searchQuery = e.target.value;

        // Debounce search
        clearTimeout(this._searchDebounceTimeout);
        this._searchDebounceTimeout = setTimeout(() => {
            this._performSearch(this.searchQuery);
        }, 300);
    }

    handleKeyDown(e) {
        // Handle key navigation
        if (e.keyCode === 27) {
            // Esc
            this.hide();
            return;
        } else if (e.keyCode === 13) {
            // Enter
            if (this.focusedResultId) {
                const [_, pageId] = this.focusedResultId.split('-');
                this.navigateToResult(pageId);
            }
            return;
        } else if (e.keyCode === 38 || e.keyCode === 40) {
            // Up or Down arrows
            e.preventDefault();
            this._navigateResults(e.keyCode === 38 ? 'up' : 'down');
            return;
        }
    }

    _navigateResults(direction) {
        // Flatten all results for navigation
        const allResults = [];
        Object.values(this.resultsByPage).forEach(page => {
            page.matches.forEach(match => {
                allResults.push(match);
            });
        });

        if (allResults.length === 0) return;

        // Find current index
        const currentIndex = allResults.findIndex(r => r.uniqueId === this.focusedResultId);
        let nextIndex;

        if (currentIndex === -1) {
            // No current selection, select first
            nextIndex = 0;
        } else {
            if (direction === 'up') {
                nextIndex = currentIndex - 1;
                if (nextIndex < 0) nextIndex = allResults.length - 1;
            } else {
                nextIndex = currentIndex + 1;
                if (nextIndex >= allResults.length) nextIndex = 0;
            }
        }

        this.focusedResultId = allResults[nextIndex].uniqueId;

        // Scroll to the focused element
        this.updateComplete.then(() => {
            const focusedElement = this.renderRoot.querySelector(`[data-unique-id="${this.focusedResultId}"]`);
            if (focusedElement) {
                focusedElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest',
                });
            }
        });
    }

    navigateToResult(id) {
        this.hide();
        window.location.href = `/?id=${id}`;
    }

    focusResult(uniqueId) {
        this.focusedResultId = uniqueId;
    }

    async searchWiskDatabase(query) {
        if (!query || query.trim() === '') {
            return [];
        }

        query = query.toLowerCase();
        const allKeys = await wisk.db.getAllKeys();
        const results = [];

        for (const key of allKeys) {
            try {
                const item = await wisk.db.getItem(key);

                if (item && item.data && item.data.elements) {
                    // Create a record with the page name if available
                    const pageName = item.data.config && item.data.config.name ? item.data.config.name : 'Untitled Page';

                    // Search through all elements recursively
                    this.searchElementsRecursive(item.data.elements, query, key, pageName, results);
                }
            } catch (error) {
                console.error(`Error searching item ${key}:`, error);
            }
        }

        return results;
    }

    // Recursive function to search through elements, including nested ones in columns
    searchElementsRecursive(elements, query, pageId, pageName, results) {
        for (const element of elements) {
            // Check if this is a column element with nested elements
            if (element.component === 'columns-element' && Array.isArray(element.value)) {
                // Loop through each column
                for (const column of element.value) {
                    if (column.elements && Array.isArray(column.elements)) {
                        // Search through elements in this column
                        this.searchElementsRecursive(column.elements, query, pageId, pageName, results);
                    }
                }
            }
            // Check if the element has text content to search
            else if (element.value && element.value.textContent) {
                // Create a temporary div to parse HTML to text
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = element.value.textContent;
                const plainText = tempDiv.innerText || tempDiv.textContent;

                // Check if the query is found in the plain text
                const lowerText = plainText.toLowerCase();
                if (lowerText.includes(query)) {
                    // Find the position of the match
                    const matchIndex = lowerText.indexOf(query);

                    // Extract a snippet around the match
                    const startPos = Math.max(0, matchIndex - 30);
                    const endPos = Math.min(plainText.length, matchIndex + query.length + 30);
                    let snippet = plainText.substring(startPos, endPos);

                    // Add ellipsis if we're not at the beginning/end
                    if (startPos > 0) snippet = '...' + snippet;
                    if (endPos < plainText.length) snippet += '...';

                    // Create a result object
                    results.push({
                        id: pageId,
                        pageName: pageName,
                        elementId: element.id,
                        snippet: snippet,
                        matchStart: matchIndex - startPos + (startPos > 0 ? 3 : 0),
                        matchLength: query.length,
                        component: element.component,
                    });
                }
            }
        }
    }

    getComponentTypeLabel(componentType) {
        const componentMap = {
            'main-element': 'Title',
            'text-element': 'Text',
            'heading1-element': 'Heading 1',
            'heading2-element': 'Heading 2',
            'heading3-element': 'Heading 3',
            'heading4-element': 'Heading 4',
            'heading5-element': 'Heading 5',
            'image-element': 'Image',
            'video-element': 'Video',
            'code-element': 'Code',
            'list-element': 'List',
            'numbered-list-element': 'Numbered List',
            'checkbox-element': 'Checkbox',
            'quote-element': 'Quote',
            'callout-element': 'Callout',
            'divider-element': 'Divider',
            'columns-element': 'Columns',
            'table-element': 'Table',
            'embed-element': 'Embed',
        };

        return componentMap[componentType] || componentType;
    }

    // Render the highlighted snippet with match highlighting
    renderSnippet(snippet, matchStart, matchLength) {
        const beforeMatch = snippet.substring(0, matchStart);
        const match = snippet.substring(matchStart, matchStart + matchLength);
        const afterMatch = snippet.substring(matchStart + matchLength);

        return html` ${beforeMatch}<span class="highlight">${match}</span>${afterMatch} `;
    }

    render() {
        return html`
            <div id="selector-bg" class="${!this.isVisible ? 'displayNone' : ''}" @click="${this.hide}"></div>
            <div id="selector" class="${!this.isVisible ? 'displayNone' : ''}">
                <div class="search-div">
                    <input
                        type="text"
                        id="selector-input"
                        placeholder="Search documents..."
                        autocomplete="off"
                        autocorrect="off"
                        autocapitalize="off"
                        spellcheck="false"
                        .value="${this.searchQuery}"
                        @input="${this.handleSearchInput}"
                        @keydown="${this.handleKeyDown}"
                    />
                </div>
                <div class="results" style="${this.searchQuery ? '' : 'display: none;'}">
                    ${Object.entries(this.resultsByPage).map(
                        ([pageId, pageData]) => html`
                            <div class="page-header">${pageData.pageName}</div>
                            ${pageData.matches.map(
                                match => html`
                                    <div
                                        class="search-result ${this.focusedResultId === match.uniqueId ? 'search-result-focused' : ''}"
                                        data-id="${match.id}"
                                        data-unique-id="${match.uniqueId}"
                                        @mouseover="${() => this.focusResult(match.uniqueId)}"
                                    >
                                        <div class="result-content">
                                            <span class="component-type">${this.getComponentTypeLabel(match.component)}</span>
                                            <div class="result-snippet">
                                                ${this.renderSnippet(match.snippet, match.matchStart, match.matchLength)}
                                            </div>
                                        </div>
                                        <button class="open-button" @click="${() => this.navigateToResult(match.id)}">Open</button>
                                    </div>
                                `
                            )}
                        `
                    )}
                </div>
                <div class="search-status" style="${this.searchQuery ? '' : 'display: none;'}">${this.searchStatus}</div>
                <div class="navigation" style="${this.searchQuery ? '' : 'display: none;'}">
                    <p><b>Arrow keys</b> to navigate, <b>Enter</b> to open, <b>Esc</b> to close</p>
                </div>
            </div>
        `;
    }
}

customElements.define('search-element', SearchElement);
