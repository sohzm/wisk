import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

var leafletReady = new Promise(resolve => {
    if (window.L) {
        resolve();
        return;
    }
    const leafletScript = document.createElement('script');
    leafletScript.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    leafletScript.onload = () => resolve();
    document.head.appendChild(leafletScript);
});

const TILE_STYLES = {
    light_all: {
        name: 'Light All',
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution:
            "&copy; <a target='_blank' href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, &copy; <a target='_blank' href='https://carto.com/attributions'>CARTO</a>",
    },
    dark_all: {
        name: 'Dark All',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution:
            "&copy; <a target='_blank' href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, &copy; <a target='_blank' href='https://carto.com/attributions'>CARTO</a>",
    },
    light_nolabels: {
        name: 'Light No Labels',
        url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
        attribution:
            "&copy; <a target='_blank' href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, &copy; <a target='_blank' href='https://carto.com/attributions'>CARTO</a>",
    },
    light_only_labels: {
        name: 'Light Only Labels',
        url: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
        attribution:
            "&copy; <a target='_blank' href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, &copy; <a target='_blank' href='https://carto.com/attributions'>CARTO</a>",
    },
    dark_nolabels: {
        name: 'Dark No Labels',
        url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
        attribution:
            "&copy; <a target='_blank' href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, &copy; <a target='_blank' href='https://carto.com/attributions'>CARTO</a>",
    },
    dark_only_labels: {
        name: 'Dark Only Labels',
        url: 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',
        attribution:
            "&copy; <a target='_blank' href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, &copy; <a target='_blank' href='https://carto.com/attributions'>CARTO</a>",
    },
    rastertiles_voyager: {
        name: 'Voyager',
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution:
            "&copy; <a target='_blank' href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, &copy; <a target='_blank' href='https://carto.com/attributions'>CARTO</a>",
    },
    rastertiles_voyager_nolabels: {
        name: 'Voyager No Labels',
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
        attribution:
            "&copy; <a target='_blank' href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, &copy; <a target='_blank' href='https://carto.com/attributions'>CARTO</a>",
    },
    rastertiles_voyager_only_labels: {
        name: 'Voyager Only Labels',
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        attribution:
            "&copy; <a target='_blank' href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, &copy; <a target='_blank' href='https://carto.com/attributions'>CARTO</a>",
    },
    rastertiles_voyager_labels_under: {
        name: 'Voyager Labels Under',
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png',
        attribution:
            "&copy; <a target='_blank' href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>, &copy; <a target='_blank' href='https://carto.com/attributions'>CARTO</a>",
    },
    openstreetmap_mapnik: {
        name: 'OpenStreetMap Mapnik',
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: "&copy; <a target='_blank' href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    },
    opentopomap: {
        name: 'OpenTopoMap',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution:
            "Map data: &copy; <a target='_blank' href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, <a target='_blank' href='http://viewfinderpanoramas.org'>SRTM</a> | Map style: &copy; <a target='_blank' href='https://opentopomap.org'>OpenTopoMap</a> (<a target='_blank' href='https://creativecommons.org/licenses/by-sa/3.0/'>CC-BY-SA</a>)",
    },
    esri_world_imagery: {
        name: 'Esri World Imagery',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution:
            'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
    esri_natgeo_worldmap: {
        name: 'Esri National Geographic',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
        attribution:
            'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
    },
    esri_ocean_basemap: {
        name: 'Esri Ocean Basemap',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
        maxZoom: 13,
    },
    esri_world_physical: {
        name: 'Esri World Physical',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
        maxZoom: 8,
    },
    opnvkarte: {
        name: 'OPNVKarte',
        url: 'https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png',
        attribution:
            "Map <a target='_blank' href='https://memomaps.de/'>memomaps.de</a> <a target='_blank' href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, map data &copy; <a target='_blank' href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    },
};

class MapElement extends LitElement {
    static styles = [
        css`
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
            }
            .leaflet-container {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: 0;
            }
            .leaflet-pane,
            .leaflet-tile,
            .leaflet-marker-icon,
            .leaflet-marker-shadow,
            .leaflet-tile-container,
            .leaflet-map-pane,
            .leaflet-popup-pane,
            .leaflet-shadow-pane,
            .leaflet-overlay-pane,
            .leaflet-tooltip-pane,
            .leaflet-marker-pane {
                position: absolute;
                left: 0;
                top: 0;
            }
            .leaflet-map-pane {
                z-index: 400;
            }
            .leaflet-tile {
                width: 256px;
                height: 256px;
                /* Ensure proper tile rendering in the shadow DOM */
                filter: inherit;
            }
            .leaflet-control-container .leaflet-control {
                z-index: 500;
            }
            a {
                color: var(--fg-blue);
            }
            :host {
                display: block;
                width: 100%;
                height: 100%;
                position: relative;
                border-radius: var(--radius-large);
                overflow: hidden;
                border: 1px solid var(--border-1);
            }
            #map {
                width: 100%;
                height: 400px; /* Fixed height (or adjust dynamically) */
            }
            #search {
                width: auto;
                color: white;
            }
            .controls {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                position: absolute;
                z-index: 1;
                width: 100%;
                padding: 8px;
                opacity: 0;
                transition: opacity 0.2s;
            }
            select,
            input {
                padding: 4px 8px;
                background-color: rgba(0, 0, 0, 0.5);
                color: white;
                border: none;
                border-radius: var(--radius);
                font-size: 12px;
                outline: none;
            }
            .attribution {
                position: absolute;
                bottom: 0px;
                font-size: 12px;
                text-align: right;
                background: var(--bg-1);
                color: var(--fg-1);
            }
            a {
                color: var(--fg-blue);
            }
            ::placeholder {
                color: white;
            }
            :host(:hover) .controls {
                opacity: 1;
            }

            .map-controls {
                position: absolute;
                right: 10px;
                bottom: 10px;
                display: flex;
                flex-direction: column;
                gap: 5px;
                z-index: 1000;
            }

            .control-button {
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                border: none;
                border-radius: 4px;
                width: 34px;
                height: 34px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background-color 0.2s;
            }

            .control-button img {
                width: 20px;
                height: 20px;
            }

            .control-button:hover {
                background-color: rgba(0, 0, 0, 0.9);
            }

            @media (hover: none) and (pointer: coarse) {
                .control-button {
                    width: 50px;
                    height: 50px;
                    font-size: 24px;
                }
            }
        `,
    ];

    static properties = {
        map: { type: Object },
        markers: { type: Array },
        _latitude: { type: Number, state: true },
        _longitude: { type: Number, state: true },
        _zoom: { type: Number, state: true },
        isTouchDevice: { type: Boolean, state: true },
    };

    constructor() {
        super();
        this.map = null;
        this.markers = [];
        this._latitude = 51.505;
        this._longitude = -0.09;
        this._zoom = 13;
        this.iIcon = '';
        this._mapStyle = 'rastertiles_voyager';
        this._tileLayer = null;
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.panDistance = (200 * 360) / (256 * Math.pow(2, this._zoom));
    }

    async firstUpdated() {
        await leafletReady;
        this.initializeMap();
        this.initializeSearch();
    }

    initializeMap() {
        const mapContainer = this.shadowRoot.getElementById('map');
        this.map = L.map(mapContainer, {
            renderer: L.svg(),
        }).setView([this._latitude, this._longitude], this._zoom);

        this.updateTileLayer();

        this.iIcon = L.icon({
            iconUrl: '/a7/forget/marker-icon.png',
            iconSize: [32, 50],
            iconAnchor: [20, 54],
        });

        // Add marker on left click and attach a right-click (contextmenu) handler to delete it.
        this.map.on('click', e => {
            const marker = L.marker(e.latlng, { icon: this.iIcon }).addTo(this.map);
            marker.on('contextmenu', () => {
                this.map.removeLayer(marker);
                this.markers = this.markers.filter(m => m !== marker);
                this.sendUpdates();
            });
            this.markers.push(marker);
            this.sendUpdates();
        });

        // Update center and zoom level on map movement.
        this.map.on('moveend', () => {
            const center = this.map.getCenter();
            this._latitude = center.lat;
            this._longitude = center.lng;
            this._zoom = this.map.getZoom(); // update zoom level
            this.sendUpdates();
        });

        setTimeout(() => {
            this.map.invalidateSize();
        }, 0);
    }

    updateTileLayer() {
        if (this._tileLayer) {
            this.map.removeLayer(this._tileLayer);
        }
        console.log('Setting tile layer', TILE_STYLES[this._mapStyle], this._mapStyle);
        this._tileLayer = L.tileLayer(TILE_STYLES[this._mapStyle].url, {
            attribution: '',
        }).addTo(this.map);
        this.requestUpdate();
    }

    initializeSearch() {
        let debounceTimer;
        const searchInput = this.shadowRoot.getElementById('search');
        searchInput.addEventListener('input', e => {
            const query = e.target.value;

            clearTimeout(debounceTimer);

            if (query.length > 2) {
                debounceTimer = setTimeout(() => {
                    this.searchPlace(query);
                }, 800);
            }
        });
    }

    async searchPlace(query) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.length > 0) {
            const firstResult = data[0];
            const lat = parseFloat(firstResult.lat);
            const lon = parseFloat(firstResult.lon);
            this.map.setView([lat, lon], this._zoom);

            // Remove any existing markers
            this.markers.forEach(marker => this.map.removeLayer(marker));
            this.markers = [];

            const marker = L.marker([lat, lon], { icon: this.iIcon }).addTo(this.map);
            marker.on('contextmenu', () => {
                this.map.removeLayer(marker);
                this.markers = this.markers.filter(m => m !== marker);
                this.sendUpdates();
            });
            this.markers.push(marker);
            this.sendUpdates();
        }
    }

    handleStyleChange(e) {
        this._mapStyle = e.target.value;
        this.updateTileLayer();
        this.sendUpdates();
    }

    getValue() {
        return {
            latitude: this._latitude,
            longitude: this._longitude,
            zoom: this._zoom,
            mapStyle: this._mapStyle,
            markers: this.markers.map(marker => marker.getLatLng()),
        };
    }

    async setValue(path, value) {
        await leafletReady;
        console.log('Setting value', value);
        if (value.latitude !== undefined) this._latitude = value.latitude;
        if (value.longitude !== undefined) this._longitude = value.longitude;
        if (value.zoom !== undefined) this._zoom = value.zoom;
        if (value.mapStyle !== undefined) this._mapStyle = value.mapStyle;
        if (this.map) {
            this.map.setView([this._latitude, this._longitude], this._zoom);
            this.updateTileLayer();
            // Restore markers if provided.
            if (value.markers && Array.isArray(value.markers)) {
                this.markers.forEach(marker => this.map.removeLayer(marker));
                this.markers = [];
                for (const latlng of value.markers) {
                    const marker = L.marker([latlng.lat, latlng.lng], { icon: this.iIcon }).addTo(this.map);
                    marker.on('contextmenu', () => {
                        this.map.removeLayer(marker);
                        this.markers = this.markers.filter(m => m !== marker);
                        this.sendUpdates();
                    });
                    this.markers.push(marker);
                }
            }
        }
    }

    sendUpdates() {
        setTimeout(() => {
            wisk.editor.justUpdates(this.id);
        }, 0);
    }

    zoomIn() {
        if (this.map) {
            this.map.zoomIn();
        }
    }

    zoomOut() {
        if (this.map) {
            this.map.zoomOut();
        }
    }

    panUp() {
        this.panDistance = (200 * 360) / (256 * Math.pow(2, this._zoom));
        if (this.map) {
            const currentCenter = this.map.getCenter();
            this.map.panTo([currentCenter.lat + this.panDistance, currentCenter.lng]);
        }
    }

    panDown() {
        this.panDistance = (200 * 360) / (256 * Math.pow(2, this._zoom));
        if (this.map) {
            const currentCenter = this.map.getCenter();
            this.map.panTo([currentCenter.lat - this.panDistance, currentCenter.lng]);
        }
    }

    panLeft() {
        this.panDistance = (200 * 360) / (256 * Math.pow(2, this._zoom));
        if (this.map) {
            const currentCenter = this.map.getCenter();
            this.map.panTo([currentCenter.lat, currentCenter.lng - this.panDistance]);
        }
    }

    panRight() {
        this.panDistance = (200 * 360) / (256 * Math.pow(2, this._zoom));
        if (this.map) {
            const currentCenter = this.map.getCenter();
            this.map.panTo([currentCenter.lat, currentCenter.lng + this.panDistance]);
        }
    }

    render() {
        return html`
            <div class="controls">
                <input id="search" type="text" placeholder="Search for a place..." />
                <select @change="${this.handleStyleChange}">
                    ${Object.keys(TILE_STYLES).map(
                        style => html`<option value="${style}" ?selected="${this._mapStyle === style}">${TILE_STYLES[style].name}</option>`
                    )}
                </select>
                <div style="flex: 1;"></div>
            </div>
            <div id="map"></div>
            <p class="attribution" .innerHTML="${TILE_STYLES[this._mapStyle]?.attribution || ''}"></p>

            ${this.isTouchDevice
                ? html`
                      <div class="map-controls">
                          <button class="control-button zoom-in" @click="${this.zoomIn}">
                              <img src="/a7/plugins/map-element/plus.svg" alt="Zoom In" />
                          </button>
                          <button class="control-button zoom-out" @click="${this.zoomOut}">
                              <img src="/a7/plugins/map-element/minus.svg" alt="Zoom Out" />
                          </button>
                          <button class="control-button pan-up" @click="${this.panUp}">
                              <img src="/a7/plugins/map-element/up.svg" alt="Pan Up" />
                          </button>
                          <button class="control-button pan-down" @click="${this.panDown}">
                              <img src="/a7/plugins/map-element/down.svg" alt="Pan Down" />
                          </button>
                          <button class="control-button pan-left" @click="${this.panLeft}">
                              <img src="/a7/plugins/map-element/left.svg" alt="Pan Left" />
                          </button>
                          <button class="control-button pan-right" @click="${this.panRight}">
                              <img src="/a7/plugins/map-element/right.svg" alt="Pan Right" />
                          </button>
                      </div>
                  `
                : ''}
        `;
    }
}

customElements.define('map-element', MapElement);
