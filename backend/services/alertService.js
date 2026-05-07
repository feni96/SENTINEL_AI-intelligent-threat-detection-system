const Alert = require('../models/Alert');
const Threat = require('../models/Threat');
const Notification = require('../models/Notification');
const notificationService = require('./notificationService');
const winston = require('winston');

class AlertService {
  constructor() {
    this.alertThresholds = {
      critical: 95,
      high: 80,
      medium: 60,
      low: 40
    };
    this.escalationRules = this.initializeEscalationRules();
  }

  // Initialize escalation rules
  initializeEscalationRules() {
    return [
      {
        condition: (alert) => alert.priority === 'Critical' && alert.age > 5 * 60 * 1000, // 5 minutes
        action: 'escalate',
        newLevel: 1
      },
      {
        condition: (alert) => alert.priority === 'High' && alert.age > 15 * 60 * 1000, // 15 minutes
        action: 'escalate',
        newLevel: 1
      },
      {
        condition: (alert) => alert.escalationLevel >= 3 && alert.age > 30 * 60 * 1000, // 30 minutes
        action: 'escalate',
        newLevel: 4
      }
    ];
  }

  // Create alert from threat
  async createAlertFromThreat(threat) {
    try {
      // Check if alert already exists for this threat
      const existingAlert = await Alert.findOne({
        threatId: threat._id,
        status: { $in: ['Open', 'Acknowledged', 'In Progress'] }
      });

      if (existingAlert) {
        return existingAlert; // Return existing alert
      }

      // Determine priority based on threat severity and confidence
      const priority = this.calculateAlertPriority(threat.severityLevel, threat.confidenceScore);

      // Generate alert message
      const message = this.generateAlertMessage(threat);

      const alert = new Alert({
        threatId: threat._id,
        priority,
        message,
        alertType: 'Threat Detected',
        source: threat.mlPredicted ? 'ML Model' : 'Rule-Based Engine',
        userId: threat.userId,
        metadata: {
          threatType: threat.threatType,
          sourceIP: threat.sourceIP,
          confidenceScore: threat.confidenceScore,
          severityLevel: threat.severityLevel
        }
      });

      await alert.save();

      // Send notifications (async)
      this.sendAlertNotifications(alert).catch(error => {
        winston.error(`Failed to send notifications for alert ${alert._id}: ${error.message}`);
      });

      winston.info(`Alert created for threat ${threat._id}: ${priority} priority`);

      return alert;
    } catch (error) {
      winston.error(`Error creating alert from threat: ${error.message}`);
      throw error;
    }
  }

  // Calculate alert priority based on threat severity and confidence
  calculateAlertPriority(severity, confidence) {
    const severityScores = {
      'Critical': 100,
      'High': 80,
      'Medium': 60,
      'Low': 40
    };

    const score = (severityScores[severity] || 50) * (confidence / 100);

    if (score >= this.alertThresholds.critical) return 'Critical';
    if (score >= this.alertThresholds.high) return 'High';
    if (score >= this.alertThresholds.medium) return 'Medium';
    return 'Low';
  }

  // Generate alert message
  generateAlertMessage(threat) {
    const templates = {
      'DDoS': `DDoS attack detected from ${threat.sourceIP}. High volume traffic pattern identified.`,
      'Brute Force': `Brute force attack detected from ${threat.sourceIP}. Multiple failed access attempts.`,
      'SQL Injection': `SQL injection attempt detected from ${threat.sourceIP}. Malicious payload identified.`,
      'XSS': `Cross-site scripting attempt detected from ${threat.sourceIP}. Suspicious script content found.`,
      'Port Scan': `Port scanning activity detected from ${threat.sourceIP}. Multiple port access attempts.`,
      'Malware': `Malware activity detected from ${threat.sourceIP}. Suspicious behavior pattern identified.`,
      'Phishing': `Phishing attempt detected from ${threat.sourceIP}. Suspicious content pattern identified.`,
      'Man-in-the-Middle': `Man-in-the-middle attack suspected from ${threat.sourceIP}. Abnormal traffic routing detected.`,
      'DNS Spoofing': `DNS spoofing activity detected from ${threat.sourceIP}. Suspicious DNS queries identified.`,
      'Zero-Day Exploit': `Zero-day exploit attempt detected from ${threat.sourceIP}. Unknown attack pattern identified.`,
      'Reconnaissance': `Reconnaissance activity detected from ${threat.sourceIP}. Network probing identified.`,
      'Data Exfiltration': `Data exfiltration attempt detected from ${threat.sourceIP}. Large outbound traffic detected.`,
      'Suspicious Activity': `Suspicious activity detected from ${threat.sourceIP}. Anomalous behavior pattern identified.`,
      'Anomaly': `Network anomaly detected from ${threat.sourceIP}. Unusual traffic pattern identified.`
    };

    return templates[threat.threatType] || 
           `Threat detected: ${threat.threatType} from ${threat.sourceIP}. Confidence: ${threat.confidenceScore}%.`;
  }

