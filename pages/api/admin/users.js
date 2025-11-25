// DEPRECATED: Use users-new.js instead
// This file is kept for backward compatibility only

import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { verifyToken } from '../../../lib/serverAuth';

export default async function handler(req, res) {
  const v = verifyToken(req);
  if (!v.ok || v.user.role !== 'super_admin') {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  await connectDB();

  if (req.method === 'GET') {
    try {
      const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();
      
      const formattedUsers = users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }));
      
      res.json({ ok: true, users: formattedUsers });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  } else {
    res.status(405).json({ ok: false, error: 'Method not allowed. Use /api/admin/users-new' });
  }
}

export default function handler(req, res) {
  const v = verifyToken(req);
  if (!v.ok || v.user.role !== 'super_admin') return res.status(401).json({ ok: false, error: 'unauthorized' });
  if (req.method === 'GET') {
    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      res.json({ ok: true, users });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { username } = req.body;
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      const filteredUsers = users.filter(u => u.username !== username);
      
      fs.writeFileSync(USERS_FILE, JSON.stringify(filteredUsers, null, 2));
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  } else {
    res.status(405).end();
  }
}