const mongoose = require('mongoose');
const NetworkLog = require('../models/NetworkLog');
const Threat = require('../models/Threat');
const User = require('../models/User');
require('dotenv').config();

async function generateSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sentinel-ai');
    
    // Get admin user
    const admin = await User.findOne({ email: 'admin@sentinel-ai.local' });
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }
    
    console.log('✅ Admin user found:', admin.username);
    
    // Generate sample network logs for the last 24 hours
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Clear existing sample data
    await NetworkLog.deleteMany({ userId: admin._id, timestamp: { $gte: last24Hours } });
    await Threat.deleteMany({ userId: admin._id, timestamp: { $gte: last24Hours } });
    
    console.log('🗑️ Cleared existing sample data');
    
    // Sample data patterns
    const protocols = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS'];
    const actions = ['ALLOW', 'DENY', 'LOG'];
    const statuses = ['SUCCESS', 'FAILED', 'TIMEOUT'];
    const sourceIPs = [
      '192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.10',
      '198.51.100.20', '192.0.2.30', '203.0.113.40', '10.1.1.5'
    ];
    const destinationIPs = [
      '8.8.8.8', '1.1.1.1', '208.67.222.222', '9.9.9.9',
      '149.112.112.112', '64.6.64.6', '8.26.56.26', '208.67.220.220'
    ];
    
    // Generate network logs distributed over 24 hours
    const logs = [];
    const threats = [];
    let threatCounter = 0;
    
    for (let hour = 0; hour < 24; hour++) {
      const hourTime = new Date(last24Hours.getTime() + (hour * 60 * 60 * 1000));
      
      // Generate varying number of logs per hour (more during business hours)
      const logsPerHour = hour >= 8 && hour <= 18 ? 50 + Math.floor(Math.random() * 50) : 10 + Math.floor(Math.random() * 20);
      
      for (let i = 0; i < logsPerHour; i++) {
        const logTime = new Date(hourTime.getTime() + (Math.random() * 60 * 60 * 1000));
        
        const log = {
          timestamp: logTime,
          sourceIP: sourceIPs[Math.floor(Math.random() * sourceIPs.length)],
          destinationIP: destinationIPs[Math.floor(Math.random() * destinationIPs.length)],
          protocol: protocols[Math.floor(Math.random() * protocols.length)],
          packetSize: 64 + Math.floor(Math.random() * 1400),
          action: actions[Math.floor(Math.random() * actions.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          sourcePort: Math.floor(Math.random() * 65535),
          destinationPort: Math.floor(Math.random() * 65535),
          userId: admin._id,
          flags: Math.random() > 0.7 ? ['SYN', 'ACK'] : [],
          payload: Math.random() > 0.8 ? 'Sample payload data' : '',
          isAnalyzed: false,
          threatDetected: false
        };
        
        logs.push(log);
        
        // Occasionally create threats (about 5% of logs)
        if (Math.random() < 0.05 && threatCounter < 50) {
          const threatTypes = ['DDoS', 'Port Scan', 'SQL Injection', 'XSS', 'Brute Force'];
          const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
          
          const threat = new Threat({
            threatType: threatTypes[Math.floor(Math.random() * threatTypes.length)],
            sourceIP: log.sourceIP,
            timestamp: logTime,
            severityLevel: severityLevels[Math.floor(Math.random() * severityLevels.length)],
            confidenceScore: 60 + Math.floor(Math.random() * 40),
            status: 'Active',
            networkLogId: null, // Will be set after log is saved
            userId: admin._id,
            mlPredicted: Math.random() > 0.3,
            ruleBased: Math.random() > 0.5,
            mlPrediction: Math.random() > 0.3 ? {
              prediction: threatTypes[Math.floor(Math.random() * threatTypes.length)],
              confidence: Math.random() * 0.5 + 0.5,
              risk_score: Math.random() * 0.8 + 0.2,
              threat_level: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
              branch_used: 'nsl',
              model_used: 'CatBoost',
              inference_time_ms: Math.floor(Math.random() * 50) + 10,
              timestamp: logTime
            } : {}
          });
          
          threats.push(threat);
          threatCounter++;
        }
      }
    }
    
    // Save all logs
    const savedLogs = await NetworkLog.insertMany(logs);
    console.log(`✅ Generated ${savedLogs.length} network logs`);
    
    // Link threats to random logs and save
    for (let i = 0; i < threats.length; i++) {
      if (savedLogs.length > 0) {
        threats[i].networkLogId = savedLogs[Math.floor(Math.random() * savedLogs.length)]._id;
      }
    }
    
    const savedThreats = await Threat.insertMany(threats);
    console.log(`✅ Generated ${savedThreats.length} threats`);
    
    // Update some logs as analyzed
    const logsToAnalyze = savedLogs.slice(0, Math.floor(savedLogs.length * 0.3));
    await NetworkLog.updateMany(
      { _id: { $in: logsToAnalyze.map(l => l._id) } },
      { isAnalyzed: true, threatDetected: false }
    );
    
    console.log(`✅ Marked ${logsToAnalyze.length} logs as analyzed`);
    
    console.log('\n📊 Sample Data Summary:');
    console.log(`   Network Logs: ${savedLogs.length}`);
    console.log(`   Threats: ${savedThreats.length}`);
    console.log(`   Time Range: Last 24 hours`);
    console.log(`   User: ${admin.username}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Sample data generation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error generating sample data:', error);
    process.exit(1);
  }
}

generateSampleData();
