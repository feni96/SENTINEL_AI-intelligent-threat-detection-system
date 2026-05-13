# Quick Start: Forgot Password Feature

## 🚀 5-Minute Setup

### 1. Install Nodemailer
```bash
cd backend
npm install
```

### 2. Get Gmail App Password
1. Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer"
3. Copy the 16-character password

### 3. Update .env
```env
EMAIL_SERVICE=gmail
EMAIL_USER=fenetmahdi@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=Sentinel AI <fenetmahdi@gmail.com>
FRONTEND_URL=http://localhost:5173
```

### 4. Create Admin User
```bash
node scripts/createAdmin.js
```

### 5. Start Backend
```bash
npm run dev
```

## 🧪 Test It

### Step 1: Request Reset
1. Go to `http://localhost:5173/login`
2. Click "Forgot Password"
3. Enter: `fenetmahdi@gmail.com`
4. Copy the `resetUrl` from response

### Step 2: Reset Password
1. Paste `resetUrl` in browser
2. Enter new password (8+ characters)
3. Confirm password
4. Click "Reset Password"

### Step 3: Login
1. Go to `http://localhost:5173/login`
2. Email: `fenetmahdi@gmail.com`
3. Password: Your new password
4. Click "Sign In"

## 📧 Admin Account

| Field | Value |
|-------|-------|
| Email | fenetmahdi@gmail.com |
| Username | admin |
| Default Password | Admin123! |
| Role | admin |

## 🔑 Key Features

✅ Secure token generation (32-byte random)
✅ Token hashing (SHA256)
✅ 15-minute expiration
✅ Professional email templates
✅ Development mode with test emails
✅ Production-ready with Gmail/SMTP
✅ Rate limiting on auth endpoints
✅ Comprehensive error handling

## 📝 Files Changed

- `backend/services/emailService.js` (NEW)
- `backend/controllers/authController.js` (UPDATED)
- `backend/package.json` (UPDATED)
- `backend/.env` (UPDATED)
- `backend/scripts/createAdmin.js` (UPDATED)
- `frontend/public/locales/en/translation.json` (UPDATED)

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Invalid login credentials" | Use App Password, not Gmail password |
| "Less secure app access" | Enable 2-Step Verification first |
| Email not sending | Check .env, verify Gmail App Password |
| Reset link not working | Token expires in 15 minutes |

## 📚 Full Documentation

- **Setup Guide**: `EMAIL_SETUP_GUIDE.md`
- **Implementation Details**: `FORGOT_PASSWORD_IMPLEMENTATION.md`
- **This Quick Start**: `QUICK_START_FORGOT_PASSWORD.md`

## ✨ What's Included

### Backend
- Email service with Nodemailer
- Forgot password endpoint
- Reset password endpoint
- Secure token generation
- Email templates (HTML)
- Error handling & logging

### Frontend
- Forgot Password page
- Reset Password page
- Translation keys
- Error messages
- Success messages

### Security
- Token hashing (SHA256)
- Token expiration (15 min)
- Rate limiting (5 req/15 min)
- Password hashing (bcryptjs)
- Secure password validation

---

**Status**: ✅ Ready to Use
**Admin Email**: fenetmahdi@gmail.com
**Last Updated**: 2025
