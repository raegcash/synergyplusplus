/**
 * Dashboard API Service - Enterprise Grade
 * Handles all dashboard-related API calls
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */

import apiClient from './client';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface DashboardSummary {
  quickStats: {
    totalInvested: number;
    currentValue: number;
    totalReturns: number;
    totalReturnsPercent: number;
    totalHoldings: number;
    transactionsThisMonth: number;
    pendingTransactions: number;
  };
  topPerformers: Array<{
    id: string;
    assetName: string;
    assetCode: string;
    assetType: string;
    returnsPercent: number;
    returns: number;
    currentValue: number;
  }>;
  assetAllocation: Array<{
    assetType: string;
    value: number;
    percentage: number;
  }>;
  riskDistribution: Record<string, {
    value: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    activityType: string;
    id: string;
    type: string;
    amount: number;
    status: string;
    description: string;
    referenceNumber: string;
    date: string;
    asset: {
      name: string;
      code: string;
      type: string;
    } | null;
  }>;
  transactionSummary: {
    total: number;
    byType: {
      investments: number;
      withdrawals: number;
      dividends: number;
    };
    byStatus: {
      completed: number;
      pending: number;
      failed: number;
    };
    amounts: {
      totalInvested: number;
      totalWithdrawn: number;
      totalDividends: number;
    };
  };
  lastUpdated: string;
}

export interface RecentActivity {
  activityType: string;
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  referenceNumber: string;
  date: string;
  asset: {
    name: string;
    code: string;
    type: string;
  } | null;
}

export interface InvestmentTrends {
  period: string;
  startDate: string;
  endDate: string;
  groupBy: string;
  data: Array<{
    date: string;
    count: number;
    totalAmount: number;
    averageAmount: number;
  }>;
}

// =====================================================
// API FUNCTIONS
// =====================================================

/**
 * Get dashboard summary
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get('/api/v1/dashboard/summary');
  return response.data.data;
}

/**
 * Get recent activity
 */
export async function getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
  const response = await apiClient.get('/api/v1/dashboard/activity', {
    params: { limit },
  });
  return response.data.data;
}

/**
 * Get investment trends
 */
export async function getInvestmentTrends(period: string = '30d'): Promise<InvestmentTrends> {
  const response = await apiClient.get('/api/v1/dashboard/trends', {
    params: { period },
  });
  return response.data.data;
}

// Export API object
export const dashboardApi = {
  getDashboardSummary,
  getRecentActivity,
  getInvestmentTrends,
};

export default dashboardApi;

