const { catchAsync, AppError } = require('../middleware/errorHandler');
const NetworkLog = require('../models/NetworkLog');
const winston = require('winston');

// Get connection statistics for dashboard
const getConnectionStats = catchAsync(async (req, res) => {
  try {
    // Get connection data from last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const connectionData = await NetworkLog.aggregate([
      {
        $match: {
          timestamp: { $gte: fiveMinutesAgo }
        }
      },
      {
        $group: {
          _id: null,
          uniqueIPs: { $addToSet: '$sourceIP' },
          tcpConnections: { $sum: { $cond: [{ $eq: ['$protocol', 'TCP'] }, 1, 0] } },
          udpConnections: { $sum: { $cond: [{ $eq: ['$protocol', 'UDP'] }, 1, 0] } },
          totalConnections: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          onlineUsers: { $sum: { $cond: [{ $eq: ['$action', 'HTTP_REQUEST'] }, 1, 0] } }
        }
      }
    ]);

    // Calculate connections per second
    const connectionsPerSecond = connectionData[0]?.totalConnections / 300; // 5 minutes = 300 seconds

    res.status(200).json({
      success: true,
      data: {
        connectionsPerSecond: Math.round(connectionsPerSecond * 100) / 100,
        concurrentConnections: connectionData[0]?.totalConnections || 0,
        tcpConnections: connectionData[0]?.tcpConnections || 0,
        udpConnections: connectionData[0]?.udpConnections || 0,
        uniqueIPs: connectionData[0]?.uniqueIPs?.length || 0,
        onlineUsers: connectionData[1]?.onlineUsers || 0
      }
    });
  } catch (error) {
    winston.error('Error fetching connection stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connection statistics'
    });
  }
});

// Get real-time connection data
const getRealTimeConnections = catchAsync(async (req, res) => {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    const recentConnections = await NetworkLog.aggregate([
      {
        $match: {
          timestamp: { $gte: oneMinuteAgo }
        }
      },
      {
        $group: {
          _id: null,
          activeConnections: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        activeConnections: recentConnections[0]?.activeConnections || 0,
        timestamp: new Date()
      }
    });
  } catch (error) {
    winston.error('Error fetching real-time connections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time connections'
    });
  }
});

module.exports = {
  getConnectionStats,
  getRealTimeConnections
};
