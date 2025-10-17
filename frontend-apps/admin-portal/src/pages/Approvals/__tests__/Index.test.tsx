import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Approvals from '../Index';
import * as productsService from '../../../services/products';
import * as partnersService from '../../../services/partners';
import * as assetsService from '../../../services/assets';
import { NotificationProvider } from '../../../contexts/NotificationContext';

// Mock the services
vi.mock('../../../services/products');
vi.mock('../../../services/partners');
vi.mock('../../../services/assets');

// Mock the notification context
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
const mockShowWarning = vi.fn();

vi.mock('../../../contexts/NotificationContext', async () => {
  const actual = await vi.importActual('../../../contexts/NotificationContext');
  return {
    ...actual,
    useNotification: () => ({
      showSuccess: mockShowSuccess,
      showError: mockShowError,
      showWarning: mockShowWarning,
    }),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>{children}</NotificationProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Approvals Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Products Tab', () => {
    it('should display pending products', async () => {
      const mockProducts = [
        {
          id: '1',
          code: 'PROD001',
          name: 'Test Product',
          productType: 'INVESTMENT',
          status: 'PENDING_APPROVAL',
          minInvestment: 1000,
          maxInvestment: 100000,
          currency: 'PHP',
          createdAt: '2025-01-01T00:00:00Z',
          maintenanceMode: false,
          whitelistMode: false,
        },
      ];

      vi.spyOn(productsService, 'getProducts').mockResolvedValue(mockProducts);

      render(<Approvals />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('PROD001')).toBeInTheDocument();
      });
    });

    it('should approve a product successfully', async () => {
      const mockProducts = [
        {
          id: '1',
          code: 'PROD001',
          name: 'Test Product',
          productType: 'INVESTMENT',
          status: 'PENDING_APPROVAL',
          minInvestment: 1000,
          maxInvestment: 100000,
          currency: 'PHP',
          createdAt: '2025-01-01T00:00:00Z',
          maintenanceMode: false,
          whitelistMode: false,
        },
      ];

      const approvedProduct = {
        ...mockProducts[0],
        status: 'ACTIVE',
        approvedBy: 'admin@company.com',
        approvedAt: '2025-01-02T00:00:00Z',
      };

      vi.spyOn(productsService, 'getProducts').mockResolvedValue(mockProducts);
      vi.spyOn(productsService, 'approveProduct').mockResolvedValue(approvedProduct);

      render(<Approvals />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(productsService.approveProduct).toHaveBeenCalledWith('1', expect.any(String));
        expect(mockShowSuccess).toHaveBeenCalledWith('Product approved successfully!');
      });
    });

    it('should show error when approve fails', async () => {
      const mockProducts = [
        {
          id: '1',
          code: 'PROD001',
          name: 'Test Product',
          productType: 'INVESTMENT',
          status: 'PENDING_APPROVAL',
          minInvestment: 1000,
          maxInvestment: 100000,
          currency: 'PHP',
          createdAt: '2025-01-01T00:00:00Z',
          maintenanceMode: false,
          whitelistMode: false,
        },
      ];

      vi.spyOn(productsService, 'getProducts').mockResolvedValue(mockProducts);
      vi.spyOn(productsService, 'approveProduct').mockRejectedValue(
        new Error('API Error')
      );

      render(<Approvals />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith(
          'Failed to approve product. Please try again.'
        );
      });
    });

    it('should reject a product with reason', async () => {
      const mockProducts = [
        {
          id: '1',
          code: 'PROD001',
          name: 'Test Product',
          productType: 'INVESTMENT',
          status: 'PENDING_APPROVAL',
          minInvestment: 1000,
          maxInvestment: 100000,
          currency: 'PHP',
          createdAt: '2025-01-01T00:00:00Z',
          maintenanceMode: false,
          whitelistMode: false,
        },
      ];

      const rejectedProduct = {
        ...mockProducts[0],
        status: 'REJECTED',
        rejectedBy: 'admin@company.com',
        rejectedAt: '2025-01-02T00:00:00Z',
        rejectionReason: 'Does not meet requirements',
      };

      vi.spyOn(productsService, 'getProducts').mockResolvedValue(mockProducts);
      vi.spyOn(productsService, 'rejectProduct').mockResolvedValue(rejectedProduct);

      render(<Approvals />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      fireEvent.click(rejectButton);

      // Fill in rejection reason (would need to open dialog)
      // This is a simplified test - actual implementation would involve dialog interaction

      await waitFor(() => {
        expect(productsService.rejectProduct).toHaveBeenCalledWith(
          '1',
          expect.any(String),
          expect.any(String)
        );
      });
    });
  });

  describe('Partners Tab', () => {
    it('should display pending partners', async () => {
      const mockPartners = [
        {
          id: '1',
          code: 'PART001',
          name: 'Test Partner',
          type: 'INVESTMENT',
          status: 'PENDING',
          contactEmail: 'contact@partner.com',
          contactPhone: '+639123456789',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      vi.spyOn(partnersService, 'getPartners').mockResolvedValue(mockPartners);

      render(<Approvals />, { wrapper: createWrapper() });

      // Switch to Partners tab
      const partnersTab = screen.getByRole('tab', { name: /partners/i });
      fireEvent.click(partnersTab);

      await waitFor(() => {
        expect(screen.getByText('Test Partner')).toBeInTheDocument();
        expect(screen.getByText('PART001')).toBeInTheDocument();
      });
    });

    it('should approve a partner successfully', async () => {
      const mockPartners = [
        {
          id: '1',
          code: 'PART001',
          name: 'Test Partner',
          type: 'INVESTMENT',
          status: 'PENDING',
          contactEmail: 'contact@partner.com',
          contactPhone: '+639123456789',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      const approvedPartner = {
        ...mockPartners[0],
        status: 'ACTIVE',
        approvedBy: 'admin@company.com',
        approvedAt: '2025-01-02T00:00:00Z',
      };

      vi.spyOn(partnersService, 'getPartners').mockResolvedValue(mockPartners);
      vi.spyOn(partnersService, 'approvePartner').mockResolvedValue(approvedPartner);

      render(<Approvals />, { wrapper: createWrapper() });

      const partnersTab = screen.getByRole('tab', { name: /partners/i });
      fireEvent.click(partnersTab);

      await waitFor(() => {
        expect(screen.getByText('Test Partner')).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(partnersService.approvePartner).toHaveBeenCalledWith('1', expect.any(String));
        expect(mockShowSuccess).toHaveBeenCalledWith('Partner approved successfully!');
      });
    });
  });

  describe('Assets Tab', () => {
    it('should display pending assets', async () => {
      const mockAssets = [
        {
          id: '1',
          code: 'ASSET001',
          name: 'Test Asset',
          assetType: 'STOCK',
          status: 'PENDING_APPROVAL',
          currentValue: 100000,
          currency: 'PHP',
          riskLevel: 'MEDIUM',
          minInvestment: 1000,
          maxInvestment: 50000,
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      vi.spyOn(assetsService, 'getAssets').mockResolvedValue(mockAssets);

      render(<Approvals />, { wrapper: createWrapper() });

      // Switch to Assets tab
      const assetsTab = screen.getByRole('tab', { name: /assets/i });
      fireEvent.click(assetsTab);

      await waitFor(() => {
        expect(screen.getByText('Test Asset')).toBeInTheDocument();
        expect(screen.getByText('ASSET001')).toBeInTheDocument();
      });
    });

    it('should approve an asset successfully', async () => {
      const mockAssets = [
        {
          id: '1',
          code: 'ASSET001',
          name: 'Test Asset',
          assetType: 'STOCK',
          status: 'PENDING_APPROVAL',
          currentValue: 100000,
          currency: 'PHP',
          riskLevel: 'MEDIUM',
          minInvestment: 1000,
          maxInvestment: 50000,
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      const approvedAsset = {
        ...mockAssets[0],
        status: 'ACTIVE',
        approvedBy: 'admin@company.com',
        approvedAt: '2025-01-02T00:00:00Z',
      };

      vi.spyOn(assetsService, 'getAssets').mockResolvedValue(mockAssets);
      vi.spyOn(assetsService, 'approveAsset').mockResolvedValue(approvedAsset);

      render(<Approvals />, { wrapper: createWrapper() });

      const assetsTab = screen.getByRole('tab', { name: /assets/i });
      fireEvent.click(assetsTab);

      await waitFor(() => {
        expect(screen.getByText('Test Asset')).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(assetsService.approveAsset).toHaveBeenCalledWith('1', expect.any(String));
        expect(mockShowSuccess).toHaveBeenCalledWith('Asset approved successfully!');
      });
    });
  });

  describe('Empty States', () => {
    it('should display empty state when no products pending', async () => {
      vi.spyOn(productsService, 'getProducts').mockResolvedValue([]);

      render(<Approvals />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/no pending approvals/i)).toBeInTheDocument();
      });
    });

    it('should display empty state when no partners pending', async () => {
      vi.spyOn(partnersService, 'getPartners').mockResolvedValue([]);

      render(<Approvals />, { wrapper: createWrapper() });

      const partnersTab = screen.getByRole('tab', { name: /partners/i });
      fireEvent.click(partnersTab);

      await waitFor(() => {
        expect(screen.getByText(/no pending approvals/i)).toBeInTheDocument();
      });
    });

    it('should display empty state when no assets pending', async () => {
      vi.spyOn(assetsService, 'getAssets').mockResolvedValue([]);

      render(<Approvals />, { wrapper: createWrapper() });

      const assetsTab = screen.getByRole('tab', { name: /assets/i });
      fireEvent.click(assetsTab);

      await waitFor(() => {
        expect(screen.getByText(/no pending approvals/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error when products fetch fails', async () => {
      vi.spyOn(productsService, 'getProducts').mockRejectedValue(
        new Error('Network Error')
      );

      render(<Approvals />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error loading/i)).toBeInTheDocument();
      });
    });

    it('should display error when partners fetch fails', async () => {
      vi.spyOn(partnersService, 'getPartners').mockRejectedValue(
        new Error('Network Error')
      );

      render(<Approvals />, { wrapper: createWrapper() });

      const partnersTab = screen.getByRole('tab', { name: /partners/i });
      fireEvent.click(partnersTab);

      await waitFor(() => {
        expect(screen.getByText(/error loading/i)).toBeInTheDocument();
      });
    });

    it('should display error when assets fetch fails', async () => {
      vi.spyOn(assetsService, 'getAssets').mockRejectedValue(
        new Error('Network Error')
      );

      render(<Approvals />, { wrapper: createWrapper() });

      const assetsTab = screen.getByRole('tab', { name: /assets/i });
      fireEvent.click(assetsTab);

      await waitFor(() => {
        expect(screen.getByText(/error loading/i)).toBeInTheDocument();
      });
    });
  });
});

