const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const COOKIE_NAME = 'token';

function parseCookies(req) {
  const header = req.headers?.cookie;
  if (!header) return {};
  return header.split(';').map(c => c.trim()).reduce((acc, cur) => {
    const [k, ...v] = cur.split('=');
    acc[k] = decodeURIComponent(v.join('='));
    return acc;
  }, {});
}

function verifyToken(req) {
  try {
    const cookies = parseCookies(req);
    const token = cookies[COOKIE_NAME];
    if (!token) return { ok: false, error: 'no token' };
    const payload = jwt.verify(token, JWT_SECRET);
    return { ok: true, user: payload };
  } catch (err) {
    return { ok: false, error: 'invalid token' };
  }
}

module.exports = { verifyToken };
