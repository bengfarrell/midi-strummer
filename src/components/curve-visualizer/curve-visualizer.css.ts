import { css } from 'lit';

export const styles = css`
    :host {
        display: block;
    }

    .curve-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        background-color: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 16px;
    }

    .graph-container {
        width: 100%;
    }

    .graph-container svg {
        display: block;
        width: 100%;
        height: auto;
    }

    .controls-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px 16px;
    }

    .control-selector-top {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .control-selector-label {
        font-size: 11px;
        color: #adb5bd;
        font-weight: 500;
    }

    .control-selector-top sp-picker {
        width: 100%;
    }

    .range-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .range-label {
        font-size: 11px;
        color: #adb5bd;
        font-weight: 500;
    }

    .range-field sp-number-field,
    .range-field sp-picker {
        width: 100%;
    }

    .graph-title {
        font-size: 13px;
        font-weight: 600;
        fill: #f1f3f5;
    }

    .graph-bg {
        fill: #1a1b1e;
        stroke: #495057;
        stroke-width: 1;
    }

    .axis {
        stroke: #868e96;
        stroke-width: 1.5;
    }

    .axis-label {
        font-size: 10px;
        fill: #adb5bd;
    }

    .curve-line {
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .info-label {
        font-size: 10px;
        fill: #868e96;
    }
`;

