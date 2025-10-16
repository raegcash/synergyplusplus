import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/testUtils';
import TransactionHistory from '../TransactionHistory';

// Mock react-query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tantml:query/react-query');
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: {
        data: [],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })),
  };
});

describe('TransactionHistory', () => {
  it('renders transaction history page', () => {
    renderWithProviders(<TransactionHistory />);

    expect(screen.getByText('Transaction History')).toBeInTheDocument();
    expect(screen.getByText(/View all your past transactions/i)).toBeInTheDocument();
  });

  it('displays filter dropdowns', () => {
    renderWithProviders(<TransactionHistory />);

    expect(screen.getByLabelText('Transaction Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('has export and refresh buttons', () => {
    renderWithProviders(<TransactionHistory />);

    expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Refresh/i })).toBeInTheDocument();
  });

  it('shows empty state when no transactions', async () => {
    renderWithProviders(<TransactionHistory />);

    await waitFor(() => {
      expect(screen.getByText('No Transactions Yet')).toBeInTheDocument();
      expect(screen.getByText(/Your transaction history will appear here/i)).toBeInTheDocument();
    });
  });
});

