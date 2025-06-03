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

    test('displays "Run a query" message when result is null and not loading', () => {
        render(<QueryResult queryResult={null} />);
        expect(screen.getByText(/Run a query to see results here\./i)).toBeInTheDocument();
        expect(screen.queryByText(/Loading results/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/No results found/i)).not.toBeInTheDocument();
    });

    test('displays success message when result status is "success" and only message is present', () => {
        const successMessageResult: QueryResultState = {
            message: 'Query executed successfully. 0 rows affected.',
            status: 'success',
        };
        render(<QueryResult queryResult={successMessageResult} />);
        expect(screen.getByText(/Query executed successfully\. 0 rows affected\./i)).toBeInTheDocument();
        expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Loading results/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Run a query/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/No results found/i)).not.toBeInTheDocument();
    });

});