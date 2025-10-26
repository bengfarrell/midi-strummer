import { css } from 'lit';

export const styles = css`
    :host {
        display: block;
    }
    
    .panel {
        display: flex;
        flex-direction: column;
        background-color: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
        height: 100%;
    }
    
    .panel:hover {
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
    }
    
    .panel.minimized {
        height: auto;
    }
    
    .panel.minimized .panel-content {
        display: none;
    }

    .panel.dragging {
        opacity: 0.5;
        cursor: grabbing;
    }

    .panel[data-size] {
        transition: opacity 0.2s ease;
    }
    
    .panel-header {
        padding: 12px 16px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 48px;
    }
    
    .drag-handle {
        cursor: grab;
        user-select: none;
        color: rgba(255, 255, 255, 0.4);
        font-size: 14px;
        padding: 0 4px;
        transition: color 0.2s ease;
        line-height: 1;
        letter-spacing: -2px;
    }

    .drag-handle:hover {
        color: rgba(255, 255, 255, 0.8);
    }

    .drag-handle:active {
        cursor: grabbing;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
    }
    
    .header-controls {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
    }
    
    .panel-title {
        margin: 0;
        font-size: 13px;
        font-weight: 600;
        color: white;
        letter-spacing: 0.3px;
        text-transform: uppercase;
        opacity: 0.9;
        white-space: nowrap;
        transition: opacity 0.2s ease;
    }
    
    /* Dim title when panel has active control AND is inactive */
    :host([hasActiveControl]:not([active])) .panel-title {
        opacity: 0.4;
    }
    
    .header-checkbox {
        flex-shrink: 0;
        margin: 0;
    }
    
    .header-controls sp-action-button {
        --spectrum-actionbutton-min-width: 24px;
        font-size: 11px;
    }
    
    .panel-content {
        padding: 20px;
        flex: 1;
        overflow: auto;
    }
`;

