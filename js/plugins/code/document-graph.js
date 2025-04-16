import { html, css, LitElement } from '/a7/cdn/lit-core-2.7.4.min.js';

class DocumentGraphElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            padding: 0;
            margin: 0;
            user-select: none;
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
    `;

    static properties = {
        data: { type: Array },
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

        this.handleThemeChange = () => {
            if (this.shadowRoot) {
                this.shadowRoot.querySelector('#graph').innerHTML = '';
                this.renderGraph();
            }
        };
    }

    opened() {}

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('wisk-theme-changed', this.handleThemeChange);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('wisk-theme-changed', this.handleThemeChange);
    }

    async firstUpdated() {
        if (!this.shadowRoot?.querySelector('#graph')) return;

        const d3Module = await import('https://cdn.jsdelivr.net/npm/d3@7/+esm');
        const { select, forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, zoom, drag, forceX, forceY, zoomIdentity } = d3Module;
        this.d3 = {
            select,
            forceSimulation,
            forceLink,
            forceManyBody,
            forceCenter,
            forceCollide,
            zoom,
            drag,
            forceX,
            forceY,
            zoomIdentity,
        };

        let resizeTimeout;
        const ro = new ResizeObserver(() => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.shadowRoot.querySelector('#graph').innerHTML = '';
                this.renderGraph();
            }, 250);
        });
        ro.observe(this);

        this.renderGraph();
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

        if (!d3 || !graphData.nodes.length) return;

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
            .call(d3.drag().on('start', this.dragstarted.bind(this)).on('drag', this.dragged.bind(this)).on('end', this.dragended.bind(this)));

        node.append('circle').attr('r', d => 2 + d.terms.length);

        node.append('text')
            .attr('dx', 12)
            .attr('dy', '.35em')
            .text(d => d.title);

        node.on('mouseover', (event, d) => {
            const connectedNodeIds = new Set();
            link.each(l => {
                if (l.source.id === d.id) connectedNodeIds.add(l.target.id);
                if (l.target.id === d.id) connectedNodeIds.add(l.source.id);
            });

            node.classed('highlighted', n => n.id === d.id).classed('dimmed', n => n.id !== d.id && !connectedNodeIds.has(n.id));

            link.classed('highlighted', l => l.source.id === d.id || l.target.id === d.id).classed(
                'dimmed',
                l => l.source.id !== d.id && l.target.id !== d.id
            );
        }).on('mouseout', () => {
            node.classed('highlighted', false).classed('dimmed', false);
            link.classed('highlighted', false).classed('dimmed', false);
        });

        simulation.on('tick', () => {
            link.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        this.simulation = simulation;
    }

    dragstarted(event) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    dragended(event) {
        if (!event.active) this.simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    resetView() {
        const svg = this.d3.select(this.shadowRoot.querySelector('svg'));
        const zoom = this.currentZoom;
        if (svg && zoom) {
            svg.transition().duration(750).call(zoom.transform, this.d3.zoomIdentity);
            this.simulation.alpha(1).restart();
        }
    }

    render() {
        return html`
            <div id="graph"></div>
            <button class="home-btn" @click=${this.resetView} title="Reset View">
                <img src="/a7/plugins/document-graph/home.svg" alt="Home" width="22" height="22" style="filter: var(--accent-svg)" />
            </button>
        `;
    }
}

customElements.define('document-graph', DocumentGraphElement);
