/**
 * Products API Service
 */

import { apiClient } from './client';
import type {
  Product,
  PaginatedResponse,
  ApiResponse,
  PaginationParams,
} from '../../types/api.types';

export const productsApi = {
  /**
   * Get all products
   */
  getProducts: async (params?: PaginationParams & { status?: string; productType?: string }) => {
    const response = await apiClient.get<Product[]>('/api/marketplace/products', {
      params,
    });
    // Backend returns plain array, so wrap it in expected format
    return {
      success: true,
      data: response.data,
      pagination: {
        page: 1,
        limit: response.data.length,
        total: response.data.length,
        totalPages: 1,
      }
    };
  },

  /**
   * Get product by ID
   */
  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/api/marketplace/products/${id}`);
    return response.data;
  },

  /**
   * Get active products
   */
  getActiveProducts: async (params?: PaginationParams) => {
    return productsApi.getProducts({ ...params, status: 'ACTIVE' });
  },

  /**
   * Get products by type
   */
  getProductsByType: async (productType: string, params?: PaginationParams) => {
    return productsApi.getProducts({ ...params, productType });
  },

  /**
   * Search products
   */
  searchProducts: async (query: string, params?: PaginationParams) => {
    const response = await apiClient.get<PaginatedResponse<Product>>('/api/marketplace/products/search', {
      params: { ...params, q: query },
    });
    return response.data;
  },
};

export default productsApi;


