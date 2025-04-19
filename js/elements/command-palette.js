// TODO move to lit element
class CommandPalette extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
        this.addGlobalShortcut();
    }

    addGlobalShortcut() {
        document.addEventListener('keydown', e => {
            // ctrl shift p
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 80) {
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

    fuzzySearch(query, text) {
        query = query.toLowerCase();
        text = text.toLowerCase();

        let queryIndex = 0;
        let textIndex = 0;

        while (queryIndex < query.length && textIndex < text.length) {
            if (query[queryIndex] === text[textIndex]) {
                queryIndex++;
            }
            textIndex++;
        }

        return queryIndex === query.length;
    }

    executeCommand(command) {
        this.hide();
        command.callback();
    }

    handleInput(e) {
        if (e.keyCode === 27) {
            this.hide();
            return;
        }

        if (e.type === 'keyup' && (e.keyCode == 13 || e.keyCode == 38 || e.keyCode == 40)) {
            return;
        }

        if (e.keyCode === 13) {
            const focusedButton = this.shadowRoot.querySelector('.selector-button-focused');
            if (focusedButton) {
                e.preventDefault();
                const commandIndex = focusedButton.getAttribute('data-index');
                this.executeCommand(getCommandRegistry()[commandIndex]);
            }
            return;
        }

        if (e.keyCode === 38 || e.keyCode === 40) {
            e.preventDefault();
            const buttons = this.shadowRoot.querySelectorAll('.selector-button');
            let focusedButton = this.shadowRoot.querySelector('.selector-button-focused');
            let nextButton;

            if (focusedButton) {
                focusedButton.classList.remove('selector-button-focused');
                if (e.keyCode === 38) {
                    // Up arrow
                    nextButton = this.getPreviousButton(focusedButton);
                } else {
                    // Down arrow
                    nextButton = this.getNextButton(focusedButton);
                }
            } else {
                nextButton = buttons[0];
            }

            if (nextButton) {
                nextButton.classList.add('selector-button-focused');
                nextButton.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest',
                });
            }
            return;
        }

        this.renderButtons(e.target.value);
    }

    getPreviousButton(currentButton) {
        let previousElement = currentButton.previousElementSibling;
        while (previousElement && !previousElement.classList.contains('selector-button')) {
            previousElement = previousElement.previousElementSibling;
        }
        if (!previousElement) {
            const buttons = this.shadowRoot.querySelectorAll('.selector-button');
            previousElement = buttons[buttons.length - 1];
        }
        return previousElement;
    }

    getNextButton(currentButton) {
        let nextElement = currentButton.nextElementSibling;
        while (nextElement && !nextElement.classList.contains('selector-button')) {
            nextElement = nextElement.nextElementSibling;
        }
        if (!nextElement) {
            const buttons = this.shadowRoot.querySelectorAll('.selector-button');
            nextElement = buttons[0];
        }
        return nextElement;
    }

    renderButtons(query) {
        const buttonsContainer = this.shadowRoot.querySelector('.buttons');
        buttonsContainer.innerHTML = '';

        const commandsByCategory = {};
        getCommandRegistry().forEach((command, index) => {
            if (!commandsByCategory[command.category]) {
                commandsByCategory[command.category] = [];
            }
            commandsByCategory[command.category].push({ ...command, index });
        });

        Object.entries(commandsByCategory).forEach(([category, commands]) => {
            const filteredCommands = commands.filter(
                command => !query || this.fuzzySearch(query, `${command.category} ${command.title} ${command.description}`)
            );

            if (filteredCommands.length > 0) {
                const categoryHeader = document.createElement('div');
                categoryHeader.classList.add('category-header');
                categoryHeader.textContent = category;
                buttonsContainer.appendChild(categoryHeader);

                filteredCommands.forEach(command => {
                    const button = this.createCommandButton(command);
                    buttonsContainer.appendChild(button);
                });
            }
        });

        const firstButton = this.shadowRoot.querySelector('.selector-button');
        if (firstButton) {
            firstButton.classList.add('selector-button-focused');
        }
    }

    createCommandButton(command) {
        const button = document.createElement('button');
        button.classList.add('selector-button');
        button.setAttribute('data-index', command.index);

        const titleSpan = document.createElement('span');
        titleSpan.classList.add('command-title');
        titleSpan.innerHTML = command.category
            ? `${command.category} <?xml version="1.0" encoding="UTF-8"?><svg width="16px" height="16px" stroke-width="2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> ${command.title}`
            : `Other <?xml version="1.0" encoding="UTF-8"?><svg width="16px" height="16px" stroke-width="2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor"><path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> ${command.title}`;

        const descSpan = document.createElement('span');
        descSpan.classList.add('command-description');
        descSpan.textContent = command.description;

        const shortcutSpan = document.createElement('span');
        shortcutSpan.classList.add('command-shortcut');
        shortcutSpan.textContent = command.shortcut;

        button.appendChild(titleSpan);
        button.appendChild(descSpan);
        //button.appendChild(shortcutSpan);

        button.addEventListener('click', () => {
            this.executeCommand(command);
        });

        button.addEventListener('mouseover', () => {
            this.focusOnButton(button);
        });

        return button;
    }

    focusOnButton(button) {
        const buttons = this.shadowRoot.querySelectorAll('.selector-button');
        buttons.forEach(btn => {
            btn.classList.remove('selector-button-focused');
        });
        button.classList.add('selector-button-focused');
    }

    show() {
        this.shadowRoot.querySelector('#selector-input').value = '';
        this.shadowRoot.querySelector('#selector').classList.remove('displayNone');
        this.shadowRoot.querySelector('#selector-bg').classList.remove('displayNone');
        this.shadowRoot.querySelector('#selector-input').focus();
        this.renderButtons('');

        const buttonsContainer = this.shadowRoot.querySelector('.buttons');
        if (buttonsContainer) {
            buttonsContainer.scrollTop = 0;
        }
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
                width: 80%;
                max-width: 720px;
                position: fixed;
                transform: translate(-50%, -00%) translateZ(0);
                background-color: var(--bg-1);
                border-radius: var(--radius-large);
                z-index: 100;
                padding: 0;
                overflow: hidden;
                transition: all 0.1s;
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
                font-size: 30px;
                font-weight: 500;
            }
            .buttons {
                display: flex;
                flex-direction: column;
                max-height: 350px;
                overflow-y: auto;
                padding: var(--padding-4);
            }
            .selector-button {
                outline: none;
                border: 1px solid transparent;
                background-color: var(--bg-1);
                color: var(--fg-1);
                padding: var(--padding-3) var(--padding-4);
                border-radius: var(--radius);
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: var(--gap-2);
                text-align: left;
            }
            .selector-button-focused {
                background-color: var(--fg-accent);
                color: var(--bg-accent);
                font-weight: 500;
            }
            #selector-input {
                width: 100%;
                color: var(--fg-1);
                outline: none;
                border: none;
                background-color: transparent;
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
            .command-title {
                font-family: var(--font);
                flex: 1;
                font-size: 13px;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                gap: var(--gap-2);
                text-align: left;
            }
            .command-description {
                color: var(--fg-2);
                font-size: 0.9em;
            }
            .command-shortcut {
                color: var(--text-3);
                font-size: 0.8em;
            }
            .category-header {
                color: var(--fg-2);
                font-size: 0.8em;
                font-family: var(--font);
                padding: var(--padding-w2);
                display: none;
            }

            @media (hover: hover) {
                *::-webkit-scrollbar { width: 15px; }
                *::-webkit-scrollbar-track { background: var(--bg-1); }
                *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
                *::-webkit-scrollbar-thumb:hover { background-color: var(--fg-1); }
            }
            .navigation {
                padding: var(--padding-w3);
                text-align: center;
                font-size: 12px;
                color: var(--fg-2);
                user-select: none;
            }

            </style>
            <div id="selector-bg" class="displayNone"></div>
            <div id="selector" class="displayNone">
                <div class="search-div">
                    <input type="text" id="selector-input" placeholder="What do you need?"
                       autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
                </div>
                <div class="buttons">
                </div>
                <div>
                    <p class="navigation"><b>Arrow keys</b> to navigate, <b>Enter</b> to select, <b>Esc</b> to close</p>
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = innerHTML;
    }
}

