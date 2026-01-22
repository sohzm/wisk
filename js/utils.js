wisk.utils.activeToasts = [];

wisk.utils.showToast = function (message, duration) {
    if (!duration) duration = 3000;

    // Check if message is already being displayed
    if (wisk.utils.activeToasts.includes(message)) {
        console.log('Toast already active:', message);
        return;
    }

    console.log('Showing toast:', message, 'for', duration, 'ms');

    // Add message to active toasts array
    wisk.utils.activeToasts.push(message);

    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => {
            toast.parentNode.removeChild(toast);
            // Remove message from active toasts array
            const index = wisk.utils.activeToasts.indexOf(message);
            if (index > -1) {
                wisk.utils.activeToasts.splice(index, 1);
            }
            console.log('Toast removed from active list:', message);
        });
    }, duration);
};

wisk.utils.showInfo = function (message) {
    // TODO move to a dialog
    console.log('Showing info:', message);
    wisk.utils.showToast(message, 3000);
};

wisk.utils.showLoading = function (message) {
    console.log('Showing loading:', message);
    let loadingDiv = document.querySelector('.loading-div');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-div';
        document.body.appendChild(loadingDiv);

        let loadingTextTop = document.createElement('p');
        loadingTextTop.className = 'loading-text-top';
        loadingTextTop.textContent = 'Loading';
        loadingDiv.appendChild(loadingTextTop);

        let loadingTextBottom = document.createElement('p');
        loadingTextBottom.className = 'loading-text-bottom';
        loadingDiv.appendChild(loadingTextBottom);
    }

    let loadingTextBottom = document.querySelector('.loading-text-bottom');
    loadingTextBottom.textContent = message;
    loadingDiv.style.display = 'flex';
};

wisk.utils.hideLoading = function () {
    console.log('Hiding loading');
    let loadingDiv = document.querySelector('.loading-div');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
};

