import { dummyData } from './constants';
import { QueryData, QueryResultState } from './types';

export const generateLargeDataset = (numRows: number): QueryData => {
    const headers = ['ID', 'Name', 'Value', 'Description', 'Timestamp'];
    const rows : string[][] = [];
    for (let i = 0; i < numRows; i++) {
        rows.push([
            `ITEM-${String(i + 1).padStart(5, '0')}`,
            `Product ${i + 1}`,
            (Math.random() * 1000).toFixed(2),
            `Description for item ${i + 1} - a very long text to test rendering efficiency.`,
            new Date(Date.now() - Math.random() * 10000000000).toISOString().slice(0, 19).replace('T', ' ')
        ]);
    }
    return { headers, rows };
};

export const getDataFromQuery = (query: string) => {
    let resultData : QueryData | QueryResultState | null = null;
    if (query.toLowerCase().includes('from employees')) {
        resultData = dummyData.employees;
    } else if (query.toLowerCase().includes('from products')) {
        resultData = dummyData.products;
    } else if (query.toLowerCase().includes('from orders')) {
        resultData = dummyData.orders;
    } else if (query.toLowerCase().includes('from large_data_table')) {
        resultData = generateLargeDataset(50000);
    }
    else {
        resultData = {
            headers: ['Status', 'Message'],
            rows: [['Success', 'Query executed. Displaying generic dummy data.']]
        };
    }
    return resultData
}

export const getDataToDisplay = (queryId: string) => {
    let queryText = '';
    let dataToDisplay : QueryData | null = null;

    switch (queryId) {
        case 'employees':
            queryText = 'SELECT * FROM Employees;';
            dataToDisplay = dummyData.employees;
            break;
        case 'products':
            queryText = 'SELECT ProductName, Price FROM Products WHERE Price > 50;';
            dataToDisplay = dummyData.products;
            break;
        case 'orders':
            queryText = 'SELECT OrderID, CustomerName, OrderDate FROM Orders LIMIT 5;';
            dataToDisplay = dummyData.orders;
            break;
        case 'largeData':
            queryText = 'SELECT * FROM Large_Data_Table;';
            dataToDisplay = generateLargeDataset(50000);
            break;
        default:
            queryText = '';
            dataToDisplay = null;
    }
    return {queryText, dataToDisplay}
}
