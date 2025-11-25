import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Handle direct link click from email
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ ok: false, message: 'Token tidak valid' });
    }

    try {
      await connectDB();

      const user = await User.findOne({ verificationToken: token });

      if (!user) {
        // Redirect to verify-email page with error
        res.writeHead(302, { Location: `/verify-email?token=${token}&error=invalid` });
        res.end();
        return;
      }

      user.emailVerified = true;
      user.verificationToken = null;
      await user.save();

      // Redirect to verify-email page with success
      res.writeHead(302, { Location: `/verify-email?token=${token}&success=true` });
      res.end();
    } catch (error) {
      console.error('Email verification error:', error);
      res.writeHead(302, { Location: `/verify-email?token=${token}&error=server` });
      res.end();
    }
    
  } else if (req.method === 'POST') {
    // Handle API call from frontend
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ ok: false, message: 'Token tidak valid' });
    }

    try {
      await connectDB();

      const user = await User.findOne({ verificationToken: token });

      if (!user) {
        return res.status(400).json({ ok: false, message: 'Token tidak valid atau sudah kedaluwarsa' });
      }

      user.emailVerified = true;
      user.verificationToken = null;
      await user.save();

      return res.status(200).json({ ok: true, message: 'Email berhasil diverifikasi' });
    } catch (error) {
      console.error('Email verification error:', error);
      return res.status(500).json({ ok: false, message: 'Terjadi kesalahan server' });
    }
    
  } else {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }
}
