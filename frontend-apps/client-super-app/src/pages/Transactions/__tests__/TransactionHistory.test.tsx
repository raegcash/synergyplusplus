/**
 * Transaction History Component Tests
 * Tests for Transaction History page functionality
 * 
 * @module pages/Transactions/__tests__/TransactionHistory.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../../test/testUtils';
import TransactionHistory from '../TransactionHistory';
import * as transactionHooks from '../../../hooks/useTransactions';

// Mock hooks
vi.mock('../../../hooks/useTransactions');

describe('TransactionHistory Component', () => {

  const mockTransactions = {
    transactions: [
      {
        id: '1',
        transactionDate: '2024-01-01T00:00:00Z',
        transactionType: 'INVESTMENT',
        description: 'Investment in BDO Equity Fund',
        amount: 10000,
        units: 100,
        status: 'COMPLETED',
        referenceNumber: 'TXN001',
      },
      {
        id: '2',
        transactionDate: '2024-01-02T00:00:00Z',
        transactionType: 'DIVIDEND',
        description: 'Dividend payment',
        amount: 500,
        units: 0,
        status: 'COMPLETED',
        referenceNumber: 'TXN002',
      },
    ],
    totalCount: 2,
  };

  beforeEach(() => {
    vi.mocked(transactionHooks.useTransactions).mockReturnValue({
      data: mockTransactions,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(transactionHooks.useTransactionStatistics).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(transactionHooks.useExportTransactions).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: false,
    } as any);
  });

  it('should render transaction history page', () => {
    render(<TransactionHistory />);
    expect(screen.getByText('Transaction History')).toBeInTheDocument();
  });

  it('should display transactions', () => {
    render(<TransactionHistory />);
    expect(screen.getByText('Investment in BDO Equity Fund')).toBeInTheDocument();
    expect(screen.getByText('Dividend payment')).toBeInTheDocument();
  });

  it('should display transaction amounts', () => {
    render(<TransactionHistory />);
    expect(screen.getByText(/10,000/)).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('should have filter dropdowns', () => {
    render(<TransactionHistory />);
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('should have refresh button', () => {
    render(<TransactionHistory />);
    const refreshButton = screen.getByText('Refresh');
    expect(refreshButton).toBeInTheDocument();
  });

  it('should show loading state', () => {
    vi.mocked(transactionHooks.useTransactions).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionHistory />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show error state', () => {
    vi.mocked(transactionHooks.useTransactions).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
      refetch: vi.fn(),
    } as any);

    render(<TransactionHistory />);
    expect(screen.getByText(/Failed to load transactions/i)).toBeInTheDocument();
  });

  it('should show empty state', () => {
    vi.mocked(transactionHooks.useTransactions).mockReturnValue({
      data: { transactions: [], totalCount: 0 },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<TransactionHistory />);
    expect(screen.getByText(/No transactions found/i)).toBeInTheDocument();
  });
});
