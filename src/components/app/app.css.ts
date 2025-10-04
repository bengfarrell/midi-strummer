import { css } from 'lit';

export const styles = css`
    :host {
        width: 100%;
        height: 100vh;
        display: inline-block;
        background-color: black;
        padding: 15px;
        color: white;
    }
    
    sp-theme {
        width: 100%;
        height: 100%;
        display: inline-block;
    }
    
    piano-keys {
        margin-top: 12px;
        margin-bottom: 12px;
        width: calc(100% - 52px);
        pointer-events: none;
    }
    
    sp-combobox {
        width: 250px;
    }
`;