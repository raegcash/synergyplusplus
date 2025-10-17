import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/auth.slice';
import productsReducer from '../store/slices/products.slice';
import portfolioReducer from '../store/slices/portfolio.slice';
import uiReducer from '../store/slices/ui.slice';
import { lightTheme } from '../styles/theme';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: any;
  store?: any;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
        products: productsReducer,
        portfolio: portfolioReducer,
        ui: uiReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ThemeProvider theme={lightTheme}>
              {children}
            </ThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export * from '@testing-library/react';
export { renderWithProviders as render };

