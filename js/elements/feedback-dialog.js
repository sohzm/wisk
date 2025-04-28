import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class FeedbackDialog extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
            transition: all 0.3s ease;
            outline: none;
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
            max-width: 1010px;
            max-height: 730px;
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

        @starting-style {
            .dialog-content {
                opacity: 0;
            }
        }

        .header {
            display: flex;
            flex-direction: row;
            color: var(--fg-1);
            gap: var(--gap-2);
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: calc(20px + var(--gap-3));
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
            font-size: 30px;
            font-weight: 500;
        }

        .icon {
            cursor: pointer;
            transition: transform 0.2s ease;
            width: 22px;
        }

        .main-group {
            overflow-y: auto;
            height: inherit;
            display: flex;
            flex-direction: column;
            gap: calc(var(--gap-3) * 2);
            flex: 1;
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
        }

        .input-label {
            color: var(--fg-1);
            font-weight: 500;
        }

        .input-description {
            color: var(--fg-2);
            font-size: 0.9rem;
        }

        textarea {
            width: 100%;
            min-height: 120px;
            padding: var(--padding-3);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background: var(--bg-2);
            color: var(--fg-1);
            resize: vertical;
            font-size: 0.9rem;
            user-select: text;
        }

        .rating-group {
            display: flex;
            gap: var(--gap-2);
        }

        .rating-button {
            padding: var(--padding-2) var(--padding-4);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background: var(--bg-2);
            color: var(--fg-1);
            cursor: pointer;
        }

        .rating-button.selected {
            background: var(--fg-accent);
            color: var(--bg-accent);
            border-color: transparent;
            font-weight: 500;
        }

        .submit-button {
            background: var(--fg-1);
            color: var(--bg-1);
            padding: var(--padding-w2);
            font-weight: 600;
            border-radius: calc(var(--radius-large) * 20);
            border: 2px solid transparent;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
            margin-left: auto;
        }

        .submit-button:hover {
            background-color: transparent;
            border: 2px solid var(--fg-1);
            color: var(--fg-1);
        }

        .submit-button:disabled {
            background-color: var(--bg-3);
            color: var(--fg-2);
            border: 2px solid transparent;
            cursor: not-allowed;
        }

        input[type='email'] {
            padding: var(--padding-3);
            border-radius: var(--radius);
            background: var(--bg-2);
            color: var(--fg-1);
            max-width: 300px;
            user-select: text;
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

        textarea,
        input {
            border: 2px solid var(--bg-3);
        }

        textarea:focus,
        input:focus {
            border: 2px solid var(--fg-accent);
            outline: none;
        }
    `;

    static properties = {
        visible: { type: Boolean },
        rating: { type: Number },
        feedback: { type: String },
    };

    constructor() {
        super();
        this.visible = false;
        this.rating = 0;
        this.feedback = '';
    }

    show() {
        this.visible = true;
        this.requestUpdate();
    }

    hide() {
        this.visible = false;
        this.requestUpdate();
    }

    handleBackdropClick() {
        this.hide();
    }

    handleRatingSelect(rating) {
        this.rating = rating;
    }

    handleFeedbackInput(e) {
        this.feedback = e.target.value;
    }

    async handleSubmit() {
        if (!this.rating) {
            this.rating = -1;
        }
        try {
            const emailInput = this.shadowRoot.querySelector('input[type="email"]');
            const feedbackData = {
                rating: this.rating,
                description: this.feedback,
                contact: emailInput.value.trim(),
                logs: '', // TODO - Implement log attachment -- for that clear the logs that have personal information then we add it :)
            };

            const response = await fetch(wisk.editor.backendUrl + '/v1/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            });

            if (!response.ok) {
                wisk.utils.showToast('Failed to submit feedback. Please try again later.', 3000);
                return;
            }

            this.rating = 0;
            this.feedback = '';
            emailInput.value = '';
            this.hide();
            wisk.utils.showToast('Feedback submitted successfully!', 3000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    }

    render() {
        return html`
            <div class="dialog-overlay" style="display: ${this.visible ? 'block' : 'none'}" @click=${this.handleBackdropClick}></div>
            <div class="dialog-content" style="display: ${this.visible ? 'flex' : 'none'}">
                <div class="header">
                    <div class="header-wrapper">
                        <div class="header-controls">
                            <label class="header-title">Send Feedback</label>
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
                    <div class="input-group">
                        <label class="input-label">What's on your mind?</label>
                        <textarea placeholder="So im having this issue..." .value=${this.feedback} @input=${this.handleFeedbackInput}></textarea>
                    </div>

                    <div class="input-group">
                        <label class="input-label">How would you rate your experience?</label>
                        <div class="rating-group">
                            ${[1, 2, 3, 4, 5].map(
                                num => html`
                                    <button
                                        class="rating-button ${this.rating === num ? 'selected' : ''}"
                                        @click=${() => this.handleRatingSelect(num)}
                                    >
                                        ${num}
                                    </button>
                                `
                            )}
                        </div>
                    </div>

                    <div class="input-group">
                        <label class="input-label">Contact Information (Optional)</label>
                        <input type="email" placeholder="Email Address" />
                    </div>

                    <div class="input-group" style="display: none">
                        <label class="input-label">Attach Logs</label>
                        <div style="gap: var(--gap-2); display: flex; align-items: center;">
                            <label class="input-description" for="attach-logs">Include logs to help us diagnose the issue.</label>
                            <input type="checkbox" id="attach-logs" name="attach-logs" />
                        </div>
                    </div>

                    <div style="flex: 1"></div>

                    <button class="submit-button" @click=${this.handleSubmit} ?disabled=${!this.rating && !this.feedback}>Submit</button>
                </div>
            </div>
        `;
    }
}

customElements.define('feedback-dialog', FeedbackDialog);
