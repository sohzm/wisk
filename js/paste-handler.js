/*
Unified paste handler for wisk: consolidates all paste handling logic for the application.
*/

class WiskPasteHandler {
    static isWiskClipboardFormat(htmlData) {
        return htmlData && htmlData.includes('__WISK_CLIPBOARD__');
    }

    static parseWiskClipboard(htmlData) {
        if (!htmlData) return null;

        const match = htmlData.match(/__WISK_CLIPBOARD__(.+?)__WISK_CLIPBOARD_END__/);
        if (!match) return null;

        try {
            const jsonString = decodeURIComponent(escape(atob(match[1])));
            const wiskData = JSON.parse(jsonString);
            if (wiskData.__wisk_elements__ && wiskData.elements) {
                return wiskData.elements;
            }
        } catch (error) {
            try {
                const wiskData = JSON.parse(match[1]);
                if (wiskData.__wisk_elements__ && wiskData.elements) {
                    return wiskData.elements;
                }
            } catch (fallbackError) {
                console.error('Failed to parse wisk clipboard data: ', error);
            }
        }

        return null;
    }

    static handleWiskClipboardPaste(event) {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return null;

        const html = clipboardData.getData('text/html');
        return WiskPasteHandler.parseWiskClipboard(html);
    }

    static sanitizeAndConvertLinks(htmlString) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;

        tempDiv.querySelectorAll('script, style, iframe, object, embed, form, input, button, meta, link, base').forEach(el => el.remove());

