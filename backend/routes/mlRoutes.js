const express = require('express');
const { body, query } = require('express-validator');
const mlController = require('../controllers/mlController');
const { authenticateToken, requireSecurityOrAdmin, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const predictThreatValidation = [
  body('logId')
    .isMongoId()
    .withMessage('Log ID must be a valid MongoDB ID')
];

const predictBatchValidation = [
  body('logIds')
    .isArray({ min: 1, max: 100 })
    .withMessage('Log IDs must be an array with 1-100 items'),
  body('logIds.*')
    .isMongoId()
    .withMessage('Each log ID must be a valid MongoDB ID')
];

const predictFromFeaturesValidation = [
  body('features')
    .isObject()
    .withMessage('Features must be an object'),
  body('features.packetSize')
    .optional()
    .isInt({ min: 0, max: 65535 })
    .withMessage('Packet size must be between 0 and 65535'),
  body('features.sourcePort')
    .optional()
    .isInt({ min: 0, max: 65535 })
    .withMessage('Source port must be between 0 and 65535'),
  body('features.destinationPort')
    .optional()
    .isInt({ min: 0, max: 65535 })
    .withMessage('Destination port must be between 0 and 65535'),
  body('features.protocol')
    .optional()
    .isIn(['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'FTP', 'SSH', 'DNS', 'SMTP', 'OTHER'])
    .withMessage('Protocol must be valid'),
  body('features.action')
    .optional()
    .isIn(['ALLOW', 'DENY', 'DROP', 'LOG', 'ALERT'])
    .withMessage('Action must be valid'),
  body('features.status')
    .optional()
    .isIn(['SUCCESS', 'FAILED', 'TIMEOUT', 'REJECTED', 'PENDING'])
    .withMessage('Status must be valid')
];

const trainModelValidation = [
  body('trainingData')
    .isArray({ min: 10 })
    .withMessage('Training data must be an array with at least 10 items'),
  body('trainingData.*.features')
    .isObject()
    .withMessage('Each training item must have features'),
  body('trainingData.*.label')
    .notEmpty()
    .withMessage('Each training item must have a label'),
  body('modelType')
    .optional()
    .isIn(['threat_detection', 'anomaly_detection', 'classification'])
    .withMessage('Model type must be valid')
];

const toggleFallbackValidation = [
  body('enabled')
    .isBoolean()
    .withMessage('Enabled must be a boolean value')
];

const queryValidation = [
  query('logId')
    .optional()
    .isMongoId()
    .withMessage('Log ID must be a valid MongoDB ID')
];

// Routes
router.post('/predict', authenticateToken, requireSecurityOrAdmin, predictThreatValidation, mlController.predictThreat);
router.post('/predict-batch', authenticateToken, requireSecurityOrAdmin, predictBatchValidation, mlController.predictBatchThreats);
router.post('/predict-features', authenticateToken, requireSecurityOrAdmin, predictFromFeaturesValidation, mlController.predictFromFeatures);
router.post('/train', authenticateToken, requireAdmin, trainModelValidation, mlController.trainModel);
router.get('/metrics', authenticateToken, requireSecurityOrAdmin, mlController.getModelMetrics);
router.get('/health', authenticateToken, requireSecurityOrAdmin, mlController.checkServiceHealth);
router.post('/fallback', authenticateToken, requireAdmin, toggleFallbackValidation, mlController.toggleFallbackMode);
router.get('/features-example', authenticateToken, queryValidation, mlController.getFeatureExample);

module.exports = router;
