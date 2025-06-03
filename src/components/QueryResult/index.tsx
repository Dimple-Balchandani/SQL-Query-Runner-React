import React, { useState, useEffect } from 'react';
import './QueryResult.css';
import { QueryResultProps, SortState } from '../../types';
import { copyQueryResultsToClipboard, exportAsCsv } from '../../utils';
import ResponsivePaginatedTable from '../PaginatedTable/PaginatedTable';
import usePaginatedFetcher from '../../hooks/usePaginatedFetcher';

const QueryResult: React.FC<QueryResultProps> = ({ queryResult }) => {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: 'asc' });

  const handleCopyResults = () => {
    copyQueryResultsToClipboard(queryResult, setCopyFeedback);
  };

  const handleExport = () => {
    exportAsCsv(queryResult, setExportFeedback);
  };

  const handleSort = (columnHeader: string) => {
    setSortState((prevSortState) => {
      if (prevSortState.column === columnHeader) {
        return {
          column: columnHeader,
          direction: prevSortState.direction === 'asc' ? 'desc' : 'asc',
        };
      } else {
        return {
          column: columnHeader,
          direction: 'asc',
        };
      }
    });
  };

  useEffect(() => {
    setSearchTerm('');
    setSortState({ column: null, direction: 'asc' });
  }, [queryResult]);

  const hasTabularData =
    queryResult?.status === 'success' &&
    queryResult.headers &&
    queryResult.rows &&
    queryResult.rows.length > 0;

  const fetchData = usePaginatedFetcher(
    queryResult?.rows || [],
    queryResult?.headers || [],
    searchTerm,
    sortState
  );

  return (
    <div className="query-result-area">
      <h3>Query Results</h3>
      {queryResult ? (
        <>
          <div className="query-result-actions">
            {hasTabularData && (
              <div className="result-search-container">
                <input
                  type="text"
                  placeholder="Search within results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="result-search-input"
                />
              </div>
            )}
            <div className="action-buttons">
              {hasTabularData && (
                <button
                  onClick={handleCopyResults}
                  disabled={queryResult.status !== 'success'}
                  className="copy-button"
                >
                  {copyFeedback || 'Copy to Clipboard'}
                </button>
              )}
              {hasTabularData && (
                <button
                  onClick={handleExport}
                  disabled={queryResult.status !== 'success'}
                  className="export-csv-button"
                >
                  {exportFeedback || 'Export as CSV'}
                </button>
              )}
            </div>
          </div>

          {(copyFeedback || exportFeedback) && (
            <p
              className={`feedback-message ${copyFeedback ? 'copy' : 'export'} ${copyFeedback === 'Copied to clipboard!' || exportFeedback === 'CSV exported successfully!' ? 'success-feedback' : 'error-feedback'}`}
            >
              {copyFeedback || exportFeedback}
            </p>
          )}

          {queryResult.status === 'loading' && (
            <p className="loading-message">Loading results...</p>
          )}
          {queryResult.status === 'error' && <p className="error-message">{queryResult.message}</p>}
          {queryResult.status === 'warning' && (
            <p className="warning-message">{queryResult.message}</p>
          )}
          {queryResult.status === 'success' && (
            <>
              {queryResult.message && !hasTabularData && (
                <p className="success-message">{queryResult.message}</p>
              )}
              {hasTabularData ? (
                <ResponsivePaginatedTable
                  headers={queryResult.headers || []}
                  fetchData={fetchData}
                  searchTerm={searchTerm}
                  sortState={sortState}
                  onSort={handleSort}
                />
              ) : (
                !queryResult.message && (
                  <p className="no-data-message">
                    Query executed successfully, but no data to display.
                  </p>
                )
              )}
            </>
          )}
        </>
      ) : (
        <p className="no-result-message">Run a query to see results here.</p>
      )}
    </div>
  );
};

export default QueryResult;
