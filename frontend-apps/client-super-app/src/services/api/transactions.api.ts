/**
 * Transactions API Service
 */

import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse, Transaction } from '../../types/api.types';

export const transactionsApi = {
  /**
   * Get transaction history
   */
  getHistory: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<PaginatedResponse<Transaction>>(
      '/api/v1/transactions/history',
      { params }
    );
    return response.data;
  },

  /**
   * Get transaction by ID
   */
  getTransaction: async (transactionId: string): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.get<ApiResponse<Transaction>>(
      `/api/v1/transactions/${transactionId}`
    );
    return response.data;
  },

  /**
   * Create transaction (Buy/Subscribe)
   */
  createTransaction: async (data: {
    assetId: string;
    type: 'BUY' | 'SUBSCRIBE';
    amount: number;
    quantity?: number;
  }): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      '/api/v1/transactions',
      data
    );
    return response.data;
  },

  /**
   * Sell/Redeem transaction
   */
  sellOrRedeem: async (data: {
    holdingId: string;
    type: 'SELL' | 'REDEEM';
    quantity: number;
  }): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(
      '/api/v1/transactions/sell',
      data
    );
    return response.data;
  },

  /**
   * Cancel transaction
   */
  cancelTransaction: async (transactionId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `/api/v1/transactions/${transactionId}/cancel`
    );
    return response.data;
  },
};

export default transactionsApi;

