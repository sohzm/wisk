class VimEditor {
    constructor() {
        this.mode = 'normal';
        this.activeElement = null;
        this.statusIndicator = null;
        this.observers = new Set();
        this.lastAction = null;
        this.visualStart = null;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing VimEditor');
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

        // Function to process a single root element and its shadow DOM
        const processRoot = root => {
            // Get direct elements in this root
            const inputs = root.querySelectorAll(
                'input[type="text"], input[type="password"], input[type="search"], input[type="email"], input[type="tel"], input[type="url"], input[type="number"], textarea, [contenteditable="true"]'
            );
            elements.push(...inputs);

            // Find and process all shadow roots
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
        if (element.dataset.vimEnabled) {
            return;
        }

        element.dataset.vimEnabled = 'true';

        element.addEventListener('focus', () => {
            this.activeElement = element;
            this.mode = 'normal';
            this.updateStatus();
            this.statusIndicator.style.display = 'block';
        });

        element.addEventListener('blur', () => {
            this.activeElement = null;
            this.statusIndicator.style.display = 'none';
        });

        element.addEventListener('keydown', e => {
            this.handleKeydown(e);
            this.updateStatus();
        });

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.addEventListener('click', () => {
                if (this.mode === 'normal') {
                    element.setSelectionRange(element.selectionStart, element.selectionStart);
                }
            });
        }
    }

    updateStatus() {
        const modeStyles = {
            normal: {
                text: '-- NORMAL --',
                bg: 'var(--bg-blue)',
                color: 'var(--fg-blue)',
                border: 'var(--fg-blue)',
            },
            insert: {
                text: '-- INSERT --',
                bg: 'var(--bg-green)',
                color: 'var(--fg-green)',
                border: 'var(--fg-green)',
            },
            visual: {
                text: '-- VISUAL --',
                bg: 'var(--bg-purple)',
                color: 'var(--fg-purple)',
                border: 'var(--fg-purple)',
            },
        };

        const style = modeStyles[this.mode];
        this.statusIndicator.textContent = style.text;
        this.statusIndicator.style.backgroundColor = style.bg;
        this.statusIndicator.style.color = style.color;
        this.statusIndicator.style.border = `2px solid ${style.border}`;
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

        if (this.mode === 'normal') {
            switch (e.key) {
                case 'i':
                    this.mode = 'insert';
                    return;

                case 'a':
                    this.mode = 'insert';
                    const pos = element.selectionStart;
                    element.setSelectionRange(pos + 1, pos + 1);
                    e.preventDefault();
                    return;

                case 'A':
                    this.mode = 'insert';
                    element.setSelectionRange(element.value.length, element.value.length);
                    e.preventDefault();
                    return;

                case 'I':
                    this.mode = 'insert';
                    element.setSelectionRange(0, 0);
                    e.preventDefault();
                    return;

                case 'h':
                    if (element.selectionStart > 0) {
                        element.setSelectionRange(element.selectionStart - 1, element.selectionStart - 1);
                    }
                    e.preventDefault();
                    return;

                case 'l':
                    if (element.selectionStart < element.value.length) {
                        element.setSelectionRange(element.selectionStart + 1, element.selectionStart + 1);
                    }
                    e.preventDefault();
                    return;

                case 'w':
                    const wordMatch = element.value.slice(element.selectionStart).match(/\W+\w|^$/);
                    if (wordMatch) {
                        const newPos = element.selectionStart + wordMatch.index + wordMatch[0].length;
                        element.setSelectionRange(newPos, newPos);
                    }
                    e.preventDefault();
                    return;

                case 'b':
                    const beforeCursor = element.value.slice(0, element.selectionStart);
                    const prevWordMatch = beforeCursor.match(/\w+\W*$/);
                    if (prevWordMatch) {
                        const newPos = beforeCursor.lastIndexOf(prevWordMatch[0]);
                        element.setSelectionRange(newPos, newPos);
                    }
                    e.preventDefault();
                    return;

                case '0':
                    element.setSelectionRange(0, 0);
                    e.preventDefault();
                    return;

                case '$':
                    element.setSelectionRange(element.value.length, element.value.length);
                    e.preventDefault();
                    return;

                case 'x':
                    const start = element.selectionStart;
                    element.value = element.value.slice(0, start) + element.value.slice(start + 1);
                    element.setSelectionRange(start, start);
                    e.preventDefault();
                    return;
            }
        } else if (this.mode === 'insert' && e.key === 'Escape') {
            this.mode = 'normal';
            if (element.selectionStart > 0) {
                element.setSelectionRange(element.selectionStart - 1, element.selectionStart - 1);
            }
            e.preventDefault();
            return;
        }
    }

    handleContentEditableKeydown(e) {
        if (!this.activeElement) return;

        const selection = window.getSelection();

        if (this.mode === 'normal') {
            switch (e.key) {
                case 'i':
                    this.mode = 'insert';
                    e.preventDefault();
                    return;

                case 'a':
                    this.mode = 'insert';
                    selection.modify('move', 'forward', 'character');
                    e.preventDefault();
                    return;

                case 'A':
                    this.mode = 'insert';
                    selection.modify('move', 'forward', 'lineboundary');
                    e.preventDefault();
                    return;

                case 'I':
                    this.mode = 'insert';
                    selection.modify('move', 'backward', 'lineboundary');
                    e.preventDefault();
                    return;

                case 'h':
                    selection.modify('move', 'backward', 'character');
                    e.preventDefault();
                    return;

                case 'l':
                    selection.modify('move', 'forward', 'character');
                    e.preventDefault();
                    return;
                case 'k':
                    selection.modify('move', 'backward', 'line');
                    this.activeElement.dispatchEvent(
                        new KeyboardEvent('keydown', {
                            key: 'ArrowUp',
                            keyCode: 38,
                            bubbles: true,
                            composed: true,
                        })
                    );
                    e.preventDefault();
                    return;
                case 'j':
                    selection.modify('move', 'forward', 'line');
                    this.activeElement.dispatchEvent(
                        new KeyboardEvent('keydown', {
                            key: 'ArrowDown',
                            keyCode: 40,
                            bubbles: true,
                            composed: true,
                        })
                    );
                    e.preventDefault();
                    return;
                case 'w':
                    selection.modify('move', 'forward', 'word');
                    e.preventDefault();
                    return;

                case 'b':
                    selection.modify('move', 'backward', 'word');
                    e.preventDefault();
                    return;

                case 'e':
                    selection.modify('move', 'forward', 'word');
                    e.preventDefault();
                    return;

                case '0':
                    selection.modify('move', 'backward', 'lineboundary');
                    e.preventDefault();
                    return;

                case '$':
                    selection.modify('move', 'forward', 'lineboundary');
                    e.preventDefault();
                    return;

                case 'x':
                    document.execCommand('delete', false);
                    e.preventDefault();
                    return;

                case 'v':
                    this.mode = 'visual';
                    this.visualStart = selection.getRangeAt(0).startOffset;
                    e.preventDefault();
                    return;

                case 'd':
                    if (e.repeat) {
                        selection.modify('move', 'backward', 'lineboundary');
                        selection.modify('extend', 'forward', 'lineboundary');
                        document.execCommand('delete', false);
                    } else {
                        this.lastAction = 'd';
                    }
                    e.preventDefault();
                    return;

                case 'D':
                    selection.modify('extend', 'forward', 'lineboundary');
                    document.execCommand('delete', false);
                    e.preventDefault();
                    return;

                case 'c':
                    if (e.repeat) {
                        selection.modify('move', 'backward', 'lineboundary');
                        selection.modify('extend', 'forward', 'lineboundary');
                        document.execCommand('delete', false);
                        this.mode = 'insert';
                    } else {
                        this.lastAction = 'c';
                    }
                    e.preventDefault();
                    return;

                case 'C':
                    selection.modify('extend', 'forward', 'lineboundary');
                    document.execCommand('delete', false);
                    this.mode = 'insert';
                    e.preventDefault();
                    return;

                case 'y':
                    document.execCommand('copy', false);
                    selection.collapseToStart();
                    e.preventDefault();
                    return;

                case 'p':
                    document.execCommand('paste', false);
                    e.preventDefault();
                    return;

                default:
                    if (this.lastAction) {
                        if (this.lastAction === 'd' && e.key === 'w') {
                            selection.modify('extend', 'forward', 'word');
                            document.execCommand('delete', false);
                        } else if (this.lastAction === 'c' && e.key === 'w') {
                            selection.modify('extend', 'forward', 'word');
                            document.execCommand('delete', false);
                            this.mode = 'insert';
                        }
                        this.lastAction = null;
                        e.preventDefault();
                        return;
                    }
                    break;
            }
        } else if (this.mode === 'visual') {
            switch (e.key) {
                case 'Escape':
                    this.mode = 'normal';
                    selection.collapseToEnd();
                    e.preventDefault();
                    return;

                case 'h':
                    selection.modify('extend', 'backward', 'character');
                    e.preventDefault();
                    return;

                case 'l':
                    selection.modify('extend', 'forward', 'character');
                    e.preventDefault();
                    return;

                case 'k':
                    selection.modify('extend', 'backward', 'line');
                    e.preventDefault();
                    return;

                case 'j':
                    selection.modify('extend', 'forward', 'line');
                    e.preventDefault();
                    return;

                case '0':
                    selection.modify('extend', 'backward', 'lineboundary');
                    e.preventDefault();
                    return;

                case '$':
                    selection.modify('extend', 'forward', 'lineboundary');
                    e.preventDefault();
                    return;

                case 'e':
                    selection.modify('extend', 'forward', 'word');
                    e.preventDefault();
                    return;

                case 'w':
                    selection.modify('extend', 'forward', 'word');
                    e.preventDefault();
                    return;

                case 'b':
                    selection.modify('extend', 'backward', 'word');
                    e.preventDefault();
                    return;

                case 'd':
                case 'x':
                    document.execCommand('delete', false);
                    this.mode = 'normal';
                    e.preventDefault();
                    return;

                case 'y':
                    document.execCommand('copy', false);
                    this.mode = 'normal';
                    selection.collapseToStart();
                    e.preventDefault();
                    return;

                case 'p':
                    document.execCommand('paste', false);
                    e.preventDefault();
                    return;

                case 'c':
                    document.execCommand('copy', false);
                    document.execCommand('delete', false);
                    this.mode = 'insert';
                    e.preventDefault();
                    return;
            }
        } else if (this.mode === 'insert' && e.key === 'Escape') {
            this.mode = 'normal';
            this.lastAction = null;
            selection.modify('move', 'backward', 'character');
            e.preventDefault();
            return;
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

        document.querySelectorAll('[data-vim-enabled]').forEach(element => {
            delete element.dataset.vimEnabled;
        });

        const shadowHosts = Array.from(document.querySelectorAll('*')).filter(el => el.shadowRoot);

        shadowHosts.forEach(host => {
            const editables = host.shadowRoot.querySelectorAll('[data-vim-enabled]');
            editables.forEach(editable => {
                delete editable.dataset.vimEnabled;
            });
        });
    }
}

// Initialize
const vimEditor = new VimEditor();
