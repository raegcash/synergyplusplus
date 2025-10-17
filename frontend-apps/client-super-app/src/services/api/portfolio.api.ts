/**
 * Portfolio API Service - Enterprise Grade
 * Handles all portfolio-related API calls
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */

import apiClient from './client';

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalReturns: number;
  totalReturnsPercent: number;
  holdings: PortfolioHolding[];
  assetAllocation: AssetAllocation[];
  riskDistribution: Record<string, RiskDistribution>;
  totalHoldings: number;
  lastUpdated: string;
}

export interface PortfolioHolding {
  id: string;
  assetId: string;
  assetName: string;
  assetCode: string;
  assetType: string;
  riskLevel: string;
  totalUnits: number;
  totalInvested: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  returns: number;
  returnsPercent: number;
  firstInvestmentDate: string;
  lastInvestmentDate: string;
  updatedAt: string;
}

export interface AssetAllocation {
  assetType: string;
  value: number;
  percentage: number;
}

export interface RiskDistribution {
  value: number;
  percentage: number;
}

export interface PortfolioPerformance {
  period: string;
  startDate: string;
  endDate: string;
  currentValue: number;
  totalInvested: number;
  totalReturns: number;
  totalReturnsPercent: number;
  investmentsInPeriod: number;
  totalInvestedInPeriod: number;
  bestPerformingAsset: PortfolioHolding | null;
  worstPerformingAsset: PortfolioHolding | null;
  historicalData: Array<{
    date: string;
    amount: number;
    status: string;
  }>;
}

export interface AssetHoldingDetail extends PortfolioHolding {
  assetDescription: string;
  assetStatus: string;
  minInvestment: number;
  investmentHistory: Array<{
    id: string;
    amount: number;
    units: number;
    unitPrice: number;
    fees: number;
    totalAmount: number;
    status: string;
    investmentDate: string;
    settlementDate: string | null;
    paymentMethod: string;
    paymentReference: string;
    paymentStatus: string;
  }>;
  totalInvestments: number;
}

/**
 * Get portfolio summary
 */
export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const response = await apiClient.get('/api/v1/portfolio/summary');
  return response.data.data;
}

/**
 * Get portfolio holdings
 */
export async function getPortfolioHoldings(options?: {
  assetType?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<PortfolioHolding[]> {
  const response = await apiClient.get('/api/v1/portfolio/holdings', {
    params: options,
  });
  return response.data.data;
}

/**
 * Get portfolio performance
 */
export async function getPortfolioPerformance(period: string = '30d'): Promise<PortfolioPerformance> {
  const response = await apiClient.get('/api/v1/portfolio/performance', {
    params: { period },
  });
  return response.data.data;
}

/**
 * Get asset holding details
 */
export async function getAssetHolding(assetId: string): Promise<AssetHoldingDetail> {
  const response = await apiClient.get(`/api/v1/portfolio/holdings/${assetId}`);
  return response.data.data;
}

export const portfolioApi = {
  getPortfolioSummary,
  getPortfolioHoldings,
  getPortfolioPerformance,
  getAssetHolding,
};
