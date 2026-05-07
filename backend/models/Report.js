const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  generatedDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  reportType: {
    type: String,
    required: true,
    enum: [
      'Threat Summary',
      'Security Statistics',
      'Incident Report',
      'Compliance Report',
      'Performance Metrics',
      'ML Model Performance',
      'Network Activity',
      'Alert Summary',
      'Trend Analysis',
      'Custom'
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Report title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: true,
    maxlength: [2000, 'Report description cannot exceed 2000 characters']
  },
  statistics: {
    totalThreats: {
      type: Number,
      default: 0
    },
    threatsByType: {
      type: Map,
      of: Number,
      default: new Map()
    },
    threatsBySeverity: {
      type: Map,
      of: Number,
      default: new Map()
    },
    alertsGenerated: {
      type: Number,
      default: 0
    },
    alertsResolved: {
      type: Number,
      default: 0
    },
    falsePositives: {
      type: Number,
      default: 0
    },
    networkLogsProcessed: {
      type: Number,
      default: 0
    },
    mlPredictions: {
      type: Number,
      default: 0
    },
    mlAccuracy: {
      type: Number,
      min: [0, 'ML accuracy cannot be negative'],
      max: [100, 'ML accuracy cannot exceed 100'],
      default: 0
    },
    avgResponseTime: {
      type: Number,
      default: 0
    },
    topSourceIPs: [{
      ip: String,
      count: Number
    }],
    topDestinations: [{
      ip: String,
      count: Number
    }],
    protocolDistribution: {
      type: Map,
      of: Number,
      default: new Map()
    }
  },
  dateRange: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  filters: {
    severityLevels: [{
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical']
    }],
    threatTypes: [{
      type: String
    }],
    status: [{
      type: String,
      enum: ['Active', 'Investigating', 'Resolved', 'False Positive', 'Escalated']
    }],
    sourceIPs: [String],
    destinationIPs: [String]
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  format: {
    type: String,
    enum: ['JSON', 'PDF', 'CSV', 'HTML'],
    default: 'JSON'
  },
  filePath: {
    type: String
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  scheduleFrequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly'],
    default: null
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [String],
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reportSchema.index({ generatedDate: -1 });
reportSchema.index({ reportType: 1, generatedDate: -1 });
reportSchema.index({ generatedBy: 1, generatedDate: -1 });
reportSchema.index({ 'dateRange.startDate': -1, 'dateRange.endDate': -1 });

// Virtual for report duration
reportSchema.virtual('duration').get(function() {
  return this.dateRange.endDate - this.dateRange.startDate;
});

// Ensure virtuals are included in JSON output
reportSchema.set('toJSON', { virtuals: true });
reportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Report', reportSchema);
