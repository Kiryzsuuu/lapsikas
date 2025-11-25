// Test MongoDB Connection
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...\n');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI not found in .env file');
    console.log('\n📝 Please set MONGODB_URI in your .env file:');
    console.log('   MONGODB_URI=mongodb://localhost:27017/satker-reminder');
    console.log('   or');
    console.log('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/satker-reminder');
    process.exit(1);
  }
  
  try {
    console.log('📡 Connecting to:', process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB connection successful!\n');
    
    // Get database info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📊 Database:', db.databaseName);
    console.log('📁 Collections:', collections.length);
    
    if (collections.length > 0) {
      console.log('\n📋 Existing collections:');
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`   - ${col.name}: ${count} documents`);
      }
    } else {
      console.log('   (No collections yet - will be created after migration)');
    }
    
    console.log('\n✅ Connection test complete!');
    
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('\n❌ MongoDB connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Make sure MongoDB is running (if using localhost)');
      console.log('   2. Check if the connection string is correct');
      console.log('   3. For MongoDB Atlas:');
      console.log('      - Whitelist your IP address');
      console.log('      - Check username and password');
      console.log('      - Make sure cluster is active');
    }
    
    process.exit(1);
  }
}

testConnection();
