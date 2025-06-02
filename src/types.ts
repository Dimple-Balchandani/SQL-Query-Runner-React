export interface QueryData {
    headers: string[];
    rows: string[][];
}

export interface QueryResultState {
    headers?: string[];
    rows?: string[][];
    message?: string;
    status?: 'success' | 'loading' | 'error' | 'warning';
}

export interface QueryHistoryItem {
    id: string;
    query: string;
    timestamp: string;
}

export interface SavedQuery {
    id: string;
    name: string;
    query: string;
    timestamp: string;
}

export interface SchemaColumn {
    name: string;
    type: string;
}

export interface SchemaTable {
    name: string;
    columns: SchemaColumn[];
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
    column: string | null;
    direction: SortDirection;
}

export interface QueryResultProps {
    queryResult: QueryResultState | null;
}

export interface ListItemData {
    rows: string[][];
    headers: string[];
    columnWidths: number[];
    handleSort: (column: string) => void;
    sortState: SortState;
}

export interface VirtualizedTableProps {
    headers: string[];
    rows: string[][];
    sortState: SortState;
    onSort: (column: string) => void;
    searchTerm: string;
    tableScrollWrapperRef: React.RefObject<HTMLDivElement  | null>;
}

export interface QueryManagerState {
    sqlQuery: string;
    queryResult: QueryResultState | null;
    isLoading: boolean;
    queryHistory: QueryHistoryItem[];
    savedQueries: SavedQuery[];
}

export type QueryManagerAction =
    | { type: 'SET_QUERY_INPUT'; payload: string }
    | { type: 'SET_QUERY_RESULT'; payload: QueryResultState | null }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'ADD_HISTORY_ITEM'; payload: QueryHistoryItem }
    | { type: 'UPDATE_HISTORY'; payload: QueryHistoryItem[] } // For loading from localStorage
    | { type: 'ADD_OR_UPDATE_SAVED_QUERY'; payload: SavedQuery }
    | { type: 'DELETE_SAVED_QUERY'; payload: string } // payload is queryId
    | { type: 'UPDATE_SAVED_QUERIES'; payload: SavedQuery[] } // For loading from localStorage
    | { type: 'CLEAR_ALL' };