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
            padding: 0;
            position: relative;
        }
        li a {
            color: var(--fg-1);
            text-decoration: none;
            flex: 1;
            display: block;
            padding: 0;
            border-radius: var(--radius);

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 14px;
            font-weight: 500;
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
            color: var(--fg-1);
            background-color: transparent;
            text-decoration: none;
            cursor: pointer;
            outline: none;
            border: none;
            border-radius: var(--radius);
            font-weight: 500;
        }
        .vert-nav-button img {
            width: 20px;
            height: 20px;
        }
        .vert-nav-button:hover {
            background-color: var(--bg-3);
        }
        .vert-nav-button:active {
            background-color: var(--bg-3);
        }
        .horizontal-nav {
            display: flex;
            flex-direction: row;
            gap: var(--gap-2);
        }
        .item:hover {
            background-color: var(--bg-3);
        }
        .item:active {
            background-color: var(--bg-3);
        }
        .outer {
            display: flex;
            flex-direction: column;
            height: 100%;
            gap: 0;
            flex-direction: column;
        }

        /* Top section styles */
        .top-section {
            padding: var(--padding-3);
        }

        /* Pages section styles */
        .pages-section {
            flex: 1;
            overflow: auto;
            padding: var(--padding-3);
        }

        /* Bottom section styles */
        .bottom-section {
            padding: var(--padding-3);
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
            background-color: var(--bg-1);
        }
        .item {
            display: flex;
            align-items: center;
            padding: var(--padding-w1);
            gap: var(--gap-2);
            border-radius: var(--radius);
        }
        .more-options {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
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
            min-width: 120px;
            animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-4px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
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
            border-radius: 4px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
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
            padding-left: 26px;
        }
        @media (max-width: 900px) {
            .more-options,
            .add-child {
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
        .folder-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 24px;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.2s ease;
        }
        .folder-icon:hover {
            background-color: var(--bg-2);
        }
        .folder-icon img {
            width: 20px;
            height: 20px;
        }
        .folder-icon .arrow {
            width: 20px;
            height: 20px;
            transition: transform 0.2s ease;
        }
        .folder-icon .emoji {
            font-size: 16px;
            line-height: 1;
        }
        .folder-icon .page-icon {
            width: 20px;
            height: 20px;
            opacity: 0.8;
        }

        /* Workspace styles */
        .workspace-header {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-w1);
            border-radius: var(--radius);
            cursor: pointer;
            font-weight: 600;
            font-size: 15px;
            border: 1px solid transparent;
            transition: all 0.2s ease;
            position: relative;
        }
        .workspace-header:hover {
            background-color: var(--bg-3);
        }
        .workspace-emoji {
            font-size: 18px;
        }
        .workspace-name {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .workspace-arrow {
            width: 20px;
            height: 20px;
            transition: transform 0.2s ease;
        }
        .workspace-arrow.rotated {
            transform: rotate(180deg);
        }
        .workspace-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: var(--bg-1);
            border: 1px solid var(--bg-3);
            border-radius: var(--radius);
            padding: var(--padding-3);
            z-index: 1000;
            animation: fadeIn 0.15s ease;
            margin-top: var(--padding-2);
        }
        .workspace-item {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-w1);
            cursor: pointer;
            border-radius: var(--radius);
            color: var(--fg-1);
            font-weight: 500;
            font-size: 14px;
            transition: all 0.15s ease;
        }
        .workspace-item-divider {
            border-bottom: 1px solid transparent;
            margin-bottom: var(--padding-4);
        }
        .workspace-item:hover {
            background-color: var(--bg-2);
        }
        .workspace-item.active {
            background-color: var(--bg-accent);
            color: var(--fg-accent);
        }
        .workspace-item-emoji {
            font-size: 16px;
        }
        .workspace-item-name {
            flex: 1;
        }
        .new-workspace-btn {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-w1);
            cursor: pointer;
            border-radius: var(--radius);
            color: var(--fg-accent);
            font-weight: 500;
            font-size: 14px;
            transition: all 0.15s ease;
        }
        .new-workspace-btn:hover {
            background-color: var(--bg-accent);
            color: var(--fg-accent);
        }
        .workspace-dialog {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.2s ease;
        }
        .workspace-dialog-content {
            background-color: var(--bg-1);
            border-radius: var(--radius-large);
            padding: var(--padding-4);
            max-width: 400px;
            width: 90%;
            filter: var(--drop-shadow);
        }
        .workspace-dialog-header {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            margin-bottom: var(--padding-4);
        }
        .workspace-dialog-title {
            font-size: 18px;
            font-weight: 600;
            flex: 1;
        }
        .workspace-dialog-close {
            width: 32px;
            height: 32px;
            border-radius: var(--radius);
            background-color: transparent;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .workspace-dialog-close:hover {
            background-color: var(--bg-2);
        }
        .workspace-form {
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
        }
        .workspace-emoji-section {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }
        .workspace-emoji-display {
            font-size: 32px;
            border-radius: var(--radius);
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
            transition: all 0.15s ease;
        }
        .workspace-emoji-display:hover {
            background-color: var(--bg-2);
            border-color: var(--fg-accent);
        }
        .workspace-name-input {
            flex: 1;
            padding: var(--padding-w2);
            border: 2px solid var(--bg-3);
            border-radius: var(--radius);
            background-color: var(--bg-2);
            color: var(--fg-1);
            font-size: 14px;
            outline: none;
            transition: all 0.15s ease;
        }
        .workspace-name-input:focus {
            background-color: var(--bg-1);
            border-color: var(--fg-accent);
        }
        .workspace-name-input.valid {
            border-color: var(--fg-green);
        }
        .workspace-name-input.invalid {
            border-color: var(--fg-red);
        }
        .workspace-name-input.empty {
            border-color: var(--bg-3);
        }
        .workspace-dialog-actions {
            display: flex;
            gap: var(--gap-2);
            justify-content: flex-end;
            margin-top: var(--padding-4);
        }
        .workspace-btn {
            padding: var(--padding-w2);
            border-radius: calc(var(--radius-large) * 20);
            border: 2px solid var(--bg-3);
            background-color: var(--bg-1);
            color: var(--fg-1);
            cursor: pointer;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
        }
        .workspace-btn:hover {
            background-color: var(--bg-3);
            color: var(--fg-1);
        }
        .workspace-btn.primary {
            background: var(--fg-1);
            color: var(--bg-1);
            padding: var(--padding-w2);
            font-weight: 600;
            border-radius: calc(var(--radius-large) * 20);
            border: 2px solid transparent;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
        }
        .workspace-btn.primary:hover {
            background-color: transparent;
            border: 2px solid var(--fg-1);
            color: var(--fg-1);
        }
        .workspace-btn.tertiary {
            background-color: transparent;
            border: 2px solid transparent;
            color: var(--fg-1);
            font-weight: 500;
        }
        .workspace-btn.tertiary:hover {
            background-color: var(--bg-3);
            color: var(--fg-1);
        }
    `;

    static properties = {
        filteredList: { type: Array },
        openDropdownId: { type: String },
        hoveredItemId: { type: String },
        hierarchicalList: { type: Array },
        expandedFolders: { type: Object },
        showWorkspaceDropdown: { type: Boolean },
        isNewWorkspaceDialogOpen: { type: Boolean },
        newWorkspaceName: { type: String },
        newWorkspaceEmoji: { type: String },
        workspaceValidationState: { type: String }, // 'valid', 'invalid', 'empty'
    };

    constructor() {
        super();
        this.list = [];
        this.filteredList = [];
        this.openDropdownId = null;
        this.hoveredItemId = null;
        this.hierarchicalList = [];
        this.expandedFolders = {};
        this.showWorkspaceDropdown = false;
        this.isNewWorkspaceDialogOpen = false;
        this.newWorkspaceName = '';
        this.newWorkspaceEmoji = '';
        this.workspaceValidationState = 'empty';

        // Add click event listener to close dropdown when clicking outside
        this.boundHandleClickOutside = this.handleClickOutside.bind(this);

        // Initialize workspace
        this.initializeWorkspace();
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

        // Close workspace dropdown if clicking outside
        if (
            this.showWorkspaceDropdown &&
            !event
                .composedPath()
                .some(el => el.classList && (el.classList.contains('workspace-header') || el.classList.contains('workspace-dropdown')))
        ) {
            this.showWorkspaceDropdown = false;
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

    // Workspace management methods
    initializeWorkspace() {
        const currentWorkspace = localStorage.getItem('currentWorkspace');

        if (!currentWorkspace) {
            this.createDefaultWorkspace();
        }
    }

    getCurrentWorkspaceName() {
        const currentWorkspace = localStorage.getItem('currentWorkspace');
        return currentWorkspace || 'Default Workspace';
    }

    getWorkspaces() {
        const workspaces = localStorage.getItem('workspaces');
        return workspaces ? JSON.parse(workspaces) : [];
    }

    saveWorkspaces(workspaces) {
        localStorage.setItem('workspaces', JSON.stringify(workspaces));
    }

    createDefaultWorkspace() {
        const workspaces = this.getWorkspaces();
        const defaultWorkspace = {
            name: '',
            emoji: '🍎',
        };

        // Add to workspaces if not already there
        if (!workspaces.find(w => w.name === defaultWorkspace.name)) {
            workspaces.push(defaultWorkspace);
            this.saveWorkspaces(workspaces);
        }
    }

    getCurrentWorkspaceEmoji() {
        const workspaces = this.getWorkspaces();
        const currentWorkspace = localStorage.getItem('currentWorkspace') || '';
        const workspace = workspaces.find(w => w.name === currentWorkspace);
        return workspace ? workspace.emoji : '🍎';
    }

    getRandomEmoji() {
        const emojiSelector = document.querySelector('emoji-selector');
        return emojiSelector.randomEmoji();
    }

    toggleWorkspaceDropdown(e) {
        e.preventDefault();
        e.stopPropagation();
        this.showWorkspaceDropdown = !this.showWorkspaceDropdown;
        this.requestUpdate();
    }

    switchWorkspace(workspaceName, e) {
        e.preventDefault();
        e.stopPropagation();

        localStorage.setItem('currentWorkspace', workspaceName);
        this.showWorkspaceDropdown = false;

        // Refresh to home to load the new workspace
        window.location.href = '/?id=home';
    }

    showNewWorkspaceDialog(e) {
        e.preventDefault();
        e.stopPropagation();

        this.newWorkspaceName = '';
        this.newWorkspaceEmoji = this.getRandomEmoji();
        this.workspaceValidationState = 'empty';
        this.isNewWorkspaceDialogOpen = true;
        this.showWorkspaceDropdown = false;
        this.requestUpdate();

        // Focus on the input field after render
        setTimeout(() => {
            const input = this.shadowRoot.querySelector('.workspace-name-input');
            if (input) {
                input.focus();
            }
        }, 100);
    }

    closeNewWorkspaceDialog(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.isNewWorkspaceDialogOpen = false;
        this.newWorkspaceName = '';
        this.newWorkspaceEmoji = '';
        this.workspaceValidationState = 'empty';
        this.requestUpdate();
    }

    changeWorkspaceEmoji(e) {
        e.preventDefault();
        e.stopPropagation();

        this.newWorkspaceEmoji = this.getRandomEmoji();
        this.requestUpdate();
    }

    updateNewWorkspaceName(e) {
        this.newWorkspaceName = e.target.value;
        this.validateWorkspaceName();
    }

    validateWorkspaceName() {
        const name = this.newWorkspaceName.trim();

        if (!name) {
            this.workspaceValidationState = 'empty';
            return;
        }

        // Generate the database name that would be created
        const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const dbName = `WiskDatabase-${sanitizedName}`;

        // Check if workspace name already exists
        const workspaces = this.getWorkspaces();
        const nameExists = workspaces.some(w => w.name === name);

        if (nameExists) {
            this.workspaceValidationState = 'invalid';
        } else {
            this.workspaceValidationState = 'valid';
        }
    }

    saveNewWorkspace(e) {
        e.preventDefault();
        e.stopPropagation();

        // Check validation state
        if (this.workspaceValidationState === 'empty') {
            wisk.utils.showToast('Please enter a workspace name', 3000);
            return;
        }

        if (this.workspaceValidationState === 'invalid') {
            wisk.utils.showToast('A workspace with this name already exists', 3000);
            return;
        }

        const name = this.newWorkspaceName.trim();
        const workspaces = this.getWorkspaces();

        const newWorkspace = {
            name: name,
            emoji: this.newWorkspaceEmoji,
        };

        // Add to workspaces
        workspaces.push(newWorkspace);
        this.saveWorkspaces(workspaces);

        // Switch to the new workspace
        localStorage.setItem('currentWorkspace', name);

        this.closeNewWorkspaceDialog();

        // Refresh to home to load the new workspace
        window.location.href = '/?id=home';
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
                <div class="top-section">
                    <!-- Workspace Header -->
                    <div class="workspace-header" @click=${this.toggleWorkspaceDropdown}>
                        <span class="workspace-emoji">${this.getCurrentWorkspaceEmoji()}</span>
                        <span class="workspace-name">${this.getCurrentWorkspaceName()}</span>
                        <img
                            src="/a7/forget/down-arrow.svg"
                            class="workspace-arrow ${this.showWorkspaceDropdown ? 'rotated' : ''}"
                            alt="Toggle workspace dropdown"
                        />

                        ${this.showWorkspaceDropdown
                            ? html`
                                  <div class="workspace-dropdown">
                                      ${this.getWorkspaces().map(
                                          workspace => html`
                                              <div
                                                  class="workspace-item ${workspace.name === (localStorage.getItem('currentWorkspace') || '')
                                                      ? 'active'
                                                      : ''}"
                                                  @click=${e => this.switchWorkspace(workspace.name, e)}
                                              >
                                                  <span class="workspace-item-emoji">${workspace.emoji}</span>
                                                  <span class="workspace-item-name">${workspace.name || 'Default Workspace'}</span>
                                              </div>
                                          `
                                      )}

                                      <div class="workspace-item-divider"></div>

                                      <div class="new-workspace-btn" @click=${this.showNewWorkspaceDialog}>
                                          <img src="/a7/forget/plus.svg" alt="New workspace" style="width: 16px; height: 16px;" />
                                          New Workspace
                                      </div>
                                  </div>
                              `
                            : ''}
                    </div>

                    <div class="vert-nav">
                        <button class="vert-nav-button" @click=${() => (window.location.href = '/')}>
                            <img src="/a7/forget/new-page-heroicon.svg" class="new-img" /> New Page
                        </button>
                        <button class="vert-nav-button" @click=${() => document.querySelector('search-element').show()}>
                            <img src="/a7/forget/search-heroicon.svg" class="new-img" /> Search
                        </button>
                        <button class="vert-nav-button" @click=${() => (window.location.href = '/?id=home')}>
                            <img src="/a7/forget/home-heroicon.svg" class="new-img" /> Home
                        </button>
                        <button
                            class="vert-nav-button"
                            @click=${() => document.querySelector('template-dialog').show()}
                        >
                            <img src="/a7/forget/templates-outline.svg" class="new-img" /> Templates
                        </button>
                    </div>
                </div>

                <div class="pages-section">
                    <ul style="">
                        ${this.filteredList.map(
                            item => html`
                                <li
                                    class="item ${item.level > 0 ? 'child-item' : ''}"
                                    style="${item.level > 0 ? `padding-left: ${item.level * 16}px;` : ''}"
                                    @mouseenter=${() => (this.hoveredItemId = item.id)}
                                    @mouseleave=${() => {
                                        this.hoveredItemId = null;
                                        // Close dropdown when mouse leaves the item
                                        if (this.openDropdownId === item.id) {
                                            this.openDropdownId = null;
                                        }
                                    }}
                                >
                                    <div
                                        class="folder-icon"
                                        @click=${item.hasChildren
                                            ? e => this.toggleFolder(item.id, e)
                                            : e => {
                                                  e.preventDefault();
                                                  window.location.href = `?id=${item.id}`;
                                              }}
                                    >
                                        ${item.hasChildren && this.hoveredItemId === item.id
                                            ? html`
                                                  <img
                                                      class="arrow"
                                                      src=${this.expandedFolders[item.id]
                                                          ? '/a7/forget/down-arrow.svg'
                                                          : '/a7/forget/right-arrow.svg'}
                                                      alt="Toggle folder"
                                                  />
                                              `
                                            : item.emoji
                                              ? html`<span class="emoji">${item.emoji}</span>`
                                              : html`<img
                                                    class="page-icon"
                                                    src="${!item.name || item.name === 'Untitled'
                                                        ? '/a7/forget/document-empty-heroicon.svg'
                                                        : '/a7/forget/page-heroicon.svg'}"
                                                    alt="File"
                                                />`}
                                    </div>

                                    <a href="?id=${item.id}"> ${item.name} </a>
                                    <div class="add-child" @click=${e => this.createChildPage(item.id, e)}>
                                        <img src="/a7/forget/plus.svg" alt="Add child" style="width: 20px; height: 20px;" />
                                    </div>
                                    <div class="more-options" @click=${e => this.toggleDropdown(item.id, e)}>
                                        <img src="/a7/forget/morex.svg" alt="More options" style="width: 20px; height: 20px;" />
                                        ${this.openDropdownId === item.id
                                            ? html`
                                                  <div class="dropdown">
                                                      <div class="dropdown-item delete-item" @click=${e => this.removeItem(item.id, e)}>
                                                          <img src="/a7/forget/trash.svg" alt="Delete" style="width: 20px; height: 20px;" />
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
                </div>

                <div class="bottom-section">
                    <div class="horizontal-nav">
                        <button class="vert-nav-button" @click=${() => document.querySelector('help-dialog').show()}>
                            <img src="/a7/forget/help-heroicon.svg" class="new-img" />
                        </button>
                        <button class="vert-nav-button" @click=${() => document.querySelector('feedback-dialog').show()}>
                            <img src="/a7/forget/feedback-heroicon.svg" class="new-img" />
                        </button>
                    </div>
                </div>

                <!-- New Workspace Dialog -->
                ${this.isNewWorkspaceDialogOpen
                    ? html`
                          <div
                              class="workspace-dialog"
                              @click=${e => {
                                  if (e.target === e.currentTarget) {
                                      this.closeNewWorkspaceDialog();
                                  }
                              }}
                          >
                              <div class="workspace-dialog-content">
                                  <div class="workspace-dialog-header">
                                      <span class="workspace-dialog-title">Create New Workspace</span>
                                      <button class="workspace-dialog-close" @click=${this.closeNewWorkspaceDialog}>
                                          <img src="/a7/forget/dialog-x.svg" alt="Close" style=";" />
                                      </button>
                                  </div>

                                  <div class="workspace-form">
                                      <div class="workspace-emoji-section">
                                          <div class="workspace-emoji-display" @click=${this.changeWorkspaceEmoji}>${this.newWorkspaceEmoji}</div>
                                          <input
                                              type="text"
                                              class="workspace-name-input ${this.workspaceValidationState}"
                                              placeholder="Workspace name"
                                              .value=${this.newWorkspaceName}
                                              @input=${this.updateNewWorkspaceName}
                                              @keydown=${e => {
                                                  if (e.key === 'Enter') {
                                                      this.saveNewWorkspace(e);
                                                  } else if (e.key === 'Escape') {
                                                      this.closeNewWorkspaceDialog();
                                                  }
                                              }}
                                          />
                                      </div>

                                      <div class="workspace-dialog-actions">
                                          <button class="workspace-btn tertiary" @click=${this.closeNewWorkspaceDialog}>Cancel</button>
                                          <button class="workspace-btn primary" @click=${this.saveNewWorkspace}>Create Workspace</button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      `
                    : ''}
            </div>
        `;
    }
}

customElements.define('left-menu', LeftMenu);
