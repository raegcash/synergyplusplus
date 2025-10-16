import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/testUtils';
import Marketplace from '../Marketplace';

// Mock hooks
vi.mock('../../../hooks/useProducts', () => ({
  useProducts: vi.fn(() => ({
    data: {
      data: [
        {
          id: '1',
          name: 'BDO Equity Fund',
          productType: 'INVESTMENT',
          status: 'ACTIVE',
          minInvestment: 10000,
          assetsCount: 3,
        },
      ],
    },
    isLoading: false,
    error: null,
  })),
}));

vi.mock('../../../hooks/useAssets', () => ({
  useAssets: vi.fn(() => ({
    data: {
      data: [
        {
          id: '1',
          name: 'Bitcoin',
          symbol: 'BTC',
          assetType: 'CRYPTO',
          currentPrice: 3750000,
          status: 'ACTIVE',
        },
      ],
    },
    isLoading: false,
    error: null,
  })),
}));

describe('Marketplace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders marketplace page with tabs', () => {
    renderWithProviders(<Marketplace />);

    expect(screen.getByText('Product Marketplace')).toBeInTheDocument();
    expect(screen.getByText(/Explore investment opportunities/i)).toBeInTheDocument();
    expect(screen.getByText('All Products')).toBeInTheDocument();
    expect(screen.getByText('All Assets')).toBeInTheDocument();
  });

  it('displays search input', () => {
    renderWithProviders(<Marketplace />);

    const searchInput = screen.getByPlaceholderText(/Search products or assets/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('filters products based on search query', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Marketplace />);

    const searchInput = screen.getByPlaceholderText(/Search products or assets/i);
    await user.type(searchInput, 'BDO');

    await waitFor(() => {
      expect(screen.getByText('BDO Equity Fund')).toBeInTheDocument();
    });
  });

  it('displays product type filter', () => {
    renderWithProviders(<Marketplace />);

    expect(screen.getByLabelText('Product Type')).toBeInTheDocument();
  });

  it('renders products and assets', async () => {
    renderWithProviders(<Marketplace />);

    await waitFor(() => {
      expect(screen.getByText('BDO Equity Fund')).toBeInTheDocument();
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    });
  });

  it('switches between tabs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Marketplace />);

    const assetsTab = screen.getByText('All Assets');
    await user.click(assetsTab);

    await waitFor(() => {
      expect(assetsTab.closest('button')).toHaveAttribute('aria-selected', 'true');
    });
  });
});

