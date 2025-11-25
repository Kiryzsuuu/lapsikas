import connectDB from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    await connectDB();
    res.status(200).json({ 
      success: true, 
      message: 'MongoDB connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}