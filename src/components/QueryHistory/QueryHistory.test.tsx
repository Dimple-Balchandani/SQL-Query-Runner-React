import { render, screen, fireEvent } from '@testing-library/react';
import QueryHistory from './index';
import { QueryHistoryItem } from '../../types';

describe('QueryHistory', () => {
    const mockOnSelect = vi.fn();

    const mockHistory: QueryHistoryItem[] = [
        { id: '1', query: 'SELECT * FROM users;', timestamp: '2025-06-01 10:00:00' },
        { id: '2', query: 'INSERT INTO products VALUES (1, "Laptop");', timestamp: '2025-06-01 11:30:00' },
        { id: '3', query: 'DELETE FROM orders WHERE id = 123;', timestamp: '2025-06-01 14:15:00' },
    ];

    beforeEach(() => {
        mockOnSelect.mockClear();
    });

    test('renders the section heading', () => {
        render(<QueryHistory history={[]} onSelect={mockOnSelect} />);
        expect(screen.getByRole('heading', { level: 2, name: /Query History/i })).toBeInTheDocument();
    });

    test('displays "No queries run yet." message when history is empty', () => {
        render(<QueryHistory history={[]} onSelect={mockOnSelect} />);
        expect(screen.getByText(/No queries run yet\./i)).toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    test('renders a list of query history items when history is populated', () => {
        render(<QueryHistory history={mockHistory} onSelect={mockOnSelect} />);

        expect(screen.getByRole('list')).toBeInTheDocument();

        expect(screen.getAllByRole('listitem')).toHaveLength(mockHistory.length);

        mockHistory.forEach(item => {
            expect(screen.getByText(item.query)).toBeInTheDocument();
            expect(screen.getByText(item.timestamp)).toBeInTheDocument();
        });
    });

    test('calls onSelect with the correct query when a history item button is clicked', () => {
        render(<QueryHistory history={mockHistory} onSelect={mockOnSelect} />);

        const firstQueryButton = screen.getByTitle(`Run query: ${mockHistory[0].query}`);
        fireEvent.click(firstQueryButton);

        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnSelect).toHaveBeenCalledWith(mockHistory[0].query);

        mockOnSelect.mockClear();
        const secondQueryButton = screen.getByTitle(`Run query: ${mockHistory[1].query}`);
        fireEvent.click(secondQueryButton);

        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnSelect).toHaveBeenCalledWith(mockHistory[1].query);
    });

    test('buttons have correct accessible names (titles)', () => {
        render(<QueryHistory history={mockHistory} onSelect={mockOnSelect} />);

        mockHistory.forEach(item => {
            const button = screen.getByTitle(`Run query: ${item.query}` );
            expect(button).toBeInTheDocument();
            expect(button).toHaveAttribute('title', `Run query: ${item.query}`);
        });
    });

    test('does not call onSelect when no history item is clicked', () => {
        render(<QueryHistory history={mockHistory} onSelect={mockOnSelect} />);
        expect(mockOnSelect).not.toHaveBeenCalled();
    });
});