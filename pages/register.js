import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    satker: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Terjadi kesalahan');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h2>Registrasi Berhasil!</h2>
          <p style={{ color: '#6c757d', marginTop: '20px' }}>
            Kami telah mengirim email verifikasi ke <strong>{formData.email}</strong>
          </p>
          <p style={{ color: '#6c757d' }}>
            Silakan cek inbox Anda dan klik link verifikasi untuk mengaktifkan akun.
          </p>
          <p style={{ color: '#6c757d', marginTop: '20px', fontSize: '14px' }}>
            Anda akan diarahkan ke halaman login dalam 3 detik...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>📝 Registrasi</h1>
        <p style={{ marginBottom: '30px', color: '#6c757d' }}>Buat akun baru</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <input
              className="input"
              type="text"
              name="name"
              placeholder="Nama Lengkap"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <input
              className="input"
              type="tel"
              name="phone"
              placeholder="Nomor Telepon"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <input
              className="input"
              type="text"
              name="satker"
              placeholder="Satuan Kerja"
              value={formData.satker}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="Password (min. 6 karakter)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <input
              className="input"
              type="password"
              name="confirmPassword"
              placeholder="Konfirmasi Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div style={{ 
              color: '#dc3545', 
              marginBottom: '20px', 
              fontSize: '14px', 
              padding: '10px', 
              background: '#f8f9fa', 
              border: '1px solid #dc3545', 
              borderRadius: '4px' 
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }} 
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          <p>Sudah punya akun? <a href="/login" style={{ color: '#212529', textDecoration: 'underline' }}>Login di sini</a></p>
        </div>
      </div>
    </div>
  );
}
