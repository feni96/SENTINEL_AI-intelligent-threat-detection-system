const mongoose = require('mongoose');
const Zone = require('../models/Zone');
require('dotenv').config();

const haramayaZones = [
  {
    name: "ICT Center",
    description: "Main Information and Communication Technology Center",
    building: "ICT Building",
    department: "Information Technology",
    ipRange: "10.0.1.0/24",
    riskLevel: "Critical",
    zoneType: "Infrastructure",
    coordinates: {
      latitude: 9.3931,
      longitude: 42.8195
    },
    topologyPosition: { x: 100, y: 100 },
    responsiblePerson: "ICT Director",
    contactEmail: "ict@haramaya.edu.et",
    monitoringEnabled: true,
    alertThreshold: 3,
    maxDeviceCapacity: 500,
    bandwidthLimit: 10000,
    securityPolicies: [
      { policyName: "Firewall Rules", policyType: "Firewall", enabled: true },
      { policyName: "IDS Monitoring", policyType: "IDS", enabled: true },
      { policyName: "Access Control", policyType: "Access Control", enabled: true }
    ],
    tags: ["critical", "infrastructure", "core-network"]
  },
  {
    name: "Library Network",
    description: "Main Library digital resources and public access",
    building: "Main Library",
    department: "Library Services",
    ipRange: "10.0.2.0/24",
    riskLevel: "Medium",
    zoneType: "Academic",
    coordinates: {
      latitude: 9.3940,
      longitude: 42.8200
    },
    topologyPosition: { x: 200, y: 150 },
    responsiblePerson: "Head Librarian",
    contactEmail: "library@haramaya.edu.et",
    monitoringEnabled: true,
    alertThreshold: 5,
    maxDeviceCapacity: 200,
    bandwidthLimit: 1000,
    securityPolicies: [
      { policyName: "Content Filter", policyType: "Firewall", enabled: true },
      { policyName: "IDS Monitoring", policyType: "IDS", enabled: true }
    ],
    tags: ["academic", "public-access", "library"]
  },
  {
    name: "Computer Labs",
    description: "Student computer laboratories and training facilities",
    building: "Technology Building",
    department: "Computer Science",
    ipRange: "10.0.3.0/24",
    riskLevel: "Medium",
    zoneType: "Academic",
    coordinates: {
      latitude: 9.3925,
      longitude: 42.8210
    },
    topologyPosition: { x: 300, y: 100 },
    responsiblePerson: "Lab Coordinator",
    contactEmail: "labs@haramaya.edu.et",
    monitoringEnabled: true,
    alertThreshold: 7,
    maxDeviceCapacity: 150,
    bandwidthLimit: 2000,
    securityPolicies: [
      { policyName: "Application Control", policyType: "Firewall", enabled: true },
      { policyName: "IDS Monitoring", policyType: "IDS", enabled: true },
      { policyName: "Data Loss Prevention", policyType: "Data Loss Prevention", enabled: true }
    ],
    tags: ["academic", "labs", "student-facilities"]
  },
  {
    name: "Data Center",
    description: "Primary data center and server infrastructure",
    building: "Data Center Building",
    department: "IT Infrastructure",
    ipRange: "10.0.0.0/24",
    riskLevel: "Critical",
    zoneType: "Infrastructure",
    coordinates: {
      latitude: 9.3915,
      longitude: 42.8185
    },
    topologyPosition: { x: 50, y: 50 },
    responsiblePerson: "Data Center Manager",
    contactEmail: "datacenter@haramaya.edu.et",
    monitoringEnabled: true,
    alertThreshold: 2,
    maxDeviceCapacity: 100,
    bandwidthLimit: 20000,
    securityPolicies: [
      { policyName: "Strict Firewall", policyType: "Firewall", enabled: true },
      { policyName: "Advanced IDS", policyType: "IDS", enabled: true },
      { policyName: "Access Control", policyType: "Access Control", enabled: true },
      { policyName: "Data Loss Prevention", policyType: "Data Loss Prevention", enabled: true }
    ],
    tags: ["critical", "infrastructure", "servers", "database"]
  },
  {
    name: "Admin Office",
    description: "Administrative offices and management systems",
    building: "Administration Building",
    department: "Administration",
    ipRange: "10.0.4.0/24",
    riskLevel: "High",
    zoneType: "Administrative",
    coordinates: {
      latitude: 9.3950,
      longitude: 42.8190
    },
    topologyPosition: { x: 150, y: 200 },
    responsiblePerson: "Admin Director",
    contactEmail: "admin@haramaya.edu.et",
    monitoringEnabled: true,
    alertThreshold: 4,
    maxDeviceCapacity: 80,
    bandwidthLimit: 1500,
    securityPolicies: [
      { policyName: "Corporate Firewall", policyType: "Firewall", enabled: true },
      { policyName: "IDS Monitoring", policyType: "IDS", enabled: true },
      { policyName: "Access Control", policyType: "Access Control", enabled: true }
    ],
    tags: ["administrative", "management", "sensitive"]
  },
  {
    name: "Student Wi-Fi",
    description: "Campus-wide student wireless network",
    building: "Multiple Buildings",
    department: "Student Services",
    ipRange: "10.0.6.0/22",
    riskLevel: "High",
    zoneType: "Public Access",
    coordinates: {
      latitude: 9.3930,
      longitude: 42.8200
    },
    topologyPosition: { x: 250, y: 250 },
    responsiblePerson: "Network Manager",
    contactEmail: "network@haramaya.edu.et",
    monitoringEnabled: true,
    alertThreshold: 10,
    maxDeviceCapacity: 2000,
    bandwidthLimit: 5000,
    securityPolicies: [
      { policyName: "Wireless Security", policyType: "Firewall", enabled: true },
      { policyName: "IDS Monitoring", policyType: "IDS", enabled: true },
      { policyName: "Content Filter", policyType: "Firewall", enabled: true }
    ],
    tags: ["public-access", "wireless", "student-services"]
  },
  {
    name: "HIT Building",
    description: "Harar Institute of Technology facilities",
    building: "HIT Building",
    department: "Engineering",
    ipRange: "10.0.10.0/24",
    riskLevel: "Medium",
    zoneType: "Research",
    coordinates: {
      latitude: 9.3900,
      longitude: 42.8220
    },
    topologyPosition: { x: 400, y: 100 },
    responsiblePerson: "HIT Director",
    contactEmail: "hit@haramaya.edu.et",
    monitoringEnabled: true,
    alertThreshold: 6,
    maxDeviceCapacity: 300,
    bandwidthLimit: 3000,
    securityPolicies: [
      { policyName: "Research Firewall", policyType: "Firewall", enabled: true },
      { policyName: "IDS Monitoring", policyType: "IDS", enabled: true },
      { policyName: "Data Loss Prevention", policyType: "Data Loss Prevention", enabled: true }
    ],
    tags: ["research", "engineering", "hit"]
  },
  {
    name: "Registrar Office",
    description: "Student registration and academic records",
    building: "Registrar Building",
    department: "Registrar",
    ipRange: "10.0.5.0/24",
    riskLevel: "High",
    zoneType: "Administrative",
    coordinates: {
      latitude: 9.3945,
      longitude: 42.8180
    },
    topologyPosition: { x: 200, y: 300 },
    responsiblePerson: "Registrar",
    contactEmail: "registrar@haramaya.edu.et",
    monitoringEnabled: true,
    alertThreshold: 3,
    maxDeviceCapacity: 50,
    bandwidthLimit: 800,
    securityPolicies: [
      { policyName: "Strict Access Control", policyType: "Access Control", enabled: true },
      { policyName: "IDS Monitoring", policyType: "IDS", enabled: true },
      { policyName: "Data Loss Prevention", policyType: "Data Loss Prevention", enabled: true }
    ],
    tags: ["administrative", "student-records", "sensitive-data"]
  },
  {
    name: "Dormitory Network",
    description: "Student housing network infrastructure",
    building: "Student Dormitories",
    department: "Student Services",
    ipRange: "10.0.20.0/22",
    riskLevel: "High",
    zoneType: "Student Housing",
    coordinates: {
      latitude: 9.3910,
      longitude: 42.8170
    },
    topologyPosition: { x: 100, y: 350 },
    responsiblePerson: "Housing Director",
    contactEmail: "housing@haramaya.edu.et",
    monitoringEnabled: true,
    alertThreshold: 8,
    maxDeviceCapacity: 1500,
    bandwidthLimit: 4000,
    securityPolicies: [
      { policyName: "Residential Firewall", policyType: "Firewall", enabled: true },
      { policyName: "IDS Monitoring", policyType: "IDS", enabled: true },
      { policyName: "Content Filter", policyType: "Firewall", enabled: true }
    ],
    tags: ["student-housing", "residential", "high-capacity"]
  }
];

const seedZones = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sentinel-ai');
    console.log('Connected to MongoDB');

    // Clear existing zones
    await Zone.deleteMany({});
    console.log('Cleared existing zones');

    // Insert new zones
    const insertedZones = await Zone.insertMany(haramayaZones);
    console.log(`Inserted ${insertedZones.length} zones for Haramaya University`);

    // Display inserted zones
    insertedZones.forEach((zone, index) => {
      console.log(`${index + 1}. ${zone.name} - ${zone.ipRange} (${zone.building})`);
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding zones:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedZones();
}

module.exports = { seedZones, haramayaZones };
