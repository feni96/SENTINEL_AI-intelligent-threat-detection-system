const mongoose = require('mongoose');

const threatSchema = new mongoose.Schema({
  threatType: {
    type: String,
    required: true,
    enum: [
      'DDoS',
      'Brute Force',
      'SQL Injection',
      'XSS',
      'Port Scan',
      'Malware',
      'Phishing',
      'Man-in-the-Middle',
      'DNS Spoofing',
      'Zero-Day Exploit',
      'Reconnaissance',
      'Data Exfiltration',
      'Suspicious Activity',
      'Anomaly'
    ]
  },
  sourceIP: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v);
      },
      message: 'Source IP must be a valid IPv4 address'
    }
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  severityLevel: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  confidenceScore: {
    type: Number,
    required: true,
    min: [0, 'Confidence score cannot be negative'],
    max: [100, 'Confidence score cannot exceed 100'],
    default: 50
  },
  status: {
    type: String,
    enum: ['Active', 'Investigating', 'Resolved', 'False Positive', 'Escalated'],
    default: 'Active'
  },
  areaName: {
    type: String,
    trim: true
  },
  zoneType: {
    type: String,
    enum: ['Internal', 'DMZ', 'External', 'Critical Infrastructure', 'User Network'],
    default: 'External'
  },
  latitude: {
    type: Number,
    min: [-90, 'Latitude cannot be less than -90'],
    max: [90, 'Latitude cannot be greater than 90']
  },
  longitude: {
    type: Number,
    min: [-180, 'Longitude cannot be less than -180'],
    max: [180, 'Longitude cannot be greater than 180']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  affectedSystems: [{
    type: String,
    trim: true
  }],
  networkLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NetworkLog',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: {
    type: String,
    maxlength: [2000, 'Resolution notes cannot exceed 2000 characters']
  },
  resolvedAt: {
    type: Date
  },
  falsePositiveReason: {
    type: String,
    maxlength: [500, 'False positive reason cannot exceed 500 characters']
  },
  mlPredicted: {
    type: Boolean,
    default: false
  },
  ruleBased: {
    type: Boolean,
    default: true
  },
  mlPrediction: {
    prediction: {
      type: String,
      trim: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    risk_score: {
      type: Number,
      min: 0,
      max: 1
    },
    threat_level: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      uppercase: true
    },
    branch_used: {
      type: String,
      trim: true
    },
    model_used: {
      type: String,
      trim: true
    },
    routing: {
      routing_confidence: {
        type: Number,
        min: 0,
        max: 1
      }
    },
    inference_time_ms: {
      type: Number,
      min: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  additionalData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better query performance
threatSchema.index({ timestamp: -1 });
threatSchema.index({ threatType: 1, timestamp: -1 });
threatSchema.index({ severityLevel: 1, timestamp: -1 });
threatSchema.index({ status: 1, timestamp: -1 });
threatSchema.index({ sourceIP: 1, timestamp: -1 });
threatSchema.index({ userId: 1, timestamp: -1 });

// ML-specific indexes for real-time dashboard queries
threatSchema.index({ 'mlPrediction.threat_level': 1, timestamp: -1 });
threatSchema.index({ 'mlPrediction.prediction': 1, timestamp: -1 });
threatSchema.index({ mlPredicted: 1, timestamp: -1 });
threatSchema.index({ 'mlPrediction.confidence': -1, timestamp: -1 });

module.exports = mongoose.model('Threat', threatSchema);
