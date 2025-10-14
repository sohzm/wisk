import { LitElement, html, css } from '/a7/cdn/lit-core-2.7.4.min.js';

class PluginManager extends LitElement {
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
            font-weight: 500;
            flex: 1;
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
            padding: var(--padding-w2);
            border-radius: calc(var(--radius-large) * 20);
            transition: all 0.2s ease;
            font-weight: 500;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
        }
        .btn-primary {
            background: var(--fg-1);
            color: var(--bg-1);
            font-weight: 600;
            border-radius: calc(var(--radius-large) * 20);
            border: 2px solid transparent;
        }
        .btn-primary:hover:not(:disabled) {
            background-color: transparent;
            border: 2px solid var(--fg-1);
            color: var(--fg-1);
        }
        .btn-primary:disabled {
            background-color: var(--bg-3);
            color: var(--fg-2);
            border: 2px solid transparent;
            cursor: not-allowed;
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
        .search-container {
            overflow: hidden;
            transition: width 0.3s ease;
            width: 60px;
            display: flex;
            align-items: center;
        }
        .search-container.expanded {
            width: 250px;
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
        img {
            filter: var(--themed-svg);
        }
        .content-section {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            color: var(--fg-1);
            align-items: center;
            padding: var(--padding-3) 0;
            border-radius: 0;
        }
        .content-section--column {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--gap-2);
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
        @media (max-width: 768px) {
            .content-section {
                padding: var(--padding-3) 0;
            }
        }
        @media (max-width: 900px) {
            img[src*='/a7/forget/dialog-x.svg'] {
                display: none;
            }
        }
        img[src*='/a7/forget/dialog-x.svg'] {
            width: unset;
        }
        .markdown-plugin-description {
            line-height: 1.6;
            word-wrap: break-word;
        }
        .markdown-plugin-description h1,
        .markdown-plugin-description h2,
        .markdown-plugin-description h3,
        .markdown-plugin-description h4 {
            margin: 15px 0 10px 0;
            color: var(--fg-1);
        }
        .markdown-plugin-description h1 {
            font-size: 1.5em;
            font-weight: bold;
        }
        .markdown-plugin-description h2 {
            font-size: 1.3em;
            font-weight: bold;
        }
        .markdown-plugin-description h3 {
            font-size: 1.1em;
            font-weight: bold;
        }
        .markdown-plugin-description p {
            margin: 10px 0;
        }
        .markdown-plugin-description ul,
        .markdown-plugin-description ol {
            margin: 10px 0;
            padding-left: 25px;
        }
        .markdown-plugin-description li {
            margin: 5px 0;
        }
        .markdown-plugin-description blockquote {
            border-left: 3px solid var(--fg-1);
            margin: 15px 0;
            padding-left: 15px;
            color: var(--fg-1);
        }
        .markdown-plugin-description code {
            background-color: var(--bg-3);
            padding: 2px 4px;
            border-radius: 3px;
            font-family: monospace;
        }
        .markdown-plugin-description pre {
            background-color: var(--bg-3);
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 10px 0;
        }
        .markdown-plugin-description pre code {
            background: none;
            padding: 0;
        }
        .markdown-plugin-description table {
            border-collapse: collapse;
            width: 100%;
            margin: 10px 0;
        }
        .markdown-plugin-description th,
        .markdown-plugin-description td {
            border: 1px solid var(--bg-3);
            padding: 8px;
            text-align: left;
        }
        .markdown-plugin-description th {
            background-color: var(--bg-2);
            font-weight: bold;
        }
        .markdown-plugin-description img {
            max-width: 100%;
            height: auto;
            margin: 10px 0;
            filter: none !important;
        }
        .markdown-plugin-description hr {
            border: none;
            border-top: 1px solid var(--bg-3);
            margin: 20px 0;
        }
        .markdown-plugin-description a {
            color: var(--fg-blue);
            text-decoration: none;
        }
        .markdown-plugin-description a:hover {
            text-decoration: underline;
        }
        .markdown-plugin-description li::marker {
            color: var(--fg-1);
        }
    `;

    static properties = {
        plugins: { type: Array },
        searchTerm: { type: String },
        currentView: { type: String },
        selectedPlugin: { type: Object },
        showPluginSearch: { type: Boolean },
    };

    opened() {
        this.searchTerm = '';
        this.currentView = 'plugins';
        this.requestUpdate();
    }

    constructor() {
        super();
        this.plugins = [];
        this.searchTerm = '';
        this.currentView = 'plugins';
        this.showPluginSearch = false;
        this.selectedPlugin = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadPlugins();
    }

    loadPlugins() {
        if (wisk.plugins.pluginData && wisk.plugins.pluginData.list) {
            this.plugins = Object.values(wisk.plugins.pluginData.list).filter(plugin => !wisk.plugins.defaultPlugins.includes(plugin.name));
        }
    }

    handleSearch(e) {
        this.searchTerm = e.target.value.toLowerCase();
    }

    togglePlugin(plugin) {
        this.selectedPlugin = plugin;
        this.currentView = 'plugin-details';
    }

    showPluginsView() {
        this.currentView = 'plugins';
    }

    installButtonClicked() {
        if (this.isPluginInstalled(this.selectedPlugin.name)) {
            this.handlePluginUninstall(this.selectedPlugin);
        } else {
            this.handlePluginInstall(this.selectedPlugin);
        }
    }

    async handlePluginInstall(plugin) {
        await wisk.plugins.loadPlugin(plugin.name);
        await wisk.editor.addConfigChange('document.config.plugins.add', plugin.name);
        this.requestUpdate();
    }

    async handlePluginUninstall(plugin) {
        var pluginContents = wisk.plugins.pluginData.list[plugin.name].contents;
        for (const element in wisk.editor.document.data.elements) {
            for (const content in pluginContents) {
                if (wisk.editor.document.data.elements[element].component == pluginContents[content].component) {
                    wisk.utils.showToast('Plugin is currently being used, please remove the block first', 3000);
                    return;
                }
            }
        }

        await wisk.editor.addConfigChange('document.config.plugins.remove', plugin.name);
        window.location.reload();
    }

    isPluginInstalled(pluginName) {
        return wisk.plugins.loadedPlugins.includes(pluginName);
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

    mdtoText(md) {
        const html = marked.parse(md);
        const newDiv = document.createElement('div');
        newDiv.innerHTML = html;

        const para = newDiv.querySelector('p');

        return para ? para.textContent.trim() : '';
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

        filteredPlugins = filteredPlugins.filter(plugin => !plugin.hide);

        return html`
            <div class="container">
                <!-- Plugins View -->
                <div class="view ${this.currentView === 'plugins' ? 'active' : ''}">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <label class="header-title">Plugins</label>
                                <img
                                    src="/a7/forget/dialog-x.svg"
                                    alt="Close"
                                    @click="${() => {
                                        wisk.editor.hideMiniDialog();
                                    }}"
                                    class="icon"
                                    draggable="false"
                                    onboarding-plugins-close
                                    style="padding: var(--padding-3);"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="filter-tags">
                        <div class="search-container ${this.showPluginSearch || this.searchTerm !== '' ? 'expanded' : ''}">
                            <input
                                id="pluginSearch"
                                type="text"
                                placeholder="Search plugins"
                                class="search-input"
                                @input="${this.handleSearch}"
                                style="
                                display: ${this.showPluginSearch ? 'block' : this.searchTerm === '' ? 'none' : 'block'};"
                                @blur="${() => {
                                    if (this.searchTerm === '') {
                                        this.showPluginSearch = false;
                                    }
                                }}"
                            />
                            <div
                                class="filter-tag"
                                @click="${() => this.tagClicked('search')}"
                                style="display: ${this.showPluginSearch ? 'none' : this.searchTerm === '' ? 'block' : 'none'}"
                            >
                                <img src="/a7/forget/search-thicc.svg" alt="Search" style="width: 17px;" />
                            </div>
                        </div>
                        <div class="filter-tag ${this.searchTerm === '' ? 'filter-tag-selected' : ''}" @click="${() => this.tagClicked('')}">All</div>
                        <div
                            class="filter-tag ${this.searchTerm === '#programming' ? 'filter-tag-selected' : ''}"
                            @click="${() => this.tagClicked('programming')}"
                        >
                            Programming
                        </div>
                        <div
                            class="filter-tag ${this.searchTerm === '#customization' ? 'filter-tag-selected' : ''}"
                            @click="${() => this.tagClicked('customization')}"
                        >
                            Customization
                        </div>
                        <div class="filter-tag ${this.searchTerm === '#blog' ? 'filter-tag-selected' : ''}" @click="${() => this.tagClicked('blog')}">
                            Blog
                        </div>
                        <div
                            class="filter-tag ${this.searchTerm === '#utility' ? 'filter-tag-selected' : ''}"
                            @click="${() => this.tagClicked('utility')}"
                        >
                            Utility
                        </div>
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
                                            <span class="card-description">${this.mdtoText(plugin.description)}</span>
                                        </div>
                                    </div>
                                `
                            )}
                        ${filteredPlugins.length === 0
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
                            : ''}
                    </div>
                </div>

                <!-- Plugin Details View -->
                <div class="view ${this.currentView === 'plugin-details' ? 'active' : ''}">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <img
                                    src="/a7/forget/dialog-back.svg"
                                    alt="Back"
                                    @click="${() => (this.currentView = 'plugins')}"
                                    class="icon"
                                    draggable="false"
                                />
                                <img
                                    src="/a7/forget/dialog-x.svg"
                                    alt="Close"
                                    @click="${() => {
                                        wisk.editor.hideMiniDialog();
                                    }}"
                                    class="icon"
                                    draggable="false"
                                    style="padding: var(--padding-3);"
                                />
                            </div>
                            <label class="header-title">Plugin Detail</label>
                        </div>
                    </div>

                    ${this.selectedPlugin
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
                                  <div class="detail-section">
                                      <div class="markdown-plugin-description" .innerHTML=${marked.parse(this.selectedPlugin.description)}></div>
                                  </div>
                              </div>
                          `
                        : ''}
                </div>
            </div>
        `;
    }
}

customElements.define('plugin-manager', PluginManager);
