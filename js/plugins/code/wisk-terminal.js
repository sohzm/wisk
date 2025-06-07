class WiskTerminal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.commandHistory = [];
        this.historyIndex = -1;
        this.render();
        this.addGlobalShortcut();
        this.initializeCommands();
    }

    initializeCommands() {
        this.commands = {
            // Core commands
            doc: () => {
                if (typeof wisk !== 'undefined' && wisk.editor && wisk.editor.document) {
                    return wisk.editor.document;
                } else {
                    throw new Error('wisk.editor.document is not available');
                }
            },
            clear: () => {
                this.clearTerminal();
                return null; // No output
            },
            help: () => {
                return {
                    coreCommands: {
                        doc: 'Returns the wisk.editor.document object',
                        clear: 'Clears the terminal',
                        help: 'Shows available commands',
                    },
                    functionalCommands: {
                        'map <fn>': 'Maps over array/object with function',
                        'filter <fn>': 'Filters array/object with predicate function',
                        'reduce <fn> <initial>': 'Reduces array with function and initial value',
                        keys: 'Gets object keys or array indices',
                        values: 'Gets object values or array elements',
                        entries: 'Gets [key, value] pairs',
                        length: 'Gets length/size',
                        'sort <fn?>': 'Sorts array (optional compare function)',
                        reverse: 'Reverses array',
                        'slice <start> <end?>': 'Slices array/string',
                        'pick <...keys>': 'Picks specified keys from object',
                        'head <n?>': 'Gets first n elements (default 10)',
                        'tail <n?>': 'Gets last n elements (default 10)',
                        flatten: 'Flattens a nested object',
                        'grep <pattern>': 'Searches for pattern in keys and values (like search)',
                        'grep -k <pattern>': 'Searches for pattern in keys only',
                        'grep -v <pattern>': 'Searches for pattern in values only',
                        ls: 'Lists keys (alias for keys)',
                        wc: 'Word/length count (alias for length)',
                        'cut <...keys>': 'Cuts/picks specified keys (alias for pick)',
                        text: 'Extracts textContent from elements',
                        'get <path>': 'Gets nested property using dot notation (e.g., data.elements)',
                        'pluck <key>': 'Extracts single property value (like pick but unwrapped)',
                        'at <index>': 'Gets element at specified index',
                    },
                    examples: {
                        'doc | ls': 'List document keys (Unix-style)',
                        'doc | keys | map (x => x.toUpperCase())': 'Get uppercase keys',
                        'doc | cut pages blocks': 'Cut/pick specific keys from doc',
                        '[1,2,3,4,5] | filter (x => x > 2) | map (x => x * 2)': 'Functional chain',
                        'doc | flatten | grep -k theme': 'Flatten document and grep for theme in keys',
                        'doc | flatten | grep theme': 'Flatten document and grep for theme anywhere',
                        'doc | wc': 'Get document size (word count style)',
                        'doc | get data.elements | text': 'Get text from all document elements',
                        'doc | pluck data | pluck elements | text': 'Alternative way to get element text',
                    },
                };
            },

            // Functional programming commands
            map: (input, fnStr) => {
                const fn = this.parseFunction(fnStr);
                if (Array.isArray(input)) {
                    return input.map(fn);
                } else if (typeof input === 'object' && input !== null) {
                    const result = {};
                    for (const [key, value] of Object.entries(input)) {
                        result[key] = fn(value, key);
                    }
                    return result;
                }
                throw new Error('map: input must be array or object');
            },

            filter: (input, fnStr) => {
                const fn = this.parseFunction(fnStr);
                if (Array.isArray(input)) {
                    return input.filter(fn);
                } else if (typeof input === 'object' && input !== null) {
                    const result = {};
                    for (const [key, value] of Object.entries(input)) {
                        if (fn(value, key)) {
                            result[key] = value;
                        }
                    }
                    return result;
                }
                throw new Error('filter: input must be array or object');
            },

            flatten: (input, separator = '.') => {
                if (typeof input !== 'object' || input === null) {
                    throw new Error('flatten: input must be object');
                }

                const result = {};

                function flattenRecursive(obj, prefix = '') {
                    for (const [key, value] of Object.entries(obj)) {
                        const newKey = prefix ? `${prefix}${separator}${key}` : key;

                        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                            flattenRecursive(value, newKey);
                        } else {
                            result[newKey] = value;
                        }
                    }
                }

                flattenRecursive(input);
                return result;
            },

            search: (input, searchTerm) => {
                if (!searchTerm) {
                    throw new Error('search: search term is required');
                }

                if (Array.isArray(input)) {
                    return input.filter(item => String(item).toLowerCase().includes(searchTerm.toLowerCase()));
                } else if (typeof input === 'object' && input !== null) {
                    const result = {};
                    for (const [key, value] of Object.entries(input)) {
                        if (key.toLowerCase().includes(searchTerm.toLowerCase()) || String(value).toLowerCase().includes(searchTerm.toLowerCase())) {
                            result[key] = value;
                        }
                    }
                    return result;
                }
                throw new Error('search: input must be array or object');
            },

            searchKeys: (input, searchTerm) => {
                if (!searchTerm) {
                    throw new Error('searchKeys: search term is required');
                }

                if (typeof input !== 'object' || input === null) {
                    throw new Error('searchKeys: input must be object');
                }

                const result = {};
                for (const [key, value] of Object.entries(input)) {
                    if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
                        result[key] = value;
                    }
                }
                return result;
            },

            searchValues: (input, searchTerm) => {
                if (!searchTerm) {
                    throw new Error('searchValues: search term is required');
                }

                if (typeof input !== 'object' || input === null) {
                    throw new Error('searchValues: input must be object');
                }

                const result = {};
                for (const [key, value] of Object.entries(input)) {
                    if (String(value).toLowerCase().includes(searchTerm.toLowerCase())) {
                        result[key] = value;
                    }
                }
                return result;
            },

            reduce: (input, fnStr, initialStr) => {
                const fn = this.parseFunction(fnStr);
                let initial;
                try {
                    initial = initialStr ? JSON.parse(initialStr) : undefined;
                } catch (e) {
                    initial = initialStr;
                }

                if (Array.isArray(input)) {
                    return initial !== undefined ? input.reduce(fn, initial) : input.reduce(fn);
                } else if (typeof input === 'object' && input !== null) {
                    const entries = Object.entries(input);
                    return initial !== undefined ? entries.reduce(fn, initial) : entries.reduce(fn);
                }
                throw new Error('reduce: input must be array or object');
            },

            keys: input => {
                if (Array.isArray(input)) {
                    return Array.from(input.keys());
                } else if (typeof input === 'object' && input !== null) {
                    return Object.keys(input);
                }
                throw new Error('keys: input must be array or object');
            },

            values: input => {
                if (Array.isArray(input)) {
                    return [...input];
                } else if (typeof input === 'object' && input !== null) {
                    return Object.values(input);
                }
                throw new Error('values: input must be array or object');
            },

            entries: input => {
                if (Array.isArray(input)) {
                    return Array.from(input.entries());
                } else if (typeof input === 'object' && input !== null) {
                    return Object.entries(input);
                }
                throw new Error('entries: input must be array or object');
            },

            length: input => {
                if (Array.isArray(input) || typeof input === 'string') {
                    return input.length;
                } else if (typeof input === 'object' && input !== null) {
                    return Object.keys(input).length;
                }
                throw new Error('length: input must be array, string, or object');
            },

            sort: (input, fnStr) => {
                if (!Array.isArray(input)) {
                    throw new Error('sort: input must be array');
                }
                const copy = [...input];
                if (fnStr) {
                    const fn = this.parseFunction(fnStr);
                    return copy.sort(fn);
                }
                return copy.sort();
            },

            reverse: input => {
                if (!Array.isArray(input)) {
                    throw new Error('reverse: input must be array');
                }
                return [...input].reverse();
            },

            slice: (input, startStr, endStr) => {
                const start = parseInt(startStr) || 0;
                const end = endStr ? parseInt(endStr) : undefined;

                if (Array.isArray(input) || typeof input === 'string') {
                    return input.slice(start, end);
                }
                throw new Error('slice: input must be array or string');
            },

            pick: (input, ...keys) => {
                if (typeof input !== 'object' || input === null) {
                    throw new Error('pick: input must be object');
                }
                const result = {};
                for (const key of keys) {
                    if (key in input) {
                        result[key] = input[key];
                    }
                }
                return result;
            },

            head: (input, nStr = '10') => {
                const n = parseInt(nStr) || 10;
                if (Array.isArray(input)) {
                    return input.slice(0, n);
                } else if (typeof input === 'string') {
                    return input.slice(0, n);
                }
                throw new Error('head: input must be array or string');
            },

            tail: (input, nStr = '10') => {
                const n = parseInt(nStr) || 10;
                if (Array.isArray(input)) {
                    return input.slice(-n);
                } else if (typeof input === 'string') {
                    return input.slice(-n);
                }
                throw new Error('tail: input must be array or string');
            },

            // grep commands (Linux-style search)
            grep: (input, ...args) => {
                // Handle flags: -k for keys only, -v for values only
                let searchKeys = true;
                let searchValues = true;
                let pattern = '';

                for (let i = 0; i < args.length; i++) {
                    if (args[i] === '-k') {
                        searchKeys = true;
                        searchValues = false;
                    } else if (args[i] === '-v') {
                        searchKeys = false;
                        searchValues = true;
                    } else {
                        pattern = args[i];
                        break;
                    }
                }

                if (!pattern) {
                    throw new Error('grep: pattern is required');
                }

                if (Array.isArray(input)) {
                    return input.filter(item => String(item).toLowerCase().includes(pattern.toLowerCase()));
                } else if (typeof input === 'object' && input !== null) {
                    const result = {};
                    for (const [key, value] of Object.entries(input)) {
                        const keyMatch = searchKeys && key.toLowerCase().includes(pattern.toLowerCase());
                        const valueMatch = searchValues && String(value).toLowerCase().includes(pattern.toLowerCase());
                        if (keyMatch || valueMatch) {
                            result[key] = value;
                        }
                    }
                    return result;
                }
                throw new Error('grep: input must be array or object');
            },

            // Unix-style aliases
            ls: input => {
                return this.commands.keys(input);
            },

            wc: input => {
                return this.commands.length(input);
            },

            cut: (input, ...keys) => {
                return this.commands.pick(input, ...keys);
            },

            // Document-specific helpers
            text: input => {
                if (Array.isArray(input)) {
                    return input
                        .map(item => (item && item.textContent ? item.textContent : item))
                        .filter(text => text && typeof text === 'string' && text.trim());
                } else if (input && input.textContent) {
                    return input.textContent;
                }
                throw new Error('text: input must be array of elements or single element with textContent');
            },

            // Property navigation helpers
            get: (input, propertyPath) => {
                if (!propertyPath) {
                    throw new Error('get: property path is required');
                }

                const path = propertyPath.split('.');
                let current = input;

                for (const prop of path) {
                    if (current && typeof current === 'object' && prop in current) {
                        current = current[prop];
                    } else {
                        return undefined;
                    }
                }

                return current;
            },

            pluck: (input, key) => {
                if (!key) {
                    throw new Error('pluck: key is required');
                }

                if (typeof input !== 'object' || input === null) {
                    throw new Error('pluck: input must be object');
                }

                // Return just the value, not wrapped in an object
                return input[key];
            },

            at: (input, indexStr) => {
                if (!Array.isArray(input)) {
                    throw new Error('at: input must be array');
                }

                const index = parseInt(indexStr);
                if (isNaN(index)) {
                    throw new Error('at: index must be a number');
                }

                // Support negative indexing like JavaScript array.at()
                return input.at(index);
            },
        };
    }

    parseFunction(fnStr) {
        if (!fnStr) {
            throw new Error('Function string is required');
        }

        // Handle arrow functions and regular expressions
        try {
            // Simple arrow function parsing
            if (fnStr.includes('=>')) {
                return new Function(`return (${fnStr})`)();
            }
            // Handle function expressions
            if (fnStr.startsWith('function')) {
                return new Function(`return (${fnStr})`)();
            }
            // Handle simple expressions like 'x > 2'
            return new Function('x', 'i', `return (${fnStr})`);
        } catch (e) {
            throw new Error(`Invalid function: ${fnStr}. Error: ${e.message}`);
        }
    }

    parseCommandPipeline(commandString) {
        // Split by | but handle function strings properly
        const parts = [];
        let current = '';
        let inParens = 0;
        let inString = false;
        let stringChar = '';

        for (let i = 0; i < commandString.length; i++) {
            const char = commandString[i];

            if (!inString && (char === '"' || char === "'")) {
                inString = true;
                stringChar = char;
            } else if (inString && char === stringChar && commandString[i - 1] !== '\\') {
                inString = false;
                stringChar = '';
            } else if (!inString && char === '(') {
                inParens++;
            } else if (!inString && char === ')') {
                inParens--;
            } else if (!inString && char === '|' && inParens === 0) {
                parts.push(current.trim());
                current = '';
                continue;
            }

            current += char;
        }

        if (current.trim()) {
            parts.push(current.trim());
        }

        return parts;
    }

    executeCommand(commandString) {
        try {
            // Check if it's a simple literal (array, object, etc.)
            if (this.isLiteralValue(commandString)) {
                const result = this.parseLiteralValue(commandString);
                this.addOutputResult(result);
                return;
            }

            const pipeline = this.parseCommandPipeline(commandString);
            let result = undefined;

            for (let i = 0; i < pipeline.length; i++) {
                const commandPart = pipeline[i].trim();
                const [command, ...args] = this.parseCommandArgs(commandPart);

                if (i === 0) {
                    // First command - check if it's a literal or command
                    if (this.commands[command]) {
                        result = this.commands[command](...args);
                    } else {
                        throw new Error(`Command not found: ${command}. Type 'help' for available commands.`);
                    }
                } else {
                    // Subsequent commands - pass previous result as first argument
                    if (this.commands[command]) {
                        result = this.commands[command](result, ...args);
                    } else {
                        throw new Error(`Command not found: ${command}`);
                    }
                }

                // If result is null (like from clear), stop pipeline
                if (result === null) {
                    return;
                }
            }

            // Display final result if it exists
            if (result !== null && result !== undefined) {
                this.addOutputResult(result);
            }
        } catch (error) {
            this.addOutputError(error.message);
        }
    }

    isLiteralValue(str) {
        const trimmed = str.trim();
        return (
            (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
            (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            !isNaN(Number(trimmed)) ||
            (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))
        );
    }

    parseLiteralValue(str) {
        const trimmed = str.trim();
        try {
            return JSON.parse(trimmed);
        } catch (e) {
            // If JSON parse fails, try as number or return as string
            if (!isNaN(Number(trimmed))) {
                return Number(trimmed);
            }
            return trimmed;
        }
    }

    parseCommandArgs(commandStr) {
        // Simple argument parsing that handles quotes and parentheses
        const args = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        let inParens = 0;

        for (let i = 0; i < commandStr.length; i++) {
            const char = commandStr[i];

            if (!inQuotes && (char === '"' || char === "'")) {
                inQuotes = true;
                quoteChar = char;
                current += char;
            } else if (inQuotes && char === quoteChar && commandStr[i - 1] !== '\\') {
                inQuotes = false;
                current += char;
            } else if (!inQuotes && char === '(') {
                inParens++;
                current += char;
            } else if (!inQuotes && char === ')') {
                inParens--;
                current += char;
            } else if (!inQuotes && char === ' ' && inParens === 0) {
                if (current.trim()) {
                    args.push(current.trim());
                    current = '';
                }
            } else {
                current += char;
            }
        }

        if (current.trim()) {
            args.push(current.trim());
        }

        return args;
    }

    addGlobalShortcut() {
        document.addEventListener('keydown', e => {
            // ctrl + ` to toggle terminal
            if ((e.ctrlKey || e.metaKey) && e.key === '`') {
                e.preventDefault();
                e.stopPropagation();
                this.toggle();
            }
        });
    }

    connectedCallback() {
        this.addPromptLine();
    }

    addPromptLine() {
        const output = this.shadowRoot.querySelector('#terminal-output');
        const promptLine = document.createElement('div');
        promptLine.classList.add('prompt-line');
        promptLine.innerHTML = `<span class="terminal-prompt">$ </span><input type="text" class="terminal-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />`;
        output.appendChild(promptLine);

        const input = promptLine.querySelector('.terminal-input');
        input.addEventListener('keydown', this.handleInput.bind(this));
        input.focus();

        // Auto-scroll to bottom
        output.scrollTop = output.scrollHeight;
    }

    handleInput(e) {
        const input = e.target;
        const inputValue = input.value.trim();

        if (e.key === 'Escape') {
            this.hide();
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();

            if (inputValue) {
                // Add to history
                this.commandHistory.push(inputValue);
                this.historyIndex = this.commandHistory.length;

                // Convert current input to static text
                const promptLine = input.closest('.prompt-line');
                promptLine.innerHTML = `<span class="terminal-prompt">$ </span><span>${inputValue}</span>`;
                promptLine.classList.remove('prompt-line');
                promptLine.classList.add('output-line');

                // Execute command
                this.executeCommand(inputValue);
            } else {
                // Just convert empty input to static line
                const promptLine = input.closest('.prompt-line');
                promptLine.innerHTML = `<span class="terminal-prompt">$ </span>`;
                promptLine.classList.remove('prompt-line');
                promptLine.classList.add('output-line');
            }

            // Add new prompt line
            this.addPromptLine();
            return;
        }

        // Handle history navigation
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                input.value = this.commandHistory[this.historyIndex];
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                input.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                input.value = '';
            }
            return;
        }
    }

    addOutputResult(result) {
        console.log('addOutputResult', result);
        const output = this.shadowRoot.querySelector('#terminal-output');
        const line = document.createElement('div');
        line.classList.add('output-line');

        // Check if result is an object (but not null)
        if (typeof result === 'object' && result !== null) {
            // Add special class for lines with visualizers
            line.classList.add('has-visualizer');

            // Create obj-visualizer-element
            const visualizer = document.createElement('obj-visualizer-element');
            visualizer.object = JSON.stringify(result, null, 2);
            line.appendChild(visualizer);
        } else {
            // Handle primitive values
            line.textContent = String(result);
        }

        // Insert before the current prompt line
        const promptLine = this.shadowRoot.querySelector('.prompt-line');
        if (promptLine) {
            output.insertBefore(line, promptLine);
        } else {
            output.appendChild(line);
        }

        // Auto-scroll to bottom
        output.scrollTop = output.scrollHeight;
    }

    addOutputError(errorMessage) {
        const output = this.shadowRoot.querySelector('#terminal-output');
        const line = document.createElement('div');
        line.classList.add('output-line', 'error-line');
        line.textContent = `Error: ${errorMessage}`;

        // Insert before the current prompt line
        const promptLine = this.shadowRoot.querySelector('.prompt-line');
        if (promptLine) {
            output.insertBefore(line, promptLine);
        } else {
            output.appendChild(line);
        }

        // Auto-scroll to bottom
        output.scrollTop = output.scrollHeight;
    }

    addOutputLine(text) {
        const output = this.shadowRoot.querySelector('#terminal-output');
        const line = document.createElement('div');
        line.classList.add('output-line');
        line.textContent = text;

        // Insert before the current prompt line
        const promptLine = this.shadowRoot.querySelector('.prompt-line');
        if (promptLine) {
            output.insertBefore(line, promptLine);
        } else {
            output.appendChild(line);
        }

        // Auto-scroll to bottom
        output.scrollTop = output.scrollHeight;
    }

    clearTerminal() {
        const output = this.shadowRoot.querySelector('#terminal-output');
        output.innerHTML = '';
        this.historyIndex = -1;
        this.commandHistory = [];
    }

    show() {
        this.shadowRoot.querySelector('#terminal').classList.remove('displayNone');
        const input = this.shadowRoot.querySelector('.terminal-input');
        if (input) input.focus();
    }

    hide() {
        this.shadowRoot.querySelector('#terminal').classList.add('displayNone');
    }

    toggle() {
        const terminal = this.shadowRoot.querySelector('#terminal');
        if (terminal.classList.contains('displayNone')) {
            this.show();
        } else {
            this.hide();
        }
    }

    render() {
        const innerHTML = `
            <style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                font-family: var(--font-mono, 'Courier New', monospace);
            }
            
            #terminal {
                bottom: 0;
                left: 0;
                width: 100%;
                height: 45%;
                position: fixed;
                background-color: var(--bg-1);
                border-top: 1px solid var(--border-1);
                z-index: 99;
                display: flex;
                flex-direction: column;
                transition: all 0.2s ease;
                transform: translateY(0);
            }
            
            @starting-style {
                #terminal {
                    transform: translateY(100%);
                }
            }
            
            #terminal.displayNone {
                display: none !important;
            }
            
            #terminal-header {
                padding: var(--padding-2) var(--padding-4);
                color: var(--fg-2);
                font-size: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: fixed;
                right: 0;
            }
            
            #terminal-output {
                flex: 1;
                padding: var(--padding-2) var(--padding-4);
                overflow-y: auto;
                background-color: var(--bg-1);
                color: var(--fg-1);
                font-size: 14px;
                line-height: 1.4;
            }
            
            .output-line, .prompt-line {
                white-space: pre-wrap;
                word-break: break-all;
                display: flex;
                align-items: baseline;
                margin-bottom: 4px;
            }

            .output-line.has-visualizer {
                align-items: flex-start;
                flex-direction: column;
                margin-bottom: 8px;
            }

            .output-line.error-line {
                color: var(--red);
                font-weight: 500;
            }

            .output-line obj-visualizer-element {
                width: 100%;
                margin-top: 0px;
                align-self: stretch;
            }
            
            .terminal-prompt {
                color: var(--fg-accent);
                font-weight: 500;
                user-select: none;
                flex-shrink: 0;
            }
            
            .terminal-input {
                flex: 1;
                background: transparent;
                border: none;
                outline: none;
                color: var(--fg-1);
                font-size: 14px;
                font-family: var(--font-mono, 'Courier New', monospace);
                margin-left: 0;
                padding: 0;
            }
            
            @media (hover: hover) {
                #terminal-output::-webkit-scrollbar { width: 8px; }
                #terminal-output::-webkit-scrollbar-track { background: var(--bg-1); }
                #terminal-output::-webkit-scrollbar-thumb { 
                    background-color: var(--bg-3); 
                    border-radius: 4px; 
                }
                #terminal-output::-webkit-scrollbar-thumb:hover { 
                    background-color: var(--fg-2); 
                }
            }
            
            .close-button {
                background: none;
                border: none;
                color: var(--fg-2);
                cursor: pointer;
                padding: var(--padding-1);
                border-radius: var(--radius);
                font-size: 12px;
                display: flex;
            }
            
            .close-button:hover {
                background-color: var(--bg-3);
                color: var(--fg-1);
            }

            .close-button-icon {
                width: 22px;
                height: 22px;
                filter: var(--themed-svg);
            }
            </style>
            
            <div id="terminal" class="displayNone">
                <div id="terminal-header">
                    <span></span>
                    <button class="close-button" onclick="this.getRootNode().host.hide()">
                        <img src="/a7/forget/x.svg" alt="Close" class="close-button-icon" />
                    </button>
                </div>
                <div id="terminal-output"></div>
            </div>
        `;

        this.shadowRoot.innerHTML = innerHTML;
    }
}

customElements.define('wisk-terminal', WiskTerminal);

// Register command to show terminal
if (typeof wisk !== 'undefined' && wisk.editor && wisk.editor.registerCommand) {
    wisk.editor.registerCommand(
        'Terminal',
        'Open the integrated terminal',
        'Developer',
        () => {
            const terminal = document.querySelector('wisk-terminal');
            if (terminal) {
                terminal.show();
            }
        },
        'Ctrl+`'
    );
}

document.body.appendChild(document.createElement('wisk-terminal'));
document.querySelector('wisk-terminal').style.zIndex = 92;
document.querySelector('wisk-terminal').style.position = 'fixed';
