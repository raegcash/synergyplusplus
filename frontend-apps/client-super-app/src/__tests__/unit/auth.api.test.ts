/**
 * Unit Tests for Auth API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authApi } from '../../services/api/auth.api';
import { apiClient } from '../../services/api/client';
import type { LoginRequest, RegisterRequest } from '../../types/api.types';

// Mock the API client
vi.mock('../../services/api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockLoginData: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            user: {
              id: '123',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              kycStatus: 'PENDING',
              status: 'ACTIVE',
            },
          },
        },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await authApi.login(mockLoginData);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/login', mockLoginData);
      expect(result).toEqual(mockResponse.data);
      expect(result.data.user.email).toBe('test@example.com');
    });

    it('should throw error for invalid credentials', async () => {
      const mockLoginData: LoginRequest = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      const mockError = {
        response: {
          data: {
            error: {
              message: 'Invalid email or password',
            },
          },
        },
      };

      (apiClient.post as any).mockRejectedValue(mockError);

      await expect(authApi.login(mockLoginData)).rejects.toEqual(mockError);
      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/login', mockLoginData);
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockRegisterData: RegisterRequest = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phoneNumber: '+639123456789',
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            id: '456',
            email: 'newuser@example.com',
            firstName: 'New',
            lastName: 'User',
            phoneNumber: '+639123456789',
            kycStatus: 'PENDING',
            status: 'ACTIVE',
            createdAt: '2025-10-15T00:00:00Z',
          },
        },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await authApi.register(mockRegisterData);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/register', mockRegisterData);
      expect(result).toEqual(mockResponse.data);
      expect(result.data.email).toBe('newuser@example.com');
    });

    it('should throw error if email already exists', async () => {
      const mockRegisterData: RegisterRequest = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      const mockError = {
        response: {
          data: {
            error: {
              message: 'Email already in use',
            },
          },
        },
      };

      (apiClient.post as any).mockRejectedValue(mockError);

      await expect(authApi.register(mockRegisterData)).rejects.toEqual(mockError);
      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/register', mockRegisterData);
    });

    it('should throw error if password is too short', async () => {
      const mockRegisterData: RegisterRequest = {
        email: 'newuser@example.com',
        password: 'short',
        firstName: 'New',
        lastName: 'User',
      };

      const mockError = {
        response: {
          data: {
            error: {
              message: 'Password must be at least 8 characters long',
            },
          },
        },
      };

      (apiClient.post as any).mockRejectedValue(mockError);

      await expect(authApi.register(mockRegisterData)).rejects.toEqual(mockError);
    });
  });

  describe('getCurrentUser', () => {
    it('should successfully fetch current user', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: '123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '+639123456789',
            kycStatus: 'VERIFIED',
            status: 'ACTIVE',
            createdAt: '2025-10-15T00:00:00Z',
          },
        },
      };

      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await authApi.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/auth/me');
      expect(result).toEqual(mockResponse.data);
      expect(result.data.email).toBe('test@example.com');
    });

    it('should throw error if user not authenticated', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            error: {
              message: 'Unauthorized',
            },
          },
        },
      };

      (apiClient.get as any).mockRejectedValue(mockError);

      await expect(authApi.getCurrentUser()).rejects.toEqual(mockError);
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh access token', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'new-access-token',
          },
        },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await authApi.refreshToken();

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/refresh');
      expect(result).toEqual(mockResponse.data);
      expect(result.data.accessToken).toBe('new-access-token');
    });

    it('should throw error if refresh token is invalid', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            error: {
              message: 'Invalid or expired refresh token',
            },
          },
        },
      };

      (apiClient.post as any).mockRejectedValue(mockError);

      await expect(authApi.refreshToken()).rejects.toEqual(mockError);
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Logout successful',
        },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      await authApi.logout();

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/logout');
    });
  });
});

