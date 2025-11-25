import connectDB from '../../../lib/mongodb';
import mongoose from 'mongoose';

// File schema (same as upload-new.js)
const FileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalname: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  data: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  uploadedBy: { type: String, required: true }
});

const FileModel = mongoose.models.File || mongoose.model('File', FileSchema);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { filename } = req.query;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Find file in database
    const fileDoc = await FileModel.findOne({ filename });
    
    if (!fileDoc) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Convert base64 back to buffer
    const fileBuffer = Buffer.from(fileDoc.data, 'base64');

    // Set appropriate headers
    res.setHeader('Content-Type', fileDoc.mimetype);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Content-Disposition', `inline; filename="${fileDoc.originalname}"`);
    
    // Send file data
    res.send(fileBuffer);

  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
}