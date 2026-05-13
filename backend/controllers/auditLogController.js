const { catchAsync, AppError } = require('../middleware/errorHandler');
const winston = require('winston');

// Get all audit logs with filtering and pagination
const getAuditLogs = catchAsync(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      dateFilter = 'all',
      actionType = 'all',
      admin = 'all',
      search = ''
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    // Date filter
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.timestamp = { $gte: today };
    } else if (dateFilter === '7days') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.timestamp = { $gte: sevenDaysAgo };
    }

    // Action type filter
    if (actionType && actionType !== 'all') {
      query.actionType = actionType;
    }

    // Admin filter
    if (admin && admin !== 'all') {
      query.admin = admin;
    }

    // Search filter
    if (search) {
      query.$or = [
        { admin: { $regex: search, $options: 'i' } },
        { target: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await AuditLog.countDocuments(query);
    
    // Get logs with pagination
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          current: page,
          pageSize: limit,
          total,
          pages: Math.ceil(total / limit)
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
