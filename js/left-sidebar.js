// Initialize width management - only for desktop
const DEFAULT_LEFT_WIDTH = 450;
const MIN_LEFT_WIDTH = 200;
const MAX_LEFT_WIDTH = 1000;

let leftSidebarWidth = parseInt(localStorage.getItem('leftSidebarWidth')) || DEFAULT_LEFT_WIDTH;

function initializeLeftSidebarResize() {
    const sidebar = byQuery('.left-sidebar');
    if (!sidebar || window.innerWidth < 900) return;

    // Only set position relative in desktop mode
    if (window.innerWidth >= 900) {
        sidebar.style.position = 'relative';
    }

    // Create resize handle if it doesn't exist
    if (!sidebar.querySelector('.resize-handle')) {
        const handle = document.createElement('div');
        handle.className = 'resize-handle resize-handle-right';

        let startX;
        let startWidth;

        handle.addEventListener('mousedown', initResize);

        function initResize(e) {
            if (window.innerWidth < 900) return;
            startX = e.clientX;
            startWidth = parseInt(getComputedStyle(sidebar).width, 10);

            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
            document.body.classList.add('sidebar-resizing');
        }

        function resize(e) {
            if (window.innerWidth < 900) return;
            const diff = e.clientX - startX;
            let newWidth = Math.min(Math.max(startWidth + diff, MIN_LEFT_WIDTH), MAX_LEFT_WIDTH);
            sidebar.style.width = `${newWidth}px`;
            leftSidebarWidth = newWidth;
            localStorage.setItem('leftSidebarWidth', newWidth);
            window.dispatchEvent(new Event('resize'));
        }

        function stopResize() {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
            document.body.classList.remove('sidebar-resizing');
        }

        sidebar.appendChild(handle);
    }
}

function showLeftSidebar(component, title) {
    const sidebar = byQuery('.left-sidebar');
    byQuery('.left-sidebar-title').innerText = title;
    byQuery('.left-sidebar-body').innerHTML = `<${component}></${component}>`;
    sidebar.classList.remove('left-sidebar-hidden');

    if (window.innerWidth >= 900) {
        sidebar.style.width = `${leftSidebarWidth}px`;
        sidebar.style.position = 'relative';
        initializeLeftSidebarResize();
    } else {
        sidebar.style.position = 'fixed';
        sidebar.style.removeProperty('width');
    }

    if (byQuery(component).opened) byQuery(component).opened();
    window.dispatchEvent(new Event('resize'));
}

function hideLeftSidebar() {
    const sidebar = byQuery('.left-sidebar');
    sidebar.classList.add('left-sidebar-hidden');
    if (window.innerWidth >= 900) {
        sidebar.style.removeProperty('width');
    }
    window.dispatchEvent(new Event('resize'));
}

function toggleLeftSidebarNew(component, title) {
    const sidebar = byQuery('.left-sidebar');
    const titleElement = byQuery('.left-sidebar-title');
    const allComponents = byQuery('.left-sidebar-body').querySelectorAll('[data-plugin-component]');

    if (sidebar.classList.contains('left-sidebar-hidden')) {
        if (byQuery(component).opened) byQuery(component).opened();
        titleElement.innerText = title;
        allComponents.forEach(comp => {
            comp.style.display = comp.tagName.toLowerCase() === component.toLowerCase() ? 'block' : 'none';
        });
        sidebar.classList.remove('left-sidebar-hidden');

        if (window.innerWidth >= 900) {
            sidebar.style.width = `${leftSidebarWidth}px`;
            sidebar.style.position = 'relative';
            initializeLeftSidebarResize();
        } else {
            sidebar.style.position = 'fixed';
            sidebar.style.removeProperty('width');
        }
    } else {
        const visibleComponent = Array.from(allComponents).find(comp => comp.style.display !== 'none');
        if (visibleComponent && visibleComponent.tagName.toLowerCase() === component.toLowerCase()) {
            sidebar.classList.add('left-sidebar-hidden');
            if (window.innerWidth >= 900) {
                sidebar.style.removeProperty('width');
            }
        } else {
            titleElement.innerText = title;
            allComponents.forEach(comp => {
                comp.style.display = comp.tagName.toLowerCase() === component.toLowerCase() ? 'block' : 'none';
            });
        }
    }
    window.dispatchEvent(new Event('resize'));
}

// Handle window resize
window.addEventListener('resize', () => {
    const sidebar = byQuery('.left-sidebar');
    if (!sidebar) return;

    if (window.innerWidth >= 900) {
        sidebar.style.position = 'relative';
        if (!sidebar.classList.contains('left-sidebar-hidden')) {
            sidebar.style.width = `${leftSidebarWidth}px`;
            initializeLeftSidebarResize();
        }
    } else {
        sidebar.style.position = 'fixed';
        sidebar.style.removeProperty('width');
        const handle = sidebar.querySelector('.resize-handle');
        if (handle) handle.remove();
    }
});

wisk.editor.showLeftSidebar = showLeftSidebar;
wisk.editor.hideLeftSidebar = hideLeftSidebar;
wisk.editor.toggleLeftSidebar = toggleLeftSidebarNew;
