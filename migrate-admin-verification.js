import connectDB from './lib/mongodb.js';
import User from './models/User.js';

async function updateAdminVerification() {
  try {
    await connectDB();
    
    console.log('🔄 Updating admin verification status...');
    
    // Set adminVerified = true for existing admin and super_admin users
    const result = await User.updateMany(
      { role: { $in: ['admin', 'super_admin'] } },
      { $set: { adminVerified: true } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} admin/super_admin users`);
    
    // Set adminVerified = false for regular users (default for new users)
    const userResult = await User.updateMany(
      { role: 'user', adminVerified: { $ne: true } },
      { $set: { adminVerified: false } }
    );
    
    console.log(`✅ Updated ${userResult.modifiedCount} regular users`);
    
    // Show current verification status
    const users = await User.find({}).select('email name role emailVerified adminVerified');
    console.log('\n📊 Current verification status:');
    users.forEach(user => {
      console.log(`${user.email} (${user.role}) - Email: ${user.emailVerified ? '✅' : '❌'}, Admin: ${user.adminVerified ? '✅' : '❌'}`);
    });
    
    console.log('\n🎉 Admin verification migration completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

updateAdminVerification();