import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    unique: true
  },
  originalname: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  content: {
    type: String, // base64 encoded content
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better performance
FileSchema.index({ filename: 1 });
FileSchema.index({ uploadedAt: -1 });

export default mongoose.models.File || mongoose.model('File', FileSchema);