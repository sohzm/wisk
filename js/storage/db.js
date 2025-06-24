// db.js
wisk.db = (function () {
    const dbName = (() => {
        const name = localStorage.getItem('currentWorkspace');
        return name ? `WiskDatabase-${name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}` : 'WiskDatabase';
    })();
    const dbVersion = 5;
    const stores = ['WiskStore', 'WiskAssetStore', 'WiskPluginStore', 'WiskDatabaseStore', 'WiskSnapshots'];
    const functionNames = {
        WiskStore: { get: 'getPage', set: 'setPage', remove: 'removePage', getAll: 'getAllPages' },
        WiskAssetStore: { get: 'getAsset', set: 'setAsset', remove: 'removeAsset', getAll: 'getAllAssets' },
        WiskPluginStore: { get: 'getPlugin', set: 'setPlugin', remove: 'removePlugin', getAll: 'getAllPlugins' },
        WiskDatabaseStore: { get: 'getDatabase', set: 'setDatabase', remove: 'removeDatabase', getAll: 'getAllDatabases' },
        WiskSnapshots: { get: 'getSnapshot', set: 'setSnapshot', remove: 'removeSnapshot', getAll: 'getAllSnapshots' },
    };

    let db;

    function openDB() {
        return new Promise((res, rej) => {
            const req = indexedDB.open(dbName, dbVersion);
            req.onerror = e => rej(e.target.error);
            req.onsuccess = e => ((db = e.target.result), res(db));
            req.onupgradeneeded = e => {
                db = e.target.result;
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
            return openDB().then(db => {
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
        api[fns.set] = makeMethod(storeName, 'set');
        api[fns.remove] = makeMethod(storeName, 'remove');
        api[fns.getAll] = makeMethod(storeName, 'getAll');
    });

    api.clearAllData = async function () {
        const db = await openDB();
        const tx = db.transaction(stores, 'readwrite');
        stores.forEach(name => tx.objectStore(name).clear());
        return new Promise((res, rej) => {
            tx.oncomplete = () => res();
            tx.onerror = () => rej(tx.error);
        });
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

    return api;
})();
