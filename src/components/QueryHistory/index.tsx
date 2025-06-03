import React, { useEffect, useState } from 'react';
import { QueryHistoryItem } from '../../types';
import './QueryHistory.css';
import { LOCAL_STORAGE_SAVED_QUERIES_KEY } from '../../constants';
import SaveQueryModal from '../SaveQueryModal/SaveQueryModal';

interface QueryHistoryProps {
    history: QueryHistoryItem[];
    onSelect: (query: string) => void;
}

interface SavedQuery {
    name: string;
    query: string;
}

const QueryHistory: React.FC<QueryHistoryProps> = ({ history, onSelect }) => {
    const [modalQuery, setModalQuery] = useState<string | null>(null);
    const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SAVED_QUERIES_KEY) || '[]');
        setSavedQueries(saved);
      }, []);

    const isSaved = (query: string) => {
        const data = savedQueries.filter((item: { query: string; }) => item.query === query);
        return data.length === 1;
    }

    const handleSave = (query: string) => {
        setModalQuery(query); // open modal
      };
      
    const handleModalSave = (name: string) => {
        if (modalQuery) {
          const newSaved = [...savedQueries, { name, query: modalQuery }];
          setSavedQueries(newSaved);
          localStorage.setItem(LOCAL_STORAGE_SAVED_QUERIES_KEY, JSON.stringify(newSaved));
          setModalQuery(null); // close modal
        }
      };

    return (
        <section className="query-history-section">
          <h2>Query History</h2>
          {history.length === 0 ? (
            <p className="no-history-message">No queries run yet.</p>
          ) : (
            <ul className="history-list">
              {history.map(item => (
                <li key={item.id} className="history-item">
                  <div className="history-item-content">
                    <button
                      onClick={() => onSelect(item.query)}
                      title={`Run query: ${item.query}`}
                      className="query-button"
                    >
                      <span className="query-text">{item.query}</span>
                      <span className="query-timestamp">{item.timestamp}</span>
                    </button>
                    {isSaved(item.query) ? (
                      <span className="saved-tag">Saved</span>
                    ) : (
                      <button
                        className="save-button"
                        onClick={() => handleSave(item.query)}
                        title="Save this query"
                      >
                        Save
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
        )}
        {modalQuery && (
            <SaveQueryModal
            query={modalQuery}
            onSave={handleModalSave}
            onClose={() => setModalQuery(null)}
            />
        )}
        </section>
      );
    };
export default QueryHistory;