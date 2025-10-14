var debounceTimer;
var deletedElements = [];
var elementUpdatesLeft = [];
var deletedElementsLeft = [];
var configChanges = [];

wisk.editor.syncBuffer = {
    config: [],
    newElements: [],
    deletedElements: [],
    updatedElements: [],
};

var elementSyncTimer = 0;
// drag n drop vars
let dragState = null;
let dropIndicator = null;
let dragHoldTimer = null;
// scroll vars
let autoScroll = null;
const SCROLL_ZONE_SIZE = 40;
const SCROLL_SPEED = 10;
const SCROLL_INTERVAL = 16;
// rectangle selection vars
let rectangleSelectionState = null;
let selectionRectangle = null;
let selectedElements = new Set();
let selectionOverlays = new Map();
let selectionUpdateScheduled = false;
// clipboard for custom elements
let elementClipboard = [];

const createHoverImageContainer = elementId => {
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('hover-images');

    const addButton = createHoverButton('/a7/forget/plus-hover.svg', () => whenPlusClicked(elementId));
    const selectButton = createHoverButton('/a7/forget/dots-grid3x3.svg', () => whenSelectClicked(elementId));

    selectButton.addEventListener('mousedown', event => {
        dragHoldTimer = setTimeout(() => {
            onDragStart(event, elementId);
        }, 150);
    });

    selectButton.addEventListener('mouseup', () => {
        clearTimeout(dragHoldTimer);
    });

    selectButton.addEventListener('mouseleave', () => {
        clearTimeout(dragHoldTimer);
    });

    selectButton.addEventListener('touchstart', event => {
        dragHoldTimer = setTimeout(() => onDragStart(event, elementId), 150);
    });

    selectButton.addEventListener('touchend', () => clearTimeout(dragHoldTimer));

    selectButton.addEventListener('touchcancel', () => clearTimeout(dragHoldTimer));

    imageContainer.appendChild(addButton);
    imageContainer.appendChild(selectButton);

    return imageContainer;
};

const createHoverButton = (src, clickHandler) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Hover image';
    img.classList.add('hover-image', 'plugin-icon');
    img.draggable = false;
    img.addEventListener('click', clickHandler);
    return img;
};

const createFullWidthWrapper = (elementId, block, imageContainer) => {
    const wrapper = document.createElement('div');
    wrapper.id = `full-width-wrapper-${elementId}`;
    wrapper.classList.add('full-width-wrapper');
    wrapper.appendChild(block);

    if (!wisk.editor.readonly) {
        wrapper.appendChild(imageContainer);
    }
    return wrapper;
};

const createBlockContainer = (elementId, blockType) => {
    const container = document.createElement('div');
    container.id = `div-${elementId}`;
    container.classList.add('rndr');

    if (wisk.plugins.getPluginDetail(blockType).width === 'max') {
        container.classList.add('rndr-full-width');
    }

    return container;
};

const createBlockElement = (elementId, blockType) => {
    const block = document.createElement(blockType);
    block.id = elementId;
    return block;
};

// Editor core functions
wisk.editor.generateNewId = id => {
    var rand = [...Array(7)].map(() => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 52)]).join('');
    if (id) {
        return `${id}-${rand}`;
    }
    return rand;
};

wisk.editor.addConfigChange = async function (id, value) {
    switch (id) {
        case 'document.config.name':
            wisk.editor.document.data.config.name = value;
            document.title = value;
            break;
        case 'document.config.theme':
            wisk.editor.document.data.config.theme = value;
            wisk.theme.setTheme(value);
            break;
        case 'document.config.plugins.add':
            wisk.editor.document.data.config.plugins.push(value);
            wisk.plugins.loadPlugin(value);
            break;
        case 'document.config.plugins.remove':
            wisk.editor.document.data.config.plugins = wisk.editor.document.data.config.plugins.filter(p => p !== value);
            break;
    }

    await wisk.sync.saveUpdates();
};

wisk.editor.savePluginData = async function (identifier, data) {
    wisk.editor.document.data.pluginData[identifier] = data;
    await wisk.sync.saveUpdates();
};

wisk.editor.getPluginData = function (identifier) {
    return wisk.editor.document.data.pluginData[identifier] || null;
};

wisk.editor.createBlockBase = function (elementId, blockType, value, remoteId, isRemote = false) {
    if (elementId === '') {
        elementId =
            wisk.editor.document.data.elements.length > 1
                ? wisk.editor.document.data.elements[wisk.editor.document.data.elements.length - 1].id
                : wisk.editor.document.data.elements[0].id;
    }

    if (elementId.includes('-')) {
        eid = elementId.split('-')[0];
        document.getElementById(eid).editor.createBlockBase(elementId, blockType, value, remoteId, isRemote);
        return;
    }

    const id = isRemote ? remoteId : wisk.editor.generateNewId();
    const obj = { value, id, component: blockType };

    const prevElement = document.getElementById(`div-${elementId}`);
    const blockElement = createBlockElement(id, blockType);

    const imageContainer = createHoverImageContainer(id);

    const fullWidthWrapper = createFullWidthWrapper(id, blockElement, imageContainer);
    const container = createBlockContainer(id, blockType);

    container.appendChild(fullWidthWrapper);
    document.getElementById('editor').insertBefore(container, prevElement.nextSibling);

    const elementIndex = wisk.editor.document.data.elements.findIndex(e => e.id === elementId);
    wisk.editor.document.data.elements.splice(elementIndex + 1, 0, obj);

    // TODO quick fix? idk if this is the best way to do it
    if (blockType === 'divider-element' || blockType === 'super-divider' || blockType === 'dots-divider') {
        wisk.editor.createNewBlock(id, 'text-element', { textContent: '' }, { x: 0 });
    }

    return { id, blockElement };
};

wisk.editor.createRemoteBlock = function (elementId, blockType, value, remoteId) {
    if (elementId.includes('-')) {
        eid = elementId.split('-')[0];
        document.getElementById(eid).editor.createRemoteBlock(elementId, blockType, value, remoteId);
        return;
    }

    const { id, blockElement } = this.createBlockBase(elementId, blockType, value, remoteId, true);

    setTimeout(() => {
        wisk.editor.updateBlock(id, '', value, 'uwu');
    }, 0);
};

wisk.editor.createNewBlock = function (elementId, blockType, value, focusIdentifier, rec, animate) {
    if (elementId.includes('-')) {
        eid = elementId.split('-')[0];
        document.getElementById(eid).editor.createNewBlock(elementId, blockType, value, focusIdentifier, rec, animate);
        return;
    }

    const { id, blockElement } = this.createBlockBase(elementId, blockType, value, null, false);

    setTimeout(() => {
        if (animate) {
            document.getElementById(id).setTextContent({ text: value.textContent });
        } else {
            wisk.editor.updateBlock(id, '', value, rec);
            wisk.editor.focusBlock(id, focusIdentifier);
        }
    }, 0);
    return id;
};

wisk.editor.createBlockNoFocus = function (elementId, blockType, value, rec, animate) {
    if (elementId.includes('-')) {
        eid = elementId.split('-')[0];
        document.getElementById(eid).editor.createBlockNoFocus(elementId, blockType, value, rec, animate);
        return;
    }

    const { id, blockElement } = this.createBlockBase(elementId, blockType, value, null, false);

    setTimeout(() => {
        if (animate) {
            document.getElementById(id).setTextContent({ text: value.textContent });
        } else {
            wisk.editor.updateBlock(id, '', value, rec);
        }
    }, 0);

    return id;
};

