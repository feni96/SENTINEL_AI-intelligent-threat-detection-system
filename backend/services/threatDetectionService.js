const NetworkLog = require('../models/NetworkLog');
const Threat = require('../models/Threat');
const Alert = require('../models/Alert');
const alertService = require('./alertService');
const mlProxyService = require('./mlProxyService');
const { calculateSeverity } = require('../utils/severityCalculator');
const winston = require('winston');

class ThreatDetectionService {
  constructor() {
    this.rules = this.initializeRules();
    this.ipAccessCounts = new Map(); // Track IP access for brute force detection
    this.lastCleanup = Date.now();
  }

  // Initialize detection rules
  initializeRules() {
    return [
      {
        name: 'Large Packet Size',
        condition: (log) => log.packetSize > 2000,
        threatType: 'DDoS',
        severity: 'Medium',
        confidence: 70,
        description: 'Large packet size detected, potential DDoS attack'
      },
      {
        name: 'Unusual Protocol',
        condition: (log) => ['ICMP', 'OTHER'].includes(log.protocol) && log.packetSize > 1000,
        threatType: 'Anomaly',
        severity: 'Low',
        confidence: 60,
        description: 'Unusual protocol activity detected'
      },
      {
        name: 'Failed Connection Attempts',
        condition: (log) => log.status === 'FAILED' || log.status === 'REJECTED',
        threatType: 'Brute Force',
        severity: 'Medium',
        confidence: 65,
        description: 'Failed connection attempt detected'
      },
      {
        name: 'High Risk Ports',
        condition: (log) => {
          const highRiskPorts = [22, 23, 80, 443, 1433, 3306, 3389, 5432];
          return highRiskPorts.includes(log.destinationPort) && log.action === 'DENY';
        },
        threatType: 'Port Scan',
        severity: 'High',
        confidence: 80,
        description: 'Access attempt to high-risk port detected'
      },
      {
        name: 'Suspicious Source IP',
        condition: (log) => {
          // Check for private IPs accessing external resources unusually
          const privateIPRanges = [
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^192\.168\./,
            /^127\./
          ];
          return privateIPRanges.some(range => range.test(log.sourceIP)) && 
                 log.destinationIP.startsWith('192.168.') === false &&
                 log.packetSize > 1500;
        },
        threatType: 'Data Exfiltration',
        severity: 'High',
        confidence: 75,
        description: 'Suspicious outbound traffic from internal network'
      },
      {
        name: 'Multiple Connections to Same IP',
        condition: (log) => {
          const key = `${log.sourceIP}-${log.destinationIP}`;
          const count = this.ipAccessCounts.get(key) || 0;
          this.ipAccessCounts.set(key, count + 1);
          return count > 10; // More than 10 connections to same destination
        },
        threatType: 'Brute Force',
        severity: 'Medium',
        confidence: 85,
        description: 'Multiple connections to same destination detected'
      },
      {
        name: 'SSH Brute Force',
        condition: (log) => log.destinationPort === 22 && log.status === 'FAILED',
        threatType: 'Brute Force',
        severity: 'High',
        confidence: 90,
        description: 'SSH brute force attempt detected'
      },
      {
        name: 'DNS Tunneling',
        condition: (log) => log.protocol === 'DNS' && log.packetSize > 512,
        threatType: 'DNS Spoofing',
        severity: 'Medium',
        confidence: 70,
        description: 'Potential DNS tunneling activity detected'
      },
      {
        name: 'SQL Injection Pattern',
        condition: (log) => {
          const sqlPatterns = ['union', 'select', 'drop', 'insert', 'update', 'delete', '--', '/*', '*/', 'xp_', 'sp_'];
          const payload = (log.payload || '').toLowerCase();
          return sqlPatterns.some(pattern => payload.includes(pattern));
        },
        threatType: 'SQL Injection',
        severity: 'Critical',
        confidence: 95,
        description: 'SQL injection pattern detected in payload'
      }
    ];
  }

  // Analyze a single network log
  async analyzeLog(networkLog) {
    try {
      // Clean up old IP access counts periodically
      this.cleanupIPCounts();

      const detectedThreats = [];

      // Apply rule-based detection
      for (const rule of this.rules) {
        if (rule.condition(networkLog)) {
          const threat = await this.createThreatFromRule(networkLog, rule);
          if (threat) {
            detectedThreats.push(threat);
          }
        }
      }

      // Apply ML-based detection if available
      try {
        const mlPrediction = await mlProxyService.predictIntrusion(networkLog.toObject());
        if (mlPrediction && mlPrediction.confidence > 70) {
          const mlThreat = await this.createThreatFromML(networkLog, mlPrediction);
          if (mlThreat) {
            detectedThreats.push(mlThreat);
          }
        }
      } catch (mlError) {
        winston.warn(`ML prediction failed for log ${networkLog._id}: ${mlError.message}`);
      }

      // Update network log with threat detection status
      await NetworkLog.findByIdAndUpdate(networkLog._id, {
        isAnalyzed: true,
        threatDetected: detectedThreats.length > 0
      });

      // Create alerts for detected threats
      for (const threat of detectedThreats) {
        await alertService.createAlertFromThreat(threat);
      }

      if (detectedThreats.length > 0) {
        winston.info(`Threats detected for log ${networkLog._id}: ${detectedThreats.length} threats`);
      }

      return detectedThreats;
    } catch (error) {
      winston.error(`Error analyzing log ${networkLog._id}: ${error.message}`);
      throw error;
    }
  }

