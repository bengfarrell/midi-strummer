import { html, LitElement, svg } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './tablet-visualizer.css';
import '../curve-visualizer/curve-visualizer';
import { TabletExpressionConfig } from '../tablet-expression-controls/tablet-expression-controls.js';

@customElement('tablet-visualizer')
export class TabletVisualizer extends LitElement {
    static styles = styles;

    @state()
    private hoverPosition: number | null = null;

    @state()
    private pressure: number = 0;

    @state()
    private isPressingTablet: boolean = false;

    @state()
    private clickPosition: { x: number; y: number } | null = null;

    private pressureAnimationFrame: number | null = null;

    @property({ 
        type: Object,
        hasChanged: () => true // Always update when property is set
    })
    noteDuration?: TabletExpressionConfig;

    @property({ 
        type: Object,
        hasChanged: () => true // Always update when property is set
    })
    pitchBend?: TabletExpressionConfig;

    @property({ 
        type: Object,
        hasChanged: () => true // Always update when property is set
    })
    noteVelocity?: TabletExpressionConfig;

    private handleControlChange(e: CustomEvent) {
        console.log('tablet-visualizer received control-change:', e.detail);
        const { parameterKey, control } = e.detail;
        
        // Bubble up to parent (app component) with the parameter key and new control
        const configChange = { [`${parameterKey}.control`]: control };
        console.log('tablet-visualizer bubbling config-change:', configChange);
        this.dispatchEvent(new CustomEvent('config-change', {
            detail: configChange,
            bubbles: true,
            composed: true
        }));
    }

    private handleTabletMouseMove(e: MouseEvent) {
        const svg = e.currentTarget as SVGSVGElement;
        const rect = svg.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const tabletY = 20;
        const tabletHeight = 200;
        
        // Calculate position as 0-1 (bottom to top)
        const relativeY = Math.max(0, Math.min(1, (y - tabletY) / tabletHeight));
        this.hoverPosition = 1 - relativeY; // Invert so bottom = 0, top = 1
        
        // Update click position if pressing
        if (this.isPressingTablet) {
            const x = e.clientX - rect.left;
            this.clickPosition = { x, y };
        }
    }

    private handleTabletMouseLeave() {
        this.hoverPosition = null;
    }

    private handleTabletMouseDown(e: MouseEvent) {
        const svg = e.currentTarget as SVGSVGElement;
        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.isPressingTablet = true;
        this.clickPosition = { x, y };
        this.pressure = 0;
        this.animatePressure();
    }

    private handleTabletMouseUp() {
        this.isPressingTablet = false;
        this.pressure = 0;
        this.clickPosition = null;
        if (this.pressureAnimationFrame !== null) {
            cancelAnimationFrame(this.pressureAnimationFrame);
            this.pressureAnimationFrame = null;
        }
    }

    private animatePressure() {
        if (!this.isPressingTablet) return;
        
        // Increase pressure over time (0 to 1 over ~1 second)
        this.pressure = Math.min(1, this.pressure + 0.02);
        
        if (this.pressure < 1) {
            this.pressureAnimationFrame = requestAnimationFrame(() => this.animatePressure());
        }
    }

    connectedCallback() {
        super.connectedCallback();
        // Add global mouseup listener to handle releases outside the SVG
        window.addEventListener('mouseup', this.handleGlobalMouseUp);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.pressureAnimationFrame !== null) {
            cancelAnimationFrame(this.pressureAnimationFrame);
        }
        window.removeEventListener('mouseup', this.handleGlobalMouseUp);
    }

    private handleGlobalMouseUp = () => {
        if (this.isPressingTablet) {
            this.handleTabletMouseUp();
        }
    }

    private renderTablet() {
        const tabletWidth = 240;
        const tabletHeight = 200;
        const tabletX = 0;
        const tabletY = 20;
        
        return svg`
            <svg width="${tabletWidth}" height="${tabletHeight + 60}" 
                 xmlns="http://www.w3.org/2000/svg"
                 @mousemove=${this.handleTabletMouseMove}
                 @mouseleave=${this.handleTabletMouseLeave}
                 @mousedown=${this.handleTabletMouseDown}
                 @mouseup=${this.handleTabletMouseUp}
                 class="tablet-svg">
                
                <!-- Tablet body -->
                <rect x="${tabletX + 20}" y="${tabletY}" width="${tabletWidth - 40}" height="${tabletHeight}" 
                    class="tablet-body" rx="15" />
                
                <!-- Active area -->
                <rect x="${tabletX + 40}" y="${tabletY + 20}" width="${tabletWidth - 80}" height="${tabletHeight - 40}" 
                    class="tablet-surface" rx="8" />
                
                ${this.clickPosition && this.isPressingTablet ? svg`
                    <!-- Pressure indicator dot -->
                    <circle cx="${this.clickPosition.x}" 
                            cy="${this.clickPosition.y}" 
                            r="12" 
                            fill="#ff6b6b"
                            opacity="${this.pressure}" />
                ` : ''}
                
                <!-- Title -->
                <text x="${tabletWidth / 2}" y="15" class="tablet-label" text-anchor="middle">Drawing Tablet</text>
                
                <!-- Bottom/Top labels -->
                <text x="${tabletWidth / 2}" y="${tabletY + tabletHeight + 20}" class="axis-label" text-anchor="middle">Bottom → Top</text>
            </svg>
        `;
    }

    private hasYAxisMapping(): boolean {
        return this.noteDuration?.control === 'yaxis' || 
               this.pitchBend?.control === 'yaxis' || 
               this.noteVelocity?.control === 'yaxis';
    }

    render() {
        if (!this.noteDuration && !this.pitchBend && !this.noteVelocity) {
            return html`
                <div class="no-mappings">
                    <p>No expression parameters configured</p>
                </div>
            `;
        }

        const colors = ['#51cf66', '#339af0', '#ff6b6b'];
        const showTablet = this.hasYAxisMapping();
        
        // Build array of all parameters
        const allParameters: Array<{name: string; key: string; config: TabletExpressionConfig; color: string}> = [];
        
        if (this.noteDuration) {
            allParameters.push({
                name: 'Note Duration',
                key: 'noteDuration',
                config: this.noteDuration,
                color: colors[0]
            });
        }
        if (this.pitchBend) {
            allParameters.push({
                name: 'Pitch Bend',
                key: 'pitchBend',
                config: this.pitchBend,
                color: colors[1]
            });
        }
        if (this.noteVelocity) {
            allParameters.push({
                name: 'Note Velocity',
                key: 'noteVelocity',
                config: this.noteVelocity,
                color: colors[2]
            });
        }
        
        return html`
            <div class="container">
                ${showTablet ? html`
                    <div class="tablet-container">
                        ${this.renderTablet()}
                    </div>
                ` : ''}
                
                <div class="visualizer">
                    ${allParameters.map(param => {
                        const isYAxis = param.config.control === 'yaxis';
                        const isPressure = param.config.control === 'pressure';
                        
                        return html`
                            <curve-visualizer
                                .label="${param.name}"
                                .parameterKey="${param.key}"
                                .control="${param.config.control}"
                                .outputLabel="Value"
                                .config="${param.config}"
                                .color="${param.color}"
                                .hoverPosition="${isYAxis ? this.hoverPosition : (isPressure ? this.pressure : null)}"
                                @control-change=${this.handleControlChange}>
                            </curve-visualizer>
                        `;
                    })}
                </div>
            </div>
        `;
    }
}

