import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";
import { marked } from "/a7/cdn/marked.esm-9.1.2.min.js";

class AIChat extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
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
        .chat, .wiskMode {
            flex: 1;
            overflow-y: auto;
            background-color: var(--bg-1);
            padding: var(--padding-4);
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
        }
        .clear-chat {
            align-self: center;
            margin-top: var(--padding-3);
            padding: var(--padding-3);
            background: transparent;
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            color: var(--text-1);
        }
        .clear-chat:hover {
            background: var(--bg-3);
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
        .message.assistant {
        }
        .message-header-user {
            font-size: 12px;
            color: var(--text-2);
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }
        .message-content-user {
            font-size: 14px;
            color: var(--text-1);
            white-space: pre-wrap;
            user-select: text;
        }
        .message-header-assistant {
            font-size: 12px;
            color: var(--text-2);
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }
        .message-content-assistant {
            font-size: 14px;
            color: var(--text-1);
            white-space: pre-wrap;
            user-select: text;
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
            color: var(--text-1);
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
        .in1:hover, .in1:focus-within {
            border: 2px solid var(--fg-blue);
        }

        .in2btn {
            padding: var(--padding-2);
            background: transparent;
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            filter: var(--drop-shadow);
            color: var(--text-1);
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
            color: var(--text-1);
        }
        .suggest {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: var(--gap-1);
            padding: var(--padding-2);
            background: transparent;
            color: var(--text-1);
            border: none;
            border-radius: var(--radius);
            outline: none;
            cursor: pointer;
            font-size: 14px;
        }
        .selected-text {
            font-size: 14px;
            color: var(--text-2);
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
        *::-webkit-scrollbar { width: 15px; }
        *::-webkit-scrollbar-track { background: var(--bg-1); }
        *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
        *::-webkit-scrollbar-thumb:hover { background-color: var(--text-1); }

        .message-content-assistant {
            font-size: 14px;
            color: var(--text-1);
            white-space: normal;
            user-select: text;
        }

        .markdown-content {
            line-height: 1.5;
        }

        .markdown-content p {
            margin-bottom: 1em;
        }

        .markdown-content code {
            background-color: var(--bg-3);
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: monospace;
        }

        .markdown-content pre {
            background-color: var(--bg-3);
            padding: var(--padding-3);
            border-radius: var(--radius);
            overflow-x: auto;
            margin: 1em 0;
        }

        .markdown-content pre code {
            background-color: transparent;
            padding: 0;
        }

        .markdown-content ul, .markdown-content ol {
            margin-left: 1.5em;
            margin-bottom: 1em;
        }

        .markdown-content h1, .markdown-content h2, .markdown-content h3,
        .markdown-content h4, .markdown-content h5, .markdown-content h6 {
            margin-top: 1em;
            margin-bottom: 0.5em;
            font-weight: bold;
        }

        .markdown-content blockquote {
            border-left: 3px solid var(--border-1);
            padding-left: 1em;
            margin: 1em 0;
            color: var(--text-2);
        }

        .markdown-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }

        .markdown-content th, .markdown-content td {
            border: 1px solid var(--border-1);
            padding: 0.5em;
            text-align: left;
        }

        .markdown-content th {
            background-color: var(--bg-3);
        }
        img {
            max-width: 100%;
        }
        .wisk-mode {
            border: 1px solid var(--border-1);
            background: var(--bg-3);
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
        wiskMode: { type: Boolean }
    };

    constructor() {
        super();
        this.expandSources = false;
        this.expandSuggestions = false;
        this.selectedElementId = "";
        this.selectedText = "";
        this.messages = [];
        this.loading = false;
        this.sources = [
            {
                name: "This Document",
                category: "Page",
            },
        ];
        window.wisk.plugins.AIChatSetSelection = this.setSelection.bind(this);
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: false
        });
        this.showFileUploadDialog = false;
        this.wiskMode = false;
        this.wiskAIWorking = false;
    }

    setSelection(elementId, text) {
        if (this.wiskMode) return;
        this.selectedElementId = elementId;
        this.selectedText = text;
    }

    toggleSources() {
        this.expandSources = !this.expandSources;
    }

    renderMarkdown(content) {
        try {
            return marked(content);
        } catch (error) {
            console.error('Error rendering markdown:', error);
            return content;
        }
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
        const message = textarea.value.trim();
        
        if (!message) return;
        
        textarea.value = '';
        this.loading = true;

        var md = "";

        for (var i = 0; i < window.wisk.editor.elements.length; i++) {
            var element = window.wisk.editor.elements[i];
            var e = document.getElementById(element.id);
            if ('getTextContent' in e) {
                var textContent = e.getTextContent();
                md += textContent.markdown + "\n\n";
            }
        }
        
        try {
            const auth = await document.getElementById("auth").getUserInfo();
            const response = await fetch("https://cloud.wisk.cc/v1/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + auth.token,
                },
                body: JSON.stringify({
                    ops: message,
                    selectedText: this.selectedText,
                    document: md,
                    messages: this.messages
                }),
            });
            
            var completion = await response.json();
            completion = completion.content.trim();
            
            // Add both messages after successful response, including selected text
            this.messages = [
                ...this.messages, 
                {
                    content: message,
                    by: 'user',
                    selectedText: this.selectedText || '' // Store selected text with the message
                },
                {
                    content: completion,
                    by: 'assistant',
                    selectedText: ''
                }
            ];
            
            // Scroll to bottom
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
        if (this.selectedText.split(" ").length <= 2 && this.selectedText.length > 0) {
            return [
                "Find Synonyms",
                "Define Word",
            ];
        }

        if (this.selectedText.length > 0) {
            return [
                "Paraphrase selected text",
                "Expand selected text",
            ];
        }

        return [
            "How can I improve my document?",
            "Summarize my document",
            "Find sources",
            "Add conclusion",
        ];
    }

    suggestAction(action) {
        this.shadowRoot.querySelector(".input-textarea").value = action;
        this.expandSuggestions = false;
        this.shadowRoot.querySelector(".input-textarea").focus();
    }

    clearSelection() {
        this.selectedElementId = "";
        this.selectedText = "";
    }

    toggleWiskMode() {

        if (this.wiskAIWorking) {
            window.wisk.utils.showToast("Wisk AI is already working on a task. Please wait for it to finish.", 3000);
            return;
        }

        this.wiskMode = !this.wiskMode;
        if (this.wiskMode) {
            document.querySelector(".editor").style.pointerEvents = "none";
            document.querySelector("toolbar-element").hideToolbar();
            // clear selection text, 
            this.selectedElementId = "";
            this.selectedText = "";
            // clear messages
            this.messages = [];
        } else {
            document.querySelector(".editor").style.pointerEvents = "auto";
        }
    }

    render() {
        return html`
            <div class="container">
                <div class="sources" style="display: ${this.wiskMode? 'none' : 'block'}; border-top: 1px solid var(--border-1)">
                    <button class="sources-button" @click=${this.toggleSources}>
                        Chat will use: ${this.sources.length} source${this.sources.length > 1? "s" : ""}
                        <div style="flex: 1"></div>
                        ${this.expandSources? "Hide" : "Show"} Settings
                    </button>
                    ${this.expandSources ? html`
                        <div class="sources-expand">
                            <p>Chat will use the following sources:</p>
                            ${this.sources.map(source => html`
                                <div class="source">${source.name}</div>
                            `)}

                            <button class="clear-chat" @click=${() => this.messages = []}>Clear Chat</button>
                        </div>
                    ` : html``}
                </div>
                
                <div class="chat" style="display: ${this.wiskMode? 'none' : 'block'}">
                    ${this.messages.map(message => html`
                        <div class="message ${message.by}">
                            ${message.selectedText ? html`
                                <div class="selected-text">${message.selectedText}</div>
                            ` : ''}
                            <div class="message-header-${message.by.toLowerCase()}">
                                ${message.by === 'user' ? html`
                                    <img src="/a7/plugins/ai-chat/user.svg" style="height: 22px; width: 22px; filter: var(--themed-svg)" />
                                ` : html`
                                    <img src="/a7/plugins/ai-chat/ai.svg" style="height: 22px; width: 22px; filter: var(--themed-svg)" />
                                `}
                                ${message.by === 'user' ? 'You' : 'Assistant'}
                            </div>
                            <div class="message-content-${message.by.toLowerCase()}">${message.by === 'assistant' ? 
                                    html`<div class="markdown-content" .innerHTML=${this.renderMarkdown(message.content)}></div>` : 
                                    message.content}</div>
                        </div>
                    `)}
                    ${(this.messages.length === 0) ? html`
                        <div class="message assistant">
                            <div class="message-header-assistant">
                                <img src="/a7/plugins/ai-chat/ai.svg" style="height: 22px; width: 22px; filter: var(--themed-svg)" />
                                Assistant
                            </div>
                            <div class="message-content-assistant">Hello! How can I help you today?</div>
                        </div>
                    ` : ''}
                    ${this.loading ? html`
                        <div class="message assistant">
                            <div class="message-header-assistant">
                                <img src="/a7/plugins/ai-chat/ai-animated.svg" style="height: 30px; width: 30px; filter: var(--themed-svg)" />
                                Assistant
                            </div>
                            <div class="message-content-assistant">Thinking...</div>
                        </div>
                    ` : ''}
                </div>

                <div class="wiskMode" style="display: ${this.wiskMode? 'block' : 'none'}">
                    <div style="display: flex; align-items: center; padding: 100px 0; justify-content: center; flex-direction: column">
                        <img src="/a7/plugins/ai-chat/neo.svg" style="filter: var(--themed-svg)" />
                        <p style="font-size: 16px; color: var(--text-1); margin: var(--padding-4); text-align: center; max-width: 500px; line-height: 1.5"> 
                            Your intelligent document companion – researching, writing, and organizing at superhuman speed.
                        </p>
                    </div>

                    <img src="/a7/plugins/ai-chat/circle-loading.svg" style="filter: var(--themed-svg); height: 32px" />
                </div>

                <div class="input">
                    ${this.expandSuggestions ? html`
                        <div class="sources-expand" style="background: var(--bg-1); padding-top: var(--padding-4); padding-bottom: 0; gap: var(--gap-1)">
                            ${this.returnSuggestions().map(suggestion => html`
                                <button class="suggest" @click=${() => this.suggestAction(suggestion)}>${suggestion}</button>
                            `)}
                        </div>
                    ` : html``}

                    <div class="input-div">
                        <div class="in1" style="${this.selectedText? '' : 'padding: var(--padding-3)'}">
                            <div class="in2" style="display: ${this.selectedText? 'block' : 'none'}">
                                <div class="in3">
                                    <img src="/a7/plugins/ai-chat/enter.svg" style="height: 18px; width: 18px; filter: var(--themed-svg)" />
                                    <img src="/a7/plugins/ai-chat/x.svg" style="height: 18px; width: 18px; filter: var(--themed-svg)" @click=${() => this.clearSelection()} />
                                </div>
                                <p class="px1">${this.selectedText}</p>
                            </div>
                            <textarea class="input-textarea" style="height: 100px;" placeholder="Type your message here"
                                @keydown=${(e) => { 
                                    if ((e.key === "Enter" && e.shiftKey)  || (e.key === "Enter" && e.ctrlKey)) {
                                        this.sendMessage(e); 
                                    } 
                                }}></textarea>
                            <div style="display: flex; gap: var(--gap-2); align-items: stretch;">
                                <button class="in2btn" @click=${this.openFileUploadDialog}> <img src="/a7/plugins/ai-chat/attach.svg"/> </button>
                                <button class="in2btn" @click=${this.toggleSuggestions}> <img src="/a7/plugins/ai-chat/wand.svg"/></button>
                                <div style="flex: 1"></div>
                                <button class="in2btn ${this.wiskMode? 'wisk-mode' : ''}" @click=${this.toggleWiskMode}> <img src="/a7/plugins/ai-chat/circle.svg"/> Wisk Neo AI </button>
                                <button class="in2btn" @click=${this.sendMessage}> <img src="/a7/plugins/ai-chat/up.svg"/> </button>
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
}

customElements.define("ai-chat", AIChat);
