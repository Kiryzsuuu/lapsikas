import connectDB from '../../lib/mongodb';
import Report from '../../models/Report';
import { verifyToken } from '../../lib/serverAuth';

export default async function handler(req, res) {
  try {
    // Verify authentication
    const authResult = verifyToken(req);
    if (!authResult.ok) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
    const decoded = authResult.user;

    await connectDB();

    if (req.method === 'GET') {
      const reports = await Report.find({}).sort({ submitted_at: -1 });
      
      // Convert to old format for backward compatibility
      const formattedReports = reports.map(r => ({
        id: r._id.toString(),
        satker_name: r.satker_name,
        user_email: r.user_email,
        report_type: r.report_type,
        amount: r.amount,
        description: r.description,
        file_path: r.file_path || '',
        file_name: r.file_name || '',
        status: r.status,
        submitted_at: r.submitted_at.toISOString(),
        reviewed_by: r.reviewed_by || '',
        rejection_reason: r.rejection_reason || ''
      }));
      
      return res.status(200).json({ ok: true, reports: formattedReports });
      
    } else if (req.method === 'POST') {
      const { satker_name, user_email, report_type, amount, description, file_path, file_name } = req.body;
      
      const newReport = new Report({
        satker_name,
        user_email,
        report_type,
        amount,
        description,
        file_path: file_path || '',
        file_name: file_name || '',
        status: 'pending',
        submitted_at: new Date(),
        reviewed_by: ''
      });
      
      await newReport.save();
      
      return res.status(200).json({ 
        ok: true, 
        report: {
          id: newReport._id.toString(),
          satker_name: newReport.satker_name,
          user_email: newReport.user_email,
          report_type: newReport.report_type,
          amount: newReport.amount,
          description: newReport.description,
          file_path: newReport.file_path,
          file_name: newReport.file_name,
          status: newReport.status,
          submitted_at: newReport.submitted_at.toISOString(),
          reviewed_by: newReport.reviewed_by
        }
      });
      
    } else if (req.method === 'PUT') {
      const { id, status, reviewed_by, rejection_reason } = req.body;
      
      // Validate rejection reason if status is rejected
      if (status === 'rejected' && !rejection_reason) {
        return res.status(400).json({ ok: false, error: 'Alasan penolakan harus diisi' });
      }
      
      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({ ok: false, error: 'Report not found' });
      }
      
      report.status = status;
      report.reviewed_by = reviewed_by;
      if (status === 'rejected') {
        report.rejection_reason = rejection_reason;
      } else {
        report.rejection_reason = null; // Clear rejection reason if approved
      }
      await report.save();
      
      return res.status(200).json({ ok: true });
      
    } else if (req.method === 'DELETE') {
      // Only admin and super_admin can delete reports
      if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
        return res.status(403).json({ ok: false, error: 'Only admin and super admin can delete reports' });
      }
      
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ ok: false, error: 'Report ID is required' });
      }
      
      const result = await Report.findByIdAndDelete(id);
      
      if (!result) {
        return res.status(404).json({ ok: false, error: 'Report not found' });
      }
      
      return res.status(200).json({ ok: true, message: 'Report deleted successfully' });
      
    } else {
      return res.status(405).json({ ok: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Reports API error:', error);
    return res.status(500).json({ ok: false, message: error.message });
  }
}