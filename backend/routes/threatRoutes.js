const express = require('express');
const { body, query } = require('express-validator');
const threatController = require('../controllers/threatController');
const { authenticateToken, requireSecurityOrAdmin, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const updateThreatValidation = [
  body('severityLevel')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Severity level must be one of: Low, Medium, High, Critical'),
  body('status')
    .optional()
    .isIn(['Active', 'Investigating', 'Resolved', 'False Positive', 'Escalated'])
    .withMessage('Status must be one of: Active, Investigating, Resolved, False Positive, Escalated'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('areaName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Area name cannot exceed 100 characters'),
  body('zoneType')
    .optional()
    .isIn(['Internal', 'DMZ', 'External', 'Critical Infrastructure', 'User Network'])
    .withMessage('Zone type must be valid'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('affectedSystems')
    .optional()
    .isArray()
    .withMessage('Affected systems must be an array')
];

const assignThreatValidation = [
  body('assignedTo')
    .isMongoId()
    .withMessage('Assigned to must be a valid user ID')
];

const resolveThreatValidation = [
  body('resolutionNotes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Resolution notes cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['Resolved', 'Investigating'])
    .withMessage('Status must be Resolved or Investigating')
];

const falsePositiveValidation = [
  body('falsePositiveReason')
    .isLength({ min: 5, max: 500 })
    .withMessage('False positive reason must be between 5 and 500 characters')
];

const escalateThreatValidation = [
  body('escalationNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Escalation notes cannot exceed 1000 characters')
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
  query('threatType')
    .optional()
    .isIn(['DDoS', 'Brute Force', 'SQL Injection', 'XSS', 'Port Scan', 'Malware', 'Phishing', 'Man-in-the-Middle', 'DNS Spoofing', 'Zero-Day Exploit', 'Reconnaissance', 'Data Exfiltration', 'Suspicious Activity', 'Anomaly'])
    .withMessage('Threat type must be valid'),
  query('severityLevel')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Severity level must be valid'),
  query('status')
    .optional()
    .isIn(['Active', 'Investigating', 'Resolved', 'False Positive', 'Escalated'])
    .withMessage('Status must be valid'),
  query('sourceIP')
    .optional()
    .isIP()
    .withMessage('Source IP must be a valid IP address'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('sortBy')
    .optional()
    .isIn(['timestamp', 'threatType', 'severityLevel', 'confidenceScore', 'status'])
    .withMessage('Sort field is invalid'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('mlPredicted')
    .optional()
    .isBoolean()
    .withMessage('ML predicted must be boolean'),
  query('ruleBased')
    .optional()
    .isBoolean()
    .withMessage('Rule based must be boolean')
];

// Create threat validation
const createThreatValidation = [
  body('threatType').notEmpty().withMessage('Threat type is required'),
  body('sourceIP').isIP().withMessage('Valid source IP is required'),
  body('destinationIP').optional().isIP().withMessage('Valid destination IP is required'),
  body('severityLevel').isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Valid severity level is required'),
  body('confidenceScore').isInt({ min: 0, max: 100 }).withMessage('Confidence score must be 0-100'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters')
];

// ML prediction validation
const mlPredictionValidation = [
  body('sourceIP').isIP().withMessage('Valid source IP is required'),
  body('destinationIP').optional().isIP().withMessage('Valid destination IP is required'),
  body('prediction').notEmpty().withMessage('Prediction is required'),
  body('confidence').isFloat({ min: 0, max: 1 }).withMessage('Confidence must be 0-1'),
  body('riskScore').isFloat({ min: 0, max: 1 }).withMessage('Risk score must be 0-1')
];

// Routes
router.get('/', authenticateToken, queryValidation, threatController.getThreats);
router.get('/stats', authenticateToken, queryValidation, threatController.getThreatStats);
router.get('/:id', authenticateToken, threatController.getThreatById);
router.get('/:id/related-logs', authenticateToken, threatController.getThreatRelatedLogs);
router.get('/:id/investigation', authenticateToken, threatController.getThreatInvestigation);
router.post('/', authenticateToken, requireSecurityOrAdmin, createThreatValidation, threatController.createThreat);
router.post('/ml-prediction', authenticateToken, mlPredictionValidation, threatController.processMLPrediction);
router.put('/:id', authenticateToken, requireSecurityOrAdmin, updateThreatValidation, threatController.updateThreat);
router.put('/:id/assign', authenticateToken, requireSecurityOrAdmin, assignThreatValidation, threatController.assignThreat);
router.put('/:id/resolve', authenticateToken, requireSecurityOrAdmin, resolveThreatValidation, threatController.resolveThreat);
router.put('/:id/false-positive', authenticateToken, requireSecurityOrAdmin, falsePositiveValidation, threatController.markAsFalsePositive);
router.put('/:id/escalate', authenticateToken, requireSecurityOrAdmin, escalateThreatValidation, threatController.escalateThreat);
router.delete('/:id', authenticateToken, requireAdmin, threatController.deleteThreat);

module.exports = router;
