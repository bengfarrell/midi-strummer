import { LitElement, html, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './curve-visualizer.css';
import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/menu/sp-menu-item.js';
import '@spectrum-web-components/number-field/sp-number-field.js';
import { sharedTabletInteraction } from '../../controllers';

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

    constructor() {
        super();
        // Register with the shared tablet interaction controller
        sharedTabletInteraction.addHost(this);
    }

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
    
    /**
     * Calculate hover position based on controller state and control type
     */
    private getHoverPositionFromController(): number | null {
        const state = sharedTabletInteraction.state;
        
        switch (this.control) {
            case 'yaxis':
                // Y-axis uses tablet Y position (normalized 0-1)
                // Show position even when just hovering (not pressed)
                return state.tabletY;
            
            case 'pressure':
                // Pressure from pen (0-1) - only show when tilt is pressed
                return state.tiltPressed ? state.tiltPressure : null;
            
            case 'tiltX':
                // Tilt X normalized from -1..1 to 0..1 - only show when tilt is pressed
                return state.tiltPressed ? (state.tiltX + 1) / 2 : null;
            
            case 'tiltY':
                // Tilt Y normalized from -1..1 to 0..1 - only show when tilt is pressed
                return state.tiltPressed ? (state.tiltY + 1) / 2 : null;
            
            case 'tiltXY':
                // Combined tilt magnitude with sign - use value from controller (calculated by Python)
                // Only show when tilt is pressed
                if (state.tiltPressed) {
                    // state.tiltXY ranges from -1 to +1, normalize to 0-1 for display
                    const normalized = (state.tiltXY + 1) / 2;
                    return normalized;
                }
                return null;
            
            default:
                return null;
        }
    }

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

    private handleMinChange(e: Event) {
        const target = e.target as any;
        const newMin = parseFloat(target.value);
        if (!isNaN(newMin)) {
            this.dispatchEvent(new CustomEvent('config-change', {
                detail: { 
                    [`${this.parameterKey}.min`]: newMin
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    private handleMaxChange(e: Event) {
        const target = e.target as any;
        const newMax = parseFloat(target.value);
        if (!isNaN(newMax)) {
            this.dispatchEvent(new CustomEvent('config-change', {
                detail: { 
                    [`${this.parameterKey}.max`]: newMax
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    private handleCurveChange(e: Event) {
        const target = e.target as any;
        const newCurve = parseFloat(target.value);
        if (!isNaN(newCurve)) {
            this.dispatchEvent(new CustomEvent('config-change', {
                detail: { 
                    [`${this.parameterKey}.curve`]: newCurve
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    private handleMultiplierChange(e: Event) {
        const target = e.target as any;
        const newMultiplier = parseFloat(target.value);
        if (!isNaN(newMultiplier)) {
            this.dispatchEvent(new CustomEvent('config-change', {
                detail: { 
                    [`${this.parameterKey}.multiplier`]: newMultiplier
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    private handleSpreadChange(e: Event) {
        const target = e.target as any;
        if (target && target.value) {
            this.dispatchEvent(new CustomEvent('config-change', {
                detail: { 
                    [`${this.parameterKey}.spread`]: target.value
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    /**
     * Calculate the output value for a given input position (0-1)
     */
    private calculateOutputValue(config: CurveConfig, t: number): number {
        if (config.spread === 'central') {
            // Central mode: center (0.5) maps to max, edges (0.0 and 1.0) map to min
            const distanceFromCenter = Math.abs(t - 0.5) * 2.0;
            const curvedDistance = Math.pow(distanceFromCenter, config.curve);
            return config.max - (curvedDistance * (config.max - config.min));
        } else if (config.spread === 'inverse') {
            // Inverse mode: high input = low output
            const curved = Math.pow(t, config.curve);
            return config.max - (curved * (config.max - config.min));
        } else {
            // Direct mode: normal mapping (low input = low output)
            const curved = Math.pow(t, config.curve);
            return config.min + (curved * (config.max - config.min));
        }
    }

    private generateCurvePath(config: CurveConfig, width: number, height: number): string {
        const points: string[] = [];
        const steps = 50;
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps; // 0 to 1 (bottom to top on tablet)
            
            // Calculate output value
            const value = this.calculateOutputValue(config, t);
            
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
        const strokeInset = 3; // Additional inset to prevent stroke from overlapping borders
        const innerWidth = graphWidth - padding * 2;
        const innerHeight = graphHeight - padding * 2;
        const curveWidth = innerWidth - strokeInset * 2;
        const curveHeight = innerHeight - strokeInset * 2;

        const curvePath = this.generateCurvePath(this.config, curveWidth, curveHeight);
        
        // Get hover position from controller based on current control type
        const hoverPosition = this.getHoverPositionFromController();
        
        // Calculate final output value if we have a hover position
        const outputValue = hoverPosition !== null ? this.calculateOutputValue(this.config, hoverPosition) : null;

        return html`
            <div class="curve-container">
                <!-- Graph -->
                <div class="graph-container">
                    <svg width="${graphWidth}" height="${graphHeight}" 
                         viewBox="0 0 ${graphWidth} ${graphHeight}"
                         preserveAspectRatio="xMidYMid meet"
                         xmlns="http://www.w3.org/2000/svg">
                    <g class="curve-graph">
                    <!-- Background -->
                    <rect x="${padding}" y="${padding}" 
                          width="${innerWidth}" height="${innerHeight}" 
                          class="graph-bg" />
                    
                    <!-- Axes -->
                    <line x1="${padding}" y1="${padding}" 
                          x2="${padding}" y2="${graphHeight - padding}" 
                          class="axis" />
                    <line x1="${padding}" y1="${graphHeight - padding}" 
                          x2="${graphWidth - padding}" y2="${graphHeight - padding}" 
                          class="axis" />
                    
                    <!-- Center line (for central spread) - vertical now -->
                    ${this.config.spread === 'central' ? svg`
                        <line x1="${padding + strokeInset + curveWidth / 2}" 
                              y1="${padding}" 
                              x2="${padding + strokeInset + curveWidth / 2}" 
                              y2="${graphHeight - padding}" 
                              stroke="#ffd43b"
                              stroke-width="1"
                              stroke-dasharray="3,3"
                              opacity="0.5" />
                    ` : ''}
                    
                    <!-- Min/Max labels on Y-axis -->
                    <text x="${padding - 5}" y="${graphHeight - padding + 5}" class="axis-label" text-anchor="end">${this.config.min.toFixed(2)}</text>
                    <text x="${padding - 5}" y="${padding + 5}" class="axis-label" text-anchor="end">${this.config.max.toFixed(2)}</text>
                    <text x="${padding - 10}" y="${padding + innerHeight / 2}" class="axis-label" text-anchor="middle" 
                        transform="rotate(-90, ${padding - 10}, ${padding + innerHeight / 2})">${this.outputLabel}</text>
                    
                    <!-- Curve line -->
                    <polyline points="${curvePath}" 
                        class="curve-line"
                        stroke="${this.color}"
                        stroke-width="2.5"
                        transform="translate(${padding + strokeInset}, ${padding + strokeInset})" />
                    
                    <!-- Hover position indicator -->
                    ${hoverPosition !== null && outputValue !== null ? svg`
                        <line x1="${padding + strokeInset + (hoverPosition * curveWidth)}" 
                              y1="${padding}" 
                              x2="${padding + strokeInset + (hoverPosition * curveWidth)}" 
                              y2="${graphHeight - padding}" 
                              stroke="#51cf66"
                              stroke-width="2"
                              opacity="0.6"
                              stroke-dasharray="4,4" />
                        
                        <!-- Output value label -->
                        <text x="${padding + strokeInset + (hoverPosition * curveWidth)}" 
                              y="${padding - 8}"
                              text-anchor="middle"
                              font-size="11"
                              fill="#51cf66"
                              font-weight="600">
                            ${outputValue.toFixed(3)}
                        </text>
                    ` : ''}
                </g>
            </svg>
                </div>
                
                <!-- Controls Grid -->
                <div class="controls-grid">
                    <div class="control-selector-top">
                        <label class="control-selector-label">Controlled by:</label>
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
                    
                    <div class="range-field">
                        <label class="range-label">Spread</label>
                        <sp-picker 
                            size="s" 
                            value="${this.config.spread}"
                            @change=${this.handleSpreadChange}>
                            <sp-menu-item value="direct">Direct</sp-menu-item>
                            <sp-menu-item value="inverse">Inverse</sp-menu-item>
                            <sp-menu-item value="central">Central</sp-menu-item>
                        </sp-picker>
                    </div>
                    
                    <div class="range-field">
                        <label class="range-label">Min</label>
                        <sp-number-field 
                            size="s"
                            value="${this.config.min}"
                            @change=${this.handleMinChange}
                            step="0.1">
                        </sp-number-field>
                    </div>
                    
                    <div class="range-field">
                        <label class="range-label">Max</label>
                        <sp-number-field 
                            size="s"
                            value="${this.config.max}"
                            @change=${this.handleMaxChange}
                            step="0.1">
                        </sp-number-field>
                    </div>
                    
                    <div class="range-field">
                        <label class="range-label">Curve</label>
                        <sp-number-field 
                            size="s"
                            value="${this.config.curve}"
                            @change=${this.handleCurveChange}
                            step="0.1"
                            min="0.1">
                        </sp-number-field>
                    </div>
                    
                    <div class="range-field">
                        <label class="range-label">Multiplier</label>
                        <sp-number-field 
                            size="s"
                            value="${this.config.multiplier}"
                            @change=${this.handleMultiplierChange}
                            step="0.1"
                            min="0"
                            max="2">
                        </sp-number-field>
                    </div>
                </div>
            </div>
        `;
    }
}

