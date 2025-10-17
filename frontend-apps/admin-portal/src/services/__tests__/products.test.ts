import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
  toggleProductMaintenance,
  toggleProductWhitelist,
} from '../products';
import type { Product } from '../../types/product';

vi.mock('axios');
const mockedAxios = axios as any;

describe('Products Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch all products successfully', async () => {
      const mockProducts: Product[] = [
        {
          id: '1',
          code: 'PROD001',
          name: 'Test Product',
          productType: 'INVESTMENT',
          status: 'ACTIVE',
          minInvestment: 1000,
          maxInvestment: 100000,
          currency: 'PHP',
          createdAt: '2025-01-01T00:00:00Z',
          maintenanceMode: false,
          whitelistMode: false,
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockProducts });

      const result = await getProducts();

      expect(mockedAxios.get).toHaveBeenCalledWith('/products');
      expect(result).toEqual(mockProducts);
    });

    it('should fetch products with status filter', async () => {
      const mockProducts: Product[] = [];
      mockedAxios.get.mockResolvedValueOnce({ data: mockProducts });

      await getProducts('PENDING_APPROVAL');

      expect(mockedAxios.get).toHaveBeenCalledWith('/products', {
        params: { status: 'PENDING_APPROVAL' },
      });
    });

    it('should throw error when API fails', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getProducts()).rejects.toThrow('API Error');
    });
  });

  describe('getProductById', () => {
    it('should fetch a single product by ID', async () => {
      const mockProduct: Product = {
        id: '1',
        code: 'PROD001',
        name: 'Test Product',
        productType: 'INVESTMENT',
        status: 'ACTIVE',
        minInvestment: 1000,
        maxInvestment: 100000,
        currency: 'PHP',
        createdAt: '2025-01-01T00:00:00Z',
        maintenanceMode: false,
        whitelistMode: false,
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockProduct });

      const result = await getProductById('1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/products/1');
      expect(result).toEqual(mockProduct);
    });

    it('should throw error when product not found', async () => {
      const error = { response: { status: 404, data: { error: 'Product not found' } } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getProductById('999')).rejects.toEqual(error);
    });
  });

  describe('createProduct', () => {
    it('should create a new product successfully', async () => {
      const newProduct = {
        code: 'PROD002',
        name: 'New Product',
        productType: 'SAVINGS' as const,
        description: 'Description',
        minInvestment: 500,
        maxInvestment: 50000,
        currency: 'PHP',
      };

      const createdProduct: Product = {
        id: '2',
        ...newProduct,
        status: 'PENDING_APPROVAL',
        createdAt: '2025-01-01T00:00:00Z',
        maintenanceMode: false,
        whitelistMode: false,
      };

      mockedAxios.post.mockResolvedValueOnce({ data: createdProduct });

      const result = await createProduct(newProduct);

      expect(mockedAxios.post).toHaveBeenCalledWith('/products', newProduct);
      expect(result).toEqual(createdProduct);
    });

    it('should throw error when creating product with duplicate code', async () => {
      const error = {
        response: { status: 409, data: { error: 'Product code already exists' } },
      };
      mockedAxios.post.mockRejectedValueOnce(error);

      const newProduct = {
        code: 'PROD001',
        name: 'Duplicate',
        productType: 'INVESTMENT' as const,
      };

      await expect(createProduct(newProduct)).rejects.toEqual(error);
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      const updates = { name: 'Updated Name', minInvestment: 2000 };
      const updatedProduct: Product = {
        id: '1',
        code: 'PROD001',
        name: 'Updated Name',
        productType: 'INVESTMENT',
        status: 'ACTIVE',
        minInvestment: 2000,
        maxInvestment: 100000,
        currency: 'PHP',
        createdAt: '2025-01-01T00:00:00Z',
        maintenanceMode: false,
        whitelistMode: false,
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: updatedProduct });

      const result = await updateProduct('1', updates);

      expect(mockedAxios.patch).toHaveBeenCalledWith('/products/1', updates);
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ status: 204 });

      await deleteProduct('1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/products/1');
    });
  });

  describe('approveProduct', () => {
    it('should approve a product successfully', async () => {
      const approvedProduct: Product = {
        id: '1',
        code: 'PROD001',
        name: 'Test Product',
        productType: 'INVESTMENT',
        status: 'ACTIVE',
        minInvestment: 1000,
        maxInvestment: 100000,
        currency: 'PHP',
        createdAt: '2025-01-01T00:00:00Z',
        maintenanceMode: false,
        whitelistMode: false,
        approvedBy: 'admin@company.com',
        approvedAt: '2025-01-02T00:00:00Z',
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: approvedProduct });

      const result = await approveProduct('1', 'admin@company.com');

      expect(mockedAxios.patch).toHaveBeenCalledWith('/products/1/approve', {
        approvedBy: 'admin@company.com',
      });
      expect(result).toEqual(approvedProduct);
      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('rejectProduct', () => {
    it('should reject a product successfully', async () => {
      const rejectedProduct: Product = {
        id: '1',
        code: 'PROD001',
        name: 'Test Product',
        productType: 'INVESTMENT',
        status: 'REJECTED',
        minInvestment: 1000,
        maxInvestment: 100000,
        currency: 'PHP',
        createdAt: '2025-01-01T00:00:00Z',
        maintenanceMode: false,
        whitelistMode: false,
        rejectedBy: 'admin@company.com',
        rejectedAt: '2025-01-02T00:00:00Z',
        rejectionReason: 'Does not meet requirements',
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: rejectedProduct });

      const result = await rejectProduct(
        '1',
        'Does not meet requirements',
        'admin@company.com'
      );

      expect(mockedAxios.patch).toHaveBeenCalledWith('/products/1/reject', {
        reason: 'Does not meet requirements',
        rejectedBy: 'admin@company.com',
      });
      expect(result).toEqual(rejectedProduct);
      expect(result.status).toBe('REJECTED');
    });

    it('should throw error when rejecting without reason', async () => {
      const error = {
        response: { status: 400, data: { error: 'Rejection reason is required' } },
      };
      mockedAxios.patch.mockRejectedValueOnce(error);

      await expect(rejectProduct('1', '', 'admin@company.com')).rejects.toEqual(error);
    });
  });

  describe('toggleProductMaintenance', () => {
    it('should toggle maintenance mode successfully', async () => {
      const updatedProduct: Product = {
        id: '1',
        code: 'PROD001',
        name: 'Test Product',
        productType: 'INVESTMENT',
        status: 'ACTIVE',
        minInvestment: 1000,
        maxInvestment: 100000,
        currency: 'PHP',
        createdAt: '2025-01-01T00:00:00Z',
        maintenanceMode: true,
        whitelistMode: false,
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: updatedProduct });

      const result = await toggleProductMaintenance('1');

      expect(mockedAxios.patch).toHaveBeenCalledWith('/products/1/maintenance');
      expect(result.maintenanceMode).toBe(true);
    });
  });

  describe('toggleProductWhitelist', () => {
    it('should toggle whitelist mode successfully', async () => {
      const updatedProduct: Product = {
        id: '1',
        code: 'PROD001',
        name: 'Test Product',
        productType: 'INVESTMENT',
        status: 'ACTIVE',
        minInvestment: 1000,
        maxInvestment: 100000,
        currency: 'PHP',
        createdAt: '2025-01-01T00:00:00Z',
        maintenanceMode: false,
        whitelistMode: true,
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: updatedProduct });

      const result = await toggleProductWhitelist('1');

      expect(mockedAxios.patch).toHaveBeenCalledWith('/products/1/whitelist');
      expect(result.whitelistMode).toBe(true);
    });
  });
});

