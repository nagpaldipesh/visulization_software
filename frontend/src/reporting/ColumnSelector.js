import React, { useState, useEffect } from 'react';

// --- SVG Icons ---
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const IconSettings = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

// --- Embedded Styles ---
const AppStyles = () => (
  <style>{`
    :root {
      --primary-color: #007bff;
      --danger-color: #dc3545;
      --slicer-color: #6610f2;
      --border-color: #dee2e6;
      --text-light: #6c757d;
      --text-dark: #343a40;
    }
    .slicer-wrapper {
      height: 100%;
      width: 100%;
      border: 2px solid var(--slicer-color);
      padding: 10px;
      border-radius: 4px;
      background-color: #fff;
      position: relative;
      overflow-y: auto;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    .slicer-btn {
      position: absolute;
      top: 8px;
      z-index: 10;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 12px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }
    .slicer-btn.delete-btn {
      right: 8px;
      background: rgba(220, 53, 69, 0.7);
    }
    .slicer-btn.delete-btn:hover {
      background: rgba(220, 53, 69, 1);
    }
    .slicer-btn.config-btn {
      right: 38px;
      background: rgba(0, 123, 255, 0.7);
    }
    .slicer-btn.config-btn:hover {
      background: rgba(0, 123, 255, 1);
    }
    .slicer-header {
      margin-top: 0;
      color: var(--slicer-color);
      border-bottom: 1px solid #6610f250;
      padding-bottom: 5px;
      margin-bottom: 10px;
      font-size: 1em;
      font-weight: 600;
    }
    .slicer-content {
      display: flex;
      flex-direction: column;
      gap: 5px;
      height: calc(100% - 40px); /* Adjust based on header height */
    }
    .slicer-scroll-area {
      max-height: 100%;
      overflow-y: auto;
      padding: 5px;
    }
    .slicer-item-label {
      display: block;
      font-size: 14px;
      cursor: pointer;
      padding: 4px 5px;
      border-radius: 3px;
      user-select: none;
      transition: background-color 0.2s;
    }
    .slicer-item-label:hover {
      background-color: #f0f0f0;
    }
    .slicer-item-label input {
      margin-right: 8px;
      cursor: pointer;
    }
    .slicer-empty-message {
      font-size: 13px;
      color: var(--text-light);
      text-align: center;
      padding-top: 20px;
    }
    .slicer-footer-info {
      font-size: 11px;
      color: #aaa;
      border-top: 1px solid #eee;
      padding-top: 10px;
      margin-top: auto; /* Pushes to the bottom */
    }
  `}</style>
);

/**
 * Renders the Column Selector slicer on the dashboard.
 * Displays checkboxes for configured columns.
 * Calls onColumnSelectionChange when selections change.
 */
const ColumnSelector = ({
    itemConfig,
    onDelete,
    onConfigure, // Func to open config modal
    onColumnSelectionChange // Func to (slicerId, selectedColumns)
}) => {
    
    // Get config from the item
    const { id, config = {} } = itemConfig;
    const { availableColumns = [], linkedCharts = [] } = config;
    
    // Internal state for which columns are currently ticked
    const [selectedColumns, setSelectedColumns] = useState([]);

    const handleColumnToggle = (colName) => {
        const newSelection = selectedColumns.includes(colName)
            ? selectedColumns.filter(name => name !== colName)
            : [...selectedColumns, colName];
            
        setSelectedColumns(newSelection);
        
        // This is the key: call the handler in ReportingTab
        onColumnSelectionChange(id, newSelection);
    };
    
    return (
        <div className="slicer-wrapper">
            {/* Delete Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                onMouseDown={(e) => e.stopPropagation()} // Prevents RGL drag
                className="slicer-btn delete-btn"
                title="Remove Slicer"
            >
                <IconX />
            </button>
            
            {/* Configure Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onConfigure(); }}
                onMouseDown={(e) => e.stopPropagation()} // Prevents RGL drag
                className="slicer-btn config-btn"
                title="Configure Slicer"
            >
                <IconSettings />
            </button>

            <h5 className="slicer-header">
                COLUMN SELECTOR
            </h5>

            <div className="slicer-content">
                <div className="slicer-scroll-area">
                    {availableColumns.length === 0 ? (
                        <p className="slicer-empty-message">
                            Please configure this slicer using the <IconSettings /> icon.
                        </p>
                    ) : (
                        availableColumns.map(colName => (
                            <label 
                                key={colName} 
                                className="slicer-item-label"
                                onMouseDown={(e) => e.stopPropagation()} // Prevents RGL drag
                            >
                                <input
                                    type="checkbox"
                                    value={colName}
                                    checked={selectedColumns.includes(colName)}
                                    onChange={() => handleColumnToggle(colName)}
                                />
                                {colName}
                            </label>
                        ))
                    )}
                </div>
                
                <p className="slicer-footer-info">
                    Linked charts: {linkedCharts.length}
                </p>
            </div>
        </div>
    );
};

export default ColumnSelector;