import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class TableOfContents extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
        }

        :host {
            display: block;
            background: var(--bg-1);
            border-radius: var(--radius-large);
            border: 1px solid var(--bg-3);
        }

        .toc-container {
            padding: var(--padding-4);
        }

        .toc-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: var(--gap-1);
        }

        .toc-item {
            position: relative;
        }

        .toc-link {
            color: var(--fg-2);
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            display: block;
            padding: var(--padding-w1);
            border-radius: var(--radius);
            font-size: 0.95em;
            line-height: 1.4;
        }

        .toc-link:hover {
            color: var(--fg-accent);
            background: var(--bg-accent);
        }

        .level-heading1-element {
            font-weight: 600;
            color: var(--fg-1);
        }

        .level-heading2-element {
            margin-left: var(--padding-4);
            font-size: 0.9em;
        }

        .level-heading3-element {
            margin-left: calc(var(--padding-4) * 2);
            font-size: 0.85em;
        }

        .level-heading4-element {
            margin-left: calc(var(--padding-4) * 3);
            font-size: 0.85em;
        }

        .level-heading5-element {
            margin-left: calc(var(--padding-4) * 4);
            font-size: 0.85em;
        }

        /* Active state */
        .toc-link.active {
            color: var(--fg-accent);
            background: var(--bg-accent);
            font-weight: 500;
        }
    `;

    static properties = {
        activeId: { type: String },
    };

    constructor() {
        super();
        this.activeId = '';
        this.intersectionObserver = null;

        this.setupBlockEventListeners();
    }

    setupBlockEventListeners() {
        ['something-updated', 'block-created', 'block-changed', 'block-deleted', 'block-updated'].forEach(eventType => {
            window.addEventListener(eventType, () => {
                this.reRender();
            });
        });
    }

    reRender() {
        console.log('reRender');
        this.requestUpdate();
    }

    firstUpdated() {
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.activeId = entry.target.id;
                        this.requestUpdate();
                    }
                });
            },
            {
                rootMargin: '-10% 0% -85% 0%',
                threshold: 0,
            }
        );

        // Observe all heading elements
        wisk.editor.document.data.elements
            .filter(element => this.getHeadingLevel(element.component))
            .forEach(element => {
                const el = document.getElementById(element.id);
                if (el) this.intersectionObserver.observe(el);
            });
    }

    disconnectedCallback() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        super.disconnectedCallback();
    }

    extractTextFromHTML(htmlContent) {
        const temp = document.createElement('div');
        temp.innerHTML = htmlContent;
        return temp.innerText.trim();
    }

    setValue(property, value) {
        this.reRender();
    }

    getValue() {
        return {};
    }

    getHeadingLevel(component) {
        if (component === 'main-element') return 1;
        const match = component.match(/heading(\d)-element/);
        return match ? parseInt(match[1]) : null;
    }

    createTocItem(element) {
        const level = this.getHeadingLevel(element.component);
        if (!level) return null;
        const text = this.extractTextFromHTML(element.value.textContent);
        if (!text) return null;
        return {
            id: element.id,
            text,
            level,
            component: element.component,
        };
    }

    scrollToElement(id, e) {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
            this.activeId = id;
        }
    }

    render() {
        const tocItems = wisk.editor.document.data.elements.map(element => this.createTocItem(element)).filter(item => item !== null);

        return html`
            <div class="toc-container">
                <ul class="toc-list">
                    ${tocItems.map(
                        item => html`
                            <li class="toc-item level-${item.component}">
                                <a
                                    class="toc-link ${this.activeId === item.id ? 'active' : ''}"
                                    href="#${item.id}"
                                    @click=${e => this.scrollToElement(item.id, e)}
                                >
                                    ${item.text}
                                </a>
                            </li>
                        `
                    )}
                </ul>
            </div>
        `;
    }
}

customElements.define('table-of-contents', TableOfContents);
