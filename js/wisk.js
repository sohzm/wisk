globalThis.wisk = globalThis.wisk || {};

const wisk = globalThis.wisk;
wisk.auth = document.querySelector('auth-component');

wisk.plugins = {
    defaultPlugins: [],
    loadedPlugins: [],
    pluginData: {},
    loadPlugin: function (plugin) {},
};

wisk.db = {
    getItem: function (pageId) {},
    setItem: function (pageId, value) {},
    removeItem: function (pageId) {},
    getAllItems: function () {},
};

wisk.theme = {
    themeObject: { themes: [] },
    setTheme: function (theme) {},
    getTheme: function () {},
    getThemes: function () {},
    getThemeData: function (theme) {},
};

wisk.editor = {
    showSelector: function (elementId) {},
    generateNewId: function () {},
    pageId: '',
    document: {}, // supposed to replace elements, data, config
    readonly: false,
    backendUrl: 'https://cloud.wisk.cc',
    wsBackendUrl: 'wss://cloud.wisk.cc',
    aiAutocomplete: false,
    gptZero: false,
    createNewBlock: function (elementId, blockType, value, focusIdentifier) {},
    deleteBlock: function (elementId) {},
    focusBlock: function (elementId, identifier) {},
    updateBlock: function (elementId, path, newValue) {},
    runBlockFunction: function (elementId, functionName, arg) {},
    justUpdates: function (elementId, value) {},
    showSelector: function (elementId, focusIdentifier) {},
    registerCommand: function (name, description, category, callback, shortcut) {},
    syncBuffer: {},
};

wisk.utils = {
    showToast: function (message, duration) {},
    showDialog: function (message, title, callback) {},
    showInfo: function (message) {},
    showLoading: function (message) {},
    hideLoading: function () {},
};

// TODO add i18n support
wisk.i18n = {
    defaultLocale: 'en',
    fallbackLocale: 'en',
    localeData: {},
    locales: [],
    t: function (key) {},
};

wisk.sync = {
    agent: '',
    instance: '',
    changes: [],
    newChange: function (change) {},
    saveUpdates: function () {},
};

var rand7 = () => {
    return [...Array(7)].map(() => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 52)]).join('');
};

if (localStorage.getItem('wisk-agent')) {
    wisk.sync.agent = localStorage.getItem('wisk-agent');
} else {
    wisk.sync.agent = 'agent-' + rand7();
    localStorage.setItem('wisk-agent', wisk.sync.agent);
}

wisk.sync.instance = 'inst-' + rand7();

if (location.href.includes('.wisk.site')) {
    wisk.editor.readonly = true;
}
