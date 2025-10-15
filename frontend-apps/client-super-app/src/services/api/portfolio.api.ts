/**
 * Portfolio API Service
 */

import { apiClient } from './client';
import type { ApiResponse, PortfolioSummary, PortfolioHolding } from '../../types/api.types';

export const portfolioApi = {
  /**
   * Get portfolio summary
   */
  getSummary: async (): Promise<ApiResponse<PortfolioSummary>> => {
    const response = await apiClient.get<ApiResponse<PortfolioSummary>>(
      '/api/v1/client/portfolio/summary'
    );
    return response.data;
  },

  /**
   * Get portfolio holdings
   */
  getHoldings: async (): Promise<ApiResponse<PortfolioHolding[]>> => {
    const response = await apiClient.get<ApiResponse<PortfolioHolding[]>>(
      '/api/v1/client/portfolio/holdings'
    );
    return response.data;
  },

  /**
   * Get holding by ID
   */
  getHolding: async (holdingId: string): Promise<ApiResponse<PortfolioHolding>> => {
    const response = await apiClient.get<ApiResponse<PortfolioHolding>>(
      `/api/v1/client/portfolio/holdings/${holdingId}`
    );
    return response.data;
  },

  /**
   * Get portfolio performance
   */
  getPerformance: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/api/v1/client/portfolio/performance', {
      params,
    });
    return response.data;
  },
};

export default portfolioApi;

