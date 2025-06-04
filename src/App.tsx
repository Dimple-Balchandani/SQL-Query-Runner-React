import './App.css';
import { useQueryManager } from './hooks/useQueryManager.ts';
import QueryInputSection from './components/QueryInputSection';
import QueryResult from './components/QueryResult';
import QueryHistory from './components/QueryHistory';
import SavedQueries from './components/SavedQueries';
import SchemaViewer from './components/SchemaViewer';
import PredefinedQueries from './components/PredefinedQueries';

function App() {
  const {
    sqlQuery,
    setSqlQuery,
    queryResult,
    isLoading,
    queryHistory,
    savedQueries,
    editorRef,
    handleRunQuery,
    handleClear,
    handleHistorySelect,
    handleSaveQuery,
    handleLoadQuery,
    handleDeleteSavedQuery,
    handleSchemaItemSelect,
    handlePredefinedQuerySelect,
    schema,
  } = useQueryManager();

  return (
    <div className="container">
      <h1>SQL Query Runner</h1>
      <p className="description">
        This is a web application to simulate running SQL queries and displaying results. Enter a
        query or select one of the predefined queries to see a sample output. No actual database
        backend is connected.
      </p>

      <div className="main-content">
        <div className="left-panel">
          <PredefinedQueries onSelect={handlePredefinedQuerySelect} />
          <SchemaViewer schema={schema} onSelect={handleSchemaItemSelect} />
          <QueryHistory
            queryHistory={queryHistory}
            onSelect={handleHistorySelect}
            savedQueries={savedQueries}
            onSave={handleSaveQuery}
          />
          <SavedQueries
            currentQuery={sqlQuery}
            savedQueries={savedQueries}
            onSave={handleSaveQuery}
            onLoad={handleLoadQuery}
            onDelete={handleDeleteSavedQuery}
          />
        </div>
        <div className="right-panel">
          <QueryInputSection
            sqlQuery={sqlQuery}
            onQueryChange={setSqlQuery}
            onRunQuery={handleRunQuery}
            onClear={handleClear}
            isLoading={isLoading}
            editorRef={editorRef}
          />
          <QueryResult queryResult={queryResult} />
        </div>
      </div>
    </div>
  );
}

export default App;
