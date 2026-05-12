# Testing Real Data Flow - Step by Step Guide

## 🎯 Objective
Demonstrate that the ML threat detection and dashboard updates are using REAL data from the database and ML service, not mock data.

---

## 📋 Prerequisites

### 1. Verify Services are Running
```bash
# Terminal 1 - Backend
cd backend
node server.js
# Should show: ✅ MongoDB connected, ✅ Server running on port 5000

# Terminal 2 - Frontend  
cd frontend
npm run dev
# Should show: ➜ Local: http://localhost:5173/

# Terminal 3 - ML Service (if you have it)
# Should be running on port 8000
```

### 2. Login to Dashboard
```
URL: http://localhost:5173/login
Email: admin@sentinel-ai.local
Password: Admin123!
```

---

## 🧪 Test 1: Verify Empty State (No Mock Data)

### Step 1: Open Dashboard
```
URL: http://localhost:5173/dashboard
```

### Step 2: Check Initial State
**Expected Results:**
```
Active Threats: 0
Anomalies Detected: 0
Protected Systems: 0
Recent Threats Table: Empty (no rows)
```

**What This Proves:**
✅ Dashboard is NOT showing fake/mock threat data
✅ Dashboard is querying real database (which is empty)
✅ No hardcoded threat counts

### Step 3: Open Browser Console
```
Press F12 → Console tab
```

**Expected Console Output:**
```javascript
✅ Socket.IO connected: <socket-id>
✅ API call: GET /api/ml/threats/stats
✅ API call: GET /api/ml/threats/recent?limit=5
✅ Response: { totalThreats: 0, recentThreats: 0, mlPredictedCount: 0 }
```

---

## 🧪 Test 2: Create Real Threat via ML Prediction

### Method A: Using Network Log Upload (If Implemented)

#### Step 1: Go to Network Logs Page
```
URL: http://localhost:5173/network-logs
```

#### Step 2: Upload Network Log
- Click "Upload Log" or "Add Log"
- Upload a CSV file with network traffic data
- Or manually enter log data

#### Step 3: Trigger ML Prediction
- Select the uploaded log
- Click "Analyze with ML" or "Predict Threat"
- Wait for ML service to respond

#### Step 4: Check Dashboard Updates
```
URL: http://localhost:5173/dashboard
```

**Expected Results:**
```
Active Threats: 1 (increased from 0)
Anomalies Detected: 1 (increased from 0)
Protected Systems: 1 (increased from 0)
Recent Threats Table: Shows 1 new threat with:
  - Threat Type: (from ML prediction)
  - Source IP: (from network log)
  - Severity: (from ML prediction)
  - Confidence: (from ML prediction)
```

**Browser Console Should Show:**
```javascript
✅ Socket.IO event received: newThreat
✅ Threat data: { threatType: "...", sourceIP: "...", confidence: ... }
✅ Dashboard updated in real-time
```

---

### Method B: Using API Directly (For Testing)

#### Step 1: Create Network Log via API
```bash
# Open a new terminal
curl -X POST http://localhost:5000/api/network-logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sourceIP": "192.168.1.100",
    "destinationIP": "10.0.0.50",
    "sourcePort": 54321,
    "destinationPort": 80,
    "protocol": "TCP",
    "packetSize": 1500,
    "flags": "SYN",
    "timestamp": "2025-01-15T10:30:00Z"
  }'
```

**Get JWT Token:**
```javascript
// In browser console (F12):
localStorage.getItem('token')
// Copy the token and replace YOUR_JWT_TOKEN above
```

#### Step 2: Trigger ML Prediction
```bash
curl -X POST http://localhost:5000/api/ml/predict \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "logId": "LOG_ID_FROM_STEP_1"
  }'
```

#### Step 3: Watch Dashboard Update in Real-Time
- Keep dashboard open in browser
- Watch the numbers update automatically
- See new threat appear in table

---

### Method C: Using Features Directly (Fastest)

#### Step 1: Call Predict from Features API
```bash
curl -X POST http://localhost:5000/api/ml/predict-features \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "features": {
      "sourceIP": "192.168.1.100",
      "destinationIP": "10.0.0.50",
      "sourcePort": 54321,
      "destinationPort": 80,
      "protocol": "TCP",
      "packetSize": 1500,
      "duration": 120,
      "bytesSent": 5000,
      "bytesReceived": 3000
    }
  }'
```

#### Step 2: Check Response
```json
{
  "success": true,
  "message": "Feature-based prediction completed",
  "data": {
    "threat": {
      "_id": "...",
      "threatType": "Port Scan",
      "sourceIP": "192.168.1.100",
      "severityLevel": "High",
      "confidenceScore": 87,
      "mlPredicted": true,
      "mlPrediction": {
        "prediction": "portscan",
        "confidence": 0.87,
        "threat_level": "HIGH",
        "model_used": "random_forest"
      }
    }
  }
}
```

#### Step 3: Verify Dashboard Updated
- Dashboard should show increased counts
- New threat should appear in table
- Socket.IO should have emitted event

---

## 🧪 Test 3: Verify Database Storage

### Step 1: Connect to MongoDB
```bash
mongosh mongodb://localhost:27017/sentinel-ai
```

### Step 2: Query Threats Collection
```javascript
// Show all threats
db.threats.find().pretty()

// Count threats
db.threats.countDocuments()

// Show recent threats
db.threats.find().sort({ timestamp: -1 }).limit(5).pretty()

// Show ML predictions
db.threats.find({ mlPredicted: true }).pretty()
```

