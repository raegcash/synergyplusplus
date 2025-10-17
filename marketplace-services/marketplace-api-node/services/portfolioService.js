/**
 * Portfolio Service - Enterprise Grade
 * Handles all portfolio-related business logic
 * 
 * @module services/portfolioService
 * @version 1.0.0
 * @classification Production-Ready
 */

const db = require('../config/db-compat');

// =====================================================
// PORTFOLIO SUMMARY
// =====================================================

/**
 * Get comprehensive portfolio summary for a customer
 * 
 * @param {string} customerId - Customer UUID
 * @returns {Promise<Object>} Portfolio summary with holdings, performance, and allocation
 */
async function getPortfolioSummary(customerId) {
  try {
    // 1. Get all portfolio holdings
    const holdings = await db.all(`
      SELECT 
        ph.id,
        ph.asset_id,
        ph.total_units,
        ph.total_invested,
        ph.average_price,
        ph.current_price,
        ph.first_investment_date,
        ph.last_investment_date,
        ph.updated_at,
        a.name as asset_name,
        a.code as asset_code,
        a.asset_type,
        a.price as latest_price,
        a.risk_level
      FROM portfolio_holdings ph
      JOIN assets a ON ph.asset_id = a.id
      WHERE ph.customer_id = $1
        AND ph.total_units > 0
      ORDER BY ph.total_invested DESC
    `, [customerId]);

    if (!holdings || holdings.length === 0) {
      return {
        totalInvested: 0,
        currentValue: 0,
        totalReturns: 0,
        totalReturnsPercent: 0,
        holdings: [],
        assetAllocation: [],
        riskDistribution: {},
        lastUpdated: new Date().toISOString()
      };
    }

    // 2. Calculate portfolio metrics
    let totalInvested = 0;
    let currentValue = 0;
    const assetTypeMap = {};
    const riskLevelMap = {};

    const enrichedHoldings = holdings.map(holding => {
      const invested = parseFloat(holding.total_invested);
      const units = parseFloat(holding.total_units);
      const latestPrice = parseFloat(holding.latest_price || holding.current_price);
      const marketValue = units * latestPrice;
      const returns = marketValue - invested;
      const returnsPercent = invested > 0 ? (returns / invested) * 100 : 0;

      // Aggregate totals
      totalInvested += invested;
      currentValue += marketValue;

      // Aggregate by asset type
      const assetType = holding.asset_type || 'OTHER';
      if (!assetTypeMap[assetType]) {
        assetTypeMap[assetType] = 0;
      }
      assetTypeMap[assetType] += marketValue;

      // Aggregate by risk level
      const riskLevel = holding.risk_level || 'MEDIUM';
      if (!riskLevelMap[riskLevel]) {
        riskLevelMap[riskLevel] = 0;
      }
      riskLevelMap[riskLevel] += marketValue;

      return {
        id: holding.id,
        assetId: holding.asset_id,
        assetName: holding.asset_name,
        assetCode: holding.asset_code,
        assetType: holding.asset_type,
        riskLevel: holding.risk_level,
        totalUnits: units,
        totalInvested: invested,
        averagePrice: parseFloat(holding.average_price),
        currentPrice: latestPrice,
        marketValue: marketValue,
        returns: returns,
        returnsPercent: returnsPercent,
        firstInvestmentDate: holding.first_investment_date,
        lastInvestmentDate: holding.last_investment_date,
        updatedAt: holding.updated_at
      };
    });

    // 3. Calculate overall returns
    const totalReturns = currentValue - totalInvested;
    const totalReturnsPercent = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    // 4. Calculate asset allocation percentages
    const assetAllocation = Object.entries(assetTypeMap).map(([type, value]) => ({
      assetType: type,
      value: value,
      percentage: currentValue > 0 ? (value / currentValue) * 100 : 0
    })).sort((a, b) => b.value - a.value);

    // 5. Calculate risk distribution
    const riskDistribution = Object.entries(riskLevelMap).reduce((acc, [level, value]) => {
      acc[level] = {
        value: value,
        percentage: currentValue > 0 ? (value / currentValue) * 100 : 0
      };
      return acc;
    }, {});

    return {
      totalInvested,
      currentValue,
      totalReturns,
      totalReturnsPercent,
      holdings: enrichedHoldings,
      assetAllocation,
      riskDistribution,
      totalHoldings: holdings.length,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting portfolio summary:', error);
    throw {
      code: 'PORTFOLIO_ERROR',
      message: 'Failed to retrieve portfolio summary',
      details: error.message
    };
  }
}

// =====================================================
// PORTFOLIO HOLDINGS
// =====================================================

/**
 * Get detailed holdings for a customer
 * 
 * @param {string} customerId - Customer UUID
 * @param {Object} options - Query options (assetType, sortBy, sortOrder)
 * @returns {Promise<Array>} Array of holdings
 */
async function getPortfolioHoldings(customerId, options = {}) {
  try {
    const { assetType, sortBy = 'total_invested', sortOrder = 'DESC' } = options;

    let query = `
      SELECT 
        ph.*,
        a.name as asset_name,
        a.code as asset_code,
        a.asset_type,
        a.price as latest_price,
        a.risk_level,
        a.description as asset_description
      FROM portfolio_holdings ph
      JOIN assets a ON ph.asset_id = a.id
      WHERE ph.customer_id = $1
        AND ph.total_units > 0
    `;

    const params = [customerId];

    // Filter by asset type
    if (assetType) {
      query += ` AND a.asset_type = $2`;
      params.push(assetType);
    }

    // Sort
    const validSortFields = ['total_invested', 'total_units', 'last_investment_date', 'asset_name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'total_invested';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${sortDirection}`;

    const holdings = await db.all(query, params);

    return holdings.map(holding => ({
      id: holding.id,
      assetId: holding.asset_id,
      assetName: holding.asset_name,
      assetCode: holding.asset_code,
      assetType: holding.asset_type,
      assetDescription: holding.asset_description,
      riskLevel: holding.risk_level,
      totalUnits: parseFloat(holding.total_units),
      totalInvested: parseFloat(holding.total_invested),
      averagePrice: parseFloat(holding.average_price),
      currentPrice: parseFloat(holding.latest_price || holding.current_price),
      marketValue: parseFloat(holding.total_units) * parseFloat(holding.latest_price || holding.current_price),
      returns: (parseFloat(holding.total_units) * parseFloat(holding.latest_price || holding.current_price)) - parseFloat(holding.total_invested),
      returnsPercent: parseFloat(holding.total_invested) > 0 ? 
        (((parseFloat(holding.total_units) * parseFloat(holding.latest_price || holding.current_price)) - parseFloat(holding.total_invested)) / parseFloat(holding.total_invested)) * 100 : 0,
      firstInvestmentDate: holding.first_investment_date,
      lastInvestmentDate: holding.last_investment_date,
      updatedAt: holding.updated_at
    }));
  } catch (error) {
    console.error('Error getting portfolio holdings:', error);
    throw {
      code: 'PORTFOLIO_ERROR',
      message: 'Failed to retrieve portfolio holdings',
      details: error.message
    };
  }
}

// =====================================================
// PORTFOLIO PERFORMANCE
// =====================================================

/**
 * Get portfolio performance over a time period
 * 
 * @param {string} customerId - Customer UUID
 * @param {string} period - Time period (7d, 30d, 90d, 1y, all)
 * @returns {Promise<Object>} Performance metrics and historical data
 */
async function getPortfolioPerformance(customerId, period = '30d') {
  try {
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date('2000-01-01'); // Far past date
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get all investments in the period
    const investments = await db.all(`
      SELECT 
        investment_date,
        investment_amount,
        status
      FROM investments
      WHERE customer_id = $1
        AND investment_date >= $2
        AND status IN ('COMPLETED', 'PENDING')
      ORDER BY investment_date ASC
    `, [customerId, startDate.toISOString()]);

    // Get current portfolio summary
    const summary = await getPortfolioSummary(customerId);

    // Calculate performance metrics
    const totalInvestmentInPeriod = investments.reduce((sum, inv) => 
      sum + parseFloat(inv.investment_amount), 0
    );

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      currentValue: summary.currentValue,
      totalInvested: summary.totalInvested,
      totalReturns: summary.totalReturns,
      totalReturnsPercent: summary.totalReturnsPercent,
      investmentsInPeriod: investments.length,
      totalInvestedInPeriod: totalInvestmentInPeriod,
      bestPerformingAsset: summary.holdings.length > 0 ? 
        summary.holdings.reduce((best, current) => 
          current.returnsPercent > best.returnsPercent ? current : best
        ) : null,
      worstPerformingAsset: summary.holdings.length > 0 ? 
        summary.holdings.reduce((worst, current) => 
          current.returnsPercent < worst.returnsPercent ? current : worst
        ) : null,
      historicalData: investments.map(inv => ({
        date: inv.investment_date,
        amount: parseFloat(inv.investment_amount),
        status: inv.status
      }))
    };
  } catch (error) {
    console.error('Error getting portfolio performance:', error);
    throw {
      code: 'PORTFOLIO_ERROR',
      message: 'Failed to retrieve portfolio performance',
      details: error.message
    };
  }
}

// =====================================================
// ASSET HOLDINGS DETAIL
// =====================================================

/**
 * Get detailed information about a specific asset holding
 * 
 * @param {string} customerId - Customer UUID
 * @param {string} assetId - Asset UUID
 * @returns {Promise<Object>} Detailed holding information with investment history
 */
async function getAssetHolding(customerId, assetId) {
  try {
    // Get holding
    const holding = await db.get(`
      SELECT 
        ph.*,
        a.name as asset_name,
        a.code as asset_code,
        a.asset_type,
        a.price as latest_price,
        a.risk_level,
        a.description as asset_description,
        a.min_investment,
        a.status as asset_status
      FROM portfolio_holdings ph
      JOIN assets a ON ph.asset_id = a.id
      WHERE ph.customer_id = $1
        AND ph.asset_id = $2
    `, [customerId, assetId]);

    if (!holding) {
      throw {
        code: 'HOLDING_NOT_FOUND',
        message: 'Asset holding not found',
        statusCode: 404
      };
    }

    // Get investment history for this asset
    const investments = await db.all(`
      SELECT 
        i.id,
        i.investment_amount,
        i.units_purchased,
        i.unit_price,
        i.fees,
        i.total_amount,
        i.status,
        i.investment_date,
        i.settlement_date,
        i.payment_method,
        p.reference_number as payment_reference,
        p.status as payment_status
      FROM investments i
      LEFT JOIN payments p ON i.id = p.investment_id
      WHERE i.customer_id = $1
        AND i.asset_id = $2
      ORDER BY i.investment_date DESC
    `, [customerId, assetId]);

    const units = parseFloat(holding.total_units);
    const latestPrice = parseFloat(holding.latest_price || holding.current_price);
    const marketValue = units * latestPrice;
    const invested = parseFloat(holding.total_invested);

    return {
      id: holding.id,
      assetId: holding.asset_id,
      assetName: holding.asset_name,
      assetCode: holding.asset_code,
      assetType: holding.asset_type,
      assetDescription: holding.asset_description,
      assetStatus: holding.asset_status,
      riskLevel: holding.risk_level,
      minInvestment: parseFloat(holding.min_investment),
      totalUnits: units,
      totalInvested: invested,
      averagePrice: parseFloat(holding.average_price),
      currentPrice: latestPrice,
      marketValue: marketValue,
      returns: marketValue - invested,
      returnsPercent: invested > 0 ? ((marketValue - invested) / invested) * 100 : 0,
      firstInvestmentDate: holding.first_investment_date,
      lastInvestmentDate: holding.last_investment_date,
      updatedAt: holding.updated_at,
      investmentHistory: investments.map(inv => ({
        id: inv.id,
        amount: parseFloat(inv.investment_amount),
        units: parseFloat(inv.units_purchased),
        unitPrice: parseFloat(inv.unit_price),
        fees: parseFloat(inv.fees),
        totalAmount: parseFloat(inv.total_amount),
        status: inv.status,
        investmentDate: inv.investment_date,
        settlementDate: inv.settlement_date,
        paymentMethod: inv.payment_method,
        paymentReference: inv.payment_reference,
        paymentStatus: inv.payment_status
      })),
      totalInvestments: investments.length
    };
  } catch (error) {
    if (error.code) throw error;
    console.error('Error getting asset holding:', error);
    throw {
      code: 'PORTFOLIO_ERROR',
      message: 'Failed to retrieve asset holding',
      details: error.message
    };
  }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getPortfolioSummary,
  getPortfolioHoldings,
  getPortfolioPerformance,
  getAssetHolding,
};

