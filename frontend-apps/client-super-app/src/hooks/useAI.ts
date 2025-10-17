/**
 * AI Hooks
 * React Query hooks for AI recommendations and insights
 * 
 * @module hooks/useAI
 */

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import * as aiApi from '../services/api/ai.api';

/**
 * Hook to fetch AI recommendations
 */
export function useRecommendations(
  customerId?: string,
  limit?: number
): UseQueryResult<any[], Error> {
  return useQuery({
    queryKey: ['ai', 'recommendations', customerId, limit],
    queryFn: async () => {
      try {
        const response = await aiApi.getRecommendations(customerId, undefined, limit);
        return response.data || [];
      } catch (error: any) {
        console.warn('AI recommendations service unavailable:', error.message);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled, will return empty array on error
    retry: false, // Don't retry if service is unavailable
  });
}

/**
 * Hook to fetch AI insights
 */
export function useInsights(
  customerId?: string,
  limit?: number
): UseQueryResult<any[], Error> {
  return useQuery({
    queryKey: ['ai', 'insights', customerId, limit],
    queryFn: async () => {
      try {
        const response = await aiApi.getInsights(customerId, limit);
        return response.data || [];
      } catch (error: any) {
        console.warn('AI insights service unavailable:', error.message);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled, will return empty array on error
    retry: false, // Don't retry if service is unavailable
  });
}

/**
 * Hook to fetch profile analysis
 */
export function useProfileAnalysis(
  customerId?: string
): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['ai', 'profile-analysis', customerId],
    queryFn: async () => {
      try {
        const response = await aiApi.getProfileAnalysis(customerId);
        return response.data || null;
      } catch (error: any) {
        console.warn('AI profile analysis service unavailable:', error.message);
        return null;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: true,
    retry: false,
  });
}

/**
 * Hook to fetch trending assets
 */
export function useTrendingAssets(
  limit?: number
): UseQueryResult<any[], Error> {
  return useQuery({
    queryKey: ['ai', 'trending', limit],
    queryFn: async () => {
      try {
        const response = await aiApi.getTrendingAssets(limit);
        return response.data || [];
      } catch (error: any) {
        console.warn('AI trending assets service unavailable:', error.message);
        return [];
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: true,
    retry: false,
  });
}

/**
 * Hook to fetch market sentiment
 */
export function useMarketSentiment(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['ai', 'market-sentiment'],
    queryFn: async () => {
      try {
        const response = await aiApi.getMarketSentiment();
        return response.data || null;
      } catch (error: any) {
        console.warn('AI market sentiment service unavailable:', error.message);
        return null;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: true,
    retry: false,
  });
}

export default {
  useRecommendations,
  useInsights,
  useProfileAnalysis,
  useTrendingAssets,
  useMarketSentiment,
};
