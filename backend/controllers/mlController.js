const { validationResult } = require('express-validator');
const mlProxyService = require('../services/mlProxyService');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const NetworkLog = require('../models/NetworkLog');
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
    // Validate input before sending to FastAPI
    mlProxyService.validateInput(networkLog.toObject());
    
    // Get ML prediction from FastAPI
    const prediction = await mlProxyService.predictIntrusion(networkLog.toObject());

    res.status(200).json({
      success: true,
      message: 'ML prediction completed',
      data: {
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
            attackType: 'Unknown',
            confidence: 0.0,
            riskLevel: 'MEDIUM',
            modelUsed: 'fallback',
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
    // Validate input before sending to FastAPI
    mlProxyService.validateInput(features);
    
    // Get prediction from FastAPI
    const prediction = await mlProxyService.predictIntrusion(features);

    res.status(200).json({
      success: true,
      message: 'Feature-based prediction completed',
      data: {
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
            attackType: 'Unknown',
            confidence: 0.0,
            riskLevel: 'MEDIUM',
            modelUsed: 'fallback',
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

  // Train model
  const result = await mlService.trainModel(trainingData);

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
    const metrics = await mlProxyService.getModelMetrics();

    res.status(200).json({
      success: true,
      data: {
        metrics
      }
    });
  } catch (error) {
    if (error.message.includes('ML service')) {
      return res.status(503).json({
        success: false,
        message: 'ML service temporarily unavailable',
        error: 'SERVICE_UNAVAILABLE',
        data: {
          metrics: {
            models: {},
            health: { status: 'unhealthy' },
            registryLoaded: false,
            timestamp: new Date().toISOString()
          }
        }
      });
    }
    throw error;
  }
});

// Check ML service health
const checkServiceHealth = catchAsync(async (req, res, next) => {
  const health = await mlProxyService.checkServiceHealth();

  res.status(200).json({
    success: true,
    data: {
      health
    }
  });
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

// Get feature extraction example
const getFeatureExample = catchAsync(async (req, res, next) => {
  try {
    const examples = await mlProxyService.getFeatureExamples();

    res.status(200).json({
      success: true,
      message: 'Feature examples retrieved',
      data: examples
    });
  } catch (error) {
    if (error.message.includes('ML service')) {
      // Return basic example when service is unavailable
      const basicExample = {
        simulation: {
          duration: 120,
          protocol: 0,
          packet_count: 200,
          connection_count: 10,
          failed_logins: 0,
          traffic_rate: 1.67,
          src_bytes: 16000,
          dst_bytes: 12000,
          avg_packet_size: 80,
          bytes_ratio: 1.33,
          error_rate: 0.0,
          connection_rate: 0.083,
          packet_variance: 10,
          burst_intensity: 0.139,
          label: 'Normal'
        }
      };
      
      return res.status(200).json({
        success: true,
        message: 'Basic feature examples (service unavailable)',
        data: {
          schemaExamples: basicExample,
          note: 'Service unavailable - showing basic examples'
        }
      });
    }
    throw error;
  }
});

module.exports = {
  predictThreat,
  predictBatchThreats,
  predictFromFeatures,
  trainModel,
  getModelMetrics,
  checkServiceHealth,
  toggleFallbackMode,
  getFeatureExample
};
