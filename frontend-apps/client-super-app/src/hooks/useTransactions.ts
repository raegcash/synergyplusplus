/**
 * Transaction Hooks - Enterprise Grade
 * React hooks for transaction data fetching
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, TransactionFilters } from '../services/api/transactions.api';

/**
 * Fetch transactions with filtering and pagination
 */
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.getTransactions(filters),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch transaction details by ID
 */
export function useTransactionById(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionsApi.getTransactionById(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Fetch transaction statistics
 */
export function useTransactionStatistics(period: string = '30d') {
  return useQuery({
    queryKey: ['transactions', 'statistics', period],
    queryFn: () => transactionsApi.getTransactionStatistics(period),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });
}

/**
 * Export transactions to CSV
 */
export function useExportTransactions() {
  return useMutation({
    mutationFn: (filters?: TransactionFilters) => transactionsApi.exportTransactions(filters),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

/**
 * Refresh transaction data
 */
export function useRefreshTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

