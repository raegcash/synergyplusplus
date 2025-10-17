import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  approveAsset,
  rejectAsset,
} from '../assets';
import type { Asset } from '../../types/asset';

vi.mock('axios');
const mockedAxios = axios as any;

describe('Assets Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAssets', () => {
    it('should fetch all assets successfully', async () => {
      const mockAssets: Asset[] = [
        {
          id: '1',
          code: 'ASSET001',
          name: 'Test Asset',
          assetType: 'STOCK',
          status: 'ACTIVE',
          currentValue: 100000,
          currency: 'PHP',
          riskLevel: 'MEDIUM',
          minInvestment: 1000,
          maxInvestment: 50000,
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockAssets });

      const result = await getAssets();

      expect(mockedAxios.get).toHaveBeenCalledWith('/assets');
      expect(result).toEqual(mockAssets);
    });

    it('should fetch assets with status filter', async () => {
      const mockAssets: Asset[] = [];
      mockedAxios.get.mockResolvedValueOnce({ data: mockAssets });

      await getAssets('PENDING_APPROVAL');

      expect(mockedAxios.get).toHaveBeenCalledWith('/assets', {
        params: { status: 'PENDING_APPROVAL' },
      });
    });

    it('should throw error when API fails', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getAssets()).rejects.toThrow('API Error');
    });
  });

  describe('getAssetById', () => {
    it('should fetch a single asset by ID', async () => {
      const mockAsset: Asset = {
        id: '1',
        code: 'ASSET001',
        name: 'Test Asset',
        assetType: 'STOCK',
        status: 'ACTIVE',
        currentValue: 100000,
        currency: 'PHP',
        riskLevel: 'MEDIUM',
        minInvestment: 1000,
        maxInvestment: 50000,
        createdAt: '2025-01-01T00:00:00Z',
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockAsset });

      const result = await getAssetById('1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/assets/1');
      expect(result).toEqual(mockAsset);
    });

    it('should throw error when asset not found', async () => {
      const error = { response: { status: 404, data: { error: 'Asset not found' } } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getAssetById('999')).rejects.toEqual(error);
    });
  });

  describe('createAsset', () => {
    it('should create a new asset successfully', async () => {
      const newAsset = {
        code: 'ASSET002',
        name: 'New Asset',
        assetType: 'BOND' as const,
        description: 'Government bond',
        productId: 'prod-1',
        productName: 'Bond Fund',
        partnerId: 'partner-1',
        partnerName: 'Bank Partner',
        currentValue: 50000,
        currency: 'PHP',
        riskLevel: 'LOW' as const,
        minInvestment: 5000,
        maxInvestment: 100000,
      };

      const createdAsset: Asset = {
        id: '2',
        ...newAsset,
        status: 'PENDING_APPROVAL',
        createdAt: '2025-01-01T00:00:00Z',
      };

      mockedAxios.post.mockResolvedValueOnce({ data: createdAsset });

      const result = await createAsset(newAsset);

      expect(mockedAxios.post).toHaveBeenCalledWith('/assets', newAsset);
      expect(result).toEqual(createdAsset);
    });

    it('should throw error when creating asset with duplicate code', async () => {
      const error = {
        response: { status: 409, data: { error: 'Asset code already exists' } },
      };
      mockedAxios.post.mockRejectedValueOnce(error);

      const newAsset = {
        code: 'ASSET001',
        name: 'Duplicate',
        assetType: 'STOCK' as const,
      };

      await expect(createAsset(newAsset)).rejects.toEqual(error);
    });

    it('should throw error when missing required fields', async () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: 'Missing required fields',
            required: ['code', 'name', 'assetType'],
          },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(error);

      const incompleteAsset = {
        code: 'ASSET003',
        name: 'Incomplete',
      } as any;

      await expect(createAsset(incompleteAsset)).rejects.toEqual(error);
    });
  });

  describe('updateAsset', () => {
    it('should update an asset successfully', async () => {
      const updates = { name: 'Updated Asset', currentValue: 120000 };
      const updatedAsset: Asset = {
        id: '1',
        code: 'ASSET001',
        name: 'Updated Asset',
        assetType: 'STOCK',
        status: 'ACTIVE',
        currentValue: 120000,
        currency: 'PHP',
        riskLevel: 'MEDIUM',
        minInvestment: 1000,
        maxInvestment: 50000,
        createdAt: '2025-01-01T00:00:00Z',
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: updatedAsset });

      const result = await updateAsset('1', updates);

      expect(mockedAxios.patch).toHaveBeenCalledWith('/assets/1', updates);
      expect(result).toEqual(updatedAsset);
    });

    it('should update risk level successfully', async () => {
      const updates = { riskLevel: 'HIGH' };
      const updatedAsset: Asset = {
        id: '1',
        code: 'ASSET001',
        name: 'Test Asset',
        assetType: 'STOCK',
        status: 'ACTIVE',
        currentValue: 100000,
        currency: 'PHP',
        riskLevel: 'HIGH',
        minInvestment: 1000,
        maxInvestment: 50000,
        createdAt: '2025-01-01T00:00:00Z',
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: updatedAsset });

      const result = await updateAsset('1', updates);

      expect(result.riskLevel).toBe('HIGH');
    });
  });

  describe('deleteAsset', () => {
    it('should delete an asset successfully', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ status: 204 });

      await deleteAsset('1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/assets/1');
    });
  });

  describe('approveAsset', () => {
    it('should approve an asset successfully', async () => {
      const approvedAsset: Asset = {
        id: '1',
        code: 'ASSET001',
        name: 'Test Asset',
        assetType: 'STOCK',
        status: 'ACTIVE',
        currentValue: 100000,
        currency: 'PHP',
        riskLevel: 'MEDIUM',
        minInvestment: 1000,
        maxInvestment: 50000,
        createdAt: '2025-01-01T00:00:00Z',
        approvedBy: 'admin@company.com',
        approvedAt: '2025-01-02T00:00:00Z',
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: approvedAsset });

      const result = await approveAsset('1', 'admin@company.com');

      expect(mockedAxios.patch).toHaveBeenCalledWith('/assets/1/approve', {
        approvedBy: 'admin@company.com',
      });
      expect(result).toEqual(approvedAsset);
      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('rejectAsset', () => {
    it('should reject an asset successfully', async () => {
      const rejectedAsset: Asset = {
        id: '1',
        code: 'ASSET001',
        name: 'Test Asset',
        assetType: 'STOCK',
        status: 'REJECTED',
        currentValue: 100000,
        currency: 'PHP',
        riskLevel: 'MEDIUM',
        minInvestment: 1000,
        maxInvestment: 50000,
        createdAt: '2025-01-01T00:00:00Z',
        rejectedBy: 'admin@company.com',
        rejectedAt: '2025-01-02T00:00:00Z',
        rejectionReason: 'High risk not suitable',
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: rejectedAsset });

      const result = await rejectAsset('1', 'High risk not suitable', 'admin@company.com');

      expect(mockedAxios.patch).toHaveBeenCalledWith('/assets/1/reject', {
        reason: 'High risk not suitable',
        rejectedBy: 'admin@company.com',
      });
      expect(result).toEqual(rejectedAsset);
      expect(result.status).toBe('REJECTED');
    });

    it('should throw error when rejecting without reason', async () => {
      const error = {
        response: { status: 400, data: { error: 'Rejection reason is required' } },
      };
      mockedAxios.patch.mockRejectedValueOnce(error);

      await expect(rejectAsset('1', '', 'admin@company.com')).rejects.toEqual(error);
    });
  });
});

