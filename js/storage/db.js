// db.js
wisk.db = (function () {
    const dbName = 'WiskDatabase';
    const dataStoreName = 'WiskStore';
    const assetStoreName = 'WiskAssetStore';
    const pluginStoreName = 'WiskPluginStore'; // New store for plugins
    const dbVersion = 3; // Increased version number for new plugin store
    let db;

    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, dbVersion);
            request.onerror = event => reject('IndexedDB error: ' + event.target.error);
            request.onsuccess = event => {
                db = event.target.result;
                resolve(db);
            };
            request.onupgradeneeded = event => {
                db = event.target.result;
                // Create or ensure all stores exist
                if (!db.objectStoreNames.contains(dataStoreName)) {
                    db.createObjectStore(dataStoreName);
                }
                if (!db.objectStoreNames.contains(assetStoreName)) {
                    db.createObjectStore(assetStoreName);
                }
                if (!db.objectStoreNames.contains(pluginStoreName)) {
                    db.createObjectStore(pluginStoreName);
                }
            };
        });
    }

    // Original data store operations
    function getItem(key) {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([dataStoreName], 'readonly');
                    const store = transaction.objectStore(dataStoreName);
                    const request = store.get(key);
                    request.onerror = event => reject('Error fetching data: ' + event.target.error);
                    request.onsuccess = event => resolve(event.target.result);
                })
                .catch(reject);
        });
    }

    function setItem(key, value) {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([dataStoreName], 'readwrite');
                    const store = transaction.objectStore(dataStoreName);
                    const request = store.put(value, key);
                    request.onerror = event => reject('Error storing data: ' + event.target.error);
                    request.onsuccess = event => resolve();
                })
                .catch(reject);
        });
    }

    function removeItem(key) {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([dataStoreName], 'readwrite');
                    const store = transaction.objectStore(dataStoreName);
                    const request = store.delete(key);
                    request.onerror = event => reject('Error removing data: ' + event.target.error);
                    request.onsuccess = event => resolve();
                })
                .catch(reject);
        });
    }

    function getAllKeys() {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([dataStoreName], 'readonly');
                    const store = transaction.objectStore(dataStoreName);
                    const request = store.getAllKeys();
                    request.onerror = event => reject('Error fetching keys: ' + event.target.error);
                    request.onsuccess = event => resolve(event.target.result);
                })
                .catch(reject);
        });
    }

    // Asset store operations
    async function saveAsset(url, blob) {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([assetStoreName], 'readwrite');
                    const store = transaction.objectStore(assetStoreName);
                    const request = store.put(blob, url);
                    request.onerror = event => reject('Error storing asset: ' + event.target.error);
                    request.onsuccess = event => resolve();
                })
                .catch(reject);
        });
    }

    async function getAsset(url) {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([assetStoreName], 'readonly');
                    const store = transaction.objectStore(assetStoreName);
                    const request = store.get(url);
                    request.onerror = event => reject('Error fetching asset: ' + event.target.error);
                    request.onsuccess = event => resolve(event.target.result);
                })
                .catch(reject);
        });
    }

    async function removeAsset(url) {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([assetStoreName], 'readwrite');
                    const store = transaction.objectStore(assetStoreName);
                    const request = store.delete(url);
                    request.onerror = event => reject('Error removing asset: ' + event.target.error);
                    request.onsuccess = event => resolve();
                })
                .catch(reject);
        });
    }

    async function getAllAssetUrls() {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([assetStoreName], 'readonly');
                    const store = transaction.objectStore(assetStoreName);
                    const request = store.getAllKeys();
                    request.onerror = event => reject('Error fetching asset URLs: ' + event.target.error);
                    request.onsuccess = event => resolve(event.target.result);
                })
                .catch(reject);
        });
    }

    // New plugin store operations
    async function getPluginItem(key) {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([pluginStoreName], 'readonly');
                    const store = transaction.objectStore(pluginStoreName);
                    const request = store.get(key);
                    request.onerror = event => reject('Error fetching plugin data: ' + event.target.error);
                    request.onsuccess = event => resolve(event.target.result);
                })
                .catch(reject);
        });
    }

    async function setPluginItem(key, value) {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([pluginStoreName], 'readwrite');
                    const store = transaction.objectStore(pluginStoreName);
                    const request = store.put(value, key);
                    request.onerror = event => reject('Error storing plugin data: ' + event.target.error);
                    request.onsuccess = event => resolve();
                })
                .catch(reject);
        });
    }

    async function removePluginItem(key) {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([pluginStoreName], 'readwrite');
                    const store = transaction.objectStore(pluginStoreName);
                    const request = store.delete(key);
                    request.onerror = event => reject('Error removing plugin data: ' + event.target.error);
                    request.onsuccess = event => resolve();
                })
                .catch(reject);
        });
    }

    async function getAllPluginKeys() {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([pluginStoreName], 'readonly');
                    const store = transaction.objectStore(pluginStoreName);
                    const request = store.getAllKeys();
                    request.onerror = event => reject('Error fetching plugin keys: ' + event.target.error);
                    request.onsuccess = event => resolve(event.target.result);
                })
                .catch(reject);
        });
    }

    async function clearAllData() {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([dataStoreName, assetStoreName, pluginStoreName], 'readwrite');
                    const dataStore = transaction.objectStore(dataStoreName);
                    const assetStore = transaction.objectStore(assetStoreName);
                    const pluginStore = transaction.objectStore(pluginStoreName);

                    const clearDataRequest = dataStore.clear();
                    const clearAssetRequest = assetStore.clear();
                    const clearPluginRequest = pluginStore.clear();

                    Promise.all([
                        new Promise((res, rej) => {
                            clearDataRequest.onsuccess = () => res();
                            clearDataRequest.onerror = () => rej('Error clearing data store: ' + clearDataRequest.error);
                        }),
                        new Promise((res, rej) => {
                            clearAssetRequest.onsuccess = () => res();
                            clearAssetRequest.onerror = () => rej('Error clearing asset store: ' + clearAssetRequest.error);
                        }),
                        new Promise((res, rej) => {
                            clearPluginRequest.onsuccess = () => res();
                            clearPluginRequest.onerror = () => rej('Error clearing plugin store: ' + clearPluginRequest.error);
                        }),
                    ])
                        .then(() => resolve())
                        .catch(error => reject(error));
                })
                .catch(reject);
        });
    }

    async function getStorageStats() {
        try {
            // Get all data items and their sizes
            const dataKeys = await getAllKeys();
            let dataItems = [];

            for (const key of dataKeys) {
                const value = await getItem(key);
                let size;

                if (typeof value === 'string') {
                    // String size in bytes
                    size = new Blob([value]).size;
                } else if (value instanceof Blob) {
                    // Blob already has a size
                    size = value.size;
                } else {
                    // For objects, arrays, etc.
                    size = new Blob([JSON.stringify(value)]).size;
                }

                dataItems.push({ key, size });
            }

            // Get all asset items and their sizes
            const assetUrls = await getAllAssetUrls();
            let assetItems = [];

            for (const url of assetUrls) {
                const blob = await getAsset(url);
                if (blob) {
                    assetItems.push({ url, size: blob.size });
                }
            }

            // Get all plugin items and their sizes
            const pluginKeys = await getAllPluginKeys();
            let pluginItems = [];

            for (const key of pluginKeys) {
                const value = await getPluginItem(key);
                let size;

                if (typeof value === 'string') {
                    // String size in bytes
                    size = new Blob([value]).size;
                } else if (value instanceof Blob) {
                    // Blob already has a size
                    size = value.size;
                } else {
                    // For objects, arrays, etc.
                    size = new Blob([JSON.stringify(value)]).size;
                }

                pluginItems.push({ key, size });
            }

            // Calculate totals
            const dataStorageSize = dataItems.reduce((total, item) => total + item.size, 0);
            const assetStorageSize = assetItems.reduce((total, item) => total + item.size, 0);
            const pluginStorageSize = pluginItems.reduce((total, item) => total + item.size, 0);
            const totalStorageSize = dataStorageSize + assetStorageSize + pluginStorageSize;

            return {
                totalBytes: totalStorageSize,
                totalKB: (totalStorageSize / 1024).toFixed(2),
                totalMB: (totalStorageSize / (1024 * 1024)).toFixed(2),
                details: {
                    dataStore: {
                        count: dataItems.length,
                        bytes: dataStorageSize,
                        kb: (dataStorageSize / 1024).toFixed(2),
                        mb: (dataStorageSize / (1024 * 1024)).toFixed(2),
                        items: dataItems,
                    },
                    assetStore: {
                        count: assetItems.length,
                        bytes: assetStorageSize,
                        kb: (assetStorageSize / 1024).toFixed(2),
                        mb: (assetStorageSize / (1024 * 1024)).toFixed(2),
                        items: assetItems,
                    },
                    pluginStore: {
                        count: pluginItems.length,
                        bytes: pluginStorageSize,
                        kb: (pluginStorageSize / 1024).toFixed(2),
                        mb: (pluginStorageSize / (1024 * 1024)).toFixed(2),
                        items: pluginItems,
                    },
                },
            };
        } catch (error) {
            throw new Error('Error calculating storage stats: ' + error);
        }
    }

    return {
        // Original data store methods
        getItem,
        setItem,
        removeItem,
        getAllKeys,

        // Asset store methods
        saveAsset,
        getAsset,
        removeAsset,
        getAllAssetUrls,

        // Plugin store methods
        getPluginItem,
        setPluginItem,
        removePluginItem,
        getAllPluginKeys,

        // Utility methods
        clearAllData,
        getStorageStats,
    };
})();
