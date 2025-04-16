// [ "Fruit", "Price", "Quantity", "Total" ],
// [ "Apple", 20, 2, "=this.v(1,1) * this.v(1,2)" ],
// [ "Mango", 10, 10, "=this.v(2,1) * this.v(2,2)" ],
// [ "Banana", 5, 3, "=this.v(3,1) * this.v(3,2)" ],
// [ "", "", "", "" ],
// [ "Total", "=this.v(1,1) + this.v(2,1) + this.v(3,1)", "=this.v(1,2) + this.v(2,2) + this.v(3,2)", "=this.v(1,3) + this.v(2,3) + this.v(3,3)" ] ]
class TableElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.tableContent = {
            headers: ['Column 1'],
            rows: [['Empty']],
        };
        this.render();
    }

    connectedCallback() {
        this.bindEvents();
    }

    setValue(identifier, value) {
        if (value && value.tableContent) {
            this.tableContent = value.tableContent;
        } else {
            console.warn('Invalid value provided to TableElement. Using default empty table.');
            this.tableContent = {
                headers: ['Column 1', 'Column 2'],
                rows: [
                    ['', ''],
                    ['', ''],
                ],
            };
        }
        this.render();
        this.bindEvents();
    }

    getValue() {
        return { tableContent: this.tableContent };
    }

    getCurrentIndex() {
        return 0; // As tables don't have a single cursor position
    }

    focusOnIndex(index) {
        const firstCell = this.shadowRoot.querySelector('td');
        if (firstCell) {
            firstCell.focus();
        }
    }

    onValueUpdated() {
        wisk.editor.justUpdates(this.id);
    }

    updateCell(rowIndex, colIndex, value) {
        if (rowIndex === -1) {
            this.tableContent.headers[colIndex] = value;
        } else {
            if (!this.tableContent.rows[rowIndex]) {
                this.tableContent.rows[rowIndex] = [];
            }
            this.tableContent.rows[rowIndex][colIndex] = value;
        }
        this.onValueUpdated();
    }

    addRow() {
        const newRow = new Array(this.tableContent.headers.length).fill('');
        this.tableContent.rows.push(newRow);
        this.render();
        this.bindEvents();
        this.onValueUpdated();
    }

    addColumn() {
        const newHeader = `Column ${this.tableContent.headers.length + 1}`;
        this.tableContent.headers.push(newHeader);
        this.tableContent.rows.forEach(row => row.push(''));
        this.render();
        this.bindEvents();
        this.onValueUpdated();
    }

    render() {
        const { headers, rows } = this.tableContent;

        const innerHTML = `
            <style>
                * {
                    box-sizing: border-box;
                    padding: 0;
                    margin: 0;
                    font-size: 0.97em;
                }
                .plus-btn {
                    background-color: var(--bg-1);
                    border: none;
                    border-radius: var(--radius);
                    cursor: pointer;
                    color: var(--fg-1);
                    opacity: 0.5;
                }
                .plus-btn:hover {
                    background: var(--bg-3);
                }
                .plus-btn img {
                    width: 16px;
                    filter: var(--themed-svg);

                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid var(--bg-3);
                    border-radius: 4px;
                    white-space: normal;
                    table-layout: fixed;
                }
                th, td {
                    border: 1px solid var(--bg-3);
                    padding: var(--padding-w2);
                    text-align: left;
                }
                th {
                    font-weight: 600;
                    height: 40px;
                }
                td {
                    height: 40px;
                    max-width: 400px;
                    min-width: 100px;
                    width: auto;

                    min-width: 200px;
                    max-width: 400px;
                    width: auto;
                }
            </style>
            <div style="display: flex;">
                <table id="table" style="flex: 1">
                    <thead>
                        <tr>
                            ${headers.map((header, i) => `<th contenteditable="${!wisk.editor.readonly}" data-row="-1" data-col="${i}">${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows
                            .map(
                                (row, i) => `
                            <tr>
                                ${row.map((cell, j) => `<td contenteditable="${!wisk.editor.readonly}" data-row="${i}" data-col="${j}">${cell}</td>`).join('')}
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
                <button class="plus-btn" id="add-column"><img src="/a7/forget/plus.svg"/></button>
            </div>
            <div style="display: flex">
                <button class="plus-btn" id="add-row" style="flex: 1"><img src="/a7/forget/plus.svg"/></button>
                <button class="plus-btn" style="opacity: 0; pointer-events: none"><img src="/a7/forget/plus.svg"/></button>
            </div>
        `;

        this.shadowRoot.innerHTML = innerHTML;
    }

    bindEvents() {
        this.shadowRoot.addEventListener('input', event => {
            const cell = event.target.closest('th, td');
            if (cell) {
                const rowIndex = parseInt(cell.dataset.row);
                const colIndex = parseInt(cell.dataset.col);
                this.updateCell(rowIndex, colIndex, cell.textContent);
            }
        });

        const addRowButton = this.shadowRoot.getElementById('add-row');
        const addColumnButton = this.shadowRoot.getElementById('add-column');

        if (addRowButton) {
            addRowButton.addEventListener('click', () => this.addRow());
        }

        if (addColumnButton) {
            addColumnButton.addEventListener('click', () => this.addColumn());
        }
    }

    getTextContent() {
        const { headers, rows } = this.tableContent;
        const colWidths = headers.map((h, i) => {
            const columnCells = [h, ...rows.map(row => row[i] || '')];
            return Math.max(...columnCells.map(cell => (cell || '').toString().length));
        });

        const headerRow = '| ' + headers.map((h, i) => (h || '').toString().padEnd(colWidths[i])).join(' | ') + ' |';

        const separatorRow = '|' + colWidths.map(w => '-'.repeat(w + 2)).join('|') + '|';

        const dataRows = rows.map(row => '| ' + row.map((cell, i) => (cell || '').toString().padEnd(colWidths[i])).join(' | ') + ' |');

        const markdown = [headerRow, separatorRow, ...dataRows].join('\n');

        return {
            html: this.shadowRoot.querySelector('table').outerHTML,
            text: headers.join('\t') + '\n' + rows.map(row => row.join('\t')).join('\n'),
            markdown: markdown,
        };
    }

    // TODO remove one of these
    getMarkdownText() {
        const { headers, rows } = this.tableContent;

        if (!headers.length || !rows.length) {
            return '';
        }

        const colWidths = headers.map((h, i) => {
            const columnCells = [h, ...rows.map(row => row[i] || '')];
            return Math.max(
                ...columnCells.map(cell => {
                    const cellStr = (cell ?? '').toString();
                    return cellStr.replace(/[|\\`*_{}[\]()#+\-.!]/g, '\\$&').length;
                })
            );
        });

        const headerRow =
            '| ' +
            headers
                .map((h, i) => {
                    const cell = (h ?? '').toString();
                    const escaped = cell.replace(/[|\\`*_{}[\]()#+\-.!]/g, '\\$&');
                    return escaped.padEnd(colWidths[i]);
                })
                .join(' | ') +
            ' |';

        const separatorRow = '|' + colWidths.map(w => '-'.repeat(w + 2)).join('|') + '|';

        const dataRows = rows.map(row => {
            return (
                '| ' +
                row
                    .map((cell, i) => {
                        const cellStr = (cell ?? '').toString();
                        const escaped = cellStr.replace(/[|\\`*_{}[\]()#+\-.!]/g, '\\$&');
                        return escaped.padEnd(colWidths[i]);
                    })
                    .join(' | ') +
                ' |'
            );
        });

        return [headerRow, separatorRow, ...dataRows].join('\n');
    }
}

customElements.define('table-element', TableElement);
