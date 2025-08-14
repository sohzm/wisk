class CheckboxElement extends BaseTextElement {
    constructor() {
        super();
        this.indent = 0;
        this.checked = false;
        this.reminder = null; // Store reminder data
        this.render();

        this.checkbox = this.shadowRoot.querySelector('#checkbox');
        this.updateIndent();
        this.updateCheckbox();
        this.updatePlaceholder();
    }

    connectedCallback() {
        super.connectedCallback();
        this.checkbox = this.shadowRoot.querySelector('#checkbox');
        this.updateIndent();
        this.updateCheckbox();
        this.updatePlaceholder();

        this.checkbox.addEventListener('change', this.onCheckboxChange.bind(this));
        this.editable.addEventListener('input', this.checkForReminders.bind(this));
    }

    updatePlaceholder() {
        if (this.editable) {
            const isEmpty = !this.editable.innerHTML.trim();
            this.editable.classList.toggle('empty', isEmpty);
            this.editable.dataset.placeholder = this.getAttribute('placeholder') || this.placeholder;
        }
    }

    updateIndent() {
        const indentWidth = 20;
        this.shadowRoot.querySelectorAll('.indent').forEach(el => el.remove());
        const container = this.shadowRoot.querySelector('#list-outer');
        for (let i = 0; i < this.indent; i++) {
            const indentSpan = document.createElement('span');
            indentSpan.className = 'indent';
            container.insertBefore(indentSpan, container.firstChild);
        }
    }

    updateCheckbox() {
        if (this.checkbox) {
            this.checkbox.checked = this.checked;
        }
    }

    onCheckboxChange(event) {
        if (wisk.editor.readonly) return;

        this.checked = event.target.checked;

        // If checked and there was a reminder set, cancel it
        if (this.checked && this.reminder && this.reminder.id) {
            this.cancelReminder(this.reminder.id);
            this.reminder = null;
            this.updateReminderDisplay();
        }

        this.sendUpdates();
    }

    getValue() {
        var ret = {
            textContent: this.editable?.innerHTML || '',
            indent: this.indent,
            checked: this.checked,
            reminder: this.reminder,
        };

        console.log('GET', ret);
        return ret;
    }

    setValue(path, value) {
        console.log('SET', path, value);
        if (!this.editable) {
            return;
        }

        if (path === 'value.append') {
            this.editable.innerHTML += value.textContent;
        } else {
            this.editable.innerHTML = value.textContent;
            this.indent = value.indent || 0;
            this.checked = value.checked || false;
            this.reminder = value.reminder || null;
        }

        this.updateIndent();
        this.updateCheckbox();
        this.updateReminderDisplay();
    }

    // Parse natural language time expressions
    parseNaturalLanguageTime(timeStr) {
        const now = new Date();
        let targetDate = new Date(now);

        // Handle common natural language time expressions
        if (timeStr.match(/\btoday\b/i)) {
            // Keep targetDate as is
        } else if (timeStr.match(/\btomorrow\b/i)) {
            targetDate.setDate(targetDate.getDate() + 1);
        } else if (timeStr.match(/\byesterday\b/i)) {
            targetDate.setDate(targetDate.getDate() - 1);
        } else if (timeStr.match(/\bin\s+(\d+)\s+days?\b/i)) {
            const days = parseInt(timeStr.match(/\bin\s+(\d+)\s+days?\b/i)[1]);
            targetDate.setDate(targetDate.getDate() + days);
        } else if (timeStr.match(/\bin\s+(\d+)\s+hours?\b/i)) {
            const hours = parseInt(timeStr.match(/\bin\s+(\d+)\s+hours?\b/i)[1]);
            targetDate.setHours(targetDate.getHours() + hours);
        } else if (timeStr.match(/\bin\s+(\d+)\s+seconds?\b/i)) {
            const seconds = parseInt(timeStr.match(/\bin\s+(\d+)\s+seconds?\b/i)[1]);
            targetDate.setSeconds(targetDate.getSeconds() + seconds);
        } else if (timeStr.match(/\bin\s+(\d+)\s+minutes?\b/i)) {
            const minutes = parseInt(timeStr.match(/\bin\s+(\d+)\s+minutes?\b/i)[1]);
            targetDate.setMinutes(targetDate.getMinutes() + minutes);
        } else if (timeStr.match(/\ba\s+day\s+after\s+tomorrow\b/i)) {
            targetDate.setDate(targetDate.getDate() + 2);
        } else if (timeStr.match(/\bnext\s+week\b/i)) {
            targetDate.setDate(targetDate.getDate() + 7);
        } else if (timeStr.match(/\bnext\s+month\b/i)) {
            targetDate.setMonth(targetDate.getMonth() + 1);
        } else if (timeStr.match(/\bnext\s+year\b/i)) {
            targetDate.setFullYear(targetDate.getFullYear() + 1);
        }

        // Extract time if specified (e.g., "tomorrow at 3pm")
        const timeMatch = timeStr.match(/\bat\s+(\d+)(?::(\d+))?\s*(am|pm)?/i);
        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
            const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

            if (ampm === 'pm' && hours < 12) hours += 12;
            if (ampm === 'am' && hours === 12) hours = 0;

            targetDate.setHours(hours, minutes, 0, 0);
        }

        return targetDate;
    }

    // Parse specific time format: hh:mm-dd/mm/yy
    parseSpecificTimeFormat(timeStr) {
        const regex = /(\d{1,2}):(\d{2})-(\d{1,2})\/(\d{1,2})\/(\d{2,4})/;
        const match = timeStr.match(regex);

        if (match) {
            const [_, hours, minutes, day, month, year] = match;

            // Handle 2-digit year
            let fullYear = parseInt(year);
            if (fullYear < 100) {
                fullYear += fullYear < 50 ? 2000 : 1900;
            }

            return new Date(fullYear, parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
        }

        return null;
    }

    // Check for reminders in text and process them
    checkForReminders() {
        if (wisk.editor.readonly) return;

        const text = this.editable.innerHTML;
        const reminderRegex = /@([^\n<]+)/g;
        let match;

        while ((match = reminderRegex.exec(text)) !== null) {
            const reminderText = match[1];

            // Try to parse as specific format first
            let reminderDate = this.parseSpecificTimeFormat(reminderText);

            // If that fails, try natural language parsing
            if (!reminderDate) {
                reminderDate = this.parseNaturalLanguageTime(reminderText);
            }

            if (reminderDate && reminderDate > new Date()) {
                // Valid future date found, set reminder
                this.setReminder(reminderText, reminderDate);
                break;
            }
        }
    }

    // Set a reminder
    setReminder(reminderText, reminderDate) {
        // Cancel any existing reminder
        if (this.reminder && this.reminder.id) {
            this.cancelReminder(this.reminder.id);
        }

        const reminderId = Math.random().toString(36).substring(2, 15);

        this.reminder = {
            id: reminderId,
            text: reminderText,
            date: reminderDate.toISOString(),
            formattedDate: this.formatDateTime(reminderDate),
        };

        // Schedule the notification
        const timeUntilReminder = reminderDate.getTime() - new Date().getTime();

        if (timeUntilReminder > 0) {
            setTimeout(() => {
                this.showNotification(this.editable.innerText);
            }, timeUntilReminder);
        }

        this.updateReminderDisplay();
        this.sendUpdates();
    }

    // Cancel a reminder
    cancelReminder(reminderId) {
        // Just remove the reminder data, the setTimeout can't be easily cancelled
        if (this.reminder && this.reminder.id === reminderId) {
            this.reminder = null;
            this.updateReminderDisplay();
            this.sendUpdates();
        }
    }

    // Format date and time for display
    formatDateTime(date) {
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
        return date.toLocaleDateString(undefined, options);
    }

    // Update the reminder display in the UI
    updateReminderDisplay() {
        const reminderDisplay = this.shadowRoot.querySelector('#reminder-display');

        if (reminderDisplay) {
            if (this.reminder) {
                reminderDisplay.innerHTML = `<img src='/a7/forget/bell.svg' style="filter: var(--accent-svg); width: 15px" alt='bell' /> ${this.reminder.formattedDate}`;
                reminderDisplay.style.display = 'flex';
            } else {
                reminderDisplay.style.display = 'none';
            }
        }
    }

    // Show browser notification
    showNotification(taskText) {
        if (!this.checked && typeof Notification !== 'undefined') {
            if (Notification.permission === 'granted') {
                this.createNotification(taskText);
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.createNotification(taskText);
                    }
                });
            }
        }
    }

    // Create the actual notification
    createNotification(taskText) {
        const notification = new Notification('Task Reminder', {
            body: taskText,
            icon: '/favicon.ico', // Assuming favicon exists
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        // Auto close after 30 seconds
        setTimeout(() => notification.close(), 30000);
    }

    handleEnterKey(event) {
        event.preventDefault();
        const selection = this.shadowRoot.getSelection();
        const range = selection.getRangeAt(0);

        const beforeRange = document.createRange();
        beforeRange.setStart(this.editable, 0);
        beforeRange.setEnd(range.startContainer, range.startOffset);

        const afterRange = document.createRange();
        afterRange.setStart(range.endContainer, range.endOffset);
        afterRange.setEnd(this.editable, this.editable.childNodes.length);

        const beforeContainer = document.createElement('div');
        const afterContainer = document.createElement('div');

        beforeContainer.appendChild(beforeRange.cloneContents());
        afterContainer.appendChild(afterRange.cloneContents());

        this.editable.innerHTML = beforeContainer.innerHTML;
        this.sendUpdates();

        if (this.editable.innerText.trim().length === 0) {
            wisk.editor.changeBlockType(this.id, { textContent: afterContainer.innerHTML }, 'text-element');
        } else {
            wisk.editor.createNewBlock(
                this.id,
                'checkbox-element',
                {
                    textContent: afterContainer.innerHTML,
                    indent: this.indent,
                    checked: false,
                    reminder: null,
                },
                { x: 0 }
            );
        }
    }

    handleBackspace(event) {
        if (this.getFocus() === 0) {
            event.preventDefault();

            if (this.indent > 0) {
                this.indent--;
                this.updateIndent();
                this.sendUpdates();
            } else {
                const prevElement = wisk.editor.prevElement(this.id);
                const prevDomElement = wisk.editor.getElement(prevElement.id);
                if (prevElement) {
                    const prevComponentDetail = wisk.plugins.getPluginDetail(prevElement.component);
                    if (prevComponentDetail.textual) {
                        const len = prevDomElement.value.textContent.length;
                        wisk.editor.updateBlock(prevElement.id, 'value.append', {
                            textContent: this.editable.innerHTML,
                        });
                        wisk.editor.focusBlock(prevElement.id, { x: len });
                    }
                    wisk.editor.deleteBlock(this.id);
                }
            }
        }
    }

    handleTab(event) {
        event.preventDefault();
        if (this.getFocus() === 0) {
            this.indent++;
            this.updateIndent();
            this.sendUpdates();
        } else {
            document.execCommand('insertText', false, '    ');
        }
    }

    handleBeforeInput(event) {
        if (event.inputType === 'insertText' && event.data === '/' && this.editable.innerText.trim() === '') {
            event.preventDefault();
            wisk.editor.showSelector(this.id);
        } else if (event.inputType === 'insertText' && event.data === ' ' && this.getFocus() === 0) {
            event.preventDefault();
            this.indent++;
            this.updateIndent();
            this.sendUpdates();
        }
    }

    render() {
        const style = `
            <style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
                font-family: var(--font);
                outline: none;
            }
            #editable {
                outline: none;
                flex: 1;
                line-height: 1.5;
                position: relative;
                min-height: 24px;
                transition: opacity 0.2s ease;
            }
            #list-outer {
                width: 100%;
                border: none;
                display: flex;
                flex-direction: row;
                gap: 8px;
                align-items: flex-start;
                position: relative;
            }
            .indent {
                width: 20px;
            }
            #checkbox {
                appearance: none;
                flex-shrink: 0;
                -webkit-appearance: none;
                width: 20px;
                height: 20px;
                border: 2px solid var(--fg-2);
                border-radius: 0;
                background: var(--bg-1);
                cursor: pointer;
                position: relative;
                margin-top: 3px;
                transition: all 0.2s ease;
                opacity: 0.8;
            }
            #checkbox:checked {
                background: var(--fg-1);
                border-color: var(--fg-1);
                opacity: 1;
            }
            #checkbox:checked:after {
                content: '';
                position: absolute;
                left: 5px;
                top: 2px;
                width: 4px;
                height: 8px;
                border: solid var(--bg-1);
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
            }
            #checkbox:checked ~ #editable {
                text-decoration: line-through;
                opacity: 0.6;
            }
            #checkbox:hover {
                border-color: var(--fg-1);
            }
            a {
                color: var(--fg-blue);
                text-decoration: underline;
            }
            .reference-number {
                color: var(--fg-blue);
                cursor: pointer;
                text-decoration: none;
                margin: 0 1px;
                font-family: var(--font-mono);
            }
            #editable.empty:empty:before {
                content: attr(data-placeholder);
                color: var(--text-3);
                pointer-events: none;
                position: absolute;
                opacity: 0.6;
                top: 0;
                left: 0;
            }
            #reminder-display {
                font-size: 0.8em;
                color: var(--fg-accent);
                padding: var(--padding-w1);
                border-radius: var(--radius-large);
                background: linear-gradient(45deg, transparent, var(--bg-accent));
                margin-top: 4px;
                display: none;
                align-items: center;
                justify-content: flex-end;
                gap: 5px;
            }
            .reminder-active {
                border-left: 3px solid var(--fg-1);
                padding-left: 4px;
            }
            .reminder-chip {
                display: inline-block;
                background: var(--bg-3);
                color: var(--fg-blue);
                padding: 1px 5px;
                border-radius: 10px;
                font-size: 0.8em;
                margin-left: 5px;
            }
            .emoji-suggestions {
                position: absolute;
                background: var(--bg-1);
                border: 1px solid var(--border-1);
                border-radius: var(--radius);
                padding: var(--padding-2);
                box-shadow: var(--shadow-1);
                display: none;
                z-index: 1000;
                max-height: 200px;
                overflow-y: auto;
                width: max-content;
                min-width: 200px;
            }
            .emoji-suggestion {
                padding: var(--padding-2);
                display: flex;
                align-items: center;
                gap: var(--gap-2);
                cursor: pointer;
                border-radius: var(--radius);
            }
            .emoji-suggestion.selected {
                background: var(--bg-3);
            }
            .emoji-suggestion:hover {
                background: var(--bg-3);
            }
            .emoji-name {
                color: var(--fg-2);
                font-size: 0.9em;
            }
            .emoji {
                width: 30px;
                text-align: center;
            }

            @media (hover: hover) {
                *::-webkit-scrollbar { width: 15px; }
                *::-webkit-scrollbar-track { background: var(--bg-1); }
                *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
                *::-webkit-scrollbar-thumb:hover { background-color: var(--fg-1); }
            }
            .suggestion-text {
                opacity: 0.8;
                color: var(--fg-1);
            }
            .suggestion-container {
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                padding: var(--padding-2);
                margin-top: 4px;
                display: none;
                z-index: 1;
            }
            .suggestion-actions {
                display: flex;
                gap: var(--gap-2);
                justify-content: center;
            }
            .suggestion-button {
                padding: var(--padding-2) var(--padding-3);
                border-radius: var(--radius);
                border: none;
                background: var(--bg-1);
                outline: none;
                color: var(--fg-1);
                cursor: pointer;
            }
            .suggestion-button:hover {
                background: var(--bg-3);
            }
            .accept-button {
                background: var(--bg-1);
                color: var(--fg-1);
                font-weight: bold;
            }
            .task-container {
                display: flex;
                flex-direction: column;
                width: 100%;
            }
            </style>
        `;
        const content = `
            <div id="list-outer">
                <input type="checkbox" id="checkbox" name="checkbox" value="checkbox" ${wisk.editor.readonly ? 'onclick="return false"' : ''} />
                <div class="task-container">
                    <div id="editable" contenteditable="${!wisk.editor.readonly}" spellcheck="false" data-placeholder="${this.placeholder || 'Add a task...'}"></div>
                    <div id="reminder-display"></div>
                </div>
                <div class="suggestion-container">
                    <div class="suggestion-actions">
                        <button class="suggestion-button discard-button">Discard</button>
                        <button class="suggestion-button accept-button"> Accept [Tab or Enter] </button>
                    </div>
                </div>
                <div class="emoji-suggestions"></div>
            </div>
        `;
        this.shadowRoot.innerHTML = style + content;
    }

    getTextContent() {
        const indentation = '  '.repeat(this.indent); // Two spaces per indent level
        const checkboxMarker = this.checked ? '[x]' : '[ ]';
        let markdown = indentation + `- ${checkboxMarker} ` + wisk.editor.htmlToMarkdown(this.editable.innerHTML);

        // Add reminder to markdown if exists
        if (this.reminder) {
            markdown += ` [@${this.reminder.text}]`;
        }

        return {
            html: this.editable.innerHTML,
            text: this.editable.innerText,
            markdown: markdown,
        };
    }
}

customElements.define('checkbox-element', CheckboxElement);
