import { LitElement, html, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './curve-visualizer.css';
import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/menu/sp-menu-item.js';

export interface CurveConfig {
    min: number;
    max: number;
    curve: number;
    spread: 'direct' | 'inverse' | 'central';
    multiplier: number;
}

@customElement('curve-visualizer')
export class CurveVisualizer extends LitElement {
    static styles = styles;

    @property({ type: String })
    label: string = '';

    @property({ type: String })
    parameterKey: string = '';

    @property({ type: String })
    control: string = '';

    @property({ type: String })
    outputLabel: string = 'Output';

    @property({
        type: Object,
        hasChanged: () => true
    })
    config?: CurveConfig;

    updated(changedProperties: Map<string, any>) {
        if (changedProperties.has('control')) {
            console.log(`${this.label} control changed to:`, this.control);
        }
        if (changedProperties.has('hoverPosition')) {
            console.log(`${this.label} hoverPosition changed to:`, this.hoverPosition);
        }
    }

    @property({ type: String })
    color: string = '#51cf66';

    @property({ 
        type: Number,
        hasChanged: () => true 
    })
    hoverPosition: number | null = null;

    private handleControlChange(e: Event) {
        const target = e.target as any;
        console.log('Picker changed:', target, 'value:', target?.value);
        if (target && target.value) {
            const newControl = target.value;
            console.log(`${this.label} emitting control-change:`, { parameterKey: this.parameterKey, control: newControl });
            this.dispatchEvent(new CustomEvent('control-change', {
                detail: { 
                    parameterKey: this.parameterKey,
                    control: newControl 
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    private generateCurvePath(config: CurveConfig, width: number, height: number): string {
        const points: string[] = [];
        const steps = 50;
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps; // 0 to 1 (bottom to top on tablet)
            
            // Apply spread
            let value;
            if (config.spread === 'central') {
                // Central mode: center (0.5) maps to max, edges (0.0 and 1.0) map to min
                const distanceFromCenter = Math.abs(t - 0.5) * 2.0;
                const curvedDistance = Math.pow(distanceFromCenter, config.curve);
                value = config.max - (curvedDistance * (config.max - config.min));
            } else if (config.spread === 'inverse') {
                // Inverse mode: high input = low output
                const curved = Math.pow(t, config.curve);
                value = config.max - (curved * (config.max - config.min));
            } else {
                // Direct mode: normal mapping (low input = low output)
                const curved = Math.pow(t, config.curve);
                value = config.min + (curved * (config.max - config.min));
            }
            
            // Normalize to 0-1 for display
            const normalizedValue = (value - config.min) / (config.max - config.min);
            
            // Map to SVG coordinates: X = tablet position, Y = output value (inverted)
            const x = t * width;
            const y = height - (normalizedValue * height); // Inverted so min = bottom, max = top
            
            points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
        }
        
        return points.join(' ');
    }

    render() {
        if (!this.config) {
            return html`<div>No configuration provided</div>`;
        }

        const graphWidth = 180;
        const graphHeight = 160;
        const padding = 30;
        const innerWidth = graphWidth - padding * 2;
        const innerHeight = graphHeight - padding * 2;

        const curvePath = this.generateCurvePath(this.config, innerWidth, innerHeight);

        // Calculate range text
        const effectiveMax = this.config.multiplier < 1.0 
            ? this.config.min + ((this.config.max - this.config.min) * this.config.multiplier)
            : this.config.max;
        const rangeText = this.config.multiplier < 1.0
            ? `Range: ${this.config.min.toFixed(2)} to ${effectiveMax.toFixed(2)} (${(this.config.multiplier * 100).toFixed(0)}%)`
            : `Range: ${this.config.min.toFixed(2)} to ${this.config.max.toFixed(2)}`;

        return html`
            <div class="curve-container">
                <svg width="${graphWidth}" height="${graphHeight + 60}" 
                     xmlns="http://www.w3.org/2000/svg">
                    <g class="curve-graph">
                        <!-- Graph title -->
                        <text x="${graphWidth / 2}" y="12" class="graph-title" text-anchor="middle">${this.label}</text>
                    
                    <!-- Background -->
                    <rect x="${padding}" y="${15 + padding}" 
                          width="${innerWidth}" height="${innerHeight}" 
                          class="graph-bg" />
                    
                    <!-- Axes -->
                    <line x1="${padding}" y1="${15 + padding}" 
                          x2="${padding}" y2="${15 + graphHeight - padding}" 
                          class="axis" />
                    <line x1="${padding}" y1="${15 + graphHeight - padding}" 
                          x2="${graphWidth - padding}" y2="${15 + graphHeight - padding}" 
                          class="axis" />
                    
                    <!-- Center line (for central spread) - vertical now -->
                    ${this.config.spread === 'central' ? svg`
                        <line x1="${padding + innerWidth / 2}" 
                              y1="${15 + padding}" 
                              x2="${padding + innerWidth / 2}" 
                              y2="${15 + graphHeight - padding}" 
                              stroke="#ffd43b"
                              stroke-width="1"
                              stroke-dasharray="3,3"
                              opacity="0.5" />
                    ` : ''}
                    
                    <!-- Min/Max labels on Y-axis -->
                    <text x="${padding - 5}" y="${15 + graphHeight - padding + 5}" class="axis-label" text-anchor="end">${this.config.min.toFixed(2)}</text>
                    <text x="${padding - 5}" y="${15 + padding + 5}" class="axis-label" text-anchor="end">${this.config.max.toFixed(2)}</text>
                    <text x="${padding - 10}" y="${15 + padding + innerHeight / 2}" class="axis-label" text-anchor="middle" 
                        transform="rotate(-90, ${padding - 10}, ${15 + padding + innerHeight / 2})">${this.outputLabel}</text>
                    
                    <!-- Curve line -->
                    <polyline points="${curvePath}" 
                        class="curve-line"
                        stroke="${this.color}"
                        stroke-width="2.5"
                        transform="translate(${padding}, ${15 + padding})" />
                    
                    <!-- Hover position indicator -->
                    ${this.hoverPosition !== null ? svg`
                        <line x1="${padding + (this.hoverPosition * innerWidth)}" 
                              y1="${15 + padding}" 
                              x2="${padding + (this.hoverPosition * innerWidth)}" 
                              y2="${15 + graphHeight - padding}" 
                              stroke="#51cf66"
                              stroke-width="2"
                              opacity="0.6"
                              stroke-dasharray="4,4" />
                    ` : ''}
                    
                    <!-- Info labels -->
                    <text x="${graphWidth / 2}" y="${15 + graphHeight + 18}" class="info-label" text-anchor="middle">${rangeText}</text>
                    <text x="${graphWidth / 2}" y="${15 + graphHeight + 31}" class="info-label" text-anchor="middle">Curve: ${this.config.curve.toFixed(2)} • ${this.config.spread}</text>
                    <text x="${graphWidth / 2}" y="${15 + graphHeight + 44}" class="info-label" text-anchor="middle">Multiplier: ${this.config.multiplier.toFixed(2)}</text>
                </g>
            </svg>
            
            <!-- Control selector -->
            <div class="control-selector">
                <sp-picker 
                    size="s" 
                    value="${this.control}"
                    @change=${this.handleControlChange}>
                    <sp-menu-item value="yaxis">Y-Axis Position</sp-menu-item>
                    <sp-menu-item value="pressure">Stylus Pressure</sp-menu-item>
                    <sp-menu-item value="tiltX">Tilt X</sp-menu-item>
                    <sp-menu-item value="tiltY">Tilt Y</sp-menu-item>
                    <sp-menu-item value="tiltXY">Tilt X+Y</sp-menu-item>
                </sp-picker>
            </div>
        </div>
        `;
    }
}

