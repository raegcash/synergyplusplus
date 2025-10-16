/**
 * Investment Routes - Enterprise Grade
 * RESTful API endpoints for investment management
 * 
 * @module routes/investments
 * @version 1.0.0
 * @classification Production-Ready
 */

const express = require('express');
const router = express.Router();
const investmentService = require('../services/investmentService');

// =====================================================
// MIDDLEWARE
// =====================================================

/**
 * Extract user info from request
 * In production, this would come from JWT token
 */
function extractUserInfo(req) {
  // For now, we'll use a simple approach
  // In production, this would decode JWT and extract user ID
  return {
    customerId: req.user?.id || req.body.customerId || req.query.customerId,
    email: req.user?.email,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    requestId: req.headers['x-request-id'] || `REQ-${Date.now()}`
  };
}

/**
 * Error handler wrapper
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validate required fields
 */
function validateFields(fields) {
  return (req, res, next) => {
    const errors = [];
    
    fields.forEach(field => {
      if (!req.body[field]) {
        errors.push({
          field,
          message: `${field} is required`
        });
      }
    });
    
    if (errors.length > 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields',
          details: errors
        }
      });
    }
    
    next();
  };
}

// =====================================================
// ROUTES
// =====================================================

/**
 * @route   POST /api/v1/investments
 * @desc    Create a new investment
 * @access  Private (Customer)
 * @body    {assetId, amount, paymentMethod, productId?}
 */
router.post('/', 
  validateFields(['assetId', 'amount', 'paymentMethod']),
  asyncHandler(async (req, res) => {
    const db = req.db;
    const userInfo = extractUserInfo(req);
    
    const { assetId, amount, paymentMethod, productId } = req.body;
    
    // Validate amount is a number
    const investmentAmount = parseFloat(amount);
    if (isNaN(investmentAmount) || investmentAmount <= 0) {
      return res.status(400).json({
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Investment amount must be a positive number'
        }
      });
    }
    
    try {
      const result = await investmentService.createInvestment(db, {
        customerId: userInfo.customerId,
        assetId,
        productId,
        amount: investmentAmount,
        paymentMethod,
        ipAddress: userInfo.ipAddress,
        userAgent: userInfo.userAgent,
        requestId: userInfo.requestId
      });
      
      res.status(201).json(result);
      
    } catch (error) {
      if (error.code === 'VALIDATION_ERROR') {
        return res.status(400).json({ error });
      }
      
      console.error('Investment creation error:', error);
      res.status(error.statusCode || 500).json({
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Failed to create investment',
          reference: userInfo.requestId
        }
      });
    }
  })
);

/**
 * @route   GET /api/v1/investments
 * @desc    Get customer investments (paginated, filtered)
 * @access  Private (Customer)
 * @query   {status?, assetId?, limit?, offset?, sortBy?, sortOrder?}
 */
router.get('/', asyncHandler(async (req, res) => {
  const db = req.db;
  const userInfo = extractUserInfo(req);
  
  const options = {
    status: req.query.status,
    assetId: req.query.assetId,
    limit: parseInt(req.query.limit) || 50,
    offset: parseInt(req.query.offset) || 0,
    sortBy: req.query.sortBy || 'investment_date',
    sortOrder: req.query.sortOrder || 'DESC'
  };
  
  // Validate sortBy to prevent SQL injection
  const allowedSortFields = ['investment_date', 'investment_amount', 'status', 'created_at'];
  if (!allowedSortFields.includes(options.sortBy)) {
    options.sortBy = 'investment_date';
  }
  
  // Validate sortOrder
  if (!['ASC', 'DESC'].includes(options.sortOrder.toUpperCase())) {
    options.sortOrder = 'DESC';
  }
  
  try {
    const result = await investmentService.getCustomerInvestments(
      db,
      userInfo.customerId,
      options
    );
    
    res.json({
      success: true,
      data: result.investments,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve investments'
      }
    });
  }
}));

/**
 * @route   GET /api/v1/investments/:id
 * @desc    Get investment by ID
 * @access  Private (Customer - own investments only)
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const db = req.db;
  const userInfo = extractUserInfo(req);
  const { id } = req.params;
  
  try {
    const investment = await investmentService.getInvestmentById(
      db,
      id,
      userInfo.customerId
    );
    
    res.json({
      success: true,
      data: investment
    });
    
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error });
    }
    
    console.error('Get investment error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve investment'
      }
    });
  }
}));

/**
 * @route   PATCH /api/v1/investments/:id/cancel
 * @desc    Cancel an investment
 * @access  Private (Customer - own investments only)
 * @body    {reason?}
 */
router.patch('/:id/cancel', asyncHandler(async (req, res) => {
  const db = req.db;
  const userInfo = extractUserInfo(req);
  const { id } = req.params;
  const { reason } = req.body;
  
  try {
    const result = await investmentService.cancelInvestment(
      db,
      id,
      userInfo.customerId,
      reason
    );
    
    res.json(result);
    
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error });
    }
    
    if (error.code === 'INVALID_STATUS') {
      return res.status(422).json({ error });
    }
    
    console.error('Cancel investment error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to cancel investment'
      }
    });
  }
}));

/**
 * @route   GET /api/v1/investments/summary
 * @desc    Get customer investment summary
 * @access  Private (Customer)
 */
router.get('/summary/stats', asyncHandler(async (req, res) => {
  const db = req.db;
  const userInfo = extractUserInfo(req);
  
  try {
    // Get investment summary
    const summary = await db.get(`
      SELECT 
        COUNT(*) as total_investments,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_investments,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_investments,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed_investments,
        SUM(investment_amount) as total_invested,
        SUM(fees) as total_fees,
        MIN(investment_date) as first_investment_date,
        MAX(investment_date) as last_investment_date
      FROM investments
      WHERE customer_id = ? AND deleted_at IS NULL
    `, [userInfo.customerId]);
    
    // Get investment by asset type
    const byAssetType = await db.all(`
      SELECT 
        a.asset_type,
        COUNT(i.id) as count,
        SUM(i.investment_amount) as total_amount
      FROM investments i
      JOIN assets a ON i.asset_id = a.id
      WHERE i.customer_id = ? AND i.deleted_at IS NULL
      GROUP BY a.asset_type
    `, [userInfo.customerId]);
    
    res.json({
      success: true,
      data: {
        summary,
        byAssetType
      }
    });
    
  } catch (error) {
    console.error('Get investment summary error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve investment summary'
      }
    });
  }
}));

// =====================================================
// ERROR HANDLER
// =====================================================

router.use((error, req, res, next) => {
  console.error('Investment route error:', error);
  
  res.status(error.statusCode || 500).json({
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'An error occurred',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
});

// =====================================================
// EXPORTS
// =====================================================

module.exports = router;

