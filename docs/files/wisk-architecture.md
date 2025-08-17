---
description: 
globs: 
alwaysApply: true
---
# Wisk Project Architecture Guide

## Overview
Wisk is a plugin-based document editor built with **vanilla JavaScript and Web Components**. It's designed as a Progressive Web App (PWA) that works offline and syncs across devices.

## Core Architecture

### Entry Points
- [index.html](mdc:index.html) - Main entry point with app shell, loading screen, and comprehensive meta tags
- [manifest.json](mdc:manifest.json) - PWA manifest for mobile/desktop app installation
- [service-worker.js](mdc:service-worker.js) - Handles offline functionality and caching (robust PWA support)

### Global Setup
- [global.js](mdc:global.js) - Global initialization, server URL determination, and utility functions
- [js/wisk.js](mdc:js/wisk.js) - Core namespace and API definition with placeholder functions
- [style.css](mdc:style.css) & [global.css](mdc:global.css) - Main styling files

## Theme System
- **Managed by**: `js/theme/theme.js` (handles theme logic automatically)
- **CSS Variables**: [js/theme/variables.css](mdc:js/theme/variables.css)
- **Usage**: Just use CSS variables from variables.css - don't modify theme logic

## Plugin Architecture (Most Important)

### Plugin Registry
- **Central config**: [js/plugins/plugin-data.json](mdc:js/plugins/plugin-data.json) - 46KB registry of all plugins
- **Plugin loader**: [js/plugins/plugins.js](mdc:js/plugins/plugins.js) - Plugin manager and loader
- **Plugin code**: All plugins live in `/js/plugins/code/` directory
- **Auto-loading**: Plugins are automatically loaded by editor on page basis

### Plugin Categories
- `component` - Document blocks (text, images, code, LaTeX, charts, etc.)
- `mini-dialog` - Popup interfaces and dialogs
- `right-sidebar`/`left-sidebar` - Sidebar panels
- `nav-mini` - Navigation bar elements
- `auto` - Background plugins that run automatically

### Plugin Properties
- `width: "mini"` or `width: "max"` - Controls block width
- `textual: true/false` - Whether plugin handles text content
- `loadAsModule: true/false` - Loading mechanism
- `experimental: true` - Experimental features flag

## Core vs Plugin Distinction

### Core Elements (Non-Plugin)
Located in [js/elements/](mdc:js/elements) - Core UI components:
- [js/elements/home-element.js](mdc:js/elements/home-element.js) - Homepage UI (when `id=home`)
- [js/elements/toolbar-element.js](mdc:js/elements/toolbar-element.js) - Main formatting toolbar (56KB)
- [js/elements/command-palette.js](mdc:js/elements/command-palette.js) - Command palette interface
- [js/elements/search-element.js](mdc:js/elements/search-element.js) - Search functionality

### Main Editor Logic
- [js/editor.js](mdc:js/editor.js) - The heart of the editor (34KB, 993 lines)
  - Handles block creation, updates, and editor logic
  - Block-based architecture where everything is a "block"
  - Dynamic element management and rendering

## Page Routing System
- **URL Pattern**: `id=<page id>` for root pages
- **Hierarchical**: `id=<parent>.<child>.<page>` for nested pages
- **Benefits**: Makes parent-child relationships obvious and easy to parse
- **Example**: `id=project.docs.api` means API docs under project docs

## Storage & Sync
- [js/storage/db.js](mdc:js/storage/db.js) - Local storage using IndexedDB
- [js/sync/sync.js](mdc:js/sync/sync.js) - Real-time collaboration and cloud sync
- **Pattern**: Offline-first approach with backend sync

## Component Structure
- [js/left-sidebar.js](mdc:js/left-sidebar.js) & [js/right-sidebar.js](mdc:js/right-sidebar.js) - Sidebar components
- [css/](mdc:css) - Modular CSS following component-based architecture
- [js/mini-dialog.js](mdc:js/mini-dialog.js) - Dialog system

## Development Patterns

### Adding New Block Types
1. Create plugin in `/js/plugins/code/`
2. Register in [js/plugins/plugin-data.json](mdc:js/plugins/plugin-data.json)
3. Set appropriate category, width, and properties
4. Plugin auto-loads based on document configuration

### Styling
- Use CSS variables from [js/theme/variables.css](mdc:js/theme/variables.css)
- Follow component-based CSS architecture
- Don't modify theme logic directly

### No Build System
- Direct browser-compatible JavaScript
- Web Components and modern Web APIs
- No transpilation or build tools required

## Asset Organization
- `a7/` - Logos, icons, templates, and static assets
- `exp/` - Experimental features and development playground
- Organized subdirectories for different asset types
- `a7/forget` is a directory for icons that *should not be touched* you can always create a new one with a new name, but youre not supposed to touch the already existing ones
