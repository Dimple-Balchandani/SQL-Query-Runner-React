import React from 'react';
import { FixedSizeList } from 'react-window';
import { QueryResultState } from '../../types';
import './QueryResult.css';

interface QueryResultProps {
    result: QueryResultState | null;
    isLoading: boolean;
}

const QueryResult: React.FC<QueryResultProps> = ({ result, isLoading }) => {
    let content: React.ReactNode = null;

    if (isLoading) {
        content = (
            <div className="query-status loading">
                <div className="spinner" data-testid="spinner-element"></div>
                <span>Loading results...</span>
            </div>
        );
    } else if (result === null) {
        content = (
            <div className="query-status info">
                <span>Run a query to see results here.</span>
            </div>
        );
    } else if (result.status === 'error') {
        content = (
            <div className="query-status error" data-testId="query-error">
                <strong>Error:</strong> {result.message || 'An unexpected error occurred.'}
            </div>
        );
    } else if (result.headers && result.rows) {
        const columnWidths = result.headers.map(() => 150);
        const rowHeight = 35;

        const itemData = {
            headers: result.headers,
            rows: result.rows,
            columnWidths: columnWidths,
        };

        content = (
            <div className="query-table-container">
                <div className="table-header-row">
                    {result.headers.map((header, index) => (
                        <div key={index} className="table-header-cell" style={{ width: columnWidths[index] }}>
                            {header}
                        </div>
                    ))}
                </div>
                {result.rows.length > 0 ? (
                    <FixedSizeList
                        height={300}
                        itemCount={result.rows.length}
                        itemSize={rowHeight}
                        width="100%"
                        itemData={itemData}
                    >
                        {({ index, style }) => (
                            <div className="table-row" style={style}>
                                {itemData.headers.map((_, colIndex) => (
                                    <div key={colIndex} className="table-cell" style={{ width: itemData.columnWidths[colIndex] }}>
                                        {itemData.rows[index][colIndex]}
                                    </div>
                                ))}
                            </div>
                        )}
                    </FixedSizeList>
                ) : (
                    <div className="query-status info no-results">
                        <span>No results found for this query.</span>
                    </div>
                )}
            </div>
        );
    } else if (result.message && result.status === 'success') {
        content = (
            <div className="query-status success">
                <span>{result.message}</span>
            </div>
        );
    }


    return (
        <section className="query-result-section">
            <h2>Query Results</h2>
            {content}
        </section>
    );
};

export default QueryResult;