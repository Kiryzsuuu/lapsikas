import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.query.token) {
      setToken(router.query.token);
    }
  }, [router.query.token]);

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
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
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

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h2>Token Tidak Valid</h2>
          <p style={{ color: '#6c757d', marginTop: '20px' }}>
            Link reset password tidak valid atau sudah kedaluwarsa.
          </p>
          <a href="/forgot-password" className="btn btn-primary" style={{ marginTop: '30px', display: 'inline-block' }}>
            Minta Link Baru
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h2>Password Berhasil Direset!</h2>
          <p style={{ color: '#6c757d', marginTop: '20px' }}>
            Password Anda telah berhasil diubah.
          </p>
          <p style={{ color: '#6c757d', marginTop: '10px', fontSize: '14px' }}>
            Anda akan diarahkan ke halaman login dalam 3 detik...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🔒 Reset Password</h1>
        <p style={{ marginBottom: '30px', color: '#6c757d' }}>Buat password baru Anda</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="Password Baru (min. 6 karakter)"
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
              placeholder="Konfirmasi Password Baru"
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
            {loading ? 'Memproses...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
