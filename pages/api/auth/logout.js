export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Clear cookie
  const isProd = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', `token=; HttpOnly; Path=/; Max-Age=0${isProd ? '; Secure; SameSite=Strict' : ''}`);
  res.status(200).json({ ok: true });
}
