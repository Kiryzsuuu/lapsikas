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
      const users = await User.find({}).select('-password -verificationToken -resetPasswordToken').sort({ createdAt: -1 });
      res.json({ ok: true, users });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ ok: false, error: error.message });
    }
  } else if (req.method === 'PUT') {
    // Update user role
    try {
      const { email, role } = req.body;
      
      if (!email || !role) {
        return res.status(400).json({ ok: false, error: 'Email and role are required' });
      }

      if (!['user', 'admin', 'super_admin'].includes(role)) {
        return res.status(400).json({ ok: false, error: 'Invalid role' });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return res.status(404).json({ ok: false, error: 'User not found' });
      }

      user.role = role;
      await user.save();

      res.json({ ok: true, message: 'User role updated successfully' });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ ok: false, error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ ok: false, error: 'Email is required' });
      }

      // Prevent deleting the current super admin
      if (email.toLowerCase() === v.user.email.toLowerCase()) {
        return res.status(400).json({ ok: false, error: 'Cannot delete your own account' });
      }

      const result = await User.deleteOne({ email: email.toLowerCase() });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ ok: false, error: 'User not found' });
      }

      res.json({ ok: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ ok: false, error: error.message });
    }
  } else if (req.method === 'PATCH') {
    // Update admin verification status
    try {
      const { email, adminVerified } = req.body;
      
      if (!email || adminVerified === undefined) {
        return res.status(400).json({ ok: false, error: 'Email and adminVerified are required' });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return res.status(404).json({ ok: false, error: 'User not found' });
      }

      user.adminVerified = adminVerified;
      await user.save();

      res.json({ ok: true, message: 'Admin verification status updated successfully' });
    } catch (error) {
      console.error('Update admin verification error:', error);
      res.status(500).json({ ok: false, error: error.message });
    }
  } else {
    res.status(405).end();
  }
}
