/**
 * Portfolio Redux Slice
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PortfolioSummary, PortfolioHolding } from '../../types/api.types';

interface PortfolioState {
  summary: PortfolioSummary | null;
  holdings: PortfolioHolding[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  summary: null,
  holdings: [],
  isLoading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolioSummary: (state, action: PayloadAction<PortfolioSummary>) => {
      state.summary = action.payload;
    },
    setHoldings: (state, action: PayloadAction<PortfolioHolding[]>) => {
      state.holdings = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearPortfolio: (state) => {
      state.summary = null;
      state.holdings = [];
      state.error = null;
    },
  },
});

export const { setPortfolioSummary, setHoldings, setLoading, setError, clearPortfolio } =
  portfolioSlice.actions;

export default portfolioSlice.reducer;

