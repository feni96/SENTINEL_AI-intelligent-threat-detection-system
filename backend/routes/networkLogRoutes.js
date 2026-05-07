const express = require('express');
const { body, query } = require('express-validator');
const networkLogController = require('../controllers/networkLogController');
const { authenticateToken, requireSecurityOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const createLogValidation = [
  body('sourceIP')
    .isIP()
    .withMessage('Source IP must be a valid IP address'),
  body('destinationIP')
    .isIP()
    .withMessage('Destination IP must be a valid IP address'),
  body('protocol')
    .isIn(['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'FTP', 'SSH', 'DNS', 'SMTP', 'OTHER'])
    .withMessage('Protocol must be one of: TCP, UDP, ICMP, HTTP, HTTPS, FTP, SSH, DNS, SMTP, OTHER'),
  body('packetSize')
    .isInt({ min: 0, max: 65535 })
    .withMessage('Packet size must be between 0 and 65535'),
  body('action')
    .optional()
    .isIn(['ALLOW', 'DENY', 'DROP', 'LOG', 'ALERT'])
    .withMessage('Action must be one of: ALLOW, DENY, DROP, LOG, ALERT'),
  body('status')
    .optional()
    .isIn(['SUCCESS', 'FAILED', 'TIMEOUT', 'REJECTED', 'PENDING'])
    .withMessage('Status must be one of: SUCCESS, FAILED, TIMEOUT, REJECTED, PENDING'),
  body('sourcePort')
    .optional()
    .isInt({ min: 0, max: 65535 })
    .withMessage('Source port must be between 0 and 65535'),
  body('destinationPort')
    .optional()
    .isInt({ min: 0, max: 65535 })
    .withMessage('Destination port must be between 0 and 65535'),
  body('flags')
    .optional()
    .isArray()
    .withMessage('Flags must be an array'),
  body('flags.*')
    .optional()
    .isIn(['SYN', 'ACK', 'FIN', 'RST', 'URG', 'PSH'])
    .withMessage('Each flag must be one of: SYN, ACK, FIN, RST, URG, PSH'),
  body('payload')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Payload cannot exceed 1000 characters')
];

const bulkCreateValidation = [
  body('logs')
    .isArray({ min: 1 })
    .withMessage('Logs must be a non-empty array'),
  body('logs.*.sourceIP')
    .isIP()
    .withMessage('Source IP must be a valid IP address'),
  body('logs.*.destinationIP')
    .isIP()
    .withMessage('Destination IP must be a valid IP address'),
  body('logs.*.protocol')
    .isIn(['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'FTP', 'SSH', 'DNS', 'SMTP', 'OTHER'])
    .withMessage('Protocol must be one of: TCP, UDP, ICMP, HTTP, HTTPS, FTP, SSH, DNS, SMTP, OTHER'),
  body('logs.*.packetSize')
    .isInt({ min: 0, max: 65535 })
    .withMessage('Packet size must be between 0 and 65535')
];

const updateLogValidation = [
  body('action')
    .optional()
    .isIn(['ALLOW', 'DENY', 'DROP', 'LOG', 'ALERT'])
    .withMessage('Action must be one of: ALLOW, DENY, DROP, LOG, ALERT'),
  body('status')
    .optional()
    .isIn(['SUCCESS', 'FAILED', 'TIMEOUT', 'REJECTED', 'PENDING'])
    .withMessage('Status must be one of: SUCCESS, FAILED, TIMEOUT, REJECTED, PENDING'),
  body('payload')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Payload cannot exceed 1000 characters')
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
  query('sourceIP')
    .optional()
    .isIP()
    .withMessage('Source IP must be a valid IP address'),
  query('destinationIP')
    .optional()
    .isIP()
    .withMessage('Destination IP must be a valid IP address'),
  query('protocol')
    .optional()
    .isIn(['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'FTP', 'SSH', 'DNS', 'SMTP', 'OTHER'])
    .withMessage('Protocol must be valid'),
  query('action')
    .optional()
    .isIn(['ALLOW', 'DENY', 'DROP', 'LOG', 'ALERT'])
    .withMessage('Action must be valid'),
  query('status')
    .optional()
    .isIn(['SUCCESS', 'FAILED', 'TIMEOUT', 'REJECTED', 'PENDING'])
    .withMessage('Status must be valid'),
  query('threatDetected')
    .optional()
    .isBoolean()
    .withMessage('Threat detected must be boolean'),
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
    .isIn(['timestamp', 'sourceIP', 'destinationIP', 'protocol', 'packetSize', 'action', 'status'])
    .withMessage('Sort field is invalid'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Routes
router.post('/', authenticateToken, requireSecurityOrAdmin, createLogValidation, networkLogController.createNetworkLog);
router.post('/bulk', authenticateToken, requireSecurityOrAdmin, bulkCreateValidation, networkLogController.createMultipleNetworkLogs);
router.get('/', authenticateToken, queryValidation, networkLogController.getNetworkLogs);
router.get('/stats', authenticateToken, queryValidation, networkLogController.getNetworkLogsStats);
router.get('/:id', authenticateToken, networkLogController.getNetworkLogById);
router.put('/:id', authenticateToken, requireSecurityOrAdmin, updateLogValidation, networkLogController.updateNetworkLog);
router.delete('/:id', authenticateToken, requireSecurityOrAdmin, networkLogController.deleteNetworkLog);

module.exports = router;
