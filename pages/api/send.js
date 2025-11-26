const { sendMail } = require('../../lib');
import connectDB from '../../lib/mongodb';
import Config from '../../models/Config';

function envSmtpFallback() {
  if (!process.env.SMTP_HOST) return null;
  return {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_AUTH_USER || process.env.SMTP_USER || '',
      pass: process.env.SMTP_AUTH_PASS || process.env.SMTP_PASS || ''
    }
  };
}

async function getSmtpConfig() {
  try {
    await connectDB();
    const config = await Config.findOne({ key: 'smtp' });
    if (config && config.smtp) {
      return config.smtp;
    }
  } catch (err) {
    console.error('Failed to load SMTP from MongoDB:', err.message);
  }
  
  // Fallback to environment variables
  return envSmtpFallback();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    let { smtp, to, subject, text } = req.body;
    
    // If client didn't provide SMTP, try MongoDB then env vars
    if (!smtp) {
      smtp = await getSmtpConfig();
    }
    
    if (!smtp || !smtp.host) {
      return res.status(400).json({ 
        ok: false, 
        error: 'SMTP belum dikonfigurasi. Silakan atur SMTP di halaman konfigurasi atau lewat Environment Variables.' 
      });
    }

    // Validate SMTP credentials
    if (!smtp.auth || !smtp.auth.user || !smtp.auth.pass) {
      return res.status(400).json({
        ok: false,
        error: 'Kredensial SMTP tidak lengkap. Pastikan email dan password SMTP sudah diisi.'
      });
    }

    await sendMail(smtp, to, subject, text);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('send error:', error && error.message);
    res.status(400).json({ ok: false, error: error.message });
  }
}