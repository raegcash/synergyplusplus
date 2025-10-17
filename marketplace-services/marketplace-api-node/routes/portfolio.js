/**
 * Portfolio Routes - Enterprise Grade
 * API endpoints for portfolio management
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */

const express = require('express');
const router = express.Router();
const portfolioService = require('../services/portfolioService');
const { authMiddleware: authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Portfolio
 *   description: Portfolio management endpoints for customers
 */

/**
 * @swagger
 * /api/v1/portfolio/summary:
 *   get:
 *     summary: Get portfolio summary
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portfolio summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalInvested: { type: number }
 *                     currentValue: { type: number }
 *                     totalReturns: { type: number }
 *                     totalReturnsPercent: { type: number }
 *                     holdings: { type: array }
 *                     assetAllocation: { type: array }
 *                     riskDistribution: { type: object }
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    
    const summary = await portfolioService.getPortfolioSummary(customerId);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Portfolio summary error:', error);
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve portfolio summary',
        reference: `REQ-${Date.now()}`
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/portfolio/holdings:
 *   get:
 *     summary: Get portfolio holdings
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: assetType
 *         schema:
 *           type: string
 *           enum: [UITF, STOCK, CRYPTO, BOND]
 *         description: Filter by asset type
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [total_invested, total_units, last_investment_date, asset_name]
 *           default: total_invested
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
 *         description: Holdings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/holdings', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { assetType, sortBy, sortOrder } = req.query;
    
    const holdings = await portfolioService.getPortfolioHoldings(customerId, {
      assetType,
      sortBy,
      sortOrder
    });
    
    res.json({
      success: true,
      data: holdings,
      count: holdings.length
    });
  } catch (error) {
    console.error('Portfolio holdings error:', error);
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve portfolio holdings',
        reference: `REQ-${Date.now()}`
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/portfolio/performance:
 *   get:
 *     summary: Get portfolio performance
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y, all]
 *           default: 30d
 *         description: Time period for performance analysis
 *     responses:
 *       200:
 *         description: Performance data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { period = '30d' } = req.query;
    
    const performance = await portfolioService.getPortfolioPerformance(customerId, period);
    
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Portfolio performance error:', error);
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve portfolio performance',
        reference: `REQ-${Date.now()}`
      }
    });
  }
});

/**
 * @swagger
 * /api/v1/portfolio/holdings/:assetId:
 *   get:
 *     summary: Get specific asset holding details
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Asset ID
 *     responses:
 *       200:
 *         description: Asset holding retrieved successfully
 *       404:
 *         description: Holding not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/holdings/:assetId', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { assetId } = req.params;
    
    const holding = await portfolioService.getAssetHolding(customerId, assetId);
    
    res.json({
      success: true,
      data: holding
    });
  } catch (error) {
    console.error('Asset holding error:', error);
    const statusCode = error.statusCode || (error.code === 'HOLDING_NOT_FOUND' ? 404 : 500);
    res.status(statusCode).json({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve asset holding',
        reference: `REQ-${Date.now()}`
      }
    });
  }
});

module.exports = router;

