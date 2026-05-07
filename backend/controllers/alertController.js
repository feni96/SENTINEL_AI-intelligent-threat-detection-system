const { validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const alertService = require('../services/alertService');
const winston = require('winston');

// Get all alerts with pagination and filtering
const getAlerts = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 50,
    priority,
    status,
    alertType,
    source,
    startDate,
    endDate,
    sortBy = 'timestamp',
    sortOrder = 'desc',
    assignedTo
  } = req.query;

  // Build query
  const query = { userId: req.user._id };

  if (priority) query.priority = priority;
  if (status) query.status = status;
  if (alertType) query.alertType = alertType;
  if (source) query.source = source;
  if (assignedTo) query.assignedTo = assignedTo;

  // Date range filter
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query
  const [alerts, total] = await Promise.all([
    Alert.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('threatId', 'threatType sourceIP severityLevel confidenceScore')
      .populate('assignedTo', 'username email')
      .populate('acknowledgedBy', 'username email')
      .populate('resolvedBy', 'username email'),
    Alert.countDocuments(query)
  ]);

  // Pagination info
  const pagination = {
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum),
    hasNext: pageNum < Math.ceil(total / limitNum),
    hasPrev: pageNum > 1
  };

  res.status(200).json({
    success: true,
    data: {
      alerts,
      pagination
    }
  });
});

// Get single alert by ID
const getAlertById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const alert = await Alert.findOne({ _id: id, userId: req.user._id })
    .populate('threatId')
    .populate('assignedTo', 'username email')
    .populate('acknowledgedBy', 'username email')
    .populate('resolvedBy', 'username email');

  if (!alert) {
    return next(new AppError('Alert not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      alert
    }
  });
});

// Update alert
const updateAlert = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { id } = req.params;
  const updateData = req.body;

  const alert = await Alert.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    updateData,
    { new: true, runValidators: true }
  ).populate('assignedTo', 'username email');

  if (!alert) {
    return next(new AppError('Alert not found', 404));
  }

  winston.info(`Alert updated: ${alert._id} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Alert updated successfully',
    data: {
      alert
    }
  });
});

// Acknowledge alert
const acknowledgeAlert = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const alert = await alertService.acknowledgeAlert(id, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Alert acknowledged successfully',
    data: {
      alert
    }
  });
});

// Resolve alert
const resolveAlert = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { id } = req.params;
  const { resolutionNotes } = req.body;

  const alert = await alertService.resolveAlert(id, req.user._id, resolutionNotes);

  res.status(200).json({
    success: true,
    message: 'Alert resolved successfully',
    data: {
      alert
    }
  });
});

// Escalate alert
const escalateAlert = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { escalationLevel } = req.body;

  const alert = await alertService.escalateAlert(id, escalationLevel);

  res.status(200).json({
    success: true,
    message: 'Alert escalated successfully',
    data: {
      alert
    }
  });
});

// Assign alert to user
const assignAlert = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { id } = req.params;
  const { assignedTo } = req.body;

  const alert = await Alert.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { 
      assignedTo,
      status: 'In Progress'
    },
    { new: true, runValidators: true }
  ).populate('assignedTo', 'username email');

  if (!alert) {
    return next(new AppError('Alert not found', 404));
  }

  winston.info(`Alert ${alert._id} assigned to ${assignedTo}`);

  res.status(200).json({
    success: true,
    message: 'Alert assigned successfully',
    data: {
      alert
    }
  });
});

// Dismiss alert
const dismissAlert = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { dismissalReason } = req.body;

  const alert = await Alert.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { 
      status: 'Dismissed',
      resolvedBy: req.user._id,
      resolvedAt: new Date(),
      resolutionNotes: dismissalReason || 'Dismissed by user'
    },
    { new: true, runValidators: true }
  ).populate('resolvedBy', 'username email');

  if (!alert) {
    return next(new AppError('Alert not found', 404));
  }

  winston.info(`Alert ${alert._id} dismissed by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Alert dismissed successfully',
    data: {
      alert
    }
  });
});

// Get alert statistics
const getAlertStats = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const stats = await alertService.getAlertStats(req.user._id, startDate, endDate);

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
});

// Get alerts by threat ID
const getAlertsByThreat = catchAsync(async (req, res, next) => {
  const { threatId } = req.params;

  const alerts = await Alert.find({ 
    threatId, 
    userId: req.user._id 
  })
  .populate('assignedTo', 'username email')
  .populate('acknowledgedBy', 'username email')
  .populate('resolvedBy', 'username email')
  .sort({ timestamp: -1 });

  res.status(200).json({
    success: true,
    data: {
      alerts
    }
  });
});

// Bulk resolve alerts
const bulkResolveAlerts = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { alertIds, resolutionNotes } = req.body;

  if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
    return next(new AppError('Alert IDs array is required and cannot be empty', 400));
  }

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (const alertId of alertIds) {
    try {
      const alert = await alertService.resolveAlert(alertId, req.user._id, resolutionNotes);
      results.push({
        alertId,
        success: true,
        alert
      });
      successCount++;
    } catch (error) {
      results.push({
        alertId,
        success: false,
        error: error.message
      });
      failureCount++;
    }
  }

  winston.info(`Bulk resolve completed by ${req.user.username}: ${successCount} success, ${failureCount} failures`);

  res.status(200).json({
    success: true,
    message: `Bulk resolve completed: ${successCount} alerts resolved, ${failureCount} failed`,
    data: {
      results,
      summary: {
        total: alertIds.length,
        successCount,
        failureCount
      }
    }
  });
});

// Delete alert
const deleteAlert = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const alert = await Alert.findOneAndDelete({ _id: id, userId: req.user._id });

  if (!alert) {
    return next(new AppError('Alert not found', 404));
  }

  winston.info(`Alert deleted: ${alert._id} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Alert deleted successfully'
  });
});

module.exports = {
  getAlerts,
  getAlertById,
  updateAlert,
  acknowledgeAlert,
  resolveAlert,
  escalateAlert,
  assignAlert,
  dismissAlert,
  getAlertStats,
  getAlertsByThreat,
  bulkResolveAlerts,
  deleteAlert
};
