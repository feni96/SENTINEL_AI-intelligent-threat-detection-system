# Sentinel AI - Dynamic Zone Management System Testing Guide

## Quick Testing Checklist

### 🚀 **Start the System**
1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```
   Verify server starts on port 5000

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   Verify frontend starts on port 3000

3. **Check Database Connection**
   - MongoDB should be running
   - Zone data should be populated (9 zones)

---

## 🧪 **Backend API Testing**

### Test Zone Management APIs

#### 1. **List All Zones**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/zones
```
**Expected:** Array of 9 Haramaya University zones

#### 2. **Get Zone Statistics**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/zones/stats
```
**Expected:** Zone statistics by type and building

#### 3. **Test IP Resolution**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/zones/resolve/10.0.2.15
```
**Expected:** Library Network zone information

#### 4. **Create New Zone (Admin Only)**
```bash
curl -X POST http://localhost:5000/api/zones \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Zone",
       "building": "Test Building", 
       "department": "IT",
       "ipRange": "10.0.99.0/24",
       "riskLevel": "Medium",
       "zoneType": "Academic"
     }'
```

### Test Threat Integration

#### 5. **Create Threat with Zone Resolution**
```bash
curl -X POST http://localhost:5000/api/threats \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "threatType": "DDoS",
       "sourceIP": "10.0.2.15",
       "severityLevel": "High", 
       "confidenceScore": 85
     }'
```
**Expected:** Threat enriched with Library Network zone data

---

## 🌐 **Frontend Testing**

### Test Settings Page

#### 6. **Zone Management Interface**
1. Navigate to `http://localhost:3000/settings`
2. **Verify Zone Loading:**
   - Should see 9 zones loaded from backend
   - No hardcoded data visible
3. **Test Zone Toggle:**
   - Click enable/disable checkbox for any zone
   - Verify API call and UI update
4. **Test Add Zone:**
   - Click "Add New Zone" button
   - Fill form with valid data
   - Submit and verify creation
5. **Test Delete Zone:**
   - Click delete button for any zone
   - Confirm deletion and verify removal

### Test Dashboard Page

#### 7. **Zone Visualization**
1. Navigate to `http://localhost:3000/dashboard`
2. **Verify Zone Display:**
   - Should see zones grid with real data
   - Check risk level color coding
   - Verify active/inactive status indicators

### Test AreaMap Page

#### 8. **Real-time Zone Mapping**
1. Navigate to `http://localhost:3000/areamap`
2. **Verify Dynamic Zones:**
   - Should load zones from backend (not hardcoded)
   - Check zone coordinates and threat mapping
3. **Test Threat Resolution:**
   - Create test threat via API
   - Verify zone appears on map with threat indicator

---

## ⚡ **Real-time Testing**

### Test Socket.IO Integration

#### 9. **Live Threat Updates**
1. Open browser developer tools
2. Navigate to Dashboard
3. Create test threat via API:
   ```bash
   curl -X POST http://localhost:5000/api/threats \
        -H "Authorization: Bearer YOUR_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
          "threatType": "Port Scan",
          "sourceIP": "10.0.1.50",
          "severityLevel": "Medium",
          "confidenceScore": 75
        }'
   ```
4. **Verify Real-time Update:**
   - Dashboard should update immediately
   - AreaMap should show new threat
   - Zone should be highlighted

#### 10. **Zone-specific Alerts**
1. In browser console, subscribe to zone:
   ```javascript
   socket.emit('subscribeZone', 'Library Network');
   ```
2. Create threat with IP in that zone
3. Verify zone-specific alert received

---

## 🔍 **End-to-End Testing**

### Complete Zone Resolution Flow

#### 11. **Test IP-to-Zone Resolution**
```javascript
// Test in browser console
fetch('/api/zones/resolve/10.0.2.15', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(res => res.json())
.then(data => {
  console.log('Resolved Zone:', data.data.zone.name);
  // Expected: "Library Network"
});
```

#### 12. **Test ML Pipeline Integration**
```bash
# Simulate ML prediction
curl -X POST http://localhost:5000/api/threats/ml-prediction \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "sourceIP": "10.0.3.25",
       "destinationIP": "10.0.1.10", 
       "prediction": "Brute Force",
       "confidence": 0.92,
       "riskScore": 0.85
     }'
```
**Expected:** Threat created with Computer Labs zone data

---

## 📊 **Performance Testing**

### Zone Resolution Performance

#### 13. **Test Cache Performance**
```javascript
// In browser console
const testIPResolution = async () => {
  // First call (cache miss)
  const start1 = performance.now();
  await fetch('/api/zones/resolve/10.0.2.15', {
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
  });
  const end1 = performance.now();
  
  // Second call (cache hit)
  const start2 = performance.now();
  await fetch('/api/zones/resolve/10.0.2.15', {
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
  });
  const end2 = performance.now();
  
  console.log(`Cache miss: ${end1 - start1}ms`);
  console.log(`Cache hit: ${end2 - start2}ms`);
  // Cache hit should be significantly faster
};

testIPResolution();
```

