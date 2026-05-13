const mongoose = require('mongoose');
const ipaddr = require('ipaddr.js');

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Zone name is required'],
    trim: true,
    maxlength: [100, 'Zone name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  building: {
    type: String,
    required: [true, 'Building/Department is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  ipRange: {
    type: String,
    required: [true, 'IP range is required'],
    validate: {
      validator: function(v) {
        try {
          // Support CIDR notation and individual IPs
          if (v.includes('/')) {
            const [ip, prefix] = v.split('/');
            const parsed = ipaddr.parse(ip);
            const prefixLength = parseInt(prefix);
            // Check if it's a valid IPv4 address and prefix
            return parsed.kind() === 'ipv4' && prefixLength >= 0 && prefixLength <= 32;
          } else {
            const parsed = ipaddr.parse(v);
            return parsed.kind() === 'ipv4';
          }
        } catch (error) {
          console.log('IP validation error:', error.message);
          return false;
        }
      },
      message: 'Invalid IP range format. Use CIDR notation (e.g., 10.0.2.0/24) or single IP'
    }
  },
  enabled: {
    type: Boolean,
    default: true
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  zoneType: {
    type: String,
    enum: ['Academic', 'Administrative', 'Student Housing', 'Infrastructure', 'Public Access', 'Research'],
    default: 'Academic'
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  topologyPosition: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    }
  },
  responsiblePerson: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  monitoringEnabled: {
    type: Boolean,
    default: true
  },
  alertThreshold: {
    type: Number,
    min: 1,
    max: 100,
    default: 5
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  deviceCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDeviceCapacity: {
    type: Number,
    default: 1000,
    min: 1
  },
  bandwidthLimit: {
    type: Number,
    default: 1000 // Mbps
  },
  securityPolicies: [{
    policyName: String,
    policyType: {
      type: String,
      enum: ['Firewall', 'IDS', 'Access Control', 'Data Loss Prevention']
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for performance
zoneSchema.index({ ipRange: 1 });
zoneSchema.index({ name: 1 });
zoneSchema.index({ building: 1 });
zoneSchema.index({ department: 1 });
zoneSchema.index({ enabled: 1, isActive: 1 });
zoneSchema.index({ zoneType: 1 });

// Instance method to check if IP belongs to this zone
zoneSchema.methods.containsIP = function(ip) {
  try {
    const targetIP = ipaddr.parse(ip);
    if (this.ipRange.includes('/')) {
      const [networkIP, prefixLength] = this.ipRange.split('/');
      const network = ipaddr.parse(networkIP);
      return targetIP.match(network, parseInt(prefixLength));
    } else {
      return targetIP.toString() === this.ipRange;
    }
  } catch (error) {
    return false;
  }
};

// Static method to find zone by IP
zoneSchema.statics.findByIP = function(ip) {
  return this.findOne({ enabled: true, isActive: true }).then(zone => {
    if (zone && zone.containsIP(ip)) {
      return zone;
    }
    return null;
  });
};

// Static method to find all zones that contain an IP
zoneSchema.statics.findAllByIP = function(ip) {
  return this.find({ enabled: true, isActive: true }).then(zones => {
    return zones.filter(zone => zone.containsIP(ip));
  });
};

module.exports = mongoose.model('Zone', zoneSchema);
