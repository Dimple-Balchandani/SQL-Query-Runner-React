import { render, screen, cleanup } from '@testing-library/react';
import QueryResult from './index';
import { QueryResultState } from '../../types';

vi.mock('react-window', () => {
    return {
      FixedSizeList: ({ children, itemCount, itemData, itemSize, ...rest }: any) => {
        return (
          <div data-testid="fixed-size-list-mock" {...rest}>
            {Array.from({ length: itemCount }).map((_, index) =>
              children({ index, style: {} })
            )}
          </div>
        );
      },
    };
});

describe('QueryResult', () => {
    afterEach(() => {
        cleanup();
    });

    test('renders the section heading', () => {
        render(<QueryResult result={null} isLoading={false} />);
        expect(screen.getByRole('heading', { level: 2, name: /Query Results/i })).toBeInTheDocument();
    });

    // --- State 1: Initial State (result is null, not loading) ---
    test('displays "Run a query" message when result is null and not loading', () => {
        render(<QueryResult result={null} isLoading={false} />);
        expect(screen.getByText(/Run a query to see results here\./i)).toBeInTheDocument();
        expect(screen.queryByText(/Loading results/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/No results found/i)).not.toBeInTheDocument();
    });

    // --- State 2: Loading State ---
    test('displays loading message when isLoading is true', () => {
        render(<QueryResult result={null} isLoading={true} />);
        expect(screen.getByText(/Loading results\.\.\./i)).toBeInTheDocument();
        expect(screen.getByTestId('spinner-element')).toBeInTheDocument();
        expect(screen.queryByText(/Run a query/i)).not.toBeInTheDocument();
    });

    // --- State 3: Error State ---
    test('displays error message when result status is "error"', () => {
        const errorResult: QueryResultState = {
            message: 'Syntax error at line 1, column 5.',
            status: 'error',
        };
        render(<QueryResult result={errorResult} isLoading={false} />);
        expect(screen.getByTestId('query-error')).toBeInTheDocument();
        expect(screen.queryByText('Syntax error at line 1, column 5.')).toBeInTheDocument();
    });

    test('displays default error message if result.message is missing in error state', () => {
        const defaultErrorResult: QueryResultState = {
            status: 'error',
        };
        render(<QueryResult result={defaultErrorResult} isLoading={false} />);
        expect(screen.getByText('Error:')).toBeInTheDocument();
        expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
    });


    // --- State 4: Success with Data (but no rows) ---
    test('displays "No results found" message when headers are present but rows are empty', () => {
        const emptyTableResult: QueryResultState = {
            headers: ['id', 'name'],
            rows: [],
            status: 'success',
        };
        render(<QueryResult result={emptyTableResult} isLoading={false} />);
        
        expect(screen.getByText('id')).toBeInTheDocument();
        expect(screen.getByText('name')).toBeInTheDocument();

        expect(screen.getByText(/No results found for this query\./i)).toBeInTheDocument();
        expect(screen.queryByTestId('fixed-size-list-mock')).not.toBeInTheDocument();
    });


    test('displays success message when result status is "success" and only message is present', () => {
        const successMessageResult: QueryResultState = {
            message: 'Query executed successfully. 0 rows affected.',
            status: 'success',
        };
        render(<QueryResult result={successMessageResult} isLoading={false} />);
        expect(screen.getByText(/Query executed successfully\. 0 rows affected\./i)).toBeInTheDocument();
        expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Loading results/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Run a query/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/No results found/i)).not.toBeInTheDocument();
    });

    // --- State 6: Success with Populated Data ---
    test('renders table headers and rows when result has headers and rows', () => {
        const populatedResult: QueryResultState = {
            headers: ['ID', 'Name', 'Age'],
            rows: [
                ['1', 'Alice', '30'],
                ['2', 'Bob', '24'],
                ['3', 'Charlie', '35'],
            ],
            status: 'success',
        };
        render(<QueryResult result={populatedResult} isLoading={false} />);

        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Age')).toBeInTheDocument();

        expect(screen.getByTestId('fixed-size-list-mock')).toBeInTheDocument();

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('30')).toBeInTheDocument();

        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('24')).toBeInTheDocument();

        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
        expect(screen.getByText('35')).toBeInTheDocument();

        expect(screen.queryByText(/No results found/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Run a query/i)).not.toBeInTheDocument();
    });
});