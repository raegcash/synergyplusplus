/**
 * AI Recommendation API Client
 * Frontend API client for AI-powered features
 * 
 * @module services/api/ai.api
 * @version 1.0.0
 */

import apiClient from './client';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface Recommendation {
  asset_id: string;
  asset_name: string;
  asset_type: string;
  score: number;
  reason: string;
  expected_return?: number;
  risk_level: string;
  match_factors: string[];
}

export interface Insight {
  type: string;
  title: string;
  description: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  icon: string;
}

export interface Action {
  type: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  actionUrl: string;
}

export interface Warning {
  type: string;
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  icon: string;
}

export interface InsightsResponse {
  insights: Insight[];
  actions: Action[];
  warnings: Warning[];
}

export interface ProfileAnalysis {
  customer_id: string;
  risk_profile: string;
  investment_style: string;
  diversification_score: number;
  recommendations: string[];
}

export interface RecommendationRequest {
  customer_id: string;
  asset_types?: string[];
  limit?: number;
}

export interface TrendingAsset {
  asset_id: string;
  name: string;
  type: string;
  trend_score: number;
  recent_investments: number;
}

export interface MarketSentiment {
  overall_sentiment: string;
  confidence: number;
  trending_sectors: string[];
  market_summary: string;
  last_updated: string;
}

// =====================================================
// API FUNCTIONS
// =====================================================

/**
 * Get personalized recommendations
 */
export async function getRecommendations(
  customerId?: string,
  assetTypes?: string[],
  limit: number = 10
) {
  const response = await apiClient.post('/api/v1/ai/recommendations', {
    customer_id: customerId,
    asset_types: assetTypes,
    limit
  });
  return response;
}

/**
 * Get smart insights
 */
export async function getInsights(customerId?: string, limit?: number) {
  const response = await apiClient.post('/api/v1/ai/insights', {
    customer_id: customerId,
    limit
  });
  return response;
}

/**
 * Get profile analysis
 */
export async function getProfileAnalysis(customerId?: string) {
  const response = await apiClient.post('/api/v1/ai/profile-analysis', {
    customer_id: customerId
  });
  return response;
}

/**
 * Get trending assets
 */
export async function getTrendingAssets(limit: number = 5) {
  const response = await apiClient.get(`/api/v1/ai/trending-assets?limit=${limit}`);
  return response;
}

/**
 * Get market sentiment
 */
export async function getMarketSentiment() {
  const response = await apiClient.get('/api/v1/ai/market-sentiment');
  return response;
}

/**
 * Check AI service health
 */
export async function checkAIHealth() {
  const response = await apiClient.get('/api/v1/ai/health');
  return response;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get risk level color
 */
export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel.toUpperCase()) {
    case 'LOW':
      return 'success';
    case 'MEDIUM':
      return 'warning';
    case 'HIGH':
      return 'error';
    case 'VERY_HIGH':
      return 'error';
    default:
      return 'default';
  }
}

/**
 * Get sentiment color
 */
export function getSentimentColor(sentiment: string): string {
  switch (sentiment.toUpperCase()) {
    case 'POSITIVE':
      return 'success';
    case 'NEUTRAL':
      return 'info';
    case 'NEGATIVE':
      return 'error';
    default:
      return 'default';
  }
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: string): string {
  switch (priority.toUpperCase()) {
    case 'HIGH':
      return 'error';
    case 'MEDIUM':
      return 'warning';
    case 'LOW':
      return 'info';
    default:
      return 'default';
  }
}

/**
 * Format recommendation score as percentage
 */
export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