wisk.editor.handleChanges = async function (updateObject) {
    if (!updateObject) return;

    const changes = Array.isArray(updateObject.changes) ? updateObject.changes : updateObject.changes ? [updateObject.changes] : [];

    const allElements = updateObject.allElements || [];
    const newDeletedElements = updateObject.newDeletedElements || [];

    await handleElementDeletions(newDeletedElements);

    for (const change of changes) {
        if (change.path === 'document.elements') {
            await handleElementChange(change.values, allElements);
        }
        if (change.path.startsWith('document.config.access')) {
            if (change.path.includes('public')) {
                wisk.editor.document.data.config.public = change.values.public;
            }
            if (change.path.includes('add')) {
                wisk.editor.document.data.config.access.push(change.values.email);
            }
            if (change.path.includes('remove')) {
                wisk.editor.document.data.config.access = wisk.editor.document.data.config.access.filter(a => a !== change.values.email);
            }
        }
        if (change.path.startsWith('document.config.plugins')) {
            if (change.path.includes('add')) {
                wisk.plugins.loadPlugin(change.values.plugin);
            }
            if (change.path.includes('remove')) {
                window.location.reload();
            }
        }
        if (change.path.startsWith('document.config.theme')) {
            wisk.theme.setTheme(change.values.theme);
        }
        if (change.path.startsWith('document.plugin')) {
            if (change.values.data) {
                document.getElementById(change.path.replace('document.plugin.', '')).loadData(change.values.data);
            }
        }
    }

    // Handle reordering only if necessary
    if (allElements.length > 0) {
        smartReorderElements(allElements);
    }
};

const handleElementChange = async (updatedElement, allElements) => {
    if (!updatedElement) return;

    const existingElement = wisk.editor.document.data.elements.find(e => e.id === updatedElement.id);
    const domElement = document.getElementById(updatedElement.id);

    if (!existingElement || !domElement) {
        const currentIndex = allElements.indexOf(updatedElement.id);
        const prevElementId = currentIndex > 0 ? allElements[currentIndex - 1] : '';

        wisk.editor.createRemoteBlock(prevElementId, updatedElement.component, updatedElement.value, updatedElement.id);
    } else {
        updateExistingElement(existingElement, updatedElement, domElement, 'uwu');
    }
};

const updateExistingElement = (existingElement, updatedElement, domElement, rec) => {
    Object.assign(existingElement, {
        value: updatedElement.value,
        lastEdited: updatedElement.lastEdited,
        component: updatedElement.component,
    });

    if (domElement.tagName.toLowerCase() !== updatedElement.component) {
        const prevElement = wisk.editor.prevElement(updatedElement.id);
        if (prevElement) {
            wisk.editor.changeBlockType(updatedElement.id, updatedElement.value, updatedElement.component, rec);
        }
    } else {
        setTimeout(() => {
            domElement.setValue('', updatedElement.value);
        }, 0);
    }
};

const handleElementDeletions = async newDeletedElements => {
    if (!Array.isArray(newDeletedElements)) return;

    for (const deletedId of newDeletedElements) {
        if (!deletedElements.includes(deletedId)) {
            deletedElements.push(deletedId);
            const element = document.getElementById(`div-${deletedId}`);
            if (element) {
                document.getElementById('editor').removeChild(element);
                wisk.editor.document.data.elements = wisk.editor.document.data.elements.filter(e => e.id !== deletedId);
            }
        }
    }
};

const smartReorderElements = allElements => {
    if (!Array.isArray(allElements) || allElements.length === 0) return;

    const editorElement = document.getElementById('editor');
    if (!editorElement) return;

    // Get currently focused element if any
    const activeElement = document.activeElement;
    const focusedId = activeElement?.id;

    // Create a map of current positions
    const currentPositions = new Map();
    Array.from(editorElement.children).forEach((element, index) => {
        const id = element.id?.replace('div-', '');
        if (id) currentPositions.set(id, index);
    });

    // Calculate which elements need to move
    const elementsToMove = [];
    allElements.forEach((id, newIndex) => {
        const currentIndex = currentPositions.get(id);
        if (currentIndex !== undefined && currentIndex !== newIndex) {
            elementsToMove.push({ id, newIndex, currentIndex });
        }
    });

    // Move only the elements that are out of position
    elementsToMove.forEach(({ id, newIndex }) => {
        const element = document.getElementById(`div-${id}`);
        if (!element) return;

        const referenceElement = editorElement.children[newIndex];
        if (referenceElement) {
            editorElement.insertBefore(element, referenceElement);
        } else {
            editorElement.appendChild(element);
        }
    });

    // Restore focus if needed
    if (focusedId) {
        const elementToFocus = document.getElementById(focusedId);
        if (elementToFocus) {
            elementToFocus.focus();
        }
    }

    // Update the elements array order to match
    wisk.editor.document.data.elements.sort((a, b) => allElements.indexOf(a.id) - allElements.indexOf(b.id));
};

wisk.editor.moveBlock = function (elementId, afterElementId) {
    if (elementId.includes('-')) {
        eid = elementId.split('-')[0];
        document.getElementById(eid).editor.moveBlock(elementId, afterElementId);
        return;
    }

    // Find the element to move
    const elementIndex = wisk.editor.document.data.elements.findIndex(e => e.id === elementId);
    if (elementIndex === -1) return;

    const elementToMove = wisk.editor.document.data.elements[elementIndex];

    // Find the target position
    let targetIndex;
    if (afterElementId === '' || afterElementId === null) {
        // Move to beginning
        targetIndex = 0;
    } else {
        const afterIndex = wisk.editor.document.data.elements.findIndex(e => e.id === afterElementId);
        if (afterIndex === -1) return;
        targetIndex = afterIndex + 1;
    }

    // Remove element from current position
    wisk.editor.document.data.elements.splice(elementIndex, 1);

    // Adjust target index if needed (element was removed from before target)
    if (elementIndex < targetIndex) {
        targetIndex--;
    }

    // Insert element at new position
    wisk.editor.document.data.elements.splice(targetIndex, 0, elementToMove);

    // Update DOM order
    const elementDiv = document.getElementById(`div-${elementId}`);
    if (!elementDiv) return;

    const editorElement = document.getElementById('editor');
    if (targetIndex === 0) {
        // Move to beginning
        editorElement.insertBefore(elementDiv, editorElement.firstChild);
    } else {
        // Move after the target element
        const afterElementDiv = document.getElementById(`div-${afterElementId}`);
        if (afterElementDiv && afterElementDiv.nextSibling) {
            editorElement.insertBefore(elementDiv, afterElementDiv.nextSibling);
        } else if (afterElementDiv) {
            editorElement.appendChild(elementDiv);
        }
    }

    // Trigger sync updates
    wisk.editor.justUpdates();

    window.dispatchEvent(
        new CustomEvent('block-moved', {
            detail: {
                id: elementId,
                afterId: afterElementId,
                newIndex: targetIndex,
            },
        })
    );
};

wisk.editor.refreshEditor = function () {
    const editorElement = document.getElementById('editor');
    if (!editorElement) return;

    // Store current focus information
    const activeElement = document.activeElement;
    const focusedId = activeElement?.id;
    let focusOffset = 0;

    if (activeElement && typeof activeElement.getCaretPosition === 'function') {
        try {
            focusOffset = activeElement.getCaretPosition();
        } catch (e) {
            // Ignore errors getting caret position
        }
    }

    // Clear all current block elements from DOM
    const blockElements = editorElement.querySelectorAll('.rndr');
    blockElements.forEach(element => element.remove());

    // Recreate all elements from data array
    for (let i = 0; i < wisk.editor.document.data.elements.length; i++) {
        const element = wisk.editor.document.data.elements[i];

        const container = createBlockContainer(element.id, element.component);
        const block = createBlockElement(element.id, element.component);
        const imageContainer = createHoverImageContainer(element.id);

        const fullWidthWrapper = createFullWidthWrapper(element.id, block, imageContainer);
        container.appendChild(fullWidthWrapper);
        editorElement.appendChild(container);

        window.dispatchEvent(new CustomEvent('block-created', { detail: { id: element.id } }));

        // Set element value
        setTimeout(() => {
            const domElement = document.getElementById(element.id);
            if (domElement) {
                domElement.setValue('', element.value);
            }
        }, 0);
    }

    // Restore focus if possible
    if (focusedId) {
        setTimeout(() => {
            const elementToFocus = document.getElementById(focusedId);
            if (elementToFocus) {
                if (typeof elementToFocus.focus === 'function') {
                    elementToFocus.focus({ x: focusOffset });
                } else {
                    elementToFocus.focus();
                }
            }
        }, 10);
    }

    window.dispatchEvent(new CustomEvent('editor-refreshed'));
};

