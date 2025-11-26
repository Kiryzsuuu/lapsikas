import mongoose from 'mongoose';

const ConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'smtp'
  },
  smtp: {
    host: { type: String },
    port: { type: Number },
    secure: { type: Boolean, default: false },
    auth: {
      user: { type: String },
      pass: { type: String }
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.Config || mongoose.model('Config', ConfigSchema);
