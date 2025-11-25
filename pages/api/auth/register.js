import crypto from 'crypto';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { sendVerificationEmail } from '../../../lib/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, name, phone, satker, password, confirmPassword } = req.body;

  try {
    await connectDB();

    // Validation
    if (!email || !name || !phone || !satker || !password || !confirmPassword) {
      return res.status(400).json({ ok: false, error: 'Semua field harus diisi' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ ok: false, error: 'Password dan konfirmasi password tidak cocok' });
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password minimal 6 karakter' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ ok: false, error: 'Email sudah terdaftar' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      name,
      phone,
      satker,
      password,
      role: 'user',
      emailVerified: false,
      verificationToken
    });

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({ 
      ok: true, 
      message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}
