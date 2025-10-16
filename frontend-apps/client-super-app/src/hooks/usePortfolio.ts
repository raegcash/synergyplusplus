/**
 * Custom hooks for portfolio data
 */

import { useQuery } from '@tanstack/react-query';
import { portfolioApi } from '../services/api/portfolio.api';
import { useAppDispatch } from '../store/hooks';
import {
  setPortfolioSummary,
  setHoldings,
  setLoading,
  setError,
} from '../store/slices/portfolio.slice';

export const usePortfolioSummary = () => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: async () => {
      try {
        dispatch(setLoading(true));
        const response = await portfolioApi.getSummary();
        dispatch(setPortfolioSummary(response.data));
        dispatch(setLoading(false));
        return response.data;
      } catch (error: any) {
        dispatch(setError(error.message || 'Failed to fetch portfolio summary'));
        dispatch(setLoading(false));
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes for real-time updates
  });
};

export const usePortfolioHoldings = () => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['portfolio', 'holdings'],
    queryFn: async () => {
      try {
        dispatch(setLoading(true));
        const response = await portfolioApi.getHoldings();
        dispatch(setHoldings(response.data));
        dispatch(setLoading(false));
        return response.data;
      } catch (error: any) {
        dispatch(setError(error.message || 'Failed to fetch holdings'));
        dispatch(setLoading(false));
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};

export const usePortfolioPerformance = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['portfolio', 'performance', params],
    queryFn: async () => {
      const response = await portfolioApi.getPerformance(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};


