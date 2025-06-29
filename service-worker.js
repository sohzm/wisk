// service-worker.js
const CACHE_NAME = 'wisk-cache-v4';

// Core assets - but we won't wait for them to be cached before activating
// generated by
// find . -type f -not -path "*.git*" | sed 's/^.//' | sort | awk '{print "'\''", $0, "'\''," }' | sed 's/ \(.*\) /\1/' | v -
// remove the hidden files before adding to the list
// and dont forget to add jalebi url
const CORE_ASSETS = [
    '/',
    '/404.html',
    '/a7/background.svg',
    '/a7/cdn/chart.js',
    '/a7/cdn/d3-7.9.0.min.js',
    '/a7/cdn/katex-0.16.9.min.css',
    '/a7/cdn/katex-0.16.9.min.js',
    '/a7/cdn/lit-all-2.7.4.min.js',
    '/a7/cdn/lit-core-2.7.4.min.js',
    '/a7/cdn/lit-core.min.js.map',
    '/a7/cdn/marked-4.3.0.min.js',
    '/a7/cdn/marked.esm-9.1.2.min.js',
    '/a7/cdn/mermaid-11.4.0.min.js',
    '/a7/cdn/pica.min.js',
    '/a7/cdn/three-0.128.0-GLTFLoader.js',
    '/a7/cdn/three-0.128.0-OBJLoader.js',
    '/a7/cdn/three-0.128.0-OrbitControls.js',
    '/a7/cdn/three-0.128.0.min.js',
    '/a7/export-templates/academic.jpg',
    '/a7/export-templates/business.jpg',
    '/a7/export-templates/compact.jpg',
    '/a7/export-templates/default.jpg',
    '/a7/export-templates/minimalist.jpg',
    '/a7/export-templates/newsletter.jpg',
    '/a7/export-templates/smol/academic.jpg',
    '/a7/export-templates/smol/business.jpg',
    '/a7/export-templates/smol/compact.jpg',
    '/a7/export-templates/smol/default.jpg',
    '/a7/export-templates/smol/minimalist.jpg',
    '/a7/export-templates/smol/newsletter.jpg',
    '/a7/favicon.png',
    '/a7/forget/ai.svg',
    '/a7/forget/auto-cite.svg',
    '/a7/forget/babe.png',
    '/a7/forget/back.svg',
    '/a7/forget/bell.svg',
    '/a7/forget/bold.svg',
    '/a7/forget/close.svg',
    '/a7/forget/colab.png',
    '/a7/forget/cp.svg',
    '/a7/forget/dialog-back.svg',
    '/a7/forget/dialog-x.svg',
    '/a7/forget/down-arrow.svg',
    '/a7/forget/emoji-basketball.svg',
    '/a7/forget/emoji-flag.svg',
    '/a7/forget/emoji-heart.svg',
    '/a7/forget/emoji-leaf.svg',
    '/a7/forget/emoji-mac.svg',
    '/a7/forget/emoji-person.svg',
    '/a7/forget/emoji-pizza.svg',
    '/a7/forget/emoji-search.svg',
    '/a7/forget/emoji-shuffle.svg',
    '/a7/forget/emoji-smile.svg',
    '/a7/forget/emoji-truck.svg',
    '/a7/forget/enter.svg',
    '/a7/forget/expand.svg',
    '/a7/forget/feedback.svg',
    '/a7/forget/file-plus.svg',
    '/a7/forget/google-logo.png',
    '/a7/forget/gs-ai.svg',
    '/a7/forget/gs-brainstorm.svg',
    '/a7/forget/gs-cover.svg',
    '/a7/forget/gs-draft-anything.svg',
    '/a7/forget/gs-draft-outline.svg',
    '/a7/forget/gs-help.svg',
    '/a7/forget/gs-import.svg',
    '/a7/forget/gs-info.svg',
    '/a7/forget/gs-save.svg',
    '/a7/forget/gs-templates.svg',
    '/a7/forget/help-3.svg',
    '/a7/forget/help.svg',
    '/a7/forget/hide-sidebar.svg',
    '/a7/forget/home-2.svg',
    '/a7/forget/home-outline.svg',
    '/a7/forget/home.svg',
    '/a7/forget/italics.svg',
    '/a7/forget/layout-2.svg',
    '/a7/forget/layouts.svg',
    '/a7/forget/link.svg',
    '/a7/forget/list.svg',
    '/a7/forget/marker-icon.png',
    '/a7/forget/marker.svg',
    '/a7/forget/max-sidebar.svg',
    '/a7/forget/more-hover.svg',
    '/a7/forget/morex.svg',
    '/a7/forget/new-3.svg',
    '/a7/forget/no-signin.svg',
    '/a7/forget/open-2.svg',
    '/a7/forget/open-3.svg',
    '/a7/forget/open.svg',
    '/a7/forget/open1.svg',
    '/a7/forget/page-1.svg',
    '/a7/forget/page-2.svg',
    '/a7/forget/page-content-outline.svg',
    '/a7/forget/page-plus-outline.svg',
    '/a7/forget/plugins.png',
    '/a7/forget/plus-hover.svg',
    '/a7/forget/plus.svg',
    '/a7/forget/plus1.svg',
    '/a7/forget/project.png',
    '/a7/forget/README.md',
    '/a7/forget/reload.svg',
    '/a7/forget/report.png',
    '/a7/forget/right-arrow.svg',
    '/a7/forget/search-2.svg',
    '/a7/forget/search-3.svg',
    '/a7/forget/search-outline.svg',
    '/a7/forget/search-thicc.svg',
    '/a7/forget/search.svg',
    '/a7/forget/source.svg',
    '/a7/forget/spark.svg',
    '/a7/forget/strikethrough.svg',
    '/a7/forget/tab.svg',
    '/a7/forget/templates-outline.svg',
    '/a7/forget/themes.gif',
    '/a7/forget/trash-hover.svg',
    '/a7/forget/trash-mini.svg',
    '/a7/forget/trash.svg',
    '/a7/forget/underline.svg',
    '/a7/forget/wisk-dvd-like.svg',
    '/a7/forget/x.svg',
    '/a7/forget/youtube_AslKWwxPNbY_audio.mp3',
    '/a7/iconoir/down.svg',
    '/a7/iconoir/expand.svg',
    '/a7/iconoir/left.svg',
    '/a7/iconoir/page-plus.svg',
    '/a7/iconoir/plus-square.svg',
    '/a7/iconoir/plus.svg',
    '/a7/iconoir/right.svg',
    '/a7/iconoir/trash.svg',
    '/a7/iconoir/up-arrow.svg',
    '/a7/iconoir/xmark.svg',
    '/a7/icons/js-1.5.svg',
    '/a7/icons/js-2.svg',
    '/a7/icons/lua-1.5.svg',
    '/a7/icons/lua-2.svg',
    '/a7/icons/py-1.5.svg',
    '/a7/icons/py-2.svg',
    '/a7/plugins/accordion/down.svg',
    '/a7/plugins/ai-chat/ai-animated.svg',
    '/a7/plugins/ai-chat/ai.svg',
    '/a7/plugins/ai-chat/attach.svg',
    '/a7/plugins/ai-chat/enter.svg',
    '/a7/plugins/ai-chat/flake-small.svg',
    '/a7/plugins/ai-chat/flake.anim.svg',
    '/a7/plugins/ai-chat/flake.svg',
    '/a7/plugins/ai-chat/neo-circle.svg',
    '/a7/plugins/ai-chat/neo-loading.svg',
    '/a7/plugins/ai-chat/neo.svg',
    '/a7/plugins/ai-chat/up.svg',
    '/a7/plugins/ai-chat/user.svg',
    '/a7/plugins/ai-chat/wand.svg',
    '/a7/plugins/ai-chat/x.svg',
    '/a7/plugins/auth-element/pexels-viridianaor-19797275.jpg',
    '/a7/plugins/bottom-bar/circle.svg',
    '/a7/plugins/bottom-bar/docs.svg',
    '/a7/plugins/bottom-bar/home.svg',
    '/a7/plugins/bottom-bar/more.svg',
    '/a7/plugins/bottom-bar/plus.svg',
    '/a7/plugins/bottom-bar/rhombus.svg',
    '/a7/plugins/bottom-bar/search.svg',
    '/a7/plugins/bottom-bar/solid-home.svg',
    '/a7/plugins/bottom-bar/solid-more.svg',
    '/a7/plugins/bottom-bar/solid-pencil.svg',
    '/a7/plugins/bottom-bar/solid-sparkle.svg',
    '/a7/plugins/bottom-bar/sparkle.svg',
    '/a7/plugins/bottom-bar/square.svg',
    '/a7/plugins/bottom-bar/triangle.svg',
    '/a7/plugins/canvas-element/arrow.svg',
    '/a7/plugins/canvas-element/circle.svg',
    '/a7/plugins/canvas-element/clear-all.svg',
    '/a7/plugins/canvas-element/draw.svg',
    '/a7/plugins/canvas-element/home.svg',
    '/a7/plugins/canvas-element/image.svg',
    '/a7/plugins/canvas-element/line.svg',
    '/a7/plugins/canvas-element/max.svg',
    '/a7/plugins/canvas-element/more.svg',
    '/a7/plugins/canvas-element/pan.svg',
    '/a7/plugins/canvas-element/rectangle.svg',
    '/a7/plugins/canvas-element/select.svg',
    '/a7/plugins/canvas-element/text.svg',
    '/a7/plugins/canvas-element/trash.svg',
    '/a7/plugins/cursor/christmas/arrow.png',
    '/a7/plugins/cursor/offensive-pixel/arrow.png',
    '/a7/plugins/cursor/offensive-pixel/hand.png',
    '/a7/plugins/cursor/simple-pixel/arrow.png',
    '/a7/plugins/cursor/simple-pixel/hand.png',
    '/a7/plugins/database-element/edit.svg',
    '/a7/plugins/database-element/filter.svg',
    '/a7/plugins/database-element/plus.svg',
    '/a7/plugins/database-element/properties.svg',
    '/a7/plugins/database-element/sort.svg',
    '/a7/plugins/document-graph/home.svg',
    '/a7/plugins/general-chat/add-people.gif',
    '/a7/plugins/general-chat/cam-off.svg',
    '/a7/plugins/general-chat/cam-on.svg',
    '/a7/plugins/general-chat/mic-off.svg',
    '/a7/plugins/general-chat/mic-on.svg',
    '/a7/plugins/general-chat/more.svg',
    '/a7/plugins/general-chat/phone-exit.svg',
    '/a7/plugins/general-chat/up.svg',
    '/a7/plugins/image-element/gif.svg',
    '/a7/plugins/image-element/link.svg',
    '/a7/plugins/image-element/upload.svg',
    '/a7/plugins/latex-element/accept.svg',
    '/a7/plugins/latex-element/code.svg',
    '/a7/plugins/latex-element/discard.svg',
    '/a7/plugins/latex-element/magic.svg',
    '/a7/plugins/latex-element/pencil.svg',
    '/a7/plugins/latex-element/up.svg',
    '/a7/plugins/map-element/down.svg',
    '/a7/plugins/map-element/left.svg',
    '/a7/plugins/map-element/minus.svg',
    '/a7/plugins/map-element/plus.svg',
    '/a7/plugins/map-element/right.svg',
    '/a7/plugins/map-element/up.svg',
    '/a7/plugins/neo-ai/ai-2.svg',
    '/a7/plugins/neo-ai/ai.svg',
    '/a7/plugins/neo-ai/ask.svg',
    '/a7/plugins/neo-ai/brainstorm.svg',
    '/a7/plugins/neo-ai/chonk.svg',
    '/a7/plugins/neo-ai/close.svg',
    '/a7/plugins/neo-ai/collapse.svg',
    '/a7/plugins/neo-ai/expand.svg',
    '/a7/plugins/neo-ai/flag.svg',
    '/a7/plugins/neo-ai/help.svg',
    '/a7/plugins/neo-ai/more.svg',
    '/a7/plugins/neo-ai/next.svg',
    '/a7/plugins/neo-ai/quick.svg',
    '/a7/plugins/neo-ai/settings.svg',
    '/a7/plugins/neo-ai/smol.svg',
    '/a7/plugins/neo-ai/sparkle.svg',
    '/a7/plugins/neo-ai/spin.svg',
    '/a7/plugins/neo-ai/summarize.svg',
    '/a7/plugins/neo-ai/support.svg',
    '/a7/plugins/neo-ai/translate.svg',
    '/a7/plugins/neo-ai/trash.svg',
    '/a7/plugins/neo-ai/up.svg',
    '/a7/plugins/neo-ai/user.svg',
    '/a7/plugins/neo-ai/voice.svg',
    '/a7/plugins/neo-ai/wand.svg',
    '/a7/plugins/neo-ai/weak-arg.svg',
    '/a7/plugins/neo-ai/writers-block.svg',
    '/a7/plugins/nightwave-plaza/pause.svg',
    '/a7/plugins/nightwave-plaza/play.svg',
    '/a7/plugins/nightwave-plaza/refresh.svg',
    '/a7/plugins/options-element/about.svg',
    '/a7/plugins/options-element/account.svg',
    '/a7/plugins/options-element/autocomplete.svg',
    '/a7/plugins/options-element/changelog.svg',
    '/a7/plugins/options-element/check.svg',
    '/a7/plugins/options-element/developer.svg',
    '/a7/plugins/options-element/emoji-down.svg',
    '/a7/plugins/options-element/emoji-left.svg',
    '/a7/plugins/options-element/emoji-normal.svg',
    '/a7/plugins/options-element/emoji-right.svg',
    '/a7/plugins/options-element/emoji-up.svg',
    '/a7/plugins/options-element/info.svg',
    '/a7/plugins/options-element/integrations.svg',
    '/a7/plugins/options-element/pencil.svg',
    '/a7/plugins/options-element/pin-tack.svg',
    '/a7/plugins/options-element/pin.svg',
    '/a7/plugins/options-element/plug.svg',
    '/a7/plugins/options-element/puzzled.svg',
    '/a7/plugins/options-element/settings.svg',
    '/a7/plugins/options-element/shield.svg',
    '/a7/plugins/options-element/snapshots.svg',
    '/a7/plugins/options-element/theme.svg',
    '/a7/plugins/options-element/x.svg',
    '/a7/plugins/share-component/plus.svg',
    '/a7/plugins/share-component/x.svg',
    '/a7/plugins/toolbar/ai.svg',
    '/a7/plugins/toolbar/autocomplete.svg',
    '/a7/plugins/toolbar/check.svg',
    '/a7/plugins/toolbar/color.svg',
    '/a7/plugins/toolbar/down.svg',
    '/a7/plugins/toolbar/edit.svg',
    '/a7/plugins/toolbar/longer.svg',
    '/a7/plugins/toolbar/mean.svg',
    '/a7/plugins/toolbar/refresh.svg',
    '/a7/plugins/toolbar/right.svg',
    '/a7/plugins/toolbar/search.svg',
    '/a7/plugins/toolbar/shorter.svg',
    '/a7/plugins/toolbar/simplify.svg',
    '/a7/plugins/toolbar/subscript.svg',
    '/a7/plugins/toolbar/superscript.svg',
    '/a7/plugins/toolbar/tone.svg',
    '/a7/plugins/toolbar/translate.svg',
    '/a7/plugins/toolbar/wand.svg',
    '/a7/plugins/tweaks/pexels-codioful-7130469.jpg',
    '/a7/plugins/tweaks/pexels-fotios-photos-1414573.jpg',
    '/a7/screencap.png',
    '/a7/templates/blog-simple/desktop.png',
    '/a7/templates/blog-simple/phone.png',
    '/a7/templates/blog-simple/preview/desktop.png',
    '/a7/templates/blog-simple/preview/phone.png',
    '/a7/templates/minimal-weekly-todo/desktop.png',
    '/a7/templates/minimal-weekly-todo/phone.png',
    '/a7/templates/minimal-weekly-todo/preview/desktop.png',
    '/a7/templates/minimal-weekly-todo/preview/phone.png',
    '/a7/templates/travel-itinerary-simple/desktop.png',
    '/a7/templates/travel-itinerary-simple/phone.png',
    '/a7/templates/travel-itinerary-simple/preview/desktop.png',
    '/a7/templates/travel-itinerary-simple/preview/phone.png',
    '/a7/wisk-logo-with-bg-512.png',
    '/a7/wisk-logo-with-bg-512.svg',
    '/a7/wisk-logo-with-bg.png',
    '/a7/wisk-logo-with-bg.svg',
    '/a7/wisk-logo.svg',
    '/CONTRIBUTING.md',
    '/css/left-sidebar.css',
    '/css/mini-dialog.css',
    '/css/pages.css',
    '/css/right-sidebar.css',
    '/docs/changelog.md',
    '/docs/docs.md',
    '/exp/example-webcomponent.js',
    '/exp/excalidraw.html',
    '/exp/exp-text.js',
    '/exp/focus.html',
    '/exp/hello-world.html',
    '/exp/index.html',
    '/exp/indexeddb.html',
    '/exp/lua.html',
    '/exp/obj-visualizer-demo.html',
    '/exp/py-element.html',
    '/exp/python.html',
    '/exp/screenshot.html',
    '/exp/simple-cam.html',
    '/exp/tldraw.html',
    '/favicon.ico',
    '/global.css',
    '/global.js',
    '/index.html',
    '/js/auth/auth.js',
    '/js/editor.js',
    '/js/elements/auth-component.js',
    '/js/elements/bottom-bar.js',
    '/js/elements/cite-element.js',
    '/js/elements/command-palette.js',
    '/js/elements/context-element.js',
    '/js/elements/emoji-element.js',
    '/js/elements/feedback-dialog.js',
    '/js/elements/file-upload-dialog.js',
    '/js/elements/getting-started.js',
    '/js/elements/help-dialog.js',
    '/js/elements/home-element.js',
    '/js/elements/image-editor.js',
    '/js/elements/loading.js',
    '/js/elements/obj-visualizer-element.js',
    '/js/elements/search-element.js',
    '/js/elements/selector-element.js',
    '/js/elements/show-dialog.js',
    '/js/elements/template-dialog.js',
    '/js/elements/template.js',
    '/js/elements/toolbar-element.js',
    '/js/left-sidebar.js',
    '/js/mini-dialog.js',
    '/js/paste-handler.js',
    '/js/plugins/code/accordion-element.js',
    '/js/plugins/code/ai-chat.js',
    '/js/plugins/code/base-layout-element.js',
    '/js/plugins/code/base-text-element.js',
    '/js/plugins/code/brainrot-element.js',
    '/js/plugins/code/callout-element.js',
    '/js/plugins/code/canvas-element.js',
    '/js/plugins/code/chart-element.js',
    '/js/plugins/code/checkbox-element.js',
    '/js/plugins/code/code-element.js',
    '/js/plugins/code/columns-element.js',
    '/js/plugins/code/cursor-customizer.js',
    '/js/plugins/code/database-element.js',
    '/js/plugins/code/database-page.js',
    '/js/plugins/code/divider-element.js',
    '/js/plugins/code/document-graph.js',
    '/js/plugins/code/dots-divider.js',
    '/js/plugins/code/emacs.js',
    '/js/plugins/code/embed-element.js',
    '/js/plugins/code/example.js',
    '/js/plugins/code/general-chat.js',
    '/js/plugins/code/generic-dialog-element.js',
    '/js/plugins/code/heading1-element.js',
    '/js/plugins/code/heading2-element.js',
    '/js/plugins/code/heading3-element.js',
    '/js/plugins/code/heading4-element.js',
    '/js/plugins/code/heading5-element.js',
    '/js/plugins/code/image-element.js',
    '/js/plugins/code/javascript-code-block.js',
    '/js/plugins/code/keystroke-sound.js',
    '/js/plugins/code/latex-element.js',
    '/js/plugins/code/left-menu.js',
    '/js/plugins/code/link-preview-element.js',
    '/js/plugins/code/list-element.js',
    '/js/plugins/code/lua-code-block.js',
    '/js/plugins/code/main-element.js',
    '/js/plugins/code/manage-citations.js',
    '/js/plugins/code/map-element.js',
    '/js/plugins/code/mermaid-element.js',
    '/js/plugins/code/mini-app.js',
    '/js/plugins/code/music-maker.js',
    '/js/plugins/code/neo-ai.js',
    '/js/plugins/code/nightwave-plaza-radio.js',
    '/js/plugins/code/numbered-list-element.js',
    '/js/plugins/code/options-component.js',
    '/js/plugins/code/pdf-preview.js',
    '/js/plugins/code/pin-element.js',
    '/js/plugins/code/pomodoro-timer.js',
    '/js/plugins/code/powerlevel-element.js',
    '/js/plugins/code/py-interpreter.js',
    '/js/plugins/code/python-code-block.js',
    '/js/plugins/code/quote-element.js',
    '/js/plugins/code/screensaver.js',
    '/js/plugins/code/share-component.js',
    '/js/plugins/code/simplest-layout.js',
    '/js/plugins/code/sticky-notes.js',
    '/js/plugins/code/super-checkbox.js',
    '/js/plugins/code/super-divider.js',
    '/js/plugins/code/symbols-element.js',
    '/js/plugins/code/table-element.js',
    '/js/plugins/code/table-of-contents.js',
    '/js/plugins/code/text-element.js',
    '/js/plugins/code/three-viewer-element.js',
    '/js/plugins/code/tier-list.js',
    '/js/plugins/code/tweaks-element.js',
    '/js/plugins/code/video-element.js',
    '/js/plugins/code/vim.js',
    '/js/plugins/code/whitenoise-radio.js',
    '/js/plugins/code/wisk-terminal.js',
    '/js/plugins/code/word-count.js',
    '/js/plugins/icons/3d.svg',
    '/js/plugins/icons/access-manager.svg',
    '/js/plugins/icons/accordion.svg',
    '/js/plugins/icons/ai-chat.svg',
    '/js/plugins/icons/brainrot.svg',
    '/js/plugins/icons/callout.svg',
    '/js/plugins/icons/canvas.svg',
    '/js/plugins/icons/chart.svg',
    '/js/plugins/icons/checkbox.svg',
    '/js/plugins/icons/citation.svg',
    '/js/plugins/icons/code.svg',
    '/js/plugins/icons/columns.svg',
    '/js/plugins/icons/cursor-2.svg',
    '/js/plugins/icons/cursor.svg',
    '/js/plugins/icons/database.svg',
    '/js/plugins/icons/divider.svg',
    '/js/plugins/icons/document-graph-2.svg',
    '/js/plugins/icons/document-graph.svg',
    '/js/plugins/icons/dots-divider.svg',
    '/js/plugins/icons/emacs.svg',
    '/js/plugins/icons/embed.svg',
    '/js/plugins/icons/export-manager.svg',
    '/js/plugins/icons/general-chat-2.svg',
    '/js/plugins/icons/general-chat.svg',
    '/js/plugins/icons/heading1.svg',
    '/js/plugins/icons/heading2.svg',
    '/js/plugins/icons/heading3.svg',
    '/js/plugins/icons/heading4.svg',
    '/js/plugins/icons/heading5.svg',
    '/js/plugins/icons/image.svg',
    '/js/plugins/icons/javascript.svg',
    '/js/plugins/icons/keystroke-sound-2.svg',
    '/js/plugins/icons/keystroke-sound.svg',
    '/js/plugins/icons/latex.svg',
    '/js/plugins/icons/link.svg',
    '/js/plugins/icons/list.svg',
    '/js/plugins/icons/lua.svg',
    '/js/plugins/icons/map.svg',
    '/js/plugins/icons/menu.svg',
    '/js/plugins/icons/mermaid.svg',
    '/js/plugins/icons/mini-app.svg',
    '/js/plugins/icons/more.svg',
    '/js/plugins/icons/music-maker.svg',
    '/js/plugins/icons/neo-ai.svg',
    '/js/plugins/icons/nightwave-plaza-2.svg',
    '/js/plugins/icons/nightwave-plaza.svg',
    '/js/plugins/icons/numbered.svg',
    '/js/plugins/icons/pdf-2.svg',
    '/js/plugins/icons/pdf.svg',
    '/js/plugins/icons/pomodoro-timer-2.svg',
    '/js/plugins/icons/pomodoro-timer.svg',
    '/js/plugins/icons/powerlevel.svg',
    '/js/plugins/icons/py-interpreter.svg',
    '/js/plugins/icons/quote.svg',
    '/js/plugins/icons/screensaver.svg',
    '/js/plugins/icons/scribble.svg',
    '/js/plugins/icons/share.svg',
    '/js/plugins/icons/sticky-notes-2.svg',
    '/js/plugins/icons/sticky-notes.svg',
    '/js/plugins/icons/super-checkbox.svg',
    '/js/plugins/icons/symbols-2.svg',
    '/js/plugins/icons/symbols.svg',
    '/js/plugins/icons/table-of-contents.svg',
    '/js/plugins/icons/table.svg',
    '/js/plugins/icons/test1.svg',
    '/js/plugins/icons/test2.svg',
    '/js/plugins/icons/test3.svg',
    '/js/plugins/icons/text.svg',
    '/js/plugins/icons/tier-list.svg',
    '/js/plugins/icons/tweaks-2.svg',
    '/js/plugins/icons/tweaks.svg',
    '/js/plugins/icons/video.svg',
    '/js/plugins/icons/vim.svg',
    '/js/plugins/icons/whitenoise-2.svg',
    '/js/plugins/icons/whitenoise.svg',
    '/js/plugins/icons/wisk-terminal.svg',
    '/js/plugins/icons/word-count-2.svg',
    '/js/plugins/icons/word-count.svg',
    '/js/plugins/plugin-data.json',
    '/js/plugins/plugins.js',
    '/js/plugins/README.md',
    '/js/polyfill.js',
    '/js/right-sidebar.js',
    '/js/storage/db.js',
    '/js/sync/sync.js',
    '/js/templates/resize.sh',
    '/js/templates/storage/blog-simple.json',
    '/js/templates/storage/minimal-weekly-todo.json',
    '/js/templates/storage/travel-itinerary-simple.json',
    '/js/templates/templates.json',
    '/js/theme/theme-data.json',
    '/js/theme/theme.js',
    '/js/theme/variables.css',
    '/js/utils.js',
    '/js/wisk.js',
    '/LICENSE.md',
    '/manifest.json',
    '/README.md',
    '/script.js',
    '/service-worker.js',
    '/style.css',
    'https://jalebi.soham.sh/src/jalebi-toggle.js',
    'https://jalebi.soham.sh/src/jalebi-select.js',
    'https://jalebi.soham.sh/src/jalebi-multiselect.js',
    'https://jalebi.soham.sh/src/jalebi-datepicker.js',
    'https://jalebi.soham.sh/src/jalebi-timepicker.js',
    'https://jalebi.soham.sh/src/jalebi-datetimepicker.js',
    'https://jalebi.soham.sh/src/jalebi-checkbox.js',
    'https://jalebi.soham.sh/src/jalebi-input.js',
    '/a7/cdn/fflate-0.8.2.min.js',
    '/a7/plugins/options-element/data-controls.svg',
];

