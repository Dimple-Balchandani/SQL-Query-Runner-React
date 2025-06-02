import { render, screen, fireEvent } from '@testing-library/react';
import PredefinedQueries from './index';

describe('PredefinedQueries', () => {
    const mockOnSelect = vi.fn();

    beforeEach(() => {
        mockOnSelect.mockClear();
    });

    test('renders the section heading', () => {
        render(<PredefinedQueries onSelect={mockOnSelect} />);
        expect(screen.getByRole('heading', { level: 2, name: /Predefined Queries/i })).toBeInTheDocument();
    });

    test('renders all predefined query buttons', () => {
        render(<PredefinedQueries onSelect={mockOnSelect} />);

        expect(screen.getByRole('button', { name: /SELECT \* FROM Employees;/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /SELECT ProductName, Price FROM Products WHERE Price = 50;/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /SELECT OrderID, CustomerName, OrderDate FROM Orders LIMIT 5;/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /SELECT \* FROM Large_Data_Table;/i })).toBeInTheDocument();
    });

    test('calls onSelect with "employees" when "SELECT * FROM Employees;" button is clicked', async () => {
        render(<PredefinedQueries onSelect={mockOnSelect} />);

        const employeesButton = screen.getByRole('button', { name: /SELECT \* FROM Employees;/i });
        fireEvent.click(employeesButton);

        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnSelect).toHaveBeenCalledWith('employees');
    });

    test('calls onSelect with "products" when "SELECT ProductName, Price FROM Products WHERE Price = 50;" button is clicked', () => {
        render(<PredefinedQueries onSelect={mockOnSelect} />);

        const productsButton = screen.getByRole('button', { name: /SELECT ProductName, Price FROM Products WHERE Price = 50;/i });
        fireEvent.click(productsButton);

        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnSelect).toHaveBeenCalledWith('products');
    });

    test('calls onSelect with "orders" when "SELECT OrderID, CustomerName, OrderDate FROM Orders LIMIT 5;" button is clicked', () => {
        render(<PredefinedQueries onSelect={mockOnSelect} />);

        const ordersButton = screen.getByRole('button', { name: /SELECT OrderID, CustomerName, OrderDate FROM Orders LIMIT 5;/i });
        fireEvent.click(ordersButton);

        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnSelect).toHaveBeenCalledWith('orders');
    });

    test('calls onSelect with "largeData" when "SELECT * FROM Large_Data_Table;" button is clicked', () => {
        render(<PredefinedQueries onSelect={mockOnSelect} />);

        const largeDataButton = screen.getByRole('button', { name: /SELECT \* FROM Large_Data_Table;/i });
        fireEvent.click(largeDataButton);

        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnSelect).toHaveBeenCalledWith('largeData');
    });

    test('does not call onSelect if no button is clicked', () => {
        render(<PredefinedQueries onSelect={mockOnSelect} />);
        expect(mockOnSelect).not.toHaveBeenCalled();
    });
});