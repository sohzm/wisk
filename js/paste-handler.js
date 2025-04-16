// for now we dont import this
class PlainTextPasteHandler {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener(
            'paste',
            event => {
                const activeElement = this.getDeepActiveElement();
                if (activeElement?.hasAttribute('contenteditable') && this.isWithinWebComponent(activeElement)) {
                    event.preventDefault();
                    let text = event.clipboardData?.getData('text/plain') || '';

                    // Clean the text:
                    // 1. Replace all whitespace characters (including newlines, tabs) with single spaces
                    // 2. Trim any leading/trailing whitespace
                    text = text.replace(/\s+/g, ' ').trim();
                    if (text) {
                        document.execCommand('insertText', false, text);
                    }
                }
            },
            true
        );
    }

    getDeepActiveElement() {
        let active = document.activeElement;

        while (active?.shadowRoot?.activeElement) {
            active = active.shadowRoot.activeElement;
        }

        return active;
    }

    isWithinWebComponent(element) {
        let parent = element;

        while (parent) {
            if (parent.tagName?.includes('-')) {
                return true;
            }
            parent = parent.parentElement || parent.getRootNode()?.host;
        }

        return false;
    }
}

// TODO change this to handle things better
// - like if user is pasting list, it should add a list
// - or image
// etc
const pasteHandler = new PlainTextPasteHandler();
