class ColumnsElement extends HTMLElement {
    constructor() {
        super();
        this.columns = [];
        this.editor = null;
        this.attachShadow({ mode: 'open' });
        this.setupEditor();
    }

    connectedCallback() {
        var id1 = wisk.editor.generateNewId(this.id);
        var id2 = wisk.editor.generateNewId(this.id);

        this.columns = [
            { id: id1, elements: [ { id: id1 + '-xyzxyzx', component: 'text-element', value: { textContent: 'Hello World', }, }, ] },
            { id: id2, elements: [ { id: id2 + '-xyzxyzx', component: 'text-element', value: { textContent: 'Lorem Ipsum', }, }, ] }
        ]
        this.render();
    }

    setValue(path, value) {
    }

    getValue() {
        return this.columns;
    }

    setupEditor() {
        this.editor = {
            elements: this.elements,
            readonly: false,
            createBlockBase: (elementId, blockType, value, remoteId, isRemote = false) => {
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.createBlockBase(elementId, blockType, value, remoteId, isRemote);
                }
            },
            createNewBlock: (elementId, blockType, value, focusIdentifier, rec, animate) => {
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.createNewBlock(elementId, blockType, value, focusIdentifier, rec, animate);
                }
            },
            changeBlockType: (elementId, value, newBlockType, rec) => {
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.changeBlockType(elementId, value, newBlockType, rec);
                }
            },
            deleteBlock: (elementId, rec) => {
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.deleteBlock(elementId, rec);
                }
            },
            updateBlock: (elementId, path, newValue, rec) => {
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.updateBlock(elementId, path, newValue, rec);
                }
            },
            focusBlock: (elementId, identifier) => {
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.focusBlock(elementId, identifier);
                }
            },
            getElement: elementId => {
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.getElement(elementId);
                }
            },
            prevElement: elementId => {
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.prevElement(elementId);
                }
            },
            nextElement: elementId => {
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.nextElement(elementId);
                }
            },
            justUpdates: async elementId => {
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.justUpdates(elementId);
                }
            },
        };
    }

    // Rest of the methods remain the same...
    createHoverImageContainer(elementId) {
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('hover-images');

        const addButton = this.createHoverButton('/a7/forget/plus.svg', () => this.whenPlusClicked(elementId));
        const deleteButton = this.createHoverButton('/a7/forget/trash.svg', () => this.whenTrashClicked(elementId));

        imageContainer.appendChild(addButton);
        imageContainer.appendChild(deleteButton);

        return imageContainer;
    }

    createHoverButton(src, clickHandler) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Hover image';
        img.classList.add('hover-image', 'plugin-icon');
        img.addEventListener('click', clickHandler);
        return img;
    }

    createFullWidthWrapper(elementId, block, imageContainer) {
        const wrapper = document.createElement('div');
        wrapper.id = `full-width-wrapper-${elementId}`;
        wrapper.classList.add('full-width-wrapper');

        if (!this.editor.readonly) {
            wrapper.appendChild(imageContainer);
        }

        wrapper.appendChild(block);
        return wrapper;
    }

    createBlockContainer(elementId, blockType) {
        const container = document.createElement('div');
        container.id = `div-${elementId}`;
        container.classList.add('rndr');

        if (wisk.plugins.getPluginDetail(blockType)?.width === 'max') {
            container.classList.add('rndr-full-width');
        }

        return container;
    }

    whenPlusClicked(elementId) {
        // Check if we should delegate to a nested layout
        if (this.isNextLevelLayout(elementId)) {
            const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
            console.log('Delegating to next layout ---', this.id, elementId, this.getNextLevel(elementId));
            return nextLayout.whenPlusClicked(elementId);
        }

        this.editor.createNewBlock(elementId, 'text-element', { textContent: '' }, { x: 0 });
        const nextElement = this.editor.nextElement(elementId);
        if (nextElement) {
            wisk.editor.showSelector(nextElement.id, { x: 0 });
        }
    }

    // TODO move to wisk.editor
    isNextLevelLayout(currentId) {
        const nextLevel = this.getNextLevel(currentId);
        if (!nextLevel) return false;
        else return nextLevel;
    }

    getNextLevel(currentId) {
        if (!currentId) return null;

        var editorId = this.id.split('-');
        var currentId = currentId.split('-');

        if (editorId.length + 1 >= currentId.length) return null;
        return currentId.slice(0, editorId.length + 1).join('-');
    }

    getLevel(id) {
        return id ? id.split('-').length : 0;
    }

    render() {
        var style = `
            <style>
                .columns {
                    display: flex;
                }
                .column {
                    flex: 1;
                }
                .columns:hover .column {
                    border-right: 1px solid var(--border-1);
                }
                .column:last-child {
                    border-right: none;
                }
                .plus-btn {
                    padding: 0;
                    border: none;
                    outline: none;
                    background: transparent;
                    border-radius: 30px;
                    cursor: pointer;
                    opacity: 0.5;
                }
                .plus-btn:hover {
                    background: var(--bg-3);
                }
                .plus-btn img {
                    width: 16px;
                    filter: var(--themed-svg);
                }
            </style>
        `
        var content = `
            <div class="columns">
                ${this.columns.map((column, index) => {
                    var id = column.id;
                    return `<div class="column"> <base-layout-element id="${id}"></base-layout-element> </div>`;
                }).join('')}
                <button class="plus-btn"> <img src="/a7/forget/plus.svg"/> </button>
            </div>
        `
        this.shadowRoot.innerHTML = style + content;

        this.shadowRoot.querySelector('.plus-btn').addEventListener('click', () => {
            var id = wisk.editor.generateNewId(this.id);
            this.columns.push({
                elements: [
                    { id: id + '-xyzxyzx', component: 'text-element', value: { textContent: 'New Column', }, },
                ],
                id: wisk.editor.generateNewId(this.id),
            });

            this.render();
        });

        for (let i = 0; i < this.columns.length; i++) {
            this.shadowRoot.querySelector(`#${this.columns[i].id}`).setValue("", this.columns[i]);
        }
    }
}

customElements.define('columns-element', ColumnsElement);
