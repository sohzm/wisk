// TODO change naming such that plugin group and plugin name are separate
wisk.plugins = {
    defaultPlugins: [
        // editor elements
        'main-element',
        'text-element',
        'heading1-element',
        'heading2-element',
        'heading3-element',
        'heading4-element',
        'heading5-element',
        'image-element',
        'code-element',
        'list-element',
        'numbered-list-element',
        'checkbox-element',
        'quote-element',
        'callout-element',
        'divider-element',
        'table-element',
        'embed-element',
        'link-preview-element',
        'canvas-element',
        'latex-element',
        'mermaid-element',
        'chart-element',
        'columns-element',

        // other elements
        'neo-ai',
        // 'general-chat',
        'more',
        'left-menu',
    ],
    loadedPlugins: [],
    pluginData: null,
    readyElements: new Map(),
};

async function fetchDataJSON() {
    return fetch(SERVER + '/js/plugins/plugin-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function elementReady(elementName) {
    return new Promise(resolve => {
        if (wisk.plugins.readyElements.has(elementName)) {
            resolve();
        } else {
            wisk.plugins.readyElements.set(elementName, resolve);
        }
    });
}

async function loadPlugin(pluginName, inx) {
    if (!inx) {
        inx = wisk.plugins.loadedPlugins.length;
    }

    if (wisk.plugins.loadedPlugins.includes(pluginName)) {
        console.log(`Plugin ${pluginName} is already loaded.`);
        return;
    }

    const pluginData = wisk.plugins.pluginData.list[pluginName];
    if (!pluginData) {
        console.error(`Plugin ${pluginName} not found in PluginData.`);
        return;
    }

    const loadPromises = pluginData.contents.map(async content => {
        const componentUrl = `${SERVER}/js/plugins/code/${content.component}.js`;
        const response = await fetch(componentUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const scriptText = await response.text();
        const scriptElement = document.createElement('script');
        scriptElement.type = content.loadAsModule ? 'module' : 'text/javascript';
        scriptElement.textContent = scriptText;
        document.body.appendChild(scriptElement);

        // Wait for the custom element to be defined
        if (content.category != 'auto') {
            await customElements.whenDefined(content.component);
        }

        // Add to nav bar if necessary
        if (content.nav === true && !wisk.editor.readonly) {
            addToNavBar(content, inx);
        }
    });

    await Promise.all(loadPromises);
    wisk.plugins.loadedPlugins.push(pluginName);
    console.log(`Plugin loaded: ${pluginName}`);
}

wisk.plugins.loadPlugin = loadPlugin;

wisk.plugins.getPluginDetail = function (pluginName) {
    for (let key in wisk.plugins.pluginData.list) {
        for (let i = 0; i < wisk.plugins.pluginData.list[key].contents.length; i++) {
            if (
                wisk.plugins.pluginData.list[key].contents[i].category === 'component' &&
                wisk.plugins.pluginData.list[key].contents[i].component === pluginName
            ) {
                return wisk.plugins.pluginData.list[key].contents[i];
            }
        }
    }
};

wisk.plugins.getPluginGroupDetail = function (pluginName) {
    return wisk.plugins.pluginData.list[pluginName];
};

async function loadComponent(componentName) {
    for (let key in wisk.plugins.pluginData.list) {
        for (let i = 0; i < wisk.plugins.pluginData.list[key].contents.length; i++) {
            if (wisk.plugins.pluginData.list[key].contents[i].component === componentName) {
                return loadPlugin(key, wisk.plugins.loadedPlugins.length);
            }
        }
    }
}

wisk.plugins.loadComponent = loadComponent;

function addToNavBar(content, inx) {
    const nav = document.querySelector('.nav-plugins');
    const button = document.createElement('button');
    button.classList.add('nav-button');
    button.title = content.title;

    // Create icon only if not nav-mini
    if (content.category !== 'nav-mini') {
        const icon = document.createElement('img');
        icon.classList.add('plugin-icon');
        icon.draggable = false;
        icon.src = `${SERVER}${wisk.plugins.pluginData['icon-path']}${content.icon}`;
        button.style.order = inx + 500;
        button.appendChild(icon);
    } else {
        button.classList.add('nav-button-dont-hover');
        button.style.order = inx;
        button.title = '';
    }

    if (content.title == 'Options') {
        button.style.order = 1000;
        button.classList.add('options-button');
    }

    // Create the component container
    const componentElement = document.createElement(content.component);
    if (content.identifier) {
        componentElement.id = content.identifier;
    }
    componentElement.dataset.pluginComponent = 'true';

    // Handle nav-mini category differently
    if (content.category === 'nav-mini') {
        button.appendChild(componentElement);
    } else {
        // For other categories, add to appropriate container
        componentElement.style.display = 'none';
        let containerSelector;
        switch (content.category) {
            case 'mini-dialog':
                containerSelector = '.mini-dialog-body';
                break;
            case 'right-sidebar':
                containerSelector = '.right-sidebar-body';
                break;
            case 'left-sidebar':
                containerSelector = '.left-sidebar-body';
                break;
        }
        const container = document.querySelector(containerSelector);
        container.appendChild(componentElement);
    }

    button.onclick = () => {
        console.log(`Toggling ${content.category}:`, content.title, content.component);
        if (content.category === 'nav-mini') {
            // do nothing
        } else {
            // Handle other categories as before
            switch (content.category) {
                case 'mini-dialog':
                    toggleMiniDialogNew(content.component, content.title);
                    break;
                case 'right-sidebar':
                    toggleRightSidebarNew(content.component, content.title);
                    break;
                case 'left-sidebar':
                    toggleLeftSidebarNew(content.component, content.title);
                    break;
            }
        }
    };

    wisk.editor.registerCommand(
        'Toggle ' + content.title,
        '',
        'Plugin',
        () => {
            button.click();
        },
        ''
    );

    nav.appendChild(button);
}

async function loadAllPlugins() {
    wisk.utils.showLoading('Loading plugins...');
    try {
        await Promise.all(wisk.plugins.defaultPlugins.map(loadPlugin));
        console.log('All plugins loaded');
    } catch (error) {
        console.error('Error loading plugins:', error);
    } finally {
        // wisk.utils.hideLoading();
    }
}

async function init() {
    try {
        wisk.plugins.pluginData = await fetchDataJSON();
        console.log('Plugin data loaded:', wisk.plugins.pluginData);
        await loadAllPlugins();
        // await sync();
        //
        await wisk.db.getItem(wisk.editor.pageId).then(data => {
            if (data) {
                console.log('Data:', data);
                initEditor(data);
            }
        });
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

init();
