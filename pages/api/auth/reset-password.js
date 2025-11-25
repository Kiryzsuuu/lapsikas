import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, password, confirmPassword } = req.body;

  try {
    await connectDB();

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ ok: false, error: 'Semua field harus diisi' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ ok: false, error: 'Password dan konfirmasi password tidak cocok' });
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password minimal 6 karakter' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ ok: false, error: 'Token tidak valid atau sudah kedaluwarsa' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ ok: true, message: 'Password berhasil direset' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}
