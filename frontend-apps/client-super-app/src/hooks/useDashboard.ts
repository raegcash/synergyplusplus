/**
 * Dashboard Hooks - Enterprise Grade
 * React hooks for dashboard data fetching
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../services/api/dashboard.api';

/**
 * Fetch dashboard summary
 */
export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => dashboardApi.getDashboardSummary(),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // Refetch every minute for real-time data
  });
}

/**
 * Fetch recent activity
 */
export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: () => dashboardApi.getRecentActivity(limit),
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch investment trends
 */
export function useInvestmentTrends(period: string = '30d') {
  return useQuery({
    queryKey: ['dashboard', 'trends', period],
    queryFn: () => dashboardApi.getInvestmentTrends(period),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });
}

/**
 * Refresh dashboard data
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

