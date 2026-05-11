const express = require('express');
const { body, query } = require('express-validator');
const mlController = require('../controllers/mlController');
const { authenticateToken, requireSecurityOrAdmin, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MLPrediction:
 *       type: object
 *       properties:
 *         prediction:
 *           type: string
 *           description: The predicted threat type
 *           example: "DoS"
 *         confidence:
 *           type: number
 *           description: Confidence score (0-1)
 *           example: 0.95
 *         risk_score:
 *           type: number
 *           description: Risk score (0-1)
 *           example: 0.88
 *         threat_level:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *           description: Threat level classification
 *           example: "HIGH"
 *         branch_used:
 *           type: string
 *           description: ML model branch used
 *           example: "nsl"
 *         model_used:
 *           type: string
 *           description: Specific ML model used
 *           example: "CatBoost"
 *         routing:
 *           type: object
 *           properties:
 *             routing_confidence:
 *               type: number
 *               example: 0.91
 *         inference_time_ms:
 *           type: number
 *           description: Inference time in milliseconds
 *           example: 24.8
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Prediction timestamp
 *     
 *     Threat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Threat ID
 *         threatType:
 *           type: string
 *           description: Type of threat
 *           example: "DoS"
 *         sourceIP:
 *           type: string
 *           description: Source IP address
 *           example: "192.168.1.100"
 *         severityLevel:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *           description: Severity level
 *         confidenceScore:
 *           type: number
 *           description: Confidence score (0-100)
 *           example: 95
 *         status:
 *           type: string
 *           enum: [Active, Investigating, Resolved, False Positive, Escalated]
 *           description: Threat status
 *         mlPrediction:
 *           $ref: '#/components/schemas/MLPrediction'
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Threat creation timestamp
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 *         error:
 *           type: string
 *           description: Error code
 */

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

/**
 * @swagger
 * /api/ml/predict:
 *   post:
 *     summary: Predict threat for a network log
 *     tags: [Machine Learning]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - logId
 *             properties:
 *               logId:
 *                 type: string
 *                 description: Network log ID to analyze
 *                 example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Prediction completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "ML prediction completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     threat:
 *                       $ref: '#/components/schemas/Threat'
 *                     prediction:
 *                       $ref: '#/components/schemas/MLPrediction'
 *                     logId:
 *                       type: string
 *                       example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       503:
 *         description: ML service unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/ml/predict-features:
 *   post:
 *     summary: Predict threat from raw features
 *     tags: [Machine Learning]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - features
 *             properties:
 *               features:
 *                 type: object
 *                 description: Network features for prediction
 *                 example:
 *                   sourceIP: "192.168.1.100"
 *                   destinationIP: "10.0.0.1"
 *                   protocol: "TCP"
 *                   sourcePort: 80
 *                   destinationPort: 8080
 *                   duration: 120
 *                   sourceBytes: 1500
 *                   destinationBytes: 3000
 *     responses:
 *       200:
 *         description: Prediction completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Feature-based prediction completed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     threat:
 *                       $ref: '#/components/schemas/Threat'
 *                     prediction:
 *                       $ref: '#/components/schemas/MLPrediction'
 *                     features:
 *                       type: object
 *                       description: Input features
 */

/**
 * @swagger
 * /api/ml/health:
 *   get:
 *     summary: Check ML service health
 *     tags: [Machine Learning]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ML service health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     health:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "healthy"
 *                         fastapi_available:
 *                           type: boolean
 *                           example: true
 *                         models:
 *                           type: object
 *                           description: Available models information
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 */

/**
 * @swagger
 * /api/ml/models:
 *   get:
 *     summary: Get available ML models
 *     tags: [Machine Learning]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available ML models
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     models:
 *                       type: object
 *                       properties:
 *                         available_models:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["nsl", "cicids"]
 */

/**
 * @swagger
 * /api/ml/threats/recent:
 *   get:
 *     summary: Get recent threats for dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of threats per page
 *     responses:
 *       200:
 *         description: Recent threats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     threats:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Threat'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           example: 150
 *                         pages:
 *                           type: integer
 *                           example: 8
 */

/**
 * @swagger
 * /api/ml/threats/stats:
 *   get:
 *     summary: Get threat statistics for dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Threat statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalThreats:
 *                       type: integer
 *                       example: 1250
 *                     recentThreats:
 *                       type: integer
 *                       example: 45
 *                     mlPredictedCount:
 *                       type: integer
 *                       example: 890
 *                     threatsByLevel:
 *                       type: object
 *                       example:
 *                         Low: 500
 *                         Medium: 400
 *                         High: 250
 *                         Critical: 100
 *                     topThreatTypes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: integer
 *                       example:
 *                         - _id: "DoS"
 *                           count: 350
 *                         - _id: "Port Scan"
 *                           count: 280
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */

// Routes
router.post('/predict', authenticateToken, requireSecurityOrAdmin, predictThreatValidation, mlController.predictThreat);
router.post('/predict-batch', authenticateToken, requireSecurityOrAdmin, predictBatchValidation, mlController.predictBatchThreats);
router.post('/predict-features', authenticateToken, requireSecurityOrAdmin, predictFromFeaturesValidation, mlController.predictFromFeatures);
router.post('/train', authenticateToken, requireAdmin, trainModelValidation, mlController.trainModel);

// FastAPI service endpoints
router.get('/health', authenticateToken, requireSecurityOrAdmin, mlController.checkServiceHealth);
router.get('/models', authenticateToken, requireSecurityOrAdmin, mlController.getModelMetrics);
router.get('/schemas', authenticateToken, requireSecurityOrAdmin, mlController.getModelSchemas);
router.get('/version', authenticateToken, requireSecurityOrAdmin, mlController.getServiceVersion);

// Admin-only endpoints
router.post('/fallback', authenticateToken, requireAdmin, toggleFallbackValidation, mlController.toggleFallbackMode);

// Dashboard endpoints
router.get('/threats/recent', authenticateToken, mlController.getRecentThreats);
router.get('/threats/stats', authenticateToken, mlController.getThreatStats);

module.exports = router;
