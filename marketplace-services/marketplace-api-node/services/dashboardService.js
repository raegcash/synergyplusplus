/**
 * Dashboard Service - Enterprise Grade
 * Handles dashboard data aggregation and analytics
 * 
 * @module services/dashboardService
 * @version 1.0.0
 * @classification Production-Ready
 */

const db = require('../config/db-compat');
const portfolioService = require('./portfolioService');
const transactionService = require('./transactionService');

// =====================================================
// DASHBOARD SUMMARY
// =====================================================

/**
 * Get comprehensive dashboard summary
 * Aggregates data from portfolio, transactions, and investments
 * 
 * @param {string} customerId - Customer UUID
 * @returns {Promise<Object>} Dashboard summary with all key metrics
 */
async function getDashboardSummary(customerId) {
  try {
    // Fetch all data in parallel for performance
    const [
      portfolioSummary,
      transactionStats,
      recentActivity
    ] = await Promise.all([
      portfolioService.getPortfolioSummary(customerId),
      transactionService.getTransactionStatistics(customerId, '30d'),
      getRecentActivity(customerId, 10)
    ]);

    // Calculate quick stats
    const quickStats = {
      totalInvested: portfolioSummary.totalInvested,
      currentValue: portfolioSummary.currentValue,
      totalReturns: portfolioSummary.totalReturns,
      totalReturnsPercent: portfolioSummary.totalReturnsPercent,
      totalHoldings: portfolioSummary.totalHoldings,
      transactionsThisMonth: transactionStats.totalTransactions,
      pendingTransactions: transactionStats.byStatus.pending
    };

    // Get top performing assets
    const topPerformers = portfolioSummary.holdings
      .sort((a, b) => b.returnsPercent - a.returnsPercent)
      .slice(0, 3);

    // Get asset allocation
    const assetAllocation = portfolioSummary.assetAllocation;

    // Get risk distribution
    const riskDistribution = portfolioSummary.riskDistribution;

    return {
      quickStats,
      topPerformers,
      assetAllocation,
      riskDistribution,
      recentActivity,
      transactionSummary: {
        total: transactionStats.totalTransactions,
        byType: transactionStats.byType,
        byStatus: transactionStats.byStatus,
        amounts: transactionStats.amounts
      },
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    throw {
      code: 'DASHBOARD_ERROR',
      message: 'Failed to retrieve dashboard summary',
      details: error.message
    };
  }
}

// =====================================================
// RECENT ACTIVITY
// =====================================================

/**
 * Get recent activity feed
 * Combines recent transactions and investments
 * 
 * @param {string} customerId - Customer UUID
 * @param {number} limit - Number of activities to return
 * @returns {Promise<Array>} Recent activity items
 */
async function getRecentActivity(customerId, limit = 10) {
  try {
    const activities = await db.all(`
      SELECT 
        'transaction' as activity_type,
        t.id,
        t.transaction_type as type,
        t.amount,
        t.status,
        t.description,
        t.reference_number,
        t.transaction_date as date,
        a.name as asset_name,
        a.code as asset_code,
        a.asset_type
      FROM transactions t
      LEFT JOIN assets a ON t.asset_id = a.id
      WHERE t.customer_id = $1
      
      UNION ALL
      
      SELECT 
        'investment' as activity_type,
        i.id,
        'INVESTMENT' as type,
        i.investment_amount as amount,
        i.status,
        CONCAT('Investment in ', a.name) as description,
        CONCAT('INV-', SUBSTRING(i.id::text, 1, 8)) as reference_number,
        i.investment_date as date,
        a.name as asset_name,
        a.code as asset_code,
        a.asset_type
      FROM investments i
      LEFT JOIN assets a ON i.asset_id = a.id
      WHERE i.customer_id = $1
      
      ORDER BY date DESC
      LIMIT $2
    `, [customerId, limit]);

    return activities.map(activity => ({
      activityType: activity.activity_type,
      id: activity.id,
      type: activity.type,
      amount: parseFloat(activity.amount),
      status: activity.status,
      description: activity.description,
      referenceNumber: activity.reference_number,
      date: activity.date,
      asset: activity.asset_name ? {
        name: activity.asset_name,
        code: activity.asset_code,
        type: activity.asset_type
      } : null
    }));
  } catch (error) {
    console.error('Error getting recent activity:', error);
    throw {
      code: 'DASHBOARD_ERROR',
      message: 'Failed to retrieve recent activity',
      details: error.message
    };
  }
}

// =====================================================
// INVESTMENT TRENDS
// =====================================================

/**
 * Get investment trends over time
 * 
 * @param {string} customerId - Customer UUID
 * @param {string} period - Time period (7d, 30d, 90d, 1y)
 * @returns {Promise<Object>} Trend data for charts
 */
async function getInvestmentTrends(customerId, period = '30d') {
  try {
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    let groupBy = 'day';

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        groupBy = 'day';
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        groupBy = 'day';
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        groupBy = 'week';
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        groupBy = 'month';
        break;
      default:
        startDate.setDate(now.getDate() - 30);
        groupBy = 'day';
    }

    // Get investment trends
    const trendQuery = groupBy === 'day' 
      ? `DATE(investment_date)`
      : groupBy === 'week'
      ? `DATE_TRUNC('week', investment_date)`
      : `DATE_TRUNC('month', investment_date)`;

    const trends = await db.all(`
      SELECT 
        ${trendQuery} as date,
        COUNT(*) as count,
        SUM(investment_amount) as total_amount,
        AVG(investment_amount) as avg_amount
      FROM investments
      WHERE customer_id = $1
        AND investment_date >= $2
        AND status IN ('COMPLETED', 'PENDING')
      GROUP BY ${trendQuery}
      ORDER BY date ASC
    `, [customerId, startDate.toISOString()]);

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      groupBy,
      data: trends.map(t => ({
        date: t.date,
        count: parseInt(t.count),
        totalAmount: parseFloat(t.total_amount),
        averageAmount: parseFloat(t.avg_amount)
      }))
    };
  } catch (error) {
    console.error('Error getting investment trends:', error);
    throw {
      code: 'DASHBOARD_ERROR',
      message: 'Failed to retrieve investment trends',
      details: error.message
    };
  }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getDashboardSummary,
  getRecentActivity,
  getInvestmentTrends,
};

