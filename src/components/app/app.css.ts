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
    
    piano-keys {
        pointer-events: none;
        width: 100%;
    }
    
    .curve-visualizers {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
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
    
    dashboard-panel {
        margin-top: 20px;
        margin-bottom: 20px;
    }
    
    .controls {
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        gap: 16px;
        margin-top: 20px;
    }
`;