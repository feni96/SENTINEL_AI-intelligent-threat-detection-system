# Forgot Password Implementation - Complete Guide

## Overview

The "Forgot Password" functionality has been fully implemented with email-based password reset for the admin account using `fenetmahdi@gmail.com`.

## What Was Implemented

### 1. Backend Changes

#### Email Service (`backend/services/emailService.js`)
- **Nodemailer Integration**: Supports Gmail, generic SMTP, and Ethereal test service
- **Email Templates**: Professional HTML templates for password reset, welcome, and alert emails
- **Error Handling**: Graceful error handling with logging
- **Development Mode**: Includes test email preview URLs

#### Authentication Controller Updates (`backend/controllers/authController.js`)
- **Admin Email**: Changed from `admin@sentinel-ai.local` to `fenetmahdi@gmail.com`
- **Forgot Password Endpoint**: Generates secure reset tokens with 15-minute expiration
- **Reset Password Endpoint**: Validates tokens and updates passwords
- **Email Sending**: Integrates with email service to send reset links

#### User Model (`backend/models/User.js`)
- **Password Reset Fields**: 
  - `passwordResetToken`: Hashed reset token
  - `passwordResetExpires`: Token expiration timestamp

### 2. Frontend Changes

#### Translation Keys (`frontend/public/locales/en/translation.json`)
Added missing translation keys:
- `forgotPasswordInstructions`
- `sending`
- `sendResetLink`
- `invalidResetLink`
- `requestNewLink`
- `resetPassword`
- `newPassword`
- `confirmNewPassword`
- `passwordsDoNotMatch`
- `passwordMinLength`
- `passwordResetSuccess`
- `resetFailed`
- `resetting`

#### Existing Pages (No Changes Needed)
- **Login.jsx**: Already has "Forgot Password" link
- **ForgotPassword.jsx**: Already implemented, now works with backend
- **ResetPassword.jsx**: Already implemented, now works with backend

### 3. Configuration

#### Environment Variables (`.env`)
```env
EMAIL_SERVICE=gmail
EMAIL_USER=fenetmahdi@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_FROM=Sentinel AI <fenetmahdi@gmail.com>
FRONTEND_URL=http://localhost:5173
```

#### Dependencies (`backend/package.json`)
- Added `nodemailer@^6.9.7` for email sending

## Setup Instructions

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Gmail (Recommended)

#### Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification

#### Generate App Password
1. Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer"
3. Copy the 16-character password

#### Update .env File
```env
EMAIL_SERVICE=gmail
EMAIL_USER=fenetmahdi@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=Sentinel AI <fenetmahdi@gmail.com>
FRONTEND_URL=http://localhost:5173
```

### Step 3: Create Admin User
```bash
cd backend
node scripts/createAdmin.js
```

Output:
```
✅ Admin user created successfully
📋 Login Credentials:
   Email: fenetmahdi@gmail.com
   Password: Admin123!
   Role: admin

📧 Email Configuration:
   To enable password reset emails, configure your .env file:
   - EMAIL_SERVICE=gmail
   - EMAIL_USER=fenetmahdi@gmail.com
   - EMAIL_PASSWORD=<your-app-password>
```

### Step 4: Start Backend
```bash
npm run dev
```

### Step 5: Test Forgot Password Flow

#### Test 1: Request Password Reset
1. Go to `http://localhost:5173/login`
2. Click "Forgot Password"
3. Enter: `fenetmahdi@gmail.com`
4. In development mode, you'll see:
   ```json
   {
     "success": true,
     "message": "Password reset link sent to your email",
     "resetToken": "abc123...",
     "resetUrl": "http://localhost:5173/reset-password?token=abc123..."
   }
   ```

#### Test 2: Reset Password
1. Copy the `resetUrl` from the response
2. Paste in browser or click the link
3. Enter new password (minimum 8 characters)
4. Confirm password
5. Click "Reset Password"
6. You'll be redirected to login after 3 seconds

#### Test 3: Login with New Password
1. Go to `http://localhost:5173/login`
2. Email: `fenetmahdi@gmail.com`
3. Password: Your new password
4. Click "Sign In"

## Email Flow

### Password Reset Email
```
User clicks "Forgot Password"
    ↓
Enters: fenetmahdi@gmail.com
    ↓
Backend generates reset token (32 bytes, hex)
    ↓
Token hashed with SHA256
    ↓
Hashed token stored in database with 15-min expiry
    ↓
Email sent with reset link
    ↓
User receives email with:
  - Reset button
  - Reset URL
  - Token (for development)
  - 15-minute expiration notice
    ↓
User clicks link or copies URL
    ↓
Frontend validates token
    ↓
User enters new password
    ↓
Backend validates token hash
    ↓
Password updated
    ↓
Token cleared from database
    ↓
User redirected to login
```

