const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  channel: {
    type: String,
    required: true,
    enum: ['Email', 'SMS', 'Slack', 'Webhook', 'Dashboard', 'Push Notification'],
    index: true
  },
  recipient: {
    type: String,
    required: true,
    trim: true
  },
  sentTime: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  deliveryStatus: {
    type: String,
    enum: ['Pending', 'Sent', 'Delivered', 'Failed', 'Bounced', 'Opened', 'Clicked'],
    default: 'Pending'
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  messageType: {
    type: String,
    enum: ['Alert', 'Threat Detected', 'System Update', 'Report Generated', 'Security Incident', 'Maintenance'],
    default: 'Alert'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  alertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  },
  threatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Threat'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    min: [0, 'Attempts cannot be negative']
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: [1, 'Max attempts must be at least 1']
  },
  nextRetryAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  failedAt: {
    type: Date
  },
  failureReason: {
    type: String,
    maxlength: [1000, 'Failure reason cannot exceed 1000 characters']
  },
  responseCode: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  template: {
    type: String,
    trim: true
  },
  variables: {
    type: mongoose.Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  attachments: [{
    filename: String,
    path: String,
    size: Number,
    contentType: String
  }],
  webhookUrl: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Webhook URL must be a valid HTTP/HTTPS URL'
    }
  },
  webhookResponse: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ deliveryStatus: 1, sentTime: -1 });
notificationSchema.index({ channel: 1, sentTime: -1 });
notificationSchema.index({ recipient: 1, sentTime: -1 });
notificationSchema.index({ userId: 1, sentTime: -1 });
notificationSchema.index({ alertId: 1 });
notificationSchema.index({ threatId: 1 });
notificationSchema.index({ nextRetryAt: 1 });

// Virtual for notification age
notificationSchema.virtual('age').get(function() {
  return Date.now() - this.sentTime;
});

// Virtual for delivery time
notificationSchema.virtual('deliveryTime').get(function() {
  if (this.deliveredAt) {
    return this.deliveredAt - this.sentTime;
  }
  return null;
});

// Ensure virtuals are included in JSON output
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema);
