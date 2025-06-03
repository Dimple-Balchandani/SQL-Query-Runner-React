import React, { useMemo, useEffect, useState } from 'react';
import { FixedSizeList } from 'react-window';
import { ROW_HEIGHT } from '../../constants';
import { MIN_COLUMN_WIDTH } from '../../constants';
import { ListItemData, VirtualizedTableProps } from '../../types';

const VirtualizedTable: React.FC<VirtualizedTableProps> = ({
  headers,
  rows,
  sortState,
  onSort,
  searchTerm,
  tableScrollWrapperRef,
}) => {
  const [wrapperWidth, setWrapperWidth] = useState(0);

  useEffect(() => {
    const element = tableScrollWrapperRef.current;
    if (!element) return;

    setWrapperWidth(element.clientWidth);

    const observer = new ResizeObserver((entries) => {
      const newWidth = entries[0].contentRect.width;
      setWrapperWidth(newWidth);
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [tableScrollWrapperRef]);

  const columnWidths = useMemo(() => {
    if (headers.length === 0) return [];

    const numColumns = headers.length;
    const currentContainerWidth = wrapperWidth || 800;

    let idealColumnWidth = currentContainerWidth / numColumns;
    const calculatedWidth = Math.max(idealColumnWidth, MIN_COLUMN_WIDTH);

    const widths = Array(numColumns).fill(calculatedWidth);

    const totalCurrentWidth = widths.reduce((sum, w) => sum + w, 0);
    if (totalCurrentWidth < currentContainerWidth) {
      const widthToDistribute = currentContainerWidth - totalCurrentWidth;
      const amountPerColumn = widthToDistribute / numColumns;
      return widths.map((w) => w + amountPerColumn);
    }

    return widths;
  }, [headers, wrapperWidth]);

  const totalContentWidth = useMemo(() => {
    return columnWidths.reduce((sum, w) => sum + w, 0);
  }, [columnWidths]);

  const itemData: ListItemData = useMemo(
    () => ({
      rows: rows,
      headers: headers,
      columnWidths: columnWidths,
      handleSort: onSort,
      sortState: sortState,
    }),
    [rows, headers, columnWidths, onSort, sortState]
  );

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = itemData.rows[index];
    const isEvenRow = index % 2 === 0;

    if (!row) return null;

    return (
      <div className={`table-row ${isEvenRow ? 'even' : 'odd'}`} style={style}>
        {itemData.headers.map((_, colIndex) => (
          <div
            key={colIndex}
            className="table-cell"
            style={{ width: itemData.columnWidths[colIndex] }}
          >
            {String(row[colIndex])}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="table-responsive-wrapper" ref={tableScrollWrapperRef}>
      <div className="table-header-row" style={{ width: totalContentWidth }}>
        {headers?.map((header, index) => (
          <div
            key={index}
            onClick={() => onSort(header)}
            className="table-header-cell sortable-header"
            style={{ width: columnWidths[index] }}
          >
            {header}
            {sortState.column === header && (
              <span className="sort-icon">{sortState.direction === 'asc' ? ' ▲' : ' ▼'}</span>
            )}
          </div>
        ))}
      </div>
      {rows.length > 0 ? (
        <FixedSizeList
          height={300}
          itemCount={rows.length}
          itemSize={ROW_HEIGHT}
          width={totalContentWidth}
          itemData={itemData}
          outerElementType={outerElementType}
          innerElementType={innerElementType}
        >
          {Row}
        </FixedSizeList>
      ) : (
        <div
          className="no-filter-results-fixed-size"
          style={{
            height: 300,
            width: totalContentWidth,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {searchTerm ? 'No results match your search.' : 'No data available.'}
        </div>
      )}
    </div>
  );
};

export default VirtualizedTable;

const outerElementType = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  (props, ref) => <div ref={ref} {...props} />
);

const innerElementType = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  ({ style, ...rest }, ref) => {
    const itemDataFromProps = (rest as any).children[0]?.props.itemData as ListItemData;
    const totalWidth =
      itemDataFromProps?.columnWidths.reduce((sum: number, width: number) => sum + width, 0) || 0;

    return (
      <div
        ref={ref}
        style={{
          ...style,
          width: totalWidth > ((style?.width as number) || 0) ? totalWidth : '100%',
          minWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        {...rest}
      />
    );
  }
);
