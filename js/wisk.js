globalThis.wisk = globalThis.wisk || {};

const wisk = globalThis.wisk;
wisk.auth = document.querySelector('auth-component');

wisk.plugins = {
    defaultPlugins: [],
    loadedPlugins: [],
    pluginData: {},
    loadPlugin: function (plugin) {},
    references: [],
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
    elements: [],
    data: {},
    readonly: false,
    backendUrl: 'https://cloud.wisk.cc',
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
};

wisk.utils = {
    showToast: function (message, duration) {},
    showDialog: function (message, title, callback) {},
    showInfo: function (message) {},
    showLoading: function (message) {},
    hideLoading: function () {},
};

// TODO https://github.com/cynthwave/wisk/issues/90
wisk.i18n = {
    defaultLocale: 'en',
    fallbackLocale: 'en',
    localeData: {},
    locales: [],
    t: function (key) {},
};

if (location.href.includes('.wisk.site')) {
    wisk.editor.readonly = true;
}
