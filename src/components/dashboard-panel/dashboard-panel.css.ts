import { css } from 'lit';

export const styles = css`
    :host {
        display: block;
        width: 100%;
    }
    
    .panel {
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
    }
    
    .panel:hover {
        border-color: rgba(255, 255, 255, 0.2);
    }
    
    .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background-color: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        user-select: none;
    }
    
    .panel.collapsed .panel-header {
        border-bottom: none;
    }
    
    .panel-header[collapsible] {
        cursor: pointer;
    }
    
    .panel-header:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }
    
    .panel-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: white;
        letter-spacing: 0.5px;
    }
    
    .collapse-icon {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        transition: transform 0.3s ease;
    }
    
    .panel-content {
        padding: 20px;
        max-height: 1000px;
        opacity: 1;
        transition: max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease;
    }
    
    .panel.collapsed .panel-content {
        max-height: 0;
        opacity: 0;
        padding: 0 20px;
        overflow: hidden;
    }
`;

