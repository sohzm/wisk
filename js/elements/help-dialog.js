import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class HelpDialog extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
            transition: all 0.3s ease;
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
            flex: 1;
        }

        .quick-link {
            padding: var(--padding-w1);
            background: var(--bg-accent);
            color: var(--fg-accent);
            border-radius: var(--radius);
            cursor: pointer;
            text-decoration: none;
        }

        .input-label {
            color: var(--fg-1);
            font-weight: 500;
        }

        .shortcut {
            font-size: 14px;
            color: var(--fg-1);
            display: flex;
            justify-content: space-between;
            width: 100%;
            align-items: center;
            max-width: 400px;
        }

        .shortcut-key {
            background: var(--bg-3);
            color: var(--fg-1);
            padding: var(--padding-w1);
            border-radius: var(--radius);
            font-size: 14px;
            border: 1px solid var(--border-1);
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
    };

    constructor() {
        super();
        this.visible = false;
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

    render() {
        return html`
            <div class="dialog-overlay" style="display: ${this.visible ? 'block' : 'none'}" @click=${this.handleBackdropClick}></div>
            <div class="dialog-content" style="display: ${this.visible ? 'flex' : 'none'}">
                <div class="header">
                    <div class="header-wrapper">
                        <div class="header-controls">
                            <label class="header-title">Help</label>
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
                    <div style="display: flex; align-items: center; gap: var(--gap-3); font-size: 15px; flex-wrap: wrap">
                        <label class="input-label">Quick Links</label>
                        <div style="display: flex; gap: var(--gap-2); flex-wrap: wrap">
                            <a target="_blank" href="https://wisk.cc/faq" class="quick-link">FAQ</a>
                            <a target="_blank" href="https://discord.gg/D8tQCvgDhu" class="quick-link">Discord</a>
                            <a target="_blank" href="https://github.com/sohzm/wisk/blob/master/docs/docs.md" class="quick-link">Documentation</a>
                            <a target="_blank" href="https://wisk.cc/contact" class="quick-link">Contact Support</a>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--gap-2); margin-top: var(--gap-3)">
                        <h3>Shortcuts</h3>
                        <div style="display: flex; gap: var(--gap-2); flex-direction: column; width: 100%;">
                            <p class="shortcut">Command Palette <span class="shortcut-key">Ctrl + Shift + P</span></p>
                            <p class="shortcut">Search <span class="shortcut-key">Ctrl + Shift + F</span></p>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--gap-2); margin-top: var(--gap-3)">
                        <h3>Tutorials</h3>
                        <div style="display: flex; gap: var(--gap-2); overflow-x: auto; width: -webkit-fill-available;">
                            <iframe
                                width="360"
                                height="200"
                                style="border-radius: var(--radius); border: 1px solid var(--border-1)"
                                src=""
                                title="YouTube video player"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerpolicy="strict-origin-when-cross-origin"
                                allowfullscreen
                            >
                            </iframe>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('help-dialog', HelpDialog);
