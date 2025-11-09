import React, { useState, useMemo } from 'react';

// --- SVG Icons ---
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// --- Embedded Styles ---
const AppStyles = () => (
  <style>{`
    :root {
      --primary-color: #007bff;
      --success-color: #28a745;
      --slicer-color: #6610f2;
      --border-color: #dee2e6;
      --text-light: #6c757d;
      --text-dark: #343a40;
      --bg-light: #f8f9fa;
    }
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.5);
      z-index: 1040;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    .modal-content {
      position: relative;
      background-color: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      z-index: 1050;
      width: 600px;
      max-width: 90%;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .modal-close-btn {
      position: absolute;
      top: 10px;
      right: 15px;
      background: none;
      border: none;
      font-size: 1.5em;
      cursor: pointer;
      color: var(--text-light);
    }
    .modal-header h3 {
      margin-top: 0;
      margin-bottom: 0;
      color: var(--text-dark);
    }
    .modal-section h5 {
      margin: 0 0 10px 0;
      font-size: 1.1em;
    }
    .modal-list-container {
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 10px;
      height: 200px;
      overflow-y: auto;
      background: var(--bg-light);
    }
    .modal-checkbox-label {
      display: block;
      padding: 5px;
      cursor: pointer;
      border-radius: 3px;
      user-select: none;
      transition: background-color 0.2s;
    }
    .modal-checkbox-label:hover {
      background-color: #e9ecef;
    }
    .modal-checkbox-label input {
      margin-right: 8px;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      border-top: 1px solid #eee;
      padding-top: 15px;
    }
    
    /* Re-usable Button Styles */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 15px;
      font-size: 14px;
      font-weight: 500;
      border: 1px solid transparent;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-success { background-color: var(--success-color); color: white; }
    .btn-success:hover:not(:disabled) { background-color: #218838; }
    .btn-light { background-color: var(--bg-light); color: var(--text-dark); border-color: var(--border-color); }
    .btn-light:hover:not(:disabled) { background-color: #e2e6ea; }
  `}</style>
);

/**
 * Modal to configure the ColumnSelector slicer.
 * Allows user to select which columns appear in the slicer
 * and which charts on the page are linked to it.
 */
const ColumnSelectorConfigModal = ({
    itemConfig,
    projectMetadata,
    allChartsOnPage, // List of {id, title, type} for all charts
    onSave,
    onClose
}) => {
    // State for which columns to list in the slicer
    const [availableColumns, setAvailableColumns] = useState(
        itemConfig.config?.availableColumns || []
    );
    
    // State for which charts this slicer controls
    const [linkedCharts, setLinkedCharts] = useState(
        itemConfig.config?.linkedCharts || []
    );
    
    // State for which column type to show (numerical/categorical)
    const [columnTypeFilter, setColumnTypeFilter] = useState('numerical');

    const handleColumnToggle = (colName) => {
        setAvailableColumns(prev =>
            prev.includes(colName)
                ? prev.filter(name => name !== colName)
                : [...prev, colName]
        );
    };

    const handleChartLinkToggle = (chartId) => {
        setLinkedCharts(prev =>
            prev.includes(chartId)
                ? prev.filter(id => id !== chartId)
                : [...prev, chartId]
        );
    };

    const handleSave = () => {
        onSave({
            ...itemConfig,
            config: {
                ...itemConfig.config,
                availableColumns,
                linkedCharts
            }
        });
    };

    // Filter project columns by selected type
    const filteredColumns = useMemo(() => {
        const allMetadataColumns = projectMetadata?.metadata || [];
        return allMetadataColumns.filter(
            col => col.type === columnTypeFilter
        );
    }, [projectMetadata, columnTypeFilter]);
    
    // Get chart titles for display
    const getChartTitle = (chartId) => {
        const chart = allChartsOnPage.find(c => c.id === chartId);
        // Use chart.chartType from the config
        return chart ? `${chart.chartType} (ID: ...${String(chart.id).slice(-4)})` : `Chart ${chartId}`;
    };

    return (
        <>
            <div className="modal-backdrop" onClick={onClose}></div>
            <div className="modal-content">
                <button onClick={onClose} className="modal-close-btn"><IconX /></button>
                <div className="modal-header">
                  <h3>Configure Column Selector</h3>
                </div>
                
                {/* 1. Columns to Display */}
                <div className="modal-section">
                    <h5>1. Select columns to show in slicer:</h5>
                    <div style={{ marginBottom: '10px' }}>
                        <label><input type="radio" value="numerical" checked={columnTypeFilter === 'numerical'} onChange={() => setColumnTypeFilter('numerical')} /> Numerical</label>
                        <label style={{marginLeft: '15px'}}><input type="radio" value="categorical" checked={columnTypeFilter === 'categorical'} onChange={() => setColumnTypeFilter('categorical')} /> Categorical</label>
                    </div>
                    <div className="modal-list-container">
                        {filteredColumns.map(col => (
                            <label key={col.name} className="modal-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={availableColumns.includes(col.name)}
                                    onChange={() => handleColumnToggle(col.name)}
                                />
                                {col.name}
                            </label>
                        ))}
                    </div>
                </div>

                {/* 2. Charts to Link */}
                <div className="modal-section">
                    <h5>2. Select charts to control:</h5>
                    <div className="modal-list-container">
                        {allChartsOnPage.length === 0 && <p style={{color: '#888'}}>No charts on this page.</p>}
                        {allChartsOnPage.map(chart => (
                            <label key={chart.id} className="modal-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={linkedCharts.includes(chart.id)}
                                    onChange={() => handleChartLinkToggle(chart.id)}
                                />
                                {getChartTitle(chart.id)}
                            </label>
                        ))}
                    </div>
                </div>
                
                {/* 3. Actions */}
                <div className="modal-actions">
                    <button onClick={onClose} className="btn btn-light">Cancel</button>
                    <button onClick={handleSave} className="btn btn-success">Save Configuration</button>
                </div>
            </div>
        </>
    );
};

export default ColumnSelectorConfigModal;