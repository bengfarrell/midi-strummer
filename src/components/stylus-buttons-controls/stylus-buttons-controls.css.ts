import { css } from 'lit';

export const styles = css`
    :host {
        display: block;
        width: 100%;
    }
    
    .controls-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, max-content));
        gap: 24px 32px;
        width: 100%;
    }
    
    .control-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    sp-field-label {
        color: rgba(255, 255, 255, 0.9);
        font-size: 14px;
        white-space: nowrap;
    }
    
    sp-picker {
        width: 180px;
    }
`;

