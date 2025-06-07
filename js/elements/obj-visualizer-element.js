import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class ObjVisualizerElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            margin: 0px;
            padding: 0px;
            font-size: 14px;
        }
        :host {
            display: block;
            font-family: var(--font-mono);
            line-height: 1.4;
            background: var(--bg-1);
            border-radius: 6px;
            white-space: normal;
        }

        .obj-container {
            padding-left: 0;
        }

        .obj-item {
            display: flex;
            align-items: flex-start;
            margin: 2px 0;
            word-break: break-all;
        }

        .obj-item.expandable {
            cursor: pointer;
        }

        .obj-item.expandable:hover {
            background: var(--bg-2);
            border-radius: 3px;
        }

        .expand-text {
            margin-right: 6px;
            margin-top: 0px;
            flex-shrink: 0;
            color: var(--fg-1);
            user-select: none;
        }

        .expand-text.hidden {
            visibility: hidden;
        }

        .obj-key {
            color: var(--fg-2);
            margin-right: 6px;
        }

        .obj-colon {
            color: var(--fg-1);
            margin-right: 6px;
        }

        .obj-value {
            flex: 1;
        }

        .obj-type-string {
            color: var(--fg-1);
        }

        .obj-type-number {
            color: var(--fg-1);
        }

        .obj-type-boolean {
            color: var(--fg-1);
        }

        .obj-type-null {
            color: var(--fg-1);
            font-style: italic;
        }

        .obj-type-undefined {
            color: var(--fg-1);
            font-style: italic;
        }

        .obj-type-function {
            color: var(--fg-1);
        }

        .obj-bracket {
            color: var(--fg-1);
        }

        .obj-nested {
            padding-left: 20px;
            border-left: 1px solid var(--border-1);
            margin-left: 6px;
            margin-top: 4px;
        }

        .obj-summary {
            color: var(--fg-1);
            font-style: italic;
        }

        .obj-length {
            color: var(--fg-1);
            margin-left: 4px;
        }
    `;

    static properties = {
        object: { type: String, reflect: true },
        _parsedObject: { type: Object, state: true },
        _expandedItems: { type: Object, state: true },
    };

    constructor() {
        super();
        this.object = '';
        this._parsedObject = null;
        this._expandedItems = new Set();
    }

    updated(changedProperties) {
        if (changedProperties.has('object')) {
            this._parseObject();
        }
    }

    _parseObject() {
        if (!this.object) {
            this._parsedObject = null;
            return;
        }

        try {
            this._parsedObject = JSON.parse(this.object);
        } catch (e) {
            // If it's not valid JSON, try to eval it (be careful with this in production)
            try {
                this._parsedObject = eval(`(${this.object})`);
            } catch (e2) {
                this._parsedObject = this.object; // Treat as string
            }
        }
    }

    _toggleExpand(path) {
        if (this._expandedItems.has(path)) {
            this._expandedItems.delete(path);
        } else {
            this._expandedItems.add(path);
        }
        this.requestUpdate();
    }

    _isExpandable(value) {
        return value !== null && typeof value === 'object' && (Array.isArray(value) || Object.keys(value).length > 0);
    }

    _getValueType(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return 'string';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'boolean') return 'boolean';
        if (typeof value === 'function') return 'function';
        if (Array.isArray(value)) return 'array';
        if (typeof value === 'object') return 'object';
        return 'unknown';
    }

    _renderValue(value, key = '', path = '', level = 0) {
        const isExpandable = this._isExpandable(value);
        const isExpanded = this._expandedItems.has(path);
        const valueType = this._getValueType(value);

        if (isExpandable) {
            const isArray = Array.isArray(value);
            const keys = isArray ? value : Object.keys(value);
            const length = isArray ? value.length : keys.length;

            return html`
                <div class="obj-item expandable" @click=${() => this._toggleExpand(path)}>
                    <span class="expand-text">${isExpanded ? '[-]' : '[+]'}</span>
                    ${key ? html`<span class="obj-key">${key}</span><span class="obj-colon">:</span>` : ''}
                    <span class="obj-value">
                        <span class="obj-bracket">${isArray ? '[' : '{'}</span>
                        ${!isExpanded
                            ? html`
                                  <span class="obj-summary">...</span>
                                  <span class="obj-length">(${length})</span>
                              `
                            : ''}
                        <span class="obj-bracket">${isArray ? ']' : '}'}</span>
                    </span>
                </div>
                ${isExpanded
                    ? html`
                          <div class="obj-nested">
                              ${isArray
                                  ? value.map((item, index) => this._renderValue(item, index.toString(), `${path}.${index}`, level + 1))
                                  : Object.entries(value).map(([k, v]) => this._renderValue(v, k, `${path}.${k}`, level + 1))}
                          </div>
                      `
                    : ''}
            `;
        }

        // Render primitive values
        return html`
            <div class="obj-item">
                <span class="expand-text hidden"></span>
                ${key ? html`<span class="obj-key">${key}</span><span class="obj-colon">:</span>` : ''}
                <span class="obj-value obj-type-${valueType}"> ${this._renderPrimitiveValue(value, valueType)} </span>
            </div>
        `;
    }

    _renderPrimitiveValue(value, type) {
        switch (type) {
            case 'string':
                return value;
            case 'number':
                return value.toString();
            case 'boolean':
                return value.toString();
            case 'null':
                return 'null';
            case 'undefined':
                return 'undefined';
            case 'function':
                return 'ƒ ' + (value.name || 'anonymous') + '()';
            default:
                return String(value);
        }
    }

    render() {
        if (this._parsedObject === null) {
            return html`<div class="obj-item"><span class="obj-value obj-type-null">No object to display</span></div>`;
        }

        return html` <div class="obj-container">${this._renderValue(this._parsedObject, '', 'root', 0)}</div> `;
    }
}

customElements.define('obj-visualizer-element', ObjVisualizerElement);
