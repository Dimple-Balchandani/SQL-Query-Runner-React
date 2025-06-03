import React, { useEffect, useState, useRef, useCallback } from 'react';
import './PaginatedTable.css';

type RowData = string[];

interface PaginatedTableProps {
  headers: string[];
  fetchData: (page: number) => Promise<{ rows: any[][]; hasMore: boolean }>;
  searchTerm: string;
  sortState: {
    column: string | null;
    direction: 'asc' | 'desc';
  };
  onSort: (column: string) => void;
}

const ResponsivePaginatedTable: React.FC<PaginatedTableProps> = ({
  headers,
  fetchData,
  searchTerm,
  sortState,
  onSort,
}) => {
  const [data, setData] = useState<RowData[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const { rows: newRows, hasMore: more } = await fetchData(page);

    if (page === 0) {
      // Replace data for the first page (or when resetting)
      setData(newRows);
    } else {
      // Append data for subsequent pages
      setData((prev) => [...prev, ...newRows]);
    }

    setHasMore(more);
    setPage((prev) => prev + 1);
    setLoading(false);
  }, [page, loading, hasMore, fetchData]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { rows: pageData, hasMore } = await fetchData(0);
      setData(pageData);
      setPage(1);
      setHasMore(hasMore);
      setLoading(false);
    };

    load();
  }, [searchTerm, sortState, fetchData]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: '100px' }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loaderRef, loadMore]);

  return (
    <div className="responsive-table-wrapper">
      <table className="responsive-table">
        <thead>
          <tr>
            {headers.map((h, idx) => {
              const isSorted = sortState.column === h;
              return (
                <th
                  key={idx}
                  onClick={() => onSort(h)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  {h}
                  {isSorted && <span>{sortState.direction === 'asc' ? ' ▲' : ' ▼'}</span>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cidx) => (
                <td key={cidx}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div ref={loaderRef} style={{ height: 40 }} />
      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
    </div>
  );
};

export default ResponsivePaginatedTable;
