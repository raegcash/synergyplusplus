/**
 * Custom hook for assets data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '../services/api/assets.api';
import { useAppDispatch } from '../store/hooks';
import { setAssets, setLoading, setError } from '../store/slices/products.slice';

export const useAssets = (params?: {
  productId?: string;
  partnerId?: string;
  assetType?: string;
  page?: number;
  limit?: number;
}) => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['assets', params],
    queryFn: async () => {
      try {
        dispatch(setLoading(true));
        const response = await assetsApi.getAssets(params);
        dispatch(setAssets(response.data));
        dispatch(setLoading(false));
        return response;
      } catch (error: any) {
        dispatch(setError(error.message || 'Failed to fetch assets'));
        dispatch(setLoading(false));
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useAsset = (assetId: string) => {
  return useQuery({
    queryKey: ['asset', assetId],
    queryFn: async () => {
      const response = await assetsApi.getAsset(assetId);
      return response.data;
    },
    enabled: !!assetId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAssetsByProduct = (productId: string) => {
  return useAssets({ productId });
};