---

## 🐛 **Troubleshooting Common Issues**

### Zone Not Found
**Problem:** IP resolution returns null
**Solution:** 
1. Check if zone exists in database
2. Verify IP range format (CIDR notation)
3. Check zone is enabled

### Socket.IO Not Working
**Problem:** Real-time updates not appearing
**Solution:**
1. Check browser console for Socket.IO errors
2. Verify token is valid
3. Check server Socket.IO logs

### Frontend Not Loading Zones
**Problem:** Settings shows no zones
**Solution:**
1. Check backend API is accessible
2. Verify authentication token
3. Check browser network tab for API errors

---

## 📱 **Mobile/Responsive Testing**

#### 14. **Test Responsive Design**
1. Open browser developer tools
2. Test different screen sizes:
   - Mobile: 375x667
   - Tablet: 768x1024  
   - Desktop: 1920x1080
3. Verify zone management interface works on all sizes

---

## 🔐 **Security Testing**

#### 15. **Test Authorization**
1. **Test Admin Protection:**
   - Try to create zone without admin token
   - Should return 403 Forbidden
2. **Test Input Validation:**
   - Try invalid IP range
   - Try zone name > 100 characters
   - Should return validation errors

---

## 📈 **Load Testing**

#### 16. **Test Concurrent Zone Operations**
```javascript
// Test multiple simultaneous zone updates
const promises = [];
for (let i = 0; i < 10; i++) {
  promises.push(
    fetch('/api/zones', {
      headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
    })
  );
}

Promise.all(promises)
  .then(() => console.log('Load test completed'))
  .catch(err => console.error('Load test failed:', err));
```

---

## ✅ **Success Criteria**

### Backend Tests Pass When:
- [ ] All 9 zones are returned by API
- [ ] IP resolution works for all zone ranges
- [ ] Threat creation enriches with zone data
- [ ] Socket.IO emits real-time zone alerts
- [ ] Admin protection works correctly
- [ ] Input validation catches invalid data

### Frontend Tests Pass When:
- [ ] Settings page loads zones dynamically
- [ ] Zone CRUD operations work smoothly
- [ ] Dashboard shows real-time zone status
- [ ] AreaMap displays zones with threat mapping
- [ ] Real-time updates appear immediately
- [ ] Error handling works for all operations

### Integration Tests Pass When:
- [ ] Threat from 10.0.2.x resolves to Library Network
- [ ] Threat from 10.0.3.x resolves to Computer Labs
- [ ] Threat from 10.0.0.x resolves to Data Center
- [ ] Socket.IO updates all components simultaneously
- [ ] Zone statistics update correctly

---

## 🚨 **What to Do If Tests Fail**

### Database Issues
```bash
# Check MongoDB connection
mongosh sentinel-ai --eval "db.zones.countDocuments()"
# Should return: 9
```

### API Issues
```bash
# Check server logs
tail -f logs/combined.log

# Check zone API directly
curl -v http://localhost:5000/api/zones
```

### Frontend Issues
```bash
# Check for JavaScript errors
# Open browser developer tools → Console tab

# Check network requests
# Open browser developer tools → Network tab
```

---

## 🎯 **Final Verification**

### Complete System Test
1. **Start full system** (backend + frontend)
2. **Login as admin user**
3. **Create test threat** with IP from each zone
4. **Verify each component** shows correct zone information
5. **Check real-time updates** across all pages
6. **Test zone management** operations
7. **Verify performance** is acceptable

### Expected Results
- ✅ All 9 Haramaya University zones loaded
- ✅ IP resolution works for any campus IP
- ✅ Threats automatically enriched with zone data
- ✅ Real-time updates work across all components
- ✅ Zone management interface fully functional
- ✅ System performs well under load

---

## 📞 **Support Information**

If you encounter issues during testing:

1. **Check Logs:**
   - Backend: `backend/logs/combined.log`
   - Frontend: Browser developer tools console

2. **Verify Environment:**
   - MongoDB running on default port
   - Backend on port 5000
   - Frontend on port 3000

3. **Common Fixes:**
   - Clear browser cache
   - Restart backend server
   - Re-seed database: `node scripts/seedZones.js`

4. **Get Help:**
   - Review implementation documentation
   - Check API responses in network tab
   - Verify Socket.IO connection status

---

**🎉 Testing Complete!**

If all tests pass, your Sentinel AI system is successfully transformed into a dynamic, database-driven zone management system ready for production use!
