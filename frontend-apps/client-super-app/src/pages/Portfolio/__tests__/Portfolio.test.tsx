/**
 * Portfolio Component Tests
 * Tests for Portfolio page functionality
 * 
 * @module pages/Portfolio/__tests__/Portfolio.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../../test/testUtils';
import Portfolio from '../Portfolio';
import * as portfolioHooks from '../../../hooks/usePortfolio';

// Mock hooks
vi.mock('../../../hooks/usePortfolio');

describe('Portfolio Component', () => {

  const mockPortfolioData = {
    summary: {
      totalValue: 150000,
      totalInvested: 120000,
      totalGainLoss: 30000,
      totalGainLossPercent: 25,
    },
    holdings: [
      {
        assetId: '1',
        assetName: 'BDO Equity Fund',
        assetType: 'UITF',
        units: 1000,
        averagePrice: 100,
        currentPrice: 120,
        totalValue: 120000,
        gainLoss: 20000,
        gainLossPercent: 20,
      },
    ],
    performance: {
      daily: 5,
      weekly: 10,
      monthly: 15,
      yearly: 25,
    },
  };

  beforeEach(() => {
    vi.mocked(portfolioHooks.usePortfolioSummary).mockReturnValue({
      data: mockPortfolioData.summary,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(portfolioHooks.usePortfolioHoldings).mockReturnValue({
      data: mockPortfolioData.holdings,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(portfolioHooks.usePortfolioPerformance).mockReturnValue({
      data: mockPortfolioData.performance,
      isLoading: false,
      error: null,
    } as any);
  });

  it('should render portfolio page', () => {
    render(<Portfolio />);
    expect(screen.getByText('My Portfolio')).toBeInTheDocument();
  });

  it('should display total portfolio value', () => {
    render(<Portfolio />);
    expect(screen.getByText(/150,000/)).toBeInTheDocument();
  });

  it('should display total gain/loss', () => {
    render(<Portfolio />);
    expect(screen.getByText(/30,000/)).toBeInTheDocument();
    expect(screen.getByText(/25%/)).toBeInTheDocument();
  });

  it('should display holdings', () => {
    render(<Portfolio />);
    expect(screen.getByText('BDO Equity Fund')).toBeInTheDocument();
    expect(screen.getByText('UITF')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    vi.mocked(portfolioHooks.usePortfolioSummary).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<Portfolio />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
