import { dummyData } from './constants';
import { QueryData, QueryResultState } from './types';

export const generateLargeDataset = (numRows: number): QueryData => {
  const headers = ['ID', 'Name', 'Value', 'Description', 'Timestamp'];
  const rows: string[][] = [];
  for (let i = 0; i < numRows; i++) {
    rows.push([
      `ITEM-${String(i + 1).padStart(5, '0')}`,
      `Product ${i + 1}`,
      (Math.random() * 1000).toFixed(2),
      `Description for item ${i + 1} - a very long text to test rendering efficiency.`,
      new Date(Date.now() - Math.random() * 10000000000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' '),
    ]);
  }
  return { headers, rows };
};

export const getDataForQuery = (query: string) => {
  let resultData: QueryData | QueryResultState | null = null;
  if (query.toLowerCase().includes('from employees')) {
    resultData = dummyData.employees;
  } else if (query.toLowerCase().includes('from products')) {
    resultData = dummyData.products;
  } else if (query.toLowerCase().includes('from orders')) {
    resultData = dummyData.orders;
  } else if (query.toLowerCase().includes('from large_data_table')) {
    resultData = generateLargeDataset(50000);
  } else {
    resultData = {
      headers: ['Status', 'Message'],
      rows: [['Success', 'Query executed. Displaying generic dummy data.']],
    };
  }
  return resultData;
};

export const getDataToDisplay = (queryId: string) => {
  let queryText = '';
  let dataToDisplay: QueryData | null = null;

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
  return { queryText, dataToDisplay };
};

export const escapeCsvField = (field: string | number | boolean | null | undefined): string => {
  const strField = String(field === null || field === undefined ? '' : field);
  if (
    strField.includes(',') ||
    strField.includes('"') ||
    strField.includes('\n') ||
    strField.includes('\r') ||
    strField.includes('\t')
  ) {
    const escapedField = strField.replace(/"/g, '""');
    return `"${escapedField}"`;
  }
  return strField;
};

export const exportAsCsv = (
  queryResult: QueryResultState | null | undefined,
  onFeedback?: (msg: string) => void
): void => {
  if (
    !queryResult ||
    queryResult.status !== 'success' ||
    !queryResult.headers ||
    !queryResult.rows
  ) {
    onFeedback?.('No tabular data to export as CSV!');
    return;
  }

  if (queryResult.headers.length === 0 && queryResult.rows.length === 0) {
    onFeedback?.('No data to export!');
    return;
  }

  try {
    const csvRows: string[] = [];

    csvRows.push(queryResult.headers.map(escapeCsvField).join(','));
    queryResult.rows.forEach((row) => {
      csvRows.push(row.map(escapeCsvField).join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `query_results_${timestamp}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onFeedback?.('CSV exported successfully!');
  } catch (error) {
    console.error('Failed to export CSV:', error);
    onFeedback?.('Failed to export CSV!');
  }
};

export const copyQueryResultsToClipboard = async (
  queryResult: QueryResultState | null | undefined,
  onFeedback?: (msg: string) => void
): Promise<void> => {
  if (
    !queryResult ||
    queryResult.status !== 'success' ||
    (!queryResult.rows && !queryResult.message)
  ) {
    onFeedback?.('No results to copy!');
    return;
  }

  let contentToCopy = '';
  if (queryResult.headers && queryResult.rows && queryResult.rows.length > 0) {
    const headerRow = queryResult.headers.map(escapeCsvField).join('\t');
    const dataRows = queryResult.rows.map((row) => row.map(escapeCsvField).join('\t')).join('\n');
    contentToCopy = `${headerRow}\n${dataRows}`;
  } else if (queryResult.message) {
    contentToCopy = queryResult.message;
  } else {
    onFeedback?.('No structured data or message to copy.');
    return;
  }

  try {
    await navigator.clipboard.writeText(contentToCopy);
    onFeedback?.('Copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy results: ', err);
    onFeedback?.('Failed to copy!');
  }
};
