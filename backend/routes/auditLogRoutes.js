const express = require('express');
const { body } = require('express-validator');
const auditLogController = require('../controllers/auditLogController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Validation middleware for creating audit logs
const validateAuditLog = [
  body('admin').trim().isLength({ min: 1, max: 100 }).withMessage('Admin name is required'),
  body('actionType').trim().isIn(['Login', 'Logout', 'Alert Acknowledge', 'Alert Escalation', 'Alert Resolution', 'Threat Status Change', 'Report Generation', 'Configuration Change', 'Zone Created', 'Zone Updated', 'Zone Deleted', 'User Created', 'User Updated', 'User Deleted']).withMessage('Invalid action type'),
  body('target').optional().trim().isLength({ max: 100 }).withMessage('Target must be 100 characters or less'),
  body('status').trim().isIn(['Success', 'Failed', 'Pending']).withMessage('Invalid status'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description is required'),
  body('ipAddress').optional().isIP().withMessage('Valid IP address required')
];

// GET /api/audit/logs - Get all audit logs with filtering and pagination
router.get('/logs', 
  authenticateToken,
  requireAdmin,
  auditLogController.getAuditLogs
);

// GET /api/audit/stats - Get audit statistics
router.get('/stats', 
  authenticateToken,
  requireAdmin,
  auditLogController.getAuditStats
);

// POST /api/audit/logs - Create new audit log entry (admin only)
router.post('/logs', 
  authenticateToken,
  requireAdmin,
  validateAuditLog,
  auditLogController.createAuditLog
);

module.exports = router;
