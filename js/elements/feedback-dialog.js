import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class FeedbackDialog extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            transition: all 0.3s ease;
            user-select: none;
            outline: none;
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
            max-width: 800px;
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
                left: 0;
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

        .main-group {
            overflow-y: auto;
            height: inherit;
            display: flex;
            flex-direction: column;
            gap: calc(var(--gap-3) * 2);
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
            padding: var(--padding-3) var(--padding-4);
            background: var(--bg-accent);
            color: var(--fg-accent);
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            font-weight: 500;
        }

        .submit-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
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

        input[type='email'] {
            padding: var(--padding-3);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background: var(--bg-2);
            color: var(--fg-1);
            max-width: 300px;
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

            const response = await fetch(wisk.editor.backendUrl + '/v2/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            });

            if (!response.ok) {
                wisk.utils.showToast('Failed to submit feedback. Please try again later.', 3000);
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
            <div class="dialog-overlay" style="display: ${this.visible ? 'flex' : 'none'}">
                <div class="dialog-content">
                    <button class="dialog-close" @click=${this.hide}>
                        <img src="/a7/forget/x.svg" alt="Close" style="filter: var(--themed-svg)" />
                    </button>
                    <h2 class="dialog-title">Send Feedback</h2>
                    <div class="main-group">
                        <div class="input-group">
                            <label class="input-label">What's on your mind?</label>
                            <p class="input-description">Your feedback helps us improve the editor for everyone.</p>
                            <textarea
                                placeholder="Share your thoughts, suggestions, or report issues..."
                                .value=${this.feedback}
                                @input=${this.handleFeedbackInput}
                            ></textarea>
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
                            <label class="input-label">Contact Information</label>
                            <p class="input-description">We may need to follow up with you to get more details. (Optional)</p>
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

                        <button class="submit-button" @click=${this.handleSubmit} ?disabled=${!this.rating && !this.feedback}>Submit Feedback</button>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('feedback-dialog', FeedbackDialog);
