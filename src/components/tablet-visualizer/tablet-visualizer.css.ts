import { css } from 'lit';

export const styles = css`
    :host {
        display: block;
        width: 100%;
    }
    
    .tablet-container {
        margin-bottom: 20px;
    }
    
    .tilt-container {
        margin-bottom: 20px;
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
    
    .button-rect {
        cursor: pointer;
    }
    
    .tablet-button text {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
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

