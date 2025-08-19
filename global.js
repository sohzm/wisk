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

function findElementInNestedShadows(elementId) {
    let element = document.getElementById(elementId);
    if (element) {
        return element;
    }

    function searchInShadow(root, id) {
        const directMatch = root.getElementById ? root.getElementById(id) : root.querySelector(`#${id}`);
        if (directMatch) {
            return directMatch;
        }

        const shadowHosts = root.querySelectorAll('*');
        for (const host of shadowHosts) {
            if (host.shadowRoot) {
                const result = searchInShadow(host.shadowRoot, id);
                if (result) return result;
            }
        }
        return null;
    }

    const result = searchInShadow(document, elementId);
    return result;
}

function findPlusButtonForElement(elementId) {
    function findPlusInRoot(root, id) {
        const exactFullWidthWrapper = root.querySelector(`[id="full-width-wrapper-${id}"]`);
        if (exactFullWidthWrapper) {
            const hoverImages = exactFullWidthWrapper.querySelector('.hover-images');
            if (hoverImages) {
                const plusBtn = hoverImages.querySelector('img[src$="plus-hover.svg"]') || hoverImages.querySelector('img[src$="plus.svg"]');
                if (plusBtn) {
                    return plusBtn;
                }
            }
        }

        const targetElementForParent = root.querySelector(`#${id}`);
        if (targetElementForParent) {
            let parent = targetElementForParent.parentElement;
            if (parent && parent.classList && parent.classList.contains('full-width-wrapper')) {
                const hoverImages = parent.querySelector('.hover-images');
                if (hoverImages) {
                    const plusBtn = hoverImages.querySelector('img[src$="plus-hover.svg"]') || hoverImages.querySelector('img[src$="plus.svg"]');
                    if (plusBtn) {
                        return plusBtn;
                    }
                }
            }
        }

        const container = root.querySelector(`[id="div-${id}"]`);
        if (container) {
            const hoverImages = container.querySelector('.hover-images');
            if (hoverImages) {
                const plusBtn = hoverImages.querySelector('img[src$="plus-hover.svg"]') || hoverImages.querySelector('img[src$="plus.svg"]');
                if (plusBtn) {
                    return plusBtn;
                }
            }
        }

        const allContainers = root.querySelectorAll('.rndr');
        for (const cont of allContainers) {
            if (cont.querySelector(`#${id}`)) {
                const hoverImages = cont.querySelector('.hover-images');
                if (hoverImages) {
                    const plusBtn = hoverImages.querySelector('img[src$="plus-hover.svg"]') || hoverImages.querySelector('img[src$="plus.svg"]');
                    if (plusBtn) {
                        return plusBtn;
                    }
                }
            }
        }

        const exactWrapper = root.querySelector(`[id="full-width-wrapper-${id}"]`);
        if (exactWrapper) {
            const hoverImages = exactWrapper.querySelector('.hover-images');
            if (hoverImages) {
                const plusBtn = hoverImages.querySelector('img[src$="plus-hover.svg"]') || hoverImages.querySelector('img[src$="plus.svg"]');
                if (plusBtn) {
                    return plusBtn;
                }
            }
        }

        const fullWidthWrappers = root.querySelectorAll(`[id^="full-width-wrapper-${id}"]`);
        for (const wrapper of fullWidthWrappers) {
            const hoverImages = wrapper.querySelector('.hover-images');
            if (hoverImages) {
                const plusBtn = hoverImages.querySelector('img[src$="plus-hover.svg"]') || hoverImages.querySelector('img[src$="plus.svg"]');
                if (plusBtn) {
                    return plusBtn;
                }
            }
        }

        const allWrappers = root.querySelectorAll('.full-width-wrapper');
        for (const wrapper of allWrappers) {
            if (wrapper.querySelector(`#${id}`)) {
                const hoverImages = wrapper.querySelector('.hover-images');
                if (hoverImages) {
                    const plusBtn = hoverImages.querySelector('img[src$="plus-hover.svg"]') || hoverImages.querySelector('img[src$="plus.svg"]');
                    if (plusBtn) {
                        return plusBtn;
                    }
                }
            }
        }

        const targetElementForHover = root.querySelector(`#${id}`);
        if (targetElementForHover) {
            let parent = targetElementForHover.parentElement;
            while (parent && parent !== root) {
                if (parent.classList && parent.classList.contains('full-width-wrapper')) {
                    const hoverImages = parent.querySelector('.hover-images');
                    if (hoverImages) {
                        const plusBtn = hoverImages.querySelector('img[src$="plus-hover.svg"]') || hoverImages.querySelector('img[src$="plus.svg"]');
                        if (plusBtn) {
                            return plusBtn;
                        }
                    }
                }
                parent = parent.parentElement;
            }
        }

        return null;
    }

    function comprehensiveSearch(root, id) {
        const plusBtn = findPlusInRoot(root, id);
        if (plusBtn) return plusBtn;

        const shadowHosts = root.querySelectorAll('*');
        const layoutElements = [];
        const otherElements = [];

        for (const host of shadowHosts) {
            if (host.shadowRoot) {
                if (host.tagName.toLowerCase() === 'base-layout-element' || host.tagName.toLowerCase() === 'columns-element') {
                    layoutElements.push(host);
                } else {
                    otherElements.push(host);
                }
            }
        }

        for (const host of layoutElements) {
            const result = comprehensiveSearch(host.shadowRoot, id);
            if (result) return result;
        }

        for (const host of otherElements) {
            const result = comprehensiveSearch(host.shadowRoot, id);
            if (result) return result;
        }

        if (id.includes('-')) {
            const idParts = id.split('-');
            if (idParts.length > 1) {
                const immediateParentId = idParts.slice(0, -1).join('-');
                const parentBtn = findPlusInRoot(root, immediateParentId);
                if (parentBtn) {
                    return parentBtn;
                }
            }
        }

        return null;
    }

    const result = comprehensiveSearch(document, elementId);
    return result;
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
