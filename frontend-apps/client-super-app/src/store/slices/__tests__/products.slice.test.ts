import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import productsReducer, {
  setProducts,
  setFilters,
  clearFilters,
} from '../products.slice';
import type { Product } from '../../../types/api.types';

describe('Products Slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        products: productsReducer,
      },
    });
  });

  it('should have correct initial state', () => {
    const state = store.getState().products;
    expect(state.products).toEqual([]);
    expect(state.assets).toEqual([]);
    expect(state.filters).toEqual({
      productType: '',
      partnerId: '',
      search: '',
    });
  });

  it('should set products', () => {
    const mockProducts: Product[] = [
      {
        id: '1',
        code: 'PROD1',
        name: 'Test Product',
        productType: 'UITF',
        status: 'ACTIVE',
        minInvestment: 1000,
        maxInvestment: 10000,
        currency: 'PHP',
        maintenanceMode: false,
        whitelistMode: false,
        featuresCount: 0,
        enabledFeaturesCount: 0,
        assetsCount: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];

    store.dispatch(setProducts(mockProducts));
    expect(store.getState().products.products).toEqual(mockProducts);
  });

  it('should set filters', () => {
    store.dispatch(setFilters({ productType: 'UITF', search: 'test' }));
    const state = store.getState().products;
    
    expect(state.filters.productType).toBe('UITF');
    expect(state.filters.search).toBe('test');
    expect(state.filters.partnerId).toBe(''); // unchanged
  });

  it('should clear filters', () => {
    // Set filters first
    store.dispatch(setFilters({ productType: 'UITF', search: 'test' }));
    
    // Clear filters
    store.dispatch(clearFilters());
    const state = store.getState().products;
    
    expect(state.filters).toEqual({
      productType: '',
      partnerId: '',
      search: '',
    });
  });
});

