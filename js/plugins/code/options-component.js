import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class OptionsComponent extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
            user-select: none;
        }
        button > * {
            cursor: pointer;
        }
        :host {
            display: block;
            position: relative;
            height: 100%;
            overflow: hidden;
        }
        .container {
            position: relative;
            height: 100%;
            width: 100%;
        }
        .view {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: var(--padding-4);
            overflow-y: auto;
            display: none;
            flex-direction: column;
            transition: opacity 0.3s ease;
            opacity: 0;
        }
        .view.active {
            display: flex;
            opacity: 1;
        }
        .header {
            display: flex;
            flex-direction: row;
            color: var(--fg-1);
            gap: var(--gap-2);
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 30px;
        }
        @media (max-width: 900px) {
            .header {
                min-height: 30px;
            }
        }
        .header-wrapper {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            width: 100%;
        }
        .header-controls {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .header-title {
            font-size: 30px;
            font-weight: 500;
        }
        @media (max-width: 900px) {
            .header-title {
                width: 100%;
                text-align: center;
                margin-top: 20px;
                font-size: 20px;
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
            }
        }
        .icon {
            cursor: pointer;
            transition: transform 0.2s ease;
            width: 22px;
        }
        .menu-item {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            cursor: pointer;
            padding: var(--padding-3);
            border-radius: var(--radius);
            transition: background-color 0.2s ease;
            width: 100%;
        }
        .menu-item label {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }
        label {
            font-size: 18px;
            cursor: unset;
        }
        .menu-item:hover {
            background-color: var(--bg-2);
        }
        .menu-item-static {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: var(--padding-3);
            border-radius: var(--radius);
            width: 100%;
        }
        .toggle-group {
            display: flex;
            flex-wrap: wrap;
            padding: var(--padding-3);
        }
        .content-section,
        .snapshot-section {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            color: var(--fg-1);
            align-items: center;
            padding: var(--padding-3) 0;
            border-bottom: solid 1px var(--bg-2);
            border-radius: 0;
        }
        .snapshot-section {
            padding: var(--padding-3) var(--padding-4);
            border-bottom: 1px solid var(--bg-3);
        }
        .snapshot-section:first-child {
            padding-top: 0;
        }
        .content-section:last-child,
        .snapshot-section:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        .content-section--column {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--gap-2);
        }
        .content-card {
            display: flex;
            align-items: center;
            padding: var(--gap-2);
            background-color: var(--bg-2);
            border-radius: var(--radius);
            gap: var(--gap-2);
            transition: all 0.2s ease;
        }
        .content-card:hover {
            background-color: var(--bg-3);
        }
        .card-icon {
            padding: var(--padding-3);
            border-radius: var(--radius);
            width: 60px;
        }
        .card-info {
            display: flex;
            flex-direction: column;
            flex: 1;
            cursor: pointer;
            gap: 2px;
            overflow: hidden;
        }
        .card-title {
            font-weight: bold;
        }
        .card-description {
            font-size: 14px;
            color: var(--fg-2);
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        .search-input {
            padding: var(--padding-w2);
            color: var(--fg-1);
            background-color: var(--bg-3);
            border-radius: calc(var(--radius-large) * 2);
            outline: none;
            border: none;
            transition: all 0.2s ease;
            width: 100%;
            max-width: 300px;
            margin-right: 2px;
            font-weight: 500;
            min-width: 200px;
        }
        .search-input:focus {
            background-color: var(--fg-1);
            color: var(--bg-1);
        }
        .search-input:focus::placeholder {
            color: var(--bg-1);
        }
        .btn {
            outline: none;
            border: none;
            cursor: pointer;
            padding: var(--padding-w3);
            border-radius: var(--radius);
            transition: all 0.2s ease;
        }
        .btn-default {
            background-color: var(--bg-3);
            color: var(--fg-1);
        }
        .btn-primary {
            background-color: var(--fg-1);
            color: var(--bg-1);
            font-weight: bold;
        }
        .btn-primary:hover:not(:disabled) {
            filter: brightness(1.1);
        }
        .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        .btn-secondary {
            background-color: var(--bg-1);
            border: 2px solid var(--bg-3);
            color: var(--fg-1);
            font-weight: 600;
        }
        .btn-secondary:hover {
            background-color: var(--bg-3);
            color: var(--fg-1);
        }
        .btn-danger {
            background-color: var(--fg-red);
            color: var(--bg-red);
            font-weight: 600;
            padding: var(--padding-w2);
        }
        .btn-danger:hover {
            background-color: var(--bg-red);
            color: var(--fg-red);
            border: 2px solid var(--fg-red);
        }
        .btn-developer {
            background-color: var(--fg-1);
            color: var(--bg-1);
            border: 2px solid var(--fg-1);
            padding: var(--padding-w1);
        }
        .btn-developer:hover {
            background-color: var(--bg-1);
            color: var(--fg-1);
            border: 2px solid var(--fg-1);
        }
        .detail-header {
            background-color: var(--bg-2);
            padding: var(--padding-3);
            border-radius: var(--radius-large);
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }
        .filter-tags {
            gap: var(--gap-2);
            display: flex;
            flex-wrap: wrap;
        }
        .filter-tag {
            padding: var(--padding-w2);
            border-radius: calc(var(--radius-large) * 10);
            text-align: center;
            cursor: pointer;
            font-weight: 500;
            font-size: 14px;
            color: var(--fg-1);
            background-color: var(--bg-3);
            display: flex;
            align-items: center;
        }
        .filter-tag-selected {
            background-color: var(--fg-1);
            color: var(--bg-1);
        }
        .tag {
            color: var(--fg-1);
            font-size: 14px;
            padding: var(--padding-w1);
            background-color: var(--bg-3);
            border-radius: var(--radius);
            margin-right: 5px;
        }
        .tag-blue {
            color: var(--fg-blue);
            background-color: var(--bg-blue);
        }
        .tag-red {
            background-color: var(--bg-red);
            color: var(--fg-red);
        }
        .detail-section {
            margin-top: var(--gap-2);
            width: 100%;
            border-radius: var(--radius);
            padding: var(--padding-3) 0;
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
        }
        .link-blue {
            color: var(--fg-blue);
        }
        .empty-state {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
            opacity: 0.6;
        }
        .empty-state img {
            filter: var(--themed-svg);
        }
        li {
            padding-left: 10px;
            color: var(--fg-2);
        }
        img {
            filter: var(--themed-svg);
        }
        .themes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
            overflow: auto;
        }
        .theme-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px;
            border-radius: var(--radius);
            cursor: pointer;
            transition: background-color 0.2s ease;
            border: 3px solid transparent;
        }
        .theme-card:hover {
            background-color: var(--bg-3);
        }
        .theme-card.selected {
            border: 3px solid var(--fg-blue);
        }
        .theme-preview {
            width: 100%;
            height: 100px;
            background-color: var(--bg-1);
            border-radius: var(--radius);
            margin-bottom: 7px;
            font-family: var(--font);
            color: var(--fg-1);
            font-size: 14px;
            display: flex;
            align-items: flex-end;
            overflow: hidden;
        }
        .theme-name {
            font-weight: bold;
            color: var(--fg-1);
            height: 27px;
        }
        .username-field {
            border: 2px solid var(--border-1);
            padding: var(--padding-w1);
            border-radius: var(--radius);
            outline: none;
            background-color: var(--bg-1);
            color: var(--fg-1);
        }
        .username-field-valid {
            border: 2px solid var(--fg-green);
        }
        .username-field-invalid {
            border: 2px solid var(--fg-red);
        }
        .username-controls {
            gap: var(--gap-2);
            flex-wrap: wrap;
            align-items: center;
            justify-content: flex-end;
        }
        .action-button {
            padding: 0;
            display: flex;
            background: var(--bg-1);
            border: none;
            outline: none;
            opacity: 0.7;
        }
        .action-button:hover {
            opacity: 1;
        }
        .action-button img {
            padding: var(--padding-1);
            filter: var(--themed-svg);
            height: 26px;
            width: 26px;
        }
        .snapshot-info {
            padding: var(--padding-4);
            background: var(--bg-2);
            border-radius: var(--radius-large);
            margin-bottom: var(--padding-4);
        }
        @media (hover: hover) {
            *::-webkit-scrollbar {
                width: 15px;
            }
            *::-webkit-scrollbar-track {
                background: var(--bg-1);
            }
            *::-webkit-scrollbar-thumb {
                background-color: var(--bg-3);
                border-radius: 20px;
                border: 4px solid var(--bg-1);
            }
            *::-webkit-scrollbar-thumb:hover {
                background-color: var(--fg-1);
            }
        }
        .select-dropdown {
            padding: 5px;
            color: var(--fg-1);
            border: 1px solid var(--border-1);
            background-color: var(--bg-2);
            outline: none;
            border-radius: var(--radius);
            transition:
                border-color 0.2s ease,
                background-color 0.2s ease;
            scrollbar-width: thin;
            scrollbar-color: var(--fg-2) var(--bg-3);
        }
        .select-dropdown:hover {
            border-color: var(--border-2);
            background-color: var(--bg-3);
        }
        .select-dropdown::-webkit-scrollbar {
            width: 15px;
        }
        .select-dropdown::-webkit-scrollbar-track {
            background: var(--bg-3);
            border-radius: var(--radius);
        }
        .select-dropdown::-webkit-scrollbar-thumb {
            background-color: var(--fg-2);
            border-radius: 20px;
            border: 4px solid var(--bg-3);
        }
        @media (max-width: 768px) {
            .menu-item,
            .content-section,
            .snapshot-section,
            .toggle-group {
                padding: var(--padding-3) 0;
            }
            .signin-banner {
                margin: var(--padding-3) 0;
            }
        }
        *::marker {
            color: var(--bg-1);
        }
        .hidden {
            display: none;
        }

        .dev-jalebi {
            padding: 0 var(--padding-3);
        }

        .snapshot-list-outer {
            flex: 1;
            overflow-y: auto;
            padding: var(--padding-4) 0;
            margin-top: var(--padding-4);
            border-radius: var(--radius-large);
            border: 1px solid var(--bg-3);
        }

        @media (max-width: 900px) {
            img[src*='/a7/forget/dialog-x.svg'] {
                display: none;
            }
            .dev-jalebi {
                padding: 0 var(--padding-4);
                position: absolute;
                top: 0;
                right: 0;
                margin-top: 20px;
            }
        }
        .signin-banner {
            border-radius: var(--radius);
            padding: var(--padding-4);
            background: linear-gradient(45deg, var(--fg-accent), var(--fg-1));
            align-items: flex-start;
            gap: var(--gap-3);
            flex-direction: column;
        }

        img[src*='/a7/forget/dialog-x.svg'] {
            width: unset;
        }
    `;

    static properties = {
        plugins: { type: Array },
        searchTerm: { type: String },
        currentView: { type: String },
        selectedPlugin: { type: Object },
        showUsernameEdit: { type: Boolean },
        showPluginSearch: { type: Boolean },
        notificationsEnabled: { type: Boolean },
        changelog: { type: String },
        showSnapshotInfo: { type: Boolean },
        snapshots: { type: Array },
    };

    constructor() {
        super();
        this.plugins = [];
        this.searchTerm = '';
        this.currentView = 'main';
        this.showPluginSearch = false;
        this.selectedPlugin = null;
        this.showUsernameEdit = false;
        this.notificationsEnabled = Notification.permission === 'granted';
        this.showSnapshotInfo = false;
        this.snapshots = [];
        this.storageStats = {
            totalMB: 0,
            quotaGB: 0,
        };
        this.initEmojiTracker();
        this.changelog = '';
        this.fetchChangelog();
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadPlugins();

        if (typeof wisk.editor.notificationsEnabled === 'undefined') {
            wisk.editor.notificationsEnabled = Notification.permission === 'granted';
        }
    }

    async fetchChangelog() {
        this.changelog = await fetch('/docs/changelog.md').then(res => res.text());
    }

    toggleNotifications() {
        if (Notification.permission === 'granted') {
            // If already granted, we can't revoke it, but we can track user preference
            wisk.editor.notificationsEnabled = !wisk.editor.notificationsEnabled;
            this.notificationsEnabled = wisk.editor.notificationsEnabled;
            wisk.utils.showToast('Notifications ' + (wisk.editor.notificationsEnabled ? 'enabled' : 'disabled'), 3000);
        } else if (Notification.permission === 'denied') {
            // If denied, we need to tell the user to change browser settings
            wisk.utils.showToast('Please enable notifications in your browser settings', 5000);
        } else {
            // If not asked yet, request permission
            Notification.requestPermission().then(permission => {
                wisk.editor.notificationsEnabled = permission === 'granted';
                this.notificationsEnabled = wisk.editor.notificationsEnabled;
                wisk.utils.showToast('Notifications ' + (permission === 'granted' ? 'enabled' : 'denied'), 3000);
                this.requestUpdate();
            });
        }
        this.requestUpdate();
    }

    showAboutView() {
        this.currentView = 'about';
    }

    showSettingsView() {
        this.currentView = 'settings';
    }

    async showAccountsView() {
        this.currentView = 'account';
        var data = await this.getUserData();
        this.shadowRoot.querySelector('#acc-email').innerText = data.email;
        this.shadowRoot.querySelector('#acc-username').innerText = data.username;
        this.shadowRoot.querySelector('#acc-plan').innerText = data.access;
        this.shadowRoot.querySelector('#acc-username-edit').value = data.username;
    }

    showThemesView() {
        this.currentView = 'themes';
    }

    showSnapshotsView() {
        this.currentView = 'snapshots';
    }

    handleBack() {
        if (this.currentView === 'main') {
            return false;
        } else if (this.currentView === 'plugin-details') {
            this.currentView = 'plugins';
            return true;
        } else if (['developer', 'account', 'about', 'changelog'].includes(this.currentView)) {
            this.showSettingsView();
            return true;
        } else {
            this.showMainView();
            return true;
        }
    }

    loadPlugins() {
        if (wisk.plugins.pluginData && wisk.plugins.pluginData.list) {
            this.plugins = Object.values(wisk.plugins.pluginData.list).filter(plugin => !wisk.plugins.defaultPlugins.includes(plugin.name));
        }
    }

    handleSearch(e) {
        this.searchTerm = e.target.value.toLowerCase();
    }

    handleIntegrationSearch(e) {
        // TODO
    }

    async checkForUpdatesX() {
        const response = await fetch('http://localhost:30007/app-nav/check-update');
        const data = await response.json();
        if (data.updateAvailable) {
            wisk.utils.showToast('Update available, Click to update', 3000);
            this.shadowRoot.querySelector('#update-available').style.display = 'flex';
            this.shadowRoot.querySelector('#check-update').style.display = 'none';
        }
    }

    async performUpdateX() {
        const response = await fetch('http://localhost:30007/app-nav/update');
        const data = await response.json();
        if (data.success) {
            alert('Update completed. Please restart the app.');
        }
    }

    showPluginsManager() {
        this.currentView = 'plugins';
    }

    showIntegrationsManager() {
        this.currentView = 'integrations';
    }

    showMainView() {
        this.currentView = 'main';
    }

    togglePlugin(plugin) {
        this.selectedPlugin = plugin;
        this.currentView = 'plugin-details';
    }

    installButtonClicked() {
        if (this.isPluginInstalled(this.selectedPlugin.name)) {
            this.handlePluginUninstall(this.selectedPlugin);
        } else {
            this.handlePluginInstall(this.selectedPlugin);
        }
    }

    async handlePluginInstall(plugin) {
        // TODO check if that plugin is experimental, if yes, show a confirmation dialog

        await wisk.plugins.loadPlugin(plugin.name);
        await wisk.editor.addConfigChange('document.config.plugins.add', plugin.name);
        this.requestUpdate();
    }

    async handlePluginUninstall(plugin) {
        // check if plugin is currently getting used, if yes, don't uninstall and show a toast
        var pluginContents = wisk.plugins.pluginData.list[plugin.name].contents;
        console.log(pluginContents);
        for (const element in wisk.editor.document.data.elements) {
            for (const content in pluginContents) {
                if (wisk.editor.document.data.elements[element].component == pluginContents[content].component) {
                    wisk.utils.showToast('Plugin is currently being used, please remove the block first', 3000);
                    return;
                }
            }
        }

        // if no then uninstall and reload the page
        await wisk.editor.addConfigChange('document.config.plugins.remove', plugin.name);
        window.location.reload();
    }

    isPluginInstalled(pluginName) {
        return wisk.plugins.loadedPlugins.includes(pluginName);
    }

    async getUserData() {
        var user = await document.querySelector('auth-component').getUserInfo();
        var response = await fetch(wisk.editor.backendUrl + '/v1/user', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        });

        if (response.status !== 200) {
            wisk.utils.showToast('Error getting data', 5000);
            return;
        }
        var data = await response.json();

        return data;
    }

    async checkUsernameAvailability(username) {
        var user = await document.querySelector('auth-component').getUserInfo();
        var response = await fetch(wisk.editor.backendUrl + '/v1/username?username=' + username, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        });

        if (response.status !== 200) {
            return false;
        }
        return true;
    }

    async setUsername(username) {
        if (username.length < 3 || username.length > 25) {
            wisk.utils.showToast('Username should be between 3 and 25 characters', 3000);
            return;
        }

        if (username === this.shadowRoot.querySelector('#acc-username').innerText) {
            wisk.utils.showToast('Username is same as current username', 3000);
            return;
        }

        var user = await document.querySelector('auth-component').getUserInfo();
        var response = await fetch(wisk.editor.backendUrl + '/v1/username?username=' + username, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        });

        if (response.status !== 200) {
            wisk.utils.showToast('Error setting username, please try later', 5000);
            return false;
        }
        return true;
    }

    async handleUsernameInput() {
        var input = this.shadowRoot.querySelector('#acc-username-edit');
        var username = input.value;
        // min 3 max 25
        if (username.length < 3 || username.length > 25) {
            input.classList.add('username-field-invalid');
            input.classList.remove('username-field-valid');
            wisk.utils.showToast('Username should be between 3 and 25 characters', 3000);
            return;
        }
        if (username === this.shadowRoot.querySelector('#acc-username').innerText) {
            wisk.utils.showToast('Username is same as current username', 3000);
            return;
        }

        if (await this.checkUsernameAvailability(username)) {
            input.classList.add('username-field-valid');
            input.classList.remove('username-field-invalid');
        } else {
            input.classList.add('username-field-invalid');
            input.classList.remove('username-field-valid');
        }
    }

    async saveUsername() {
        console.log('save username', this.shadowRoot.querySelector('#acc-username-edit').value);
        var res = await this.setUsername(this.shadowRoot.querySelector('#acc-username-edit').value);
        if (res) {
            wisk.utils.showToast('Username set successfully', 3000);
            this.shadowRoot.querySelector('#acc-username').innerText = this.shadowRoot.querySelector('#acc-username-edit').value;
        }
        this.showUsernameEdit = false;
    }

    async showEdit() {
        this.showUsernameEdit = true;
        this.shadowRoot.querySelector('#acc-username-edit').value = this.shadowRoot.querySelector('#acc-username').innerText;
        this.shadowRoot.querySelector('#acc-username-edit').classList.remove('username-field-invalid');
        this.shadowRoot.querySelector('#acc-username-edit').classList.remove('username-field-valid');
    }

    opened() {
        this.currentView = 'main';
        wisk.db.getStorageStats().then(stats => {
            console.log('STORAGE STATS', stats);
            this.storageStats = stats;
        });
        this.shadowRoot.querySelector('.search-input').value = '';
        this.handleSearch({ target: { value: '' } });

        this.refreshSnapshots();
        this.requestUpdate();
    }

    async refreshSnapshots() {
        // get all snapshots, filter all that have the id of current document (wisk.editor.pageId) and a dash
        var snapshotKeys = await wisk.db.getAllSnapshots();
        var search = 'id-' + wisk.editor.pageId + '-';
        snapshotKeys = Object.values(snapshotKeys).filter(snapshot => {
            return snapshot.includes(search);
        });

        // fetch snapshots one by one and add to the snapshots array
        this.snapshots = [];
        for (var i = 0; i < snapshotKeys.length; i++) {
            var data = await wisk.db.getSnapshot(snapshotKeys[i]);
            if (data) {
                this.snapshots.push(data);
            }
        }

        console.log('SNAPSHOTS', this.snapshots);
        this.requestUpdate();
    }

    async changeTheme(theme) {
        this.selectedTheme = theme;
        wisk.theme.setTheme(theme);
        await wisk.editor.addConfigChange('document.config.theme', theme);
        this.requestUpdate();
    }

    async restoreSnapshot(s) {
        // ask for alert
        if (!confirm('Are you sure you want to restore this snapshot? This will overwrite your current document.')) {
            return;
        }

        wisk.editor.document = s.data;
        await wisk.sync.saveUpdates();
        // reload page
        window.location.reload();
    }

    setTheme(theme) {
        wisk.theme.setTheme(theme);
    }

    showDeveloperView() {
        this.currentView = 'developer';
    }

    async showChangelogView() {
        this.currentView = 'changelog';
    }

    async tagClicked(tag) {
        if (tag == 'search') {
            this.showPluginSearch = true;
            await this.updateComplete;
            this.shadowRoot.querySelector('.search-input').focus();
            return;
        }
        if (tag == '') {
            this.searchTerm = '';
            return;
        }
        tag = '#' + tag;
        this.shadowRoot.querySelector('#pluginSearch').value = tag;
        this.searchTerm = tag;
        this.currentView = 'plugins';
    }

    toggleAIAutocomplete() {
        wisk.editor.aiAutocomplete = !wisk.editor.aiAutocomplete;
        wisk.utils.showToast('AI Autocomplete ' + (wisk.editor.aiAutocomplete ? 'enabled' : 'disabled'), 3000);
        this.requestUpdate();
    }

    toggleGPTZero() {
        wisk.editor.gptZero = !wisk.editor.gptZero;
        wisk.utils.showToast('GPTZero Protection Mode ' + (wisk.editor.gptZero ? 'On' : 'Off'), 3000);
        this.requestUpdate();
    }

    clearAllData() {
        // ask for confirmation
        if (!confirm('Are you sure you want to clear all data? This will remove all your saved data and settings.')) {
            return;
        }

        // ask for confirmation again
        if (!confirm('Are you really sure? This action is irreversible.')) {
            return;
        }

        // nothing wrong with asking for confirmation 3 times
        if (!confirm('Last chance! Are you really sure?')) {
            return;
        }

        // ask for confirmation 4 times
        if (!confirm('Seriously? This will delete everything!')) {
            return;
        }

        // but wait, there's more!
        if (!confirm('This isnt a joke now. Are you sure?')) {
            return;
        }

        localStorage.clear();

        wisk.db.clearAllData();
        wisk.utils.showToast('All data cleared, Reloading Page', 3000);
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    }

    copyTemplateConfigurations() {
        var config = {
            plugins: wisk.editor.document.data.config.plugins,
            theme: wisk.editor.document.data.config.theme,
            elements: wisk.editor.document.data.elements,
            name: document.title,
        };

        console.log('Copying template configurations to clipboard', config);

        navigator.clipboard.writeText(JSON.stringify(config)).then(
            function () {
                wisk.utils.showToast('Copied template configurations to clipboard', 3000);
            },
            function (err) {
                wisk.utils.showToast('Failed to copy template configurations', 3000);
            }
        );
    }

    initEmojiTracker() {
        document.addEventListener('mousemove', event => {
            if (this.currentView !== 'developer' || localStorage.getItem('devMode') === 'true') return;

            const emojiImg = this.shadowRoot?.querySelector('img[src*="emoji-"]');
            if (!emojiImg) return;

            const rect = emojiImg.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const distX = event.clientX - centerX;
            const distY = event.clientY - centerY;

            const isOnImage = Math.abs(distX) < rect.width / 2 && Math.abs(distY) < rect.height / 2;

            if (isOnImage) {
                emojiImg.src = '/a7/plugins/options-element/emoji-normal.svg';
            } else {
                if (Math.abs(distX) > Math.abs(distY)) {
                    emojiImg.src = distX > 0 ? '/a7/plugins/options-element/emoji-right.svg' : '/a7/plugins/options-element/emoji-left.svg';
                } else {
                    emojiImg.src = distY > 0 ? '/a7/plugins/options-element/emoji-down.svg' : '/a7/plugins/options-element/emoji-up.svg';
                }
            }
        });
    }

    createCurrentSnapshot() {
        // get title from prompt
        var title = prompt('Enter a name for the snapshot', 'Snapshot ' + new Date().toISOString());
        if (!title) {
            return;
        }

        var name = 'id-' + wisk.editor.pageId + '-' + new Date().toISOString();
        var data = {
            id: name,
            title: title,
            pageId: wisk.editor.pageId,
            timestamp: new Date().toISOString(),
            data: wisk.editor.document,
        };
        wisk.db.setSnapshot(name, data).then(() => {
            wisk.utils.showToast('Snapshot created successfully', 3000);
            this.refreshSnapshots();
        });
    }

    render() {
        var filteredPlugins = this.plugins.filter(
            plugin =>
                plugin.title.toLowerCase().includes(this.searchTerm) ||
                plugin.description.toLowerCase().includes(this.searchTerm) ||
                plugin.tags.some(tag => ('#' + tag).toLowerCase().includes(this.searchTerm)) ||
                plugin.author.toLowerCase().includes(this.searchTerm) ||
                plugin.contents.some(content => content.experimental && 'experimental'.includes(this.searchTerm))
        );

        // if plugin.hide is true, don't show it
        filteredPlugins = filteredPlugins.filter(plugin => !plugin.hide);

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        var parts = [];
        if (this.currentView === 'plugin-details') {
            parts = this.selectedPlugin.description.split(urlRegex);
        }

        return html`
            <div class="container" data-view="${this.currentView}">
                <!-- Main View -->
                <div class="view ${this.currentView === 'main' ? 'active' : ''}">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <label class="header-title">Options</label>
                                <img src="/a7/forget/dialog-x.svg" alt="Close" @click="${() => {
                                    wisk.editor.hideMiniDialog();
                                }}" class="icon" draggable="false" style="padding: var(--padding-3);"/>
                            </div>
                        </div>
                    </div>

                    <div class="toggle-group">
                        <div class="menu-item-static content-section">
                            <label for="toggle-notifications">Notifications</label>
                            <jalebi-toggle id="toggle-notifications" ?checked="${this.notificationsEnabled}" @valuechange="${this.toggleNotifications}"></jalebi-toggle>
                        </div>

                        <!--
                        <div class="menu-item-static content-section">
                            <label for="toggle-autocomplete">AI Autocomplete</label>
                            <jalebi-toggle id="toggle-autocomplete" ?checked="${wisk.editor.aiAutocomplete}" @valuechange="${this.toggleAIAutocomplete}"></jalebi-toggle>
                        </div>

                        <div class="menu-item-static content-section">
                            <label for="toggle-gptzero">GPTZero Protection</label>
                            <jalebi-toggle id="toggle-gptzero" ?checked="${wisk.editor.gptZero}" @valuechange="${this.toggleGPTZero}"></jalebi-toggle>
                        </div>
                        -->
                    </div>

                    <div class="menu-item" @click="${this.showThemesView}">
                        <label> <img src="/a7/plugins/options-element/theme.svg" alt="Themes" class="icon" draggable="false"/> Themes</label>
                        <img src="/a7/iconoir/right.svg" alt="Themes" class="icon" draggable="false"/>
                    </div>

                    <div class="menu-item" @click="${this.showPluginsManager}">
                        <label> <img src="/a7/plugins/options-element/plug.svg" alt="Plugins" class="icon" draggable="false"/> Plugins</label>
                        <img src="/a7/iconoir/right.svg" alt="Plugins" class="icon" draggable="false"/>
                    </div>

                    <div class="menu-item" @click="${this.showSnapshotsView}">
                        <label> <img src="/a7/plugins/options-element/snapshots.svg" alt="Plugins" class="icon" draggable="false"/> Snapshots</label>
                        <img src="/a7/iconoir/right.svg" alt="Plugins" class="icon" draggable="false"/>
                    </div>

                    <div class="menu-item" @click="${this.showSettingsView}">
                        <label> <img src="/a7/plugins/options-element/settings.svg" alt="Settings" class="icon" draggable="false"/> Settings</label>
                        <img src="/a7/iconoir/right.svg" alt="Settings" class="icon" draggable="false"/>
                    </div>

                    <div style="flex: 1"></div>
                    <p style="color: var(--fg-2); padding: 10px 0">
                        btw you can also create your own plugins and themes, check out the 
                        <a href="https://wisk.cc/docs" target="_blank" style="color: var(--fg-blue)">docs</a>
                    </p>
                </div>

                <!-- Plugins View -->
                <div class="view ${this.currentView === 'plugins' ? 'active' : ''}">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <img src="/a7/forget/dialog-back.svg" alt="Back" @click="${this.showMainView}" class="icon" draggable="false"/>
                                <img src="/a7/forget/dialog-x.svg" alt="Close" @click="${() => {
                                    wisk.editor.hideMiniDialog();
                                }}" class="icon" draggable="false" style="padding: var(--padding-3);"/>
                            </div>
                            <label class="header-title">Plugins</label>
                        </div>
                    </div>

                    <div class="filter-tags">
                        <input id="pluginSearch" type="text" placeholder="Search plugins" class="search-input" @input="${this.handleSearch}" style="flex: 1; 
                            display: ${this.showPluginSearch ? 'block' : this.searchTerm === '' ? 'none' : 'block'};" @blur="${() => {
                                if (this.searchTerm === '') {
                                    this.showPluginSearch = false;
                                }
                            }}"/>
                        <div class="filter-tag" @click="${() => this.tagClicked('search')}" style="display: ${this.showPluginSearch ? 'none' : this.searchTerm === '' ? 'block' : 'none'}">
                            <img src="/a7/forget/search-thicc.svg" alt="Search" style="width: 17px;"/> 
                        </div>
                        <div class="filter-tag ${this.searchTerm === '' ? 'filter-tag-selected' : ''}" @click="${() => this.tagClicked('')}">All</div>
                        <div class="filter-tag ${this.searchTerm === '#programming' ? 'filter-tag-selected' : ''}" @click="${() => this.tagClicked('programming')}">Programming</div>
                        <div class="filter-tag ${this.searchTerm === '#customization' ? 'filter-tag-selected' : ''}" @click="${() => this.tagClicked('customization')}">Customization</div>
                        <div class="filter-tag ${this.searchTerm === '#blog' ? 'filter-tag-selected' : ''}" @click="${() => this.tagClicked('blog')}">Blog</div>
                        <div class="filter-tag ${this.searchTerm === '#utility' ? 'filter-tag-selected' : ''}" @click="${() => this.tagClicked('utility')}">Utility</div>
                    </div>

                    <div style="flex: 1; overflow-y: auto; margin-top: 10px;">
                        ${filteredPlugins
                            .sort((a, b) => a.title.localeCompare(b.title))
                            .map(
                                plugin => html`
                                    <div
                                        class="content-card"
                                        @click="${() => this.togglePlugin(plugin)}"
                                        style="cursor: pointer; margin-bottom: 8px;"
                                    >
                                        <img
                                            src="${SERVER + wisk.plugins.pluginData['icon-path'] + plugin.icon}"
                                            alt="${plugin.title}"
                                            class="card-icon"
                                            draggable="false"
                                        />
                                        <div class="card-info">
                                            <span class="card-title">${plugin.title}</span>
                                            <span class="card-description">${plugin.description}</span>
                                        </div>
                                    </div>
                                `
                            )}
                            
                        ${
                            filteredPlugins.length === 0
                                ? html`
                                      <div class="empty-state">
                                          <img
                                              src="/a7/plugins/options-element/puzzled.svg"
                                              alt="No plugins"
                                              style="width: 80px; margin: 0 auto;"
                                              draggable="false"
                                          />
                                          <p>No plugins found</p>
                                          <p>
                                              Want a plugin? Request it
                                              <a href="https://github.com/sohzm/wisk/issues/new" target="_blank" class="link-blue">here</a>.
                                          </p>
                                      </div>
                                  `
                                : ''
                        }
                    </div>
                </div>

                <!-- Integrations View -->
                <div class="view ${this.currentView === 'integrations' ? 'active' : ''}">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <img src="/a7/forget/dialog-back.svg" alt="Back" @click="${this.showMainView}" class="icon" draggable="false"/>
                                <img src="/a7/forget/dialog-x.svg" alt="Close" @click="${() => {
                                    wisk.editor.hideMiniDialog();
                                }}" class="icon" draggable="false" style="padding: var(--padding-3);"/>
                            </div>
                            <label class="header-title">Integrations</label>
                        </div>
                    </div>

                    <input type="text" placeholder="Search Integrations" class="search-input" @input="${this.handleIntegrationSearch}" style="flex: 1; margin-bottom: 10px;"/>

                    <div style="flex: 1; overflow-y: auto; display: flex; align-items: center; justify-content: center;">
                        <p>Integrations coming soon...</p>
                    </div>
                </div>

                <!-- Plugin Details View -->
                <div class="view ${this.currentView === 'plugin-details' ? 'active' : ''}">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <img src="/a7/forget/dialog-back.svg" alt="Back" @click="${() => (this.currentView = 'plugins')}" class="icon" draggable="false"/>
                                <img src="/a7/forget/dialog-x.svg" alt="Close" @click="${() => {
                                    wisk.editor.hideMiniDialog();
                                }}" class="icon" draggable="false" style="padding: var(--padding-3);"/>
                            </div>
                            <label class="header-title">Plugin Detail</label>
                        </div>
                    </div>

                    ${
                        this.selectedPlugin
                            ? html`
                                  <div class="detail-header">
                                      <img
                                          src="${SERVER + wisk.plugins.pluginData['icon-path'] + this.selectedPlugin.icon}"
                                          class="card-icon"
                                          draggable="false"
                                      />
                                      <div style="display: flex; flex-direction: column; gap: 5px;">
                                          <h4>${this.selectedPlugin.title}</h4>
                                          <p style="font-size: 14px">
                                              made by
                                              <a href="${this.selectedPlugin.contact}" target="_blank" style="color: var(--fg-2)">
                                                  ${this.selectedPlugin.author}
                                              </a>
                                          </p>
                                      </div>
                                      <div style="flex: 1"></div>
                                      <div style="padding: var(--padding-3); display: flex; align-items: center; justify-content: center;">
                                          <button class="btn btn-primary" @click="${this.installButtonClicked}">
                                              ${this.isPluginInstalled(this.selectedPlugin.name) ? 'Uninstall' : 'Install'}
                                          </button>
                                      </div>
                                  </div>

                                  <div class="content-section content-section--column">
                                      ${this.selectedPlugin.contents.some(
                                          content =>
                                              content.category.includes('mini-dialog') ||
                                              content.category.includes('nav-mini') ||
                                              content.category.includes('full-dialog') ||
                                              content.category.includes('right-sidebar') ||
                                              content.category.includes('left-sidebar') ||
                                              content.category.includes('component') ||
                                              content.category.includes('auto') ||
                                              content.category.includes('context-box') ||
                                              content.nav ||
                                              content.experimental
                                      )
                                          ? html`
                                                <div class="detail-section">
                                                    <div>
                                                        <span class="tag"
                                                            >${this.selectedPlugin.contents.map(content => content.category).join(', ')}</span
                                                        >
                                                        ${this.selectedPlugin.contents.some(content => content.nav)
                                                            ? html`<span class="tag">navigation</span>`
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.experimental)
                                                            ? html`<span class="tag tag-red">experimental</span>`
                                                            : ''}
                                                    </div>

                                                    <ul style="color: var(--fg-2); display: flex; flex-direction: column; gap: var(--gap-1)">
                                                        ${this.selectedPlugin.contents.some(content => content.category.includes('mini-dialog'))
                                                            ? html`<p style="font-size: 14px;">• opens as a small dialog box</p>`
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.category.includes('nav-mini'))
                                                            ? html`<p style="font-size: 14px;">• adds a interactive button to the navigation bar</p>`
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.category.includes('full-dialog'))
                                                            ? html`<p style="font-size: 14px;">
                                                                  • opens as a full-screen dialog box (Not implemented yet)
                                                              </p>`
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.category.includes('right-sidebar'))
                                                            ? html`<p style="font-size: 14px;">• appears in the right sidebar</p>`
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.category.includes('left-sidebar'))
                                                            ? html`<p style="font-size: 14px;">• appears in the left sidebar</p>`
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.category.includes('component'))
                                                            ? html`<p style="font-size: 14px;">• adds a new block to the editor</p>`
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.category.includes('auto'))
                                                            ? html`<p style="font-size: 14px;">
                                                                  • runs automatically without user intervention/has custom ui
                                                              </p>`
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.category.includes('context-box'))
                                                            ? html`<p style="font-size: 14px;">
                                                                  • appears as a context menu or box (Not implemented yet)
                                                              </p>`
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.experimental)
                                                            ? html`<p style="font-size: 14px;">
                                                                  • is experimental and may cause issues and is not recommended to use
                                                              </p>`
                                                            : ''}
                                                        ${this.selectedPlugin.contents.some(content => content.nav)
                                                            ? html`<p style="font-size: 14px;">• will be shown in the navigation bar</p>`
                                                            : ''}
                                                    </ul>
                                                </div>
                                            `
                                          : ''}

                                      <div style="display: flex; flex-wrap: wrap; gap: var(--gap-1);">
                                          ${this.selectedPlugin.tags.map(
                                              tag => html`<span class="tag tag-blue" @click="${() => this.tagClicked(tag)}">#${tag}</span>`
                                          )}
                                      </div>

                                      <p>
                                          ${parts.map((part, index) => {
                                              if (part.match(urlRegex)) {
                                                  return html`<a href="${part}" class="link-blue" target="_blank"
                                                      >${part.replace(/(^\w+:|^)\/\//, '')}</a
                                                  >`;
                                              }
                                              return part;
                                          })}
                                      </p>
                                  </div>
                              `
                            : ''
                    }
                </div>

                <!-- Developer View -->
                <div class="view ${this.currentView === 'developer' ? 'active' : ''}">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <img src="/a7/forget/dialog-back.svg" alt="Back" @click="${this.showSettingsView}" class="icon" draggable="false"/>
                                <img src="/a7/forget/dialog-x.svg" alt="Close" @click="${() => {
                                    wisk.editor.hideMiniDialog();
                                }}" class="icon" draggable="false" style="padding: var(--padding-3);"/>
                            </div>
                            <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
                                <label class="header-title">Developer Options</label>
                                <jalebi-toggle ?checked="${localStorage.getItem('devMode') === 'true'}" 
                                    @valuechange="${e => {
                                        localStorage.setItem('devMode', e.detail.value);
                                        this.requestUpdate();
                                    }}"
                                    class="dev-jalebi"></jalebi-toggle>
                            </div>
                        </div>
                    </div>

                    <div style="flex: 1; display: ${localStorage.getItem('devMode') === 'true' ? 'none' : 'flex'}; align-items: center; justify-content: center;">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--gap-3); opacity: 0.6">
                            <img src="/a7/plugins/options-element/emoji-normal.svg" alt="No plugins" style="width: 80px; margin: 0 auto; filter: var(--themed-svg);" draggable="false"/>
                            <p>You gotta be a developer to see this</p>
                        </div>
                    </div>

                    <div style="flex: 1; display: ${localStorage.getItem('devMode') === 'true' ? 'block' : 'none'}">

                        <div class="menu-item-static content-section" style="border-bottom: none;">
                            <div class="usage-bar" style="width: 100%; background-color: var(--bg-2); border-radius: var(--radius); height: 10px; position: relative; overflow: hidden;" title="remaining storage">
                                <div class="usage-bar-fill" style="width: ${(this.storageStats.totalMB / (this.storageStats.quotaGB * 1000)) * 100}%; background-color: var(--fg-red); height: 100%;" title="used storage"></div>
                            </div>

                        </div>

                        <div class="menu-item-static content-section">
                            <label>Storage Stats</label>
                            <p style="font-size: 14px; color: var(--fg-2);">used ${this.storageStats.totalMB} MB</p>
                        </div>

                        <div class="menu-item-static content-section">
                            <label>Storage Quota (maximum allowed storage to wisk)</label>
                            <p style="font-size: 14px; color: var(--fg-2);">${this.storageStats.quotaGB} GB</p>
                        </div>

                        <div class="menu-item-static content-section">
                            <label>Clear all local data</label>
                            <button class="btn btn-developer" @click="${() => this.clearAllData()}">Clear</button>
                        </div>

                        <div class="menu-item-static content-section">
                            <label>Clear all service worker cache (for pwa)</label>
                            <button class="btn btn-developer" @click="${() => window.clearWiskPWA()}">Clear</button>
                        </div>

                        <div class="menu-item-static content-section">
                            <label>Update Wisk PWA</label>
                            <button class="btn btn-developer" @click="${async () => {
                                await window.clearWiskPWA();
                                window.updateWiskPWA();
                            }}">Update</button>
                        </div>

                        <div class="menu-item-static content-section">
                            <label>Copy Template Configurations</label>
                            <button class="btn btn-developer" @click="${() => this.copyTemplateConfigurations()}">Copy</button>
                        </div>

                        <div class="menu-item-static content-section content-section--column">
                            <div style="display: flex; flex-direction: row; gap: var(--gap-2); align-items: center; justify-content: space-between; width: 100%;">
                                <label>Add Theme Object</label>
                                <button class="btn btn-developer" 
                                    @click="${() => wisk.theme.addTheme(this.shadowRoot.querySelector('#theme-tx').value)}">Apply</button>
                            </div>
                            
                            <textarea class="select-dropdown" id="theme-tx" placeholder="Enter theme object here" 
                                style="height: 200px; resize: none; font-family: var(--font-mono); width: 100%;"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Account View -->
                <div class="view ${this.currentView === 'account' ? 'active' : ''}">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <img src="/a7/forget/dialog-back.svg" alt="Back" @click="${this.showSettingsView}" class="icon" draggable="false"/>
                                <img src="/a7/forget/dialog-x.svg" alt="Close" @click="${() => {
                                    wisk.editor.hideMiniDialog();
                                }}" class="icon" draggable="false" style="padding: var(--padding-3);"/>
                            </div>
                            <label class="header-title">Account</label>
                        </div>
                    </div>

                    <div class="content-section" style="display: ${document.querySelector('auth-component') ? 'none' : 'flex'};">
                        <label>Username</label>
                        <div style="display: ${this.showUsernameEdit ? 'none' : 'flex'};" class="username-controls">
                            <label id="acc-username" style="display: ${this.showUsernameEdit ? 'none' : 'block'}">loading...</label>
                            <button class="action-button" @click="${this.showEdit}">
                                <img src="/a7/plugins/options-element/pencil.svg" alt="Edit" class="icon" draggable="false"/>
                            </button>
                        </div>
                        <div style="display: ${this.showUsernameEdit ? 'flex' : 'none'};" class="username-controls">
                            <input id="acc-username-edit" placeholder="username" @input="${e => {
                                this.handleUsernameInput();
                            }}" class="username-field"/>
                            <button class="action-button" @click="${() => (this.showUsernameEdit = false)}">
                                <img src="/a7/plugins/options-element/x.svg" alt="Cancel" class="icon" draggable="false"/>
                            </button>
                            <button class="action-button" @click="${this.saveUsername}">
                                <img src="/a7/plugins/options-element/check.svg" alt="Save" class="icon" draggable="false"/>
                            </button>
                        </div>
                    </div>

                    <div class="content-section" style="display: ${document.querySelector('auth-component') ? 'none' : 'flex'};">
                        <label>Email</label>
                        <label id="acc-email">loading...</label>
                    </div>

                    <div class="content-section" style="display: ${document.querySelector('auth-component') ? 'none' : 'flex'};">
                        <label>Plan</label>
                        <label id="acc-plan">loading...</label>
                    </div>

                    <div class="content-section" style="display: ${document.querySelector('auth-component') ? 'none' : 'flex'};">
                        <label>Sign Out</label>
                        <button id="signOut" class="btn btn-danger" @click="${() => wisk.auth.logOut()}">Sign Out</button>
                    </div>

                    <div class="content-section signin-banner" style="display: ${document.querySelector('#auth') ? 'flex' : 'none'}"> 
                        <p style="color: var(--bg-2); font-size: larger;">Sign in</p>
                        <div style="color: var(--bg-2); display: flex; flex-direction: column; gap: var(--gap-1); flex: 1; width: 100%">
                            <div style="width: 100%; display: flex">
                                <p style="flex: 1">• Save your work</p>
                                <p style="flex: 1">• AI Autocomplete</p>
                            </div>
                            <div style="width: 100%; display: flex">
                                <p style="flex: 1">• Citations</p>
                                <p style="flex: 1">• Sync across devices</p>
                            </div>
                            <div style="width: 100%; display: flex">
                                <p style="flex: 1">• Collaboration</p>
                                <p style="flex: 1">• Share your work</p>
                            </div>
                        </div>
                    </div>

                    <div class="content-section" style="display: ${document.querySelector('auth-component') ? 'flex' : 'none'};">
                        <label>Sign In</label>
                        <p style="color: var(--fg-2);">Coming soon...</p>
                        <!--
                        <button id="signIn" class="btn btn-primary" @click="${() => {
                            wisk.utils.showToast('Meow Meow', 3000);
                            document.querySelector('auth-component').show();
                        }}">Sign In</button>
                        -->
                    </div>
                </div>

                <!-- Settings View -->
                <div class="view ${this.currentView === 'settings' ? 'active' : ''}">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <img src="/a7/forget/dialog-back.svg" alt="Back" @click="${this.showMainView}" class="icon" draggable="false"/>
                                <img src="/a7/forget/dialog-x.svg" alt="Close" @click="${() => {
                                    wisk.editor.hideMiniDialog();
                                }}" class="icon" draggable="false" style="padding: var(--padding-3);"/>
                            </div>
                            <label class="header-title">Settings</label>
                        </div>
                    </div>

                    <div class="content-section" id="check-update" style="display: ${window.location.href.includes('30007') ? 'flex' : 'none'};">
                        <label>Check for Updates</label>
                        <button class="btn btn-primary" @click="${() => this.checkForUpdatesX()}">Check</button>
                    </div>

                    <div class="content-section" id="update-available" style="display: none">
                        <label>Check for Updates</label>
                        <button class="btn btn-primary" @click="${() => this.performUpdateX()}">Update</button>
                    </div>

                    <div class="menu-item" @click="${this.showAccountsView}">
                        <label>Account</label>
                        <img src="/a7/iconoir/right.svg" alt="Account" class="icon" draggable="false"/>
                    </div>

                    <div class="menu-item" @click="${this.showAboutView}">
                        <label>About</label>
                        <img src="/a7/iconoir/right.svg" alt="About" class="icon" draggable="false"/>
                    </div>

                    <div class="menu-item" @click="${this.showChangelogView}">
                        <label>Changelog</label>
                        <img src="/a7/iconoir/right.svg" alt="Changelog" class="icon" draggable="false"/>
                    </div>

                    <div class="menu-item" @click="${this.showDeveloperView}">
                        <label>Developer Options</label>
                        <img src="/a7/iconoir/right.svg" alt="Developer" class="icon" draggable="false"/>
                    </div>
                </div>

                <!-- Themes View -->
                <div class="view ${this.currentView === 'themes' ? 'active' : ''}">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <img src="/a7/forget/dialog-back.svg" alt="Back" @click="${this.showMainView}" class="icon" draggable="false"/>
                                <img src="/a7/forget/dialog-x.svg" alt="Close" @click="${() => {
                                    wisk.editor.hideMiniDialog();
                                }}" class="icon" draggable="false" style="padding: var(--padding-3);"/>
                            </div>
                            <label class="header-title">Themes</label>
                        </div>
                    </div>

                    <div class="themes-grid">
                        ${wisk.theme.getThemes().map(
                            theme => html`
                                <div
                                    class="theme-card ${wisk.theme.getTheme() == theme.name ? 'selected' : ''}"
                                    @click="${() => this.changeTheme(theme.name)}"
                                >
                                    <div class="theme-preview" style="background-color: ${theme['--bg-1']};">
                                        <div
                                            style="
                                            border-top: 1px solid ${theme['--border-1']}; 
                                            border-left: 1px solid ${theme['--border-1']};
                                            border-top-left-radius: ${theme['--radius']}; 
                                            padding: ${theme['--padding-w1']};
                                            width: 70%; 
                                            display: block; 
                                            margin-left: auto; 
                                            height: 70%;
                                            filter: ${theme['--drop-shadow']};
                                            background-color: ${theme['--bg-2']}; 
                                        "
                                        >
                                            <h1 style="font-family: ${theme['--font']}; color: ${theme['--fg-1']};">
                                                Aa
                                                <span style="display: inline-flex;">
                                                    <span
                                                        style="display: inline-block; height: 10px; width: 10px; background-color: ${theme[
                                                            '--fg-red'
                                                        ]}"
                                                    ></span>
                                                    <span
                                                        style="display: inline-block; height: 10px; width: 10px; background-color: ${theme[
                                                            '--fg-green'
                                                        ]}"
                                                    ></span>
                                                    <span
                                                        style="display: inline-block; height: 10px; width: 10px; background-color: ${theme[
                                                            '--fg-blue'
                                                        ]}"
                                                    ></span>
                                                </span>
                                            </h1>
                                            <span style="font-family: ${theme['--font']}; color: ${theme['--fg-2']};">Aa</span>
                                        </div>
                                    </div>
                                    <span class="theme-name">${theme.name}</span>
                                </div>
                            `
                        )}
                    </div>
                </div>

                <!-- Snapshots View -->
                <div class="view ${this.currentView === 'snapshots' ? 'active' : ''}">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <img src="/a7/forget/dialog-back.svg" alt="Back" @click="${this.showMainView}" class="icon" draggable="false"/>
                                <img src="/a7/forget/dialog-x.svg" alt="Close" @click="${() => {
                                    wisk.editor.hideMiniDialog();
                                }}" class="icon" draggable="false" style="padding: var(--padding-3);"/>
                            </div>
                            <label class="header-title">Snapshots</label>
                        </div>
                    </div>

                    <div class="content-section" style="border-bottom: none">
                        <label style="display: flex; gap: 10px; align-items: center;">
                            Create Snapshot
                            <img src="/a7/plugins/options-element/info.svg" alt="Info" class="icon" draggable="false" @click="${() => {
                                this.showSnapshotInfo = !this.showSnapshotInfo;
                                this.requestUpdate();
                            }}" style="width: unset" />
                        </label>

                        <button class="btn btn-primary" @click="${() => {
                            this.createCurrentSnapshot();
                        }}">Create</button>
                    </div>

                    <div class="snapshot-info" style="display: ${this.showSnapshotInfo ? 'block' : 'none'};">
                        <p>• You can create snapshots of your document to save your work at any point and restore it later.</p>
                        <p>• You can create as many as you want.</p>
                        <p>• Snapshots are not included in the document.</p>
                    </div>

                    <div class="snapshot-list-outer">
                        <div class="snapshot-list">
                            ${this.snapshots.map(
                                snapshot => html`
                                    <div class="snapshot-section">
                                        <div class="">
                                            <p>
                                                ${snapshot.title}
                                                <span style="color: var(--fg-2);"
                                                    >${new Date(snapshot.timestamp).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    })}</span
                                                >
                                            </p>
                                        </div>
                                        <button class="btn btn-secondary" @click="${() => this.restoreSnapshot(snapshot)}">Restore</button>
                                    </div>
                                `
                            )}
                        </div>
                    </div>
                </div>

                <!-- Changelog View -->
                <div class="view ${this.currentView === 'changelog' ? 'active' : ''}">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <img src="/a7/forget/dialog-back.svg" alt="Back" @click="${this.showSettingsView}" class="icon" draggable="false"/>
                                <img src="/a7/forget/dialog-x.svg" alt="Close" @click="${() => {
                                    wisk.editor.hideMiniDialog();
                                }}" class="icon" draggable="false" style="padding: var(--padding-3);"/>
                            </div>
                            <label class="header-title">Changelog</label>
                        </div>
                    </div>

                    <div style="flex: 1; overflow-y: auto">
                        <p style="color: var(--fg-2); font-size: 14px; padding: var(--padding-3) 0;">(more like my devlog)</p>
                        <div class="content-section content-section--column" style="white-space: break-spaces; font-family: var(--font-mono); user-select: text;">${this.changelog}</div>
                    </div>
                </div>

                <!-- About View -->
                <div class="view ${this.currentView === 'about' ? 'active' : ''}">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <img src="/a7/forget/dialog-back.svg" alt="Back" @click="${this.showSettingsView}" class="icon" draggable="false"/>
                                <img src="/a7/forget/dialog-x.svg" alt="Close" @click="${() => {
                                    wisk.editor.hideMiniDialog();
                                }}" class="icon" draggable="false" style="padding: var(--padding-3);"/>
                            </div>
                            <label class="header-title">About</label>
                        </div>
                    </div>

                    <div style="flex: 1; overflow-y: auto">
                        <div class="content-section content-section--column">
                            <h1 style="color: var(--fg-1); display: flex; width: 100%; align-items: center; justify-content: center; gap: 12px; font-weight: 500">
                                <img src="/a7/wisk-logo.svg" alt="Wisk" style="width: 38px; filter: var(--themed-svg)" draggable="false"/> Wisk
                            </h1>
                            <h3 style="color: var(--fg-1); width: 100%; text-align: center; font-weight: 500">Your Workspace, Built Your Way.</h3>
                            <p style="color: var(--fg-2); text-align: center; width: 100%; font-size: 14px">
                                Notes, reports, tasks, and collaboration — offline and customizable. (yes we have AI too!)
                            </p>
                            <div style="display: flex; gap: 10px; justify-content: center; width: 100%; font-size: 14px;">
                                <a href="https://github.com/sohzm/wisk" target="_blank" rel="noopener noreferrer" class="link-blue">Github</a>
                                <a href="https://discord.gg/D8tQCvgDhu" target="_blank" rel="noopener noreferrer" class="link-blue">Discord</a>
                                <a href="https://twitter.com/wisk_cc" target="_blank" rel="noopener noreferrer" class="link-blue">Twitter</a>
                            </div>
                        </div>

                        <div class="content-section content-section--column">
                            <h3 style="color: var(--fg-2); font-weight: 500">License</h3>
                            <div style="display: flex; flex-direction: column; gap: var(--gap-1)">
                                <p style="color: var(--fg-2); font-size: 14px">
                                    Licensed under the Functional Source License (FSL), Version 1.1, with Apache License Version 2.0 as the Future License.
                                    See the <a href="https://app.wisk.cc/LICENSE.md" target="_blank" class="link-blue">LICENSE.md</a> for more details.
                                </p>
                            </div>
                        </div>

                        <div class="content-section content-section--column">
                            <h3 style="color: var(--fg-2); font-weight: 500">Credits</h3>
                            <div style="display: flex; flex-direction: column; gap: var(--gap-1); font-size: 14px">
                                <p style="color: var(--fg-2)">
                                    All icons in the webapp are from
                                    <ul>
                                        <li>• <a href="https://iconoir.com/" target="_blank" class="link-blue">Iconoir</a>, An open source icons library with 1500+ icons.</li>
                                        <li>• <a href="https://www.svgrepo.com/collection/zest-interface-icons/" target="_blank" class="link-blue">Zest Interface Icons</a>, A collection of 1000+ free SVG icons.</li>
                                        <li>• <a href="https://heroicons.com/" target="_blank" class="link-blue">Heroicons</a>, Beautiful hand-crafted SVG icons, by the makers of Tailwind CSS.</li>
                                        <li>• <a href="https://github.com/sohzm" target="_blank" class="link-blue">Me</a>, I made some too :)</li>
                                    </ul>
                                </p>
                                <p style="color: var(--fg-2)">
                                    Fonts are taken from <a href="https://fonts.google.com/" target="_blank" class="link-blue">Google Fonts</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('options-component', OptionsComponent);
