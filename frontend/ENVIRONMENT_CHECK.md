# Environment Comparison Checklist

## Working PC vs Current PC

Please provide the following information from the PC where Sentinel AI is working:

### 1. Browser & Version
- Chrome/Firefox/Safari/Edge version
- Any browser extensions that might interfere

### 2. Node.js Environment
```bash
node --version
npm --version
```

### 3. Environment Variables
```bash
echo $NODE_ENV
echo $VITE_API_BASE_URL
```

### 4. Vite Server Output
- What port does Vite run on?
- Any error messages in console?

### 5. Browser Console Errors
- Open Developer Tools (F12)
- Check Console tab for any JavaScript errors
- Check Network tab for failed requests

### 6. Package Versions
```bash
npm list react
npm list react-i18next
```

### 7. Git Status
```bash
git status
git log --oneline -3
```

### 8. Specific Test Results
```bash
curl -s http://localhost:PORT/ | head -5
```

## Most Common Environment-Specific Issues

1. **Browser Cache/Cookies**
   - Clear browser data completely
   - Try incognito/private mode

2. **Environment Variables**
   - NODE_ENV not set correctly
   - VITE_API_BASE_URL missing

3. **Port Conflicts**
   - Another service using same ports
   - Firewall blocking ports

4. **Node Modules**
   - Corrupted node_modules
   - Version mismatches

5. **Network/Firewall**
   - Localhost resolution issues
   - Antivirus blocking requests

Please provide this information so I can identify the exact difference and fix the blank page issue.
