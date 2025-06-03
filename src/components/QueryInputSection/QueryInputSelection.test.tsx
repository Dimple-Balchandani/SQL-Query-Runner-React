import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QueryInputSection from './index';

describe('QueryInputSection', () => {
  const mockOnQueryChange = vi.fn();
  const mockOnRunQuery = vi.fn();
  const mockOnClear = vi.fn();

  const mockEditorRef = React.createRef<HTMLTextAreaElement>();

  beforeEach(() => {
    mockOnQueryChange.mockClear();
    mockOnRunQuery.mockClear();
    mockOnClear.mockClear();
  });

  test('renders the section heading', () => {
    render(
      <QueryInputSection
        sqlQuery=""
        onQueryChange={mockOnQueryChange}
        onRunQuery={mockOnRunQuery}
        onClear={mockOnClear}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );
    expect(
      screen.getByRole('heading', { level: 2, name: /Enter your SQL Query/i })
    ).toBeInTheDocument();
  });

  test('renders the textarea with correct props and handles change', () => {
    const initialQuery = 'SELECT * FROM users;';
    render(
      <QueryInputSection
        sqlQuery={initialQuery}
        onQueryChange={mockOnQueryChange}
        onRunQuery={mockOnRunQuery}
        onClear={mockOnClear}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    const textarea = screen.getByPlaceholderText(/e.g., SELECT \* FROM Employees;/i);
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(initialQuery);
    expect(textarea).toBeEnabled();

    const newQuery = 'SELECT * FROM products;';
    fireEvent.change(textarea, { target: { value: newQuery } });
    expect(mockOnQueryChange).toHaveBeenCalledTimes(1);
    expect(mockOnQueryChange).toHaveBeenCalledWith(newQuery);
  });

  test('renders "Run Query" button and handles click when not loading', () => {
    render(
      <QueryInputSection
        sqlQuery="TEST QUERY"
        onQueryChange={mockOnQueryChange}
        onRunQuery={mockOnRunQuery}
        onClear={mockOnClear}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    const runButton = screen.getByRole('button', { name: /Run Query/i });
    expect(runButton).toBeInTheDocument();
    expect(runButton).toBeEnabled();

    fireEvent.click(runButton);
    expect(mockOnRunQuery).toHaveBeenCalledTimes(1);
  });

  test('renders "Clear" button and handles click when not loading', () => {
    render(
      <QueryInputSection
        sqlQuery="TEST QUERY"
        onQueryChange={mockOnQueryChange}
        onRunQuery={mockOnRunQuery}
        onClear={mockOnClear}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    const clearButton = screen.getByRole('button', { name: /Clear/i });
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).toBeEnabled();

    fireEvent.click(clearButton);
    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  test('disables elements and changes "Run Query" text when isLoading is true', () => {
    render(
      <QueryInputSection
        sqlQuery="SOME QUERY"
        onQueryChange={mockOnQueryChange}
        onRunQuery={mockOnRunQuery}
        onClear={mockOnClear}
        isLoading={true}
        editorRef={mockEditorRef}
      />
    );

    const textarea = screen.getByPlaceholderText(/e.g., SELECT \* FROM Employees;/i);
    const runButton = screen.getByRole('button', { name: /Running.../i });
    const clearButton = screen.getByRole('button', { name: /Clear/i });

    expect(textarea).toBeDisabled();
    expect(runButton).toBeInTheDocument();
    expect(runButton).toBeDisabled();
    expect(clearButton).toBeDisabled();

    fireEvent.click(runButton);
    fireEvent.click(clearButton);
    expect(mockOnRunQuery).not.toHaveBeenCalled();
    expect(mockOnClear).not.toHaveBeenCalled();
  });

  test('enables elements and resets "Run Query" text when isLoading is false', () => {
    const { rerender } = render(
      <QueryInputSection
        sqlQuery="SOME QUERY"
        onQueryChange={mockOnQueryChange}
        onRunQuery={mockOnRunQuery}
        onClear={mockOnClear}
        isLoading={true}
        editorRef={mockEditorRef}
      />
    );

    rerender(
      <QueryInputSection
        sqlQuery="SOME QUERY"
        onQueryChange={mockOnQueryChange}
        onRunQuery={mockOnRunQuery}
        onClear={mockOnClear}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    const textarea = screen.getByPlaceholderText(/e.g., SELECT \* FROM Employees;/i);
    const runButton = screen.getByRole('button', { name: /Run Query/i });
    const clearButton = screen.getByRole('button', { name: /Clear/i });

    expect(textarea).toBeEnabled();
    expect(runButton).toBeInTheDocument();
    expect(runButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
  });

  test('assigns editorRef to the textarea', () => {
    render(
      <QueryInputSection
        sqlQuery=""
        onQueryChange={mockOnQueryChange}
        onRunQuery={mockOnRunQuery}
        onClear={mockOnClear}
        isLoading={false}
        editorRef={mockEditorRef}
      />
    );

    const textarea = screen.getByPlaceholderText(/e.g., SELECT \* FROM Employees;/i);
    expect(mockEditorRef.current).toBe(textarea);
  });
});
