const nodemailer = require('nodemailer');
const winston = require('winston');

// Email service for sending password reset and notification emails
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Check if Gmail is configured
      if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        winston.info('Initializing Gmail transporter...');
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
        winston.info('✅ Gmail transporter initialized successfully');
      } else if (process.env.SMTP_HOST) {
        // Generic SMTP configuration
        winston.info('Initializing SMTP transporter...');
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
          }
        });
        winston.info('✅ SMTP transporter initialized successfully');
      } else {
        // Development mode - use ethereal email (test service)
        winston.warn('⚠️ No email service configured. Using Ethereal test service for development.');
        this.initializeEtherealTransport();
      }
    } catch (error) {
      winston.error('❌ Error initializing email transporter:', error);
      this.transporter = null;
    }
  }

  async initializeEtherealTransport() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      winston.info('✅ Ethereal test email account configured for development');
    } catch (error) {
      winston.error('❌ Failed to initialize Ethereal email:', error);
      this.transporter = null;
    }
  }

  async sendPasswordResetEmail(email, resetToken, resetUrl) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not configured. Please configure EMAIL_SERVICE in .env file.');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@sentinel-ai.local',
        to: email,
        subject: 'Sentinel AI - Password Reset Request',
        html: this.getPasswordResetEmailTemplate(resetUrl, resetToken)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      winston.info(`✅ Password reset email sent to ${email}`, {
        messageId: info.messageId,
        response: info.response
      });

      // In development, log the preview URL
      if (process.env.NODE_ENV !== 'production' && info.testMessageUrl) {
        winston.info(`📧 Email preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' && info.testMessageUrl ? nodemailer.getTestMessageUrl(info) : null
      };
    } catch (error) {
      winston.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email, username) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@sentinel-ai.local',
        to: email,
        subject: 'Welcome to Sentinel AI - Intelligent Threat Detection System',
        html: this.getWelcomeEmailTemplate(username)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      winston.info(`✅ Welcome email sent to ${email}`, {
        messageId: info.messageId
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      winston.error('❌ Failed to send welcome email:', error);
      throw error;
    }
  }

  async sendAlertEmail(email, alertData) {
    try {
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@sentinel-ai.local',
        to: email,
        subject: `Sentinel AI Alert - ${alertData.severity} Threat Detected`,
        html: this.getAlertEmailTemplate(alertData)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      winston.info(`✅ Alert email sent to ${email}`, {
        messageId: info.messageId,
        threatType: alertData.threatType
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      winston.error('❌ Failed to send alert email:', error);
      throw error;
    }
  }

  getPasswordResetEmailTemplate(resetUrl, resetToken) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; }
            .warning { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
            .token-box { background-color: #f0f9ff; border: 1px solid #bfdbfe; padding: 15px; margin: 15px 0; border-radius: 5px; font-family: monospace; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Sentinel AI - Password Reset</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You have requested to reset your password for your Sentinel AI administrator account. Click the button below to reset your password:</p>
              
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p>This link will expire in 15 minutes. If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
              </div>
              
              <p><strong>For development/testing purposes:</strong></p>
              <div class="token-box">
                Reset Token: ${resetToken}
              </div>
              
              <p>If you have any questions or need assistance, please contact the system administrator.</p>
            </div>
            <div class="footer">
              <p>Sentinel AI - Intelligent Threat Detection System</p>
              <p>Haramaya University, Department of Computer Science</p>
              <p>© 2025 All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getWelcomeEmailTemplate(username) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Sentinel AI</h1>
            </div>
            <div class="content">
              <p>Hello ${username},</p>
              <p>Welcome to Sentinel AI - Intelligent Threat Detection System for Haramaya University.</p>
              <p>Your administrator account has been successfully created. You can now log in to the dashboard and start monitoring threats in real-time.</p>
              <p><strong>Key Features:</strong></p>
              <ul>
                <li>Real-time threat detection and monitoring</li>
                <li>AI-powered anomaly detection</li>
                <li>Campus-wide threat visualization</li>
                <li>Automated alerts and reporting</li>
              </ul>
              <p>If you have any questions or need assistance, please contact the system administrator.</p>
            </div>
            <div class="footer">
              <p>Sentinel AI - Intelligent Threat Detection System</p>
              <p>Haramaya University, Department of Computer Science</p>
              <p>© 2025 All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getAlertEmailTemplate(alertData) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .alert-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
            .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Security Alert</h1>
            </div>
            <div class="content">
              <p>A security threat has been detected on your network.</p>
              <div class="alert-box">
                <p><strong>Threat Type:</strong> ${alertData.threatType}</p>
                <p><strong>Severity:</strong> ${alertData.severity}</p>
                <p><strong>Source IP:</strong> ${alertData.sourceIP}</p>
                <p><strong>Confidence:</strong> ${alertData.confidence}%</p>
                <p><strong>Time:</strong> ${new Date(alertData.timestamp).toLocaleString()}</p>
              </div>
              <p>Please log in to the Sentinel AI dashboard to view more details and take appropriate action.</p>
            </div>
            <div class="footer">
              <p>Sentinel AI - Intelligent Threat Detection System</p>
              <p>Haramaya University, Department of Computer Science</p>
              <p>© 2025 All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
