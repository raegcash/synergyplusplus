/**
 * Assets API Service
 */

import { apiClient } from './client';
import type { Asset, PaginatedResponse, ApiResponse, PaginationParams } from '../../types/api.types';

export const assetsApi = {
  /**
   * Get all assets
   */
  getAssets: async (
    params?: PaginationParams & { productId?: string; partnerId?: string; assetType?: string }
  ) => {
    const response = await apiClient.get<PaginatedResponse<Asset>>('/api/v1/assets', {
      params,
    });
    return response.data;
  },

  /**
   * Get asset by ID
   */
  getAsset: async (id: string): Promise<ApiResponse<Asset>> => {
    const response = await apiClient.get<ApiResponse<Asset>>(`/api/v1/assets/${id}`);
    return response.data;
  },

  /**
   * Get assets by product
   */
  getAssetsByProduct: async (productId: string, params?: PaginationParams) => {
    return assetsApi.getAssets({ ...params, productId });
  },

  /**
   * Get assets by partner
   */
  getAssetsByPartner: async (partnerId: string, params?: PaginationParams) => {
    return assetsApi.getAssets({ ...params, partnerId });
  },

  /**
   * Get asset price history
   */
  getAssetPriceHistory: async (
    assetId: string,
    params?: { startDate?: string; endDate?: string }
  ) => {
    const response = await apiClient.get(`/api/v1/assets/${assetId}/price-history`, {
      params,
    });
    return response.data;
  },

  /**
   * Search assets
   */
  searchAssets: async (query: string, params?: PaginationParams) => {
    const response = await apiClient.get<PaginatedResponse<Asset>>('/api/v1/assets/search', {
      params: { ...params, q: query },
    });
    return response.data;
  },
};

export default assetsApi;

