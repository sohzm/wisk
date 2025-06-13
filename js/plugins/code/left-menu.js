import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class LeftMenu extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            color: var(--fg-1);
            transition: all 0.2s ease;
            font-size: 14px;
            user-select: none;
        }
        ul {
            list-style-type: none;
        }
        li {
            padding: var(--padding-2) 0;
            position: relative;
        }
        li a {
            color: var(--fg-1);
            text-decoration: none;
            flex: 1;
            display: block;
            padding: var(--padding-w1);
            border-radius: var(--radius);

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .vert-nav {
            display: flex;
            flex-direction: column;
        }
        .vert-nav-button {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-w1);
            color: var(--fg-2);
            background-color: transparent;
            text-decoration: none;
            cursor: pointer;
            outline: none;
            border: none;
            width: 100%;
            border-radius: var(--radius);
            font-weight: 500;
        }
        .vert-nav-button img {
            width: 16px;
        }
        .vert-nav-button:hover {
            background-color: var(--bg-3);
        }
        .vert-nav-button:active {
            background-color: var(--bg-3);
        }
        li a:hover {
            background-color: var(--bg-2);
            color: var(--fg-1);
        }
        li a:active {
            background-color: var(--bg-3);
        }
        .outer {
            padding: 0 var(--padding-2);
            display: flex;, 
            flex-direction: column;
            height: 100%;
            gap: var(--gap-1);
            flex-direction: column;
        }
        .new {
            display: flex;
            text-align: center;
            text-decoration: none;
            border-radius: var(--radius);
            color: var(--fg-accent);
            gap: var(--gap-2);
            align-items: center;
            justify-content: center;
            white-space: nowrap;
            font-weight: 500;
        }
        .new:hover {
            background-color: var(--bg-2);
            color: var(--fg-accent);
        }
        .new:active {
            background-color: var(--bg-3);
        }
        .new-img {
            width: 20px;
            height: 20px;
        }
        #search {
            width: 100%;
            color: var(--fg-1);
            font-size: 1rem;
            outline: none;
            border: none;
            background-color: transparent;
            font-size: 14px;
        }
        .search-div img {
            width: 20px;
            height: 20px;
        }
        .search-div {
            padding: var(--padding-w1);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            background-color: var(--bg-2);
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            flex: 1;
        }
        .od {
            padding: var(--padding-w1);
            color: var(--fg-1);
            background-color: var(--bg-2);
            border-radius: var(--radius);
            outline: none;
            border: 1px solid var(--bg-3);
            transition: all 0.2s ease;
            width: 100%;
        }
        .email {
            outline: none;
            border: none;
            flex: 1;
            background-color: transparent;
            color: var(--fg-1);
        }
        .od:has(.srch:focus) {
            border-color: var(--border-2);
            background-color: var(--bg-1);
            box-shadow: 0 0 0 2px var(--bg-3);
        }
        .item {
            display: flex;
            align-items: center;
            padding: 0;
        }
        .more-options {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
            border-radius: 4px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
        }
        .item:hover .more-options {
            opacity: 1;
        }
        .more-options:hover {
            background-color: var(--bg-2);
        }
        .more-options:active {
            background-color: var(--bg-3);
        }
        .dropdown {
            position: absolute;
            right: 0;
            top: 100%;
            background-color: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            padding: var(--padding-1);
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            min-width: 120px;
            animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .dropdown-item {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-2);
            cursor: pointer;
            border-radius: var(--radius);
            color: var(--fg-1);
            text-decoration: none;
            font-weight: 500;
            font-size: 13px;
        }
        .delete-item {
            color: #e11d48;
        }
        .delete-item img {
            filter: invert(23%) sepia(94%) saturate(4465%) hue-rotate(336deg) brightness(90%) contrast(88%);
        }
        .dropdown-item:hover {
            background-color: var(--bg-2);
        }
        .dropdown-item:active {
            background-color: var(--bg-3);
        }
        img {
            width: 22px;
            filter: var(--themed-svg);
            opacity: 0.8;
        }
        ::placeholder {
            color: var(--fg-2);
        }
        .title {
            padding: var(--padding-w1);
            padding-top: var(--padding-4);
            color: var(--fg-2);
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }
        .add-child {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
            border-radius: 4px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
            height: 24px;
            width: 24px;
        }
        .item:hover .add-child {
            opacity: 1;
        }
        .add-child:hover {
            background-color: var(--bg-2);
            color: var(--fg-1);
        }
        .add-child:active {
            background-color: var(--bg-3);
        }
        .child-item {
            padding-left: 20px;
        }
        @media (max-width: 900px) {
            .more-options, .add-child {
                opacity: 1;
            }
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
        
        /* New styles for folder toggle */
        .toggle-folder {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            cursor: pointer;
        }
        .toggle-folder img {
            width: 14px;
            height: 14px;
            transition: transform 0.2s ease;
        }
        .toggle-folder.expanded img {
        }
    `;

    static properties = {
        filteredList: { type: Array },
        openDropdownId: { type: String },
        hoveredItemId: { type: String },
        hierarchicalList: { type: Array },
        expandedFolders: { type: Object },
    };

    constructor() {
        super();
        this.list = [];
        this.filteredList = [];
        this.openDropdownId = null;
        this.hoveredItemId = null;
        this.hierarchicalList = [];
        this.expandedFolders = {};

        // Add click event listener to close dropdown when clicking outside
        this.boundHandleClickOutside = this.handleClickOutside.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('click', this.boundHandleClickOutside);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('click', this.boundHandleClickOutside);
    }

    handleClickOutside(event) {
        // Close dropdown if the click was outside of any dropdown
        if (this.openDropdownId && !event.composedPath().some(el => el.classList && el.classList.contains('more-options'))) {
            this.openDropdownId = null;
            this.requestUpdate();
        }
    }

    opened() {
        if (wisk.editor.readonly) return;
        this.setList();
    }

    // Helper to check if an ID is a child of a parent ID
    isChildOf(id, parentId) {
        return id !== parentId && id.startsWith(parentId + '.');
    }

    // Helper to get parent ID
    getParentId(id) {
        const lastDotIndex = id.lastIndexOf('.');
        return lastDotIndex > -1 ? id.substring(0, lastDotIndex) : null;
    }

    // Helper to get nesting level
    getNestingLevel(id) {
        return id.split('.').length - 1;
    }

    // Helper to check if an item has children
    hasChildren(id) {
        return this.list.some(item => this.isChildOf(item.id, id));
    }

    // Build hierarchical structure efficiently
    buildHierarchicalList() {
        // Step 1: Create a map of items by ID for quick access
        const itemsMap = new Map();
        this.list.forEach(item => {
            // Clone the item and add properties for hierarchical structure
            const enhancedItem = {
                ...item,
                children: [],
                level: this.getNestingLevel(item.id),
                parentId: this.getParentId(item.id),
                hasChildren: this.hasChildren(item.id),
            };
            itemsMap.set(item.id, enhancedItem);
        });

        // Step 2: Build the tree structure
        const rootItems = [];
        itemsMap.forEach(item => {
            if (item.parentId) {
                const parent = itemsMap.get(item.parentId);
                if (parent) {
                    parent.children.push(item);
                } else {
                    rootItems.push(item); // No parent found, add to root
                }
            } else {
                rootItems.push(item); // It's a root item
            }
        });

        // Step 3: Flatten the tree for rendering with proper levels
        const flatList = [];

        const flattenTree = (items, level) => {
            items.forEach(item => {
                flatList.push({ ...item, level });
                if (item.children && item.children.length > 0) {
                    flattenTree(item.children, level + 1);
                }
            });
        };

        flattenTree(rootItems, 0);
        return flatList;
    }

    // Create a filtered view of the hierarchical list based on expanded state
    getFilteredHierarchicalList() {
        // Start with just the root level items
        const result = [];

        // Helper function to determine if an item should be visible
        const isVisible = item => {
            if (item.level === 0) return true;

            // Check if all parent folders are expanded
            let currentId = item.parentId;
            while (currentId) {
                if (!this.expandedFolders[currentId]) {
                    return false;
                }
                currentId = this.getParentId(currentId);
            }

            return true;
        };

        // Filter the hierarchical list based on expanded state
        this.hierarchicalList.forEach(item => {
            if (isVisible(item)) {
                result.push(item);
            }
        });

        return result;
    }

    async setList() {
        try {
            var l = await wisk.db.getAllPages();
            console.log(l);
            this.list = [];
            for (var i = 0; i < l.length; i++) {
                var item = await wisk.db.getPage(l[i]);
                console.log(item);

                // Get emoji from first element if available
                let emoji = null;
                if (item.data.elements && item.data.elements.length > 0 && item.data.elements[0].value && item.data.elements[0].value.emoji) {
                    emoji = item.data.elements[0].value.emoji;
                }

                this.list.push({
                    id: item.id,
                    name: item.data.config.name,
                    emoji: emoji,
                });
            }

            // Build hierarchical structure
            this.hierarchicalList = this.buildHierarchicalList();
            this.filteredList = this.getFilteredHierarchicalList();
            this.requestUpdate();
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    }

    async removeItem(id, e) {
        // Stop event propagation to prevent closing dropdown immediately
        if (e) {
            e.stopPropagation();
        }

        var result = confirm('Are you sure you want to delete this page and all its children?');
        if (!result) {
            return;
        }

        try {
            // Find all child pages to delete as well
            const childPages = this.list.filter(item => item.id !== id && item.id.startsWith(id + '.')).map(item => item.id);

            // Delete the main page
            await wisk.db.removePage(id);

            // Delete all child pages
            for (const childId of childPages) {
                await wisk.db.removePage(childId);
            }

            // Update the UI state
            this.list = this.list.filter(item => item.id !== id && !item.id.startsWith(id + '.'));
            this.hierarchicalList = this.buildHierarchicalList();
            this.filteredList = this.getFilteredHierarchicalList();
            this.requestUpdate();

            // Close the dropdown
            this.openDropdownId = null;

            // If the deleted page is the current one, redirect to home
            if (id == wisk.editor.pageId || childPages.includes(wisk.editor.pageId)) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    }

    // Function to handle creating a new child page
    createChildPage(parentId, e) {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        // Navigate to new page with parent_id parameter
        window.location.href = `/?parent_id=${parentId}`;
    }

    openInEditor() {
        var url = 'https://app.wisk.cc?id=' + wisk.editor.pageId;
        window.open(url, '_blank');
    }

    toggleDropdown(id, e) {
        e.preventDefault();
        e.stopPropagation();
        this.openDropdownId = this.openDropdownId === id ? null : id;
    }

    // Toggle folder expanded/collapsed state
    toggleFolder(id, e) {
        e.preventDefault();
        e.stopPropagation();

        this.expandedFolders = {
            ...this.expandedFolders,
            [id]: !this.expandedFolders[id],
        };

        // Update the filtered list based on new expanded state
        this.filteredList = this.getFilteredHierarchicalList();
        this.requestUpdate();
    }

    render() {
        if (wisk.editor.readonly) {
            return html`
                <div class="outer">
                    <button @click=${this.openInEditor} class="new" style="cursor: pointer;">Open in Editor</button>
                </div>
            `;
        }

        return html`
            <div class="outer">
                <div class="vert-nav">
                    <button class="vert-nav-button" @click=${() => (window.location.href = '/')}>
                        <img src="/a7/forget/new-3.svg" class="new-img" /> New Page
                    </button>
                    <button class="vert-nav-button" @click=${() => document.querySelector('search-element').show()}>
                        <img src="/a7/forget/search-3.svg" class="new-img" /> Search
                    </button>
                    <button class="vert-nav-button" @click=${() => (window.location.href = '/?id=home')}>
                        <img src="/a7/forget/home-2.svg" class="new-img" /> Home
                    </button>
                    <button
                        class="vert-nav-button"
                        @click=${() => document.querySelector('template-dialog').show()}
                        style="display: ${localStorage.getItem('devMode') === 'true' ? 'flex' : 'none'};"
                    >
                        <img src="/a7/forget/layout-2.svg" class="new-img" /> Templates
                    </button>
                    <p class="title">My Pages</p>
                </div>

                <ul style="flex: 1; overflow: auto;">
                    ${this.filteredList.map(
                        item => html`
                            <li
                                class="item ${item.level > 0 ? 'child-item' : ''}"
                                style="padding-left: ${item.level * 20}px;"
                                @mouseenter=${() => (this.hoveredItemId = item.id)}
                                @mouseleave=${() => {
                                    this.hoveredItemId = null;
                                    // Close dropdown when mouse leaves the item
                                    if (this.openDropdownId === item.id) {
                                        this.openDropdownId = null;
                                    }
                                }}
                            >
                                ${item.hasChildren
                                    ? html`
                                          <div
                                              class="toggle-folder ${this.expandedFolders[item.id] ? 'expanded' : ''}"
                                              @click=${e => this.toggleFolder(item.id, e)}
                                          >
                                              <img
                                                  src=${this.expandedFolders[item.id] ? '/a7/forget/down-arrow.svg' : '/a7/forget/right-arrow.svg'}
                                                  alt="Toggle folder"
                                              />
                                          </div>
                                      `
                                    : html` <div style="width: 24px;"></div> `}

                                <a href="?id=${item.id}" style="display: flex; gap: var(--gap-2); align-items: center; font-size: 13px">
                                    ${item.emoji
                                        ? html`<span style="font-size: 16px; line-height: 1;">${item.emoji}</span>`
                                        : html`<img src="/a7/forget/page-1.svg" alt="File" style="width: 16px; height: 16px; opacity: 0.8" />`}
                                    ${item.name}
                                </a>
                                <div class="add-child" @click=${e => this.createChildPage(item.id, e)}>
                                    <img src="/a7/forget/plus.svg" alt="Add child" style="width: 16px; height: 16px;" />
                                </div>
                                <div class="more-options" @click=${e => this.toggleDropdown(item.id, e)}>
                                    <img src="/a7/forget/morex.svg" alt="More options" style="width: 16px; height: 16px;" />
                                    ${this.openDropdownId === item.id
                                        ? html`
                                              <div class="dropdown">
                                                  <div class="dropdown-item delete-item" @click=${e => this.removeItem(item.id, e)}>
                                                      <img src="/a7/forget/trash.svg" alt="Delete" style="width: 16px; height: 16px;" />
                                                      Delete
                                                  </div>
                                              </div>
                                          `
                                        : ''}
                                </div>
                            </li>
                        `
                    )}
                </ul>
                <div style="padding: var(--padding-4) 0;">
                    <button class="vert-nav-button" @click=${() => document.querySelector('help-dialog').show()}>
                        <img src="/a7/forget/help-3.svg" class="new-img" /> Help
                    </button>
                    <button class="vert-nav-button" @click=${() => document.querySelector('feedback-dialog').show()}>
                        <img src="/a7/forget/feedback.svg" class="new-img" /> Feedback
                    </button>
                </div>
            </div>
        `;
    }
}

customElements.define('left-menu', LeftMenu);
