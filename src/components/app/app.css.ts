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
    
    h1 {
        margin: 0 0 24px 0;
        font-size: 28px;
        font-weight: 700;
        color: white;
    }
    
    .panel-tray {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .panel-tray-label {
        font-size: 14px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.7);
        white-space: nowrap;
    }
    
    .panel-tray-items {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        flex: 1;
    }
    
    .panel-tray-item {
        padding: 6px 12px;
        font-size: 13px;
        font-weight: 500;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
    }
    
    .panel-tray-item:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
    }
    
    .panel-tray-item.visible {
        background: rgba(59, 130, 246, 0.3);
        border-color: rgba(59, 130, 246, 0.5);
        color: white;
    }
    
    .panel-tray-item.visible:hover {
        background: rgba(59, 130, 246, 0.4);
        border-color: rgba(59, 130, 246, 0.6);
    }
    
    .panel-tray-item.hidden {
        opacity: 0.6;
    }
    
    .panel-tray-item.hidden:hover {
        opacity: 1;
    }
    
    .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        grid-auto-rows: auto;
        grid-auto-flow: dense;
        align-items: stretch;
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