const { validationResult } = require('express-validator');
const Threat = require('../models/Threat');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const winston = require('winston');

// Get all threats with pagination and filtering
const getThreats = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 50,
    threatType,
    severityLevel,
    status,
    sourceIP,
    startDate,
    endDate,
    sortBy = 'timestamp',
    sortOrder = 'desc',
    mlPredicted,
    ruleBased
  } = req.query;

  // Build query
  const query = { userId: req.user._id };

  if (threatType) query.threatType = threatType;
  if (severityLevel) query.severityLevel = severityLevel;
  if (status) query.status = status;
  if (sourceIP) query.sourceIP = sourceIP;
  if (mlPredicted !== undefined) query.mlPredicted = mlPredicted === 'true';
  if (ruleBased !== undefined) query.ruleBased = ruleBased === 'true';

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
  const [threats, total] = await Promise.all([
    Threat.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('networkLogId', 'sourceIP destinationIP protocol packetSize')
      .populate('assignedTo', 'username email')
      .populate('userId', 'username'),
    Threat.countDocuments(query)
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
      threats,
      pagination
    }
  });
});

// Get single threat by ID
const getThreatById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const threat = await Threat.findOne({ _id: id, userId: req.user._id })
    .populate('networkLogId')
    .populate('assignedTo', 'username email')
    .populate('userId', 'username')
    .populate('resolvedBy', 'username email');

  if (!threat) {
    return next(new AppError('Threat not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      threat
    }
  });
});

// Update threat
const updateThreat = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { id } = req.params;
  const updateData = req.body;

  const threat = await Threat.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    updateData,
    { new: true, runValidators: true }
  ).populate('assignedTo', 'username email');

  if (!threat) {
    return next(new AppError('Threat not found', 404));
  }

  winston.info(`Threat updated: ${threat._id} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Threat updated successfully',
    data: {
      threat
    }
  });
});

// Assign threat to user
const assignThreat = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { assignedTo } = req.body;

  const threat = await Threat.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { 
      assignedTo,
      status: 'Investigating'
    },
    { new: true, runValidators: true }
  ).populate('assignedTo', 'username email');

  if (!threat) {
    return next(new AppError('Threat not found', 404));
  }

  winston.info(`Threat ${threat._id} assigned to ${assignedTo}`);

  res.status(200).json({
    success: true,
    message: 'Threat assigned successfully',
    data: {
      threat
    }
  });
});

// Resolve threat
const resolveThreat = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { resolutionNotes, status = 'Resolved' } = req.body;

  const threat = await Threat.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { 
      status,
      resolutionNotes,
      resolvedBy: req.user._id,
      resolvedAt: new Date()
    },
    { new: true, runValidators: true }
  ).populate('resolvedBy', 'username email');

  if (!threat) {
    return next(new AppError('Threat not found', 404));
  }

  winston.info(`Threat ${threat._id} resolved by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Threat resolved successfully',
    data: {
      threat
    }
  });
});

// Mark threat as false positive
const markAsFalsePositive = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { falsePositiveReason } = req.body;

  const threat = await Threat.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { 
      status: 'False Positive',
      falsePositiveReason,
      resolvedBy: req.user._id,
      resolvedAt: new Date()
    },
    { new: true, runValidators: true }
  ).populate('resolvedBy', 'username email');

  if (!threat) {
    return next(new AppError('Threat not found', 404));
  }

  winston.info(`Threat ${threat._id} marked as false positive by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Threat marked as false positive',
    data: {
      threat
    }
  });
});

// Escalate threat
const escalateThreat = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { escalationNotes } = req.body;

  const threat = await Threat.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { 
      status: 'Escalated',
      severityLevel: 'Critical',
      $push: { 
        additionalData: {
          escalationNotes,
          escalatedBy: req.user._id,
          escalatedAt: new Date()
        }
      }
    },
    { new: true, runValidators: true }
  ).populate('assignedTo', 'username email');

  if (!threat) {
    return next(new AppError('Threat not found', 404));
  }

  winston.info(`Threat ${threat._id} escalated by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Threat escalated successfully',
    data: {
      threat
    }
  });
});

// Get threat statistics
const getThreatStats = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  // Build date range query
  const dateQuery = { userId: req.user._id };
  if (startDate || endDate) {
    dateQuery.timestamp = {};
    if (startDate) dateQuery.timestamp.$gte = new Date(startDate);
    if (endDate) dateQuery.timestamp.$lte = new Date(endDate);
  }

  // Get statistics
  const [
    totalThreats,
    threatsByType,
    threatsBySeverity,
    threatsByStatus,
    activeThreats,
    resolvedThreats,
    falsePositives,
    avgConfidence,
    topSourceIPs,
    mlVsRuleStats
  ] = await Promise.all([
    Threat.countDocuments(dateQuery),
    Threat.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$threatType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Threat.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$severityLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Threat.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Threat.countDocuments({ ...dateQuery, status: 'Active' }),
    Threat.countDocuments({ ...dateQuery, status: 'Resolved' }),
    Threat.countDocuments({ ...dateQuery, status: 'False Positive' }),
    Threat.aggregate([
      { $match: dateQuery },
      { $group: { _id: null, avgConfidence: { $avg: '$confidenceScore' } } }
    ]),
    Threat.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$sourceIP', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Threat.aggregate([
      { $match: dateQuery },
      { $group: { 
        _id: null, 
        mlThreats: { $sum: { $cond: ['$mlPredicted', 1, 0] } },
        ruleThreats: { $sum: { $cond: ['$ruleBased', 1, 0] } }
      } }
    ])
  ]);

  const stats = {
    totalThreats,
    activeThreats,
    resolvedThreats,
    falsePositives,
    falsePositiveRate: totalThreats > 0 ? (falsePositives / totalThreats * 100).toFixed(2) : 0,
    resolutionRate: totalThreats > 0 ? (resolvedThreats / totalThreats * 100).toFixed(2) : 0,
    averageConfidence: avgConfidence[0]?.avgConfidence || 0,
    threatsByType,
    threatsBySeverity,
    threatsByStatus,
    topSourceIPs,
    mlThreats: mlVsRuleStats[0]?.mlThreats || 0,
    ruleThreats: mlVsRuleStats[0]?.ruleThreats || 0
  };

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
});

// Delete threat
const deleteThreat = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const threat = await Threat.findOneAndDelete({ _id: id, userId: req.user._id });

  if (!threat) {
    return next(new AppError('Threat not found', 404));
  }

  winston.info(`Threat deleted: ${threat._id} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Threat deleted successfully'
  });
});

module.exports = {
  getThreats,
  getThreatById,
  updateThreat,
  assignThreat,
  resolveThreat,
  markAsFalsePositive,
  escalateThreat,
  getThreatStats,
  deleteThreat
};