async function initEditor(doc) {
    // wait for a second before initializing the editor
    //
    console.log('INIT EDITOR', doc);
    wisk.editor.document = doc;
    document.title = doc.data.config.name;

    // Load plugins
    if (doc.data.config.plugins && !Array.isArray(doc.data.config.plugins)) {
        doc.data.config.plugins = [];
    }

    await Promise.all(
        doc.data.config.plugins.filter(plugin => !wisk.plugins.loadedPlugins.includes(plugin)).map(plugin => wisk.plugins.loadPlugin(plugin))
    );

    // once plugins are loaded we load the data of plugins using their identifiers
    // loop through all loadedPlugins and loop through their contents and load their dat.
    for (const plugin of wisk.plugins.loadedPlugins) {
        var tempPlugin = wisk.plugins.getPluginGroupDetail(plugin);
        for (const content of tempPlugin.contents) {
            // IMPT: auto plugins dont load before this usually
            if (content.identifier && doc.data.pluginData[content.identifier] && document.getElementById(content.identifier)) {
                document.getElementById(content.identifier)?.loadData?.(doc.data.pluginData[content.identifier]);
            }
        }
    }

    wisk.theme.setTheme(doc.data.config.theme);

    const page = doc.data;
    deletedElements = page.deletedElements;
    wisk.editor.document.data.elements = page.elements;

    if (!wisk.editor.readonly) {
        document.getElementById('last-space').addEventListener('click', handleEditorClick);
        initializeRectangleSelection();
    }

    await initializeElements();

    // Refresh editor to ensure proper order and state
    setTimeout(() => {
        wisk.editor.refreshEditor();
    }, 50);

    wisk.utils.hideLoading();
}

async function initializeElements() {
    if (wisk.editor.document.data.elements.length > 1) {
        document.getElementById('getting-started').style.display = 'none';
    }

    const firstElement = wisk.editor.document.data.elements[0];
    const container = createBlockContainer(firstElement.id, firstElement.component);
    const block = createBlockElement(firstElement.id, firstElement.component);
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('hover-images');

    const plusButton = createHoverButton('/a7/forget/plus-hover.svg', () => whenPlusClicked(firstElement.id));
    imageContainer.appendChild(plusButton);

    const fullWidthWrapper = createFullWidthWrapper(firstElement.id, block, imageContainer);
    container.appendChild(fullWidthWrapper);
    document.getElementById('editor').appendChild(container);

    window.dispatchEvent(new CustomEvent('block-created', { detail: { id: firstElement.id } }));

    setTimeout(() => {
        document.getElementById(firstElement.id).setValue('', firstElement.value);

        if (wisk.editor.template && wisk.editor.template !== '') {
            fetch('/js/templates/storage/' + wisk.editor.template + '.json')
                .then(response => response.json())
                .then(data => {
                    // set data
                    setTimeout(() => {
                        wisk.editor.useTemplate(data);
                    }, 0);
                });
        }

        if (wisk.editor.document.data.elements.length === 1) {
            wisk.editor.focusBlock(firstElement.id, {
                x: firstElement.value.textContent.length,
            });
            return;
        }

        initializeRemainingElements();
    }, 0);
}

async function initializeRemainingElements() {
    for (let i = 1; i < wisk.editor.document.data.elements.length; i++) {
        const element = wisk.editor.document.data.elements[i];

        const container = createBlockContainer(element.id, element.component);
        const block = createBlockElement(element.id, element.component);

        const imageContainer = createHoverImageContainer(element.id);

        const fullWidthWrapper = createFullWidthWrapper(element.id, block, imageContainer);
        container.appendChild(fullWidthWrapper);
        document.getElementById('editor').appendChild(container);

        window.dispatchEvent(new CustomEvent('block-created', { detail: { id: element.id } }));

        setTimeout(() => {
            console.log('SETTING VALUE', element.id, element.value);
            document.getElementById(element.id).setValue('', element.value);
        }, 0);
    }
}

wisk.editor.htmlToMarkdown = function (html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    function escapeBackslashes(text) {
        return text.replace(/\\/g, '\\\\');
    }

    function processNode(node) {
        if (node.nodeType === 3) {
            return escapeBackslashes(node.textContent);
        }

        let result = '';
        for (const child of node.childNodes) {
            result += processNode(child);
        }

        if (!result.trim() && !node.getAttribute('reference-id')) {
            return '';
        }

        switch (node.nodeName.toLowerCase()) {
            case 'cite-element':
                const referenceId = node.getAttribute('reference-id');
                return `--citation-element--${referenceId}--`;
            case 'a':
                if (node.classList?.contains('reference-number')) {
                    const refNum = result.replace(/[\[\]]/g, '');
                    return `[ref_${refNum}]`;
                }
                return `[${result}](${node.href})`;
            case 'b':
            case 'strong':
                return `**${result}**`;
            case 'i':
            case 'em':
                return `*${result}*`;
            case 'strike':
                return `~~${result}~~`;
            case 'u':
                return `__${result}__`;
            case 'span':
                const refSpan = node.querySelector('.reference-number');
                if (refSpan) {
                    const refNum = refSpan.textContent.replace(/[\[\]]/g, '');
                    return result.replace(refSpan.outerHTML, `[ref_${refNum}]`);
                }
                return result;
            default:
                return result;
        }
    }

    return processNode(temp).trim();
};

// Element Navigation/Management Functions
wisk.editor.getElement = function (elementId) {
    if (elementId.includes('-')) {
        eid = elementId.split('-')[0];
        return document.getElementById(eid).editor.getElement(elementId);
    }

    return wisk.editor.document.data.elements.find(e => e.id === elementId);
};

wisk.editor.prevElement = function (elementId) {
    if (elementId.includes('-')) {
        eid = elementId.split('-')[0];
        return document.getElementById(eid).editor.prevElement(elementId);
    }

    if (elementId === wisk.editor.document.data.elements[0].id) {
        return null;
    }
    const index = wisk.editor.document.data.elements.findIndex(e => e.id === elementId);
    return index > 0 ? wisk.editor.document.data.elements[index - 1] : null;
};

wisk.editor.nextElement = function (elementId) {
    if (elementId.includes('-')) {
        eid = elementId.split('-')[0];
        return document.getElementById(eid).editor.nextElement(elementId);
    }

    const index = wisk.editor.document.data.elements.findIndex(e => e.id === elementId);
    return index < wisk.editor.document.data.elements.length - 1 ? wisk.editor.document.data.elements[index + 1] : null;
};

wisk.editor.showSelector = function (elementId, focusIdentifier) {
    const selector = byQuery('selector-element');
    selector.show(elementId);
};

wisk.editor.deleteBlock = function (elementId, rec) {
    if (elementId === 'abcdxyz') {
        wisk.utils.showToast('Nah you cant do that.', 2000);
        return;
    }

    if (elementId.includes('-')) {
        eid = elementId.split('-')[0];
        document.getElementById(eid).editor.deleteBlock(elementId, rec);
        return;
    }

    deletedElements.push(elementId);
    const element = document.getElementById(`div-${elementId}`);
    if (element) {
        document.getElementById('editor').removeChild(element);
        wisk.editor.document.data.elements = wisk.editor.document.data.elements.filter(e => e.id !== elementId);
        deletedElementsLeft.push(elementId);

        window.dispatchEvent(new CustomEvent('block-deleted', { detail: { id: elementId } }));

        if (rec == undefined) {
            wisk.editor.justUpdates();
        }
    }
};

wisk.editor.focusBlock = function (elementId, identifier) {
    if (elementId.includes('-')) {
        eid = elementId.split('-')[0];
        document.getElementById(eid).editor.focusBlock(elementId, identifier);
        return;
    }

    const element = document.getElementById(elementId);
    if (element) {
        element.focus(identifier);
    }
};

