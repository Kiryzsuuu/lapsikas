import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (data.ok) {
        setSuccess(true);
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
          <h2>Email Terkirim!</h2>
          <p style={{ color: '#6c757d', marginTop: '20px' }}>
            Jika email <strong>{email}</strong> terdaftar di sistem kami,
            kami telah mengirim link reset password ke email tersebut.
          </p>
          <p style={{ color: '#6c757d', marginTop: '10px' }}>
            Silakan cek inbox Anda (dan folder spam).
          </p>
          <a href="/login" className="btn btn-primary" style={{ marginTop: '30px', display: 'inline-block' }}>
            Kembali ke Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🔑 Lupa Password</h1>
        <p style={{ marginBottom: '30px', color: '#6c757d' }}>
          Masukkan email Anda dan kami akan mengirim link reset password
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          <p><a href="/login" style={{ color: '#212529', textDecoration: 'underline' }}>Kembali ke Login</a></p>
        </div>
      </div>
    </div>
  );
}