customElements.define('command-palette', CommandPalette);

var commandRegistry = [];

function registerCommand(title, description, category, callback, shortcut = '') {
    // check if the command already exists
    const existingCommand = commandRegistry.find(command => command.title === title);
    if (existingCommand) {
        console.error(`Command "${title} (${category}) > ${description}" already exists.`);
        return;
    }
    commandRegistry.push({ title, description, category, callback, shortcut });
    console.log(`Command registered: ${title} (${category})`);
}

function getCommandRegistry() {
    return commandRegistry.sort((a, b) => {
        if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
        }
        return a.title.localeCompare(b.title);
    });
}

function showCommandPalette() {
    const cp = document.querySelector('command-palette');
    cp.show();
}

// Example commands with categories
//registerCommand("Close File", "Closes the current file", "File", () => console.log("Closing file..."), "Ctrl+W");
//registerCommand("New File", "Creates a new file", "File", () => console.log("Creating new file..."), "Ctrl+N");
//registerCommand("Search", "Searches for a string", "Edit", () => console.log("Searching..."), "Ctrl+F");
//registerCommand("Replace", "Replaces a string", "Edit", () => console.log("Replacing..."), "Ctrl+H");
//registerCommand("Command Palette", "Opens the command palette", "View", showCommandPalette, "Ctrl+K");

wisk.editor.registerCommand = registerCommand;
