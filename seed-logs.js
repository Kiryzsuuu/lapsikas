import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const logSchema = new mongoose.Schema({
  timestamp: Date,
  type: String,
  user: String,
  action: String,
  details: String
}, { timestamps: true });

async function seedLogs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const Log = mongoose.models.Log || mongoose.model('Log', logSchema);

    // Create sample logs
    const sampleLogs = [
      {
        timestamp: new Date('2024-01-15T08:30:00'),
        type: 'SUCCESS',
        user: 'System',
        action: 'Email',
        details: 'Email sent to maskiryz23@gmail.com: Welcome to the system'
      },
      {
        timestamp: new Date('2024-01-15T09:00:00'),
        type: 'INFO',
        user: 'maskiryz23@gmail.com',
        action: 'Login',
        details: 'User maskiryz23@gmail.com logged in'
      },
      {
        timestamp: new Date('2024-01-15T10:15:00'),
        type: 'SUCCESS',
        user: 'System',
        action: 'Email',
        details: 'Email sent to kiryzsu@gmail.com: Your account has been created'
      },
      {
        timestamp: new Date('2024-01-15T11:00:00'),
        type: 'INFO',
        user: 'kiryzsu@gmail.com',
        action: 'Login',
        details: 'User kiryzsu@gmail.com logged in'
      },
      {
        timestamp: new Date('2024-01-16T08:00:00'),
        type: 'INFO',
        user: 'maskiryz23@gmail.com',
        action: 'Login',
        details: 'User maskiryz23@gmail.com logged in'
      },
      {
        timestamp: new Date('2024-01-16T14:30:00'),
        type: 'SUCCESS',
        user: 'System',
        action: 'Email',
        details: 'Email sent to all users: System maintenance notification'
      }
    ];

    await Log.insertMany(sampleLogs);
    console.log('✓ Created 6 sample logs');

    const count = await Log.countDocuments();
    console.log(`✓ Total logs in database: ${count}`);

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('✗ Error:', error);
    process.exit(1);
  }
}

seedLogs();
