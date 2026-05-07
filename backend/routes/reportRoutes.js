
const express = require('express');
const { body, query } = require('express-validator');
const reportController = require('../controllers/reportController');
const { authenticateToken, requireSecurityOrAdmin, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const createCustomReportValidation = [
  body('title')
    .notEmpty()
    .withMessage('Report title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .notEmpty()
    .withMessage('Report description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('reportType')
    .optional()
    .isIn(['Threat Summary', 'Security Statistics', 'Incident Report', 'Compliance Report', 'Performance Metrics', 'ML Model Performance', 'Network Activity', 'Alert Summary', 'Trend Analysis', 'Custom'])
    .withMessage('Report type must be valid'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('format')
    .optional()
    .isIn(['JSON', 'PDF', 'CSV', 'HTML'])
    .withMessage('Format must be one of: JSON, PDF, CSV, HTML'),
  body('filters.severityLevels')
    .optional()
    .isArray()
    .withMessage('Severity levels must be an array'),
  body('filters.severityLevels.*')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Each severity level must be valid'),
  body('filters.threatTypes')
    .optional()
    .isArray()
    .withMessage('Threat types must be an array'),
  body('filters.status')
    .optional()
    .isArray()
    .withMessage('Status must be an array'),
  body('filters.status.*')
    .optional()
    .isIn(['Active', 'Investigating', 'Resolved', 'False Positive', 'Escalated'])
    .withMessage('Each status must be valid'),
  body('filters.sourceIPs')
    .optional()
    .isArray()
    .withMessage('Source IPs must be an array'),
  body('filters.sourceIPs.*')
    .optional()
    .isIP()
    .withMessage('Each source IP must be valid'),
  body('filters.destinationIPs')
    .optional()
    .isArray()
    .withMessage('Destination IPs must be an array'),
  body('filters.destinationIPs.*')
    .optional()
    .isIP()
    .withMessage('Each destination IP must be valid'),
  body('recipients')
    .optional()
    .isArray()
    .withMessage('Recipients must be an array'),
  body('recipients.*')
    .optional()
    .isMongoId()
    .withMessage('Each recipient must be a valid user ID')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('reportType')
    .optional()
    .isIn(['Threat Summary', 'Security Statistics', 'Incident Report', 'Compliance Report', 'Performance Metrics', 'ML Model Performance', 'Network Activity', 'Alert Summary', 'Trend Analysis', 'Custom'])
    .withMessage('Report type must be valid'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('format')
    .optional()
    .isIn(['JSON', 'PDF', 'CSV', 'HTML'])
    .withMessage('Format must be one of: JSON, PDF, CSV, HTML'),
  query('sortBy')
    .optional()
    .isIn(['generatedDate', 'reportType', 'title'])
    .withMessage('Sort field is invalid'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const generateReportValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (value && req.query.startDate && new Date(value) <= new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  query('format')
    .optional()
    .isIn(['JSON', 'PDF', 'CSV', 'HTML'])
    .withMessage('Format must be one of: JSON, PDF, CSV, HTML')
];

// Routes
router.get('/threat-summary', authenticateToken, generateReportValidation, reportController.generateThreatSummary);
router.get('/security-stats', authenticateToken, generateReportValidation, reportController.generateSecurityStats);
router.get('/', authenticateToken, queryValidation, reportController.getReports);
router.get('/:id', authenticateToken, reportController.getReportById);
router.post('/custom', authenticateToken, requireSecurityOrAdmin, createCustomReportValidation, reportController.createCustomReport);
router.delete('/:id', authenticateToken, requireAdmin, reportController.deleteReport);

module.exports = router;
