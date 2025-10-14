// TODO clean up this mess
import { LitElement, html, css, styleMap } from '/a7/cdn/lit-all-2.7.4.min.js';

class DatabaseElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0;
            padding: 0;
            font-size: 14px;
            user-select: none;
        }
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            font-size: revert;
        }
        :host {
            display: block;
            width: 100%;
            color: var(--fg-1);
            overflow: auto;
        }
        .view-switcher {
            display: flex;
            margin-bottom: var(--gap-2);
        }
        .view-button {
            margin-right: var(--gap-1);
            padding: var(--padding-w1);
            cursor: pointer;
            background-color: var(--bg-2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
        }
        .active {
            background-color: var(--bg-3);
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th,
        td {
            border: 1px solid var(--border-1);
            padding: var(--padding-3);
            text-align: left;
        }
        th {
            background-color: var(--bg-2);
            font-family: var(--font);
        }
        .kanban {
            display: flex;
            overflow-x: auto;
            gap: var(--gap-2);
            padding-top: var(--gap-3);
        }
        .kanban-column {
            min-width: 320px;
            border-radius: var(--radius);
        }
        .calendar-container,
        .gallery {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: var(--gap-1);
            padding-top: var(--gap-3);
        }
        .gallery {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
        .calendar-day,
        .gallery-item {
            border: 1px solid var(--border-1);
            padding: var(--padding-2);
            min-height: 100px;
            background-color: var(--bg-1);
        }
        .editable-cell {
            position: relative;
        }
        .editable-cell input,
        .editable-cell select {
            width: 100%;
            box-sizing: border-box;
            padding: var(--padding-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
        }
        .multi-select {
            display: flex;
            flex-wrap: wrap;
            gap: var(--gap-1);
        }
        .multi-select-item {
            background-color: var(--bg-3);
            padding: var(--padding-1);
            border-radius: var(--radius);
            font-size: 0.9em;
        }
        .kanban-item,
        .calendar-item,
        .gallery-item {
            border: 1px solid var(--bg-3);
            padding: var(--padding-2);
            margin-bottom: var(--gap-1);
            cursor: pointer;
            background-color: var(--bg-1);
            border-radius: var(--radius);
        }
        .kanban-item:hover,
        .calendar-item:hover,
        .gallery-item:hover {
            background-color: var(--bg-2);
        }
        .add-column-form,
        .add-row-form {
            margin-top: var(--gap-2);
            padding: var(--padding-3);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background-color: var(--bg-2);
        }
        .add-row-form label {
            display: block;
            margin-top: var(--gap-1);
        }
        .button-container {
            margin-top: var(--gap-2);
        }
        .dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            z-index: 90;
            justify-content: center;
            align-items: center;
        }
        .dialog {
            background-color: var(--bg-1);
            padding: var(--padding-4);
            border-radius: var(--radius-large);
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: var(--gap-1);
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 91;
        }
        .dialog > div > label {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .dialog h2 {
            margin-top: 0;
            font-family: var(--font);
        }
        .dialog-buttons {
            margin-top: var(--gap-3);
            text-align: right;
        }
        tr {
            cursor: pointer;
        }
        tr:hover {
            background-color: var(--bg-2);
        }
        .kanban-column {
            min-width: 280px;
            margin-right: var(--gap-2);
            border-radius: var(--radius);
        }

        .kanban-item {
            background-color: var(--bg-1);
            margin-bottom: var(--gap-2);
            padding: var(--padding-3);
            border-radius: var(--radius);
            box-shadow: var(--drop-shadow);
            cursor: move;
        }
        .kanban-item:hover {
            box-shadow: var(--drop-shadow);
        }
        .kanban-item.dragging {
            opacity: 0.5;
        }
        .kanban-column.drag-over {
        }
        .view-selector {
            display: flex;
            align-items: center;
            margin-bottom: var(--gap-2);
        }
        .view-selector select {
            margin-right: var(--gap-2);
        }
        .filter-sort-panel {
            background-color: var(--bg-2);
            padding: var(--padding-3);
            margin-bottom: var(--gap-2);
            border-radius: var(--radius);
        }
        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--gap-2);
        }
        .calendar-weekdays {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            font-weight: bold;
            margin-bottom: var(--gap-1);
            font-family: var(--font);
        }
        .calendar-grid {
            display: flex;
            flex-direction: column;
        }
        .calendar-week {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
        }
        .calendar-day {
            border: 1px solid var(--bg-3);
            min-height: 100px;
            padding: var(--padding-2);
            position: relative;
        }
        .calendar-day.other-month {
            background-color: var(--bg-2);
        }
        .day-number {
            position: absolute;
            top: var(--padding-2);
            left: var(--padding-2);
            font-family: var(--font-mono);
        }
        .day-content {
            margin-top: 20px;
        }
        .calendar-item {
            background-color: var(--bg-3);
            margin-bottom: 2px;
            padding: var(--padding-1);
            cursor: pointer;
            border-radius: var(--radius);
        }
        .add-entry-button {
            position: absolute;
            top: var(--padding-2);
            right: var(--padding-2);
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s;
            background-color: var(--bg-1);
            color: var(--bg-1);
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 0;
        }
        .calendar-day:hover .add-entry-button {
            opacity: 1;
        }
        button {
            background-color: var(--bg-2);
            color: var(--fg-1);
            border: 1px solid var(--border-1);
            padding: var(--padding-w2);
            border-radius: var(--radius);
            cursor: pointer;
            font-family: var(--font);
        }
        button:hover {
            opacity: 0.9;
        }
        select {
            font-family: var(--font);
            padding: var(--padding-w1);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
        }
        input[type='text'],
        input[type='date'] {
            font-family: var(--font);
            padding: var(--padding-w1);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
        }

        .edit-form-input,
        .edit-form-select {
            padding: var(--padding-w2);
            border: 2px solid var(--bg-3);
            border-radius: var(--radius);
            background-color: var(--bg-2);
            color: var(--fg-1);
        }

        .edit-form-input:focus,
        .edit-form-select:focus {
            background-color: var(--bg-1);
            border-color: var(--fg-accent);
        }

        .calendar-container {
            display: flex;
            flex-direction: column;
            width: 100%;
        }
        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .calendar-weekdays {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .calendar-grid {
            display: flex;
            flex-direction: column;
            border-left: 1px solid var(--bg-3);
            border-bottom: 1px solid var(--bg-3);
        }
        .calendar-week {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
        }
        .calendar-day {
            min-height: 100px;
            padding: 5px;
            position: relative;
            border-left: none;
            border-bottom: none;
        }
        .day-number {
            position: absolute;
            top: 5px;
            left: 5px;
        }
        .day-content {
            margin-top: 20px;
        }
        .add-entry-button {
            position: absolute;
            top: 5px;
            right: 5px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .calendar-day:hover .add-entry-button {
            opacity: 1;
        }
        .list-view {
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
            padding-top: var(--gap-3);
        }
        .list-item {
            border: 1px solid var(--border-1);
            padding: var(--padding-3);
            border-radius: var(--radius);
            cursor: pointer;
        }
        .list-item:hover {
            background-color: var(--bg-2);
        }
        .list-item-property {
            margin-bottom: var(--gap-1);
        }
        .property-checkboxes {
            display: flex;
            flex-wrap: wrap;
            gap: var(--gap-1);
        }
        .property-checkboxes label {
            display: flex;
            align-items: center;
            gap: var(--gap-1);
        }
        .full-width-button {
            width: 100%;
            padding: var(--padding-3);
            background-color: var(--bg-1);
            border: none;
            border-radius: 0;
            cursor: pointer;
            width: -fit-content;
            text-align: left;
        }
        .full-width-button:hover {
            background-color: var(--bg-3);
        }
        .add-column-button {
            background: none;
            border: none;
            cursor: pointer;
            height: 40px;
            width: 40px;
            border-radius: 0;
        }
        .dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--fg-2);
            opacity: 0.3;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .view-tabs {
            display: flex;
            overflow-x: auto;
            width: 100%;
        }

        .view-tab {
            padding: var(--padding-w2);
            border: none;
            background: none;
            cursor: pointer;
            font-family: var(--font);
            font-size: 1em;
            color: var(--fg-1);
            transition: border-color 0.3s ease;
            border-radius: calc(20 * var(--radius-large));
            color: var(--fg-2);
            display: flex;
            align-items: center;
            white-space: nowrap;
            font-weight: 500;
            border: none;
        }

        .view-tab:hover {
            background-color: var(--bg-3);
            color: var(--fg-1);
        }

        .view-tab.active {
            color: var(--fg-1);
            background: var(--bg-3);
        }

        .view-tab.add-view {
            font-size: 1.2em;
        }

        .view-actions {
            display: flex;
            justify-content: flex-end;
            padding: var(--padding-2) 0;
        }

        .view-actions button {
            margin-left: var(--gap-2);
        }

        .delete-button {
            background-color: var(--error-color, #ff4d4f);
            color: white;
        }

        .delete-button:hover {
            background-color: var(--error-color-hover, #ff7875);
        }

        .dialog-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: var(--gap-3);
        }

        .property-item {
            display: flex;
            gap: var(--gap-2);
            margin-bottom: var(--gap-2);
        }

        .property-item input,
        .property-item select {
            flex: 1;
        }

        .property-item button {
            flex-shrink: 0;
        }
        .property-item.removed {
            opacity: 0.5;
            text-decoration: line-through;
        }

        .property-item.removed input,
        .property-item.removed select {
            pointer-events: none;
        }
        .kanban-column-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--gap-2);
        }

        .add-entry-button {
            border: none;
            font-size: 1.2em;
            cursor: pointer;
            padding: var(--padding-1);
            transition: background-color 0.3s;
        }

        .add-entry-button:hover {
            background-color: var(--fg-1);
        }

        .new-entry {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            background-color: var(--bg-2);
            transition: background-color 0.3s;
        }

        .new-entry:hover {
            background-color: var(--bg-3);
        }

        .new-entry-placeholder {
            font-size: 2em;
            margin-bottom: var(--gap-2);
        }
        .kanban-column-header {
            position: relative;
            padding-right: 30px; /* Make room for the button */
        }

        .kanban-column-header .add-entry-button {
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            opacity: 0;
            transition: opacity 0.3s;
        }

        .kanban-column:hover .add-entry-button {
            opacity: 1;
        }

        .add-entry-button {
            background: var(--fg-1);
            border: none;
            cursor: pointer;
            padding: var(--padding-1);
            border-radius: 50%;
            transition:
                background-color 0.3s,
                opacity 0.3s;
        }

        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border: none;
        }

        th,
        td {
            border: none;
            border-bottom: 1px solid var(--border-1);
            padding: var(--padding-3);
            text-align: left;
            vertical-align: top;
        }

        td {
            border-left: 1px solid var(--border-1);
        }

        th:first-of-type,
        td:first-of-type {
            border-left: none;
        }

        th {
            background-color: var(--bg-1);
            position: sticky;
            top: 0;
            z-index: 10;
        }

        tr {
            background-color: var(--bg-1);
        }

        tr:hover {
            background-color: var(--bg-2);
        }

        td {
            transition: background-color 0.3s;
        }

        /* Add some spacing between columns */
        th:not(:last-child),
        td:not(:last-child) {
            padding-right: var(--padding-4);
        }

        /* Style for the add column button */
        th:last-child {
            width: 40px;
            text-align: center;
        }

        .add-column-button {
            background: none;
            border: none;
            font-size: 1.2em;
            cursor: pointer;
            padding: var(--padding-1);
            border-radius: 50%;
            transition: background-color 0.3s;
        }

        .add-column-button:hover {
            background-color: var(--bg-3);
        }

        td {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        td:hover {
            white-space: normal;
            word-break: break-word;
        }

        /* Style for checkbox cells */
        td input[type='checkbox'] {
            margin: 0;
            vertical-align: middle;
        }

        /* Add some responsive behavior */
        @media (max-width: 768px) {
            table {
                font-size: 14px;
            }

            th,
            td {
                padding: var(--padding-2);
            }
        }

        .plugin-icon {
            filter: var(--themed-svg);
            width: 20px;
            height: 20px;
            padding: var(--padding-1);
            border-radius: calc(20 * var(--radius-large));
        }

        .plugin-icon-button {
            background-color: transparent;
            border: none;
            cursor: pointer;
            padding: var(--padding-3);
            border-radius: calc(20 * var(--radius-large));
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
        }
        .plugin-icon-button:hover {
            background-color: var(--bg-3);
            opacity: 1;
        }

        input,
        select {
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            background-color: var(--bg-2);
            padding: var(--padding-1);
            color: var(--fg-1);
        }

        .kanban-item {
            transition:
                opacity 0.3s,
                transform 0.3s;
            touch-action: none; /* Prevents browser handling of touch events */

            user-select: none;
        }

        .kanban-item:active {
            cursor: grabbing;
        }

        .timeline-wrapper {
            width: 100%;
            overflow: hidden;
            position: relative;
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
        }

        .timeline-container {
            display: flex;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        .timeline-sidebar {
            width: 200px;
            min-width: 200px;
            background: var(--bg-1);
            border-right: 1px solid var(--border-1);
            overflow-y: auto;
            z-index: 20;
        }

        .timeline-task-label {
            padding: var(--padding-2);
            height: 40px;
            display: flex;
            align-items: center;
        }

        .timeline-content {
            flex: 1;
            overflow: auto;
            position: relative;
            display: flex;
            flex-direction: column;
        }

        .timeline-header {
            display: flex;
            position: sticky;
            top: 0;
            background: var(--bg-1);
            z-index: 10;
            min-height: 50px;
            border-bottom: 1px solid var(--border-1);
        }

        .timeline-day {
            min-width: 50px;
            padding: var(--padding-2);
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            font-size: 0.9em;
        }

        .timeline-day-name {
            font-weight: bold;
        }

        .timeline-day-date {
            color: var(--fg-2);
            font-size: 0.8em;
        }

        .timeline-body {
            position: relative;
            flex: 1;
            min-height: min-content;
        }

        .timeline-row {
            height: 40px;
            border-bottom: transparent;
            position: relative;
        }

        .timeline-task {
            position: absolute;
            height: 24px;
            top: 8px;
            background: var(--fg-1);
            border-radius: var(--radius);
            padding: 0 var(--padding-2);
            cursor: pointer;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: all 0.3s ease;
            color: var(--bg-1);
            font-weight: 500;
            font-size: 0.9em;
            display: flex;
            align-items: center;
        }

        .timeline-task:hover {
        }

        .timeline-grid {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
        }

        .timeline-grid-line {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 1px;
            background: transparent;
        }

        .timeline-today {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--error-color);
            z-index: 1;
        }

        .carousel-container {
            position: relative;
            overflow: hidden;
            max-width: 100vw;
            overflow: clip;
        }

        .carousel-track {
            display: flex;
            transition: transform 0.5s ease-in-out;
            width: 100%;
        }

        .carousel-item {
            width: 100%;
            flex: 0 0 100%;
            padding: var(--padding-4);
            background: var(--bg-2);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .carousel-item.active {
            opacity: 1;
        }

        .carousel-property {
            margin-bottom: var(--gap-2);
        }

        .carousel-property-label {
            color: var(--fg-2);
            margin-bottom: var(--gap-1);
            font-size: 0.9em;
        }

        .carousel-property-value {
            color: var(--fg-1);
            font-weight: bold;
            font-size: xx-large;
        }

        .carousel-navigation {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: var(--gap-2);
        }

        .carousel-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--bg-3);
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        .carousel-dot.active {
            background: var(--fg-1);
        }

        .carousel-nav-button {
            background: transparent;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            transition: background-color 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            opacity: 0;
        }

        :host(:hover) .carousel-nav-button {
            opacity: 1;
        }

        .carousel-nav-button:hover {
            background: var(--bg-3);
        }

        .carousel-nav-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .gallery-item-property {
            margin-top: var(--gap-1);
            font-size: 0.9em;
        }

        .property-label {
            color: var(--fg-2);
            margin-right: var(--gap-1);
        }

        .property-value {
            color: var(--fg-1);
            font-size: 12px;
            font-weight: 500;
        }

        .matrix-container {
            padding: var(--padding-3);
            overflow: auto;
        }

        .matrix-grid {
            display: grid;
            gap: var(--gap-2);
            min-width: min-content;
        }

        .matrix-header-cell {
            padding: var(--padding-3);
            background: var(--bg-2);
            border-radius: var(--radius);
            font-weight: bold;
            text-align: center;
            min-width: 150px;
        }

        .matrix-header-cell:first-child {
            background: transparent;
        }

        .matrix-cell {
            padding: var(--padding-2);
            background: var(--bg-2);
            border-radius: var(--radius);
            min-height: 100px;
            transition: background-color 0.3s ease;
        }

        .matrix-cell.drag-over {
            background: var(--bg-3);
            border-style: solid;
        }

        .matrix-item {
            padding: var(--padding-2);
            background: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            margin-bottom: var(--gap-1);
            cursor: move;
            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease;
        }

        .matrix-item:hover {
            transform: translateY(-2px);
            box-shadow: var(--drop-shadow);
        }

        .matrix-item.dragging {
            opacity: 0.5;
        }

        .matrix-props-select {
            display: flex;
            gap: var(--gap-3);
            margin-bottom: var(--gap-3);
            align-items: center;
        }

        .matrix-axis-select {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }

        .edit-dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--fg-2);
            opacity: 0.3;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 90;
        }

        .edit-dialog {
            background-color: var(--bg-1);
            border-radius: var(--radius-large);
            padding: var(--padding-4);
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            filter: var(--drop-shadow);
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2000;
            display: flex;
            flex-direction: column;
        }

        @media (max-width: 600px) {
            .edit-dialog {
                width: 95%;
                max-height: 90vh;
                padding: var(--padding-3);
            }
        }

        .edit-dialog-title {
            margin: 0 0 var(--gap-3) 0;
            font-size: 28px;
            font-weight: 500;
            font-family: var(--font);
        }

        .properties-accordion {
            display: flex;
            flex-direction: column;
            gap: 0;
            flex: 1;
            overflow-y: auto;
            min-height: 0;
        }

        .properties-list {
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
            overflow: auto;
        }

        .property-accordion-item {
            border-bottom: 1px solid var(--bg-3);
        }

        .property-accordion-item:last-child {
            border-bottom: none;
        }

        .property-list-item {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-w1);
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }

        .property-list-item:hover {
            background-color: var(--bg-3);
        }

        .property-list-item.removed {
            opacity: 0.5;
            background-color: var(--bg-2);
            cursor: default;
        }

        .property-main-content {
            flex: 1;
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            min-width: 0;
        }

        .property-expand-btn {
            background: none;
            border: none;
            padding: 4px;
            border-radius: var(--radius);
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
        }

        .property-expand-btn:hover {
            background-color: var(--bg-3);
        }

        .property-expand-btn img {
            width: 16px;
            height: 16px;
            filter: var(--themed-svg);
            transition: all 0.2s ease;
        }

        .property-edit-content {
            max-height: 0;
            overflow: hidden;
            transition:
                max-height 0.3s ease,
                padding 0.3s ease,
                margin 0.3s ease;
            margin: 0;
            border: none;
            border-radius: 0;
        }

        .property-edit-content.expanded {
            max-height: 400px;
            padding: var(--padding-3);
            margin: var(--padding-4) 0;
            border: 1px solid var(--bg-3);
            border-radius: var(--radius-large);
        }

        .property-name {
            flex: 1;
        }

        .property-type {
            color: var(--fg-2);
            font-size: 0.9em;
        }

        .property-edit-view {
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
        }

        .edit-back-button {
            background: none;
            border: none;
            padding: 0;
            font-size: 1em;
            color: var(--fg-2);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }

        .edit-back-button:hover {
            color: var(--fg-1);
        }

        .property-edit-form {
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
        }

        .edit-form-group {
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
        }

        .edit-form-label {
            font-weight: 500;
            color: var(--fg-1);
        }

        .edit-form-emoji {
            font-weight: 500;
            color: var(--fg-1);
            width: fit-content;
            font-size: 40px;
            border-radius: var(--radius);
            padding: var(--padding-3);
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .edit-form-emoji:hover {
            background-color: var(--bg-3);
        }

        .dialog-footer {
            padding-top: var(--gap-2);
            margin-top: var(--gap-2);
        }

        .edit-dialog-buttons {
            display: flex;
            justify-content: flex-end;
            gap: var(--gap-2);
            margin-top: var(--gap-3);
        }

        .edit-button {
            background-color: transparent;
            border: 2px solid transparent;
            color: var(--fg-1);
            font-weight: 500;
            padding: var(--padding-w2);
            border-radius: calc(var(--radius-large) * 20);
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .edit-button:hover {
            background-color: var(--bg-3);
            color: var(--fg-1);
        }

        .edit-button-primary {
            background: var(--fg-1);
            color: var(--bg-1);
            padding: var(--padding-w2);
            font-weight: 600;
            border-radius: calc(var(--radius-large) * 20);
            border: 2px solid transparent;
            display: inline-flex;
            align-items: center;
            gap: var(--gap-2);
            font-size: 14px;
            transition: all 0.2s ease;
        }

        .edit-button-primary:hover {
            background-color: transparent;
            border: 2px solid var(--fg-1);
            color: var(--fg-1);
        }

        .add-property-button {
            margin-top: var(--gap-3);
            width: 100%;
            background: var(--bg-3);
            color: var(--fg-1);
            padding: var(--padding-w2);
            font-weight: 600;
            border-radius: calc(var(--radius-large) * 20);
            border: 2px solid transparent;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--gap-2);
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .add-property-button:hover {
            background-color: transparent;
            border: 2px solid var(--fg-1);
            color: var(--fg-1);
        }

        .name-input {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }

        .name-input input {
            border: none;
            flex: 1;
            outline: none;
            background-color: transparent;
            padding: var(--padding-3) 0;
            font-weight: 600;
            font-size: 22px;
        }

        .dropdown-arrow {
            background: none;
            border: none;
            cursor: pointer;
            padding: var(--padding-1);
            border-radius: calc(20 * var(--radius-large));
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease;
        }

        .dropdown-arrow:hover {
            background-color: var(--bg-2);
        }

        .dropdown-arrow.expanded {
            transform: rotate(90deg);
        }

        .emoji {
            font-size: large;
        }

        .kanban-item-property,
        .matrix-item-property,
        .calendar-item-property {
            margin-top: var(--gap-1);
            font-size: 0.9em;
        }

        .property-emoji {
            margin-right: var(--gap-1);
        }

        .property-value {
            color: var(--fg-1);
        }

        /* To prevent calendar items from becoming too big */
        .calendar-item {
            max-height: 80px;
            overflow-y: auto;
        }

        .view-management {
            display: flex;
            overflow-x: auto;
            padding: var(--padding-2) 0;
        }

        .calendar-day.drag-over {
            background-color: var(--bg-3);
            border: 2px dashed var(--fg-1);
        }

        .calendar-item.dragging {
            opacity: 0.5;
        }

        .calendar-item {
            transition:
                opacity 0.3s,
                transform 0.3s;
            touch-action: none;
            user-select: none;
        }

        .calendar-item:active {
            cursor: grabbing;
        }

        .db-prop {
            display: flex;
        }

        .edit-dialog-btns {
            border: none;
            background: transparent;
            padding: var(--padding-3);
            display: flex;
            justify-content: center;
            align-items: center;
            aspect-ratio: 1;
        }

        .edit-dialog-btns img {
            filter: var(--themed-svg);
        }

        /* Edit View Dialog Enhancements */
        .view-basic-settings {
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            margin-bottom: var(--gap-3);
        }

        .view-configuration {
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
            margin-bottom: var(--gap-2);
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: var(--gap-1);
        }

        .form-label {
            font-size: 14px;
            font-weight: 500;
            color: var(--fg-1);
        }

        .form-input {
            padding: var(--padding-w2);
            border: 2px solid var(--bg-3);
            border-radius: var(--radius);
            background-color: var(--bg-2);
            color: var(--fg-1);
            font-size: 14px;
            transition: all 0.2s ease;
        }

        .form-input:focus {
            background-color: var(--bg-1);
            border-color: var(--fg-accent);
            outline: none;
        }

        .section-title {
            font-size: 15px;
            font-weight: 600;
            color: var(--fg-1);
            margin: 0 0 var(--gap-3) 0;
            padding: var(--gap-3) 0 0 0;
            border-top: 1px solid var(--border-1);
            display: flex;
            align-items: center;
            gap: var(--gap-2);
        }

        .section-title:first-child {
            border-top: none;
            padding-top: 0;
        }

        .section-title img {
            filter: var(--themed-svg);
        }

        .filters-section,
        .sorts-section {
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .section-header .section-title {
            margin: 0;
            padding: 0;
            border: none;
            font-size: 14px;
        }

        .filter-list,
        .sort-list {
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
        }

        .filter-item,
        .sort-item {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-2);
            background-color: var(--bg-1);
            border-radius: var(--radius);
            border: 1px solid var(--bg-3);
            transition: all 0.2s ease;
        }

        .filter-item:hover,
        .sort-item:hover {
            border-color: var(--border-1);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .filter-property,
        .sort-property {
            flex: 1;
            min-width: 100px;
        }

        .filter-operator,
        .sort-direction {
            flex: 0 0 120px;
        }

        .filter-value {
            flex: 1;
            min-width: 80px;
        }

        .filter-value .form-input {
            width: 100%;
            padding: var(--padding-1) var(--padding-2);
            font-size: 13px;
        }

        .filter-item .form-input,
        .sort-item .form-input {
            padding: var(--padding-1) var(--padding-2);
            font-size: 13px;
            border: 1px solid var(--bg-3);
        }

        .remove-btn {
            flex: 0 0 auto;
            padding: var(--padding-1);
            min-width: auto;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius);
            border: none;
            background: transparent;
        }

        .remove-btn img {
            filter: var(--themed-svg);
        }

        .remove-btn:hover {
            background-color: var(--bg-3);
        }

        .add-filter-btn,
        .add-sort-btn {
            align-self: flex-start;
            display: flex;
            align-items: center;
            gap: var(--gap-1);
            font-size: 13px;
            padding: var(--padding-w2);
            background: var(--bg-3);
            border-radius: calc(20 * var(--radius-large));
            border: 2px solid transparent;
            transition: all 0.2s ease;
            font-weight: 500;
        }

        .add-filter-btn:hover,
        .add-sort-btn:hover {
            background: var(--bg-1);
            border-color: var(--fg-1);
        }

        .property-checkboxes {
            display: flex;
            flex-direction: column;
            gap: var(--gap-1);
            padding: var(--padding-2);
            background-color: var(--bg-2);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            max-height: 200px;
            overflow-y: auto;
        }

        .checkbox-label {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-1);
            cursor: pointer;
            border-radius: var(--radius);
            transition: background-color 0.2s ease;
        }

        .checkbox-label:hover {
            background-color: var(--bg-3);
        }

        .checkbox-label input[type='checkbox'] {
            margin: 0;
        }

        .button-group {
            display: flex;
            gap: var(--gap-2);
        }

        .btn-danger {
            background-color: var(--fg-red);
            color: var(--bg-1);
            border: 2px solid var(--fg-red);
        }

        .btn-danger:hover {
            background-color: transparent;
            color: var(--fg-red);
        }

        .danger-section {
            margin-top: var(--gap-4);
            padding-top: var(--gap-3);
        }

        .btn-danger-secondary {
            background-color: var(--bg-3);
            color: var(--fg-red);
            border: none;
            font-size: 13px;
            border-radius: calc(20 * var(--radius-large));
            padding: var(--padding-w2);
            transition: all 0.2s ease;
            width: 100%;
            text-align: center;
            font-weight: 500;
        }

        .btn-danger-secondary:hover {
            background-color: var(--fg-red);
            color: var(--bg-1);
        }

        .btn-danger-secondary img {
            filter: var(--themed-svg);
        }

        .btn-danger-secondary:hover img {
            filter: brightness(0) invert(1);
        }

        /* Tab Interface Styles */
        .edit-view-tabs {
            display: flex;
            margin-bottom: var(--gap-3);
            border-bottom: 1px solid var(--border-1);
        }

        .edit-view-tab {
            padding: var(--padding-w2);
            color: var(--fg-2);
            cursor: pointer;
            position: relative;
            user-select: none;
            border-bottom: 4px solid transparent;
            flex: 1;
            text-align: center;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--gap-1);
        }

        .edit-view-tab:hover {
            color: var(--fg-1);
            background-color: var(--bg-3);
        }

        .edit-view-tab.active {
            color: var(--fg-1);
            border-bottom: 4px solid var(--fg-1);
            background-color: transparent;
        }

        .edit-view-tab img {
            filter: var(--themed-svg);
            width: 16px;
            height: 16px;
        }

        .tab-content {
            flex: 1;
            overflow-y: auto;
            min-height: 0;
        }

        .edit-dialog {
            display: flex;
            flex-direction: column;
            max-height: 85vh;
        }

        @media (max-width: 600px) {
            .filter-item,
            .sort-item {
                flex-direction: column;
                align-items: stretch;
            }

            .filter-property,
            .filter-operator,
            .sort-property,
            .sort-direction {
                flex: none;
                min-width: auto;
            }

            .property-checkboxes {
                max-height: 150px;
            }

            .button-group {
                flex-direction: column;
            }

            .edit-view-tabs {
                flex-direction: row;
            }

            .edit-view-tab {
                font-size: 12px;
                padding: var(--padding-1) var(--padding-2);
            }
        }

        /* Activity Styles */
        .activity-container {
            max-width: 100%;
            overflow-x: auto;
            padding: var(--padding-3);
        }

        .activity-legend {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: var(--gap-1);
            font-size: 12px;
            color: var(--fg-2);
            margin-bottom: var(--gap-2);
            display: none;
        }

        .legend-squares {
            display: flex;
            gap: 2px;
        }

        .legend-square {
            width: 12px;
            height: 12px;
            border: 1px solid var(--border-1);
            border-radius: 2px;
        }

        .activity-grid {
            display: flex;
            flex-direction: column;
            gap: var(--gap-2);
        }

        .activity-calendar {
            display: flex;
            gap: var(--gap-1);
        }

        .activity-weekdays {
            display: flex;
            flex-direction: column;
            gap: 2px;
            margin-top: 20px;
        }

        .weekday-label {
            font-size: 10px;
            color: var(--fg-2);
            text-align: center;
            height: 12px;
            line-height: 12px;
            width: 20px;
        }

        .activity-months-and-days {
            flex: 1;
        }

        .activity-months {
            position: relative;
            height: 20px;
            margin-bottom: var(--gap-1);
        }

        .month-label {
            position: absolute;
            font-size: 11px;
            color: var(--fg-2);
            text-align: left;
            white-space: nowrap;
        }

        .activity-days {
            display: grid;
            grid-template-rows: repeat(7, 1fr);
            grid-auto-flow: column;
            gap: 2px;
            height: calc(7 * 12px + 6 * 2px); /* 7 cells of 12px + 6 gaps of 2px */
        }

        .activity-day {
            width: 100%;
            height: 12px;
            border-radius: 2px;
            border: 1px solid var(--bg-3);
            cursor: pointer;
            position: relative;
        }

        .activity-day.empty {
            visibility: hidden;
        }

        .activity-day.bg-3 {
            background-color: var(--bg-3);
        }

        .activity-day.bg-2 {
            background-color: var(--bg-2);
        }

        .activity-day.fg-3 {
            background-color: var(--fg-3);
            opacity: 0.3;
        }

        .activity-day.fg-2 {
            background-color: var(--fg-2);
            opacity: 0.6;
        }

        .activity-day.fg-1 {
            background-color: var(--fg-1);
            opacity: 0.9;
        }

        .activity-day:hover {
            transform: scale(1.1);
            z-index: 1;
            border-color: var(--fg-1);
        }

        .activity-tooltip {
            position: absolute;
            background: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            padding: var(--padding-2);
            font-size: 12px;
            color: var(--fg-1);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            pointer-events: none;
            white-space: nowrap;
        }

        .activity-navigation {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--gap-2);
        }

        .nav-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border: 1px solid var(--border-1);
            background-color: var(--bg-2);
            color: var(--fg-1);
            border-radius: var(--radius);
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            background: transparent;
        }

        .nav-button:hover:not(:disabled) {
            background-color: var(--bg-3);
        }

        .nav-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .year-display {
            font-size: 16px;
            font-weight: bold;
            color: var(--fg-1);
            min-width: 60px;
            text-align: center;
        }

        @media (max-width: 800px) {
            .activity-calendar {
                overflow-x: auto;
            }

            .activity-days {
                min-width: max-content;
                grid-template-columns: repeat(53, 12px) !important; /* Override dynamic columns */
            }

            .activity-day {
                width: 12px !important;
                height: 12px;
            }
        }
    `;

    // TODO add visibleProperties to most (all?) views
    static properties = {
        title: { type: String },
        entries: { type: Array },
        properties: { type: Array },
        currentView: { type: String },
        editingItem: { type: Object },
        showAddRowForm: { type: Boolean },
        newEntry: { type: Object },
        editingEntry: { type: Object },
        showAddColumnForm: { type: Boolean },
        views: { type: Array },
        currentViewId: { type: String },
        editingEntry: { type: Object },
        editingView: { type: Object },
        activeViewTab: { type: String },
        calendarDate: { type: Object },
        showViewManagement: { type: Boolean },

        newColumnName: { type: String },
        newColumnType: { type: String },
        newColumnOptions: { type: String },

        showEditPropertiesDialog: { type: Boolean },
        editingProperties: { type: Array },
        openedProperty: { type: String },

        currentSlide: { type: Number },
        activityYear: { type: Number },
    };

    constructor() {
        super();
        this.title = '';
        this.entries = [];
        this.properties = [{ name: 'Name', type: 'text', emoji: '📝' }];
        this.views = [{ id: 'table', name: 'Table', type: 'table', filters: [], sorts: [] }];
        this.currentViewId = 'table';
        this.editingEntry = null;
        this.editingView = null;
        this.activeViewTab = 'config';
        this.showViewManagement = true;
        this.editingItem = null;
        this.showAddRowForm = false;
        this.newEntry = {};
        this.editingEntry = null;
        this.draggedItem = null;
        this.showAddColumnForm = false;

        this.newColumnName = '';
        this.newColumnType = 'text';
        this.newColumnOptions = '';

        this.showEditPropertiesDialog = false;
        this.editingProperties = [];
        this.openedProperty = null;

        this.currentTouchedColumn = null;

        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchMoving = false;
        this.draggedElement = null;

        this.currentSlide = 0;
        this.dbIdentifier = '';

        this.bc = new BroadcastChannel('database-broadcast');

        this.listenToEmojiSelector();

        // Bind ESC key handler
        this.handleKeyDown = this.handleKeyDown.bind(this);

        // Bind theme change handler
        this.handleThemeChange = this.handleThemeChange.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('wisk-theme-changed', this.handleThemeChange);

        this.bc.addEventListener('message', event => {
            const { id, instance } = event.data;
            if (id === this.dbIdentifier && instance !== wisk.sync.instance) {
                wisk.db.getDatabase(this.dbIdentifier).then(data => {
                    if (data) {
                        if (data.title) this.title = data.title;
                        if (data.entries) this.entries = [...data.entries];
                        if (data.properties) this.properties = [...data.properties];
                        if (data.views) this.views = [...data.views];
                        if (data.lastView) this.currentViewId = data.lastView;
                        if (data.viewManagementVisibility !== undefined) this.showViewManagement = data.viewManagementVisibility;
                        this.requestUpdate();
                    }
                });
            }
        });

        // Start autoplay if in carousel mode
        if (this.currentView?.type === 'carousel') {
            this.startCarouselAutoplay();
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('wisk-theme-changed', this.handleThemeChange);
        this.stopCarouselAutoplay();
        if (this.bc) {
            this.bc.close();
        }
    }

    handleKeyDown(event) {
        if (event.key === 'Escape' && this.editingView) {
            event.preventDefault();
            this.editingView = null;
            this.requestUpdate();
        }
    }

    handleThemeChange() {
        this.requestUpdate();
    }

    async switchTabWithAnimation(newTab) {
        if (this.activeViewTab === newTab) return;

        const dialog = this.shadowRoot.querySelector('.edit-dialog');
        if (!dialog) return;

        // Capture current height
        const currentHeight = dialog.offsetHeight;

        // Set explicit height to current height
        dialog.style.height = currentHeight + 'px';
        dialog.style.transition = 'none';

        // Switch tab content
        this.activeViewTab = newTab;
        await this.updateComplete;

        // Measure new height by temporarily removing explicit height
        dialog.style.height = 'auto';
        const newHeight = dialog.offsetHeight;

        // Set back to current height and prepare for animation
        dialog.style.height = currentHeight + 'px';
        dialog.style.transition = 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1)';

        // Animate to new height
        requestAnimationFrame(() => {
            dialog.style.height = newHeight + 'px';
        });

        // Clean up after animation
        setTimeout(() => {
            dialog.style.height = '';
            dialog.style.transition = '';
        }, 250);
    }

    async aboutToBeOoomfed() {
        // delete pages and db data
        for (const entry of this.entries) {
            if (entry.pageId) {
                await wisk.db.removePage(entry.pageId);
            }
        }
        await wisk.db.removeDatabase(this.dbIdentifier);
    }

    listenToEmojiSelector() {
        const emojiSelector = document.querySelector('emoji-selector');
        if (emojiSelector) {
            window.addEventListener('emoji-selector', event => {
                if (this.openedProperty != null && event.detail.id == this.id) {
                    const selectedEmoji = event.detail.emoji;
                    // index == openedProperty
                    this.editingProperties = this.editingProperties.map((prop, index) => {
                        if (index === this.openedProperty) {
                            return { ...prop, emoji: selectedEmoji };
                        }
                        return prop;
                    });

                    this.requestUpdate();
                }
            });
        }
    }

    toggleAddColumnForm() {
        this.showAddColumnForm = !this.showAddColumnForm;
    }

    get currentView() {
        return this.views.find(view => view.id === this.currentViewId);
    }

    setValue(identifier, value) {
        if (value.dbIdentifier) {
            this.dbIdentifier = value.dbIdentifier;
        } else {
            this.dbIdentifier = 'db-' + Math.random().toString(36).substring(2, 15);
        }

        wisk.db.getDatabase(value.dbIdentifier).then(data => {
            if (data) {
                console.log('Data:', data);
                if (data.title) this.title = data.title;
                if (data.entries) this.entries = [...data.entries];
                if (data.properties) this.properties = [...data.properties];
                if (data.views) this.views = [...data.views];
                if (data.lastView) this.currentViewId = data.lastView;
                if (data.viewManagementVisibility !== undefined) this.showViewManagement = data.viewManagementVisibility;
            } else {
                this.onUpdate();
            }
        });
    }

    getValue() {
        return {
            dbIdentifier: this.dbIdentifier,
        };
    }

    getDBValue() {
        return {
            title: this.title,
            entries: this.entries,
            properties: this.properties,
            views: this.views,
            lastView: this.currentViewId,
            viewManagementVisibility: this.showViewManagement,
        };
    }

    applyFiltersAndSorts(entries) {
        let filteredEntries = entries;

        // Apply filters
        this.currentView.filters.forEach(filter => {
            filteredEntries = filteredEntries.filter(entry => {
                const value = entry[filter.property];
                switch (filter.operator) {
                    case 'equals':
                        return value === filter.value;
                    case 'contains':
                        if (Array.isArray(value)) {
                            return value.includes(filter.value);
                        }
                        return value.toString().toLowerCase().includes(filter.value.toLowerCase());
                    case 'greater_than':
                        return new Date(value) > new Date(filter.value);
                    case 'less_than':
                        return new Date(value) < new Date(filter.value);
                    default:
                        return true;
                }
            });
        });

        // Apply sorts
        this.currentView.sorts.forEach(sort => {
            filteredEntries.sort((a, b) => {
                let valueA = a[sort.property];
                let valueB = b[sort.property];

                // Handle date comparison
                if (this.properties.find(p => p.name === sort.property).type === 'date') {
                    valueA = new Date(valueA);
                    valueB = new Date(valueB);
                }

                if (valueA < valueB) return sort.direction === 'asc' ? -1 : 1;
                if (valueA > valueB) return sort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        });

        return filteredEntries;
    }

    changeMonth(delta) {
        if (!this.calendarDate) {
            this.calendarDate = new Date();
        }
        this.calendarDate.setMonth(this.calendarDate.getMonth() + delta);
        this.requestUpdate();
    }

    addNewEntry(year, month, day) {
        const dateProperty = this.currentView.dateProperty || 'date';
        // Create a date in the local timezone
        const date = new Date(year, month, day);
        // Format the date as YYYY-MM-DD
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        const newEntry = {
            id: 'temp_' + Date.now(),
            title: 'New Entry',
            [dateProperty]: formattedDate,
        };
        this.startEditing(newEntry);
    }

    onUpdate() {
        wisk.editor.justUpdates(this.id);
        wisk.db.setDatabase(this.dbIdentifier, this.getDBValue());
    }

    startEditing(entry) {
        // Create a deep copy of the entry
        this.editingEntry = JSON.parse(JSON.stringify(entry));

        // Ensure all properties exist in the editing entry
        this.properties.forEach(prop => {
            if (!(prop.name in this.editingEntry)) {
                // Initialize missing properties with default values
                this.editingEntry[prop.name] = prop.type === 'checkbox' ? false : prop.type === 'multi-select' ? [] : '';
            }
        });

        this.requestUpdate();
    }

    saveEdit() {
        if (this.editingEntry.id.toString().startsWith('temp_')) {
            // It's a new entry, assign a real id and add it to entries
            this.editingEntry.id = Date.now();
            this.entries = [...this.entries, this.editingEntry];
        } else {
            // It's an existing entry, update it
            const index = this.entries.findIndex(e => e.id === this.editingEntry.id);
            if (index !== -1) {
                this.entries = [...this.entries.slice(0, index), this.editingEntry, ...this.entries.slice(index + 1)];
            }
        }
        this.editingEntry = null;
        this.requestUpdate();
        this.onUpdate();
    }

    cancelEdit() {
        this.editingEntry = null;
        this.requestUpdate();
    }

    updateEditingEntry(propertyName, value) {
        this.editingEntry = { ...this.editingEntry, [propertyName]: value };
    }

    openDatabasePage() {
        if (this.editingEntry && this.editingEntry.pageId) {
            document.querySelector('database-page').show(`/?id=${this.editingEntry.pageId}&zen=true`);
        }
    }

    openPage() {
        if (this.editingEntry && this.editingEntry.pageId) {
            // open in new tab
            const url = `/?id=${this.editingEntry.pageId}`;
            window.open(url, '_blank');
        }
    }

    renderEditDialog() {
        if (!this.editingEntry) return null;

        return html`
            <div class="dialog-overlay"></div>
            <div class="dialog">
                <div style="display: flex; justify-content: space-between; align-items: center">
                    <h2>Edit Entry</h2>
                    <div style="display: flex; gap: var(--gap-2); align-items: center">
                        <button @click="${this.openDatabasePage}" class="edit-dialog-btns">
                            <img src="/a7/forget/expand.svg" alt="Open Page" />
                        </button>

                        <button @click="${this.openPage}" class="edit-dialog-btns">
                            <img src="/a7/forget/open-3.svg" alt="Open Page" />
                        </button>
                    </div>
                </div>

                ${this.properties.map(prop => {
                    const id = `edit-prop-${prop.name.replace(/\s+/g, '-').toLowerCase()}`;
                    let control;

                    switch (prop.type) {
                        case 'text':
                        case 'number':
                        case 'url':
                        case 'email':
                        case 'phone':
                            control = html`
                                <jalebi-input
                                    id="${id}"
                                    type="${prop.type === 'phone' ? 'tel' : prop.type}"
                                    placeholder="${prop.name}"
                                    .value="${this.editingEntry[prop.name] || ''}"
                                    @input="${e =>
                                        this.updateEditingEntry(
                                            prop.name,
                                            prop.type === 'number' ? (e.target.value === '' ? null : parseFloat(e.target.value)) : e.target.value
                                        )}"
                                ></jalebi-input>
                            `;
                            break;

                        case 'select':
                            control = html`
                                <jalebi-select
                                    id="${id}"
                                    @change="${e => this.updateEditingEntry(prop.name, e.target.value)}"
                                    value="${this.editingEntry[prop.name] || ''}"
                                >
                                    <option value="" ?selected="${!this.editingEntry[prop.name]}">Select an option</option>
                                    ${prop.options.map(option => html` <option value="${option}">${option}</option> `)}
                                </jalebi-select>
                            `;
                            break;

                        case 'multi-select':
                            control = html`
                                <jalebi-multiselect
                                    id="${id}"
                                    value="${(this.editingEntry[prop.name] || []).join(',')}"
                                    @change="${e => this.updateEditingEntry(prop.name, e.target.values)}"
                                >
                                    ${prop.options.map(option => html` <option value="${option}">${option}</option> `)}
                                </jalebi-multiselect>
                            `;
                            break;

                        case 'checkbox':
                            control = html`
                                <jalebi-checkbox
                                    id="${id}"
                                    ?checked="${this.editingEntry[prop.name] || false}"
                                    @change="${e => this.updateEditingEntry(prop.name, e.target.checked)}"
                                ></jalebi-checkbox>
                            `;
                            break;

                        case 'date':
                            control = html`
                                <jalebi-datepicker
                                    id="${id}"
                                    placeholder="YYYY-MM-DD"
                                    .value="${this.editingEntry[prop.name] || ''}"
                                    @change="${e => this.updateEditingEntry(prop.name, e.detail.value || null)}"
                                ></jalebi-datepicker>
                            `;
                            break;

                        case 'datetime-local':
                            control = html`
                                <jalebi-datetimepicker
                                    id="${id}"
                                    .value="${this.editingEntry[prop.name] || ''}"
                                    @change="${e => this.updateEditingEntry(prop.name, e.detail.value || null)}"
                                ></jalebi-datetimepicker>
                            `;
                            break;

                        default:
                            control = html` <span>${this.editingEntry[prop.name] || ''}</span> `;
                    }

                    return html`
                        <div class="db-prop">
                            <label for="${id}"> ${prop.emoji ? html`${prop.emoji} ` : ''}${prop.name} </label>
                            ${control}
                        </div>
                    `;
                })}
                <div class="dialog-buttons">
                    ${this.editingEntry.id.toString().startsWith('temp_')
                        ? html``
                        : html`<button class="delete-button" @click=${this.deleteEntry}>Delete Entry</button>`}
                    <div>
                        <button @click=${this.cancelEdit}>Cancel</button>
                        <button @click=${this.saveEdit}>Save</button>
                    </div>
                </div>
            </div>
        `;
    }

    async deleteEntry() {
        // remove page
        await wisk.db.removePage(this.editingEntry.pageId);

        if (confirm('Are you sure you want to delete this entry?')) {
            this.entries = this.entries.filter(entry => entry.id !== this.editingEntry.id);
            this.editingEntry = null;
            this.requestUpdate();
            this.onUpdate();
        }
    }

    toggleAddRowForm() {
        this.showAddRowForm = !this.showAddRowForm;
        if (this.showAddRowForm) {
            this.newEntry = this.properties.reduce((acc, prop) => {
                acc[prop.name] = prop.type === 'checkbox' ? false : '';
                return acc;
            }, {});
        }
    }

    updateNewEntry(propertyName, value) {
        this.newEntry = { ...this.newEntry, [propertyName]: value };
    }

    startEditingItem(entryId) {
        this.editingItem = this.entries.find(entry => entry.id === entryId);
    }

    async addNewRow() {
        // create page with config
        var id = Math.random().toString(36).substring(2, 12).toUpperCase();
        id = wisk.editor.pageId + '.' + id;
        await wisk.db.setPage(id, {
            id: id,
            lastUpdated: Date.now(),
            data: {
                config: {
                    plugins: [],
                    theme: 'default',
                    access: [],
                    public: false,
                    name: this.newEntry.Title || this.newEntry.Name || this.newEntry.title || this.newEntry.name || 'Empty Page',
                    databaseProps: {
                        identifier: this.dbIdentifier,
                    },
                },
                elements: [
                    {
                        id: 'abcdxyz',
                        component: 'main-element',
                        value: {
                            textContent: this.newEntry.Title || this.newEntry.Name || this.newEntry.title || this.newEntry.name || 'Empty Page',
                        },
                        lastUpdated: Date.now(),
                    },
                ],
                deletedElements: [],
                pluginData: {},
                sync: {
                    syncLogs: [],
                    isPushed: false,
                    lastSync: 0,
                },
            },
        });

        this.newEntry.pageId = id;
        const newId = Math.random().toString(36).substring(2, 12).toUpperCase();
        this.entries = [...this.entries, { id: newId, ...this.newEntry }];
        this.toggleAddRowForm();
        this.requestUpdate();
        this.onUpdate();
    }

    renderAddRowForm() {
        return html` <button @click=${this.toggleAddRowForm} class="full-width-button">+ Add New Row</button> `;
    }

    renderAddRowDialog() {
        if (!this.showAddRowForm) return '';

        return html`
            <div class="dialog-overlay"></div>

            <div class="dialog">
                <h2>Add New Row</h2>
                ${this.properties.map(
                    prop => html`
                        <label> ${prop.name}: ${this.renderEditableCell({ id: 'new' }, prop, value => this.updateNewEntry(prop.name, value))} </label>
                    `
                )}
                <div class="dialog-buttons">
                    <div></div>
                    <div>
                        <button @click=${this.toggleAddRowForm}>Cancel</button>
                        <button @click=${this.addNewRow}>Save</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderEditableCell(entry, prop, updateCallback = null) {
        const value = entry[prop.name];
        const onChange = e => {
            const newValue = prop.type === 'checkbox' ? e.target.checked : e.target.value;
            if (updateCallback) {
                updateCallback(newValue);
            } else {
                entry[prop.name] = newValue;
                this.requestUpdate();
            }
        };

        switch (prop.type) {
            case 'text':
            case 'number':
            case 'url':
            case 'email':
            case 'phone':
                return html`<input type="${prop.type}" .value=${value} @input=${onChange} />`;
            case 'select':
                return html`
                    <select .value=${value} @change=${onChange}>
                        <option value="" disabled selected=${value === ''}>Select an option</option>
                        ${prop.options.map(option => html` <option value="${option}" ?selected=${value === option}>${option}</option> `)}
                    </select>
                `;
            case 'multi-select':
                return html`
                    <select
                        multiple
                        .value=${value || []}
                        @change=${e => {
                            const newValue = Array.from(e.target.selectedOptions).map(option => option.value);
                            if (updateCallback) {
                                updateCallback(newValue);
                            } else {
                                entry[prop.name] = newValue;
                                this.requestUpdate();
                            }
                        }}
                    >
                        ${prop.options.map(
                            option => html` <option value="${option}" ?selected=${value && value.includes(option)}>${option}</option> `
                        )}
                    </select>
                `;
            case 'date':
            case 'datetime-local':
                return html`<input type="${prop.type}" .value=${value} @input=${onChange} />`;
            case 'checkbox':
                return html`<input type="checkbox" ?checked=${value} @change=${onChange} />`;
            default:
                return html`<span>${value}</span>`;
        }
    }

    handleDragStart(e, entry) {
        this.draggedItem = entry;
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }

    handleDrop(e, newGroup) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        if (this.draggedItem) {
            const groupByProperty = this.currentView.groupBy || 'status';
            const updatedEntry = { ...this.draggedItem, [groupByProperty]: newGroup };
            const index = this.entries.findIndex(entry => entry.id === this.draggedItem.id);
            if (index !== -1) {
                this.entries = [...this.entries.slice(0, index), updatedEntry, ...this.entries.slice(index + 1)];
                this.requestUpdate();
                this.onUpdate();
            }
        }
        this.draggedItem = null;
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        // Always ensure autoplay is running if in carousel mode
        if (this.currentView?.type === 'carousel') {
            this.startCarouselAutoplay();
        } else {
            this.stopCarouselAutoplay();
        }
    }

    renderAddColumnDialog() {
        if (!this.showAddColumnForm) return '';

        return html`
            <div class="dialog-overlay"></div>

            <div class="dialog">
                <h2>Add New Column</h2>
                <label>
                    Column Name:
                    <input id="newColumnName" type="text" .value=${this.newColumnName || ''} @input=${e => (this.newColumnName = e.target.value)} />
                </label>
                <label>
                    Column Type:
                    <select id="newColumnType" .value=${this.newColumnType || 'text'} @change=${this.handleNewColumnTypeChange}>
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="select">Select</option>
                        <option value="multi-select">Multi-select</option>
                        <option value="date">Date</option>
                        <option value="datetime-local">DateTime</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="url">URL</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                    </select>
                </label>
                ${this.renderColumnTypeSpecificFields()}
                <div class="dialog-buttons">
                    <div></div>
                    <div>
                        <button @click=${this.toggleAddColumnForm}>Cancel</button>
                        <button @click=${this.addNewColumn}>Add Column</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderColumnTypeSpecificFields() {
        if (this.newColumnType === 'select' || this.newColumnType === 'multi-select') {
            return html`
                <label>
                    Options (comma-separated):
                    <input type="text" .value=${this.newColumnOptions || ''} @input=${e => (this.newColumnOptions = e.target.value)} />
                </label>
            `;
        }
        return '';
    }

    handleNewColumnTypeChange(e) {
        this.newColumnType = e.target.value;
        this.newColumnOptions = ''; // Reset options when type changes
        this.requestUpdate();
    }

    addNewColumn() {
        if (this.newColumnName && this.newColumnType) {
            let newColumn = { name: this.newColumnName, type: this.newColumnType };
            if (this.newColumnType === 'select' || this.newColumnType === 'multi-select') {
                newColumn.options = this.newColumnOptions.split(',').map(option => option.trim());
            }
            this.properties = [...this.properties, newColumn];
            this.entries = this.entries.map(entry => ({ ...entry, [this.newColumnName]: '' }));
            this.toggleAddColumnForm();
            this.newColumnName = '';
            this.newColumnType = 'text';
            this.newColumnOptions = '';
            this.requestUpdate();
            this.onUpdate();
        }
    }

    renderAddColumnForm() {
        return html`
            <div class="add-column-form">
                <h3>Add New Column</h3>
                <input id="newColumnName" type="text" placeholder="Column Name" />
                <select id="newColumnType">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="select">Select</option>
                    <option value="multi-select">Multi-select</option>
                    <option value="date">Date</option>
                    <option value="datetime-local">DateTime</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="url">URL</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                </select>
                <button @click=${this.addNewColumn}>Add Column</button>
            </div>
        `;
    }

    renderViewManagement() {
        return html`
            <div class="name-input">
                <input
                    @input=${e => {
                        this.title = e.target.value;
                        this.onUpdate();
                    }}
                    type="text"
                    placeholder="Database Title"
                    .value=${this.title}
                />
                <button class="dropdown-arrow ${this.showViewManagement ? 'expanded' : ''}" @click=${this.toggleViewManagement}>
                    <img src="/a7/plugins/database-element/right.svg" class="plugin-icon" alt="Toggle view management" />
                </button>
            </div>
            ${this.showViewManagement
                ? html`<div class="view-management">
                      <div class="view-tabs">
                          ${this.views.map(
                              view => html`
                                  <button
                                      class="view-tab ${this.currentViewId === view.id ? 'active' : ''}"
                                      @click=${() => {
                                          this.currentViewId = view.id;
                                          this.onUpdate();
                                      }}
                                  >
                                      ${view.name}
                                  </button>
                              `
                          )}
                          <button class="view-tab add-view plugin-icon-button" @click=${this.createNewView}>
                              <img src="/a7/plugins/database-element/plus.svg" class="plugin-icon" alt="Add view" />
                          </button>

                          <div style="flex-grow: 1"></div>

                          <button @click=${() => (this.editingView = { ...this.currentView })} class="plugin-icon-button">
                              <img src="/a7/plugins/database-element/edit.svg" class="plugin-icon" alt="Edit view" />
                          </button>
                          <button @click=${this.toggleEditPropertiesDialog} class="plugin-icon-button">
                              <img src="/a7/plugins/database-element/properties.svg" class="plugin-icon" alt="Edit properties" />
                          </button>
                      </div>
                      ${this.renderFilterSortPanel()}
                  </div>`
                : ''}
        `;
    }

    renderEditPropertiesDialog() {
        if (!this.showEditPropertiesDialog) return '';

        return html`
            <div class="edit-dialog-overlay"></div>

            <div class="edit-dialog">
                <h2 class="edit-dialog-title">Edit Properties</h2>

                <div class="properties-accordion">
                    ${this.editingProperties.map(
                        (prop, index) => html`
                            <div class="property-accordion-item">
                                <div
                                    class="property-list-item ${prop.removed ? 'removed' : ''}"
                                    @click=${() => !prop.removed && this.togglePropertyExpansion(index)}
                                >
                                    <div class="property-main-content">
                                        <span class="emoji" style="${prop.emoji ? '' : 'display: none;'}">${prop.emoji}</span>
                                        <span class="property-name">${prop.name}</span>
                                        <span class="property-type">${prop.type}</span>
                                    </div>
                                    ${prop.removed
                                        ? html`<button
                                              class="property-expand-btn"
                                              @click=${e => {
                                                  e.stopPropagation();
                                                  this.restoreProperty(index);
                                              }}
                                              title="Restore Property"
                                          >
                                              <img src="/a7/plugins/database-element/restore.svg" alt="Restore" />
                                          </button>`
                                        : html`<button
                                              class="property-expand-btn"
                                              @click=${e => {
                                                  e.stopPropagation();
                                                  this.togglePropertyExpansion(index);
                                              }}
                                              title="Edit Property"
                                          >
                                              <img
                                                  src="/a7/plugins/database-element/${this.openedProperty === index ? 'down' : 'right'}.svg"
                                                  alt="${this.openedProperty === index ? 'Collapse' : 'Expand'}"
                                              />
                                          </button>`}
                                </div>

                                <!-- Always render the edit content for smooth animation -->
                                ${!prop.removed
                                    ? html`
                                          <div class="property-edit-content ${this.openedProperty === index ? 'expanded' : ''}">
                                              <div class="property-edit-form">
                                                  <div class="edit-form-group" style="flex-direction: row; align-items: center;">
                                                      <label
                                                          class="edit-form-emoji"
                                                          @click=${() => document.querySelector('emoji-selector').show(this.id)}
                                                          >${!this.editingProperties[index].emoji || this.editingProperties[index].emoji == ''
                                                              ? ':3'
                                                              : this.editingProperties[index].emoji}</label
                                                      >
                                                      <input
                                                          class="edit-form-input"
                                                          type="text"
                                                          placeholder="Property Name"
                                                          .value=${this.editingProperties[index].name}
                                                          @input=${e => this.updatePropertyName(index, e.target.value)}
                                                      />
                                                  </div>
                                                  <div class="edit-form-group">
                                                      <label class="edit-form-label">Type</label>
                                                      <select
                                                          class="edit-form-select"
                                                          .value=${this.editingProperties[index].type}
                                                          @change=${e => this.updatePropertyType(index, e.target.value)}
                                                      >
                                                          <option value="text">Text</option>
                                                          <option value="number">Number</option>
                                                          <option value="select">Select</option>
                                                          <option value="multi-select">Multi-select</option>
                                                          <option value="date">Date</option>
                                                          <option value="datetime-local">DateTime</option>
                                                          <option value="checkbox">Checkbox</option>
                                                          <option value="url">URL</option>
                                                          <option value="email">Email</option>
                                                          <option value="phone">Phone</option>
                                                      </select>
                                                  </div>
                                                  ${this.editingProperties[index].type === 'select' ||
                                                  this.editingProperties[index].type === 'multi-select'
                                                      ? html`
                                                            <div class="edit-form-group">
                                                                <label class="edit-form-label">Options</label>
                                                                <input
                                                                    class="edit-form-input"
                                                                    type="text"
                                                                    placeholder="Options (comma-separated)"
                                                                    .value=${this.editingProperties[index].options
                                                                        ? this.editingProperties[index].options.join(', ')
                                                                        : ''}
                                                                    @input=${e => this.updatePropertyOptions(index, e.target.value)}
                                                                />
                                                            </div>
                                                        `
                                                      : ''}

                                                  <!-- Remove Button -->
                                                  <div style="margin-top: var(--gap-3)">
                                                      <button
                                                          class="edit-button"
                                                          style="color: var(--fg-red); border-color: var(--fg-red);"
                                                          @click=${() => {
                                                              if (this.properties.length <= 1) {
                                                                  wisk.utils.showToast('Cannot remove the last property');
                                                                  return;
                                                              }
                                                              this.removeProperty(index);
                                                          }}
                                                      >
                                                          Remove Property
                                                      </button>
                                                  </div>
                                              </div>
                                          </div>
                                      `
                                    : ''}
                            </div>
                        `
                    )}
                </div>

                <div class="dialog-footer">
                    <button class="add-property-button" @click=${this.addNewProperty}>+ Add New Property</button>
                </div>

                <div class="edit-dialog-buttons">
                    <button class="edit-button" @click=${this.toggleEditPropertiesDialog}>Cancel</button>
                    <button class="edit-button edit-button-primary" @click=${this.saveProperties}>Save</button>
                </div>
            </div>
        `;
    }

    toggleViewManagement() {
        this.showViewManagement = !this.showViewManagement;
        this.onUpdate();
    }

    toggleEditPropertiesDialog() {
        this.openedProperty = null;
        this.showEditPropertiesDialog = !this.showEditPropertiesDialog;
        if (this.showEditPropertiesDialog) {
            this.editingProperties = JSON.parse(JSON.stringify(this.properties));
            // Add ESC key listener when dialog opens
            document.addEventListener('keydown', this.handleEscapeKey);
        } else {
            // Remove ESC key listener when dialog closes
            document.removeEventListener('keydown', this.handleEscapeKey);
        }
        this.requestUpdate();
    }

    handleEscapeKey = event => {
        if (event.key === 'Escape' && this.showEditPropertiesDialog) {
            this.toggleEditPropertiesDialog();
        }
    };

    togglePropertyExpansion(index) {
        if (this.openedProperty === index) {
            this.openedProperty = null;
        } else {
            this.openedProperty = index;
        }
        this.requestUpdate();
    }

    updatePropertyName(index, newName) {
        this.editingProperties[index].name = newName;
        this.requestUpdate();
    }

    updatePropertyType(index, newType) {
        this.editingProperties[index].type = newType;
        if (newType === 'select' || newType === 'multi-select') {
            this.editingProperties[index].options = this.editingProperties[index].options || [];
        } else {
            delete this.editingProperties[index].options;
        }
        this.requestUpdate();
    }

    updatePropertyOptions(index, optionsString) {
        this.editingProperties[index].options = optionsString.split(',').map(opt => opt.trim());
        this.requestUpdate();
    }

    removeProperty(index) {
        const propertyName = this.editingProperties[index].name;
        const dependencyMessage = this.checkPropertyDependencies(propertyName);

        if (dependencyMessage) {
            wisk.utils.showToast(`Cannot remove property: ${dependencyMessage}`);
            return;
        }

        // Instead of splicing, mark the property as removed
        this.editingProperties[index].removed = true;
        this.requestUpdate();
    }

    restoreProperty(index) {
        delete this.editingProperties[index].removed;
        this.requestUpdate();
    }

    // TODO improve this to check all views and props
    checkPropertyDependencies(propertyName) {
        for (let view of this.views) {
            // Check if the property is used in groupBy (for kanban views)
            if (view.groupBy === propertyName) {
                return `Property "${propertyName}" is used for grouping in view "${view.name}"`;
            }

            // Check if the property is used in dateProperty (for calendar views)
            if (view.dateProperty === propertyName) {
                return `Property "${propertyName}" is used as the date property in view "${view.name}"`;
            }

            // Check if the property is used in visibleProperties (for list views)
            if (view.visibleProperties && view.visibleProperties.includes(propertyName)) {
                return `Property "${propertyName}" is visible in list view "${view.name}"`;
            }

            // Check if the property is used in filters
            for (let filter of view.filters || []) {
                if (filter.property === propertyName) {
                    return `Property "${propertyName}" is used in a filter in view "${view.name}"`;
                }
            }

            // Check if the property is used in sorts
            for (let sort of view.sorts || []) {
                if (sort.property === propertyName) {
                    return `Property "${propertyName}" is used for sorting in view "${view.name}"`;
                }
            }
        }

        return null; // No dependencies found
    }

    addNewProperty() {
        const newPropName = `New Property ${this.editingProperties.length + 1}`;
        const randomEmoji = document.querySelector('emoji-selector')?.randomEmoji() || '📝';
        const newProperty = {
            name: newPropName,
            type: 'text',
            emoji: randomEmoji,
        };
        this.editingProperties.push(newProperty);

        // Use the same logic as addNewColumn
        this.entries = this.entries.map(entry => ({ ...entry, [newPropName]: '' }));

        // Automatically expand the newly created property
        this.openedProperty = this.editingProperties.length - 1;

        this.requestUpdate();
    }

    saveProperties() {
        this.openedProperty = null;
        // Filter out removed properties
        const newProperties = this.editingProperties.filter(prop => !prop.removed);

        // Check for removed properties
        const removedProperties = this.properties.filter(prop => !newProperties.some(newProp => newProp.name === prop.name));

        for (let removedProp of removedProperties) {
            const dependencyMessage = this.checkPropertyDependencies(removedProp.name);
            if (dependencyMessage) {
                wisk.utils.showToast(`Cannot remove property "${removedProp.name}": ${dependencyMessage}`);
                return;
            }
        }

        // If we've made it here, it's safe to save
        this.properties = newProperties;

        // Update entries to ensure all properties exist
        this.entries = this.entries.map(entry => {
            const newEntry = { ...entry };
            for (let prop of this.properties) {
                if (!(prop.name in newEntry)) {
                    // Initialize new properties with default values
                    newEntry[prop.name] = prop.type === 'checkbox' ? false : prop.type === 'multi-select' ? [] : '';
                }
            }
            // Remove properties that no longer exist
            Object.keys(newEntry).forEach(key => {
                if (!this.properties.some(prop => prop.name === key) && key !== 'id' && key !== 'pageId') {
                    delete newEntry[key];
                }
            });
            return newEntry;
        });

        this.showEditPropertiesDialog = false;
        this.requestUpdate();
        this.onUpdate();
    }

    renderFilterSortPanel() {
        return;

        if (!this.currentView) return '';
        return html`
            <div class="filter-sort-panel">
                <h4>Filters</h4>
                ${this.currentView.filters.map(
                    (filter, index) => html`
                        <div>
                            ${filter.property} ${filter.operator} ${filter.value}
                            <button @click=${() => this.removeFilter(index)}>Remove</button>
                        </div>
                    `
                )}
                <button @click=${this.addFilter}>Add Filter</button>

                <h4>Sorts</h4>
                ${this.currentView.sorts.map(
                    (sort, index) => html`
                        <div>
                            ${sort.property} (${sort.direction})
                            <button @click=${() => this.removeSort(index)}>Remove</button>
                        </div>
                    `
                )}
                <button @click=${this.addSort}>Add Sort</button>
            </div>
        `;
    }

    createNewView() {
        const newView = {
            id: `view-${Date.now()}`,
            name: `New View ${this.views.length + 1}`,
            type: 'table',
            filters: [],
            sorts: [],
            visibleProperties: [],
        };

        this.views = [...this.views, newView];
        this.currentViewId = newView.id;
        this.editingView = { ...newView };
        this.activeViewTab = 'config';
        this.requestUpdate();
        this.onUpdate();
    }

    deleteCurrentView() {
        if (this.views.length <= 1) {
            wisk.utils.showToast('You cannot delete the last view.');
            return;
        }
        if (confirm('Are you sure you want to delete this view?') && this.editingView) {
            this.views = this.views.filter(view => view.id !== this.editingView.id);
            this.currentViewId = this.views.length > 0 ? this.views[0].id : 'default-table';
            this.editingView = null;
            this.requestUpdate();
            this.onUpdate();
        }
    }

    addFilter() {
        if (!this.editingView) this.editingView = { ...this.currentView };
        this.editingView.filters = [...this.editingView.filters, { property: this.properties[0].name, operator: 'equals', value: '' }];
        this.requestUpdate();
    }

    removeFilter(index) {
        if (!this.editingView) this.editingView = { ...this.currentView };
        this.editingView.filters = this.editingView.filters.filter((_, i) => i !== index);
        this.requestUpdate();
    }

    addSort() {
        if (!this.editingView) this.editingView = { ...this.currentView };
        this.editingView.sorts = [...this.editingView.sorts, { property: this.properties[0].name, direction: 'asc' }];
        this.requestUpdate();
    }

    removeSort(index) {
        if (!this.editingView) this.editingView = { ...this.currentView };
        this.editingView.sorts = this.editingView.sorts.filter((_, i) => i !== index);
        this.requestUpdate();
    }

    saveEditView() {
        const index = this.views.findIndex(view => view.id === this.editingView.id);
        if (index !== -1) {
            this.views = [...this.views.slice(0, index), this.editingView, ...this.views.slice(index + 1)];
        } else {
            this.views = [...this.views, this.editingView];
        }
        this.currentViewId = this.editingView.id;
        this.editingView = null;
        this.onUpdate();
        this.requestUpdate();
    }

    renderEditViewDialog() {
        if (!this.editingView) return '';
        return html`
            <div class="edit-dialog-overlay"></div>
            <div class="edit-dialog">
                <h2 class="edit-dialog-title">Edit View</h2>

                <!-- Tab Navigation -->
                <div class="edit-view-tabs">
                    <div
                        class="edit-view-tab ${this.activeViewTab === 'config' ? 'active' : ''}"
                        @click=${() => this.switchTabWithAnimation('config')}
                    >
                        <img src="/a7/plugins/database-element/config.svg" />
                        Config
                    </div>
                    <div
                        class="edit-view-tab ${this.activeViewTab === 'filter' ? 'active' : ''}"
                        @click=${() => this.switchTabWithAnimation('filter')}
                    >
                        <img src="/a7/plugins/database-element/filter.svg" />
                        Filter
                    </div>
                    <div class="edit-view-tab ${this.activeViewTab === 'sort' ? 'active' : ''}" @click=${() => this.switchTabWithAnimation('sort')}>
                        <img src="/a7/plugins/database-element/sort.svg" />
                        Sort
                    </div>
                </div>

                <!-- Tab Content -->
                <div class="tab-content">
                    ${this.activeViewTab === 'config'
                        ? this.renderConfigTab()
                        : this.activeViewTab === 'filter'
                          ? this.renderFilterTab()
                          : this.renderSortTab()}
                </div>

                <div class="edit-dialog-buttons">
                    <div class="button-group">
                        <button class="edit-button" @click=${() => (this.editingView = null)}>Cancel</button>
                        <button class="edit-button edit-button-primary" @click=${this.saveEditView}>Save</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderConfigTab() {
        return html`
            <div class="view-basic-settings">
                <div class="form-group">
                    <label class="form-label">View Name</label>
                    <input type="text" class="form-input" .value=${this.editingView.name} @input=${e => (this.editingView.name = e.target.value)} />
                </div>

                <div class="form-group">
                    <label class="form-label">View Type</label>
                    <select
                        class="form-input"
                        .value=${this.editingView.type}
                        @change=${e => {
                            this.editingView.type = e.target.value;
                            if (e.target.value === 'kanban' && !this.editingView.groupBy) {
                                this.editingView.groupBy = this.properties[0].name;
                            }
                            if (e.target.value === 'calendar' && !this.editingView.dateProperty) {
                                this.editingView.dateProperty = this.properties.find(p => p.type === 'date')?.name || this.properties[0].name;
                            }
                            if (e.target.value === 'list' && !this.editingView.visibleProperties) {
                                this.editingView.visibleProperties = [this.properties[0].name];
                            }
                            if (e.target.value === 'carousel' && !this.editingView.visibleProperties) {
                                this.editingView.visibleProperties = [this.properties[0].name];
                            }
                            if (e.target.value === 'gallery' && !this.editingView.visibleProperties) {
                                this.editingView.visibleProperties = [this.properties[0].name];
                            }
                            this.requestUpdate();
                        }}
                    >
                        <option value="table">Table</option>
                        <option value="kanban">Kanban</option>
                        <option value="calendar">Calendar</option>
                        <option value="gallery">Gallery</option>
                        <option value="list">List</option>
                        <option value="timeline">Timeline</option>
                        <option value="carousel">Carousel</option>
                        <option value="matrix">Matrix</option>
                        <option value="activity">Activity</option>
                    </select>
                </div>
            </div>

            <div class="view-configuration">
                ${this.editingView.type === 'matrix'
                    ? html`
                          <div class="form-group">
                              <label class="form-label">X Axis Property</label>
                              <select
                                  class="form-input"
                                  .value=${this.editingView.xAxisProperty}
                                  @change=${e => (this.editingView.xAxisProperty = e.target.value)}
                              >
                                  ${this.properties.map(
                                      prop => html`
                                          <option value=${prop.name} ?selected=${this.editingView.xAxisProperty === prop.name}>${prop.name}</option>
                                      `
                                  )}
                              </select>
                          </div>
                          <div class="form-group">
                              <label class="form-label">Y Axis Property</label>
                              <select
                                  class="form-input"
                                  .value=${this.editingView.yAxisProperty}
                                  @change=${e => (this.editingView.yAxisProperty = e.target.value)}
                              >
                                  ${this.properties.map(
                                      prop => html`
                                          <option value=${prop.name} ?selected=${this.editingView.yAxisProperty === prop.name}>${prop.name}</option>
                                      `
                                  )}
                              </select>
                          </div>
                      `
                    : ''}
                ${this.editingView.type === 'kanban'
                    ? html`
                          <div class="form-group">
                              <label class="form-label">Group By</label>
                              <select
                                  class="form-input"
                                  .value=${this.editingView.groupBy}
                                  @change=${e => (this.editingView.groupBy = e.target.value)}
                              >
                                  ${this.properties.map(
                                      prop => html`
                                          <option value=${prop.name} ?selected=${this.editingView.groupBy === prop.name}>${prop.name}</option>
                                      `
                                  )}
                              </select>
                          </div>
                      `
                    : ''}
                ${this.editingView.type === 'calendar'
                    ? html`
                          <div class="form-group">
                              <label class="form-label">Date Property</label>
                              <select
                                  class="form-input"
                                  .value=${this.editingView.dateProperty}
                                  @change=${e => (this.editingView.dateProperty = e.target.value)}
                              >
                                  ${this.properties
                                      .filter(prop => prop.type === 'date' || prop.type === 'datetime-local')
                                      .map(
                                          prop => html`
                                              <option value=${prop.name} ?selected=${this.editingView.dateProperty === prop.name}>
                                                  ${prop.name}
                                              </option>
                                          `
                                      )}
                              </select>
                          </div>
                      `
                    : ''}
                ${this.editingView.type === 'activity'
                    ? html`
                          <div class="form-group">
                              <label class="form-label">Date Property</label>
                              <select
                                  class="form-input"
                                  .value=${this.editingView.dateProperty}
                                  @change=${e => (this.editingView.dateProperty = e.target.value)}
                              >
                                  ${this.properties
                                      .filter(prop => prop.type === 'date' || prop.type === 'datetime-local')
                                      .map(
                                          prop => html`
                                              <option value=${prop.name} ?selected=${this.editingView.dateProperty === prop.name}>
                                                  ${prop.name}
                                              </option>
                                          `
                                      )}
                              </select>
                          </div>
                          <div class="form-group">
                              <label class="form-label">Value Property</label>
                              <select
                                  class="form-input"
                                  .value=${this.editingView.valueProperty}
                                  @change=${e => (this.editingView.valueProperty = e.target.value)}
                              >
                                  ${this.properties
                                      .filter(prop => prop.type === 'number')
                                      .map(
                                          prop => html`
                                              <option value=${prop.name} ?selected=${this.editingView.valueProperty === prop.name}>
                                                  ${prop.name}
                                              </option>
                                          `
                                      )}
                              </select>
                          </div>
                      `
                    : ''}
                ${this.editingView.type === 'list' ||
                this.editingView.type === 'carousel' ||
                this.editingView.type === 'gallery' ||
                this.editingView.type === 'kanban' ||
                this.editingView.type === 'matrix' ||
                this.editingView.type === 'calendar'
                    ? html`
                          <div class="form-group">
                              <label class="form-label">Visible Properties</label>
                              <div class="property-checkboxes">
                                  ${this.properties.map(
                                      prop => html`
                                          <label class="checkbox-label">
                                              <input
                                                  type="checkbox"
                                                  .checked=${this.editingView.visibleProperties.includes(prop.name)}
                                                  @change=${e => this.toggleVisibleProperty(prop.name, e.target.checked)}
                                              />
                                              <span>${prop.name}</span>
                                          </label>
                                      `
                                  )}
                              </div>
                          </div>
                      `
                    : ''}
            </div>

            ${this.editingView.id !== 'default-table'
                ? html`
                      <div class="danger-section">
                          <button class="btn-secondary btn-danger-secondary" @click=${this.deleteCurrentView}>Delete View</button>
                      </div>
                  `
                : ''}
        `;
    }

    renderFilterTab() {
        return html`
            <div class="filters-section">
                <div class="section-header">
                    <button class="btn-secondary add-filter-btn" @click=${this.addFilter}>
                        <img src="/a7/plugins/database-element/plus.svg" style="width: 14px; height: 14px; filter: var(--themed-svg)" />
                        Add Filter
                    </button>
                </div>
                <div class="filter-list">
                    ${this.editingView.filters.map(
                        (filter, index) => html`
                            <div class="filter-item">
                                <select
                                    class="form-input filter-property"
                                    .value=${filter.property}
                                    @change=${e => {
                                        filter.property = e.target.value;
                                        filter.value = '';
                                        this.requestUpdate();
                                    }}
                                >
                                    ${this.properties.map(
                                        prop => html` <option value=${prop.name} ?selected=${filter.property === prop.name}>${prop.name}</option> `
                                    )}
                                </select>
                                <select
                                    class="form-input filter-operator"
                                    .value=${filter.operator}
                                    @change=${e => {
                                        filter.operator = e.target.value;
                                        this.requestUpdate();
                                    }}
                                >
                                    <option value="equals" ?selected=${filter.operator === 'equals'}>Equals</option>
                                    <option value="contains" ?selected=${filter.operator === 'contains'}>Contains</option>
                                    <option value="greater_than" ?selected=${filter.operator === 'greater_than'}>Greater Than</option>
                                    <option value="less_than" ?selected=${filter.operator === 'less_than'}>Less Than</option>
                                </select>
                                <div class="filter-value">${this.renderFilterValueInput(filter, index)}</div>
                                <button class="btn-tertiary remove-btn" @click=${() => this.removeFilter(index)}>
                                    <img src="/a7/plugins/database-element/delete.svg" style="width: 16px; height: 16px;" />
                                </button>
                            </div>
                        `
                    )}
                </div>
            </div>
        `;
    }

    renderSortTab() {
        return html`
            <div class="sorts-section">
                <div class="section-header">
                    <button class="btn-secondary add-sort-btn" @click=${this.addSort}>
                        <img src="/a7/plugins/database-element/plus.svg" style="width: 14px; height: 14px; filter: var(--themed-svg)" />
                        Add Sort
                    </button>
                </div>
                <div class="sort-list">
                    ${this.editingView.sorts.map(
                        (sort, index) => html`
                            <div class="sort-item">
                                <select
                                    class="form-input sort-property"
                                    .value=${sort.property}
                                    @change=${e => {
                                        sort.property = e.target.value;
                                        this.requestUpdate();
                                    }}
                                >
                                    ${this.properties.map(
                                        prop => html` <option value=${prop.name} ?selected=${sort.property === prop.name}>${prop.name}</option> `
                                    )}
                                </select>
                                <select
                                    class="form-input sort-direction"
                                    .value=${sort.direction}
                                    @change=${e => {
                                        sort.direction = e.target.value;
                                        this.requestUpdate();
                                    }}
                                >
                                    <option value="asc" ?selected=${sort.direction === 'asc'}>Ascending</option>
                                    <option value="desc" ?selected=${sort.direction === 'desc'}>Descending</option>
                                </select>
                                <button class="btn-tertiary remove-btn" @click=${() => this.removeSort(index)}>
                                    <img src="/a7/plugins/database-element/delete.svg" style="width: 16px; height: 16px;" />
                                </button>
                            </div>
                        `
                    )}
                </div>
            </div>
        `;
    }

    renderFilterValueInput(filter, index) {
        const property = this.properties.find(p => p.name === filter.property);
        switch (property.type) {
            case 'select':
                return html`
                    <select
                        class="form-input"
                        .value=${filter.value}
                        @change=${e => {
                            this.editingView.filters[index].value = e.target.value;
                            this.requestUpdate();
                        }}
                    >
                        <option value="" ?selected=${filter.value === ''}>Select a value</option>
                        ${property.options.map(option => html` <option value=${option} ?selected=${filter.value === option}>${option}</option> `)}
                    </select>
                `;
            case 'multi-select':
                return html`
                    <select
                        class="form-input"
                        .value=${filter.value}
                        @change=${e => {
                            this.editingView.filters[index].value = e.target.value;
                            this.requestUpdate();
                        }}
                    >
                        <option value="" ?selected=${filter.value === ''}>Select a value</option>
                        ${property.options.map(option => html` <option value=${option} ?selected=${filter.value === option}>${option}</option> `)}
                    </select>
                `;
            case 'date':
                return html`
                    <input
                        type="date"
                        class="form-input"
                        .value=${filter.value}
                        @input=${e => {
                            this.editingView.filters[index].value = e.target.value;
                            this.requestUpdate();
                        }}
                    />
                `;
            case 'checkbox':
                return html`
                    <select
                        class="form-input"
                        .value=${filter.value}
                        @change=${e => {
                            this.editingView.filters[index].value = e.target.value;
                            this.requestUpdate();
                        }}
                    >
                        <option value="">Select a value</option>
                        <option value="true" ?selected=${filter.value === 'true'}>True</option>
                        <option value="false" ?selected=${filter.value === 'false'}>False</option>
                    </select>
                `;
            default:
                return html`
                    <input
                        type="text"
                        class="form-input"
                        .value=${filter.value}
                        @input=${e => {
                            this.editingView.filters[index].value = e.target.value;
                            this.requestUpdate();
                        }}
                    />
                `;
        }
    }

    renderTableView(entries) {
        return html`
            <table>
                <thead>
                    <tr>
                        ${this.properties.map(
                            prop =>
                                html`<th style="padding: 0; line-height: 40px;">
                                    ${prop.emoji ? html`&nbsp;&nbsp;${prop.emoji}` : ''} &nbsp;&nbsp;${prop.name}
                                </th>`
                        )}
                        <th style="padding: 0">
                            <button @click=${this.toggleAddColumnForm} class="add-column-button" style="border-radius: 0">+</button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    ${entries.map(
                        entry => html`
                            <tr @click=${() => this.startEditing(entry)}>
                                ${this.properties.map(prop => html` <td>${this.renderCellValue(entry[prop.name], prop)}</td> `)}
                                <td></td>
                            </tr>
                        `
                    )}
                </tbody>
            </table>
            ${this.renderAddRowForm()}
        `;
    }

    toggleVisibleProperty(propName, isChecked) {
        if (isChecked) {
            this.editingView.visibleProperties = [...this.editingView.visibleProperties, propName];
        } else {
            this.editingView.visibleProperties = this.editingView.visibleProperties.filter(p => p !== propName);
        }
        this.requestUpdate();
    }

    renderCellValue(value, property) {
        if (value === undefined || value === null) {
            return property.type === 'checkbox' ? '✗' : '';
        }
        if (property.type === 'checkbox') {
            return value ? '✓' : '✗';
        } else if (property.type === 'multi-select' && Array.isArray(value)) {
            return value.join(', ');
        } else {
            return value.toString();
        }
    }

    renderKanbanView(entries) {
        const groupByProperty = this.currentView.groupBy || 'status';
        const visibleProperties = this.currentView.visibleProperties || ['title'];
        const allGroups = this.properties.find(p => p.name === groupByProperty)?.options || [];
        const groupsFromEntries = [...new Set(entries.map(entry => entry[groupByProperty]))];
        const groups = [...new Set([...allGroups, ...groupsFromEntries])];

        return html`
            <div class="kanban">
                ${groups.map(
                    group => html`
                        <div class="kanban-column" data-group="${group}" @dragover=${this.handleDragOver} @drop=${e => this.handleDrop(e, group)}>
                            <div class="kanban-column-header">
                                <h3>${group}</h3>
                                <button class="add-entry-button" @click=${() => this.startAddingNewEntry(groupByProperty, group)}>+</button>
                            </div>
                            ${entries
                                .filter(entry => entry[groupByProperty] === group)
                                .map(
                                    entry => html`
                                        <div
                                            class="kanban-item"
                                            draggable="true"
                                            @dragstart=${e => this.handleDragStart(e, entry)}
                                            @dragend=${this.handleDragEnd}
                                            @touchstart=${e => this.handleTouchStart(e, entry)}
                                            @click=${e => {
                                                if (!this.touchMoving) {
                                                    e.preventDefault();
                                                    this.startEditing(entry);
                                                }
                                            }}
                                        >
                                            ${visibleProperties.map(propName => {
                                                const prop = this.properties.find(p => p.name === propName);
                                                return html`
                                                    <div class="kanban-item-property">
                                                        ${prop.emoji ? html`<span class="property-emoji">${prop.emoji}</span>` : ''}
                                                        <span class="property-value">${this.renderCellValue(entry[propName], prop)}</span>
                                                    </div>
                                                `;
                                            })}
                                        </div>
                                    `
                                )}
                        </div>
                    `
                )}
            </div>
        `;
    }

    handleTouchStart(e, entry) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.draggedItem = entry;
        this.touchMoving = false;
        this.draggedElement = e.target.closest('.kanban-item');

        if (this.draggedElement) {
            this.draggedElement.style.opacity = '0.5';
            this.draggedElement.style.transform = 'scale(1.05)';
        }

        // Add touch move and end listeners to the document
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    handleTouchMove(e) {
        if (!this.draggedItem || !this.draggedElement) return;

        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - this.touchStartX;
        const deltaY = touchY - this.touchStartY;

        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            this.touchMoving = true;
        }

        if (this.touchMoving) {
            this.draggedElement.style.position = 'fixed';
            this.draggedElement.style.left = `${touchX - this.draggedElement.offsetWidth / 2}px`;
            this.draggedElement.style.top = `${touchY - this.draggedElement.offsetHeight / 2}px`;
            this.draggedElement.style.zIndex = '1000';
        }

        e.preventDefault(); // Prevent scrolling while dragging
    }

    handleTouchEnd(e) {
        if (!this.draggedItem || !this.draggedElement) return;

        // Get the element under the touch point
        const touch = e.changedTouches[0];
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        const newColumnElement = elementUnderTouch.closest('.kanban-column');

        // Reset draggedElement styles
        this.draggedElement.style.opacity = '1';
        this.draggedElement.style.transform = 'scale(1)';
        this.draggedElement.style.position = 'static';
        this.draggedElement.style.zIndex = 'auto';

        if (this.touchMoving && newColumnElement) {
            const groupByProperty = this.currentView.groupBy || 'status';
            const newGroup = newColumnElement.dataset.group;

            if (newGroup) {
                const updatedEntry = { ...this.draggedItem, [groupByProperty]: newGroup };
                const index = this.entries.findIndex(entry => entry.id === this.draggedItem.id);
                if (index !== -1) {
                    this.entries = [...this.entries.slice(0, index), updatedEntry, ...this.entries.slice(index + 1)];
                    this.requestUpdate();
                    this.onUpdate();
                }
            }
        }

        // Clean up
        this.draggedItem = null;
        this.draggedElement = null;
        this.touchMoving = false;

        // Remove document listeners
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }

    handleCalendarTouchStart(e, entry) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.draggedItem = entry;
        this.touchMoving = false;
        this.draggedElement = e.target.closest('.calendar-item');

        if (this.draggedElement) {
            this.draggedElement.style.opacity = '0.5';
            this.draggedElement.style.transform = 'scale(1.05)';
        }

        document.addEventListener('touchmove', this.handleCalendarTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleCalendarTouchEnd.bind(this));
    }

    handleCalendarTouchMove(e) {
        if (!this.draggedItem || !this.draggedElement) return;

        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - this.touchStartX;
        const deltaY = touchY - this.touchStartY;

        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            this.touchMoving = true;
        }

        if (this.touchMoving) {
            this.draggedElement.style.position = 'fixed';
            this.draggedElement.style.left = `${touchX - this.draggedElement.offsetWidth / 2}px`;
            this.draggedElement.style.top = `${touchY - this.draggedElement.offsetHeight / 2}px`;
            this.draggedElement.style.zIndex = '1000';
        }

        e.preventDefault(); // Prevent scrolling while dragging
    }

    handleCalendarTouchEnd(e) {
        if (!this.draggedItem || !this.draggedElement) return;

        // Get the element under the touch point
        const touch = e.changedTouches[0];
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        const calendarDayElement = elementUnderTouch.closest('.calendar-day');

        // Reset draggedElement styles
        this.draggedElement.style.opacity = '1';
        this.draggedElement.style.transform = 'scale(1)';
        this.draggedElement.style.position = 'static';
        this.draggedElement.style.zIndex = 'auto';

        if (this.touchMoving && calendarDayElement && calendarDayElement.classList.contains('current-month')) {
            // Extract date information from the day element
            const dateProperty = this.currentView.dateProperty || 'date';
            const year = this.calendarDate ? this.calendarDate.getFullYear() : new Date().getFullYear();
            const month = this.calendarDate ? this.calendarDate.getMonth() : new Date().getMonth();

            // Get the day number from the element
            const dayNumberElement = calendarDayElement.querySelector('.day-number');
            if (dayNumberElement) {
                const day = parseInt(dayNumberElement.textContent, 10);

                // Format the new date
                const newDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                // Update the entry
                const updatedEntry = { ...this.draggedItem, [dateProperty]: newDate };
                const index = this.entries.findIndex(entry => entry.id === this.draggedItem.id);
                if (index !== -1) {
                    this.entries = [...this.entries.slice(0, index), updatedEntry, ...this.entries.slice(index + 1)];
                    this.requestUpdate();
                    this.onUpdate();
                }
            }
        }

        // Clean up
        this.draggedItem = null;
        this.draggedElement = null;
        this.touchMoving = false;

        // Remove document listeners
        document.removeEventListener('touchmove', this.handleCalendarTouchMove);
        document.removeEventListener('touchend', this.handleCalendarTouchEnd);
    }

    handleCalendarDragStart(e, entry) {
        this.draggedItem = entry;
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
    }

    handleCalendarDragEnd(e) {
        e.target.classList.remove('dragging');
        const days = this.shadowRoot.querySelectorAll('.calendar-day');
        days.forEach(day => day.classList.remove('drag-over'));
    }

    handleCalendarDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
        e.dataTransfer.dropEffect = 'move';
    }

    handleCalendarDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    handleCalendarDrop(e, year, month, day) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        if (this.draggedItem) {
            const dateProperty = this.currentView.dateProperty || 'date';

            // Format the new date as YYYY-MM-DD
            const newDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            const updatedEntry = {
                ...this.draggedItem,
                [dateProperty]: newDate,
            };

            const index = this.entries.findIndex(entry => entry.id === this.draggedItem.id);
            if (index !== -1) {
                this.entries = [...this.entries.slice(0, index), updatedEntry, ...this.entries.slice(index + 1)];
                this.requestUpdate();
                this.onUpdate();
            }
        }
        this.draggedItem = null;
    }

    startAddingNewEntry(groupByProperty = null, groupValue = null) {
        const newEntry = {
            id: `temp_${Date.now()}`,
            title: 'New Entry',
        };
        if (groupByProperty && groupValue) {
            newEntry[groupByProperty] = groupValue;
        }
        this.startEditing(newEntry);
    }

    renderListView(entries) {
        const visibleProperties = this.currentView.visibleProperties || ['title'];
        return html`
            <div class="list-view">
                ${entries.map(
                    entry => html`
                        <div class="list-item" @click=${() => this.startEditing(entry)}>
                            ${visibleProperties.map(propName => {
                                const prop = this.properties.find(p => p.name === propName);
                                return html`
                                    <div class="list-item-property"><strong>${propName}:</strong> ${this.renderCellValue(entry[propName], prop)}</div>
                                `;
                            })}
                        </div>
                    `
                )}
                <div class="list-item new-entry" @click=${() => this.startAddingNewEntry()}>
                    <div class="new-entry-placeholder">+</div>
                    <strong>Add New Entry</strong>
                </div>
            </div>
        `;
    }

    renderCalendarView(entries) {
        const dateProperty = this.currentView.dateProperty || 'date';
        const now = new Date();
        const [currentYear, currentMonth] = [now.getFullYear(), now.getMonth()];
        const [year, month] = this.calendarDate ? [this.calendarDate.getFullYear(), this.calendarDate.getMonth()] : [currentYear, currentMonth];

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startingDayOfWeek = firstDayOfMonth.getDay();

        const weeks = Math.ceil((daysInMonth + startingDayOfWeek) / 7);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        return html`
            <div class="calendar-container">
                <div class="calendar-header">
                    <button @click=${() => this.changeMonth(-1)} style="border: transparent; background: transparent;">
                        <?xml version="1.0" encoding="UTF-8"?><svg
                            width="25px"
                            height="25px"
                            stroke-width="2"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            color="currentColor"
                        >
                            <path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </button>
                    <h3>${monthNames[month]} ${year}</h3>
                    <button @click=${() => this.changeMonth(1)} style="border: transparent; background: transparent;">
                        <?xml version="1.0" encoding="UTF-8"?><svg
                            width="25px"
                            height="25px"
                            stroke-width="2"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            color="currentColor"
                        >
                            <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </button>
                </div>
                <div class="calendar-weekdays">
                    ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => html`<div class="weekday">${day}</div>`)}
                </div>

                <div class="calendar-grid">
                    ${Array(weeks)
                        .fill()
                        .map(
                            (_, weekIndex) => html`
                                <div class="calendar-week">
                                    ${Array(7)
                                        .fill()
                                        .map((_, dayIndex) => {
                                            const dayNumber = weekIndex * 7 + dayIndex - startingDayOfWeek + 1;
                                            const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;

                                            const dayEntries = entries.filter(entry => {
                                                const entryDate = new Date(entry[dateProperty]);
                                                return (
                                                    entryDate.getFullYear() === year &&
                                                    entryDate.getMonth() === month &&
                                                    entryDate.getDate() === dayNumber
                                                );
                                            });

                                            return html`
                                                <div
                                                    class="calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'}"
                                                    @dragover=${isCurrentMonth ? e => this.handleCalendarDragOver(e) : null}
                                                    @dragleave=${isCurrentMonth ? this.handleCalendarDragLeave : null}
                                                    @drop=${isCurrentMonth ? e => this.handleCalendarDrop(e, year, month, dayNumber) : null}
                                                >
                                                    ${isCurrentMonth
                                                        ? html`
                                                              <div class="day-number">${dayNumber}</div>
                                                              <div class="day-content">
                                                                  ${dayEntries.map(
                                                                      entry => html`
                                                                          <div
                                                                              class="calendar-item"
                                                                              draggable="true"
                                                                              @dragstart=${e => this.handleCalendarDragStart(e, entry)}
                                                                              @dragend=${this.handleCalendarDragEnd}
                                                                              @touchstart=${e => this.handleCalendarTouchStart(e, entry)}
                                                                              @click=${() => this.startEditing(entry)}
                                                                          >
                                                                              ${(this.currentView.visibleProperties || ['title']).map(propName => {
                                                                                  const prop = this.properties.find(p => p.name === propName);
                                                                                  if (propName === this.currentView.dateProperty) return ''; // Skip the date property since it's already used for positioning
                                                                                  return html`
                                                                                      <div class="calendar-item-property">
                                                                                          ${prop.emoji
                                                                                              ? html`<span class="property-emoji"
                                                                                                    >${prop.emoji}</span
                                                                                                >`
                                                                                              : ''}
                                                                                          <span class="property-value"
                                                                                              >${this.renderCellValue(entry[propName], prop)}</span
                                                                                          >
                                                                                      </div>
                                                                                  `;
                                                                              })}
                                                                          </div>
                                                                      `
                                                                  )}
                                                              </div>
                                                              <div class="add-entry-button" @click=${() => this.addNewEntry(year, month, dayNumber)}>
                                                                  +
                                                              </div>
                                                          `
                                                        : ''}
                                                </div>
                                            `;
                                        })}
                                </div>
                            `
                        )}
                </div>
            </div>
        `;
    }

    renderGalleryView(entries) {
        const visibleProperties = this.currentView.visibleProperties || ['title'];
        return html`
            <div class="gallery">
                ${entries.map(
                    entry => html`
                        <div class="gallery-item" @click=${() => this.startEditing(entry)}>
                            <strong>${entry.title}</strong>
                            ${visibleProperties.slice(1).map(propName => {
                                const prop = this.properties.find(p => p.name === propName);
                                return html`
                                    <div class="gallery-item-property">
                                        <span class="property-label">${propName}:</span>
                                        <span class="property-value">${this.renderCellValue(entry[propName], prop)}</span>
                                    </div>
                                `;
                            })}
                        </div>
                    `
                )}
                <div class="gallery-item new-entry" @click=${() => this.startAddingNewEntry()}>
                    <div class="new-entry-placeholder">+</div>
                    <strong>Add New Entry</strong>
                </div>
            </div>
        `;
    }

    // Add new renderTimelineView method
    renderTimelineView(entries) {
        const startDateProp = this.currentView.startDateProperty || 'startDate';
        const endDateProp = this.currentView.endDateProperty || 'endDate';

        // Filter entries with valid dates
        const validEntries = entries.filter(entry => entry[startDateProp] && entry[endDateProp]);

        if (validEntries.length === 0) {
            return html`<div>No entries with valid dates found</div>`;
        }

        // Calculate the full date range
        const dates = validEntries.flatMap(entry => [new Date(entry[startDateProp]), new Date(entry[endDateProp])]);
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));

        // Add buffer days
        minDate.setDate(minDate.getDate() - 7);
        maxDate.setDate(maxDate.getDate() + 7);

        // Generate array of days
        const days = [];
        const currentDate = new Date(minDate);
        while (currentDate <= maxDate) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const dayWidth = 50; // Width in pixels for each day
        const today = new Date();

        // Calculate today's position
        const todayOffset = ((today - minDate) / (1000 * 60 * 60 * 24)) * dayWidth;

        return html`
            <div class="timeline-wrapper">
                <div class="timeline-container">
                    <div class="timeline-sidebar" style="display: none">
                        ${validEntries.map(entry => html` <div class="timeline-task-label">${entry.title}</div> `)}
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            ${days.map(
                                day => html`
                                    <div class="timeline-day">
                                        <div class="timeline-day-name">${day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                                        <div class="timeline-day-date">${day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                                    </div>
                                `
                            )}
                        </div>
                        <div class="timeline-body">
                            ${validEntries.map((entry, index) => {
                                const start = new Date(entry[startDateProp]);
                                const end = new Date(entry[endDateProp]);
                                const left = ((start - minDate) / (1000 * 60 * 60 * 24)) * dayWidth;
                                const width = Math.max(((end - start) / (1000 * 60 * 60 * 24)) * dayWidth, dayWidth / 2);

                                return html`
                                    <div class="timeline-row">
                                        <div
                                            class="timeline-task"
                                            style="left: ${left}px; width: ${width}px;"
                                            @click=${() => this.startEditing(entry)}
                                            title=${entry.title}
                                        >
                                            ${entry.title}
                                        </div>
                                    </div>
                                `;
                            })}
                            <div class="timeline-grid">
                                ${days.map((_, index) => html` <div class="timeline-grid-line" style="left: ${index * dayWidth}px"></div> `)}
                            </div>
                            ${todayOffset >= 0 ? html` <div class="timeline-today" style="left: ${todayOffset}px"></div> ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    startCarouselAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
        this.autoplayInterval = setInterval(() => {
            if (this.currentView?.type === 'carousel') {
                this.nextSlide();
            } else {
                clearInterval(this.autoplayInterval);
            }
        }, 5000); // Change slide every 5 seconds
    }

    stopCarouselAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }

    nextSlide() {
        const entries = this.filteredEntries ? this.filteredEntries.length : this.entries.length;
        if (entries > 0) {
            this.currentSlide = (this.currentSlide + 1) % entries;
            this.requestUpdate();
        }
    }

    prevSlide() {
        const entries = this.filteredEntries ? this.filteredEntries.length : this.entries.length;
        if (entries > 0) {
            this.currentSlide = (this.currentSlide - 1 + entries) % entries;
            this.requestUpdate();
        }
    }

    goToSlide(index) {
        const entries = this.filteredEntries ? this.filteredEntries.length : this.entries.length;
        if (index >= 0 && index < entries) {
            this.currentSlide = index;
            this.requestUpdate();
        }
    }

    renderCarouselView(entries) {
        const visibleProperties = this.currentView.visibleProperties || ['title'];
        const allEntries = [...entries];

        return html`
            <div class="carousel-container" @mouseenter=${this.stopCarouselAutoplay} @mouseleave=${this.startCarouselAutoplay}>
                <div class="carousel-track" style="transform: translateX(-${this.currentSlide * 100}%)">
                    ${entries.map(
                        (entry, index) => html`
                            <div class="carousel-item ${index === this.currentSlide ? 'active' : ''}" @click=${() => this.startEditing(entry)}>
                                ${visibleProperties.map(propName => {
                                    const prop = this.properties.find(p => p.name === propName);
                                    return html`
                                        <div class="carousel-property">
                                            <div class="carousel-property-label">${propName}</div>
                                            <div class="carousel-property-value">${this.renderCellValue(entry[propName], prop)}</div>
                                        </div>
                                    `;
                                })}
                            </div>
                        `
                    )}
                </div>
                <div class="carousel-navigation">
                    <button class="carousel-nav-button prev" @click=${this.prevSlide}>
                        <img src="/a7/plugins/database-element/left.svg" class="plugin-icon" alt="Previous" />
                    </button>
                    ${allEntries.map(
                        (_, index) => html`
                            <div class="carousel-dot ${index === this.currentSlide ? 'active' : ''}" @click=${() => this.goToSlide(index)}></div>
                        `
                    )}
                    <button class="carousel-nav-button next" @click=${this.nextSlide}>
                        <img src="/a7/plugins/database-element/right.svg" class="plugin-icon" alt="Next" />
                    </button>
                </div>
            </div>
        `;
    }

    handleMatrixDragStart(e, entry) {
        this.draggedItem = entry;
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
    }

    handleMatrixDragEnd(e) {
        e.target.classList.remove('dragging');
        const cells = this.shadowRoot.querySelectorAll('.matrix-cell');
        cells.forEach(cell => cell.classList.remove('drag-over'));
    }

    handleMatrixDragOver(e, xValue, yValue) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
        e.dataTransfer.dropEffect = 'move';
    }

    handleMatrixDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    handleMatrixDrop(e, xValue, yValue) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        if (this.draggedItem) {
            const xProp = this.currentView.xAxisProperty;
            const yProp = this.currentView.yAxisProperty;

            const updatedEntry = {
                ...this.draggedItem,
                [xProp]: xValue,
                [yProp]: yValue,
            };

            const index = this.entries.findIndex(entry => entry.id === this.draggedItem.id);
            if (index !== -1) {
                this.entries = [...this.entries.slice(0, index), updatedEntry, ...this.entries.slice(index + 1)];
                this.requestUpdate();
                this.onUpdate();
            }
        }
        this.draggedItem = null;
    }

    updateMatrixAxis(axis, propertyName) {
        if (axis === 'x') {
            this.currentView = {
                ...this.currentView,
                xAxisProperty: propertyName,
            };
        } else {
            this.currentView = {
                ...this.currentView,
                yAxisProperty: propertyName,
            };
        }
        this.requestUpdate();
    }

    renderMatrixView(entries) {
        const xProp = this.currentView.xAxisProperty;
        const yProp = this.currentView.yAxisProperty;

        if (!xProp || !yProp) {
            return html`<div>Please configure X and Y axes in the view settings</div>`;
        }

        const xProperty = this.properties.find(p => p.name === xProp);
        const yProperty = this.properties.find(p => p.name === yProp);

        if (!xProperty || !yProperty) {
            return html`<div>Invalid properties selected</div>`;
        }

        // Get unique values for each axis
        const xValues = xProperty.type === 'select' ? xProperty.options : [...new Set(entries.map(e => e[xProp]))].filter(Boolean);

        const yValues = yProperty.type === 'select' ? yProperty.options : [...new Set(entries.map(e => e[yProp]))].filter(Boolean);

        // Set grid template
        const gridStyle = {
            'grid-template-columns': `auto repeat(${xValues.length}, 1fr)`,
            'grid-template-rows': `auto repeat(${yValues.length}, 1fr)`,
        };

        return html`
            <div class="matrix-container">
                <div class="matrix-grid" style=${styleMap(gridStyle)}>
                    <!-- Empty top-left corner -->
                    <div class="matrix-header-cell"></div>

                    <!-- X-axis headers -->
                    ${xValues.map(x => html` <div class="matrix-header-cell">${x}</div> `)}

                    <!-- Y-axis headers and cells -->
                    ${yValues.map(
                        y => html`
                            <!-- Y-axis header -->
                            <div class="matrix-header-cell">${y}</div>

                            <!-- Matrix cells -->
                            ${xValues.map(x => {
                                const cellEntries = entries.filter(entry => entry[xProp] === x && entry[yProp] === y);

                                return html`
                                    <div
                                        class="matrix-cell"
                                        @dragover=${e => this.handleMatrixDragOver(e, x, y)}
                                        @dragleave=${this.handleMatrixDragLeave}
                                        @drop=${e => this.handleMatrixDrop(e, x, y)}
                                    >
                                        ${cellEntries.map(
                                            entry => html`
                                                <div
                                                    class="matrix-item"
                                                    draggable="true"
                                                    @dragstart=${e => this.handleMatrixDragStart(e, entry)}
                                                    @dragend=${this.handleMatrixDragEnd}
                                                    @click=${() => this.startEditing(entry)}
                                                >
                                                    ${(this.currentView.visibleProperties || ['title']).map(propName => {
                                                        const prop = this.properties.find(p => p.name === propName);
                                                        return html`
                                                            <div class="matrix-item-property">
                                                                ${prop.emoji ? html`<span class="property-emoji">${prop.emoji}</span>` : ''}
                                                                <span class="property-value">${this.renderCellValue(entry[propName], prop)}</span>
                                                            </div>
                                                        `;
                                                    })}
                                                </div>
                                            `
                                        )}
                                    </div>
                                `;
                            })}
                        `
                    )}
                </div>
            </div>
        `;
    }

    renderActivityView(entries) {
        // Default to first available date and number properties if not configured
        const dateProperty = this.currentView.dateProperty || this.properties.find(p => p.type === 'date' || p.type === 'datetime-local')?.name;
        const valueProperty = this.currentView.valueProperty || this.properties.find(p => p.type === 'number')?.name;

        // If still no properties found, show configuration message
        if (!dateProperty || !valueProperty) {
            const availableDateProps = this.properties.filter(p => p.type === 'date' || p.type === 'datetime-local');
            const availableNumberProps = this.properties.filter(p => p.type === 'number');

            return html`
                <div class="activity-container">
                    <p>Please configure both Date Property and Value Property in the view settings.</p>
                    <p>Available date properties: ${availableDateProps.map(p => p.name).join(', ') || 'None'}</p>
                    <p>Available number properties: ${availableNumberProps.map(p => p.name).join(', ') || 'None'}</p>
                    <p>Entries count: ${entries.length}</p>
                    <p>Sample entry: ${entries.length > 0 ? JSON.stringify(entries[0]) : 'No entries'}</p>
                </div>
            `;
        }

        // Initialize current year if not set
        if (!this.activityYear) {
            this.activityYear = new Date().getFullYear();
        }

        // Group entries by date and sum values
        const dateValueMap = {};
        let debugInfo = { processedEntries: 0, validDates: 0, validValues: 0 };

        entries.forEach(entry => {
            debugInfo.processedEntries++;
            const dateValue = entry[dateProperty];
            const numValue = parseFloat(entry[valueProperty]) || 0;

            if (numValue > 0) debugInfo.validValues++;

            if (dateValue) {
                // Handle YYYY-MM-DD format directly
                let dateStr;
                if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    dateStr = dateValue;
                    debugInfo.validDates++;
                } else {
                    const date = new Date(dateValue);
                    if (!isNaN(date.getTime())) {
                        dateStr = date.toISOString().split('T')[0];
                        debugInfo.validDates++;
                    }
                }

                if (dateStr) {
                    dateValueMap[dateStr] = (dateValueMap[dateStr] || 0) + numValue;
                }
            }
        });

        // Get all years that have data
        const availableYears = [...new Set(Object.keys(dateValueMap).map(date => new Date(date).getFullYear()))].sort((a, b) => b - a);

        // If no data found, show debug info
        if (availableYears.length === 0) {
            return html`
                <div class="activity-container">
                    <h3>Debug Information</h3>
                    <p>Date Property: ${dateProperty}</p>
                    <p>Value Property: ${valueProperty}</p>
                    <p>Processed Entries: ${debugInfo.processedEntries}</p>
                    <p>Valid Dates: ${debugInfo.validDates}</p>
                    <p>Valid Values: ${debugInfo.validValues}</p>
                    <p>Date Value Map: ${JSON.stringify(dateValueMap)}</p>
                    <p>Sample entry data:</p>
                    <pre>
${entries
                            .slice(0, 3)
                            .map(
                                entry =>
                                    `${dateProperty}: "${entry[dateProperty]}" (${typeof entry[dateProperty]})\n${valueProperty}: "${entry[valueProperty]}" (${typeof entry[valueProperty]})`
                            )
                            .join('\n\n')}</pre
                    >
                </div>
            `;
        }

        // Filter data for current year
        const yearData = {};
        Object.keys(dateValueMap).forEach(dateStr => {
            const year = new Date(dateStr).getFullYear();
            if (year === this.activityYear) {
                yearData[dateStr] = dateValueMap[dateStr];
            }
        });

        // Calculate min and max values for color scaling
        const values = Object.values(yearData);
        const maxValue = Math.max(...values, 1);
        const minValue = Math.min(...values, 0);

        // Generate calendar grid for the year - simplified approach
        const startDate = new Date(this.activityYear, 0, 1);
        const endDate = new Date(this.activityYear, 11, 31);
        const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 6 = Saturday

        const weeks = [];
        let currentWeek = [];

        // Add empty cells for the beginning of the first week
        for (let i = 0; i < startDayOfWeek; i++) {
            currentWeek.push(null);
        }

        // Add all days of the year
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            currentWeek.push(new Date(currentDate));

            // If we've filled a week (7 days), start a new week
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Add the final week if it has any days
        if (currentWeek.length > 0) {
            // Fill the rest with nulls to complete the week
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }

        // Helper function to convert hex to RGB
        const hexToRgb = hex => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
                ? {
                      r: parseInt(result[1], 16),
                      g: parseInt(result[2], 16),
                      b: parseInt(result[3], 16),
                  }
                : null;
        };

        // Helper function to interpolate between two RGB colors
        const interpolateColor = (color1, color2, factor) => {
            const c1 = hexToRgb(color1);
            const c2 = hexToRgb(color2);
            if (!c1 || !c2) return color1;

            const r = Math.round(c1.r + (c2.r - c1.r) * factor);
            const g = Math.round(c1.g + (c2.g - c1.g) * factor);
            const b = Math.round(c1.b + (c2.b - c1.b) * factor);

            return `rgb(${r}, ${g}, ${b})`;
        };

        // Get CSS custom property values
        const computedStyle = getComputedStyle(this);
        const bgColor = computedStyle.getPropertyValue('--bg-1').trim();
        const fgColor = computedStyle.getPropertyValue('--fg-green').trim();

        // Function to get interpolated color based on value
        const getColor = value => {
            if (!value || value === 0) return bgColor;
            const rawIntensity = (value - minValue) / (maxValue - minValue || 1);
            // Set minimum intensity to 25% to ensure small values are still visible
            const intensity = Math.max(0.25, rawIntensity);
            return interpolateColor(bgColor, fgColor, intensity);
        };

        return html`
            <div class="activity-container">
                <div class="activity-legend">
                    <span>${minValue}</span>
                    <div class="legend-squares">
                        ${[0, 0.25, 0.5, 0.75, 1].map(
                            factor => html`
                                <div class="legend-square" style="background-color: ${interpolateColor(bgColor, fgColor, factor)};"></div>
                            `
                        )}
                    </div>
                    <span>${maxValue}</span>
                </div>

                <div class="activity-grid">
                        <div class="activity-calendar">
                            <div class="activity-weekdays">
                                ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => html` <div class="weekday-label">${day}</div> `)}
                            </div>

                            <div class="activity-months-and-days">
                                <div class="activity-months">
                                    ${(() => {
                                        const monthLabels = [];
                                        let currentMonth = -1;

                                        weeks.forEach((week, weekIndex) => {
                                            const firstValidDay = week.find(day => day !== null);
                                            if (firstValidDay) {
                                                const month = firstValidDay.getMonth();
                                                if (month !== currentMonth) {
                                                    // Use percentage for responsive positioning
                                                    const leftPosition = (weekIndex / weeks.length) * 100;
                                                    const monthNames = [
                                                        'Jan',
                                                        'Feb',
                                                        'Mar',
                                                        'Apr',
                                                        'May',
                                                        'Jun',
                                                        'Jul',
                                                        'Aug',
                                                        'Sep',
                                                        'Oct',
                                                        'Nov',
                                                        'Dec',
                                                    ];
                                                    monthLabels.push(html`
                                                        <div class="month-label" style="left: ${leftPosition}%;">${monthNames[month]}</div>
                                                    `);
                                                    currentMonth = month;
                                                }
                                            }
                                        });

                                        return monthLabels;
                                    })()}
                                </div>

                                <div class="activity-days" style="grid-template-columns: repeat(${weeks.length}, 1fr);">
                                    ${weeks.flatMap(week =>
                                        week.map(day => {
                                            if (!day) return html`<div class="activity-day empty"></div>`;

                                            const dateStr = day.toISOString().split('T')[0];
                                            const value = yearData[dateStr] || 0;
                                            const color = getColor(value);

                                            return html`
                                                <div
                                                    class="activity-day"
                                                    style="background-color: ${color};"
                                                    data-date="${dateStr}"
                                                    data-value="${value}"
                                                    @mouseenter=${e => this.showTooltip(e, dateStr, value)}
                                                    @mouseleave=${() => this.hideTooltip()}
                                                    @mousemove=${e => this.updateTooltipPosition(e)}
                                                ></div>
                                            `;
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="activity-navigation">
                    <button
                        class="nav-button"
                        ?disabled=${availableYears.indexOf(this.activityYear) >= availableYears.length - 1}
                        @click=${() => {
                            const currentIndex = availableYears.indexOf(this.activityYear);
                            if (currentIndex < availableYears.length - 1) {
                                this.activityYear = availableYears[currentIndex + 1];
                                this.requestUpdate();
                            }
                        }}
                    >
                        <img src="/a7/plugins/database-element/left.svg" alt="Previous year" width="16" height="16" style="filter: var(--themed-svg)">
                    </button>

                    <span class="year-display">${this.activityYear}</span>

                    <button
                        class="nav-button"
                        ?disabled=${availableYears.indexOf(this.activityYear) <= 0}
                        @click=${() => {
                            const currentIndex = availableYears.indexOf(this.activityYear);
                            if (currentIndex > 0) {
                                this.activityYear = availableYears[currentIndex - 1];
                                this.requestUpdate();
                            }
                        }}
                    >
                        <img src="/a7/plugins/database-element/right.svg" alt="Next year" width="16" height="16"style="filter: var(--themed-svg)">
                    </button>
                </div>
                <div id="activity-tooltip" class="activity-tooltip" style="display: none;"></div>
            </div>
        `;
    }

    showTooltip(event, dateStr, value) {
        const tooltip = this.shadowRoot.querySelector('#activity-tooltip');
        if (tooltip) {
            const date = new Date(dateStr);
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            tooltip.innerHTML = `
                <div><strong>${formattedDate}</strong></div>
                <div>${value} contributions</div>
            `;
            tooltip.style.display = 'block';
            this.updateTooltipPosition(event);
        }
    }

    hideTooltip() {
        const tooltip = this.shadowRoot.querySelector('#activity-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    updateTooltipPosition(event) {
        const tooltip = this.shadowRoot.querySelector('#activity-tooltip');
        if (tooltip && tooltip.style.display !== 'none') {
            const rect = this.getBoundingClientRect();
            const x = event.clientX - rect.left + 10;
            const y = event.clientY - rect.top - 10;

            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        }
    }

    render() {
        const filteredEntries = this.applyFiltersAndSorts([...this.entries]);
        this.filteredEntries = filteredEntries; // Store for carousel navigation

        // Reset slide if out of bounds
        if (this.currentSlide >= filteredEntries.length) {
            this.currentSlide = 0;
        }

        return html`
            <div style="max-width: var(--width); margin: 0 auto;">
                ${this.renderViewManagement()}
                <div style="margin: 0 auto; max-width: var(--width); overflow: auto;">
                    ${this.currentView.type === 'table'
                        ? this.renderTableView(filteredEntries)
                        : this.currentView.type === 'kanban'
                          ? this.renderKanbanView(filteredEntries)
                          : this.currentView.type === 'calendar'
                            ? this.renderCalendarView(filteredEntries)
                            : this.currentView.type === 'gallery'
                              ? this.renderGalleryView(filteredEntries)
                              : this.currentView.type === 'list'
                                ? this.renderListView(filteredEntries)
                                : this.currentView.type === 'timeline'
                                  ? this.renderTimelineView(filteredEntries)
                                  : this.currentView.type === 'carousel'
                                    ? this.renderCarouselView(filteredEntries)
                                    : this.currentView.type === 'matrix'
                                      ? this.renderMatrixView(filteredEntries)
                                      : this.currentView.type === 'activity'
                                        ? this.renderActivityView(filteredEntries)
                                        : html`<p>Unknown view type</p>`}
                </div>
                ${this.renderAddRowDialog()} ${this.renderAddColumnDialog()} ${this.renderEditDialog()} ${this.renderEditViewDialog()}
                ${this.renderEditPropertiesDialog()}
            </div>
        `;
    }
}

customElements.define('database-element', DatabaseElement);
