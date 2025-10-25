import { css } from 'lit';

export const styles = css`
    :host {
        display: block;
    }

    .curve-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .control-selector {
        display: flex;
        justify-content: center;
    }

    .control-selector sp-picker {
        width: 160px;
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

