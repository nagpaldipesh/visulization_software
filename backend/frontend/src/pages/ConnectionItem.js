import React from 'react';

const ConnectionItem = ({ connection, onNavigate, onDelete, isDeleting }) => {
    return (
        <div className="connection-card-wrapper">
            <button
                onClick={onNavigate}
                className="connection-card-main"
                aria-label={`Connect to ${connection.name}`}
            >
                <div className="connection-details">
                    <h5 className="mb-0">{connection.name}</h5>
                    <small className="text-muted">
                        Host: {connection.host} | Port: {connection.port}
                    </small>
                </div>
            </button>
            <div className="connection-card-actions">
                <span className="badge bg-secondary me-2">{connection.db_type}</span>
                <button
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="btn btn-sm btn-outline-danger delete-btn"
                    title="Delete connection"
                >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    );
};

export default ConnectionItem;