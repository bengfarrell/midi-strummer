import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './websocket-connection.css.js';

import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/textfield/sp-textfield.js';
import '@spectrum-web-components/field-label/sp-field-label.js';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

@customElement('websocket-connection')
export class WebSocketConnectionComponent extends LitElement {
    static styles = styles;

    @property({ type: String })
    status: ConnectionStatus = 'disconnected';

    @property({ type: String })
    errorMessage: string = '';

    @property({ 
        type: Boolean,
        hasChanged: () => true 
    })
    tabletConnected: boolean = false;

    @property({ 
        type: Object,
        hasChanged: () => true 
    })
    tabletDeviceInfo: any = null;

    @property({ type: Boolean })
    hasReceivedDeviceStatus: boolean = false;

    @state()
    private address: string = `ws://${window.location.hostname}:8080`;

    private handleAddressChange(e: Event) {
        const field = e.target as any;
        this.address = field.value;
    }

    private handleConnect() {
        if (this.address.trim()) {
            this.dispatchEvent(new CustomEvent('connect', {
                detail: { address: this.address },
                bubbles: true,
                composed: true
            }));
        }
    }

    private handleDisconnect() {
        this.dispatchEvent(new CustomEvent('disconnect', {
            bubbles: true,
            composed: true
        }));
    }

    render() {
        const isConnected = this.status === 'connected';
        const isConnecting = this.status === 'connecting';
        const isDisabled = isConnecting || isConnected;

        return html`
            <div class="connection-panel">
                <div class="connection-form">
                    <sp-field-label for="ws-address">WebSocket Server Address</sp-field-label>
                    <div class="connection-controls">
                        <sp-textfield
                            id="ws-address"
                            .value="${this.address}"
                            ?disabled="${isDisabled}"
                            placeholder="ws://localhost:8080"
                            @input="${this.handleAddressChange}">
                        </sp-textfield>
                        
                        ${isConnected ? html`
                            <sp-button
                                variant="secondary"
                                @click="${this.handleDisconnect}">
                                Disconnect
                            </sp-button>
                        ` : html`
                            <sp-button
                                variant="primary"
                                ?disabled="${isConnecting}"
                                @click="${this.handleConnect}">
                                ${isConnecting ? 'Connecting...' : 'Connect'}
                            </sp-button>
                        `}
                    </div>
                </div>

                ${this.status === 'error' && this.errorMessage ? html`
                    <div class="error-message">
                        <strong>Error:</strong> ${this.errorMessage}
                    </div>
                ` : ''}

                ${isConnected && this.hasReceivedDeviceStatus ? html`
                    <div class="device-status-panel">
                        <div class="status-row">
                            <span class="status-label">Drawing Tablet:</span>
                            <div class="status-value ${this.tabletConnected ? 'connected' : 'disconnected'}">
                                <div class="status-dot"></div>
                                <span class="status-text">
                                    ${this.tabletConnected 
                                        ? (this.tabletDeviceInfo?.name || 'Connected') 
                                        : 'No Device'}
                                </span>
                            </div>
                        </div>
                        ${this.tabletConnected && this.tabletDeviceInfo ? html`
                            <div class="device-details">
                                ${this.tabletDeviceInfo.manufacturer ? html`
                                    <span class="device-detail">Manufacturer: ${this.tabletDeviceInfo.manufacturer}</span>
                                ` : ''}
                                ${this.tabletDeviceInfo.model ? html`
                                    <span class="device-detail">Model: ${this.tabletDeviceInfo.model}</span>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                ` : isConnected && !this.hasReceivedDeviceStatus ? html`
                    <div class="connection-info">
                        <p>✅ Connected to server</p>
                        <p>Waiting for device status...</p>
                    </div>
                ` : html`
                    <div class="connection-info">
                        <p>Connect to your Strumboli server to start configuring your tablet.</p>
                        <p>Make sure the server is running before connecting.</p>
                    </div>
                `}
            </div>
        `;
    }
}

