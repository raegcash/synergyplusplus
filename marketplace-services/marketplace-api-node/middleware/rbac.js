/**
 * Role-Based Access Control (RBAC) Middleware
 * Implements role and permission-based authorization
 */

/**
 * Require specific roles
 * @param {...string} allowedRoles - Allowed roles
 * @returns {Function} Express middleware
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication is required to access this resource',
        requestId: req.correlationId
      });
    }
    
    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      console.warn(`Access denied for user ${req.user.email}. Required roles: ${allowedRoles.join(', ')}`);
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        requestId: req.correlationId
      });
    }
    
    next();
  };
};

/**
 * Require specific permission
 * @param {string} permission - Required permission
 * @returns {Function} Express middleware
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication is required to access this resource',
        requestId: req.correlationId
      });
    }
    
    const userPermissions = req.user.permissions || [];
    
    if (!userPermissions.includes(permission)) {
      console.warn(`Access denied for user ${req.user.email}. Required permission: ${permission}`);
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: `This action requires the following permission: ${permission}`,
        requestId: req.correlationId
      });
    }
    
    next();
  };
};

/**
 * Require any of the specified permissions
 * @param {...string} permissions - Required permissions (at least one)
 * @returns {Function} Express middleware
 */
const requireAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication is required to access this resource',
        requestId: req.correlationId
      });
    }
    
    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some(perm => userPermissions.includes(perm));
    
    if (!hasPermission) {
      console.warn(`Access denied for user ${req.user.email}. Required permissions (any): ${permissions.join(', ')}`);
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: `This action requires at least one of the following permissions: ${permissions.join(', ')}`,
        requestId: req.correlationId
      });
    }
    
    next();
  };
};

/**
 * Require all of the specified permissions
 * @param {...string} permissions - Required permissions (all)
 * @returns {Function} Express middleware
 */
const requireAllPermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication is required to access this resource',
        requestId: req.correlationId
      });
    }
    
    const userPermissions = req.user.permissions || [];
    const hasAllPermissions = permissions.every(perm => userPermissions.includes(perm));
    
    if (!hasAllPermissions) {
      const missing = permissions.filter(perm => !userPermissions.includes(perm));
      console.warn(`Access denied for user ${req.user.email}. Missing permissions: ${missing.join(', ')}`);
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: `This action requires all of the following permissions: ${permissions.join(', ')}`,
        requestId: req.correlationId
      });
    }
    
    next();
  };
};

/**
 * Check if user owns the resource
 * Useful for user-specific endpoints
 * @param {Function} getResourceOwnerId - Function to get resource owner ID from request
 * @returns {Function} Express middleware
 */
const requireOwnership = (getResourceOwnerId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication is required to access this resource',
        requestId: req.correlationId
      });
    }
    
    const resourceOwnerId = getResourceOwnerId(req);
    
    // Allow if user is admin or owns the resource
    const isAdmin = req.user.roles.includes('ADMIN') || req.user.permissions.includes('system.admin');
    const isOwner = resourceOwnerId === req.user.id;
    
    if (!isAdmin && !isOwner) {
      console.warn(`Access denied for user ${req.user.email}. Not owner of resource.`);
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'You do not have permission to access this resource',
        requestId: req.correlationId
      });
    }
    
    next();
  };
};

module.exports = {
  requireRole,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireOwnership
};



