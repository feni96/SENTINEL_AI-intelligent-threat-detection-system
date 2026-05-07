const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  threatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Threat',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Alert message cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['Open', 'Acknowledged', 'In Progress', 'Resolved', 'Dismissed'],
    default: 'Open'
  },
  alertType: {
    type: String,
    enum: ['Threat Detected', 'System Alert', 'Performance Issue', 'Security Breach', 'Anomaly Detected'],
    default: 'Threat Detected'
  },
  source: {
    type: String,
    enum: ['Rule-Based Engine', 'ML Model', 'Manual', 'IDS/IPS', 'Firewall', 'Antivirus'],
    default: 'Rule-Based Engine'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  resolutionNotes: {
    type: String,
    maxlength: [2000, 'Resolution notes cannot exceed 2000 characters']
  },
  escalationLevel: {
    type: Number,
    min: [0, 'Escalation level cannot be negative'],
    max: [5, 'Escalation level cannot exceed 5'],
    default: 0
  },
  autoResolved: {
    type: Boolean,
    default: false
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationChannels: [{
    type: String,
    enum: ['Email', 'SMS', 'Slack', 'Webhook', 'Dashboard']
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
alertSchema.index({ timestamp: -1 });
alertSchema.index({ priority: 1, timestamp: -1 });
alertSchema.index({ status: 1, timestamp: -1 });
alertSchema.index({ threatId: 1, timestamp: -1 });
alertSchema.index({ userId: 1, timestamp: -1 });
alertSchema.index({ assignedTo: 1, timestamp: -1 });

// Virtual for alert age
alertSchema.virtual('age').get(function() {
  return Date.now() - this.timestamp;
});

// Ensure virtuals are included in JSON output
alertSchema.set('toJSON', { virtuals: true });
alertSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Alert', alertSchema);
