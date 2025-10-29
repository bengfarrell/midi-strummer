import { css } from 'lit';

export const styles = css`
    :host {
        display: block;
        width: 100%;
    }

    .config-section {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .button-config {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    sp-picker {
        width: 100%;
    }

    .param-controls {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-top: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .param-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    /* Responsive: single column on smaller screens */
    @media (max-width: 768px) {
        .param-controls {
            grid-template-columns: 1fr;
        }
    }

    sp-number-field,
    sp-textfield {
        width: 100%;
    }

    sp-field-label {
        color: rgba(255, 255, 255, 0.9);
    }
`;

