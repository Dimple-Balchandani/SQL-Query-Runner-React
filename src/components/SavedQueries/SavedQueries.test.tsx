import { render, screen } from '@testing-library/react';
import SavedQueries from './index';
import { SavedQuery } from '../../types';

describe('SavedQueries', () => {
    const mockOnSave = vi.fn();
    const mockOnLoad = vi.fn();
    const mockOnDelete = vi.fn();

    const mockSavedQueries: SavedQuery[] = [
        { id: 'sq1', name: 'Get All Users', query: 'SELECT * FROM Users;', timestamp: '2025-06-01 10:00:00' },
        { id: 'sq2', name: 'Top 10 Products', query: 'SELECT * FROM Products LIMIT 10;', timestamp: '2025-06-01 11:30:00' },
    ];

    beforeAll(() => {
        vi.useFakeTimers();
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    beforeEach(() => {
        mockOnSave.mockClear();
        mockOnLoad.mockClear();
        mockOnDelete.mockClear();
        vi.runOnlyPendingTimers();
    });

    test('should render the "Saved Queries" section heading', () => {
        render(
            <SavedQueries
                currentQuery=""
                savedQueries={[]}
                onSave={mockOnSave}
                onLoad={mockOnLoad}
                onDelete={mockOnDelete}
            />
        );
        expect(screen.getByRole('heading', { level: 2, name: /Saved Queries/i })).toBeInTheDocument();
    });

    test('should display "No queries saved yet." message when no saved queries are provided', () => {
        render(
            <SavedQueries
                currentQuery=""
                savedQueries={[]}
                onSave={mockOnSave}
                onLoad={mockOnLoad}
                onDelete={mockOnDelete}
            />
        );
        expect(screen.getByText(/No queries saved yet\./i)).toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    test('should render a list of saved queries when `savedQueries` array is populated', () => {
        render(
            <SavedQueries
                currentQuery=""
                savedQueries={mockSavedQueries}
                onSave={mockOnSave}
                onLoad={mockOnLoad}
                onDelete={mockOnDelete}
            />
        );

        expect(screen.queryByText(/No queries saved yet\./i)).not.toBeInTheDocument();
        expect(screen.getByRole('list')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(mockSavedQueries.length);

        mockSavedQueries.forEach(item => {
            expect(screen.getByText(item.name)).toBeInTheDocument();
            expect(screen.getByText(item.timestamp)).toBeInTheDocument();
            expect(screen.getByText(item.query)).toBeInTheDocument();
        });

        expect(screen.getAllByRole('button', { name: /Load/i })).toHaveLength(mockSavedQueries.length);
        expect(screen.getAllByRole('button', { name: /Delete/i })).toHaveLength(mockSavedQueries.length);
    });

});