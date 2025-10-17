/**
 * Transaction Routes - Enterprise Grade
 * API endpoints for transaction history and management
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */

const express = require('express');
const router = express.Router();
const transactionService = require('../services/transactionService');
const { authMiddleware: authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management endpoints for customers
 */

/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Get customer transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INVESTMENT, WITHDRAWAL, DIVIDEND, FEE, ADJUSTMENT]
 *         description: Filter by transaction type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: assetId
 *         schema:
 *           type: string
 *         description: Filter by asset ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for date range filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for date range filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by reference number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of records per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Pagination offset
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [transaction_date, amount, status, transaction_type]
 *           default: transaction_date
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const filters = req.query;
    
    const result = await transactionService.getCustomerTransactions(customerId, filters);
    
    res.json({
      success: true,
      data: result.transactions,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve transactions',
        reference: `REQ-${Date.now()}`
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/transactions/statistics:
 *   get:
 *     summary: Get transaction statistics
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y, all]
 *           default: 30d
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { period = '30d' } = req.query;
    
    const stats = await transactionService.getTransactionStatistics(customerId, period);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve statistics',
        reference: `REQ-${Date.now()}`
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/transactions/:id:
 *   get:
 *     summary: Get transaction details
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction details retrieved successfully
 *       404:
 *         description: Transaction not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;
    
    const transaction = await transactionService.getTransactionById(id, customerId);
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    const statusCode = error.statusCode || (error.code === 'TRANSACTION_NOT_FOUND' ? 404 : 500);
    res.status(statusCode).json({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve transaction',
        reference: `REQ-${Date.now()}`
      }
    });
  }
});

module.exports = router;

