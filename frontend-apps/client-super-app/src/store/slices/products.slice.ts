/**
 * Products Redux Slice
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product, Asset, Partner } from '../../types/api.types';

interface ProductsState {
  products: Product[];
  assets: Asset[];
  partners: Partner[];
  selectedProduct: Product | null;
  selectedAsset: Asset | null;
  filters: {
    productType: string;
    partnerId: string;
    search: string;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  assets: [],
  partners: [],
  selectedProduct: null,
  selectedAsset: null,
  filters: {
    productType: '',
    partnerId: '',
    search: '',
  },
  isLoading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setAssets: (state, action: PayloadAction<Asset[]>) => {
      state.assets = action.payload;
    },
    setPartners: (state, action: PayloadAction<Partner[]>) => {
      state.partners = action.payload;
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setSelectedAsset: (state, action: PayloadAction<Asset | null>) => {
      state.selectedAsset = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<{ productType?: string; partnerId?: string; search?: string }>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProducts,
  setAssets,
  setPartners,
  setSelectedProduct,
  setSelectedAsset,
  setFilters,
  clearFilters,
  setLoading,
  setError,
} = productsSlice.actions;

export default productsSlice.reducer;

