const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const connectDB = require('./lib/mongodb').default;

async function checkUser() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Import User model after connection
    const User = require('./models/User').default;
    
    const user = await User.findOne({ email: 'maskiryz23@gmail.com' });
    
    if (user) {
      console.log('\n👤 User found:');
      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.name);
      console.log('🔐 Role:', user.role);
      console.log('✉️  Email Verified:', user.emailVerified);
      console.log('👨‍💼 Admin Verified:', user.adminVerified);
      console.log('📅 Created:', user.createdAt);
      console.log('🕐 Last Login:', user.lastLogin || 'Never');
      
      // Test password
      const isMatch = await user.comparePassword('admin123');
      console.log('🔑 Password match (admin123):', isMatch);
      
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUser();