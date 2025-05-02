// db.js
wisk.db = (function () {
    const dbName = 'WiskDatabase';
    const dataStoreName = 'WiskStore';
    const assetStoreName = 'WiskAssetStore';
    const pluginStoreName = 'WiskPluginStore';
    const databaseStoreName = 'WiskDatabaseStore'; // New store for database objects
    const dbVersion = 3;
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
                if (!db.objectStoreNames.contains(databaseStoreName)) {
                    db.createObjectStore(databaseStoreName); // Create the new store
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

    // New database store operations
    async function getDB(key) {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([databaseStoreName], 'readonly');
                    const store = transaction.objectStore(databaseStoreName);
                    const request = store.get(key);
                    request.onerror = event => reject('Error fetching database object: ' + event.target.error);
                    request.onsuccess = event => resolve(event.target.result);
                })
                .catch(reject);
        });
    }

    async function setDB(key, value) {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([databaseStoreName], 'readwrite');
                    const store = transaction.objectStore(databaseStoreName);
                    const request = store.put(value, key);
                    request.onerror = event => reject('Error storing database object: ' + event.target.error);
                    request.onsuccess = event => resolve();
                })
                .catch(reject);
        });
    }

    async function removeDB(key) {
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([databaseStoreName], 'readwrite');
                    const store = transaction.objectStore(databaseStoreName);
                    const request = store.delete(key);
                    request.onerror = event => reject('Error removing database object: ' + event.target.error);
                    request.onsuccess = event => resolve();
                })
                .catch(reject);
        });
    }

    async function getAllDB() {
        // Note: This gets all *values* (objects), not just keys.
        return new Promise((resolve, reject) => {
            openDB()
                .then(db => {
                    const transaction = db.transaction([databaseStoreName], 'readonly');
                    const store = transaction.objectStore(databaseStoreName);
                    const request = store.getAll(); // Use getAll() to get values
                    request.onerror = event => reject('Error fetching all database objects: ' + event.target.error);
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
                    const storesToClear = [dataStoreName, assetStoreName, pluginStoreName, databaseStoreName];
                    const transaction = db.transaction(storesToClear, 'readwrite');
                    const dataStore = transaction.objectStore(dataStoreName);
                    const assetStore = transaction.objectStore(assetStoreName);
                    const pluginStore = transaction.objectStore(pluginStoreName);
                    const databaseStore = transaction.objectStore(databaseStoreName); // Get the new store

                    const clearDataRequest = dataStore.clear();
                    const clearAssetRequest = assetStore.clear();
                    const clearPluginRequest = pluginStore.clear();
                    const clearDatabaseRequest = databaseStore.clear(); // Clear the new store

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
                        new Promise((res, rej) => {
                            // Add promise for clearing the new store
                            clearDatabaseRequest.onsuccess = () => res();
                            clearDatabaseRequest.onerror = () => rej('Error clearing database store: ' + clearDatabaseRequest.error);
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

            // Get all database items and their sizes
            // Need to get keys first, then iterate to get individual items for size calculation
            const databaseKeys = await new Promise((resolve, reject) => {
                openDB()
                    .then(db => {
                        const transaction = db.transaction([databaseStoreName], 'readonly');
                        const store = transaction.objectStore(databaseStoreName);
                        const request = store.getAllKeys();
                        request.onerror = event => reject('Error fetching database keys for stats: ' + event.target.error);
                        request.onsuccess = event => resolve(event.target.result);
                    })
                    .catch(reject);
            });

            let databaseItems = [];
            for (const key of databaseKeys) {
                const value = await getDB(key); // Use the new getDB function
                let size;

                if (typeof value === 'string') {
                    size = new Blob([value]).size;
                } else if (value instanceof Blob) {
                    size = value.size;
                } else {
                    size = new Blob([JSON.stringify(value)]).size;
                }
                databaseItems.push({ key, size });
            }

            // Calculate totals
            const dataStorageSize = dataItems.reduce((total, item) => total + item.size, 0);
            const assetStorageSize = assetItems.reduce((total, item) => total + item.size, 0);
            const pluginStorageSize = pluginItems.reduce((total, item) => total + item.size, 0);
            const databaseStorageSize = databaseItems.reduce((total, item) => total + item.size, 0); // Calculate size for the new store
            const totalStorageSize = dataStorageSize + assetStorageSize + pluginStorageSize + databaseStorageSize; // Add new store size to total

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
                    databaseStore: {
                        // Add stats details for the new store
                        count: databaseItems.length,
                        bytes: databaseStorageSize,
                        kb: (databaseStorageSize / 1024).toFixed(2),
                        mb: (databaseStorageSize / (1024 * 1024)).toFixed(2),
                        items: databaseItems,
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

        // Database store methods
        getDB,
        setDB,
        removeDB,
        getAllDB,

        // Utility methods
        clearAllData,
        getStorageStats,
    };
})();
