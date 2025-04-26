import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

var d3Ready = new Promise(resolve => {
    if (window.d3) {
        resolve();
        return;
    }

    if (!document.querySelector('script[src*="d3"]')) {
        const d3Script = document.createElement('script');
        d3Script.src = '/a7/cdn/d3-7.9.0.min.js';
        d3Script.onload = () => resolve();
        document.head.appendChild(d3Script);
    }
});

class DocumentGraphElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            padding: 0;
            margin: 0;
            user-select: none;
            transition: none;
        }
        :host {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        #graph {
            width: 100%;
            height: 100%;
            background: var(--bg-1);
            position: relative;
        }
        .home-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: transparent;
            border: none;
            border-radius: var(--radius);
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 18px;
            z-index: 100;
            transition: all 0.2s ease;
        }
        .home-btn:hover {
            background: var(--bg-accent);
        }
        .node {
            cursor: pointer;
        }
        .node circle {
            fill: var(--bg-accent);
            stroke: var(--fg-accent);
            stroke-width: 2px;
            transition: all 0.3s ease;
        }
        .node text {
            fill: var(--fg-1);
            font-size: 12px;
            font-family: var(--font);
            opacity: 0.7;
            transition: all 0.3s ease;
        }
        .link {
            stroke: var(--border-1);
            stroke-opacity: 0.4;
            stroke-width: 1.5px;
            transition: all 0.3s ease;
        }
        .node.highlighted circle {
            fill: var(--fg-accent);
            stroke-width: 3px;
        }
        .node.highlighted text {
            fill: var(--fg-1);
            font-weight: bold;
            opacity: 1;
        }
        .link.highlighted {
            stroke: var(--fg-accent);
            stroke-opacity: 0.8;
            stroke-width: 2.5px;
        }
        .node.dimmed circle {
            fill: var(--bg-3);
            stroke: var(--border-1);
        }
        .node.dimmed text {
            opacity: 0.3;
        }
        .link.dimmed {
            stroke-opacity: 0.1;
        }
        .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            color: var(--fg-1);
            font-size: 16px;
        }
        .loading-spinner {
            width: 24px;
            height: 24px;
            border: 3px solid var(--fg-accent);
            border-radius: 50%;
            border-top-color: var(--bg-accent);
            animation: spin 0.8s linear infinite;
            margin-right: 10px;
        }
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
        /* --- END OF STYLES --- */
    `;

    static properties = {
        data: { type: Array },
        isLoading: { type: Boolean },
    };

    constructor() {
        super();
        this.data = [
            { id: 1, title: 'React Best Practices', terms: ['react', 'javascript', 'frontend', 'hooks', 'components', 'state-management'] },
            { id: 2, title: 'Modern JavaScript Guide', terms: ['javascript', 'es6', 'async', 'promises', 'modules'] },
            { id: 3, title: 'CSS Grid Layout', terms: ['css', 'layout', 'frontend', 'responsive', 'design'] },
            { id: 4, title: 'Node.js Architecture', terms: ['node', 'backend', 'architecture', 'javascript', 'server'] },
            { id: 5, title: 'GraphQL API Design', terms: ['graphql', 'api', 'backend', 'schema', 'queries'] },
            { id: 6, title: 'TypeScript Patterns', terms: ['typescript', 'javascript', 'patterns', 'types', 'interfaces'] },
            { id: 7, title: 'Redux State Management', terms: ['redux', 'react', 'state-management', 'frontend', 'store'] },
            { id: 8, title: 'MongoDB Best Practices', terms: ['mongodb', 'database', 'nosql', 'backend', 'queries'] },
            { id: 9, title: 'Web Security Guide', terms: ['security', 'authentication', 'encryption', 'web', 'https'] },
            { id: 10, title: 'Docker Containers', terms: ['docker', 'containers', 'devops', 'deployment'] },
            { id: 11, title: 'AWS Services Overview', terms: ['aws', 'cloud', 'services', 'devops', 'scaling'] },
            { id: 12, title: 'Frontend Testing', terms: ['testing', 'jest', 'frontend', 'react', 'components'] },
            { id: 13, title: 'API Authentication', terms: ['authentication', 'jwt', 'oauth', 'api', 'security'] },
            { id: 14, title: 'Microservices Design', terms: ['microservices', 'architecture', 'backend', 'scaling'] },
            { id: 15, title: 'Vue.js Components', terms: ['vue', 'frontend', 'components', 'javascript', 'reactive'] },
            { id: 16, title: 'Turbine Engine Design', terms: ['engineering', 'aerospace', 'turbine', 'mechanical'] },
            { id: 17, title: 'Robotics Automation', terms: ['robotics', 'automation', 'engineering', 'mechanical', 'control'] },
        ];
        // --- END OF DATA ---

        this.d3 = null; // Initialize d3 holder
        this.simulation = null;
        this.currentZoom = null;
        this.isLoading = true; // Add loading state

        this.handleThemeChange = () => {
            if (this.shadowRoot && this.d3) {
                // Check if d3 is initialized
                this.shadowRoot.querySelector('#graph').innerHTML = '';
                this.renderGraph();
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('wisk-theme-changed', this.handleThemeChange);
    }

    disconnectedCallback() {
        // Clean up simulation and listeners
        if (this.simulation) {
            this.simulation.stop();
        }
        window.removeEventListener('wisk-theme-changed', this.handleThemeChange);
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        super.disconnectedCallback();
    }

    async firstUpdated() {
        if (!this.shadowRoot?.querySelector('#graph')) return;

        try {
            await d3Ready;
            this.d3 = window.d3;
            this.isLoading = false;
            this.requestUpdate();

            let resizeTimeout;
            this.resizeObserver = new ResizeObserver(() => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    if (this.shadowRoot?.querySelector('#graph')) {
                        this.shadowRoot.querySelector('#graph').innerHTML = '';
                        this.renderGraph();
                    }
                }, 250);
            });
            this.resizeObserver.observe(this);

            this.renderGraph();
        } catch (error) {
            console.error('Error loading D3:', error);
            this.isLoading = false;
            this.requestUpdate();
            const graphDiv = this.shadowRoot.querySelector('#graph');
            if (graphDiv) {
                graphDiv.innerHTML = '<p style="color: var(--fg-red); padding: 20px;">Error loading D3.js library.</p>';
            }
        }
    }

    processDataForGraph() {
        const nodes = this.data.map(doc => ({
            id: doc.id,
            title: doc.title,
            terms: doc.terms,
        }));

        const links = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const commonTerms = nodes[i].terms.filter(term => nodes[j].terms.includes(term));
                if (commonTerms.length > 0) {
                    links.push({
                        source: nodes[i].id,
                        target: nodes[j].id,
                        strength: commonTerms.length,
                    });
                }
            }
        }

        return { nodes, links };
    }

    renderGraph() {
        const graphData = this.processDataForGraph();
        const width = this.offsetWidth;
        const height = this.offsetHeight;
        const d3 = this.d3;

        if (!d3 || !graphData.nodes.length || !width || !height) {
            console.warn('Cannot render graph: D3 not ready, no data, or zero dimensions.');
            return;
        }
        d3.select(this.shadowRoot.querySelector('#graph')).select('svg').remove();

        const svg = d3.select(this.shadowRoot.querySelector('#graph')).append('svg').attr('width', width).attr('height', height);

        const g = svg.append('g');

        const zoom = d3
            .zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', event => {
                g.attr('transform', event.transform);
            });

        this.currentZoom = zoom;
        svg.call(zoom);

        const simulation = d3
            .forceSimulation(graphData.nodes)
            .force(
                'link',
                d3
                    .forceLink(graphData.links)
                    .id(d => d.id)
                    .distance(d => 100 / (d.strength || 1))
                    .strength(d => 0.2 + d.strength * 0.1)
            )
            .force(
                'charge',
                d3.forceManyBody().strength(d => -500 - d.terms.length * 20)
            )
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force(
                'collision',
                d3.forceCollide().radius(d => 30 + d.terms.length * 2)
            )
            .force('x', d3.forceX(width / 2).strength(0.1))
            .force('y', d3.forceY(height / 2).strength(0.1));

        const link = g.append('g').selectAll('line').data(graphData.links).enter().append('line').attr('class', 'link');

        const node = g
            .append('g')
            .selectAll('.node')
            .data(graphData.nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .call(
                d3
                    .drag()
                    .on('start', (event, d) => this.dragstarted(event, d, simulation))
                    .on('drag', (event, d) => this.dragged(event, d))
                    .on('end', (event, d) => this.dragended(event, d, simulation))
            );

        node.append('circle').attr('r', d => 2 + d.terms.length);

        node.append('text')
            .attr('dx', 12)
            .attr('dy', '.35em')
            .text(d => d.title);

        this.nodeSelection = node;
        this.linkSelection = link;

        node.on('mouseover', (event, d) => {
            const connectedNodeIds = new Set([d.id]);
            link.each(l => {
                const sourceNode = typeof l.source === 'object' ? l.source : graphData.nodes.find(n => n.id === l.source);
                const targetNode = typeof l.target === 'object' ? l.target : graphData.nodes.find(n => n.id === l.target);

                if (sourceNode && targetNode) {
                    if (sourceNode.id === d.id) connectedNodeIds.add(targetNode.id);
                    if (targetNode.id === d.id) connectedNodeIds.add(sourceNode.id);
                }
            });

            const currentNodes = d3.select(this.shadowRoot).selectAll('.node');
            const currentLinks = d3.select(this.shadowRoot).selectAll('.link');

            currentNodes.classed('highlighted', n => n.id === d.id).classed('dimmed', n => !connectedNodeIds.has(n.id));

            currentLinks
                .classed('highlighted', l => {
                    const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
                    const targetId = typeof l.target === 'object' ? l.target.id : l.target;
                    return sourceId === d.id || targetId === d.id;
                })
                .classed('dimmed', l => {
                    const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
                    const targetId = typeof l.target === 'object' ? l.target.id : l.target;
                    return sourceId !== d.id && targetId !== d.id;
                });
        }).on('mouseout', () => {
            const currentNodes = d3.select(this.shadowRoot).selectAll('.node');
            const currentLinks = d3.select(this.shadowRoot).selectAll('.link');
            currentNodes.classed('highlighted', false).classed('dimmed', false);
            currentLinks.classed('highlighted', false).classed('dimmed', false);
        });

        simulation.on('tick', () => {
            link.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        this.simulation = simulation; // Store simulation instance
    }

    dragstarted(event, d, simulation) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; // Use d directly instead of event.subject
        d.fy = d.y;
    }

    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    dragended(event, d, simulation) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    resetView() {
        if (!this.d3 || !this.shadowRoot?.querySelector('svg') || !this.currentZoom || !this.simulation) return;

        const svg = this.d3.select(this.shadowRoot.querySelector('svg'));
        svg.transition().duration(750).call(this.currentZoom.transform, this.d3.zoomIdentity);
        this.simulation.alpha(0.5).restart();
    }

    render() {
        return html`
            <div id="graph">
                ${this.isLoading
                    ? html`
                          <div class="loading-container">
                              <div class="loading-spinner"></div>
                              <span>Loading D3.js...</span>
                          </div>
                      `
                    : ''}
            </div>
            <button class="home-btn" @click=${this.resetView} title="Reset View">
                <img src="/a7/plugins/document-graph/home.svg" alt="Home" width="22" height="22" style="filter: var(--accent-svg)" />
            </button>
        `;
    }
}

customElements.define('document-graph', DocumentGraphElement);
