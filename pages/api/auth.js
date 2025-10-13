const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { username, password } = req.body;
  
  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      res.status(200).json({ 
        ok: true, 
        user: { 
          username: user.username, 
          role: user.role, 
          name: user.name 
        } 
      });
    } else {
      res.status(401).json({ ok: false, error: 'Username atau password salah' });
    }
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}