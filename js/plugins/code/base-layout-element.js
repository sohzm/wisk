class BaseLayoutElement extends HTMLElement {
    constructor() {
        super();
        this.elements = [];
        this.setupEditor();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

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

    setupEditor() {
        this.editor = {
            elements: this.elements,
            readonly: false,
            createBlockBase: (elementId, blockType, value, remoteId, isRemote = false) => {
                const container = this.shadowRoot.querySelector('.container');
                if (!container) return null;

                if (elementId === '') {
                    elementId = this.elements.length > 1 ? this.elements[this.elements.length - 1].id : this.elements[0].id;
                }

                const id = isRemote ? remoteId : wisk.editor.generateNewId(this.id);
                const obj = { value, id, component: blockType };

                const prevElement = this.shadowRoot.getElementById(`div-${elementId}`);
                const blockElement = document.createElement(blockType);
                blockElement.id = id;

                const imageContainer = this.createHoverImageContainer(id);
                const fullWidthWrapper = this.createFullWidthWrapper(id, blockElement, imageContainer);
                const blockContainer = this.createBlockContainer(id, blockType);

                blockContainer.appendChild(fullWidthWrapper);
                console.log('Inserting block');
                console.log('Prev element', prevElement);
                console.log('prevElement?.nextSibling', prevElement?.nextSibling);
                console.log('Block container', blockContainer);
                console.log('Block element', blockElement);
                container.insertBefore(blockContainer, prevElement ? prevElement.nextSibling : null);

                const elementIndex = this.elements.findIndex(e => e.id === elementId);
                this.elements.splice(elementIndex + 1, 0, obj);

                return { id, blockElement };
            },
            createNewBlock: (elementId, blockType, value, focusIdentifier, rec, animate) => {
                // Check if we should delegate to a nested layout
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.createNewBlock(elementId, blockType, value, focusIdentifier, rec, animate);
                }

                console.log('Creating new block', elementId, blockType, value);
                const { id, blockElement } = this.editor.createBlockBase(elementId, blockType, value, null, false);

                setTimeout(() => {
                    if (animate) {
                        document.getElementById(id).setTextContent({ text: value.textContent });
                    } else {
                        this.editor.updateBlock(id, '', value, rec);
                        this.editor.focusBlock(id, focusIdentifier);
                    }
                }, 0);

                this.dispatchEvent(
                    new CustomEvent('block-created', {
                        bubbles: true,
                        composed: true,
                        detail: { id: this.id },
                    })
                );

                return id;
            },
            changeBlockType: (elementId, value, newBlockType, rec) => {
                // Check if we should delegate to a nested layout
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    console.log('Delegating to next layout ---', this.id, elementId, this.getNextLevel(elementId));
                    console.log('Delegating to next layout ---', nextLayout, value, newBlockType, rec);
                    return nextLayout.editor.changeBlockType(elementId, value, newBlockType, rec);
                }

                console.log('currnet element', this.id);
                console.log('Changing block type', elementId, newBlockType, value);

                const prevElement = this.shadowRoot.getElementById(elementId);
                if (!prevElement) return;

                console.log('Changing block type', elementId, newBlockType, value);

                wisk.editor.createNewBlock(prevElement.id, newBlockType, value, { x: 0 }, rec);
                wisk.editor.deleteBlock(elementId, rec);
                console.log('Deleted block', elementId);
                console.log('Creating new block', prevElement.id, newBlockType, value);

                window.dispatchEvent(new CustomEvent('block-updated', { detail: { id: prevElement.id } }));
            },
            deleteBlock: (elementId, rec) => {
                // Check if we should delegate to a nested layout
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.deleteBlock(elementId, rec);
                }

                const element = this.shadowRoot.getElementById(`div-${elementId}`);
                if (element) {
                    this.shadowRoot.querySelector('.container').removeChild(element);
                    this.elements = this.elements.filter(e => e.id !== elementId);

                    this.dispatchEvent(
                        new CustomEvent('block-deleted', {
                            bubbles: true,
                            composed: true,
                            detail: { id: this.id },
                        })
                    );

                    if (rec === undefined) {
                        this.editor.justUpdates();
                    }
                }
            },
            updateBlock: (elementId, path, newValue, rec) => {
                // Check if we should delegate to a nested layout
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.updateBlock(elementId, path, newValue, rec);
                }

                const element = this.shadowRoot.getElementById(elementId);
                if (element) {
                    console.log('Updating block', elementId, element, path, newValue);
                    element.setValue(path, newValue);

                    this.dispatchEvent(
                        new CustomEvent('block-updated', {
                            bubbles: true,
                            composed: true,
                            detail: { id: this.id },
                        })
                    );

                    if (rec === undefined) {
                        this.editor.justUpdates(elementId);
                    }
                }
            },
            focusBlock: (elementId, identifier) => {
                // Check if we should delegate to a nested layout
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.focusBlock(elementId, identifier);
                }

                const element = this.shadowRoot.getElementById(elementId);
                if (element) {
                    element.focus(identifier);
                }
            },
            getElement: elementId => {
                // Check if we should delegate to a nested layout
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.getElement(elementId);
                }

                return this.elements.find(e => e.id === elementId);
            },
            prevElement: elementId => {
                // Check if we should delegate to a nested layout
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.prevElement(elementId);
                }

                if (elementId === this.elements[0].id) return null;
                const index = this.elements.findIndex(e => e.id === elementId);
                return index > 0 ? this.elements[index - 1] : null;
            },
            nextElement: elementId => {
                // Check if we should delegate to a nested layout
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.nextElement(elementId);
                }

                const index = this.elements.findIndex(e => e.id === elementId);
                return index < this.elements.length - 1 ? this.elements[index + 1] : null;
            },
            justUpdates: async elementId => {
                // Check if we should delegate to a nested layout
                if (this.isNextLevelLayout(elementId)) {
                    const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
                    return nextLayout.editor.justUpdates(elementId);
                }

                if (elementId) {
                    const element = this.editor.getElement(elementId);
                    if (element) {
                        const domElement = this.shadowRoot.getElementById(elementId);
                        if (domElement) {
                            element.value = domElement.getValue();
                            element.lastEdited = Math.floor(Date.now() / 1000);
                            element.component = domElement.tagName.toLowerCase();
                        }
                    }
                }

                this.dispatchEvent(
                    new CustomEvent('layout-updated', {
                        bubbles: true,
                        composed: true,
                        detail: {
                            id: this.id,
                            elements: this.elements,
                        },
                    })
                );
            },
        };
    }

    // Rest of the methods remain the same...
    createHoverImageContainer(elementId) {
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('hover-images');

        const addButton = this.createHoverButton('/a7/forget/plus-hover.svg', () => this.whenPlusClicked(elementId));
        const deleteButton = this.createHoverButton('/a7/forget/trash-hover.svg', () => this.whenTrashClicked(elementId));

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

    whenTrashClicked(elementId) {
        // Check if we should delegate to a nested layout
        if (this.isNextLevelLayout(elementId)) {
            const nextLayout = this.shadowRoot.getElementById(this.getNextLevel(elementId));
            return nextLayout.whenTrashClicked(elementId);
        }

        this.editor.deleteBlock(elementId);
    }

    setValue(path, value) {
        // this.initializeElements();
        // return;

        if (!value) return;

        if (value.elements) {
            this.elements = value.elements;
            this.render();
            this.initializeElements();
        }
    }

    getValue() {
        return {
            elements: this.elements,
        };
    }

    getTextContent() {
        return {
            text: this.elements
                .map(e => {
                    const element = this.shadowRoot.getElementById(e.id);
                    return element?.getTextContent?.()?.text || '';
                })
                .join('\n'),
        };
    }

    async initializeElements() {
        this.elements = [
            {
                id: this.id + '-xyzxyzx',
                component: 'text-element',
                value: {
                    textContent: 'Hello World',
                },
            },
            {
                id: this.id + '-xyzxyzy',
                component: 'text-element',
                value: {
                    textContent: 'Hello World 2',
                },
            },
        ];

        if (!this.elements.length) return;

        for (const element of this.elements) {
            const container = this.createBlockContainer(element.id, element.component);
            const block = document.createElement(element.component);
            block.id = element.id;

            const imageContainer = this.createHoverImageContainer(element.id);
            const fullWidthWrapper = this.createFullWidthWrapper(element.id, block, imageContainer);

            container.appendChild(fullWidthWrapper);
            this.shadowRoot.querySelector('.container').appendChild(container);

            setTimeout(() => {
                block.setValue('', element.value);
            }, 0);
        }
    }

    render() {
        const style = `
            <style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                font-family: var(--font);
            }
            .container {
                background: var(--background-secondary);
            }
            .hover-images {
                display: none;
                opacity: 0;
                transition: opacity 0.2s;
                position: absolute;
                right: 100%;
                background: var(--bg-1);
                padding: var(--padding-2);
                gap: var(--gap-1);
                border: 1px solid var(--border-1);
                z-index: 41;
                border-radius: 40px;
            }
            .full-width-wrapper {
                display: flex;
                align-items: center;
                position: relative;
                gap: 4px;
            }
            .full-width-wrapper:hover .hover-images {
                opacity: 1;
                display: flex;
            }
            .full-width-wrapper > * {
                flex: 1;
            }
            .hover-images {
                flex: 0;
            }
            .hover-image {
                width: 20px;
                height: 20px;
                padding: 3px;
                cursor: pointer;
                filter: var(--themed-svg);
                border-radius: 40px;
            }
            .hover-image:hover {
                background: var(--bg-3);
            }
            .rndr {
                margin: 0.25rem 0;
            }
            .rndr-full-width {
                width: 100%;
            }
            </style>
        `;
        const content = `
            <div class="container">
            </div>
        `;
        this.shadowRoot.innerHTML = style + content;
    }
}

customElements.define('base-layout-element', BaseLayoutElement);
