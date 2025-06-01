import React from 'react';
import './PredefinedQueries.css';

interface PredefinedQueriesProps {
    onSelect: (queryId: string) => void;
}

const PredefinedQueries: React.FC<PredefinedQueriesProps> = ({ onSelect }) => {
    return (
        <section className="predefined-queries">
            <h2>Predefined Queries</h2>
            <div className="query-buttons">
                <button onClick={() => onSelect('employees')}>SELECT * FROM Employees;</button>
                <button onClick={() => onSelect('products')}>SELECT ProductName, Price FROM Products WHERE Price = 50;</button>
                <button onClick={() => onSelect('orders')}>SELECT OrderID, CustomerName, OrderDate FROM Orders LIMIT 5;</button>
                <button onClick={() => onSelect('largeData')}>SELECT * FROM Large_Data_Table;</button>
            </div>
        </section>
    );
};

export default PredefinedQueries;