const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

/**
 * Transform NetworkLog document to FastAPI ML input format
 * @param {Object} networkLog - MongoDB NetworkLog document
 * @returns {Object} Transformed data for FastAPI { data: {...} }
 */
const transformNetworkLogToMLFormat = (networkLog) => {
  try {
    // Extract relevant features from NetworkLog
    const mlData = {
      // Basic network features
      duration: networkLog.duration || 0,
      protocol: normalizeProtocol(networkLog.protocol),
      sourcePort: networkLog.sourcePort || 0,
      destinationPort: networkLog.destinationPort || 0,
      
      // Traffic metrics
      sourceBytes: networkLog.sourceBytes || 0,
      destinationBytes: networkLog.destinationBytes || 0,
      sourcePackets: networkLog.sourcePackets || 0,
      destinationPackets: networkLog.destinationPackets || 0,
      
      // Connection features
      sourceIP: networkLog.sourceIP || '',
      destinationIP: networkLog.destinationIP || '',
      
      // Additional network features
      packetSize: networkLog.packetSize || 0,
      connectionCount: networkLog.connectionCount || 1,
      failedLogins: networkLog.failedLogins || 0,
      
      // Calculated features
      trafficRate: calculateTrafficRate(networkLog),
      bytesRatio: calculateBytesRatio(networkLog),
      avgPacketSize: calculateAvgPacketSize(networkLog),
      errorRate: calculateErrorRate(networkLog),
      connectionRate: calculateConnectionRate(networkLog),
      
      // Timestamp features
      hourOfDay: new Date(networkLog.timestamp).getHours(),
      dayOfWeek: new Date(networkLog.timestamp).getDay(),
      
      // Action and status
      action: normalizeAction(networkLog.action),
      status: normalizeStatus(networkLog.status)
    };

    // Remove any null/undefined values and ensure numeric types
    const cleanedData = cleanMLData(mlData);
    
    logger.info('Transformed network log to ML format', {
      logId: networkLog._id,
      featureCount: Object.keys(cleanedData).length
    });

    return cleanedData;
  } catch (error) {
    logger.error('Error transforming network log to ML format', {
      error: error.message,
      logId: networkLog._id
    });
    throw new Error(`Data transformation failed: ${error.message}`);
  }
};

/**
 * Transform raw features object to ML format
 * @param {Object} features - Raw features object
 * @returns {Object} Cleaned ML data
 */
const transformFeaturesToMLFormat = (features) => {
  try {
    const cleanedData = cleanMLData(features);
    
    logger.info('Transformed features to ML format', {
      featureCount: Object.keys(cleanedData).length
    });

    return cleanedData;
  } catch (error) {
    logger.error('Error transforming features to ML format', {
      error: error.message
    });
    throw new Error(`Feature transformation failed: ${error.message}`);
  }
};

/**
 * Normalize protocol to standard format
 */
const normalizeProtocol = (protocol) => {
  if (!protocol) return 'OTHER';
  
  const protocolMap = {
    'TCP': 0,
    'UDP': 1,
    'ICMP': 2,
    'HTTP': 3,
    'HTTPS': 4,
    'FTP': 5,
    'SSH': 6,
    'DNS': 7,
    'SMTP': 8
  };
  
  return protocolMap[protocol.toUpperCase()] || 99; // 99 for OTHER
};

/**
 * Normalize action to standard format
 */
const normalizeAction = (action) => {
  if (!action) return 'LOG';
  
  const actionMap = {
    'ALLOW': 0,
    'DENY': 1,
    'DROP': 2,
    'LOG': 3,
    'ALERT': 4
  };
  
  return actionMap[action.toUpperCase()] || 3; // Default to LOG
};

/**
 * Normalize status to standard format
 */
const normalizeStatus = (status) => {
  if (!status) return 'SUCCESS';
  
  const statusMap = {
    'SUCCESS': 0,
    'FAILED': 1,
    'TIMEOUT': 2,
    'REJECTED': 3,
    'PENDING': 4
  };
  
  return statusMap[status.toUpperCase()] || 0; // Default to SUCCESS
};

/**
 * Calculate traffic rate (packets per second)
 */
const calculateTrafficRate = (networkLog) => {
  if (!networkLog.duration || networkLog.duration === 0) return 0;
  
  const totalPackets = (networkLog.sourcePackets || 0) + (networkLog.destinationPackets || 0);
  return parseFloat((totalPackets / networkLog.duration).toFixed(3));
};

/**
 * Calculate bytes ratio (source/destination)
 */
const calculateBytesRatio = (networkLog) => {
  const sourceBytes = networkLog.sourceBytes || 0;
  const destBytes = networkLog.destinationBytes || 0;
  
  if (destBytes === 0) return sourceBytes > 0 ? 999 : 0;
  return parseFloat((sourceBytes / destBytes).toFixed(3));
};

/**
 * Calculate average packet size
 */
const calculateAvgPacketSize = (networkLog) => {
  const totalBytes = (networkLog.sourceBytes || 0) + (networkLog.destinationBytes || 0);
  const totalPackets = (networkLog.sourcePackets || 0) + (networkLog.destinationPackets || 0);
  
  if (totalPackets === 0) return 0;
  return Math.round(totalBytes / totalPackets);
};

/**
 * Calculate error rate
 */
const calculateErrorRate = (networkLog) => {
  const totalPackets = (networkLog.sourcePackets || 0) + (networkLog.destinationPackets || 0);
  const failedLogins = networkLog.failedLogins || 0;
  
  if (totalPackets === 0) return 0;
  return parseFloat((failedLogins / totalPackets).toFixed(3));
};

/**
 * Calculate connection rate
 */
const calculateConnectionRate = (networkLog) => {
  if (!networkLog.duration || networkLog.duration === 0) return 0;
  
  const connectionCount = networkLog.connectionCount || 1;
  return parseFloat((connectionCount / networkLog.duration).toFixed(3));
};

/**
 * Clean ML data by removing null/undefined and ensuring proper types
 */
const cleanMLData = (data) => {
  const cleaned = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      continue; // Skip null/undefined values
    }
    
    if (typeof value === 'string') {
      cleaned[key] = value.trim();
    } else if (typeof value === 'number') {
      cleaned[key] = isFinite(value) ? value : 0;
    } else if (typeof value === 'boolean') {
      cleaned[key] = value ? 1 : 0;
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
};

/**
 * Validate ML data before sending to FastAPI
 */
const validateMLData = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid ML data format');
  }
  
  if (Object.keys(data).length === 0) {
    throw new Error('ML data cannot be empty');
  }
  
  // Check for required fields (basic validation)
  const requiredFields = ['sourceIP', 'destinationIP'];
  for (const field of requiredFields) {
    if (!data[field]) {
      logger.warn(`Missing recommended field: ${field}`);
    }
  }
  
  return true;
};

module.exports = {
  transformNetworkLogToMLFormat,
  transformFeaturesToMLFormat,
  validateMLData
};
