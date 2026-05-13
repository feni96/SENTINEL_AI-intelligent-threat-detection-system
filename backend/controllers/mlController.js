const { validationResult } = require('express-validator');
const mlProxyService = require('../services/mlProxyService');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const NetworkLog = require('../models/NetworkLog');
const Threat = require('../models/Threat');
const { transformNetworkLogToMLFormat, transformFeaturesToMLFormat, validateMLData } = require('../utils/mlDataTransform');
const { emitNewThreat, emitMLServiceHealth } = require('../socket/socketHandlers');
const winston = require('winston');

// Predict threat for a single log
const predictThreat = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { logId } = req.body;

  // Get network log
  const networkLog = await NetworkLog.findOne({ _id: logId, userId: req.user._id });

  if (!networkLog) {
    return next(new AppError('Network log not found', 404));
  }

  try {
    // Transform network log to ML format
    const mlData = transformNetworkLogToMLFormat(networkLog.toObject());
    
    // Validate ML data
    validateMLData(mlData);
    
    // Get ML prediction from FastAPI
    const prediction = await mlProxyService.predictIntrusion(mlData);

    // Create threat record with ML prediction
    const threat = new Threat({
      threatType: normalizeThreatType(prediction.prediction),
      sourceIP: networkLog.sourceIP,
      severityLevel: mapThreatLevelToSeverity(prediction.threat_level),
      confidenceScore: Math.round((prediction.confidence || 0) * 100),
      status: 'Active',
      networkLogId: networkLog._id,
      userId: req.user._id,
      mlPredicted: true,
      ruleBased: false,
      mlPrediction: {
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        risk_score: prediction.risk_score,
        threat_level: prediction.threat_level,
        branch_used: prediction.branch_used,
        model_used: prediction.model_used,
        routing: prediction.routing,
        inference_time_ms: prediction.inference_time_ms,
        timestamp: prediction.timestamp || new Date()
      }
    });

    // Save threat to database
    await threat.save();

    // Emit real-time threat event
    emitNewThreat(threat);

    winston.info(`ML threat prediction completed and saved`, {
      threatId: threat._id,
      prediction: prediction.prediction,
      confidence: prediction.confidence,
      userId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'ML prediction completed',
      data: {
        threat,
        prediction,
        logId: networkLog._id
      }
    });
  } catch (error) {
    if (error.message.includes('ML service')) {
      // Service unavailable - return graceful fallback
      return res.status(503).json({
        success: false,
        message: 'ML service temporarily unavailable',
        error: 'SERVICE_UNAVAILABLE',
        data: {
          prediction: {
            prediction: 'Unknown',
            confidence: 0.0,
            threat_level: 'MEDIUM',
            model_used: 'fallback',
            error: 'Service unavailable - please try again later'
          },
          logId: networkLog._id
        }
      });
    }
    throw error;
  }
});

// Predict threats for multiple logs
const predictBatchThreats = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { logIds } = req.body;

  if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
    return next(new AppError('Log IDs array is required and cannot be empty', 400));
  }

  // Get network logs
  const networkLogs = await NetworkLog.find({ 
    _id: { $in: logIds }, 
    userId: req.user._id 
  });

  if (networkLogs.length === 0) {
    return next(new AppError('No valid network logs found', 404));
  }

  try {
    // Validate inputs and prepare for FastAPI
    const inputDataList = networkLogs.map(log => {
      const logData = log.toObject();
      mlProxyService.validateInput(logData);
      return logData;
    });
    
    // Get batch predictions from FastAPI
    const predictions = await mlProxyService.predictBatch(inputDataList);

    res.status(200).json({
      success: true,
      message: `Batch prediction completed for ${networkLogs.length} logs`,
      data: {
        predictions: predictions.predictions || predictions,
        processedCount: networkLogs.length,
        requestedCount: logIds.length
      }
    });
  } catch (error) {
    if (error.message.includes('ML service')) {
      // Service unavailable - return graceful fallback
      const fallbackPredictions = networkLogs.map(log => ({
        attackType: 'Unknown',
        confidence: 0.0,
        riskLevel: 'MEDIUM',
        modelUsed: 'fallback',
        error: 'Service unavailable'
      }));
      
      return res.status(503).json({
        success: false,
        message: 'ML service temporarily unavailable',
        error: 'SERVICE_UNAVAILABLE',
        data: {
          predictions: fallbackPredictions,
          processedCount: networkLogs.length,
          requestedCount: logIds.length
        }
      });
    }
    throw error;
  }
});

