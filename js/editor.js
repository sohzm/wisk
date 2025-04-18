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

const createHoverImageContainer = elementId => {
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('hover-images');

    const addButton = createHoverButton('/a7/forget/plus-hover.svg', () => whenPlusClicked(elementId));
    const deleteButton = createHoverButton('/a7/forget/trash-hover.svg', () => whenTrashClicked(elementId));

    imageContainer.appendChild(addButton);
    imageContainer.appendChild(deleteButton);

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

async function initEditor(doc) {
    // wait for a second before initializing the editor
    //
    console.log('INIT EDITOR', doc);
    wisk.editor.document = doc;
    wisk.editor.document.data = doc.data;
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
            if (content.identifier && doc.data.pluginData[content.identifier] && document.getElementById(content.identifier)) {
                document.getElementById(content.identifier).loadData(doc.data.pluginData[content.identifier]);
            }
        }
    }

    wisk.theme.setTheme(doc.data.config.theme);

    const page = doc.data;
    deletedElements = page.deletedElements;
    wisk.editor.document.data.elements = page.elements;

    if (!wisk.editor.readonly) {
        document.getElementById('last-space').addEventListener('click', handleEditorClick);
    }

    await initializeElements();

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
        document.getElementById(eid).editor.getElement(elementId);
        return;
    }

    return wisk.editor.document.data.elements.find(e => e.id === elementId);
};

wisk.editor.prevElement = function (elementId) {
    if (elementId.includes('-')) {
        eid = elementId.split('-')[0];
        document.getElementById(eid).editor.prevElement(elementId);
        return;
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
        document.getElementById(eid).editor.nextElement(elementId);
        return;
    }

    const index = wisk.editor.document.data.elements.findIndex(e => e.id === elementId);
    return index < wisk.editor.document.data.elements.length - 1 ? wisk.editor.document.data.elements[index + 1] : null;
};

wisk.editor.showSelector = function (elementId, focusIdentifier) {
    const selector = byQuery('selector-element');
    selector.show(elementId);
};

wisk.editor.deleteBlock = function (elementId, rec) {
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
        if (element.id !== 'abcdxyz') wisk.editor.createBlockNoFocus('', element.component, element.value);
    }

    wisk.theme.setTheme(template.theme);
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

        // Reset list tracking when encountering non-list items
        if (!line.trim().startsWith('-') && !line.trim().startsWith('*') && !line.trim().match(/^\d+\./)) {
            currentList = null;
            listNumber = 1;
        }

        // Heading patterns
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
        // Code block
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
        // Blockquote
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
        // Checkbox list
        else if (line.match(/^- \[[ x]\] /)) {
            element = {
                id: wisk.editor.generateNewId(),
                lastEdited: Math.floor(Date.now() / 1000),
                component: 'checkbox-element',
                value: {
                    textContent: convertInlineMarkdown(line.slice(6)),
                    checked: line[3] === 'x',
                    indent: 0,
                },
            };
        }
        // Numbered list
        else if (line.match(/^\d+\. /)) {
            element = {
                id: wisk.editor.generateNewId(),
                lastEdited: Math.floor(Date.now() / 1000),
                component: 'numbered-list-element',
                value: {
                    textContent: convertInlineMarkdown(line.replace(/^\d+\. /, '')),
                    number: listNumber++,
                    indent: 0,
                },
            };
        }
        // Unordered list
        else if (line.startsWith('- ') || line.startsWith('* ')) {
            element = {
                id: wisk.editor.generateNewId(),
                lastEdited: Math.floor(Date.now() / 1000),
                component: 'list-element',
                value: {
                    textContent: convertInlineMarkdown(line.slice(2)),
                    indent: 0,
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

function whenTrashClicked(elementId) {
    console.log('TRASH CLICKED', elementId);
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
