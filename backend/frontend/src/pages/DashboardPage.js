import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- SVG Icon Components ---
const IconLoader = () => (
  <svg className="spinner" width="20" height="20" viewBox="0 0 50 50">
    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
  </svg>
);
const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);
const IconDatabase = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
const IconSettings = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
);
const IconChart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8a5 5 0 0 0-6.4 0l-6.3 6.3"></path><path d="M14 16h4v-4"></path></svg>
);
const IconFile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
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
    .dashboard-container {
      max-width: 900px;
      margin: 32px auto;
      padding: 0;
    }
    .dashboard-header h2 {
      font-size: 28px;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
    }
    .dashboard-header p {
      font-size: 16px;
      color: var(--text-light);
      margin-top: 8px;
    }
    
    .actions-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      margin: 25px 0 40px 0;
    }
    @media (min-width: 768px) {
      .actions-container {
        grid-template-columns: 1fr 1fr;
      }
    }
    
    .action-box {
      border: 1px solid var(--gray-200);
      padding: 25px;
      border-radius: 10px;
      background-color: #ffffff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
    }
    .action-box h3 {
      margin: 0 0 15px 0;
      font-weight: 600;
      color: var(--gray-900);
    }
    .action-box p {
      color: var(--text-light);
      font-size: 14px;
      flex-grow: 1;
    }
    .upload-box {
      border-top: 4px solid var(--primary-color);
    }
    .db-box {
      border-top: 4px solid var(--secondary-color);
    }
    
    .file-input-wrapper {
      margin-bottom: 15px;
    }
    .file-input-label {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 15px;
      border: 1px dashed var(--gray-500);
      border-radius: 6px;
      cursor: pointer;
      color: var(--text-light);
      transition: background-color 0.2s, border-color 0.2s;
    }
    .file-input-label:hover {
      background-color: #f8f9fa;
      border-color: var(--primary-color);
    }
    .file-input-label span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .file-input-wrapper input[type="file"] {
      display: none;
    }
    
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
      min-width: 120px;
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
    .btn-success { background-color: var(--success-color); }
    .btn-success:hover:not(:disabled) { background-color: #218838; }
    .btn-secondary { background-color: var(--secondary-color); }
    .btn-secondary:hover:not(:disabled) { background-color: #5a6268; }
    .btn-primary { background-color: var(--primary-color); }
    .btn-primary:hover:not(:disabled) { background-color: #0069d9; }
    .btn-info { background-color: var(--info-color); }
    .btn-info:hover:not(:disabled) { background-color: #138496; }
    .btn-danger { background-color: var(--danger-color); }
    .btn-danger:hover:not(:disabled) { background-color: #c82333; }
    
    .message-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: -20px;
      margin-bottom: 20px;
      padding: 12px;
      border-radius: 6px;
    }
    .message-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .message-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .message-success .icon-check { stroke: #155724; }
    .message-error .icon-alert { stroke: #721c24; }
    
    .project-list-header {
      margin-top: 40px;
      border-bottom: 2px solid var(--gray-200);
      padding-bottom: 10px;
      font-size: 20px;
      font-weight: 600;
      color: var(--gray-900);
    }
    
    .project-card {
      border: 1px solid var(--gray-200);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 15px;
      background-color: #ffffff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      transition: box-shadow 0.2s;
    }
    .project-card:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    .project-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
    }
    .project-card-header h4 {
      margin: 0;
      color: var(--gray-900);
      font-size: 18px;
      font-weight: 600;
    }
    .project-card-header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .status-tag {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 500;
    }
    .status-ready {
      background-color: #d4edda;
      color: #155724;
    }
    .status-processing {
      background-color: #fff3cd;
      color: #856404;
    }
    
    .project-card-body {
      font-size: 14px;
      color: var(--text-light);
    }
    .project-card-body p { margin: 10px 0 0 0; }
    .project-card-body strong { color: var(--text-dark); }
    .project-card-details {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid var(--gray-200);
    }
    .project-card-details p { margin: 5px 0; }
    .project-card-details .missing-hot { color: var(--danger-color); font-weight: 600; }
    .project-card-details .missing-ok { color: var(--success-color); font-weight: 600; }
    
    .project-card-actions {
      margin-top: 15px;
      display: flex;
      gap: 10px;
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
    .modal-header h3 {
      margin: 0;
      font-size: 20px;
    }
    .modal-close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--gray-500);
    }
    .modal-body {
      color: var(--text-light);
      font-size: 15px;
    }
    .modal-body strong { color: var(--text-dark); }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 25px;
    }
    
    /* Spinner Animation */
    .spinner {
      animation: rotate 2s linear infinite;
    }
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

// --- Modal Component ---
const Modal = ({ isOpen, onClose, onConfirm, title, children }) => {
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

// --- Project Card Component ---
const ProjectCard = ({ project, onDelete, onNav, deletingId }) => {
    const metadata = project.metadata_json || {};
    const isProcessed = metadata.rows && metadata.cols;
    const missingCount = (metadata.metadata || []).reduce((sum, col) => sum + col.missing_count, 0);
    const isDeleting = deletingId === project.id;

    return (
        <div className="project-card">
            <div className="project-card-header">
                <h4>{project.title}</h4>
                <div className="project-card-header-actions">
                    <span className={`status-tag ${isProcessed ? 'status-ready' : 'status-processing'}`}>
                        {isProcessed ? 'Ready' : 'Processing...'}
                    </span>
                    <button 
                        className="btn btn-danger btn-sm" 
                        onClick={onDelete} 
                        disabled={isDeleting}
                    >
                        {isDeleting ? <IconLoader /> : <IconTrash />}
                    </button>
                </div>
            </div>
            <div className="project-card-body">
                <p>
                    <strong>Last Upload:</strong> {new Date(project.created_at).toLocaleString()}
                </p>
                {isProcessed && (
                    <div className="project-card-details">
                        <p><strong>Rows:</strong> {metadata.rows} | <strong>Columns:</strong> {metadata.cols}</p>
                        <p>
                            <strong>Missing Values:</strong> 
                            <span className={missingCount > 0 ? ' missing-hot' : ' missing-ok'}>
                                {missingCount} total
                            </span>
                        </p>
                        <div className="project-card-actions">
                            <button 
                                className="btn btn-primary" 
                                onClick={() => onNav(`/prep/${project.id}`)} 
                                disabled={!isProcessed}
                            >
                                <IconSettings />
                                Open Workbench
                            </button>
                            <button 
                                className="btn btn-info" 
                                onClick={() => onNav(`/reporting/${project.id}`)} 
                                disabled={!isProcessed}
                            >
                                <IconChart />
                                Open Reports
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Main Dashboard Component ---
const DashboardPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    // Refined loading states
    const [isFetchingList, setIsFetchingList] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null); // { id, title }

    const getAuthHeader = useCallback(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return null;
        }
        return {
            headers: { 'Authorization': `Bearer ${token}` }
        };
    }, [navigate]);

    const fetchProjects = useCallback(async (isRefresh = false) => {
        // Only show full loader on initial load (projects.length === 0)
        if (projects.length === 0 || isRefresh) setIsFetchingList(true);
        
        const authHeader = getAuthHeader();
        if (!authHeader) return;

        try {
            const response = await axios.get('http://127.0.0.1:8000/api/projects/list/', authHeader);
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
            if (error.response?.status === 401) {
                setMessage('Session expired. Please log in again.');
                navigate('/login');
            }
        } finally {
            setIsFetchingList(false);
        }
    }, [navigate, projects.length, getAuthHeader]); // projects.length ensures it only runs first time

    useEffect(() => {
        fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    const handleDeleteClick = (projectId, title) => {
        setProjectToDelete({ id: projectId, title: title });
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;
        
        const { id, title } = projectToDelete;
        const authHeader = getAuthHeader();
        if (!authHeader) return;

        setDeletingId(id);
        setIsModalOpen(false);
        setMessage(`Deleting project "${title}"...`);

        try {
            await axios.delete(`http://127.0.0.1:8000/api/projects/delete/${id}/`, authHeader);
            setMessage(`Success! Project "${title}" was permanently deleted.`);
            setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
        } catch (error) {
            const errorMsg = error.response?.data?.detail || 'Deletion failed.';
            setMessage(`Error: ${errorMsg}`);
        } finally {
            setDeletingId(null);
            setProjectToDelete(null);
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage('');
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage('Error: Please select a file first.');
            return;
        }
        if (selectedFile.size > 500 * 1024 * 1024) { // 500MB
            setMessage('Error: File size exceeds 500MB limit.');
            return;
        }
        const authHeader = getAuthHeader();
        if (!authHeader) return;

        setIsUploading(true);
        setMessage('Uploading and processing file...');

        const formData = new FormData();
        formData.append('data_file', selectedFile);
        formData.append('title', selectedFile.name.replace(/\.[^/.]+$/, ""));

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/projects/upload/', formData, authHeader);
            setMessage(`Success! Project "${response.data.title}" created.`);
            setSelectedFile(null);
            document.querySelector('#file-upload').value = '';
            fetchProjects(true); // Force refresh of project list
        } catch (error) {
            const errorMsg = error.response?.data?.detail || error.response?.data?.data_file?.[0] || 'File upload failed.';
            setMessage(`Error: ${errorMsg}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <AppStyles />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h2>Data Workbench Dashboard</h2>
                    <p>Upload your data sources (CSV, Excel, JSON) or connect to a database to begin preparation and visualization.</p>
                </div>
                
                <div className="actions-container">
                    {/* 1. Upload Section */}
                    <div className="action-box upload-box">
                        <h3>Upload New Data Project</h3>
                        <div className="file-input-wrapper">
                            <label htmlFor="file-upload" className="file-input-label">
                                {selectedFile ? <IconFile /> : <IconUpload />}
                                <span>{selectedFile ? selectedFile.name : 'Choose a file... (Max 500MB)'}</span>
                            </label>
                            <input 
                                id="file-upload"
                                type="file" 
                                name="data_file" 
                                accept=".csv, .xlsx, .xls, .json" 
                                onChange={handleFileChange} 
                                disabled={isUploading}
                            />
                        </div>
                        <button 
                            onClick={handleUpload} 
                            disabled={isUploading || !selectedFile} 
                            className="btn btn-success"
                        >
                            {isUploading ? <IconLoader /> : 'Upload Data'}
                        </button>
                    </div>

                    {/* 2. DB Import Section */}
                    <div className="action-box db-box">
                        <h3>Import from Database</h3>
                        <p>Connect directly to PostgreSQL, MySQL, or SQL Server.</p>
                        <button 
                            onClick={() => navigate('/db/connections')}
                            className="btn btn-secondary"
                        >
                            <IconDatabase />
                            Start DB Import
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`message-bar ${message.startsWith('Success') ? 'message-success' : 'message-error'}`}>
                        {message.startsWith('Success') ? <IconCheck /> : <IconAlert />}
                        <span>{message}</span>
                    </div>
                )}

                <h3 className="project-list-header">Your Saved Projects ({projects.length})</h3>
                
                {isFetchingList && projects.length === 0 && <p>Loading projects...</p>}
                
                {projects.length === 0 && !isFetchingList && (
                    <p style={{ color: '#888' }}>You have no saved projects. Upload a file to get started!</p>
                )}
                
                <div style={{ marginTop: '20px' }}>
                    {projects.map(project => (
                        <ProjectCard 
                            key={project.id} 
                            project={project} 
                            onDelete={() => handleDeleteClick(project.id, project.title)}
                            onNav={navigate}
                            deletingId={deletingId}
                        />
                    ))}
                </div>
            </div>
            
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
            >
                <p>Are you sure you want to permanently delete the project:</p>
                <p><strong>{projectToDelete?.title}</strong></p>
                <p>This action cannot be undone.</p>
            </Modal>
        </>
    );
};

export default DashboardPage;