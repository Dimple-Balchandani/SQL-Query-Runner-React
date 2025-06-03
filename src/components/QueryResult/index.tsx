import React, { useState, useMemo, useEffect, useRef } from 'react';
import './QueryResult.css';
import VirtualizedTable from '../VirtualizedTable/VirtualizedTable';
import { QueryResultProps, SortState } from '../../types';
import { escapeCsvField } from '../../utils';

const QueryResult: React.FC<QueryResultProps> = ({ queryResult }) => {
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
    const [exportFeedback, setExportFeedback] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortState, setSortState] = useState<SortState>({ column: null, direction: 'asc' });
    const tableScrollWrapperRef = useRef<HTMLDivElement | null>(null);

    const handleCopyResults = async () => {
        if (!queryResult || queryResult.status !== 'success' || (!queryResult.rows && !queryResult.message)) {
            setCopyFeedback("No results to copy!");
            setTimeout(() => setCopyFeedback(null), 2000);
            return;
        }

        let contentToCopy = '';
        if (queryResult.headers && queryResult.rows && queryResult.rows.length > 0) {
            const headerRow = queryResult.headers.map(escapeCsvField).join('\t');
            const dataRows = queryResult.rows.map(row => row.map(escapeCsvField).join('\t')).join('\n');
            contentToCopy = `${headerRow}\n${dataRows}`;
        } else if (queryResult.message) {
            contentToCopy = queryResult.message;
        } else {
            setCopyFeedback("No structured data or message to copy.");
            setTimeout(() => setCopyFeedback(null), 2000);
            return;
        }

        try {
            await navigator.clipboard.writeText(contentToCopy);
            setCopyFeedback("Copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy results: ", err);
            setCopyFeedback("Failed to copy!");
        } finally {
            setTimeout(() => setCopyFeedback(null), 2000);
        }
    };

    const handleExportAsCsv = () => {
        if (!queryResult || queryResult.status !== 'success' || !queryResult.headers || !queryResult.rows) {
            setExportFeedback("No tabular data to export as CSV!");
            setTimeout(() => setExportFeedback(null), 2000);
            return;
        }

        if (queryResult.rows.length === 0 && queryResult.headers.length === 0) {
            setExportFeedback("No data to export!");
            setTimeout(() => setExportFeedback(null), 2000);
            return;
        }

        const csvRows: string[] = [];
        csvRows.push(queryResult.headers.map(escapeCsvField).join(','));
        queryResult.rows.forEach(row => {
            csvRows.push(row.map(escapeCsvField).join(','));
        });

        const csvString = csvRows.join('\n');

        try {
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.setAttribute('href', url);
            const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
            link.setAttribute('download', `query_results_${timestamp}.csv`);

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExportFeedback("CSV exported successfully!");
        } catch (err) {
            console.error("Failed to export CSV: ", err);
            setExportFeedback("Failed to export CSV!");
        } finally {
            setTimeout(() => setExportFeedback(null), 2000);
        }
    };

    const handleSort = (columnHeader: string) => {
        setSortState(prevSortState => {
            if (prevSortState.column === columnHeader) {
                return {
                    column: columnHeader,
                    direction: prevSortState.direction === 'asc' ? 'desc' : 'asc'
                };
            } else {
                return {
                    column: columnHeader,
                    direction: 'asc'
                };
            }
        });
    };

    const processedRows = useMemo(() => {
        if (!queryResult || !queryResult.rows || queryResult.rows.length === 0) {
            return [];
        }

        let currentRows = queryResult.rows;
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentRows = currentRows.filter(row =>
                row.some(cell => String(cell || '').toLowerCase().includes(lowerCaseSearchTerm))
            );
        }

        if (sortState.column && queryResult.headers) {
            const columnIndex = queryResult.headers.indexOf(sortState.column);
            if (columnIndex > -1) {
                const sorted = [...currentRows].sort((a, b) => {
                    const valA = String(a[columnIndex] || '').toLowerCase();
                    const valB = String(b[columnIndex] || '').toLowerCase();

                    if (valA < valB) {
                        return sortState.direction === 'asc' ? -1 : 1;
                    }
                    if (valA > valB) {
                        return sortState.direction === 'asc' ? 1 : -1;
                    }
                    return 0;
                });
                return sorted;
            }
        }
        return currentRows;
    }, [queryResult, searchTerm, sortState]);

    useEffect(() => {
        setSearchTerm('');
        setSortState({ column: null, direction: 'asc' });
    }, [queryResult]);

    const hasTabularData = queryResult?.status === 'success' && queryResult.headers && queryResult.rows && queryResult.rows.length > 0;

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
                        {hasTabularData && (
                            <button
                                onClick={handleCopyResults}
                                disabled={queryResult.status !== 'success'}
                                className="copy-button"
                            >
                                {copyFeedback || "Copy to Clipboard"}
                            </button>
                        )}
                        {hasTabularData && (
                            <button
                                onClick={handleExportAsCsv}
                                disabled={queryResult.status !== 'success'}
                                className="export-csv-button"
                            >
                                {exportFeedback || "Export as CSV"}
                            </button>
                        )}
                    </div>

                    {(copyFeedback || exportFeedback) && (
                        <p className={`feedback-message ${copyFeedback ? 'copy' : 'export'} ${copyFeedback === 'Copied to clipboard!' || exportFeedback === 'CSV exported successfully!' ? 'success-feedback' : 'error-feedback'}`}>
                            {copyFeedback || exportFeedback}
                        </p>
                    )}

                    {queryResult.status === 'loading' && <p className="loading-message">Loading results...</p>}
                    {queryResult.status === 'error' && <p className="error-message">{queryResult.message}</p>}
                    {queryResult.status === 'warning' && <p className="warning-message">{queryResult.message}</p>}
                    {queryResult.status === 'success' && (
                        <>
                            {queryResult.message && !hasTabularData && <p className="success-message">{queryResult.message}</p>}
                            {hasTabularData ? (
                                <VirtualizedTable
                                    headers={queryResult.headers || []}
                                    rows={processedRows}
                                    sortState={sortState}
                                    onSort={handleSort}
                                    searchTerm={searchTerm}
                                    tableScrollWrapperRef={tableScrollWrapperRef}
                                />
                            ) : (
                                !queryResult.message && <p className="no-data-message">Query executed successfully, but no data to display.</p>
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