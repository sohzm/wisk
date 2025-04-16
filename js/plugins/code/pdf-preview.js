import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class PDFPreviewElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
        }
        .preview-container {
            flex: 1;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: var(--bg-2);
        }
        .pdf-viewer {
            width: 100%;
            height: 100%;
            border: none;
        }
        .reload-button {
            padding: var(--padding-w2);
            background-color: var(--bg-1);
            color: var(--fg-1);
            border: 2px solid var(--border-1);
            border-radius: var(--radius);
            cursor: pointer;
            outline: none;
            font-weight: 500;
            filter: var(--drop-shadow);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            position: absolute;
            bottom: var(--padding-4);
            left: var(--padding-4);
        }
        .reload-button:hover {
            background-color: var(--bg-2);
        }
        .loading-icon {
            animation: rotate 1s linear infinite;
        }
        @keyframes rotate {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
    `;

    static properties = {
        pdfUrl: { type: String },
        loading: { type: Boolean },
    };

    constructor() {
        super();
        this.pdfUrl = '';
        this.loading = false;
    }

    async generatePreview() {
        try {
            this.loading = true;
            var user = await document.querySelector('auth-component').getUserInfo();
            var token = user.token;

            // Array to store base64 images and their IDs
            const imageData = [];
            let markdownContent = '';

            for (var i = 0; i < wisk.editor.document.data.elements.length; i++) {
                var element = wisk.editor.document.data.elements[i];
                var e = document.getElementById(element.id);

                if (!('getTextContent' in e)) continue;

                // Handle main text elements that support markdown
                var normalElms = [
                    'main-element',
                    'text-element',
                    'heading1-element',
                    'heading2-element',
                    'heading3-element',
                    'heading4-element',
                    'heading5-element',
                    'divider-element',
                ];
                if (normalElms.includes(element.component)) {
                    const content = e.getTextContent().markdown;
                    markdownContent += content + '\n\n';
                    continue;
                }

                // Handle special elements
                if (element.component === 'image-element') {
                    const valueContent = e.getValue();
                    const imgUrl = valueContent.imageUrl;
                    markdownContent += `![${valueContent.altText || ''}](${imgUrl})\n\n`;
                }

                if (element.component === 'list-element') {
                    const valueContent = e.getValue();
                    const content = e.getTextContent().markdown;
                    const indent = valueContent.indent || 0;
                    const indentStr = '  '.repeat(indent);
                    markdownContent +=
                        content
                            .split('\n')
                            .map(line => indentStr + line)
                            .join('\n') + '\n\n';
                }

                if (element.component === 'numbered-list-element') {
                    const valueContent = e.getValue();
                    const content = e.getTextContent().markdown;
                    const indent = valueContent.indent || 0;
                    const indentStr = '  '.repeat(indent);
                    markdownContent +=
                        content
                            .split('\n')
                            .map(line => indentStr + line)
                            .join('\n') + '\n\n';
                }

                if (element.component === 'checkbox-element') {
                    const valueContent = e.getValue();
                    const content = e.getTextContent().markdown;
                    const indent = valueContent.indent || 0;
                    const indentStr = '  '.repeat(indent);
                    markdownContent += `${indentStr}${content}\n\n`;
                }

                if (element.component === 'latex-element') {
                    const valueContent = e.getValue();
                    markdownContent += `$$\n${valueContent.latex}\n$$\n\n`;
                }

                if (element.component === 'code-element') {
                    var cval = e.getTextContent().markdown;
                    markdownContent += cval + '\n\n';
                }

                if (element.component === 'chart-element') {
                    var base64Data = await e.getBase64Png();
                    base64Data = base64Data.replace(/^data:image\/png;base64,/, '');

                    const imageId = Array(15)
                        .fill(null)
                        .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
                        .join('');

                    imageData.push({
                        id: imageId,
                        base64: base64Data,
                    });

                    markdownContent += `--id--image--${imageId}--end--\n\n`;
                }

                if (element.component === 'table-element') {
                    const valueContent = e.getTextContent().markdown;
                    markdownContent += valueContent + '\n\n';
                }

                if (element.component === 'mermaid-element') {
                    var base64Data = await e.getPNGBase64();
                    base64Data = base64Data.replace(/^data:image\/jpeg;base64,/, '');

                    const imageId = Array(15)
                        .fill(null)
                        .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
                        .join('');

                    imageData.push({
                        id: imageId,
                        base64: base64Data,
                    });

                    markdownContent += `--id--image--${imageId}--end--\n\n`;
                }
            }

            var refs = document.querySelector('manage-citations').getCitations();

            var refNum = 1;
            var refsAdded = [];

            refs.forEach(ref => {
                const citationPattern = new RegExp(`--citation-element--${ref.id}--`, 'g');
                if (markdownContent.match(citationPattern)) {
                    markdownContent = markdownContent.replace(citationPattern, `[${refNum}]`);
                    refsAdded.push(ref.id);
                    refNum++;
                }
            });

            if (refsAdded.length != 0) {
                markdownContent += '\n\n---\n\n## References\n\n';
            }

            // add a list of references at the end of the document
            for (var i = 0; i < refsAdded.length; i++) {
                var ref = refs.find(r => r.id === refsAdded[i]);
                markdownContent += `[${i + 1}] ${document.querySelector('manage-citations').getFormattedCitation(refsAdded[i])}\n\n`;
            }

            const response = await fetch(wisk.editor.backendUrl + '/v2/download', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    markdown: markdownContent,
                    filetype: 'pdf',
                    template: 'default',
                    ids: imageData,
                }),
            });

            if (response.status !== 200) {
                wisk.utils.showToast('Error generating preview', 5000);
                return;
            }

            const blob = await response.blob();
            this.pdfUrl = URL.createObjectURL(blob);
        } catch (error) {
            console.error('Preview error:', error);
            wisk.utils.showToast('Error generating preview', 5000);
        } finally {
            this.loading = false;
        }
    }

    firstUpdated() {}

    opened() {
        this.generatePreview();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.pdfUrl) {
            URL.revokeObjectURL(this.pdfUrl);
        }
    }

    render() {
        return html`
            <button class="reload-button" @click=${this.generatePreview} ?disabled=${this.loading}>
                <img
                    src="/a7/forget/reload.svg"
                    alt="refresh"
                    class=${this.loading ? 'loading-icon' : ''}
                    style="filter: var(--themed-svg); width: 16px; height: 16px;"
                />
                ${this.loading ? 'Generating preview...' : 'Reload preview'}
            </button>
            <div class="preview-container">
                ${this.pdfUrl ? html` <iframe class="pdf-viewer" src=${this.pdfUrl} type="application/pdf"></iframe> ` : ''}
            </div>
        `;
    }
}

customElements.define('pdf-preview', PDFPreviewElement);
