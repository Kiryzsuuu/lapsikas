const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { readCsv, writeCsv, sendMail, log } = require('./lib');
const runScheduler = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

const upload = multer({ storage: multer.memoryStorage() });

// Data paths
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const CONFIG_FILE = path.join(__dirname, 'data', 'config.json');
const REPORTS_FILE = path.join(__dirname, 'data', 'reports.csv');

// Auth API
app.post('/api/auth', (req, res) => {
  const { username, password } = req.body;
  
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return res.status(500).json({ ok: false, error: 'Users file not found' });
    }
    
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      res.json({ 
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
    console.error('Auth error:', error);
    res.status(500).json({ ok: false, error: 'Server error: ' + error.message });
  }
});

// Satkers API
app.get('/api/satkers', (req, res) => {
  const rows = readCsv();
  res.json({ ok: true, rows });
});

app.post('/api/satkers', (req, res) => {
  const rows = req.body.rows || [];
  writeCsv(rows);
  res.json({ ok: true });
});

// Config API
app.get('/api/config', (req, res) => {
  if (fs.existsSync(CONFIG_FILE)) {
    res.json({ ok: true, cfg: JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) });
  } else {
    res.json({ ok: true, cfg: null });
  }
});

app.post('/api/config', (req, res) => {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(req.body, null, 2), 'utf8');
  res.json({ ok: true });
});

// Send email API
app.post('/api/send', async (req, res) => {
  try {
    const { smtp, to, subject, text } = req.body;
    await sendMail(smtp, to, subject, text);
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

// Scheduler API
app.post('/api/run-scheduler', async (req, res) => {
  try {
    await runScheduler();
    res.json({ ok: true, message: 'Scheduler executed successfully' });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

// Reports API
app.get('/api/reports', (req, res) => {
  // Implementation for reports
  res.json({ ok: true, reports: [] });
});

app.post('/api/reports', (req, res) => {
  // Implementation for creating reports
  res.json({ ok: true });
});

app.put('/api/reports', (req, res) => {
  // Implementation for updating reports
  res.json({ ok: true });
});

// Import API
app.post('/api/import', upload.single('file'), (req, res) => {
  try {
    const csvText = req.file.buffer.toString('utf8');
    const lines = csvText.split(/\r?\n/).filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map(l => {
      const cols = l.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const obj = {};
      headers.forEach((h, idx) => obj[h] = cols[idx] || '');
      return obj;
    });
    
    writeCsv(rows);
    res.json({ ok: true, rows });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

// Export API
app.get('/api/export', (req, res) => {
  const { format } = req.query;
  
  if (format === 'excel') {
    // Excel export implementation
    res.json({ ok: true, message: 'Excel export not implemented yet' });
  } else {
    res.status(400).json({ error: 'Format not supported' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- POST /api/auth');
  console.log('- GET /api/satkers');
  console.log('- GET /api/config');
});