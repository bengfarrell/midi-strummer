import { css } from 'lit';

export const styles = css`
    :host {
        width: 100%;
        min-height: 100vh;
        display: inline-block;
        background-color: black;
        padding: 15px;
        color: white;
    }
    
    sp-theme {
        width: 100%;
        height: 100%;
        display: inline-block;
    }
    
    h1 {
        margin: 0 0 24px 0;
        font-size: 28px;
        font-weight: 700;
        color: white;
    }
    
    .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 20px;
        auto-rows: minmax(200px, auto);
    }
    
    /* Size mappings for dashboard panels */
    dashboard-panel[size="small"] {
        grid-column: span 3;
        grid-row: span 1;
    }
    
    dashboard-panel[size="medium"] {
        grid-column: span 4;
        grid-row: span 2;
    }
    
    dashboard-panel[size="large"] {
        grid-column: span 6;
        grid-row: span 2;
    }
    
    dashboard-panel[size="wide"] {
        grid-column: span 8;
        grid-row: span 2;
    }
    
    dashboard-panel[size="tall"] {
        grid-column: span 4;
        grid-row: span 3;
    }
    
    dashboard-panel[size="full"] {
        grid-column: span 12;
        grid-row: span 2;
    }
    
    /* Responsive adjustments */
    @media (max-width: 1400px) {
        .dashboard-grid {
            grid-template-columns: repeat(8, 1fr);
        }
        
        dashboard-panel[size="small"] {
            grid-column: span 2;
        }
        
        dashboard-panel[size="medium"] {
            grid-column: span 4;
        }
        
        dashboard-panel[size="wide"],
        dashboard-panel[size="large"],
        dashboard-panel[size="full"] {
            grid-column: span 8;
        }
    }
    
    @media (max-width: 900px) {
        .dashboard-grid {
            grid-template-columns: repeat(4, 1fr);
        }
        
        dashboard-panel[size="small"],
        dashboard-panel[size="medium"],
        dashboard-panel[size="large"],
        dashboard-panel[size="wide"],
        dashboard-panel[size="tall"],
        dashboard-panel[size="full"] {
            grid-column: span 4;
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
    
    .controls {
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        gap: 16px;
        margin-top: 20px;
    }
`;