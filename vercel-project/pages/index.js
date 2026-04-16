import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/game');
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>XAUUSD Big Road - Login</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #0a0a0a;
          font-family: 'Crimson Text', serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <style jsx>{`
        .login-box {
          background: linear-gradient(145deg, #0d1a10, #0a1208);
          border: 1px solid rgba(201, 168, 76, 0.3);
          border-radius: 16px;
          padding: 48px 40px;
          width: 380px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
          text-align: center;
        }
        .login-title {
          font-family: 'Cinzel', serif;
          color: #f0d080;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 6px;
          text-shadow: 0 0 20px rgba(201, 168, 76, 0.6);
          margin-bottom: 6px;
        }
        .login-sub {
          font-family: 'Cinzel', serif;
          color: rgba(201, 168, 76, 0.5);
          font-size: 11px;
          letter-spacing: 4px;
          margin-bottom: 32px;
        }
        .input-group {
          margin-bottom: 20px;
        }
        .input-label {
          font-family: 'Cinzel', serif;
          font-size: 10px;
          color: rgba(201, 168, 76, 0.6);
          letter-spacing: 2px;
          text-align: left;
          display: block;
          margin-bottom: 6px;
        }
        .input-field {
          width: 100%;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(201, 168, 76, 0.3);
          border-radius: 8px;
          color: #f0d080;
          font-family: 'Cinzel', serif;
          font-size: 16px;
          padding: 12px 16px;
          text-align: center;
          letter-spacing: 4px;
          outline: none;
          transition: border-color 0.3s;
        }
        .input-field:focus {
          border-color: rgba(201, 168, 76, 0.7);
          box-shadow: 0 0 15px rgba(201, 168, 76, 0.2);
        }
        .btn-login {
          width: 100%;
          background: linear-gradient(135deg, #c9a84c, #8b6914);
          color: #0a0a0a;
          font-family: 'Cinzel', serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 3px;
          padding: 14px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 8px;
        }
        .btn-login:hover {
          filter: brightness(1.2);
          transform: translateY(-2px);
        }
        .btn-login:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        .error-msg {
          color: #ff6b6b;
          font-size: 13px;
          margin-top: 12px;
          font-weight: 600;
        }
        .dragon {
          font-size: 40px;
          opacity: 0.2;
          margin-bottom: 16px;
        }
      `}</style>

      <div className="login-box">
        <div className="dragon">&#128009;</div>
        <div className="login-title">BACCARAT</div>
        <div className="login-sub">XAUUSD &middot; BIG ROAD EDITION</div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">PASSWORD</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
              autoFocus
              required
            />
          </div>
          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? 'VERIFYING...' : 'ENTER'}
          </button>
        </form>

        {error && <div className="error-msg">{error}</div>}
      </div>
    </>
  );
}
