const { sendMail } = require('../../lib');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const { smtp, to, subject, text } = req.body;
    await sendMail(smtp, to, subject, text);
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
}