wisk.editor.updateBlock = function (elementId, path, newValue, rec) {
    if (elementId.includes('-')) {
        eid = elementId.split('-')[0];
        document.getElementById(eid).editor.updateBlock(elementId, path, newValue, rec);
        return;
    }

    const element = document.getElementById(elementId);
    if (element) {
        element.setValue(path, newValue);

        window.dispatchEvent(new CustomEvent('block-updated', { detail: { id: elementId } }));

        if (rec === undefined) {
            this.justUpdates(elementId);
        }
    }
};

wisk.editor.changeBlockType = function (elementId, value, newType, rec) {
    if (elementId.includes('-')) {
        console.log('CHANGE BLOCK TYPE IN IFRAME', elementId, newType);
        eid = elementId.split('-')[0];
        document.getElementById(eid).editor.changeBlockType(elementId, value, newType, rec);
        return;
    }

    const prevElement = wisk.editor.prevElement(elementId);
    if (!prevElement) {
        return;
    }

    wisk.editor.deleteBlock(elementId, rec);
    wisk.editor.createNewBlock(prevElement.id, newType, value, { x: 0 }, rec);

    window.dispatchEvent(new CustomEvent('block-changed', { detail: { id: prevElement.id } }));
};

wisk.editor.runBlockFunction = function (elementId, functionName, arg) {
    if (elementId.includes('-')) {
        eid = elementId.split('-')[0];
        document.getElementById(eid).editor.runBlockFunction(elementId, functionName, arg);
        return;
    }

    const element = document.getElementById(elementId);
    if (element && typeof element[functionName] === 'function') {
        element[functionName](arg);
    }
};

wisk.editor.useTemplate = async function (template) {
    if (wisk.editor.document.data.elements.length > 1) {
        alert('You need to clear the current document before using a template.');
        return;
    }

    for (const plugin of template.plugins) {
        await wisk.plugins.loadPlugin(plugin);
        await wisk.editor.addConfigChange('document.config.plugins.add', plugin);
    }

    // delete all elements
    for (const element of wisk.editor.document.data.elements) {
        if (element.id !== 'abcdxyz') wisk.editor.deleteBlock(element.id);
    }

    for (const element of template.elements) {
        if (element.id === 'abcdxyz') {
            document.getElementById('abcdxyz').setValue('', element.value);
            document.getElementById('abcdxyz').sendUpdates();
        }
        if (element.id !== 'abcdxyz') {
            // Create DOM elements directly like in initializeRemainingElements
            const container = createBlockContainer(element.id, element.component);
            const block = createBlockElement(element.id, element.component);
            const imageContainer = createHoverImageContainer(element.id);

            const fullWidthWrapper = createFullWidthWrapper(element.id, block, imageContainer);
            container.appendChild(fullWidthWrapper);
            document.getElementById('editor').appendChild(container);

            window.dispatchEvent(new CustomEvent('block-created', { detail: { id: element.id } }));

            setTimeout(() => {
                document.getElementById(element.id).setValue('', element.value);
            }, 0);
        }
    }

    wisk.theme.setTheme(template.theme);
    wisk.editor.document.data.elements = template.elements;

    await wisk.editor.addConfigChange('document.config.theme', template.theme);

    wisk.editor.justUpdates();

    setTimeout(() => {
        const firstElement = wisk.editor.document.data.elements[0];
        wisk.editor.focusBlock(firstElement.id, { x: firstElement.value.textContent.length });
    }, 0);
};

wisk.editor.convertMarkdownToElements = function (markdown) {
    // Remove code block wrapping if present
    markdown = markdown.replace(/^```markdown\n([\s\S]*)\n```$/m, '$1');

    // Remove YAML frontmatter if present
    markdown = markdown.replace(/^---\n[\s\S]*?\n---\n/, '');
    // Initialize elements array with the main element
    const elements = [
        {
            id: 'abcdxyz',
            lastEdited: Math.floor(Date.now() / 1000),
            component: 'main-element',
            value: {
                textContent: '',
                emoji: '',
                backgroundUrl: '',
                bannerSize: 'small',
            },
        },
    ];

    // Split markdown into lines
    const lines = markdown.split('\n').filter(line => line.trim());
    let currentList = null;
    let listNumber = 1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextLine = lines[i + 1];
        let element = null;

        // Helper function to calculate indentation level
        function getIndentLevel(line) {
            const match = line.match(/^(\s*)/);
            const spaces = match ? match[1].length : 0;
            return Math.floor(spaces / 2); // 2 spaces = 1 indent level
        }

        // Helper function to get trimmed line content after list marker
        function getListContent(line, markerLength) {
            const match = line.match(/^(\s*)/);
            const indentSpaces = match ? match[1].length : 0;
            return line.slice(indentSpaces + markerLength);
        }

        // Reset list tracking when encountering non-list items
        if (!line.trim().startsWith('-') && !line.trim().startsWith('*') && !line.trim().startsWith('+') && !line.trim().match(/^\d+\./)) {
            currentList = null;
            listNumber = 1;
        }

        // Heading patterns (must start at beginning of line)
        if (line.startsWith('# ')) {
            element = createHeadingElement(line.slice(2), 'heading1-element');
        } else if (line.startsWith('## ')) {
            element = createHeadingElement(line.slice(3), 'heading2-element');
        } else if (line.startsWith('### ')) {
            element = createHeadingElement(line.slice(4), 'heading3-element');
        } else if (line.startsWith('#### ')) {
            element = createHeadingElement(line.slice(5), 'heading4-element');
        } else if (line.startsWith('##### ')) {
            element = createHeadingElement(line.slice(6), 'heading5-element');
        }
        // Code block (must start at beginning of line)
        else if (line.startsWith('```')) {
            const language = line.slice(3).trim();
            let codeContent = '';
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeContent += lines[i] + '\n';
                i++;
            }
            element = {
                id: wisk.editor.generateNewId(),
                lastEdited: Math.floor(Date.now() / 1000),
                component: 'code-element',
                value: {
                    textContent: codeContent.trim(),
                    language: language || 'plain',
                },
            };
        }
        // Blockquote (must start at beginning of line)
        else if (line.startsWith('> ')) {
            element = {
                id: wisk.editor.generateNewId(),
                lastEdited: Math.floor(Date.now() / 1000),
                component: 'quote-element',
                value: {
                    textContent: convertInlineMarkdown(line.slice(2)),
                },
            };
        }
        // Checkbox list (can be indented) - must be specifically "- [" pattern
        else if (line.match(/^\s*- \[[ x]\] /)) {
            const indentLevel = getIndentLevel(line);
            const trimmedLine = line.trim();
            element = {
                id: wisk.editor.generateNewId(),
                lastEdited: Math.floor(Date.now() / 1000),
                component: 'checkbox-element',
                value: {
                    textContent: convertInlineMarkdown(trimmedLine.slice(6)),
                    checked: trimmedLine[3] === 'x',
                    indent: indentLevel,
                },
            };
        }
        // Numbered list (can be indented)
        else if (line.match(/^\s*\d+\. /)) {
            const indentLevel = getIndentLevel(line);
            const trimmedLine = line.trim();
            const numberMatch = trimmedLine.match(/^\d+\. /);
            element = {
                id: wisk.editor.generateNewId(),
                lastEdited: Math.floor(Date.now() / 1000),
                component: 'numbered-list-element',
                value: {
                    textContent: convertInlineMarkdown(trimmedLine.replace(/^\d+\. /, '')),
                    number: listNumber++,
                    indent: indentLevel,
                },
            };
        }
        // Unordered list (can be indented) - includes +, -, *
        else if (line.match(/^\s*[-*+] /)) {
            const indentLevel = getIndentLevel(line);
            const trimmedLine = line.trim();
            element = {
                id: wisk.editor.generateNewId(),
                lastEdited: Math.floor(Date.now() / 1000),
                component: 'list-element',
                value: {
                    textContent: convertInlineMarkdown(trimmedLine.slice(2)),
                    indent: indentLevel,
                },
            };
        }
        // Horizontal rule
        else if (line.match(/^[-*_]{3,}$/)) {
            element = {
                id: wisk.editor.generateNewId(),
                lastEdited: Math.floor(Date.now() / 1000),
                component: 'divider-element',
                value: {},
            };
        }
        // Regular text
        else {
            element = {
                id: wisk.editor.generateNewId(),
                lastEdited: Math.floor(Date.now() / 1000),
                component: 'text-element',
                value: {
                    textContent: convertInlineMarkdown(line),
                },
            };
        }

        if (element) {
            elements.push(element);
        }
    }

    elements[0].value.textContent = elements[1].value.textContent;
    elements.splice(1, 1);

    return elements;
};

