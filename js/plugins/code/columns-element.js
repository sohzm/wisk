class ColumnsElement extends HTMLElement {
    constructor() {
        super();
        this.columns = [];
        this.editor = null;
        this.dragState = null;
        this.dropIndicator = null;
        this.dragHoldTimer = null;
        this.resizeState = null;
        this.attachShadow({ mode: 'open' });
        this.setupEditor();
    }

    initValue() {
        var id1 = wisk.editor.generateNewId(this.id);
        var id2 = wisk.editor.generateNewId(this.id);

        this.columns = [
            {
                id: id1,
                width: 50,
                elements: [
                    {
                        id: wisk.editor.generateNewId(id1), // This ensures proper nesting of IDs
                        component: 'text-element',
                        value: { textContent: 'Edit me' },
                    },
                ],
            },
            {
                id: id2,
                width: 50,
                elements: [
                    {
                        id: wisk.editor.generateNewId(id2), // This ensures proper nesting of IDs
                        component: 'text-element',
                        value: { textContent: 'Edit me' },
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
                ? value.map((column, idx, arr) => {
                      // Ensure column has a proper ID first
                      if (!column.id) {
                          column.id = wisk.editor.generateNewId(this.id);
                      }

                      // Ensure column has a width, default to equal distribution
                      if (column.width == null) {
                          column.width = 100 / arr.length;
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
                          width: column.width,
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
                    width: column.width || null,
                    elements: elements,
                });
            } else {
                // Fallback if element doesn't exist yet
                c.push({
                    id: column.id,
                    width: column.width || null,
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
                console.log('ColumnsElement.editor.changeBlockType', elementId, newBlockType);
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

    async aboutToBeOoomfed() {
        for (const column of this.columns) {
            const layoutElement = this.shadowRoot.getElementById(column.id);
            if (layoutElement) {
                await layoutElement.aboutToBeOoomfed();
            }
        }
    }

    // whenTrashClicked(elementId) {
    //     const columnId = this.findContainingColumn(elementId);
    //     if (columnId) {
    //         const columnElement = this.shadowRoot.getElementById(columnId);
    //         if (columnElement) {
    //             return columnElement.whenTrashClicked(elementId);
    //         }
    //     }

    //     this.editor.deleteBlock(elementId);
    // }

    deleteColumn(index) {
        // Only allow deletion if we have more than one column
        if (this.columns.length > 1) {
            const deletedWidth = this.columns[index].width || 100 / this.columns.length;
            this.columns.splice(index, 1);

            // Redistribute the deleted column's width proportionally
            const totalRemainingWidth = this.columns.reduce((sum, col) => sum + (col.width || 0), 0);
            if (totalRemainingWidth > 0) {
                this.columns.forEach(col => {
                    const proportion = (col.width || 0) / totalRemainingWidth;
                    col.width = (col.width || 0) + deletedWidth * proportion;
                });
            }

            this.sendUpdates();
            this.render();
        }
    }

    createMenuItem(label, onClick, itemClass = '', icon = null) {
        const item = document.createElement('div');
        item.className = `context-menuItem ${itemClass}`;
        if (icon) {
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

        item.addEventListener('click', e => {
            e.stopPropagation();
            onClick();
            this.closeMenu();
        });
        return item;
    }

    closeMenu() {
        const existingMenu = this.shadowRoot.querySelector('.context-menu');
        if (existingMenu && existingMenu.parentNode) existingMenu.remove();
        if (this._menuCleanup) {
            const { scrollerEl, onScroll, onClickOutside, onResize } = this._menuCleanup;
            scrollerEl?.removeEventListener?.('scroll', onScroll);
            window.removeEventListener('click', onClickOutside, true);
            window.removeEventListener('resize', onResize);
            this._menuCleanup = null;
        }
    }

    whenSelectClicked(btn, index) {
        const column = this.columns[index];
        // Show options for the column - duplicate and delete
        // Close any existing menu
        const existingMenu = this.shadowRoot.querySelector('.context-menu');
        if (existingMenu) existingMenu.remove();

        // Build menu
        const contextMenu = document.createElement('div');
        contextMenu.classList.add('context-menu');

        // Mandatory Items
        contextMenu.appendChild(
            this.createMenuItem(
                'Duplicate column',
                () => {
                    if (!column) return;
                    const newColId = wisk.editor.generateNewId(this.id);

                    // Calculate width for duplicate
                    const sourceWidth = column.width || 100 / this.columns.length;
                    const newWidth = sourceWidth / 2;

                    // Update source column width
                    column.width = newWidth;

                    const cloned = {
                        id: newColId,
                        width: newWidth,
                        elements: (column.elements || []).map(el => ({
                            id: wisk.editor.generateNewId(newColId),
                            component: el.component,
                            value: JSON.parse(JSON.stringify(el.value || {})),
                        })),
                    };
                    this.columns.splice(index + 1, 0, cloned);
                    this.sendUpdates();
                    this.render();
                },
                'duplicate',
                '/a7/iconoir/copy.svg'
            )
        );

        contextMenu.appendChild(
            this.createMenuItem(
                'Delete column',
                () => {
                    this.deleteColumn(index);
                },
                'delete',
                '/a7/forget/trash.svg'
            )
        );

        this.shadowRoot.appendChild(contextMenu);

        const rect = btn.getBoundingClientRect();
        const GAP = 10;
        const MARGIN = 8;

        contextMenu.style.visibility = 'hidden';
        contextMenu.style.display = 'inline-block';
        contextMenu.style.top = '0px';
        contextMenu.style.left = '0px';

        requestAnimationFrame(() => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const { top: t, bottom: b, left: l, right: r } = rect;
            const { width: mw, height: mh } = contextMenu.getBoundingClientRect();

            let left = r + GAP;
            let top = (t + b) / 2 - mh / 2;
            contextMenu.style.transformOrigin = 'center left';

            if (left + mw > vw - MARGIN) {
                left = l - GAP - mw;
                contextMenu.style.transformOrigin = 'center right';
            }
            top = Math.max(MARGIN, Math.min(top, vh - MARGIN - mh));

            contextMenu.style.left = `${Math.max(MARGIN, Math.min(left, vw - MARGIN - mw))}px`;
            contextMenu.style.top = `${top}px`;
            contextMenu.style.visibility = 'visible';
        });

        const scrollerEl = document.querySelector('.editor');
        const onScroll = () => this.closeMenu();
        const onResize = () => this.closeMenu();
        const onClickOutside = e => {
            const path = e.composedPath?.() || [];
            if (!path.includes(contextMenu) && !path.includes(btn)) {
                this.closeMenu();
            }
        };
        scrollerEl?.addEventListener?.('scroll', onScroll, { passive: true });
        window.addEventListener('click', onClickOutside, true);
        window.addEventListener('resize', onResize);
        this._menuCleanup = { scrollerEl, onScroll, onClickOutside, onResize };
    }

    createDropIndicator() {
        if (this.dropIndicator) return this.dropIndicator;
        this.dropIndicator = document.createElement('div');
        this.dropIndicator.className = 'drop-indicator';
        document.body.appendChild(this.dropIndicator);
        return this.dropIndicator;
    }

    showDropIndicator(targetElement) {
        const indicator = this.createDropIndicator();
        if (!targetElement) {
            indicator.classList.remove('show');
            indicator.classList.add('hide');
            return;
        }

        const rect = targetElement.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(targetElement);
        const paddingLeft = parseFloat(computedStyle.paddingLeft);
        const paddingRight = parseFloat(computedStyle.paddingRight);

        indicator.style.width = rect.width - paddingLeft - paddingRight + 'px';
        indicator.style.left = rect.left + paddingLeft + 'px';
        indicator.style.top = rect.bottom + 1 + 'px';

        indicator.classList.remove('hide');
        indicator.classList.add('show');
    }

    hideDropIndicator() {
        if (!this.dropIndicator) return;
        this.dropIndicator.classList.remove('show');
        this.dropIndicator.classList.add('hide');
    }

    getElementAbove(x, y) {
        // get the column
        const clone = document.querySelector('.clone');
        if (clone) clone.style.display = 'none';
        const table = this.shadowRoot.querySelector('.columns');
        const target = this.shadowRoot.elementFromPoint(x, y);
        if (clone) clone.style.display = 'block';
        if (table.contains(target)) return target;
        return null;
    }

    onDragStart(event, index) {
        const column = this.columns[index];
        event.preventDefault();
        event.stopPropagation();
        const original = this.shadowRoot.getElementById(column.id);
        const block = column;
        if (!original) return;
        const clone = document.createElement('div');
        clone.className = 'clone';
        clone.style.position = 'fixed';
        clone.style.height = original.getBoundingClientRect().height + 'px';
        clone.style.width = original.getBoundingClientRect().width + 'px';
        document.body.appendChild(clone);

        this.dragState = {
            elementId: column.id,
            original: original,
            clone: clone,
            originalValue: JSON.parse(JSON.stringify(original.getValue())),
            originalComponent: block.component,
        };

        this.boundHandleDrag = this.handleDrag.bind(this);
        this.boundHandleDrop = this.handleDrop.bind(this);

        window.addEventListener('mousemove', this.boundHandleDrag);
        window.addEventListener('mouseup', this.boundHandleDrop);
    }

    handleDrag(e) {
        if (!this.dragState) return;

        const { clone } = this.dragState;
        clone.style.left = e.clientX + 'px';
        clone.style.top = e.clientY + 'px';

        const targetColumn = this.getElementAbove(e.clientX, e.clientY);
        const targetContainer = targetColumn ? targetColumn.closest('.column') : null;
        if (targetContainer) {
            this.showDropIndicator(targetContainer);
        } else {
            this.hideDropIndicator();
        }
    }

    handleDrop(e) {
        if (!this.dragState) return;
        this.hideDropIndicator();

        const { elementId, clone } = this.dragState;

        document.body.removeChild(clone);
        window.removeEventListener('mousemove', this.boundHandleDrag);
        window.removeEventListener('mouseup', this.boundHandleDrop);

        const targetElement = this.getElementAbove(e.clientX, e.clientY);

        if (targetElement) {
            const targetColumn = targetElement.closest('.column');
            if (targetColumn) {
                const targetColumnIndex = parseInt(targetColumn.getAttribute('data-column-index'));
                const sourceColumnIndex = this.columns.findIndex(col => col.id === elementId);
                if (sourceColumnIndex !== -1 && targetColumnIndex !== -1 && sourceColumnIndex !== targetColumnIndex) {
                    const [draggedColumn] = this.columns.splice(sourceColumnIndex, 1);
                    this.columns.splice(targetColumnIndex, 0, draggedColumn);
                    this.sendUpdates();
                    this.render();
                }
            }
        }
        this.dragState = null;
    }

    onResizeStart(event, index) {
        event.preventDefault();
        event.stopPropagation();

        const columnsContainer = this.shadowRoot.querySelector('.columns');
        const containerWidth = columnsContainer.offsetWidth;

        this.resizeState = {
            index: index,
            startX: event.clientX,
            containerWidth: containerWidth,
            startWidths: this.columns.map(col => col.width || 100 / this.columns.length),
        };

        this.boundHandleResize = this.handleResize.bind(this);
        this.boundHandleResizeEnd = this.handleResizeEnd.bind(this);

        window.addEventListener('mousemove', this.boundHandleResize);
        window.addEventListener('mouseup', this.boundHandleResizeEnd);

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }

    handleResize(e) {
        if (!this.resizeState) return;

        const { index, startX, containerWidth, startWidths } = this.resizeState;
        const deltaX = e.clientX - startX;
        const deltaPercent = (deltaX / containerWidth) * 100;

        // Calculate new widths
        const newWidths = [...startWidths];
        newWidths[index] = Math.max(10, startWidths[index] + deltaPercent);
        newWidths[index + 1] = Math.max(10, startWidths[index + 1] - deltaPercent);

        // Apply widths immediately for smooth resizing
        this.columns[index].width = newWidths[index];
        this.columns[index + 1].width = newWidths[index + 1];

        // Update the DOM directly for smooth dragging
        const column1 = this.shadowRoot.querySelector(`.column[data-column-index="${index}"]`);
        const column2 = this.shadowRoot.querySelector(`.column[data-column-index="${index + 1}"]`);

        if (column1 && column2) {
            column1.style.flex = `0 0 ${newWidths[index]}%`;
            column2.style.flex = `0 0 ${newWidths[index + 1]}%`;
        }
    }

    handleResizeEnd(e) {
        if (!this.resizeState) return;

        window.removeEventListener('mousemove', this.boundHandleResize);
        window.removeEventListener('mouseup', this.boundHandleResizeEnd);

        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        this.resizeState = null;
        this.sendUpdates();
    }

    render() {
        var style = `
            <style>
                .columns {
                    display: flex;
                    border-radius: var(--radius);
                    position: relative;
                }
                .column {
                    border-radius: var(--radius);
                    border: 1px solid transparent;
                    position: relative;
                    min-width: 10%;
                }
                .column:not(:last-child) {
                    margin-right: var(--gap-1);
                }
                .column:hover {
                    border: 1px solid var(--bg-3);
                }
                .resize-handle {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    right: calc(var(--gap-1) / -2);
                    width: 10px;
                    background: transparent;
                    cursor: col-resize;
                    z-index: 10;
                }
                .resize-handle:hover {
                    background: var(--fg-accent);
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
                .column-options-btn {
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
                .column-options-btn img {
                    height: 14px;
                    filter: var(--themed-svg);
                }
                .column:hover .column-options-btn {
                    display: flex;
                }
                .context-menu {
                    position: fixed;
                    width: 200px;
                    background: var(--bg-1);
                    border: 1px solid var(--bg-3);
                    border-radius: calc(var(--radius) * 2);
                    padding: var(--padding-2);
                    z-index: 1000;
                    transform-origin: top right;
                    animation: contextMenuPop 120ms cubic-bezier(0.2, 0.9, 0.35, 1) forwards;
                    visibility: hidden;
                }
                @keyframes contextMenuPop {
                    from {
                        opacity: 0;
                        transform: translateY(-4px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
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
            </style>
        `;

        // Ensure all columns have widths, default to equal distribution
        const hasWidths = this.columns.every(col => col.width != null);
        if (!hasWidths) {
            const defaultWidth = 100 / this.columns.length;
            this.columns.forEach(col => {
                if (col.width == null) col.width = defaultWidth;
            });
        }

        var content = `
            <div class="columns">
                ${this.columns
                    .map((column, index) => {
                        var id = column.id;
                        const width = column.width || 100 / this.columns.length;
                        const isLastColumn = index === this.columns.length - 1;
                        return `
                            <div class="column" data-column-index="${index}" style="flex: 0 0 ${width}%;">
                                ${this.editor.readonly ? '' : `<div class="column-options-btn" data-index="${index}"><img src="/a7/forget/dots-grid3x3.svg" alt="Context Menu" draggable="false"/></div>`}
                                <base-layout-element id="${id}" data-column-parent="${this.id}"></base-layout-element>
                                ${!this.editor.readonly && !isLastColumn ? `<div class="resize-handle" data-resize-index="${index}"></div>` : ''}
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

            // Calculate width: redistribute to maintain proportions
            const newWidth = 100 / (this.columns.length + 1);
            const scaleFactor = (100 - newWidth) / 100;

            // Scale existing columns
            this.columns.forEach(col => {
                col.width = (col.width || 100 / this.columns.length) * scaleFactor;
            });

            this.columns.push({
                id: id,
                width: newWidth,
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

        // Event listeners for options button
        const optionButtons = this.shadowRoot.querySelectorAll('.column-options-btn');
        optionButtons.forEach(button => {
            button.addEventListener('click', e => {
                e.stopPropagation();
                const index = parseInt(button.getAttribute('data-index'));
                this.whenSelectClicked(button, index);
            });
            button.addEventListener('mousedown', event => {
                this.dragHoldTimer = setTimeout(() => {
                    const index = parseInt(button.getAttribute('data-index'));
                    this.onDragStart(event, index);
                }, 150);
            });
            button.addEventListener('mouseup', () => {
                clearTimeout(this.dragHoldTimer);
            });
            button.addEventListener('mouseleave', () => {
                clearTimeout(this.dragHoldTimer);
            });
        });

        // Event listeners for resize handles
        const resizeHandles = this.shadowRoot.querySelectorAll('.resize-handle');
        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', event => {
                const index = parseInt(handle.getAttribute('data-resize-index'));
                this.onResizeStart(event, index);
            });
        });

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
