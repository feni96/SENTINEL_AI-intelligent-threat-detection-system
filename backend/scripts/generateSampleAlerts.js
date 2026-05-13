const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Threat = require('../models/Threat');
const Alert = require('../models/Alert');
const User = require('../models/User');

dotenv.config();

const threatTypes = [
  'DDoS',
  'Brute Force',
  'SQL Injection',
  'XSS',
  'Port Scan',
  'Malware',
  'Phishing',
  'Man-in-the-Middle',
  'DNS Spoofing',
  'Zero-Day Exploit',
  'Reconnaissance',
  'Data Exfiltration',
  'Suspicious Activity',
  'Anomaly'
];

const severityLevels = ['Low', 'Medium', 'High', 'Critical'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];
const alertTypes = ['Threat Detected', 'System Alert', 'Performance Issue', 'Security Breach', 'Anomaly Detected'];
const sources = ['Rule-Based Engine', 'ML Model', 'Manual', 'IDS/IPS', 'Firewall', 'Antivirus'];
const statuses = ['Open', 'Acknowledged', 'In Progress', 'Resolved', 'Dismissed'];

function generateRandomIP() {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateThreatMessage(threatType, sourceIP) {
  const messages = {
    'DDoS': `Distributed Denial of Service attack detected from ${sourceIP}. Multiple connection attempts detected.`,
    'Brute Force': `Brute force attack detected from ${sourceIP}. Multiple failed login attempts recorded.`,
    'SQL Injection': `SQL Injection attempt detected from ${sourceIP}. Malicious SQL query pattern identified.`,
    'XSS': `Cross-Site Scripting (XSS) attack detected from ${sourceIP}. Malicious script injection attempt.`,
    'Port Scan': `Port scanning activity detected from ${sourceIP}. Multiple port connection attempts.`,
    'Malware': `Malware signature detected from ${sourceIP}. Known malicious file pattern identified.`,
    'Phishing': `Phishing attempt detected from ${sourceIP}. Suspicious email/link pattern identified.`,
    'Man-in-the-Middle': `Man-in-the-Middle attack detected from ${sourceIP}. Unauthorized traffic interception.`,
    'DNS Spoofing': `DNS Spoofing attack detected from ${sourceIP}. Unauthorized DNS response detected.`,
    'Zero-Day Exploit': `Zero-Day exploit attempt detected from ${sourceIP}. Unknown vulnerability exploitation.`,
    'Reconnaissance': `Reconnaissance activity detected from ${sourceIP}. Network scanning and probing detected.`,
    'Data Exfiltration': `Data exfiltration attempt detected from ${sourceIP}. Unauthorized data transfer detected.`,
    'Suspicious Activity': `Suspicious activity detected from ${sourceIP}. Unusual network behavior observed.`,
    'Anomaly': `Network anomaly detected from ${sourceIP}. Unusual traffic pattern identified.`
  };
  return messages[threatType] || `Security threat detected from ${sourceIP}`;
}

async function generateSampleAlerts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sentinel-ai');
    console.log('✅ Connected to MongoDB');

    // Get admin user
    const adminUser = await User.findOne({ email: 'fenetmahdi@gmail.com' });
    if (!adminUser) {
      console.error('❌ Admin user not found. Please create admin user first.');
      process.exit(1);
    }
    console.log(`✅ Found admin user: ${adminUser.username}`);

    // Generate 15 sample threats and alerts
    const alerts = [];
    const threats = [];

    for (let i = 0; i < 15; i++) {
      const threatType = getRandomElement(threatTypes);
      const sourceIP = generateRandomIP();
      const severity = getRandomElement(severityLevels);
      const priority = getRandomElement(priorities);
      const alertType = getRandomElement(alertTypes);
      const source = getRandomElement(sources);
      const status = getRandomElement(statuses);

      // Create threat
      const threat = new Threat({
        threatType,
        sourceIP,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
        severityLevel: severity,
        confidenceScore: Math.floor(Math.random() * 40) + 60, // 60-100
        status: status === 'Resolved' ? 'Resolved' : status === 'Dismissed' ? 'False Positive' : 'Active',
        areaName: `Zone ${Math.floor(Math.random() * 5) + 1}`,
        zoneType: getRandomElement(['Internal', 'DMZ', 'External', 'Critical Infrastructure', 'User Network']),
        latitude: (Math.random() * 180) - 90,
        longitude: (Math.random() * 360) - 180,
        description: generateThreatMessage(threatType, sourceIP),
        affectedSystems: [`System-${Math.floor(Math.random() * 10) + 1}`, `Server-${Math.floor(Math.random() * 5) + 1}`],
        userId: adminUser._id,
        mlPredicted: Math.random() > 0.5,
        ruleBased: true
      });

      await threat.save();
      threats.push(threat);
      console.log(`✅ Created threat: ${threatType} from ${sourceIP}`);

      // Create alert for this threat
      const alert = new Alert({
        threatId: threat._id,
        timestamp: threat.timestamp,
        priority,
        message: generateThreatMessage(threatType, sourceIP),
        status,
        alertType,
        source,
        userId: adminUser._id,
        notificationSent: true,
        notificationChannels: ['Dashboard', 'Email'],
        metadata: {
          threatType,
          sourceIP,
          severity,
          confidence: threat.confidenceScore
        }
      });

      // If alert is acknowledged, set acknowledgedBy and acknowledgedAt
      if (status === 'Acknowledged' || status === 'In Progress' || status === 'Resolved') {
        alert.acknowledgedBy = adminUser._id;
        alert.acknowledgedAt = new Date(alert.timestamp.getTime() + Math.random() * 60 * 60 * 1000);
      }

      // If alert is resolved, set resolvedBy and resolvedAt
      if (status === 'Resolved') {
        alert.resolvedBy = adminUser._id;
        alert.resolvedAt = new Date(alert.acknowledgedAt.getTime() + Math.random() * 60 * 60 * 1000);
        alert.resolutionNotes = 'Threat mitigated and system secured.';
      }

      // If alert is dismissed, set resolvedBy and resolvedAt
      if (status === 'Dismissed') {
        alert.resolvedBy = adminUser._id;
        alert.resolvedAt = new Date(alert.timestamp.getTime() + Math.random() * 60 * 60 * 1000);
        alert.resolutionNotes = 'False positive - no action required.';
      }

      await alert.save();
      alerts.push(alert);
      console.log(`✅ Created alert: ${priority} - ${alertType}`);
    }

    console.log(`\n✅ Successfully generated ${alerts.length} sample alerts and ${threats.length} sample threats!`);
    console.log('\n📊 Alert Summary:');
    console.log(`   - Total Alerts: ${alerts.length}`);
    console.log(`   - Open: ${alerts.filter(a => a.status === 'Open').length}`);
    console.log(`   - Acknowledged: ${alerts.filter(a => a.status === 'Acknowledged').length}`);
    console.log(`   - In Progress: ${alerts.filter(a => a.status === 'In Progress').length}`);
    console.log(`   - Resolved: ${alerts.filter(a => a.status === 'Resolved').length}`);
    console.log(`   - Dismissed: ${alerts.filter(a => a.status === 'Dismissed').length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating sample alerts:', error);
    process.exit(1);
  }
}

generateSampleAlerts();