  // Create threat from rule-based detection
  async createThreatFromRule(networkLog, rule) {
    try {
      // Check if threat already exists for this log
      const existingThreat = await Threat.findOne({
        networkLogId: networkLog._id,
        threatType: rule.threatType,
        sourceIP: networkLog.sourceIP
      });

      if (existingThreat) {
        return null; // Threat already exists
      }

      const severity = calculateSeverity(rule.severity, rule.confidence, networkLog);

      const threat = new Threat({
        threatType: rule.threatType,
        sourceIP: networkLog.sourceIP,
        timestamp: networkLog.timestamp,
        severityLevel: severity,
        confidenceScore: rule.confidence,
        description: rule.description,
        networkLogId: networkLog._id,
        userId: networkLog.userId,
        ruleBased: true,
        mlPredicted: false,
        additionalData: {
          ruleName: rule.name,
          destinationIP: networkLog.destinationIP,
          protocol: networkLog.protocol,
          packetSize: networkLog.packetSize,
          action: networkLog.action,
          status: networkLog.status
        }
      });

      await threat.save();
      return threat;
    } catch (error) {
      winston.error(`Error creating threat from rule: ${error.message}`);
      return null;
    }
  }

  // Create threat from ML prediction
  async createThreatFromML(networkLog, mlPrediction) {
    try {
      // Check if threat already exists for this log
      const existingThreat = await Threat.findOne({
        networkLogId: networkLog._id,
        threatType: mlPrediction.threatType,
        sourceIP: networkLog.sourceIP
      });

      if (existingThreat) {
        return null; // Threat already exists
      }

      const severity = calculateSeverity(
        mlPrediction.severityLevel || 'Medium',
        mlPrediction.confidenceScore,
        networkLog
      );

      const threat = new Threat({
        threatType: mlPrediction.threatType,
        sourceIP: networkLog.sourceIP,
        timestamp: networkLog.timestamp,
        severityLevel: severity,
        confidenceScore: mlPrediction.confidenceScore,
        description: mlPrediction.description || `ML detected ${mlPrediction.threatType}`,
        networkLogId: networkLog._id,
        userId: networkLog.userId,
        ruleBased: false,
        mlPredicted: true,
        additionalData: {
          mlModel: mlPrediction.model || 'default',
          mlFeatures: mlPrediction.features,
          destinationIP: networkLog.destinationIP,
          protocol: networkLog.protocol,
          packetSize: networkLog.packetSize
        }
      });

      await threat.save();
      return threat;
    } catch (error) {
      winston.error(`Error creating threat from ML: ${error.message}`);
      return null;
    }
  }

  // Analyze multiple logs (batch processing)
  async analyzeBatchLogs(logs) {
    const results = [];
    
    for (const log of logs) {
      try {
        const threats = await this.analyzeLog(log);
        results.push({
          logId: log._id,
          threats: threats.length,
          success: true
        });
      } catch (error) {
        results.push({
          logId: log._id,
          threats: 0,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // Clean up old IP access counts
  cleanupIPCounts() {
    const now = Date.now();
    const cleanupInterval = 5 * 60 * 1000; // 5 minutes

    if (now - this.lastCleanup > cleanupInterval) {
      this.ipAccessCounts.clear();
      this.lastCleanup = now;
      winston.debug('IP access counts cleaned up');
    }
  }

  // Get detection statistics
  async getDetectionStats(userId, startDate, endDate) {
    try {
      const dateQuery = { userId };
      if (startDate || endDate) {
        dateQuery.timestamp = {};
        if (startDate) dateQuery.timestamp.$gte = new Date(startDate);
        if (endDate) dateQuery.timestamp.$lte = new Date(endDate);
      }

      const [
        totalThreats,
        threatsByType,
        threatsBySeverity,
        ruleBasedThreats,
        mlThreats
      ] = await Promise.all([
        Threat.countDocuments(dateQuery),
        Threat.aggregate([
          { $match: dateQuery },
          { $group: { _id: '$threatType', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Threat.aggregate([
          { $match: dateQuery },
          { $group: { _id: '$severityLevel', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Threat.countDocuments({ ...dateQuery, ruleBased: true }),
        Threat.countDocuments({ ...dateQuery, mlPredicted: true })
      ]);

      return {
        totalThreats,
        threatsByType,
        threatsBySeverity,
        ruleBasedThreats,
        mlThreats,
        detectionRate: ruleBasedThreats + mlThreats
      };
    } catch (error) {
      winston.error(`Error getting detection stats: ${error.message}`);
      throw error;
    }
  }

  // Update detection rules
  updateRules(newRules) {
    this.rules = newRules;
    winston.info('Threat detection rules updated');
  }

  // Get current rules
  getRules() {
    return this.rules;
  }
}

// Create singleton instance
const threatDetectionService = new ThreatDetectionService();

module.exports = threatDetectionService;
