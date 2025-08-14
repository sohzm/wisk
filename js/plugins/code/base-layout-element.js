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
        const selectButton = this.createHoverButton('/a7/forget/dots-grid3x3.svg', () => this.whenSelectClicked(elementId));

        imageContainer.appendChild(addButton);
        imageContainer.appendChild(selectButton);

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

    createMenuItem(label, onClick, itemClass = '', icon=null) {
        const item = document.createElement('div');
        item.className = `context-menuItem ${itemClass}`;

        if(icon) {
            const iconElement = document.createElement('span');
            iconElement.className = 'cm-icon';
            const iconImage = document.createElement('img');
            iconImage.src = icon;
            iconElement.appendChild(iconImage);
            item.appendChild(iconElement);
        }

        const labelElement = document.createElement('span');
        labelElement.className = 'cm-label';
        labelElement.textContent = label;
        item.appendChild(labelElement);

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick();
            const existingMenu = document.querySelector('.context-menu');
            if(existingMenu) {
                existingMenu.remove();
            }
        });

        return item;
    }

    duplicateItem(elementId) {
        const el = this.shadowRoot.getElementById(elementId);
        const componentType = el.tagName.toLowerCase();
        if (!el) return;
        const valueClone = JSON.parse(JSON.stringify(el.getValue() || {}));
        this.editor.createNewBlock(elementId, componentType, valueClone, { x: 0 });
    };

    async deleteItem(elementId) {
        const inst = this.shadowRoot.getElementById(elementId);
        if (inst && inst.aboutToBeOoomfed) {
            try { await inst.aboutToBeOoomfed(); } catch { }
        }
        this.editor.deleteBlock(elementId);
    };

    whenSelectClicked(elementId) {
        console.log('SELECT CLICKED <base layout element>', elementId);

        const nestedLayout = this.getNextLevelLayout(elementId);
        if (nestedLayout) {
            return nestedLayout.whenSelectClicked(elementId);
        }

        // Close any existing menu
        const blockDiv = this.shadowRoot.getElementById(`div-${elementId}`);
        const element = this.shadowRoot.getElementById(elementId);
        const existingMenu = this.shadowRoot.querySelector('.context-menu');
        if(existingMenu) existingMenu.remove();

        // Build Menu
        const contextMenu = document.createElement('div');
        contextMenu.classList.add('context-menu');

        // Some default menu items
        contextMenu.appendChild(this.createMenuItem('Duplicate', () => this.duplicateItem(elementId), 'duplicate', '/a7/iconoir/copy.svg'));
        contextMenu.appendChild(this.createMenuItem('Delete', () => this.deleteItem(elementId), 'delete', '/a7/iconoir/trash.svg'));

        const elType = element.tagName.toLowerCase();
        const elActions = wisk.plugins.getPluginDetail(elType)['context-menu-options'];
        if (Array.isArray(elActions)) {
            for (const action of elActions) {
                contextMenu.appendChild(createMenuItem(
                action.label, 
                () => {
                    const element = this.shadowRoot.getElementById(elementId);
                    element.runArg(action.action);
                }, '',
                action.icon || ''));
            }
        }

        document.body.appendChild(contextMenu);

        // positioning
        const hover = blockDiv.querySelector('.hover-images') || blockDiv;
        const selectIcon = hover.querySelector('img[src$="dots-grid3x3.svg"]') || hover;
        const rect = selectIcon.getBoundingClientRect();

        contextMenu.style.position = 'fixed';
        contextMenu.style.visibility = 'hidden';
        contextMenu.style.top = '0px';
        contextMenu.style.left = '0px';

        requestAnimationFrame(() => {
            const GAP = 10;
            const MARGIN = 8;

            const vw = window.innerWidth;
            const vh = window.innerHeight;

            const { top: t, bottom: b, left: l, right: r } = rect;
            const triggerMidY = (t + b) / 2;

            const { width: mw, height: mh } = contextMenu.getBoundingClientRect();

            let left = l - GAP - mw;
            let top = triggerMidY - mh / 2;

            if (left < MARGIN) {
                left = r + GAP;
                contextMenu.style.transformOrigin = 'center left';
            } else {
                contextMenu.style.transformOrigin = 'center right';
            }

            top = Math.max(MARGIN, Math.min(top, vh - MARGIN - mh));

            left = Math.max(MARGIN, Math.min(left, vw - MARGIN - mw));

            contextMenu.style.top = `${top}px`;
            contextMenu.style.left = `${left}px`;
            contextMenu.style.visibility = 'visible';
        });


        const scrollerEl = document.querySelector('.editor')

        function cleanup() {
            if (contextMenu && contextMenu.parentNode) contextMenu.remove();
            if (scrollerEl && scrollerEl.removeEventListener) {
                scrollerEl.removeEventListener('scroll', onScroll);
            }
            window.removeEventListener('click', onClickOutside, true);
        }

        function onScroll() {
            cleanup();
        }

        function onClickOutside(e) {
            if (!contextMenu.contains(e.target) && !hover.contains(e.target)) {
                cleanup();
            }
        }

        scrollerEl.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('click', onClickOutside, true);
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
            .context-menuItem {
                display: flex;
                align-items: center;
                gap: var(--gap-2);
                padding: 8px 10px;
                cursor: pointer;
                outline: none;
                transition:
                    background-color 150ms ease,
                    color 150ms ease,
                    transform 120ms ease;
            }
            .context-menuItem,
            .context-menu {
                font-size: 12.5px;
                line-height: 1.4;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            .context-menuItem:hover,
            .context-menuItem:focus {
                background-color: var(--bg-2);
            }
            .context-menuItem:active {
                transform: translateY(0.5px);
            }
            .context-menuItem > .cm-icon {
                width: 16px;
                height: 16px;
                flex: 0 0 16px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                opacity: 0.9;
            }
            .context-menuItem > .cm-icon img,
            .context-menuItem > .cm-icon svg {
                width: 16px;
                height: 16px;
                filter: var(--themed-svg);
                display: block;
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
