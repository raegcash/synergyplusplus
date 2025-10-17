/**
 * API Integration Tests
 * Comprehensive integration tests for all API services
 * 
 * @module __tests__/integration/api/apiIntegration.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { authApi } from '../../../services/api/auth.api';
import * as portfolioApi from '../../../services/api/portfolio.api';
import * as transactionsApi from '../../../services/api/transactions.api';
import * as dashboardApi from '../../../services/api/dashboard.api';
import * as assetsApi from '../../../services/api/assets.api';
import * as aiApi from '../../../services/api/ai.api';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get = vi.fn();
    mockedAxios.post = vi.fn();
    mockedAxios.put = vi.fn();
    mockedAxios.delete = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication API', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          customer: {
            id: 'customer-123',
            email: 'test@example.com',
            name: 'Test User',
          },
          token: 'mock-jwt-token',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.login({ email: 'test@example.com', password: 'password123' });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        { email: 'test@example.com', password: 'password123' }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        authApi.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow();
    });

    it('should register new user', async () => {
      const mockResponse = {
        data: {
          customer: {
            id: 'customer-456',
            email: 'newuser@example.com',
            name: 'New User',
          },
          token: 'mock-jwt-token',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({ email: 'newuser@example.com' })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle registration errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Email already exists'));

      await expect(
        authApi.register({ email: 'existing@example.com', password: 'password123', name: 'User' })
      ).rejects.toThrow();
    });

    it('should logout user', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      await authApi.logout();

      expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/auth/logout'));
    });
  });

  describe('Portfolio API', () => {
    it('should fetch portfolio summary', async () => {
      const mockSummary = {
        data: {
          totalValue: 150000,
          totalInvested: 120000,
          totalGainLoss: 30000,
          totalGainLossPercent: 25,
        },
      };

      mockedAxios.get.mockResolvedValue(mockSummary);

      const result = await portfolioApi.getPortfolioSummary();

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/portfolio/summary'));
      expect(result).toEqual(mockSummary.data);
    });

    it('should fetch holdings', async () => {
      const mockHoldings = {
        data: [
          {
            assetId: '1',
            assetName: 'BDO Equity Fund',
            units: 1000,
            currentValue: 120000,
          },
        ],
      };

      mockedAxios.get.mockResolvedValue(mockHoldings);

      const result = await portfolioApi.getHoldings();

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/portfolio/holdings'));
      expect(result).toEqual(mockHoldings.data);
    });

    it('should fetch performance data', async () => {
      const mockPerformance = {
        data: {
          daily: 5,
          weekly: 10,
          monthly: 15,
          yearly: 25,
        },
      };

      mockedAxios.get.mockResolvedValue(mockPerformance);

      const result = await portfolioApi.getPerformance();

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/portfolio/performance'));
      expect(result).toEqual(mockPerformance.data);
    });

    it('should handle portfolio API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Portfolio not found'));

      await expect(portfolioApi.getPortfolioSummary()).rejects.toThrow();
    });
  });

  describe('Transactions API', () => {
    it('should fetch transaction history', async () => {
      const mockTransactions = {
        data: {
          transactions: [
            {
              id: '1',
              type: 'INVESTMENT',
              amount: 10000,
              date: '2024-01-01',
              status: 'COMPLETED',
            },
          ],
          totalCount: 1,
        },
      };

      mockedAxios.get.mockResolvedValue(mockTransactions);

      const result = await transactionsApi.getTransactions();

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/transactions'));
      expect(result).toEqual(mockTransactions.data);
    });

    it('should fetch transaction by ID', async () => {
      const mockTransaction = {
        data: {
          id: '1',
          type: 'INVESTMENT',
          amount: 10000,
          status: 'COMPLETED',
        },
      };

      mockedAxios.get.mockResolvedValue(mockTransaction);

      const result = await transactionsApi.getTransactionById('1');

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/transactions/1'));
      expect(result).toEqual(mockTransaction.data);
    });

    it('should handle transaction API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Transaction not found'));

      await expect(transactionsApi.getTransactionById('999')).rejects.toThrow();
    });
  });

  describe('Dashboard API', () => {
    it('should fetch dashboard summary', async () => {
      const mockDashboard = {
        data: {
          totalPortfolioValue: 150000,
          totalGainLoss: 30000,
          recentTransactions: [],
          topAssets: [],
        },
      };

      mockedAxios.get.mockResolvedValue(mockDashboard);

      const result = await dashboardApi.getDashboardSummary();

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/dashboard'));
      expect(result).toEqual(mockDashboard.data);
    });

    it('should handle dashboard API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Dashboard data unavailable'));

      await expect(dashboardApi.getDashboardSummary()).rejects.toThrow();
    });
  });

  describe('Assets API', () => {
    it('should fetch all assets', async () => {
      const mockAssets = {
        data: [
          {
            id: '1',
            name: 'BDO Equity Fund',
            type: 'UITF',
            price: 1.52,
          },
        ],
      };

      mockedAxios.get.mockResolvedValue(mockAssets);

      const result = await assetsApi.getAssets();

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/assets'));
      expect(result).toEqual(mockAssets.data);
    });

    it('should fetch asset by ID', async () => {
      const mockAsset = {
        data: {
          id: '1',
          name: 'BDO Equity Fund',
          type: 'UITF',
          price: 1.52,
        },
      };

      mockedAxios.get.mockResolvedValue(mockAsset);

      const result = await assetsApi.getAssetById('1');

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/assets/1'));
      expect(result).toEqual(mockAsset.data);
    });

    it('should search assets', async () => {
      const mockSearchResults = {
        data: [
          {
            id: '1',
            name: 'BDO Equity Fund',
            type: 'UITF',
          },
        ],
      };

      mockedAxios.get.mockResolvedValue(mockSearchResults);

      const result = await assetsApi.searchAssets('BDO');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/assets/search'),
        expect.objectContaining({ params: expect.objectContaining({ q: 'BDO' }) })
      );
      expect(result).toEqual(mockSearchResults.data);
    });
  });

  describe('AI API', () => {
    it('should fetch AI recommendations', async () => {
      const mockRecommendations = {
        data: [
          {
            assetId: '1',
            assetName: 'BDO Equity Fund',
            recommendedAction: 'BUY',
            confidenceScore: 85,
          },
        ],
      };

      mockedAxios.get.mockResolvedValue(mockRecommendations);

      const result = await aiApi.getRecommendations();

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/ai/recommendations'));
      expect(result).toEqual(mockRecommendations.data);
    });

    it('should fetch AI insights', async () => {
      const mockInsights = {
        data: [
          {
            id: '1',
            type: 'OPPORTUNITY',
            title: 'Diversification Opportunity',
            message: 'Consider diversifying',
          },
        ],
      };

      mockedAxios.get.mockResolvedValue(mockInsights);

      const result = await aiApi.getInsights();

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/ai/insights'));
      expect(result).toEqual(mockInsights.data);
    });

    it('should fetch profile analysis', async () => {
      const mockAnalysis = {
        data: {
          riskTolerance: 'MEDIUM',
          investmentExperience: 'INTERMEDIATE',
          diversificationScore: 75,
        },
      };

      mockedAxios.get.mockResolvedValue(mockAnalysis);

      const result = await aiApi.getProfileAnalysis();

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/ai/profile-analysis'));
      expect(result).toEqual(mockAnalysis.data);
    });

    it('should handle AI API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('AI service unavailable'));

      await expect(aiApi.getRecommendations()).rejects.toThrow();
    });
  });

  describe('API Error Handling', () => {
    it('should handle network errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(portfolioApi.getPortfolioSummary()).rejects.toThrow('Network Error');
    });

    it('should handle 401 unauthorized', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
      });

      await expect(portfolioApi.getPortfolioSummary()).rejects.toBeTruthy();
    });

    it('should handle 404 not found', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'Not found' },
        },
      });

      await expect(assetsApi.getAssetById('999')).rejects.toBeTruthy();
    });

    it('should handle 500 server errors', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
      });

      await expect(dashboardApi.getDashboardSummary()).rejects.toBeTruthy();
    });
  });

  describe('API Request Configuration', () => {
    it('should include authorization header when authenticated', async () => {
      const mockToken = 'mock-jwt-token';
      localStorage.setItem('token', mockToken);

      mockedAxios.get.mockResolvedValue({ data: {} });

      await portfolioApi.getPortfolioSummary();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      );

      localStorage.removeItem('token');
    });

    it('should handle request timeouts', async () => {
      mockedAxios.get.mockRejectedValue({ code: 'ECONNABORTED' });

      await expect(portfolioApi.getPortfolioSummary()).rejects.toBeTruthy();
    });
  });
});

