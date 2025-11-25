import mongoose from 'mongoose';

const SatkerSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  deadline: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['Belum Kirim', 'Sudah Diterima', 'Revisi Diperlukan'],
    default: 'Belum Kirim'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Satker || mongoose.model('Satker', SatkerSchema);
