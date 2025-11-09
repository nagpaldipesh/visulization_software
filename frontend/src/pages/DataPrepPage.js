import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Real import
import Plot from 'react-plotly.js'; // Real import

// --- DATAPREP MODULES ---
import RecodeModal from '../dataprep/RecodeModal'; // Real import
import { CHART_CONFIG, HYPERTUNE_CONFIG } from '../dataprep/visualization_config';
import { DataTableDisplay } from '../dataprep/data_table_components'; // Real import

// --- REPORTING MODULES (NEW IMPORTS) ---
import ReportingTabContent from '../reporting/ReportingTab'; // Real import
// --- END NEW IMPORTS ---

// --- Constants ---
const BULK_IMPUTE_STRATEGIES = [
    { key: 'none', label: '--- Select Bulk Imputation Strategy ---', numerical: null, categorical: null },
    { key: 'mean_mode', label: 'Mean (Num) & Mode (Cat)', numerical: 'mean', categorical: 'mode' },
    { key: 'median_mode', label: 'Median (Num) & Mode (Cat)', numerical: 'median', categorical: 'mode' },
    { key: 'mode_mode', label: 'Mode (Num) & Mode (Cat)', numerical: 'mode', categorical: 'mode' },
    { key: 'constant', label: 'Fill with Constant Value(s)...', numerical: 'constant', categorical: 'constant' },
];

const BULK_OUTLIER_STRATEGIES = [
    { key: 'none', label: '--- Select Bulk Outlier Strategy ---', method: null },
    { key: 'cap', label: 'Cap Outliers (IQR Method)', method: 'cap' },
    { key: 'remove', label: 'Remove Rows with Outliers (IQR Method)', method: 'remove' },
];

// --- SVG Icon Components ---
const IconLoader = () => ( <svg className="spinner" width="20" height="20" viewBox="0 0 50 50"> <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle> </svg> );
const IconAlert = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> );
const IconCheck = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> );
const IconX = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );
const IconChevronDown = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg> );
const IconSave = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> );
const IconBack = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> );


