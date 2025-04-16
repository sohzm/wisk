import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class CiteElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            margin: 0px;
            padding: 0px;
        }
        :host {
            display: inline;
            color: var(--fg-blue);
            cursor: pointer;
            margin: 0 1px;
            font-family: var(--font-mono);
            position: relative;
        }
        :host(:hover) {
        }
        .hover-dialog {
            position: absolute;
            top: 100%;
            left: 0;
            background: var(--bg-2);
            border: 1px solid var(--border-1);
            border-radius: 4px;
            padding: var(--padding-w1);
            margin-top: 4px;
            z-index: 500;
            max-width: 400px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            display: none;
            font-size: 0.9em;
        }
        .hover-dialog.visible {
            display: block;
        }
    `;

    static properties = {
        referenceId: { type: String, reflect: true, attribute: 'reference-id' },
        citation: { type: String, reflect: true },
        _showDialog: { type: Boolean, state: true },
        _formattedCitation: { type: String, state: true },
    };

    constructor() {
        super();
        this.referenceId = '';
        this.citation = '';
        this._showDialog = false;
        this._formattedCitation = '';
        this._hideTimeout = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('click', this._handleClick);
        this.addEventListener('mouseenter', this._handleMouseEnter);
        this.addEventListener('mouseleave', this._handleMouseLeave);
        window.addEventListener('citation-updated', this.updateCitation.bind(this));
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('click', this._handleClick);
        this.removeEventListener('mouseenter', this._handleMouseEnter);
        this.removeEventListener('mouseleave', this._handleMouseLeave);
        if (this._hideTimeout) {
            clearTimeout(this._hideTimeout);
        }
    }

    _handleClick() {
        const citationsManager = document.querySelector('manage-citations');
        if (citationsManager && this.referenceId) {
            citationsManager.highlight(this.referenceId);
        }
    }

    async _handleMouseEnter() {
        if (this._hideTimeout) {
            clearTimeout(this._hideTimeout);
        }

        const citationsManager = document.querySelector('manage-citations');
        if (citationsManager && this.referenceId) {
            this._formattedCitation = await citationsManager.getFormattedCitation(this.referenceId);
            this._showDialog = true;
            this.requestUpdate();
        }
    }

    async updateCitation() {
        var cm = document.querySelector('manage-citations');
        this.citation = cm.formatInlineCitation(cm.getCitationData(this.referenceId));
        await this.requestUpdate();
        window.dispatchEvent(new CustomEvent('cite-element-updated', { detail: { referenceId: this.referenceId } }));
    }

    _handleMouseLeave() {
        this._hideTimeout = setTimeout(() => {
            this._showDialog = false;
            this.requestUpdate();
        }, 200); // Small delay to prevent flickering when moving between citation and dialog
    }

    render() {
        return html`
            ${this.citation}
            <div
                style="font-size: 14px; font-weight: bold;"
                class="hover-dialog ${this._showDialog ? 'visible' : ''}"
                @mouseenter=${() => {
                    if (this._hideTimeout) {
                        clearTimeout(this._hideTimeout);
                    }
                }}
                @mouseleave=${this._handleMouseLeave}
            >
                ${this._formattedCitation}
            </div>
        `;
    }
}

customElements.define('cite-element', CiteElement);
