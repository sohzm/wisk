import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class AIChat extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            scroll-behavior: smooth;
        }
        .container {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .sources {
            background-color: var(--bg-2);
            border-bottom: 1px solid var(--border-1);
            max-height: 300px;
            overflow-y: auto;
        }
        .chat {
            flex: 1;
            overflow-y: auto;
            background-color: var(--bg-1);
            padding: var(--padding-4);
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
        }
        .message {
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
            padding: var(--padding-3) 0;
            border-radius: var(--radius);
            background: transparent;
        }
        .message.user {
            background: var(--bg-1);
        }
        .message-header-user {
            font-size: 12px;
            color: var(--fg-2);
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }
        .message-content-user {
            font-size: 14px;
            color: var(--fg-1);
            white-space: pre-wrap;
            user-select: text;
            line-height: 1.5;
        }
        .message-header-assistant {
            font-size: 12px;
            color: var(--fg-2);
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }
        .message-content-assistant {
            font-size: 14px;
            color: var(--fg-1);
            white-space: pre-wrap;
            user-select: text;
            line-height: 1.5;
        }
        .input {
            background-color: var(--bg-1);
        }
        .source {
            padding: var(--padding-w1);
            background-color: var(--bg-3);
            border: 1px solid var(--border-1);
            font-size: 14px;
            border-radius: var(--radius);
        }
        .sources-button {
            background-color: var(--bg-2);
            border: none;
            color: var(--fg-1);
            cursor: pointer;
            display: flex;
            font-size: 14px;
            padding: var(--padding-3) var(--padding-4);
            width: 100%;
        }
        .sources-expand {
            padding: var(--padding-4);
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
            padding-top: 0;
            padding-bottom: var(--padding-3);
        }
        .input-div {
            padding: var(--padding-4);
            background: var(--bg-1);
        }
        .in1 {
            padding: var(--padding-4);
            display: flex;
            gap: var(--gap-2);
            flex-direction: column;
            border: 2px solid var(--border-1);
            border-radius: var(--radius);
            background-color: var(--bg-1);
            position: relative;
        }
        .in1:hover,
        .in1:focus-within {
            border: 2px solid var(--fg-blue);
        }
        .in2btn {
            padding: var(--padding-2);
            background: transparent;
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            filter: var(--drop-shadow);
            color: var(--fg-1);
            border: 1px solid transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--gap-1);
        }
        .in2btn:hover {
            border: 1px solid var(--border-1);
            background: var(--bg-3);
        }
        .in2btn img {
            filter: var(--themed-svg);
            height: 18px;
            width: 18px;
        }
        .in2 {
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background: var(--bg-3);
        }
        .in3 {
            display: flex;
            justify-content: space-between;
            padding: var(--padding-3);
        }
        .input-textarea {
            resize: none;
            outline: none;
            border: none;
            background: var(--bg-1);
            font-size: 14px;
            color: var(--fg-1);
        }
        .suggest {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: var(--gap-1);
            padding: var(--padding-2);
            background: transparent;
            color: var(--fg-1);
            border: none;
            border-radius: var(--radius);
            outline: none;
            cursor: pointer;
            font-size: 14px;
        }
        .selected-text {
            font-size: 14px;
            color: var(--fg-2);
            border-left: 2px solid var(--border-1);
            padding-left: var(--padding-2);
        }
        .suggest:hover {
            text-decoration: underline;
        }
        .px1 {
            padding: var(--padding-3);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-top: 0;
            user-select: text;
        }
        .neo-header {
            display: flex;
            align-items: center;
            padding-top: 100px;
            justify-content: center;
            flex-direction: column;
            margin-bottom: 20px;
        }
        .neo-description {
            font-size: 16px;
            color: var(--fg-1);
            margin: var(--padding-4);
            text-align: center;
            max-width: 500px;
            line-height: 1.5;
        }
        .loading-indicator {
            display: flex;
            justify-content: center;
            margin-top: var(--padding-4);
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
        .input-textarea[data-empty='true']::before {
            content: attr(data-placeholder);
            color: var(--fg-2);
            pointer-events: none;
            position: absolute;
        }

        .input-textarea:focus::before {
            content: '';
        }
    `;

    static properties = {
        messages: { type: Array },
        expandSources: { type: Boolean },
        expandSuggestions: { type: Boolean },
        selectedElementId: { type: String },
        selectedText: { type: String },
        loading: { type: Boolean },
        showFileUploadDialog: { type: Boolean },
        isInputEmpty: { type: Boolean },
    };

    constructor() {
        super();
        this.expandSources = false;
        this.expandSuggestions = false;
        this.selectedElementId = '';
        this.selectedText = '';
        this.messages = [];
        this.loading = false;
        this.sources = [
            {
                name: 'This Document',
                category: 'Page',
            },
        ];
        wisk.plugins.AIChatSetSelection = this.setSelection.bind(this);
        this.showFileUploadDialog = false;
        this.isInputEmpty = true;
    }

    setSelection(elementId, text) {
        this.selectedElementId = elementId;
        this.selectedText = text;
    }

    toggleSources() {
        this.expandSources = !this.expandSources;
    }

    openFileUploadDialog() {
        this.showFileUploadDialog = true;
    }

    handleDialogClosed() {
        this.showFileUploadDialog = false;
    }

    handleFilesUploaded(event) {
        const uploadedFiles = event.detail;
        console.log('Files uploaded:', uploadedFiles);
    }

    toggleSuggestions() {
        this.expandSuggestions = !this.expandSuggestions;
    }

    async sendMessage(event) {
        event.preventDefault();
        const textarea = this.shadowRoot.querySelector('.input-textarea');
        const message = textarea.textContent.trim();

        if (!message) return;

        // Clear the textarea and reset its placeholder state
        textarea.textContent = '';
        textarea.setAttribute('data-empty', 'true');
        this.isInputEmpty = true;

        this.loading = true;

        var md = '';

        for (var i = 0; i < wisk.editor.document.data.elements.length; i++) {
            var element = wisk.editor.document.data.elements[i];
            var e = document.getElementById(element.id);
            if ('getTextContent' in e) {
                var textContent = e.getTextContent();
                md += textContent.markdown + '\n\n';
            }
        }

        this.scrollChat();

        try {
            const auth = await document.getElementById('auth').getUserInfo();
            const response = await fetch(wisk.editor.backendUrl + '/v1/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + auth.token,
                },
                body: JSON.stringify({
                    ops: message,
                    selectedText: this.selectedText,
                    document: md,
                    messages: this.messages,
                }),
            });

            var completion = await response.json();
            completion = completion.content.trim();

            this.messages = [
                ...this.messages,
                {
                    content: message,
                    by: 'user',
                    selectedText: this.selectedText || '',
                },
                {
                    content: completion,
                    by: 'assistant',
                    selectedText: '',
                },
            ];

            requestAnimationFrame(() => {
                const chat = this.shadowRoot.querySelector('.chat');
                chat.scrollTop = chat.scrollHeight;
            });
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            this.loading = false;
        }
    }

    returnSuggestions() {
        if (this.selectedText.split(' ').length <= 2 && this.selectedText.length > 0) {
            return ['Find Synonyms', 'Define Word'];
        }

        if (this.selectedText.length > 0) {
            return ['Paraphrase selected text', 'Expand selected text'];
        }

        return ['How can I improve my document?', 'Summarize my document', 'Find sources', 'Add conclusion'];
    }

    suggestAction(action) {
        this.shadowRoot.querySelector('.input-textarea').value = action;
        this.expandSuggestions = false;
        this.shadowRoot.querySelector('.input-textarea').focus();
    }

    clearSelection() {
        this.selectedElementId = '';
        this.selectedText = '';
    }

    scrollChat() {
        const chat = this.shadowRoot.querySelector('.chat');
        chat.scrollTop = chat.scrollHeight;
    }

    render() {
        return html`
            <div class="container">
                <div class="chat">
                    <div class="neo-header">
                        <img src="/a7/plugins/ai-chat/neo.svg" style="filter: var(--themed-svg)" />
                        <p class="neo-description">
                            Your intelligent document companion – researching, writing, and organizing at superhuman speed.
                            <br />
                            <a href="https://wisk.cc/neo" target="_blank" style="color: var(--fg-blue)">Learn more</a>
                        </p>
                    </div>

                    ${this.messages.map(
                        message => html`
                            <div class="message ${message.by}">
                                ${message.selectedText ? html` <div class="selected-text">${message.selectedText}</div> ` : ''}
                                <div class="message-header-${message.by.toLowerCase()}">
                                    ${message.by === 'user'
                                        ? html`
                                              <img src="/a7/plugins/ai-chat/user.svg" style="height: 22px; width: 22px; filter: var(--themed-svg)" />
                                          `
                                        : html`
                                              <img
                                                  src="/a7/plugins/ai-chat/neo-circle.svg"
                                                  style="height: 22px; width: 22px; filter: var(--themed-svg)"
                                              />
                                          `}
                                    ${message.by === 'user' ? 'You' : 'Neo'}
                                </div>
                                <div class="message-content-${message.by.toLowerCase()}">${message.content}</div>
                            </div>
                        `
                    )}
                    ${this.loading
                        ? html`
                              <div class="message assistant">
                                  <div class="message-header-assistant">
                                      <img src="/a7/plugins/ai-chat/neo-loading.svg" style="height: 30px; filter: var(--themed-svg)" />
                                      Neo
                                  </div>
                                  <div class="message-content-assistant">Thinking...</div>
                              </div>
                          `
                        : ''}
                </div>

                <div class="input">
                    ${this.expandSuggestions
                        ? html`
                              <div
                                  class="sources-expand"
                                  style="background: var(--bg-1); padding-top: var(--padding-4); padding-bottom: 0; gap: var(--gap-1)"
                              >
                                  ${this.returnSuggestions().map(
                                      suggestion => html`
                                          <button class="suggest" @click=${() => this.suggestAction(suggestion)}>${suggestion}</button>
                                      `
                                  )}
                              </div>
                          `
                        : html``}

                    <div class="input-div">
                        <div class="in1" style="${this.selectedText ? '' : 'padding: var(--padding-3)'}">
                            <div class="in2" style="display: ${this.selectedText ? 'block' : 'none'}">
                                <div class="in3">
                                    <img src="/a7/plugins/ai-chat/enter.svg" style="height: 18px; width: 18px; filter: var(--themed-svg)" />
                                    <img
                                        src="/a7/plugins/ai-chat/x.svg"
                                        style="height: 18px; width: 18px; filter: var(--themed-svg)"
                                        @click=${() => this.clearSelection()}
                                    />
                                </div>
                                <p class="px1">${this.selectedText}</p>
                            </div>

                            <div
                                class="input-textarea"
                                style="max-height: 200px; overflow: auto"
                                contenteditable="true"
                                data-placeholder="Ask me anything about your document..."
                                data-empty="true"
                                @input=${this.handleInput}
                                @keydown=${this.handleKeyDown}
                            ></div>

                            <div style="display: flex; gap: var(--gap-2); align-items: stretch;">
                                <button class="in2btn" @click=${this.openFileUploadDialog}>
                                    <img src="/a7/plugins/ai-chat/attach.svg" />
                                </button>
                                <button class="in2btn" @click=${this.toggleSuggestions}>
                                    <img src="/a7/plugins/ai-chat/wand.svg" />
                                </button>
                                <div style="flex: 1"></div>
                                <button class="in2btn" @click=${this.sendMessage}>
                                    <img src="/a7/plugins/ai-chat/up.svg" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <file-upload-dialog
                .isOpen=${this.showFileUploadDialog}
                @dialog-closed=${this.handleDialogClosed}
                @files-uploaded=${this.handleFilesUploaded}
            ></file-upload-dialog>
        `;
    }

    handleInput(e) {
        const textarea = e.target;
        this.isInputEmpty = textarea.textContent.trim() === '';
        textarea.setAttribute('data-empty', this.isInputEmpty);
    }

    handleKeyDown(e) {
        if ((e.key === 'Enter' && e.shiftKey) || (e.key === 'Enter' && e.ctrlKey)) {
            this.sendMessage(e);
        }
    }
}

customElements.define('ai-chat', AIChat);
