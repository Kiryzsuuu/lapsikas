import connectDB from '../../../lib/mongodb';
import Log from '../../../models/Log';
import { verifyToken } from '../../../lib/serverAuth';

export default async function handler(req, res) {
  const v = verifyToken(req);
  if (!v.ok || v.user.role !== 'super_admin') {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  await connectDB();

  if (req.method === 'GET') {
    try {
      const logs = await Log.find()
        .sort({ timestamp: -1 })
        .limit(500)
        .lean();
      
      const formattedLogs = logs.map(log => ({
        id: log._id.toString(),
        timestamp: log.timestamp,
        type: log.type,
        user: log.user,
        action: log.action,
        details: log.details || `${log.action} - ${log.user}`
      }));
      
      res.json({ ok: true, logs: formattedLogs });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { logId } = req.body;
      
      if (logId) {
        // Delete single log
        await Log.findByIdAndDelete(logId);
        res.json({ ok: true, message: 'Log berhasil dihapus' });
      } else {
        // Delete all logs
        await Log.deleteMany({});
        res.json({ ok: true, message: 'Semua log berhasil dihapus' });
      }
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  } else {
    res.status(405).end();
  }
}