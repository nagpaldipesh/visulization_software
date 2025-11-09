import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReportingTab from '../reporting/ReportingTab';
// --- Style objects for cleaner JSX ---
const pageStyles = {
    background: '#f4f6f8',
    minHeight: '100vh',
    padding: '30px',
    fontFamily: 'Inter, sans-serif',
};

const containerStyles = {
    maxWidth: '1600px',
    margin: '0 auto',
};

const headerStyles = {
    borderBottom: '2px solid #007bff',
    paddingBottom: '10px',
    marginBottom: '20px', // Added margin for better spacing
};

const backButtonStyles = {
    marginTop: '30px',
    padding: '10px 15px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
};


const DashboardDesignerPage = ({ baseProject, projectId, getAuthHeader }) => {
    const navigate = useNavigate();

    // A simple hover effect for the button
    const handleMouseOver = (e) => e.currentTarget.style.backgroundColor = '#f0f0f0';
    const handleMouseOut = (e) => e.currentTarget.style.backgroundColor = '#fff';
    const handleDragStart = (e, tool) => {
//         console.log('Mock App Drag Start:', tool.type);
        e.dataTransfer.setData("drag-tool-type", tool.type);
        e.dataTransfer.setData("drag-tool-datatype", tool.dataType);
    };

    return (
        <div style={pageStyles}>
            <div style={containerStyles}>
                <h2 style={headerStyles}>
                    Dashboard Designer (Base Project: {baseProject.title})
                </h2>

                <ReportingTab
                    projectId={projectId}
                    baseProject={baseProject}
                    getAuthHeader={getAuthHeader}
                />

                <button
                    onClick={() => navigate('/dashboard')}
                    style={backButtonStyles}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default DashboardDesignerPage;