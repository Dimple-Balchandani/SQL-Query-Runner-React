// src/components/SchemaViewer.tsx

import React, { useState } from 'react';
import { SchemaTable, SchemaColumn } from '../types';
import './SchemaViewer.css'; // New: Component-specific styles

interface SchemaViewerProps {
    schema: SchemaTable[];
    onSelect: (item: string) => void; // Callback when a table/column name is clicked
}

const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema, onSelect }) => {
    // State to manage which tables are expanded
    const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

    const toggleTableExpansion = (tableName: string) => {
        setExpandedTables(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tableName)) {
                newSet.delete(tableName);
            } else {
                newSet.add(tableName);
            }
            return newSet;
        });
    };

    return (
        <section className="schema-viewer-section">
            <h2>Schema Viewer</h2>
            <div className="schema-tree">
                {schema.length === 0 ? (
                    <p className="no-schema-message">No schema defined.</p>
                ) : (
                    <ul>
                        {schema.map(table => (
                            <li key={table.name} className="schema-table-item">
                                <button
                                    className="table-name-toggle"
                                    onClick={() => toggleTableExpansion(table.name)}
                                    title={`Click to ${expandedTables.has(table.name) ? 'collapse' : 'expand'} or insert table name`}
                                >
                                    <span className="toggle-icon">
                                        {expandedTables.has(table.name) ? '▼' : '►'}
                                    </span>
                                    <span onClick={(e) => { // Allow clicking table name to insert it
                                        e.stopPropagation(); // Prevent toggling when clicking text itself
                                        onSelect(table.name);
                                    }} className="table-name-text">
                                        {table.name}
                                    </span>
                                </button>
                                {expandedTables.has(table.name) && (
                                    <ul className="schema-columns-list">
                                        {table.columns.map(column => (
                                            <li key={column.name} className="schema-column-item">
                                                <button
                                                    onClick={() => onSelect(column.name)}
                                                    title={`Insert column name: ${column.name}`}
                                                >
                                                    <span className="column-name">{column.name}</span>
                                                    <span className="column-type">({column.type})</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};

export default SchemaViewer;