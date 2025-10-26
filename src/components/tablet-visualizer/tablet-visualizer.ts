import { html, LitElement, svg } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './tablet-visualizer.css';
import '../curve-visualizer/curve-visualizer';
import { TabletExpressionConfig } from '../tablet-expression-controls/tablet-expression-controls.js';

@customElement('tablet-visualizer')
export class TabletVisualizer extends LitElement {
    static styles = styles;

    @state()
    private pressure: number = 0;

    @state()
    private isPressingTablet: boolean = false;

    @state()
    private clickPosition: { x: number; y: number } | null = null;

    @state()
    private tiltX: number = 0;

    @state()
    private tiltY: number = 0;

    @state()
    private tiltPressure: number = 0;

    @state()
    private isPressingTilt: boolean = false;

    @state()
    private pressedButtons: Set<number> = new Set();

    @state()
    private primaryButtonPressed: boolean = false;

    @state()
    private secondaryButtonPressed: boolean = false;

    // Dummy hardware config - will be replaced with actual config later
    private hardwareConfig = {
        buttonCount: 8
    };

    private pressureAnimationFrame: number | null = null;
    private tiltPressureAnimationFrame: number | null = null;

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

    @property({ type: String })
    mode: 'both' | 'tablet' | 'tilt' = 'both';

    private handleTabletMouseMove(e: MouseEvent) {
        // Update click position if pressing
        if (this.isPressingTablet) {
            const svg = e.currentTarget as SVGSVGElement;
            const rect = svg.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.clickPosition = { x, y };
        }
    }

