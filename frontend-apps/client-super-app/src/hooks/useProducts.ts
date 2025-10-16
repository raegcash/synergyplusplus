/**
 * Custom hook for products data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../services/api/products.api';
import { useAppDispatch } from '../store/hooks';
import { setProducts, setLoading, setError } from '../store/slices/products.slice';

export const useProducts = (params?: {
  status?: string;
  productType?: string;
  page?: number;
  limit?: number;
}) => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      try {
        dispatch(setLoading(true));
        const response = await productsApi.getProducts(params);
        dispatch(setProducts(response.data));
        dispatch(setLoading(false));
        return response;
      } catch (error: any) {
        dispatch(setError(error.message || 'Failed to fetch products'));
        dispatch(setLoading(false));
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await productsApi.getProduct(productId);
      return response.data;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useActiveProducts = () => {
  return useProducts({ status: 'ACTIVE' });
};


