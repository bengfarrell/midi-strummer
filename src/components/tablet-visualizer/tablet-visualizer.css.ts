import { css } from 'lit';

export const styles = css`
    :host {
        display: block;
        width: 100%;
    }
    
    .container {
        display: flex;
        gap: 40px;
        align-items: flex-start;
    }
    
    .tablet-container {
        flex-shrink: 0;
    }
    
    .tablet-svg {
        cursor: crosshair;
    }
    
    .tablet-body {
        fill: #2c2e33;
        stroke: #495057;
        stroke-width: 2;
    }
    
    .tablet-surface {
        fill: #1a1b1e;
        stroke: #343a40;
        stroke-width: 1;
    }
    
    .tablet-label {
        font-size: 13px;
        font-weight: 600;
        fill: #f1f3f5;
    }
    
    .axis-label {
        font-size: 10px;
        fill: #adb5bd;
    }
    
    .visualizer {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        flex: 1;
    }
    
    .no-mappings {
        padding: 40px;
        text-align: center;
        color: rgba(255, 255, 255, 0.5);
    }
    
    .no-mappings p {
        margin: 0;
        font-size: 14px;
    }
`;

