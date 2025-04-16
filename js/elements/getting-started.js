import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class GettingStarted extends LitElement {
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
        :host {
        }
        #getting-started {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
        }
        .gs-button {
            padding: var(--padding-w2);
            border-radius: 100px;
            background-color: var(--bg-accent);
            border: none;
            color: var(--fg-accent);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--gap-2);
            outline: none;
            font-size: 15px;
        }
        .gs-button img {
            width: 20px;
            filter: var(--accent-svg);
        }
        .gs-button:hover {
            background-color: var(--bg-2);
        }
        #tip {
            color: var(--fg-2);
            pointer-events: none;
            font-size: 0.9rem;
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
            filter: var(--drop-shadow) var(--drop-shadow);
            max-width: 1200px;
            max-height: 700px;
            height: 90%;
            width: 90%;
            position: absolute;
            z-index: 1000;
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
                max-height: none;
            }
            @starting-style {
                .dialog-content {
                    top: 30%;
                    opacity: 0;
                }
            }
        }
        .thin-dialog-content {
            max-width: 1000px;
        }
        .quick-link {
            padding: var(--padding-w1);
            background: var(--bg-accent);
            color: var(--fg-accent);
            border-radius: var(--radius);
            cursor: pointer;
            text-decoration: none;
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
        .input-group {
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
            margin-bottom: var(--gap-3);
        }

        @starting-style {
            .dialog-content {
                opacity: 0;
            }
        }

        .input-label {
            color: var(--fg-1);
            font-weight: 500;
        }

        .input-description {
            color: var(--fg-2);
            margin-top: var(--gap-1);
        }

        .text-input {
            width: 100%;
            padding: var(--padding-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background: var(--bg-2);
            color: var(--fg-1);
        }

        .text-input:focus {
        }

        .textarea {
            min-height: 70px;
            resize: vertical;
        }

        .generate-button {
            background: var(--bg-accent);
            color: var(--fg-accent);
            padding: var(--padding-w2);
            font-weight: 600;
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
        }

        .generate-button:hover {
            background: var(--bg-3);
        }

        .warning-text {
            color: var(--fg-2);
            font-size: 0.8rem;
            font-style: italic;
        }

        .main-group {
            overflow-y: auto;
            height: inherit;
        }

        .brainstorm-container {
            display: flex;
            gap: var(--gap-3);
            height: inherit;
            overflow: auto;
        }

        @media (max-width: 768px) {
            .brainstorm-container {
                flex-direction: column-reverse;
            }
        }

        .chat-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0; /* Prevent flex item from overflowing */
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: var(--padding-3);
            border-radius: var(--radius);
            margin-bottom: var(--gap-3);
            overflow: auto;
        }

        .message {
            margin-bottom: var(--gap-3);
            padding: var(--padding-3);
            border-radius: var(--radius);
        }

        .message.user {
            margin-left: 20%;
        }

        .message.assistant {
            background: var(--bg-blue);
            margin-right: 20%;
        }

        .chat-input {
            display: flex;
            gap: var(--gap-2);
        }

        .chat-input textarea {
            flex: 1;
            min-height: 50px;
            resize: none;
            padding: var(--padding-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background: var(--bg-2);
            color: var(--fg-1);
        }

        .bs-input {
            flex: 1 1 0%;
            min-height: 40px;
            resize: none;
            padding: var(--padding-w2);
            border: 1px solid var(--border-1);
            border-radius: 100px;
            background: var(--bg-2);
            color: var(--fg-1);
        }

        .visualization-section {
            flex: 1;
            min-width: 0;
            border-radius: var(--radius);
            padding: var(--padding-3);
            display: flex;
            flex-direction: column;
        }

        .send-button {
            padding: var(--padding-2) var(--padding-4);
            background: var(--bg-accent);
            color: var(--fg-accent);
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }

        .send-button:hover {
            background: var(--bg-3);
        }

        .mermaid-wrapper {
            flex: 1;
            overflow: auto;
        }

        .drop-zone {
            border: 2px dashed var(--border-1);
            border-radius: var(--radius);
            padding: var(--padding-w4);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: var(--bg-2);
            min-height: 250px;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .drop-zone.drag-over {
            border-color: var(--bg-accent);
            background: var(--bg-3);
        }

        .drop-text {
            color: var(--fg-1);
            font-size: 1.1rem;
            margin-bottom: var(--gap-2);
        }

        .supported-formats {
            color: var(--fg-2);
            font-size: 0.9rem;
            margin-bottom: var(--gap-3);
        }

        .browse-button {
            padding: var(--padding-2) var(--padding-4);
            background: var(--bg-3);
            color: var(--fg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            cursor: pointer;
            font-size: 0.9rem;
        }

        .browse-button:hover {
            background: var(--bg-4);
        }

        .selected-file {
            margin-top: var(--gap-3);
            padding: var(--padding-3);
            background: var(--bg-2);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--gap-2);
        }

        .file-info {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            flex: 1;
            min-width: 0;
        }

        .file-icon {
            width: 24px;
            height: 24px;
            filter: var(--themed-svg);
        }

        .file-name {
            color: var(--fg-1);
            font-size: 0.9rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .remove-file {
            background: none;
            border: none;
            padding: var(--padding-1);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius);
        }

        .remove-file:hover {
            background: var(--bg-3);
        }

        .file-size {
            color: var(--fg-2);
            font-size: 0.8rem;
            white-space: nowrap;
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
        select {
            max-width: 300px;
        }
    `;

    static properties = {
        activeDialog: { type: String },
        selectedFile: { type: Object },
    };

    constructor() {
        super();
        this.tips = [
            'You can use the command palette by pressing Ctrl+Shift+P or Cmd+Shift+P',
            'You can create and install plugins to extend the functionality of your editor',
            'You can create and use custom themes to personalize your editor',
            "When AI Chat gets too long, clear the chat by clicking the Clear Chat button, that'll improve the results",
            "You can autocite your content by selecting text and clicking on the 'Find Sources' button",
        ];
        this.activeDialog = null;
    }

    updated() {
        if (wisk.editor.readonly) return;
        this.shadowRoot.getElementById('tip').innerText = this.tips[Math.floor(Math.random() * this.tips.length)];
    }

    showDialog(type) {
        this.activeDialog = type;
        this.requestUpdate();
    }

    closeDialog() {
        this.activeDialog = null;
        this.requestUpdate();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = e.currentTarget;
        dropZone.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = e.currentTarget;
        dropZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = e.currentTarget;
        dropZone.classList.remove('drag-over');

        const file = e.dataTransfer.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
        e.target.value = '';
    }

    removeFile() {
        this.selectedFile = null;
        this.requestUpdate();
    }

    triggerFileInput() {
        this.shadowRoot.getElementById('fileInput').click();
    }

    processFile(file) {
        const validExtensions = ['.pdf', '.docx', '.md', '.markdown'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();

        if (validExtensions.includes(ext)) {
            this.selectedFile = file;
            this.requestUpdate();
        } else {
            wisk.utils.showToast('Invalid file format', 5000);
        }
    }

    async generateDraft(e) {
        const whatInput = this.shadowRoot.getElementById('ol1').value;
        const audienceInput = this.shadowRoot.getElementById('ol2').value;
        const goalInput = this.shadowRoot.getElementById('ol3').value;
        const categorySelect = this.shadowRoot.getElementById('ol4').value;
        const onlyOutline = this.shadowRoot.getElementById('checkbox-outline').checked;

        if (!whatInput || !audienceInput || !goalInput || !categorySelect) {
            wisk.utils.showToast('Please fill all fields', 5000);
            return;
        }

        const user = await document.querySelector('auth-component').getUserInfo();
        const token = user.token;

        wisk.utils.showLoading('Generating draft...');

        try {
            const response = await fetch(wisk.editor.backendUrl + '/v2/outline', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    whatAreYouWriting: whatInput,
                    whoIsTheAudience: audienceInput,
                    whatIsTheGoal: goalInput,
                    category: categorySelect,
                    generateOnlyOutline: onlyOutline,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.text(); // Get response as text

            // Create text blocks with the returned content
            var elements = wisk.editor.convertMarkdownToElements(data);
            console.log('----- Elements:', elements);
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].component != 'main-element') {
                    wisk.editor.createBlockNoFocus('', elements[i].component, elements[i].value);
                } else {
                    document.getElementById('abcdxyz').setValue('', elements[i].value);
                    document.getElementById('abcdxyz').sendUpdates();
                }
            }

            this.closeDialog();
        } catch (error) {
            console.error('Generation error:', error);
            wisk.utils.showToast('Error generating draft', 5000);
        } finally {
            wisk.utils.hideLoading();
        }
    }

    renderDraftAnythingDialog() {
        return html`
            <div class="dialog-content thin-dialog-content">
                <button class="dialog-close" @click=${this.closeDialog}>
                    <img src="/a7/forget/x.svg" alt="Close" style="filter: var(--themed-svg)" />
                </button>
                <h2 class="dialog-title">Draft Anything</h2>

                <div class="main-group">
                    <div class="input-group">
                        <label class="input-label">What are you writing?</label>
                        <textarea
                            id="ol1"
                            class="text-input textarea"
                            placeholder="For example, 'A blog post about gardening.' or 'A product description for a new app.'"
                        ></textarea>
                    </div>

                    <div class="input-group">
                        <label class="input-label">Who is the intended audience?</label>
                        <textarea
                            id="ol2"
                            class="text-input textarea"
                            placeholder="For example, 'People interested in gardening.' or 'Tech-savvy users.'"
                        ></textarea>
                    </div>

                    <div class="input-group">
                        <label class="input-label">What is your goal?</label>
                        <textarea
                            id="ol3"
                            class="text-input textarea"
                            placeholder="For example, 'To inform readers about the benefits of organic gardening.' or 'To persuade users to download the app.'"
                        ></textarea>
                    </div>

                    <div class="input-group">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--gap-2 gap: var(--gap-2))">
                            <select class="text-input" id="ol4">
                                <option value="" disabled selected>Select a category...</option>
                                <option value="blog">Blog Post</option>
                                <option value="article">Article</option>
                                <option value="essay">Essay</option>
                                <option value="report">Report</option>
                                <option value="creative">Creative Writing</option>
                                <option value="technical">Technical Document</option>
                                <option value="marketing">Marketing Content</option>
                                <option value="other">Other</option>
                            </select>
                            <div style="display: flex; align-items: center;">
                                <label for="checkbox-outline">Only generate outline</label>
                                <input
                                    type="checkbox"
                                    id="checkbox-outline"
                                    name="checkbox-outline"
                                    value="outline"
                                    style="margin-left: 8px; width: 16px; height: 16px"
                                />
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--gap-1)">
                        <p class="warning-text">AI can make mistakes—please review carefully for accuracy!</p>

                        <button class="generate-button" @click=${this.generateDraft}>
                            <img src="/a7/forget/gs-ai.svg" alt="Generate" style="width: 22px; filter: var(--accent-svg)" />
                            Generate
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderOutlineDialog() {
        return html`
            <div class="dialog-content thin-dialog-content">
                <button class="dialog-close" @click=${this.closeDialog}>
                    <img src="/a7/forget/x.svg" alt="Close" style="filter: var(--themed-svg)" />
                </button>
                <h2 class="dialog-title">Draft an Outline</h2>

                <div class="main-group">
                    <div class="input-group">
                        <label class="input-label">What are you writing?</label>
                        <textarea
                            class="text-input textarea"
                            placeholder="For example, 'A blog post about gardening.' or 'A product description for a new app.'"
                        ></textarea>
                    </div>

                    <div class="input-group">
                        <label class="input-label">Who is the intended audience?</label>
                        <textarea
                            class="text-input textarea"
                            placeholder="For example, 'People interested in gardening.' or 'Tech-savvy users.'"
                        ></textarea>
                    </div>

                    <div class="input-group">
                        <label class="input-label">What is your goal?</label>
                        <textarea
                            class="text-input textarea"
                            placeholder="For example, 'To inform readers about the benefits of organic gardening.' or 'To persuade users to download the app.'"
                        ></textarea>
                    </div>

                    <div class="input-group">
                        <label class="input-label">Category</label>
                        <select class="text-input">
                            <option value="" disabled selected>Select a category...</option>
                            <option value="blog">Blog Post</option>
                            <option value="article">Article</option>
                            <option value="essay">Essay</option>
                            <option value="report">Report</option>
                            <option value="creative">Creative Writing</option>
                            <option value="technical">Technical Document</option>
                            <option value="marketing">Marketing Content</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--gap-1)">
                        <button class="generate-button">
                            <img src="/a7/forget/gs-ai.svg" alt="Generate" style="width: 22px; filter: var(--accent-svg)" />
                            Generate Outline
                        </button>

                        <p class="warning-text">AI can make mistakes—please review carefully for accuracy!</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderBrainstormDialog() {
        return html`
            <div class="dialog-content">
                <button class="dialog-close" @click=${this.closeDialog}>
                    <img src="/a7/forget/x.svg" alt="Close" style="filter: var(--themed-svg)" />
                </button>
                <h2 class="dialog-title">Brainstorm Ideas</h2>

                <div class="brainstorm-container">
                    <div class="chat-section">
                        <div class="chat-messages">
                            <div class="message assistant">Let's brainstorm some ideas! What topic would you like to explore?</div>
                            <div class="message user">I want to write about sustainable urban gardening.</div>
                            <div class="message assistant">
                                Great choice! I've created an initial mind map. Feel free to ask me to expand any branch or add new topics.
                            </div>
                        </div>
                        <div class="chat-input">
                            <input type="text" class="bs-input" placeholder="Type your message here..." />
                        </div>
                    </div>

                    <div class="visualization-section">
                        <div class="mermaid-wrapper">
                            <mermaid-element read-only id="bs-mermaid"></mermaid-element>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderTopicsDialog() {
        return html`
            <div class="dialog-content thin-dialog-content">
                <button class="dialog-close" @click=${this.closeDialog}>
                    <img src="/a7/forget/x.svg" alt="Close" style="filter: var(--themed-svg)" />
                </button>
                <h2 class="dialog-title">Topics to Cover</h2>

                <div class="main-group">
                    <div class="input-group">
                        <label class="input-label">What topics would you like to cover? (separate with commas)</label>
                        <textarea
                            class="text-input textarea"
                            placeholder="For example, 'Benefits of organic gardening.' or 'How to start a community garden.'"
                        ></textarea>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--gap-1)">
                        <button class="generate-button">
                            <img src="/a7/forget/gs-save.svg" alt="Generate" style="width: 22px; filter: var(--accent-svg)" />
                            Save
                        </button>

                        <p class="warning-text">This will give AI a better understanding of your content</p>
                    </div>
                </div>
            </div>
        `;
    }

    async convertFile() {
        if (!this.selectedFile) return;

        const user = await document.querySelector('auth-component').getUserInfo();
        const token = user.token;

        wisk.utils.showLoading('Converting file...');

        // Create FormData and append the file
        const formData = new FormData();
        formData.append('fileContent', await this.fileToBase64(this.selectedFile));
        formData.append('fileName', this.selectedFile.name);
        formData.append('fileType', this.selectedFile.name.split('.').pop().toLowerCase());

        try {
            const response = await fetch(wisk.editor.backendUrl + '/v2/convert', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    fileContent: await this.fileToBase64(this.selectedFile),
                    fileName: this.selectedFile.name,
                    fileType: this.selectedFile.name.split('.').pop().toLowerCase(),
                }),
            });

            if (response.status !== 200) {
                wisk.utils.showToast('Error converting file', 5000);
                console.error('Conversion error:', response);
            } else {
                const data = await response.json();
                console.log('Conversion response:', data);
                // We'll handle the response later
            }
        } catch (error) {
            console.error('Conversion error:', error);
            wisk.utils.showToast('Error converting file', 5000);
        } finally {
            wisk.utils.hideLoading();
        }
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
                resolve(encoded);
            };
            reader.onerror = error => reject(error);
        });
    }

    async importMd() {
        if (!this.selectedFile) {
            wisk.utils.showToast('No file selected', 5000);
            return;
        }

        try {
            // Show loading state
            wisk.utils.showLoading('Importing markdown...');

            // Read the file content
            const fileContent = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = e => reject(e);
                reader.readAsText(this.selectedFile);
            });

            // Convert markdown to elements
            const elements = wisk.editor.convertMarkdownToElements(fileContent);
            console.log('----- Elements:', elements);

            // Create blocks for each element
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].component !== 'main-element') {
                    wisk.editor.createBlockNoFocus('', elements[i].component, elements[i].value);
                } else {
                    document.getElementById('abcdxyz').setValue('', elements[i].value);
                    document.getElementById('abcdxyz').sendUpdates();
                }
            }

            // Close the dialog and show success message
            this.closeDialog();
            wisk.utils.showToast('File imported successfully', 5000);
        } catch (error) {
            console.error('Error importing markdown:', error);
            wisk.utils.showToast('Error importing file', 5000);
        } finally {
            wisk.utils.hideLoading();
        }
    }

    renderImportDialog() {
        return html`
            <div class="dialog-content thin-dialog-content">
                <button class="dialog-close" @click=${this.closeDialog}>
                    <img src="/a7/forget/x.svg" alt="Close" style="filter: var(--themed-svg)" />
                </button>
                <h2 class="dialog-title">Import from File</h2>

                <div class="main-group">
                    ${this.selectedFile
                        ? html`
                              <div class="selected-file">
                                  <div class="file-info">
                                      <img src="/a7/forget/gs-import.svg" alt="File" class="file-icon" />
                                      <span class="file-name">${this.selectedFile.name}</span>
                                      <span class="file-size">${this.formatFileSize(this.selectedFile.size)}</span>
                                  </div>
                                  <button class="remove-file" @click=${this.removeFile}>
                                      <img src="/a7/forget/x.svg" alt="Remove" style="width: 16px; height: 16px; filter: var(--themed-svg)" />
                                  </button>
                              </div>

                              <div style="display: flex; gap: var(--gap-2); margin-top: var(--gap-3)">
                                  <button class="generate-button" @click=${this.convertFile} style="display: none">
                                      <img src="/a7/forget/gs-ai.svg" alt="Convert" style="width: 22px; filter: var(--accent-svg)" />
                                      Convert to Markdown
                                  </button>
                                  <button class="generate-button" @click=${this.importMd}>
                                      <img src="/a7/forget/gs-import.svg" alt="Import" style="width: 22px; filter: var(--accent-svg)" />
                                      Import Raw
                                  </button>
                              </div>
                          `
                        : html`
                              <div class="drop-zone" @dragover=${this.handleDragOver} @drop=${this.handleDrop} @dragleave=${this.handleDragLeave}>
                                  <img
                                      src="/a7/forget/gs-import.svg"
                                      alt="Upload"
                                      style="width: 48px; height: 48px; filter: var(--themed-svg); margin-bottom: var(--gap-3)"
                                  />
                                  <p class="drop-text">Drag and drop your file here</p>
                                  <p class="supported-formats">Supported formats: Markdown (pdf and docx support coming soon)</p>
                                  <input type="file" id="fileInput" accept=".md,.markdown" style="display: none;" @change=${this.handleFileSelect} />
                                  <button class="browse-button" @click=${this.triggerFileInput}>Browse Files</button>
                              </div>
                          `}

                    <div style="margin-top: var(--gap-3)">
                        <p class="warning-text">Note: Format conversion may not be perfect</p>
                    </div>
                </div>
            </div>
        `;
    }

    importFile() {
        console.log('Importing file:', this.selectedFile);
        var lines = [];
        var reader = new FileReader();
        reader.onload = e => {
            const text = e.target.result;
            lines = text.split('\n');
            console.log('Lines:', lines);
            for (let i = 0; i < lines.length; i++) {
                console.log(i, '--', lines.length, 'Creating block:', lines[i]);
                wisk.editor.createNewBlock(
                    '',
                    'text-element',
                    {
                        textContent: lines[i],
                    },
                    { x: 0 }
                );
            }
        };

        reader.readAsText(this.selectedFile);
    }

    async pluginPacks(usecase) {
        var plugins = [];
        switch (usecase) {
            case 'student':
                plugins = ['word-count', 'symbols'];
                break;
            case 'student-but-cooler':
                plugins = ['word-count', 'symbols', 'nightwave-plaza-radio', 'brainrot', 'powerlevel'];
                break;
            case 'blog':
                plugins = ['table-of-contents', 'super-divider', 'accordion-element'];
                break;
            default:
                break;
        }

        var str = '';

        for (let i = 0; i < plugins.length; i++) {
            str += wisk.plugins.getPluginGroupDetail(plugins[i]).title + (i < plugins.length - 1 ? ', ' : '');
            await wisk.plugins.loadPlugin(plugins[i]);
            await wisk.editor.addConfigChange('document.config.plugins.add', plugins[i]);
        }

        wisk.utils.showDialog('Installed plugins: ' + str, 'Info');
    }

    render() {
        if (wisk.editor.readonly) {
            return html``;
        }

        return html`
            <div id="getting-started">
                <div style="display: flex; gap: var(--gap-3); flex-wrap: wrap; align-items: center;">
                    Get started with
                    <div style="display: flex; gap: var(--gap-2); flex-wrap: wrap">
                        <button class="gs-button" @click=${() => this.showDialog('draft')}>
                            <img src="/a7/forget/gs-draft-anything.svg" alt="" /> Draft anything
                        </button>
                        <button class="gs-button" @click=${() => document.querySelector('template-dialog').show()}>
                            <img src="/a7/forget/gs-templates.svg" alt="" /> Start with Templates
                        </button>
                        <button class="gs-button" @click=${() => this.showDialog('brainstorm')} style="display: none">
                            <img src="/a7/forget/gs-brainstorm.svg" alt="" /> Brainstorm Ideas
                        </button>
                        <button class="gs-button" @click=${() => this.showDialog('topics')} style="display: none">
                            <img src="/a7/forget/gs-cover.svg" alt="" /> Topics to cover
                        </button>
                        <button class="gs-button" @click=${() => this.showDialog('import')}>
                            <img src="/a7/forget/gs-import.svg" alt="" /> Import from file
                        </button>
                        <button class="gs-button" @click=${() => document.querySelector('help-dialog').show()}>
                            <img src="/a7/forget/gs-help.svg" alt="" /> Help
                        </button>
                    </div>
                </div>

                <div style="display: flex; gap: var(--gap-3); flex-wrap: wrap; align-items: center;">
                    1 click install plugins for
                    <div style="display: flex; gap: var(--gap-2); flex-wrap: wrap">
                        <button class="gs-button" @click=${() => this.pluginPacks('student')}>Academic Assignment</button>
                        <button class="gs-button" @click=${() => this.pluginPacks('student-but-cooler')}>Academic Assignment (Cool)</button>
                        <button class="gs-button" @click=${() => this.pluginPacks('blog')}>Blogging</button>
                    </div>
                </div>
                <p style="display: flex; margin-top: 20px; align-items: center; gap: var(--gap-1);">
                    <img src="/a7/forget/gs-info.svg" alt="Tip" style="height: 16px; filter: var(--accent-svg)" title="Tip" /> <span id="tip"></span>
                </p>

                <div class="dialog-overlay" style="display: ${this.activeDialog ? 'flex' : 'none'}">
                    ${this.activeDialog === 'draft' ? this.renderDraftAnythingDialog() : ''}
                    ${this.activeDialog === 'brainstorm' ? this.renderBrainstormDialog() : ''}
                    ${this.activeDialog === 'topics' ? this.renderTopicsDialog() : ''}
                    ${this.activeDialog === 'import' ? this.renderImportDialog() : ''}
                </div>
            </div>
        `;
    }
}

customElements.define('getting-started', GettingStarted);
