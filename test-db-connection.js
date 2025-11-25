const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/satker-reminder';

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('📍 URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    
    console.log('✅ MongoDB Atlas berhasil terhubung!');
    
    // Test collection counts
    const collections = [
      { name: 'User', model: require('./models/User.js').default },
      { name: 'Report', model: require('./models/Report.js').default },
      { name: 'Satker', model: require('./models/Satker.js').default },
      { name: 'Log', model: require('./models/Log.js').default }
    ];
    
    console.log('\n📊 Database Collections Status:');
    for (const col of collections) {
      try {
        const count = await col.model.countDocuments();
        console.log(`   ${col.name}: ${count} documents`);
      } catch (err) {
        console.log(`   ${col.name}: Error - ${err.message}`);
      }
    }
    
    // Test database info
    const admin = mongoose.connection.db.admin();
    const dbInfo = await admin.serverStatus();
    console.log('\n🌐 Database Info:');
    console.log(`   Host: ${dbInfo.host}`);
    console.log(`   Version: MongoDB ${dbInfo.version}`);
    console.log(`   Uptime: ${Math.floor(dbInfo.uptime / 3600)} hours`);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('🔑 Check your MongoDB Atlas username/password');
    }
    if (error.message.includes('network')) {
      console.log('🌐 Check your network connection and MongoDB Atlas network access');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testConnection();