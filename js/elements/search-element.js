class SearchElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
        this.addGlobalShortcut();
        this.searchResults = [];
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

    connectedCallback() {
        this.shadowRoot.querySelector('#selector-input').addEventListener('keydown', this.handleInput.bind(this));
        this.shadowRoot.querySelector('#selector-input').addEventListener('keyup', this.handleInput.bind(this));
        this.shadowRoot.querySelector('#selector-bg').addEventListener('click', this.hide.bind(this));
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

                    // Search through all elements with textContent
                    for (const element of item.data.elements) {
                        if (element.value && element.value.textContent) {
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
                                    id: key,
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
            } catch (error) {
                console.error(`Error searching item ${key}:`, error);
            }
        }

        return results;
    }

    navigateToResult(id) {
        this.hide();
        window.location.href = `/?id=${id}`;
    }

    async handleInput(e) {
        if (e.keyCode === 27) {
            this.hide();
            return;
        }

        if (e.type === 'keyup' && (e.keyCode == 13 || e.keyCode == 38 || e.keyCode == 40)) {
            return;
        }

        if (e.keyCode === 13) {
            const focusedButton = this.shadowRoot.querySelector('.search-result-focused');
            if (focusedButton) {
                e.preventDefault();
                const pageId = focusedButton.getAttribute('data-id');
                this.navigateToResult(pageId);
            }
            return;
        }

        if (e.keyCode === 38 || e.keyCode === 40) {
            e.preventDefault();
            const results = this.shadowRoot.querySelectorAll('.search-result');
            let focusedResult = this.shadowRoot.querySelector('.search-result-focused');
            let nextResult;

            if (focusedResult) {
                focusedResult.classList.remove('search-result-focused');
                if (e.keyCode === 38) {
                    // Up arrow
                    nextResult = this.getPreviousResult(focusedResult);
                } else {
                    // Down arrow
                    nextResult = this.getNextResult(focusedResult);
                }
            } else {
                nextResult = results[0];
            }

            if (nextResult) {
                nextResult.classList.add('search-result-focused');
                nextResult.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest',
                });
            }
            return;
        }

        // Handle search input (with debounce)
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(async () => {
            await this.renderSearchResults(e.target.value);
        }, 300);
    }

    getPreviousResult(currentResult) {
        let previousElement = currentResult.previousElementSibling;
        while (previousElement && !previousElement.classList.contains('search-result')) {
            previousElement = previousElement.previousElementSibling;
        }
        if (!previousElement) {
            const results = this.shadowRoot.querySelectorAll('.search-result');
            previousElement = results[results.length - 1];
        }
        return previousElement;
    }

    getNextResult(currentResult) {
        let nextElement = currentResult.nextElementSibling;
        while (nextElement && !nextElement.classList.contains('search-result')) {
            nextElement = nextElement.nextElementSibling;
        }
        if (!nextElement) {
            const results = this.shadowRoot.querySelectorAll('.search-result');
            nextElement = results[0];
        }
        return nextElement;
    }

    async renderSearchResults() {
        const query = this.shadowRoot.querySelector('#selector-input').value;

        const resultsContainer = this.shadowRoot.querySelector('.results');
        resultsContainer.innerHTML = '';

        if (!query || query.trim() === '') {
            this.shadowRoot.querySelector('.search-status').textContent = 'Type to search documents...';
            return;
        }

        this.shadowRoot.querySelector('.search-status').textContent = 'Searching...';

        try {
            const searchResults = await this.searchWiskDatabase(query);
            this.searchResults = searchResults;

            if (searchResults.length === 0) {
                this.shadowRoot.querySelector('.search-status').textContent = 'No results found';
                return;
            }

            this.shadowRoot.querySelector('.search-status').textContent =
                `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`;

            // Group results by page
            const resultsByPage = {};
            searchResults.forEach(result => {
                if (!resultsByPage[result.id]) {
                    resultsByPage[result.id] = {
                        pageName: result.pageName,
                        matches: [],
                    };
                }
                resultsByPage[result.id].matches.push(result);
            });

            // Render results grouped by page
            Object.entries(resultsByPage).forEach(([pageId, pageData]) => {
                const pageHeader = document.createElement('div');
                pageHeader.classList.add('page-header');
                pageHeader.textContent = pageData.pageName;
                resultsContainer.appendChild(pageHeader);

                pageData.matches.forEach(match => {
                    const resultElement = this.createSearchResultElement(match);
                    resultsContainer.appendChild(resultElement);
                });
            });

            // Focus on the first result
            const firstResult = this.shadowRoot.querySelector('.search-result');
            if (firstResult) {
                firstResult.classList.add('search-result-focused');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.shadowRoot.querySelector('.search-status').textContent = 'Error searching documents';
        }
    }

    createSearchResultElement(result) {
        const resultElement = document.createElement('div');
        resultElement.classList.add('search-result');
        resultElement.setAttribute('data-id', result.id);

        // Create result content with highlighted match
        const contentElement = document.createElement('div');
        contentElement.classList.add('result-content');

        // Get the component type label
        const componentType = document.createElement('span');
        componentType.classList.add('component-type');
        componentType.textContent = this.getComponentTypeLabel(result.component);
        contentElement.appendChild(componentType);

        // Create the snippet with highlighted match
        const snippetElement = document.createElement('div');
        snippetElement.classList.add('result-snippet');

        const beforeMatch = result.snippet.substring(0, result.matchStart);
        const match = result.snippet.substring(result.matchStart, result.matchStart + result.matchLength);
        const afterMatch = result.snippet.substring(result.matchStart + result.matchLength);

        snippetElement.innerHTML = beforeMatch + `<span class="highlight">${match}</span>` + afterMatch;

        contentElement.appendChild(snippetElement);
        resultElement.appendChild(contentElement);

        // Create open button
        const openButton = document.createElement('button');
        openButton.classList.add('open-button');
        openButton.textContent = 'Open';
        openButton.addEventListener('click', () => {
            this.navigateToResult(result.id);
        });
        resultElement.appendChild(openButton);

        // Handle mouseover to focus
        resultElement.addEventListener('mouseover', () => {
            this.focusOnResult(resultElement);
        });

        return resultElement;
    }

    getComponentTypeLabel(componentType) {
        const componentMap = {
            'main-element': 'Title',
            'text-element': 'Text',
            'image-element': 'Image',
            'code-element': 'Code',
            'embed-element': 'Embed',
            'list-element': 'List',
            'table-element': 'Table',
        };

        return componentMap[componentType] || componentType;
    }

    focusOnResult(resultElement) {
        const results = this.shadowRoot.querySelectorAll('.search-result');
        results.forEach(res => {
            res.classList.remove('search-result-focused');
        });
        resultElement.classList.add('search-result-focused');
    }

    show() {
        this.shadowRoot.querySelector('#selector-input').value = '';
        this.shadowRoot.querySelector('#selector').classList.remove('displayNone');
        this.shadowRoot.querySelector('#selector-bg').classList.remove('displayNone');
        this.shadowRoot.querySelector('#selector-input').focus();
        this.shadowRoot.querySelector('.results').innerHTML = '';
        this.shadowRoot.querySelector('.search-status').textContent = 'Type to search documents...';
    }

    hide() {
        this.shadowRoot.querySelector('#selector').classList.add('displayNone');
        this.shadowRoot.querySelector('#selector-bg').classList.add('displayNone');
    }

    render() {
        const innerHTML = `
            <style>
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
                margin: var(--padding-3) 0 var(--padding-2) 0;
                padding-bottom: var(--padding-2);
                border-bottom: 1px solid var(--bg-3);
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
                *::-webkit-scrollbar { width: 15px; }
                *::-webkit-scrollbar-track { background: var(--bg-1); }
                *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
                *::-webkit-scrollbar-thumb:hover { background-color: var(--fg-1); }
            }
            </style>
            <div id="selector-bg" class="displayNone"></div>
            <div id="selector" class="displayNone">
                <div class="search-div">
                    <input type="text" id="selector-input" placeholder="Search documents..."
                       autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
                </div>
                <div class="results">
                    <!-- Search results will be inserted here -->
                </div>
                <div class="search-status">Type to search documents...</div>
                <div class="navigation">
                    <p><b>Arrow keys</b> to navigate, <b>Enter</b> to open, <b>Esc</b> to close</p>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = innerHTML;
    }
}

customElements.define('search-element', SearchElement);
