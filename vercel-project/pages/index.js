import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LoginPage() {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (r.ok) { router.push('/game'); return; }
      const d = await r.json();
      setErr(d.error || 'Login failed');
    } catch { setErr('Connection error'); }
    finally { setBusy(false); }
  }

  return (<>
    <Head>
      <title>XAUUSD Big Road — Login</title>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
    </Head>

    <style jsx global>{`
      *{margin:0;padding:0;box-sizing:border-box}
      body{background:#0a0a0a;font-family:'Crimson Text',serif;
           min-height:100vh;display:flex;align-items:center;justify-content:center}
    `}</style>

    <style jsx>{`
      .box{background:linear-gradient(145deg,#0d1a10,#0a1208);
           border:1px solid rgba(201,168,76,.3);border-radius:16px;
           padding:48px 40px;width:380px;box-shadow:0 20px 60px rgba(0,0,0,.8);text-align:center}
      .ttl{font-family:'Cinzel',serif;color:#f0d080;font-size:28px;font-weight:900;
           letter-spacing:6px;text-shadow:0 0 20px rgba(201,168,76,.6);margin-bottom:6px}
      .sub{font-family:'Cinzel',serif;color:rgba(201,168,76,.5);font-size:11px;
           letter-spacing:4px;margin-bottom:32px}
      .lbl{font-family:'Cinzel',serif;font-size:10px;color:rgba(201,168,76,.6);
           letter-spacing:2px;text-align:left;display:block;margin-bottom:6px}
      .inp{width:100%;background:rgba(0,0,0,.5);border:1px solid rgba(201,168,76,.3);
           border-radius:8px;color:#f0d080;font-family:'Cinzel',serif;font-size:16px;
           padding:12px 16px;text-align:center;letter-spacing:4px;outline:none;
           transition:border-color .3s}
      .inp:focus{border-color:rgba(201,168,76,.7);box-shadow:0 0 15px rgba(201,168,76,.2)}
      .btn{width:100%;background:linear-gradient(135deg,#c9a84c,#8b6914);color:#0a0a0a;
           font-family:'Cinzel',serif;font-size:14px;font-weight:700;letter-spacing:3px;
           padding:14px;border:none;border-radius:8px;cursor:pointer;
           transition:all .2s;margin-top:12px}
      .btn:hover{filter:brightness(1.2);transform:translateY(-2px)}
      .btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
      .err{color:#ff6b6b;font-size:13px;margin-top:12px;font-weight:600}
      .ico{font-size:40px;opacity:.2;margin-bottom:16px}
    `}</style>

    <div className="box">
      <div className="ico">&#128009;</div>
      <div className="ttl">BACCARAT</div>
      <div className="sub">XAUUSD &middot; BIG ROAD EDITION</div>
      <form onSubmit={submit}>
        <label className="lbl">PASSWORD</label>
        <input className="inp" type="password" value={pw}
               onChange={e=>setPw(e.target.value)} autoFocus required
               placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"/>
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'VERIFYING...' : 'ENTER'}
        </button>
      </form>
      {err && <div className="err">{err}</div>}
    </div>
  </>);
}
