import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function VerifyEmail() {
  const router = useRouter();
  const { token, success, error } = router.query;
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (success) {
      setStatus('success');
      setMessage('Email berhasil diverifikasi! Silakan login.');
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 3000);
    } else if (error) {
      setStatus('error');
      if (error === 'invalid') {
        setMessage('Link verifikasi tidak valid atau sudah kedaluwarsa.');
      } else if (error === 'server') {
        setMessage('Terjadi kesalahan server. Silakan coba lagi nanti.');
      } else {
        setMessage('Terjadi kesalahan saat verifikasi email.');
      }
    } else if (token) {
      verifyEmail(token);
    }
  }, [token, success, error]);

  const verifyEmail = async (token) => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await res.json();

      if (data.ok) {
        setStatus('success');
        setMessage('Email berhasil diverifikasi! Silakan login.');
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Link verifikasi tidak valid atau sudah kedaluwarsa.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Terjadi kesalahan saat verifikasi email.');
    }
  };

  return (
    <>
      <Head>
        <title>Verifikasi Email - Satker Reminder</title>
      </Head>
      
      <div className="container">
        <div className="header">
          <div className="header-top">
            KEMENTERIAN PERTAHANAN REPUBLIK INDONESIA
          </div>
          <div className="header-main">
            <div className="header-left">
              <div className="logo"></div>
              <div className="header-title">
                <h1>Verifikasi Email</h1>
                <p>Satker Reminder System</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
          {status === 'loading' && (
            <>
              <div className="loading-spinner" style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #212529',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <h2>Memverifikasi Email...</h2>
              <p>Mohon tunggu sebentar...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ fontSize: '48px', color: '#28a745', marginBottom: '20px' }}>
                ✅
              </div>
              <h2 style={{ color: '#28a745' }}>Verifikasi Berhasil!</h2>
              <p>{message}</p>
              <p>Anda akan diarahkan ke halaman login dalam beberapa detik...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ fontSize: '48px', color: '#dc3545', marginBottom: '20px' }}>
                ❌
              </div>
              <h2 style={{ color: '#dc3545' }}>Verifikasi Gagal</h2>
              <p>{message}</p>
              <div style={{ marginTop: '30px' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => router.push('/login')}
                  style={{ marginRight: '10px' }}
                >
                  Ke Halaman Login
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => router.push('/register')}
                >
                  Daftar Ulang
                </button>
              </div>
            </>
          )}
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}