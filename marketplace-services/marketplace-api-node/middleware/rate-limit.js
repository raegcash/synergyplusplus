/**
 * Rate Limiting Middleware
 * Protects API from abuse and DDoS attacks
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again after 15 minutes',
      requestId: req.correlationId,
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Strict login rate limiter
 * 5 attempts per 15 minutes per IP
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    success: false,
    error: 'TOO_MANY_LOGIN_ATTEMPTS',
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit exceeded for login from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'TOO_MANY_LOGIN_ATTEMPTS',
      message: 'Too many login attempts from this IP. Please try again after 15 minutes',
      requestId: req.correlationId,
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Write operation rate limiter
 * 30 requests per 15 minutes (for POST, PUT, DELETE)
 */
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_WRITE_REQUESTS',
    message: 'Too many write operations, please try again later',
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'TOO_MANY_WRITE_REQUESTS',
      message: 'Too many write operations from this IP, please try again later',
      requestId: req.correlationId,
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Sensitive operation rate limiter
 * 10 requests per hour (for sensitive operations like password reset)
 */
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_SENSITIVE_REQUESTS',
    message: 'Too many requests for sensitive operations',
  },
  handler: (req, res) => {
    console.warn(`⚠️ Sensitive operation rate limit exceeded from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'TOO_MANY_SENSITIVE_REQUESTS',
      message: 'Too many requests for sensitive operations. Please try again in an hour',
      requestId: req.correlationId,
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Public endpoint rate limiter (more lenient)
 * 200 requests per 15 minutes
 */
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests, please try again later',
  }
});

module.exports = {
  apiLimiter,
  loginLimiter,
  writeLimiter,
  sensitiveLimiter,
  publicLimiter
};



