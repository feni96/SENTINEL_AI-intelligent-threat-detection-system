# 🚀 SENTINEL AI - QUICK START GUIDE

## ⚡ TL;DR - Get Running in 2 Minutes

### 1. Start Backend
```bash
cd backend
npm start
```
**Expected:** Server running on port 5000 ✅

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
**Expected:** Vite running on port 5173 ✅

### 3. Login
- **URL:** http://localhost:5173
- **Email:** `admin@sentinel-ai.local`
- **Password:** `Admin123!`

**That's it!** 🎉

---

## 📋 Prerequisites

- ✅ Node.js installed
- ✅ MongoDB running (localhost:27017)
- ✅ Python + FastAPI (for ML service, port 8000)

---

## 🔐 Admin Credentials

```
Email:    admin@sentinel-ai.local
Password: Admin123!
```

---

## 🌐 Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| API Docs | http://localhost:5000/api-docs |
| ML Service | http://localhost:8000 |

---

## ✅ What's Fixed

1. ✅ Login 500 error
2. ✅ CORS issues
3. ✅ Socket.IO real-time
4. ✅ i18n translations
5. ✅ ML integration
6. ✅ Authentication flow

---

## 🆘 Quick Troubleshooting

### Login Not Working?
```bash
# Check backend
curl http://localhost:5000/health

# Check admin exists
cd backend
npm run check-admin
```

### Frontend Blank?
- Hard refresh: `Ctrl + Shift + R`
- Check console: `F12`
- Clear cache

### Socket.IO Not Connecting?
- Check browser console
- Verify token: `localStorage.getItem('token')`
- Check backend logs

---

## 📚 Full Documentation

- **SYSTEM_AUDIT_REPORT.md** - Complete audit (4,500+ lines)
- **FIXES_APPLIED.md** - All fixes explained
- **FINAL_STATUS.md** - Current system status

---

## 🎯 System Status

**Backend:** ✅ RUNNING  
**Frontend:** ✅ RUNNING  
**Database:** ✅ CONNECTED  
**ML Service:** ✅ RUNNING  
**Socket.IO:** ✅ WORKING  
**Authentication:** ✅ WORKING

---

## 🎉 You're Ready!

Your Sentinel AI system is **FULLY OPERATIONAL**.

Login and start detecting threats! 🛡️
