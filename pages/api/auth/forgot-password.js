import crypto from 'crypto';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { sendPasswordResetEmail } from '../../../lib/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;

  try {
    await connectDB();

    if (!email) {
      return res.status(400).json({ ok: false, error: 'Email harus diisi' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        ok: true, 
        message: 'Jika email terdaftar, kami akan mengirim link reset password' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(email, user.name, resetToken);
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    res.status(200).json({ 
      ok: true, 
      message: 'Jika email terdaftar, kami akan mengirim link reset password' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}
