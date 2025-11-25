import connectDB from '../../lib/mongodb';
import Satker from '../../models/Satker';
import { verifyToken } from '../../lib/serverAuth';

export default async function handler(req, res) {
  try {
    // Verify authentication
    const decoded = await verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    await connectDB();

    if (req.method === 'GET') {
      const satkers = await Satker.find({}).sort({ nama: 1 });
      
      // Convert to CSV format for backward compatibility
      const rows = satkers.map(s => ({
        nama: s.nama,
        email: s.email,
        deadline: s.deadline,
        status: s.status
      }));
      
      return res.status(200).json({ ok: true, rows });
      
    } else if (req.method === 'POST') {
      const rows = req.body.rows || [];
      
      // Clear existing satkers
      await Satker.deleteMany({});
      
      // Insert new satkers
      const satkerDocs = rows.map(row => ({
        nama: row.nama,
        email: row.email,
        deadline: row.deadline,
        status: row.status || 'pending'
      }));
      
      await Satker.insertMany(satkerDocs);
      
      return res.status(200).json({ ok: true });
      
    } else {
      return res.status(405).json({ ok: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Satkers API error:', error);
    return res.status(500).json({ ok: false, message: error.message });
  }
}
