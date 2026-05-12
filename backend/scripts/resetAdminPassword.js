const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sentinel-ai');
    
    // Find admin user
    const admin = await User.findOne({ 
      $or: [
        { email: 'admin@sentinel-ai.local' },
        { username: 'admin' }
      ]
    });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }
    
    // Generate new secure password
    const newPassword = 'Admin123!'; // You can change this to any secure password you prefer
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update admin password
    admin.password = hashedPassword;
    await admin.save();
    
    console.log('✅ Admin password reset successfully');
    console.log('📋 New Login Credentials:');
    console.log('   Email: admin@sentinel-ai.local');
    console.log('   Password:', newPassword);
    console.log('   Role: admin');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    process.exit(1);
  }
}

resetAdminPassword();