// --- Embedded Styles ---
const AppStyles = () => (
  <style>{`
    :root {
      --primary-color: #007bff;
      --success-color: #28a745;
      --danger-color: #dc3545;
      --warning-color: #ffc107;
      --info-color: #17a2b8;
      --secondary-color: #6c757d;
      --bg-light: #f8f9fa;
      --border-color: #dee2e6;
      --text-light: #6c757d;
      --text-dark: #343a40;
    }
    .workbench-page {
      background: #f4f6f8;
      min-height: 100vh;
      padding: 30px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    .workbench-container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .workbench-header h2 {
      border-bottom: 2px solid var(--primary-color);
      padding-bottom: 10px;
      margin-top: 0;
    }
    .summary-grid {
      display: flex;
      gap: 20px;
      margin: 30px 0;
    }
    .summary-card {
      flex: 1;
      background-color: #e9f7ff;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid var(--primary-color);
    }
    .summary-card h4 { margin: 0 0 10px 0; }
    .summary-card p { margin: 0; }
    .summary-card strong.danger { color: var(--danger-color); }
    .summary-card strong.success { color: var(--success-color); }

    .tab-bar {
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 20px;
    }
    .tab-button {
      padding: 10px 20px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      border-bottom: 3px solid transparent;
      background: none;
      color: var(--text-dark);
      margin-bottom: -1px;
    }
    .tab-button.active {
      border-bottom-color: var(--primary-color);
      color: var(--primary-color);
    }
    
    /* Buttons */
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
    .btn-primary { background-color: var(--primary-color); color: white; }
    .btn-primary:hover:not(:disabled) { background-color: #0069d9; }
    .btn-danger { background-color: var(--danger-color); color: white; }
    .btn-danger:hover:not(:disabled) { background-color: #c82333; }
    .btn-warning { background-color: var(--warning-color); color: black; }
    .btn-warning:hover:not(:disabled) { background-color: #e0a800; }
    .btn-info { background-color: var(--info-color); color: white; }
    .btn-info:hover:not(:disabled) { background-color: #138496; }
    .btn-success { background-color: var(--success-color); color: white; }
    .btn-success:hover:not(:disabled) { background-color: #218838; }
    .btn-secondary { background-color: var(--secondary-color); color: white; }
    .btn-secondary:hover:not(:disabled) { background-color: #5a6268; }
    .btn-light { background-color: var(--bg-light); color: var(--text-dark); border-color: var(--border-color); }
    .btn-light:hover:not(:disabled) { background-color: #e2e6ea; }

    /* Form Inputs */
    .form-input, .form-select {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
    }
    .form-input-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .form-input-group label {
        font-size: 14px;
        font-weight: 500;
    }

    /* Bulk Action Bar */
    .bulk-action-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
      border: 1px solid var(--primary-color);
      padding: 10px;
      border-radius: 4px;
      background: #f5faff;
    }
    .bulk-action-bar.outlier {
      border-color: var(--info-color);
      background: #f5feff;
    }
    .bulk-action-bar h4 {
      margin: 0;
      font-size: 1rem;
      color: var(--primary-color);
    }
    .bulk-action-bar.outlier h4 {
      color: var(--info-color);
    }
    .bulk-action-bar .form-select { min-width: 250px; }
    .bulk-action-bar .form-input { width: 120px; }

    /* Column Table */
    .column-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 14px;
    }
    .column-table th, .column-table td {
      padding: 12px;
      text-align: left;
    }
    .column-table thead tr {
      background-color: var(--primary-color);
      color: white;
    }
    .column-table tbody tr {
      border-bottom: 1px solid var(--border-color);
    }
    .column-table tbody tr:nth-child(even) {
      background-color: var(--bg-light);
    }
    .column-table td:last-child {
      width: 420px; /* Wider for all buttons */
    }
    .column-table .actions-cell {
      display: flex;
      gap: 5px;
      justify-content: flex-start;
      align-items: center;
    }
    .column-table .actions-cell .btn {
      padding: 5px 10px;
    }
    .column-table input[type="checkbox"] {
      margin-right: 5px;
    }
    
    /* Visualization Tab */
    .viz-layout {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 30px;
      margin-top: 20px;
    }
    .viz-config-panel {
      background: #fdfdfd;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }
    .viz-config-panel h3 { margin-top: 0; }
    .viz-config-panel .form-select {
        width: 100%;
        margin-top: 5px;
        margin-bottom: 10px;
    }
    .viz-config-panel label {
        font-size: 14px;
        font-weight: 500;
    }
    .viz-config-panel .btn {
        width: 100%;
        margin-top: 20px;
        font-size: 16px;
    }
    .viz-config-panel .description {
      font-size: 12px;
      color: var(--text-light);
      margin: -5px 0 20px 0;
    }
    .mapping-group { margin-top: 20px; }
    .mapping-item { margin-top: 10px; }
    .multi-select-box {
      max-height: 150px;
      overflow-y: auto;
      border: 1px solid #ddd;
      padding: 10px;
      border-radius: 4px;
      margin-top: 5px;
    }
    .multi-select-box label {
      display: block;
      padding: 2px 0;
      font-weight: 400;
    }
    .multi-select-box input { margin-right: 8px; }

    .viz-display-panel {
      padding: 30px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fff;
      min-height: 500px;
    }
    .viz-placeholder {
      text-align: center;
      color: var(--text-light);
    }
    .viz-placeholder-icon { font-size: 24px; }
    .viz-chart-container {
      width: 100%;
    }
    .viz-analysis-box {
      margin-top: 20px;
      padding: 15px;
      background: #e9f7ff;
      border: 1px solid #b3e0ff;
      border-radius: 4px;
      width: 100%;
    }
    .viz-analysis-box h4 { margin: 0 0 10px 0; }
    .viz-analysis-box p { margin: 0; white-space: pre-wrap; }

    /* Hypertune Console */
    .hypertune-console {
      background: var(--bg-light);
      padding: 15px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      margin-top: 20px;
    }
    .hypertune-console h4 {
      margin-top: 0;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 10px;
    }
    .hypertune-console .hint {
      font-size: 12px;
      color: var(--text-light);
      margin: 0 0 10px 0;
    }
    .hypertune-section-btn {
      width: 100%;
      padding: 10px 0;
      background: none;
      border: none;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      text-align: left;
      font-weight: bold;
      color: var(--primary-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .hypertune-section-btn span {
      transition: transform 0.2s;
    }
    .hypertune-section-btn.open span {
      transform: rotate(180deg);
    }
    .hypertune-content {
      padding: 5px 0 10px 0;
      display: grid;
      gap: 10px;
    }
    .hypertune-content label {
      display: block;
      font-size: 12px;
      margin-bottom: 3px;
    }
    .hypertune-content input[type="range"] {
      width: 100%;
    }
    .hypertune-content .form-input, .hypertune-content .form-select {
        width: 100%;
        box-sizing: border-box;
    }
    
    /* Modals */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 25px;
      border-radius: 8px;
      width: 550px;
      max-width: 90%;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .modal-header h3 { margin: 0; }
    .modal-close-btn { background: none; border: none; cursor: pointer; padding: 0; }
    .modal-body p { margin-top: 0; }
    .modal-footer {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    
    /* Message Bars */
    .message-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 10px 0;
      padding: 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
    }
    .message-bar.message-success {
      background-color: #d4edda;
      color: #155724;
    }
    .message-bar.message-error {
      background-color: #f8d7da;
      color: #721c24;
    }

    /* Spinner Animation */
    .spinner { animation: rotate 2s linear infinite; }
    .spinner .path {
      stroke: #ffffff; /* White for buttons */
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

// ====================================================================
// --- Re-usable Generic Components ---
// ====================================================================

/**
 * Generic Modal Backdrop
 */
const Modal = ({ children, onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

/**
 * Generic Confirmation Modal (replaces window.confirm)
 */
const ConfirmModal = ({ title, message, onConfirm, onClose, isConfirming }) => (
  <Modal onClose={onClose}>
    <div className="modal-header">
      <h3>{title}</h3>
      <button onClick={onClose} className="modal-close-btn"><IconX/></button>
    </div>
    <div className="modal-body">
      <p>{message}</p>
    </div>
    <div className="modal-footer">
      <button onClick={onClose} className="btn btn-light" disabled={isConfirming}>
        Cancel
      </button>
      <button onClick={onConfirm} className="btn btn-danger" disabled={isConfirming}>
        {isConfirming ? <IconLoader/> : 'Confirm'}
      </button>
    </div>
  </Modal>
);

/**
 * Specific Impute Modal
 */
const ImputeModal = ({ column, onClose, onSubmit, isSubmitting, error }) => {
    const [method, setMethod] = useState(column.type === 'numerical' ? 'mean' : 'mode');
    const [constantValue, setConstantValue] = useState('');

    const handleSubmit = () => {
        onSubmit(method, constantValue);
    };

    return (
        <Modal onClose={onClose}>
            <div className="modal-header">
                <h3>Impute: <span style={{color: 'var(--primary-color)'}}>{column.name}</span></h3>
                <button onClick={onClose} className="modal-close-btn"><IconX/></button>
            </div>
            <div className="modal-body">
                <p>Select a method to fill {column.missing_count} missing values.</p>
                <div className="form-input-group">
                    {column.type === 'numerical' && (
                        <label><input type="radio" value="mean" checked={method === 'mean'} onChange={() => setMethod('mean')} /> Fill with Mean</label>
                    )}
                    {column.type === 'numerical' && (
                        <label><input type="radio" value="median" checked={method === 'median'} onChange={() => setMethod('median')} /> Fill with Median</label>
                    )}
                    <label><input type="radio" value="mode" checked={method === 'mode'} onChange={() => setMethod('mode')} /> Fill with Mode (most frequent)</label>
                    <label><input type="radio" value="constant" checked={method === 'constant'} onChange={() => setMethod('constant')} /> Fill with a Constant Value</label>
                    
                    {method === 'constant' && (
                        <input 
                            type="text" 
                            value={constantValue} 
                            onChange={(e) => setConstantValue(e.target.value)} 
                            placeholder="Enter value" 
                            className="form-input"
                            style={{marginTop: '5px'}}
                        />
                    )}
                </div>
                {error && <div className="message-bar message-error" style={{marginTop: '15px'}}>{error}</div>}
            </div>
            <div className="modal-footer">
                <button onClick={onClose} className="btn btn-light" disabled={isSubmitting}>Cancel</button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-primary">
                    {isSubmitting ? <IconLoader/> : 'Apply Imputation'}
                </button>
            </div>
        </Modal>
    );
};

/**
 * Specific Outlier Modal
 */
const OutlierModal = ({ column, onClose, onTreat, isTreating }) => {
    const [outlierData, setOutlierData] = useState(null);
    const [isDetecting, setIsDetecting] = useState(true);
    const [error, setError] = useState(null);
    const { projectId } = useParams(); // Use mock-safe hook

    const getAuthHeader = useCallback(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        return { headers: { 'Authorization': `Bearer ${token}` } };
    }, []);
    
    useEffect(() => {
        const detectOutliers = async () => {
            setIsDetecting(true);
            setError(null);
            try {
                const payload = { project_id: projectId, column_name: column.name };
                const response = await axios.post('http://127.0.0.1:8000/api/projects/detect-outliers/', payload, getAuthHeader());
                setOutlierData(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to analyze outliers.');
            } finally {
                setIsDetecting(false);
            }
        };
        detectOutliers();
    }, [projectId, column.name, getAuthHeader]);

    return (
        <Modal onClose={onClose}>
            <div className="modal-header">
                <h3>Outlier Analysis: <span style={{color: 'var(--primary-color)'}}>{column.name}</span></h3>
                <button onClick={onClose} className="modal-close-btn" disabled={isDetecting || isTreating}><IconX/></button>
            </div>
            <div className="modal-body">
                {isDetecting ? (<p>Analyzing...</p>) 
                : error ? (<div className="message-bar message-error">{error}</div>) 
                : outlierData ? (
                    <>
                        <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
                            <div style={{flex: 1}}>
                                <p><strong>Outliers Found:</strong> <span style={{color: outlierData.outlier_count > 0 ? 'var(--danger-color)' : 'var(--success-color)', fontWeight: 'bold'}}>{outlierData.outlier_count}</span></p>
                                <p style={{fontSize: '14px'}}><strong>Lower Bound:</strong> {outlierData.lower_bound?.toFixed(2)}</p>
                                <p style={{fontSize: '14px'}}><strong>Upper Bound:</strong> {outlierData.upper_bound?.toFixed(2)}</p>
                                {outlierData.sample_outliers?.length > 0 && (
                                    <div style={{marginTop: '10px'}}>
                                        <p style={{fontSize: '12px', margin: '0 0 5px 0'}}><strong>Sample Outliers:</strong></p>
                                        <ul style={{fontSize: '12px', margin: 0, paddingLeft: '20px', maxHeight: '100px', overflowY: 'auto'}}>
                                            {outlierData.sample_outliers.map((o, i) => <li key={i}>{o.toFixed(2)}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div style={{flex: 1}}>
                                <img src={outlierData.plot_base64} alt="Box plot" style={{maxWidth: '100%', borderRadius: '4px'}} />
                            </div>
                        </div>
                        {outlierData.outlier_count > 0 && (
                            <div style={{marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                                <h4 style={{marginTop: 0}}>Treatment Options</h4>
                                <p style={{fontSize: '14px'}}>How would you like to handle the {outlierData.outlier_count} outliers?</p>
                            </div>
                        )}
                    </>
                ) : null}
            </div>
            <div className="modal-footer">
                <button onClick={onClose} className="btn btn-light" disabled={isDetecting || isTreating}>Close</button>
                {!isDetecting && outlierData && outlierData.outlier_count > 0 && (
                    <>
                        <button onClick={() => onTreat('cap')} disabled={isTreating} className="btn btn-warning">
                            {isTreating ? <IconLoader/> : 'Cap Outliers'}
                        </button>
                        <button onClick={() => onTreat('remove')} disabled={isTreating} className="btn btn-danger">
                            {isTreating ? <IconLoader/> : 'Remove Rows'}
                        </button>
                    </>
                )}
            </div>
        </Modal>
    );
};

// ====================================================================
// --- Tab-Specific Components (for performance) ---
// ====================================================================

/**
 * Component for the "Preparation & Cleaning" Tab
 */
const PreparationTab = ({ metadata, onDataRefreshed, getAuthHeader }) => {
    const { projectId } = useParams(); // Use mock-safe hook

    // --- Modal States ---
    const [isImputeModalOpen, setIsImputeModalOpen] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [isOutlierModalOpen, setIsOutlierModalOpen] = useState(false);
    const [isRecodeModalOpen, setIsRecodeModalOpen] = useState(false);

    // --- Selected Column States ---
    const [selectedColumn, setSelectedColumn] = useState(null);
    const [columnToRemove, setColumnToRemove] = useState(null);
    const [columnToRecode, setColumnToRecode] = useState(null);
    
    // --- Unique Values (for Recode) ---
    const [uniqueValuesToRecode, setUniqueValuesToRecode] = useState([]);
    const [isFetchingUniqueValues, setIsFetchingUniqueValues] = useState(false);

    // --- Action Loading States ---
    const [isImputing, setIsImputing] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isTreating, setIsTreating] = useState(false);
    const [isRecoding, setIsRecoding] = useState(false);
    
    // --- Action Error States ---
    const [imputationError, setImputationError] = useState(null);
    const [removeError, setRemoveError] = useState(null);
    const [recodeError, setRecodeError] = useState(null);

    // --- Bulk Imputation States ---
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [bulkStrategy, setBulkStrategy] = useState('none');
    const [selectedBulkColumns, setSelectedBulkColumns] = useState([]);
    const [bulkConstantNumerical, setBulkConstantNumerical] = useState('');
    const [bulkConstantCategorical, setBulkConstantCategorical] = useState('');
    const [bulkImputeSuccess, setBulkImputeSuccess] = useState(null);
    const [bulkImputeError, setBulkImputeError] = useState(null);
    const [isImputeAllSelected, setIsImputeAllSelected] = useState(false);

    // --- Bulk Outlier States ---
    const [isOutlierProcessing, setIsOutlierProcessing] = useState(false);
    const [bulkOutlierStrategy, setBulkOutlierStrategy] = useState('none');
    const [selectedBulkOutlierColumns, setSelectedBulkOutlierColumns] = useState([]);
    const [isOutlierAllSelected, setIsOutlierAllSelected] = useState(false);
    const [bulkOutlierSuccess, setBulkOutlierSuccess] = useState(null);
    const [bulkOutlierError, setBulkOutlierError] = useState(null);
    
    // --- Memoized Derived Data ---
    const missingColumns = useMemo(() => metadata.metadata.filter(col => col.missing_count > 0), [metadata]);
    const numericalColumns = useMemo(() => metadata.metadata.filter(c => c.type === 'numerical').map(c => c.name) || [], [metadata]);
    
    // --- Modal Handlers (Open) ---
    const handleImputeClick = (column) => { setSelectedColumn(column); setImputationError(null); setIsImputeModalOpen(true); };
    const handleRemoveClick = (column) => { setColumnToRemove(column); setRemoveError(null); setIsRemoveModalOpen(true); };
    const handleOutlierClick = (column) => { setSelectedColumn(column); setIsOutlierModalOpen(true); };
    const handleRecodeClick = async (column) => {
        if (column.type !== 'categorical') return;
        setColumnToRecode(column); setRecodeError(null); setIsRecodeModalOpen(true); setIsFetchingUniqueValues(true); setUniqueValuesToRecode([]);
        const authHeader = getAuthHeader();
        if (!authHeader) return;
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/projects/${projectId}/unique-values/${column.name}/`, authHeader);
            setUniqueValuesToRecode(response.data.unique_values);
        } catch (err) {
            setRecodeError(err.response?.data?.error || 'Failed to fetch unique values.');
        } finally { setIsFetchingUniqueValues(false); }
    };
    
    // --- Modal Handlers (Close) ---
    const handleCloseImputeModal = () => setIsImputeModalOpen(false);
    const handleCloseRemoveModal = () => setIsRemoveModalOpen(false);
    const handleCloseOutlierModal = () => setIsOutlierModalOpen(false);
    const handleCloseRecodeModal = () => { setRecodeError(null); setIsRecodeModalOpen(false); setUniqueValuesToRecode([]); };

    // --- Bulk Selection Handlers ---
    const handleSelectBulkColumn = (columnName) => {
        setSelectedBulkColumns(prev => prev.includes(columnName) ? prev.filter(name => name !== columnName) : [...prev, columnName]);
        setBulkImputeSuccess(null); setIsImputeAllSelected(false);
    };
    const handleSelectBulkOutlierColumn = (columnName) => {
        setSelectedBulkOutlierColumns(prev => prev.includes(columnName) ? prev.filter(name => name !== columnName) : [...prev, columnName]);
        setBulkOutlierSuccess(null); setIsOutlierAllSelected(false);
    };

    // --- Action Submit Handlers ---
    const handleImputeSubmit = async (method, constantValue) => {
        setIsImputing(true); setImputationError(null);
        try {
            const payload = { project_id: projectId, column_name: selectedColumn.name, method: method, constant_value: method === 'constant' ? constantValue : null };
            await axios.post('http://127.0.0.1:8000/api/projects/impute/', payload, getAuthHeader());
            onDataRefreshed(); // Notify parent to refresh
            handleCloseImputeModal();
        } catch (err) { setImputationError(err.response?.data?.error || 'An error occurred.');
        } finally { setIsImputing(false); }
    };

    const handleRemoveConfirm = async () => {
        setIsRemoving(true); setRemoveError(null);
        try {
            const payload = { project_id: projectId, column_name: columnToRemove.name };
            await axios.post('http://127.0.0.1:8000/api/projects/remove-column/', payload, getAuthHeader());
            onDataRefreshed(); // Notify parent to refresh
            handleCloseRemoveModal();
        } catch (err) { setRemoveError(err.response?.data?.error || 'An error occurred.');
        } finally { setIsRemoving(false); }
    };
    
    const handleTreatOutliers = async (method) => {
        setIsTreating(true);
        try {
            const payload = { project_id: projectId, column_name: selectedColumn.name, method: method };
            await axios.post('http://127.0.0.1:8000/api/projects/treat-outliers/', payload, getAuthHeader());
            onDataRefreshed(); // Notify parent to refresh
            handleCloseOutlierModal();
        } catch (err) {
            // Error handling is inside the modal component, but we'll log it too
            console.error("Outlier treatment failed:", err);
        } finally {
            setIsTreating(false);
        }
    };
    
    const handleRecodeSubmit = async (selectedValues, newValue) => {
        setIsRecoding(true); setRecodeError(null);
        const recodeMap = {}; selectedValues.forEach(oldValue => { recodeMap[oldValue] = newValue; });
        try {
            const payload = { project_id: projectId, column_name: columnToRecode.name, recode_map: recodeMap };
            await axios.post('http://127.0.0.1:8000/api/recode-column/', payload, getAuthHeader());
            onDataRefreshed(); // Notify parent to refresh
            handleCloseRecodeModal();
        } catch (err) { setRecodeError(err.response?.data?.error || 'An error occurred during recoding.');
        } finally { setIsRecoding(false); }
    };
    
    // --- Bulk Submit Handlers ---
    const handleExecuteBulkImpute = async () => {
        if (bulkStrategy === 'none') { setBulkImputeError("Please select an imputation strategy."); return; }
        const colsToProcess = isImputeAllSelected ? missingColumns.map(c => c.name) : selectedBulkColumns;
        if (colsToProcess.length === 0) { setBulkImputeError("No columns selected for imputation."); return; }

        if (bulkStrategy === 'constant') {
            const numCols = metadata.metadata.filter(c => colsToProcess.includes(c.name) && c.type === 'numerical');
            const catCols = metadata.metadata.filter(c => colsToProcess.includes(c.name) && c.type === 'categorical');
            if (numCols.length > 0 && bulkConstantNumerical.trim() === '') { setBulkImputeError("Constant numerical value is required."); return; }
            if (catCols.length > 0 && bulkConstantCategorical.trim() === '') { setBulkImputeError("Constant categorical value is required."); return; }
        }

        setIsBulkProcessing(true); setBulkImputeError(null); setBulkImputeSuccess(null);
        const authHeader = getAuthHeader();
        const strategyDef = BULK_IMPUTE_STRATEGIES.find(s => s.key === bulkStrategy);
        let errorCount = 0; let successCount = 0;

        for (const colName of colsToProcess) {
            const colMeta = metadata.metadata.find(c => c.name === colName);
            if (!colMeta || colMeta.missing_count === 0) continue;
            const typeKey = colMeta.type === 'numerical' ? 'numerical' : 'categorical';
            let method = strategyDef[typeKey];
            let constant_value = (method === 'constant') ? (colMeta.type === 'numerical' ? bulkConstantNumerical : bulkConstantCategorical) : null;

            try {
                const payload = { project_id: projectId, column_name: colName, method: method, constant_value: constant_value };
                await axios.post('http://127.0.0.1:8000/api/projects/impute/', payload, { ...authHeader });
                successCount++;
            } catch (err) { errorCount++; setBulkImputeError(`Failed to impute ${colName}: ${err.response?.data?.error || 'Unknown error'}`); break; }
        }

        setIsBulkProcessing(false); setSelectedBulkColumns([]);
        setIsImputeAllSelected(false);

        if (errorCount === 0) {
            setBulkImputeSuccess(`Successfully imputed ${successCount} column(s).`);
            onDataRefreshed(); // Notify parent
        }
    };
    
    const handleExecuteBulkOutlier = async () => {
        if (bulkOutlierStrategy === 'none') { setBulkOutlierError("Please select an outlier treatment strategy."); return; }
        const colsToProcess = isOutlierAllSelected ? numericalColumns : selectedBulkOutlierColumns;
        if (colsToProcess.length === 0) { setBulkOutlierError("No numerical columns selected for treatment."); return; }

        setIsOutlierProcessing(true); setBulkOutlierError(null); setBulkOutlierSuccess(null);
        const authHeader = getAuthHeader();
        const strategyDef = BULK_OUTLIER_STRATEGIES.find(s => s.key === bulkOutlierStrategy);
        let errorCount = 0; let successCount = 0;

        for (const colName of colsToProcess) {
            const colMeta = metadata.metadata.find(c => c.name === colName);
            if (!colMeta || colMeta.type !== 'numerical') continue;

            try {
                const payload = { project_id: projectId, column_name: colName, method: strategyDef.method };
                await axios.post('http://127.0.0.1:8000/api/projects/treat-outliers/', payload, { ...authHeader });
                successCount++;
            } catch (err) { errorCount++; setBulkOutlierError(`Failed to treat outliers in ${colName}: ${err.response?.data?.error || 'Unknown error'}`); break; }
        }

        setIsOutlierProcessing(false); setSelectedBulkOutlierColumns([]);
        setIsOutlierAllSelected(false);

        if (errorCount === 0) {
            setBulkOutlierSuccess(`Successfully applied outlier treatment to ${successCount} column(s).`);
            onDataRefreshed(); // Notify parent
        }
    };

    return (
        <div>
            {isImputeModalOpen && selectedColumn && (
                <ImputeModal
                    column={selectedColumn}
                    onClose={handleCloseImputeModal}
                    onSubmit={handleImputeSubmit}
                    isSubmitting={isImputing}
                    error={imputationError}
                />
            )}
            {isRemoveModalOpen && columnToRemove && (
                <ConfirmModal
                    title="Remove Column"
                    message={`Are you sure you want to permanently remove the column "${columnToRemove.name}"?`}
                    onConfirm={handleRemoveConfirm}
                    onClose={handleCloseRemoveModal}
                    isConfirming={isRemoving}
                />
            )}
            {isOutlierModalOpen && selectedColumn && (
                <OutlierModal
                    column={selectedColumn}
                    onClose={handleCloseOutlierModal}
                    onTreat={handleTreatOutliers}
                    isTreating={isTreating}
                />
            )}
            {isRecodeModalOpen && columnToRecode && (
                <RecodeModal
                    columnName={columnToRecode.name}
                    uniqueValues={uniqueValuesToRecode}
                    onClose={handleCloseRecodeModal}
                    onSubmit={handleRecodeSubmit}
                    isSubmitting={isRecoding || isFetchingUniqueValues}
                    error={recodeError || (isFetchingUniqueValues ? "Loading unique values..." : null)}
                />
            )}
            
            <h3>Column Analysis & Cleaning Tools</h3>
            
            {/* Bulk Imputation UI */}
            <div className="bulk-action-bar">
                <h4>Bulk Imputation:</h4>
                <select value={bulkStrategy} onChange={(e) => { setBulkStrategy(e.target.value); setBulkImputeError(null); setBulkImputeSuccess(null); }} disabled={missingColumns.length === 0 || isBulkProcessing} className="form-select">
                    {BULK_IMPUTE_STRATEGIES.map(s => (<option key={s.key} value={s.key} disabled={s.key === 'none'}>{s.label}</option>))}
                </select>
                {bulkStrategy === 'constant' && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input type="text" placeholder="Num Value" value={bulkConstantNumerical} onChange={(e) => setBulkConstantNumerical(e.target.value)} className="form-input" disabled={isBulkProcessing}/>
                        <input type="text" placeholder="Cat Value" value={bulkConstantCategorical} onChange={(e) => setBulkConstantCategorical(e.target.value)} className="form-input" disabled={isBulkProcessing}/>
                    </div>
                )}
                <label style={{marginLeft: '15px', fontSize: '0.9em'}}><input type="checkbox" checked={isImputeAllSelected} onChange={(e) => { setIsImputeAllSelected(e.target.checked); setSelectedBulkColumns(e.target.checked ? missingColumns.map(c => c.name) : []); }} disabled={missingColumns.length === 0 || isBulkProcessing}/> Select All Missing ({missingColumns.length})</label>
                <button onClick={handleExecuteBulkImpute} disabled={(selectedBulkColumns.length === 0 && !isImputeAllSelected) || bulkStrategy === 'none' || isBulkProcessing} className="btn btn-success">
                    {isBulkProcessing ? <IconLoader/> : 'Apply'}
                </button>
            </div>
            {bulkImputeSuccess && <div className="message-bar message-success"><IconCheck/> {bulkImputeSuccess}</div>}
            {bulkImputeError && <div className="message-bar message-error"><IconAlert/> {bulkImputeError}</div>}

            {/* Bulk Outlier UI */}
            <div className="bulk-action-bar outlier">
                <h4>Bulk Outliers:</h4>
                <select value={bulkOutlierStrategy} onChange={(e) => { setBulkOutlierStrategy(e.target.value); setBulkOutlierError(null); setBulkOutlierSuccess(null); }} disabled={numericalColumns.length === 0 || isOutlierProcessing} className="form-select">
                    {BULK_OUTLIER_STRATEGIES.map(s => (<option key={s.key} value={s.key} disabled={s.key === 'none'}>{s.label}</option>))}
                </select>
                <label style={{marginLeft: '15px', fontSize: '0.9em'}}><input type="checkbox" checked={isOutlierAllSelected} onChange={(e) => { setIsOutlierAllSelected(e.target.checked); setSelectedBulkOutlierColumns(e.target.checked ? numericalColumns : []); }} disabled={numericalColumns.length === 0 || isOutlierProcessing}/> Select All Numerical ({numericalColumns.length})</label>
                <button onClick={handleExecuteBulkOutlier} disabled={(selectedBulkOutlierColumns.length === 0 && !isOutlierAllSelected) || bulkOutlierStrategy === 'none' || isOutlierProcessing} className="btn btn-info">
                    {isOutlierProcessing ? <IconLoader/> : 'Apply'}
                </button>
            </div>
            {bulkOutlierSuccess && <div className="message-bar message-success"><IconCheck/> {bulkOutlierSuccess}</div>}
            {bulkOutlierError && <div className="message-bar message-error"><IconAlert/> {bulkOutlierError}</div>}

            {/* Column Table */}
            <table className="column-table">
                <thead><tr><th>Column Name</th><th>Type</th><th>Missing</th><th>Unique</th><th>Actions</th></tr></thead>
                <tbody>
                    {metadata.metadata.map((col) => {
                        const hasMissing = col.missing_count > 0;
                        const isNumeric = col.type === 'numerical';
                        const isCategorical = col.type === 'categorical';
                        const isImputeSelected = selectedBulkColumns.includes(col.name);
                        const isOutlierSelected = selectedBulkOutlierColumns.includes(col.name);
                        return (
                            <tr key={col.name}>
                                <td>{col.name}</td>
                                <td><span style={{backgroundColor: '#6c757d', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '12px'}}>{col.type}</span></td>
                                <td style={{color: hasMissing ? 'var(--danger-color)' : 'inherit', fontWeight: 'bold'}}>{col.missing_count}</td>
                                <td>{col.unique_values}</td>
                                <td><div className="actions-cell">
                                    <input type="checkbox" checked={isImputeSelected} onChange={() => handleSelectBulkColumn(col.name)} disabled={!hasMissing || isBulkProcessing || isImputeAllSelected} title={hasMissing ? "Select for Bulk Imputation" : "No missing values"} />
                                    <button onClick={() => handleImputeClick(col)} disabled={!hasMissing} className="btn btn-warning">Impute</button>
                                    <button onClick={() => handleRecodeClick(col)} disabled={!isCategorical} className="btn btn-warning">Recode</button>
                                    <input type="checkbox" checked={isOutlierSelected} onChange={() => handleSelectBulkOutlierColumn(col.name)} disabled={!isNumeric || isOutlierProcessing || isOutlierAllSelected} title={isNumeric ? "Select for Bulk Outlier Treatment" : "Requires numerical column"} style={{marginLeft: '10px'}}/>
                                    <button onClick={() => handleOutlierClick(col)} disabled={!isNumeric} className="btn btn-info">Outliers</button>
                                    <button onClick={() => handleRemoveClick(col)} className="btn btn-danger">Remove</button>
                                </div></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

/**
 * Component for the "Data View" Tab
 */
const DataViewTab = ({ projectId, metadata, getAuthHeader }) => {
    const [rowData, setRowData] = useState(null);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filters, setFilters] = useState({});
    const [error, setError] = useState(null);

    const allColumnNames = useMemo(() => metadata?.metadata.map(c => c.name) || [], [metadata]);

    const fetchRawData = useCallback(async () => {
        setIsFetchingData(true);
        setError(null);
        const authHeader = getAuthHeader();
        if (!authHeader) {
            setError("Authentication failed.");
            setIsFetchingData(false);
            return;
        }

        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/projects/${projectId}/raw-data/`, authHeader);
            setRowData(response.data.raw_data);
        } catch (err) {
            console.error('Failed to fetch raw data:', err);
            setError(err.response?.data?.error || 'Failed to fetch raw data for table view.');
        } finally {
            setIsFetchingData(false);
        }
    }, [projectId, getAuthHeader]);

    // Fetch data on mount
    useEffect(() => {
        fetchRawData();
    }, [fetchRawData]);

    const handleSetFilter = useCallback((column, value, clear = false) => {
        setFilters(prevFilters => {
            if (clear) return { ...prevFilters, [column]: [] };
            const current = prevFilters[column] || [];
            const valueString = String(value);
            if (current.includes(valueString)) {
                return { ...prevFilters, [column]: current.filter(v => v !== valueString) };
            } else {
                return { ...prevFilters, [column]: [...current, valueString] };
            }
        });
    }, []);

    return (
        <div style={{ marginTop: '20px' }}>
            <h3>Raw Data Table</h3>
            {error && <div className="message-bar message-error"><IconAlert/> {error}</div>}
            {isFetchingData ? (<div style={{ textAlign: 'center', padding: '50px' }}>Loading full dataset...</div>) 
            : rowData ? (
                <DataTableDisplay data={rowData} columns={allColumnNames} metadata={metadata} setSortConfig={setSortConfig} sortConfig={sortConfig} filters={filters} setFilter={handleSetFilter}/>
            ) : (!error && <div style={{ textAlign: 'center', padding: '50px', color: '#6c757d' }}>No data loaded for table view.</div>)}
        </div>
    );
};

/**
 * Component for the "Visualization" Tab
 */
const VisualizationTab = ({ project, metadata, getAuthHeader }) => {
    const { projectId } = useParams(); // Use mock-safe hook

    // --- Visualization States ---
    const [analysisType, setAnalysisType] = useState('Multivariate');
    const [selectedChartKey, setSelectedChartKey] = useState('heatmap');
    const [columnMapping, setColumnMapping] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [chartData, setChartData] = useState(null);
    const [analysisText, setAnalysisText] = useState('');
    const [generationError, setGenerationError] = useState(null);
    const [hypertuneParams, setHypertuneParams] = useState({});
    
    // --- Reporting State ---
    const [chartToSave, setChartToSave] = useState(null);
    const [isSavingChart, setIsSavingChart] = useState(false); // Used for export button
    const [exportSuccess, setExportSuccess] = useState(false);

    // --- Memoized Derived Data (Hooks) ---
    const numericalColumns = useMemo(() => metadata?.metadata.filter(c => c.type === 'numerical').map(c => c.name) || [], [metadata]);
    const categoricalColumns = useMemo(() => metadata?.metadata.filter(c => c.type === 'categorical').map(c => c.name) || [], [metadata]);
    const temporalColumns = useMemo(() => metadata?.metadata.filter(c => c.type === 'temporal').map(c => c.name) || [], [metadata]);
    const selectedChart = useMemo(() => CHART_CONFIG[analysisType]?.find(c => c.key === selectedChartKey), [analysisType, selectedChartKey]);

    const getColumnType = (columnName) => {
        if (!metadata) return null;
        const colMeta = metadata.metadata.find(c => c.name === columnName);
        return colMeta ? colMeta.type : null;
    };

    // --- VISUALIZATION MAPPING EFFECT ---
    useEffect(() => {
        const availableCharts = CHART_CONFIG[analysisType];
        if (availableCharts?.length > 0) {
            const chartStillExists = availableCharts.some(c => c.key === selectedChartKey);
            if (!chartStillExists) {
                setSelectedChartKey(availableCharts[0].key);
            }
        }
    }, [analysisType, selectedChartKey]);

    // Reset mapping and hypertune state when chart type changes
    useEffect(() => {
        setColumnMapping({});
        setHypertuneParams({});
        setChartData(null);
        setAnalysisText('');
        setGenerationError(null);
        setChartToSave(null);
    }, [analysisType, selectedChartKey]);

    // --- Chart Generation Logic ---
    const handleGenerateChart = async () => {
        if (!selectedChart) {
            setGenerationError("Please select a valid chart type first.");
            setIsGenerating(false);
            return;
        }
        
        // --- 1. Validate Mapping ---
        let isMappingValid = false;
        if (selectedChartKey === 'line_chart') {
            const hasX = !!columnMapping['x_axis'];
            const hasY = !!columnMapping['y_axis'];
            const hasTime = !!columnMapping['time_axis'];
            isMappingValid = (hasX && hasY && !hasTime) || (hasTime && (hasX || hasY) && !(hasX && hasY));
        } else {
            isMappingValid = selectedChart.requires.every(req => {
                const value = columnMapping[req.role];
                if (req.selectionType === 'multi-select') {
                    return Array.isArray(value) && value.length >= (req.minCount || 1);
                }
                return !!value;
            });
        }

        if (!isMappingValid) {
            let errorMsg = "Please complete all required column mappings.";
            if(selectedChartKey === 'line_chart') {
                errorMsg = "Line Chart requires either two Numerical Axes OR one Temporal Axis and one Numerical Axis.";
            }
            setGenerationError(errorMsg);
            setIsGenerating(false);
            return;
        }

        // --- 2. Execute Server-Side Generation ---
        setIsGenerating(true);
        setChartData(null);
        setAnalysisText('');
        setGenerationError(null);
        setChartToSave(null); 
        setExportSuccess(false);

        try {
            const payload = {
                project_id: projectId,
                chart_type: selectedChartKey,
                columns: columnMapping,
                hypertune_params: hypertuneParams 
            };
            const response = await axios.post('http://127.0.0.1:8000/api/generate-chart/', payload, getAuthHeader());
            const rawChartData = response.data.chart_data;

            const savedChartConfig = {
                id: Date.now(),
                chartData: rawChartData,
                chartType: selectedChartKey,
                columnMapping: columnMapping,
                hypertuneParams: hypertuneParams,
                projectName: project.title,
                projectId: projectId
            };
            
            setChartData(rawChartData);
            setAnalysisText(response.data.analysis_text);
            setChartToSave(savedChartConfig);

        } catch (err) {
            setGenerationError(err.response?.data?.error || 'An error occurred while generating the chart.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    // --- Client-Side Tuning Application ---
    const handleApplyTuning = async () => {
        if (!chartData) {
            setGenerationError("Please generate a chart first before applying tuning.");
            return;
        }
        setExportSuccess(false);

        const needsRegenerationKeys = ['nbins', 'gridsize', 'color_palette'];
        const requiresReGeneration = needsRegenerationKeys.some(key =>
            hypertuneParams.hasOwnProperty(key) && hypertuneParams[key] !== chartToSave?.hypertuneParams?.[key]
        );

        if (requiresReGeneration || typeof chartData !== 'object' || !chartData.layout || !chartData.data) {
            if (requiresReGeneration) {
                setGenerationError("A core parameter (bins, gridsize, or color palette) was changed. Re-running server generation...");
            }
            await handleGenerateChart();
            return;
        }

        try {
            const updatedChartData = JSON.parse(JSON.stringify(chartData));
            const newLayout = updatedChartData.layout;
            const newChartTraces = updatedChartData.data;

            // 1. Apply Layout and Title
            const customTitle = hypertuneParams.custom_title;
            if (customTitle !== undefined) {
                newLayout.title = { text: customTitle, font: newLayout.title?.font };
            }

            // 2. Apply Axis Ranges
            const xMin = hypertuneParams.x_range_min;
            const xMax = hypertuneParams.x_range_max;
            const yMin = hypertuneParams.y_range_min;
            const yMax = hypertuneParams.y_range_max;

            newLayout.xaxis = newLayout.xaxis || {};
            if (xMin && xMax && !isNaN(parseFloat(xMin)) && !isNaN(parseFloat(xMax))) {
                newLayout.xaxis.range = [parseFloat(xMin), parseFloat(xMax)];
                newLayout.xaxis.autorange = false;
            } else {
                delete newLayout.xaxis.range;
                newLayout.xaxis.autorange = true;
            }

            newLayout.yaxis = newLayout.yaxis || {};
            if (yMin && yMax && !isNaN(parseFloat(yMin)) && !isNaN(parseFloat(yMax))) {
                newLayout.yaxis.range = [parseFloat(yMin), parseFloat(yMax)];
                newLayout.yaxis.autorange = false;
            } else {
                delete newLayout.yaxis.range;
                newLayout.yaxis.autorange = true;
            }

            // 3. Apply Trace Styles
            const size = hypertuneParams.marker_size;
            const opacity = hypertuneParams.opacity;
            const lineWidth = hypertuneParams.line_width;
            const lineStyle = hypertuneParams.line_style;
            const barmode = hypertuneParams.barmode;

            if (barmode) {
                newLayout.barmode = barmode;
            } else {
                delete newLayout.barmode;
            }

            newChartTraces.forEach(trace => {
                trace.marker = trace.marker || {};
                if (size !== undefined && !isNaN(parseFloat(size))) {
                    trace.marker.size = parseFloat(size);
                }
                if (opacity !== undefined && !isNaN(parseFloat(opacity))) {
                    trace.marker.opacity = parseFloat(opacity);
                }

                trace.line = trace.line || {};
                if (lineWidth !== undefined && !isNaN(parseFloat(lineWidth))) {
                    trace.line.width = parseFloat(lineWidth);
                }
                if (lineStyle !== undefined) {
                    trace.line.dash = lineStyle;
                }
                if (opacity !== undefined && !isNaN(parseFloat(opacity)) && ['area', 'line_chart'].includes(selectedChartKey)) {
                    trace.opacity = parseFloat(opacity);
                }
            });

            // 4. Update State
            setChartData(updatedChartData);
            setChartToSave(prev => ({
                ...prev,
                chartData: updatedChartData,
                hypertuneParams: hypertuneParams 
            }));
            setGenerationError(null);

        } catch (e) {
            console.error("Client-side tuning failed:", e);
            setGenerationError("Failed to apply tuning. Try re-generating the chart.");
        }
    };

    // --- Chart Export Logic ---
    const handleExportChart = () => {
        if (!chartToSave || !project || !project.id) {
            setGenerationError("Chart or project data is not available for export.");
            return;
        }
        
        setIsSavingChart(true);
        setExportSuccess(false);
        try {
            const exportConfig = {
                id: chartToSave.id || Date.now(),
                chartData: chartToSave.chartData,
                chartType: selectedChartKey,
                columnMapping: columnMapping,
                hypertuneParams: hypertuneParams,
                projectId: parseInt(project.id),
                projectName: project.title,
                exportedAt: new Date().toISOString()
            };
            
            const configString = JSON.stringify(exportConfig);
            sessionStorage.setItem('exportedChartConfig', configString);
            
            setExportSuccess(true);
            setGenerationError(null);
            
            // Automatically switch to reporting tab after success
            // This is handled by the parent component in this refactor
            // We'll just show a success message
            
        } catch (error) {
            console.error('Export error:', error);
            setGenerationError(`Export failed: ${error.message}`);
        } finally {
            setIsSavingChart(false);
        }
    };

    // --- Column Selection Logic ---
    const handleColumnSelect = (req, columnName) => {
        const { role, selectionType } = req;
        setExportSuccess(false); // Reset export status on change

        if (selectionType === 'multi-select') {
            setColumnMapping(prev => {
                const currentSelection = prev[role] || [];
                let newSelection;
                if (currentSelection.includes(columnName)) {
                    newSelection = currentSelection.filter(col => col !== columnName);
                } else {
                    newSelection = [...currentSelection, columnName];
                }
                return { ...prev, [role]: newSelection };
            });
        } else {
            setColumnMapping(prev => {
                const newMapping = { ...prev };

                if (columnName === "") {
                    delete newMapping[role];
                    setGenerationError(null);
                    return newMapping;
                }

                newMapping[role] = columnName;
                const newType = getColumnType(columnName);

                if (['bar_chart', 'stacked_bar_chart', 'violin_plot'].includes(selectedChartKey)) {
                    const otherRole = (role === 'x_axis') ? 'y_axis' : 'x_axis';
                    const otherCol = newMapping[otherRole];
                    const otherType = otherCol ? getColumnType(otherCol) : null;

                    if (otherCol) {
                        if (newType === 'numerical' && otherType === 'numerical') {
                            setGenerationError(`Bar/Violin Chart requires one Numerical and one Categorical/Temporal column. Cannot select two Numerical columns.`);
                            return prev; 
                        }
                        if (['categorical', 'temporal'].includes(newType) && ['categorical', 'temporal'].includes(otherType)) {
                            setGenerationError(`Bar/Violin Chart requires one Numerical and one Categorical/Temporal column. Cannot select two Categorical/Temporal columns.`);
                            return prev;
                        }
                    }
                    setGenerationError(null);
                    if (role === 'color' && getColumnType(columnName) !== 'categorical') {
                        setGenerationError(`Color/Stack By column must be categorical.`);
                        return prev;
                    }
                    return newMapping;
                }

                if (selectedChartKey === 'line_chart') {
                    if (role === 'x_axis' && newMapping.y_axis) { delete newMapping.time_axis; }
                    else if (role === 'y_axis' && newMapping.x_axis) { delete newMapping.time_axis; }
                    else if (role === 'time_axis') {
                        if(newMapping.x_axis && newMapping.y_axis) { delete newMapping.y_axis; }
                    }
                    else if (role === 'x_axis' && newMapping.time_axis) { delete newMapping.y_axis; }
                    else if (role === 'y_axis' && newMapping.time_axis) { delete newMapping.x_axis; }
                }
                
                setGenerationError(null);
                return newMapping;
            });
        }
    };

    // --- Derived states for chart options ---
    let isXDisabled = false;
    let isYDisabled = false;
    let isTimeDisabled = false;
    if (selectedChartKey === 'line_chart') {
        const { x_axis, y_axis, time_axis } = columnMapping;
        if (x_axis && y_axis) { isTimeDisabled = true; }
        if (time_axis && y_axis) { isXDisabled = true; }
        if (time_axis && x_axis) { isYDisabled = true; }
    }

    let xAxisOptions = [...numericalColumns, ...categoricalColumns, ...temporalColumns];
    let yAxisOptions = [...numericalColumns, ...categoricalColumns, ...temporalColumns];

    if (['bar_chart', 'stacked_bar_chart', 'violin_plot'].includes(selectedChartKey)) {
        const xCol = columnMapping['x_axis'];
        const yCol = columnMapping['y_axis'];
        const xType = xCol ? getColumnType(xCol) : null;
        const yType = yCol ? getColumnType(yCol) : null;

        if (xCol && xType) {
            if (xType === 'numerical') {
                yAxisOptions = [...categoricalColumns, ...temporalColumns];
            } else {
                yAxisOptions = numericalColumns;
            }
        }
        if (yCol && yType) {
            if (yType === 'numerical') {
                xAxisOptions = [...categoricalColumns, ...temporalColumns];
            } else {
                xAxisOptions = numericalColumns;
            }
        }
    }
    
    return (
        <div className="viz-layout">
            {/* LEFT COLUMN: CONFIG & TUNING */}
            <div className="viz-config-panel">
                <h3>Chart Configuration</h3>
                <div className="form-input-group">
                    <label>1. Analysis Type</label>
                    <select value={analysisType} onChange={e => setAnalysisType(e.target.value)} className="form-select">
                        {Object.keys(CHART_CONFIG).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div className="form-input-group" style={{marginTop: '10px'}}>
                    <label>2. Chart</label>
                    <select value={selectedChartKey} onChange={e => { setSelectedChartKey(e.target.value); }} className="form-select">
                        {CHART_CONFIG[analysisType]?.map(chart => <option key={chart.key} value={chart.key}>{chart.name}</option>)}
                    </select>
                    <p className="description">{selectedChart?.description}</p>
                </div>

                {/* Column Mapping UI */}
                {selectedChart && selectedChart.requires.length > 0 && (
                    <div className="mapping-group">
                        <label>3. Map Data</label>
                        {selectedChart.requires.map(req => {
                            const { role, label, type, selectionType, optional } = req;
                            const isDisabled = (role === 'x_axis' && isXDisabled) || (role === 'y_axis' && isYDisabled) || (role === 'time_axis' && isTimeDisabled);
                            
                            let options = [];
                            if(['bar_chart', 'stacked_bar_chart', 'violin_plot'].includes(selectedChartKey)) {
                                if(role === 'x_axis') options = xAxisOptions;
                                else if(role === 'y_axis') options = yAxisOptions;
                                else if(role === 'color') options = categoricalColumns;
                                else {
                                    if (type === 'numerical') options = numericalColumns;
                                    else if (type === 'categorical') options = categoricalColumns;
                                    else if (type === 'temporal') options = temporalColumns;
                                    else if (type === 'any') options = [...numericalColumns, ...categoricalColumns, ...temporalColumns];
                                }
                            } else {
                                if (type === 'numerical') options = numericalColumns;
                                else if (type === 'categorical') options = categoricalColumns;
                                else if (type === 'temporal') options = temporalColumns;
                                else if (type === 'any') options = [...numericalColumns, ...categoricalColumns, ...temporalColumns];
                            }

                            if (selectionType === 'multi-select') {
                                const selectedCols = columnMapping[role] || [];
                                return (
                                    <div key={role} className="mapping-item">
                                        <label>{label} ({selectedCols.length} selected)</label>
                                        <div className="multi-select-box">
                                            {options.map(colName => (
                                                <div key={colName}><label><input type="checkbox" checked={selectedCols.includes(colName)} onChange={() => handleColumnSelect(req, colName)} />{colName}</label></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={role} className="mapping-item">
                                        <label style={{textTransform: 'capitalize', color: isDisabled ? '#ccc' : '#000'}}>{label}</label>
                                        <select onChange={e => handleColumnSelect(req, e.target.value)} value={columnMapping[role] || ''} className="form-select" disabled={isDisabled}>
                                            <option value="">-- {optional ? 'Optional' : `Select ${type}`} --</option>
                                            {options.map(colName => {
                                                const colType = getColumnType(colName);
                                                const displayType = type === 'any' ? ` (${colType})` : '';
                                                return <option key={colName} value={colName}>{colName}{displayType}</option>;
                                            })}
                                        </select>
                                    </div>
                                );
                            }
                        })}
                    </div>
                )}
                
                <button onClick={handleGenerateChart} disabled={isGenerating} className="btn btn-success">
                    {isGenerating ? <IconLoader/> : 'Generate Chart'}
                </button>
                {generationError && <div className="message-bar message-error" style={{marginTop: '15px'}}><IconAlert/> {generationError}</div>}
                {exportSuccess && <div className="message-bar message-success" style={{marginTop: '15px'}}><IconCheck/> Chart exported to Reporting!</div>}

                {/* Hyper-Tune Console */}
                {selectedChart && (
                    <HypertuneParameterConsole 
                        chartKey={selectedChartKey} 
                        hypertuneParams={hypertuneParams} 
                        setHypertuneParams={setHypertuneParams} 
                        selectedChart={selectedChart}
                    />
                )}
                <button onClick={handleApplyTuning} disabled={!chartData || isGenerating} className="btn btn-primary">
                    Apply Tuning
                </button>
            </div>

            {/* RIGHT COLUMN: DISPLAY */}
            <div className="viz-display-panel">
                {isGenerating ? <IconLoader/> 
                : !chartData ? (
                    <div className="viz-placeholder">
                        <span className="viz-placeholder-icon">📊</span>
                        <p>Your chart and analysis will appear here.</p>
                    </div>
                ) : (
                    <div className="viz-chart-container">
                        {typeof chartData === 'object' ? (
                            <Plot data={chartData.data} layout={chartData.layout} style={{ width: '100%', height: '500px' }} config={{responsive: true}} />
                        ) : (
                            <img src={chartData} alt="Generated Chart" style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px'}}/>
                        )}
                        <button onClick={handleExportChart} disabled={!chartToSave || isSavingChart} className="btn btn-primary" style={{marginTop: '15px'}}>
                            {isSavingChart ? <IconLoader/> : <IconSave />}
                            {isSavingChart ? 'Exporting...' : 'Export Chart to Reporting'}
                        </button>
                        {analysisText && (
                            <div className="viz-analysis-box">
                                <h4>Automated Analysis</h4>
                                <p>{analysisText}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Component: Dynamic Hyper-Tuning Console ---
const HypertuneParameterConsole = ({ chartKey, hypertuneParams, setHypertuneParams, selectedChart }) => {
    const configSections = useMemo(() => {
        if (!selectedChart) return {};
        const generalConfigs = HYPERTUNE_CONFIG.general.filter(c => c.chartTypes.includes(chartKey));
        const chartSpecificConfigs = HYPERTUNE_CONFIG[chartKey] || [];
        const sections = {};
        sections['General Style'] = generalConfigs.filter(c => c.key === 'custom_title' || c.key === 'color_palette');
        let appearanceConfigs = [];
        if (chartKey === 'scatter' || chartKey === 'bubble_chart') {
            appearanceConfigs = chartSpecificConfigs.filter(c => c.key === 'marker_size' || c.key === 'opacity');
            sections['Appearance (Markers)'] = appearanceConfigs;
        } else if (chartKey === 'line_chart' || chartKey === 'area_chart') {
            appearanceConfigs = chartSpecificConfigs.filter(c => c.key === 'line_style' || c.key === 'line_width' || c.key === 'opacity');
            sections['Appearance (Lines/Area)'] = appearanceConfigs;
        }
        let optionsConfigs = [];
        if (chartKey === 'histogram') {
            optionsConfigs = chartSpecificConfigs.filter(c => c.key === 'nbins');
        } else if (chartKey === 'bar_chart' || chartKey === 'stacked_bar_chart') {
            optionsConfigs = chartSpecificConfigs.filter(c => c.key === 'barmode');
        } else if (chartKey === 'hexbin_plot') {
            optionsConfigs = chartSpecificConfigs.filter(c => c.key === 'gridsize');
        }
        if (optionsConfigs.length > 0) sections['Data / Layout Options'] = optionsConfigs;
        const requiresAxis = ['histogram', 'scatter', 'bubble_chart', 'line_chart', 'area_chart', 'bar_chart', 'violin_plot', 'density_plot', 'hexbin_plot'].includes(chartKey);
        if (requiresAxis) sections['Axis Scaling (Override Auto)'] = HYPERTUNE_CONFIG.axis_scaling;
        return Object.fromEntries(Object.entries(sections).filter(([, configs]) => configs.length > 0));
    }, [chartKey, selectedChart]);

    const initialOpenSection = Object.keys(configSections).includes('General Style') ? 'General Style' : null;
    const [openSection, setOpenSection] = useState(initialOpenSection);
    const allConfigs = useMemo(() => Object.values(configSections).flat(), [configSections]);

    if (allConfigs.length === 0) {
        return <p style={{fontSize: '14px', color: '#6c757d', textAlign: 'center'}}>No hyper-tuning options available.</p>;
    }

    const handleChange = (key, value) => {
        setHypertuneParams(prev => ({ ...prev, [key]: value }));
    };

    const renderControl = (config) => {
        const value = hypertuneParams[config.key] !== undefined ? hypertuneParams[config.key] : config.defaultValue;
        const requiresRegen = ['nbins', 'gridsize', 'color_palette'].includes(config.key);
        const labelText = config.label + (requiresRegen ? ' (Regen)' : '');

        switch (config.type) {
            case 'text':
            case 'number_input':
                return (
                    <div key={config.key} className="form-input-group">
                        <label>{labelText}:</label>
                        <input
                            type={config.type === 'number_input' ? 'number' : 'text'}
                            value={value}
                            onChange={(e) => handleChange(config.key, e.target.value)}
                            placeholder={config.type === 'number_input' ? `Auto` : ''}
                            className="form-input"
                        />
                    </div>
                );
            case 'dropdown':
                return (
                    <div key={config.key} className="form-input-group">
                        <label>{labelText}:</label>
                        <select value={value} onChange={(e) => handleChange(config.key, e.target.value)} className="form-select">
                            {config.options.map(option => (
                                <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                );
            case 'range_input':
                return (
                    <div key={config.key} className="form-input-group">
                        <label>{labelText}: <span style={{ fontWeight: 'bold' }}>{value}</span></label>
                        <input
                            type="range"
                            min={config.min}
                            max={config.max}
                            step={config.step}
                            value={value}
                            onChange={(e) => handleChange(config.key, parseFloat(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="hypertune-console">
            <h4>Chart Customization</h4>
            <p className="hint">Tune colors, titles, and axis ranges. Click "Apply Tuning" to see changes. Parameters marked "(Regen)" require server recalculation.</p>
            {Object.keys(configSections).map((sectionName) => {
                const configs = configSections[sectionName];
                const isOpen = openSection === sectionName;
                let gridTemplateColumns = '1fr';
                if (sectionName.includes('Axis Scaling')) gridTemplateColumns = '1fr 1fr';
                else if (sectionName.includes('Appearance') || sectionName.includes('General Style') || sectionName.includes('Options')) {
                    gridTemplateColumns = configs.length >= 2 ? '1fr 1fr' : '1fr';
                }
                return (
                    <div key={sectionName} style={{ borderBottom: '1px solid #eee' }}>
                        <button onClick={() => setOpenSection(isOpen ? null : sectionName)} className={`hypertune-section-btn ${isOpen ? 'open' : ''}`}>
                            {sectionName}
                            <span><IconChevronDown/></span>
                        </button>
                        {isOpen && (
                            <div className="hypertune-content" style={{ gridTemplateColumns }}>
                                {configs.map(renderControl)}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
// --- END Dynamic Hyper-Tuning Component ---


// ====================================================================
// --- Main DataPrepPage Component (Parent) ---
// ====================================================================

const DataPrepPage = () => {
    const { projectId } = useParams(); // Use mock-safe hook
    const navigate = useNavigate();

    // --- Core States ---
    const [project, setProject] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('preparation'); // Start on prep
    
    // --- Auth Header Helper ---
    // Defined once here and passed down to children
    const getAuthHeader = useCallback(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return null;
        }
        return { headers: { 'Authorization': `Bearer ${token}` } };
    }, [navigate]);

    // --- Main Data Fetching ---
    const fetchProjectDetails = useCallback(async () => {
        setIsLoading(true);
        const authHeader = getAuthHeader();
        if (!authHeader) return;
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/projects/${projectId}/`, authHeader);
            setProject(response.data);
            setMetadata(response.data.metadata_json);
            setError(null); // Clear previous errors on success
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load project.');
        } finally {
            setIsLoading(false);
        }
    }, [projectId, getAuthHeader]);

    // Initial data fetch
    useEffect(() => {
        fetchProjectDetails();
    }, [fetchProjectDetails]);
    
    // --- Render Logic ---
    if (isLoading) return (
        <>
            <AppStyles />
            <div style={{padding: '50px', textAlign: 'center', fontFamily: 'Arial, sans-serif'}}>Loading Project Data...</div>
        </>
    );
    
    if (error) return (
         <>
            <AppStyles />
            <div style={{padding: '50px', textAlign: 'center', fontFamily: 'Arial, sans-serif', color: 'red'}}>{error}</div>
        </>
    );
    
    if (!project || !metadata) return (
        <>
            <AppStyles />
            <div style={{padding: '50px', textAlign: 'center', fontFamily: 'Arial, sans-serif'}}>Project not available.</div>
        </>
    );

    const totalMissingValues = metadata.metadata.reduce((sum, col) => sum + col.missing_count, 0);
    const missingColumns = metadata.metadata.filter(col => col.missing_count > 0);

    return (
        <>
            <AppStyles />
            <div className="workbench-page">
                <div className="workbench-container">
                    <div className="workbench-header">
                        <h2>Data Workbench: {project.title}</h2>
                    </div>
                    
                    <div className="summary-grid">
                        <div className="summary-card">
                            <h4>Project Summary</h4>
                            <p>
                                <strong>Rows:</strong> {metadata.rows} | 
                                <strong> Columns:</strong> {metadata.cols} | 
                                <strong> Missing Values:</strong> 
                                <strong className={totalMissingValues > 0 ? 'danger' : 'success'}>
                                    {totalMissingValues}
                                </strong> in {missingColumns.length} columns
                            </p>
                        </div>
                    </div>

                    {/* --- TAB BUTTONS --- */}
                    <div className="tab-bar">
                        <button className={`tab-button ${activeTab === 'preparation' ? 'active' : ''}`} onClick={() => setActiveTab('preparation')}>🛠️ Preparation & Cleaning</button>
                        <button className={`tab-button ${activeTab === 'dataview' ? 'active' : ''}`} onClick={() => setActiveTab('dataview')}>📋 Data View</button>
                        <button className={`tab-button ${activeTab === 'visualization' ? 'active' : ''}`} onClick={() => setActiveTab('visualization')}>📊 Visualization & Insights</button>
                        <button className={`tab-button ${activeTab === 'reporting' ? 'active' : ''}`} onClick={() => setActiveTab('reporting')}>📈 Reports/Dashboard</button>
                    </div>
                    {/* --- END TAB BUTTONS --- */}

                    {/* --- TAB CONTENT --- */}
                    {activeTab === 'preparation' && (
                        <PreparationTab 
                            metadata={metadata} 
                            onDataRefreshed={fetchProjectDetails} // Pass the refresh function
                            getAuthHeader={getAuthHeader}
                        />
                    )}
                    
                    {activeTab === 'dataview' && (
                        <DataViewTab 
                            projectId={projectId}
                            metadata={metadata}
                            getAuthHeader={getAuthHeader}
                        />
                    )}
                    
                    {activeTab === 'visualization' && (
                        <VisualizationTab
                            project={project}
                            metadata={metadata}
                            getAuthHeader={getAuthHeader}
                        />
                    )}

                    {activeTab === 'reporting' && (
                        <ReportingTabContent 
                            projectId={projectId} 
                            baseProject={project} 
                            getAuthHeader={getAuthHeader}
                        />
                    )}

                    <button onClick={() => navigate('/dashboard')} className="btn btn-light" style={{marginTop: '30px'}}>
                        <IconBack />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </>
    );
};

export default DataPrepPage;

