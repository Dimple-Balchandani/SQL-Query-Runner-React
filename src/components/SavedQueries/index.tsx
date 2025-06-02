import React, { useState } from 'react';
import { SavedQuery } from '../../types';
import './SavedQueries.css';

interface SavedQueriesProps {
    currentQuery: string;
    savedQueries: SavedQuery[];
    onSave: (name: string, queryToSave: string) => { success: boolean, message: string };
    onLoad: (queryId: string) => void;
    onDelete: (queryId: string) => void;
}

const SavedQueries: React.FC<SavedQueriesProps> = ({ currentQuery, savedQueries, onSave, onLoad, onDelete }) => {
    const [queryName, setQueryName] = useState<string>('');
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSaveClick = () => {
        const result = onSave(queryName, currentQuery);
        setSaveMessage({ type: result.success ? 'success' : 'error', text: result.message });
        if (result.success) {
            setQueryName('');
        }
        setTimeout(() => setSaveMessage(null), 3000);
    };

    return (
        <section className="saved-queries-section">
            <h2>Saved Queries</h2>

            <div className="save-query-input">
                <input
                    type="text"
                    placeholder="Enter name to save current query"
                    value={queryName}
                    onChange={(e) => setQueryName(e.target.value)}
                    onKeyPress={(e) => { 
                        if (e.key === 'Enter') {
                            handleSaveClick();
                        }
                    }}
                />
                <button onClick={handleSaveClick} disabled={!currentQuery.trim() || !queryName.trim()}>
                    Save Query
                </button>
            </div>
            {saveMessage && (
                <p className={`save-message ${saveMessage.type}`}>
                    {saveMessage.text}
                </p>
            )}

            {savedQueries.length === 0 ? (
                <p className="no-saved-queries-message">No queries saved yet.</p>
            ) : (
                <ul className="saved-queries-list">
                    {savedQueries.map(item => (
                        <li key={item.id} className="saved-query-item">
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