function showMiniDialog(component, title) {
    byQuery('.mini-dialog-title').innerText = title;
    byQuery('.mini-dialog-body').innerHTML = `<${component}></${component}>`;
    byQuery('.mini-dialog').classList.remove('hidden');
    if (byQuery(component).opened) byQuery(component).opened();
}

function hideMiniDialog() {
    byQuery('.mini-dialog').classList.add('hidden');
}

function toggleMiniDialogNew(component, title) {
    const dialog = byQuery('.mini-dialog');
    const titleElement = byQuery('.mini-dialog-title');
    const allComponents = byQuery('.mini-dialog-body').querySelectorAll('[data-plugin-component]');

    if (dialog.classList.contains('hidden')) {
        if (byQuery(component).opened) byQuery(component).opened();
        // Show dialog
        titleElement.innerText = title;
        allComponents.forEach(comp => {
            comp.style.display = comp.tagName.toLowerCase() === component.toLowerCase() ? 'block' : 'none';
        });
        dialog.classList.remove('hidden');
    } else {
        // If same component is clicked, hide dialog
        const visibleComponent = Array.from(allComponents).find(comp => comp.style.display !== 'none');
        if (visibleComponent && visibleComponent.tagName.toLowerCase() === component.toLowerCase()) {
            dialog.classList.add('hidden');
        } else {
            // Switch to new component
            titleElement.innerText = title;
            allComponents.forEach(comp => {
                comp.style.display = comp.tagName.toLowerCase() === component.toLowerCase() ? 'block' : 'none';
            });
        }
    }
}

wisk.editor.showMiniDialog = showMiniDialog;
wisk.editor.hideMiniDialog = hideMiniDialog;
wisk.editor.toggleMiniDialog = toggleMiniDialogNew;

function initDraggableSheet() {
    if (window.innerWidth > 900) return;

    const sheetHolder = document.querySelector('.mini-dialog-sheet-holder-area');
    const dialogContent = document.querySelector('.mini-dialog-content');
    const dialog = document.querySelector('.mini-dialog');

    let startY = 0;
    let currentY = 0;
    let initialTranslateY = 0;
    let isDragging = false;

    function applyTransform(y) {
        const isMobile = window.matchMedia('(max-width: 900px)').matches;

        const elasticY = y > 0 ? Math.pow(y, 0.8) : y;

        if (isMobile && y < 0) {
            const heightIncrease = Math.abs(y) * 0.5;

            const maxIncrease = window.innerHeight * 0.2;
            const actualIncrease = Math.min(heightIncrease, maxIncrease);

            dialogContent.style.height = `calc(90% + ${actualIncrease}px)`;

            const reducedUpwardY = y * 0.3;
            dialogContent.style.transform = `translateY(${reducedUpwardY}px)`;
        } else {
            if (isMobile) {
                dialogContent.style.transform = `translateY(${elasticY}px)`;
                if (y >= 0) {
                    dialogContent.style.height = '90%';
                }
            } else {
                dialogContent.style.transform = `translate(-50%, -50%) translateY(${elasticY}px)`;
            }
        }

        const opacity = Math.max(0.3 - Math.abs(elasticY) / 1000, 0);
        document.querySelector('.mini-dialog-bg').style.opacity = opacity;
    }

    function startDrag(e) {
        isDragging = true;
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        const transform = window.getComputedStyle(dialogContent).transform;
        if (transform !== 'none') {
            const matrix = new DOMMatrix(transform);
            initialTranslateY = matrix.m42;
        } else {
            initialTranslateY = 0;
        }

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);

        sheetHolder.classList.add('active');
    }

    function dragMove(e) {
        if (!isDragging) return;

        if (e.cancelable) e.preventDefault();

        currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const deltaY = currentY - startY;

        applyTransform(deltaY);
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;

        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);

        sheetHolder.classList.remove('active');

        const transform = window.getComputedStyle(dialogContent).transform;
        const matrix = new DOMMatrix(transform);
        const currentTranslateY = matrix.m42;

        if (currentTranslateY > 80) {
            dialogContent.style.transition = 'all 0.3s ease-out';

            const isMobile = window.matchMedia('(max-width: 900px)').matches;
            if (isMobile) {
                dialogContent.style.transform = 'translateY(100%)';
            } else {
                dialogContent.style.transform = 'translate(-50%, -50%) translateY(100%)';
            }

            document.querySelector('.mini-dialog-bg').style.opacity = '0';

            setTimeout(() => {
                hideMiniDialog();
                dialogContent.style.transition = 'all 0.1s ease';

                if (isMobile) {
                    dialogContent.style.transform = 'none';
                } else {
                    dialogContent.style.transform = 'translate(-50%, -50%)';
                }

                document.querySelector('.mini-dialog-bg').style.opacity = '0.3';
            }, 300);
        } else {
            dialogContent.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

            const isMobile = window.matchMedia('(max-width: 900px)').matches;
            if (isMobile) {
                dialogContent.style.transform = 'none';
                if (dialogContent.style.height !== '90%') {
                    setTimeout(() => {
                        dialogContent.style.height = '90%';
                    }, 50);
                }
            } else {
                dialogContent.style.transform = 'translate(-50%, -50%)';
            }

            document.querySelector('.mini-dialog-bg').style.opacity = '0.3';

            setTimeout(() => {
                dialogContent.style.transition = 'all 0.1s ease';
            }, 500);
        }
    }

    const style = document.createElement('style');
    style.textContent = `
      .mini-dialog-sheet-holder {
        transition: background-color 0.2s;
      }
      .mini-dialog-sheet-holder.active {
        background-color: var(--bg-4);
      }
      .mini-dialog-content {
        will-change: transform;
      }
      @media (max-width: 900px) {
        .mini-dialog-sheet-holder {
          cursor: grab;
        }
        .mini-dialog-sheet-holder.active {
          cursor: grabbing;
        }
      }
  `;
    document.head.appendChild(style);

    sheetHolder.addEventListener('mousedown', startDrag);
    sheetHolder.addEventListener('touchstart', startDrag, { passive: true });

    sheetHolder.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', initDraggableSheet);
