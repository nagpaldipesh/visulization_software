import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../apiClient'; // Real import

// --- SVG Icons ---
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const IconLoader = () => (
  <svg className="spinner" width="20" height="20" viewBox="0 0 50 50">
    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="currentColor"></circle>
  </svg>
);

// --- Embedded Styles ---
const AppStyles = () => (
  <style>{`
    :root {
      --primary-color: #007bff;
      --info-color: #17a2b8;
      --danger-color: #dc3545;
      --text-light: #6c757d;
      --text-dark: #343a40;
    }
    .slicer-wrapper {
      height: 100%;
      width: 100%;
      border-width: 2px;
      border-style: solid;
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
      right: 8px;
      z-index: 10;
      background: rgba(220, 53, 69, 0.7);
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
    .slicer-btn:hover {
      background: rgba(220, 53, 69, 1);
    }
    .slicer-header {
      margin-top: 0;
      border-bottom-width: 1px;
      border-bottom-style: solid;
      padding-bottom: 5px;
      margin-bottom: 10px;
      font-size: 1em;
      font-weight: 600;
    }
    .form-input-group {
      margin-bottom: 10px;
    }
    .form-input-group label {
      display: block;
      font-size: 14px;
      margin-bottom: 5px;
      font-weight: 500;
    }
    .form-input, .form-select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 14px;
    }
    .slicer-list-container {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .slicer-scroll-area {
      max-height: 200px;
      overflow-y: auto;
      padding-top: 5px;
      border: 1px solid #eee;
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
    .slicer-loading-text {
      font-size: 14px;
      color: var(--text-light);
      text-align: center;
    }
    .slicer-numerical-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 10px;
    }
    
    /* Spinner Animation */
    .spinner { animation: rotate 2s linear infinite; }
    .spinner .path {
      stroke: var(--text-light); /* Spinner color */
      stroke-linecap: round;
      animation: dash 1.5s ease-in-out infinite;
    }
    @keyframes rotate { 100% { transform: rotate(360deg); } }
    @keyframes dash {
      0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
      50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
      100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
    }
  `}</style>
);

/**
 * Component: Interactive Filter/Slicer
 */
const InteractiveFilter = ({
    itemConfig,
    onFilterChange,
    onDelete,
    projectMetadata,
    onColumnChange,
    projectId,
    getAuthHeader
}) => {

    const { id, columnName, dataType, slicerType } = itemConfig;

    // State to hold the current filter values
    const [filterValue, setFilterValue] = useState(null);

    // NEW STATES for unique values
    const [uniqueValues, setUniqueValues] = useState([]);
    const [isLoadingValues, setIsLoadingValues] = useState(false);

    // Get all possible columns that match the slicer type
    const availableColumns = useMemo(() => {
        if (!projectMetadata || !projectMetadata.metadata) return [];
        return projectMetadata.metadata.filter(c => c.type.toLowerCase() === dataType.toLowerCase());
    }, [projectMetadata, dataType]);

    // Effect to fetch values when column changes
    useEffect(() => {
        const fetchUniqueValues = async () => {
            if (!columnName || dataType !== 'categorical') {
                setUniqueValues([]);
                return;
            }

            setIsLoadingValues(true);
            const authHeader = getAuthHeader();
            if (!authHeader) {
                setIsLoadingValues(false);
                return;
            }

            try {
                const response = await apiClient.get(
                    `/projects/${projectId}/unique-values/${columnName}/`,
                    authHeader
                );
                setUniqueValues(response.data.unique_values || []);
            } catch (err) {
                console.error("Failed to fetch unique values:", err);
                setUniqueValues([]);
            } finally {
                setIsLoadingValues(false);
            }
        };

        fetchUniqueValues();

        // Reset filter value when column changes
        if (dataType === 'categorical') {
            setFilterValue([]);
        } else if (dataType === 'numerical') {
            setFilterValue({ min: '', max: '' });
        }
    }, [columnName, dataType, projectId, getAuthHeader]);


    const handleCategoricalChange = (value) => {
        let newValues = [...(Array.isArray(filterValue) ? filterValue : [])];

        newValues = newValues.includes(value)
            ? newValues.filter(v => v !== value)
            : [...newValues, value];

        setFilterValue(newValues);
        onFilterChange(columnName, newValues);
    };

    const handleNumericalChange = (field, value) => {
        const newRange = { ...(filterValue || { min: '', max: '' }), [field]: value };
        setFilterValue(newRange);
        onFilterChange(columnName, newRange);
    };

    // Handler for when the user selects a column from the dropdown
    const handleColumnSelect = (e) => {
        const selectedColName = e.target.value;
        if (selectedColName === "") {
            onColumnChange(id, null, dataType); // Send null to clear it
            return;
        }

        const selectedCol = availableColumns.find(c => c.name === selectedColName);
        if (selectedCol) {
            onColumnChange(id, selectedCol.name, selectedCol.type);
        }
    };

    const headerColor = dataType === 'numerical' ? 'var(--primary-color)' : dataType === 'categorical' ? 'var(--info-color)' : 'var(--text-light)';
    const slicerLabel = slicerType === 'slicer_range' ? 'RANGE SLICER' : 'LIST SLICER';

    return (
        <div className="slicer-wrapper" style={{ borderColor: headerColor }}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="slicer-btn"
                title="Remove Slicer"
            >
                <IconX />
            </button>

            <h5 className="slicer-header" style={{ color: headerColor, borderBottomColor: `${headerColor}50` }}>
                {slicerLabel}: {columnName || '...'}
            </h5>

            <div className="form-input-group">
                <label>
                    {columnName ? 'Change column:' : 'Select a column:'}
                </label>
                <select
                    onChange={handleColumnSelect}
                    value={columnName || ''}
                    className="form-select"
                >
                    <option value="">-- Choose {dataType} column --</option>
                    {availableColumns.map(col => (
                        <option key={col.name} value={col.name}>
                            {col.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* === Categorical Slicer UI === */}
            {columnName && dataType === 'categorical' && (
                <div className="slicer-list-container">
                    <div className="slicer-scroll-area">
                        {isLoadingValues ? (
                            <p className="slicer-loading-text"><IconLoader /></p>
                        ) : uniqueValues.length > 0 ? (
                            uniqueValues.map(value => (
                                <label key={value} className="slicer-item-label"
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    <input
                                        type={'checkbox'}
                                        name={columnName}
                                        value={value}
                                        checked={(Array.isArray(filterValue) ? filterValue : []).includes(String(value))}
                                        onChange={() => handleCategoricalChange(String(value))}
                                    />
                                    {value}
                                </label>
                            ))
                        ) : (
                            <p className="slicer-loading-text" style={{padding: '10px'}}>No unique values.</p>
                        )}
                    </div>
                </div>
            )}

            {/* === Numerical Slicer UI === */}
            {columnName && dataType === 'numerical' && (
                <div className="slicer-numerical-grid">
                    <div className="form-input-group">
                        <label>Min:</label>
                        <input
                            type="number"
                            value={filterValue?.min || ''}
                            onChange={(e) => handleNumericalChange('min', e.target.value)}
                            className="form-input"
                            placeholder="Min Value"
                        />
                    </div>
                    <div className="form-input-group">
                        <label>Max:</label>
                        <input
                            type="number"
                            value={filterValue?.max || ''}
                            onChange={(e) => handleNumericalChange('max', e.target.value)}
                            className="form-input"
                            placeholder="Max Value"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractiveFilter;