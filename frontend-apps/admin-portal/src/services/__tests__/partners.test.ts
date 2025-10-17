import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  approvePartner,
  rejectPartner,
} from '../partners';
import type { Partner } from '../../types/partner';

vi.mock('axios');
const mockedAxios = axios as any;

describe('Partners Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPartners', () => {
    it('should fetch all partners successfully', async () => {
      const mockPartners: Partner[] = [
        {
          id: '1',
          code: 'PART001',
          name: 'Test Partner',
          type: 'INVESTMENT',
          status: 'ACTIVE',
          contactEmail: 'contact@partner.com',
          contactPhone: '+639123456789',
          createdAt: '2025-01-01T00:00:00Z',
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockPartners });

      const result = await getPartners();

      expect(mockedAxios.get).toHaveBeenCalledWith('/partners');
      expect(result).toEqual(mockPartners);
    });

    it('should fetch partners with status filter', async () => {
      const mockPartners: Partner[] = [];
      mockedAxios.get.mockResolvedValueOnce({ data: mockPartners });

      await getPartners('PENDING');

      expect(mockedAxios.get).toHaveBeenCalledWith('/partners', {
        params: { status: 'PENDING' },
      });
    });

    it('should throw error when API fails', async () => {
      const error = new Error('API Error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getPartners()).rejects.toThrow('API Error');
    });
  });

  describe('getPartnerById', () => {
    it('should fetch a single partner by ID', async () => {
      const mockPartner: Partner = {
        id: '1',
        code: 'PART001',
        name: 'Test Partner',
        type: 'INVESTMENT',
        status: 'ACTIVE',
        contactEmail: 'contact@partner.com',
        contactPhone: '+639123456789',
        createdAt: '2025-01-01T00:00:00Z',
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockPartner });

      const result = await getPartnerById('1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/partners/1');
      expect(result).toEqual(mockPartner);
    });

    it('should throw error when partner not found', async () => {
      const error = { response: { status: 404, data: { error: 'Partner not found' } } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getPartnerById('999')).rejects.toEqual(error);
    });
  });

  describe('createPartner', () => {
    it('should create a new partner successfully', async () => {
      const newPartner = {
        code: 'PART002',
        name: 'New Partner',
        type: 'BANK' as const,
        contactEmail: 'new@partner.com',
        contactPhone: '+639987654321',
        webhookUrl: 'https://partner.com/webhook',
      };

      const createdPartner: Partner = {
        id: '2',
        ...newPartner,
        status: 'PENDING',
        createdAt: '2025-01-01T00:00:00Z',
      };

      mockedAxios.post.mockResolvedValueOnce({ data: createdPartner });

      const result = await createPartner(newPartner);

      expect(mockedAxios.post).toHaveBeenCalledWith('/partners', newPartner);
      expect(result).toEqual(createdPartner);
    });

    it('should throw error when creating partner with duplicate code', async () => {
      const error = {
        response: { status: 409, data: { error: 'Partner code already exists' } },
      };
      mockedAxios.post.mockRejectedValueOnce(error);

      const newPartner = {
        code: 'PART001',
        name: 'Duplicate',
        type: 'INVESTMENT' as const,
        contactEmail: 'dup@partner.com',
      };

      await expect(createPartner(newPartner)).rejects.toEqual(error);
    });

    it('should throw error when missing required fields', async () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: 'Missing required fields',
            required: ['code', 'name', 'type', 'contactEmail'],
          },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(error);

      const incompletePartner = {
        code: 'PART003',
        name: 'Incomplete',
      } as any;

      await expect(createPartner(incompletePartner)).rejects.toEqual(error);
    });
  });

  describe('updatePartner', () => {
    it('should update a partner successfully', async () => {
      const updates = { name: 'Updated Name', contactPhone: '+639111111111' };
      const updatedPartner: Partner = {
        id: '1',
        code: 'PART001',
        name: 'Updated Name',
        type: 'INVESTMENT',
        status: 'ACTIVE',
        contactEmail: 'contact@partner.com',
        contactPhone: '+639111111111',
        createdAt: '2025-01-01T00:00:00Z',
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: updatedPartner });

      const result = await updatePartner('1', updates);

      expect(mockedAxios.patch).toHaveBeenCalledWith('/partners/1', updates);
      expect(result).toEqual(updatedPartner);
    });
  });

  describe('deletePartner', () => {
    it('should delete a partner successfully', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ status: 204 });

      await deletePartner('1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/partners/1');
    });
  });

  describe('approvePartner', () => {
    it('should approve a partner successfully', async () => {
      const approvedPartner: Partner = {
        id: '1',
        code: 'PART001',
        name: 'Test Partner',
        type: 'INVESTMENT',
        status: 'ACTIVE',
        contactEmail: 'contact@partner.com',
        contactPhone: '+639123456789',
        createdAt: '2025-01-01T00:00:00Z',
        approvedBy: 'admin@company.com',
        approvedAt: '2025-01-02T00:00:00Z',
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: approvedPartner });

      const result = await approvePartner('1', 'admin@company.com');

      expect(mockedAxios.patch).toHaveBeenCalledWith('/partners/1/approve', {
        approvedBy: 'admin@company.com',
      });
      expect(result).toEqual(approvedPartner);
      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('rejectPartner', () => {
    it('should reject a partner successfully', async () => {
      const rejectedPartner: Partner = {
        id: '1',
        code: 'PART001',
        name: 'Test Partner',
        type: 'INVESTMENT',
        status: 'SUSPENDED',
        contactEmail: 'contact@partner.com',
        contactPhone: '+639123456789',
        createdAt: '2025-01-01T00:00:00Z',
        rejectedBy: 'admin@company.com',
        rejectedAt: '2025-01-02T00:00:00Z',
        rejectionReason: 'Non-compliant',
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: rejectedPartner });

      const result = await rejectPartner('1', 'Non-compliant', 'admin@company.com');

      expect(mockedAxios.patch).toHaveBeenCalledWith('/partners/1/reject', {
        reason: 'Non-compliant',
        rejectedBy: 'admin@company.com',
      });
      expect(result).toEqual(rejectedPartner);
      expect(result.status).toBe('SUSPENDED');
    });

    it('should throw error when rejecting without reason', async () => {
      const error = {
        response: { status: 400, data: { error: 'Rejection reason is required' } },
      };
      mockedAxios.patch.mockRejectedValueOnce(error);

      await expect(rejectPartner('1', '', 'admin@company.com')).rejects.toEqual(error);
    });
  });
});

