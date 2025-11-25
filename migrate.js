const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Satker = require('./models/Satker');
const Report = require('./models/Report');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/satker-reminder';

async function migrate() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create new admin users
    console.log('\n👤 Creating admin users...');
    
    const adminUsers = [
      {
        email: 'maskiryz23@gmail.com',
        name: 'Super Admin',
        phone: '081234567890',
        satker: 'Kemhan',
        password: 'hehehe',
        role: 'super_admin'
      },
      {
        email: 'kiryzsu@gmail.com',
        name: 'Admin',
        phone: '081234567891',
        satker: 'Kemhan',
        password: 'hehehe',
        role: 'admin'
      }
    ];
    
    for (const userData of adminUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        const user = new User({
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          satker: userData.satker,
          password: hashedPassword,
          role: userData.role,
          emailVerified: true,
          createdAt: new Date()
        });
        
        await user.save();
        console.log(`  ✓ Created: ${user.email} (${user.role})`);
      } else {
        // Update existing user
        existingUser.password = await bcrypt.hash(userData.password, 10);
        existingUser.role = userData.role;
        existingUser.emailVerified = true;
        await existingUser.save();
        console.log(`  ✓ Updated: ${existingUser.email} (${existingUser.role})`);
      }
    }

    // Skip old users.json migration - using new users only
    console.log('\n⏭️  Skipping old users.json (legacy data)')

    // Migrate Satkers
    console.log('\n📥 Migrating satkers...');
    const satkersFile = path.join(__dirname, 'data', 'satkers.csv');
    if (fs.existsSync(satkersFile)) {
      const csvData = fs.readFileSync(satkersFile, 'utf8');
      const lines = csvData.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        const satkerData = {};
        headers.forEach((h, idx) => satkerData[h] = cols[idx] || '');
        
        if (satkerData.nama && satkerData.email) {
          const existingSatker = await Satker.findOne({ email: satkerData.email });
          
          if (!existingSatker) {
            const satker = new Satker({
              nama: satkerData.nama,
              email: satkerData.email,
              deadline: satkerData.deadline,
              status: satkerData.status || 'Belum Kirim'
            });
            
            await satker.save();
            console.log(`  ✓ Satker migrated: ${satker.nama}`);
          } else {
            console.log(`  - Satker already exists: ${satkerData.nama}`);
          }
        }
      }
    }

    // Migrate Reports
    console.log('\n📥 Migrating reports...');
    const reportsFile = path.join(__dirname, 'data', 'reports.csv');
    if (fs.existsSync(reportsFile)) {
      const csvData = fs.readFileSync(reportsFile, 'utf8');
      const lines = csvData.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        const reportData = {};
        headers.forEach((h, idx) => reportData[h] = cols[idx] || '');
        
        if (reportData.satker_name && reportData.user_email) {
          const report = new Report({
            satker_name: reportData.satker_name,
            report_type: reportData.report_type || 'Sisa Kas',
            amount: parseFloat(reportData.amount) || 0,
            description: reportData.description || '',
            file_name: reportData.file_name || '',
            file_path: reportData.file_path || '',
            user_email: reportData.user_email,
            status: reportData.status || 'pending',
            reviewed_by: reportData.reviewed_by || null,
            submitted_at: reportData.submitted_at ? new Date(reportData.submitted_at) : new Date()
          });
          
          await report.save();
          console.log(`  ✓ Report migrated: ${report.satker_name}`);
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Database Statistics:');
    const userCount = await User.countDocuments();
    const satkerCount = await Satker.countDocuments();
    const reportCount = await Report.countDocuments();
    
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Satkers: ${satkerCount}`);
    console.log(`  - Reports: ${reportCount}`);
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
