import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  satker_name: {
    type: String,
    required: true
  },
  report_type: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  file_name: {
    type: String,
    default: ''
  },
  file_path: {
    type: String,
    default: ''
  },
  user_email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewed_by: {
    type: String,
    default: null
  },
  rejection_reason: {
    type: String,
    default: null
  },
  submitted_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
