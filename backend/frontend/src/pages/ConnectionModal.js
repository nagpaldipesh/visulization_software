import React, { useState } from 'react';
import apiClient from '../apiClient';

// --- SVG Icon Components ---
const IconLoader = () => (
  <svg className="spinner" width="20" height="20" viewBox="0 0 50 50">
    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
  </svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const IconAlert = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon-alert" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// --- Embedded Styles ---
const AppStyles = () => (
  <style>{`
    :root {
      --primary-color: #007bff;
      --success-color: #28a745;
      --danger-color: #dc3545;
      --info-color: #17a2b8;
      --secondary-color: #6c757d;
      --gray-100: #f8f9fa;
      --gray-200: #e9ecef;
      --gray-500: #adb5bd;
      --gray-700: #495057;
      --gray-900: #212529;
      --text-light: #6c757d;
      --text-dark: #343a40;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: var(--gray-100);
      margin: 0;
      padding: 24px;
      color: var(--text-dark);
    }

    /* Generic Button */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      font-size: 15px;
      font-weight: 500;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s, opacity 0.2s;
      color: #ffffff;
      min-width: 100px;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-primary { background-color: var(--primary-color); }
    .btn-primary:hover:not(:disabled) { background-color: #0069d9; }
    .btn-success { background-color: var(--success-color); }
    .btn-success:hover:not(:disabled) { background-color: #218838; }
    .btn-danger { background-color: var(--danger-color); }
    .btn-danger:hover:not(:disabled) { background-color: #c82333; }
    .btn-secondary { background-color: var(--secondary-color); }
    .btn-secondary:hover:not(:disabled) { background-color: #5a6268; }
    .btn-info { background-color: var(--info-color); }
    .btn-info:hover:not(:disabled) { background-color: #138496; }
    
    /* Message/Alert Boxes */
    .message-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 15px 0 0 0;
      padding: 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
    }
    .message-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .message-success .icon-check { stroke: currentColor; }
    .message-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .message-error .icon-alert { stroke: currentColor; }
    
    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 20px;
    }
    .modal-content {
      background-color: #ffffff;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      max-width: 600px;
      width: 100%;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--gray-200);
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .modal-header h3 { margin: 0; font-size: 20px; }
    .modal-close-btn { background: none; border: none; cursor: pointer; color: var(--gray-500); }
    .modal-body {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
    }
    .modal-footer {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      border-top: 1px solid var(--gray-200);
      padding-top: 20px;
      margin-top: 20px;
    }

    /* Modal Form Inputs */
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .input-group label {
      font-weight: 500;
      font-size: 14px;
      color: var(--text-dark);
    }
    .input-group input, .input-group select {
      padding: 10px 12px;
      border: 1px solid var(--gray-500);
      border-radius: 5px;
      font-size: 15px;
      width: 100%;
      box-sizing: border-box; /* Important for grid layout */
    }
    .input-group small {
        color: var(--text-light);
        font-size: 12px;
        font-style: italic;
        margin-top: -2px;
    }
    .input-group.full-width {
        grid-column: 1 / -1;
    }
    
    /* Spinner Animation */
    .spinner { animation: rotate 2s linear infinite; }
    .spinner .path {
      stroke: #ffffff;
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

const DB_TYPES = [
    { value: 'postgres', label: 'PostgreSQL', port: 5432 },
    { value: 'mysql', label: 'MySQL', port: 3306 },
    { value: 'mssql', label: 'SQL Server', port: 1433 },
];

// Re-usable FormField component
const FormField = ({ label, name, type = 'text', value, onChange, disabled, required, children, helperText }) => (
    <div className="input-group">
        <label htmlFor={name}>
            {label}
            {required && <span style={{ color: 'var(--danger-color)' }}>*</span>}
        </label>
        {children || (
            <input 
                name={name} 
                id={name}
                type={type} 
                onChange={onChange} 
                value={value || ''} 
                required={required}
                disabled={disabled}
            />
        )}
        {helperText && <small>{helperText}</small>}
    </div>
);

// The main component you will import into your project
export const ConnectionModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '', 
        db_type: 'postgres', 
        host: '127.0.0.1', 
        port: 5432, 
        username: '', 
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [error, setError] = useState(null);
    const [testSuccess, setTestSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setTestSuccess(false); // Reset test status on change
        setError(null);
        
        if (name === 'db_type') {
            const selectedDb = DB_TYPES.find(db => db.value === value);
            const defaultPort = selectedDb ? selectedDb.port : 3306;
            
            setFormData({ ...formData, [name]: value, port: defaultPort });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Please enter a connection nickname');
            return false;
        }
        if (!formData.host.trim()) {
            setError('Please enter a host/server IP');
            return false;
        }
        if (!formData.username.trim()) {
            setError('Please enter a username');
            return false;
        }
        if (!formData.password.trim()) {
            setError('Please enter a password');
            return false;
        }
        setError(null);
        return true;
    };

    // Test connection
    const handleTestConnection = async () => {
        if (!validateForm()) return;

        setIsTesting(true);
        setTestSuccess(false);

        try {
            await apiClient.post('/db/connections/simple-test/', {
                db_type: formData.db_type,
                host: formData.host,
                port: parseInt(formData.port),
                username: formData.username,
                password: formData.password,
            });

            setTestSuccess(true);
            setError(null);
        } catch (err) {
            console.error('Connection test error:', err);
            const errMsg = err.response?.data?.error || 'Connection test failed. Please check your credentials.';
            setError(errMsg);
            setTestSuccess(false);
        } finally {
            setIsTesting(false);
        }
    };

    // Save connection
    const handleSaveConnection = async () => {
        if (!validateForm()) return;
        
        // Require test success before saving
        if (!testSuccess) {
             setError('Please test the connection successfully before saving.');
             return;
        }

        setError(null);
        setIsLoading(true);

        const dataToSave = {
            name: formData.name,
            db_type: formData.db_type,
            host: formData.host,
            port: parseInt(formData.port),
            database: '', // Backend handles this
            username: formData.username,
            password: formData.password,
        };
        
        try {
            await apiClient.post('/db/connections/', dataToSave);
            onSuccess();
        } catch (err) {
            console.error('Save connection error:', err);
            const errMsg = err.response?.data?.detail?.name?.[0] || 
                             err.response?.data?.error || 
                             'Failed to save connection.';
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                
                <div className="modal-header">
                    <h3>New Server Connection</h3>
                    <button onClick={onClose} disabled={isLoading || isTesting} className="modal-close-btn">
                        <IconX />
                    </button>
                </div>

                <div className="modal-body">
                    <FormField 
                        label="Connection Nickname" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isLoading || isTesting}
                        required={true}
                        className="full-width" // This class will be on the wrapper
                        helperText="A unique name for this connection."
                    />
                    
                    <FormField label="Database Server Type" name="db_type" required={true}>
                        <select 
                            name="db_type" 
                            onChange={handleChange} 
                            value={formData.db_type} 
                            disabled={isLoading || isTesting} 
                            required
                        >
                            {DB_TYPES.map(db => <option key={db.value} value={db.value}>{db.label}</option>)}
                        </select>
                    </FormField>

                    <FormField 
                        label="Port" 
                        name="port" 
                        type="number"
                        value={formData.port}
                        onChange={handleChange}
                        disabled={isLoading || isTesting}
                        required={true}
                    />

                    <FormField 
                        label="Host / Server IP" 
                        name="host"
                        value={formData.host}
                        onChange={handleChange}
                        disabled={isLoading || isTesting}
                        required={true}
                        className="full-width"
                        helperText='Use "127.0.0.1" for localhost'
                    />

                    <FormField 
                        label="Username" 
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={isLoading || isTesting}
                        required={true}
                    />

                    <FormField 
                        label="Password" 
                        name="password" 
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading || isTesting}
                        required={true}
                    />
                </div>
                
                <div className="input-group full-width" style={{padding: '0 25px'}}>
                   <small style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>
                        ℹ️ You'll select a specific database after connecting to the server.
                    </small>
                </div>


                {testSuccess && (
                    <div className="message-bar message-success" style={{margin: '15px 25px 0 25px'}}>
                        <IconCheck /> Connection test successful! You can now save.
                    </div>
                )}

                {error && (
                    <div className="message-bar message-error" style={{margin: '15px 25px 0 25px'}}>
                        <IconAlert /> {error}
                    </div>
                )}

                <div className="modal-footer">
                    <div>
                        <button 
                            onClick={handleTestConnection} 
                            disabled={isLoading || isTesting} 
                            className="btn btn-info"
                        >
                            {isTesting ? <IconLoader /> : 'Test Connection'}
                        </button>
                    </div>
                    <div>
                        <button onClick={onClose} disabled={isLoading || isTesting} className="btn btn-secondary">
                            Cancel
                        </button>

                        <button 
                            onClick={handleSaveConnection} 
                            disabled={isLoading || isTesting || !testSuccess} 
                            className="btn btn-success"
                            style={{marginLeft: '10px'}}
                        >
                            {isLoading ? <IconLoader /> : 'Save Connection'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectionModal;

// --- App component (for preview only) ---
// This default export is just to show the component in the preview.
// You would not include this in your project.
// export default function App() {
//     const [isOpen, setIsOpen] = useState(true); // Open by default for preview

//     return (
//         <>
//             <AppStyles />
//             <div>
//                 <button 
//                     className="btn btn-primary"
//                     onClick={() => setIsOpen(true)}
//                 >
//                     Open Connection Modal
//                 </button>
//             </div>
            
//             {isOpen && (
//                 <ConnectionModal 
//                     onClose={() => setIsOpen(false)}
//                     onSuccess={() => {
//                         console.log("Success callback!");
//                         setIsOpen(false);
//                     }}
//                 />
//             )}
//         </>
//     );
// }