// Predict from features directly
const predictFromFeatures = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { features } = req.body;

  if (!features || typeof features !== 'object') {
    return next(new AppError('Features object is required', 400));
  }

  try {
    // Transform features to ML format
    const mlData = transformFeaturesToMLFormat(features);
    
    // Validate ML data
    validateMLData(mlData);
    
    // Get prediction from FastAPI
    const prediction = await mlProxyService.predictIntrusion(mlData);

    // Create threat record with ML prediction
    const threat = new Threat({
      threatType: normalizeThreatType(prediction.prediction),
      sourceIP: features.sourceIP || 'Unknown',
      severityLevel: mapThreatLevelToSeverity(prediction.threat_level),
      confidenceScore: Math.round((prediction.confidence || 0) * 100),
      status: 'Active',
      userId: req.user._id,
      mlPredicted: true,
      ruleBased: false,
      mlPrediction: {
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        risk_score: prediction.risk_score,
        threat_level: prediction.threat_level,
        branch_used: prediction.branch_used,
        model_used: prediction.model_used,
        routing: prediction.routing,
        inference_time_ms: prediction.inference_time_ms,
        timestamp: prediction.timestamp || new Date()
      }
    });

    // Save threat to database
    await threat.save();

    // Emit real-time threat event
    emitNewThreat(threat);

    winston.info(`Feature-based ML prediction completed and saved`, {
      threatId: threat._id,
      prediction: prediction.prediction,
      confidence: prediction.confidence,
      userId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Feature-based prediction completed',
      data: {
        threat,
        prediction,
        features
      }
    });
  } catch (error) {
    if (error.message.includes('ML service')) {
      // Service unavailable - return graceful fallback
      return res.status(503).json({
        success: false,
        message: 'ML service temporarily unavailable',
        error: 'SERVICE_UNAVAILABLE',
        data: {
          prediction: {
            prediction: 'Unknown',
            confidence: 0.0,
            threat_level: 'MEDIUM',
            model_used: 'fallback',
            error: 'Service unavailable - please try again later'
          },
          features
        }
      });
    }
    throw error;
  }
});

// Train ML model
const trainModel = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { trainingData, modelType = 'threat_detection' } = req.body;

  if (!trainingData || !Array.isArray(trainingData) || trainingData.length === 0) {
    return next(new AppError('Training data array is required and cannot be empty', 400));
  }

  // Train model via FastAPI proxy
  const result = await mlProxyService.trainModel(trainingData, modelType);

  winston.info(`ML model trained by ${req.user.username}: ${result.modelId}`);

  res.status(200).json({
    success: true,
    message: 'Model training completed successfully',
    data: result
  });
});

// Get ML model metrics
const getModelMetrics = catchAsync(async (req, res, next) => {
  try {
    const models = await mlProxyService.getModels();

    res.status(200).json({
      success: true,
      data: {
        models
      }
    });
  } catch (error) {
    if (error.message.includes('ML service')) {
      return res.status(503).json({
        success: false,
        message: 'ML service temporarily unavailable',
        error: 'SERVICE_UNAVAILABLE',
        data: {
          models: {
            available_models: [],
            status: 'unhealthy'
          }
        }
      });
    }
    throw error;
  }
});

// Check ML service health
const checkServiceHealth = catchAsync(async (req, res, next) => {
  try {
    const health = await mlProxyService.getHealth();

    // Emit health status to admin users
    emitMLServiceHealth(health);

    res.status(200).json({
      success: true,
      data: {
        health
      }
    });
  } catch (error) {
    // ML service is offline - return graceful response
    winston.warn('ML service health check failed:', error.message);
    
    const offlineHealth = {
      status: 'offline',
      available: false,
      fastapi_available: false,
      models: {
        available_models: [],
        status: 'unavailable'
      },
      timestamp: new Date().toISOString(),
      error: 'ML service is currently offline'
    };

    // Emit offline status
    emitMLServiceHealth(offlineHealth);

    res.status(200).json({
      success: true,
      data: {
        health: offlineHealth
      }
    });
  }
});

