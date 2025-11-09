import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';       // Real import (commented out for preview)
import apiClient from '../apiClient';           // Real import (commented out for preview)
import ConnectionModal from './ConnectionModal';  // Real import (commented out for preview)

// --- SVG Icon Components ---
const IconLoader = () => (
  <svg className="spinner" width="20" height="20" viewBox="0 0 50 50">
    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
  </svg>
);
const IconDatabase = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
const IconAlert = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon-alert" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
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
    
    /* Page Layout */
    .db-page-container {
      max-width: 900px;
      margin: 32px auto;
      padding: 0;
    }
    .db-page-header {
      font-size: 28px;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 24px;
    }
    
    /* Connection Card */
    .connection-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .connection-card {
      border: 1px solid var(--gray-200);
      border-left: 5px solid var(--success-color);
      padding: 20px;
      border-radius: 8px;
      background-color: #ffffff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
    }
    .connection-card-main {
      flex: 1;
      cursor: pointer;
    }
    .connection-card-main h5 {
      margin: 0 0 5px 0;
      color: var(--gray-900);
      font-size: 18px;
      font-weight: 600;
    }
    .connection-card-main small {
      color: var(--text-light);
      font-size: 14px;
    }
    .connection-card-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .db-type-badge {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 500;
      background-color: var(--secondary-color);
      color: white;
      text-transform: uppercase;
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
    .btn-sm {
      padding: 5px 10px;
      font-size: 12px;
      min-width: auto;
    }
    .btn-primary { background-color: var(--primary-color); }
    .btn-primary:hover:not(:disabled) { background-color: #0069d9; }
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
      margin: 15px 0;
      padding: 12px;
      border-radius: 6px;
    }
    .message-info {
      background-color: #cce5ff;
      color: #004085;
      border: 1px solid #b8daff;
    }
    .message-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .message-info .icon-alert, .message-error .icon-alert {
      stroke: currentColor;
    }
    
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
    }
    .modal-content {
      background-color: #ffffff;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      max-width: 450px;
      width: 90%;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--gray-200);
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .modal-header h3 { margin: 0; font-size: 20px; }
    .modal-close-btn { background: none; border: none; cursor: pointer; color: var(--gray-500); }
    .modal-body { color: var(--text-light); font-size: 15px; }
    .modal-body p { margin: 10px 0; }
    .modal-body strong { color: var(--text-dark); }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 25px;
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
      padding: 8px 12px;
      border: 1px solid var(--gray-500);
      border-radius: 5px;
      font-size: 15px;
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

// --- Delete Confirmation Modal ---
const DeleteModal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="modal-close-btn">
            <IconX />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main DB Connection Page Component ---
const DBConnectionPage = () => {
    const [connections, setConnections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    
    // State for delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [connectionToDelete, setConnectionToDelete] = useState(null);

    const { isAuthenticated } = useAuth(); 
    const navigate = useNavigate();
    const location = useLocation(); 

    const fetchConnections = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/db/connections/'); 
            setConnections(response.data);
            setError(null);
        } catch (err) {
            console.error("Connection Fetch Failed:", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                 setError('Session expired or access denied.');
            } else {
                 setError('Failed to load connections.');
            }
        } finally {
            setIsLoading(false);
        }
    // We remove `Maps` and `isAuthenticated` from deps as they are stable or handled in useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    useEffect(() => {
        if (typeof isAuthenticated === 'undefined') {
            return; 
        }

        if (isAuthenticated) {
             fetchConnections();
        } else {
             setIsLoading(false); 
        }
        
    }, [isAuthenticated, location.pathname, fetchConnections]); 

    const handleUpdate = () => {
        setIsModalOpen(false);
        fetchConnections();
    };

    const handleConnectionClick = (connectionId) => {
        navigate(`/db/query/${connectionId}`); 
    };

    const handleDeleteClick = (conn) => {
        setConnectionToDelete(conn);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConnection = async () => {
        if (!connectionToDelete) return;
        
        const connectionId = connectionToDelete.id;
        setDeletingId(connectionId);
        setIsDeleteModalOpen(false);

        try {
            await apiClient.delete(`/db/connections/${connectionId}/delete/`);
            setConnections(connections.filter(conn => conn.id !== connectionId));
            setError(null);
        } catch (err) {
            console.error("Delete failed:", err);
            setError('Failed to delete connection: ' + (err.response?.data?.detail || err.message));
        } finally {
            setDeletingId(null);
            setConnectionToDelete(null);
        }
    };
    
    return (
        <>
            <AppStyles />
            <div className="db-page-container">
                <h2 className="db-page-header">Import Data from Database</h2>
                
                {isLoading || typeof isAuthenticated === 'undefined' ? (
                     <div className="message-bar message-info">Loading connections...</div>
                ) : (
                    <>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="btn btn-primary"
                            style={{marginBottom: '24px'}}
                        >
                            <IconPlus />
                            New Database Connection
                        </button>
                        
                        {error && <div className="message-bar message-error"><IconAlert /> {error}</div>}
                        
                        <div className="connection-list">
                            {connections.length === 0 && !isLoading && (
                                <p className="message-bar message-info">No saved connections found. Add a new one to get started.</p>
                            )}
                            
                            {connections.map((conn) => (
                                <div 
                                    key={conn.id} 
                                    className="connection-card"
                                    style={{ borderLeftColor: conn.db_type === 'postgresql' ? '#007bff' : (conn.db_type === 'mysql' ? '#f59e0b' : '#6c757d')}}
                                >
                                    <div 
                                        className="connection-card-main"
                                        onClick={() => handleConnectionClick(conn.id)}
                                    >
                                        <h5>{conn.name}</h5>
                                        <small>
                                            Host: {conn.host} | Port: {conn.port}
                                        </small>
                                    </div>
                                    <div className="connection-card-actions">
                                        <span className="db-type-badge">{conn.db_type}</span>
                                        <button
                                            onClick={() => handleDeleteClick(conn)}
                                            disabled={deletingId === conn.id}
                                            className="btn btn-sm btn-danger"
                                            title="Delete connection"
                                        >
                                            {deletingId === conn.id ? <IconLoader /> : <IconTrash />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* This is the imported modal for creating/editing connections */}
                {isModalOpen && (
                    <ConnectionModal 
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={handleUpdate}
                    />
                )}
                
                {/* This is the new modal for confirming deletion */}
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConnection}
                    title="Confirm Deletion"
                >
                    <p>Are you sure you want to permanently delete this connection?</p>
                    <p><strong>{connectionToDelete?.name}</strong></p>
                    <p>This action cannot be undone.</p>
                </DeleteModal>
            </div>
        </>
    );
};

// Use default export for the page
export default DBConnectionPage;