// template image dims: 1800x900 at 50% zoom
//                 and:  430x932 at 75% zoom
import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class TemplateDialog extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            user-select: none;
            outline: none;
            transition: all 0.3s ease;
        }

        ul {
            list-style-position: inside;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            font-weight: 500;
        }

        .dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--fg-2);
            opacity: 0.3;
            display: none;
            z-index: 999;
        }

        .dialog-content {
            background: var(--bg-1);
            padding: var(--padding-4);
            border-radius: var(--radius-large);
            max-width: 1200px;
            max-height: 800px;
            width: 90%;
            height: 90%;
            position: fixed;
            z-index: 1000;
            opacity: 1;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: none;
            flex-direction: column;
            filter: var(--drop-shadow);
        }

        .templates-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, 300px);
            grid-auto-rows: min-content;
            gap: var(--gap-3);
            margin-top: var(--gap-3);
            overflow-y: auto;
            flex: 1;
            justify-content: space-between;
        }

        .template-card {
            padding: var(--padding-3);
            cursor: pointer;
            border-radius: var(--radius);
            border: 2px solid transparent;
            transition: all 0.2s ease;
            background: var(--bg-1);
        }

        .template-card:hover {
            background: var(--bg-2);
            border-color: var(--border-1);
        }

        .template-card.selected {
            border-color: var(--fg-accent);
            background: var(--bg-accent);
        }

        .preview-container {
            display: flex;
            gap: var(--gap-3);
            margin-bottom: var(--gap-3);
            position: relative;
        }

        .desktop-preview {
            width: 280px;
            height: 140px;
            object-fit: cover;
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            background-size: cover;
            transform: translateZ(0px); /* fix for pixalated image */
        }

        .mobile-preview {
            width: 49px;
            height: 106px;
            object-fit: cover;
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            position: absolute;
            right: 15px;
            background-size: cover;
            top: 62px;
            transform: translateZ(0px); /* fix for pixalated image */
        }

        .template-card:hover .desktop-preview {
            rotate: -2deg;
        }

        .template-card:hover .mobile-preview {
            rotate: 7deg;
        }

        .template-info h3 {
            color: var(--fg-1);
        }

        .template-info-main {
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
        }

        .template-info-main h1 {
            font-weight: 500;
        }

        .template-by {
            color: var(--fg-2);
            font-size: 12px;
            font-weight: 400;
        }

        .header {
            display: flex;
            flex-direction: row;
            color: var(--fg-1);
            gap: var(--gap-2);
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: var(--gap-3);
        }

        .header-wrapper {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            width: 100%;
        }

        .header-controls {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .header-title {
            font-size: 24px;
            font-weight: 500;
        }

        .main-group {
            overflow-y: auto;
            height: inherit;
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .search-container {
            display: flex;
            gap: var(--gap-2);
            align-items: center;
            margin-bottom: var(--gap-3);
        }

        .search-input {
            padding: var(--padding-w2);
            border: 2px solid var(--bg-3);
            border-radius: calc(var(--radius-large) * 20);
            background-color: var(--bg-2);
            color: var(--fg-1);
            font-size: 14px;
            max-width: 400px;
            width: 100%;
            outline: none;
            transition: all 0.2s ease;
        }

        .search-input:focus {
            background-color: var(--bg-1);
            border-color: var(--fg-accent);
        }

        .search-input::placeholder {
            color: var(--fg-2);
        }

        .template-actions {
            display: flex;
            gap: var(--gap-2);
            margin-top: var(--gap-3);
            justify-content: flex-end;
            padding-top: var(--padding-3);
        }

        .back-button {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            background: transparent;
            border: 2px solid transparent;
            color: var(--fg-1);
            cursor: pointer;
            padding: var(--padding-w2);
            border-radius: calc(var(--radius-large) * 20);
            font-weight: 500;
            font-size: 14px;
            transition: all 0.2s ease;
        }

        .back-button:hover {
            background: var(--bg-3);
        }

        .template-description {
            color: var(--fg-2);
            font-size: 14px;
            margin-top: var(--gap-2);
            line-height: 1.4;
        }

        .use-template-button {
            background: var(--fg-1);
            color: var(--bg-1);
            border: 2px solid transparent;
            padding: var(--padding-w2);
            border-radius: calc(var(--radius-large) * 20);
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
            transition: all 0.2s ease;
        }

        .use-template-button:hover {
            background: transparent;
            border: 2px solid var(--fg-1);
            color: var(--fg-1);
        }

        @media (max-width: 768px) {
            .dialog-content {
                padding: var(--padding-4);
                height: 90%;
                width: 100%;
                border-radius: 0;
                border-top-left-radius: var(--radius-large);
                border-top-right-radius: var(--radius-large);
                top: 10%;
                left: 0;
                transform: none;
                max-height: none;
            }

            @starting-style {
                .dialog-content {
                    top: 30%;
                    opacity: 0;
                }
            }
        }

        @media (max-width: 480px) {
            .template-card {
                padding: var(--padding-3);
            }
            .desktop-preview {
                width: 260px;
                height: 130px;
            }
            .mobile-preview {
                width: 58px;
                height: 125px;
                right: 20px;
                top: 72px;
            }
        }

        @starting-style {
            .dialog-content {
                opacity: 0;
            }
        }

        .icon {
            cursor: pointer;
            transition: transform 0.2s ease;
            width: 22px;
        }

        a {
            color: var(--fg-blue);
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
    `;

    static properties = {
        visible: { type: Boolean },
        templates: { type: Array },
        selectedTemplate: { type: Object },
        searchQuery: { type: String },
    };

    constructor() {
        super();
        this.visible = false;
        this.templates = [];
        this.selectedTemplate = null;
        this.searchQuery = '';
        this.fetchTemplates();
    }

    async fetchTemplates() {
        try {
            const response = await fetch('/js/templates/templates.json');
            const data = await response.json();
            this.templates = data.templates;
            this.requestUpdate();
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    }

    show() {
        this.visible = true;
        this.requestUpdate();
    }

    hide() {
        this.visible = false;
        this.selectedTemplate = null;
        this.searchQuery = '';
        this.requestUpdate();
    }

    handleBackdropClick() {
        this.hide();
    }

    selectTemplate(template) {
        this.selectedTemplate = template;
        this.requestUpdate();
    }

    handleSearchInput(e) {
        this.searchQuery = e.target.value.toLowerCase();
        this.requestUpdate();
    }

    get filteredTemplates() {
        if (!this.searchQuery) {
            return this.templates;
        }
        return this.templates.filter(
            template =>
                template.name.toLowerCase().includes(this.searchQuery) ||
                template.by.toLowerCase().includes(this.searchQuery) ||
                (template.description && template.description.toLowerCase().includes(this.searchQuery))
        );
    }

    async useTemplate() {
        // get template json from /js/templates/storage/${this.selectedTemplate.path}.json
        // run wisk.editor.useTemplate(template)
        const response = await fetch(`/js/templates/storage/${this.selectedTemplate.path}.json`);
        const data = await response.json();
        wisk.editor.useTemplate(data);
        this.hide();
    }

    render() {
        return html`
            <div class="dialog-overlay" style="display: ${this.visible ? 'block' : 'none'}" @click=${this.handleBackdropClick}></div>
            <div class="dialog-content" style="display: ${this.visible ? 'flex' : 'none'}">
                <div class="header">
                    <div class="header-wrapper">
                        <div class="header-controls">
                            <label class="header-title">Templates</label>
                            <img
                                src="/a7/forget/dialog-x.svg"
                                alt="Close"
                                @click="${this.hide}"
                                class="icon"
                                draggable="false"
                                style="padding: var(--padding-3); width: unset; filter: var(--themed-svg)"
                            />
                        </div>
                    </div>
                </div>

                <div class="main-group">
                    <div class="search-container">
                        <input
                            type="text"
                            class="search-input"
                            placeholder="Search templates..."
                            .value=${this.searchQuery}
                            @input=${this.handleSearchInput}
                        />
                    </div>

                    <div class="templates-grid">
                        ${this.filteredTemplates.map(
                            template => html`
                                <div
                                    class="template-card ${this.selectedTemplate?.path === template.path ? 'selected' : ''}"
                                    @click=${() => this.selectTemplate(template)}
                                >
                                    <div class="preview-container">
                                        <div
                                            class="desktop-preview"
                                            style="background-image: url(/a7/templates/${template.path}/preview/desktop.png)"
                                            alt="${template.name} desktop preview"
                                        ></div>
                                        <div
                                            class="mobile-preview"
                                            style="background-image: url(/a7/templates/${template.path}/preview/phone.png)"
                                            alt="${template.name} mobile preview"
                                        ></div>
                                    </div>
                                    <div class="template-info">
                                        <h3>${template.name}</h3>
                                        <span class="template-by"
                                            >By
                                            ${template.link ? html`<a href="${template.link}" target="_blank">${template.by}</a>` : template.by}</span
                                        >
                                    </div>
                                </div>
                            `
                        )}
                    </div>

                    <div class="template-actions">
                        <button class="back-button" @click=${this.hide}>Cancel</button>
                        <button
                            class="use-template-button"
                            @click=${this.useTemplate}
                            ?disabled=${!this.selectedTemplate}
                            style="opacity: ${this.selectedTemplate ? '1' : '0.5'}; cursor: ${this.selectedTemplate ? 'pointer' : 'not-allowed'}"
                        >
                            Use Template
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('template-dialog', TemplateDialog);
