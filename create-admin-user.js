const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const connectDB = require('./lib/mongodb').default;

async function createTestUser() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Import User model after connection
    const User = require('./models/User').default;
    
    // Delete existing user first
    await User.deleteOne({ email: 'maskiryz23@gmail.com' });
    console.log('🗑️ Deleted existing user');
    
    // Create new user with plain password (will be hashed by pre-save hook)
    const newUser = new User({
      email: 'maskiryz23@gmail.com',
      password: 'admin123', // This will be hashed by the pre-save hook
      name: 'Super Administrator',
      phone: '081234567890',
      satker: 'Kementerian Pertahanan RI',
      role: 'super_admin',
      emailVerified: true,
      adminVerified: true,
      createdAt: new Date(),
      lastLogin: null
    });
    
    await newUser.save();
    console.log('✅ User created successfully');
    
    // Test login immediately
    const testUser = await User.findOne({ email: 'maskiryz23@gmail.com' });
    const isMatch = await testUser.comparePassword('admin123');
    console.log('🔑 Password test (admin123):', isMatch);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

createTestUser();