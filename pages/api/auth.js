const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const COOKIE_NAME = 'token';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;

  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      // sign token (avoid including password)
      const payload = { username: user.username, role: user.role, name: user.name };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

      // set httpOnly cookie
      const isProd = process.env.NODE_ENV === 'production';
      res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${8 * 3600}${isProd ? '; Secure; SameSite=Strict' : ''}`);

      res.status(200).json({ ok: true, user: payload });
    } else {
      res.status(401).json({ ok: false, error: 'Username atau password salah' });
    }
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}