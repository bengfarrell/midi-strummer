import { css } from 'lit';

export const styles = css`
    :host {
        display: block;
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
`;

