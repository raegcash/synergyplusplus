/**
 * Portfolio Hooks - Enterprise Grade
 * React hooks for portfolio data fetching
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApi } from '../services/api/portfolio.api';

/**
 * Fetch portfolio summary
 * Includes total invested, current value, returns, allocation
 */
export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: () => portfolioApi.getPortfolioSummary(),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch portfolio holdings
 * @param options - Query options (assetType, sortBy, sortOrder)
 */
export function usePortfolioHoldings(options?: {
  assetType?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useQuery({
    queryKey: ['portfolio', 'holdings', options],
    queryFn: () => portfolioApi.getPortfolioHoldings(options),
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch portfolio performance
 * @param period - Time period (7d, 30d, 90d, 1y, all)
 */
export function usePortfolioPerformance(period: string = '30d') {
  return useQuery({
    queryKey: ['portfolio', 'performance', period],
    queryFn: () => portfolioApi.getPortfolioPerformance(period),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch specific asset holding details
 * @param assetId - Asset ID
 */
export function useAssetHolding(assetId: string) {
  return useQuery({
    queryKey: ['portfolio', 'holdings', assetId],
    queryFn: () => portfolioApi.getAssetHolding(assetId),
    enabled: !!assetId,
    staleTime: 30000,
  });
}

/**
 * Refresh portfolio data
 * Utility hook to refresh all portfolio queries
 */
export function useRefreshPortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}
