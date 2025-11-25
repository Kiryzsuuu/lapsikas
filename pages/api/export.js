import XLSX from 'xlsx';
import connectDB from '../../lib/mongodb';
import Report from '../../models/Report';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  
  const { format } = req.query;
  
  await connectDB();
  
  const reports = await Report.find().sort({ submitted_at: -1 }).lean();
  
  if (format === 'excel') {
    const excelData = reports.map(r => ({
      'Satker': r.satker_name,
      'Jenis': r.report_type,
      'Jumlah': `Rp ${parseInt(r.amount || 0).toLocaleString('id-ID')}`,
      'File': r.file_name || 'Tidak ada file',
      'Status': r.status,
      'Tanggal': new Date(r.submitted_at).toLocaleDateString('id-ID'),
      'Jam': new Date(r.submitted_at).toLocaleTimeString('id-ID')
    }));
    
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=laporan-satker.xlsx');
    res.send(buffer);
  } else {
    res.status(400).json({ error: 'Format not supported' });
  }
}