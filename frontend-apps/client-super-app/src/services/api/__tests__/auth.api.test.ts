import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '../auth.api';
import { apiClient } from '../client';

// Mock the API client
vi.mock('../client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should call POST /api/v1/auth/register with correct data', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: '123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
          },
        },
      };

      (apiClient.post as any).mockResolvedValueOnce(mockResponse);

      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const result = await authApi.register(registerData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/register',
        registerData
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('login', () => {
    it('should call POST /api/v1/auth/login with credentials', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'token123',
            refreshToken: 'refresh123',
            user: {
              id: '123',
              email: 'test@example.com',
            },
          },
        },
      };

      (apiClient.post as any).mockResolvedValueOnce(mockResponse);

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authApi.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/login',
        credentials
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('logout', () => {
    it('should call POST /api/v1/auth/logout', async () => {
      (apiClient.post as any).mockResolvedValueOnce({});

      await authApi.logout();

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/logout');
    });
  });

  describe('getCurrentUser', () => {
    it('should call GET /api/v1/auth/me', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: '123',
            email: 'test@example.com',
          },
        },
      };

      (apiClient.get as any).mockResolvedValueOnce(mockResponse);

      const result = await authApi.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/auth/me');
      expect(result).toEqual(mockResponse.data);
    });
  });
});

