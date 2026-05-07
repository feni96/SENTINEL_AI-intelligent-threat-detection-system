/**
 * Severity Calculator Utility
 * Calculates threat severity based on various factors
 */

/**
 * Calculate severity level based on base severity, confidence, and network log characteristics
 * @param {string} baseSeverity - Base severity level (Low, Medium, High, Critical)
 * @param {number} confidenceScore - Confidence score (0-100)
 * @param {Object} networkLog - Network log object
 * @returns {string} - Calculated severity level
 */
const calculateSeverity = (baseSeverity, confidenceScore, networkLog = {}) => {
  // Severity weight mapping
  const severityWeights = {
    'Low': 25,
    'Medium': 50,
    'High': 75,
    'Critical': 100
  };

  let baseScore = severityWeights[baseSeverity] || 50;

  // Adjust based on confidence score
  const confidenceWeight = confidenceScore / 100;
  let adjustedScore = baseScore * (0.5 + (confidenceWeight * 0.5));

  // Additional factors from network log
  if (networkLog) {
    // Large packet size increases severity
    if (networkLog.packetSize > 5000) {
      adjustedScore += 15;
    } else if (networkLog.packetSize > 2000) {
      adjustedScore += 10;
    }

    // Failed or rejected status increases severity
    if (networkLog.status === 'FAILED' || networkLog.status === 'REJECTED') {
      adjustedScore += 10;
    }

    // Denied or dropped action increases severity
    if (networkLog.action === 'DENY' || networkLog.action === 'DROP') {
      adjustedScore += 8;
    }

    // Suspicious protocols increase severity
    if (networkLog.protocol === 'ICMP' && networkLog.packetSize > 1000) {
      adjustedScore += 12;
    }

    // High-risk destination ports increase severity
    const highRiskPorts = [22, 23, 80, 443, 1433, 3306, 3389, 5432];
    if (highRiskPorts.includes(networkLog.destinationPort) && networkLog.action === 'DENY') {
      adjustedScore += 15;
    }

    // Private to external traffic with large packets increases severity
    if (isPrivateIP(networkLog.sourceIP) && !isPrivateIP(networkLog.destinationIP) && networkLog.packetSize > 1500) {
      adjustedScore += 20;
    }

    // Suspicious payload increases severity
    if (networkLog.payload && hasSuspiciousPayload(networkLog.payload)) {
      adjustedScore += 25;
    }

    // Multiple flags can indicate scanning activity
    if (networkLog.flags && networkLog.flags.length > 2) {
      adjustedScore += 5;
    }
  }

  // Ensure score is within bounds
  adjustedScore = Math.max(0, Math.min(100, adjustedScore));

  // Convert score back to severity level
  if (adjustedScore >= 85) return 'Critical';
  if (adjustedScore >= 70) return 'High';
  if (adjustedScore >= 45) return 'Medium';
  return 'Low';
};

/**
 * Calculate alert priority based on threat severity and confidence
 * @param {string} severityLevel - Threat severity level
 * @param {number} confidenceScore - Confidence score (0-100)
 * @returns {string} - Alert priority (Low, Medium, High, Critical)
 */
const calculateAlertPriority = (severityLevel, confidenceScore) => {
  const severityScores = {
    'Critical': 100,
    'High': 80,
    'Medium': 60,
    'Low': 40
  };

  const score = (severityScores[severityLevel] || 50) * (confidenceScore / 100);

  if (score >= 85) return 'Critical';
  if (score >= 70) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
};

/**
 * Calculate risk score for an IP address based on historical data
 * @param {Array} pastThreats - Array of past threats associated with the IP
 * @param {number} timeWindowDays - Time window in days to consider
 * @returns {number} - Risk score (0-100)
 */
const calculateIPRiskScore = (pastThreats, timeWindowDays = 30) => {
  if (!pastThreats || pastThreats.length === 0) return 0;

  const cutoffDate = new Date(Date.now() - (timeWindowDays * 24 * 60 * 60 * 1000));
  const recentThreats = pastThreats.filter(threat => new Date(threat.timestamp) > cutoffDate);

  if (recentThreats.length === 0) return 0;

  let riskScore = 0;
  const severityWeights = {
    'Critical': 25,
    'High': 20,
    'Medium': 15,
    'Low': 10
  };

  recentThreats.forEach(threat => {
    const weight = severityWeights[threat.severityLevel] || 10;
    const confidenceMultiplier = threat.confidenceScore / 100;
    
    // More recent threats have higher weight
    const daysSinceThreat = (Date.now() - new Date(threat.timestamp).getTime()) / (24 * 60 * 60 * 1000);
    const recencyMultiplier = Math.max(0.1, 1 - (daysSinceThreat / timeWindowDays));
    
    riskScore += weight * confidenceMultiplier * recencyMultiplier;
  });

  // Cap at 100
  return Math.min(100, riskScore);
};

