import { css } from 'lit';

export const styles = css`
    :host {
        display: block;
        width: 100%;
    }
    
    .tablet-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .tablet-label-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 8px;
        font-size: 12px;
        color: #adb5bd;
    }
    
    .tablet-info-label {
        color: #868e96;
    }
    
    .tablet-info-label strong {
        color: #f1f3f5;
        font-weight: 600;
    }
    
    .tablet-info-separator {
        color: #495057;
    }
    
    .tilt-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
    }
    
    .tablet-svg,
    .tilt-svg {
        cursor: crosshair;
        display: block;
        max-width: 100%;
        height: auto;
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
        transition: all 0.15s ease;
    }
    
    .button-rect:hover {
        filter: brightness(1.2);
    }
    
    .string-hitbox {
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

