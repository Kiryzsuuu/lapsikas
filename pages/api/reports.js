const fs = require('fs');
const path = require('path');
const { parse: csvParse } = require('csv-parse/sync');
const { stringify: csvStringify } = require('csv-stringify/sync');

const REPORTS_FILE = path.join(process.cwd(), 'data', 'reports.csv');

function readReports() {
  if (!fs.existsSync(REPORTS_FILE)) return [];
  const raw = fs.readFileSync(REPORTS_FILE, 'utf8');
  return csvParse(raw, { columns: true, skip_empty_lines: true });
}

function writeReports(reports) {
  const csv = csvStringify(reports, { header: true });
  fs.writeFileSync(REPORTS_FILE, csv, 'utf8');
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    const reports = readReports();
    res.status(200).json({ ok: true, reports });
  } else if (req.method === 'POST') {
    const { satker_name, user_email, report_type, amount, description, file_path, file_name } = req.body;
    const reports = readReports();
    
    const newReport = {
      id: Date.now().toString(),
      satker_name,
      user_email,
      report_type,
      amount,
      description,
      file_path: file_path || '',
      file_name: file_name || '',
      status: 'pending',
      submitted_at: new Date().toISOString(),
      reviewed_by: ''
    };
    
    reports.push(newReport);
    writeReports(reports);
    res.status(200).json({ ok: true, report: newReport });
  } else if (req.method === 'PUT') {
    const { id, status, reviewed_by } = req.body;
    const reports = readReports();
    const reportIndex = reports.findIndex(r => r.id === id);
    
    if (reportIndex !== -1) {
      reports[reportIndex].status = status;
      reports[reportIndex].reviewed_by = reviewed_by;
      writeReports(reports);
      res.status(200).json({ ok: true });
    } else {
      res.status(404).json({ ok: false, error: 'Report not found' });
    }
  } else {
    res.status(405).end();
  }
}