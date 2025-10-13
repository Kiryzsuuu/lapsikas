const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      res.json({ ok: true, users });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { username } = req.body;
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      const filteredUsers = users.filter(u => u.username !== username);
      
      fs.writeFileSync(USERS_FILE, JSON.stringify(filteredUsers, null, 2));
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  } else {
    res.status(405).end();
  }
}