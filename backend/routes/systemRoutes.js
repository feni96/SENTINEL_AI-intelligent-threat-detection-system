const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getSystemHealth,
  getTrafficSummary,
  getConnectionStats,
  getLogsAnalyzed,
  getAuditLogsSummary
} = require('../controllers/systemController');

/**
 * System Health Routes
 * All routes require authentication
 */

// @route   GET /api/system/health
// @desc    Get system health and uptime
// @access  Private
router.get('/health', authenticateToken, getSystemHealth);

// @route   GET /api/traffic/summary
// @desc    Get traffic summary for dashboard chart
// @access  Private
router.get('/traffic/summary', authenticateToken, getTrafficSummary);

// @route   GET /api/connections/stats
// @desc    Get real-time connection statistics
// @access  Private
router.get('/connections/stats', authenticateToken, getConnectionStats);

// @route   GET /api/system/logs-analyzed
// @desc    Get count of analyzed logs
// @access  Private
router.get('/logs-analyzed', authenticateToken, getLogsAnalyzed);

// @route   GET /api/system/audit-logs-summary
// @desc    Get audit logs summary and statistics
// @access  Private
router.get('/audit-logs-summary', authenticateToken, getAuditLogsSummary);

module.exports = router;