// ZIP Extractor - Custom implementation without external libraries
// Supports STORE (no compression) and DEFLATE compression methods
wisk.utils.ZipExtractor = class {
    constructor(arrayBuffer) {
        this.buffer = arrayBuffer;
        this.view = new DataView(arrayBuffer);
        this.entries = [];
    }

    // Read little-endian values from the buffer
    readUint16(offset) {
        return this.view.getUint16(offset, true);
    }

    readUint32(offset) {
        return this.view.getUint32(offset, true);
    }

    // Find End of Central Directory record (searches from end of file)
    findEOCD() {
        // EOCD signature: 0x06054b50
        // Minimum EOCD size is 22 bytes, search backwards from end
        const minEOCDSize = 22;
        const maxCommentLength = 65535;
        const searchStart = Math.max(0, this.buffer.byteLength - minEOCDSize - maxCommentLength);

        for (let i = this.buffer.byteLength - minEOCDSize; i >= searchStart; i--) {
            if (this.readUint32(i) === 0x06054b50) {
                return {
                    signature: this.readUint32(i),
                    diskNumber: this.readUint16(i + 4),
                    cdDiskNumber: this.readUint16(i + 6),
                    cdEntriesOnDisk: this.readUint16(i + 8),
                    cdTotalEntries: this.readUint16(i + 10),
                    cdSize: this.readUint32(i + 12),
                    cdOffset: this.readUint32(i + 16),
                    commentLength: this.readUint16(i + 20),
                };
            }
        }
        throw new Error('End of Central Directory not found - invalid ZIP file');
    }

    // Parse Central Directory entries
    parseEntries() {
        const eocd = this.findEOCD();
        let offset = eocd.cdOffset;

        for (let i = 0; i < eocd.cdTotalEntries; i++) {
            // Central Directory Header signature: 0x02014b50
            if (this.readUint32(offset) !== 0x02014b50) {
                throw new Error('Invalid Central Directory Header signature');
            }

            const entry = {
                versionMadeBy: this.readUint16(offset + 4),
                versionNeeded: this.readUint16(offset + 6),
                flags: this.readUint16(offset + 8),
                compression: this.readUint16(offset + 10),
                lastModTime: this.readUint16(offset + 12),
                lastModDate: this.readUint16(offset + 14),
                crc32: this.readUint32(offset + 16),
                compressedSize: this.readUint32(offset + 20),
                uncompressedSize: this.readUint32(offset + 24),
                fileNameLength: this.readUint16(offset + 28),
                extraLength: this.readUint16(offset + 30),
                commentLength: this.readUint16(offset + 32),
                diskNumber: this.readUint16(offset + 34),
                internalAttr: this.readUint16(offset + 36),
                externalAttr: this.readUint32(offset + 38),
                localHeaderOffset: this.readUint32(offset + 42),
            };

            // Read filename
            const fileNameBytes = new Uint8Array(this.buffer, offset + 46, entry.fileNameLength);
            entry.fileName = new TextDecoder().decode(fileNameBytes);

            this.entries.push(entry);

            // Move to next entry
            offset += 46 + entry.fileNameLength + entry.extraLength + entry.commentLength;
        }

        return this.entries;
    }

    // Extract a single file by entry
    async extractFile(entry) {
        // Read Local File Header
        const localOffset = entry.localHeaderOffset;

        // Local File Header signature: 0x04034b50
        if (this.readUint32(localOffset) !== 0x04034b50) {
            throw new Error('Invalid Local File Header signature');
        }

        const localFileNameLength = this.readUint16(localOffset + 26);
        const localExtraLength = this.readUint16(localOffset + 28);

        // Data starts after local header (30 bytes) + filename + extra
        const dataOffset = localOffset + 30 + localFileNameLength + localExtraLength;
        const compressedData = new Uint8Array(this.buffer, dataOffset, entry.compressedSize);

        // Handle different compression methods
        if (entry.compression === 0) {
            // STORE - no compression
            return compressedData;
        } else if (entry.compression === 8) {
            // DEFLATE - use native DecompressionStream
            try {
                const stream = new DecompressionStream('deflate-raw');
                const writer = stream.writable.getWriter();
                const reader = stream.readable.getReader();

                // Write compressed data
                writer.write(compressedData);
                writer.close();

                // Read decompressed data
                const chunks = [];
                let totalLength = 0;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                    totalLength += value.length;
                }

                // Combine chunks
                const result = new Uint8Array(totalLength);
                let offset = 0;
                for (const chunk of chunks) {
                    result.set(chunk, offset);
                    offset += chunk.length;
                }

                return result;
            } catch (err) {
                throw new Error(`Decompression failed for ${entry.fileName}: ${err.message}`);
            }
        } else {
            throw new Error(`Unsupported compression method: ${entry.compression} for ${entry.fileName}`);
        }
    }

    // Extract all files, returns a Map of filename -> Blob
    async extractAll() {
        if (this.entries.length === 0) {
            this.parseEntries();
        }

        const files = new Map();

        for (const entry of this.entries) {
            // Skip directories (they end with /)
            if (entry.fileName.endsWith('/')) {
                continue;
            }

            try {
                const data = await this.extractFile(entry);

                // Determine MIME type based on extension
                const mimeType = this.getMimeType(entry.fileName);
                const blob = new Blob([data], { type: mimeType });

                files.set(entry.fileName, blob);
            } catch (err) {
                console.warn(`Failed to extract ${entry.fileName}:`, err);
            }
        }

        return files;
    }

    // Get MIME type from filename extension
    getMimeType(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const mimeTypes = {
            // Images
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            gif: 'image/gif',
            webp: 'image/webp',
            svg: 'image/svg+xml',
            ico: 'image/x-icon',
            // Documents
            json: 'application/json',
            pdf: 'application/pdf',
            // Text
            txt: 'text/plain',
            html: 'text/html',
            css: 'text/css',
            js: 'application/javascript',
            md: 'text/markdown',
            // Audio/Video
            mp3: 'audio/mpeg',
            wav: 'audio/wav',
            mp4: 'video/mp4',
            webm: 'video/webm',
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
};

// Helper function to load a template from a ZIP URL
wisk.utils.loadTemplateFromZip = async function (zipUrl) {
    try {
        // Fetch the ZIP file
        const response = await fetch(zipUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch ZIP: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        // Extract the ZIP
        const extractor = new wisk.utils.ZipExtractor(arrayBuffer);
        const files = await extractor.extractAll();

        // Find and parse template.json
        const templateBlob = files.get('template.json');
        if (!templateBlob) {
            throw new Error('template.json not found in ZIP');
        }

        const templateText = await templateBlob.text();
        const template = JSON.parse(templateText);

        // Create asset map with blob URLs for all assets
        const assetMap = {};
        for (const [path, blob] of files) {
            // Normalize path separators (Windows uses backslash in ZIP)
            const normalizedPath = path.replace(/\\/g, '/');
            if (normalizedPath.startsWith('assets/') || normalizedPath.includes('/assets/')) {
                // Create blob URL for asset
                const blobUrl = URL.createObjectURL(blob);
                // Store with multiple path formats for matching
                assetMap[`./${normalizedPath}`] = blobUrl;
                assetMap[normalizedPath] = blobUrl;
                assetMap[`./${path}`] = blobUrl;
                assetMap[path] = blobUrl;
            }
        }

        // Get preview images if they exist
        const previews = {};
        for (const [path, blob] of files) {
            if (path.includes('preview')) {
                previews[path] = URL.createObjectURL(blob);
            }
        }

        return {
            template,
            assetMap,
            previews,
            files,
        };
    } catch (err) {
        console.error('Error loading template from ZIP:', err);
        throw err;
    }
};

// Helper to resolve asset references in template values
wisk.utils.resolveTemplateAssets = function (template, assetMap) {
    // Deep clone template to avoid modifying original
    const resolved = JSON.parse(JSON.stringify(template));

    // Recursive function to replace asset references in any object/string
    function resolveAssets(obj) {
        if (typeof obj === 'string') {
            // Check if this string is an asset reference
            // Normalize path and check for asset reference
            const normalizedObj = obj.replace(/\\/g, '/');
            if (normalizedObj.startsWith('./assets/') || normalizedObj.startsWith('assets/')) {
                return assetMap[normalizedObj] || assetMap[`./${normalizedObj}`] || assetMap[obj] || assetMap[`./${obj}`] || obj;
            }
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => resolveAssets(item));
        }

        if (obj && typeof obj === 'object') {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = resolveAssets(value);
            }
            return result;
        }

        return obj;
    }

    // Resolve assets in elements
    if (resolved.elements) {
        resolved.elements = resolved.elements.map(element => {
            if (element.value) {
                element.value = resolveAssets(element.value);
            }
            return element;
        });
    }

    return resolved;
};
