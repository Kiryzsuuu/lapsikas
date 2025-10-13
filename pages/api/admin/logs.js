const fs = require('fs');
const path = require('path');

const LOGS_FILE = path.join(process.cwd(), 'data', 'send.log');

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(LOGS_FILE)) {
        return res.json({ ok: true, logs: [] });
      }
      
      const logContent = fs.readFileSync(LOGS_FILE, 'utf8');
      const logs = logContent.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split(' ');
          return {
            timestamp: parts[0],
            type: parts[1] || 'INFO',
            user: 'System',
            action: 'Email',
            details: line
          };
        })
        .reverse();
      
      res.json({ ok: true, logs });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      if (fs.existsSync(LOGS_FILE)) {
        fs.writeFileSync(LOGS_FILE, '');
      }
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  } else {
    res.status(405).end();
  }
}