function createHeadingElement(text, component) {
    return {
        id: wisk.editor.generateNewId(),
        lastEdited: Math.floor(Date.now() / 1000),
        component: component,
        value: {
            textContent: convertInlineMarkdown(text),
        },
    };
}

function convertInlineMarkdown(text) {
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    text = text.replace(/__(.+?)__/g, '<b>$1</b>');

    // Italic
    text = text.replace(/\*(.+?)\*/g, '<i>$1</i>');
    text = text.replace(/_(.+?)_/g, '<i>$1</i>');

    // Strikethrough
    text = text.replace(/~~(.+?)~~/g, '<strike>$1</strike>');

    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Reference numbers
    text = text.replace(/\[ref_(\d+)\]/g, '<span class="reference-number">[$1]</span>');

    return text;
}

function whenPlusClicked(elementId) {
    wisk.editor.createNewBlock(elementId, 'text-element', { textContent: '' }, { x: 0 });
    const nextElement = wisk.editor.nextElement(elementId);
    if (nextElement) {
        wisk.editor.showSelector(nextElement.id, { x: 0 });
    }
}

async function whenTrashClicked(elementId) {
    console.log('TRASH CLICKED', elementId);
    if (document.getElementById(elementId).aboutToBeOoomfed) await document.getElementById(elementId).aboutToBeOoomfed();
    wisk.editor.deleteBlock(elementId);
}

function handleEditorClick(event) {
    if (event.target.closest('#getting-started')) {
        return;
    }

    const lastElement = wisk.editor.document.data.elements[wisk.editor.document.data.elements.length - 1];

    if (lastElement.component === 'text-element') {
        wisk.editor.focusBlock(lastElement.id, {
            x: lastElement.value.textContent.length,
        });
    } else {
        wisk.editor.createNewBlock(lastElement.id, 'text-element', { textContent: '' }, { x: 0 });
    }
}

function createMenuItem(label, onClick, itemClass = '', icon = '/a7/forget/null.svg') {
    const item = document.createElement('div');
    item.className = `context-menuItem ${itemClass}`;

    const iconElement = document.createElement('span');
    iconElement.className = 'cm-icon';
    iconImage = document.createElement('img');
    iconImage.src = icon;
    iconElement.appendChild(iconImage);
    iconElement.draggable = false;
    item.appendChild(iconElement);

    const labelElement = document.createElement('span');
    labelElement.className = 'cm-label';
    labelElement.textContent = label;
    item.appendChild(labelElement);

    item.addEventListener('click', e => {
        e.stopPropagation();
        onClick();
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    });

    return item;
}

function duplicateItem(elementId) {
    if (elementId === 'abcdxyz') {
        wisk.utils.showToast("Nah you can't do that.", 2000);
        return;
    }
    const el = wisk.editor.getElement(elementId);
    if (!el) return;
    const valueClone = JSON.parse(JSON.stringify(el.value || {}));
    wisk.editor.createNewBlock(elementId, el.component, valueClone, { x: 0 });
}

async function deleteItem(elementId) {
    const inst = document.getElementById(elementId);
    if (inst && inst.aboutToBeOoomfed) {
        try {
            await inst.aboutToBeOoomfed();
        } catch {}
    }
    wisk.editor.deleteBlock(elementId);
}

