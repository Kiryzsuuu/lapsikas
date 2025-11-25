import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Support() {
  const [user, setUser] = useState(null)
  const [ticket, setTicket] = useState({
    subject: '',
    category: 'Technical',
    priority: 'Medium',
    description: ''
  })
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    loadTickets()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  async function loadTickets() {
    try {
      const res = await fetch('/api/support/tickets')
      const data = await res.json()
      if (data.ok) setTickets(data.tickets)
    } catch (err) {
      showToast('Gagal memuat tiket', 'error')
    }
  }

  async function submitTicket() {
    if (!ticket.subject || !ticket.description) {
      showToast('Mohon lengkapi semua field', 'error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ticket,
          user: user.username,
          user_name: user.name
        })
      })

      const data = await res.json()
      if (data.ok) {
        showToast('Tiket berhasil dikirim')
        setTicket({ subject: '', category: 'Technical', priority: 'Medium', description: '' })
        loadTickets()
      }
    } catch (err) {
      showToast('Gagal mengirim tiket', 'error')
    }
    setLoading(false)
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
          SUPPORT CENTER - KEMENTERIAN PERTAHANAN REPUBLIK INDONESIA
        </div>
        <div className="header-main">
          <div className="header-left">
            <div className="logo"></div>
            <div className="header-title">
              <h1>Support Center</h1>
              <p>Bantuan Teknis dan Layanan Pengguna</p>
            </div>
          </div>
          <div className="header-right">
            <button className="btn btn-primary" onClick={() => router.push('/')}>
              Dashboard
            </button>
            <button className="btn btn-danger" onClick={() => {
              localStorage.removeItem('user')
              router.push('/login')
            }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">Hotline</div>
          <div className="stat-label">(021) 123-4567</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">Email</div>
          <div className="stat-label">support@kemhan.go.id</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">Support</div>
          <div className="stat-label">24/7</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{tickets.length}</div>
          <div className="stat-label">Tiket Anda</div>
        </div>
      </div>

      <div className="card">
        <h2>Buat Tiket Support</h2>
        <div className="config-grid">
          <div className="form-group">
            <label>Subjek</label>
            <input
              className="input"
              value={ticket.subject}
              onChange={e => setTicket({...ticket, subject: e.target.value})}
              placeholder="Masalah yang dialami"
            />
          </div>
          <div className="form-group">
            <label>Kategori</label>
            <select
              className="select"
              value={ticket.category}
              onChange={e => setTicket({...ticket, category: e.target.value})}
            >
              <option>Technical</option>
              <option>Account</option>
              <option>Feature Request</option>
              <option>Bug Report</option>
              <option>General</option>
            </select>
          </div>
          <div className="form-group">
            <label>Prioritas</label>
            <select
              className="select"
              value={ticket.priority}
              onChange={e => setTicket({...ticket, priority: e.target.value})}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '20px' }}>
          <label>Deskripsi Masalah</label>
          <textarea
            className="input"
            style={{ minHeight: '100px', resize: 'vertical' }}
            value={ticket.description}
            onChange={e => setTicket({...ticket, description: e.target.value})}
            placeholder="Jelaskan masalah secara detail..."
          />
        </div>
        <button className="btn btn-primary" onClick={submitTicket} disabled={loading}>
          {loading ? <div className="loading"></div> : '📤'} Kirim Tiket
        </button>
      </div>

      <div className="card">
        <h2>📋 Tiket Support Anda</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Subjek</th>
                <th>Kategori</th>
                <th>Prioritas</th>
                <th>Status</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t, i) => (
                <tr key={i}>
                  <td>#{t.id}</td>
                  <td>{t.subject}</td>
                  <td>
                    <span className="status-badge status-pending">
                      {t.category}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      t.priority === 'Critical' ? 'status-revision' :
                      t.priority === 'High' ? 'status-revision' :
                      t.priority === 'Medium' ? 'status-pending' : 'status-completed'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      t.status === 'Open' ? 'status-pending' :
                      t.status === 'In Progress' ? 'status-revision' : 'status-completed'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td>{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>❓ FAQ - Pertanyaan Umum</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          <details style={{ padding: '15px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
            <summary style={{ fontWeight: '600', cursor: 'pointer' }}>Bagaimana cara reset password?</summary>
            <p style={{ marginTop: '10px', color: '#6c757d' }}>
              Hubungi administrator untuk reset password. Sertakan username dan alasan reset.
            </p>
          </details>
          
          <details style={{ padding: '15px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
            <summary style={{ fontWeight: '600', cursor: 'pointer' }}>Kenapa email reminder tidak terkirim?</summary>
            <p style={{ marginTop: '10px', color: '#6c757d' }}>
              Pastikan konfigurasi SMTP sudah benar dan App Password Gmail valid. Cek juga folder spam.
            </p>
          </details>
          
          <details style={{ padding: '15px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
            <summary style={{ fontWeight: '600', cursor: 'pointer' }}>Bagaimana cara export laporan?</summary>
            <p style={{ marginTop: '10px', color: '#6c757d' }}>
              Admin dapat export laporan ke Excel atau PDF melalui tombol export di halaman Monitor Laporan.
            </p>
          </details>
          
          <details style={{ padding: '15px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
            <summary style={{ fontWeight: '600', cursor: 'pointer' }}>Scheduler tidak berjalan otomatis?</summary>
            <p style={{ marginTop: '10px', color: '#6c757d' }}>
              Jalankan register_task.ps1 sebagai Administrator untuk mendaftarkan Windows Task Scheduler.
            </p>
          </details>
        </div>
      </div>

      <div className="card">
        <h2>Kontak Support</h2>
        <div className="config-grid">
          <div style={{ textAlign: 'center' }}>
            <h3>Hotline</h3>
            <p>(021) 123-4567</p>
            <p>24/7 Available</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3>Email</h3>
            <p>support@kemhan.go.id</p>
            <p>Response: 1-2 hari kerja</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3>Kantor</h3>
            <p>Kemhan RI</p>
            <p>Jl. Medan Merdeka Barat</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3>Jam Kerja</h3>
            <p>Senin - Jumat</p>
            <p>08:00 - 16:00 WIB</p>
          </div>
        </div>
      </div>
    </div>
  )
}