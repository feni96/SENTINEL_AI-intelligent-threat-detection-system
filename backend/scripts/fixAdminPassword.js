const mongoose = require('mongoose');
const User = require('../models/User');

async function fixAdminPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sentinel-ai');
    
    const admin = await User.findOne({ email: 'admin@sentinel-ai.local' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }
    
    console.log('🔧 Setting password to Admin123!');
    
    // Set new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    await User.updateOne(
      { email: 'admin@sentinel-ai.local' },
      { password: hashedPassword }
    );
    
    console.log('✅ Password fixed successfully!');
    console.log('📋 Login Credentials:');
    console.log('   Email: admin@sentinel-ai.local');
    console.log('   Password: Admin123!');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
    process.exit(1);
  }
}

fixAdminPassword();
