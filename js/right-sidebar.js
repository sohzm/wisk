// Initialize width management - only for desktop
const DEFAULT_RIGHT_WIDTH = 450;
const MIN_RIGHT_WIDTH = 200;
const MAX_RIGHT_WIDTH = 1000;

let rightSidebarWidth = parseInt(localStorage.getItem('rightSidebarWidth')) || DEFAULT_RIGHT_WIDTH;

function initializeRightSidebarResize() {
    const sidebar = byQuery('.right-sidebar');
    if (!sidebar || window.innerWidth < 900) return;

    // Only set position relative in desktop mode
    if (window.innerWidth >= 900) {
        sidebar.style.position = 'relative';
    }

    // Create resize handle if it doesn't exist
    if (!sidebar.querySelector('.resize-handle')) {
        const handle = document.createElement('div');
        handle.className = 'resize-handle resize-handle-left';

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
            const diff = startX - e.clientX;
            let newWidth = Math.min(Math.max(startWidth + diff, MIN_RIGHT_WIDTH), MAX_RIGHT_WIDTH);
            sidebar.style.width = `${newWidth}px`;
            rightSidebarWidth = newWidth;
            localStorage.setItem('rightSidebarWidth', newWidth);
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

function showRightSidebar(component, title) {
    const sidebar = byQuery('.right-sidebar');
    byQuery('.right-sidebar-title').innerText = title;
    byQuery('.right-sidebar-body').innerHTML = `<${component}></${component}>`;
    sidebar.classList.remove('right-sidebar-hidden');

    if (window.innerWidth >= 900) {
        sidebar.style.width = `${rightSidebarWidth}px`;
        sidebar.style.position = 'relative';
        initializeRightSidebarResize();
    } else {
        sidebar.style.position = 'fixed';
        sidebar.style.removeProperty('width');
    }

    if (byQuery(component).opened) byQuery(component).opened();
    window.dispatchEvent(new Event('resize'));
}

function hideRightSidebar() {
    const sidebar = byQuery('.right-sidebar');
    sidebar.classList.add('right-sidebar-hidden');
    if (window.innerWidth >= 900) {
        sidebar.style.removeProperty('width');
    }
    window.dispatchEvent(new Event('resize'));
}

function toggleRightSidebarNew(component, title) {
    const sidebar = byQuery('.right-sidebar');
    const titleElement = byQuery('.right-sidebar-title');
    const allComponents = byQuery('.right-sidebar-body').querySelectorAll('[data-plugin-component]');

    if (sidebar.classList.contains('right-sidebar-hidden')) {
        if (byQuery(component).opened) byQuery(component).opened();
        titleElement.innerText = title;
        allComponents.forEach(comp => {
            comp.style.display = comp.tagName.toLowerCase() === component.toLowerCase() ? '' : 'none';
        });
        sidebar.classList.remove('right-sidebar-hidden');

        if (window.innerWidth >= 900) {
            sidebar.style.width = `${rightSidebarWidth}px`;
            sidebar.style.position = 'relative';
            initializeRightSidebarResize();
        } else {
            sidebar.style.position = 'fixed';
            sidebar.style.removeProperty('width');
        }
    } else {
        const visibleComponent = Array.from(allComponents).find(comp => comp.style.display !== 'none');
        if (visibleComponent && visibleComponent.tagName.toLowerCase() === component.toLowerCase()) {
            sidebar.classList.add('right-sidebar-hidden');
            if (window.innerWidth >= 900) {
                sidebar.style.removeProperty('width');
            }
        } else {
            titleElement.innerText = title;
            allComponents.forEach(comp => {
                comp.style.display = comp.tagName.toLowerCase() === component.toLowerCase() ? '' : 'none';
            });
        }
    }
    window.dispatchEvent(new Event('resize'));
}

// Handle window resize
window.addEventListener('resize', () => {
    const sidebar = byQuery('.right-sidebar');
    if (!sidebar) return;

    if (window.innerWidth >= 900) {
        sidebar.style.position = 'relative';
        if (!sidebar.classList.contains('right-sidebar-hidden')) {
            sidebar.style.width = `${rightSidebarWidth}px`;
            initializeRightSidebarResize();
        }
    } else {
        sidebar.style.position = 'fixed';
        sidebar.style.removeProperty('width');
        const handle = sidebar.querySelector('.resize-handle');
        if (handle) handle.remove();
    }
});

wisk.editor.showRightSidebar = showRightSidebar;
wisk.editor.hideRightSidebar = hideRightSidebar;
wisk.editor.toggleRightSidebar = toggleRightSidebarNew;
