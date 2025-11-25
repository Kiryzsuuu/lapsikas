import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.query.verified === 'true') {
      setSuccess('Email berhasil diverifikasi! Silakan login.');
    }
  }, [router.query]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Clear any stale client-side user object before attempting login
    try { localStorage.removeItem('user'); } catch (err) {}
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (data.ok) {
        // store minimal user info for UI; session is managed by httpOnly cookie
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Terjadi kesalahan');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Satker Reminder</h1>
        <p style={{ marginBottom: '30px', color: '#6c757d' }}>Masuk ke sistem</p>
        
        {success && (
          <div style={{ 
            color: '#28a745', 
            marginBottom: '20px', 
            fontSize: '14px', 
            padding: '10px', 
            background: '#d4edda', 
            border: '1px solid #28a745', 
            borderRadius: '4px' 
          }}>
            {success}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div style={{ color: '#dc3545', marginBottom: '20px', fontSize: '14px', padding: '10px', background: '#f8f9fa', border: '1px solid #dc3545', borderRadius: '4px' }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          <p><a href="/forgot-password" style={{ color: '#212529', textDecoration: 'underline' }}>Lupa Password?</a></p>
          <p style={{ marginTop: '10px' }}>Belum punya akun? <a href="/register" style={{ color: '#212529', textDecoration: 'underline' }}>Daftar di sini</a></p>
        </div>
      </div>
    </div>
  );
}
