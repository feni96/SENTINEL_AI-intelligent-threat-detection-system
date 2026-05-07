const Notification = require('../models/Notification');
const winston = require('winston');
const axios = require('axios');

class NotificationService {
  constructor() {
    this.retryIntervals = [1000, 5000, 15000]; // Retry intervals in milliseconds
    this.maxRetries = 3;
  }

  // Create notification
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();

      // Attempt to send notification immediately
      await this.sendNotification(notification);

      return notification;
    } catch (error) {
      winston.error(`Error creating notification: ${error.message}`);
      throw error;
    }
  }

  // Send notification based on channel
  async sendNotification(notification) {
    try {
      let sent = false;

      switch (notification.channel) {
        case 'Email':
          sent = await this.sendEmailNotification(notification);
          break;
        case 'SMS':
          sent = await this.sendSMSNotification(notification);
          break;
        case 'Slack':
          sent = await this.sendSlackNotification(notification);
          break;
        case 'Webhook':
          sent = await this.sendWebhookNotification(notification);
          break;
        case 'Dashboard':
          sent = await this.sendDashboardNotification(notification);
          break;
        case 'Push Notification':
          sent = await this.sendPushNotification(notification);
          break;
        default:
          winston.warn(`Unknown notification channel: ${notification.channel}`);
          return false;
      }

      if (sent) {
        await Notification.findByIdAndUpdate(notification._id, {
          deliveryStatus: 'Sent',
          sentTime: new Date()
        });
        winston.info(`Notification sent via ${notification.channel}: ${notification._id}`);
      } else {
        await this.handleNotificationFailure(notification);
      }

      return sent;
    } catch (error) {
      winston.error(`Error sending notification ${notification._id}: ${error.message}`);
      await this.handleNotificationFailure(notification, error.message);
      return false;
    }
  }

  // Send email notification
  async sendEmailNotification(notification) {
    try {
      // This would integrate with an email service like SendGrid, Nodemailer, etc.
      // For now, we'll simulate the email sending
      
      const emailData = {
        to: notification.recipient,
        subject: notification.subject,
        text: notification.message,
        html: this.formatEmailHTML(notification)
      };

      // Simulate email sending
      winston.info(`Email sent to ${notification.recipient}: ${notification.subject}`);
      
      return true;
    } catch (error) {
      winston.error(`Error sending email: ${error.message}`);
      return false;
    }
  }

  // Send SMS notification
  async sendSMSNotification(notification) {
    try {
      // This would integrate with an SMS service like Twilio, AWS SNS, etc.
      
      const smsData = {
        to: notification.recipient,
        message: notification.message
      };

      // Simulate SMS sending
      winston.info(`SMS sent to ${notification.recipient}`);
      
      return true;
    } catch (error) {
      winston.error(`Error sending SMS: ${error.message}`);
      return false;
    }
  }

  // Send Slack notification
  async sendSlackNotification(notification) {
    try {
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (!slackWebhookUrl) {
        winston.warn('Slack webhook URL not configured');
        return false;
      }

      const payload = {
        text: notification.subject,
        attachments: [
          {
            color: this.getSlackColor(notification.priority),
            fields: [
              {
                title: 'Priority',
                value: notification.priority,
                short: true
              },
              {
                title: 'Type',
                value: notification.messageType,
                short: true
              }
            ],
            text: notification.message
          }
        ]
      };

      const response = await axios.post(slackWebhookUrl, payload, {
        timeout: 10000
      });

      if (response.status === 200) {
        winston.info(`Slack notification sent: ${notification._id}`);
        return true;
      }

      return false;
    } catch (error) {
      winston.error(`Error sending Slack notification: ${error.message}`);
      return false;
    }
  }

  // Send webhook notification
  async sendWebhookNotification(notification) {
    try {
      const webhookUrl = notification.webhookUrl || process.env.DEFAULT_WEBHOOK_URL;
      if (!webhookUrl) {
        winston.warn('Webhook URL not configured');
        return false;
      }

      const payload = {
        id: notification._id,
        subject: notification.subject,
        message: notification.message,
        priority: notification.priority,
        messageType: notification.messageType,
        timestamp: notification.sentTime,
        metadata: notification.metadata
      };

      const response = await axios.post(webhookUrl, payload, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SentinelAI-Webhook/1.0'
        }
      });

      // Save webhook response
      await Notification.findByIdAndUpdate(notification._id, {
        webhookResponse: {
          status: response.status,
          data: response.data
        }
      });

      winston.info(`Webhook notification sent: ${notification._id}`);
      return true;
    } catch (error) {
      winston.error(`Error sending webhook notification: ${error.message}`);
      return false;
    }
  }

  // Send dashboard notification (in-app)
  async sendDashboardNotification(notification) {
    try {
      // Dashboard notifications are stored in the database and retrieved by the frontend
      // This would typically involve WebSocket or Server-Sent Events for real-time updates
      
      // Update notification as delivered to dashboard
      await Notification.findByIdAndUpdate(notification._id, {
        deliveryStatus: 'Delivered',
        deliveredAt: new Date()
      });

      winston.info(`Dashboard notification delivered: ${notification._id}`);
      return true;
    } catch (error) {
      winston.error(`Error delivering dashboard notification: ${error.message}`);
      return false;
    }
  }

  // Send push notification
  async sendPushNotification(notification) {
    try {
      // This would integrate with a push notification service like Firebase Cloud Messaging
      
      const pushData = {
        to: notification.recipient,
        title: notification.subject,
        body: notification.message,
        priority: notification.priority.toLowerCase(),
        data: {
          notificationId: notification._id,
          type: notification.messageType
        }
      };

      // Simulate push notification sending
      winston.info(`Push notification sent: ${notification._id}`);
      
      return true;
    } catch (error) {
      winston.error(`Error sending push notification: ${error.message}`);
      return false;
    }
  }

  // Handle notification failure
  async handleNotificationFailure(notification, errorReason = null) {
    try {
      const attempts = notification.attempts + 1;
      const updateData = {
        attempts,
        deliveryStatus: 'Failed',
        failedAt: new Date()
      };

      if (errorReason) {
        updateData.failureReason = errorReason;
      }

      if (attempts < notification.maxAttempts) {
        // Schedule retry
        const retryInterval = this.retryIntervals[Math.min(attempts - 1, this.retryIntervals.length - 1)];
        updateData.nextRetryAt = new Date(Date.now() + retryInterval);
        updateData.deliveryStatus = 'Pending';

        // Schedule retry with setTimeout (in production, use a proper job queue)
        setTimeout(async () => {
          try {
            const retryNotification = await Notification.findById(notification._id);
            if (retryNotification && retryNotification.deliveryStatus === 'Pending') {
              await this.sendNotification(retryNotification);
            }
          } catch (error) {
            winston.error(`Error retrying notification ${notification._id}: ${error.message}`);
          }
        }, retryInterval);
      }

      await Notification.findByIdAndUpdate(notification._id, updateData);
      
      winston.warn(`Notification failed ${notification._id}: attempt ${attempts}/${notification.maxAttempts}`);
    } catch (error) {
      winston.error(`Error handling notification failure: ${error.message}`);
    }
  }

  // Format email HTML
  formatEmailHTML(notification) {
    const colors = {
      'Critical': '#dc3545',
      'High': '#fd7e14',
      'Medium': '#ffc107',
      'Low': '#28a745'
    };

    const color = colors[notification.priority] || '#6c757d';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${color}; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">${notification.subject}</h1>
          <p style="margin: 5px 0 0 0;">Priority: ${notification.priority}</p>
        </div>
        <div style="padding: 20px; background-color: #f8f9fa;">
          <p style="margin: 0 0 15px 0;"><strong>Type:</strong> ${notification.messageType}</p>
          <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid ${color};">
            <p style="margin: 0; white-space: pre-wrap;">${notification.message}</p>
          </div>
          <p style="margin: 15px 0 0 0; color: #6c757d; font-size: 12px;">
            Sent: ${notification.sentTime.toLocaleString()}
          </p>
        </div>
      </div>
    `;
  }

  // Get Slack color based on priority
  getSlackColor(priority) {
    const colors = {
      'Critical': 'danger',
      'High': 'warning',
      'Medium': 'warning',
      'Low': 'good'
    };

    return colors[priority] || 'good';
  }

  // Process pending notifications (retry failed ones)
  async processPendingNotifications() {
    try {
      const pendingNotifications = await Notification.find({
        deliveryStatus: 'Pending',
        nextRetryAt: { $lte: new Date() },
        attempts: { $lt: this.maxRetries }
      });

      for (const notification of pendingNotifications) {
        try {
          await this.sendNotification(notification);
        } catch (error) {
          winston.error(`Error processing pending notification ${notification._id}: ${error.message}`);
        }
      }

      winston.info(`Processed ${pendingNotifications.length} pending notifications`);
    } catch (error) {
      winston.error(`Error processing pending notifications: ${error.message}`);
    }
  }

  // Get notification statistics
  async getNotificationStats(userId, startDate, endDate) {
    try {
      const dateQuery = { userId };
      if (startDate || endDate) {
        dateQuery.sentTime = {};
        if (startDate) dateQuery.sentTime.$gte = new Date(startDate);
        if (endDate) dateQuery.sentTime.$lte = new Date(endDate);
      }

      const [
        totalNotifications,
        notificationsByChannel,
        notificationsByStatus,
        notificationsByPriority,
        deliveryRate
      ] = await Promise.all([
        Notification.countDocuments(dateQuery),
        Notification.aggregate([
          { $match: dateQuery },
          { $group: { _id: '$channel', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Notification.aggregate([
          { $match: dateQuery },
          { $group: { _id: '$deliveryStatus', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Notification.aggregate([
          { $match: dateQuery },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Notification.aggregate([
          { $match: dateQuery },
          { $group: { 
            _id: null, 
            delivered: { $sum: { $cond: [{ $in: ['$deliveryStatus', ['Sent', 'Delivered']] }, 1, 0] } },
            total: { $sum: 1 }
          } }
        ])
      ]);

      const deliveredCount = deliveryRate[0]?.delivered || 0;
      const totalCount = deliveryRate[0]?.total || 0;

      return {
        totalNotifications,
        deliveredNotifications: deliveredCount,
        deliveryRate: totalCount > 0 ? (deliveredCount / totalCount * 100).toFixed(2) : 0,
        notificationsByChannel,
        notificationsByStatus,
        notificationsByPriority
      };
    } catch (error) {
      winston.error(`Error getting notification stats: ${error.message}`);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        {
          isRead: true,
          readAt: new Date()
        },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    } catch (error) {
      winston.error(`Error marking notification as read: ${error.message}`);
      throw error;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;
