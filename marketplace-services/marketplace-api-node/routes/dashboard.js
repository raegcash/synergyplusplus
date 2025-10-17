/**
 * Dashboard Routes - Enterprise Grade
 * API endpoints for dashboard and analytics
 * 
 * @version 1.0.0
 * @classification Production-Ready
 */

const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');
const { authMiddleware: authenticateToken } = require('../middleware/auth');

/**
 * GET /api/v1/dashboard/summary
 * Get complete dashboard summary with all metrics
 */
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    
    const summary = await dashboardService.getDashboardSummary(customerId);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve dashboard summary',
        reference: `REQ-${Date.now()}`
      }
    });
  }
});

/**
 * GET /api/v1/dashboard/activity?limit=10
 * Get recent activity feed
 */
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { limit = 10 } = req.query;
    
    const activity = await dashboardService.getRecentActivity(customerId, parseInt(limit));
    
    res.json({
      success: true,
      data: activity,
      count: activity.length
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve recent activity',
        reference: `REQ-${Date.now()}`
      }
    });
  }
});

/**
 * GET /api/v1/dashboard/trends?period=30d
 * Get investment trends over time
 */
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { period = '30d' } = req.query;
    
    const trends = await dashboardService.getInvestmentTrends(customerId, period);
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Investment trends error:', error);
    res.status(error.statusCode || 500).json({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve investment trends',
        reference: `REQ-${Date.now()}`
      }
    });
  }
});

module.exports = router;

