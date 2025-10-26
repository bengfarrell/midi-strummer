import { css } from 'lit';

export const styles = css`
    :host {
        display: block;
    }

    .curve-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        background-color: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 16px;
    }

    .visualizer-title {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #f1f3f5;
        text-align: center;
    }

    .control-selector-top {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
    }

    .control-selector-label {
        font-size: 11px;
        color: #adb5bd;
        font-weight: 500;
    }

    .control-selector-top sp-picker {
        width: 130px;
    }

    .range-inputs {
        display: flex;
        gap: 12px;
        justify-content: center;
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

    .range-inputs sp-number-field {
        width: 65px;
    }

    .range-inputs sp-picker {
        width: 65px;
    }

    .spread-control {
        display: flex;
        justify-content: center;
    }

    .spread-control sp-picker {
        width: 130px;
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

