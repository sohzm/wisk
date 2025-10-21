// migrations.js - Handles data migrations for Wisk
// This script runs immediately on load before anything else

// Helper function to generate workspace IDs (needs to be global for use in other files)
window.generateWorkspaceId = function () {
    const timestamp = Date.now().toString();
    const randomChars = Array.from({ length: 5 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
    return timestamp + randomChars;
};

(async function () {
    console.log('Running migrations...');

    function getOldDbName(workspaceName) {
        return workspaceName === '' || !workspaceName ? 'WiskDatabase' : `WiskDatabase-${workspaceName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
    }

    function getNewDbName(workspaceId) {
        return `WiskDatabase-${workspaceId}`;
    }

    async function renameIndexedDB(oldName, newName) {
        if (oldName === newName) {
            console.log(`Skipping rename: ${oldName} (same name)`);
            return;
        }

        console.log(`Migrating database: ${oldName} -> ${newName}`);

        const dbVersion = 5;
        const stores = ['WiskStore', 'WiskAssetStore', 'WiskPluginStore', 'WiskDatabaseStore', 'WiskSnapshots'];

        // Open the old database
        const oldDb = await new Promise((resolve, reject) => {
            const req = indexedDB.open(oldName, dbVersion);
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

        // Create the new database
        const newDb = await new Promise((resolve, reject) => {
            const req = indexedDB.open(newName, dbVersion);
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

        // Copy all data from old to new
        for (const storeName of stores) {
            const oldTx = oldDb.transaction(storeName, 'readonly');
            const oldStore = oldTx.objectStore(storeName);

            // Get all data from old store
            const allData = await new Promise((resolve, reject) => {
                const req = oldStore.getAll();
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });

            const allKeys = await new Promise((resolve, reject) => {
                const req = oldStore.getAllKeys();
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });

            // Write to new store
            const newTx = newDb.transaction(storeName, 'readwrite');
            const newStore = newTx.objectStore(storeName);

            for (let i = 0; i < allData.length; i++) {
                newStore.put(allData[i], allKeys[i]);
            }

            await new Promise((resolve, reject) => {
                newTx.oncomplete = () => resolve();
                newTx.onerror = () => reject(newTx.error);
            });
        }

        // Close both databases
        oldDb.close();
        newDb.close();

        // Delete the old database
        await new Promise((resolve, reject) => {
            const req = indexedDB.deleteDatabase(oldName);
            req.onsuccess = () => {
                console.log(`Deleted old database: ${oldName}`);
                resolve();
            };
            req.onerror = () => reject(req.error);
        });
    }

    async function migrateWorkspaces() {
        const workspacesData = localStorage.getItem('workspaces');

        // Check if workspaces exists and is an array (old format)
        if (!workspacesData) {
            // No workspaces data, create default structure
            const defaultWorkspace = {
                name: 'Default Workspace',
                emoji: '💕',
                id: window.generateWorkspaceId(),
            };

            const newStructure = {
                version: 1,
                workspaces: [defaultWorkspace],
            };

            localStorage.setItem('workspaces', JSON.stringify(newStructure));
            localStorage.setItem('currentWorkspace', defaultWorkspace.id);
            console.log('Created default workspace structure');
            return;
        }

        let parsedData;
        try {
            parsedData = JSON.parse(workspacesData);
        } catch (e) {
            console.error('Failed to parse workspaces data:', e);
            return;
        }

        // Check if it's already the new format
        if (parsedData.version === 1) {
            console.log('Workspaces already migrated to version 1');
            return;
        }

        // It's an array (old format), migrate it
        if (Array.isArray(parsedData)) {
            console.log('Starting workspace migration...');

            const migratedWorkspaces = [];

            for (const workspace of parsedData) {
                // Generate ID for this workspace - always generate new IDs
                const id = window.generateWorkspaceId();

                const migratedWorkspace = {
                    name: workspace.name || 'Default Workspace',
                    emoji: workspace.emoji || '💕',
                    id: id,
                };

                migratedWorkspaces.push(migratedWorkspace);

                // Rename the IndexedDB database
                const oldDbName = getOldDbName(workspace.name);
                const newDbName = getNewDbName(id);

                try {
                    await renameIndexedDB(oldDbName, newDbName);
                } catch (error) {
                    console.error(`Failed to migrate database for workspace "${workspace.name}":`, error);
                }
            }

            // Update to new structure
            const newStructure = {
                version: 1,
                workspaces: migratedWorkspaces,
            };

            localStorage.setItem('workspaces', JSON.stringify(newStructure));
            console.log('Workspace migration complete:', newStructure);

            // Update currentWorkspace to use ID instead of name
            const currentWorkspaceName = localStorage.getItem('currentWorkspace');
            if (currentWorkspaceName !== null) {
                const currentWorkspace = migratedWorkspaces.find(w => w.name === currentWorkspaceName);
                if (currentWorkspace) {
                    localStorage.setItem('currentWorkspace', currentWorkspace.id);
                    console.log(`Updated currentWorkspace to ID: ${currentWorkspace.id}`);
                }
            }
        }
    }

    try {
        await migrateWorkspaces();
        console.log('Migrations complete');
    } catch (error) {
        console.error('Migration failed:', error);
    }
})();
