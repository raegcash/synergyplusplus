/**
 * Dashboard Component Tests
 * Tests for Dashboard page functionality
 * 
 * @module pages/Dashboard/__tests__/Dashboard.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../../test/testUtils';
import Dashboard from '../Dashboard';
import * as dashboardHooks from '../../../hooks/useDashboard';

// Mock hooks
vi.mock('../../../hooks/useDashboard');

describe('Dashboard Component', () => {

  const mockDashboard = {
    summary: {
      totalPortfolioValue: 150000,
      todaysGainLoss: 5000,
      todaysGainLossPercent: 3.45,
      totalInvested: 120000,
      availableCash: 30000,
    },
    assetAllocation: [
      { assetType: 'UITF', value: 80000 },
      { assetType: 'STOCK', value: 50000 },
      { assetType: 'CRYPTO', value: 20000 },
    ],
    recentTransactions: [
      {
        id: '1',
        transactionDate: '2024-01-01T00:00:00Z',
        transactionType: 'INVESTMENT',
        description: 'Investment in BDO Fund',
        amount: 10000,
        status: 'COMPLETED',
      },
    ],
    performanceHistory: [
      { date: '2024-01-01', value: 145000 },
      { date: '2024-01-02', value: 150000 },
    ],
  };

  beforeEach(() => {
    vi.mocked(dashboardHooks.useDashboardSummary).mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.mocked(dashboardHooks.useRefreshDashboard).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: false,
    } as any);
  });

  it('should render dashboard page', () => {
    render(<Dashboard />, {
      preloadedState: {
        auth: {
          user: { firstName: 'John', email: 'john@example.com' },
          token: 'test-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText(/Welcome back, John!/i)).toBeInTheDocument();
  });

  it('should display total portfolio value', () => {
    render(<Dashboard />, {
      preloadedState: {
        auth: {
          user: { firstName: 'John', email: 'john@example.com' },
          token: 'test-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText(/150,000/)).toBeInTheDocument();
  });

  it('should display today\'s gain/loss', () => {
    render(<Dashboard />, {
      preloadedState: {
        auth: {
          user: { firstName: 'John', email: 'john@example.com' },
          token: 'test-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText(/5,000/)).toBeInTheDocument();
    expect(screen.getByText(/3.45%/)).toBeInTheDocument();
  });

  it('should display quick actions', () => {
    render(<Dashboard />, {
      preloadedState: {
        auth: {
          user: { firstName: 'John', email: 'john@example.com' },
          token: 'test-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText('Buy Assets')).toBeInTheDocument();
    expect(screen.getByText('Sell Assets')).toBeInTheDocument();
    expect(screen.getByText('View Transactions')).toBeInTheDocument();
  });

  it('should display asset allocation', () => {
    render(<Dashboard />, {
      preloadedState: {
        auth: {
          user: { firstName: 'John', email: 'john@example.com' },
          token: 'test-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
  });

  it('should display recent activity', () => {
    render(<Dashboard />, {
      preloadedState: {
        auth: {
          user: { firstName: 'John', email: 'john@example.com' },
          token: 'test-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Investment in BDO Fund')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    vi.mocked(dashboardHooks.useDashboardSummary).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<Dashboard />, {
      preloadedState: {
        auth: {
          user: { firstName: 'John', email: 'john@example.com' },
          token: 'test-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show error state', () => {
    vi.mocked(dashboardHooks.useDashboardSummary).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
      refetch: vi.fn(),
    } as any);

    render(<Dashboard />, {
      preloadedState: {
        auth: {
          user: { firstName: 'John', email: 'john@example.com' },
          token: 'test-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText(/Failed to load dashboard data/i)).toBeInTheDocument();
  });
});
