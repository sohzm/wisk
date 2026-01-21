// State
let socket;
let firstMsg = true;
// used to serialize event saves
let saveQueue = Promise.resolve();
let saveScheduled = false;
// contains all the events to save
wisk.sync.eventLog = [];

// get the changes, validate them and push to the eventLog
wisk.sync.newChange = function (event) {
    if(!event || !event.path || !event.value || event.value.data === undefined) {
        console.error("Invalid event: ", event);
        return;
    }
    // they will already be present, but still just in case
    event.value.timestamp ??= Date.now();
    // after auth this might need a TOUCH
    event.value.agent ??= wisk.sync.agent;

    wisk.sync.eventLog.push(event);
};

// apply event to the doc
function applyEvent(document, event) {
    const pathParts = event.path.split(".");
    const newValue = event.value.data;

    // case: full doc restore (snapshot - options element)
    if(event.action === "restore") {
        document.data = newValue;
        document.lastUpdated = event.value.timestamp;
        return;
    }

    // case: block creation
    if(event.path === "data.elements") {
        document.data ??= {};
        document.data.elements ??= [];
        document.data.elements.push(newValue);
        document.lastUpdated = event.value.timestamp;
        return;
    }

    // case: element reordering (drag and drop - editor)
    if(event.path === "data.elementOrder") {
        document.data ??= {};
        document.data.elementOrder = newValue;

        if(Array.isArray(document.data.elements)) {
            const elementsByID = new Map(document.data.elements.map((e) => [e.id, e]));
            // actual reorder
            document.data.elements = newValue.map((id) => elementsByID.get(id)).filter(Boolean);
        }

        document.lastUpdated = event.value.timestamp;
        return;
    }

    // path format: data.elements.{elementId} with newValue being a patch object
    if(pathParts.length === 3 && pathParts[0] === "data" && pathParts[1] === "elements") {
        const elementId = pathParts[2];
        document.data ??= {};
        document.data.elements ??= [];

        const element = document.data.elements.find((e) => e.id === elementId);
        if(!element) {
            console.warn(`Element ${elementId} not found for patch, skipping event`);
            return;
        }

        // whitelist allowed keys to merge (never allow overwriting id)
        const allowedKeys = ["value", "component"];
        for(const key of allowedKeys) {
            if(newValue.hasOwnProperty(key)) {
                element[key] = newValue[key];
            }
        }

        // always set lastUpdated from event timestamp
        element.lastUpdated = event.value.timestamp;
        document.lastUpdated = event.value.timestamp;
        return;
    }

    // pointer to document initialized for traversal
    let current = document;

    for(let i = 0; i < pathParts.length - 1; i++) {
        const key = pathParts[i];

        // elements array uses ID lookup
        if(key === "elements" && Array.isArray(current.elements)) {
            const elementId = pathParts[++i];
            const element = current.elements.find((e) => (e.id === elementId));
            if(!element) {
                console.warn(`Element ${elementId} not found, skipping event`);
                return;
            }
            current = element;
            continue;
        }
        // check if the next object is present so a deep path traversal wont crash
        if(current[key] === null || typeof current[key] !== "object") current[key] = {};
                current = current[key];
    }

    const lastKey = pathParts[pathParts.length - 1];
    
    if(lastKey === "deletedElements") {
        if(!Array.isArray(current.deletedElements)) current.deletedElements = [];
        current.deletedElements.push(newValue);
    } else {
        current[lastKey] = newValue;
    }

    document.lastUpdated = event.value.timestamp;
}

// queue to serialize saves
wisk.sync.enqueueSave = function (context = "unknown") {
    if(saveScheduled) return saveQueue;
    saveScheduled = true;
    saveQueue = saveQueue.then(async () => {
        saveScheduled = false;
        try {
            await saveModification();
            // if any event arrives during save
            if(wisk.sync.eventLog.length > 0) {
                wisk.sync.enqueueSave(context + "-followup");
            }
        } catch(error) {
            console.error(`Save failed (${context}): `, error);
        }
    });

    return saveQueue;
}

