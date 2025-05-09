class BaseLayoutElement extends HTMLElement {
    constructor() {
        super();
        this.elements = [];
        this.setupEditor();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    // Improved method to handle nested elements
    findDirectChild(elementId) {
        if (!elementId) return null;

        // Split IDs into parts
        const selfParts = this.id.split('-');
        const elementParts = elementId.split('-');

        // Check if the element could be a direct child based on ID structure
        if (elementParts.length > selfParts.length) {
            // Check if the first parts match this element's ID
            const potentialParentId = elementParts.slice(0, selfParts.length).join('-');
            if (potentialParentId === this.id) {
                // Return the immediate child ID portion
                return elementParts.slice(0, selfParts.length + 1).join('-');
            }
        }

        return null;
    }

    // Check if an element belongs to a nested layout
    isElementInNestedLayout(elementId) {
        const childId = this.findDirectChild(elementId);
        if (!childId) return false;

        // If the direct child exists and matches elementId, it's not in a nested layout
        if (childId === elementId) return false;

        // Check if this child is a layout element that could contain the target
        const childElement = this.shadowRoot.getElementById(childId);
        return (
            childElement && (childElement.tagName.toLowerCase() === 'base-layout-element' || childElement.tagName.toLowerCase() === 'columns-element')
        );
    }

    // Get the next level layout element that contains the target element
    getNextLevelLayout(elementId) {
        const childId = this.findDirectChild(elementId);
        if (!childId) return null;

        // If this is a direct match, no next level
        if (childId === elementId) return null;

        // Return the child element if it exists and is a layout
        const childElement = this.shadowRoot.getElementById(childId);
        if (
            childElement &&
            (childElement.tagName.toLowerCase() === 'base-layout-element' || childElement.tagName.toLowerCase() === 'columns-element')
        ) {
            return childElement;
        }

        return null;
    }

    setupEditor() {
        this.editor = {
            elements: this.elements,
            readonly: false,
            createBlockBase: (elementId, blockType, value, remoteId, isRemote = false) => {
                // Check if we should delegate to a nested layout
                const nestedLayout = this.getNextLevelLayout(elementId);
                if (nestedLayout) {
                    return nestedLayout.editor.createBlockBase(elementId, blockType, value, remoteId, isRemote);
                }

                const container = this.shadowRoot.querySelector('.container');
                if (!container) return null;

                if (elementId === '') {
                    elementId = this.elements.length > 1 ? this.elements[this.elements.length - 1].id : this.elements[0].id;
                }

                const id = isRemote ? remoteId : wisk.editor.generateNewId(this.id);
                const obj = {
                    value,
                    id,
                    component: blockType,
                    lastEdited: Math.floor(Date.now() / 1000),
                };

                const prevElement = this.shadowRoot.getElementById(`div-${elementId}`);
                const blockElement = document.createElement(blockType);
                blockElement.id = id;

                const imageContainer = this.createHoverImageContainer(id);
                const fullWidthWrapper = this.createFullWidthWrapper(id, blockElement, imageContainer);
                const blockContainer = this.createBlockContainer(id, blockType);

                blockContainer.appendChild(fullWidthWrapper);
                container.insertBefore(blockContainer, prevElement ? prevElement.nextSibling : null);

                const elementIndex = this.elements.findIndex(e => e.id === elementId);
                this.elements.splice(elementIndex + 1, 0, obj);

                return { id, blockElement };
            },
            createNewBlock: (elementId, blockType, value, focusIdentifier, rec, animate) => {
                // Check if we should delegate to a nested layout
                const nestedLayout = this.getNextLevelLayout(elementId);
                if (nestedLayout) {
                    return nestedLayout.editor.createNewBlock(elementId, blockType, value, focusIdentifier, rec, animate);
                }

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
            createBlockNoFocus: (elementId, blockType, value, rec, animate) => {
                // Check if we should delegate to a nested layout
                const nestedLayout = this.getNextLevelLayout(elementId);
                if (nestedLayout) {
                    return nestedLayout.editor.createBlockNoFocus(elementId, blockType, value, rec, animate);
                }

                const { id, blockElement } = this.editor.createBlockBase(elementId, blockType, value, null, false);

                setTimeout(() => {
                    if (animate) {
                        document.getElementById(id).setTextContent({ text: value.textContent });
                    } else {
                        this.editor.updateBlock(id, '', value, rec);
                    }
                }, 0);

                return id;
            },
            changeBlockType: (elementId, value, newBlockType, rec) => {
                // Check if we should delegate to a nested layout
                const nestedLayout = this.getNextLevelLayout(elementId);
                if (nestedLayout) {
                    return nestedLayout.editor.changeBlockType(elementId, value, newBlockType, rec);
                }

                const prevElement = this.editor.prevElement(elementId);
                if (!prevElement) return;

                this.editor.deleteBlock(elementId, rec);
                this.editor.createNewBlock(prevElement.id, newBlockType, value, { x: 0 }, rec);

                this.dispatchEvent(
                    new CustomEvent('block-updated', {
                        bubbles: true,
                        composed: true,
                        detail: { id: prevElement.id },
                    })
                );
            },
            deleteBlock: (elementId, rec) => {
                // Check if we should delegate to a nested layout
                const nestedLayout = this.getNextLevelLayout(elementId);
                if (nestedLayout) {
                    return nestedLayout.editor.deleteBlock(elementId, rec);
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
                const nestedLayout = this.getNextLevelLayout(elementId);
                if (nestedLayout) {
                    return nestedLayout.editor.updateBlock(elementId, path, newValue, rec);
                }

                const element = this.shadowRoot.getElementById(elementId);
                if (element) {
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
                const nestedLayout = this.getNextLevelLayout(elementId);
                if (nestedLayout) {
                    return nestedLayout.editor.focusBlock(elementId, identifier);
                }

                const element = this.shadowRoot.getElementById(elementId);
                if (element) {
                    element.focus(identifier);
                }
            },
            getElement: elementId => {
                // Check if we should delegate to a nested layout
                const nestedLayout = this.getNextLevelLayout(elementId);
                if (nestedLayout) {
                    return nestedLayout.editor.getElement(elementId);
                }

                return this.elements.find(e => e.id === elementId);
            },
            prevElement: elementId => {
                // Check if we should delegate to a nested layout
                const nestedLayout = this.getNextLevelLayout(elementId);
                if (nestedLayout) {
                    return nestedLayout.editor.prevElement(elementId);
                }

                if (elementId === this.elements[0]?.id) return null;
                const index = this.elements.findIndex(e => e.id === elementId);
                return index > 0 ? this.elements[index - 1] : null;
            },
            nextElement: elementId => {
                // Check if we should delegate to a nested layout
                const nestedLayout = this.getNextLevelLayout(elementId);
                if (nestedLayout) {
                    return nestedLayout.editor.nextElement(elementId);
                }

                const index = this.elements.findIndex(e => e.id === elementId);
                return index < this.elements.length - 1 ? this.elements[index + 1] : null;
            },

            justUpdates: async elementId => {
                // Check if we should delegate to a nested layout
                const nestedLayout = this.getNextLevelLayout(elementId);
                if (nestedLayout) {
                    await nestedLayout.editor.justUpdates(elementId);
                    // Regardless of delegation, we need to update our own state
                }

                if (elementId) {
                    const element = this.elements.find(e => e.id === elementId);
                    if (element) {
                        const domElement = this.shadowRoot.getElementById(elementId);
                        if (domElement) {
                            // Update the element value from the DOM
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
        img.draggable = false;
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
        const nestedLayout = this.getNextLevelLayout(elementId);
        if (nestedLayout) {
            return nestedLayout.whenPlusClicked(elementId);
        }

        this.editor.createNewBlock(elementId, 'text-element', { textContent: '' }, { x: 0 });
        const nextElement = this.editor.nextElement(elementId);
        if (nextElement) {
            wisk.editor.showSelector(nextElement.id, { x: 0 });
        }
    }

    async aboutToBeOoomfed() {
        // loop through all elements and call aboutToBeOoomfed
        for (const element of this.elements) {
            const domElement = this.shadowRoot.getElementById(element.id);
            if (domElement && domElement.aboutToBeOoomfed) {
                await domElement.aboutToBeOoomfed();
            }
        }
    }

    async whenTrashClicked(elementId) {
        if (this.shadowRoot.getElementById(elementId).aboutToBeOoomfed) await this.shadowRoot.getElementById(elementId).aboutToBeOoomfed();
        this.editor.deleteBlock(elementId);
    }

    setValue(path, value) {
        if (!value) return;

        if (value.elements) {
            // Verify each element has the required properties
            this.elements = Array.isArray(value.elements)
                ? value.elements.map(element => {
                      // Ensure each element has id, component, value
                      if (!element.id) {
                          element.id = wisk.editor.generateNewId(this.id);
                      }
                      if (!element.component) {
                          element.component = 'text-element';
                      }
                      if (!element.value) {
                          element.value = { textContent: '' };
                      }
                      return element;
                  })
                : [];

            // If elements array is empty, initialize with default elements
            if (this.elements.length === 0) {
                this.initializeDefaultElements();
            }

            this.render();
            this.initializeElements();
        }
    }

    getValue() {
        const elementValues = [];

        console.log('getValue of base-layout-element ------------', this.elements);

        for (const element of this.elements) {
            const domElement = this.shadowRoot.getElementById(element.id);
            if (domElement) {
                // For layout or column elements
                if (domElement.tagName.toLowerCase() === 'base-layout-element' || domElement.tagName.toLowerCase() === 'columns-element') {
                    const nestedValue = domElement.getValue();
                    elementValues.push({
                        id: element.id,
                        component: element.component,
                        value: nestedValue,
                        lastEdited: Math.floor(Date.now() / 1000),
                    });
                }
                // For regular elements
                else {
                    let elementValue = domElement.getValue();
                    console.log('getValue elementValue ------------', elementValue);
                    elementValues.push({
                        id: element.id,
                        component: element.component,
                        value: elementValue,
                        lastEdited: Math.floor(Date.now() / 1000),
                    });
                }
            } else {
                // Fallback for elements not yet in the DOM
                elementValues.push(element);
            }
        }

        console.log(' 33 getValue ------------', elementValues);

        return {
            elements: elementValues,
        };
    }

    getTextContent() {
        return {
            text: this.elements
                .map(e => {
                    const element = this.shadowRoot.getElementById(e.id);
                    return element?.getTextContent?.()?.text || '';
                })
                .filter(text => text.trim() !== '')
                .join('\n'),
        };
    }

    initializeDefaultElements() {
        this.elements = [
            {
                id: wisk.editor.generateNewId(this.id),
                component: 'text-element',
                value: {
                    textContent: 'Hello World',
                },
                lastEdited: Math.floor(Date.now() / 1000),
            },
        ];
    }

    async initializeElements() {
        if (!this.elements || this.elements.length === 0) {
            this.initializeDefaultElements();
        }

        const container = this.shadowRoot.querySelector('.container');
        if (!container) return;

        // Clear existing elements
        container.innerHTML = '';

        // Create DOM elements for each item in the elements array
        for (const element of this.elements) {
            const container = this.createBlockContainer(element.id, element.component);
            const block = document.createElement(element.component);
            block.id = element.id;

            const imageContainer = this.createHoverImageContainer(element.id);
            const fullWidthWrapper = this.createFullWidthWrapper(element.id, block, imageContainer);

            container.appendChild(fullWidthWrapper);
            this.shadowRoot.querySelector('.container').appendChild(container);

            setTimeout(() => {
                if (element.value) {
                    block.setValue('', element.value);
                } else {
                    block.setValue('', { textContent: '' });
                }
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
                scale: 1.1;
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
