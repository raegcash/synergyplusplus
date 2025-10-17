/**
 * Investment Modal Component Tests
 * Enterprise-grade testing for investment modal UI
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvestmentModal from '../components/InvestmentModal';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = vi.fn();

describe('InvestmentModal Component', () => {
  const mockAsset = {
    id: 'asset-123',
    name: 'BDO Equity Fund',
    code: 'BDOEF',
    asset_type: 'UITF',
    price: 1.52,
    current_price: 1.52,
    risk_level: 'MEDIUM',
    min_investment: 1000
  };

  const mockCustomer = {
    id: 'customer-123',
    name: 'Test Customer',
    email: 'test@example.com'
  };

  const mockCustomerId = 'customer-123';
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
    
    // Mock localStorage for customer data
    const mockLocalStorage = {
      getItem: vi.fn((key) => {
        if (key === 'customer') return JSON.stringify(mockCustomer);
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
  });

  describe('Modal Rendering', () => {
    it('should render modal when open', () => {
      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      expect(screen.getByText(/Invest in BDO Equity Fund/i)).toBeInTheDocument();
    });

    it('should not render modal when closed', () => {
      render(
        <InvestmentModal
          open={false}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      // When modal is closed, the dialog content should not be visible
      expect(screen.queryByText(/Invest in BDO Equity Fund/i)).not.toBeInTheDocument();
    });

    it('should display asset details', () => {
      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      expect(screen.getAllByText(/BDO Equity Fund/)[0]).toBeInTheDocument();
      expect(screen.getByText(/BDOEF/)).toBeInTheDocument();
    });

    it('should display investment amount input', () => {
      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      expect(screen.getByLabelText(/Investment Amount/i)).toBeInTheDocument();
    });

    it('should display payment method selector', () => {
      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      expect(screen.getAllByText(/Payment Method/i)[0]).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for amount below minimum', async () => {
      const user = userEvent.setup();
      
      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      const amountInput = screen.getByLabelText(/Investment Amount/i);
      await user.type(amountInput, '500');

      const investButton = screen.getByRole('button', { name: /Invest Now/i });
      await user.click(investButton);

      await waitFor(() => {
        expect(screen.getByText(/Minimum investment/i)).toBeInTheDocument();
      });
    });

    it('should enable invest button when amount is valid', async () => {
      const user = userEvent.setup();
      
      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      const amountInput = screen.getByLabelText(/Investment Amount/i);
      await user.type(amountInput, '5000');

      const investButton = screen.getByRole('button', { name: /Invest Now/i });
      expect(investButton).toBeEnabled();
    });
  });

  describe('Fee Calculation', () => {
    it('should calculate fees correctly (0.5%)', async () => {
      const user = userEvent.setup();
      
      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      const amountInput = screen.getByLabelText(/Investment Amount/i);
      await user.type(amountInput, '10000');

      await waitFor(() => {
        expect(screen.getByText(/₱50\.00/)).toBeInTheDocument(); // 0.5% of 10000
      });
    });

    it('should apply minimum fee of ₱10', async () => {
      const user = userEvent.setup();
      
      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      const amountInput = screen.getByLabelText(/Investment Amount/i);
      await user.type(amountInput, '1000');

      await waitFor(() => {
        expect(screen.getByText(/₱10\.00/)).toBeInTheDocument(); // Minimum fee
      });
    });

    it('should calculate total amount correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      const amountInput = screen.getByLabelText(/Investment Amount/i);
      await user.type(amountInput, '5000');

      await waitFor(() => {
        const fees = 25; // 0.5% of 5000
        const total = 5000 + fees;
        expect(screen.getByText(new RegExp(`₱${total.toLocaleString()}`))).toBeInTheDocument();
      });
    });
  });

  describe('Units Calculation', () => {
    it('should calculate units correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      const amountInput = screen.getByLabelText(/Investment Amount/i);
      await user.type(amountInput, '3000');

      await waitFor(() => {
        // 3000 / 1.52 = 1973.68
        expect(screen.getByText(/1,973\.68/)).toBeInTheDocument();
      });
    });
  });

  describe('KYC Warning', () => {
    it('should show KYC warning for amounts above ₱5000', async () => {
      const user = userEvent.setup();
      
      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      const amountInput = screen.getByLabelText(/Investment Amount/i);
      await user.type(amountInput, '6000');

      await waitFor(() => {
        expect(screen.getByText(/KYC Verification Required/i)).toBeInTheDocument();
      });
    });

    it('should not show KYC warning for amounts below ₱5000', async () => {
      const user = userEvent.setup();
      
      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      const amountInput = screen.getByLabelText(/Investment Amount/i);
      await user.type(amountInput, '3000');

      await waitFor(() => {
        expect(screen.queryByText(/KYC Verification Required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Investment Submission', () => {
    it('should call API with correct data on submit', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            referenceNumber: 'INV-TEST-123',
            amount: 3000,
            fees: 15,
            totalAmount: 3015,
            units: 1973.68,
            unitPrice: '1.52',
            status: 'PENDING',
            asset: {
              id: mockAsset.id,
              name: mockAsset.name,
              code: mockAsset.code,
              type: mockAsset.asset_type
            },
            payment: {
              referenceNumber: 'PAY-TEST-123',
              method: 'GCASH',
              status: 'PENDING'
            },
            transaction: {
              referenceNumber: 'TXN-TEST-123'
            },
            createdAt: new Date().toISOString()
          }
        })
      });

      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
          onSuccess={mockOnSuccess}
        />
      );

      const amountInput = screen.getByLabelText(/Investment Amount/i);
      await user.type(amountInput, '3000');

      const investButton = screen.getByRole('button', { name: /Invest Now/i });
      await user.click(investButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:9002/api/v1/investments',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerId: mockCustomerId,
              assetId: mockAsset.id,
              amount: 3000,
              paymentMethod: 'GCASH',
            }),
          })
        );
      });
    });

    it('should show success screen on successful investment', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            referenceNumber: 'INV-TEST-123',
            amount: 3000,
            fees: 15,
            totalAmount: 3015,
            units: 1973.68,
            unitPrice: '1.52',
            asset: {
              id: mockAsset.id,
              name: mockAsset.name,
              code: mockAsset.code,
              type: mockAsset.asset_type
            },
            payment: {
              referenceNumber: 'PAY-TEST-123',
              method: 'GCASH',
              status: 'PENDING'
            },
            transaction: {
              referenceNumber: 'TXN-TEST-123'
            },
            status: 'PENDING',
            createdAt: new Date().toISOString()
          }
        })
      });

      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
          onSuccess={mockOnSuccess}
        />
      );

      const amountInput = screen.getByLabelText(/Investment Amount/i);
      await user.type(amountInput, '3000');

      const investButton = screen.getByRole('button', { name: /Invest Now/i });
      await user.click(investButton);

      await waitFor(() => {
        expect(screen.getByText(/Investment Successful!/i)).toBeInTheDocument();
        expect(screen.getByText(/INV-TEST-123/)).toBeInTheDocument();
      });
    });

    it('should show error message on failed investment', async () => {
      const user = userEvent.setup();
      
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'KYC verification required',
            errors: [{ field: 'amount', message: 'KYC verification required for investments above 5000.00 PHP' }]
          }
        })
      });

      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      const amountInput = screen.getByLabelText(/Investment Amount/i);
      await user.type(amountInput, '10000');

      const investButton = screen.getByRole('button', { name: /Invest Now/i });
      await user.click(investButton);

      await waitFor(() => {
        expect(screen.getAllByText(/KYC verification required/i).length).toBeGreaterThan(0);
      });
    });

    it('should call onSuccess callback after successful investment', async () => {
      const user = userEvent.setup();
      
      const mockData = {
        referenceNumber: 'INV-TEST-123',
        amount: 3000,
        fees: 15,
        totalAmount: 3015,
        units: 1973.68,
        unitPrice: '1.52',
        asset: {
          id: mockAsset.id,
          name: mockAsset.name,
          code: mockAsset.code,
          type: mockAsset.asset_type
        },
        payment: {
          referenceNumber: 'PAY-TEST-123',
          method: 'GCASH',
          status: 'PENDING'
        },
        transaction: {
          referenceNumber: 'TXN-TEST-123'
        },
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockData
        })
      });

      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
          onSuccess={mockOnSuccess}
        />
      );

      const amountInput = screen.getByLabelText(/Investment Amount/i);
      await user.type(amountInput, '3000');

      const investButton = screen.getByRole('button', { name: /Invest Now/i });
      await user.click(investButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      
      let resolvePromise: any;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as any).mockReturnValueOnce(promise);

      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      const amountInput = screen.getByLabelText(/Investment Amount/i);
      await user.type(amountInput, '3000');

      const investButton = screen.getByRole('button', { name: /Invest Now/i });
      await user.click(investButton);

      expect(screen.getByText(/Processing.../i)).toBeInTheDocument();

      resolvePromise({
        ok: true,
        json: async () => ({ success: true, data: {} })
      });
    });

    it('should disable buttons during submission', async () => {
      const user = userEvent.setup();
      
      let resolvePromise: any;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as any).mockReturnValueOnce(promise);

      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      const amountInput = screen.getByLabelText(/Investment Amount/i);
      await user.type(amountInput, '3000');

      const investButton = screen.getByRole('button', { name: /Invest Now/i });
      await user.click(investButton);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      expect(cancelButton).toBeDisabled();

      resolvePromise({
        ok: true,
        json: async () => ({ success: true, data: {} })
      });
    });
  });

  describe('Modal Interactions', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset form when modal closes', async () => {
      const { rerender } = render(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      const amountInput = screen.getByLabelText(/Investment Amount/i) as HTMLInputElement;
      fireEvent.change(amountInput, { target: { value: '5000' } });

      expect(amountInput.value).toBe('5000');

      rerender(
        <InvestmentModal
          open={false}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      // Wait for reset
      await new Promise(resolve => setTimeout(resolve, 400));

      rerender(
        <InvestmentModal
          open={true}
          onClose={mockOnClose}
          asset={mockAsset}
          customerId={mockCustomerId}
        />
      );

      const newAmountInput = screen.getByLabelText(/Investment Amount/i) as HTMLInputElement;
      expect(newAmountInput.value).toBe('');
    });
  });
});

