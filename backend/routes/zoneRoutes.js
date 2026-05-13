const express = require('express');
const { body } = require('express-validator');
const zoneController = require('../controllers/zoneController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Validation middleware
const validateZone = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Zone name must be 1-100 characters'),
  body('building').trim().isLength({ min: 1, max: 100 }).withMessage('Building is required'),
  body('department').trim().isLength({ min: 1, max: 100 }).withMessage('Department is required'),
  body('ipRange').matches(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$/)
    .withMessage('Valid IP range or CIDR notation required (e.g., 10.0.2.0/24)'),
  body('riskLevel').optional().isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid risk level'),
  body('zoneType').optional().isIn(['Academic', 'Administrative', 'Student Housing', 'Infrastructure', 'Public Access', 'Research']).withMessage('Invalid zone type'),
  body('coordinates.latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('coordinates.longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  body('contactEmail').optional().isEmail().withMessage('Valid email address required'),
  body('alertThreshold').optional().isInt({ min: 1, max: 100 }).withMessage('Alert threshold must be between 1 and 100'),
  body('deviceCount').optional().isInt({ min: 0 }).withMessage('Device count must be non-negative'),
  body('maxDeviceCapacity').optional().isInt({ min: 1 }).withMessage('Max device capacity must be positive'),
  body('bandwidthLimit').optional().isInt({ min: 1 }).withMessage('Bandwidth limit must be positive')
];

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/zones - Get all zones with filtering and pagination
router.get('/', zoneController.getZones);

// GET /api/zones/stats - Get zone statistics
router.get('/stats', zoneController.getZoneStats);

// GET /api/zones/:id/threats - Get threats for a specific zone
router.get('/:id/threats', zoneController.getZoneThreats);

// GET /api/zones/resolve/:ip - Resolve IP to zone
router.get('/resolve/:ip', zoneController.resolveIPToZone);

// GET /api/zones/:id - Get single zone by ID
router.get('/:id', zoneController.getZoneById);

// POST /api/zones - Create new zone (admin only)
router.post('/', 
  authenticateToken,
  requireAdmin,
  validateZone,
  zoneController.createZone
);

// PUT /api/zones/:id - Update zone (admin only)
router.put('/:id', 
  authenticateToken,
  requireAdmin,
  validateZone,
  zoneController.updateZone
);

// DELETE /api/zones/:id - Delete zone (admin only)
router.delete('/:id', 
  authenticateToken,
  requireAdmin,
  zoneController.deleteZone
);

module.exports = router;