function whenSelectClicked(elementId) {
    console.log('SELECT CLICKED', elementId);

    if (elementId.includes('-')) {
        const eid = elementId.split('-')[0];
        const rt = document.getElementById(eid);
        if (rt && rt.editor && typeof rt.editor.whenSelectClicked === 'function') {
            rt.editor.whenSelectClicked(elementId);
            return;
        }
    }

    const blockDiv = document.getElementById(`div-${elementId}`);
    const element = document.getElementById(elementId);
    if (!blockDiv || !element) return;

    // Close any existing menu
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();

    // Build menu
    const contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu');

    // Mandatory items
    contextMenu.appendChild(createMenuItem('Duplicate', () => menuActions.duplicateItem(elementId), 'duplicate', '/a7/iconoir/copy.svg'));
    contextMenu.appendChild(createMenuItem('Delete', () => menuActions.deleteItem(elementId), 'delete', '/a7/forget/trash.svg'));

    // Plugin-specific items
    const elType = element.tagName.toLowerCase();
    const elActions = wisk.plugins.getPluginDetail(elType)['context-menu-options'];
    if (Array.isArray(elActions)) {
        for (const action of elActions) {
            contextMenu.appendChild(
                createMenuItem(
                    action.label,
                    () => {
                        const element = document.getElementById(elementId);
                        element.runArg(action.action);
                    },
                    '',
                    action.icon || ''
                )
            );
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

    const scrollerEl = document.querySelector('.editor');

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

function createDropIndicator() {
    if (dropIndicator) return dropIndicator;

    dropIndicator = document.createElement('div');
    dropIndicator.className = 'drop-indicator';
    document.body.appendChild(dropIndicator);
    return dropIndicator;
}

function showDropIndicator(targetElement) {
    const indicator = createDropIndicator();
    if (!targetElement) {
        indicator.classList.remove('show');
        indicator.classList.add('hide');
        return;
    }

    const rect = targetElement.getBoundingClientRect();

    const computedStyle = window.getComputedStyle(targetElement);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const paddingRight = parseFloat(computedStyle.paddingRight);

    // Positioning indicator to match the content area
    indicator.style.width = rect.width - paddingLeft - paddingRight + 'px';
    indicator.style.left = rect.left + paddingLeft + 'px';
    indicator.style.top = rect.bottom + 1 + 'px';

    // Show with animation
    indicator.classList.remove('hide');
    indicator.classList.add('show');
}

function hideDropIndicator() {
    if (!dropIndicator) return;

    dropIndicator.classList.remove('show');
    dropIndicator.classList.add('hide');
}

function getElementAbove(x, y) {
    const clone = document.querySelector('.clone');
    if (clone) clone.style.display = 'none';

    const element = document.elementFromPoint(x, y);
    if (clone) clone.style.display = 'block';
    return element;
}

function onDragStart(event, elementId) {
    if (elementId == 'abcdxyz') return;
    event.preventDefault();
    event.stopPropagation();
    // clone the element
    const original = document.getElementById(elementId);
    const block = wisk.editor.getElement(elementId);
    if (!original) return;
    const clone = document.createElement('div');
    clone.className = 'clone';
    clone.style.position = 'fixed';
    clone.style.height = original.getBoundingClientRect().height + 'px';
    clone.style.width = original.getBoundingClientRect().width + 'px';
    document.body.appendChild(clone);
    // update dragState
    dragState = {
        elementId: elementId,
        original: original,
        clone: clone,
        originalValue: JSON.parse(JSON.stringify(original.getValue())),
        originalComponent: block.component,
    };
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDrop);
    window.addEventListener('touchmove', handleDrag, { passive: false });
    window.addEventListener('touchend', handleDrop);
}

function handleDrag(e) {
    if (!dragState) return;

    const event = e.touches ? e.touches[0] : e;

    const { clone } = dragState;
    clone.style.left = event.clientX + 'px';
    clone.style.top = event.clientY + 'px';
    const elementAbove = getElementAbove(event.clientX, event.clientY);
    const targetContainer = elementAbove ? elementAbove.closest('.rndr') : null;
    if (targetContainer) {
        showDropIndicator(targetContainer);
    } else {
        hideDropIndicator();
    }
    handleScroll(e.clientY);
}

function handleScroll(y) {
    const scrollContainer = document.querySelector('.editor');
    if (!scrollContainer) return;

    const containerRect = scrollContainer.getBoundingClientRect();

    // clear existing scroll
    if (autoScroll) {
        clearInterval(autoScroll);
        autoScroll = null;
    }

    let scrollDir = 0;
    let distance = 0;

    if (y < containerRect.top + SCROLL_ZONE_SIZE) {
        scrollDir = -1; // up
        distance = containerRect.top + SCROLL_ZONE_SIZE - y;
    } else if (y > containerRect.bottom - SCROLL_ZONE_SIZE) {
        scrollDir = 1; // down
        distance = y - (containerRect.bottom - SCROLL_ZONE_SIZE);
    }

    if (scrollDir !== 0) {
        autoScroll = setInterval(() => {
            const currentScroll = scrollContainer.scrollTop;
            const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;

            // scale speed based on proximity (closer to edge = faster)
            const intensity = Math.min(1, distance / SCROLL_ZONE_SIZE);
            const delta = scrollDir * (SCROLL_SPEED * (0.5 + intensity * 2));

            const newScroll = currentScroll + delta;
            scrollContainer.scrollTop = Math.max(0, Math.min(newScroll, maxScroll));
        }, SCROLL_INTERVAL);
    }
}

function handleDrop(e) {
    if (!dragState) return;
    // Clear auto-scroll when dropping
    if (autoScroll) {
        clearInterval(autoScroll);
        autoScroll = null;
    }
    hideDropIndicator();
    const { elementId, original, clone, originalValue, originalComponent } = dragState;

    document.body.removeChild(clone);

    window.removeEventListener('mousemove', handleDrag);
    window.removeEventListener('mouseup', handleDrop);
    window.removeEventListener('touchmove', handleDrop);
    window.removeEventListener('touchend', handleDrop);

    const event = e.changedTouches ? e.changedTouches[0] : e;

    // get the above element of the clone and put the clone below it after which delete the original
    const elementAbove = getElementAbove(event.clientX, event.clientY);
    const targetContainer = elementAbove ? elementAbove.closest('.rndr') : null;

    if (targetContainer) {
        const targetId = targetContainer.id.replace('div-', '');
        console.log('moving element to below: ', targetId);

        if (targetId != elementId) {
            wisk.editor.deleteBlock(elementId);
            wisk.editor.createNewBlock(targetId, originalComponent, originalValue, { x: 0 });
        }
    }

    dragState = null;
}

// Rectangle Selection Functions
function createSelectionRectangle() {
    if (selectionRectangle) return selectionRectangle;

    selectionRectangle = document.createElement('div');
    selectionRectangle.className = 'selection-rectangle';
    selectionRectangle.style.cssText = `
        position: fixed;
        border: 2px solid var(--fg-accent);
        background: var(--bg-accent);
        pointer-events: none;
        z-index: 1000;
        display: none;
        border-radius: 4px;
        opacity: 0.7;
    `;
    document.body.appendChild(selectionRectangle);
    return selectionRectangle;
}

function startRectangleSelection(event) {
    // First check: must be inside editor-main
    if (!event.target.closest('.editor-main')) {
        return;
    }

    // Don't start selection if clicking on specific UI elements
    if (
        event.target.closest('.hover-images') ||
        event.target.closest('.context-menu') ||
        event.target.closest('button') ||
        event.target.closest('input') ||
        event.target.closest('textarea') ||
        event.target.closest('.mini-dialog') ||
        event.target.closest('.right-sidebar') ||
        event.target.closest('.left-sidebar') ||
        event.target.closest('nav')
    ) {
        return;
    }

    // Check if starting from an element with disableSelection
    const clickedElement = event.target;
    const rndrContainer = clickedElement.closest('.rndr');

    if (rndrContainer) {
        // TODO use better selector
        const blockElement = rndrContainer.querySelector('[id]:not([id^="div-"]):not([id^="full-width-wrapper-"])');

        if (blockElement) {
            const componentType = blockElement.tagName.toLowerCase();
            const pluginDetail = wisk.plugins.getPluginDetail(componentType);

            // Don't start selection if the element has disableSelection enabled
            if (pluginDetail && pluginDetail.disableSelection === true) {
                return;
            }
        }
    }

    // Clear any existing selection
    clearSelection();

    const rect = createSelectionRectangle();
    const editorElement = document.getElementById('editor');
    if (!editorElement) return;

    // Store coordinates relative to editor element
    const editorRect = editorElement.getBoundingClientRect();
    rectangleSelectionState = {
        startX: event.clientX - editorRect.left + editorElement.scrollLeft,
        startY: event.clientY - editorRect.top + editorElement.scrollTop,
        isActive: false,
        editorElement: editorElement,
    };

    // Add mouse move and up listeners
    document.addEventListener('mousemove', handleRectangleSelection);
    document.addEventListener('mouseup', finishRectangleSelection);
}

function handleRectangleSelection(event) {
    if (!rectangleSelectionState) return;

    // Store the latest event for throttled update
    rectangleSelectionState.latestEvent = event;

    // Throttle using requestAnimationFrame
    if (selectionUpdateScheduled) return;

    selectionUpdateScheduled = true;
    requestAnimationFrame(() => {
        selectionUpdateScheduled = false;

        if (!rectangleSelectionState || !rectangleSelectionState.latestEvent) return;

        const event = rectangleSelectionState.latestEvent;
        const { startX, startY, editorElement } = rectangleSelectionState;
        const editorRect = editorElement.getBoundingClientRect();

        // Convert current mouse position to editor-relative coordinates
        const currentX = event.clientX - editorRect.left + editorElement.scrollLeft;
        const currentY = event.clientY - editorRect.top + editorElement.scrollTop;

        // Check if we've moved enough to start selection (prevent accidental selections)
        const distance = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
        if (distance < 5 && !rectangleSelectionState.isActive) {
            return;
        }

        rectangleSelectionState.isActive = true;

        // Calculate rectangle bounds in editor coordinates
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        // Convert to viewport coordinates for display
        const viewportLeft = editorRect.left + left - editorElement.scrollLeft;
        const viewportTop = editorRect.top + top - editorElement.scrollTop;

        // Find elements within selection (using editor coordinates for intersection)
        updateElementSelection(left, top, width, height, editorElement);
    });
}

function updateElementSelection(left, top, width, height, editorElement) {
    const selectionBounds = {
        left: left,
        top: top,
        right: left + width,
        bottom: top + height,
    };

    // Clear previous selection overlays
    clearSelectionOverlays();
    selectedElements.clear();

    const intersectingElements = [];
    const editorRect = editorElement.getBoundingClientRect();

    // Check each element for intersection
    document.querySelectorAll('.rndr').forEach(elementContainer => {
        const rect = elementContainer.getBoundingClientRect();

        // Convert element position to editor coordinates
        const elementEditorLeft = rect.left - editorRect.left + editorElement.scrollLeft;
        const elementEditorTop = rect.top - editorRect.top + editorElement.scrollTop;
        const elementEditorRight = elementEditorLeft + rect.width;
        const elementEditorBottom = elementEditorTop + rect.height;

        // Check if rectangles intersect (both in editor coordinates)
        if (
            elementEditorLeft < selectionBounds.right &&
            elementEditorRight > selectionBounds.left &&
            elementEditorTop < selectionBounds.bottom &&
            elementEditorBottom > selectionBounds.top
        ) {
            const elementId = elementContainer.id.replace('div-', '');
            intersectingElements.push({ elementId, elementContainer, rect });
        }
    });

    // Add overlays for all intersecting elements
    intersectingElements.forEach(({ elementId, elementContainer }) => {
        selectedElements.add(elementId);
        createSelectionOverlay(elementContainer, elementId);
    });

    // If only one element is selected, clear the selection (let native selection handle it)
    if (selectedElements.size === 1) {
        clearSelectionOverlays();
        selectedElements.clear();
    } else if (selectedElements.size > 1) {
        // Clear HTML default selection and focus when our selection takes over
        window.getSelection().removeAllRanges();
        if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur();
        }
    }
}

function finishRectangleSelection() {
    if (rectangleSelectionState && rectangleSelectionState.isActive) {
        // Selection completed with elements
        console.log('Selected elements:', Array.from(selectedElements));

        // Dispatch custom event for other parts of the app
        window.dispatchEvent(
            new CustomEvent('elements-selected', {
                detail: { selectedElementIds: Array.from(selectedElements) },
            })
        );
    }

    rectangleSelectionState = null;

    // Remove event listeners
    document.removeEventListener('mousemove', handleRectangleSelection);
    document.removeEventListener('mouseup', finishRectangleSelection);
}

function createSelectionOverlay(elementContainer, elementId) {
    const editorElement = document.getElementById('editor');
    if (!editorElement) return;

    // Find the actual content element inside the container
    const contentElement = elementContainer.querySelector('.rndr > *') || elementContainer.querySelector('.rndr') || elementContainer;

    const editorRect = editorElement.getBoundingClientRect();
    const overlays = [];

    // Helper function to get all text nodes, including within shadow roots
    function getTextNodes(node, results = []) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Only include text nodes with non-whitespace content
            if (node.textContent.trim().length > 0) {
                results.push(node);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Check for shadow root
            if (node.shadowRoot) {
                for (const child of node.shadowRoot.childNodes) {
                    getTextNodes(child, results);
                }
            }

            // Process regular child nodes
            for (const child of node.childNodes) {
                getTextNodes(child, results);
            }
        }
        return results;
    }

    // Get all text nodes
    const nodes = getTextNodes(contentElement);

    // Get all rects from text nodes
    const rects = [];

    nodes.forEach(node => {
        // For text nodes, create a range to get bounding rect
        const range = document.createRange();
        range.selectNodeContents(node);
        const clientRects = range.getClientRects();
        // Add all rects from the text node (handles multi-line text)
        for (const r of clientRects) {
            if (r.width > 0 && r.height > 0) {
                rects.push(r);
            }
        }
    });

    // Create overlays for each rect (max 100 to prevent performance issues)
    const maxOverlays = 100;
    const rectsToRender = rects.slice(0, maxOverlays);

    rectsToRender.forEach(rect => {
        const overlay = document.createElement('div');
        overlay.className = 'selection-overlay';
        const padding = 3;
        overlay.style.cssText = `
            position: absolute;
            left: ${rect.left - editorRect.left + editorElement.scrollLeft - padding}px;
            top: ${rect.top - editorRect.top + editorElement.scrollTop - padding}px;
            width: ${rect.width + padding * 2}px;
            height: ${rect.height + padding * 2}px;
            background-color: var(--fg-accent);
            mix-blend-mode: lighten;
            pointer-events: none;
            z-index: 999;
            border-radius: 3px;
        `;

        editorElement.appendChild(overlay);
        overlays.push(overlay);
    });

    selectionOverlays.set(elementId, overlays);
}

