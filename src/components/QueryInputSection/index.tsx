import React from 'react';
import './QueryInputSection.css';

interface QueryInputSectionProps {
    sqlQuery: string;
    onQueryChange: (query: string) => void;
    onRunQuery: () => void;
    onClear: () => void;
    isLoading: boolean;
    editorRef: React.RefObject<HTMLTextAreaElement | null>;
}

const QueryInputSection: React.FC<QueryInputSectionProps> = ({ sqlQuery, onQueryChange, onRunQuery, onClear, isLoading, editorRef }) => {

    return (
        <section className="query-input-section">
            <h2>Enter your SQL Query</h2>
            <textarea
                id="sqlQueryInput"
                rows={10}
                placeholder="e.g., SELECT * FROM Employees;"
                value={sqlQuery}
                onChange={(e) => onQueryChange(e.target.value)}
                disabled={isLoading}
                ref={editorRef}
                style={{
                    fontFamily: 'monospace',
                    fontSize: 16,
                    backgroundColor: '#f8f8f8',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    minHeight: '150px',
                    lineHeight: '1.5em',
                    boxSizing: 'border-box',
                    width: '100%',
                    padding: '15px',
                    resize: 'vertical'
                }}
            ></textarea>
            <div className="buttons">
                <button id="runQueryBtn" onClick={onRunQuery} disabled={isLoading}>
                    {isLoading ? 'Running...' : 'Run Query'}
                </button>
                <button id="clearBtn" onClick={onClear} disabled={isLoading}>
                    Clear
                </button>
            </div>
        </section>
    );
};

export default QueryInputSection;