// Toggle fallback mode
const toggleFallbackMode = catchAsync(async (req, res, next) => {
  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    return next(new AppError('Enabled field must be boolean', 400));
  }

  try {
    const result = await mlProxyService.toggleFallbackMode(enabled);
    
    winston.info(`ML fallback mode ${enabled ? 'enabled' : 'disabled'} by ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: `Fallback mode ${enabled ? 'enabled' : 'disabled'}`,
      data: {
        fallbackEnabled: result.fallback_enabled || enabled
      }
    });
  } catch (error) {
    if (error.message.includes('ML service')) {
      return res.status(503).json({
        success: false,
        message: 'ML service temporarily unavailable',
        error: 'SERVICE_UNAVAILABLE',
        data: {
          fallbackEnabled: false,
          note: 'Cannot toggle fallback mode - service unavailable'
        }
      });
    }
    throw error;
  }
});

// Get model schemas
const getModelSchemas = catchAsync(async (req, res, next) => {
  try {
    const schemas = await mlProxyService.getSchemas();

    res.status(200).json({
      success: true,
      message: 'Model schemas retrieved',
      data: schemas
    });
  } catch (error) {
    if (error.message.includes('ML service')) {
      return res.status(503).json({
        success: false,
        message: 'ML service temporarily unavailable',
        error: 'SERVICE_UNAVAILABLE',
        data: {
          schemas: {},
          note: 'Service unavailable - cannot retrieve schemas'
        }
      });
    }
    throw error;
  }
});

// Get service version
const getServiceVersion = catchAsync(async (req, res, next) => {
  try {
    const version = await mlProxyService.getVersion();

    res.status(200).json({
      success: true,
      message: 'Service version retrieved',
      data: version
    });
  } catch (error) {
    if (error.message.includes('ML service')) {
      return res.status(503).json({
        success: false,
        message: 'ML service temporarily unavailable',
        error: 'SERVICE_UNAVAILABLE',
        data: {
          version: 'unknown',
          note: 'Service unavailable - cannot retrieve version'
        }
      });
    }
    throw error;
  }
});

// Get recent threats for dashboard
const getRecentThreats = catchAsync(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const threats = await Threat.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('threatType sourceIP severityLevel confidenceScore status timestamp mlPrediction');

    const total = await Threat.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        threats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    throw error;
  }
});

// Get threat statistics for dashboard
const getThreatStats = catchAsync(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalThreats,
      recentThreats,
      threatsByLevel,
      threatsByType,
      mlPredictedCount
    ] = await Promise.all([
      Threat.countDocuments({ userId }),
      Threat.countDocuments({ userId, timestamp: { $gte: last24Hours } }),
      Threat.aggregate([
        { $match: { userId } },
        { $group: { _id: '$severityLevel', count: { $sum: 1 } } }
      ]),
      Threat.aggregate([
        { $match: { userId, timestamp: { $gte: last24Hours } } },
        { $group: { _id: '$threatType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Threat.countDocuments({ userId, mlPredicted: true })
    ]);

    const stats = {
      totalThreats,
      recentThreats,
      mlPredictedCount,
      threatsByLevel: threatsByLevel.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topThreatTypes: threatsByType,
      timestamp: now.toISOString()
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    winston.error('Error fetching threat stats:', error);
    throw error;
  }
});

// Utility function to map threat levels
const mapThreatLevelToSeverity = (threatLevel) => {
  const mapping = {
    'LOW': 'Low',
    'MEDIUM': 'Medium', 
    'HIGH': 'High',
    'CRITICAL': 'Critical'
  };
  return mapping[threatLevel] || 'Medium';
};

const normalizeThreatType = (prediction) => {
  const normalized = String(prediction || '').toLowerCase();
  const mapping = {
    dos: 'DDoS',
    ddos: 'DDoS',
    bruteforce: 'Brute Force',
    'brute force': 'Brute Force',
    sqlinjection: 'SQL Injection',
    'sql injection': 'SQL Injection',
    xss: 'XSS',
    portscan: 'Port Scan',
    'port scan': 'Port Scan',
    malware: 'Malware',
    phishing: 'Phishing',
    mitm: 'Man-in-the-Middle',
    'man-in-the-middle': 'Man-in-the-Middle',
    dnsspoofing: 'DNS Spoofing',
    'dns spoofing': 'DNS Spoofing',
    'zero-day exploit': 'Zero-Day Exploit',
    reconnaissance: 'Reconnaissance',
    'data exfiltration': 'Data Exfiltration',
    anomaly: 'Anomaly'
  };
  return mapping[normalized] || 'Suspicious Activity';
};

module.exports = {
  predictThreat,
  predictBatchThreats,
  predictFromFeatures,
  trainModel,
  getModelMetrics,
  checkServiceHealth,
  toggleFallbackMode,
  getModelSchemas,
  getServiceVersion,
  getRecentThreats,
  getThreatStats
};
