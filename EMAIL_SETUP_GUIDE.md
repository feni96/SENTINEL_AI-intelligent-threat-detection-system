# Email Configuration Guide for Sentinel AI

This guide explains how to set up email functionality for password reset and notifications in Sentinel AI.

## Overview

The system uses **Nodemailer** for sending emails. It supports:
- **Gmail** (recommended for development/testing)
- **Generic SMTP** (for production)
- **Ethereal Email** (test service for development)

## Setup Instructions

### Option 1: Gmail (Recommended for Development)

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled

#### Step 2: Generate App Password
1. Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer" (or your device)
3. Google will generate a 16-character password
4. Copy this password

#### Step 3: Update .env File
```env
EMAIL_SERVICE=gmail
EMAIL_USER=fenetmahdi@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=Sentinel AI <fenetmahdi@gmail.com>
FRONTEND_URL=http://localhost:5173
```

**Note:** Replace `xxxx xxxx xxxx xxxx` with the 16-character app password (without spaces in the actual .env file).

### Option 2: Generic SMTP (Production)

Update your `.env` file:
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
EMAIL_FROM=Sentinel AI <noreply@example.com>
FRONTEND_URL=https://your-domain.com
```

### Option 3: Ethereal Email (Development Testing)

No configuration needed! The system automatically creates a test account for development.

## Testing Email Functionality

### 1. Start the Backend
```bash
cd backend
npm install  # Install nodemailer if not already installed
npm run dev
```

### 2. Test Forgot Password
1. Go to the login page: `http://localhost:5173/login`
2. Click "Forgot Password"
3. Enter: `fenetmahdi@gmail.com`
4. In development mode, the response will include:
   - `resetToken`: The actual reset token
   - `resetUrl`: The full reset URL
   - `previewUrl`: Link to view the email in Ethereal (if using test service)

### 3. Reset Password
1. Copy the `resetUrl` from the response
2. Paste it in your browser or click the link
3. Enter a new password (minimum 8 characters)
4. Confirm the password
5. Click "Reset Password"

## Email Templates

The system includes professional HTML email templates for:

### Password Reset Email
- Includes reset link
- Shows token for development
- 15-minute expiration notice
- Professional branding

### Welcome Email
- Sent when admin account is created
- Lists key features
- Professional branding

### Alert Email
- Sent when threats are detected
- Includes threat details
- Severity and confidence scores
- Professional branding

## Troubleshooting

### Gmail: "Invalid login credentials"
- Verify you're using an **App Password**, not your regular Gmail password
- App passwords are 16 characters with spaces
- Remove spaces when entering in .env file

### Gmail: "Less secure app access"
- This error means 2FA is not enabled
- Enable 2-Step Verification first
- Then generate an App Password

### Email not sending in production
- Check that your SMTP credentials are correct
- Verify firewall allows outbound SMTP (port 587 or 25)
- Check email provider's rate limits
- Review backend logs for errors

### Testing with Ethereal (Development)
- Emails are not actually sent
- A preview URL is provided in the response
- Use this to verify email formatting
- Perfect for development without real email setup

## Security Best Practices

1. **Never commit .env file** - Add to .gitignore
2. **Use App Passwords** - Not your main Gmail password
3. **Rotate credentials** - Change passwords periodically
4. **Monitor logs** - Check for failed email attempts
5. **Rate limiting** - System includes rate limiting on auth endpoints
6. **Token expiration** - Reset tokens expire after 15 minutes

## Email Service Architecture

```
User Request
    ↓
Auth Controller (forgotPassword)
    ↓
Generate Reset Token
    ↓
Email Service (sendPasswordResetEmail)
    ↓
Nodemailer Transport
    ↓
Gmail / SMTP / Ethereal
    ↓
User's Email
```

## API Endpoints

### Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "fenetmahdi@gmail.com"
}

Response (Development):
{
  "success": true,
  "message": "Password reset link sent to your email",
  "resetToken": "abc123...",
  "resetUrl": "http://localhost:5173/reset-password?token=abc123..."
}
```

### Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abc123...",
  "newPassword": "NewPassword123"
}

Response:
{
  "success": true,
  "message": "Password reset successfully"
}
```

## Admin Account Details

- **Email**: fenetmahdi@gmail.com
- **Default Username**: admin
- **Default Password**: Set during initial setup

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs: `backend/logs/combined.log`
3. Check email provider's documentation
4. Contact system administrator

---

**Last Updated**: 2025
**Version**: 1.0
