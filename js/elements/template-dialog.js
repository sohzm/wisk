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
            background: transparent;
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 999;
        }

        .dialog-content {
            background: var(--bg-1);
            padding: calc(var(--padding-4) * 2);
            border-radius: var(--radius-large);
            border: 1px solid var(--border-1);
            filter: var(--drop-shadow);
            max-width: 1400px;
            max-height: 700px;
            height: 90%;
            width: 90%;
            position: absolute;
            z-index: 1000;
            transform: translateZ(0);
            overflow-y: auto;
        }

        .templates-grid {
            gap: var(--gap-3);
            margin-top: var(--gap-3);
            display: flex;
            flex-wrap: wrap;
        }

        .template-card {
            padding: var(--padding-4);
            cursor: pointer;
            border-radius: var(--radius);
        }

        .template-card:hover {
            background: var(--bg-2);
        }

        .preview-container {
            display: flex;
            gap: var(--gap-3);
            margin-bottom: var(--gap-3);
            position: relative;
        }

        .desktop-preview {
            width: 408px;
            height: 204px;
            object-fit: cover;
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            background-size: cover;
            transform: translateZ(0px); /* fix for pixalated image */
        }

        .mobile-preview {
            width: 71.67px;
            height: 155px;
            object-fit: cover;
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            position: absolute;
            right: 25px;
            background-size: cover;
            top: 90px;
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

        .template-view {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg-1);
            padding: calc(var(--padding-4) * 2);
            display: flex;
            flex-direction: column;
            display: none;
        }

        @media (max-width: 768px) {
            .template-view {
                padding: var(--padding-4);
            }
        }

        .template-view.active {
            display: flex;
        }

        @starting-style {
            .template-view {
            }
        }

        .template-view-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--gap-3);
        }

        .back-button {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            background: none;
            border: none;
            color: var(--fg-1);
            cursor: pointer;
            padding: var(--padding-2);
            border-radius: var(--radius);
        }

        .back-button:hover {
            background: var(--bg-2);
        }

        .template-view-content {
            flex: 1;
            display: flex;
            gap: var(--gap-3);
        }

        .preview-large {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            width: 100%;
        }

        .use-template-button {
            background: var(--fg-accent);
            color: var(--bg-accent);
            border: 2px solid var(--fg-accent);
            padding: var(--padding-w2);
            border-radius: var(--radius);
            cursor: pointer;
            font-weight: 600;
        }

        .use-template-button:hover {
            background: var(--bg-accent);
            color: var(--fg-accent);
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
                max-height: none;
            }
        }

        @media (max-width: 480px) {
            .desktop-preview {
                width: 300px;
                height: 150px;
            }
        }

        @starting-style {
            .dialog-content {
                opacity: 0;
            }
        }

        .dialog-close {
            position: absolute;
            top: var(--padding-3);
            right: var(--padding-3);
            display: flex;
            width: 24px;
            height: 24px;
            background: none;
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            color: var(--fg-1);
            font-size: 1.5rem;
            align-items: center;
            justify-content: center;
        }

        .dialog-close:hover {
            background: var(--bg-3);
        }

        .dialog-title {
            font-size: 1.5rem;
            margin-bottom: var(--gap-3);
            color: var(--fg-1);
        }

        .section-title {
            color: var(--fg-1);
            margin-bottom: var(--gap-3);
        }

        .lrg {
            width: 100%;
            height: 300px;
            display: flex;
            gap: var(--gap-3);
            overflow: auto;
        }

        .img-preview-large {
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
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
    };

    constructor() {
        super();
        this.visible = false;
        this.templates = [];
        this.selectedTemplate = null;
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
        this.requestUpdate();
    }

    viewTemplate(template) {
        this.selectedTemplate = template;
        this.requestUpdate();
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
            <div class="dialog-overlay" style="display: ${this.visible ? 'flex' : 'none'}">
                <div class="dialog-content">
                    <button class="dialog-close" @click=${this.hide}>
                        <img src="/a7/forget/x.svg" alt="Close" style="filter: var(--themed-svg)" />
                    </button>

                    <div style="display: ${this.selectedTemplate ? 'none' : 'block'}">
                        <h2 class="dialog-title">Templates</h2>

                        <div class="templates-grid">
                            ${this.templates.map(
                                template => html`
                                    <div class="template-card" @click=${() => this.viewTemplate(template)}>
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
                                            <span class="template-by">By ${template.by}</span>
                                        </div>
                                    </div>
                                `
                            )}
                        </div>
                    </div>

                    <div class="template-view ${this.selectedTemplate ? 'active' : ''}">
                        ${this.selectedTemplate
                            ? html`
                                  <div class="template-view-header">
                                      <button class="back-button" @click=${() => (this.selectedTemplate = null)}>
                                          <img src="/a7/forget/back.svg" alt="Back" style="filter: var(--themed-svg)" />
                                          Back
                                      </button>
                                      <button class="use-template-button" @click=${this.useTemplate}>Use Template</button>
                                  </div>
                                  <div class="template-view-content">
                                      <div class="preview-large">
                                          <div class="template-info-main">
                                              <h1>${this.selectedTemplate.name}</h1>
                                              <span class="template-by"
                                                  >By <a href="${this.selectedTemplate.link}" target="_blank">${this.selectedTemplate.by}</a></span
                                              >
                                          </div>
                                          <div class="lrg">
                                              <img
                                                  class="img-preview-large"
                                                  src="/a7/templates/${this.selectedTemplate.path}/phone.png"
                                                  @click=${() => this.makeImageFullScreen(`/a7/templates/${this.selectedTemplate.path}/phone.png`)}
                                              />
                                              <img
                                                  class="img-preview-large"
                                                  src="/a7/templates/${this.selectedTemplate.path}/desktop.png"
                                                  @click=${() => this.makeImageFullScreen(`/a7/templates/${this.selectedTemplate.path}/desktop.png`)}
                                              />
                                              ${this.selectedTemplate.images
                                                  ? html`
                                                        ${this.selectedTemplate.images.map(
                                                            image => html`
                                                                <img
                                                                    class="img-preview-large"
                                                                    src="/a7/templates/${this.selectedTemplate.path}/${image}"
                                                                    @click=${() =>
                                                                        this.makeImageFullScreen(
                                                                            `/a7/templates/${this.selectedTemplate.path}/${image}`
                                                                        )}
                                                                />
                                                            `
                                                        )}
                                                    `
                                                  : ''}
                                          </div>

                                          <p>${this.selectedTemplate.description}</p>

                                          <div>
                                              <h3 style="margin-bottom: var(--gap-2)">Links</h3>
                                              ${this.selectedTemplate.links
                                                  ? html`
                                                        <ul>
                                                            ${this.selectedTemplate.links.map(
                                                                link => html` <li><a href="${link.url}" target="_blank">${link.text}</a></li> `
                                                            )}
                                                        </ul>
                                                    `
                                                  : ''}
                                          </div>
                                      </div>
                                  </div>
                              `
                            : ''}
                    </div>
                </div>
            </div>
            <div
                class="img-full"
                style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; margin: auto; background: var(--bg-1); border-radius: var(--radius); border: 1px solid var(--border-1); z-index: 10001; align-items: center; justify-content: center; padding: calc(var(--padding-4)* 3); transform: translateZ(0)"
                @click=${() => (this.shadowRoot.querySelector('.img-full').style.display = 'none')}
            >
                <img
                    src=""
                    alt="Full Screen Image"
                    style="max-width: 100%; max-height: 100%; cursor: pointer; border-radius: var(--radius-large); border: 1px solid var(--border-1);filter: var(--drop-shadow) var(--drop-shadow) var(--drop-shadow); transform: translateZ(0)"
                />
            </div>
        `;
    }

    makeImageFullScreen(path) {
        const img = this.shadowRoot.querySelector('.img-full img');
        img.src = path;
        this.shadowRoot.querySelector('.img-full').style.display = 'flex';
    }
}

customElements.define('template-dialog', TemplateDialog);