/**
 * Check if an IP address is private
 * @param {string} ip - IP address to check
 * @returns {boolean} - True if IP is private
 */
const isPrivateIP = (ip) => {
  if (!ip) return false;
  
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./ // Link-local
  ];
  
  return privateRanges.some(range => range.test(ip));
};

/**
 * Check if payload contains suspicious content
 * @param {string} payload - Payload content to check
 * @returns {boolean} - True if payload is suspicious
 */
const hasSuspiciousPayload = (payload) => {
  if (!payload || typeof payload !== 'string') return false;
  
  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi, // XSS
    /union\s+select/gi, // SQL Injection
    /drop\s+table/gi, // SQL Injection
    /rm\s+-rf/gi, // Command injection
    /\.\.\//g, // Directory traversal
    /cmd\.exe/gi, // Windows command
    /powershell/gi, // PowerShell
    /eval\s*\(/gi, // Code evaluation
    /base64_decode/gi, // Base64 decode
    /system\s*\(/gi, // System command
    /wget\s+http/gi, // File download
    /nc\s+-l/gi, // Netcat listener
    /\/etc\/passwd/gi, // File access
    /javascript:/gi, // JavaScript protocol
    /onload\s*=/gi, // Event handler
    /onerror\s*=/gi, // Event handler
    /expression\s*\(/gi, // CSS expression
    /@import/gi, // CSS import
    /binding\s*:/gi, // XML binding
    /<iframe[^>]*>/gi, // IFrame
    /<object[^>]*>/gi, // Object tag
    /<embed[^>]*>/gi, // Embed tag
    /document\.cookie/gi, // Cookie access
    /document\.location/gi, // Location access
    /window\.location/gi, // Window location
    /alert\s*\(/gi, // Alert function
    /confirm\s*\(/gi, // Confirm function
    /prompt\s*\(/gi, // Prompt function
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(payload));
};

/**
 * Calculate threat severity trend
 * @param {Array} threats - Array of threats sorted by timestamp
 * @param {number} periodDays - Period in days to analyze
 * @returns {Object} - Trend analysis object
 */
const calculateThreatTrend = (threats, periodDays = 7) => {
  if (!threats || threats.length < 2) {
    return { trend: 'stable', change: 0, confidence: 'low' };
  }

  const now = new Date();
  const periodStart = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));
  const previousPeriodStart = new Date(now.getTime() - (periodDays * 2 * 24 * 60 * 60 * 1000));

  const currentPeriodThreats = threats.filter(t => new Date(t.timestamp) >= periodStart);
  const previousPeriodThreats = threats.filter(t => 
    new Date(t.timestamp) >= previousPeriodStart && new Date(t.timestamp) < periodStart
  );

  const currentCount = currentPeriodThreats.length;
  const previousCount = previousPeriodThreats.length;

  if (previousCount === 0) {
    return currentCount > 0 ? { trend: 'increasing', change: 100, confidence: 'medium' } : { trend: 'stable', change: 0, confidence: 'high' };
  }

  const changePercent = ((currentCount - previousCount) / previousCount) * 100;
  
  let trend = 'stable';
  if (changePercent > 20) trend = 'increasing';
  else if (changePercent < -20) trend = 'decreasing';

  let confidence = 'medium';
  if (currentCount >= 10 && previousCount >= 10) confidence = 'high';
  else if (currentCount < 5 || previousCount < 5) confidence = 'low';

  return {
    trend,
    change: Math.round(changePercent),
    confidence,
    currentCount,
    previousCount
  };
};

/**
 * Get severity color for UI display
 * @param {string} severity - Severity level
 * @returns {string} - Hex color code
 */
const getSeverityColor = (severity) => {
  const colors = {
    'Critical': '#dc3545', // Red
    'High': '#fd7e14', // Orange
    'Medium': '#ffc107', // Yellow
    'Low': '#28a745' // Green
  };
  
  return colors[severity] || '#6c757d'; // Gray for unknown
};

/**
 * Get priority color for UI display
 * @param {string} priority - Priority level
 * @returns {string} - Hex color code
 */
const getPriorityColor = (priority) => {
  const colors = {
    'Critical': '#dc3545', // Red
    'High': '#fd7e14', // Orange
    'Medium': '#ffc107', // Yellow
    'Low': '#17a2b8' // Cyan
  };
  
  return colors[priority] || '#6c757d'; // Gray for unknown
};

module.exports = {
  calculateSeverity,
  calculateAlertPriority,
  calculateIPRiskScore,
  isPrivateIP,
  hasSuspiciousPayload,
  calculateThreatTrend,
  getSeverityColor,
  getPriorityColor
};
