const { validationResult } = require('express-validator');
const Report = require('../models/Report');
const Threat = require('../models/Threat');
const Alert = require('../models/Alert');
const NetworkLog = require('../models/NetworkLog');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const winston = require('winston');

// Generate threat summary report
const generateThreatSummary = catchAsync(async (req, res, next) => {
  const { startDate, endDate, format = 'JSON' } = req.query;

  // Validate dates
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const end = endDate ? new Date(endDate) : new Date();

  if (start >= end) {
    return next(new AppError('Start date must be before end date', 400));
  }

  // Get threat statistics
  const [
    totalThreats,
    threatsByType,
    threatsBySeverity,
    threatsByStatus,
    topSourceIPs,
    threatsOverTime,
    avgConfidenceScore,
    mlVsRuleStats
  ] = await Promise.all([
    Threat.countDocuments({
      userId: req.user._id,
      timestamp: { $gte: start, $lte: end }
    }),
    Threat.aggregate([
      { $match: { userId: req.user._id, timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: '$threatType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Threat.aggregate([
      { $match: { userId: req.user._id, timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: '$severityLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Threat.aggregate([
      { $match: { userId: req.user._id, timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Threat.aggregate([
      { $match: { userId: req.user._id, timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: '$sourceIP', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Threat.aggregate([
      { $match: { userId: req.user._id, timestamp: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]),
    Threat.aggregate([
      { $match: { userId: req.user._id, timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: null, avgConfidence: { $avg: '$confidenceScore' } } }
    ]),
    Threat.aggregate([
      { $match: { userId: req.user._id, timestamp: { $gte: start, $lte: end } } },
      { $group: {
        _id: null,
        mlThreats: { $sum: { $cond: ['$mlPredicted', 1, 0] } },
        ruleThreats: { $sum: { $cond: ['$ruleBased', 1, 0] } }
      } }
    ])
  ]);

  const reportData = {
    reportType: 'Threat Summary',
    dateRange: { startDate: start, endDate: end },
    statistics: {
      totalThreats,
      threatsByType: this.convertMapToObject(threatsByType),
      threatsBySeverity: this.convertMapToObject(threatsBySeverity),
      threatsByStatus: this.convertMapToObject(threatsByStatus),
      topSourceIPs,
      threatsOverTime,
      averageConfidenceScore: avgConfidenceScore[0]?.avgConfidence || 0,
      mlThreats: mlVsRuleStats[0]?.mlThreats || 0,
      ruleThreats: mlVsRuleStats[0]?.ruleThreats || 0
    },
    generatedAt: new Date()
  };

  // Save report to database
  const report = new Report({
    generatedDate: new Date(),
    reportType: 'Threat Summary',
    title: `Threat Summary Report (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`,
    description: `Comprehensive threat analysis from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
    statistics: reportData.statistics,
    dateRange: { startDate: start, endDate: end },
    generatedBy: req.user._id,
    format
  });

  await report.save();

  res.status(200).json({
    success: true,
    message: 'Threat summary report generated successfully',
    data: {
      report: reportData,
      reportId: report._id
    }
  });
});

// Generate security statistics report
const generateSecurityStats = catchAsync(async (req, res, next) => {
  const { startDate, endDate, format = 'JSON' } = req.query;

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  if (start >= end) {
    return next(new AppError('Start date must be before end date', 400));
  }

  // Get comprehensive statistics
  const [
    totalLogs,
    totalThreats,
    totalAlerts,
    networkLogsByProtocol,
    alertsByPriority,
    alertsByStatus,
    threatDetectionRate,
    alertResolutionRate,
    networkActivity,
    topDestinationPorts,
    falsePositiveRate
  ] = await Promise.all([
    NetworkLog.countDocuments({
      userId: req.user._id,
      timestamp: { $gte: start, $lte: end }
    }),
    Threat.countDocuments({
      userId: req.user._id,
      timestamp: { $gte: start, $lte: end }
    }),
    Alert.countDocuments({
      userId: req.user._id,
      timestamp: { $gte: start, $lte: end }
    }),
    NetworkLog.aggregate([
      { $match: { userId: req.user._id, timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: '$protocol', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Alert.aggregate([
      { $match: { userId: req.user._id, timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Alert.aggregate([
      { $match: { userId: req.user._id, timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    NetworkLog.aggregate([
      { $match: { userId: req.user._id, timestamp: { $gte: start, $lte: end } } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        withThreats: { $sum: { $cond: ['$threatDetected', 1, 0] } }
      } }
    ]),
    Alert.aggregate([
      { $match: { userId: req.user._id, timestamp: { $gte: start, $lte: end } } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } }
      } }
    ]),
    NetworkLog.aggregate([
      { $match: { userId: req.user._id, timestamp: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            hour: { $hour: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.hour': 1 } }
    ]),
    NetworkLog.aggregate([
      { $match: { userId: req.user._id, timestamp: { $gte: start, $lte: end }, destinationPort: { $exists: true } } },
      { $group: { _id: '$destinationPort', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Threat.aggregate([
      { $match: { userId: req.user._id, timestamp: { $gte: start, $lte: end } } },
      { $group: {
        _id: null,
        total: { $sum: 1 },
        falsePositives: { $sum: { $cond: [{ $eq: ['$status', 'False Positive'] }, 1, 0] } }
      } }
    ])
  ]);

  const detectionRate = threatDetectionRate[0] ? 
    (threatDetectionRate[0].withThreats / threatDetectionRate[0].total * 100).toFixed(2) : 0;
  
  const resolutionRate = alertResolutionRate[0] ? 
    (alertResolutionRate[0].resolved / alertResolutionRate[0].total * 100).toFixed(2) : 0;
  
  const fpRate = falsePositiveRate[0] ? 
    (falsePositiveRate[0].falsePositives / falsePositiveRate[0].total * 100).toFixed(2) : 0;

  const reportData = {
    reportType: 'Security Statistics',
    dateRange: { startDate: start, endDate: end },
    statistics: {
      totalNetworkLogs: totalLogs,
      totalThreats,
      totalAlerts,
      threatDetectionRate: parseFloat(detectionRate),
      alertResolutionRate: parseFloat(resolutionRate),
      falsePositiveRate: parseFloat(fpRate),
      networkLogsByProtocol: this.convertMapToObject(networkLogsByProtocol),
      alertsByPriority: this.convertMapToObject(alertsByPriority),
      alertsByStatus: this.convertMapToObject(alertsByStatus),
      networkActivity,
      topDestinationPorts
    },
    generatedAt: new Date()
  };

  // Save report
  const report = new Report({
    generatedDate: new Date(),
    reportType: 'Security Statistics',
    title: `Security Statistics Report (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`,
    description: `Security metrics and statistics from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
    statistics: reportData.statistics,
    dateRange: { startDate: start, endDate: end },
    generatedBy: req.user._id,
    format
  });

  await report.save();

  res.status(200).json({
    success: true,
    message: 'Security statistics report generated successfully',
    data: {
      report: reportData,
      reportId: report._id
    }
  });
});

// Get all reports
const getReports = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    reportType,
    startDate,
    endDate,
    sortBy = 'generatedDate',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = { generatedBy: req.user._id };

  if (reportType) query.reportType = reportType;
  
  if (startDate || endDate) {
    query.generatedDate = {};
    if (startDate) query.generatedDate.$gte = new Date(startDate);
    if (endDate) query.generatedDate.$lte = new Date(endDate);
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query
  const [reports, total] = await Promise.all([
    Report.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('generatedBy', 'username email')
      .populate('recipients', 'username email'),
    Report.countDocuments(query)
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
      reports,
      pagination
    }
  });
});

// Get single report by ID
const getReportById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const report = await Report.findOne({ _id: id, generatedBy: req.user._id })
    .populate('generatedBy', 'username email')
    .populate('recipients', 'username email');

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      report
    }
  });
});

// Create custom report
const createCustomReport = catchAsync(async (req, res, next) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const {
    title,
    description,
    reportType = 'Custom',
    startDate,
    endDate,
    filters,
    format = 'JSON',
    recipients
  } = req.body;

  // Validate date range
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    return next(new AppError('Start date must be before end date', 400));
  }

  // Build query based on filters
  const threatQuery = { userId: req.user._id, timestamp: { $gte: start, $lte: end } };
  const alertQuery = { userId: req.user._id, timestamp: { $gte: start, $lte: end } };
  const logQuery = { userId: req.user._id, timestamp: { $gte: start, $lte: end } };

  if (filters) {
    if (filters.severityLevels && filters.severityLevels.length > 0) {
      threatQuery.severityLevel = { $in: filters.severityLevels };
    }
    if (filters.threatTypes && filters.threatTypes.length > 0) {
      threatQuery.threatType = { $in: filters.threatTypes };
    }
    if (filters.status && filters.status.length > 0) {
      threatQuery.status = { $in: filters.status };
    }
    if (filters.sourceIPs && filters.sourceIPs.length > 0) {
      threatQuery.sourceIP = { $in: filters.sourceIPs };
      logQuery.sourceIP = { $in: filters.sourceIPs };
    }
    if (filters.destinationIPs && filters.destinationIPs.length > 0) {
      logQuery.destinationIP = { $in: filters.destinationIPs };
    }
  }

  // Get custom statistics
  const [
    totalThreats,
    totalAlerts,
    totalLogs,
    threatsByType,
    threatsBySeverity,
    alertsByPriority
  ] = await Promise.all([
    Threat.countDocuments(threatQuery),
    Alert.countDocuments(alertQuery),
    NetworkLog.countDocuments(logQuery),
    Threat.aggregate([
      { $match: threatQuery },
      { $group: { _id: '$threatType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Threat.aggregate([
      { $match: threatQuery },
      { $group: { _id: '$severityLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Alert.aggregate([
      { $match: alertQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  const statistics = {
    totalThreats,
    totalAlerts,
    totalLogs,
    threatsByType: this.convertMapToObject(threatsByType),
    threatsBySeverity: this.convertMapToObject(threatsBySeverity),
    alertsByPriority: this.convertMapToObject(alertsByPriority)
  };

  // Create report
  const report = new Report({
    generatedDate: new Date(),
    reportType,
    title,
    description,
    statistics,
    dateRange: { startDate: start, endDate: end },
    filters,
    generatedBy: req.user._id,
    format,
    recipients: recipients || []
  });

  await report.save();

  winston.info(`Custom report created: ${report._id} by ${req.user.username}`);

  res.status(201).json({
    success: true,
    message: 'Custom report created successfully',
    data: {
      report
    }
  });
});

// Delete report
const deleteReport = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const report = await Report.findOneAndDelete({ _id: id, generatedBy: req.user._id });

  if (!report) {
    return next(new AppError('Report not found', 404));
  }

  winston.info(`Report deleted: ${report._id} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Report deleted successfully'
  });
});

// Helper method to convert aggregation results to object
const convertMapToObject = (aggregationResult) => {
  const obj = {};
  aggregationResult.forEach(item => {
    obj[item._id] = item.count;
  });
  return obj;
};

module.exports = {
  generateThreatSummary,
  generateSecurityStats,
  getReports,
  getReportById,
  createCustomReport,
  deleteReport
};
