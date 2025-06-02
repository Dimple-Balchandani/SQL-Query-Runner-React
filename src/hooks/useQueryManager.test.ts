import { renderHook, act } from '@testing-library/react';
import { useQueryManager } from './useQueryManager';

const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


describe('useQueryManager', () => {
    beforeAll(() => {
        vi.useFakeTimers();
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks(); 
        localStorageMock.setItem('sqlQueryHistory', JSON.stringify([]));
        localStorageMock.setItem('sqlSavedQueries', JSON.stringify([]));
    });


    test('should initialize with default empty state when localStorage is empty', () => {
        const { result } = renderHook(() => useQueryManager());

        expect(result.current.sqlQuery).toBe('');
        expect(result.current.queryResult).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.queryHistory).toEqual([]);
        expect(result.current.savedQueries).toEqual([]);
        expect(result.current.editorRef.current).toBeNull(); // Ref is initially null

        // Verify localStorage.getItem was called during initialization
        expect(localStorageMock.getItem).toHaveBeenCalledWith('sqlQueryHistory');
        expect(localStorageMock.getItem).toHaveBeenCalledWith('sqlSavedQueries');
    });

    test('should load history and saved queries from localStorage on initialization', () => {
        const initialHistory = [{ id: 'h1', query: 'SELECT * FROM old_history;', timestamp: '2023-01-01' }];
        const initialSaved = [{ id: 's1', name: 'Old Saved Query', query: 'SELECT * FROM old_saved;', timestamp: '2023-01-02' }];
        localStorageMock.setItem('sqlQueryHistory', JSON.stringify(initialHistory));
        localStorageMock.setItem('sqlSavedQueries', JSON.stringify(initialSaved));

        const { result } = renderHook(() => useQueryManager());

        expect(result.current.queryHistory).toEqual(initialHistory);
        expect(result.current.savedQueries).toEqual(initialSaved);
    });

    test('should handle malformed localStorage data gracefully (return empty arrays)', () => {
        localStorageMock.setItem('sqlQueryHistory', 'invalid json string');
        localStorageMock.setItem('sqlSavedQueries', '{bad: "json"'); // incomplete JSON

        const { result } = renderHook(() => useQueryManager());

        expect(result.current.queryHistory).toEqual([]);
        expect(result.current.savedQueries).toEqual([]);
    });

    test('setSqlQuery should update the sqlQuery state correctly', () => {
        const { result } = renderHook(() => useQueryManager());

        act(() => {
            result.current.setSqlQuery('SELECT * FROM products;');
        });

        expect(result.current.sqlQuery).toBe('SELECT * FROM products;');
    });

    test('handleRunQuery should handle queries that return no specific data or message', async () => {
        const { result } = renderHook(() => useQueryManager());
        const testQuery = 'CREATE TABLE temp;'; // This query returns null from getDataFromQuery

        act(() => {
            result.current.setSqlQuery(testQuery);
            result.current.handleRunQuery();
        });

        act(() => {
            vi.advanceTimersByTime(800);
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.queryResult).toEqual({
            message: 'Please enter an SQL query.',
            status: 'error'
        });
    });

    test('handleRunQuery should handle queries that result in an error message', async () => {
        const { result } = renderHook(() => useQueryManager());
        const errorQuery = 'SELECT ERROR;'; // This query returns an error message from getDataFromQuery

        act(() => {
            result.current.setSqlQuery(errorQuery);
            result.current.handleRunQuery();
        });

        act(() => {
            vi.advanceTimersByTime(800);
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.queryResult).toEqual({ message: 'Please enter an SQL query.', status: 'error' });
    });

    // --- handleSaveQuery Tests ---

    test('handleSaveQuery should return error for empty name', async () => {
        const { result } = renderHook(() => useQueryManager());
        const response = await act(async () => {
            return result.current.handleSaveQuery('', 'SELECT * FROM dummy;');
        });
    
        expect(response).toEqual({ success: false, message: 'Please provide a name for the query.' });
        expect(result.current.savedQueries).toHaveLength(0);
    });

    test('handleSaveQuery should return error for empty query', async () => {
        const { result } = renderHook(() => useQueryManager());

        const response = await act(async() => {
            return result.current.handleSaveQuery('My Empty Query', '');
        });

        expect(response).toEqual({ success: false, message: 'Cannot save an empty query.' });
        expect(result.current.savedQueries).toHaveLength(0);
    });

    test('handleLoadQuery should do nothing if queryId not found', () => {
        const { result } = renderHook(() => useQueryManager());
        act(() => {
            result.current.handleLoadQuery('non-existent-id');
        });
        expect(result.current.sqlQuery).toBe('');
        expect(result.current.isLoading).toBe(false);
    });


    test('handleSchemaItemSelect should do nothing if editorRef.current is null', () => {
        const { result } = renderHook(() => useQueryManager());
        result.current.editorRef.current = null; // Ensure editorRef is null

        // Capture initial query state
        const initialQuery = result.current.sqlQuery;

        act(() => {
            result.current.handleSchemaItemSelect('some_item');
        });

        // State should not change
        expect(result.current.sqlQuery).toBe(initialQuery);
        // No interaction with a null editor
        expect(result.current.editorRef.current).toBeNull();
    });
});