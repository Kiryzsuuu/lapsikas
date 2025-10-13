const fs = require('fs');
const path = require('path');
const { readCsv } = require('../../../lib');

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const REPORTS_FILE = path.join(process.cwd(), 'data', 'reports.csv');
const LOGS_FILE = path.join(process.cwd(), 'data', 'send.log');

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let totalUsers = 0;
      let totalReports = 0;
      let totalEmails = 0;
      let totalLogins = 0;

      // Count users
      if (fs.existsSync(USERS_FILE)) {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        totalUsers = users.length;
      }

      // Count reports
      if (fs.existsSync(REPORTS_FILE)) {
        const reports = readCsv();
        totalReports = reports.length;
      }

      // Count emails from logs
      if (fs.existsSync(LOGS_FILE)) {
        const logContent = fs.readFileSync(LOGS_FILE, 'utf8');
        const lines = logContent.split('\n').filter(line => line.trim());
        totalEmails = lines.filter(line => line.includes('SENT')).length;
        totalLogins = lines.filter(line => line.includes('LOGIN')).length;
      }

      const stats = {
        totalUsers,
        totalReports,
        totalEmails,
        totalLogins
      };

      res.json({ ok: true, stats });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  } else {
    res.status(405).end();
  }
}