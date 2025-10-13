const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { parse: csvParse } = require('csv-parse/sync');

const REPORTS_FILE = path.join(process.cwd(), 'data', 'reports.csv');

function readReports() {
  if (!fs.existsSync(REPORTS_FILE)) return [];
  const raw = fs.readFileSync(REPORTS_FILE, 'utf8');
  return csvParse(raw, { columns: true, skip_empty_lines: true });
}

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  
  const { format } = req.query;
  const reports = readReports();
  
  if (format === 'excel') {
    const ws = XLSX.utils.json_to_sheet(reports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=laporan.xlsx');
    res.send(buffer);
  } else {
    res.status(400).json({ error: 'Format not supported' });
  }
}