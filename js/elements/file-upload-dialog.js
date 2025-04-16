import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class FileUploadDialog extends LitElement {
    static styles = css`
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .dialog {
            background-color: var(--bg-1);
            padding: calc(2 * var(--padding-4));
            border-radius: var(--radius-large);
            box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px;
            max-width: 500px;
            width: 100%;
            filter: var(--drop-shadow);
            border: 1px solid var(--border-1);
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
        }
        h2 {
            margin-top: 0;
            color: var(--fg-1);
        }
        .file-input {
            margin-bottom: var(--padding-3);
        }
        .file-list {
            margin-bottom: var(--padding-3);
            max-height: 200px;
            overflow-y: auto;
        }
        .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--padding-2);
            background-color: var(--bg-2);
            margin-bottom: var(--padding-2);
            border-radius: var(--radius);
        }
        .remove-file {
            background: none;
            border: none;
            color: var(--fg-2);
            cursor: pointer;
        }
        .actions {
            display: flex;
            justify-content: flex-end;
            gap: var(--gap-2);
            padding-top: var(--padding-3);
        }
        button {
            padding: var(--padding-w2);
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        }
        .cancel {
            background-color: var(--bg-3);
            color: var(--fg-1);
        }
        .upload {
            background-color: var(--fg-blue);
            color: var(--bg-blue);
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
        isOpen: { type: Boolean },
        files: { type: Array },
    };

    constructor() {
        super();
        this.isOpen = false;
        this.files = [];
    }

    render() {
        if (!this.isOpen) return null;

        return html`
            <div class="overlay">
                <div class="dialog">
                    <h2>Upload Files</h2>
                    <input type="file" multiple @change=${this.handleFileSelect} class="file-input" />
                    <div class="file-list">
                        ${this.files.map(
                            (file, index) => html`
                                <div class="file-item">
                                    <span>${file.name}</span>
                                    <button class="remove-file" @click=${() => this.removeFile(index)}>Remove</button>
                                </div>
                            `
                        )}
                    </div>
                    <div class="actions">
                        <button class="cancel" @click=${this.close}>Cancel</button>
                        <button class="upload" @click=${this.uploadFiles}>Upload</button>
                    </div>
                </div>
            </div>
        `;
    }

    handleFileSelect(event) {
        const newFiles = Array.from(event.target.files);
        this.files = [...this.files, ...newFiles];
        this.requestUpdate();
    }

    removeFile(index) {
        this.files = this.files.filter((_, i) => i !== index);
        this.requestUpdate();
    }

    close() {
        this.isOpen = false;
        this.files = [];
        this.dispatchEvent(new CustomEvent('dialog-closed'));
    }

    uploadFiles() {
        // Here you would implement the actual file upload logic
        console.log('Uploading files:', this.files);
        this.dispatchEvent(new CustomEvent('files-uploaded', { detail: this.files }));
        this.close();
    }

    open() {
        this.isOpen = true;
    }
}

customElements.define('file-upload-dialog', FileUploadDialog);
