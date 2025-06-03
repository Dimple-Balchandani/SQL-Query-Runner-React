import React from 'react';
import { SavedQuery } from '../../types';
import './SavedQueries.css';

interface SavedQueriesProps {
    currentQuery: string;
    savedQueries: SavedQuery[];
    onSave: (name: string, queryToSave: string) => { success: boolean, message: string };
    onLoad: (queryId: string) => void;
    onDelete: (queryId: string) => void;
}

const SavedQueries: React.FC<SavedQueriesProps> = ({savedQueries, onLoad, onDelete }) => {

    return (
        <section className="saved-queries-section">
            <h2>Saved Queries</h2>

            {savedQueries.length === 0 ? (
                <p className="no-saved-queries-message">No queries saved yet.</p>
            ) : (
                <ul className="saved-queries-list">
                    {savedQueries.map(item => (
                        <li key={item.name} className="saved-query-item">
                            <div className="query-details">
                                <span className="query-name">{item.name}</span>
                                <span className="query-timestamp">{item.timestamp}</span>
                                <pre className="query-preview">{item.query}</pre>
                            </div>
                            <div className="query-actions">
                                <button className="load-btn" onClick={() => onLoad(item.id)} title="Load Query">
                                    Load
                                </button>
                                <button className="delete-btn" onClick={() => onDelete(item.id)} title="Delete Query">
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default SavedQueries;