  // Send notifications for alert
  async sendAlertNotifications(alert) {
    try {
      // Get threat details
      const threat = await Threat.findById(alert.threatId);
      if (!threat) return;

      // Determine notification channels based on priority
      const channels = this.getNotificationChannels(alert.priority);

      // Create notifications for each channel
      const notifications = [];

      for (const channel of channels) {
        const notification = await notificationService.createNotification({
          channel,
          recipient: await this.getNotificationRecipient(alert, channel),
          subject: `${alert.priority} Alert: ${threat.threatType}`,
          message: this.formatNotificationMessage(alert, threat),
          messageType: 'Alert',
          priority: alert.priority,
          alertId: alert._id,
          threatId: threat._id,
          userId: alert.userId
        });

        notifications.push(notification);
      }

      // Update alert with notification status
      await Alert.findByIdAndUpdate(alert._id, {
        notificationSent: true,
        notificationChannels: channels
      });

      winston.info(`Notifications sent for alert ${alert._id}: ${channels.join(', ')}`);

      return notifications;
    } catch (error) {
      winston.error(`Error sending alert notifications: ${error.message}`);
      throw error;
    }
  }

  // Get notification channels based on priority
  getNotificationChannels(priority) {
    const channelMap = {
      'Critical': ['Email', 'SMS', 'Dashboard', 'Webhook'],
      'High': ['Email', 'Dashboard', 'Webhook'],
      'Medium': ['Email', 'Dashboard'],
      'Low': ['Dashboard']
    };

    return channelMap[priority] || ['Dashboard'];
  }

  // Get notification recipient for channel
  async getNotificationRecipient(alert, channel) {
    // This would typically integrate with a user management system
    // For now, return a default recipient based on channel
    const recipients = {
      'Email': 'security-team@company.com',
      'SMS': '+1234567890',
      'Dashboard': 'dashboard',
      'Webhook': process.env.WEBHOOK_URL || 'https://hooks.slack.com/webhook'
    };

    return recipients[channel] || 'dashboard';
  }

  // Format notification message
  formatNotificationMessage(alert, threat) {
    return `
ALERT: ${alert.priority} Priority Threat Detected

Threat Type: ${threat.threatType}
Source IP: ${threat.sourceIP}
Severity: ${threat.severityLevel}
Confidence: ${threat.confidenceScore}%
Time: ${alert.timestamp.toLocaleString()}

Message: ${alert.message}

Immediate action required. Please investigate this threat.

Alert ID: ${alert._id}
Threat ID: ${threat._id}
    `.trim();
  }

  // Acknowledge alert
  async acknowledgeAlert(alertId, userId) {
    try {
      const alert = await Alert.findByIdAndUpdate(
        alertId,
        {
          status: 'Acknowledged',
          acknowledgedBy: userId,
          acknowledgedAt: new Date()
        },
        { new: true }
      ).populate('acknowledgedBy', 'username email');

      if (!alert) {
        throw new Error('Alert not found');
      }

      winston.info(`Alert ${alertId} acknowledged by user ${userId}`);

      return alert;
    } catch (error) {
      winston.error(`Error acknowledging alert: ${error.message}`);
      throw error;
    }
  }

  // Resolve alert
  async resolveAlert(alertId, userId, resolutionNotes) {
    try {
      const alert = await Alert.findByIdAndUpdate(
        alertId,
        {
          status: 'Resolved',
          resolvedBy: userId,
          resolvedAt: new Date(),
          resolutionNotes
        },
        { new: true }
      ).populate('resolvedBy', 'username email');

      if (!alert) {
        throw new Error('Alert not found');
      }

      winston.info(`Alert ${alertId} resolved by user ${userId}`);

      return alert;
    } catch (error) {
      winston.error(`Error resolving alert: ${error.message}`);
      throw error;
    }
  }

  // Escalate alert
  async escalateAlert(alertId, escalationLevel) {
    try {
      const alert = await Alert.findByIdAndUpdate(
        alertId,
        {
          escalationLevel: escalationLevel || 1,
          status: 'Escalated'
        },
        { new: true }
      );

      if (!alert) {
        throw new Error('Alert not found');
      }

      // Send escalation notifications
      await this.sendEscalationNotifications(alert);

      winston.info(`Alert ${alertId} escalated to level ${escalationLevel}`);

      return alert;
    } catch (error) {
      winston.error(`Error escalating alert: ${error.message}`);
      throw error;
    }
  }

