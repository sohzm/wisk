class EmacsEditor {
    constructor() {
        this.activeElement = null;
        this.statusIndicator = null;
        this.observers = new Set();
        this.killRing = []; // For kill/yank operations
        this.isControlPressed = false;
        this.isMetaPressed = false;
        this.markActive = false;
        this.lastCommand = null;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing EmacsEditor');
        this.createStatusIndicator();
        this.setupBlockEventListeners();
        this.setupMutationObserver();
        this.processAllElements();
    }

    setupBlockEventListeners() {
        ['block-created', 'block-changed', 'block-deleted', 'block-updated'].forEach(eventType => {
            window.addEventListener(eventType, () => {
                this.processAllElements();
            });
        });
    }

    setupMutationObserver() {
        const observer = new MutationObserver(() => {
            this.processAllElements();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        this.observers.add(observer);
    }

    findEditableElements(root) {
        const elements = [];
        const processRoot = root => {
            const inputs = root.querySelectorAll(
                'input[type="text"], input[type="password"], input[type="search"], input[type="email"], input[type="tel"], input[type="url"], input[type="number"], textarea, [contenteditable="true"]'
            );
            elements.push(...inputs);

            const shadowHosts = root.querySelectorAll('*');
            shadowHosts.forEach(host => {
                if (host.shadowRoot) {
                    processRoot(host.shadowRoot);
                }
            });
        };

        processRoot(root);
        return elements;
    }

    processAllElements() {
        const editableElements = this.findEditableElements(document.body);
        editableElements.forEach(element => this.attachToEditable(element));
    }

    createStatusIndicator() {
        this.statusIndicator = document.createElement('div');
        this.statusIndicator.style.position = 'fixed';
        this.statusIndicator.style.backgroundColor = 'var(--bg-1)';
        this.statusIndicator.style.border = '1px solid var(--border-1)';
        this.statusIndicator.style.color = 'var(--fg-1)';
        this.statusIndicator.style.borderRadius = 'var(--radius)';
        this.statusIndicator.style.padding = 'var(--padding-w2)';
        this.statusIndicator.style.fontFamily = 'monospace';
        this.statusIndicator.style.fontSize = '14px';
        this.statusIndicator.style.zIndex = '10000';
        this.statusIndicator.style.display = 'none';
        this.statusIndicator.style.bottom = 'var(--padding-3)';
        this.statusIndicator.style.left = 'var(--padding-3)';
        this.statusIndicator.style.fontWeight = 'bold';
        document.body.appendChild(this.statusIndicator);
    }

    attachToEditable(element) {
        if (element.dataset.emacsEnabled) {
            return;
        }

        element.dataset.emacsEnabled = 'true';

        element.addEventListener('focus', () => {
            this.activeElement = element;
            this.updateStatus();
            this.statusIndicator.style.display = 'block';
        });

        element.addEventListener('blur', () => {
            this.activeElement = null;
            this.statusIndicator.style.display = 'none';
        });

        element.addEventListener('keydown', e => {
            if (e.key === 'Control') {
                this.isControlPressed = true;
            } else if (e.key === 'Alt') {
                // Alt key serves as Meta in web
                this.isMetaPressed = true;
            }
            this.handleKeydown(e);
            this.updateStatus();
        });

        element.addEventListener('keyup', e => {
            if (e.key === 'Control') {
                this.isControlPressed = false;
            } else if (e.key === 'Alt') {
                this.isMetaPressed = false;
            }
        });
    }

    updateStatus() {
        const statusText = this.markActive ? 'MARK SET' : 'EDITING';
        this.statusIndicator.textContent = statusText;
        this.statusIndicator.style.backgroundColor = this.markActive ? 'var(--bg-purple)' : 'var(--bg-blue)';
        this.statusIndicator.style.color = this.markActive ? 'var(--fg-purple)' : 'var(--fg-blue)';
        this.statusIndicator.style.border = `2px solid ${this.markActive ? 'var(--fg-purple)' : 'var(--fg-blue)'}`;
    }

    handleKeydown(e) {
        if (!this.activeElement) return;

        const isContentEditable = this.activeElement.hasAttribute('contenteditable');

        if (isContentEditable) {
            this.handleContentEditableKeydown(e);
        } else {
            this.handleInputKeydown(e);
        }
    }

    handleInputKeydown(e) {
        const element = this.activeElement;

        // Common Emacs key bindings
        if (this.isControlPressed) {
            switch (e.key) {
                case 'f': // Move forward
                    if (element.selectionStart < element.value.length) {
                        element.setSelectionRange(element.selectionStart + 1, element.selectionStart + 1);
                    }
                    e.preventDefault();
                    return;

                case 'b': // Move backward
                    if (element.selectionStart > 0) {
                        element.setSelectionRange(element.selectionStart - 1, element.selectionStart - 1);
                    }
                    e.preventDefault();
                    return;

                case 'n': // Next line
                    selection.modify('move', 'backward', 'line');
                    this.activeElement.dispatchEvent(
                        new KeyboardEvent('keydown', {
                            key: 'ArrowDown',
                            keyCode: 40,
                            composed: true,
                            bubbles: true,
                        })
                    );
                    e.preventDefault();
                    return;

                case 'p': // Previous line
                    selection.modify('move', 'forward', 'line');
                    this.activeElement.dispatchEvent(
                        new KeyboardEvent('keydown', {
                            key: 'ArrowUp',
                            keyCode: 38,
                            composed: true,
                            bubbles: true,
                        })
                    );
                    e.preventDefault();
                    return;

                case 'a': // Beginning of line
                    element.setSelectionRange(0, 0);
                    e.preventDefault();
                    return;

                case 'e': // End of line
                    element.setSelectionRange(element.value.length, element.value.length);
                    e.preventDefault();
                    return;

                case 'd': // Delete forward
                    const start = element.selectionStart;
                    element.value = element.value.slice(0, start) + element.value.slice(start + 1);
                    element.setSelectionRange(start, start);
                    e.preventDefault();
                    return;

                case 'k': // Kill to end of line
                    const killStart = element.selectionStart;
                    const killEnd = element.value.length;
                    const killedText = element.value.slice(killStart, killEnd);
                    this.killRing.push(killedText);
                    element.value = element.value.slice(0, killStart);
                    e.preventDefault();
                    return;

                case 'y': // Yank
                    if (this.killRing.length > 0) {
                        const pos = element.selectionStart;
                        const text = this.killRing[this.killRing.length - 1];
                        element.value = element.value.slice(0, pos) + text + element.value.slice(pos);
                        element.setSelectionRange(pos + text.length, pos + text.length);
                    }
                    e.preventDefault();
                    return;

                case ' ': // Set mark
                    this.markActive = !this.markActive;
                    e.preventDefault();
                    return;
            }
        }

        // Meta (Alt) key bindings
        if (this.isMetaPressed) {
            switch (e.key) {
                case 'f': // Move forward by word
                    const wordMatch = element.value.slice(element.selectionStart).match(/\W+\w|^$/);
                    if (wordMatch) {
                        const newPos = element.selectionStart + wordMatch.index + wordMatch[0].length;
                        element.setSelectionRange(newPos, newPos);
                    }
                    e.preventDefault();
                    return;

                case 'b': // Move backward by word
                    const beforeCursor = element.value.slice(0, element.selectionStart);
                    const prevWordMatch = beforeCursor.match(/\w+\W*$/);
                    if (prevWordMatch) {
                        const newPos = beforeCursor.lastIndexOf(prevWordMatch[0]);
                        element.setSelectionRange(newPos, newPos);
                    }
                    e.preventDefault();
                    return;
            }
        }
    }

    handleContentEditableKeydown(e) {
        const selection = window.getSelection();

        if (this.isControlPressed) {
            switch (e.key) {
                case 'f': // Forward character
                    selection.modify('move', 'forward', 'character');
                    e.preventDefault();
                    return;

                case 'b': // Backward character
                    selection.modify('move', 'backward', 'character');
                    e.preventDefault();
                    return;

                case 'n': // Next line
                    selection.modify('move', 'forward', 'line');
                    e.preventDefault();
                    return;

                case 'p': // Previous line
                    selection.modify('move', 'backward', 'line');
                    e.preventDefault();
                    return;

                case 'a': // Beginning of line
                    selection.modify('move', 'backward', 'lineboundary');
                    e.preventDefault();
                    return;

                case 'e': // End of line
                    selection.modify('move', 'forward', 'lineboundary');
                    e.preventDefault();
                    return;

                case 'd': // Delete forward
                    document.execCommand('delete', false);
                    e.preventDefault();
                    return;

                case 'k': // Kill to end of line
                    selection.modify('extend', 'forward', 'lineboundary');
                    const killedText = selection.toString();
                    this.killRing.push(killedText);
                    document.execCommand('delete', false);
                    e.preventDefault();
                    return;

                case 'y': // Yank
                    if (this.killRing.length > 0) {
                        const text = this.killRing[this.killRing.length - 1];
                        document.execCommand('insertText', false, text);
                    }
                    e.preventDefault();
                    return;

                case ' ': // Set mark
                    this.markActive = !this.markActive;
                    if (!this.markActive) {
                        selection.collapseToStart();
                    }
                    e.preventDefault();
                    return;

                case 'w': // Kill region when mark is active
                    if (this.markActive) {
                        const killedText = selection.toString();
                        this.killRing.push(killedText);
                        document.execCommand('delete', false);
                        this.markActive = false;
                    }
                    e.preventDefault();
                    return;
            }
        }

        if (this.isMetaPressed) {
            switch (e.key) {
                case 'f': // Forward word
                    selection.modify('move', 'forward', 'word');
                    e.preventDefault();
                    return;

                case 'b': // Backward word
                    selection.modify('move', 'backward', 'word');
                    e.preventDefault();
                    return;
            }
        }
    }

    destroy() {
        if (this.statusIndicator) {
            this.statusIndicator.remove();
        }

        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();

        document.querySelectorAll('[data-emacs-enabled]').forEach(element => {
            delete element.dataset.emacsEnabled;
        });

        const shadowHosts = Array.from(document.querySelectorAll('*')).filter(el => el.shadowRoot);
        shadowHosts.forEach(host => {
            const editables = host.shadowRoot.querySelectorAll('[data-emacs-enabled]');
            editables.forEach(editable => {
                delete editable.dataset.emacsEnabled;
            });
        });
    }
}

// Initialize
const emacsEditor = new EmacsEditor();
