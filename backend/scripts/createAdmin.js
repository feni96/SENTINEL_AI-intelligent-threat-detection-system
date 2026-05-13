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
        { email: 'fenetmahdi@gmail.com' },
        { username: 'admin' }
      ]
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('📋 Existing Admin:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Role: ${existingAdmin.role}`);
      process.exit(0);
    }
    
    // Create admin user with secure password
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    const adminUser = new User({
      username: 'admin',
      email: 'fenetmahdi@gmail.com',
      password: hashedPassword,
      role: 'admin',
      department: 'Security Operations',
      isActive: true,
      isEmailVerified: true
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📋 Login Credentials:');
    console.log('   Email: fenetmahdi@gmail.com');
    console.log('   Password: Admin123!');
    console.log('   Role: admin');
    console.log('\n📧 Email Configuration:');
    console.log('   To enable password reset emails, configure your .env file:');
    console.log('   - EMAIL_SERVICE=gmail');
    console.log('   - EMAIL_USER=fenetmahdi@gmail.com');
    console.log('   - EMAIL_PASSWORD=<your-app-password>');
    console.log('\n   See EMAIL_SETUP_GUIDE.md for detailed instructions');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
