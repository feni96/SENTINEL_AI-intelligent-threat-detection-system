const { validationResult } = require('express-validator');
const NetworkLog = require('../models/NetworkLog');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const threatDetectionService = require('../services/threatDetectionService');
const winston = require('winston');

// Create network log
const createNetworkLog = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const logData = {
    ...req.body,
    userId: req.user._id
  };

  // Create network log
  const networkLog = new NetworkLog(logData);
  await networkLog.save();

  // Send to threat detection service (async, don't wait)
  threatDetectionService.analyzeLog(networkLog).catch(error => {
    winston.error(`Threat detection failed for log ${networkLog._id}: ${error.message}`);
  });

  winston.info(`Network log created: ${networkLog._id} from ${networkLog.sourceIP}`);

  res.status(201).json({
    success: true,
    message: 'Network log created successfully',
    data: {
      networkLog
    }
  });
});

// Create multiple network logs (bulk insert)
const createMultipleNetworkLogs = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { logs } = req.body;

  if (!logs || !Array.isArray(logs) || logs.length === 0) {
    return next(new AppError('Logs array is required and cannot be empty', 400));
  }

  // Add userId to each log
  const logsWithUser = logs.map(log => ({
    ...log,
    userId: req.user._id
  }));

  // Bulk insert logs
  const networkLogs = await NetworkLog.insertMany(logsWithUser);

  // Send logs to threat detection service (async)
  networkLogs.forEach(log => {
    threatDetectionService.analyzeLog(log).catch(error => {
      winston.error(`Threat detection failed for log ${log._id}: ${error.message}`);
    });
  });

  winston.info(`Bulk network logs created: ${networkLogs.length} logs`);

  res.status(201).json({
    success: true,
    message: `${networkLogs.length} network logs created successfully`,
    data: {
      count: networkLogs.length,
      logs: networkLogs
    }
  });
});

// Get all network logs with pagination and filtering
const getNetworkLogs = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 50,
    sourceIP,
    destinationIP,
    protocol,
    action,
    status,
    startDate,
    endDate,
    threatDetected,
    sortBy = 'timestamp',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = { userId: req.user._id };

  if (sourceIP) query.sourceIP = sourceIP;
  if (destinationIP) query.destinationIP = destinationIP;
  if (protocol) query.protocol = protocol.toUpperCase();
  if (action) query.action = action.toUpperCase();
  if (status) query.status = status.toUpperCase();
  if (threatDetected !== undefined) query.threatDetected = threatDetected === 'true';

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
  const [networkLogs, total] = await Promise.all([
    NetworkLog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('threatDetected'),
    NetworkLog.countDocuments(query)
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
      networkLogs,
      pagination
    }
  });
});

// Get single network log by ID
const getNetworkLogById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const networkLog = await NetworkLog.findOne({ _id: id, userId: req.user._id })
    .populate('threatDetected');

  if (!networkLog) {
    return next(new AppError('Network log not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      networkLog
    }
  });
});

// Update network log
const updateNetworkLog = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { id } = req.params;
  const updateData = req.body;

  const networkLog = await NetworkLog.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    updateData,
    { new: true, runValidators: true }
  );

  if (!networkLog) {
    return next(new AppError('Network log not found', 404));
  }

  winston.info(`Network log updated: ${networkLog._id}`);

  res.status(200).json({
    success: true,
    message: 'Network log updated successfully',
    data: {
      networkLog
    }
  });
});

// Delete network log
const deleteNetworkLog = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const networkLog = await NetworkLog.findOneAndDelete({ _id: id, userId: req.user._id });

  if (!networkLog) {
    return next(new AppError('Network log not found', 404));
  }

  winston.info(`Network log deleted: ${networkLog._id}`);

  res.status(200).json({
    success: true,
    message: 'Network log deleted successfully'
  });
});

// Get network logs statistics
const getNetworkLogsStats = catchAsync(async (req, res, next) => {
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
    totalLogs,
    threatDetectedCount,
    protocolStats,
    actionStats,
    statusStats,
    topSourceIPs,
    topDestinationIPs,
    avgPacketSize
  ] = await Promise.all([
    NetworkLog.countDocuments(dateQuery),
    NetworkLog.countDocuments({ ...dateQuery, threatDetected: true }),
    NetworkLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$protocol', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    NetworkLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    NetworkLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    NetworkLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$sourceIP', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    NetworkLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$destinationIP', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    NetworkLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: null, avgPacketSize: { $avg: '$packetSize' } } }
    ])
  ]);

  const stats = {
    totalLogs,
    threatDetectedCount,
    threatDetectionRate: totalLogs > 0 ? (threatDetectedCount / totalLogs * 100).toFixed(2) : 0,
    protocolDistribution: protocolStats,
    actionDistribution: actionStats,
    statusDistribution: statusStats,
    topSourceIPs,
    topDestinationIPs,
    averagePacketSize: avgPacketSize[0]?.avgPacketSize || 0
  };

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
});

module.exports = {
  createNetworkLog,
  createMultipleNetworkLogs,
  getNetworkLogs,
  getNetworkLogById,
  updateNetworkLog,
  deleteNetworkLog,
  getNetworkLogsStats
};
