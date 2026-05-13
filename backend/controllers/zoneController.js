const { validationResult } = require('express-validator');
const Zone = require('../models/Zone');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const winston = require('winston');

// Get all zones
const getZones = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 50,
    building,
    department,
    zoneType,
    enabled,
    sortBy = 'name',
    sortOrder = 'asc'
  } = req.query;

  // Build query
  const query = {};
  if (building) query.building = building;
  if (department) query.department = department;
  if (zoneType) query.zoneType = zoneType;
  if (enabled !== undefined) query.enabled = enabled === 'true';

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query
  const [zones, total] = await Promise.all([
    Zone.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Zone.countDocuments(query)
  ]);

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
      zones,
      pagination
    }
  });
});

// Get single zone by ID
const getZoneById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const zone = await Zone.findById(id);

  if (!zone) {
    return next(new AppError('Zone not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      zone
    }
  });
});

// Create new zone
const createZone = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const zoneData = req.body;

  // Check if IP range already exists
  const existingZone = await Zone.findOne({ ipRange: zoneData.ipRange });
  if (existingZone) {
    return next(new AppError('IP range already assigned to another zone', 400));
  }

  const zone = await Zone.create(zoneData);

  winston.info(`Zone created: ${zone.name} (${zone.ipRange}) by ${req.user.username}`);

  res.status(201).json({
    success: true,
    message: 'Zone created successfully',
    data: {
      zone
    }
  });
});

// Update zone
const updateZone = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400));
  }

  const { id } = req.params;
  const updateData = req.body;

  // Check if IP range is being updated and if it conflicts with existing zones
  if (updateData.ipRange) {
    const existingZone = await Zone.findOne({ 
      ipRange: updateData.ipRange, 
      _id: { $ne: id } 
    });
    if (existingZone) {
      return next(new AppError('IP range already assigned to another zone', 400));
    }
  }

  const zone = await Zone.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!zone) {
    return next(new AppError('Zone not found', 404));
  }

  winston.info(`Zone updated: ${zone.name} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Zone updated successfully',
    data: {
      zone
    }
  });
});

// Delete zone
const deleteZone = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const zone = await Zone.findByIdAndDelete(id);

  if (!zone) {
    return next(new AppError('Zone not found', 404));
  }

  winston.info(`Zone deleted: ${zone.name} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Zone deleted successfully'
  });
});

// Resolve IP to zone
const resolveIPToZone = catchAsync(async (req, res, next) => {
  const { ip } = req.params;

  if (!ip) {
    return next(new AppError('IP address is required', 400));
  }

  const zone = await Zone.findByIP(ip);

  if (!zone) {
    return next(new AppError('No zone found for this IP address', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      zone,
      ip
    }
  });
});

// Get zone statistics
const getZoneStats = catchAsync(async (req, res, next) => {
  const [
    totalZones,
    activeZones,
    zonesByType,
    zonesByBuilding,
    zonesByRiskLevel,
    enabledZones,
    disabledZones
  ] = await Promise.all([
    Zone.countDocuments(),
    Zone.countDocuments({ isActive: true }),
    Zone.aggregate([
      { $group: { _id: '$zoneType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Zone.aggregate([
      { $group: { _id: '$building', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Zone.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Zone.countDocuments({ enabled: true }),
    Zone.countDocuments({ enabled: false })
  ]);

  const stats = {
    totalZones,
    activeZones,
    enabledZones,
    disabledZones,
    zonesByType,
    zonesByBuilding,
    zonesByRiskLevel
  };

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
});

// Get threats for a specific zone
const getZoneThreats = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const Threat = require('../models/Threat');

  // Get zone
  const zone = await Zone.findById(id);
  if (!zone) {
    return next(new AppError('Zone not found', 404));
  }

  // Get threats for this zone
  const threats = await Threat.find({
    areaName: zone.name
  })
  .sort({ timestamp: -1 })
  .limit(100)
  .populate('assignedTo', 'username email')
  .populate('userId', 'username');

  // Calculate threat statistics for this zone
  const stats = {
    total: threats.length,
    critical: threats.filter(t => t.severityLevel === 'Critical').length,
    high: threats.filter(t => t.severityLevel === 'High').length,
    medium: threats.filter(t => t.severityLevel === 'Medium').length,
    low: threats.filter(t => t.severityLevel === 'Low').length,
    active: threats.filter(t => t.status === 'Active').length,
    investigating: threats.filter(t => t.status === 'Investigating').length,
    resolved: threats.filter(t => t.status === 'Resolved').length,
    falsePositives: threats.filter(t => t.status === 'False Positive').length,
    mlPredicted: threats.filter(t => t.mlPredicted).length
  };

  res.status(200).json({
    success: true,
    data: {
      zone,
      threats,
      stats
    }
  });
});

module.exports = {
  getZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
  resolveIPToZone,
  getZoneStats,
  getZoneThreats
};
