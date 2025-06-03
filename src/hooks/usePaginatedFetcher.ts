import { useMemo, useCallback } from 'react';
import { DEFAULT_PAGE_SIZE } from '../constants';

type SortState = {
  column: string | null;
  direction: 'asc' | 'desc';
};

function usePaginatedFetcher(
  originalRows: any[][],
  headers: string[],
  searchTerm: string | string[],
  sortState: SortState
) {
  // Normalize search terms
  const searchTerms = useMemo(() => {
    if (!searchTerm) return [];
    return Array.isArray(searchTerm)
      ? searchTerm.map((term) => term.toLowerCase())
      : [searchTerm.toLowerCase()];
  }, [searchTerm]);

  // Filter + sort once
  const processedRows = useMemo(() => {
    if (!originalRows || originalRows.length === 0) return [];

    let filtered = originalRows.filter((row) =>
      searchTerms.length === 0
        ? true
        : searchTerms.some((term) => row.some((cell) => String(cell).toLowerCase().includes(term)))
    );

    if (sortState.column && headers.length > 0) {
      const colIndex = headers.indexOf(sortState.column);
      if (colIndex !== -1) {
        filtered = [...filtered].sort((a, b) => {
          const aVal = String(a[colIndex] ?? '').toLowerCase();
          const bVal = String(b[colIndex] ?? '').toLowerCase();

          if (aVal < bVal) return sortState.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortState.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    return filtered;
  }, [originalRows, searchTerms, sortState, headers]);

  // Fetch function with pagination only if data is larger than DEFAULT_PAGE_SIZE
  const fetchData = useCallback(
    async (page: number): Promise<{ rows: any[][]; hasMore: boolean }> => {
      if (processedRows.length <= DEFAULT_PAGE_SIZE) {
        // Return all rows at once, no pagination
        return { rows: processedRows, hasMore: false };
      }
      const start = page * DEFAULT_PAGE_SIZE;
      const end = start + DEFAULT_PAGE_SIZE;
      const pageRows = processedRows.slice(start, end);
      const hasMore = end < processedRows.length;
      return { rows: pageRows, hasMore };
    },
    [processedRows]
  );

  return fetchData;
}

export default usePaginatedFetcher;
