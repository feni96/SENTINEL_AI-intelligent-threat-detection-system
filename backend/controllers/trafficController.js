const { catchAsync, AppError } = require('../middleware/errorHandler');
const NetworkLog = require('../models/NetworkLog');
const winston = require('winston');

// Get traffic summary for dashboard
const getTrafficSummary = catchAsync(async (req, res) => {
  try {
    // Get network logs from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const trafficData = await NetworkLog.aggregate([
      {
        $match: {
          timestamp: { $gte: twentyFourHoursAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d %H:00',
              date: '$timestamp'
            }
          },
          totalBytes: { $sum: '$bytes' },
          totalPackets: { $sum: '$packets' },
          inboundConnections: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      },
      {
        $limit: 24
      }
    ]);

    // Format data for chart
    const labels = trafficData.map(item => item._id);
    const data = trafficData.map(item => item.totalBytes / 1024 / 1024);

    res.status(200).json({
      success: true,
      data: {
        labels,
        data
      }
    });
  } catch (error) {
    winston.error('Error fetching traffic summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch traffic summary'
    });
  }
});

// Get real-time traffic statistics
const getRealTimeTraffic = catchAsync(async (req, res) => {
  try {
    const now = new Date();
    const oneMinuteAgo = new Date(now - 60 * 1000);
    
    const recentTraffic = await NetworkLog.aggregate([
      {
        $match: {
          timestamp: { $gte: oneMinuteAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalBytes: { $sum: '$bytes' },
          totalPackets: { $sum: '$packets' },
          connections: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        bytesPerSecond: recentTraffic[0]?.totalBytes || 0,
        packetsPerSecond: recentTraffic[0]?.totalPackets || 0,
        activeConnections: recentTraffic[0]?.connections || 0
      }
    });
  } catch (error) {
    winston.error('Error fetching real-time traffic:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time traffic'
    });
  }
});

module.exports = {
  getTrafficSummary,
  getRealTimeTraffic
};
