import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class DialogTemplate extends LitElement {
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
            padding: 0;
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
        .icon {
            cursor: pointer;
            transition: transform 0.2s ease;
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
            gap: var(--gap-2);
            padding: var(--padding-3);
        }
        .content-section {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            color: var(--fg-1);
            align-items: center;
            padding: var(--padding-3) 0;
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
            .toggle-group {
                padding: var(--padding-3) 0;
            }
        }
        *::marker {
            color: var(--bg-1);
        }
        .hidden {
            display: none;
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
    `;

    static properties = {
        currentView: { type: String },
    };

    constructor() {
        super();
        this.currentView = 'main';
    }

    connectedCallback() {
        super.connectedCallback();
        // Initialize components or load data here
    }

    // Navigation methods - implement as needed
    showView(viewName) {
        this.currentView = viewName;
    }

    closeDialog() {
        // Implement close dialog logic here
        console.log('Dialog closed');
    }

    render() {
        return html`
            <div class="container">
                <!-- Main View -->
                <div class="view ${this.currentView === 'main' ? 'active' : ''}">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <label class="header-title">Dialog Title</label>
                                <img
                                    src="/a7/forget/dialog-x.svg"
                                    alt="Close"
                                    @click="${this.closeDialog}"
                                    class="icon"
                                    draggable="false"
                                    style="padding: var(--padding-3);"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Menu Items -->
                    <div class="menu-item" @click="${() => this.showView('secondary')}">
                        <label> <img src="/path/to/icon.svg" alt="Menu Item" class="icon" draggable="false" /> Menu Item</label>
                        <img src="/a7/iconoir/right.svg" alt="Right" class="icon" draggable="false" />
                    </div>

                    <!-- Content Section Example -->
                    <div class="content-section">
                        <label>Content Section</label>
                        <button class="btn btn-primary">Action</button>
                    </div>

                    <!-- Content Card Example -->
                    <div class="content-card">
                        <img src="/path/to/icon.svg" class="card-icon" draggable="false" />
                        <div class="card-info">
                            <span class="card-title">Card Title</span>
                            <span class="card-description">Card description goes here</span>
                        </div>
                    </div>
                </div>

                <!-- Secondary View Example -->
                <div class="view ${this.currentView === 'secondary' ? 'active' : ''}">
                    <div class="header">
                        <div class="header-wrapper">
                            <div class="header-controls">
                                <img
                                    src="/a7/forget/dialog-back.svg"
                                    alt="Back"
                                    @click="${() => this.showView('main')}"
                                    class="icon"
                                    draggable="false"
                                />
                                <img
                                    src="/a7/forget/dialog-x.svg"
                                    alt="Close"
                                    @click="${this.closeDialog}"
                                    class="icon"
                                    draggable="false"
                                    style="padding: var(--padding-3);"
                                />
                            </div>
                            <label class="header-title">Secondary View</label>
                        </div>
                    </div>

                    <!-- Secondary View Content -->
                    <div class="content-section content-section--column">
                        <h3>Secondary View Content</h3>
                        <p>Content goes here</p>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('dialog-template', DialogTemplate);