function clearSelectionOverlays() {
    selectionOverlays.forEach(overlays => {
        overlays.forEach(overlay => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });
    });
    selectionOverlays.clear();
}

function clearSelection() {
    selectedElements.clear();
    clearSelectionOverlays();
}

function updateSelectionOverlays() {
    const editorElement = document.getElementById('editor');
    if (!editorElement) return;

    // Recreate overlays when scrolling or resizing
    const selectedElementIds = Array.from(selectedElements);
    clearSelectionOverlays();

    selectedElementIds.forEach(elementId => {
        const elementContainer = document.getElementById(`div-${elementId}`);
        if (elementContainer) {
            selectedElements.add(elementId);
            createSelectionOverlay(elementContainer, elementId);
        }
    });
}

// Add selection handling to editor initialization
function initializeRectangleSelection() {
    // Disable on mobile devices
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isMobile) {
        return;
    }

    const editorElement = document.querySelector('.editor');
    if (editorElement) {
        editorElement.addEventListener('mousedown', startRectangleSelection);
    }

    // Add keyboard shortcuts for selection operations
    document.addEventListener('keydown', handleSelectionKeyboard);

    // Add paste event listener to intercept our custom clipboard format
    document.addEventListener('paste', handlePasteEvent);

    // Throttled update overlay positions on scroll and resize
    let scrollUpdateScheduled = false;
    const throttledUpdateOverlays = () => {
        if (scrollUpdateScheduled) return;
        scrollUpdateScheduled = true;
        requestAnimationFrame(() => {
            scrollUpdateScheduled = false;
            updateSelectionOverlays();
        });
    };

    window.addEventListener('scroll', throttledUpdateOverlays, true);
    window.addEventListener('resize', throttledUpdateOverlays);

    // Update overlays when editor content changes (debounced)
    let mutationTimeout;
    const observer = new MutationObserver(() => {
        clearTimeout(mutationTimeout);
        mutationTimeout = setTimeout(updateSelectionOverlays, 100);
    });

    if (editorElement) {
        observer.observe(editorElement, {
            childList: true,
            subtree: false, // Don't observe deep changes for performance
        });
    }
}

// Keyboard shortcuts for selection
function handleSelectionKeyboard(event) {
    // Only intercept copy/cut/delete when multiple elements are selected (not single element)
    if (selectedElements.size < 2) {
        // Still allow clearing selection with Escape
        if (selectedElements.size > 0 && event.key === 'Escape') {
            event.preventDefault();
            clearSelection();
        }
        return;
    }

    // Copy selected elements with Ctrl+C or Cmd+C
    if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        event.preventDefault();
        copySelectedElements();
        return;
    }

    // Cut selected elements with Ctrl+X or Cmd+X
    if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
        event.preventDefault();
        cutSelectedElements();
        return;
    }

    // Delete selected elements with Delete or Backspace
    if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelectedElements();
    }

    // Clear selection with Escape
    if (event.key === 'Escape') {
        event.preventDefault();
        clearSelection();
    }
}

// Handle paste event to intercept our custom clipboard format
function handlePasteEvent(event) {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    // Check if HTML contains our custom format
    const html = clipboardData.getData('text/html');
    if (html) {
        const match = html.match(/__WISK_CLIPBOARD__(.+?)__WISK_CLIPBOARD_END__/);
        if (match) {
            // Prevent default paste behavior
            event.preventDefault();
            event.stopPropagation();

            try {
                const wiskData = JSON.parse(match[1]);
                if (wiskData.__wisk_elements__ && wiskData.elements) {
                    // Restore our internal clipboard
                    elementClipboard = wiskData.elements;
                    pasteElements();
                }
            } catch (err) {
                console.error('Failed to parse wisk clipboard data:', err);
            }
        }
    }
}

// Bulk operations for selected elements
function deleteSelectedElements() {
    if (selectedElements.size === 0) return;

    const elementsToDelete = Array.from(selectedElements);
    elementsToDelete.forEach(elementId => {
        if (elementId !== 'abcdxyz') {
            // Don't delete the main element
            wisk.editor.deleteBlock(elementId);
        }
    });

    clearSelection();
}

async function copySelectedElements() {
    if (selectedElements.size === 0) return;

    // Clear previous clipboard
    elementClipboard = [];

    // Copy element data to clipboard and collect text
    const textParts = [];
    Array.from(selectedElements).forEach(elementId => {
        if (elementId !== 'abcdxyz') {
            // Don't copy the main element
            const element = wisk.editor.getElement(elementId);
            if (element) {
                elementClipboard.push({
                    component: element.component,
                    value: JSON.parse(JSON.stringify(element.value || {})), // Deep clone
                });

                // Collect text content
                const domElement = document.getElementById(elementId);
                if (domElement && typeof domElement.getTextContent === 'function') {
                    const textContent = domElement.getTextContent();
                    if (textContent && textContent.text) {
                        textParts.push(textContent.text);
                    }
                } else if (element.value && element.value.textContent) {
                    textParts.push(element.value.textContent);
                }
            }
        }
    });

    // Create a custom format for our elements with a marker
    const wiskClipboardData = {
        __wisk_elements__: true,
        elements: elementClipboard,
        timestamp: Date.now(),
    };

    // Copy both plain text and our custom format to system clipboard
    const combinedText = textParts.length > 0 ? textParts.join('\n\n') : '';
    const customFormat = `__WISK_CLIPBOARD__${JSON.stringify(wiskClipboardData)}__WISK_CLIPBOARD_END__`;

    try {
        // Write both formats - the custom format as HTML to preserve it
        const clipboardItem = new ClipboardItem({
            'text/plain': new Blob([combinedText], { type: 'text/plain' }),
            'text/html': new Blob([`<meta name="wisk-clipboard" content="true"/>${customFormat}`], { type: 'text/html' }),
        });
        await navigator.clipboard.write([clipboardItem]);
    } catch (err) {
        // Fallback to just text if clipboard write fails
        try {
            await navigator.clipboard.writeText(combinedText);
        } catch (err2) {
            console.error('Failed to copy to clipboard:', err2);
        }
    }

    console.log('Copied', elementClipboard.length, 'elements to clipboard');
}