  // Send escalation notifications
  async sendEscalationNotifications(alert) {
    try {
      const threat = await Threat.findById(alert.threatId);
      if (!threat) return;

      // Send to higher-level recipients
      const escalationChannels = ['Email', 'SMS', 'Webhook'];

      for (const channel of escalationChannels) {
        await notificationService.createNotification({
          channel,
          recipient: await this.getEscalationRecipient(alert.escalationLevel, channel),
          subject: `ESCALATED Alert: ${threat.threatType}`,
          message: this.formatEscalationMessage(alert, threat),
          messageType: 'Alert',
          priority: 'Critical',
          alertId: alert._id,
          threatId: threat._id,
          userId: alert.userId
        });
      }

      winston.info(`Escalation notifications sent for alert ${alert._id}`);
    } catch (error) {
      winston.error(`Error sending escalation notifications: ${error.message}`);
    }
  }

  // Get escalation recipient
  async getEscalationRecipient(level, channel) {
    // This would typically get higher-level management contacts
    const escalationRecipients = {
      1: {
        'Email': 'security-lead@company.com',
        'SMS': '+1234567891',
        'Webhook': process.env.ESCALATION_WEBHOOK_URL
      },
      2: {
        'Email': 'security-manager@company.com',
        'SMS': '+1234567892',
        'Webhook': process.env.ESCALATION_WEBHOOK_URL
      },
      3: {
        'Email': 'cto@company.com',
        'SMS': '+1234567893',
        'Webhook': process.env.ESCALATION_WEBHOOK_URL
      }
    };

    return escalationRecipients[level]?.[channel] || 'security-team@company.com';
  }

  // Format escalation message
  formatEscalationMessage(alert, threat) {
    return `
ESCALATED ALERT - Level ${alert.escalationLevel}

ORIGINAL ALERT: ${alert.priority} Priority Threat Detected

Threat Type: ${threat.threatType}
Source IP: ${threat.sourceIP}
Severity: ${threat.severityLevel}
Confidence: ${threat.confidenceScore}%
Time: ${alert.timestamp.toLocaleString()}

This alert has been escalated due to lack of timely response.
IMMEDIATE ACTION REQUIRED FROM SENIOR SECURITY PERSONNEL.

Alert ID: ${alert._id}
Threat ID: ${threat._id}
Escalation Level: ${alert.escalationLevel}
    `.trim();
  }

  // Check for alerts that need escalation
  async checkEscalations() {
    try {
      const openAlerts = await Alert.find({
        status: { $in: ['Open', 'Acknowledged', 'In Progress'] }
      }).populate('threatId');

      for (const alert of openAlerts) {
        for (const rule of this.escalationRules) {
          if (rule.condition(alert)) {
            await this.escalateAlert(alert._id, rule.newLevel);
            break; // Only apply first matching rule
          }
        }
      }
    } catch (error) {
      winston.error(`Error checking escalations: ${error.message}`);
    }
  }

  // Get alert statistics
  async getAlertStats(userId, startDate, endDate) {
    try {
      const dateQuery = { userId };
      if (startDate || endDate) {
        dateQuery.timestamp = {};
        if (startDate) dateQuery.timestamp.$gte = new Date(startDate);
        if (endDate) dateQuery.timestamp.$lte = new Date(endDate);
      }

      const [
        totalAlerts,
        alertsByPriority,
        alertsByStatus,
        openAlerts,
        resolvedAlerts,
        avgResolutionTime
      ] = await Promise.all([
        Alert.countDocuments(dateQuery),
        Alert.aggregate([
          { $match: dateQuery },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Alert.aggregate([
          { $match: dateQuery },
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Alert.countDocuments({ ...dateQuery, status: { $in: ['Open', 'Acknowledged', 'In Progress'] } }),
        Alert.countDocuments({ ...dateQuery, status: 'Resolved' }),
        Alert.aggregate([
          { $match: { ...dateQuery, resolvedAt: { $exists: true } } },
          { $group: { 
            _id: null, 
            avgResolutionTime: { 
              $avg: { $subtract: ['$resolvedAt', '$timestamp'] } 
            } 
          } }
        ])
      ]);

      return {
        totalAlerts,
        openAlerts,
        resolvedAlerts,
        resolutionRate: totalAlerts > 0 ? (resolvedAlerts / totalAlerts * 100).toFixed(2) : 0,
        averageResolutionTime: avgResolutionTime[0]?.avgResolutionTime || 0,
        alertsByPriority,
        alertsByStatus
      };
    } catch (error) {
      winston.error(`Error getting alert stats: ${error.message}`);
      throw error;
    }
  }
}

// Create singleton instance
const alertService = new AlertService();

module.exports = alertService;
