class SelectorElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
        this.elementId = '';
    }

    connectedCallback() {
        this.shadowRoot.querySelector('#selector-input').addEventListener('keydown', this.handleInput.bind(this));
        this.shadowRoot.querySelector('#selector-input').addEventListener('keyup', this.handleInput.bind(this));
        this.shadowRoot.querySelector('#selector-bg').addEventListener('click', this.hide.bind(this));
    }

    levenshteinDistance(a, b) {
        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }

        return matrix[b.length][a.length];
    }

    fuzzySearch(query, title) {
        query = query.toLowerCase();
        title = title.toLowerCase();

        let queryIndex = 0;
        let titleIndex = 0;

        while (queryIndex < query.length && titleIndex < title.length) {
            if (query[queryIndex] === title[titleIndex]) {
                queryIndex++;
            }
            titleIndex++;
        }

        return queryIndex === query.length;
    }

    selectButton(btn) {
        var element = findElementInNestedShadows(this.elementId);
        if (!element) {
            element = byQueryShadowroot('#' + this.elementId);
        }

        var dataPluginId = btn.getAttribute('data-plugin-id');
        var dataContentId = btn.getAttribute('data-content-id');
        var newDetail = wisk.plugins.pluginData.list[dataPluginId].contents[dataContentId];

        wisk.editor.changeBlockType(this.elementId, element.getValue(), newDetail.component);
        // if (callingDetail.textual && newDetail.textual) {
        //     // TODO see why this is not working
        //     // wisk.editor.focusBlock(this.elementId, { x: elementData.value.textContent.length });
        // }

        this.hide();
    }

    handleInput(e) {
        if (e.keyCode === 27) {
            this.hide();
            // TODO focus on the text element again
            return;
        }

        if (e.type === 'keyup' && (e.keyCode == 13 || e.keyCode == 38 || e.keyCode == 40)) {
            return;
        }

        if (e.keyCode === 13) {
            const focusedButton = this.shadowRoot.querySelector('.selector-button-focused');
            if (focusedButton) {
                e.preventDefault();
                this.selectButton(focusedButton);
            }
            return;
        }

        if (e.keyCode === 38 || e.keyCode === 40) {
            const buttons = this.shadowRoot.querySelectorAll('.selector-button');
            let focusedButton = this.shadowRoot.querySelector('.selector-button-focused');
            if (focusedButton) {
                focusedButton.classList.remove('selector-button-focused');
                if (e.keyCode === 38) {
                    focusedButton = focusedButton.previousElementSibling || buttons[buttons.length - 1];
                } else {
                    focusedButton = focusedButton.nextElementSibling || buttons[0];
                }
                focusedButton.classList.add('selector-button-focused');
            } else {
                buttons[0].classList.add('selector-button-focused');
            }

            // also scroll the buttons
            focusedButton.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            });
            return;
        }

        this.renderButtons(e.target.value);
    }

    renderButtons(query) {
        const buttonsContainer = this.shadowRoot.querySelector('.buttons');
        buttonsContainer.innerHTML = '';

        const shortcutMap = {
            'heading1-element': '#',
            'heading2-element': '##',
            'heading3-element': '###',
            'heading4-element': '####',
            'heading5-element': '#####',
            'list-element': '-',
            'numbered-list-element': '1.',
            'quote-element': '>',
            'code-element': '```',
            'divider-element': '---',
            'checkbox-element': '- [ ]',
        };

        for (let key in wisk.plugins.pluginData.list) {
            if (wisk.plugins.pluginData.list[key].hide) {
                continue;
            }

            for (let i = 0; i < wisk.plugins.pluginData.list[key].contents.length; i++) {
                if (wisk.plugins.pluginData.list[key].contents[i].category === 'component') {
                    // check if it is loaded
                    if (!wisk.plugins.loadedPlugins.includes(wisk.plugins.pluginData.list[key].contents[i].component)) {
                        continue;
                    }

                    let title = wisk.plugins.pluginData.list[key].contents[i].title;
                    let component = wisk.plugins.pluginData.list[key].contents[i].component;

                    if (query && !this.fuzzySearch(query, title)) {
                        continue;
                    }

                    const button = document.createElement('button');
                    button.classList.add('selector-button');
                    button.classList.add('font-1');
                    button.setAttribute('data-plugin-id', key);
                    button.setAttribute('data-content-id', i);
                    button.setAttribute('data-title', title);

                    const img = document.createElement('img');
                    img.classList.add('plugin-icon');
                    img.src = SERVER + wisk.plugins.pluginData['icon-path'] + wisk.plugins.pluginData.list[key].contents[i].icon;

                    const p = document.createElement('p');
                    p.innerText = title;
                    p.style.flex = '1';
                    p.style.margin = '0';
                    p.style.overflow = 'hidden';
                    p.style.textOverflow = 'ellipsis';
                    p.style.whiteSpace = 'nowrap';

                    const leftGroup = document.createElement('span');
                    leftGroup.style.display = 'flex';
                    leftGroup.style.alignItems = 'center';
                    leftGroup.style.gap = '8px';
                    leftGroup.style.flex = '1';
                    leftGroup.appendChild(img);
                    leftGroup.appendChild(p);
                    const shortcut = document.createElement('span');
                    shortcut.className = 'selector-shortcut';
                    shortcut.innerText = shortcutMap[component] || '';

                    button.appendChild(leftGroup);
                    button.appendChild(shortcut);

                    button.addEventListener('click', () => {
                        this.selectButton(button);
                    });

                    button.addEventListener('mouseover', () => {
                        this.focusOnButton(button);
                    });

                    buttonsContainer.appendChild(button);
                }
            }
        }
        const firstButton = this.shadowRoot.querySelector('.selector-button');
        if (firstButton) {
            firstButton.classList.add('selector-button-focused');
        }
    }

    focusOnButton(button) {
        const buttons = this.shadowRoot.querySelectorAll('.selector-button');
        buttons.forEach(btn => {
            btn.classList.remove('selector-button-focused');
        });
        button.classList.add('selector-button-focused');
    }

    show(elementId, anchorRect) {
        this.elementId = elementId;
        this.shadowRoot.querySelector('#selector-input').value = '';
        const selector = this.shadowRoot.querySelector('#selector');
        const bg = this.shadowRoot.querySelector('#selector-bg');
        selector.classList.remove('displayNone');
        bg.classList.remove('displayNone');
        selector.style.visibility = 'hidden';
        selector.style.top = '0px';
        selector.style.left = '0px';
        this.shadowRoot.querySelector('#selector-input').focus();
        this.renderButtons('');

        requestAnimationFrame(() => {
            const GAP = 8;
            const MARGIN = 8;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            const { width: mw, height: mh } = selector.getBoundingClientRect();

            let left = Math.round((vw - mw) / 2);
            let top = Math.round((vh - mh) / 3);

            if (!anchorRect || (anchorRect.width === 0 && anchorRect.height === 0)) {
                const plusButton = findPlusButtonForElement(elementId);
                if (plusButton) {
                    anchorRect = plusButton.getBoundingClientRect();
                }
            }

            if (anchorRect && (anchorRect.width > 0 || anchorRect.height > 0)) {
                const { top: t, bottom: b, left: l, right: r } = anchorRect;

                top = b + GAP;

                left = l;

                left = Math.max(MARGIN, Math.min(left, vw - MARGIN - mw));

                top = Math.max(MARGIN, Math.min(top, vh - MARGIN - mh));
            }

            selector.style.position = 'fixed';
            selector.style.left = `${Math.round(left)}px`;
            selector.style.top = `${Math.round(top)}px`;
            selector.style.visibility = 'visible';
        });
    }

    hide() {
        this.shadowRoot.querySelector('#selector').classList.add('displayNone');
        this.shadowRoot.querySelector('#selector-bg').classList.add('displayNone');
    }

    render() {
        const innerHTML = `
            <style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                font-family: var(--font);
            }
            #selector-bg {
                width: 100%;
                height: 100%;
                position: fixed;
                top: 0;
                left: 0;
                z-index: 99;
            }
            #selector {
                width: 90%;
                max-width: 380px;
                height: auto;
                position: fixed;
                background-color: var(--bg-1);
                border: 1px solid var(--border-1);
                border-radius: 10px;
                filter: var(--drop-shadow);
                z-index: 100;
                padding: 0;
                overflow: hidden;
                transform: translateZ(0);
            }
            .displayNone {
                display: none;
            }
            #selector-input {
                width: 100%;
                outline: none;
                font-size: 15px;
                padding: 6px 0 6px 0;
                color: var(--fg-1);
                border: none;
                background-color: transparent;
            }
            .search-div {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px 6px 10px;
                border-radius: 0;
                background-color: var(--bg-1);
                border: none;
                border-bottom: 1px solid var(--border-1);
            }
            .buttons {
                display: flex;
                flex-direction: column;
                gap: 0;
                max-height: 260px;
                overflow-y: auto;
                padding: 0;
                margin: 4px 0px 4px 0px;
                align-items: stretch;
                justify-content: flex-start;
            }
            .selector-button {
                outline: none;
                border: none;
                background-color: var(--bg-1);
                color: var(--fg-1);
                padding: 10px 8px 10px 8px;
                margin: 0px 4px 0px 4px;
                border-radius: 3px;
                cursor: pointer;
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-items: center;
                gap: 0;
                font-size: 15px;
                height: 32px;
                min-height: 32px;
                max-height: 32px;
                flex-shrink: 0;
                transition: background 0.12s;
            }
            .selector-shortcut {
                color: var(--fg-2);
                font-size: 13px;
                margin-left: 12px;
                min-width: 28px;
                text-align: right;
                flex-shrink: 0;
                opacity: 0.85;
            }
            .selector-button-focused {
                background-color: var(--bg-2);
                border-radius: 3px;
            }
            img {
                height: 22px;
                width: 22px;
                padding: 0;
                border-radius: 3px;
                margin-right: 2px;
            }
            .font-1 {
                font-family: var(--font);
            }
            img {
                filter: var(--themed-svg);
            }
            .selector-button p {
                text-align: left;
                flex: 1;
                margin: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            @media (hover: hover) {
                *::-webkit-scrollbar { width: 10px; }
                *::-webkit-scrollbar-track { background: var(--bg-1); }
                *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 3px solid var(--bg-1); }
                *::-webkit-scrollbar-thumb:hover { background-color: var(--fg-1); }
            }
            </style>
            <div id="selector-bg" class="displayNone"></div>
            <div id="selector" class="displayNone font-1">
                <div class="search-div font-1">
                    <label class="font-1" for="selector-input" style="color: var(--fg-1); font-size: 13px; background-color: transparent;">&gt;</label>
                    <input type="text" placeholder="Search..." id="selector-input" autocomplete="off" class="font-1"/>
                </div>
                <div class="buttons">
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = innerHTML;
    }
}

customElements.define('selector-element', SelectorElement);
