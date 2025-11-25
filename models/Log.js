import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['INFO', 'ERROR', 'WARNING', 'SUCCESS'],
    default: 'INFO'
  },
  user: {
    type: String,
    default: 'System'
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index untuk query performa
logSchema.index({ timestamp: -1 });
logSchema.index({ type: 1 });
logSchema.index({ user: 1 });

export default mongoose.models.Log || mongoose.model('Log', logSchema);
