const { catchAsync, AppError } = require('../middleware/errorHandler');
const AuditLog = require('../models/AuditLog');
const winston = require('winston');

// Get all audit logs with pagination
const getAuditLogs = catchAsync(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100
    } = req.query;

    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await AuditLog.countDocuments();
    
    // Get logs with pagination, sorted by newest first
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    winston.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
});

// Create new audit log entry
const createAuditLog = catchAsync(async (req, res) => {
  try {
    const {
      admin,
      actionType,
      target,
      status = 'Success',
      description,
      ipAddress
    } = req.body;

    const auditLog = new AuditLog({
      admin,
      actionType,
      target,
      status,
      description,
      ipAddress: ipAddress || req.ip
    });

    await auditLog.save();

    res.status(201).json({
      success: true,
      data: {
        auditLog
      }
    });
  } catch (error) {
    winston.error('Error creating audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create audit log'
    });
  }
});

// Get audit log statistics
const getAuditStats = catchAsync(async (req, res) => {
  try {
    const stats = await AuditLog.aggregate([
      {
        $group: {
          _id: '$actionType',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$admin',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalLogs = await AuditLog.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        stats,
        totalLogs
      }
    });
  } catch (error) {
    winston.error('Error fetching audit stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit statistics'
    });
  }
});

module.exports = {
  getAuditLogs,
  createAuditLog,
  getAuditStats
};
