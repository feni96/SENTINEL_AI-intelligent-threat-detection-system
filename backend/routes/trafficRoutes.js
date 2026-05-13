const express = require('express');
const trafficController = require('../controllers/trafficController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// GET /api/traffic/summary - Get traffic summary for dashboard
router.get('/summary', 
  authenticateToken,
  trafficController.getTrafficSummary
);

// GET /api/traffic/realtime - Get real-time traffic data
router.get('/realtime', 
  authenticateToken,
  trafficController.getRealTimeTraffic
);

module.exports = router;
