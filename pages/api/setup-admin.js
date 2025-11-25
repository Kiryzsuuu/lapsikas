// Script untuk membuat admin user di production
// Jalankan sekali setelah deployment ke Vercel

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://maskiryz23_db_user:sOY5Yr0G3n8VtQ45@userlapsikas.lufqpyh.mongodb.net/satker-reminder?retryWrites=true&w=majority&appName=userlapsikas';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  satker: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user' },
  emailVerified: { type: Boolean, default: false },
  adminVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Delete existing admin user
    await User.deleteOne({ email: 'maskiryz23@gmail.com' });
    
    // Create new admin user
    const adminUser = new User({
      email: 'maskiryz23@gmail.com',
      password: 'admin123',
      name: 'Super Administrator',
      phone: '081234567890',
      satker: 'Kementerian Pertahanan RI',
      role: 'super_admin',
      emailVerified: true,
      adminVerified: true
    });
    
    await adminUser.save();
    
    // Test password
    const testUser = await User.findOne({ email: 'maskiryz23@gmail.com' });
    const isMatch = await testUser.comparePassword('admin123');
    
    res.status(200).json({ 
      success: true, 
      message: 'Admin user created successfully',
      passwordTest: isMatch 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}