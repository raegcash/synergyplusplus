import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/testUtils';
import Portfolio from '../Portfolio';

// Mock hooks
vi.mock('../../../hooks/usePortfolio', () => ({
  usePortfolioSummary: vi.fn(() => ({
    data: {
      data: {
        totalPortfolioValue: 100000,
        totalInvestments: 95000,
        totalReturns: 5000,
        returnPercentage: 5.26,
      },
    },
    isLoading: false,
    error: null,
  })),
  usePortfolioHoldings: vi.fn(() => ({
    data: {
      data: [],
    },
    isLoading: false,
    error: null,
  })),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Portfolio', () => {
  it('renders portfolio page', () => {
    renderWithProviders(<Portfolio />);

    expect(screen.getByText('My Portfolio')).toBeInTheDocument();
    expect(screen.getByText(/Track your investments/i)).toBeInTheDocument();
  });

  it('displays portfolio summary cards', async () => {
    renderWithProviders(<Portfolio />);

    await waitFor(() => {
      expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();
      expect(screen.getByText('Total Investments')).toBeInTheDocument();
      expect(screen.getByText('Total Returns')).toBeInTheDocument();
    });
  });

  it('shows portfolio values', async () => {
    renderWithProviders(<Portfolio />);

    await waitFor(() => {
      expect(screen.getByText('₱100,000.00')).toBeInTheDocument();
      expect(screen.getByText('₱95,000.00')).toBeInTheDocument();
      expect(screen.getByText('₱5,000.00')).toBeInTheDocument();
    });
  });

  it('displays empty state when no holdings', async () => {
    renderWithProviders(<Portfolio />);

    await waitFor(() => {
      expect(screen.getByText('No Holdings Yet')).toBeInTheDocument();
    });
  });

  it('has refresh button', () => {
    renderWithProviders(<Portfolio />);

    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    expect(refreshButton).toBeInTheDocument();
  });
});

