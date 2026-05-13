const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const winston = require('winston');

// JWT token verification middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: 'Access token is required' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: 'Invalid token - user not found' }
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: 'Account is deactivated' }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    winston.error(`Authentication error: ${error.message}`);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: 'Token expired' }
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: 'Invalid token' }
      });
    }

    return res.status(500).json({
      success: false,
      error: { code: 500, message: 'Internal server error during authentication' }
    });
  }
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: 'Authentication required' }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 403, message: 'Insufficient permissions' }
      });
    }

    next();
  };
};

// Admin-only middleware
const requireAdmin = requireRole(['admin']);

// Security or Admin role middleware
const requireSecurityOrAdmin = requireRole(['admin', 'security']);

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Don't fail the request if optional auth fails
    next();
  }
};

// Helper function to log admin actions
const logAdminAction = async (admin, actionType, target, status, description, userId, ipAddress) => {
  try {
    await AuditLog.logAction(admin, actionType, target, status, description, userId, ipAddress);
  } catch (error) {
    winston.error('Failed to log admin action:', error);
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireSecurityOrAdmin,
  optionalAuth,
  logAdminAction
};