// persistance to DB
async function saveModification() {
    if(!wisk.sync.eventLog?.length) return;

    const eventsToSave = wisk.sync.eventLog.slice();
    const docBackup = JSON.parse(JSON.stringify(wisk.editor.document));

    // apply events to in memory document.
    eventsToSave.forEach((event) => applyEvent(wisk.editor.document, event));

    // store to syncLog for future server sync
    wisk.editor.document.data.sync ??= { syncLogs: [], isPushed: false, lastSync: 0 };
    wisk.editor.document.data.sync.syncLogs ??= [];
    wisk.editor.document.data.sync.syncLogs.push(...eventsToSave);

    try {
        await wisk.db.setPage(wisk.editor.pageId, wisk.editor.document);
        // remove the processed events, any events which arrived during save will remain in the log
        wisk.sync.eventLog = wisk.sync.eventLog.slice(eventsToSave.length);
    } catch(error) {
        console.error("Failed to save, rolling back: ", error);
        wisk.editor.document = docBackup;
        throw error;
    }
}

// this will be used when we integrate with server
wisk.sync.clearSyncLogs = function() {
    if (wisk.editor.document.data.sync) {
        wisk.editor.document.data.sync.syncLogs = [];
        wisk.editor.document.data.sync.isPushed = true;
        wisk.editor.document.data.sync.lastSync = Date.now();
    }
};

// WebSockets
function initializeWebSocket() {
    return new Promise((resolve, reject) => {
        socket = new WebSocket(wisk.editor.wsBackendUrl + '/v1/live');

        socket.addEventListener('open', () => {
            console.log('WebSocket connected');
            resolve();
        });

        socket.addEventListener('message', event => {
            handleIncomingMessage(event.data);
        });

        socket.addEventListener('error', () => {
            alert('Connection with server failed. Click OK to reload the page.');
            location.reload();
        });

        socket.addEventListener('close', () => {
            alert('Connection with server closed. Click OK to reload the page.');
            location.reload();
        });
    });
}

function sendMessage(message) {
    if (socket?.readyState === WebSocket.OPEN) {
        socket.send(message);
    } else {
        console.log('WebSocket not open. State:', socket?.readyState ?? 'uninitialized');
    }
}

async function sendAuth() {
    const user = await document.querySelector('auth-component').getUserInfo();
    sendMessage(JSON.stringify({
        id: wisk.editor.pageId,
        token: user.token,
    }));
}

function handleIncomingMessage(message) {
    const m = JSON.parse(message);
    console.log('Received:', m);

    if (firstMsg) {
        initEditor(m);
        firstMsg = false;
    }

    if (!('uuid' in m)) {
        wisk.editor.handleChanges(m);
    }
}

function startMessageLoop(interval = 5000) {
    return setInterval(() => sendMessage('hello'), interval);
}

function stopMessageLoop(intervalId) {
    clearInterval(intervalId);
}

// Page Initialization
async function sync() {
    wisk.utils.showLoading('Syncing with server...');

    const pages = await wisk.db.getAllPages();
    const offlinePages = [];

    for (const pageId of pages) {
        if (pageId.startsWith('of-')) {
            const page = await wisk.db.getPage(pageId);
            offlinePages.push(page);
        }
    }

    console.log('Offline pages:', offlinePages);
}

async function live() {
    console.log('PAGE LIVE', wisk.editor.pageId);

    if (wisk.editor.readonly) {
        // TODO: Clean up wisk.site integration
        const subdomain = window.location.hostname.split('.')[0];
        const fetchUrl = `${wisk.editor.backendUrl}/v1/new?doc=${getURLParam('uwu')}&subdomain=${subdomain}`;

        const response = await fetch(fetchUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.status !== 200) {
            window.location.href = '/404.html';
            return;
        }

        const data = await response.json();
        initEditor(data);
        return;
    }

    try {
        // await initializeWebSocket();
        // await sendAuth();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Network Status
window.addEventListener('online', () => console.log('Online'));
window.addEventListener('offline', () => console.log('Offline'));

wisk.sync.saveModification = saveModification;
wisk.sync.applyEvent = applyEvent;