function cutSelectedElements() {
    if (selectedElements.size === 0) return;

    // First copy the elements
    copySelectedElements();

    // Then delete them
    deleteSelectedElements();

    console.log('Cut', elementClipboard.length, 'elements');
}

function pasteElements() {
    if (elementClipboard.length === 0) {
        console.log('No elements in clipboard to paste');
        return;
    }

    // Clear current selection
    clearSelection();

    // Find the focused element or use the last element as fallback
    let targetElementId = 'abcdxyz'; // Default to main element

    // Check if there's a focused element in the editor
    const focusedElement = document.activeElement;
    if (focusedElement) {
        // Look for the closest .rndr parent
        const closestRndr = focusedElement.closest('.rndr');
        if (closestRndr && closestRndr.id && closestRndr.id.startsWith('div-')) {
            targetElementId = closestRndr.id.replace('div-', '');
        } else {
            // Check if the focused element is inside an element container
            const elementContainer = focusedElement.closest('[id^="div-"]');
            if (elementContainer && elementContainer.id.startsWith('div-')) {
                targetElementId = elementContainer.id.replace('div-', '');
            }
        }
    }

    // If no focused element found, use the last element as fallback
    if (targetElementId === 'abcdxyz') {
        const allElements = document.querySelectorAll('.rndr');
        if (allElements.length > 0) {
            const lastElement = allElements[allElements.length - 1];
            if (lastElement.id && lastElement.id.startsWith('div-')) {
                targetElementId = lastElement.id.replace('div-', '');
            }
        }
    }

    // Paste each element from clipboard after the target element
    const newElementIds = [];
    let currentTargetId = targetElementId;
    elementClipboard.forEach(elementData => {
        const newElementId = wisk.editor.createNewBlock(currentTargetId, elementData.component, elementData.value, { x: 0 });
        if (newElementId) {
            newElementIds.push(newElementId);
            currentTargetId = newElementId; // Chain elements after each other
        }
    });

    // Select the newly pasted elements
    setTimeout(() => {
        newElementIds.forEach(elementId => {
            const elementContainer = document.getElementById(`div-${elementId}`);
            if (elementContainer) {
                selectedElements.add(elementId);
                createSelectionOverlay(elementContainer, elementId);
            }
        });

        // Dispatch selection event
        window.dispatchEvent(
            new CustomEvent('elements-selected', {
                detail: { selectedElementIds: Array.from(selectedElements) },
            })
        );
    }, 100); // Small delay to ensure elements are rendered

    console.log('Pasted', newElementIds.length, 'elements');
}

function duplicateSelectedElements() {
    if (selectedElements.size === 0) return;

    const elementsToProcess = Array.from(selectedElements).reverse(); // Process in reverse order to maintain positions

    elementsToProcess.forEach(elementId => {
        if (elementId !== 'abcdxyz') {
            // Don't duplicate the main element
            const element = wisk.editor.getElement(elementId);
            if (element) {
                const valueClone = JSON.parse(JSON.stringify(element.value || {}));
                wisk.editor.createNewBlock(elementId, element.component, valueClone, { x: 0 });
            }
        }
    });

    clearSelection();
}

function selectAllElements() {
    clearSelection();

    document.querySelectorAll('.rndr').forEach(elementContainer => {
        const elementId = elementContainer.id.replace('div-', '');
        selectedElements.add(elementId);
        createSelectionOverlay(elementContainer, elementId);
    });

    // Dispatch selection event
    window.dispatchEvent(
        new CustomEvent('elements-selected', {
            detail: { selectedElementIds: Array.from(selectedElements) },
        })
    );
}

// API functions for external use
wisk.editor.getSelectedElements = function () {
    return Array.from(selectedElements);
};

wisk.editor.clearSelection = clearSelection;

wisk.editor.selectElements = function (elementIds) {
    clearSelection();
    elementIds.forEach(elementId => {
        const elementContainer = document.getElementById(`div-${elementId}`);
        if (elementContainer) {
            selectedElements.add(elementId);
            createSelectionOverlay(elementContainer, elementId);
        }
    });
};

wisk.editor.copySelectedElements = copySelectedElements;
wisk.editor.cutSelectedElements = cutSelectedElements;
wisk.editor.pasteElements = pasteElements;
wisk.editor.getClipboard = function () {
    return elementClipboard.slice(); // Return a copy
};
wisk.editor.clearClipboard = function () {
    elementClipboard = [];
};

const menuActions = {
    duplicateItem: elementId => duplicateItem(elementId),
    deleteItem: elementId => deleteItem(elementId),
};

wisk.editor.justUpdates = async function (elementId) {
    console.log('JUST UPDATES', elementId);

    // Handle nested elements with IDs containing hyphens
    if (elementId && elementId.includes('-')) {
        const eid = elementId.split('-')[0];
        document.getElementById(eid).editor.justUpdates(elementId);
        return;
    }

    window.dispatchEvent(new CustomEvent('something-updated', { detail: { id: elementId } }));

    if (elementId) {
        if (elementId === wisk.editor.document.data.elements[0].id) {
            document.title = byQuery('#' + elementId).getTextContent().text;
            wisk.editor.document.data.config.name = document.title;
            wisk.sync.newChange({
                action: 'config',
                key: 'name',
                value: document.title,
            });
        }

        const element = wisk.editor.getElement(elementId);
        if (element) {
            const domElement = document.getElementById(elementId);
            if (domElement) {
                element.value = domElement.getValue();
                element.lastEdited = Math.floor(Date.now() / 1000);
                element.component = domElement.tagName.toLowerCase();
                document.getElementById('nav').classList.add('nav-disappear');
                document.getElementById('getting-started').style.display = 'none';

                if (!elementUpdatesLeft.includes(elementId)) {
                    elementUpdatesLeft.push(elementId);
                }
            }
        }
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        const changed = elementUpdatesLeft
            .map(elementId => {
                const element = wisk.editor.getElement(elementId);
                if (element) {
                    return {
                        path: 'document.elements',
                        values: {
                            id: element.id,
                            value: element.value,
                            lastEdited: element.lastEdited,
                            component: element.component,
                        },
                    };
                }
                return null;
            })
            .filter(Boolean);

        const elementIds = wisk.editor.document.data.elements.map(e => e.id);

        await wisk.sync.saveUpdates();

        elementUpdatesLeft = [];
        deletedElementsLeft = [];
    }, elementSyncTimer); // should it be less? to voice your opinion, join our discord server: https://discord.gg/D8tQCvgDhu
};

// TODO remove??? idk
function initKeyboardDetection() {
    // Use Visual Viewport API (better browser support)
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            const keyboardHeight = window.innerHeight - window.visualViewport.height;
            window.dispatchEvent(
                new CustomEvent('virtual-keyboard-visible', {
                    detail: {
                        isVisible: keyboardHeight > 0,
                        height: keyboardHeight,
                    },
                })
            );
        });
    }

    // Also try Virtual Keyboard API for browsers that support it :)
    if ('virtualKeyboard' in navigator) {
        navigator.virtualKeyboard.overlaysContent = true;
        navigator.virtualKeyboard.addEventListener('geometrychange', event => {
            const { height } = event.target.boundingRect;
            window.dispatchEvent(
                new CustomEvent('virtual-keyboard-visible', {
                    detail: {
                        isVisible: height > 0,
                        height,
                    },
                })
            );
        });
    }
}

initKeyboardDetection();
