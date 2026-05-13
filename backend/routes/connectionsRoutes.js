const express = require('express');
const connectionsController = require('../controllers/connectionsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// GET /api/connections/stats - Get connection statistics for dashboard
router.get('/stats', 
  authenticateToken,
  connectionsController.getConnectionStats
);

// GET /api/connections/realtime - Get real-time connection data
router.get('/realtime', 
  authenticateToken,
  connectionsController.getRealTimeConnections
);

module.exports = router;
