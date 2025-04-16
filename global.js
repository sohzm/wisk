// TODO fix this messy code later
var SERVER = 'http://localhost:8788';

if (window.location.href.includes('ngrok')) {
    SERVER = window.location.href.split('.ngrok-free.app')[0] + '.ngrok-free.app';
} else if (window.location.href.includes('wisk.cc')) {
    SERVER = 'https://app.wisk.cc';
}
if (window.location.href.includes('30009')) {
    SERVER = 'http://localhost:30009';
}

if (window.location.href.includes('.wisk.site')) {
    const subdomain = window.location.href.split('https://')[1].split('.wisk.site')[0];
    SERVER = 'https://' + subdomain + '.wisk.site';
}

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
