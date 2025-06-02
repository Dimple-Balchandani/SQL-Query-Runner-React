import { QueryData, SchemaTable } from './types';

export const HISTORY_MAX_SIZE = 10;
export const LOCAL_STORAGE_KEY = 'sqlQueryHistory';
export const LOCAL_STORAGE_SAVED_QUERIES_KEY = 'sqlSavedQueries';
export const LOCAL_STORAGE_HISTORY_KEY = 'sqlQueryHistory';
export const ROW_HEIGHT = 38;
export const MIN_COLUMN_WIDTH = 100;

export const dummyData: { [key: string]: QueryData } = {
    employees: {
        headers: ['EmployeeID', 'FirstName', 'LastName', 'Department', 'Salary'],
        rows: [
            ['E001', 'Alice', 'Smith', 'HR', '70000'],
            ['E002', 'Bob', 'Johnson', 'IT', '85000'],
            ['E003', 'Charlie', 'Brown', 'Finance', '72000'],
            ['E004', 'Diana', 'Miller', 'IT', '90000'],
            ['E005', 'Eve', 'Davis', 'HR', '68000']
        ]
    },
    products: {
        headers: ['ProductID', 'ProductName', 'Category', 'Price', 'Stock'],
        rows: [
            ['P001', 'Laptop Pro', 'Electronics', '1200', '50'],
            ['P002', 'Mechanical Keyboard', 'Peripherals', '80', '150'],
            ['P003', 'Gaming Mouse', 'Peripherals', '65', '200'],
            ['P004', '4K Monitor', 'Electronics', '450', '30'],
            ['P005', 'External SSD 1TB', 'Storage', '95', '100']
        ]
    },
    orders: {
        headers: ['OrderID', 'CustomerName', 'OrderDate', 'TotalAmount'],
        rows: [
            ['ORD001', 'John Doe', '2023-01-15', '250.75'],
            ['ORD002', 'Jane Smith', '2023-01-16', '120.00'],
            ['ORD003', 'Peter Jones', '2023-01-17', '500.50'],
            ['ORD004', 'Alice Brown', '2023-01-18', '75.20'],
            ['ORD005', 'Robert White', '2023-01-19', '300.00']
        ]
    }
};

export const dummySchema: SchemaTable[] = [
    {
        name: 'Employees',
        columns: [
            { name: 'EmployeeID', type: 'VARCHAR' },
            { name: 'FirstName', type: 'VARCHAR' },
            { name: 'LastName', type: 'VARCHAR' },
            { name: 'Department', type: 'VARCHAR' },
            { name: 'Salary', type: 'NUMERIC' },
        ]
    },
    {
        name: 'Products',
        columns: [
            { name: 'ProductID', type: 'VARCHAR' },
            { name: 'ProductName', type: 'VARCHAR' },
            { name: 'Category', type: 'VARCHAR' },
            { name: 'Price', type: 'NUMERIC' },
            { name: 'Stock', type: 'INTEGER' },
        ]
    },
    {
        name: 'Orders',
        columns: [
            { name: 'OrderID', type: 'VARCHAR' },
            { name: 'CustomerName', type: 'VARCHAR' },
            { name: 'OrderDate', type: 'DATE' },
            { name: 'TotalAmount', type: 'NUMERIC' },
        ]
    },
    {
        name: 'Large_Data_Table',
        columns: [
            { name: 'ID', type: 'VARCHAR' },
            { name: 'Name', type: 'VARCHAR' },
            { name: 'Value', type: 'NUMERIC' },
            { name: 'Description', type: 'TEXT' },
            { name: 'Timestamp', type: 'DATETIME' },
        ]
    }
];