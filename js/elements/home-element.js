import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class HomeElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            color: var(--fg-1);
            transition: all 0.3s;
            user-select: none;
            outline: none;
        }

        .container {
            padding: var(--padding-4);
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: var(--gap-4);
        }

        .section {
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            padding: calc(2 * var(--padding-4)) 0;
        }

        .section-title {
            font-size: 1.5rem;
            color: var(--fg-1);
        }

        .search-div {
            padding: var(--padding-3);
            border-radius: calc(var(--radius-large) * 10);
            border: 2px solid transparent;
            background-color: var(--bg-3);
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            max-width: 400px;
        }

        .search-input {
            width: 100%;
            color: var(--fg-1);
            font-size: 14px;
            outline: none;
            border: none;
            background-color: transparent;
        }

        .search-div:has(.search-input:focus-within) {
            border: 2px solid var(--fg-accent);
            background-color: var(--bg-1);
            color: var(--fg-accent);
        }

        .search-div img {
            filter: var(--themed-svg);
        }

        .search-div:has(.search-input:focus-within) img {
        }

        .files-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: var(--gap-3);
        }

        .templates-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: var(--gap-3);
        }

        .template-card {
            padding: 0;
            border-radius: var(--radius-large);
            overflow: hidden;
            background: var(--bg-2);
            cursor: pointer;
        }

        .template-card:hover {
            background: var(--bg-3);
        }

        .preview-container {
            position: relative;
            overflow: clip;
            height: 120px;
        }

        .desktop-preview {
            width: 300px;
            height: 150px;
            position: absolute;
            top: 0;
            right: -36px;
            object-fit: cover;
            border-radius: var(--radius);
            background-size: cover;
            border: 1px solid var(--bg-3);
        }

        .template-info h3 {
            color: var(--fg-1);
            margin-bottom: var(--gap-1);
            margin-top: var(--gap-3);
            margin-left: var(--gap-3);
        }

        .template-by {
            color: var(--fg-2);
            font-size: 12px;
            margin-left: var(--gap-3);
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
        .show-more {
            width: fit-content;
            margin-left: auto;
            background: var(--bg-accent);
            color: var(--fg-accent);
            border: none;
            padding: var(--padding-w2);
            border-radius: var(--radius);
            cursor: pointer;
        }

        .file-card {
            padding: var(--padding-4);
            border-radius: var(--radius-large);
            background: var(--bg-2);
            cursor: pointer;
            border: none;
            display: flex;
            gap: var(--gap-2);
            overflow: hidden;
            text-decoration: none;
            position: relative;
        }

        .file-content {
            display: flex;
            align-items: flex-start;
            gap: var(--gap-2);
            flex-grow: 1;
            flex-direction: column;
        }

        .more-options {
            opacity: 0;
            position: absolute;
            right: 5px;
            top: 5px;
            width: 30px;
            height: 30px;
            padding: var(--padding-2);
            border-radius: 100px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .file-card:hover .more-options {
            opacity: 1;
        }

        .file-card:hover {
            background: var(--bg-accent);
        }

        .file-card:hover .file-content {
            color: var(--fg-accent);
        }

        .more-options:hover {
            background: var(--bg-3);
        }

        .file-card img {
            filter: var(--themed-svg);
        }

        .file-card:hover img {
            filter: var(--accent-svg);
        }

        .emoji-display {
            font-size: 18px;
            line-height: 1;
            margin-right: var(--gap-1);
        }

        @media (max-width: 768px) {
            .mobhide {
                display: none;
            }
        }
        .this-greet {
            background-image: linear-gradient(to right, var(--fg-red), var(--fg-accent));
            color: transparent;
            background-clip: text;
            font-weight: 500;
        }

        ::placeholder {
            color: var(--fg-2);
        }

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
        .xml {
            stroke: var(--fg-1);
            fill: var(--bg-2);
        }
        .xml:hover {
            stroke: var(--fg-accent);
            fill: var(--bg-accent);
        }
        .your-files-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--gap-3);
            flex-wrap: wrap;
        }
    `;

    static properties = {
        files: { type: Array },
        filteredFiles: { type: Array },
        templates: { type: Array },
        expandTemplates: { type: Boolean },
        message: { type: String },
    };

    constructor() {
        super();
        this.files = [];
        this.filteredFiles = [];
        this.templates = [];
        this.fetchTemplates();
        this.greet = this.getGreeting();
        this.expandTemplates = false;
        this.message = 'Loading...';
    }

    firstUpdated() {
        // Fetch files when the component is first updated
        this.fetchFiles();

        // why? because it's fun
        const greeting = this.shadowRoot.querySelector('.this-greet');
        if (!greeting) return;
        let isActive = false;
        let timeoutId = null;

        const starContainer = document.createElement('div');
        starContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(starContainer);

        const interpolateColor = (x, elementWidth) => {
            const computedStyle = getComputedStyle(greeting);
            const redColor = computedStyle.getPropertyValue('--fg-red').trim();
            const accentColor = computedStyle.getPropertyValue('--fg-accent').trim();

            const getRGB = color => {
                if (color.startsWith('#')) {
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    return [r, g, b];
                }
                const match = color.match(/\d+/g);
                return match ? [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])] : [255, 0, 0];
            };

            const startColor = getRGB(redColor);
            const endColor = getRGB(accentColor);

            const ratio = Math.max(0, Math.min(1, x / elementWidth));

            const interpolatedColor = startColor.map((start, i) => {
                const end = endColor[i];
                const value = Math.round(start + (end - start) * ratio);
                return value;
            });

            return `rgb(${interpolatedColor.join(',')})`;
        };

        const createStar = (mouseX, mouseY) => {
            const greetingRect = greeting.getBoundingClientRect();
            const greetingX = Math.min(Math.max(mouseX, greetingRect.left), greetingRect.right) - greetingRect.left;
            const sparkleColor = interpolateColor(greetingX, greetingRect.width);

            const star = document.createElement('div');
            const randomRotation = Math.random() * 360;
            const randomSize = Math.random() * (27 - 16) + 16;

            star.innerHTML = `
                <svg width="${randomSize}" height="${randomSize}" viewBox="0 0 24 24" fill="${sparkleColor}">
                    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"/>
                </svg>
            `;

            const offsetX = Math.random() * 30 - 15;
            const offsetY = Math.random() * 30 - 15;

            star.style.cssText = `
                position: absolute;
                left: ${mouseX + offsetX - randomSize / 2}px;
                top: ${mouseY + offsetY - randomSize / 2}px;
                pointer-events: none;
                transform: rotate(${randomRotation}deg);
                will-change: transform, opacity;
            `;

            starContainer.appendChild(star);

            const animation = star.animate(
                [
                    {
                        transform: `rotate(${randomRotation}deg) scale(0)`,
                        opacity: 0,
                    },
                    {
                        transform: `rotate(${randomRotation + 45}deg) scale(1)`,
                        opacity: 1,
                        offset: 0.2,
                    },
                    {
                        transform: `rotate(${randomRotation + 90}deg) scale(1)`,
                        opacity: 1,
                        offset: 0.8,
                    },
                    {
                        transform: `rotate(${randomRotation + 180}deg) scale(0)`,
                        opacity: 0,
                    },
                ],
                {
                    duration: 2000,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                }
            );

            animation.onfinish = () => star.remove();
        };

        let lastSparkleTime = 0;
        const minTimeBetweenSparkles = 100; // Minimum time between sparkles in milliseconds

        const startStarAnimation = () => {
            if (isActive) return;
            isActive = true;

            const handleMouseMove = e => {
                const currentTime = Date.now();
                if (currentTime - lastSparkleTime >= minTimeBetweenSparkles) {
                    createStar(e.clientX, e.clientY);
                    lastSparkleTime = currentTime;
                }
            };

            document.addEventListener('mousemove', handleMouseMove);

            timeoutId = setTimeout(() => {
                document.removeEventListener('mousemove', handleMouseMove);
                isActive = false;
            }, 10000);
        };

        this.cleanup = () => {
            if (starContainer && starContainer.parentNode) {
                starContainer.parentNode.removeChild(starContainer);
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };

        greeting.addEventListener('mouseenter', startStarAnimation);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.cleanup) {
            this.cleanup();
        }
    }

    async fetchFiles() {
        try {
            // Get all keys from wisk.db
            const keys = await wisk.db.getAllKeys();
            console.log('Fetched keys:', keys);

            this.files = [];
            // Iterate through keys and get each item
            for (let i = 0; i < keys.length; i++) {
                const item = await wisk.db.getItem(keys[i]);
                console.log('Fetched item:', item);

                // Get emoji from first element if available (similar to left-menu)
                let emoji = null;
                if (item.data.elements && item.data.elements.length > 0 && item.data.elements[0].value && item.data.elements[0].value.emoji) {
                    emoji = item.data.elements[0].value.emoji;
                }

                // Push the item to files array with emoji info
                this.files.push({
                    id: item.id,
                    name: item.data.config.name,
                    emoji: emoji,
                });
            }

            this.filteredFiles = [...this.files];
            this.message = this.files.length === 0 ? 'No files found' : '';
            this.requestUpdate();
        } catch (error) {
            console.error('Error fetching documents:', error);
            this.message = 'Error loading files';
            this.requestUpdate();
        }
    }

    async removeFile(id, event) {
        event.preventDefault();
        event.stopPropagation();

        const result = confirm('Are you sure you want to delete this page?');
        if (!result) {
            return;
        }

        try {
            // Use wisk.db to remove the item
            await wisk.db.removeItem(id);

            // Update the UI state
            this.files = this.files.filter(item => item.id !== id);
            this.filteredFiles = this.filteredFiles.filter(item => item.id !== id);
            this.requestUpdate();

            // If the deleted file is the current one, redirect to home
            if (id === wisk?.editor?.pageId) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    }

    isEmoji(str) {
        // Regular expression to match emoji at the start of string
        const emojiRegex = /^[\p{Emoji}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/u;
        return emojiRegex.test(str);
    }

    getFileDisplayInfo(fileName) {
        if (this.isEmoji(fileName)) {
            // Extract the first character (emoji) and the rest of the title
            const emoji = fileName.match(/^./u)[0];
            const titleWithoutEmoji = fileName.slice(emoji.length).trim();
            return {
                hasEmoji: true,
                emoji: emoji,
                displayName: titleWithoutEmoji,
            };
        }
        return {
            hasEmoji: false,
            emoji: null,
            displayName: fileName,
        };
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

    filterFiles(e) {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm === '') {
            this.filteredFiles = [...this.files];
        } else {
            this.filteredFiles = this.files.filter(file => file.name.toLowerCase().includes(searchTerm));
        }
    }

    useTemplate(template) {
        window.location.href = `/?template=${template.path}`;
    }

    getGreeting() {
        const hour = new Date().getHours();

        const timeBasedGreetings = {
            morning: [
                'Good morning!',
                'Rise and shine!',
                'Good morning, ready to create?',
                'Fresh morning, fresh ideas!',
                'Morning! Your documents await!',
                'Start your day with great writing!',
                'Morning inspiration ahead!',
                'Ready to be productive?',
                'Your morning workflow starts here!',
                'Fresh ideas coming your way!',
                'Morning! Time to bring ideas to life!',
                'Start writing something amazing!',
            ],
            afternoon: [
                'Good afternoon!',
                'Back to your documents?',
                'Ready for afternoon productivity?',
                'Keep the creativity flowing!',
                'Afternoon focus time!',
                'Ready to continue your work?',
                'Making progress this afternoon?',
                'Your afternoon workspace is ready!',
                'Keep that momentum going!',
                'Time to refine your work!',
                'Productive afternoon ahead!',
                'Your documents are waiting!',
            ],
            evening: [
                'Good evening!',
                'Evening writing session?',
                'Wrapping up your work?',
                'Evening edits await!',
                'Time for final touches?',
                'Evening productivity session?',
                'Ready for some evening work?',
                'Perfect time to refine your documents!',
                'Evening inspiration strikes!',
                'Capture your evening thoughts!',
                'Evening focus time!',
                'One last creative push!',
            ],
            night: [
                'Working late?',
                'Late night editing session?',
                'Capturing night-time inspiration?',
                'Night owl productivity!',
                'Your workspace never sleeps!',
                'Late night creativity welcome!',
                'Quiet hours, focused work!',
                'Perfect time for focused writing!',
                'Night time editing session?',
                'Burning the midnight oil?',
                'Creative night ahead!',
                'Your late-night workspace is ready!',
            ],
        };

        const generalGreetings = [
            'Welcome back to your workspace!',
            'Ready to create something great?',
            'Your documents are waiting!',
            'Time to bring ideas to life!',
            'Welcome to your creative space!',
            'Ready to be productive?',
            'Your workspace is ready!',
            "Let's create something amazing!",
            'Ready when you are!',
            'Your ideas start here!',
            'Time to get creative!',
            'Welcome to your productivity zone!',
            'Ready to make progress?',
            'Your creative journey continues here!',
            'Pick up where you left off!',
            'Your canvas awaits!',
            'Ideas into documents!',
            'Ready to write?',
            'Your thoughts, documented.',
            'Create something meaningful!',
        ];

        if (Math.random() < 0.5) {
            if (hour >= 5 && hour < 12) {
                return timeBasedGreetings.morning[Math.floor(Math.random() * timeBasedGreetings.morning.length)];
            } else if (hour >= 12 && hour < 17) {
                return timeBasedGreetings.afternoon[Math.floor(Math.random() * timeBasedGreetings.afternoon.length)];
            } else if (hour >= 17 && hour < 21) {
                return timeBasedGreetings.evening[Math.floor(Math.random() * timeBasedGreetings.evening.length)];
            } else {
                return timeBasedGreetings.night[Math.floor(Math.random() * timeBasedGreetings.night.length)];
            }
        } else {
            return generalGreetings[Math.floor(Math.random() * generalGreetings.length)];
        }
    }

    render() {
        return html`
            <div class="container">
                <div class="section" style="margin-top: 60px; align-items: center;">
                    <h1 class="this-greet">${this.greet}</h1>
                </div>

                <div class="section">
                    <h2 class="section-title">Create New</h2>
                    <div class="templates-grid">
                        <div class="template-card" @click=${() => (window.location.href = '/')}>
                            <div
                                style="height: 100%; display: flex; justify-content: center; align-items: center; flex-direction: column; gap: 12px; min-height: 120px"
                            >
                                <h2>Blank</h2>
                                <span class="">Start from scratch</span>
                            </div>
                        </div>

                        ${this.templates.length > 0
                            ? html`
                                  <div class="template-card mobhide" @click=${() => this.useTemplate(this.templates[0])}>
                                      <div class="template-info">
                                          <h3>${this.templates[0].name}</h3>
                                          <span class="template-by">By ${this.templates[0].by}</span>
                                      </div>

                                      <div class="preview-container">
                                          <div
                                              class="desktop-preview"
                                              style="background-image: url(/a7/templates/${this.templates[0].path}/preview/desktop.png)"
                                              alt="${this.templates[0].name} preview"
                                          ></div>
                                      </div>
                                  </div>
                              `
                            : ''}
                        ${this.templates.length > 1
                            ? html`
                                  <div class="template-card mobhide" @click=${() => this.useTemplate(this.templates[1])}>
                                      <div class="template-info">
                                          <h3>${this.templates[1].name}</h3>
                                          <span class="template-by">By ${this.templates[1].by}</span>
                                      </div>

                                      <div class="preview-container">
                                          <div
                                              class="desktop-preview"
                                              style="background-image: url(/a7/templates/${this.templates[1].path}/preview/desktop.png)"
                                              alt="${this.templates[1].name} preview"
                                          ></div>
                                      </div>
                                  </div>
                              `
                            : ''}
                    </div>

                    <button class="btn show-more" @click=${() => (this.expandTemplates = !this.expandTemplates)}>
                        ${this.expandTemplates ? 'Hide' : 'Show'} more templates
                    </button>

                    <div class="templates-grid" style="display: ${this.expandTemplates ? 'grid' : 'none'}">
                        ${this.expandTemplates
                            ? html`
                                  ${this.templates.map(
                                      template => html`
                                          <div class="template-card" @click=${() => this.useTemplate(template)}>
                                              <div class="template-info">
                                                  <h3>${template.name}</h3>
                                                  <span class="template-by">By ${template.by}</span>
                                              </div>

                                              <div class="preview-container">
                                                  <div
                                                      class="desktop-preview"
                                                      style="background-image: url(/a7/templates/${template.path}/preview/desktop.png)"
                                                      alt="${template.name} preview"
                                                  ></div>
                                              </div>
                                          </div>
                                      `
                                  )}
                              `
                            : ''}
                    </div>
                </div>

                <div class="section" style="gap: calc(2*var(--gap-3)); min-height: 100svh">
                    <div class="your-files-header">
                        <h2 class="section-title">Your Files</h2>
                        <div class="search-div">
                            <img src="/a7/forget/search.svg" alt="Search" style="width: 20px" />
                            <input type="text" class="search-input" placeholder="Search files..." @input=${this.filterFiles} />
                        </div>
                    </div>
                    <div class="files-grid">
                        ${this.filteredFiles.length === 0 ? html` <p>${this.message}</p> ` : ''}
                        ${this.filteredFiles.map(file => {
                            const fileInfo = this.getFileDisplayInfo(file.name);
                            return html`
                                <a href="/?id=${file.id}" class="file-card">
                                    <div class="file-content" style="">
                                        ${file.emoji
                                            ? html`<span class="emoji-display">${file.emoji}</span>`
                                            : fileInfo.hasEmoji
                                              ? html`<span class="emoji-display">${fileInfo.emoji}</span>`
                                              : html`<img src="/a7/forget/page-1.svg" alt="File" style="width: 18px" />`}
                                        <span>${fileInfo.hasEmoji ? fileInfo.displayName : file.name}</span>
                                    </div>
                                    <div class="more-options" @click=${e => this.removeFile(file.id, e)}>
                                        <img src="/a7/forget/trash.svg" alt="More options" style="width: 18px" />
                                    </div>
                                </a>
                            `;
                        })}
                    </div>
                </div>

                <br />
                <br />
                <br />
                <br />

                <div class="section">
                    <?xml version="1.0" encoding="UTF-8"?><svg
                        width="64px"
                        height="64px"
                        stroke-width="1.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        color="#000000"
                    >
                        <path
                            d="M22 8.86222C22 10.4087 21.4062 11.8941 20.3458 12.9929C17.9049 15.523 15.5374 18.1613 13.0053 20.5997C12.4249 21.1505 11.5042 21.1304 10.9488 20.5547L3.65376 12.9929C1.44875 10.7072 1.44875 7.01723 3.65376 4.73157C5.88044 2.42345 9.50794 2.42345 11.7346 4.73157L11.9998 5.00642L12.2648 4.73173C13.3324 3.6245 14.7864 3 16.3053 3C17.8242 3 19.2781 3.62444 20.3458 4.73157C21.4063 5.83045 22 7.31577 22 8.86222Z"
                            class="xml"
                            stroke-width="1.5"
                            stroke-linejoin="round"
                        ></path>
                    </svg>
                    <h2 class="section-title">Thanks for using Wisk!</h2>
                </div>

                <br />
                <br />
                <br />
                <br />
            </div>
        `;
    }
}

customElements.define('home-element', HomeElement);
