function determineServerUrl() {
    const currentUrl = window.location.href;
    let serverUrl = 'http://localhost:8788';

    switch (true) {
        case currentUrl.includes('30009'):
            serverUrl = 'http://localhost:30009';
            break;

        case currentUrl.includes('.wisk.site'):
            const subdomain = currentUrl.split('https://')[1].split('.wisk.site')[0];
            serverUrl = `https://${subdomain}.wisk.site`;
            break;

        case currentUrl.includes('ngrok'):
            serverUrl = currentUrl.split('.ngrok-free.app')[0] + '.ngrok-free.app';
            break;

        case currentUrl.includes('wisk.cc'):
            serverUrl = 'https://app.wisk.cc';
            break;
    }

    return serverUrl;
}

const SERVER = determineServerUrl();

// TODO move these to wisk.utils
function byId(id) {
    return document.getElementById(id);
}

function byClass(className) {
    return document.getElementsByClassName(className);
}

function byQuery(query) {
    return document.querySelector(query);
}

function byQueryAll(query) {
    return document.querySelectorAll(query);
}

function byQueryShadowroot(query) {
    if (query[0] === '#' && query.includes('-')) {
        query = query.slice(1);
        query = query.split('-');
        console.log('---', query);
        var e = byQuery('#' + query[0]);
        console.log('--- 1', e);
        for (let i = 1; i < query.length; i++) {
            console.log('--- 2 #', query.slice(0, i + 1).join('-'));
            e = e.shadowRoot.querySelector('#' + query.slice(0, i + 1).join('-'));
        }
        return e;
    }
    return document.querySelector(query);
}

// TODO think
// const consoleHistory = [];
//
// const originalConsole = {
//   log: console.log,
//   warn: console.warn,
//   error: console.error,
//   info: console.info,
//   debug: console.debug
// };
//
// console.log = function() {
//   originalConsole.log.apply(console, arguments);
//
//   consoleHistory.push({
//     type: 'log',
//     timestamp: new Date(),
//     message: Array.from(arguments)
//   });
// };
//
// console.warn = function() {
//   originalConsole.warn.apply(console, arguments);
//   consoleHistory.push({
//     type: 'warn',
//     timestamp: new Date(),
//     message: Array.from(arguments)
//   });
// };
//
// console.error = function() {
//   originalConsole.error.apply(console, arguments);
//   consoleHistory.push({
//     type: 'error',
//     timestamp: new Date(),
//     message: Array.from(arguments)
//   });
// };
//
// console.info = function() {
//   originalConsole.info.apply(console, arguments);
//   consoleHistory.push({
//     type: 'info',
//     timestamp: new Date(),
//     message: Array.from(arguments)
//   });
// };
//
// console.debug = function() {
//   originalConsole.debug.apply(console, arguments);
//   consoleHistory.push({
//     type: 'debug',
//     timestamp: new Date(),
//     message: Array.from(arguments)
//   });
// };
//
// function getConsoleHistory() {
//   return consoleHistory;
// }
//
// function clearConsoleHistory() {
//   consoleHistory.length = 0;
// }
//
// function restoreConsole() {
//   console.log = originalConsole.log;
//   console.warn = originalConsole.warn;
//   console.error = originalConsole.error;
//   console.info = originalConsole.info;
//   console.debug = originalConsole.debug;
// }
