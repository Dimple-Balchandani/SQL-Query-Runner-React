import {
    QueryManagerState,
    QueryManagerAction,
} from '../types';
import {
    HISTORY_MAX_SIZE,
    LOCAL_STORAGE_KEY,
    LOCAL_STORAGE_SAVED_QUERIES_KEY
} from '../constants';

export const initialQueryManagerState: QueryManagerState = {
    sqlQuery: '',
    queryResult: null,
    isLoading: false,
    queryHistory: [],
    savedQueries: [],
};

export const queryManagerReducer = (state: QueryManagerState, action: QueryManagerAction): QueryManagerState => {
    switch (action.type) {
        case 'SET_QUERY_INPUT':
            return { ...state, sqlQuery: action.payload };
        case 'SET_QUERY_RESULT':
            return { ...state, queryResult: action.payload, isLoading: false };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'ADD_HISTORY_ITEM':
            const newHistory = state.queryHistory.filter(item => item.query !== action.payload.query);
            newHistory.unshift(action.payload);
            return { ...state, queryHistory: newHistory.slice(0, HISTORY_MAX_SIZE) };
        case 'UPDATE_HISTORY': // Used for initializing history from localStorage
            return { ...state, queryHistory: action.payload };
        case 'ADD_OR_UPDATE_SAVED_QUERY':
            const existingQueryIndex = state.savedQueries.findIndex(q => q.name.toLowerCase() === action.payload.name.toLowerCase());
            if (existingQueryIndex > -1) {
                const updatedSavedQueries = [...state.savedQueries];
                updatedSavedQueries[existingQueryIndex] = action.payload;
                return { ...state, savedQueries: updatedSavedQueries };
            } else {
                return { ...state, savedQueries: [...state.savedQueries, action.payload] };
            }
        case 'DELETE_SAVED_QUERY':
            return { ...state, savedQueries: state.savedQueries.filter(q => q.id !== action.payload) };
        case 'UPDATE_SAVED_QUERIES': // Used for initializing saved queries from localStorage
            return { ...state, savedQueries: action.payload };
        case 'CLEAR_ALL':
            return { ...state, sqlQuery: '', queryResult: null, isLoading: false };
        default:
            throw new Error(`Unknown action type: ${action}`)
    }
};

export const init = (initialState: QueryManagerState): QueryManagerState => {
    try {
        const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
        const storedSavedQueries = localStorage.getItem(LOCAL_STORAGE_SAVED_QUERIES_KEY);
        return {
            ...initialState,
            queryHistory: storedHistory ? JSON.parse(storedHistory) : [],
            savedQueries: storedSavedQueries ? JSON.parse(storedSavedQueries) : [],
        };
    } catch (error) {
        console.error("Failed to load state from localStorage:", error);
        return initialState;
    }
};