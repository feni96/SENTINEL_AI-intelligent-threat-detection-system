const { validationResult } = require('express-validator');
const mlService = require('../services/mlService');
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

  // Get ML prediction
  const prediction = await mlService.predictThreat(networkLog);

  res.status(200).json({
    success: true,
    message: 'ML prediction completed',
    data: {
      prediction,
      logId: networkLog._id
    }
  });
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

  // Get batch predictions
  const predictions = await mlService.predictBatch(networkLogs);

  res.status(200).json({
    success: true,
    message: `Batch prediction completed for ${networkLogs.length} logs`,
    data: {
      predictions,
      processedCount: networkLogs.length,
      requestedCount: logIds.length
    }
  });
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

  // Create a mock network log for feature extraction
  const mockLog = {
    _id: 'mock-log',
    ...features,
    userId: req.user._id
  };

  // Get prediction
  const prediction = await mlService.predictThreat(mockLog);

  res.status(200).json({
    success: true,
    message: 'Feature-based prediction completed',
    data: {
      prediction,
      features
    }
  });
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
  const metrics = await mlService.getModelMetrics();

  res.status(200).json({
    success: true,
    data: {
      metrics
    }
  });
});

// Check ML service health
const checkServiceHealth = catchAsync(async (req, res, next) => {
  const health = await mlService.checkServiceHealth();

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

  mlService.setFallbackMode(enabled);

  winston.info(`ML fallback mode ${enabled ? 'enabled' : 'disabled'} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: `Fallback mode ${enabled ? 'enabled' : 'disabled'}`,
    data: {
      fallbackEnabled: enabled
    }
  });
});

// Get feature extraction example
const getFeatureExample = catchAsync(async (req, res, next) => {
  const { logId } = req.query;

  let networkLog;
  if (logId) {
    networkLog = await NetworkLog.findOne({ _id: logId, userId: req.user._id });
    if (!networkLog) {
      return next(new AppError('Network log not found', 404));
    }
  } else {
    // Create example log
    networkLog = {
      _id: 'example-log',
      timestamp: new Date(),
      sourceIP: '192.168.1.100',
      destinationIP: '10.0.0.1',
      protocol: 'TCP',
      packetSize: 1500,
      sourcePort: 12345,
      destinationPort: 80,
      action: 'ALLOW',
      status: 'SUCCESS',
      flags: ['SYN', 'ACK'],
      payload: 'example payload'
    };
  }

  const features = mlService.extractFeatures(networkLog);

  res.status(200).json({
    success: true,
    message: 'Feature extraction completed',
    data: {
      originalLog: networkLog,
      extractedFeatures: features,
      featureCount: Object.keys(features).length
    }
  });
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
