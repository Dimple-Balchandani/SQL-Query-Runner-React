import { render, screen, fireEvent, within } from '@testing-library/react';
import SchemaViewer from './index';
import { SchemaTable } from '../../types';

describe('SchemaViewer', () => {
    const mockOnSelect = vi.fn();

    const mockSchema: SchemaTable[] = [
        {
            name: 'users',
            columns: [
                { name: 'id', type: 'INTEGER' },
                { name: 'username', type: 'TEXT' },
                { name: 'email', type: 'TEXT' },
            ],
        },
        {
            name: 'products',
            columns: [
                { name: 'product_id', type: 'INTEGER' },
                { name: 'name', type: 'TEXT' },
                { name: 'price', type: 'REAL' },
            ],
        },
        {
            name: 'orders',
            columns: [],
        },
    ];

    beforeEach(() => {
        mockOnSelect.mockClear();
    });

    test('should display "No schema defined." message when schema is empty', () => {
        render(<SchemaViewer schema={[]} onSelect={mockOnSelect} />);
        expect(screen.getByText(/No schema defined\./i)).toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    test('should render a list of table names when schema is provided', () => {
        render(<SchemaViewer schema={mockSchema} onSelect={mockOnSelect} />);

        expect(screen.queryByText(/No schema defined\./i)).not.toBeInTheDocument();
        expect(screen.getByRole('list')).toBeInTheDocument();

        expect(screen.getByRole('button', { name: /users/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /products/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /orders/i })).toBeInTheDocument();

        expect(screen.queryByText('id')).not.toBeInTheDocument();
        expect(screen.queryByText('product_id')).not.toBeInTheDocument();
    });

    test('should expand a table to show its columns when the table name toggle button is clicked', () => {
        render(<SchemaViewer schema={mockSchema} onSelect={mockOnSelect} />);

        const usersTableToggleButton = screen.getByRole('button', { name: /users/i });

        expect(screen.queryByText('id')).not.toBeInTheDocument();
        expect(screen.queryByText('username')).not.toBeInTheDocument();

        fireEvent.click(usersTableToggleButton);

        expect(screen.getByText('id')).toBeInTheDocument();
        expect(screen.getByText('(INTEGER)')).toBeInTheDocument();
        expect(screen.getByText('username')).toBeInTheDocument();
        expect(screen.getByText('email')).toBeInTheDocument();

        expect(usersTableToggleButton).toHaveTextContent('▼');
    });

    test('should collapse an expanded table when its toggle button is clicked again', () => {
        render(<SchemaViewer schema={mockSchema} onSelect={mockOnSelect} />);
        const usersTableToggleButton = screen.getByRole('button', { name: /users/i });

        fireEvent.click(usersTableToggleButton);
        expect(screen.getByText('id')).toBeInTheDocument();

        fireEvent.click(usersTableToggleButton);
        expect(screen.queryByText('id')).not.toBeInTheDocument();

        expect(usersTableToggleButton).toHaveTextContent('►');
    });

    test('should call `onSelect` with the table name when the table name text is clicked', () => {
        render(<SchemaViewer schema={mockSchema} onSelect={mockOnSelect} />);

        // Find the specific span element that triggers onSelect for 'products'
        const productsTableNameText = screen.getByText('products', { selector: '.table-name-text' });
        fireEvent.click(productsTableNameText);

        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnSelect).toHaveBeenCalledWith('products');
    });

    test('should call `onSelect` with the column name when a column name button is clicked', () => {
        render(<SchemaViewer schema={mockSchema} onSelect={mockOnSelect} />);

        // Expand 'users' table first to make columns visible
        const usersTableToggleButton = screen.getByRole('button', { name: /users/i });
        fireEvent.click(usersTableToggleButton);

        // Find the column button for 'username'
        const usernameColumnButton = screen.getByRole('button', { name: /username \(TEXT\)/i }); 
        fireEvent.click(usernameColumnButton);

        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnSelect).toHaveBeenCalledWith('username');
    });

    test('should not call `onSelect` when only the table expansion toggle icon/area is clicked (only toggles expansion)', () => {
        render(<SchemaViewer schema={mockSchema} onSelect={mockOnSelect} />);

        const usersTableToggleButton = screen.getByRole('button', { name: /users/i });
        fireEvent.click(usersTableToggleButton);

        expect(mockOnSelect).not.toHaveBeenCalled();
        expect(screen.getByText('id')).toBeInTheDocument();
    });


    test('should handle tables with no columns correctly (can still be expanded/collapsed)', () => {
        render(<SchemaViewer schema={mockSchema} onSelect={mockOnSelect} />);
        const ordersTableToggleButton = screen.getByRole('button', { name: /orders/i });

        fireEvent.click(ordersTableToggleButton);
        const ordersListItem = screen.getByText('orders').closest('li');
        if (ordersListItem) {
            expect(within(ordersListItem).queryAllByRole('button', { name: /.*/ })).toHaveLength(1); 
        }
        expect(ordersTableToggleButton).toHaveTextContent('▼');

        fireEvent.click(ordersTableToggleButton);
        expect(ordersTableToggleButton).toHaveTextContent('►'); 
    });

    test('clicking one table does not affect expansion of other tables', () => {
        render(<SchemaViewer schema={mockSchema} onSelect={mockOnSelect} />);

        const usersTableToggleButton = screen.getByRole('button', { name: /users/i });
        const productsTableToggleButton = screen.getByRole('button', { name: /products/i });

        // Expand users
        fireEvent.click(usersTableToggleButton);
        expect(screen.getByText('id')).toBeInTheDocument(); 
        expect(screen.queryByText('product_id')).not.toBeInTheDocument();

        // Expand products
        fireEvent.click(productsTableToggleButton);
        expect(screen.getByText('id')).toBeInTheDocument(); 
        expect(screen.getByText('product_id')).toBeInTheDocument();

        // Collapse users
        fireEvent.click(usersTableToggleButton);
        expect(screen.queryByText('id')).not.toBeInTheDocument(); 
        expect(screen.getByText('product_id')).toBeInTheDocument();
    });
});