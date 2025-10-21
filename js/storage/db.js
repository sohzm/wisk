// db.js
wisk.db = (function () {
    const bc = new BroadcastChannel('database-broadcast');

    const currentDB = (() => {
        const workspaceId = localStorage.getItem('currentWorkspace');
        return workspaceId ? `WiskDatabase-${workspaceId}` : 'WiskDatabase';
    })();
    const workspacesData = localStorage.getItem('workspaces') || '{"version":1,"workspaces":[]}';
    const parsedWorkspaces = JSON.parse(workspacesData);
    const workspacesList = parsedWorkspaces.workspaces;
    const dbNames = workspacesList.map(w => `WiskDatabase-${w.id}`);
    const dbVersion = 5;
    const stores = ['WiskStore', 'WiskAssetStore', 'WiskPluginStore', 'WiskDatabaseStore', 'WiskSnapshots'];
    const functionNames = {
        WiskStore: { get: 'getPage', set: 'setPage', remove: 'removePage', getAll: 'getAllPages' },
        WiskAssetStore: { get: 'getAsset', set: 'setAsset', remove: 'removeAsset', getAll: 'getAllAssets' },
        WiskPluginStore: { get: 'getPlugin', set: 'setPlugin', remove: 'removePlugin', getAll: 'getAllPlugins' },
        WiskDatabaseStore: { get: 'getDatabase', set: 'setDatabase', remove: 'removeDatabase', getAll: 'getAllDatabases' },
        WiskSnapshots: { get: 'getSnapshot', set: 'setSnapshot', remove: 'removeSnapshot', getAll: 'getAllSnapshots' },
    };

    // Ensure 'WiskDatabase' is always present
    if (!dbNames.includes('WiskDatabase')) {
        dbNames.unshift('WiskDatabase');
    }

    function openDB(dbName) {
        return new Promise((res, rej) => {
            const req = indexedDB.open(dbName, dbVersion);
            req.onerror = e => rej(e.target.error);
            req.onsuccess = e => res(e.target.result);
            req.onupgradeneeded = e => {
                const db = e.target.result;
                stores.forEach(name => {
                    if (!db.objectStoreNames.contains(name)) {
                        db.createObjectStore(name);
                    }
                });
            };
        });
    }

    // generic factory
    function makeMethod(storeName, op) {
        return function (key, value) {
            return openDB(currentDB).then(db => {
                const mode = op === 'set' || op === 'remove' ? 'readwrite' : 'readonly';
                const tx = db.transaction(storeName, mode);
                const st = tx.objectStore(storeName);
                let req;

                switch (op) {
                    case 'get':
                        req = st.get(key);
                        break;
                    case 'set':
                        req = st.put(value, key);
                        break;
                    case 'remove':
                        req = st.delete(key);
                        break;
                    case 'getAll':
                        // By default return all value id as string array
                        req = st.getAllKeys();
                        break;
                }

                return new Promise((res, rej) => {
                    req.onsuccess = () => res(req.result);
                    req.onerror = () => rej(req.error);
                });
            });
        };
    }

    // assemble public API
    const api = {};
    Object.entries(functionNames).forEach(([storeName, fns]) => {
        api[fns.get] = makeMethod(storeName, 'get');
        if (fns.set === 'setDatabase') {
            // Special handling for setDatabase to include broadcast
            api[fns.set] = function (key, value) {
                return makeMethod(storeName, 'set')(key, value).then(result => {
                    // Broadcast the database update
                    bc.postMessage({ id: key, instance: wisk.sync.instance });
                    return result;
                });
            };
        } else {
            api[fns.set] = makeMethod(storeName, 'set');
        }
        api[fns.remove] = makeMethod(storeName, 'remove');
        api[fns.getAll] = makeMethod(storeName, 'getAll');
    });

    api.clearAllData = async function () {
        for (const dbName of dbNames) {
            const db = await openDB(dbName);
            const tx = db.transaction(stores, 'readwrite');
            stores.forEach(name => tx.objectStore(name).clear());
            await new Promise((res, rej) => {
                tx.oncomplete = () => res();
                tx.onerror = () => rej(tx.error);
            });
        }
    };

    api.getStorageStats = async function () {
        if (!navigator.storage || !navigator.storage.estimate) {
            throw new Error('StorageManager.estimate() not supported in this browser');
        }

        try {
            // Ask the browser for usage & quota
            const { usage = 0, quota = 0 } = await navigator.storage.estimate();

            const totalBytes = usage;
            const totalKB = (totalBytes / 1024).toFixed(2);
            const totalMB = (totalBytes / 1024 / 1024).toFixed(2);

            return {
                totalBytes, // bytes actually used
                totalKB, // in KB, string with 2 dp
                totalMB, // in MB, string with 2 dp
                quotaBytes: quota, // maximum bytes available to your origin
                quotaGB: (quota / 1024 / 1024 / 1024).toFixed(2),
            };
        } catch (err) {
            throw new Error('Error calculating storage stats: ' + err);
        }
    };

    // Helper function to get MIME type from filename
    function getMimeTypeFromFilename(filename) {
        const ext = filename.toLowerCase().split('.').pop();
        const mimeTypes = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
            svg: 'image/svg+xml',
            bmp: 'image/bmp',
            ico: 'image/x-icon',
            tiff: 'image/tiff',
            tif: 'image/tiff',
            pdf: 'application/pdf',
            txt: 'text/plain',
            json: 'application/json',
            xml: 'text/xml',
            html: 'text/html',
            css: 'text/css',
            js: 'text/javascript',
            mp3: 'audio/mpeg',
            mp4: 'video/mp4',
            wav: 'audio/wav',
            ogg: 'audio/ogg',
            webm: 'video/webm',
            zip: 'application/zip',
            rar: 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed',
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    // Import data from uploaded zip file
    api.importData = async function (zipFileBuffer) {
        try {
            // Unpack the zip file
            const files = fflate.unzipSync(new Uint8Array(zipFileBuffer));

            // Extract workspace metadata if exists
            let workspacesToImport = [];
            if (files['workspaces.json']) {
                const importedData = JSON.parse(new TextDecoder().decode(files['workspaces.json']));
                workspacesToImport = importedData.workspaces;
            }

            // Check for database name clashes before importing
            const existingWorkspacesData = JSON.parse(localStorage.getItem('workspaces') || '{"version":1,"workspaces":[]}');
            const existingWorkspaces = existingWorkspacesData.workspaces;
            const existingDbNames = new Set();

            // Get existing database names
            for (const workspace of existingWorkspaces) {
                const dbName = `WiskDatabase-${workspace.id}`;
                existingDbNames.add(dbName);
            }

            // Check for clashes with workspaces to import
            const clashingWorkspaces = [];
            for (const workspace of workspacesToImport) {
                const dbName = `WiskDatabase-${workspace.id}`;
                if (existingDbNames.has(dbName)) {
                    clashingWorkspaces.push(workspace.name);
                }
            }

            // Reject import if there are clashes
            if (clashingWorkspaces.length > 0) {
                throw new Error(
                    `Workspace IDs clash with existing workspaces: ${clashingWorkspaces.join(', ')}. Please export again to generate new IDs.`
                );
            }

            // No clashes, proceed with import
            if (files['workspaces.json']) {
                // Merge with existing workspaces
                const updatedWorkspaces = [...existingWorkspaces, ...workspacesToImport];
                const newStructure = {
                    version: 1,
                    workspaces: updatedWorkspaces,
                };
                localStorage.setItem('workspaces', JSON.stringify(newStructure));
                console.log(`Imported ${workspacesToImport.length} new workspaces`);
            }

            // First pass: collect asset metadata for each workspace
            const workspaceAssetMetadata = {};
            for (const fileName in files) {
                if (fileName === 'workspaces.json') continue;

                const parts = fileName.split('/');
                if (parts.length === 2 && parts[1] === 'assets.json') {
                    const workspaceName = parts[0];
                    const metadata = JSON.parse(new TextDecoder().decode(files[fileName]));
                    workspaceAssetMetadata[workspaceName] = metadata;
                    console.log(`Found asset metadata for workspace "${workspaceName}":`, metadata);
                }
            }

            // Process each workspace folder
            for (const fileName in files) {
                if (fileName === 'workspaces.json') continue;

                const parts = fileName.split('/');
                if (parts.length < 2) continue;

                const workspaceName = parts[0];
                const fileInWorkspace = parts[1];

                // Skip asset metadata files as they're processed above
                if (fileInWorkspace === 'assets.json') continue;

                // Create database name for this workspace using ID
                const workspace = workspacesToImport.find(w => workspaceName === w.name);
                const workspaceDbName = workspace
                    ? `WiskDatabase-${workspace.id}`
                    : `WiskDatabase-${workspaceName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;

                // Open the workspace database
                const workspaceDb = await new Promise((resolve, reject) => {
                    const req = indexedDB.open(workspaceDbName, dbVersion);
                    req.onerror = e => reject(e.target.error);
                    req.onsuccess = e => resolve(e.target.result);
                    req.onupgradeneeded = e => {
                        const db = e.target.result;
                        stores.forEach(storeName => {
                            if (!db.objectStoreNames.contains(storeName)) {
                                db.createObjectStore(storeName);
                            }
                        });
                    };
                });

                if (parts.length === 2) {
                    // This is a JSON store file
                    if (fileInWorkspace.endsWith('.json')) {
                        const storeName = fileInWorkspace.replace('.json', '');
                        if (stores.includes(storeName)) {
                            const data = JSON.parse(new TextDecoder().decode(files[fileName]));

                            // Import all data for this store
                            const tx = workspaceDb.transaction(storeName, 'readwrite');
                            const store = tx.objectStore(storeName);

                            for (const [key, value] of Object.entries(data)) {
                                store.put(value, key);
                            }
                        }
                    }
                } else if (parts.length === 3 && parts[1] === 'assets') {
                    // This is an asset file
                    const assetKey = parts[2];
                    const assetData = files[fileName];

                    // Get MIME type from metadata if available, otherwise fallback
                    let mimeType = 'application/octet-stream';
                    const metadata = workspaceAssetMetadata[workspaceName];
                    if (metadata && metadata[assetKey] && metadata[assetKey].mimeType) {
                        mimeType = metadata[assetKey].mimeType;
                        console.log(`Using metadata MIME type for ${assetKey}: ${mimeType}`);
                    } else {
                        mimeType = getMimeTypeFromFilename(assetKey);
                        console.log(`Using filename-based MIME type for ${assetKey}: ${mimeType}`);
                    }

                    // Convert Uint8Array back to Blob with proper MIME type
                    const blob = new Blob([assetData], { type: mimeType });

                    // Import to WiskAssetStore
                    const tx = workspaceDb.transaction('WiskAssetStore', 'readwrite');
                    const store = tx.objectStore('WiskAssetStore');
                    store.put(blob, assetKey);
                }
            }

            return true;
        } catch (error) {
            console.error('Import failed:', error);
            throw error;
        }
    };

    return api;
})();