        tempDiv.querySelectorAll('*').forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('on')) {
                    el.removeAttribute(attr.name);
                }
            });
        });

        const links = tempDiv.querySelectorAll('a');
        links.forEach(link => {
            let href = link.getAttribute('href');

            if (href) {
                href = href.replace(/\\/g, '').replace(/&quot;/g, '').replace(/&amp;/g, '&').trim();
                const safeProtocols = /^(https?:|mailto:|tel:|\/|#)/i;
                if (!safeProtocols.test(href)) {
                    href = null;
                }
            }

            if (href) {
                const linkText = link.textContent || '';
                const wiskDisplay = link.getAttribute('data-wisk-display') || 'inline';
                const linkElement = document.createElement('link-element');
                linkElement.setAttribute('url', href);
                linkElement.setAttribute('display', wiskDisplay);
                linkElement.setAttribute('contenteditable', 'false');

                if (linkText) {
                    linkElement.setAttribute('title', linkText);
                }

                link.parentNode.replaceChild(linkElement, link);
            } else {
                link.setAttribute('contenteditable', 'false');
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });

        return tempDiv.innerHTML;
    }

    static getIndentLevel(element) {
        let indent = 0;
        let parent = element.parentElement;
        while (parent) {
            if (parent.tagName === 'UL' || parent.tagName === 'OL') {
                indent++;
            }
            parent = parent.parentElement;
        }
        return Math.max(0, indent - 1);
    }

    static isPartOfProcessedList(node) {
        let parent = node.parentElement;
        while (parent) {
            if (parent._processed) return true;
            parent = parent.parentElement;
        }
        return false;
    }

    static getDirectChildrenLi(listNode) {
        return Array.from(listNode.children).filter(child => child.tagName === 'LI');
    }

    static extractContentFromLi(li) {
        const clone = li.cloneNode(true);
        clone.querySelectorAll('ul, ol').forEach(list => list.remove());
        clone.querySelectorAll('input').forEach(input => input.remove());
        const blockElements = [];
        clone.querySelectorAll('table').forEach(table => {
            blockElements.push({ type: 'table', node: table.cloneNode(true) });
            table.remove();
        });
        clone.querySelectorAll('pre').forEach(pre => {
            blockElements.push({ type: 'code', node: pre.cloneNode(true) });
            pre.remove();
        });
        const paragraphs = clone.querySelectorAll('p');
        let text = '';

        if (paragraphs.length > 0) {
            text = Array.from(paragraphs).map(p => p.innerHTML.trim()).filter(t => t).join('<br>');
        } else {
            text = clone.innerHTML.trim();
        }
        text = text.replace(/^\[[\sx]\]\s*/, '');

        return { text, blockElements };
    }

    static processListRecursively(listNode, baseIndent = 0, numberCounters = {}, isCheckboxList = false) {
        const results = [];
        const directChildren = WiskPasteHandler.getDirectChildrenLi(listNode);
        const isNumbered = listNode.tagName === 'OL';

        if (!numberCounters[baseIndent]) {
            numberCounters[baseIndent] = 1;
        }

        directChildren.forEach((li) => {
            li._processed = true;
            li.querySelectorAll('*').forEach(child => {
                child._processed = true;
            });
            const { text, blockElements } = WiskPasteHandler.extractContentFromLi(li);
            const item = {
                type: 'list-item',
                text: WiskPasteHandler.sanitizeAndConvertLinks(text),
                indent: baseIndent,
            };

            if (isNumbered) {
                item.number = numberCounters[baseIndent];
                numberCounters[baseIndent]++;
            }

            if (isCheckboxList) {
                item.checked = li.textContent.startsWith('[x]') || li.querySelector('input[type="checkbox"]')?.checked || false;
            }

            results.push(item);
            blockElements.forEach(block => {
                results.push({
                    type: 'block-element',
                    blockType: block.type,
                    node: block.node,
                    indent: baseIndent,
                });
            });
            const nestedList = Array.from(li.children).find(child =>
                child.tagName === 'UL' || child.tagName === 'OL'
            );

            if (nestedList) {
                nestedList._processed = true;
                numberCounters[baseIndent + 1] = 1;
                const nestedDirectChildren = WiskPasteHandler.getDirectChildrenLi(nestedList);
                const isNestedCheckboxList = nestedDirectChildren.some(
                    li => li.textContent.startsWith('[ ]') || li.textContent.startsWith('[x]') || li.querySelector('input[type="checkbox"]')
                );

                const nestedResults = WiskPasteHandler.processListRecursively(nestedList, baseIndent + 1, numberCounters, isNestedCheckboxList);
                results.push(...nestedResults);
            }
        });

        return results;
    }

    static parseTableNode(tableNode) {
        const headers = [];
        const rows = [];
        const thead = tableNode.querySelector('thead');
        if (thead) {
            const headerRow = thead.querySelector('tr');
            if (headerRow) {
                Array.from(headerRow.querySelectorAll('th')).forEach(th => {
                    headers.push(th.textContent.trim());
                });
            }
        }
        const tbody = tableNode.querySelector('tbody') || tableNode;
        Array.from(tbody.querySelectorAll(':scope > tr')).forEach(tr => {
            if (!thead && tr.querySelector('th') && headers.length === 0) {
                Array.from(tr.querySelectorAll('th')).forEach(th => {
                    headers.push(th.textContent.trim());
                });
                return;
            }
            const rowData = [];
            Array.from(tr.querySelectorAll('td')).forEach(td => {
                rowData.push(td.textContent.trim());
            });
            if (rowData.length > 0) {
                rows.push(rowData);
            }
        });

        return { headers, rows };
    }

    static parseCodeNode(node) {
        const pre = node.tagName.toLowerCase() === 'pre' ? node : node.closest('pre');
        const code = pre ? pre.querySelector('code') : (node.tagName.toLowerCase() === 'code' ? node : null);
        const codeText = code ? code.textContent : node.textContent;

        let language = 'javascript';
        if (code && code.className) {
            const match = code.className.match(/language-(\w+)/);
            if (match) {
                language = match[1];
            }
        }

        return {
            textContent: codeText.trim(),
            language: language
        };
    }

    static processNode(node, structuredElements) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text) {
                structuredElements.push({
                    elementName: 'text-element',
                    value: text,
                });
            }
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return;

        let element = null;
        let skipChildren = false;

        switch (node.tagName.toLowerCase()) {
            case 'h1': {
                if (node.textContent.trim()) {
                    element = { elementName: 'heading1-element', value: WiskPasteHandler.sanitizeAndConvertLinks(node.innerHTML.trim()) };
                }
                skipChildren = true;
                break;
            }
            case 'h2': {
                if (node.textContent.trim()) {
                    element = { elementName: 'heading2-element', value: WiskPasteHandler.sanitizeAndConvertLinks(node.innerHTML.trim()) };
                }
                skipChildren = true;
                break;
            }
            case 'h3': {
                if (node.textContent.trim()) {
                    element = { elementName: 'heading3-element', value: WiskPasteHandler.sanitizeAndConvertLinks(node.innerHTML.trim()) };
                }
                skipChildren = true;
                break;
            }
            case 'h4': {
                if (node.textContent.trim()) {
                    element = { elementName: 'heading4-element', value: WiskPasteHandler.sanitizeAndConvertLinks(node.innerHTML.trim()) };
                }
                skipChildren = true;
                break;
            }
            case 'h5': {
                if (node.textContent.trim()) {
                    element = { elementName: 'heading5-element', value: WiskPasteHandler.sanitizeAndConvertLinks(node.innerHTML.trim()) };
                }
                skipChildren = true;
                break;
            }
            case 'ul':
            case 'ol': {
                if (!node._processed) {
                    node._processed = true;
                    const directLiChildren = WiskPasteHandler.getDirectChildrenLi(node);
                    const isCheckboxList = directLiChildren.some(
                        li => li.textContent.startsWith('[ ]') || li.textContent.startsWith('[x]') || li.querySelector('input[type="checkbox"]')
                    );
                    let elementName;
                    if (isCheckboxList && node.tagName.toLowerCase() === 'ul') {
                        elementName = 'checkbox-element';
                    } else {
                        elementName = node.tagName.toLowerCase() === 'ul' ? 'list-element' : 'numbered-list-element';
                    }
                    const results = WiskPasteHandler.processListRecursively(node, 0, {}, isCheckboxList);
                    const listItems = results.filter(r => r.type === 'list-item');
                    const blockElements = results.filter(r => r.type === 'block-element');
                    element = {
                        elementName: elementName,
                        value: listItems.map(item => {
                            const itemValue = { text: item.text, indent: item.indent };
                            if (item.number !== undefined) {
                                itemValue.number = item.number;
                            }
                            if (item.checked !== undefined) {
                                itemValue.checked = item.checked;
                            }
                            return itemValue;
                        }),
                    };
                    blockElements.forEach(blockEl => {
                        if (blockEl.blockType === 'table') {
                            const { headers, rows } = WiskPasteHandler.parseTableNode(blockEl.node);
                            if (headers.length > 0 || rows.length > 0) {
                                structuredElements.push({
                                    elementName: 'table-element',
                                    value: {
                                        tableContent: {
                                            headers: headers.length > 0 ? headers : ['Column 1'],
                                            rows: rows.length > 0 ? rows : [['']],
                                        }
                                    }
                                });
                            }
                        } else if (blockEl.blockType === 'code') {
                            const codeData = WiskPasteHandler.parseCodeNode(blockEl.node);
                            structuredElements.push({
                                elementName: 'code-element',
                                value: codeData
                            });
                        }
                    });

                    skipChildren = true;
                }
                break;
            }
            case 'li': {
                if (!WiskPasteHandler.isPartOfProcessedList(node) && !node._processed) {
                    const isCheckbox =
                        node.textContent.startsWith('[ ]') ||
                        node.textContent.startsWith('[x]') ||
                        node.querySelector('input[type="checkbox"]');

                    if (isCheckbox) {
                        element = {
                            elementName: 'checkbox-element',
                            value: [
                                {
                                    text: WiskPasteHandler.sanitizeAndConvertLinks(node.innerHTML.replace(/^\[[\sx]\]\s*/, '').trim()),
                                    checked: node.textContent.startsWith('[x]') || node.querySelector('input[type="checkbox"]')?.checked,
                                    indent: WiskPasteHandler.getIndentLevel(node),
                                },
                            ],
                        };
                    } else {
                        element = {
                            elementName: 'list-element',
                            value: [
                                {
                                    text: WiskPasteHandler.sanitizeAndConvertLinks(node.innerHTML.trim()),
                                    indent: WiskPasteHandler.getIndentLevel(node),
                                },
                            ],
                        };
                    }
                    skipChildren = true;
                }
                break;
            }
            case 'blockquote':
                element = { elementName: 'quote-element', value: WiskPasteHandler.sanitizeAndConvertLinks(node.innerHTML.trim()) };
                skipChildren = true;
                break;
            case 'pre':
            case 'code':
                element = {
                    elementName: 'code-element',
                    value: WiskPasteHandler.parseCodeNode(node)
                };
                skipChildren = true;
                break;
            case 'hr': {
                element = { elementName: 'divider-element', value: '' };
                skipChildren = true;
                break;
            }
            case 'img': {
                if (node.src) {
                    element = {
                        elementName: 'image-element',
                        value: { imageUrl: node.src, textContent: '' },
                    };
                }
                skipChildren = true;
                break;
            }
            case 'p': {
                if (node.textContent.trim()) {
                    element = { elementName: 'text-element', value: WiskPasteHandler.sanitizeAndConvertLinks(node.innerHTML.trim()) };
                }
                skipChildren = true;
                break;
            }
            case 'table': {
                const { headers, rows } = WiskPasteHandler.parseTableNode(node);
                if (headers.length > 0 || rows.length > 0) {
                    element = {
                        elementName: 'table-element',
                        value: {
                            tableContent: {
                                headers: headers.length > 0 ? headers : ['Column 1'],
                                rows: rows.length > 0 ? rows : [['']],
                            }
                        }
                    };
                }
                skipChildren = true;
                break;
            }
        }

        if (element) {
            structuredElements.push(element);
        }

        if (!skipChildren) {
            node.childNodes.forEach(childNode => {
                WiskPasteHandler.processNode(childNode, structuredElements);
            });
        }
    }

    static flattenElements(structuredElements) {
        const flattenedElements = [];

        structuredElements.forEach((element, idx) => {
            if (Array.isArray(element.value)) {
                element.value.forEach((item, index) => {
                    if (typeof item === 'object') {
                        const newElement = {
                            elementName: element.elementName,
                            value: {
                                textContent: item.text || '',
                                indent: typeof item.indent === 'number' ? item.indent : 0,
                            },
                        };

                        if (element.elementName === 'checkbox-element') {
                            newElement.value.checked = !!item.checked;
                        }

                        if (element.elementName === 'numbered-list-element') {
                            newElement.value.number = item.number !== undefined ? item.number : index + 1;
                        }

                        flattenedElements.push(newElement);
                    } else {
                        flattenedElements.push({
                            elementName: element.elementName,
                            value: {
                                textContent: item,
                            },
                        });
                    }
                });
            } else if (element.elementName === 'image-element') {
                flattenedElements.push({
                    elementName: element.elementName,
                    value: {
                        imageUrl: element.value,
                        textContent: '',
                    },
                });
            } else if (element.elementName === 'table-element') {
                flattenedElements.push({
                    elementName: element.elementName,
                    value: element.value,
                });
            } else if (element.elementName === 'code-element') {
                flattenedElements.push({
                    elementName: element.elementName,
                    value: element.value,
                });
            } else if (element.elementName === 'latex-element') {
                flattenedElements.push({
                    elementName: element.elementName,
                    value: element.value,
                });
            } else {
                flattenedElements.push({
                    elementName: element.elementName,
                    value: {
                        textContent: element.value,
                    },
                });
            }
        });

        return flattenedElements;
    }

    static parseHtmlToElements(htmlData) {
        if (!htmlData) return [];

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlData, 'text/html');
        const structuredElements = [];

        WiskPasteHandler.processNode(doc.body, structuredElements);

        return WiskPasteHandler.flattenElements(structuredElements);
    }

    static isMarkdownText(text) {
        if (!text) return false;
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length === 0) return false;

        let markdownPatterns = 0;
        for (const line of lines) {
            const trimmed = line.trim();
            // Headings
            if (/^#{1,5}\s+.+$/.test(trimmed)) markdownPatterns++;
            // Lists
            else if (/^[-*+]\s+.+$/.test(trimmed)) markdownPatterns++;
            // Ordered lists
            else if (/^\d+[.)]\s+.+$/.test(trimmed)) markdownPatterns++;
            // Checkboxes
            else if (/^[-*+]\s+\[[ xX]\]\s*.+$/.test(trimmed)) markdownPatterns++;
            // Code blocks
            else if (/^```/.test(trimmed)) markdownPatterns++;
            // Block quotes
            else if (/^>\s*.+$/.test(trimmed)) markdownPatterns++;
            // Horizontal rules
            else if (/^([-*_])\1{2,}$/.test(trimmed)) markdownPatterns++;
            // Table rows
            else if (/^\|.+\|$/.test(trimmed)) markdownPatterns++;
            // Table separator
            else if (/^\|[\s\-:|]+\|$/.test(trimmed)) markdownPatterns++;
            // LaTeX block equations ($$...$$ or \[...\])
            else if (/^\$\$/.test(trimmed) || /^\\\[/.test(trimmed)) markdownPatterns++;
        }
        return markdownPatterns > 0 && (markdownPatterns >= 1 || markdownPatterns / lines.length >= 0.2);
    }

    static parseInlineMarkdown(text) {
        if (!text) return '';

        let result = text;
        // Escape HTML entities first (but preserve existing HTML tags we want to keep)
        result = result.replace(/&/g, '&amp;');
        // Don't escape < and > for HTML tags we want to preserve
        result = result.replace(/<(?!(b|i|u|strike|code|a|br|span|strong|em)\b)/g, '&lt;');
        result = result.replace(/(?<!\b(b|i|u|strike|code|a|br|span|strong|em))>/g, '&gt;');
        // Bold and italic combined (***text*** or ___text___)
        result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<b><i>$1</i></b>');
        result = result.replace(/___(.+?)___/g, '<b><i>$1</i></b>');
        // Bold (**text** or __text__)
        result = result.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
        result = result.replace(/__(.+?)__/g, '<b>$1</b>');
        // Italic (*text* or _text_) - be careful not to match inside words
        result = result.replace(/\*([^*]+)\*/g, '<i>$1</i>');
        result = result.replace(/(?<![a-zA-Z])_([^_]+)_(?![a-zA-Z])/g, '<i>$1</i>');
        // Strikethrough (~~text~~)
        result = result.replace(/~~(.+?)~~/g, '<strike>$1</strike>');
        // Inline code (`code`)
        result = result.replace(/`([^`]+)`/g, '<code style="background: var(--bg-2); padding: 2px 4px; border-radius: 3px; font-family: var(--font-mono);">$1</code>');
        // Links [text](url) - convert to link-element
        result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<link-element url="$2" display="inline" title="$1" contenteditable="false"></link-element>');
        // Images ![alt](url) - convert to text representation
        result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '[Image: $1]');

        return result;
    }

    static isTableRow(line) {
        const trimmed = line.trim();
        return trimmed.startsWith('|') && trimmed.endsWith('|');
    }

    static isTableSeparator(line) {
        const trimmed = line.trim();
        return /^\|[\s\-:|]+\|$/.test(trimmed);
    }

    static parseTableRowCells(line) {
        return line.trim()
            .slice(1, -1)
            .split('|')
            .map(cell => cell.trim());
    }

    static parseMarkdownText(text) {
        if (!text) return [];

        const lines = text.split(/\r?\n/);
        const elements = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                i++;
                continue;
            }
            if (trimmedLine.startsWith('<details') || trimmedLine.startsWith('</details') ||
                trimmedLine.startsWith('<summary') || trimmedLine.startsWith('</summary')) {
                i++;
                continue;
            }
            if (trimmedLine.startsWith('```')) {
                const language = trimmedLine.slice(3).trim() || 'plaintext';
                const codeLines = [];
                i++;
                while (i < lines.length && !lines[i].trim().startsWith('```')) {
                    codeLines.push(lines[i]);
                    i++;
                }
                i++;
                elements.push({
                    elementName: 'code-element',
                    value: {
                        textContent: codeLines.join('\n'),
                        language: language
                    }
                });
                continue;
            }

            // LaTeX block equations ($$...$$)
            if (trimmedLine.startsWith('$$')) {
                // Check for single-line equation: $$equation$$
                if (trimmedLine.length > 4 && trimmedLine.endsWith('$$')) {
                    const latex = trimmedLine.slice(2, -2).trim();
                    if (latex) {
                        elements.push({
                            elementName: 'latex-element',
                            value: { latex: latex }
                        });
                    }
                    i++;
                    continue;
                }

                // Multi-line equation
                const latexLines = [];
                const firstLineContent = trimmedLine.slice(2).trim();
                if (firstLineContent) {
                    latexLines.push(firstLineContent);
                }
                i++;

                while (i < lines.length) {
                    const currentLine = lines[i];
                    const currentTrimmed = currentLine.trim();

                    // Check for closing $$
                    if (currentTrimmed.endsWith('$$')) {
                        const lastLineContent = currentTrimmed.slice(0, -2).trim();
                        if (lastLineContent) {
                            latexLines.push(lastLineContent);
                        }
                        i++;
                        break;
                    } else if (currentTrimmed === '$$') {
                        i++;
                        break;
                    }

                    latexLines.push(currentLine);
                    i++;
                }

                const latex = latexLines.join('\n').trim();
                if (latex) {
                    elements.push({
                        elementName: 'latex-element',
                        value: { latex: latex }
                    });
                }
                continue;
            }

            // LaTeX block equations (\[...\])
            if (trimmedLine.startsWith('\\[')) {
                // Check for single-line equation: \[equation\]
                if (trimmedLine.endsWith('\\]') && trimmedLine.length > 4) {
                    const latex = trimmedLine.slice(2, -2).trim();
                    if (latex) {
                        elements.push({
                            elementName: 'latex-element',
                            value: { latex: latex }
                        });
                    }
                    i++;
                    continue;
                }

                // Multi-line equation
                const latexLines = [];
                const firstLineContent = trimmedLine.slice(2).trim();
                if (firstLineContent) {
                    latexLines.push(firstLineContent);
                }
                i++;

                while (i < lines.length) {
                    const currentLine = lines[i];
                    const currentTrimmed = currentLine.trim();

                    // Check for closing \]
                    if (currentTrimmed.endsWith('\\]')) {
                        const lastLineContent = currentTrimmed.slice(0, -2).trim();
                        if (lastLineContent) {
                            latexLines.push(lastLineContent);
                        }
                        i++;
                        break;
                    } else if (currentTrimmed === '\\]') {
                        i++;
                        break;
                    }

                    latexLines.push(currentLine);
                    i++;
                }

                const latex = latexLines.join('\n').trim();
                if (latex) {
                    elements.push({
                        elementName: 'latex-element',
                        value: { latex: latex }
                    });
                }
                continue;
            }

            // Tables
            if (WiskPasteHandler.isTableRow(trimmedLine)) {
                const tableRows = [];
                let headers = [];
                let hasHeaders = false;

                headers = WiskPasteHandler.parseTableRowCells(lines[i]);
                i++;

                if (i < lines.length && WiskPasteHandler.isTableSeparator(lines[i])) {
                    hasHeaders = true;
                    i++;
                }

                while (i < lines.length && WiskPasteHandler.isTableRow(lines[i].trim())) {
                    tableRows.push(WiskPasteHandler.parseTableRowCells(lines[i]));
                    i++;
                }

                if (hasHeaders) {
                    elements.push({
                        elementName: 'table-element',
                        value: {
                            tableContent: {
                                headers: headers,
                                rows: tableRows.length > 0 ? tableRows : [['']]
                            }
                        }
                    });
                } else {
                    const allRows = [headers, ...tableRows];
                    elements.push({
                        elementName: 'table-element',
                        value: {
                            tableContent: {
                                headers: allRows[0].map((_, idx) => `Column ${idx + 1}`),
                                rows: allRows
                            }
                        }
                    });
                }
                continue;
            }

            // Setext-style heading (=== for h1)
            if (i + 1 < lines.length && /^=+$/.test(lines[i + 1].trim()) && trimmedLine) {
                elements.push({
                    elementName: 'heading1-element',
                    value: { textContent: WiskPasteHandler.parseInlineMarkdown(trimmedLine) }
                });
                i += 2;
                continue;
            }

            // Setext-style heading (--- for h2)
            if (i + 1 < lines.length && /^-+$/.test(lines[i + 1].trim()) && trimmedLine && !trimmedLine.startsWith('-')) {
                elements.push({
                    elementName: 'heading2-element',
                    value: { textContent: WiskPasteHandler.parseInlineMarkdown(trimmedLine) }
                });
                i += 2;
                continue;
            }

            // ATX headings (# style)
            const headingMatch = trimmedLine.match(/^(#{1,5})\s+(.+)$/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                elements.push({
                    elementName: `heading${level}-element`,
                    value: { textContent: WiskPasteHandler.parseInlineMarkdown(headingMatch[2]) }
                });
                i++;
                continue;
            }

            // Horizontal rules
            if (/^([-*_])\1{2,}$/.test(trimmedLine)) {
                elements.push({
                    elementName: 'divider-element',
                    value: { textContent: '' }
                });
                i++;
                continue;
            }

            // Checkbox list items
            const checkboxMatch = trimmedLine.match(/^[-*+]\s+\[([ xX])\]\s*(.*)$/);
            if (checkboxMatch) {
                const indent = Math.floor((line.length - line.trimStart().length) / 2);
                elements.push({
                    elementName: 'checkbox-element',
                    value: {
                        textContent: WiskPasteHandler.parseInlineMarkdown(checkboxMatch[2]),
                        checked: checkboxMatch[1].toLowerCase() === 'x',
                        indent: indent
                    }
                });
                i++;
                continue;
            }

            // Unordered list items
            const unorderedMatch = trimmedLine.match(/^[-*+]\s+(.+)$/);
            if (unorderedMatch) {
                const indent = Math.floor((line.length - line.trimStart().length) / 2);
                elements.push({
                    elementName: 'list-element',
                    value: {
                        textContent: WiskPasteHandler.parseInlineMarkdown(unorderedMatch[1]),
                        indent: indent
                    }
                });
                i++;
                continue;
            }

            // Ordered list items
            const orderedMatch = trimmedLine.match(/^(\d+)[.)]\s+(.+)$/);
            if (orderedMatch) {
                const indent = Math.floor((line.length - line.trimStart().length) / 2);
                elements.push({
                    elementName: 'numbered-list-element',
                    value: {
                        textContent: WiskPasteHandler.parseInlineMarkdown(orderedMatch[2]),
                        number: parseInt(orderedMatch[1], 10),
                        indent: indent
                    }
                });
                i++;
                continue;
            }

            // Block quotes
            const quoteMatch = trimmedLine.match(/^>+\s*(.*)$/);
            if (quoteMatch) {
                elements.push({
                    elementName: 'quote-element',
                    value: { textContent: WiskPasteHandler.parseInlineMarkdown(quoteMatch[1]) }
                });
                i++;
                continue;
            }

            // Skip HTML tags we don't want to process
            if (trimmedLine.startsWith('<') && (
                trimmedLine.includes('<summary>') ||
                trimmedLine.includes('</summary>') ||
                trimmedLine.includes('<img') ||
                trimmedLine.includes('<br')
            )) {
                i++;
                continue;
            }

            // Regular text
            elements.push({
                elementName: 'text-element',
                value: { textContent: WiskPasteHandler.parseInlineMarkdown(trimmedLine) }
            });
            i++;
        }

        return elements;
    }

    static cleanPlainText(text) {
        if (!text) return '';
        return text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
    }

    static insertPlainText(text) {
        const cleanedText = WiskPasteHandler.cleanPlainText(text);
        if (cleanedText) {
            document.execCommand('insertText', false, cleanedText);
        }
    }

    static isURL(text) {
        if (!text) return false;
        const trimmed = text.trim();
        try {
            const url = new URL(trimmed);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (error) {
            return false;
        }
    }

    static normalizeUrl(url) {
        if (!url) return '';
        const trimmed = url.trim();
        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
            return 'https://' + trimmed;
        }
        return trimmed;
    }

    static isInternalUrl(url) {
        if (!url) return false;
        if (url.startsWith('https://app.wisk.cc')) return true;

        try {
            const urlObj = new URL(url);
            const currentOrigin = window.location.origin;
            if (urlObj.origin === currentOrigin && urlObj.searchParams.has('id')) return true;
        } catch {}

        return false;
    }

    static isImageURL(url) {
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'];
        const lowerURL = url.toLowerCase();
        return imageExtensions.some(ext => lowerURL.includes(ext));
    }

    static isVideoURL(url) {
        const videoPatterns = [
            /youtube\.com\/watch/,
            /youtu\.be\//,
            /vimeo\.com\//,
            /dailymotion\.com\//,
        ];
        return videoPatterns.some(pattern => pattern.test(url));
    }

    static async handleImagePaste(event) {
        const clipboardData = event.clipboardData;
        if (!clipboardData || !clipboardData.items) return null;

        for (const item of clipboardData.items) {
            if (item.type.startsWith('image/')) {
                event.preventDefault();
                const file = item.getAsFile();
                if (!file) return null;

                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({
                            elementName: 'image-element',
                            value: {
                                imageUrl: e.target.result,
                                textContent: '',
                            },
                        });
                    };
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(file);
                });
            }
        }

        return null;
    }

    static handleTextElementPaste(event, elementId, options = {}) {
        const clipboardData = event.clipboardData || window.clipboardData;

        if (clipboardData.items) {
            for (const item of clipboardData.items) {
                if (item.type.startsWith('image/')) {
                    event.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        const extension = file.type.split('/')[1] || 'png';
                        const uniqueUrl = 'image-' + Date.now() + '.' + extension;
                        wisk.db.setAsset(uniqueUrl, file).then(() => {
                            wisk.editor.createNewBlock(elementId, 'image-element', {
                                imageUrl: uniqueUrl,
                                textContent: '',
                            }, { x: 0 });
                        }).catch(err => {
                            console.error('[Paste] Failed to store image:', err);
                        });

                        return { handled: true, elements: [], isImage: true };
                    }
                }
            }
        }

        const htmlData = clipboardData.getData('text/html');
        const plainText = clipboardData.getData('text') || clipboardData.getData('text/plain');
        if (WiskPasteHandler.isWiskClipboardFormat(htmlData)) {
            return { handled: false, elements: null, isWiskFormat: true };
        }
        if (plainText && WiskPasteHandler.isURL(plainText.trim())) {
            const url = plainText.trim();
            return { handled: false, elements: null, isStandaloneUrl: true, url: url };
        }
        if (htmlData) {
            event.preventDefault();
            const flattenedElements = WiskPasteHandler.parseHtmlToElements(htmlData);

            if (flattenedElements.length === 0) {
                if (plainText) {
                    WiskPasteHandler.insertPlainText(plainText);
                }
                return { handled: true, elements: [] };
            }
            if (flattenedElements.length === 1 && flattenedElements[0].elementName === 'text-element') {
                const textContent = flattenedElements[0].value.textContent || '';
                if (textContent.trim()) {
                    document.execCommand('insertHTML', false, textContent);
                }
                return { handled: true, elements: flattenedElements };
            }
            let inx = 0;
            let lastId = elementId;
            const currentBlockEmpty = options.isCurrentBlockEmpty !== undefined ? options.isCurrentBlockEmpty : true;

            if (flattenedElements[0].elementName === 'text-element' &&
                flattenedElements[0].value.textContent &&
                flattenedElements[0].value.textContent.trim() !== '' &&
                !currentBlockEmpty) {
                wisk.editor.updateBlock(elementId, 'value.append', flattenedElements[0].value);
                inx = 1;
            }

            for (let i = inx; i < flattenedElements.length; i++) {
                lastId = wisk.editor.createBlockNoFocus(lastId, flattenedElements[i].elementName, flattenedElements[i].value);
            }

            return { handled: true, elements: flattenedElements };
        }
        if (plainText) {
            event.preventDefault();
            if (WiskPasteHandler.isMarkdownText(plainText)) {
                const parsedElements = WiskPasteHandler.parseMarkdownText(plainText);

                if (parsedElements.length > 0) {
                    let inx = 0;
                    let lastId = elementId;

                    const currentBlockEmpty = options.isCurrentBlockEmpty !== undefined ? options.isCurrentBlockEmpty : true;

                    if (parsedElements[0].elementName === 'text-element' &&
                        parsedElements[0].value.textContent &&
                        parsedElements[0].value.textContent.trim() !== '' &&
                        !currentBlockEmpty) {
                        wisk.editor.updateBlock(elementId, 'value.append', parsedElements[0].value);
                        inx = 1;
                    }

                    for (let i = inx; i < parsedElements.length; i++) {
                        lastId = wisk.editor.createBlockNoFocus(lastId, parsedElements[i].elementName, parsedElements[i].value);
                    }

                    return { handled: true, elements: parsedElements };
                }
            }
            WiskPasteHandler.insertPlainText(plainText);
            return { handled: true, elements: [] };
        }

        return { handled: false, elements: null };
    }
}
