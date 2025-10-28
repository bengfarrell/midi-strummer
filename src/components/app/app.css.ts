import { css } from 'lit';

export const styles = css`
    :host {
        width: 100%;
        min-height: 100vh;
        display: block;
        background-color: rgb(29, 29, 29);
        padding: 15px;
        color: white;
        box-sizing: border-box;
    }
    
    sp-theme {
        width: 100%;
        height: 100%;
        display: block;
        background-color: rgb(29, 29, 29);
    }
    
    .app-header {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 20px;
        margin-bottom: 24px;
    }
    
    .app-logo {
        flex-shrink: 0;
        filter: drop-shadow(0 3px 12px rgba(0, 0, 0, 0.4));
    }
    
    h1 {
        margin: 0;
        font-size: 42px;
        font-weight: 700;
        color: white;
        background: linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcf7f, #4dabf7, #845ef7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: 0.5px;
    }

    websocket-connection {
        margin-top: 40px;
    }
    
    /* Panel Controls Panel */
    .panel-controls-content {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
    }
    
    .panel-category {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .category-title {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.7);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .category-items {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    
    .panel-control-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        font-size: 13px;
        font-weight: 500;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
    }
    
    .panel-control-item:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.25);
        transform: translateX(2px);
    }
    
    .panel-control-item.visible {
        background: rgba(59, 130, 246, 0.2);
        border-color: rgba(59, 130, 246, 0.4);
        color: white;
    }
    
    .panel-control-item.visible:hover {
        background: rgba(59, 130, 246, 0.3);
        border-color: rgba(59, 130, 246, 0.5);
    }
    
    .panel-control-item.hidden {
        opacity: 0.5;
    }
    
    .panel-control-item.hidden:hover {
        opacity: 0.8;
    }
    
    .item-icon {
        font-size: 16px;
        line-height: 1;
    }
    
    .item-label {
        flex: 1;
    }
    
    .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        grid-auto-rows: auto;
        grid-auto-flow: dense;
        align-items: stretch;
    }
    
    .dashboard-grid.connection-only {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 60vh;
    }
    
    /* Uniform sizing - most panels are single column */
    dashboard-panel[size="small"],
    dashboard-panel[size="medium"],
    dashboard-panel[size="tall"] {
        grid-column: span 1;
    }
    
    /* Wide panels span 2 columns */
    dashboard-panel[size="wide"],
    dashboard-panel[size="large"] {
        grid-column: span 2;
    }
    
    /* Full width panels - span all 4 columns */
    dashboard-panel[size="full"] {
        grid-column: 1 / -1;
    }
    
    /* Responsive adjustments */
    @media (max-width: 1400px) {
        .dashboard-grid {
            grid-template-columns: repeat(3, 1fr);
        }
        
        dashboard-panel[size="wide"],
        dashboard-panel[size="large"] {
            grid-column: span 2;
        }
        
        dashboard-panel[size="full"] {
            grid-column: 1 / -1;
        }
    }
    
    @media (max-width: 1000px) {
        .dashboard-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        dashboard-panel[size="wide"],
        dashboard-panel[size="large"] {
            grid-column: span 2;
        }
        
        dashboard-panel[size="full"] {
            grid-column: 1 / -1;
        }
    }
    
    @media (max-width: 768px) {
        .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 12px;
        }
        
        dashboard-panel[size="small"],
        dashboard-panel[size="medium"],
        dashboard-panel[size="large"],
        dashboard-panel[size="wide"],
        dashboard-panel[size="tall"],
        dashboard-panel[size="full"] {
            grid-column: 1 / -1;
        }
    }
    
    piano-keys {
        pointer-events: none;
        width: 100%;
    }
    
    .config-group {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 16px 20px;
        align-items: center;
        max-width: 600px;
    }
    
    .config-group sp-checkbox {
        grid-column: 1 / -1;
    }
    
    /* Visual feedback for disabled controls - only for panels with active control */
    dashboard-panel[hasActiveControl]:not([active]) .config-group {
        opacity: 0.6;
        transition: opacity 0.2s ease;
    }
    
    .controls {
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        gap: 16px;
        margin-top: 20px;
    }
`;