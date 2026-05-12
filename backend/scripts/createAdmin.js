const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sentinel-ai');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'admin@sentinel-ai.local' },
        { username: 'admin' }
      ]
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create admin user with secure password
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    const adminUser = new User({
      username: 'admin',
      email: 'admin@sentinel-ai.local',
      password: hashedPassword,
      role: 'admin',
      department: 'Security Operations',
      isActive: true,
      isEmailVerified: true
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📋 Login Credentials:');
    console.log('   Email: admin@sentinel-ai.local');
    console.log('   Password: Admin123!');
    console.log('   Role: admin');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
