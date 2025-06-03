import React, { useState } from 'react';
import { QueryHistoryItem, SavedQuery } from '../../types';
import './QueryHistory.css';
import SaveQueryModal from '../SaveQueryModal/SaveQueryModal';

interface QueryHistoryProps {
  queryHistory: QueryHistoryItem[];
  savedQueries: SavedQuery[];
  onSelect: (query: string) => void;
  onSave: (name: string, query: string) => void;
}

const QueryHistory: React.FC<QueryHistoryProps> = ({ queryHistory, savedQueries, onSelect, onSave }) => {
    const [modalQuery, setModalQuery] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    const isSaved = (query: string): boolean =>
      savedQueries.some((item) => item.query === query);
  
    const handleSaveClick = (query: string) => {
      setModalQuery(query);
    };
  
    const handleModalSave = (name: string) => {
      if (modalQuery) {
        onSave(name, modalQuery);
        setSaveMessage(`Query "${name}" saved successfully.`);
        setTimeout(() => {
          setModalQuery(null);
          setSaveMessage(null);
        }, 1500);
      }
    };
      
    return (
        <section className="query-history-section">
          <h2>Query History</h2>
          {queryHistory.length === 0 ? (
            <p className="no-history-message">No queries run yet.</p>
          ) : (
            <ul className="history-list">
              {queryHistory.map(item => (
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
                        onClick={() => handleSaveClick(item.query)}
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
            message={saveMessage || ''}
            />
        )}
        </section>
      );
    };
export default QueryHistory;