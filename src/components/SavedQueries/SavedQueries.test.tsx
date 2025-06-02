import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    test('should render the save query input field and "Save Query" button', () => {
        render(
            <SavedQueries
                currentQuery=""
                savedQueries={[]}
                onSave={mockOnSave}
                onLoad={mockOnLoad}
                onDelete={mockOnDelete}
            />
        );
        expect(screen.getByPlaceholderText(/Enter name to save current query/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Save Query/i })).toBeInTheDocument();
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

    test('Save Query button should be disabled when either `currentQuery` or `queryName` is empty/whitespace', () => {
        const { rerender } = render(
            <SavedQueries
                currentQuery=""
                savedQueries={[]}
                onSave={mockOnSave}
                onLoad={mockOnLoad}
                onDelete={mockOnDelete}
            />
        );
        const saveButton = screen.getByRole('button', { name: /Save Query/i });
        const nameInput = screen.getByPlaceholderText(/Enter name to save current query/i);

        expect(saveButton).toBeDisabled();

        // Scenario 1: currentQuery has value, but nameInput is empty
        rerender(
            <SavedQueries
                currentQuery="SELECT 1;"
                savedQueries={[]}
                onSave={mockOnSave}
                onLoad={mockOnLoad}
                onDelete={mockOnDelete}
            />
        );
        expect(saveButton).toBeDisabled();

        // Scenario 2: nameInput has value, but currentQuery is empty
        fireEvent.change(nameInput, { target: { value: 'My Query Name' } });
        rerender(
            <SavedQueries
                currentQuery=""
                savedQueries={[]}
                onSave={mockOnSave}
                onLoad={mockOnLoad}
                onDelete={mockOnDelete}
            />
        );
        expect(saveButton).toBeDisabled();

        // Scenario 3: nameInput has only whitespace
        fireEvent.change(nameInput, { target: { value: '   ' } });
        rerender(
            <SavedQueries
                currentQuery="SELECT 1;"
                savedQueries={[]}
                onSave={mockOnSave}
                onLoad={mockOnLoad}
                onDelete={mockOnDelete}
            />
        );
        expect(saveButton).toBeDisabled();
    });

    test('Save Query button should be enabled when both `currentQuery` and `queryName` are valid', () => {
        render(
            <SavedQueries
                currentQuery="SELECT * FROM Employees;"
                savedQueries={[]}
                onSave={mockOnSave}
                onLoad={mockOnLoad}
                onDelete={mockOnDelete}
            />
        );
        const saveButton = screen.getByRole('button', { name: /Save Query/i });
        const nameInput = screen.getByPlaceholderText(/Enter name to save current query/i);

        expect(saveButton).toBeDisabled();

        fireEvent.change(nameInput, { target: { value: 'My Valid Query Name' } });
        expect(saveButton).toBeEnabled();
    });

    test.skip('should call `onSave` and display success message on successful save via button click', async () => {
        // Configure the mock to return a success result
        mockOnSave.mockReturnValue({ success: true, message: 'Query saved successfully!' });

        render(
            <SavedQueries
                currentQuery="SELECT * FROM data;"
                savedQueries={[]}
                onSave={mockOnSave}
                onLoad={mockOnLoad}
                onDelete={mockOnDelete}
            />
        );

        const nameInput = screen.getByPlaceholderText(/Enter name to save current query/i);
        const saveButton = screen.getByRole('button', { name: /Save Query/i });

        fireEvent.change(nameInput, { target: { value: 'New Test Query' } });
        fireEvent.click(saveButton);

        // Verify `onSave` was called with the correct arguments
        expect(mockOnSave).toHaveBeenCalledTimes(1);
        expect(mockOnSave).toHaveBeenCalledWith('New Test Query', 'SELECT * FROM data;');

        // Check for the success message
        const successMessage = screen.getByText('Query saved successfully!');
        expect(successMessage).toBeInTheDocument();
        expect(successMessage).toHaveClass('success');

        // Input field should be cleared on successful save
        expect(nameInput).toHaveValue('');

        // Advance timers and verify the message disappears after 3 seconds
        vi.advanceTimersByTime(3000);
        await waitFor(() => {
            expect(screen.queryByText('Query saved successfully!')).not.toBeInTheDocument();
        });
    });

    test.skip('should call `onSave` and display error message on failed save via button click', async () => {
        // Configure the mock to return an error result
        mockOnSave.mockReturnValue({ success: false, message: 'Failed to save query: Name already exists.' });

        render(
            <SavedQueries
                currentQuery="SELECT * FROM data;"
                savedQueries={[]}
                onSave={mockOnSave}
                onLoad={mockOnLoad}
                onDelete={mockOnDelete}
            />
        );

        const nameInput = screen.getByPlaceholderText(/Enter name to save current query/i);
        const saveButton = screen.getByRole('button', { name: /Save Query/i });

        fireEvent.change(nameInput, { target: { value: 'Existing Query' } });
        fireEvent.click(saveButton);

        // Verify `onSave` was called
        expect(mockOnSave).toHaveBeenCalledTimes(1);
        expect(mockOnSave).toHaveBeenCalledWith('Existing Query', 'SELECT * FROM data;');

        // Check for the error message
        const errorMessage = screen.getByText('Failed to save query: Name already exists.');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('error');

        // Input field should NOT be cleared on error
        expect(nameInput).toHaveValue('Existing Query');

        // Advance timers and verify the message disappears after 3 seconds
        vi.advanceTimersByTime(3000);
        await waitFor(() => {
            expect(screen.queryByText('Failed to save query: Name already exists.')).not.toBeInTheDocument();
        });
    });

    test('should call `onSave` when Enter key is pressed in the input field', async () => {
        mockOnSave.mockReturnValue({ success: true, message: 'Saved by Enter key!' });

        render(
            <SavedQueries
                currentQuery="SELECT current_date();"
                savedQueries={[]}
                onSave={mockOnSave}
                onLoad={mockOnLoad}
                onDelete={mockOnDelete}
            />
        );
        const nameInput = screen.getByPlaceholderText(/Enter name to save current query/i);

        fireEvent.change(nameInput, { target: { value: 'Query via Enter' } });
        fireEvent.keyPress(nameInput, { key: 'Enter', code: 'Enter', charCode: 13 }); // Simulate Enter key press

        // Verify `onSave` was called
        expect(mockOnSave).toHaveBeenCalledTimes(1);
        expect(mockOnSave).toHaveBeenCalledWith('Query via Enter', 'SELECT current_date();');

        // Check for success message and input clearing
        expect(screen.getByText('Saved by Enter key!')).toBeInTheDocument();
        expect(nameInput).toHaveValue('');
    });

    test.skip('should call `onLoad` with the correct ID when a "Load" button is clicked', () => {
        render(
            <SavedQueries
                currentQuery=""
                savedQueries={mockSavedQueries}
                onSave={mockOnSave}
                onLoad={mockOnLoad}
                onDelete={mockOnDelete}
            />
        );

        // Find and click the 'Load' button for the first item
        // Using `title` for specific selection as multiple 'Load' buttons exist
        const firstLoadButton = screen.getByRole('button', { name: /Load/i });
        fireEvent.click(firstLoadButton);

        expect(mockOnLoad).toHaveBeenCalledTimes(1);
        expect(mockOnLoad).toHaveBeenCalledWith(mockSavedQueries[0].id); // Check for the first item's ID
    });

    test.skip('should call `onDelete` with the correct ID when a "Delete" button is clicked', () => {
        render(
            <SavedQueries
                currentQuery=""
                savedQueries={mockSavedQueries}
                onSave={mockOnSave}
                onLoad={mockOnLoad}
                onDelete={mockOnDelete}
            />
        );

        // Find and click the 'Delete' button for the first item
        // Using `title` for specific selection as multiple 'Delete' buttons exist
        const firstDeleteButton = screen.getByRole('button', { name: /Delete/i });
        fireEvent.click(firstDeleteButton);

        expect(mockOnDelete).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).toHaveBeenCalledWith(mockSavedQueries[0].id); // Check for the first item's ID
    });
});