    private handleTabletMouseLeave() {
        // No action needed
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

    private handleTiltMouseMove(e: MouseEvent) {
        if (!this.isPressingTilt) return;
        
        const svg = e.currentTarget as SVGSVGElement;
        const rect = svg.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate position relative to center (-1 to 1)
        const relativeX = (x - centerX) / (centerX * 0.8); // 0.8 to keep within bounds
        const relativeY = (y - centerY) / (centerY * 0.8);
        
        // Clamp to circle
        const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
        if (distance > 1) {
            this.tiltX = relativeX / distance;
            this.tiltY = relativeY / distance;
        } else {
            this.tiltX = relativeX;
            this.tiltY = relativeY;
        }
    }

    private handleTiltMouseDown(e: MouseEvent) {
        this.isPressingTilt = true;
        this.tiltPressure = 0;
        this.handleTiltMouseMove(e);
        this.animateTiltPressure();
    }

    private handleTiltMouseUp() {
        this.isPressingTilt = false;
        this.tiltPressure = 0;
        this.tiltX = 0;
        this.tiltY = 0;
        if (this.tiltPressureAnimationFrame !== null) {
            cancelAnimationFrame(this.tiltPressureAnimationFrame);
            this.tiltPressureAnimationFrame = null;
        }
    }

    private animateTiltPressure() {
        if (!this.isPressingTilt) return;
        
        // Increase pressure over time (0 to 1 over ~1 second)
        this.tiltPressure = Math.min(1, this.tiltPressure + 0.02);
        
        if (this.tiltPressure < 1) {
            this.tiltPressureAnimationFrame = requestAnimationFrame(() => this.animateTiltPressure());
        }
    }

    private handleButtonMouseDown(buttonIndex: number, e: MouseEvent) {
        e.stopPropagation(); // Prevent tablet events
        this.pressedButtons = new Set(this.pressedButtons).add(buttonIndex);
    }

    private handleButtonMouseUp(buttonIndex: number, e: MouseEvent) {
        e.stopPropagation(); // Prevent tablet events
        const newSet = new Set(this.pressedButtons);
        newSet.delete(buttonIndex);
        this.pressedButtons = newSet;
    }

    private handleStylusButtonMouseDown(isPrimary: boolean, e: MouseEvent) {
        e.stopPropagation(); // Prevent tilt events
        if (isPrimary) {
            this.primaryButtonPressed = true;
        } else {
            this.secondaryButtonPressed = true;
        }
    }

    private handleStylusButtonMouseUp(isPrimary: boolean, e: MouseEvent) {
        e.stopPropagation(); // Prevent tilt events
        if (isPrimary) {
            this.primaryButtonPressed = false;
        } else {
            this.secondaryButtonPressed = false;
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
        if (this.tiltPressureAnimationFrame !== null) {
            cancelAnimationFrame(this.tiltPressureAnimationFrame);
        }
        window.removeEventListener('mouseup', this.handleGlobalMouseUp);
    }

    private handleGlobalMouseUp = () => {
        if (this.isPressingTablet) {
            this.handleTabletMouseUp();
        }
        if (this.isPressingTilt) {
            this.handleTiltMouseUp();
        }
        // Clear all button presses on global mouse up
        if (this.pressedButtons.size > 0) {
            this.pressedButtons = new Set();
        }
        // Clear stylus button presses
        if (this.primaryButtonPressed) {
            this.primaryButtonPressed = false;
        }
        if (this.secondaryButtonPressed) {
            this.secondaryButtonPressed = false;
        }
    }

    private renderButtons(tabletWidth: number, buttonAreaY: number) {
        const buttonCount = this.hardwareConfig.buttonCount;
        if (buttonCount === 0) return svg``;
        
        const buttonWidth = 18;
        const buttonHeight = 30;
        const buttonGap = 6;
        const totalButtonsWidth = (buttonWidth * buttonCount) + (buttonGap * (buttonCount - 1));
        const startX = (tabletWidth - totalButtonsWidth) / 2;
        
        return svg`
            ${Array.from({ length: buttonCount }, (_, i) => {
                const buttonX = startX + (i * (buttonWidth + buttonGap));
                const isPressed = this.pressedButtons.has(i);
                
                return svg`
                    <g class="tablet-button">
                        <!-- Button background -->
                        <rect x="${buttonX}" y="${buttonAreaY}" 
                              width="${buttonWidth}" height="${buttonHeight}"
                              rx="3"
                              fill="${isPressed ? '#51cf66' : '#495057'}"
                              stroke="#adb5bd"
                              stroke-width="1"
                              @mousedown=${(e: MouseEvent) => this.handleButtonMouseDown(i, e)}
                              @mouseup=${(e: MouseEvent) => this.handleButtonMouseUp(i, e)}
                              class="button-rect" />
                        
                        <!-- Button number label -->
                        <text x="${buttonX + buttonWidth / 2}" y="${buttonAreaY + buttonHeight / 2 + 4}"
                              text-anchor="middle"
                              font-size="10"
                              fill="${isPressed ? '#000' : '#f8f9fa'}"
                              font-weight="600"
                              pointer-events="none">
                            ${i + 1}
                        </text>
                    </g>
                `;
            })}
        `;
    }

    private renderTablet() {
        const tabletWidth = 240;
        const tabletHeight = 200;
        const tabletX = 0;
        const tabletY = 60; // Increased to make room for buttons
        const buttonAreaY = 20;
        
        return svg`
            <svg width="${tabletWidth}" height="${tabletHeight + 100}" 
                 xmlns="http://www.w3.org/2000/svg"
                 class="tablet-svg">
                
                <!-- Title -->
                <text x="${tabletWidth / 2}" y="15" class="tablet-label" text-anchor="middle">Drawing Tablet</text>
                
                <!-- Buttons at the top -->
                ${this.renderButtons(tabletWidth, buttonAreaY)}
                
                <!-- Tablet body (with pointer events for the main area) -->
                <rect x="${tabletX + 20}" y="${tabletY}" width="${tabletWidth - 40}" height="${tabletHeight}" 
                    class="tablet-body" rx="15"
                    @mousemove=${this.handleTabletMouseMove}
                    @mouseleave=${this.handleTabletMouseLeave}
                    @mousedown=${this.handleTabletMouseDown}
                    @mouseup=${this.handleTabletMouseUp} />
                
                <!-- Active area -->
                <rect x="${tabletX + 40}" y="${tabletY + 20}" width="${tabletWidth - 80}" height="${tabletHeight - 40}" 
                    class="tablet-surface" rx="8"
                    pointer-events="none" />
                
                ${this.clickPosition && this.isPressingTablet ? svg`
                    <!-- Pressure indicator dot -->
                    <circle cx="${this.clickPosition.x}" 
                            cy="${this.clickPosition.y}" 
                            r="12" 
                            fill="#ff6b6b"
                            opacity="${this.pressure}"
                            pointer-events="none" />
                ` : ''}
                
                <!-- Bottom/Top labels -->
                <text x="${tabletWidth / 2}" y="${tabletY + tabletHeight + 20}" class="axis-label" text-anchor="middle">Bottom → Top</text>
            </svg>
        `;
    }

    private renderStylusButtons(svgWidth: number, yPosition: number) {
        const penWidth = 15;
        const penLength = 100;
        const centerX = svgWidth / 2;
        const centerY = yPosition + 20;
        
        // Button dimensions
        const buttonWidth = 12;
        const buttonHeight = 18;
        const buttonSpacing = 8;
        
        // Position buttons on the pen body (before rotation)
        const button1X = 25;
        const button2X = button1X + buttonHeight + buttonSpacing;
        
        return svg`
            <g class="stylus-pen" transform="translate(${centerX - penLength/2}, ${centerY - penWidth/2})">
                <!-- Pen tip (pointing left) -->
                <path d="M 0 ${penWidth/2} 
                         L 15 ${penWidth/2 - 4}
                         L 15 ${penWidth/2 + 4}
                         Z"
                      fill="#6c757d"
                      stroke="#495057"
                      stroke-width="1"
                      pointer-events="none" />
                
                <!-- Pen body -->
                <rect x="15" y="0" 
                      width="${penLength - 30}" height="${penWidth}"
                      rx="2"
                      fill="#343a40"
                      stroke="#495057"
                      stroke-width="1"
                      pointer-events="none" />
                
                <!-- Pen grip area (textured section) -->
                <rect x="60" y="0" 
                      width="15" height="${penWidth}"
                      rx="2"
                      fill="#2c2e33"
                      opacity="0.8"
                      pointer-events="none" />
                
                <!-- Pen eraser end (right side) -->
                <ellipse cx="${penLength - 12}" cy="${penWidth/2}"
                         rx="3" ry="${penWidth / 2}"
                         fill="#495057"
                         pointer-events="none" />
                <rect x="${penLength - 15}" y="0" 
                      width="8" height="${penWidth}"
                      fill="#495057"
                      pointer-events="none" />
                
                <!-- Primary Button (closer to tip, on top of pen) -->
                <rect x="${button1X}" y="${penWidth/2 - buttonWidth/2}" 
                      width="${buttonHeight}" height="${buttonWidth}"
                      rx="2"
                      fill="${this.primaryButtonPressed ? '#51cf66' : '#495057'}"
                      stroke="${this.primaryButtonPressed ? '#40c057' : '#6c757d'}"
                      stroke-width="1"
                      @mousedown=${(e: MouseEvent) => this.handleStylusButtonMouseDown(true, e)}
                      @mouseup=${(e: MouseEvent) => this.handleStylusButtonMouseUp(true, e)}
                      class="button-rect" />
                
                <!-- Secondary Button (further from tip, on top of pen) -->
                <rect x="${button2X}" y="${penWidth/2 - buttonWidth/2}" 
                      width="${buttonHeight}" height="${buttonWidth}"
                      rx="2"
                      fill="${this.secondaryButtonPressed ? '#51cf66' : '#495057'}"
                      stroke="${this.secondaryButtonPressed ? '#40c057' : '#6c757d'}"
                      stroke-width="1"
                      @mousedown=${(e: MouseEvent) => this.handleStylusButtonMouseDown(false, e)}
                      @mouseup=${(e: MouseEvent) => this.handleStylusButtonMouseUp(false, e)}
                      class="button-rect" />
            </g>
        `;
    }

    private renderTilt() {
        const size = 240;
        const centerX = size / 2;
        const centerY = size / 2 + 50; // Increased offset for title and buttons
        const maxRadius = 90;
        const buttonsY = 20;
        
        // Calculate pressure rings
        const pressureRings = 5;
        const activeRing = Math.floor(this.tiltPressure * pressureRings);
        
        // Calculate tilt indicator position
        const tiltLineEndX = centerX + this.tiltX * maxRadius;
        const tiltLineEndY = centerY + this.tiltY * maxRadius;
        
        return svg`
            <svg width="${size}" height="${size + 70}" 
                 xmlns="http://www.w3.org/2000/svg"
                 class="tilt-svg">
                
                <!-- Title -->
                <text x="${centerX}" y="15" class="tablet-label" text-anchor="middle">Pen Tilt & Pressure</text>
                
                <!-- Stylus Buttons -->
                ${this.renderStylusButtons(size, buttonsY)}
                
                <!-- Interactive area for tilt (invisible circle that captures events) -->
                <circle cx="${centerX}" cy="${centerY}" r="${maxRadius}"
                    fill="transparent"
                    @mousemove=${this.handleTiltMouseMove}
                    @mousedown=${this.handleTiltMouseDown}
                    @mouseup=${this.handleTiltMouseUp}
                    style="cursor: crosshair;" />
                
                <!-- Pressure rings (from outside to inside) -->
                ${Array.from({ length: pressureRings }, (_, i) => {
                    const ringIndex = pressureRings - i - 1;
                    const radius = maxRadius * ((ringIndex + 1) / pressureRings);
                    const isActive = this.isPressingTilt && ringIndex <= activeRing;
                    const opacity = isActive ? 0.3 + (ringIndex / pressureRings) * 0.4 : 0.4;
                    const strokeWidth = isActive ? 2 : 1;
                    
                    return svg`
                        <circle cx="${centerX}" cy="${centerY}" r="${radius}"
                            class="pressure-ring"
                            fill="none"
                            stroke="${isActive ? '#ff6b6b' : '#495057'}"
                            stroke-width="${strokeWidth}"
                            opacity="${opacity}"
                            pointer-events="none" />
                    `;
                })}
                
                <!-- Center point -->
                <circle cx="${centerX}" cy="${centerY}" r="4" 
                    fill="#adb5bd"
                    pointer-events="none" />
                
                <!-- Tilt direction line -->
                ${this.isPressingTilt || this.tiltX !== 0 || this.tiltY !== 0 ? svg`
                    <line x1="${centerX}" y1="${centerY}" 
                          x2="${tiltLineEndX}" y2="${tiltLineEndY}"
                          stroke="#339af0"
                          stroke-width="3"
                          stroke-linecap="round"
                          pointer-events="none" />
                    
                    <!-- Tilt indicator dot -->
                    <circle cx="${tiltLineEndX}" cy="${tiltLineEndY}" r="6" 
                        fill="#339af0"
                        pointer-events="none" />
                ` : ''}
                
                <!-- Axis labels -->
                <text x="${centerX}" y="${size + 45}" class="axis-label" text-anchor="middle">
                    Tilt X: ${this.tiltX.toFixed(2)} | Tilt Y: ${this.tiltY.toFixed(2)}
                </text>
                <text x="${centerX}" y="${size + 60}" class="axis-label" text-anchor="middle">
                    Pressure: ${this.tiltPressure.toFixed(2)}
                </text>
            </svg>
        `;
    }

    render() {
        if (!this.noteDuration && !this.pitchBend && !this.noteVelocity) {
            return html`
                <div class="no-mappings">
                    <p>No expression parameters configured</p>
                </div>
            `;
        }
        
        return html`
            ${(this.mode === 'both' || this.mode === 'tablet') ? html`
                    <div class="tablet-container">
                        ${this.renderTablet()}
                    </div>
                ` : ''}
            ${(this.mode === 'both' || this.mode === 'tilt') ? html`
                <div class="tilt-container">
                    ${this.renderTilt()}
                </div>
            ` : ''}
        `;
    }
}

