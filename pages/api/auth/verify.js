const fs = require('fs');
const path = require('path');
const { verifyToken } = require('../../../lib/serverAuth');

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  // Prefer verifying using httpOnly cookie token
  const v = verifyToken(req);
  if (v.ok) return res.status(200).json({ ok: true, user: v.user });

  // fallback: accept username query param (keeps compatibility)
  const { username } = req.query;
  if (!username) return res.status(400).json({ ok: false, error: 'username is required' });

  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const user = users.find(u => u.username === username);
    if (!user) return res.status(404).json({ ok: false, error: 'user not found' });

    return res.status(200).json({ ok: true, user: { username: user.username, role: user.role, name: user.name } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'server error' });
  }
}
