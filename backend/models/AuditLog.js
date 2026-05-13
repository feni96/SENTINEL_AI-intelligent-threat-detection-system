const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  admin: {
    type: String,
    required: true,
    trim: true
  },
  actionType: {
    type: String,
    required: true,
    enum: [
      'Login',
      'Logout', 
      'Alert Acknowledge',
      'Alert Escalation',
      'Alert Resolution',
      'Threat Status Change',
      'Report Generation',
      'Configuration Change',
      'Zone Created',
      'Zone Updated',
      'Zone Deleted',
      'User Created',
      'User Updated',
      'User Deleted'
    ]
  },
  target: {
    type: String,
    default: '-'
  },
  status: {
    type: String,
    required: true,
    enum: ['Success', 'Failed', 'Pending'],
    default: 'Success'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
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
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ admin: 1 });
auditLogSchema.index({ actionType: 1 });
auditLogSchema.index({ status: 1 });

// Static method to log admin actions
auditLogSchema.statics.logAction = function(admin, actionType, target, status, description, userId, ipAddress) {
  return this.create({
    admin,
    actionType,
    target,
    status,
    description,
    ipAddress,
    userId
  });
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
