const mongoose = require('mongoose');

const networkLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
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
  destinationIP: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v);
      },
      message: 'Destination IP must be a valid IPv4 address'
    }
  },
  protocol: {
    type: String,
    required: true,
    enum: ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'FTP', 'SSH', 'DNS', 'SMTP', 'OTHER'],
    uppercase: true
  },
  packetSize: {
    type: Number,
    required: true,
    min: [0, 'Packet size cannot be negative'],
    max: [65535, 'Packet size cannot exceed 65535 bytes']
  },
  action: {
    type: String,
    enum: ['ALLOW', 'DENY', 'DROP', 'LOG', 'ALERT'],
    default: 'ALLOW'
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'TIMEOUT', 'REJECTED', 'PENDING'],
    default: 'SUCCESS'
  },
  sourcePort: {
    type: Number,
    min: [0, 'Port cannot be negative'],
    max: [65535, 'Port cannot exceed 65535']
  },
  destinationPort: {
    type: Number,
    min: [0, 'Port cannot be negative'],
    max: [65535, 'Port cannot exceed 65535']
  },
  flags: {
    type: [String],
    enum: ['SYN', 'ACK', 'FIN', 'RST', 'URG', 'PSH']
  },
  payload: {
    type: String,
    maxlength: [1000, 'Payload cannot exceed 1000 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAnalyzed: {
    type: Boolean,
    default: false
  },
  threatDetected: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
networkLogSchema.index({ timestamp: -1 });
networkLogSchema.index({ sourceIP: 1, timestamp: -1 });
networkLogSchema.index({ destinationIP: 1, timestamp: -1 });
networkLogSchema.index({ protocol: 1, timestamp: -1 });
networkLogSchema.index({ threatDetected: 1, timestamp: -1 });

module.exports = mongoose.model('NetworkLog', networkLogSchema);
