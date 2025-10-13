const multer = require('multer');
const { writeCsv } = require('../../lib');

const upload = multer({ storage: multer.memoryStorage() });

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ ok: false, error: err.message });
    
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
      res.status(200).json({ ok: true, rows });
    } catch (error) {
      res.status(400).json({ ok: false, error: error.message });
    }
  });
}

export const config = {
  api: { bodyParser: false }
};