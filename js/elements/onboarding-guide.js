import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class OnboardingGuide extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
            user-select: none;
        }

        :host {
            display: none;
        }

        :host(.visible) {
            display: block;
        }

        .dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9998;
            pointer-events: auto;
            background: var(--bg-3);
            opacity: 0.5;
        }

        .spotlight {
            position: fixed;
            pointer-events: none;
            z-index: 9997;
            transition:
                top 0.3s ease,
                left 0.3s ease,
                width 0.3s ease,
                height 0.3s ease;
            border: 3px solid var(--fg-accent);
            border-radius: var(--radius);
        }

        .dialog-content {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-1);
            border-radius: var(--radius-large);
            padding: var(--padding-4);
            max-width: 280px;
            width: 280px;
            min-height: 100px;
            border: 2px solid var(--bg-3);
            filter: var(--drop-shadow);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            transition:
                top 0.3s ease,
                left 0.3s ease;
        }

        .dialog-content.positioned {
            position: absolute;
            transform: none;
        }

        .prompt-dialog {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--bg-1);
            border-radius: var(--radius-large);
            padding: var(--padding-4);
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            z-index: 10000;
            filter: var(--drop-shadow);
            border: 2px solid var(--bg-3);
            min-width: 280px;
            animation: slideUp 0.4s ease-out 1s forwards;
            transform: translateY(calc(100% + 40px));
        }

        @keyframes slideUp {
            to {
                transform: translateY(0);
            }
        }

        .prompt-dialog span {
            color: var(--fg-1);
            font-size: 15px;
            font-weight: 500;
        }

        .prompt-buttons {
            display: flex;
            gap: var(--gap-2);
            justify-content: flex-end;
        }

        .prompt-btn-yes {
            background: var(--fg-1);
            color: var(--bg-1);
            padding: var(--padding-w2);
            font-weight: 600;
            border-radius: calc(var(--radius-large) * 20);
            border: 2px solid transparent;
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
            font-size: 14px;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .prompt-btn-yes:hover {
            background-color: transparent;
            border: 2px solid var(--fg-1);
            color: var(--fg-1);
        }

        .prompt-btn-close {
            background-color: transparent;
            border: 2px solid transparent;
            color: var(--fg-1);
            font-weight: 500;
            padding: var(--padding-w2);
            border-radius: calc(var(--radius-large) * 20);
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
            font-size: 14px;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .prompt-btn-close:hover {
            background-color: var(--bg-3);
            color: var(--fg-1);
        }

        .dialog-message {
            color: var(--fg-1);
            font-size: 15px;
            line-height: 1.5;
            font-weight: 500;
        }

        .dialog-buttons {
            display: flex;
            gap: var(--gap-2);
            align-items: center;
            justify-content: flex-end;
        }

        .btn-primary {
            background: var(--fg-1);
            color: var(--bg-1);
            padding: var(--padding-w2);
            font-weight: 600;
            border-radius: calc(var(--radius-large) * 20);
            border: 2px solid transparent;
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
            font-size: 14px;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .btn-primary:hover {
            background-color: transparent;
            border: 2px solid var(--fg-1);
            color: var(--fg-1);
        }

        .btn-secondary {
            background-color: var(--bg-1);
            border: 2px solid var(--bg-3);
            color: var(--fg-1);
            font-weight: 500;
            padding: var(--padding-w2);
            border-radius: calc(var(--radius-large) * 20);
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
            font-size: 14px;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .btn-secondary:hover {
            background-color: var(--bg-3);
            color: var(--fg-1);
        }
    `;

    static properties = {
        currentStep: { type: Number },
        promptMode: { type: Boolean },
    };

    constructor() {
        super();
        this.currentStep = 0;
        this.promptMode = false;
        this._currentClickHandler = null;
        this._resizeHandler = null;
        this.steps = [
            {
                message: 'hello! welcome to wisk',
                clickable: false,
            },
            {
                message: 'checkout the plugins',
                hook: '[title="Plugin Manager"]',
                dir: 'down',
                clickable: true,
            },
            {
                message: 'close the plugins',
                hook: 'img[onboarding-plugins-close]',
                dir: 'down',
                clickable: true,
            },
            {
                message: 'try out themes from here',
                hook: '[title="Options"]',
                dir: 'down',
                clickable: true,
            },
            {
                message: 'click on themes',
                hook: 'div[onboarding-theme-menu]',
                dir: 'right',
                clickable: true,
            },
            {
                message: 'close the themes',
                hook: 'img[onboarding-themes-close]',
                dir: 'down',
                clickable: true,
            },
            {
                message: 'try out templates from here',
                hook: 'button:has(img[src="/a7/forget/gs-templates.svg"])',
                dir: 'up',
                clickable: true,
            },
            {
                message: 'close the templates',
                hook: 'img[onboarding-templates-close]',
                dir: 'down',
                clickable: true,
            },
            {
                message: 'great! now you try it out',
                hook: null,
                dir: null,
                clickable: false,
            },
        ];
    }

    firstUpdated() {
        this.updatePosition();
    }

    updated(changedProperties) {
        if (changedProperties.has('currentStep')) {
            this.updatePosition();
        }
    }

    // Helper function to search in shadowRoots
    deepQuerySelector(selector) {
        // First try regular document query
        let element = document.querySelector(selector);
        if (element) return element;

        // Search in all shadow roots
        const searchShadowRoots = root => {
            const allElements = root.querySelectorAll('*');
            for (const el of allElements) {
                if (el.shadowRoot) {
                    const found = el.shadowRoot.querySelector(selector);
                    if (found) return found;

                    // Recursively search nested shadow roots
                    const deepFound = searchShadowRoots(el.shadowRoot);
                    if (deepFound) return deepFound;
                }
            }
            return null;
        };

        return searchShadowRoots(document);
    }

    updatePosition() {
        const step = this.steps[this.currentStep];
        const dialog = this.shadowRoot.querySelector('.dialog-content');
        const overlay = this.shadowRoot.querySelector('.dialog-overlay');
        const spotlight = this.shadowRoot.querySelector('.spotlight');

        if (!dialog) return;

        if (step.hook && step.dir) {
            const targetElement = this.deepQuerySelector(step.hook);
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                dialog.classList.add('positioned');

                // Create clip-path to cut a hole in the overlay only if clickable
                if (overlay) {
                    if (step.clickable) {
                        const spotlightTop = rect.top;
                        const spotlightLeft = rect.left;
                        const spotlightWidth = rect.width;
                        const spotlightHeight = rect.height;

                        // Use CSS clip-path to create a hole
                        overlay.style.background = `var(--bg-3)`;
                        overlay.style.clipPath = `polygon(
                            0% 0%,
                            0% 100%,
                            ${spotlightLeft}px 100%,
                            ${spotlightLeft}px ${spotlightTop}px,
                            ${spotlightLeft + spotlightWidth}px ${spotlightTop}px,
                            ${spotlightLeft + spotlightWidth}px ${spotlightTop + spotlightHeight}px,
                            ${spotlightLeft}px ${spotlightTop + spotlightHeight}px,
                            ${spotlightLeft}px 100%,
                            100% 100%,
                            100% 0%
                        )`;
                    } else {
                        // No hole in overlay if not clickable
                        overlay.style.background = `var(--bg-3)`;
                        overlay.style.clipPath = '';
                    }
                }

                // Draw spotlight border (just visual, no interaction blocking)
                if (spotlight) {
                    const padding = 8;
                    spotlight.style.top = `${rect.top - padding}px`;
                    spotlight.style.left = `${rect.left - padding}px`;
                    spotlight.style.width = `${rect.width + padding * 2}px`;
                    spotlight.style.height = `${rect.height + padding * 2}px`;
                    spotlight.style.border = `3px solid var(--fg-accent)`;
                    spotlight.style.borderRadius = `var(--radius)`;
                    spotlight.style.display = 'block';
                }

                // Only add click listener if step is clickable
                if (step.clickable) {
                    const clickHandler = () => {
                        targetElement.removeEventListener('click', clickHandler);
                        this.nextStep(true); // Pass flag to indicate user clicked
                    };
                    targetElement.addEventListener('click', clickHandler);

                    // Store handler for cleanup
                    if (this._currentClickHandler) {
                        const prevStep = this.steps[this.currentStep - 1];
                        if (prevStep?.hook) {
                            const prevElement = this.deepQuerySelector(prevStep.hook);
                            if (prevElement) {
                                prevElement.removeEventListener('click', this._currentClickHandler);
                            }
                        }
                    }
                    this._currentClickHandler = clickHandler;
                } else {
                    // Clean up any previous click handler
                    if (this._currentClickHandler) {
                        const prevStep = this.steps[this.currentStep - 1];
                        if (prevStep?.hook) {
                            const prevElement = this.deepQuerySelector(prevStep.hook);
                            if (prevElement) {
                                prevElement.removeEventListener('click', this._currentClickHandler);
                            }
                        }
                        this._currentClickHandler = null;
                    }
                }

                // Wait for dialog to render to get accurate dimensions
                setTimeout(() => {
                    const dialogRect = dialog.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    let top = 0;
                    let left = 0;
                    let direction = step.dir;

                    // Auto-determine best position if left/right
                    if (direction === 'left' || direction === 'right') {
                        const spaceRight = viewportWidth - rect.right;
                        const spaceLeft = rect.left;

                        // Choose right if there's more space on the right, otherwise left
                        direction = spaceRight >= spaceLeft ? 'right' : 'left';
                    }

                    switch (direction) {
                        case 'down':
                            top = rect.bottom + 10;
                            left = rect.left + rect.width / 2 - dialogRect.width / 2;

                            // Check if dialog clips right edge
                            if (left + dialogRect.width > viewportWidth) {
                                left = viewportWidth - dialogRect.width - 10;
                            }
                            // Check if dialog clips left edge
                            if (left < 10) {
                                left = 10;
                            }
                            // Check if dialog clips bottom edge
                            if (top + dialogRect.height > viewportHeight) {
                                top = viewportHeight - dialogRect.height - 10;
                            }
                            break;

                        case 'up':
                            top = rect.top - dialogRect.height - 10;
                            left = rect.left + rect.width / 2 - dialogRect.width / 2;

                            // Check if dialog clips right edge
                            if (left + dialogRect.width > viewportWidth) {
                                left = viewportWidth - dialogRect.width - 10;
                            }
                            // Check if dialog clips left edge
                            if (left < 10) {
                                left = 10;
                            }
                            // Check if dialog clips top edge
                            if (top < 10) {
                                top = 10;
                            }
                            break;

                        case 'left':
                            top = rect.top + rect.height / 2 - dialogRect.height / 2;
                            left = rect.left - dialogRect.width - 10;

                            // Check if dialog clips left edge
                            if (left < 10) {
                                left = 10;
                            }
                            // Check if dialog clips top edge
                            if (top < 10) {
                                top = 10;
                            }
                            // Check if dialog clips bottom edge
                            if (top + dialogRect.height > viewportHeight) {
                                top = viewportHeight - dialogRect.height - 10;
                            }
                            break;

                        case 'right':
                            top = rect.top + rect.height / 2 - dialogRect.height / 2;
                            left = rect.right + 10;

                            // Check if dialog clips right edge
                            if (left + dialogRect.width > viewportWidth) {
                                left = viewportWidth - dialogRect.width - 10;
                            }
                            // Check if dialog clips top edge
                            if (top < 10) {
                                top = 10;
                            }
                            // Check if dialog clips bottom edge
                            if (top + dialogRect.height > viewportHeight) {
                                top = viewportHeight - dialogRect.height - 10;
                            }
                            break;

                        default:
                            dialog.classList.remove('positioned');
                            dialog.style.top = '';
                            dialog.style.left = '';
                            return;
                    }

                    dialog.style.top = `${top}px`;
                    dialog.style.left = `${left}px`;
                }, 0);
            } else {
                console.warn(`Onboarding: Target element not found for selector: ${step.hook}`);
                dialog.classList.remove('positioned');
                dialog.style.top = '';
                dialog.style.left = '';
                if (overlay) {
                    overlay.style.clipPath = '';
                }
                if (spotlight) {
                    spotlight.style.display = 'none';
                }
            }
        } else {
            dialog.classList.remove('positioned');
            dialog.style.top = '';
            dialog.style.left = '';
            if (overlay) {
                overlay.style.clipPath = '';
            }
            if (spotlight) {
                spotlight.style.display = 'none';
            }
        }
    }

    show(letOnce = false) {
        if (window.innerWidth < 770) {
            return;
        }

        if (letOnce) {
            this.currentStep = 0;
            this.promptMode = false;
            this.classList.add('visible');
            this.requestUpdate();
            return;
        }

        let visitCount = parseInt(localStorage.getItem('wisk_onboarding_visits') || '0');

        if (visitCount < 2) {
            this.promptMode = true;
            this.classList.add('visible');
            this.requestUpdate();
        }
    }

    closePrompt() {
        let visitCount = parseInt(localStorage.getItem('wisk_onboarding_visits') || '0');
        localStorage.setItem('wisk_onboarding_visits', (visitCount + 1).toString());
        this.hide();
    }

    startOnboarding() {
        let visitCount = parseInt(localStorage.getItem('wisk_onboarding_visits') || '0');
        localStorage.setItem('wisk_onboarding_visits', (visitCount + 1).toString());

        this.promptMode = false;
        this.currentStep = 0;
        this.requestUpdate();

        this._resizeHandler = () => {
            this.updatePosition();
        };
        window.addEventListener('resize', this._resizeHandler);

        requestAnimationFrame(() => {
            this.updatePosition();
        });
    }

    hide() {
        // Clean up click handler
        if (this._currentClickHandler) {
            const step = this.steps[this.currentStep];
            if (step.hook) {
                const targetElement = this.deepQuerySelector(step.hook);
                if (targetElement) {
                    targetElement.removeEventListener('click', this._currentClickHandler);
                }
            }
            this._currentClickHandler = null;
        }

        // Clean up resize listener
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
            this._resizeHandler = null;
        }

        this.classList.remove('visible');
        this.promptMode = false;
        this.requestUpdate();
    }

    nextStep(userClicked = false) {
        // If current step is clickable and user pressed Next button (not clicked element)
        const currentStep = this.steps[this.currentStep];
        if (!userClicked && currentStep.clickable && currentStep.hook) {
            const targetElement = this.deepQuerySelector(currentStep.hook);
            if (targetElement) {
                // Remove the click handler temporarily to avoid loop
                if (this._currentClickHandler) {
                    targetElement.removeEventListener('click', this._currentClickHandler);
                }
                targetElement.click();
            }
        }

        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.requestUpdate();

            // Wait 100ms for UI to update before repositioning
            setTimeout(() => {
                this.updatePosition();
            }, 100);
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.requestUpdate();
            requestAnimationFrame(() => {
                this.updatePosition();
            });
        }
    }

    done() {
        this.hide();
    }

    handleOverlayClick(e) {
        // Don't close on overlay click
        e.stopPropagation();
        return;
    }

    render() {
        if (this.promptMode) {
            return html`
                <div class="prompt-dialog">
                    <span>wanna see onboarding tour?</span>
                    <div class="prompt-buttons">
                        <button class="prompt-btn-close" @click="${this.closePrompt}">no</button>
                        <button class="prompt-btn-yes" @click="${this.startOnboarding}">yes</button>
                    </div>
                </div>
            `;
        }

        const step = this.steps[this.currentStep];
        const isLastStep = this.currentStep === this.steps.length - 1;

        return html`
            <div class="dialog-overlay" @click="${this.handleOverlayClick}"></div>
            <div class="spotlight" style="display: none;"></div>
            <div class="dialog-content">
                <div class="dialog-message">${step.message}</div>
                ${!step.clickable
                    ? html`
                          <div class="dialog-buttons">
                              ${isLastStep
                                  ? html`<button class="btn-primary" @click="${this.done}">Done</button>`
                                  : html`<button class="btn-primary" @click="${this.nextStep}">Next</button>`}
                          </div>
                      `
                    : ''}
            </div>
        `;
    }
}

customElements.define('onboarding-guide', OnboardingGuide);
