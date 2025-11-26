import connectDB from '../../lib/mongodb';
import Config from '../../models/Config';

function envCfg() {
  // Read SMTP config from environment variables (for platforms like Vercel)
  if (!process.env.SMTP_HOST) return null;
  return {
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_AUTH_USER || process.env.SMTP_USER || '',
        pass: process.env.SMTP_AUTH_PASS || process.env.SMTP_PASS || ''
      }
    }
  };
}

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // If MongoDB fails, try to use env vars as fallback
    if (req.method === 'GET') {
      const fromEnv = envCfg();
      if (fromEnv) return res.status(200).json({ ok: true, cfg: fromEnv, source: 'env' });
      return res.status(500).json({ ok: false, error: 'Database tidak tersedia dan tidak ada konfigurasi di environment variables.' });
    }
    return res.status(500).json({ ok: false, error: 'Database tidak tersedia.' });
  }

  if (req.method === 'GET') {
    try {
      // Try to get config from MongoDB
      let config = await Config.findOne({ key: 'smtp' });
      
      if (config && config.smtp) {
        return res.status(200).json({ 
          ok: true, 
          cfg: { smtp: config.smtp },
          source: 'mongodb' 
        });
      }

      // Fallback to environment variables
      const fromEnv = envCfg();
      if (fromEnv) return res.status(200).json({ ok: true, cfg: fromEnv, source: 'env' });
      
      return res.status(200).json({ ok: true, cfg: null, source: 'none' });
    } catch (err) {
      console.error('Error reading config:', err.message);
      return res.status(500).json({ ok: false, error: 'Gagal membaca konfigurasi.' });
    }

  } else if (req.method === 'POST') {
    try {
      const { smtp } = req.body;
      
      if (!smtp || !smtp.host || !smtp.auth || !smtp.auth.user) {
        return res.status(400).json({ ok: false, error: 'Data SMTP tidak lengkap.' });
      }

      // Update or create config in MongoDB
      let config = await Config.findOne({ key: 'smtp' });
      
      if (config) {
        config.smtp = smtp;
        config.updatedAt = new Date();
        await config.save();
      } else {
        config = await Config.create({
          key: 'smtp',
          smtp: smtp
        });
      }

      return res.status(200).json({ 
        ok: true, 
        message: 'Konfigurasi berhasil disimpan di database.',
        source: 'mongodb' 
      });
    } catch (err) {
      console.error('Failed saving config:', err.message);
      return res.status(500).json({ 
        ok: false, 
        error: 'Gagal menyimpan konfigurasi: ' + err.message 
      });
    }
  }

  return res.status(405).end();
}
