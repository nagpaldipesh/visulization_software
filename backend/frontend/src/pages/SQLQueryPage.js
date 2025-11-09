import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient'; // Real import (commented out for preview)

// --- SVG Icon Components ---
const IconLoader = () => (
  <svg className="spinner" width="20" height="20" viewBox="0 0 50 50">
    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
  </svg>
);
const IconDatabase = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
);
const IconTable = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z"></path><path d="M3 9h18"></path><path d="M3 15h18"></path><path d="M12 3v18"></path></svg>
);
const IconColumn = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
);
const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const IconChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);
const IconBack = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);
const IconExport = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 3H3v18h18V3z"></path><path d="M21 9H3"></path><path d="M9 21V9"></path></svg>
);
const IconAlert = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon-alert" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
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
      --bg-light: #f8f9fa;
      --bg-dark: #2b3035;
      --border-color: #dee2e6;
      --text-light: #6c757d;
      --text-dark: #343a40;
    }
    .sql-query-page {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100%;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #ffffff;
    }
    
    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }
    .page-header h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: var(--text-dark);
    }
    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      cursor: pointer;
      background-color: #ffffff;
      color: var(--text-dark);
      transition: background-color 0.2s;
    }
    .btn-back:hover {
      background-color: var(--bg-light);
    }

    /* Main Layout */
    .query-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      flex-grow: 1;
      overflow: hidden;
    }
    
    /* Sidebar */
    .databases-sidebar {
      background-color: var(--bg-light);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .databases-sidebar h3 {
      margin: 0;
      padding: 16px;
      font-size: 16px;
      font-weight: 600;
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }
    .database-list {
      overflow-y: auto;
      flex-grow: 1;
      padding: 8px;
    }
    .loading-small, .no-databases {
      padding: 16px;
      font-style: italic;
      color: var(--text-light);
    }
    .database-item, .tree-node {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 5px;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s;
    }
    .database-item {
      font-weight: 500;
    }
    .database-item.active {
      background-color: #dbeafe;
      color: var(--primary-color);
    }
    .database-item:hover, .tree-node:hover {
      background-color: #e9ecef;
    }
    .tree-children {
      padding-left: 20px;
    }
    .node-name {
      font-size: 14px;
    }
    .database-icon { color: var(--primary-color); }
    .table-icon { color: var(--info-color); }
    .column-icon { color: var(--text-light); }
    .tree-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Content Area */
    .query-content {
      display: grid;
      grid-template-rows: 40% 1fr;
      overflow: hidden;
    }
    
    /* Editor */
    .editor-section {
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid var(--border-color);
      overflow: hidden;
      position: relative; /* For spinner */
    }
    .editor-header, .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: var(--bg-light);
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }
    .editor-header span, .result-header span {
      font-weight: 600;
      font-size: 14px;
      color: var(--text-dark);
    }
    .database-indicator, .error-badge, .success-badge {
      font-size: 12px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .database-indicator {
      background-color: #d4edda;
      color: #155724;
    }
    .error-badge {
      background-color: #f8d7da;
      color: #721c24;
    }
    .success-badge {
      background-color: #d4edda;
      color: #155724;
    }
    .keyboard-hint {
      font-size: 12px;
      color: var(--text-light);
      font-weight: 400 !important;
    }
    .sql-editor {
      flex-grow: 1;
      border: none;
      outline: none;
      padding: 16px;
      font-family: 'Fira Code', 'Courier New', Courier, monospace;
      font-size: 15px;
      background-color: var(--bg-dark);
      color: #f8f8f2;
      resize: none;
      line-height: 1.6;
    }
    .sql-editor::placeholder {
      color: #888;
    }

    /* Results */
    .result-section {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative; /* For spinner */
    }
    .export-title-input {
      font-size: 13px;
      padding: 6px 10px;
      border: 1px solid var(--border-color);
      border-radius: 5px;
      margin-left: auto;
      margin-right: 10px;
      max-width: 200px;
    }
    .btn-export {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 13px;
      font-weight: 500;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      background-color: var(--success-color);
      color: white;
      transition: background-color 0.2s;
    }
    .btn-export:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-export:hover:not(:disabled) {
      background-color: #218838;
    }

    .result-content {
      flex-grow: 1;
      overflow: auto;
    }
    .preview-container {
      padding: 16px;
    }
    .preview-container h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
    }
    .table-wrapper {
      width: 100%;
      height: 100%;
      max-height: calc(100% - 40px); /* Adjust based on h4 margin */
      overflow: auto;
      border: 1px solid var(--border-color);
      border-radius: 6px;
    }
    .results-table {
      width: 100%;
      border-collapse: collapse;
    }
    .results-table th, .results-table td {
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
      font-size: 14px;
      white-space: nowrap;
    }
    .results-table th {
      background-color: var(--bg-light);
      font-weight: 600;
      position: sticky;
      top: 0;
      z-index: 1;
    }
    .results-table tbody tr:nth-child(even) {
      background-color: var(--bg-light);
    }
    .results-table tbody tr:hover {
      background-color: #e9ecef;
    }
    .results-table td {
      color: var(--text-dark);
    }
    
    /* Status & Messages */
    .loading {
      padding: 24px;
      font-size: 18px;
      text-align: center;
      color: var(--text-light);
    }
    .empty-state, .info-message {
      padding: 24px;
      text-align: center;
      font-style: italic;
      color: var(--text-light);
    }
    .error-message, .success-message {
      padding: 12px 16px;
      margin: 16px;
      border-radius: 6px;
      font-weight: 500;
    }
    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .success-message {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255,255,255,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }

    /* Spinner Animation */
    .spinner { animation: rotate 2s linear infinite; }
    .spinner .path {
      stroke: var(--primary-color); /* Use primary color for overlay spinner */
      stroke-linecap: round;
      animation: dash 1.5s ease-in-out infinite;
    }
    .btn-export .spinner .path {
        stroke: #ffffff; /* White for button spinner */
    }
    @keyframes rotate { 100% { transform: rotate(360deg); } }
    @keyframes dash {
      0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
      50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
      100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
    }
  `}</style>
);


const SQLQueryPage = () => {
    const { connectionId } = useParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);
    
    // State management
    const [connection, setConnection] = useState(null);
    const [databases, setDatabases] = useState([]);
    const [schemaTree, setSchemaTree] = useState({});
    const [expandedNodes, setExpandedNodes] = useState({});
    const [sqlQueries, setSqlQueries] = useState('');
    const [previewData, setPreviewData] = useState(null);
    const [columns, setColumns] = useState([]);
    const [projectTitle, setProjectTitle] = useState('');
    const [executedQuery, setExecutedQuery] = useState('');
    const [rowCount, setRowCount] = useState(0);
    const [commandType, setCommandType] = useState(null);
    
    // State to manage the active, session-level database
    const [activeDatabase, setActiveDatabase] = useState(null);
    
    // Loading and error states
    const [isLoadingConnection, setIsLoadingConnection] = useState(true);
    const [isLoadingDatabases, setIsLoadingDatabases] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Fetch connection details on load
    const fetchConnectionDetails = useCallback(async () => {
        setIsLoadingConnection(true);
        try {
            const response = await apiClient.get(`/db/connections/${connectionId}/`);
            setConnection(response.data);
            setError(null);
        } catch(err) {
             console.error('Failed to fetch connection:', err);
             setError('Failed to load connection details.');
        } finally {
            setIsLoadingConnection(false);
        }
    }, [connectionId]); // Added dependency

    // Fetch databases/schema *after* connection details are loaded
    const fetchDatabasesAndSchema = useCallback(async () => {
        if (!connection) return; // Guard clause
        
        setIsLoadingDatabases(true);
        try {
            const response = await apiClient.post('/db/connections/discover/', {
                db_type: connection.db_type,
                host: connection.host,
                port: connection.port,
                username: connection.username,
                password: connection.password
            });
            
            const dbList = response.data.databases || [];
            setDatabases(dbList);
            
            // Fetch schema for all databases
            fetchFullSchema(dbList);
            
            setError(null);
        } catch (err) {
            console.error('Failed to fetch databases:', err);
            setError('Failed to load databases: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsLoadingDatabases(false);
        }
    }, [connection]); // Added dependency

    // Fetch schema for all DBs
    const fetchFullSchema = useCallback(async (dbList) => {
        const schemaData = {};
        
        for (const db of dbList) {
            try {
                const response = await apiClient.post('/db/schema/fetch/', {
                    connection_id: connectionId,
                    database: db
                });
                schemaData[db] = response.data.tables || [];
                
                // Only auto-expand the *first* database for better UX
                if (dbList.indexOf(db) === 0) {
                    setExpandedNodes(prev => ({
                        ...prev,
                        [`db-${db}`]: true
                    }));
                }
            } catch (err) {
                console.error(`Failed to fetch schema for ${db}:`, err);
                schemaData[db] = [];
            }
        }
        
        setSchemaTree(schemaData);
    }, [connectionId]); // Added dependency

    useEffect(() => {
        fetchConnectionDetails();
    }, [fetchConnectionDetails]);

    useEffect(() => {
        fetchDatabasesAndSchema();
    }, [fetchDatabasesAndSchema]);

    // Helper to find the query at the cursor
    const getQueryAtCursor = useCallback((text, position) => {
        const allQueries = text.split(';');
        let charCount = 0;
        
        for (let i = 0; i < allQueries.length; i++) {
            const query = allQueries[i];
            const queryEnd = charCount + query.length + 1; // +1 for the ';'
            
            if (position <= queryEnd) {
                const trimmedQuery = query.trim();
                if (trimmedQuery.length > 0) {
                    return trimmedQuery;
                }
            }
            charCount = queryEnd;
        }
        
        // If cursor is at the end or in empty space, find the last non-empty query
        for (let i = allQueries.length - 1; i >= 0; i--) {
            const trimmedQuery = allQueries[i].trim();
            if (trimmedQuery.length > 0) {
                return trimmedQuery;
            }
        }
        
        return '';
    }, []);

    // Main query execution function
    const executeQuery = useCallback(async (query) => {
        if (!query.trim()) {
            setError('Please enter a SQL query.');
            return;
        }
        
        // Enforce active database check before execution
        const isUseCommand = query.trim().toUpperCase().startsWith('USE ');
        if (!activeDatabase && !isUseCommand) {
            setError('No active database selected. Please use "USE database_name;" first.');
            return;
        }

        setError(null);
        setSuccessMessage(null);
        setIsExecuting(true);
        setPreviewData(null);
        setColumns([]);
        setCommandType(null);

        try {
            // Send the active database name in the payload
            const response = await apiClient.post('/db/query/export/', {
                connection_id: connectionId,
                sql_query: query,
                action: 'preview',
                database_name: activeDatabase
            });

            const data = response.data;
            setExecutedQuery(query);

            // Handle a successful USE command (which changes the session state)
            if (data.command_type === 'USE' && data.database_name) {
                const newDb = data.database_name;
                setActiveDatabase(newDb);
                
                // Also expand the node for the newly active database for better UX
                setExpandedNodes(prev => ({
                    ...prev,
                    [`db-${newDb}`]: true
                }));
                
                setCommandType('USE');
                setSuccessMessage(data.message || `Database context switched to ${newDb}.`);
                setRowCount(0);

            } else if (data.preview_data) {
                setPreviewData(data.preview_data);
                setColumns(data.columns || []);
                setRowCount(data.rowCount || 0);
                setCommandType('SELECT');
                setSuccessMessage(data.message || 'Query executed successfully!');
            } 
            else if (data.command_type === 'DML/DDL' || data.rows_affected !== undefined) {
                setCommandType('DML/DDL');
                setRowCount(data.rows_affected || 0);
                setSuccessMessage(
                    data.message + 
                    (data.rows_affected !== undefined ? ` (${data.rows_affected} rows affected)` : '')
                );
            }
            else {
                setCommandType('COMMAND');
                setSuccessMessage(data.message || 'Command executed successfully!');
            }
            
            setError(null);
        } catch (err) {
            console.error('Query execution failed:', err);
            const errorMsg = err.response?.data?.error || 'Failed to execute query. Please check your SQL syntax.';
            setError(errorMsg);

            setPreviewData(null);
            setColumns([]);
            setCommandType(null);
        } finally {
            setIsExecuting(false);
        }
    }, [connectionId, activeDatabase]);


    // Ctrl+Enter keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (isExecuting) return; // Don't run if already executing

                if (editorRef.current) {
                    const textarea = editorRef.current;
                    const cursorPosition = textarea.selectionStart;
                    const queryToExecute = getQueryAtCursor(sqlQueries, cursorPosition);
                    
                    if (queryToExecute) {
                        executeQuery(queryToExecute);
                    } else {
                        setError('No query to execute at cursor position');
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [sqlQueries, isExecuting, activeDatabase, getQueryAtCursor, executeQuery]);

    const toggleNodeExpansion = (nodeId) => {
        setExpandedNodes(prev => ({
            ...prev,
            [nodeId]: !prev[nodeId]
        }));
    };

    const handleExportData = async () => {
        if (commandType !== 'SELECT' || !executedQuery.trim()) {
            setError('Please execute a SELECT query first before exporting.');
            return;
        }

        if (!projectTitle.trim()) {
            setError('Please enter a project title for the export.');
            return;
        }

        setError(null);
        setSuccessMessage(null);
        setIsExporting(true);

        try {
            // Send the active database name with the export request
            const response = await apiClient.post('/db/query/export/', {
                connection_id: connectionId,
                sql_query: executedQuery,
                action: 'export',
                project_title: projectTitle,
                database_name: activeDatabase
            });

            setSuccessMessage(response.data.message || 'Data exported successfully!');
            setError(null);
            
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
            
        } catch (err) {
            console.error('Export failed:', err);
            setError(err.response?.data?.error || 'Failed to export data. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };


    if (isLoadingConnection) {
        return (
             <>
                <AppStyles />
                <div className="sql-query-page">
                    <div className="loading">Loading connection details...</div>
                </div>
            </>
        );
    }

    if (!connection && !isLoadingConnection) {
        return (
            <>
                <AppStyles />
                <div className="sql-query-page">
                    <div style={{padding: '24px'}}>
                        <div className="error-message">
                            <p>Connection not found.</p>
                            <button onClick={() => navigate('/db/connections')} className="btn-back" style={{border: '1px solid var(--danger-color)'}}>
                                <IconBack />
                                Back to Connections
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    
    return (
        <>
            <AppStyles />
            <div className="sql-query-page">
                {/* Header */}
                <div className="page-header">
                    <h2>Query: {connection?.name}</h2>
                    <button 
                        onClick={() => navigate('/db/connections')} 
                        className="btn-back"
                    >
                        <IconBack />
                        Back to Connections
                    </button>
                </div>

                {/* Main Layout */}
                <div className="query-layout">
                    {/* Left Sidebar - Schema Navigator */}
                    <div className="databases-sidebar">
                        <h3>Navigator</h3>
                        {isLoadingDatabases ? (
                            <div className="loading-small">Loading schema...</div>
                        ) : databases.length === 0 ? (
                            <div className="no-databases">No databases found</div>
                        ) : (
                            <div className="database-list">
                                {databases.map((db) => (
                                    <div key={db}>
                                        <div 
                                            className={`database-item ${activeDatabase === db ? 'active' : ''}`}
                                            onClick={() => toggleNodeExpansion(`db-${db}`)} 
                                        >
                                            <span className="tree-toggle">
                                                {expandedNodes[`db-${db}`] ? <IconChevronDown /> : <IconChevronRight />}
                                            </span>
                                            <span className="database-icon"><IconDatabase /></span>
                                            <span className="database-name">{db}</span>
                                        </div>
                                        
                                        {expandedNodes[`db-${db}`] && (
                                            <div className="tree-children">
                                                {schemaTree[db] && schemaTree[db].length > 0 ? schemaTree[db].map((table) => (
                                                    <div key={`${db}-${table.name}`}>
                                                        <div 
                                                            className="tree-node"
                                                            onClick={() => toggleNodeExpansion(`table-${db}-${table.name}`)}
                                                        >
                                                            <span className="tree-toggle">
                                                                {expandedNodes[`table-${db}-${table.name}`] ? <IconChevronDown /> : <IconChevronRight />}
                                                            </span>
                                                            <span className="table-icon"><IconTable /></span>
                                                            <span className="node-name">{table.name}</span>
                                                        </div>
                                                        
                                                        {expandedNodes[`table-${db}-${table.name}`] && (
                                                            <div className="tree-children">
                                                                {table.columns && table.columns.map((col) => (
                                                                    <div key={`${db}-${table.name}-${col}`} className="tree-node" style={{paddingLeft: '20px'}}>
                                                                        <span className="column-icon"><IconColumn /></span>
                                                                        <span className="node-name">{col}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )) : (
                                                    <div className="loading-small" style={{paddingLeft: '20px'}}>No tables found.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Status Panel */}
                        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                            {error && (
                                <div className="error-message" style={{margin: 0, display: 'flex', gap: '8px', alignItems: 'center'}}>
                                    <IconAlert />
                                    <div>
                                        <strong>Error: </strong> {error}
                                    </div>
                                </div>
                            )}
                            {successMessage && !error && (
                                <div className="success-message" style={{margin: 0, display: 'flex', gap: '8px', alignItems: 'center'}}>
                                    <IconCheck />
                                    <div>
                                        <strong>Success: </strong> {successMessage}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Query Content Area */}
                    <div className="query-content">
                        {/* Editor Section */}
                        <div className="editor-section">
                            <div className="editor-header">
                                <span>SQL Editor</span>
                                <span className={activeDatabase ? "database-indicator" : "error-badge"}>
                                    {activeDatabase ? `Active DB: ${activeDatabase}` : 'No DB Selected'}
                                </span>
                                <span className="keyboard-hint">Ctrl+Enter to Execute</span>
                            </div>
                            <textarea 
                                ref={editorRef}
                                className="sql-editor"
                                value={sqlQueries}
                                onChange={(e) => setSqlQueries(e.target.value)}
                                placeholder="-- Enter SQL queries here...
-- Switch database:
USE my_database;

-- Show tables:
SHOW TABLES;

-- Select data:
SELECT * FROM my_table LIMIT 100;

-- Press Ctrl+Enter to execute the query at your cursor
"
                                spellCheck="false"
                            />
                        </div>

                        {/* Results Section */}
                        <div className="result-section">
                            {isExecuting && (
                                <div className="loading-overlay">
                                    <IconLoader />
                                </div>
                            )}
                            <div className="result-header">
                                <span>Results</span>
                                
                                {commandType === 'SELECT' && previewData && previewData.length > 0 && (
                                    <div style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginLeft: 'auto'
                                    }}>
                                        <input 
                                            type="text" 
                                            className="export-title-input"
                                            placeholder="Project title for export..."
                                            value={projectTitle}
                                            onChange={(e) => setProjectTitle(e.target.value)}
                                        />
                                        <button 
                                            onClick={handleExportData}
                                            disabled={isExporting || !projectTitle.trim()}
                                            className="btn-export"
                                        >
                                            {isExporting ? <IconLoader /> : <IconExport />}
                                            {isExporting ? 'Loading...' : 'Load to Workbench'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="result-content">
                                {previewData && previewData.length > 0 && (
                                    <div className="preview-container">
                                        <h4>Query Results ({rowCount} {rowCount === 1 ? 'row' : 'rows'})</h4>
                                        <div className="table-wrapper">
                                            <table className="results-table">
                                                <thead>
                                                    <tr>
                                                        {columns.map((col) => (
                                                            <th key={col} tabIndex="0">{col}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {previewData.map((row, idx) => (
                                                        <tr key={idx}>
                                                            {columns.map((col) => (
                                                                <td key={col}>
                                                                    {row[col] !== null && row[col] !== undefined 
                                                                        ? String(row[col]) 
                                                                        : <span style={{color: 'var(--text-light)', fontStyle: 'italic'}}>NULL</span>}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {previewData && previewData.length === 0 && commandType === 'SELECT' && (
                                    <div className="info-message">
                                        Query executed successfully, but returned no rows.
                                    </div>
                                )}
                                
                                {commandType && commandType !== 'SELECT' && !error && (
                                    <div className="success-message" style={{margin: '16px'}}>
                                        {successMessage}
                                    </div>
                                )}


                                {!previewData && !error && !successMessage && !isExecuting && (
                                    <div className="empty-state">
                                        Execute a query to see results here
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


export default SQLQueryPage;