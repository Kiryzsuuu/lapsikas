import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import validator from 'validator'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const API = '/api';

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(l => {
    const cols = l.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, idx) => obj[h] = cols[idx] || '');
    return obj;
  });
  return rows;
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      {message}
    </div>
  );
}

export default function Home() {
  const [satkers, setSatkers] = useState([]);
  const [cfg, setCfg] = useState({});
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [newReport, setNewReport] = useState({
    satker_name: '',
    report_type: 'Sisa Kas',
    amount: '',
    description: '',
    file: null
  });
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentRejectId, setCurrentRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }
      let parsedUser;
      try {
        parsedUser = JSON.parse(userData);
      } catch (err) {
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      // Verify with server that the user still exists / is valid
      try {
  const v = await fetch(`${API}/auth/verify`);
        const j = await v.json();
        if (!j.ok) {
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        setUser(j.user);
        setAuthenticated(true);
        await load();
        await loadCfg();
        await loadReports();
      } catch (err) {
        // On network/server error, clear session and force login
        localStorage.removeItem('user');
        router.push('/login');
      }
    })();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/satkers`);
      const j = await r.json();
      if (j.ok) setSatkers(j.rows || []);
    } catch (err) {
      showToast('Gagal memuat data', 'error');
    }
    setLoading(false);
  }

  async function save() {
    setLoading(true);
    try {
      await fetch(`${API}/satkers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: satkers })
      });
      showToast('Data berhasil disimpan');
    } catch (err) {
      showToast('Gagal menyimpan data', 'error');
    }
    setLoading(false);
  }

  function add() {
    setSatkers([...satkers, {
      id: Date.now() + '',
      nama: '',
      email: '',
      deadline: '',
      status: 'Belum Kirim'
    }]);
  }

  function remove(index) {
    if (confirm('Hapus data ini?')) {
      const newSatkers = satkers.filter((_, i) => i !== index);
      setSatkers(newSatkers);
    }
  }

  function update(i, key, val) {
    const s = [...satkers];
    s[i][key] = val;
    setSatkers(s);
  }

  function validateRows(rows) {
    const errs = [];
    rows.forEach((r, idx) => {
      if (!r.nama) errs.push({ idx, field: 'nama', msg: 'Nama kosong' });
      if (!r.email || !validator.isEmail(r.email + '')) errs.push({ idx, field: 'email', msg: 'Email invalid' });
      if (r.deadline && isNaN(new Date(r.deadline))) errs.push({ idx, field: 'deadline', msg: 'Deadline bukan tanggal valid (YYYY-MM-DD)' });
    });
    return errs;
  }

  function handleImport(e) {
    const f = e.target.files[0];
    if (!f) return;
    
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const rows = parseCSV(ev.target.result);
        const v = validateRows(rows);
        if (v.length) {
          setErrors(v);
          showToast('Import selesai dengan error. Periksa daftar error.', 'error');
        } else {
          setErrors([]);
          showToast('Import berhasil');
        }

        const fd = new FormData();
        fd.append('file', new Blob([ev.target.result], { type: 'text/csv' }), f.name);
        const r = await fetch(`${API}/import`, { method: 'POST', body: fd });
        const j = await r.json();
        if (!j.ok) showToast('Import backend error: ' + (j.error || 'unknown'), 'error');
        setSatkers(rows);
      } catch (err) {
        showToast('Gagal parse CSV: ' + err.message, 'error');
      }
      setLoading(false);
    };
    reader.readAsText(f, 'utf8');
  }

  async function saveCfg() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg)
      });
      const j = await r.json();
      
      if (j.ok) {
        showToast('Konfigurasi berhasil disimpan di ' + (j.source === 'mongodb' ? 'database' : 'server'));
      } else {
        showToast(j.error || 'Gagal menyimpan konfigurasi', 'error');
      }
    } catch (err) {
      showToast('Gagal menyimpan konfigurasi: ' + err.message, 'error');
    }
    setLoading(false);
  }

  async function loadCfg() {
    try {
      const r = await fetch(`${API}/config`);
      const j = await r.json();
      if (j.ok) {
        setCfg(j.cfg || {});
        // Optionally show where config was loaded from
        if (j.source && j.source !== 'none') {
          console.log('Config loaded from:', j.source);
        }
      }
    } catch (err) {
      showToast('Gagal memuat konfigurasi', 'error');
    }
  }

  async function sendSingle(i) {
    const s = satkers[i];
    if (!s.email) return showToast('Email kosong', 'error');
    
    setLoading(true);
    try {
      // Don't send SMTP config from frontend, let backend handle it
      const body = {
        to: s.email,
        subject: `Pengingat sisa kas ${s.nama || ''}`,
        text: `Yth. ${s.nama || ''},\n\nMohon dikirimkan sisa kas. Deadline: ${s.deadline || '--'}`
      };
      const r = await fetch(`${API}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const j = await r.json();
      if (j.ok) {
        showToast('Email berhasil dikirim');
        update(i, 'status', 'Sudah Dikirim');
      } else {
        showToast('Gagal mengirim email: ' + j.error, 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
    setLoading(false);
  }

  async function runScheduler() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/run-scheduler`, { method: 'POST' });
      const j = await r.json();
      showToast(j.ok ? 'Scheduler berhasil dijalankan' : 'Error: ' + j.error, j.ok ? 'success' : 'error');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
    setLoading(false);
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'Belum Kirim': 'status-pending',
      'Sudah Diterima': 'status-completed',
      'Revisi Diperlukan': 'status-revision'
    };
    return statusMap[status] || 'status-pending';
  };

  const logout = () => {
    fetch(`${API}/auth/logout`, { method: 'POST' }).finally(() => {
      try { localStorage.removeItem('user'); } catch (err) {}
      router.push('/login');
    });
  };

  const canConfig = user && (user.role === 'super_admin' || user.role === 'admin');
  const isUser = user && user.role === 'user';

  async function loadReports() {
    try {
      const r = await fetch(`${API}/reports`);
      const j = await r.json();
      if (j.ok) setReports(j.reports || []);
    } catch (err) {
      showToast('Gagal memuat laporan', 'error');
    }
  }

  async function submitReport() {
    if (!newReport.satker_name || !newReport.amount) {
      showToast('Mohon lengkapi data laporan', 'error');
      return;
    }
    
    setLoading(true);
    try {
      let filePath = '';
      
      // Upload file if exists
      if (newReport.file) {
        const formData = new FormData();
        formData.append('file', newReport.file);
        
        const uploadRes = await fetch(`${API}/upload`, {
          method: 'POST',
          body: formData
        });
        
        const uploadData = await uploadRes.json();
        if (uploadData.ok) {
          filePath = uploadData.path;
        } else {
          showToast('Gagal upload file: ' + uploadData.error, 'error');
          setLoading(false);
          return;
        }
      }
      
      const reportData = {
        ...newReport,
        user_email: user.username + '@kemhan.go.id',
        file_path: filePath,
        file_name: newReport.file ? newReport.file.name : ''
      };
      
      const r = await fetch(`${API}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      
      const j = await r.json();
      if (j.ok) {
        showToast('Laporan berhasil dikirim');
        setNewReport({ satker_name: '', report_type: 'Sisa Kas', amount: '', description: '', file: null });
        setShowReportForm(false);
        loadReports();
      } else {
        showToast('Gagal mengirim laporan', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
    setLoading(false);
  }

  async function submitRejection() {
    if (!rejectReason || rejectReason.trim() === '') {
      // Validation handled by required attribute in input
      return;
    }
    
    setLoading(true);
    setShowRejectModal(false);
    
    try {
      const body = { 
        id: currentRejectId, 
        status: 'rejected', 
        reviewed_by: user.username,
        rejection_reason: rejectReason.trim()
      };
      
      const r = await fetch(`${API}/reports`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': document.cookie
        },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      
      const j = await r.json();
      if (j.ok) {
        loadReports();
        setToast({ show: true, message: 'Laporan berhasil ditolak', type: 'success' });
      } else {
        console.error('Gagal menolak laporan:', j.error);
        setToast({ show: true, message: j.error || 'Gagal menolak laporan', type: 'error' });
      }
    } catch (err) {
      console.error('Error:', err.message);
    }
    setLoading(false);
    setCurrentRejectId(null);
    setRejectReason('');
  }

  function cancelRejection() {
    setShowRejectModal(false);
    setCurrentRejectId(null);
    setRejectReason('');
  }

  async function updateReportStatus(id, status) {
    // If rejecting, show modal for reason
    if (status === 'rejected') {
      setCurrentRejectId(id);
      setRejectReason('');
      setShowRejectModal(true);
      return;
    }
    
    setLoading(true);
    try {
      const body = { id, status, reviewed_by: user.username };
      
      const r = await fetch(`${API}/reports`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': document.cookie
        },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      
      const j = await r.json();
      if (j.ok) {
        setToast({ show: true, message: 'Status laporan diupdate', type: 'success' });
        loadReports();
      } else {
        setToast({ show: true, message: j.error || 'Gagal update status', type: 'error' });
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
    setLoading(false);
  }

  async function deleteReport(id) {
    if (!confirm('Hapus laporan ini?')) return;
    
    setLoading(true);
    try {
      const r = await fetch(`${API}/reports`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': document.cookie
        },
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      
      const j = await r.json();
      if (j.ok) {
        loadReports();
        setToast({ show: true, message: 'Laporan berhasil dihapus', type: 'success' });
      } else {
        console.error('Gagal menghapus laporan:', j.error || j.message);
        setToast({ show: true, message: j.error || j.message || 'Gagal menghapus laporan', type: 'error' });
      }
    } catch (err) {
      console.error('Error:', err.message);
      setToast({ show: true, message: 'Error: ' + err.message, type: 'error' });
    }
    setLoading(false);
  }

  function exportToPDF() {
    const doc = new jsPDF();
    doc.text('Laporan Satker', 20, 20);
    
    const tableData = reports.map(r => [
      r.satker_name,
      r.report_type,
      `Rp ${parseInt(r.amount || 0).toLocaleString('id-ID')}`,
      r.status,
      new Date(r.submitted_at).toLocaleDateString('id-ID'),
      new Date(r.submitted_at).toLocaleTimeString('id-ID')
    ]);
    
    doc.autoTable({
      head: [['Satker', 'Jenis', 'Jumlah', 'Status', 'Tanggal', 'Jam']],
      body: tableData,
      startY: 30
    });
    
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
    setShowPdfViewer(true);
  }

  function exportToExcel() {
    window.open('/api/export?format=excel', '_blank');
  }

  function downloadPDF() {
    const doc = new jsPDF();
    doc.text('Laporan Satker', 20, 20);
    
    const tableData = reports.map(r => [
      r.satker_name,
      r.report_type,
      `Rp ${parseInt(r.amount || 0).toLocaleString('id-ID')}`,
      r.status,
      new Date(r.submitted_at).toLocaleDateString('id-ID'),
      new Date(r.submitted_at).toLocaleTimeString('id-ID')
    ]);
    
    doc.autoTable({
      head: [['Satker', 'Jenis', 'Jumlah', 'Status', 'Tanggal', 'Jam']],
      body: tableData,
      startY: 30
    });
    
    doc.save('laporan-satker.pdf');
  }

  const stats = {
    total: satkers.length,
    pending: satkers.filter(s => s.status === 'Belum Kirim').length,
    completed: satkers.filter(s => s.status === 'Sudah Diterima').length,
    revision: satkers.filter(s => s.status === 'Revisi Diperlukan').length,
    reports_pending: reports.filter(r => r.status === 'pending').length,
    reports_total: reports.length
  };

  if (!authenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="header">
        <div className="header-top">
          KEMENTERIAN PERTAHANAN REPUBLIK INDONESIA
        </div>
        <div className="header-main">
          <div className="header-left">
            <div className="logo"></div>
            <div className="header-title">
              <h1>Satker Reminder</h1>
              <p>Sistem Pengingat dan Tracking Sisa Kas Satuan Kerja</p>
            </div>
          </div>
          <div className="header-right">
            {user && (
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">{user.role.replace('_', ' ')}</div>
              </div>
            )}
            {user && user.role === 'super_admin' && (
              <button className="btn btn-warning" onClick={() => router.push('/admin')}>
                Admin Panel
              </button>
            )}
            <button className="btn btn-success" onClick={() => router.push('/support')}>
              Support
            </button>
            <button className="btn btn-danger" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Satker</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Belum Kirim</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">Sudah Diterima</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.revision}</div>
          <div className="stat-label">Perlu Revisi</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.reports_total}</div>
          <div className="stat-label">Total Laporan</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.reports_pending}</div>
          <div className="stat-label">Laporan Pending</div>
        </div>
      </div>

      {isUser && (
      <div className="card">
        <h2>📝 Kirim Laporan</h2>
        <div className="toolbar">
          <button className="btn btn-success" onClick={() => setShowReportForm(!showReportForm)}>
            {showReportForm ? 'Batal' : 'Buat Laporan'}
          </button>
        </div>
        
        {showReportForm && (
          <div style={{ marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div className="config-grid">
              <div className="form-group">
                <label>Nama Satker</label>
                <input
                  className="input"
                  value={newReport.satker_name}
                  onChange={e => setNewReport({...newReport, satker_name: e.target.value})}
                  placeholder="Nama Satuan Kerja"
                />
              </div>
              <div className="form-group">
                <label>Jenis Laporan</label>
                <select
                  className="select"
                  value={newReport.report_type}
                  onChange={e => setNewReport({...newReport, report_type: e.target.value})}
                >
                  <option>Sisa Kas</option>
                  <option>Realisasi</option>
                  <option>Anggaran</option>
                </select>
              </div>
              <div className="form-group">
                <label>Jumlah (Rp)</label>
                <input
                  className="input"
                  type="number"
                  value={newReport.amount}
                  onChange={e => setNewReport({...newReport, amount: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Keterangan</label>
                <input
                  className="input"
                  value={newReport.description}
                  onChange={e => setNewReport({...newReport, description: e.target.value})}
                  placeholder="Deskripsi laporan"
                />
              </div>
              <div className="form-group">
                <label>Upload File (PDF, Excel, Word, Gambar)</label>
                <input
                  className="input"
                  type="file"
                  accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={e => setNewReport({...newReport, file: e.target.files[0]})}
                />
                {newReport.file && (
                  <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                    File: {newReport.file.name} ({(newReport.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>
            <button className="btn btn-primary" onClick={submitReport} disabled={loading}>
              {loading ? <div className="loading"></div> : ''} Kirim Laporan
            </button>
          </div>
        )}
      </div>
      )}

      <div className="card">
        <h2>Monitor Laporan</h2>
        {!isUser && (
        <div className="toolbar">
          <button className="btn btn-success" onClick={exportToExcel}>
            Export Excel
          </button>
          <button className="btn btn-primary" onClick={exportToPDF}>
            📄 Preview PDF
          </button>
          <button className="btn btn-warning" onClick={downloadPDF}>
            Download PDF
          </button>
        </div>
        )}
        
        {showPdfViewer && pdfUrl && (
          <div style={{ marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3>Preview PDF</h3>
              <button className="btn btn-danger" onClick={() => setShowPdfViewer(false)}>Tutup</button>
            </div>
            <div style={{ border: '1px solid #ddd', height: '500px', overflow: 'auto' }}>
              <Document file={pdfUrl}>
                <Page pageNumber={1} width={600} />
              </Document>
            </div>
          </div>
        )}
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Satker</th>
                <th>Jenis</th>
                <th>Jumlah</th>
                <th>File</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Jam</th>
                {!isUser && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i}>
                  <td>{r.satker_name}</td>
                  <td>{r.report_type}</td>
                  <td>Rp {parseInt(r.amount || 0).toLocaleString('id-ID')}</td>
                  <td>
                    {r.file_name ? (
                      <a href={r.file_path} target="_blank" rel="noopener noreferrer" 
                         style={{ color: '#212529', textDecoration: 'underline' }}>
                        📎 {r.file_name}
                      </a>
                    ) : (
                      <span style={{ color: '#6c757d' }}>Tidak ada file</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${
                      r.status === 'pending' ? 'status-pending' :
                      r.status === 'approved' ? 'status-completed' : 'status-revision'
                    }`}>
                      {r.status}
                    </span>
                    {r.status === 'rejected' && r.rejection_reason && (
                      <div style={{ marginTop: '5px', fontSize: '11px', color: '#dc3545', fontStyle: 'italic' }}>
                        Alasan: {r.rejection_reason}
                      </div>
                    )}
                  </td>
                  <td>{new Date(r.submitted_at).toLocaleDateString('id-ID')}</td>
                  <td>{new Date(r.submitted_at).toLocaleTimeString('id-ID')}</td>
                  {!isUser && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-success"
                          onClick={() => updateReportStatus(r.id, 'approved')}
                          disabled={loading}
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => updateReportStatus(r.id, 'rejected')}
                          disabled={loading}
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        >
                          Reject
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => deleteReport(r.id)}
                          disabled={loading}
                          style={{ 
                            padding: '6px 10px', 
                            fontSize: '12px', 
                            backgroundColor: '#dc3545',
                            border: '1px solid #dc3545',
                            color: 'white',
                            fontWeight: '500'
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!isUser && (
      <div className="card">
        <h2>Data Satuan Kerja</h2>
        
        <div className="toolbar">
          <button className="btn btn-primary" onClick={load} disabled={loading}>
            {loading ? <div className="loading"></div> : ''} Muat Ulang
          </button>
          <button className="btn btn-success" onClick={add}>
            Tambah Data
          </button>
          <div className="file-input">
            <input type="file" id="csvFile" onChange={handleImport} accept=".csv" />
            <label htmlFor="csvFile" className="file-input-label">
              Import CSV
            </label>
          </div>
          <button className="btn btn-primary" onClick={save} disabled={loading}>
            {loading ? <div className="loading"></div> : ''} Simpan
          </button>
          <button className="btn btn-warning" onClick={runScheduler} disabled={loading}>
            {loading ? <div className="loading"></div> : ''} Test Scheduler
          </button>
        </div>

        {errors.length > 0 && (
          <div className="error-panel">
            <h3>Error Validasi:</h3>
            <ul className="error-list">
              {errors.map((e, idx) => (
                <li key={idx}>Baris {e.idx + 1} - {e.field}: {e.msg}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Satker</th>
                <th>Email</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {satkers.map((s, i) => (
                <tr key={i}>
                  <td>
                    <input
                      className="input"
                      value={s.nama || ''}
                      onChange={e => update(i, 'nama', e.target.value)}
                      placeholder="Nama Satuan Kerja"
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      type="email"
                      value={s.email || ''}
                      onChange={e => update(i, 'email', e.target.value)}
                      placeholder="email@example.com"
                    />
                  </td>
                  <td>
                    <input
                      className="input"
                      type="date"
                      value={s.deadline || ''}
                      onChange={e => update(i, 'deadline', e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      className="select"
                      value={s.status || 'Belum Kirim'}
                      onChange={e => update(i, 'status', e.target.value)}
                    >
                      <option>Belum Kirim</option>
                      <option>Sudah Diterima</option>
                      <option>Revisi Diperlukan</option>
                    </select>
                    <div style={{ marginTop: '8px' }}>
                      <span className={`status-badge ${getStatusBadge(s.status || 'Belum Kirim')}`}>
                        {s.status || 'Belum Kirim'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-success"
                        onClick={() => sendSingle(i)}
                        disabled={loading}
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                      >
                        Kirim
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => remove(i)}
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {canConfig && (
      <div className="card">
        <h2>⚙️ Konfigurasi SMTP</h2>
        <div className="config-grid">
          <div className="form-group">
            <label>Host SMTP</label>
            <input
              className="input"
              value={cfg.smtp?.host || ''}
              onChange={e => setCfg({
                ...cfg,
                smtp: { ...(cfg.smtp || {}), host: e.target.value }
              })}
              placeholder="smtp.gmail.com"
            />
          </div>
          <div className="form-group">
            <label>Port</label>
            <input
              className="input"
              type="number"
              value={cfg.smtp?.port || ''}
              onChange={e => setCfg({
                ...cfg,
                smtp: { ...(cfg.smtp || {}), port: parseInt(e.target.value || 0, 10) }
              })}
              placeholder="587"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              className="input"
              type="email"
              value={cfg.smtp?.auth?.user || ''}
              onChange={e => setCfg({
                ...cfg,
                smtp: {
                  ...(cfg.smtp || {}),
                  auth: { ...(cfg.smtp?.auth || {}), user: e.target.value }
                }
              })}
              placeholder="your-email@gmail.com"
            />
          </div>
          <div className="form-group">
            <label>App Password</label>
            <input
              className="input"
              type="password"
              value={cfg.smtp?.auth?.pass || ''}
              onChange={e => setCfg({
                ...cfg,
                smtp: {
                  ...(cfg.smtp || {}),
                  auth: { ...(cfg.smtp?.auth || {}), pass: e.target.value }
                }
              })}
              placeholder="App Password Gmail"
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={saveCfg} disabled={loading}>
          {loading ? <div className="loading"></div> : ''} Simpan Konfigurasi
        </button>
      </div>
      )}

      {/* Modal untuk input alasan penolakan */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-bubble">
            <div className="modal-header">
              <h3>Tolak Laporan</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Alasan Penolakan:</label>
                <textarea
                  className="textarea"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Masukkan alasan penolakan laporan..."
                  rows="4"
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={cancelRejection}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={submitRejection}
                disabled={loading || !rejectReason.trim()}
              >
                {loading ? <div className="loading"></div> : ''} 
                Send Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}