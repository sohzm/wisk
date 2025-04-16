class ColumnsElement extends HTMLElement {
    constructor() {
        super();
        this.columns = [];
        this.editor = null;
        this.attachShadow({ mode: 'open' });
        this.setupEditor();
    }

    initValue() {
        var id1 = wisk.editor.generateNewId(this.id);
        var id2 = wisk.editor.generateNewId(this.id);

        this.columns = [
            {
                id: id1,
                elements: [
                    {
                        id: wisk.editor.generateNewId(id1), // This ensures proper nesting of IDs
                        component: 'text-element',
                        value: { textContent: 'Hello World' },
                    },
                ],
            },
            {
                id: id2,
                elements: [
                    {
                        id: wisk.editor.generateNewId(id2), // This ensures proper nesting of IDs
                        component: 'text-element',
                        value: { textContent: 'Lorem Ipsum' },
                    },
                ],
            },
        ];
    }

    connectedCallback() {
        if (!Array.isArray(this.columns) || this.columns.length === 0) {
            this.initValue();
        }
        this.render();

        // Add data attribute to mark this as a column container for DOM traversal
        this.setAttribute('data-column-container', 'true');
    }

    setValue(path, value) {
        if (value) {
            // Handle setting value recursively
            this.columns = Array.isArray(value)
                ? value.map(column => {
                      // Ensure column has a proper ID first
                      if (!column.id) {
                          column.id = wisk.editor.generateNewId(this.id);
                      }

                      // If column already has elements array, ensure IDs follow proper nesting
                      if (column.elements) {
                          // Make sure each element ID is properly namespaced under the column ID
                          column.elements = column.elements.map(element => {
                              // Check if the element ID doesn't already have the column ID as prefix
                              if (!element.id.startsWith(column.id + '-')) {
                                  // Generate a new ID with the proper column prefix
                                  element.id = wisk.editor.generateNewId(column.id);
                              }
                              return element;
                          });
                          return column;
                      }

                      // Otherwise, create a default elements array with proper IDs
                      return {
                          ...column,
                          elements: [
                              {
                                  id: wisk.editor.generateNewId(column.id),
                                  component: 'text-element',
                                  value: { textContent: 'New Column' },
                              },
                          ],
                      };
                  })
                : [];

            if (!Array.isArray(this.columns) || this.columns.length === 0) {
                this.initValue();
            }

            this.render();
        }
    }

    getValue() {
        console.log('getValue of column-element ------------');
        var c = [];
        this.columns.forEach(column => {
            const layoutElement = this.shadowRoot.getElementById(column.id);
            if (layoutElement) {
                const columnValue = layoutElement.getValue();

                // Ensure proper handling of the nested structure
                let elements = [];
                if (columnValue.elements) {
                    elements = columnValue.elements.map(element => {
                        // Ensure proper ID namespace
                        if (!element.id.startsWith(column.id + '-')) {
                            console.warn(`Fixed ID namespace for element: ${element.id} -> ${column.id}-${element.id}`);
                            element.id = wisk.editor.generateNewId(column.id);
                        }
                        return element;
                    });
                }

                c.push({
                    id: column.id,
                    elements: elements,
                });
            } else {
                // Fallback if element doesn't exist yet
                c.push({
                    id: column.id,
                    elements: column.elements || [],
                });
            }
        });
        return c;
    }

    // Add this improved event listener setup for better update handling
    setupEventListeners() {
        this.shadowRoot.addEventListener('block-updated', e => {
            e.stopPropagation();

            // Force a value refresh when any block is updated
            this.sendUpdates();
        });

        this.shadowRoot.addEventListener('layout-updated', e => {
            e.stopPropagation();

            // Find which column was updated
            const columnIndex = this.columns.findIndex(col => col.id === e.detail.id);

            if (columnIndex >= 0) {
                // Update the column's elements with the latest data
                this.columns[columnIndex].elements = e.detail.elements;

                // Propagate update to parent
                this.sendUpdates();
            }
        });
    }

    sendUpdates() {
        setTimeout(() => {
            wisk.editor.justUpdates(this.id);
        }, 0);
    }

    // Improved method to find if an element belongs to a nested column
    findContainingColumn(elementId) {
        if (!elementId) return null;

        // Base case: direct check in our columns
        for (const column of this.columns) {
            if (elementId.startsWith(column.id + '-') || elementId === column.id) {
                return column.id;
            }
        }
        return null;
    }

    setupEditor() {
        this.editor = {
            elements: this.elements,
            readonly: false,
            createBlockBase: (elementId, blockType, value, remoteId, isRemote = false) => {
                const columnId = this.findContainingColumn(elementId);
                if (columnId) {
                    const columnElement = this.shadowRoot.getElementById(columnId);
                    if (columnElement) {
                        return columnElement.editor.createBlockBase(elementId, blockType, value, remoteId, isRemote);
                    }
                }
            },
            createNewBlock: (elementId, blockType, value, focusIdentifier, rec, animate) => {
                const columnId = this.findContainingColumn(elementId);
                if (columnId) {
                    const columnElement = this.shadowRoot.getElementById(columnId);
                    if (columnElement) {
                        return columnElement.editor.createNewBlock(elementId, blockType, value, focusIdentifier, rec, animate);
                    }
                }
            },
            createBlockNoFocus: (elementId, blockType, value, rec, animate) => {
                const columnId = this.findContainingColumn(elementId);
                if (columnId) {
                    const columnElement = this.shadowRoot.getElementById(columnId);
                    if (columnElement) {
                        return columnElement.editor.createBlockNoFocus(elementId, blockType, value, rec, animate);
                    }
                }
            },
            changeBlockType: (elementId, value, newBlockType, rec) => {
                const columnId = this.findContainingColumn(elementId);
                if (columnId) {
                    const columnElement = this.shadowRoot.getElementById(columnId);
                    if (columnElement) {
                        return columnElement.editor.changeBlockType(elementId, value, newBlockType, rec);
                    }
                }
            },
            deleteBlock: (elementId, rec) => {
                const columnId = this.findContainingColumn(elementId);
                if (columnId) {
                    const columnElement = this.shadowRoot.getElementById(columnId);
                    if (columnElement) {
                        return columnElement.editor.deleteBlock(elementId, rec);
                    }
                }
            },
            updateBlock: (elementId, path, newValue, rec) => {
                const columnId = this.findContainingColumn(elementId);
                if (columnId) {
                    const columnElement = this.shadowRoot.getElementById(columnId);
                    if (columnElement) {
                        return columnElement.editor.updateBlock(elementId, path, newValue, rec);
                    }
                }
            },
            focusBlock: (elementId, identifier) => {
                const columnId = this.findContainingColumn(elementId);
                if (columnId) {
                    const columnElement = this.shadowRoot.getElementById(columnId);
                    if (columnElement) {
                        return columnElement.editor.focusBlock(elementId, identifier);
                    }
                }
            },
            getElement: elementId => {
                const columnId = this.findContainingColumn(elementId);
                if (columnId) {
                    const columnElement = this.shadowRoot.getElementById(columnId);
                    if (columnElement) {
                        return columnElement.editor.getElement(elementId);
                    }
                }
                return null;
            },
            prevElement: elementId => {
                const columnId = this.findContainingColumn(elementId);
                if (columnId) {
                    const columnElement = this.shadowRoot.getElementById(columnId);
                    if (columnElement) {
                        return columnElement.editor.prevElement(elementId);
                    }
                }
                return null;
            },
            nextElement: elementId => {
                const columnId = this.findContainingColumn(elementId);
                if (columnId) {
                    const columnElement = this.shadowRoot.getElementById(columnId);
                    if (columnElement) {
                        return columnElement.editor.nextElement(elementId);
                    }
                }
                return null;
            },
            justUpdates: async elementId => {
                const columnId = this.findContainingColumn(elementId);
                if (columnId) {
                    const columnElement = this.shadowRoot.getElementById(columnId);
                    if (columnElement) {
                        await columnElement.editor.justUpdates(elementId);
                    }
                }
                // Ensure changes propagate up to the parent
                this.sendUpdates();
            },
        };
    }

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
        const columnId = this.findContainingColumn(elementId);
        if (columnId) {
            const columnElement = this.shadowRoot.getElementById(columnId);
            if (columnElement) {
                return columnElement.whenPlusClicked(elementId);
            }
        }

        this.editor.createNewBlock(elementId, 'text-element', { textContent: '' }, { x: 0 });
        const nextElement = this.editor.nextElement(elementId);
        if (nextElement) {
            wisk.editor.showSelector(nextElement.id, { x: 0 });
        }
    }

    whenTrashClicked(elementId) {
        const columnId = this.findContainingColumn(elementId);
        if (columnId) {
            const columnElement = this.shadowRoot.getElementById(columnId);
            if (columnElement) {
                return columnElement.whenTrashClicked(elementId);
            }
        }

        this.editor.deleteBlock(elementId);
    }

    deleteColumn(index) {
        // Only allow deletion if we have more than one column
        if (this.columns.length > 1) {
            this.columns.splice(index, 1);
            this.sendUpdates();
            this.render();
        }
    }

    render() {
        var style = `
            <style>
                .columns {
                    display: flex;
                    gap: var(--gap-1);
                    border-radius: var(--radius);
                }
                .column {
                    flex: 1;
                    border-radius: var(--radius);
                    border: 1px solid transparent;
                    position: relative;
                }
                .column:hover {
                    border: 1px solid var(--bg-3);
                }
                .plus-btn {
                    padding: 0;
                    border: none;
                    outline: none;
                    background: transparent;
                    border-radius: var(--radius);
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
                .delete-column-btn {
                    position: absolute;
                    top: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: var(--bg-3);
                    cursor: pointer;
                    display: none;
                    z-index: 10;
                    box-sizing: border-box;
                    white-space: pre;
                    padding: var(--padding-w1);
                    font-size: 12px;
                    border-radius: var(--radius);
                }
                .delete-column-btn img {
                    height: 14px;
                    margin-left: 5px;
                    filter: var(--themed-svg);
                }
                .column:hover .delete-column-btn {
                    display: flex;
                }
            </style>
        `;

        var content = `
            <div class="columns">
                ${this.columns
                    .map((column, index) => {
                        var id = column.id;
                        return `
                            <div class="column" data-column-index="${index}">
                                ${this.editor.readonly ? '' : `<div class="delete-column-btn" data-index="${index}">Delete<img src="/a7/forget/trash-mini.svg" alt="Delete column"/></div>`}
                                <base-layout-element id="${id}" data-column-parent="${this.id}"></base-layout-element>
                            </div>`;
                    })
                    .join('')}
                <button class="plus-btn"> <img src="/a7/forget/plus.svg"/> </button>
            </div>
        `;
        this.shadowRoot.innerHTML = style + content;

        // Add new column button event
        this.shadowRoot.querySelector('.plus-btn').addEventListener('click', () => {
            var id = wisk.editor.generateNewId(this.id);
            this.columns.push({
                id: id,
                elements: [
                    {
                        id: wisk.editor.generateNewId(id), // Proper ID nesting!
                        component: 'text-element',
                        value: { textContent: 'New Column' },
                    },
                ],
            });

            this.sendUpdates();
            this.render();
        });

        // Add event listeners for delete buttons
        if (!this.editor.readonly) {
            const deleteButtons = this.shadowRoot.querySelectorAll('.delete-column-btn');
            deleteButtons.forEach(button => {
                button.addEventListener('click', e => {
                    e.stopPropagation(); // Prevent event bubbling
                    const index = parseInt(button.getAttribute('data-index'));
                    this.deleteColumn(index);
                });
            });
        }

        // Set values to base layout elements
        for (let i = 0; i < this.columns.length; i++) {
            const layoutElement = this.shadowRoot.querySelector(`#${this.columns[i].id}`);
            if (layoutElement) {
                // First ensure all element IDs in the column use the column ID as namespace
                if (this.columns[i].elements) {
                    this.columns[i].elements = this.columns[i].elements.map(element => {
                        // If element doesn't have column ID as prefix, fix it
                        if (!element.id.startsWith(this.columns[i].id + '-')) {
                            console.warn(
                                `Fixed ID namespace for element: ${element.id} -> ${this.columns[i].id}-${Math.random().toString(36).substring(2, 9)}`
                            );
                            element.id = wisk.editor.generateNewId(this.columns[i].id);
                        }
                        return element;
                    });
                }

                layoutElement.setValue('', this.columns[i]);

                // Add data attributes to help with traversal
                layoutElement.setAttribute('data-column-index', i);
                layoutElement.setAttribute('data-parent-column', this.id);
            }
        }

        // Setup event listeners for updates from child layouts
        this.setupEventListeners();
    }

    // Method to get text content for all columns
    getTextContent() {
        return {
            text: this.columns
                .map(column => {
                    const layoutElement = this.shadowRoot.getElementById(column.id);
                    return layoutElement ? layoutElement.getTextContent().text : '';
                })
                .filter(text => text.trim() !== '')
                .join('\n\n'),
        };
    }
}

customElements.define('columns-element', ColumnsElement);