// Install event - don't wait for caching to complete
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');

    // Skip waiting for installation to complete
    self.skipWaiting();

    // Start caching core assets in the background
    caches.open(CACHE_NAME).then(cache => {
        console.log('[Service Worker] Background caching of core assets started');
        return cache
            .addAll(CORE_ASSETS)
            .then(() => {
                console.log('[Service Worker] Background caching completed');
            })
            .catch(err => {
                console.error('[Service Worker] Background caching error:', err);
            });
    });
});

// Activate event - claim clients immediately
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(self.clients.claim());
});

// Fetch event - optimized for speed in both online and offline modes
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Quick response strategy that doesn't block on cache operations
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            try {
                // Try cache first (fast path) - doesn't block if not in cache
                const cachedResponse = await cache.match(event.request);
                if (cachedResponse) {
                    // If online, fetch in background to update cache for next time
                    if (navigator.onLine) {
                        fetchAndCache(event.request, cache).catch(err => {
                            console.log('[SW] Background fetch failed:', err);
                        });
                    }
                    return cachedResponse;
                }

                // If not in cache, fetch from network and cache for next time
                const networkResponse = await fetch(event.request);

                // Cache the response for next time (in background)
                if (networkResponse.ok) {
                    cache.put(event.request, networkResponse.clone()).catch(err => {
                        console.log('[SW] Cache put error:', err);
                    });
                }

                return networkResponse;
            } catch (error) {
                // Network error, we're offline, or resource doesn't exist
                console.log('[SW] Fetch error:', error);

                // Check if we have a cached version as fallback
                const cachedResponse = await cache.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                // For navigation requests, return the index page as fallback
                if (event.request.mode === 'navigate') {
                    const homeResponse = await cache.match('/');
                    if (homeResponse) {
                        return homeResponse;
                    }
                }

                // Nothing found, propagate the error
                throw error;
            }
        })()
    );
});

