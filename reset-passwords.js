// Reset User Password
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  phone: String,
  satker: String,
  password: String,
  role: String,
  emailVerified: Boolean,
  lastLogin: Date,
  createdAt: Date
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function resetPasswords() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    // Check current users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users:\n`);
    
    for (const user of users) {
      console.log(`User: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Verified: ${user.emailVerified}`);
      console.log(`  Password hash: ${user.password.substring(0, 20)}...`);
      
      // Test current password
      const testPassword = 'hehehe';
      const isMatch = await user.comparePassword(testPassword);
      console.log(`  ✓ Password "hehehe" works: ${isMatch}`);
      
      if (!isMatch) {
        console.log(`  ⚠️  Resetting password to "hehehe"...`);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(testPassword, salt);
        user.emailVerified = true;
        await user.save();
        console.log(`  ✓ Password reset successful!`);
      }
      console.log('');
    }

    console.log('✅ Password check/reset complete!');
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPasswords();
