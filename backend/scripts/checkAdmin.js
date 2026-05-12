const mongoose = require('mongoose');
const User = require('../models/User');

async function checkAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sentinel-ai');
    
    const admin = await User.findOne({ 
      $or: [
        { email: 'admin@sentinel-ai.local' },
        { username: 'admin' }
      ]
    });
    
    if (admin) {
      console.log('✅ Admin user found:');
      console.log('   Email:', admin.email);
      console.log('   Username:', admin.username);
      console.log('   Role:', admin.role);
      console.log('   Password: [Hashed - cannot be displayed]');
      console.log('');
      console.log('🔐 Login Credentials:');
      console.log('   Email: admin@sentinel-ai.local');
      console.log('   Password: Use your existing admin password');
    } else {
      console.log('❌ Admin user not found in database');
      console.log('');
      console.log('📋 To create admin user, run: node scripts/createAdmin.js');
    }
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  }
}

checkAdmin();
