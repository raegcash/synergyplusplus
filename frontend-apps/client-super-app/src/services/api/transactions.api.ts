/**
 * Transactions API Service - Enterprise Grade
 * Handles all transaction-related API calls
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */

import apiClient from './client';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface Transaction {
  id: string;
  type: 'INVESTMENT' | 'WITHDRAWAL' | 'DIVIDEND' | 'FEE' | 'ADJUSTMENT';
  amount: number;
  units: number | null;
  unitPrice: number | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  referenceNumber: string;
  transactionDate: string;
  assetName: string | null;
  assetCode: string | null;
  assetType: string | null;
  investmentId: string | null;
  paymentMethod: string | null;
  fees: number | null;
  metadata: Record<string, any> | null;
}

export interface TransactionDetail extends Transaction {
  asset: {
    id: string;
    name: string;
    code: string;
    type: string;
    description: string;
  } | null;
  investment: {
    id: string;
    amount: number;
    unitsPurchased: number;
    unitPrice: number;
    fees: number;
    totalAmount: number;
    paymentMethod: string;
    investmentDate: string;
    settlementDate: string | null;
  } | null;
  payment: {
    id: string;
    referenceNumber: string;
    status: string;
    initiatedAt: string;
    completedAt: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  type?: string;
  status?: string;
  assetId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
    currentPage: number;
  };
}

export interface TransactionStatistics {
  period: string;
  startDate: string;
  endDate: string;
  totalTransactions: number;
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
  typeBreakdown: Array<{
    type: string;
    count: number;
    totalAmount: number;
  }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    referenceNumber: string;
    transactionDate: string;
    assetName: string;
    assetCode: string;
  }>;
}

// =====================================================
// API FUNCTIONS
// =====================================================

/**
 * Get transactions with filtering and pagination
 */
export async function getTransactions(filters?: TransactionFilters): Promise<TransactionListResponse> {
  const response = await apiClient.get('/api/v1/transactions', {
    params: filters,
  });
  return response.data;
}

/**
 * Get transaction details by ID
 */
export async function getTransactionById(id: string): Promise<TransactionDetail> {
  const response = await apiClient.get(`/api/v1/transactions/${id}`);
  return response.data.data;
}

/**
 * Get transaction statistics
 */
export async function getTransactionStatistics(period: string = '30d'): Promise<TransactionStatistics> {
  const response = await apiClient.get('/api/v1/transactions/statistics', {
    params: { period },
  });
  return response.data.data;
}

/**
 * Export transactions to CSV
 */
export async function exportTransactions(filters?: TransactionFilters): Promise<Blob> {
  const response = await apiClient.get('/api/v1/transactions/export', {
    params: filters,
    responseType: 'blob',
  });
  return response.data;
}

// Export API object
export const transactionsApi = {
  getTransactions,
  getTransactionById,
  getTransactionStatistics,
  exportTransactions,
};

export default transactionsApi;
