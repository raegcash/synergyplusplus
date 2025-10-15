/**
 * Authentication Middleware
 * Implements JWT verification and user authentication
 */

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'superapp-secret-key-change-in-production';

/**
 * Required authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Please provide a valid authentication token',
        requestId: req.correlationId
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Your session has expired. Please login again.',
        requestId: req.correlationId
      });
    }
    
    // Add user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      roles: decoded.roles || [],
      permissions: decoded.permissions || []
    };
    
    // Add correlation ID for tracing
    if (!req.correlationId) {
      req.correlationId = req.headers['x-correlation-id'] || 
                         `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Add to response headers
    res.setHeader('X-Correlation-ID', req.correlationId);
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Your session has expired. Please login again.',
        requestId: req.correlationId
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Authentication token is invalid',
        requestId: req.correlationId
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'AUTHENTICATION_FAILED',
      message: 'An error occurred during authentication',
      requestId: req.correlationId
    });
  }
};

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Add correlation ID
  if (!req.correlationId) {
    req.correlationId = req.headers['x-correlation-id'] || 
                       `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  res.setHeader('X-Correlation-ID', req.correlationId);
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        roles: decoded.roles || [],
        permissions: decoded.permissions || []
      };
    } catch (error) {
      // Token invalid but don't fail
      req.user = null;
    }
  } else {
    req.user = null;
  }
  
  next();
};

/**
 * Correlation ID middleware
 * Adds correlation ID to all requests
 */
const correlationId = (req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || 
                     `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
  correlationId
};



