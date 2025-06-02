import React from 'react';
import { QueryHistoryItem } from '../../types';
import './QueryHistory.css'; // New: Component-specific styles

interface QueryHistoryProps {
    history: QueryHistoryItem[];
    onSelect: (query: string) => void;
}

const QueryHistory: React.FC<QueryHistoryProps> = ({ history, onSelect }) => {
    return (
        <section className="query-history-section">
            <h2>Query History</h2>
            {history.length === 0 ? (
                <p className="no-history-message">No queries run yet.</p>
            ) : (
                <ul className="history-list">
                    {history.map(item => (
                        <li key={item.id} className="history-item">
                            <button onClick={() => onSelect(item.query)} title={`Run query: ${item.query}`}>
                                <span className="query-text">{item.query}</span>
                                <span className="query-timestamp">{item.timestamp}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default QueryHistory;