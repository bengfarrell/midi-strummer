import { css } from 'lit';

export const styles = css`
    :host {
        display: block;
        width: 100%;
    }

    .connection-panel {
        /* No extra padding or background since it's inside a dashboard-panel */
    }

    .connection-form {
        margin-bottom: 16px;
    }

    sp-field-label {
        display: block;
        margin-bottom: 8px;
        color: rgba(255, 255, 255, 0.9);
    }

    .connection-controls {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    sp-textfield {
        flex: 1;
    }

    .error-message {
        padding: 12px;
        background: rgba(255, 107, 107, 0.1);
        border: 1px solid rgba(255, 107, 107, 0.3);
        border-radius: 6px;
        color: #ff6b6b;
        margin-bottom: 16px;
        font-size: 14px;
    }

    .connection-info {
        padding: 16px;
        background: rgba(51, 154, 240, 0.1);
        border: 1px solid rgba(51, 154, 240, 0.3);
        border-radius: 6px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
    }

    .connection-info p {
        margin: 0 0 8px 0;
    }

    .connection-info p:last-child {
        margin-bottom: 0;
    }

    .device-status-panel {
        padding: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        font-size: 14px;
    }

    .status-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
    }

    .status-label {
        color: rgba(255, 255, 255, 0.7);
        font-weight: 500;
    }

    .status-value {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 4px;
        font-weight: 600;
    }

    .status-value.connected {
        background: rgba(81, 207, 102, 0.15);
        border: 1px solid rgba(81, 207, 102, 0.3);
    }

    .status-value.disconnected {
        background: rgba(255, 107, 107, 0.15);
        border: 1px solid rgba(255, 107, 107, 0.3);
    }

    .status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .status-value.connected .status-dot {
        background-color: #51cf66;
        box-shadow: 0 0 6px #51cf66;
    }

    .status-value.disconnected .status-dot {
        background-color: #ff6b6b;
        box-shadow: 0 0 6px #ff6b6b;
    }

    .status-text {
        color: rgba(255, 255, 255, 0.9);
    }

    .device-details {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .device-detail {
        color: rgba(255, 255, 255, 0.6);
        font-size: 13px;
    }
`;

