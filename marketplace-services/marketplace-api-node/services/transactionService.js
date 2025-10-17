/**
 * Transaction Service - Enterprise Grade
 * Handles all transaction-related business logic
 * 
 * @module services/transactionService
 * @version 1.0.0
 * @classification Production-Ready
 */

const db = require('../config/db-compat');

// =====================================================
// TRANSACTION LIST
// =====================================================

/**
 * Get customer transactions with filtering and pagination
 * 
 * @param {string} customerId - Customer UUID
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} Paginated transactions with metadata
 */
async function getCustomerTransactions(customerId, filters = {}) {
  try {
    const {
      type,           // Transaction type filter
      status,         // Status filter
      assetId,        // Asset filter
      startDate,      // Date range start
      endDate,        // Date range end
      search,         // Search by reference number
      limit = 50,
      offset = 0,
      sortBy = 'transaction_date',
      sortOrder = 'DESC'
    } = filters;

    // Build query
    let query = `
      SELECT 
        t.id,
        t.transaction_type,
        t.amount,
        t.units,
        t.unit_price,
        t.status,
        t.description,
        t.reference_number,
        t.transaction_date,
        t.metadata,
        a.name as asset_name,
        a.code as asset_code,
        a.asset_type,
        i.id as investment_id,
        i.payment_method,
        i.fees
      FROM transactions t
      LEFT JOIN assets a ON t.asset_id = a.id
      LEFT JOIN investments i ON t.investment_id = i.id
      WHERE t.customer_id = $1
    `;

    const params = [customerId];
    let paramIndex = 2;

    // Add filters
    if (type) {
      query += ` AND t.transaction_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (assetId) {
      query += ` AND t.asset_id = $${paramIndex}`;
      params.push(assetId);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND t.transaction_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND t.transaction_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (search) {
      query += ` AND t.reference_number ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count before pagination
    const countQuery = query.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await db.get(countQuery, params);
    const total = parseInt(countResult.total);

    // Add sorting and pagination
    const validSortFields = ['transaction_date', 'amount', 'status', 'transaction_type'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'transaction_date';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY t.${sortField} ${sortDirection}`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const transactions = await db.all(query, params);

    return {
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.transaction_type,
        amount: parseFloat(t.amount),
        units: t.units ? parseFloat(t.units) : null,
        unitPrice: t.unit_price ? parseFloat(t.unit_price) : null,
        status: t.status,
        description: t.description,
        referenceNumber: t.reference_number,
        transactionDate: t.transaction_date,
        assetName: t.asset_name,
        assetCode: t.asset_code,
        assetType: t.asset_type,
        investmentId: t.investment_id,
        paymentMethod: t.payment_method,
        fees: t.fees ? parseFloat(t.fees) : null,
        metadata: t.metadata ? JSON.parse(t.metadata) : null
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1
      }
    };
  } catch (error) {
    console.error('Error getting customer transactions:', error);
    throw {
      code: 'TRANSACTION_ERROR',
      message: 'Failed to retrieve transactions',
      details: error.message
    };
  }
}

// =====================================================
// TRANSACTION DETAIL
// =====================================================

/**
 * Get detailed information about a specific transaction
 * 
 * @param {string} transactionId - Transaction UUID
 * @param {string} customerId - Customer UUID (for authorization)
 * @returns {Promise<Object>} Detailed transaction information
 */
async function getTransactionById(transactionId, customerId) {
  try {
    const transaction = await db.get(`
      SELECT 
        t.*,
        a.name as asset_name,
        a.code as asset_code,
        a.asset_type,
        a.description as asset_description,
        i.id as investment_id,
        i.investment_amount,
        i.units_purchased,
        i.unit_price as investment_unit_price,
        i.fees as investment_fees,
        i.total_amount as investment_total,
        i.payment_method,
        i.investment_date,
        i.settlement_date,
        p.id as payment_id,
        p.reference_number as payment_reference,
        p.status as payment_status,
        p.initiated_at as payment_initiated,
        p.completed_at as payment_completed
      FROM transactions t
      LEFT JOIN assets a ON t.asset_id = a.id
      LEFT JOIN investments i ON t.investment_id = i.id
      LEFT JOIN payments p ON i.id = p.investment_id
      WHERE t.id = $1
        AND t.customer_id = $2
    `, [transactionId, customerId]);

    if (!transaction) {
      throw {
        code: 'TRANSACTION_NOT_FOUND',
        message: 'Transaction not found',
        statusCode: 404
      };
    }

    return {
      id: transaction.id,
      type: transaction.transaction_type,
      amount: parseFloat(transaction.amount),
      units: transaction.units ? parseFloat(transaction.units) : null,
      unitPrice: transaction.unit_price ? parseFloat(transaction.unit_price) : null,
      status: transaction.status,
      description: transaction.description,
      referenceNumber: transaction.reference_number,
      transactionDate: transaction.transaction_date,
      metadata: transaction.metadata ? JSON.parse(transaction.metadata) : null,
      asset: transaction.asset_id ? {
        id: transaction.asset_id,
        name: transaction.asset_name,
        code: transaction.asset_code,
        type: transaction.asset_type,
        description: transaction.asset_description
      } : null,
      investment: transaction.investment_id ? {
        id: transaction.investment_id,
        amount: parseFloat(transaction.investment_amount),
        unitsPurchased: parseFloat(transaction.units_purchased),
        unitPrice: parseFloat(transaction.investment_unit_price),
        fees: parseFloat(transaction.investment_fees),
        totalAmount: parseFloat(transaction.investment_total),
        paymentMethod: transaction.payment_method,
        investmentDate: transaction.investment_date,
        settlementDate: transaction.settlement_date
      } : null,
      payment: transaction.payment_id ? {
        id: transaction.payment_id,
        referenceNumber: transaction.payment_reference,
        status: transaction.payment_status,
        initiatedAt: transaction.payment_initiated,
        completedAt: transaction.payment_completed
      } : null,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at
    };
  } catch (error) {
    if (error.code) throw error;
    console.error('Error getting transaction:', error);
    throw {
      code: 'TRANSACTION_ERROR',
      message: 'Failed to retrieve transaction',
      details: error.message
    };
  }
}

// =====================================================
// TRANSACTION STATISTICS
// =====================================================

/**
 * Get transaction statistics for a customer
 * 
 * @param {string} customerId - Customer UUID
 * @param {string} period - Time period (7d, 30d, 90d, 1y, all)
 * @returns {Promise<Object>} Transaction statistics
 */
async function getTransactionStatistics(customerId, period = '30d') {
  try {
    // Calculate date range
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
        startDate = new Date('2000-01-01');
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get statistics
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN transaction_type = 'INVESTMENT' THEN 1 END) as investments,
        COUNT(CASE WHEN transaction_type = 'WITHDRAWAL' THEN 1 END) as withdrawals,
        COUNT(CASE WHEN transaction_type = 'DIVIDEND' THEN 1 END) as dividends,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed,
        COALESCE(SUM(CASE WHEN transaction_type = 'INVESTMENT' AND status = 'COMPLETED' THEN amount ELSE 0 END), 0) as total_invested,
        COALESCE(SUM(CASE WHEN transaction_type = 'WITHDRAWAL' AND status = 'COMPLETED' THEN amount ELSE 0 END), 0) as total_withdrawn,
        COALESCE(SUM(CASE WHEN transaction_type = 'DIVIDEND' AND status = 'COMPLETED' THEN amount ELSE 0 END), 0) as total_dividends
      FROM transactions
      WHERE customer_id = $1
        AND transaction_date >= $2
    `, [customerId, startDate.toISOString()]);

    // Get transaction by type breakdown
    const typeBreakdown = await db.all(`
      SELECT 
        transaction_type,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM transactions
      WHERE customer_id = $1
        AND transaction_date >= $2
        AND status = 'COMPLETED'
      GROUP BY transaction_type
      ORDER BY total_amount DESC
    `, [customerId, startDate.toISOString()]);

    // Get recent transactions
    const recentTransactions = await db.all(`
      SELECT 
        t.id,
        t.transaction_type,
        t.amount,
        t.status,
        t.reference_number,
        t.transaction_date,
        a.name as asset_name,
        a.code as asset_code
      FROM transactions t
      LEFT JOIN assets a ON t.asset_id = a.id
      WHERE t.customer_id = $1
      ORDER BY t.transaction_date DESC
      LIMIT 5
    `, [customerId]);

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      totalTransactions: parseInt(stats.total_transactions),
      byType: {
        investments: parseInt(stats.investments),
        withdrawals: parseInt(stats.withdrawals),
        dividends: parseInt(stats.dividends)
      },
      byStatus: {
        completed: parseInt(stats.completed),
        pending: parseInt(stats.pending),
        failed: parseInt(stats.failed)
      },
      amounts: {
        totalInvested: parseFloat(stats.total_invested),
        totalWithdrawn: parseFloat(stats.total_withdrawn),
        totalDividends: parseFloat(stats.total_dividends)
      },
      typeBreakdown: typeBreakdown.map(t => ({
        type: t.transaction_type,
        count: parseInt(t.count),
        totalAmount: parseFloat(t.total_amount)
      })),
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        type: t.transaction_type,
        amount: parseFloat(t.amount),
        status: t.status,
        referenceNumber: t.reference_number,
        transactionDate: t.transaction_date,
        assetName: t.asset_name,
        assetCode: t.asset_code
      }))
    };
  } catch (error) {
    console.error('Error getting transaction statistics:', error);
    throw {
      code: 'TRANSACTION_ERROR',
      message: 'Failed to retrieve transaction statistics',
      details: error.message
    };
  }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getCustomerTransactions,
  getTransactionById,
  getTransactionStatistics,
};

