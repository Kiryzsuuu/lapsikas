const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const connectDB = require('./lib/mongodb').default;

async function resetPassword() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Import User model after connection
    const User = require('./models/User').default;
    
    const user = await User.findOne({ email: 'maskiryz23@gmail.com' });
    
    if (user) {
      console.log('👤 Resetting password for:', user.email);
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Update user password
      user.password = hashedPassword;
      await user.save();
      
      console.log('✅ Password reset berhasil!');
      
      // Test the new password
      const isMatch = await user.comparePassword('admin123');
      console.log('🔑 Password test (admin123):', isMatch);
      
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

resetPassword();