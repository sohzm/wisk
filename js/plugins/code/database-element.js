import { LitElement, html, css } from '/a7/cdn/lit-core-2.7.4.min.js';

class DatabaseElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
            font-size: 14px;
        }
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            font-size: revert;
        }
        :host {
            display: block;
            width: 100%;
            color: var(--fg-1);
            overflow: auto;
        }
        .view-switcher {
            display: flex;
            margin-bottom: var(--gap-2);
        }
        .view-button {
            margin-right: var(--gap-1);
            padding: var(--padding-w1);
            cursor: pointer;
            background-color: var(--bg-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
        }
        .active {
            background-color: var(--bg-3);
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th,
        td {
            border: 1px solid var(--border-1);
            padding: var(--padding-3);
            text-align: left;
        }
        th {
            background-color: var(--bg-2);
            font-family: var(--font-heading);
        }
        .board {
            display: flex;
            overflow-x: auto;
            gap: var(--gap-2);
            padding-top: var(--gap-3);
            border-top: 1px solid var(--border-1);
        }
        .board-column {
            min-width: 320px;
            background-color: var(--bg-2);
            padding: var(--padding-3);
            border-radius: var(--radius);
        }
        .calendar-container,
        .gallery {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: var(--gap-1);
            padding-top: var(--gap-3);
            border-top: 1px solid var(--border-1);
        }
        .gallery {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
        .calendar-day,
        .gallery-item {
            border: 1px solid var(--border-1);
            padding: var(--padding-2);
            min-height: 100px;
            background-color: var(--bg-1);
        }
        .editable-cell {
            position: relative;
        }
        .editable-cell input,
        .editable-cell select {
            width: 100%;
            box-sizing: border-box;
            padding: var(--padding-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
        }
        .multi-select {
            display: flex;
            flex-wrap: wrap;
            gap: var(--gap-1);
        }
        .multi-select-item {
            background-color: var(--bg-3);
            padding: var(--padding-1);
            border-radius: var(--radius);
            font-size: 0.9em;
        }
        .board-item,
        .calendar-item,
        .gallery-item {
            border: 1px solid var(--border-1);
            padding: var(--padding-2);
            margin-bottom: var(--gap-1);
            cursor: pointer;
            background-color: var(--bg-1);
            border-radius: var(--radius);
        }
        .board-item:hover,
        .calendar-item:hover,
        .gallery-item:hover {
            background-color: var(--bg-2);
        }
        .add-column-form,
        .add-row-form {
            margin-top: var(--gap-2);
            padding: var(--padding-3);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background-color: var(--bg-2);
        }
        .add-row-form label {
            display: block;
            margin-top: var(--gap-1);
        }
        .button-container {
            margin-top: var(--gap-2);
        }
        .dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            z-index: 20;
            justify-content: center;
            align-items: center;
            filter: var(--drop-shadow);
            backdrop-filter: contrast(0.5);
        }
        .dialog {
            background-color: var(--bg-1);
            padding: var(--padding-4);
            border-radius: var(--radius-large);
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            filter: var(--drop-shadow);
            display: flex;
            flex-direction: column;
            gap: var(--gap-1);
        }
        .dialog > div > label {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .dialog h2 {
            margin-top: 0;
            font-family: var(--font-heading);
        }
        .dialog-buttons {
            margin-top: var(--gap-3);
            text-align: right;
        }
        tr {
            cursor: pointer;
        }
        tr:hover {
            background-color: var(--bg-2);
        }
        .board-column {
            min-width: 320px;
            margin-right: var(--gap-2);
            background-color: var(--bg-2);
            padding: var(--padding-4);
            border-radius: var(--radius);
        }

        .board-item {
            background-color: var(--bg-1);
            margin-bottom: var(--gap-2);
            padding: var(--padding-3);
            border-radius: var(--radius);
            box-shadow: var(--drop-shadow);
            cursor: move;
        }
        .board-item:hover {
            box-shadow: var(--drop-shadow);
        }
        .board-item.dragging {
            opacity: 0.5;
        }
        .board-column.drag-over {
            background-color: var(--bg-3);
        }
        .view-selector {
            display: flex;
            align-items: center;
            margin-bottom: var(--gap-2);
        }
        .view-selector select {
            margin-right: var(--gap-2);
        }
        .filter-sort-panel {
            background-color: var(--bg-2);
            padding: var(--padding-3);
            margin-bottom: var(--gap-2);
            border-radius: var(--radius);
        }
        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--gap-2);
        }
        .calendar-weekdays {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            font-weight: bold;
            margin-bottom: var(--gap-1);
            font-family: var(--font-heading);
        }
        .calendar-grid {
            display: flex;
            flex-direction: column;
        }
        .calendar-week {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
        }
        .calendar-day {
            border: 1px solid var(--border-1);
            min-height: 100px;
            padding: var(--padding-2);
            position: relative;
        }
        .calendar-day.other-month {
            background-color: var(--bg-2);
        }
        .day-number {
            position: absolute;
            top: var(--padding-2);
            left: var(--padding-2);
            font-family: var(--font-mono);
        }
        .day-content {
            margin-top: 20px;
        }
        .calendar-item {
            background-color: var(--bg-3);
            margin-bottom: 2px;
            padding: var(--padding-1);
            cursor: pointer;
            border-radius: var(--radius);
        }
        .add-entry-button {
            position: absolute;
            top: var(--padding-2);
            right: var(--padding-2);
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s;
            background-color: var(--bg-blue);
            color: var(--fg-blue);
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }
        .calendar-day:hover .add-entry-button {
            opacity: 1;
        }
        button {
            background-color: var(--bg-2);
            color: var(--fg-1);
            border: 1px solid var(--border-1);
            padding: var(--padding-w2);
            border-radius: var(--radius);
            cursor: pointer;
            font-family: var(--font);
        }
        button:hover {
            opacity: 0.9;
        }
        select {
            font-family: var(--font);
            padding: var(--padding-w1);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
        }
        input[type='text'],
        input[type='date'] {
            font-family: var(--font);
            padding: var(--padding-w1);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
        }
        .calendar-container {
            display: flex;
            flex-direction: column;
            width: 100%;
        }
        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .calendar-weekdays {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .calendar-grid {
            display: flex;
            flex-direction: column;
        }
        .calendar-week {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
        }
        .calendar-day {
            min-height: 100px;
            padding: 5px;
            position: relative;
        }
        .day-number {
            position: absolute;
            top: 5px;
            left: 5px;
        }
        .day-content {
            margin-top: 20px;
        }
        .add-entry-button {
            position: absolute;
            top: 5px;
            right: 5px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .calendar-day:hover .add-entry-button {
            opacity: 1;
        }
        .list-view {
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
            padding-top: var(--gap-3);
        }
        .list-item {
            border: 1px solid var(--border-1);
            padding: var(--padding-3);
            border-radius: var(--radius);
            cursor: pointer;
        }
        .list-item:hover {
            background-color: var(--bg-2);
        }
        .list-item-property {
            margin-bottom: var(--gap-1);
        }
        .property-checkboxes {
            display: flex;
            flex-wrap: wrap;
            gap: var(--gap-1);
        }
        .property-checkboxes label {
            display: flex;
            align-items: center;
            gap: var(--gap-1);
        }
        .full-width-button {
            width: 100%;
            padding: var(--padding-3);
            background-color: var(--bg-1);
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            width: -fit-content;
            text-align: left;
        }
        .add-column-button {
            background: none;
            border: none;
            cursor: pointer;
        }
        .dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .view-tabs {
            display: flex;
            overflow-x: auto;
            width: fit-content;
        }

        .view-tab {
            padding: var(--padding-2) var(--padding-3);
            border: none;
            background: none;
            cursor: pointer;
            font-family: var(--font);
            font-size: 1em;
            color: var(--fg-1);
            border-bottom: 3px solid transparent;
            transition: border-color 0.3s ease;
            border-radius: 0;
            color: var(--fg-2);
            display: flex;
            align-items: center;
            white-space: nowrap;
        }

        .view-tab:hover {
            background-color: var(--bg-2);
        }

        .view-tab.active {
            border-bottom-color: var(--fg-1);
            color: var(--fg-1);
        }

        .view-tab.add-view {
            font-size: 1.2em;
            padding: var(--padding-w2);
        }

        .view-actions {
            display: flex;
            justify-content: flex-end;
            padding: var(--padding-2) 0;
        }

        .view-actions button {
            margin-left: var(--gap-2);
        }

        .delete-button {
            background-color: var(--error-color, #ff4d4f);
            color: white;
        }

        .delete-button:hover {
            background-color: var(--error-color-hover, #ff7875);
        }

        .dialog-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: var(--gap-3);
        }

        .property-item {
            display: flex;
            gap: var(--gap-2);
            margin-bottom: var(--gap-2);
        }

        .property-item input,
        .property-item select {
            flex: 1;
        }

        .property-item button {
            flex-shrink: 0;
        }
        .property-item.removed {
            opacity: 0.5;
            text-decoration: line-through;
        }

        .property-item.removed input,
        .property-item.removed select {
            pointer-events: none;
        }
        .board-column-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--gap-2);
        }

        .add-entry-button {
            background: none;
            border: none;
            font-size: 1.2em;
            cursor: pointer;
            padding: var(--padding-1);
            border-radius: 50%;
            transition: background-color 0.3s;
        }

        .add-entry-button:hover {
            background-color: var(--fg-1);
        }

        .new-entry {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            background-color: var(--bg-2);
            transition: background-color 0.3s;
        }

        .new-entry:hover {
            background-color: var(--bg-3);
        }

        .new-entry-placeholder {
            font-size: 2em;
            margin-bottom: var(--gap-2);
        }
        .board-column-header {
            position: relative;
            padding-right: 30px; /* Make room for the button */
        }

        .board-column-header .add-entry-button {
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            opacity: 0;
            transition: opacity 0.3s;
        }

        .board-column:hover .add-entry-button {
            opacity: 1;
        }

        .add-entry-button {
            background: var(--fg-1);
            border: none;
            cursor: pointer;
            padding: var(--padding-1);
            border-radius: 50%;
            transition:
                background-color 0.3s,
                opacity 0.3s;
        }

        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border: none;
        }

        th,
        td {
            border: none;
            border-left: 1px solid var(--border-1);
            border-bottom: 1px solid var(--border-1);
            padding: var(--padding-3);
            text-align: left;
            vertical-align: top;
        }

        th {
            border-top: 1px solid var(--border-1);
        }

        th:first-of-type,
        td:first-of-type {
            border-left: none;
        }

        th {
            background-color: var(--bg-1);
            position: sticky;
            top: 0;
            z-index: 10;
        }

        tr {
            background-color: var(--bg-1);
        }

        tr:hover {
            background-color: var(--bg-2);
        }

        td {
            transition: background-color 0.3s;
        }

        /* Add some spacing between columns */
        th:not(:last-child),
        td:not(:last-child) {
            padding-right: var(--padding-4);
        }

        /* Style for the add column button */
        th:last-child {
            width: 40px;
            text-align: center;
        }

        .add-column-button {
            background: none;
            border: none;
            font-size: 1.2em;
            cursor: pointer;
            padding: var(--padding-1);
            border-radius: 50%;
            transition: background-color 0.3s;
        }

        .add-column-button:hover {
            background-color: var(--bg-3);
        }

        td {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        td:hover {
            white-space: normal;
            word-break: break-word;
        }

        /* Style for checkbox cells */
        td input[type='checkbox'] {
            margin: 0;
            vertical-align: middle;
        }

        /* Add some responsive behavior */
        @media (max-width: 768px) {
            table {
                font-size: 14px;
            }

            th,
            td {
                padding: var(--padding-2);
            }
        }

        .plugin-icon {
            filter: var(--themed-svg);
            width: 28px;
            height: 28px;
            padding: var(--padding-1);
        }

        .plugin-icon-button {
            background-color: transparent;
            border: none;
            cursor: pointer;
            padding: var(--padding-w1);
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .plugin-icon-button:hover {
            background-color: var(--bg-2);
        }

        input,
        select {
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background-color: var(--bg-2);
            padding: var(--padding-1);
            color: var(--fg-1);
        }

        .board-item {
            transition:
                opacity 0.3s,
                transform 0.3s;
            touch-action: none; /* Prevents browser handling of touch events */

            user-select: none;
        }

        .board-item:active {
            cursor: grabbing;
        }
    `;

    static properties = {
        entries: { type: Array },
        properties: { type: Array },
        currentView: { type: String },
        editingItem: { type: Object },
        showAddRowForm: { type: Boolean },
        newEntry: { type: Object },
        editingEntry: { type: Object },
        showAddColumnForm: { type: Boolean },
        views: { type: Array },
        currentViewId: { type: String },
        editingEntry: { type: Object },
        editingView: { type: Object },
        calendarDate: { type: Object },

        newColumnName: { type: String },
        newColumnType: { type: String },
        newColumnOptions: { type: String },

        showEditPropertiesDialog: { type: Boolean },
        editingProperties: { type: Array },
    };

    constructor() {
        super();
        this.entries = [
            {
                id: 1,
                title: 'Implement login system',
                status: 'In Progress',
                date: '2023-05-01',
                tags: ['important', 'frontend'],
                completed: false,
                url: 'https://github.com/project/issue/1',
                email: 'john@example.com',
                phone: '123-456-7890',
            },
            {
                id: 2,
                title: 'Design database schema',
                status: 'Done',
                date: '2023-04-28',
                tags: ['important', 'backend'],
                completed: true,
                url: 'https://github.com/project/issue/2',
                email: 'jane@example.com',
                phone: '098-765-4321',
            },
            {
                id: 3,
                title: 'Implement user registration',
                status: 'To Do',
                date: '2023-05-05',
                tags: ['frontend'],
                completed: false,
                url: 'https://github.com/project/issue/3',
                email: 'alice@example.com',
                phone: '111-222-3333',
            },
            {
                id: 4,
                title: 'Set up CI/CD pipeline',
                status: 'In Progress',
                date: '2023-05-02',
                tags: ['devops', 'important'],
                completed: false,
                url: 'https://github.com/project/issue/4',
                email: 'bob@example.com',
                phone: '444-555-6666',
            },
            {
                id: 5,
                title: 'Write API documentation',
                status: 'To Do',
                date: '2023-05-10',
                tags: ['documentation'],
                completed: false,
                url: 'https://github.com/project/issue/5',
                email: 'charlie@example.com',
                phone: '777-888-9999',
            },
            {
                id: 6,
                title: 'Implement password reset',
                status: 'Done',
                date: '2023-04-30',
                tags: ['backend', 'security'],
                completed: true,
                url: 'https://github.com/project/issue/6',
                email: 'dave@example.com',
                phone: '000-111-2222',
            },
        ];
        this.properties = [
            { name: 'title', type: 'text' },
            { name: 'status', type: 'select', options: ['To Do', 'In Progress', 'Done'] },
            { name: 'date', type: 'date' },
            {
                name: 'tags',
                type: 'multi-select',
                options: ['important', 'frontend', 'backend', 'devops', 'documentation', 'security', 'performance'],
            },
            { name: 'completed', type: 'checkbox' },
            { name: 'url', type: 'url' },
            { name: 'email', type: 'email' },
            { name: 'phone', type: 'phone' },
        ];
        this.views = [
            { id: 'default-table', name: 'Default Table', type: 'table', filters: [], sorts: [] },
            { id: 'default-board', name: 'Default Board', type: 'board', filters: [], sorts: [], groupBy: 'status' },
            { id: 'default-calendar', name: 'Default Calendar', type: 'calendar', filters: [], sorts: [], dateProperty: 'date' },
            { id: 'default-gallery', name: 'Default Gallery', type: 'gallery', filters: [], sorts: [] },
            { id: 'default-list', name: 'Default List', type: 'list', filters: [], sorts: [], visibleProperties: ['title', 'status', 'date'] },
        ];
        this.currentViewId = 'default-table';
        this.editingEntry = null;
        this.editingView = null;
        this.editingItem = null;
        this.showAddRowForm = false;
        this.newEntry = {};
        this.editingEntry = null;
        this.draggedItem = null;
        this.showAddColumnForm = false;

        this.newColumnName = '';
        this.newColumnType = 'text';
        this.newColumnOptions = '';

        this.showEditPropertiesDialog = false;
        this.editingProperties = [];

        this.currentTouchedColumn = null;

        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchMoving = false;
        this.draggedElement = null;
    }

    toggleAddColumnForm() {
        this.showAddColumnForm = !this.showAddColumnForm;
    }

    get currentView() {
        return this.views.find(view => view.id === this.currentViewId);
    }

    setValue(identifier, value) {
        if (value.entries) this.entries = [...value.entries];
        if (value.properties) this.properties = [...value.properties];
        if (value.views) this.views = [...value.views];
    }

    getValue() {
        return {
            entries: this.entries,
            properties: this.properties,
            currentView: this.currentView,
            views: this.views,
        };
    }

    applyFiltersAndSorts(entries) {
        let filteredEntries = entries;

        // Apply filters
        this.currentView.filters.forEach(filter => {
            filteredEntries = filteredEntries.filter(entry => {
                const value = entry[filter.property];
                switch (filter.operator) {
                    case 'equals':
                        return value === filter.value;
                    case 'contains':
                        if (Array.isArray(value)) {
                            return value.includes(filter.value);
                        }
                        return value.toString().toLowerCase().includes(filter.value.toLowerCase());
                    case 'greater_than':
                        return new Date(value) > new Date(filter.value);
                    case 'less_than':
                        return new Date(value) < new Date(filter.value);
                    default:
                        return true;
                }
            });
        });

        // Apply sorts
        this.currentView.sorts.forEach(sort => {
            filteredEntries.sort((a, b) => {
                let valueA = a[sort.property];
                let valueB = b[sort.property];

                // Handle date comparison
                if (this.properties.find(p => p.name === sort.property).type === 'date') {
                    valueA = new Date(valueA);
                    valueB = new Date(valueB);
                }

                if (valueA < valueB) return sort.direction === 'asc' ? -1 : 1;
                if (valueA > valueB) return sort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        });

        return filteredEntries;
    }

    changeMonth(delta) {
        if (!this.calendarDate) {
            this.calendarDate = new Date();
        }
        this.calendarDate.setMonth(this.calendarDate.getMonth() + delta);
        this.requestUpdate();
    }

    addNewEntry(year, month, day) {
        const dateProperty = this.currentView.dateProperty || 'date';
        // Create a date in the local timezone
        const date = new Date(year, month, day);
        // Format the date as YYYY-MM-DD
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        const newEntry = {
            id: 'temp_' + Date.now(),
            title: 'New Entry',
            [dateProperty]: formattedDate,
        };
        this.startEditing(newEntry);
    }

    onUpdate() {
        wisk.editor.justUpdates(this.id);
    }

    startEditing(entry) {
        // Create a deep copy of the entry
        this.editingEntry = JSON.parse(JSON.stringify(entry));

        // Ensure all properties exist in the editing entry
        this.properties.forEach(prop => {
            if (!(prop.name in this.editingEntry)) {
                // Initialize missing properties with default values
                this.editingEntry[prop.name] = prop.type === 'checkbox' ? false : prop.type === 'multi-select' ? [] : '';
            }
        });

        this.requestUpdate();
    }

    saveEdit() {
        if (this.editingEntry.id.toString().startsWith('temp_')) {
            // It's a new entry, assign a real id and add it to entries
            this.editingEntry.id = Date.now();
            this.entries = [...this.entries, this.editingEntry];
        } else {
            // It's an existing entry, update it
            const index = this.entries.findIndex(e => e.id === this.editingEntry.id);
            if (index !== -1) {
                this.entries = [...this.entries.slice(0, index), this.editingEntry, ...this.entries.slice(index + 1)];
            }
        }
        this.editingEntry = null;
        this.requestUpdate();
        this.onUpdate();
    }

    cancelEdit() {
        this.editingEntry = null;
        this.requestUpdate();
    }

    updateEditingEntry(propertyName, value) {
        this.editingEntry = { ...this.editingEntry, [propertyName]: value };
    }

    renderEditDialog() {
        if (!this.editingEntry) return null;

        return html`
            <div class="dialog-overlay">
                <div class="dialog">
                    <h2>Edit Entry</h2>
                    ${this.properties.map(
                        prop => html`
                            <div>
                                <label>
                                    ${prop.name}:
                                    ${this.renderEditableCell(this.editingEntry, prop, value => this.updateEditingEntry(prop.name, value))}
                                </label>
                            </div>
                        `
                    )}
                    <div class="dialog-buttons">
                        ${this.editingEntry.id.toString().startsWith('temp_')
                            ? html``
                            : html`<button class="delete-button" @click=${this.deleteEntry}>Delete Entry</button>`}
                        <div>
                            <button @click=${this.cancelEdit}>Cancel</button>
                            <button @click=${this.saveEdit}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    deleteEntry() {
        if (confirm('Are you sure you want to delete this entry?')) {
            this.entries = this.entries.filter(entry => entry.id !== this.editingEntry.id);
            this.editingEntry = null;
            this.requestUpdate();
            this.onUpdate();
        }
    }

    toggleAddRowForm() {
        this.showAddRowForm = !this.showAddRowForm;
        if (this.showAddRowForm) {
            this.newEntry = this.properties.reduce((acc, prop) => {
                acc[prop.name] = prop.type === 'checkbox' ? false : '';
                return acc;
            }, {});
        }
    }

    updateNewEntry(propertyName, value) {
        this.newEntry = { ...this.newEntry, [propertyName]: value };
    }

    startEditingItem(entryId) {
        this.editingItem = this.entries.find(entry => entry.id === entryId);
    }

    addNewRow() {
        const newId = Math.max(...this.entries.map(e => e.id), 0) + 1;
        this.entries = [...this.entries, { id: newId, ...this.newEntry }];
        this.toggleAddRowForm();
        this.requestUpdate();
        this.onUpdate();
    }

    renderAddRowForm() {
        return html` <button @click=${this.toggleAddRowForm} class="full-width-button">+ Add New Row</button> `;
    }

    renderAddRowDialog() {
        if (!this.showAddRowForm) return '';

        return html`
            <div class="dialog-overlay">
                <div class="dialog">
                    <h2>Add New Row</h2>
                    ${this.properties.map(
                        prop => html`
                            <label>
                                ${prop.name}: ${this.renderEditableCell({ id: 'new' }, prop, value => this.updateNewEntry(prop.name, value))}
                            </label>
                        `
                    )}
                    <div class="dialog-buttons">
                        <div></div>
                        <div>
                            <button @click=${this.toggleAddRowForm}>Cancel</button>
                            <button @click=${this.addNewRow}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderEditableCell(entry, prop, updateCallback = null) {
        const value = entry[prop.name];
        const onChange = e => {
            const newValue = prop.type === 'checkbox' ? e.target.checked : e.target.value;
            if (updateCallback) {
                updateCallback(newValue);
            } else {
                entry[prop.name] = newValue;
                this.requestUpdate();
            }
        };

        switch (prop.type) {
            case 'text':
            case 'number':
            case 'url':
            case 'email':
            case 'phone':
                return html`<input type="${prop.type}" .value=${value} @input=${onChange} />`;
            case 'select':
                return html`
                    <select .value=${value} @change=${onChange}>
                        <option value="" disabled selected=${value === ''}>Select an option</option>
                        ${prop.options.map(option => html` <option value="${option}" ?selected=${value === option}>${option}</option> `)}
                    </select>
                `;
            case 'multi-select':
                return html`
                    <select
                        multiple
                        .value=${value || []}
                        @change=${e => {
                            const newValue = Array.from(e.target.selectedOptions).map(option => option.value);
                            if (updateCallback) {
                                updateCallback(newValue);
                            } else {
                                entry[prop.name] = newValue;
                                this.requestUpdate();
                            }
                        }}
                    >
                        ${prop.options.map(
                            option => html` <option value="${option}" ?selected=${value && value.includes(option)}>${option}</option> `
                        )}
                    </select>
                `;
            case 'date':
            case 'datetime-local':
                return html`<input type="${prop.type}" .value=${value} @input=${onChange} />`;
            case 'checkbox':
                return html`<input type="checkbox" ?checked=${value} @change=${onChange} />`;
            default:
                return html`<span>${value}</span>`;
        }
    }

    handleDragStart(e, entry) {
        this.draggedItem = entry;
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }

    handleDrop(e, newGroup) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        if (this.draggedItem) {
            const groupByProperty = this.currentView.groupBy || 'status';
            const updatedEntry = { ...this.draggedItem, [groupByProperty]: newGroup };
            const index = this.entries.findIndex(entry => entry.id === this.draggedItem.id);
            if (index !== -1) {
                this.entries = [...this.entries.slice(0, index), updatedEntry, ...this.entries.slice(index + 1)];
                this.requestUpdate();
                this.onUpdate();
            }
        }
        this.draggedItem = null;
    }

    renderAddColumnDialog() {
        if (!this.showAddColumnForm) return '';

        return html`
            <div class="dialog-overlay">
                <div class="dialog">
                    <h2>Add New Column</h2>
                    <label>
                        Column Name:
                        <input
                            id="newColumnName"
                            type="text"
                            .value=${this.newColumnName || ''}
                            @input=${e => (this.newColumnName = e.target.value)}
                        />
                    </label>
                    <label>
                        Column Type:
                        <select id="newColumnType" .value=${this.newColumnType || 'text'} @change=${this.handleNewColumnTypeChange}>
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="select">Select</option>
                            <option value="multi-select">Multi-select</option>
                            <option value="date">Date</option>
                            <option value="datetime-local">DateTime</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="url">URL</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                        </select>
                    </label>
                    ${this.renderColumnTypeSpecificFields()}
                    <div class="dialog-buttons">
                        <div></div>
                        <div>
                            <button @click=${this.toggleAddColumnForm}>Cancel</button>
                            <button @click=${this.addNewColumn}>Add Column</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderColumnTypeSpecificFields() {
        if (this.newColumnType === 'select' || this.newColumnType === 'multi-select') {
            return html`
                <label>
                    Options (comma-separated):
                    <input type="text" .value=${this.newColumnOptions || ''} @input=${e => (this.newColumnOptions = e.target.value)} />
                </label>
            `;
        }
        return '';
    }

    handleNewColumnTypeChange(e) {
        this.newColumnType = e.target.value;
        this.newColumnOptions = ''; // Reset options when type changes
        this.requestUpdate();
    }

    addNewColumn() {
        if (this.newColumnName && this.newColumnType) {
            let newColumn = { name: this.newColumnName, type: this.newColumnType };
            if (this.newColumnType === 'select' || this.newColumnType === 'multi-select') {
                newColumn.options = this.newColumnOptions.split(',').map(option => option.trim());
            }
            this.properties = [...this.properties, newColumn];
            this.entries = this.entries.map(entry => ({ ...entry, [this.newColumnName]: '' }));
            this.toggleAddColumnForm();
            this.newColumnName = '';
            this.newColumnType = 'text';
            this.newColumnOptions = '';
            this.requestUpdate();
            this.onUpdate();
        }
    }

    renderAddColumnForm() {
        return html`
            <div class="add-column-form">
                <h3>Add New Column</h3>
                <input id="newColumnName" type="text" placeholder="Column Name" />
                <select id="newColumnType">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="select">Select</option>
                    <option value="multi-select">Multi-select</option>
                    <option value="date">Date</option>
                    <option value="datetime-local">DateTime</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="url">URL</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                </select>
                <button @click=${this.addNewColumn}>Add Column</button>
            </div>
        `;
    }

    renderViewManagement() {
        return html`
            <div class="view-management">
                <div class="view-tabs">
                    <button @click=${() => (this.editingView = { ...this.currentView })} class="plugin-icon-button">
                        <img src="/a7/plugins/database-element/edit.svg" class="plugin-icon" alt="Edit view" />
                    </button>
                    <button @click=${this.toggleEditPropertiesDialog} class="plugin-icon-button">
                        <img src="/a7/plugins/database-element/properties.svg" class="plugin-icon" alt="Edit properties" />
                    </button>

                    ${this.views.map(
                        view => html`
                            <button class="view-tab ${this.currentViewId === view.id ? 'active' : ''}" @click=${() => (this.currentViewId = view.id)}>
                                ${view.name}
                            </button>
                        `
                    )}
                    <button class="view-tab add-view plugin-icon-button" @click=${this.createNewView}>
                        <img src="/a7/plugins/database-element/plus.svg" class="plugin-icon" alt="Add view" />
                    </button>
                </div>
                ${this.renderFilterSortPanel()}
            </div>
        `;
    }

    renderEditPropertiesDialog() {
        if (!this.showEditPropertiesDialog) return '';

        return html`
            <div class="dialog-overlay">
                <div class="dialog">
                    <h2>Edit Properties</h2>
                    ${this.editingProperties.map(
                        (prop, index) => html`
                            <div class="property-item ${prop.removed ? 'removed' : ''}">
                                <input
                                    type="text"
                                    .value=${prop.name}
                                    @input=${e => this.updatePropertyName(index, e.target.value)}
                                    ?disabled=${prop.removed}
                                />
                                <select .value=${prop.type} @change=${e => this.updatePropertyType(index, e.target.value)} ?disabled=${prop.removed}>
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="select">Select</option>
                                    <option value="multi-select">Multi-select</option>
                                    <option value="date">Date</option>
                                    <option value="datetime-local">DateTime</option>
                                    <option value="checkbox">Checkbox</option>
                                    <option value="url">URL</option>
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                </select>
                                ${(prop.type === 'select' || prop.type === 'multi-select') && !prop.removed
                                    ? html`
                                          <input
                                              type="text"
                                              placeholder="Options (comma-separated)"
                                              .value=${prop.options ? prop.options.join(', ') : ''}
                                              @input=${e => this.updatePropertyOptions(index, e.target.value)}
                                          />
                                      `
                                    : ''}
                                ${prop.removed
                                    ? html` <button @click=${() => this.restoreProperty(index)}>Restore</button> `
                                    : html` <button @click=${() => this.removeProperty(index)}>Remove</button> `}
                            </div>
                        `
                    )}
                    <button @click=${this.addNewProperty}>Add New Property</button>
                    <div class="dialog-buttons">
                        <div></div>
                        <div>
                            <button @click=${this.toggleEditPropertiesDialog}>Cancel</button>
                            <button @click=${this.saveProperties}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    toggleEditPropertiesDialog() {
        this.showEditPropertiesDialog = !this.showEditPropertiesDialog;
        if (this.showEditPropertiesDialog) {
            this.editingProperties = JSON.parse(JSON.stringify(this.properties));
        }
        this.requestUpdate();
    }

    updatePropertyName(index, newName) {
        this.editingProperties[index].name = newName;
        this.requestUpdate();
    }

    updatePropertyType(index, newType) {
        this.editingProperties[index].type = newType;
        if (newType === 'select' || newType === 'multi-select') {
            this.editingProperties[index].options = this.editingProperties[index].options || [];
        } else {
            delete this.editingProperties[index].options;
        }
        this.requestUpdate();
    }

    updatePropertyOptions(index, optionsString) {
        this.editingProperties[index].options = optionsString.split(',').map(opt => opt.trim());
        this.requestUpdate();
    }

    removeProperty(index) {
        const propertyName = this.editingProperties[index].name;
        const dependencyMessage = this.checkPropertyDependencies(propertyName);

        if (dependencyMessage) {
            wisk.showToast(`Cannot remove property: ${dependencyMessage}`);
            return;
        }

        // Instead of splicing, mark the property as removed
        this.editingProperties[index].removed = true;
        this.requestUpdate();
    }

    restoreProperty(index) {
        delete this.editingProperties[index].removed;
        this.requestUpdate();
    }

    checkPropertyDependencies(propertyName) {
        for (let view of this.views) {
            // Check if the property is used in groupBy (for board views)
            if (view.groupBy === propertyName) {
                return `Property "${propertyName}" is used for grouping in view "${view.name}"`;
            }

            // Check if the property is used in dateProperty (for calendar views)
            if (view.dateProperty === propertyName) {
                return `Property "${propertyName}" is used as the date property in view "${view.name}"`;
            }

            // Check if the property is used in visibleProperties (for list views)
            if (view.visibleProperties && view.visibleProperties.includes(propertyName)) {
                return `Property "${propertyName}" is visible in list view "${view.name}"`;
            }

            // Check if the property is used in filters
            for (let filter of view.filters || []) {
                if (filter.property === propertyName) {
                    return `Property "${propertyName}" is used in a filter in view "${view.name}"`;
                }
            }

            // Check if the property is used in sorts
            for (let sort of view.sorts || []) {
                if (sort.property === propertyName) {
                    return `Property "${propertyName}" is used for sorting in view "${view.name}"`;
                }
            }
        }

        return null; // No dependencies found
    }

    addNewProperty() {
        const newPropName = `New Property ${this.editingProperties.length + 1}`;
        const newProperty = { name: newPropName, type: 'text' };
        this.editingProperties.push(newProperty);

        // Use the same logic as addNewColumn
        this.entries = this.entries.map(entry => ({ ...entry, [newPropName]: '' }));

        this.requestUpdate();
    }
    saveProperties() {
        // Filter out removed properties
        const newProperties = this.editingProperties.filter(prop => !prop.removed);

        // Check for removed properties
        const removedProperties = this.properties.filter(prop => !newProperties.some(newProp => newProp.name === prop.name));

        for (let removedProp of removedProperties) {
            const dependencyMessage = this.checkPropertyDependencies(removedProp.name);
            if (dependencyMessage) {
                wisk.showToast(`Cannot remove property "${removedProp.name}": ${dependencyMessage}`);
                return;
            }
        }

        // If we've made it here, it's safe to save
        this.properties = newProperties;

        // Update entries to ensure all properties exist
        this.entries = this.entries.map(entry => {
            const newEntry = { ...entry };
            for (let prop of this.properties) {
                if (!(prop.name in newEntry)) {
                    // Initialize new properties with default values
                    newEntry[prop.name] = prop.type === 'checkbox' ? false : prop.type === 'multi-select' ? [] : '';
                }
            }
            // Remove properties that no longer exist
            Object.keys(newEntry).forEach(key => {
                if (!this.properties.some(prop => prop.name === key) && key !== 'id') {
                    delete newEntry[key];
                }
            });
            return newEntry;
        });

        this.showEditPropertiesDialog = false;
        this.requestUpdate();
        this.onUpdate();
    }

    renderFilterSortPanel() {
        return;

        if (!this.currentView) return '';
        return html`
            <div class="filter-sort-panel">
                <h4>Filters</h4>
                ${this.currentView.filters.map(
                    (filter, index) => html`
                        <div>
                            ${filter.property} ${filter.operator} ${filter.value}
                            <button @click=${() => this.removeFilter(index)}>Remove</button>
                        </div>
                    `
                )}
                <button @click=${this.addFilter}>Add Filter</button>

                <h4>Sorts</h4>
                ${this.currentView.sorts.map(
                    (sort, index) => html`
                        <div>
                            ${sort.property} (${sort.direction})
                            <button @click=${() => this.removeSort(index)}>Remove</button>
                        </div>
                    `
                )}
                <button @click=${this.addSort}>Add Sort</button>
            </div>
        `;
    }

    createNewView() {
        const newView = {
            id: `view-${Date.now()}`,
            name: `New View ${this.views.length + 1}`,
            type: 'table',
            filters: [],
            sorts: [],
        };
        this.views = [...this.views, newView];
        this.currentViewId = newView.id;
        this.editingView = { ...newView };
        this.requestUpdate();
    }

    deleteCurrentView() {
        if (confirm('Are you sure you want to delete this view?') && this.editingView && this.editingView.id !== 'default-table') {
            this.views = this.views.filter(view => view.id !== this.editingView.id);
            this.currentViewId = 'default-table';
            this.editingView = null;
            this.requestUpdate();
            this.onUpdate();
        }
    }

    addFilter() {
        if (!this.editingView) this.editingView = { ...this.currentView };
        this.editingView.filters = [...this.editingView.filters, { property: this.properties[0].name, operator: 'equals', value: '' }];
        this.requestUpdate();
    }

    removeFilter(index) {
        if (!this.editingView) this.editingView = { ...this.currentView };
        this.editingView.filters = this.editingView.filters.filter((_, i) => i !== index);
        this.requestUpdate();
    }

    addSort() {
        if (!this.editingView) this.editingView = { ...this.currentView };
        this.editingView.sorts = [...this.editingView.sorts, { property: this.properties[0].name, direction: 'asc' }];
        this.requestUpdate();
    }

    removeSort(index) {
        if (!this.editingView) this.editingView = { ...this.currentView };
        this.editingView.sorts = this.editingView.sorts.filter((_, i) => i !== index);
        this.requestUpdate();
    }

    saveEditView() {
        const index = this.views.findIndex(view => view.id === this.editingView.id);
        if (index !== -1) {
            this.views = [...this.views.slice(0, index), this.editingView, ...this.views.slice(index + 1)];
        } else {
            this.views = [...this.views, this.editingView];
        }
        this.currentViewId = this.editingView.id;
        this.editingView = null;
        this.onUpdate();
        this.requestUpdate();
    }

    renderEditViewDialog() {
        if (!this.editingView) return '';
        return html`
            <div class="dialog-overlay">
                <div class="dialog">
                    <h2>Edit View</h2>
                    <label>
                        View Name:
                        <input type="text" .value=${this.editingView.name} @input=${e => (this.editingView.name = e.target.value)} />
                    </label>
                    <label>
                        Type:
                        <select
                            .value=${this.editingView.type}
                            @change=${e => {
                                this.editingView.type = e.target.value;
                                if (e.target.value === 'board' && !this.editingView.groupBy) {
                                    this.editingView.groupBy = this.properties[0].name;
                                }
                                if (e.target.value === 'calendar' && !this.editingView.dateProperty) {
                                    this.editingView.dateProperty = this.properties.find(p => p.type === 'date')?.name || this.properties[0].name;
                                }
                                if (e.target.value === 'list' && !this.editingView.visibleProperties) {
                                    this.editingView.visibleProperties = [this.properties[0].name];
                                }
                                this.requestUpdate();
                            }}
                        >
                            <option value="table">Table</option>
                            <option value="board">Board</option>
                            <option value="calendar">Calendar</option>
                            <option value="gallery">Gallery</option>
                            <option value="list">List</option>
                        </select>
                    </label>
                    ${this.editingView.type === 'board'
                        ? html`
                              <label>
                                  Group By:
                                  <select .value=${this.editingView.groupBy} @change=${e => (this.editingView.groupBy = e.target.value)}>
                                      ${this.properties.map(
                                          prop => html`
                                              <option value=${prop.name} ?selected=${this.editingView.groupBy === prop.name}>${prop.name}</option>
                                          `
                                      )}
                                  </select>
                              </label>
                          `
                        : ''}
                    ${this.editingView.type === 'list'
                        ? html`
                              <label>
                                  Visible Properties:
                                  <div class="property-checkboxes">
                                      ${this.properties.map(
                                          prop => html`
                                              <label>
                                                  <input
                                                      type="checkbox"
                                                      .checked=${this.editingView.visibleProperties.includes(prop.name)}
                                                      @change=${e => this.toggleVisibleProperty(prop.name, e.target.checked)}
                                                  />
                                                  ${prop.name}
                                              </label>
                                          `
                                      )}
                                  </div>
                              </label>
                          `
                        : ''}
                    ${this.editingView.type === 'calendar'
                        ? html`
                              <label>
                                  Date Property:
                                  <select .value=${this.editingView.dateProperty} @change=${e => (this.editingView.dateProperty = e.target.value)}>
                                      ${this.properties
                                          .filter(prop => prop.type === 'date' || prop.type === 'datetime-local')
                                          .map(
                                              prop => html`
                                                  <option value=${prop.name} ?selected=${this.editingView.dateProperty === prop.name}>
                                                      ${prop.name}
                                                  </option>
                                              `
                                          )}
                                  </select>
                              </label>
                          `
                        : ''}
                    <h3>Filters</h3>
                    ${this.editingView.filters.map(
                        (filter, index) => html`
                            <div>
                                <select
                                    .value=${filter.property}
                                    @change=${e => {
                                        filter.property = e.target.value;
                                        filter.value = ''; // Reset value when property changes
                                        this.requestUpdate();
                                    }}
                                >
                                    ${this.properties.map(
                                        prop => html` <option value=${prop.name} ?selected=${filter.property === prop.name}>${prop.name}</option> `
                                    )}
                                </select>
                                <select
                                    .value=${filter.operator}
                                    @change=${e => {
                                        filter.operator = e.target.value;
                                        this.requestUpdate();
                                    }}
                                >
                                    <option value="equals" ?selected=${filter.operator === 'equals'}>Equals</option>
                                    <option value="contains" ?selected=${filter.operator === 'contains'}>Contains</option>
                                    <option value="greater_than" ?selected=${filter.operator === 'greater_than'}>Greater Than</option>
                                    <option value="less_than" ?selected=${filter.operator === 'less_than'}>Less Than</option>
                                </select>
                                ${this.renderFilterValueInput(filter, index)}
                                <button @click=${() => this.removeFilter(index)}>Remove</button>
                            </div>
                        `
                    )}
                    <button @click=${this.addFilter}>Add Filter</button>
                    <h3>Sorts</h3>
                    ${this.editingView.sorts.map(
                        (sort, index) => html`
                            <div>
                                <select
                                    .value=${sort.property}
                                    @change=${e => {
                                        sort.property = e.target.value;
                                        this.requestUpdate();
                                    }}
                                >
                                    ${this.properties.map(
                                        prop => html` <option value=${prop.name} ?selected=${sort.property === prop.name}>${prop.name}</option> `
                                    )}
                                </select>
                                <select
                                    .value=${sort.direction}
                                    @change=${e => {
                                        sort.direction = e.target.value;
                                        this.requestUpdate();
                                    }}
                                >
                                    <option value="asc" ?selected=${sort.direction === 'asc'}>Ascending</option>
                                    <option value="desc" ?selected=${sort.direction === 'desc'}>Descending</option>
                                </select>
                                <button @click=${() => this.removeSort(index)}>Remove</button>
                            </div>
                        `
                    )}
                    <button @click=${this.addSort}>Add Sort</button>
                    <div class="dialog-buttons">
                        ${this.editingView.id !== 'default-table'
                            ? html` <button class="delete-button" @click=${this.deleteCurrentView}>Delete View</button> `
                            : ''}
                        <div>
                            <button @click=${() => (this.editingView = null)}>Cancel</button>
                            <button @click=${this.saveEditView}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFilterValueInput(filter, index) {
        const property = this.properties.find(p => p.name === filter.property);
        switch (property.type) {
            case 'select':
                return html`
                    <select
                        .value=${filter.value}
                        @change=${e => {
                            this.editingView.filters[index].value = e.target.value;
                            this.requestUpdate();
                        }}
                    >
                        <option value="" ?selected=${filter.value === ''}>Select a value</option>
                        ${property.options.map(option => html` <option value=${option} ?selected=${filter.value === option}>${option}</option> `)}
                    </select>
                `;
            case 'multi-select':
                return html`
                    <select
                        .value=${filter.value}
                        @change=${e => {
                            this.editingView.filters[index].value = e.target.value;
                            this.requestUpdate();
                        }}
                    >
                        <option value="" ?selected=${filter.value === ''}>Select a value</option>
                        ${property.options.map(option => html` <option value=${option} ?selected=${filter.value === option}>${option}</option> `)}
                    </select>
                `;
            case 'date':
                return html`
                    <input
                        type="date"
                        .value=${filter.value}
                        @input=${e => {
                            this.editingView.filters[index].value = e.target.value;
                            this.requestUpdate();
                        }}
                    />
                `;
            case 'checkbox':
                return html`
                    <select
                        .value=${filter.value}
                        @change=${e => {
                            this.editingView.filters[index].value = e.target.value;
                            this.requestUpdate();
                        }}
                    >
                        <option value="">Select a value</option>
                        <option value="true" ?selected=${filter.value === 'true'}>True</option>
                        <option value="false" ?selected=${filter.value === 'false'}>False</option>
                    </select>
                `;
            default:
                return html`
                    <input
                        type="text"
                        .value=${filter.value}
                        @input=${e => {
                            this.editingView.filters[index].value = e.target.value;
                            this.requestUpdate();
                        }}
                    />
                `;
        }
    }

    renderTableView(entries) {
        return html`
            <table>
                <thead>
                    <tr>
                        ${this.properties.map(prop => html`<th>${prop.name}</th>`)}
                        <th>
                            <button @click=${this.toggleAddColumnForm} class="add-column-button">+</button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${entries.map(
                        entry => html`
                            <tr @click=${() => this.startEditing(entry)}>
                                ${this.properties.map(prop => html` <td>${this.renderCellValue(entry[prop.name], prop)}</td> `)}
                                <td></td>
                            </tr>
                        `
                    )}
                </tbody>
            </table>
            ${this.renderAddRowForm()}
        `;
    }

    toggleVisibleProperty(propName, isChecked) {
        if (isChecked) {
            this.editingView.visibleProperties = [...this.editingView.visibleProperties, propName];
        } else {
            this.editingView.visibleProperties = this.editingView.visibleProperties.filter(p => p !== propName);
        }
        this.requestUpdate();
    }

    renderCellValue(value, property) {
        if (value === undefined || value === null) {
            return property.type === 'checkbox' ? '✗' : '';
        }
        if (property.type === 'checkbox') {
            return value ? '✓' : '✗';
        } else if (property.type === 'multi-select' && Array.isArray(value)) {
            return value.join(', ');
        } else {
            return value.toString();
        }
    }

    renderBoardView(entries) {
        const groupByProperty = this.currentView.groupBy || 'status';
        const allGroups = this.properties.find(p => p.name === groupByProperty)?.options || [];
        const groupsFromEntries = [...new Set(entries.map(entry => entry[groupByProperty]))];
        const groups = [...new Set([...allGroups, ...groupsFromEntries])];

        return html`
            <div class="board">
                ${groups.map(
                    group => html`
                        <div class="board-column" data-group="${group}" @dragover=${this.handleDragOver} @drop=${e => this.handleDrop(e, group)}>
                            <div class="board-column-header">
                                <h3>${group}</h3>
                                <button class="add-entry-button" @click=${() => this.startAddingNewEntry(groupByProperty, group)}>+</button>
                            </div>
                            ${entries
                                .filter(entry => entry[groupByProperty] === group)
                                .map(
                                    entry => html`
                                        <div
                                            class="board-item"
                                            draggable="true"
                                            @dragstart=${e => this.handleDragStart(e, entry)}
                                            @dragend=${this.handleDragEnd}
                                            @touchstart=${e => this.handleTouchStart(e, entry)}
                                            @click=${e => {
                                                if (!this.touchMoving) {
                                                    e.preventDefault();
                                                    this.startEditing(entry);
                                                }
                                            }}
                                        >
                                            <strong>${entry.title}</strong>
                                            <p>${entry[groupByProperty]}</p>
                                        </div>
                                    `
                                )}
                        </div>
                    `
                )}
            </div>
        `;
    }

    handleTouchStart(e, entry) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.draggedItem = entry;
        this.touchMoving = false;
        this.draggedElement = e.target.closest('.board-item');

        if (this.draggedElement) {
            this.draggedElement.style.opacity = '0.5';
            this.draggedElement.style.transform = 'scale(1.05)';
        }

        // Add touch move and end listeners to the document
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    handleTouchMove(e) {
        if (!this.draggedItem || !this.draggedElement) return;

        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - this.touchStartX;
        const deltaY = touchY - this.touchStartY;

        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            this.touchMoving = true;
        }

        if (this.touchMoving) {
            this.draggedElement.style.position = 'fixed';
            this.draggedElement.style.left = `${touchX - this.draggedElement.offsetWidth / 2}px`;
            this.draggedElement.style.top = `${touchY - this.draggedElement.offsetHeight / 2}px`;
            this.draggedElement.style.zIndex = '1000';
        }

        e.preventDefault(); // Prevent scrolling while dragging
    }

    handleTouchEnd(e) {
        if (!this.draggedItem || !this.draggedElement) return;

        // Get the element under the touch point
        const touch = e.changedTouches[0];
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        const newColumnElement = elementUnderTouch.closest('.board-column');

        // Reset draggedElement styles
        this.draggedElement.style.opacity = '1';
        this.draggedElement.style.transform = 'scale(1)';
        this.draggedElement.style.position = 'static';
        this.draggedElement.style.zIndex = 'auto';

        if (this.touchMoving && newColumnElement) {
            const groupByProperty = this.currentView.groupBy || 'status';
            const newGroup = newColumnElement.dataset.group;

            if (newGroup) {
                const updatedEntry = { ...this.draggedItem, [groupByProperty]: newGroup };
                const index = this.entries.findIndex(entry => entry.id === this.draggedItem.id);
                if (index !== -1) {
                    this.entries = [...this.entries.slice(0, index), updatedEntry, ...this.entries.slice(index + 1)];
                    this.requestUpdate();
                    this.onUpdate();
                }
            }
        }

        // Clean up
        this.draggedItem = null;
        this.draggedElement = null;
        this.touchMoving = false;

        // Remove document listeners
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }

    startAddingNewEntry(groupByProperty = null, groupValue = null) {
        const newEntry = {
            id: `temp_${Date.now()}`,
            title: 'New Entry',
        };
        if (groupByProperty && groupValue) {
            newEntry[groupByProperty] = groupValue;
        }
        this.startEditing(newEntry);
    }

    renderListView(entries) {
        const visibleProperties = this.currentView.visibleProperties || ['title'];
        return html`
            <div class="list-view">
                ${entries.map(
                    entry => html`
                        <div class="list-item" @click=${() => this.startEditing(entry)}>
                            ${visibleProperties.map(propName => {
                                const prop = this.properties.find(p => p.name === propName);
                                return html`
                                    <div class="list-item-property"><strong>${propName}:</strong> ${this.renderCellValue(entry[propName], prop)}</div>
                                `;
                            })}
                        </div>
                    `
                )}
                <div class="list-item new-entry" @click=${() => this.startAddingNewEntry()}>
                    <div class="new-entry-placeholder">+</div>
                    <strong>Add New Entry</strong>
                </div>
            </div>
        `;
    }

    renderCalendarView(entries) {
        const dateProperty = this.currentView.dateProperty || 'date';
        const now = new Date();
        const [currentYear, currentMonth] = [now.getFullYear(), now.getMonth()];
        const [year, month] = this.calendarDate ? [this.calendarDate.getFullYear(), this.calendarDate.getMonth()] : [currentYear, currentMonth];

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startingDayOfWeek = firstDayOfMonth.getDay();

        const weeks = Math.ceil((daysInMonth + startingDayOfWeek) / 7);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        return html`
            <div class="calendar-container">
                <div class="calendar-header">
                    <button @click=${() => this.changeMonth(-1)}>&lt;</button>
                    <h3>${monthNames[month]} ${year}</h3>
                    <button @click=${() => this.changeMonth(1)}>&gt;</button>
                </div>
                <div class="calendar-weekdays">
                    ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => html`<div class="weekday">${day}</div>`)}
                </div>

                <div class="calendar-grid">
                    ${Array(weeks)
                        .fill()
                        .map(
                            (_, weekIndex) => html`
                                <div class="calendar-week">
                                    ${Array(7)
                                        .fill()
                                        .map((_, dayIndex) => {
                                            const dayNumber = weekIndex * 7 + dayIndex - startingDayOfWeek + 1;
                                            const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;

                                            const dayEntries = entries.filter(entry => {
                                                const entryDate = new Date(entry[dateProperty]);
                                                return (
                                                    entryDate.getFullYear() === year &&
                                                    entryDate.getMonth() === month &&
                                                    entryDate.getDate() === dayNumber
                                                );
                                            });

                                            return html`
                                                <div class="calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'}">
                                                    ${isCurrentMonth
                                                        ? html`
                                                              <div class="day-number">${dayNumber}</div>
                                                              <div class="day-content">
                                                                  ${dayEntries.map(
                                                                      entry => html`
                                                                          <div class="calendar-item" @click=${() => this.startEditing(entry)}>
                                                                              ${entry.title}
                                                                          </div>
                                                                      `
                                                                  )}
                                                              </div>
                                                              <div class="add-entry-button" @click=${() => this.addNewEntry(year, month, dayNumber)}>
                                                                  +
                                                              </div>
                                                          `
                                                        : ''}
                                                </div>
                                            `;
                                        })}
                                </div>
                            `
                        )}
                </div>
            </div>
        `;
    }

    renderGalleryView(entries) {
        return html`
            <div class="gallery">
                ${entries.map(
                    entry => html`
                        <div class="gallery-item" @click=${() => this.startEditing(entry)}>
                            <img
                                src="${entry.image || '/placeholder-image.jpg'}"
                                alt="${entry.title}"
                                style="width: 100%; height: auto; display: none"
                            />
                            <strong>${entry.title}</strong>
                        </div>
                    `
                )}
                <div class="gallery-item new-entry" @click=${() => this.startAddingNewEntry()}>
                    <div class="new-entry-placeholder">+</div>
                    <strong>Add New Entry</strong>
                </div>
            </div>
        `;
    }

    render() {
        const filteredEntries = this.applyFiltersAndSorts([...this.entries]);
        return html`
            ${this.renderViewManagement()}
            ${this.currentView.type === 'table'
                ? this.renderTableView(filteredEntries)
                : this.currentView.type === 'board'
                  ? this.renderBoardView(filteredEntries)
                  : this.currentView.type === 'calendar'
                    ? this.renderCalendarView(filteredEntries)
                    : this.currentView.type === 'gallery'
                      ? this.renderGalleryView(filteredEntries)
                      : this.currentView.type === 'list'
                        ? this.renderListView(filteredEntries)
                        : html`<p>Unknown view type</p>`}
            ${this.renderAddRowDialog()} ${this.renderAddColumnDialog()} ${this.renderEditDialog()} ${this.renderEditViewDialog()}
            ${this.renderEditPropertiesDialog()}
        `;
    }
}

customElements.define('database-element', DatabaseElement);
