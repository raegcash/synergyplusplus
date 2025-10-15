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
    const response = await apiClient.get<PaginatedResponse<Product>>('/api/v1/products', {
      params,
    });
    return response.data;
  },

  /**
   * Get product by ID
   */
  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/api/v1/products/${id}`);
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
    const response = await apiClient.get<PaginatedResponse<Product>>('/api/v1/products/search', {
      params: { ...params, q: query },
    });
    return response.data;
  },
};

export default productsApi;