## Security Features

### Token Security
- **Random Generation**: 32-byte random tokens
- **Hashing**: SHA256 hashing before storage
- **Expiration**: 15-minute expiration
- **Single Use**: Token cleared after use
- **Validation**: Token must match hash in database

### Password Security
- **Minimum Length**: 8 characters required
- **Hashing**: bcryptjs with 12 rounds
- **Validation**: Passwords must match before reset

### Rate Limiting
- **Auth Endpoints**: 5 requests per 15 minutes
- **General API**: 100 requests per 15 minutes
- **Prevents**: Brute force attacks

### Email Security
- **No Credentials in Logs**: Passwords not logged
- **HTTPS Only**: Frontend URL should be HTTPS in production
- **Token in URL**: Only for development (can be disabled)

## Testing Modes

### Development Mode (Default)
- Email service: Ethereal (test service)
- Response includes: `resetToken`, `resetUrl`, `previewUrl`
- No real emails sent
- Perfect for testing without Gmail setup

### Production Mode
- Email service: Gmail or SMTP
- Response includes: Only success message
- Real emails sent to user
- Token not exposed in response

### Gmail Mode
- Email service: Gmail
- Requires: App Password (not regular password)
- Supports: 2-Factor Authentication
- Recommended for: Development and production

## Troubleshooting

### Issue: "Invalid login credentials"
**Solution**: 
- Verify you're using an App Password, not your Gmail password
- App passwords are 16 characters with spaces
- Remove spaces in .env file

### Issue: "Less secure app access"
**Solution**:
- Enable 2-Step Verification first
- Then generate an App Password
- Use the App Password in .env

### Issue: Email not sending
**Solution**:
- Check .env configuration
- Verify Gmail App Password is correct
- Check backend logs: `backend/logs/combined.log`
- Try development mode first (Ethereal)

### Issue: Reset link not working
**Solution**:
- Verify token hasn't expired (15 minutes)
- Check FRONTEND_URL in .env matches your frontend URL
- Verify token is copied correctly

### Issue: Password not updating
**Solution**:
- Verify password is at least 8 characters
- Check passwords match
- Verify token is valid and not expired
- Check backend logs for errors

## API Endpoints

### Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

Request:
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

Response (Production):
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

### Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

Request:
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

## Admin Account

### Default Credentials
- **Email**: fenetmahdi@gmail.com
- **Username**: admin
- **Default Password**: Admin123!
- **Role**: admin
- **Department**: Security Operations

### First Login
1. Go to `http://localhost:5173/login`
2. Email: `fenetmahdi@gmail.com`
3. Password: `Admin123!`
4. Click "Sign In"

### Change Password
1. After login, go to Profile
2. Click "Change Password"
3. Enter current password: `Admin123!`
4. Enter new password (minimum 8 characters)
5. Confirm new password
6. Click "Update Password"

## Files Modified/Created

### Created Files
- `backend/services/emailService.js` - Email service with Nodemailer
- `EMAIL_SETUP_GUIDE.md` - Detailed email setup guide
- `FORGOT_PASSWORD_IMPLEMENTATION.md` - This file

### Modified Files
- `backend/controllers/authController.js` - Updated admin email, added email sending
- `backend/package.json` - Added nodemailer dependency
- `backend/.env` - Updated email configuration
- `backend/scripts/createAdmin.js` - Updated admin email
- `frontend/public/locales/en/translation.json` - Added translation keys

### Unchanged Files (Already Implemented)
- `frontend/src/pages/Login.jsx` - Already has forgot password link
- `frontend/src/pages/ForgotPassword.jsx` - Already implemented
- `frontend/src/pages/ResetPassword.jsx` - Already implemented

## Next Steps

1. **Install Dependencies**: `npm install` in backend folder
2. **Configure Gmail**: Follow EMAIL_SETUP_GUIDE.md
3. **Create Admin**: `node scripts/createAdmin.js`
4. **Start Backend**: `npm run dev`
5. **Test Flow**: Follow testing instructions above
6. **Deploy**: Update .env for production

## Support

For detailed email setup instructions, see: `EMAIL_SETUP_GUIDE.md`

For issues:
1. Check backend logs: `backend/logs/combined.log`
2. Review troubleshooting section above
3. Verify .env configuration
4. Test with development mode first

---

**Implementation Date**: 2025
**Admin Email**: fenetmahdi@gmail.com
**Status**: ✅ Complete and Ready for Testing
