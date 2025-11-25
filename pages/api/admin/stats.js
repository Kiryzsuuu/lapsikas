import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import Report from '../../../models/Report';
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
      const [totalUsers, totalReports, emailLogs, loginLogs] = await Promise.all([
        User.countDocuments(),
        Report.countDocuments(),
        Log.countDocuments({ action: 'Email' }),
        Log.countDocuments({ action: 'Login' })
      ]);

      const stats = {
        totalUsers,
        totalReports,
        totalEmails: emailLogs,
        totalLogins: loginLogs
      };

      res.json({ ok: true, stats });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  } else {
    res.status(405).end();
  }
}
