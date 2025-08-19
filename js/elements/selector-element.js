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
        var element = byQueryShadowroot('#' + this.elementId);
        // var elementData = wisk.editor.getElement(this.elementId);
        // console.log(this.elementId, element, elementData);
        // var callingDetail = wisk.plugins.getPluginDetail(elementData.component);

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

                    button.appendChild(img);
                    button.appendChild(p);

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
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            let x = Math.round((vw - selector.getBoundingClientRect().width) / 2);
            let y = Math.round((vh - selector.getBoundingClientRect().height) / 3);

            if (anchorRect && (anchorRect.width > 0 || anchorRect.height > 0)) {
                const { top: t, bottom: b, left: l } = anchorRect;
                const menuRect = selector.getBoundingClientRect();
                x = l;
                y = b + GAP;
                if (x + menuRect.width > vw - 8) x = Math.max(8, vw - menuRect.width - 8);
                if (y + menuRect.height > vh - 8) y = Math.max(8, t - GAP - menuRect.height);
                if (y < 8) y = 8;
            }

            selector.style.position = 'fixed';
            selector.style.left = `${x}px`;
            selector.style.top = `${y}px`;
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
                width: 80%;
                max-width: 400px;
                height: auto;
                position: fixed;
                background-color: var(--bg-1);
                border: 1px solid var(--border-1);
                border-radius: var(--radius-large);
                filter: var(--drop-shadow);
                z-index: 100;
                padding: 0;
                overflow: hidden;
                transform: translateZ(0);
            }

            @media (max-width: 900px) {
            }
            .displayNone {
                display: none;
            }
            #selector-input {
                width: 100%;
                outline: none;
            }
            .buttons {
                display: flex;
                flex-direction: column;
                gap: var(--gap-1);
                height: 240px;
                overflow-y: auto;
            }
            .selector-button {
                outline: none;
                border: 1px solid transparent;
                background-color: var(--bg-1);
                color: var(--fg-1);
                padding: var(--padding-2) var(--padding-4);
                border-radius: 0;
                cursor: pointer;
                display: flex;
                justify-content: left;
                align-items: center;
                gap: var(--gap-2);
            }
            .selector-button-focused {
                background-color: var(--bg-2);
            }
            #selector-input {
                width: 100%;
                color: var(--fg-1);
                outline: none;
                border: none;
                background-color: transparent;
            }
            .search-div {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: var(--gap-2);
                padding: var(--padding-2);
                border-radius: var(--radius);
                background-color: var(--bg-1);
                border: none;
                border-bottom: 1px solid var(--border-1);
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 0;
                padding: var(--padding-4);
            }
            img {
                height: 40px;
                width: 40px;
                padding: 9px;
                border-radius: 4px;
            }
            .font-1 {
                font-family: var(--font);
            }
            img {
                filter: var(--themed-svg);
            }

            @media (hover: hover) {
                *::-webkit-scrollbar { width: 15px; }
                *::-webkit-scrollbar-track { background: var(--bg-1); }
                *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
                *::-webkit-scrollbar-thumb:hover { background-color: var(--fg-1); }
            }

            </style>
            <div id="selector-bg" class="displayNone"></div>
            <div id="selector" class="displayNone font-1">
                <div class="search-div font-1">
                    <label class="font-1" for="selector-input" style="color: var(--fg-1); font-size: 13px; background-color: transparent;">&gt;</label>
                    <input type="text" id="selector-input" autocomplete="off" class="font-1"/>
                </div>
                <div class="buttons">
                </div>
            </div>
        `;

        this.shadowRoot.innerHTML = innerHTML;
    }
}

customElements.define('selector-element', SelectorElement);
