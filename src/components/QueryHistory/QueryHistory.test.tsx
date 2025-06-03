import { render, screen } from '@testing-library/react';
import QueryHistory from './index';

describe('QueryHistory', () => {
  const mockOnSelect = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  test('renders the section heading', () => {
    render(
      <QueryHistory
        queryHistory={[]}
        onSelect={mockOnSelect}
        savedQueries={[]}
        onSave={mockOnSave}
      />
    );
    expect(screen.getByRole('heading', { level: 2, name: /Query History/i })).toBeInTheDocument();
  });

  test('displays "No queries run yet." message when queryHistory is empty', () => {
    render(
      <QueryHistory
        queryHistory={[]}
        onSelect={mockOnSelect}
        savedQueries={[]}
        onSave={mockOnSave}
      />
    );
    expect(screen.getByText(/No queries run yet\./i)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  test('does not call onSelect when no queryHistory item is clicked', () => {
    render(
      <QueryHistory
        queryHistory={[]}
        onSelect={mockOnSelect}
        savedQueries={[]}
        onSave={mockOnSave}
      />
    );
    expect(mockOnSelect).not.toHaveBeenCalled();
  });
});
