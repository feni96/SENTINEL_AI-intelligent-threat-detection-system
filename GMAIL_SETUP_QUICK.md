# Gmail Setup for Password Reset Emails - Quick Guide

## Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "2-Step Verification"
3. Follow the steps to enable it

## Step 2: Generate App Password

1. Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
2. Select:
   - **App**: Mail
   - **Device**: Windows Computer (or your device)
3. Click "Generate"
4. Google will show a 16-character password like: `xxxx xxxx xxxx xxxx`
5. **Copy this password** (including spaces)

## Step 3: Update .env File

Open `backend/.env` and update:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=fenetmahdi@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=Sentinel AI <fenetmahdi@gmail.com>
FRONTEND_URL=http://localhost:5173
```

**Important**: Paste the 16-character password exactly as Google provided it (with spaces).

## Step 4: Restart Backend

```bash
cd backend
npm run dev
```

You should see in the logs:
```
✅ Gmail transporter initialized successfully
```

## Step 5: Test It

1. Go to `http://localhost:5173/login`
2. Click "Forgot Password"
3. Enter: `fenetmahdi@gmail.com`
4. You should receive an email within seconds

## Troubleshooting

### Error: "Invalid login credentials"
- Make sure you're using the **App Password**, not your Gmail password
- The App Password is 16 characters with spaces
- Copy it exactly as shown by Google

### Error: "Less secure app access"
- You need to enable 2-Step Verification first
- Then generate an App Password

### Email not arriving
- Check spam/junk folder
- Verify the email address in .env is correct
- Check backend logs: `backend/logs/combined.log`

### Testing without Gmail
If you don't want to set up Gmail yet, the system will use a test service (Ethereal) and show the reset link in the response.

---

**Status**: Ready to configure
**Admin Email**: fenetmahdi@gmail.com