// Helper function to fetch and cache in background
const fetchAndCache = async (request, cache) => {
    const response = await fetch(request);
    if (response.ok) {
        cache.put(request, response.clone());
    }
    return response;
};

// Helper function to update the cache
const updateCache = async (assets = []) => {
    try {
        const cache = await caches.open(CACHE_NAME);

        // If no specific assets provided, refresh the core assets
        const assetsToCache = assets.length ? assets : CORE_ASSETS;

        // Force re-fetch and update the cache for each asset
        const updatePromises = assetsToCache.map(async url => {
            try {
                // Force reload from network
                const response = await fetch(url, { cache: 'reload' });
                if (response.ok) {
                    await cache.put(url, response);
                    console.log(`[Service Worker] Updated cache for: ${url}`);
                }
            } catch (err) {
                console.error(`[Service Worker] Failed to update: ${url}`, err);
            }
        });

        await Promise.all(updatePromises);
        return true;
    } catch (error) {
        console.error('[Service Worker] Update cache error:', error);
        return false;
    }
};

// Helper function to clear all caches
const clearAllCaches = async () => {
    try {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
        console.log('[Service Worker] All caches cleared successfully');
        return true;
    } catch (error) {
        console.error('[Service Worker] Error clearing caches:', error);
        return false;
    }
};

// Listen for messages from the main thread
self.addEventListener('message', event => {
    if (event.data === 'CLEAR_CACHES') {
        clearAllCaches().then(success => {
            if (event.source && event.source.postMessage) {
                event.source.postMessage({
                    type: 'CACHES_CLEARED',
                    success: success,
                });
            }
        });
    } else if (event.data === 'UPDATE_CACHE' || (event.data && event.data.type === 'UPDATE_CACHE')) {
        const assets = event.data && event.data.assets ? event.data.assets : [];

        updateCache(assets).then(success => {
            if (event.source && event.source.postMessage) {
                event.source.postMessage({
                    type: 'CACHE_UPDATED',
                    success: success,
                });
            }
        });
    }
});
