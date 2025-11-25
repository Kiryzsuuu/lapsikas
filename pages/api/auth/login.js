import jwt from 'jsonwebtoken';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { logLogin, logError } from '../../../lib/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const COOKIE_NAME = 'token';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;

  try {
    await connectDB();
    
    // Find user by email (username field contains email now)
    const user = await User.findOne({ email: username.toLowerCase() });

    if (!user) {
      return res.status(401).json({ ok: false, error: 'Email atau password salah' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({ ok: false, error: 'Email belum diverifikasi. Cek inbox Anda.' });
    }

    // Check if admin verified (except for admin and super_admin)
    if (!user.adminVerified && user.role === 'user') {
      return res.status(401).json({ ok: false, error: 'Akun Anda belum diverifikasi oleh admin. Silakan hubungi administrator.' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ ok: false, error: 'Email atau password salah' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log successful login
    await logLogin(user.email);

    // Create token payload
    const payload = { 
      username: user.email, 
      email: user.email,
      role: user.role, 
      name: user.name,
      phone: user.phone,
      satker: user.satker
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // Set httpOnly cookie
    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${8 * 3600}${isProd ? '; Secure; SameSite=Strict' : ''}`);

    res.status(200).json({ ok: true, user: payload });
  } catch (error) {
    await logError('Login', error, username);
    console.error('Login error:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}
