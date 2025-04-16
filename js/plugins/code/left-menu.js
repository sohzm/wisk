import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class LeftMenu extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            color: var(--fg-1);
            transition: all 0.3s;
            font-size: 14px;
            user-select: none;
        }
        ul {
            list-style-type: none;
        }
        li {
            padding: var(--padding-2) 0;
            position: relative;
        }
        li a {
            color: var(--fg-1);
            text-decoration: none;
            flex: 1;
            display: block;
            padding: var(--padding-w1);
            border-radius: var(--radius);

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .vert-nav {
            display: flex;
            flex-direction: column;
        }
        .vert-nav-button {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-w1);
            border-radius: var(--radius);
            color: var(--fg-1);
            background-color: var(--bg-1);
            text-decoration: none;
            cursor: pointer;
            outline: none;
            border: none;
            width: 100%;
            color: var(--fg-accent);
        }
        .vert-nav-button img {
            width: 18px;
        }
        .vert-nav-button:hover {
            background-color: var(--bg-accent);
        }
        li a:hover {
            background-color: var(--bg-3);
            color: var(--fg-1);
        }
        .outer {
            padding: 0 var(--padding-3);
            display: flex;
            flex-direction: column;
            height: 100%;
            gap: var(--gap-1);
        }
        .new {
            display: flex;
            text-align: center;
            text-decoration: none;
            border-radius: var(--radius);
            color: var(--fg-accent);
            gap: var(--gap-2);
            align-items: center;
            justify-content: center;
            white-space: nowrap;
        }
        .new:hover {
            background-color: var(--bg-3);
            color: var(--fg-1);
        }
        .new-img {
            width: 22px;
            height: 22px;
            filter: var(--accent-svg);
        }
        .new:hover .new-img {
            filter: var(--themed-svg);
        }
        #search {
            width: 100%;
            color: var(--fg-1);
            font-size: 1rem;
            outline: none;
            border: none;
            background-color: transparent;
            font-size: 14px;
        }
        .search-div img {
            width: 20px;
            height: 20px;
        }
        .search-div {
            padding: var(--padding-w1);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            background-color: var(--bg-2);
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            flex: 1;
        }
        .od {
            padding: var(--padding-w1);
            color: var(--fg-1);
            background-color: var(--bg-2);
            border-radius: var(--radius);
            outline: none;
            border: 1px solid var(--bg-3);
            transition: all 0.2s ease;
            width: 100%;
        }
        .email {
            outline: none;
            border: none;
            flex: 1;
            background-color: transparent;
            color: var(--fg-1);
        }
        .od:has(.srch:focus) {
            border-color: var(--border-2);
            background-color: var(--bg-1);
            box-shadow: 0 0 0 2px var(--bg-3);
        }
        .item {
            display: flex;
            gap: var(--gap-2);
            align-items: center;
            padding: 0;
        }
        .more-options {
            position: relative;
            padding: 4px;
            border-radius: 100px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
            height: 30px;
            width: 30px;
        }
        .item:hover .more-options {
            opacity: 1;
        }
        .more-options:hover {
            background-color: var(--bg-3);
        }
        .dropdown {
            position: absolute;
            right: 0;
            top: 100%;
            background-color: var(--bg-1);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            padding: var(--padding-1);
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .dropdown-item {
            display: flex;
            align-items: center;
            gap: var(--gap-2);
            padding: var(--padding-2);
            cursor: pointer;
            border-radius: var(--radius);
            color: var(--fg-1);
            text-decoration: none;
        }
        .dropdown-item:hover {
            background-color: var(--bg-2);
        }
        img {
            width: 22px;
            filter: var(--themed-svg);
        }
        ::placeholder {
            color: var(--fg-2);
        }
        @media (max-width: 900px) {
            .more-options {
                opacity: 1;
            }
        }

        @media (hover: hover) {
            *::-webkit-scrollbar {
                width: 15px;
            }
            *::-webkit-scrollbar-track {
                background: var(--bg-1);
            }
            *::-webkit-scrollbar-thumb {
                background-color: var(--bg-3);
                border-radius: 20px;
                border: 4px solid var(--bg-1);
            }
            *::-webkit-scrollbar-thumb:hover {
                background-color: var(--fg-1);
            }
        }

        .upgrade-to-pro {
            padding: var(--padding-4);
            border-radius: var(--radius);
            filter: var(--drop-shadow);
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--gap-2);
            position: relative;
            background-image:
                url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260' viewBox='0 0 260 260'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='var(--bg-3)' fill-opacity='0.07'%3E%3Cpath d='M24.37 16c.2.65.39 1.32.54 2H21.17l1.17 2.34.45.9-.24.11V28a5 5 0 0 1-2.23 8.94l-.02.06a8 8 0 0 1-7.75 6h-20a8 8 0 0 1-7.74-6l-.02-.06A5 5 0 0 1-17.45 28v-6.76l-.79-1.58-.44-.9.9-.44.63-.32H-20a23.01 23.01 0 0 1 44.37-2zm-36.82 2a1 1 0 0 0-.44.1l-3.1 1.56.89 1.79 1.31-.66a3 3 0 0 1 2.69 0l2.2 1.1a1 1 0 0 0 .9 0l2.21-1.1a3 3 0 0 1 2.69 0l2.2 1.1a1 1 0 0 0 .9 0l2.21-1.1a3 3 0 0 1 2.69 0l2.2 1.1a1 1 0 0 0 .86.02l2.88-1.27a3 3 0 0 1 2.43 0l2.88 1.27a1 1 0 0 0 .85-.02l3.1-1.55-.89-1.79-1.42.71a3 3 0 0 1-2.56.06l-2.77-1.23a1 1 0 0 0-.4-.09h-.01a1 1 0 0 0-.4.09l-2.78 1.23a3 3 0 0 1-2.56-.06l-2.3-1.15a1 1 0 0 0-.45-.11h-.01a1 1 0 0 0-.44.1L.9 19.22a3 3 0 0 1-2.69 0l-2.2-1.1a1 1 0 0 0-.45-.11h-.01a1 1 0 0 0-.44.1l-2.21 1.11a3 3 0 0 1-2.69 0l-2.2-1.1a1 1 0 0 0-.45-.11h-.01zm0-2h-4.9a21.01 21.01 0 0 1 39.61 0h-2.09l-.06-.13-.26.13h-32.31zm30.35 7.68l1.36-.68h1.3v2h-36v-1.15l.34-.17 1.36-.68h2.59l1.36.68a3 3 0 0 0 2.69 0l1.36-.68h2.59l1.36.68a3 3 0 0 0 2.69 0L2.26 23h2.59l1.36.68a3 3 0 0 0 2.56.06l1.67-.74h3.23l1.67.74a3 3 0 0 0 2.56-.06zM-13.82 27l16.37 4.91L18.93 27h-32.75zm-.63 2h.34l16.66 5 16.67-5h.33a3 3 0 1 1 0 6h-34a3 3 0 1 1 0-6zm1.35 8a6 6 0 0 0 5.65 4h20a6 6 0 0 0 5.66-4H-13.1z'/%3E%3Cpath id='path6_fill-copy' d='M284.37 16c.2.65.39 1.32.54 2H281.17l1.17 2.34.45.9-.24.11V28a5 5 0 0 1-2.23 8.94l-.02.06a8 8 0 0 1-7.75 6h-20a8 8 0 0 1-7.74-6l-.02-.06a5 5 0 0 1-2.24-8.94v-6.76l-.79-1.58-.44-.9.9-.44.63-.32H240a23.01 23.01 0 0 1 44.37-2zm-36.82 2a1 1 0 0 0-.44.1l-3.1 1.56.89 1.79 1.31-.66a3 3 0 0 1 2.69 0l2.2 1.1a1 1 0 0 0 .9 0l2.21-1.1a3 3 0 0 1 2.69 0l2.2 1.1a1 1 0 0 0 .9 0l2.21-1.1a3 3 0 0 1 2.69 0l2.2 1.1a1 1 0 0 0 .86.02l2.88-1.27a3 3 0 0 1 2.43 0l2.88 1.27a1 1 0 0 0 .85-.02l3.1-1.55-.89-1.79-1.42.71a3 3 0 0 1-2.56.06l-2.77-1.23a1 1 0 0 0-.4-.09h-.01a1 1 0 0 0-.4.09l-2.78 1.23a3 3 0 0 1-2.56-.06l-2.3-1.15a1 1 0 0 0-.45-.11h-.01a1 1 0 0 0-.44.1l-2.21 1.11a3 3 0 0 1-2.69 0l-2.2-1.1a1 1 0 0 0-.45-.11h-.01a1 1 0 0 0-.44.1l-2.21 1.11a3 3 0 0 1-2.69 0l-2.2-1.1a1 1 0 0 0-.45-.11h-.01zm0-2h-4.9a21.01 21.01 0 0 1 39.61 0h-2.09l-.06-.13-.26.13h-32.31zm30.35 7.68l1.36-.68h1.3v2h-36v-1.15l.34-.17 1.36-.68h2.59l1.36.68a3 3 0 0 0 2.69 0l1.36-.68h2.59l1.36.68a3 3 0 0 0 2.69 0l1.36-.68h2.59l1.36.68a3 3 0 0 0 2.56.06l1.67-.74h3.23l1.67.74a3 3 0 0 0 2.56-.06zM246.18 27l16.37 4.91L278.93 27h-32.75zm-.63 2h.34l16.66 5 16.67-5h.33a3 3 0 1 1 0 6h-34a3 3 0 1 1 0-6zm1.35 8a6 6 0 0 0 5.65 4h20a6 6 0 0 0 5.66-4H246.9z'/%3E%3Cpath d='M159.5 21.02A9 9 0 0 0 151 15h-42a9 9 0 0 0-8.5 6.02 6 6 0 0 0 .02 11.96A8.99 8.99 0 0 0 109 45h42a9 9 0 0 0 8.48-12.02 6 6 0 0 0 .02-11.96zM151 17h-42a7 7 0 0 0-6.33 4h54.66a7 7 0 0 0-6.33-4zm-9.34 26a8.98 8.98 0 0 0 3.34-7h-2a7 7 0 0 1-7 7h-4.34a8.98 8.98 0 0 0 3.34-7h-2a7 7 0 0 1-7 7h-4.34a8.98 8.98 0 0 0 3.34-7h-2a7 7 0 0 1-7 7h-7a7 7 0 1 1 0-14h42a7 7 0 1 1 0 14h-9.34zM109 27a9 9 0 0 0-7.48 4H101a4 4 0 1 1 0-8h58a4 4 0 0 1 0 8h-.52a9 9 0 0 0-7.48-4h-42z'/%3E%3Cpath d='M39 115a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm6-8a6 6 0 1 1-12 0 6 6 0 0 1 12 0zm-3-29v-2h8v-6H40a4 4 0 0 0-4 4v10H22l-1.33 4-.67 2h2.19L26 130h26l3.81-40H58l-.67-2L56 84H42v-6zm-4-4v10h2V74h8v-2h-8a2 2 0 0 0-2 2zm2 12h14.56l.67 2H22.77l.67-2H40zm13.8 4H24.2l3.62 38h22.36l3.62-38z'/%3E%3Cpath d='M129 92h-6v4h-6v4h-6v14h-3l.24 2 3.76 32h36l3.76-32 .24-2h-3v-14h-6v-4h-6v-4h-8zm18 22v-12h-4v4h3v8h1zm-3 0v-6h-4v6h4zm-6 6v-16h-4v19.17c1.6-.7 2.97-1.8 4-3.17zm-6 3.8V100h-4v23.8a10.04 10.04 0 0 0 4 0zm-6-.63V104h-4v16a10.04 10.04 0 0 0 4 3.17zm-6-9.17v-6h-4v6h4zm-6 0v-8h3v-4h-4v12h1zm27-12v-4h-4v4h3v4h1v-4zm-6 0v-8h-4v4h3v4h1zm-6-4v-4h-4v8h1v-4h3zm-6 4v-4h-4v8h1v-4h3zm7 24a12 12 0 0 0 11.83-10h7.92l-3.53 30h-32.44l-3.53-30h7.92A12 12 0 0 0 130 126z'/%3E%3Cpath d='M212 86v2h-4v-2h4zm4 0h-2v2h2v-2zm-20 0v.1a5 5 0 0 0-.56 9.65l.06.25 1.12 4.48a2 2 0 0 0 1.94 1.52h.01l7.02 24.55a2 2 0 0 0 1.92 1.45h4.98a2 2 0 0 0 1.92-1.45l7.02-24.55a2 2 0 0 0 1.95-1.52L224.5 96l.06-.25a5 5 0 0 0-.56-9.65V86a14 14 0 0 0-28 0zm4 0h6v2h-9a3 3 0 1 0 0 6H223a3 3 0 1 0 0-6H220v-2h2a12 12 0 1 0-24 0h2zm-1.44 14l-1-4h24.88l-1 4h-22.88zm8.95 26l-6.86-24h18.7l-6.86 24h-4.98zM150 242a22 22 0 1 0 0-44 22 22 0 0 0 0 44zm24-22a24 24 0 1 1-48 0 24 24 0 0 1 48 0zm-28.38 17.73l2.04-.87a6 6 0 0 1 4.68 0l2.04.87a2 2 0 0 0 2.5-.82l1.14-1.9a6 6 0 0 1 3.79-2.75l2.15-.5a2 2 0 0 0 1.54-2.12l-.19-2.2a6 6 0 0 1 1.45-4.46l1.45-1.67a2 2 0 0 0 0-2.62l-1.45-1.67a6 6 0 0 1-1.45-4.46l.2-2.2a2 2 0 0 0-1.55-2.13l-2.15-.5a6 6 0 0 1-3.8-2.75l-1.13-1.9a2 2 0 0 0-2.5-.8l-2.04.86a6 6 0 0 1-4.68 0l-2.04-.87a2 2 0 0 0-2.5.82l-1.14 1.9a6 6 0 0 1-3.79 2.75l-2.15.5a2 2 0 0 0-1.54 2.12l.19 2.2a6 6 0 0 1-1.45 4.46l-1.45 1.67a2 2 0 0 0 0 2.62l1.45 1.67a6 6 0 0 1 1.45 4.46l-.2 2.2a2 2 0 0 0 1.55 2.13l2.15.5a6 6 0 0 1 3.8 2.75l1.13 1.9a2 2 0 0 0 2.5.8zm2.82.97a4 4 0 0 1 3.12 0l2.04.87a4 4 0 0 0 4.99-1.62l1.14-1.9a4 4 0 0 1 2.53-1.84l2.15-.5a4 4 0 0 0 3.09-4.24l-.2-2.2a4 4 0 0 1 .97-2.98l1.45-1.67a4 4 0 0 0 0-5.24l-1.45-1.67a4 4 0 0 1-.97-2.97l.2-2.2a4 4 0 0 0-3.09-4.25l-2.15-.5a4 4 0 0 1-2.53-1.84l-1.14-1.9a4 4 0 0 0-5-1.62l-2.03.87a4 4 0 0 1-3.12 0l-2.04-.87a4 4 0 0 0-4.99 1.62l-1.14 1.9a4 4 0 0 1-2.53 1.84l-2.15.5a4 4 0 0 0-3.09 4.24l.2 2.2a4 4 0 0 1-.97 2.98l-1.45 1.67a4 4 0 0 0 0 5.24l1.45 1.67a4 4 0 0 1 .97 2.97l-.2 2.2a4 4 0 0 0 3.09 4.25l2.15.5a4 4 0 0 1 2.53 1.84l1.14 1.9a4 4 0 0 0 5 1.62l2.03-.87zM152 207a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm6 2a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-11 1a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-6 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm3-5a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-8 8a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm3 6a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm0 6a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm4 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm5-2a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm5 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm4-6a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm6-4a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-4-3a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm4-3a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-5-4a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm-24 6a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm16 5a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm7-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0zm86-29a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm19 9a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm-14 5a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm-25 1a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm5 4a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm9 0a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm15 1a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm12-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm-11-14a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm-19 0a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm6 5a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm-25 15c0-.47.01-.94.03-1.4a5 5 0 0 1-1.7-8 3.99 3.99 0 0 1 1.88-5.18 5 5 0 0 1 3.4-6.22 3 3 0 0 1 1.46-1.05 5 5 0 0 1 7.76-3.27A30.86 30.86 0 0 1 246 184c6.79 0 13.06 2.18 18.17 5.88a5 5 0 0 1 7.76 3.27 3 3 0 0 1 1.47 1.05 5 5 0 0 1 3.4 6.22 4 4 0 0 1 1.87 5.18 4.98 4.98 0 0 1-1.7 8c.02.46.03.93.03 1.4v1h-62v-1zm.83-7.17a30.9 30.9 0 0 0-.62 3.57 3 3 0 0 1-.61-4.2c.37.28.78.49 1.23.63zm1.49-4.61c-.36.87-.68 1.76-.96 2.68a2 2 0 0 1-.21-3.71c.33.4.73.75 1.17 1.03zm2.32-4.54c-.54.86-1.03 1.76-1.49 2.68a3 3 0 0 1-.07-4.67 3 3 0 0 0 1.56 1.99zm1.14-1.7c.35-.5.72-.98 1.1-1.46a1 1 0 1 0-1.1 1.45zm5.34-5.77c-1.03.86-2 1.79-2.9 2.77a3 3 0 0 0-1.11-.77 3 3 0 0 1 4-2zm42.66 2.77c-.9-.98-1.87-1.9-2.9-2.77a3 3 0 0 1 4.01 2 3 3 0 0 0-1.1.77zm1.34 1.54c.38.48.75.96 1.1 1.45a1 1 0 1 0-1.1-1.45zm3.73 5.84c-.46-.92-.95-1.82-1.5-2.68a3 3 0 0 0 1.57-1.99 3 3 0 0 1-.07 4.67zm1.8 4.53c-.29-.9-.6-1.8-.97-2.67.44-.28.84-.63 1.17-1.03a2 2 0 0 1-.2 3.7zm1.14 5.51c-.14-1.21-.35-2.4-.62-3.57.45-.14.86-.35 1.23-.63a2.99 2.99 0 0 1-.6 4.2zM275 214a29 29 0 0 0-57.97 0h57.96zM72.33 198.12c-.21-.32-.34-.7-.34-1.12v-12h-2v12a4.01 4.01 0 0 0 7.09 2.54c.57-.69.91-1.57.91-2.54v-12h-2v12a1.99 1.99 0 0 1-2 2 2 2 0 0 1-1.66-.88zM75 176c.38 0 .74-.04 1.1-.12a4 4 0 0 0 6.19 2.4A13.94 13.94 0 0 1 84 185v24a6 6 0 0 1-6 6h-3v9a5 5 0 1 1-10 0v-9h-3a6 6 0 0 1-6-6v-24a14 14 0 0 1 14-14 5 5 0 0 0 5 5zm-17 15v12a1.99 1.99 0 0 0 1.22 1.84 2 2 0 0 0 2.44-.72c.21-.32.34-.7.34-1.12v-12h2v12a3.98 3.98 0 0 1-5.35 3.77 3.98 3.98 0 0 1-.65-.3V209a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4v-24c.01-1.53-.23-2.88-.72-4.17-.43.1-.87.16-1.28.17a6 6 0 0 1-5.2-3 7 7 0 0 1-6.47-4.88A12 12 0 0 0 58 185v6zm9 24v9a3 3 0 1 0 6 0v-9h-6z'/%3E%3Cpath d='M-17 191a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm19 9a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1zm-14 5a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm-25 1a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm5 4a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm9 0a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm15 1a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm12-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2H4zm-11-14a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm-19 0a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2h-2zm6 5a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1zm-25 15c0-.47.01-.94.03-1.4a5 5 0 0 1-1.7-8 3.99 3.99 0 0 1 1.88-5.18 5 5 0 0 1 3.4-6.22 3 3 0 0 1 1.46-1.05 5 5 0 0 1 7.76-3.27A30.86 30.86 0 0 1-14 184c6.79 0 13.06 2.18 18.17 5.88a5 5 0 0 1 7.76 3.27 3 3 0 0 1 1.47 1.05 5 5 0 0 1 3.4 6.22 4 4 0 0 1 1.87 5.18 4.98 4.98 0 0 1-1.7 8c.02.46.03.93.03 1.4v1h-62v-1zm.83-7.17a30.9 30.9 0 0 0-.62 3.57 3 3 0 0 1-.61-4.2c.37.28.78.49 1.23.63zm1.49-4.61c-.36.87-.68 1.76-.96 2.68a2 2 0 0 1-.21-3.71c.33.4.73.75 1.17 1.03zm2.32-4.54c-.54.86-1.03 1.76-1.49 2.68a3 3 0 0 1-.07-4.67 3 3 0 0 0 1.56 1.99zm1.14-1.7c.35-.5.72-.98 1.1-1.46a1 1 0 1 0-1.1 1.45zm5.34-5.77c-1.03.86-2 1.79-2.9 2.77a3 3 0 0 0-1.11-.77 3 3 0 0 1 4-2zm42.66 2.77c-.9-.98-1.87-1.9-2.9-2.77a3 3 0 0 1 4.01 2 3 3 0 0 0-1.1.77zm1.34 1.54c.38.48.75.96 1.1 1.45a1 1 0 1 0-1.1-1.45zm3.73 5.84c-.46-.92-.95-1.82-1.5-2.68a3 3 0 0 0 1.57-1.99 3 3 0 0 1-.07 4.67zm1.8 4.53c-.29-.9-.6-1.8-.97-2.67.44-.28.84-.63 1.17-1.03a2 2 0 0 1-.2 3.7zm1.14 5.51c-.14-1.21-.35-2.4-.62-3.57.45-.14.86-.35 1.23-.63a2.99 2.99 0 0 1-.6 4.2zM15 214a29 29 0 0 0-57.97 0h57.96z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),
                linear-gradient(45deg, var(--fg-1), var(--fg-accent));
        }

        .upgrade-button {
            border: none;
            outline: none;
            background: var(--bg-1);
            color: var(--fg-1);
            padding: var(--padding-w1);
            font-weight: 600;
            border-radius: var(--radius);
            margin-left: auto;
            cursor: pointer;
        }

        .cancel-button {
            border: none;
            outline: none;
            background: transparent;
            color: var(--bg-1);
            padding: 0;
            border-radius: var(--radius);
            cursor: pointer;
        }
    `;

    static properties = {
        filteredList: { type: Array },
        openDropdownId: { type: String },
    };

    constructor() {
        super();
        this.list = [];
        this.filteredList = [];
        this.openDropdownId = null;
    }

    opened() {
        if (wisk.editor.readonly) return;
        this.setList();
    }

    async setList() {
        try {
            // const auth = await document.getElementById('auth').getUserInfo();
            // const response = await fetch(wisk.editor.backendUrl + '/v1/document', {
            //     method: 'GET',
            //     headers: {
            //         Authorization: 'Bearer ' + auth.token,
            //     },
            // });

            // if (!response.ok) {
            //     throw new Error('Failed to fetch documents');
            // }

            // const data = await response.json();
            // this.list = data.map(item => ({
            //     id: item.id,
            //     name: item.title,
            // }));
            var l = await wisk.db.getAllKeys();
            console.log(l);
            this.list = [];
            for (var i = 0; i < l.length; i++) {
                var item = await wisk.db.getItem(l[i]);
                console.log(item);
                this.list.push({
                    id: item.id,
                    name: item.data.config.name,
                });
            }
            this.filteredList = [...this.list];
            this.requestUpdate();
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    }

    async removeItem(id) {
        var result = confirm('Are you sure you want to delete this page?');
        if (!result) {
            return;
        }

        try {
            const auth = await document.getElementById('auth').getUserInfo();
            const response = await fetch(`${wisk.editor.backendUrl}/v1/document?id=${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: 'Bearer ' + auth.token,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete document');
            }

            this.list = this.list.filter(item => item.id !== id);
            this.filteredList = this.filteredList.filter(item => item.id !== id);
            this.requestUpdate();
        } catch (error) {
            console.error('Error deleting document:', error);
        }

        if (id == wisk.editor.pageId) {
            window.location.href = '/';
        }
    }

    levenshteinDistance(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[b.length][a.length];
    }

    fuzzySearch(query, title) {
        query = query.toLowerCase();
        title = title.toLowerCase();
        let queryIndex = 0;
        let titleIndex = 0;
        while (queryIndex < query.length && titleIndex < title.length) {
            if (query[queryIndex] === title[titleIndex]) {
                queryIndex++;
            }
            titleIndex++;
        }
        return queryIndex === query.length;
    }

    filterList(e) {
        if (e.target.value === '') {
            this.filteredList = [...this.list];
            return;
        }
        const searchTerm = e.target.value.toLowerCase();
        this.filteredList = this.list.filter(item => {
            const itemName = item.name.toLowerCase();
            return this.fuzzySearch(searchTerm, itemName) || this.levenshteinDistance(searchTerm, itemName) <= 2;
        });
        this.filteredList.sort((a, b) => {
            const distA = this.levenshteinDistance(searchTerm, a.name.toLowerCase());
            const distB = this.levenshteinDistance(searchTerm, b.name.toLowerCase());
            return distA - distB;
        });
    }

    openInEditor() {
        var url = 'https://app.wisk.cc?id=' + wisk.editor.pageId;
        window.open(url, '_blank');
    }

    toggleDropdown(id, e) {
        e.preventDefault();
        e.stopPropagation();
        this.openDropdownId = this.openDropdownId === id ? null : id;
    }

    closeDropdown() {
        this.openDropdownId = null;
    }

    render() {
        if (wisk.editor.readonly) {
            return html`
                <div class="outer">
                    <button @click=${this.openInEditor} class="new" style="cursor: pointer;">Open in Editor</button>
                </div>
            `;
        }

        return html`
            <div class="outer" @click=${this.closeDropdown}>
                <div class="vert-nav" style="display: none">
                    <button class="vert-nav-button" @click=${() => (window.location.href = '/home')}>
                        <img src="/a7/forget/search-2.svg" class="new-img" /> Search All Documents
                    </button>
                    <button class="vert-nav-button" @click=${() => (window.location.href = '/home')}>
                        <img src="/a7/forget/home.svg" class="new-img" /> Home
                    </button>
                    <button class="vert-nav-button" @click=${() => document.querySelector('neo-ai').expandDialog()}>
                        <img src="/a7/forget/spark.svg" class="new-img" /> Neo AI
                    </button>
                    <button class="vert-nav-button" @click=${() => document.querySelector('template-dialog').show()}>
                        <img src="/a7/forget/layouts.svg" class="new-img" /> Templates
                    </button>
                    <button class="vert-nav-button" @click=${() => document.querySelector('feedback-dialog').show()}>
                        <img src="/a7/forget/feedback.svg" class="new-img" /> Feedback
                    </button>
                    <button class="vert-nav-button" @click=${() => document.querySelector('help-dialog').show()}>
                        <img src="/a7/forget/help.svg" class="new-img" /> Help
                    </button>
                </div>

                <div style="display: flex; gap: 10px; align-items: stretch; padding: var(--padding-w1)">
                    <div class="search-div od">
                        <img src="/a7/forget/search.svg" alt="Search" />
                        <input type="text" id="search" name="search" class="srch" placeholder="Filter Documents" @input=${this.filterList} />
                    </div>

                    <a href="/" class="new"> <img src="/a7/forget/plus1.svg" alt="New Page" class="new-img" /> </a>
                </div>
                <ul style="flex: 1; overflow: auto;">
                    ${this.filteredList.map(
                        item => html`
                            <li class="item">
                                <a href="?id=${item.id}" style="display: flex; gap: var(--gap-2); align-items: center; font-size: 13px">
                                    <img src="/a7/forget/page-1.svg" alt="File" style="width: 18px; height: 18px; opacity: 0.8" /> ${item.name}
                                </a>
                                <div class="more-options" @click=${e => this.toggleDropdown(item.id, e)}>
                                    <img src="/a7/forget/morex.svg" alt="More options" />
                                    ${this.openDropdownId === item.id
                                        ? html`
                                              <div class="dropdown">
                                                  <div class="dropdown-item" @click=${() => this.removeItem(item.id)}>
                                                      <img src="/a7/forget/trash.svg" alt="Delete" style="width: 20px; height: 20px; padding: 2px;" />
                                                      Delete
                                                  </div>
                                              </div>
                                          `
                                        : ''}
                                </div>
                            </li>
                        `
                    )}
                </ul>
                <div style="padding: var(--padding-4) calc(var(--padding-4) - var(--padding-3)); display: none">
                    <div class="upgrade-to-pro">
                        <h3 style="color: var(--bg-1);">Upgrade to Pro</h3>
                        <p style="color: var(--bg-1);">Unlock unlimited AI and citation usage</p>
                        <div style="display: flex; justify-content: space-between; width: 100%;">
                            <button class="cancel-button" @click=${() => (this.shadowRoot.querySelector('.upgrade-to-pro').style.display = 'none')}>
                                Cancel
                            </button>
                            <button class="upgrade-button" @click=${() => wisk.utils.showToast('Its free!')}>Upgrade</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('left-menu', LeftMenu);
