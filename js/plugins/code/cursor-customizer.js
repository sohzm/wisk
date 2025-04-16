import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class CursorCustomizer extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
            display: block;
            padding: 1rem;
            background-color: var(--bg-1);
        }
        .container {
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
        }
        .option {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: var(--fg-1);
        }
        select {
            background: var(--bg-2);
            color: var(--fg-1);
            padding: 0.5rem;
            border: 1px solid var(--bg-3);
            border-radius: 4px;
        }
    `;

    static properties = {
        selectedTheme: { type: String },
    };

    cursors = [
        {
            name: 'simple pixel',
            arrow: '/a7/plugins/cursor/simple-pixel/arrow.png',
            hand: '/a7/plugins/cursor/simple-pixel/hand.png',
        },
        {
            name: 'offensive pixel',
            arrow: '/a7/plugins/cursor/offensive-pixel/arrow.png',
            hand: '/a7/plugins/cursor/offensive-pixel/hand.png',
        },
        {
            name: 'christmas',
            arrow: '/a7/plugins/cursor/christmas/arrow.png',
            hand: '/a7/plugins/cursor/simple-pixel/hand.png',
        },
    ];

    constructor() {
        super();
        this.selectedTheme = '';
        this.styleSheet = document.createElement('style');
        document.head.appendChild(this.styleSheet);

        // Create styles for shadow roots
        this.shadowStyleSheet = document.createElement('style');
        this.shadowStyleSheet.setAttribute('data-cursor-styles', '');
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.styleSheet.remove();
        document.body.style.cursor = 'default';

        // Remove styles from all shadow roots
        document.querySelectorAll('*').forEach(el => {
            if (el.shadowRoot) {
                const style = el.shadowRoot.querySelector('[data-cursor-styles]');
                if (style) style.remove();
            }
        });
    }

    applyShadowStyles(styleContent) {
        // Apply styles to existing shadow roots
        document.querySelectorAll('*').forEach(el => {
            if (el.shadowRoot) {
                let style = el.shadowRoot.querySelector('[data-cursor-styles]');
                if (!style) {
                    style = this.shadowStyleSheet.cloneNode(true);
                    el.shadowRoot.appendChild(style);
                }
                style.textContent = styleContent;
            }
        });

        // Observer for new shadow roots
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.shadowRoot) {
                            let style = node.shadowRoot.querySelector('[data-cursor-styles]');
                            if (!style) {
                                style = this.shadowStyleSheet.cloneNode(true);
                                node.shadowRoot.appendChild(style);
                            }
                            style.textContent = styleContent;
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    updateCursor() {
        if (!this.selectedTheme) {
            this.styleSheet.textContent = '';
            this.applyShadowStyles('');
            document.body.style.cursor = 'default';
            return;
        }

        const theme = this.cursors.find(c => c.name === this.selectedTheme);
        if (theme) {
            const styleContent = `
                :host, * { 
                    cursor: url('${theme.arrow}') 0 0, auto !important; 
                }
                a, button, [role="button"], select, input[type="submit"], 
                input[type="button"], input[type="reset"], [onclick] { 
                    cursor: url('${theme.hand}') 5 0, pointer !important; 
                }
            `;

            this.styleSheet.textContent = styleContent.replace(':host,', '');
            this.applyShadowStyles(styleContent);
        }
    }

    updated(changedProperties) {
        if (changedProperties.has('selectedTheme')) {
            this.updateCursor();
        }
    }

    render() {
        return html`
            <div class="container">
                <div class="option">
                    Cursor Theme
                    <select @change=${e => (this.selectedTheme = e.target.value)} .value=${this.selectedTheme}>
                        <option value="">Default</option>
                        ${this.cursors.map(theme => html` <option value=${theme.name}>${theme.name}</option> `)}
                    </select>
                </div>
            </div>
        `;
    }
}

customElements.define('cursor-customizer', CursorCustomizer);
