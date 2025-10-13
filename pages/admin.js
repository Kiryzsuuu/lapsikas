import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

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
        fetch('/api/admin/users'),
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

  async function deleteUser(username) {
    if (!confirm('Hapus user ini?')) return
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      
      if (res.ok) {
        showToast('User berhasil dihapus')
        loadData()
      }
    } catch (err) {
      showToast('Gagal menghapus user', 'error')
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
              🏠 Dashboard Utama
            </button>
            <button className="btn btn-danger" onClick={() => {
              localStorage.removeItem('user')
              router.push('/login')
            }}>
              🚪 Logout
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
        <h2>👥 Manajemen User</h2>
        <div className="toolbar">
          <button className="btn btn-primary" onClick={loadData} disabled={loading}>
            {loading ? <div className="loading"></div> : '🔄'} Refresh
          </button>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i}>
                  <td>{u.username}</td>
                  <td>{u.name}</td>
                  <td>
                    <span className={`status-badge ${
                      u.role === 'super_admin' ? 'status-completed' :
                      u.role === 'admin' ? 'status-revision' : 'status-pending'
                    }`}>
                      {u.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>{u.lastLogin || 'Belum pernah'}</td>
                  <td>
                    <span className="status-badge status-completed">Active</span>
                  </td>
                  <td>
                    {u.username !== 'superadmin' && (
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteUser(u.username)}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        🗑️ Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>📋 System Logs</h2>
        <div className="toolbar">
          <button className="btn btn-primary" onClick={loadData} disabled={loading}>
            {loading ? <div className="loading"></div> : '🔄'} Refresh
          </button>
          <button className="btn btn-danger" onClick={clearLogs}>
            🗑️ Clear Logs
          </button>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Type</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 50).map((log, i) => (
                <tr key={i}>
                  <td>{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                  <td>
                    <span className={`status-badge ${
                      log.type === 'LOGIN' ? 'status-completed' :
                      log.type === 'ERROR' ? 'status-revision' : 'status-pending'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td>{log.user || 'System'}</td>
                  <td>{log.action}</td>
                  <td style={{ fontSize: '12px', maxWidth: '200px', overflow: 'hidden' }}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>💾 Database Info</h2>
        <div className="config-grid">
          <div className="form-group">
            <label>Users File</label>
            <input className="input" value="data/users.json" readOnly />
          </div>
          <div className="form-group">
            <label>Satkers File</label>
            <input className="input" value="data/satkers.csv" readOnly />
          </div>
          <div className="form-group">
            <label>Reports File</label>
            <input className="input" value="data/reports.csv" readOnly />
          </div>
          <div className="form-group">
            <label>Config File</label>
            <input className="input" value="data/config.json" readOnly />
          </div>
        </div>
      </div>
    </div>
  )
}