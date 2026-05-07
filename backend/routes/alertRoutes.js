const express = require('express');
const { body, query } = require('express-validator');
const alertController = require('../controllers/alertController');
const { authenticateToken, requireSecurityOrAdmin, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const updateAlertValidation = [
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be one of: Low, Medium, High, Critical'),
  body('status')
    .optional()
    .isIn(['Open', 'Acknowledged', 'In Progress', 'Resolved', 'Dismissed'])
    .withMessage('Status must be one of: Open, Acknowledged, In Progress, Resolved, Dismissed'),
  body('message')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  body('alertType')
    .optional()
    .isIn(['Threat Detected', 'System Alert', 'Performance Issue', 'Security Breach', 'Anomaly Detected'])
    .withMessage('Alert type must be valid'),
  body('source')
    .optional()
    .isIn(['Rule-Based Engine', 'ML Model', 'Manual', 'IDS/IPS', 'Firewall', 'Antivirus'])
    .withMessage('Source must be valid')
];

const assignAlertValidation = [
  body('assignedTo')
    .isMongoId()
    .withMessage('Assigned to must be a valid user ID')
];

const resolveAlertValidation = [
  body('resolutionNotes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Resolution notes cannot exceed 2000 characters')
];

const escalateAlertValidation = [
  body('escalationLevel')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Escalation level must be between 0 and 5')
];

const dismissAlertValidation = [
  body('dismissalReason')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Dismissal reason cannot exceed 1000 characters')
];

const bulkResolveValidation = [
  body('alertIds')
    .isArray({ min: 1 })
    .withMessage('Alert IDs must be a non-empty array'),
  body('alertIds.*')
    .isMongoId()
    .withMessage('Each alert ID must be a valid MongoDB ID'),
  body('resolutionNotes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Resolution notes cannot exceed 2000 characters')
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
  query('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be valid'),
  query('status')
    .optional()
    .isIn(['Open', 'Acknowledged', 'In Progress', 'Resolved', 'Dismissed'])
    .withMessage('Status must be valid'),
  query('alertType')
    .optional()
    .isIn(['Threat Detected', 'System Alert', 'Performance Issue', 'Security Breach', 'Anomaly Detected'])
    .withMessage('Alert type must be valid'),
  query('source')
    .optional()
    .isIn(['Rule-Based Engine', 'ML Model', 'Manual', 'IDS/IPS', 'Firewall', 'Antivirus'])
    .withMessage('Source must be valid'),
  query('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned to must be a valid user ID'),
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
    .isIn(['timestamp', 'priority', 'status', 'alertType', 'escalationLevel'])
    .withMessage('Sort field is invalid'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Routes
router.get('/', authenticateToken, queryValidation, alertController.getAlerts);
router.get('/stats', authenticateToken, queryValidation, alertController.getAlertStats);
router.get('/threat/:threatId', authenticateToken, alertController.getAlertsByThreat);
router.get('/:id', authenticateToken, alertController.getAlertById);
router.put('/:id', authenticateToken, requireSecurityOrAdmin, updateAlertValidation, alertController.updateAlert);
router.put('/:id/acknowledge', authenticateToken, requireSecurityOrAdmin, alertController.acknowledgeAlert);
router.put('/:id/resolve', authenticateToken, requireSecurityOrAdmin, resolveAlertValidation, alertController.resolveAlert);
router.put('/:id/escalate', authenticateToken, requireAdmin, escalateAlertValidation, alertController.escalateAlert);
router.put('/:id/assign', authenticateToken, requireSecurityOrAdmin, assignAlertValidation, alertController.assignAlert);
router.put('/:id/dismiss', authenticateToken, requireSecurityOrAdmin, dismissAlertValidation, alertController.dismissAlert);
router.post('/bulk-resolve', authenticateToken, requireSecurityOrAdmin, bulkResolveValidation, alertController.bulkResolveAlerts);
router.delete('/:id', authenticateToken, requireAdmin, alertController.deleteAlert);

module.exports = router;