### Expected Output:
```javascript
{
  _id: ObjectId("..."),
  threatType: "Port Scan",
  sourceIP: "192.168.1.100",
  severityLevel: "High",
  confidenceScore: 87,
  status: "Active",
  mlPredicted: true,
  mlPrediction: {
    prediction: "portscan",
    confidence: 0.87,
    risk_score: 0.85,
    threat_level: "HIGH",
    model_used: "random_forest",
    inference_time_ms: 45
  },
  timestamp: ISODate("2025-01-15T10:30:00.000Z"),
  userId: ObjectId("..."),
  createdAt: ISODate("2025-01-15T10:30:00.000Z"),
  updatedAt: ISODate("2025-01-15T10:30:00.000Z")
}
```

**What This Proves:**
✅ Threats are stored in real database
✅ ML predictions are saved with full details
✅ Dashboard queries this real data

---

## 🧪 Test 4: Verify Real-Time Updates

### Step 1: Open Dashboard in Two Browser Windows
```
Window 1: http://localhost:5173/dashboard
Window 2: http://localhost:5173/dashboard
```

### Step 2: Trigger ML Prediction (using any method above)

### Step 3: Watch Both Windows Update Simultaneously
**Expected Behavior:**
- ✅ Both windows update at the same time
- ✅ No page refresh needed
- ✅ Socket.IO pushes update to all connected clients

**Browser Console Should Show:**
```javascript
// Window 1
✅ Socket.IO event: newThreat
✅ Dashboard updated

// Window 2
✅ Socket.IO event: newThreat
✅ Dashboard updated
```

**What This Proves:**
✅ Real-time updates via Socket.IO
✅ Not polling or fake updates
✅ True push-based architecture

---

## 🧪 Test 5: Verify ML Service Integration

### Step 1: Check ML Service Health
```bash
curl http://localhost:5000/api/ml/health
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "health": {
      "status": "healthy",
      "models_loaded": true,
      "available_models": ["random_forest", "neural_network"],
      "uptime": 3600
    }
  }
}
```

### Step 2: Check ML Service Directly (if accessible)
```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "models": ["random_forest", "neural_network"],
  "version": "1.0.0"
}
```

**What This Proves:**
✅ ML service is running
✅ Models are loaded
✅ Backend can communicate with ML service

---

## 🧪 Test 6: Verify API Responses

### Step 1: Get Threat Stats
```bash
curl http://localhost:5000/api/ml/threats/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalThreats": 5,
    "recentThreats": 3,
    "mlPredictedCount": 5,
    "threatsByLevel": {
      "High": 2,
      "Medium": 2,
      "Low": 1
    },
    "topThreatTypes": [
      { "_id": "Port Scan", "count": 2 },
      { "_id": "DDoS", "count": 1 }
    ],
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

### Step 2: Get Recent Threats
```bash
curl http://localhost:5000/api/ml/threats/recent?limit=5 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "threats": [
      {
        "_id": "...",
        "threatType": "Port Scan",
        "sourceIP": "192.168.1.100",
        "severityLevel": "High",
        "confidenceScore": 87,
        "timestamp": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 5,
      "pages": 1
    }
  }
}
```

**What This Proves:**
✅ APIs return real data from database
✅ Pagination works
✅ Data matches what's in MongoDB

---

## 📊 Comparison: Real vs Mock Data

### Real Data Indicators:
✅ **Empty state when no threats exist**
✅ **Numbers change when threats are added**
✅ **Data persists after page refresh**
✅ **Data matches MongoDB queries**
✅ **Real-time updates via Socket.IO**
✅ **API responses match database**
✅ **ML predictions include model details**

### Mock Data Indicators:
❌ **Always shows same numbers**
❌ **Numbers don't change**
❌ **Data resets after refresh**
❌ **No database records**
❌ **No Socket.IO events**
❌ **Hardcoded in frontend code**

---

## 🎯 What's Real in Your Dashboard

### ✅ REAL (Verified):
1. **Threat counts** - From MongoDB aggregation
2. **Recent threats table** - From MongoDB query
3. **ML predictions** - From FastAPI ML service
4. **Real-time updates** - Via Socket.IO
5. **Confidence scores** - From ML model output
6. **Severity levels** - Calculated from ML risk scores
7. **Timestamps** - Actual database timestamps

### ❌ MOCK (Hardcoded):
1. **Traffic history chart** - Hardcoded values `[3200, 4100, 2800, 4870]`
2. **System uptime** - Hardcoded `99.7%`
3. **Connection metrics** - Hardcoded numbers
4. **Bandwidth stats** - No real data source

---

## 💡 For Your Project Demonstration

### What to Emphasize:
1. **"The core threat detection is fully functional with real ML integration"**
2. **"Dashboard displays actual threats from the database"**
3. **"Real-time updates work via WebSocket"**
4. **"ML service analyzes network logs and returns predictions"**

### What to Acknowledge:
1. **"Traffic monitoring would require network capture tools in production"**
2. **"Connection tracking would need system-level access"**
3. **"Some metrics are simulated for demonstration purposes"**

### How to Demo:
1. Show empty dashboard (proves no mock data)
2. Upload network log or trigger prediction
3. Show dashboard update in real-time
4. Query MongoDB to show stored threat
5. Show ML prediction details
6. Demonstrate Socket.IO real-time updates

---

## 🚀 Quick Demo Script

```bash
# 1. Show empty dashboard
echo "Dashboard shows 0 threats - no mock data"

# 2. Create threat via API
curl -X POST http://localhost:5000/api/ml/predict-features \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"features": {...}}'

# 3. Show dashboard updated
echo "Dashboard now shows 1 threat - real data"

# 4. Query database
mongosh --eval "db.threats.find().pretty()"

# 5. Show they match
echo "Database and dashboard show same data - proves it's real"
```

---

**CONCLUSION: Your threat detection system uses REAL data from MongoDB and ML predictions from FastAPI. The peripheral metrics (traffic, connections) are placeholders that would be populated by network monitoring in production.**
