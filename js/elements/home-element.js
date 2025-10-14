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
            font-weight: 500;
        }

        @media (max-width: 768px) {
            .section-title {
                font-size: 1.2rem;
            }
        }

        .search-div {
            padding: var(--padding-3);
            border-radius: calc(var(--radius-large) * 10);
            border: 2px solid transparent;
            background-color: var(--bg-3);
            display: flex;
            align-items: center;
            gap: 0;
            width: fit-content;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
        }

        .search-div.expanded {
            gap: var(--gap-2);
        }

        .search-input {
            color: var(--fg-1);
            font-size: 14px;
            outline: none;
            border: none;
            background-color: transparent;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            width: 0;
            opacity: 0;
            pointer-events: none;
        }

        .search-input.expanded {
            width: 200px;
            opacity: 1;
            pointer-events: auto;
        }

        .search-div:has(.search-input:focus-within) {
            border: 2px solid var(--fg-accent);
            background-color: var(--bg-1);
            color: var(--fg-accent);
        }

        .search-div img {
            filter: var(--themed-svg);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            flex-shrink: 0;
        }

        .search-div:has(.search-input:focus-within) img {
        }

        .files-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
        }

        @media (max-width: 768px) {
            .files-grid {
                gap: 1px;
                grid-template-columns: 1fr;
            }
        }

        .templates-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
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

        .template-card:hover .desktop-preview {
            width: 300px;
            height: 120px;
            top: 20px;
            right: -56px;
            rotate: 3deg;
        }

        .preview-container {
            position: relative;
            overflow: clip;
            height: 120px;
        }

        .desktop-preview {
            width: 260px;
            height: 120px;
            position: absolute;
            top: 20px;
            right: -16px;
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

        @media (max-width: 768px) {
            .file-card {
                border-radius: 0;
            }
            .file-card:first-child {
                border-radius: var(--radius-large) var(--radius-large) 0 0;
            }
            .file-card:last-child {
                border-radius: 0 0 var(--radius-large) var(--radius-large);
            }
        }

        .file-content {
            display: flex;
            align-items: flex-start;
            gap: var(--gap-2);
            flex-grow: 1;
            flex-direction: column;
        }

        img[src='/a7/forget/page-1.svg'] {
            width: 18px;
        }

        @media (max-width: 768px) {
            .file-content {
                flex-direction: row;
                align-items: center;
            }
            img[src='/a7/forget/page-1.svg'],
            emoji-display {
                width: 25px;
                flex-shrink: 0;
                margin: 0;
            }
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

        .tree-actions {
            display: flex;
            gap: var(--gap-1);
            opacity: 0;
            transition: opacity 0.2s;
        }

        .tree-item:hover .tree-actions {
            opacity: 1;
        }

        .tree-delete {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            cursor: pointer;
            width: 20px;
            height: 20px;
            padding: var(--padding-1);
            transition: all 0.2s;
        }

        .tree-delete:hover {
            background-color: var(--bg-2);
        }

        .tree-delete:active {
            background-color: var(--bg-3);
        }

        .tree-delete img {
            width: 16px;
            height: 16px;
            filter: var(--themed-svg);
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

        @media (max-width: 768px) {
            .this-greet {
                font-size: 22px;
                text-align: left;
                width: 100%;
            }
            .section-greet {
                display: none;
            }
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

        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
            padding: 60px 20px;
            opacity: 0.6;
        }

        .empty-state img {
            filter: var(--themed-svg);
            width: 80px;
        }

        .empty-state p {
            color: var(--fg-1);
            text-align: center;
            margin: 0;
        }

        .new-page-only {
            border-radius: var(--radius-large);
        }

        @media (max-width: 768px) {
            .new-page-only {
                border-radius: var(--radius-large) !important;
            }
        }

        .view-toggle {
            display: flex;
            position: relative;
            padding: 2px;
        }

        .view-toggle-slider {
            position: absolute;
            top: 2px;
            left: 2px;
            width: calc(50% - 2px);
            height: calc(100% - 4px);
            background-color: var(--bg-3);
            border-radius: var(--radius);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1;
        }

        .view-toggle-slider.tree {
            transform: translateX(100%);
        }

        .view-toggle-btn {
            padding: var(--padding-w1);
            border: none;
            background-color: transparent;
            color: var(--fg-2);
            border-radius: var(--radius);
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 2;
            opacity: 0.4;
        }

        .view-toggle-btn.active {
            color: var(--fg-1);
            opacity: 1;
        }

        .view-toggle-btn:hover:not(.active) {
            color: var(--fg-1);
        }

        .view-toggle-btn img {
            width: 16px;
            height: 16px;
            filter: var(--themed-svg);
        }

        .tree-view {
            display: flex;
            flex-direction: column;
        }

        .tree-item {
            display: flex;
            align-items: center;
            padding: var(--padding-w1);
            gap: var(--gap-2);
            border-radius: var(--radius);
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            color: var(--fg-1);
            position: relative;
        }

        .tree-item:hover {
            background-color: var(--bg-accent);
            color: var(--fg-accent);
        }

        .tree-item.child {
            margin-left: 24px;
        }

        .tree-icon {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.2s ease;
            position: relative;
        }

        .tree-icon:hover {
            background-color: var(--bg-2);
        }

        .tree-icon img {
            width: 16px;
            height: 16px;
            filter: var(--themed-svg);
            transition: opacity 0.2s ease;
        }

        .tree-icon .emoji {
            font-size: 16px;
        }

        .tree-icon .arrow {
            position: absolute;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .tree-item:hover .tree-icon .arrow {
            opacity: 1;
        }

        .tree-item:hover .tree-icon .emoji,
        .tree-item:hover .tree-icon .page-icon {
            opacity: 0;
        }

        .tree-content {
            flex: 1;
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            overflow: hidden;
        }

        .tree-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: 500;
        }

        .add-child {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
            width: 20px;
            height: 20px;
            padding: var(--padding-1);
        }

        .tree-item:hover .add-child {
            opacity: 1;
        }

        .add-child:hover {
            background-color: var(--bg-2);
        }

        .add-child:active {
            background-color: var(--bg-3);
        }

        .add-child img {
            width: 16px;
            height: 16px;
            filter: var(--themed-svg);
        }

        @media (max-width: 900px) {
            .more-options,
            .tree-actions {
                opacity: 1;
            }
        }

        /* Animation classes */
        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .template-card.initial-load {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .template-card.initial-load.animate-in {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        .bottom-link {
            color: var(--fg-2);
            text-decoration: none;
        }

        .bottom-link:hover {
            text-decoration: underline;
        }
    `;

    static properties = {
        files: { type: Array },
        filteredFiles: { type: Array },
        templates: { type: Array },
        expandTemplates: { type: Boolean },
        message: { type: String },
        searchText: { type: String },
        inputFocused: { type: Boolean },
        viewMode: { type: String },
        hierarchicalFiles: { type: Array },
        expandedFolders: { type: Object },
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
        this.viewMode = 'grid'; // 'grid' or 'tree'
        this.hierarchicalFiles = [];
        this.expandedFolders = {};
    }

    firstUpdated() {
        // Fetch files when the component is first updated
        this.fetchFiles();

        // Start the page load animations
        this.startPageAnimations();

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

    startPageAnimations() {
        // Sequence the animations with delays
        setTimeout(() => {
            // 1. Fade in the greeting section
            const greetSection = this.shadowRoot.querySelector('.section-greet');
            if (greetSection) greetSection.classList.add('visible');
        }, 100);

        setTimeout(() => {
            // 2. Fade in the Create New section
            const createSection = this.shadowRoot.querySelectorAll('.section.fade-in')[1];
            if (createSection) createSection.classList.add('visible');

            // Animate template cards one by one
            this.animateTemplateCards();
        }, 400);

        setTimeout(() => {
            // 3. Fade in the files section
            const filesSection = this.shadowRoot.querySelectorAll('.section.fade-in')[2];
            if (filesSection) filesSection.classList.add('visible');
        }, 800);
    }

    animateTemplateCards() {
        const templateCards = this.shadowRoot.querySelectorAll('.template-card');
        templateCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-in');
            }, index * 150);
        });
    }

    async fetchFiles() {
        try {
            // Get all keys from wisk.db
            const keys = await wisk.db.getAllPages();
            console.log('Fetched keys:', keys);

            this.files = [];
            // Iterate through keys and get each item
            for (let i = 0; i < keys.length; i++) {
                const item = await wisk.db.getPage(keys[i]);
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
            if (this.viewMode === 'tree') {
                this.buildHierarchicalFiles();
            }
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

        const result = confirm('Are you sure you want to delete this page and all its children?');
        if (!result) {
            return;
        }

        try {
            // Find all child pages to delete as well
            const childPages = this.files.filter(item => item.id !== id && item.id.startsWith(id + '.')).map(item => item.id);

            // Delete the main page
            await wisk.db.removePage(id);

            // Delete all child pages
            for (const childId of childPages) {
                await wisk.db.removePage(childId);
            }

            // Update the UI state - remove parent and all children
            this.files = this.files.filter(item => item.id !== id && !item.id.startsWith(id + '.'));
            this.filteredFiles = this.filteredFiles.filter(item => item.id !== id && !item.id.startsWith(id + '.'));

            // Rebuild hierarchical structure if in tree mode
            if (this.viewMode === 'tree') {
                this.buildHierarchicalFiles();
            }

            this.requestUpdate();

            // If the deleted page (or any of its children) is the current one, redirect to home
            if (id === wisk?.editor?.pageId || childPages.includes(wisk?.editor?.pageId)) {
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
        this.searchText = e.target.value;
        const searchTerm = this.searchText.toLowerCase();

        if (searchTerm === '') {
            this.filteredFiles = [...this.files];
        } else {
            this.filteredFiles = this.files.filter(file => file.name.toLowerCase().includes(searchTerm));
        }

        if (this.viewMode === 'tree') {
            this.buildHierarchicalFiles();
        }
    }

    useTemplate(template) {
        window.location.href = `/?id=newpage&template=${template.path}`;
    }

    getGreeting() {
        // Track visits and show welcome message for new users
        let visits = parseInt(localStorage.getItem('visits') || '0');
        visits++;
        localStorage.setItem('visits', visits.toString());

        if (visits <= 2) {
            const firstTimeGreetings = [
                'Welcome to Wisk!',
                'Hello there, welcome to your new workspace!',
                'Welcome stranger, this is Wisk!',
                'First time here? Welcome to Wisk!',
                'Hey there! Welcome to your creative space!',
                'Welcome! Ready to discover Wisk?',
                'New here? Welcome to the magic!',
                'Hello! Wisk is ready for you!',
            ];
            return firstTimeGreetings[Math.floor(Math.random() * firstTimeGreetings.length)];
        }

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
                'Early bird gets the words!',
                'Dawn of a productive day!',
                'Morning coffee and creativity!',
                'A new day, a new page!',
                'Sunrise productivity mode!',
                'Morning motivation activated!',
                'First light, bright ideas!',
                'Wake up and write!',
                'Morning momentum building!',
                'Golden hour of creativity!',
                'Fresh start, fresh perspective!',
                'Soham says good morning!',
                'Ready to seize the day?',
                'Dawn brings new possibilities!',
                'Morning clarity ahead!',
                'Time to make today count!',
                'New day, new opportunities!',
                'Morning energy flowing!',
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
                'Midday motivation boost!',
                'Lunch break over, creativity on!',
                'Afternoon excellence awaits!',
                'Peak performance time!',
                'Second wind incoming!',
                'Afternoon breakthrough ready!',
                'Steady progress continues!',
                'Afternoon focus activated!',
                'Time to dive deep!',
                'Midday masterpiece mode!',
                'Afternoon advantage unlocked!',
                'Power through the afternoon!',
                'Sustained creativity session!',
                'Afternoon inspiration strikes!',
                'Keep the good work going!',
                'Afternoon productivity peak!',
                'Ready for the next chapter?',
                'Afternoon acceleration time!',
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
                'Golden hour productivity!',
                'Evening excellence time!',
                'Sunset session starting!',
                'Perfect time for polishing!',
                'Evening reflection mode!',
                'Twilight creativity flows!',
                'End-of-day refinement!',
                'Evening masterpiece time!',
                'Winding down with words!',
                'Perfect editing atmosphere!',
                'Evening breakthrough incoming!',
                'Calm evening, focused mind!',
                'Time for thoughtful writing!',
                'Evening dedication pays off!',
                'Quiet evening, productive spirit!',
                'Final stretch of the day!',
                'Evening wisdom emerges!',
                'Peaceful productivity time!',
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
                'Midnight motivation strikes!',
                'Night shift excellence!',
                'Stars align for creativity!',
                'Nocturnal genius at work!',
                'Late night brilliance!',
                'Moon-powered productivity!',
                'Quiet night, loud thoughts!',
                'After-hours inspiration!',
                'Night time breakthrough mode!',
                'Darkness brings clarity!',
                'Midnight masterpiece time!',
                'Late night dedication!',
                'Silent hours, profound work!',
                'Night brings deep focus!',
                'Overtime inspiration flowing!',
                'Moonlight manuscripts!',
                'Night vision activated!',
                'Deep night, deeper thoughts!',
            ],
        };

        if (hour >= 5 && hour < 12) {
            return timeBasedGreetings.morning[Math.floor(Math.random() * timeBasedGreetings.morning.length)];
        } else if (hour >= 12 && hour < 17) {
            return timeBasedGreetings.afternoon[Math.floor(Math.random() * timeBasedGreetings.afternoon.length)];
        } else if (hour >= 17 && hour < 21) {
            return timeBasedGreetings.evening[Math.floor(Math.random() * timeBasedGreetings.evening.length)];
        } else {
            return timeBasedGreetings.night[Math.floor(Math.random() * timeBasedGreetings.night.length)];
        }
    }

    async ff() {
        this.inputFocused = true;
        await this.updateComplete;
        const input = this.shadowRoot.querySelector('.search-input');
        const container = this.shadowRoot.querySelector('.search-div');
        input.classList.add('expanded');
        container.classList.add('expanded');
        setTimeout(() => input.focus(), 150);
    }

    async hideSearch() {
        const input = this.shadowRoot.querySelector('.search-input');
        const container = this.shadowRoot.querySelector('.search-div');
        if (this.searchText) return; // Don't hide if there's search text

        input.classList.remove('expanded');
        container.classList.remove('expanded');
        this.inputFocused = false;
    }

    setViewMode(mode) {
        this.viewMode = mode;
        if (mode === 'tree') {
            this.buildHierarchicalFiles();
        }
        this.requestUpdate();
    }

    // Helper methods from left-menu for tree structure
    isChildOf(id, parentId) {
        return id !== parentId && id.startsWith(parentId + '.');
    }

    getParentId(id) {
        const lastDotIndex = id.lastIndexOf('.');
        return lastDotIndex > -1 ? id.substring(0, lastDotIndex) : null;
    }

    getNestingLevel(id) {
        return id.split('.').length - 1;
    }

    hasChildren(id) {
        return this.files.some(item => this.isChildOf(item.id, id));
    }

    buildHierarchicalFiles() {
        // Create a map of items by ID for quick access
        const itemsMap = new Map();
        this.filteredFiles.forEach(item => {
            const enhancedItem = {
                ...item,
                children: [],
                level: this.getNestingLevel(item.id),
                parentId: this.getParentId(item.id),
                hasChildren: this.hasChildren(item.id),
            };
            itemsMap.set(item.id, enhancedItem);

            // Auto-expand all folders by default
            if (enhancedItem.hasChildren && this.expandedFolders[item.id] === undefined) {
                this.expandedFolders[item.id] = true;
            }
        });

        // Build the tree structure
        const rootItems = [];
        itemsMap.forEach(item => {
            if (item.parentId) {
                const parent = itemsMap.get(item.parentId);
                if (parent) {
                    parent.children.push(item);
                } else {
                    rootItems.push(item);
                }
            } else {
                rootItems.push(item);
            }
        });

        // Flatten the tree for rendering
        const flatList = [];
        const flattenTree = (items, level) => {
            items.forEach(item => {
                flatList.push({ ...item, level });
                if (item.children && item.children.length > 0 && this.expandedFolders[item.id]) {
                    flattenTree(item.children, level + 1);
                }
            });
        };

        flattenTree(rootItems, 0);
        this.hierarchicalFiles = flatList;
    }

    toggleFolder(id, e) {
        e.preventDefault();
        e.stopPropagation();
        this.expandedFolders = {
            ...this.expandedFolders,
            [id]: !this.expandedFolders[id],
        };
        this.buildHierarchicalFiles();
        this.requestUpdate();
    }

    createChildPage(parentId, e) {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        // Navigate to new page with parent_id parameter
        window.location.href = `/?id=newpage&parent_id=${parentId}`;
    }

    render() {
        return html`
            <div class="container">
                <div class="section section-greet fade-in" style="margin-top: 60px; margin-bottom: 60px; align-items: center;">
                    <h1 class="this-greet">${this.greet}</h1>
                </div>

                <div class="section fade-in">
                    <h2 class="section-title">Create New</h2>
                    <div class="templates-grid">
                        <div class="template-card initial-load" @click=${() => (window.location.href = '/?id=newpage')}>
                            <div
                                style="height: 100%; display: flex; justify-content: center; align-items: center; flex-direction: column; gap: 12px; min-height: 120px"
                            >
                                <h2>Blank</h2>
                                <span class="">Start from scratch</span>
                            </div>
                        </div>

                        ${this.templates.slice(0, 3).map(
                            (template, index) => html`
                                <div class="template-card initial-load mobhide" @click=${() => this.useTemplate(template)}>
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

                <div class="section fade-in" style="gap: calc(2*var(--gap-3)); min-height: 100svh">
                    <div class="your-files-header">
                        <div class="search-div" @click=${() => this.ff()}>
                            <img src="/a7/forget/search.svg" alt="Search" style="width: 20px;" draggable="false" />
                            <input
                                type="text"
                                class="search-input ${this.searchText || this.inputFocused ? 'expanded' : ''}"
                                placeholder="Search files..."
                                @input=${this.filterFiles}
                                @focus=${() => (this.inputFocused = true)}
                                @blur=${() => this.hideSearch()}
                                @click=${e => e.stopPropagation()}
                            />
                        </div>
                        <div class="view-toggle">
                            <div class="view-toggle-slider ${this.viewMode === 'tree' ? 'tree' : ''}"></div>
                            <button class="view-toggle-btn ${this.viewMode === 'grid' ? 'active' : ''}" @click=${() => this.setViewMode('grid')}>
                                <img src="/a7/forget/home-grid.svg" alt="Grid view" draggable="false" />
                            </button>
                            <button class="view-toggle-btn ${this.viewMode === 'tree' ? 'active' : ''}" @click=${() => this.setViewMode('tree')}>
                                <img src="/a7/forget/home-list.svg" alt="Tree view" draggable="false" />
                            </button>
                        </div>
                    </div>
                    ${this.viewMode === 'grid'
                        ? html`
                              <div class="files-grid">
                                  <a href="/?id=newpage" class="file-card ${this.filteredFiles.length === 0 ? 'new-page-only' : ''}">
                                      <div class="file-content" style="width: 100%">
                                          <img src="/a7/forget/plus.svg" alt="File" width="25px" draggable="false" />
                                          <span>New Page</span>
                                      </div>
                                  </a>
                                  ${this.filteredFiles.map(file => {
                                      const fileInfo = this.getFileDisplayInfo(file.name);
                                      return html`
                                          <a href="/?id=${file.id}" class="file-card">
                                              <div class="file-content" style="">
                                                  ${file.emoji
                                                      ? html`<span class="emoji-display">${file.emoji}</span>`
                                                      : fileInfo.hasEmoji
                                                        ? html`<span class="emoji-display">${fileInfo.emoji}</span>`
                                                        : html`<img src="/a7/forget/page-1.svg" alt="File" draggable="false" />`}
                                                  <span>${fileInfo.hasEmoji ? fileInfo.displayName : file.name}</span>
                                              </div>
                                              <div class="more-options" @click=${e => this.removeFile(file.id, e)}>
                                                  <img src="/a7/forget/trash.svg" alt="More options" style="width: 18px" draggable="false" />
                                              </div>
                                          </a>
                                      `;
                                  })}
                              </div>
                          `
                        : html`
                              <div class="tree-view">
                                  <a href="/?id=newpage" class="tree-item" style="margin-bottom: var(--gap-2);">
                                      <div class="tree-icon">
                                          <img src="/a7/forget/plus.svg" alt="New page" draggable="false" />
                                      </div>
                                      <div class="tree-content">
                                          <span class="tree-name">New Page</span>
                                      </div>
                                  </a>
                                  ${this.hierarchicalFiles.map(file => {
                                      const fileInfo = this.getFileDisplayInfo(file.name);
                                      return html`
                                          <div class="tree-item ${file.level > 0 ? 'child' : ''}" style="margin-left: ${file.level * 24}px;">
                                              <div
                                                  class="tree-icon"
                                                  @click=${file.hasChildren
                                                      ? e => this.toggleFolder(file.id, e)
                                                      : e => {
                                                            e.preventDefault();
                                                            window.location.href = `/?id=${file.id}`;
                                                        }}
                                              >
                                                  ${file.emoji
                                                      ? html` <span class="emoji">${file.emoji}</span> `
                                                      : fileInfo.hasEmoji
                                                        ? html` <span class="emoji">${fileInfo.emoji}</span> `
                                                        : html` <img src="/a7/forget/page-1.svg" alt="File" class="page-icon" draggable="false" /> `}
                                                  ${file.hasChildren
                                                      ? html`
                                                            <img
                                                                draggable="false"
                                                                class="arrow"
                                                                src=${this.expandedFolders[file.id]
                                                                    ? '/a7/forget/down-arrow.svg'
                                                                    : '/a7/forget/right-arrow.svg'}
                                                                alt="Toggle folder"
                                                            />
                                                        `
                                                      : ''}
                                              </div>
                                              <a href="/?id=${file.id}" class="tree-content">
                                                  <span class="tree-name">${fileInfo.hasEmoji ? fileInfo.displayName : file.name}</span>
                                              </a>
                                              <div class="tree-actions">
                                                  <div class="add-child" @click=${e => this.createChildPage(file.id, e)}>
                                                      <img src="/a7/forget/plus.svg" alt="Add child" draggable="false" />
                                                  </div>
                                                  <div class="tree-delete" @click=${e => this.removeFile(file.id, e)}>
                                                      <img src="/a7/forget/trash.svg" alt="Delete" draggable="false" />
                                                  </div>
                                              </div>
                                          </div>
                                      `;
                                  })}
                              </div>
                          `}
                    ${this.filteredFiles.length === 0 && this.message !== 'Loading...'
                        ? html`
                              <div class="empty-state">
                                  <img src="/a7/plugins/options-element/puzzled.svg" alt="No pages found" draggable="false" />
                                  <p>No pages found</p>
                              </div>
                          `
                        : ''}
                </div>

                <br />
                <br />
                <br />
                <br />

                <div style="display: flex; gap: 12px; justify-content: center; padding: var(--padding-3); color: var(--fg-2); font-size: 14px;">
                    <a class="bottom-link " href="https://github.com/sohzm/wisk" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <span>•</span>
                    <a href="https://discord.gg/D8tQCvgDhu" target="_blank" rel="noopener noreferrer" class="bottom-link">Discord</a>
                    <span>•</span>
                    <a href="https://twitter.com/wisk_cc" target="_blank" rel="noopener noreferrer" class="bottom-link">Twitter</a>
                </div>

                <br />
                <br />
                <br />
            </div>
        `;
    }
}

customElements.define('home-element', HomeElement);
