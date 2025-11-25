import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({})
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'super_admin') {
      router.push('/')
      return
    }
    setUser(parsedUser)
    loadData()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  async function loadData() {
    setLoading(true)
    try {
      const [usersRes, logsRes, statsRes] = await Promise.all([
        fetch('/api/admin/users-new'),
        fetch('/api/admin/logs'),
        fetch('/api/admin/stats')
      ])
      
      const usersData = await usersRes.json()
      const logsData = await logsRes.json()
      const statsData = await statsRes.json()
      
      if (usersData.ok) setUsers(usersData.users)
      if (logsData.ok) setLogs(logsData.logs)
      if (statsData.ok) setStats(statsData.stats)
    } catch (err) {
      showToast('Gagal memuat data', 'error')
    }
    setLoading(false)
  }

  async function deleteUser(userEmail) {
    if (!confirm('Hapus user ini?')) return
    
    try {
      const res = await fetch('/api/admin/users-new', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      })
      
      const data = await res.json()
      if (data.ok) {
        showToast('User berhasil dihapus')
        loadData()
      } else {
        showToast(data.message || 'Gagal menghapus user', 'error')
      }
    } catch (err) {
      showToast('Gagal menghapus user', 'error')
    }
  }

  async function updateUserRole(userEmail, newRole) {
    try {
      const res = await fetch('/api/admin/users-new', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, role: newRole })
      })
      
      const data = await res.json()
      if (data.ok) {
        showToast('Role berhasil diupdate')
        loadData()
      } else {
        showToast(data.message || 'Gagal update role', 'error')
      }
    } catch (err) {
      showToast('Gagal update role', 'error')
    }
  }

  async function toggleAdminVerification(userEmail, currentStatus) {
    try {
      const res = await fetch('/api/admin/users-new', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, adminVerified: !currentStatus })
      })
      
      const data = await res.json()
      if (data.ok) {
        showToast(`Verifikasi admin ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
        loadData()
      } else {
        showToast(data.message || 'Gagal update verifikasi', 'error')
      }
    } catch (err) {
      showToast('Gagal update verifikasi', 'error')
    }
  }

  async function clearLogs() {
    if (!confirm('Hapus semua log?')) return
    
    try {
      const res = await fetch('/api/admin/logs', { method: 'DELETE' })
      if (res.ok) {
        showToast('Log berhasil dihapus')
        loadData()
      }
    } catch (err) {
      showToast('Gagal menghapus log', 'error')
    }
  }

  async function deleteLog(logId) {
    if (!confirm('Hapus log ini?')) return
    
    try {
      const res = await fetch('/api/admin/logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId })
      })
      
      const data = await res.json()
      if (data.ok) {
        showToast('Log berhasil dihapus')
        loadData()
      } else {
        showToast(data.message || 'Gagal menghapus log', 'error')
      }
    } catch (err) {
      showToast('Gagal menghapus log', 'error')
    }
  }

  function downloadUsersPDF() {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('LAPORAN DATA PENGGUNA', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Kementerian Pertahanan Republik Indonesia', 105, 30, { align: 'center' })
    doc.text('Satker Reminder System', 105, 38, { align: 'center' })
    
    // Date
    doc.setFontSize(10)
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 20, 50)
    
    // Line separator
    doc.setLineWidth(0.5)
    doc.line(20, 55, 190, 55)
    
    // Table data
    const tableData = users.map((user, index) => [
      index + 1,
      user.email || '-',
      user.name || '-',
      user.phone || '-',
      user.satker || '-',
      user.role === 'user' ? 'User' : 
      user.role === 'admin' ? 'Admin' : 'Super Admin',
      user.emailVerified ? 'Ya' : 'Tidak',
      user.adminVerified ? 'Ya' : 'Tidak',
      user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('id-ID') : 'Belum pernah',
      user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'
    ])
    
    doc.autoTable({
      head: [['No', 'Email', 'Nama', 'Telepon', 'Satker', 'Role', 'Email Verified', 'Admin Verified', 'Login Terakhir', 'Tgl Daftar']],
      body: tableData,
      startY: 60,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [33, 37, 41],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 }, // No
        1: { cellWidth: 35 }, // Email
        2: { cellWidth: 25 }, // Nama
        3: { cellWidth: 20 }, // Telepon
        4: { cellWidth: 25 }, // Satker
        5: { halign: 'center', cellWidth: 15 }, // Role
        6: { halign: 'center', cellWidth: 15 }, // Email Verified
        7: { halign: 'center', cellWidth: 15 }, // Admin Verified
        8: { cellWidth: 20 }, // Login Terakhir
        9: { cellWidth: 20 }  // Tgl Daftar
      },
      margin: { left: 10, right: 10 }
    })
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(`Halaman ${i} dari ${pageCount}`, 105, 285, { align: 'center' })
      doc.text('Generated by Satker Reminder System', 105, 290, { align: 'center' })
    }
    
    doc.save(`Data_Pengguna_${new Date().toISOString().split('T')[0]}.pdf`)
    showToast('PDF berhasil didownload')
  }

  function downloadLogsPDF() {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('LAPORAN LOG AKTIVITAS', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Kementerian Pertahanan Republik Indonesia', 105, 30, { align: 'center' })
    doc.text('Satker Reminder System', 105, 38, { align: 'center' })
    
    // Date
    doc.setFontSize(10)
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 20, 50)
    
    // Line separator
    doc.setLineWidth(0.5)
    doc.line(20, 55, 190, 55)
    
    // Table data
    const tableData = logs.slice(0, 100).map((log, index) => {
      const date = new Date(log.timestamp)
      return [
        index + 1,
        date.toLocaleDateString('id-ID'),
        date.toLocaleTimeString('id-ID'),
        log.type || '-',
        log.user || 'System',
        log.action || '-',
        log.details || '-'
      ]
    })
    
    doc.autoTable({
      head: [['No', 'Tanggal', 'Jam', 'Type', 'User', 'Action', 'Details']],
      body: tableData,
      startY: 60,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [33, 37, 41],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 }, // No
        1: { halign: 'center', cellWidth: 22 }, // Tanggal
        2: { halign: 'center', cellWidth: 20 }, // Jam
        3: { halign: 'center', cellWidth: 18 }, // Type
        4: { cellWidth: 30 }, // User
        5: { cellWidth: 30 }, // Action
        6: { cellWidth: 60 }  // Details
      },
      margin: { left: 10, right: 10 }
    })
    
    // Note for limited data
    if (logs.length > 100) {
      doc.setFontSize(10)
      doc.text(`Catatan: Menampilkan 100 log terbaru dari total ${logs.length} log`, 20, doc.lastAutoTable.finalY + 10)
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(`Halaman ${i} dari ${pageCount}`, 105, 285, { align: 'center' })
      doc.text('Generated by Satker Reminder System', 105, 290, { align: 'center' })
    }
    
    doc.save(`Log_Aktivitas_${new Date().toISOString().split('T')[0]}.pdf`)
    showToast('PDF berhasil didownload')
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="container">
      {toast && (
        <div className={`toast toast-${toast.type}`} onClick={() => setToast(null)}>
          {toast.message}
        </div>
      )}

      <div className="header">
        <div className="header-top">
          ADMIN PANEL - KEMENTERIAN PERTAHANAN REPUBLIK INDONESIA
        </div>
        <div className="header-main">
          <div className="header-left">
            <div className="logo"></div>
            <div className="header-title">
              <h1>Admin Panel</h1>
              <p>Monitoring dan Manajemen Sistem</p>
            </div>
          </div>
          <div className="header-right">
            <button className="btn btn-primary" onClick={() => router.push('/')}>
              Dashboard Utama
            </button>
            <button className="btn btn-danger" onClick={() => {
              fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
                try { localStorage.removeItem('user'); } catch (err) {}
                router.push('/login');
              });
            }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalUsers || 0}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalReports || 0}</div>
          <div className="stat-label">Total Laporan</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalEmails || 0}</div>
          <div className="stat-label">Email Terkirim</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalLogins || 0}</div>
          <div className="stat-label">Total Login</div>
        </div>
      </div>

      <div className="card">
        <h2>Manajemen User</h2>
        <div className="toolbar">
          <button className="btn btn-primary" onClick={loadData} disabled={loading}>
            {loading ? <div className="loading"></div> : 'Refresh'}
          </button>
          <button className="btn btn-success" onClick={downloadUsersPDF} disabled={loading}>
            📄 Download PDF Users
          </button>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Satker</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Last Login</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i}>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.satker || '-'}</td>
                  <td>
                    <select
                      className="input"
                      style={{ padding: '6px', fontSize: '12px' }}
                      value={u.role}
                      onChange={(e) => updateUserRole(u.email, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <span className={`status-badge ${u.emailVerified ? 'status-completed' : 'status-revision'}`}>
                        Email: {u.emailVerified ? 'Verified' : 'Not Verified'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`status-badge ${u.adminVerified ? 'status-completed' : 'status-revision'}`}>
                          Admin: {u.adminVerified ? 'Verified' : 'Not Verified'}
                        </span>
                        {u.email !== 'maskiryz23@gmail.com' && (
                          <button
                            className={`btn ${u.adminVerified ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => toggleAdminVerification(u.email, u.adminVerified)}
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            {u.adminVerified ? 'Revoke' : 'Verify'}
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{u.lastLogin ? new Date(u.lastLogin).toLocaleString('id-ID') : 'Belum pernah'}</td>
                  <td>
                    {u.email !== 'maskiryz23@gmail.com' ? (
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteUser(u.email)}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        Hapus
                      </button>
                    ) : (
                      <span style={{ color: '#666', fontSize: '11px', fontStyle: 'italic' }}>
                        Super Admin
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Monitor Laporan</h2>
        <div className="toolbar">
          <button className="btn btn-primary" onClick={loadData} disabled={loading}>
            {loading ? <div className="loading"></div> : 'Refresh'}
          </button>
          <button className="btn btn-success" onClick={downloadLogsPDF} disabled={loading}>
            📄 Download PDF Logs
          </button>
          <button className="btn btn-danger" onClick={clearLogs}>
            Hapus Semua Log
          </button>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jam</th>
                <th>Type</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 50).map((log, i) => {
                const date = new Date(log.timestamp);
                return (
                  <tr key={i}>
                    <td>{date.toLocaleDateString('id-ID')}</td>
                    <td>{date.toLocaleTimeString('id-ID')}</td>
                    <td>
                      <span className={`status-badge ${
                        log.type === 'INFO' || log.type === 'SUCCESS' ? 'status-completed' :
                        log.type === 'ERROR' ? 'status-revision' : 'status-pending'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td>{log.user || 'System'}</td>
                    <td>{log.action}</td>
                    <td style={{ fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details}
                    </td>
                    <td>
                      <button 
                        onClick={() => deleteLog(log.id)}
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Database Info</h2>
        <div className="config-grid">
          <div className="form-group">
            <label>Database</label>
            <input className="input" value="MongoDB" readOnly />
          </div>
          <div className="form-group">
            <label>Status</label>
            <input className="input" value="Connected" readOnly style={{ color: '#28a745' }} />
          </div>
          <div className="form-group">
            <label>Collections</label>
            <input className="input" value="users, satkers, reports, logs" readOnly />
          </div>
          <div className="form-group">
            <label>Environment</label>
            <input className="input" value={process.env.NODE_ENV || 'development'} readOnly />
          </div>
        </div>
      </div>
    </div>
  )
}