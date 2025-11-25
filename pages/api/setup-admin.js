import connectDB from '../../lib/mongodb';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await connectDB();
    
    // Delete existing admin user
    await User.deleteOne({ email: 'maskiryz23@gmail.com' });
    
    // Create new admin user (password will be hashed by pre-save hook)
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
    
    res.status(200).json({ 
      success: true, 
      message: 'Admin user created successfully'
    });
    
  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}