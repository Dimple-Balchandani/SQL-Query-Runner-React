import { useEffect, useRef, useReducer, useCallback } from 'react';
import {
    QueryData,
    QueryResultState,
    QueryHistoryItem,
    SavedQuery,
    SchemaTable,
} from '../types';
import {
    dummySchema
} from '../constants';
import { getDataForQuery } from '../utils';
import { initialQueryManagerState, queryManagerReducer, init } from '../reducers/queryManagerReducer';

interface UseQueryManagerResult {
    sqlQuery: string;
    setSqlQuery: (query: string) => void;
    queryResult: QueryResultState | null;
    isLoading: boolean;
    queryHistory: QueryHistoryItem[];
    savedQueries: SavedQuery[];
    editorRef: React.RefObject<HTMLTextAreaElement | null>;
    handleRunQuery: () => void;
    handleClear: () => void;
    handleHistorySelect: (query: string) => void;
    handleSaveQuery: (name: string, queryToSave: string) => { success: boolean, message: string };
    handleLoadQuery: (queryId: string) => void;
    handleDeleteSavedQuery: (queryId: string) => void;
    handleSchemaItemSelect: (item: string) => void;
    schema: SchemaTable[];
}

export const useQueryManager = (): UseQueryManagerResult => {
    const [state, dispatch] = useReducer(queryManagerReducer, initialQueryManagerState, init);

    // Keep editorRef separate as it's a DOM reference, not part of core state
    const editorRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        // Only save if history has been initialized (i.e., not empty initial state)
        if (state.queryHistory.length > 0 || localStorage.getItem('sqlQueryHistory') !== JSON.stringify([])) {
            try {
                localStorage.setItem('sqlQueryHistory', JSON.stringify(state.queryHistory));
            } catch (error) {
                console.error("Failed to save query history to localStorage:", error);
            }
        }
    }, [state.queryHistory]);

    useEffect(() => {
        // Only save if saved queries have been initialized
        if (state.savedQueries.length > 0 || localStorage.getItem('sqlSavedQueries') !== JSON.stringify([])) {
            try {
                localStorage.setItem('sqlSavedQueries', JSON.stringify(state.savedQueries));
            } catch (error) {
                console.error("Failed to save saved queries to localStorage:", error);
            }
        }
    }, [state.savedQueries]);


    const setSqlQuery = useCallback((query: string) => {
        dispatch({ type: 'SET_QUERY_INPUT', payload: query });
    }, []);

    const addQueryToHistory = useCallback((query: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        dispatch({
            type: 'ADD_HISTORY_ITEM',
            payload: {
                id: Date.now().toString(),
                query: trimmedQuery,
                timestamp: new Date().toLocaleString()
            }
        });
    }, []);

    // Core logic for running a query (simulated)
    const runQueryLogic = useCallback((query: string, dataToDisplay: QueryData | QueryResultState | null) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_QUERY_RESULT', payload: { message: 'Loading results...', status: 'loading' } });

        setTimeout(() => {
            let finalResult: QueryResultState | null = null;
            if (dataToDisplay && 'headers' in dataToDisplay) {
                finalResult = { ...dataToDisplay, status: 'success' };
            } else if (dataToDisplay && 'message' in dataToDisplay) {
                 finalResult = { ...dataToDisplay };
            } else {
                 finalResult = { message: 'No data or specific result for this query.', status: 'success' };
            }
            dispatch({ type: 'SET_QUERY_RESULT', payload: finalResult });
            addQueryToHistory(query);
        }, 800);
    }, [addQueryToHistory]);

    // Main handler for running a query from the input section
    const handleRunQuery = useCallback(() => {
        const query = state.sqlQuery.trim();
        if (query === '') {
            dispatch({ type: 'SET_QUERY_RESULT', payload: { message: 'Please enter an SQL query.', status: 'error' } });
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: true });

        const resultData = getDataForQuery(query);
        runQueryLogic(query, resultData);

        dispatch({ type: 'SET_LOADING', payload: false });
    }, [state.sqlQuery, runQueryLogic]);

    // Clears the query input and result
    const handleClear = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL' });
    }, []);

    // Handles selection of a query from history
    const handleHistorySelect = useCallback((query: string) => {
        dispatch({ type: 'SET_QUERY_INPUT', payload: query });
        dispatch({ type: 'SET_QUERY_RESULT', payload: { message: 'Please run the query.', status: 'warning' } });
    }, []);

    // Handles saving the current query
    const handleSaveQuery = useCallback((name: string, queryToSave: string): { success: boolean, message: string } => {
        const trimmedQuery = queryToSave.trim();
        const trimmedName = name.trim();

        if (!trimmedName) {
            return { success: false, message: 'Please provide a name for the query.' };
        }
        if (!trimmedQuery) {
            return { success: false, message: 'Cannot save an empty query.' };
        }

        const newSavedQuery: SavedQuery = {
            id: Date.now().toString(),
            name: trimmedName,
            query: trimmedQuery,
            timestamp: new Date().toLocaleString()
        };

        dispatch({ type: 'ADD_OR_UPDATE_SAVED_QUERY', payload: newSavedQuery });
        return { success: true, message: `Query "${trimmedName}" saved successfully.` };
    }, []);

    // Handles loading a saved query
    const handleLoadQuery = useCallback((queryId: string) => {
        const queryToLoad = state.savedQueries.find(q => q.id === queryId);
        if (queryToLoad) {
            dispatch({ type: 'SET_QUERY_INPUT', payload: queryToLoad.query });
            dispatch({ type: 'SET_QUERY_RESULT', payload: { message: 'Please run the query.', status: 'warning' } });
        }
    }, [state.savedQueries]);

    // Handles deleting a saved query
    const handleDeleteSavedQuery = useCallback((queryId: string) => {
        dispatch({ type: 'DELETE_SAVED_QUERY', payload: queryId });
    }, []);

    // Handles inserting schema item into the query editor
    const handleSchemaItemSelect = useCallback((item: string) => {
        const editor = editorRef.current;
        if (!editor) return;

        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const currentQuery = editor.value;

        const newQuery = currentQuery.substring(0, start) + item + currentQuery.substring(end);
        dispatch({ type: 'SET_QUERY_INPUT', payload: newQuery }); // Dispatch the new query

        const newCursorPosition = start + item.length;
        setTimeout(() => {
            editor.focus();
            editor.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);
    }, []);

    // Return all states and handlers
    return {
        sqlQuery: state.sqlQuery,
        setSqlQuery,
        queryResult: state.queryResult,
        isLoading: state.isLoading,
        queryHistory: state.queryHistory,
        savedQueries: state.savedQueries,
        editorRef,
        handleRunQuery,
        handleClear,
        handleHistorySelect,
        handleSaveQuery,
        handleLoadQuery,
        handleDeleteSavedQuery,
        handleSchemaItemSelect,
        schema: dummySchema
    };
};