/**
 * Initialize the home page left sidebar with workspace selector, theme selector, and search
 */
function initHomeSidebar() {
    // Add workspace selector and theme selector to left sidebar body without overwriting
    const leftSidebarBody = document.querySelector('.left-sidebar-body');
    if (!leftSidebarBody) return;

    const workspaceAndThemeContainer = document.createElement('div');
    workspaceAndThemeContainer.style.cssText = `
        padding: 20px;
        border-bottom: 1px solid var(--bg-3);
    `;
    workspaceAndThemeContainer.innerHTML = `
        <!-- Workspace Header -->
        <div id="workspace-header" style="display: flex; align-items: center; gap: var(--gap-2); padding: var(--padding-w1); border-radius: var(--radius); cursor: pointer; font-weight: 600; font-size: 15px; border: 1px solid transparent; transition: all 0.2s ease; position: relative; margin-bottom: var(--gap-2);">
            <span id="workspace-emoji" style="font-size: 18px;">💕</span>
            <span id="workspace-name" style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Default Workspace</span>
            <img id="workspace-arrow" src="/a7/forget/down-arrow.svg" style="width: 20px; height: 20px; filter: var(--themed-svg); transition: transform 0.2s ease;" />
        </div>

        <!-- Workspace Dropdown (initially hidden) -->
        <div id="workspace-dropdown" style="display: none; position: absolute; left: 20px; right: 20px; background-color: var(--bg-1); border: 1px solid var(--bg-3); border-radius: var(--radius); padding: var(--padding-3); z-index: 1000; animation: fadeIn 0.15s ease; margin-top: var(--padding-2);"></div>

        <button id="search-button" style="display: flex; align-items: center; gap: var(--gap-2); padding: var(--padding-3); color: var(--fg-1); background-color: transparent; border: none; border-radius: var(--radius); font-weight: 500; font-size: 14px; cursor: pointer; width: 100%; margin-bottom: var(--gap-2);">
            <img src="/a7/forget/search-heroicon.svg" style="width: 20px; height: 20px; filter: var(--themed-svg);" />
            Search
        </button>
        <select id="theme-selector" style="padding: var(--padding-w2); border: 2px solid var(--bg-3); border-radius: var(--radius); background-color: var(--bg-2); color: var(--fg-1); width: 100%; transition: all 0.2s ease; outline: none; cursor: pointer;">
            <option value="">Loading themes...</option>
        </select>

        <!-- New Workspace Dialog (initially hidden) -->
        <div id="workspace-dialog" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); align-items: center; justify-content: center; z-index: 2000; animation: fadeIn 0.2s ease;">
            <div id="workspace-dialog-content" style="background-color: var(--bg-1); border-radius: var(--radius-large); padding: var(--padding-4); max-width: 400px; width: 90%; filter: var(--drop-shadow);">
                <div style="display: flex; align-items: center; gap: var(--gap-2); margin-bottom: var(--padding-4);">
                    <span style="font-size: 18px; font-weight: 600; flex: 1;">Create New Workspace</span>
                    <button id="workspace-dialog-close" style="width: 32px; height: 32px; border-radius: var(--radius); background-color: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <img src="/a7/forget/dialog-x.svg" alt="Close" style="filter: var(--themed-svg);" />
                    </button>
                </div>
                <div style="display: flex; flex-direction: column; gap: var(--gap-3);">
                    <div style="display: flex; align-items: center; gap: var(--gap-2);">
                        <div id="workspace-emoji-display" style="font-size: 32px; border-radius: var(--radius); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; transition: all 0.15s ease;">💕</div>
                        <input id="workspace-name-input" type="text" placeholder="Workspace name" style="flex: 1; padding: var(--padding-w2); border: 2px solid var(--bg-3); border-radius: var(--radius); background-color: var(--bg-2); color: var(--fg-1); font-size: 14px; outline: none; transition: all 0.15s ease;" />
                    </div>
                    <div style="display: flex; gap: var(--gap-2); justify-content: flex-end; margin-top: var(--padding-4);">
                        <button id="workspace-cancel-btn" style="padding: var(--padding-w2); border-radius: calc(var(--radius-large) * 20); border: 2px solid transparent; background-color: transparent; color: var(--fg-1); cursor: pointer; font-weight: 500; font-size: 14px; transition: all 0.2s ease;">Cancel</button>
                        <button id="workspace-create-btn" style="background: var(--fg-1); color: var(--bg-1); padding: var(--padding-w2); font-weight: 600; border-radius: calc(var(--radius-large) * 20); border: 2px solid transparent; cursor: pointer; font-size: 14px; transition: all 0.2s ease;">Create Workspace</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Append the container to the existing content instead of replacing it
    leftSidebarBody.appendChild(workspaceAndThemeContainer);

    // Wait for themes to load, then populate options
    const initThemeSelector = () => {
        if (wisk && wisk.theme && wisk.theme.getThemes) {
            const themeSelect = document.getElementById('theme-selector');
            const themes = wisk.theme.getThemes();
            const currentTheme = wisk.theme.getTheme();

            themeSelect.innerHTML = '';
            themes.forEach(theme => {
                const option = document.createElement('option');
                option.value = theme.name;
                option.textContent = theme.name;
                if (theme.name === currentTheme) {
                    option.selected = true;
                }
                themeSelect.appendChild(option);
            });

            themeSelect.addEventListener('change', e => {
                wisk.theme.setTheme(e.target.value);
            });

            // Add search button event listener
            const searchButton = document.getElementById('search-button');
            searchButton.addEventListener('click', () => {
                document.querySelector('search-element').show();
            });

            // Add hover states for search button
            searchButton.addEventListener('mouseenter', () => {
                searchButton.style.backgroundColor = 'var(--bg-3)';
            });
            searchButton.addEventListener('mouseleave', () => {
                searchButton.style.backgroundColor = 'transparent';
            });
        } else {
            setTimeout(initThemeSelector, 100);
        }
    };

    setTimeout(initThemeSelector, 1000);

    // Workspace functionality
    const initWorkspace = () => {
        // Get workspaces from structure
        const workspacesData = localStorage.getItem('workspaces') || '{"version":1,"workspaces":[]}';
        const parsed = JSON.parse(workspacesData);
        const workspaces = parsed.workspaces;

        const currentWorkspaceId = localStorage.getItem('currentWorkspace');

        // Get current workspace
        const workspace = workspaces.find(w => w.id === currentWorkspaceId) || workspaces[0];

        // Update UI
        document.getElementById('workspace-emoji').textContent = workspace.emoji;
        document.getElementById('workspace-name').textContent = workspace.name;

        // Workspace header click handler
        const workspaceHeader = document.getElementById('workspace-header');
        const workspaceDropdown = document.getElementById('workspace-dropdown');
        const workspaceArrow = document.getElementById('workspace-arrow');

        workspaceHeader.addEventListener('mouseenter', () => {
            workspaceHeader.style.backgroundColor = 'var(--bg-3)';
        });
        workspaceHeader.addEventListener('mouseleave', () => {
            workspaceHeader.style.backgroundColor = 'transparent';
        });

        workspaceHeader.addEventListener('click', e => {
            e.stopPropagation();
            const isVisible = workspaceDropdown.style.display === 'block';
            workspaceDropdown.style.display = isVisible ? 'none' : 'block';
            workspaceArrow.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';

            if (!isVisible) {
                // Populate dropdown
                let dropdownHTML = '';
                workspaces.forEach(ws => {
                    const isActive = ws.id === currentWorkspaceId;
                    dropdownHTML += `
                        <div class="workspace-item" data-workspace-id="${ws.id}" style="display: flex; align-items: center; gap: var(--gap-2); padding: var(--padding-w1); cursor: pointer; border-radius: var(--radius); color: var(--fg-1); font-weight: 500; font-size: 14px; transition: all 0.15s ease; ${isActive ? 'background-color: var(--bg-accent); color: var(--fg-accent);' : ''}">
                            <span style="font-size: 16px;">${ws.emoji}</span>
                            <span style="flex: 1;">${ws.name}</span>
                        </div>
                    `;
                });

                dropdownHTML += `
                    <div style="border-bottom: 1px solid transparent; margin-bottom: var(--padding-4);"></div>
                    <div id="new-workspace-btn" style="display: flex; align-items: center; gap: var(--gap-2); padding: var(--padding-w1); cursor: pointer; border-radius: var(--radius); color: var(--fg-accent); font-weight: 500; font-size: 14px; transition: all 0.15s ease;">
                        <img src="/a7/forget/plus.svg" alt="New workspace" style="width: 16px; height: 16px; filter: var(--themed-svg);" />
                        New Workspace
                    </div>
                `;

                workspaceDropdown.innerHTML = dropdownHTML;

                // Add hover effects and click handlers
                workspaceDropdown.querySelectorAll('.workspace-item').forEach(item => {
                    item.addEventListener('mouseenter', () => {
                        if (!item.style.backgroundColor.includes('accent')) {
                            item.style.backgroundColor = 'var(--bg-2)';
                        }
                    });
                    item.addEventListener('mouseleave', () => {
                        if (!item.style.backgroundColor.includes('accent')) {
                            item.style.backgroundColor = 'transparent';
                        }
                    });
                    item.addEventListener('click', e => {
                        e.stopPropagation();
                        const workspaceId = item.getAttribute('data-workspace-id');
                        localStorage.setItem('currentWorkspace', workspaceId);
                        window.location.href = '/?id=home';
                    });
                });

                // New workspace button
                const newWorkspaceBtn = document.getElementById('new-workspace-btn');
                newWorkspaceBtn.addEventListener('mouseenter', () => {
                    newWorkspaceBtn.style.backgroundColor = 'var(--bg-accent)';
                });
                newWorkspaceBtn.addEventListener('mouseleave', () => {
                    newWorkspaceBtn.style.backgroundColor = 'transparent';
                });
                newWorkspaceBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    workspaceDropdown.style.display = 'none';
                    workspaceArrow.style.transform = 'rotate(0deg)';
                    showNewWorkspaceDialog();
                });
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', e => {
            if (!workspaceHeader.contains(e.target) && !workspaceDropdown.contains(e.target)) {
                workspaceDropdown.style.display = 'none';
                workspaceArrow.style.transform = 'rotate(0deg)';
            }
        });

        // New workspace dialog functionality
        const showNewWorkspaceDialog = () => {
            const dialog = document.getElementById('workspace-dialog');
            const input = document.getElementById('workspace-name-input');
            const emojiDisplay = document.getElementById('workspace-emoji-display');

            dialog.style.display = 'flex';
            input.value = '';

            // Random emoji
            const getRandomEmoji = () => {
                const emojis = ['💕', '🚀', '💡', '⭐', '🎨', '📚', '🏆', '🌟', '🔥', '💼', '🎯', '🌈'];
                return emojis[Math.floor(Math.random() * emojis.length)];
            };
            emojiDisplay.textContent = getRandomEmoji();

            setTimeout(() => input.focus(), 100);

            // Emoji click to randomize
            const emojiClickHandler = () => {
                emojiDisplay.textContent = getRandomEmoji();
            };
            emojiDisplay.addEventListener('click', emojiClickHandler);
            emojiDisplay.addEventListener('mouseenter', () => {
                emojiDisplay.style.backgroundColor = 'var(--bg-2)';
            });
            emojiDisplay.addEventListener('mouseleave', () => {
                emojiDisplay.style.backgroundColor = 'transparent';
            });

            // Input validation
            const validateInput = () => {
                const name = input.value.trim();
                if (!name) {
                    input.style.borderColor = 'var(--bg-3)';
                    return 'empty';
                }
                const nameExists = workspaces.some(w => w.name === name);
                input.style.borderColor = nameExists ? 'var(--fg-red)' : 'var(--fg-green)';
                return nameExists ? 'invalid' : 'valid';
            };

            input.addEventListener('input', validateInput);
            input.addEventListener('focus', () => {
                input.style.backgroundColor = 'var(--bg-1)';
                input.style.borderColor = 'var(--fg-accent)';
            });
            input.addEventListener('blur', validateInput);

            // Close dialog
            const closeDialog = () => {
                dialog.style.display = 'none';
                input.removeEventListener('input', validateInput);
                input.removeEventListener('blur', validateInput);
                emojiDisplay.removeEventListener('click', emojiClickHandler);
            };

            // Dialog close button
            const closeBtn = document.getElementById('workspace-dialog-close');
            closeBtn.addEventListener('click', closeDialog);
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.backgroundColor = 'var(--bg-2)';
            });
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.backgroundColor = 'transparent';
            });

            // Cancel button
            const cancelBtn = document.getElementById('workspace-cancel-btn');
            cancelBtn.addEventListener('click', closeDialog);
            cancelBtn.addEventListener('mouseenter', () => {
                cancelBtn.style.backgroundColor = 'var(--bg-3)';
            });
            cancelBtn.addEventListener('mouseleave', () => {
                cancelBtn.style.backgroundColor = 'transparent';
            });

            // Create button
            const createBtn = document.getElementById('workspace-create-btn');
            const createWorkspace = () => {
                const validationState = validateInput();

                if (validationState === 'empty') {
                    wisk.utils.showToast('Please enter a workspace name', 3000);
                    return;
                }

                if (validationState === 'invalid') {
                    wisk.utils.showToast('A workspace with this name already exists', 3000);
                    return;
                }

                const newWorkspace = {
                    name: input.value.trim(),
                    emoji: emojiDisplay.textContent,
                    id: window.generateWorkspaceId(),
                };

                workspaces.push(newWorkspace);
                localStorage.setItem('workspaces', JSON.stringify({ version: 1, workspaces: workspaces }));
                localStorage.setItem('currentWorkspace', newWorkspace.id);

                closeDialog();
                window.location.href = '/?id=home';
            };

            createBtn.addEventListener('click', createWorkspace);
            createBtn.addEventListener('mouseenter', () => {
                createBtn.style.backgroundColor = 'transparent';
                createBtn.style.color = 'var(--fg-1)';
                createBtn.style.borderColor = 'var(--fg-1)';
            });
            createBtn.addEventListener('mouseleave', () => {
                createBtn.style.backgroundColor = 'var(--fg-1)';
                createBtn.style.color = 'var(--bg-1)';
                createBtn.style.borderColor = 'transparent';
            });

            // Enter to create, Escape to close
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') createWorkspace();
                if (e.key === 'Escape') closeDialog();
            });

            // Click outside dialog to close
            dialog.addEventListener('click', e => {
                if (e.target === dialog) closeDialog();
            });
        };
    };

    setTimeout(initWorkspace, 100);
}
