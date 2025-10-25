import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './dashboard-panel.css';

@customElement('dashboard-panel')
export class DashboardPanel extends LitElement {
    static styles = styles;

    @property({ type: String })
    title = '';

    @property({ type: Boolean })
    collapsible = false;

    @property({ type: Boolean })
    collapsed = false;

    toggleCollapse() {
        if (this.collapsible) {
            this.collapsed = !this.collapsed;
        }
    }

    render() {
        return html`
            <div class="panel ${this.collapsed ? 'collapsed' : ''}">
                ${this.title ? html`
                    <div class="panel-header" @click=${this.toggleCollapse}>
                        <h3 class="panel-title">${this.title}</h3>
                        ${this.collapsible ? html`
                            <span class="collapse-icon">${this.collapsed ? '▶' : '▼'}</span>
                        ` : ''}
                    </div>
                ` : ''}
                <div class="panel-content">
                    <slot></slot>
                </div>
            </div>
        `;
    }
}

