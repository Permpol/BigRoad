import { useEffect } from 'react';
import Head from 'next/head';

export default function GamePage() {
  useEffect(() => {
    // ── Anti-copy protections ──
    // Disable right-click
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Disable devtools shortcuts
    document.addEventListener('keydown', e => {
      if (e.key === 'F12') e.preventDefault();
      if (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) e.preventDefault();
      if (e.ctrlKey && e.key.toUpperCase() === 'U') e.preventDefault();
      if (e.ctrlKey && e.key.toUpperCase() === 'S') e.preventDefault();
      if (e.ctrlKey && e.key.toUpperCase() === 'P') e.preventDefault();
    });

    // Disable drag
    document.addEventListener('dragstart', e => e.preventDefault());

    // Debugger trap (runs periodically)
    const debugInterval = setInterval(() => {
      const start = performance.now();
      debugger;
      if (performance.now() - start > 100) {
        document.body.innerHTML = '<div style="color:#ff6b6b;font-size:24px;text-align:center;margin-top:40vh;font-family:monospace;">Access Denied</div>';
        clearInterval(debugInterval);
      }
    }, 3000);

    // ── Load data from API ──
    initGame();

    return () => clearInterval(debugInterval);
  }, []);

  return (
    <>
      <Head>
        <title>XAUUSD Big Road - Baccarat Style</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style jsx global>{`
        :root {
          --felt: #1a5c2e; --felt-dark: #0f3d1e; --felt-light: #236b38;
          --gold: #c9a84c; --gold-light: #f0d080; --gold-dark: #8b6914;
          --blue: #1a3fa8; --blue-light: #4169e1;
          --red: #c0392b; --red-light: #e74c3c;
          --cream: #f5f0e0; --dark: #0a1a0f;
          --table-edge: #5c3a1e; --table-rim: #8b5e2a;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #0a0a0a;
          font-family: 'Crimson Text', serif;
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center;
          overflow-x: hidden;
          -webkit-user-select: none; user-select: none;
        }
        .casino-wrapper { width: 100%; max-width: 1200px; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
        .table-outer {
          background: linear-gradient(145deg, #6b3f12, #3d2008, #6b3f12);
          border-radius: 180px 180px 40px 40px; padding: 18px;
          box-shadow: 0 0 0 4px #8b5e2a, 0 0 0 8px #5c3a1e, 0 20px 60px rgba(0,0,0,0.8), inset 0 2px 6px rgba(255,200,100,0.2);
          position: relative;
        }
        .table-inner {
          background: radial-gradient(ellipse at 50% 30%, #236b38, #1a5c2e 50%, #0f3d1e);
          border-radius: 160px 160px 30px 30px; padding: 30px 40px 24px;
          position: relative; overflow: hidden; min-height: 340px;
        }
        .table-inner::before {
          content: ''; position: absolute; inset: 0;
          background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
          border-radius: inherit; pointer-events: none;
        }
        .table-inner::after {
          content: ''; position: absolute; top: 15px; left: 15px; right: 15px; bottom: 15px;
          border: 1px solid rgba(201,168,76,0.25); border-radius: 150px 150px 22px 22px; pointer-events: none;
        }
        .table-title { font-family: 'Cinzel', serif; text-align: center; color: var(--gold-light); font-size: 28px; font-weight: 900; letter-spacing: 8px; text-shadow: 0 0 20px rgba(201,168,76,0.6), 0 2px 4px rgba(0,0,0,0.8); margin-bottom: 4px; }
        .table-subtitle { font-family: 'Cinzel', serif; text-align: center; color: rgba(201,168,76,0.6); font-size: 11px; letter-spacing: 4px; margin-bottom: 20px; }
        .betting-layout { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 20px; }
        .bet-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; position: relative; user-select: none; }
        .bet-zone-bullish { background: linear-gradient(180deg, rgba(26,63,168,0.4), rgba(26,63,168,0.2)); border: 2px solid rgba(65,105,225,0.5); border-radius: 12px 0 0 12px; padding: 18px 32px; min-width: 180px; }
        .bet-zone-bearish { background: linear-gradient(180deg, rgba(192,57,43,0.4), rgba(192,57,43,0.2)); border: 2px solid rgba(231,76,60,0.5); border-radius: 0 12px 12px 0; padding: 18px 32px; min-width: 180px; }
        .bet-zone-tie { background: linear-gradient(180deg, rgba(30,80,30,0.6), rgba(30,80,30,0.3)); border-top: 2px solid rgba(201,168,76,0.4); border-bottom: 2px solid rgba(201,168,76,0.4); padding: 10px 20px; min-width: 130px; text-align: center; }
        .bet-zone:hover:not(.disabled) { transform: translateY(-3px); filter: brightness(1.3); }
        .bet-zone.selected { filter: brightness(1.5); box-shadow: 0 0 20px currentColor; }
        .bet-zone.disabled { opacity: 0.4; cursor: not-allowed; }
        .zone-label { font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; letter-spacing: 3px; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }
        .zone-sublabel { font-size: 11px; letter-spacing: 2px; opacity: 0.7; margin-top: 2px; }
        .zone-icon { font-size: 28px; margin-bottom: 4px; }
        .bet-zone-bullish .zone-label { color: #7aadff; }
        .bet-zone-bearish .zone-label { color: #ff7a7a; }
        .bet-zone-tie .zone-label { color: var(--gold-light); font-size: 13px; }
        .bet-zone-tie .zone-sub { color: var(--gold); font-size: 10px; letter-spacing: 1px; }
        .dragon-left, .dragon-right { position: absolute; font-size: 48px; opacity: 0.15; top: 50%; transform: translateY(-50%); }
        .dragon-left { left: 30px; }
        .dragon-right { right: 30px; transform: translateY(-50%) scaleX(-1); }
        .status-bar { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); border: 1px solid rgba(201,168,76,0.3); border-radius: 8px; padding: 10px 20px; margin-top: 8px; }
        .status-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .status-label { font-family: 'Cinzel', serif; font-size: 9px; color: rgba(201,168,76,0.6); letter-spacing: 2px; }
        .status-value { font-family: 'Cinzel', serif; font-size: 18px; color: var(--gold-light); font-weight: 700; text-shadow: 0 0 10px rgba(201,168,76,0.4); }
        .status-value.alert { color: #ff6b6b; animation: pulse-red 0.5s ease infinite alternate; text-shadow: 0 0 10px rgba(255,50,50,0.6); }
        .status-value.betting-open { color: #6bff9e; text-shadow: 0 0 10px rgba(50,255,100,0.5); }
        @keyframes pulse-red { from { opacity: 1; } to { opacity: 0.5; } }
        .timer-container { position: relative; width: 70px; height: 70px; }
        .timer-svg { transform: rotate(-90deg); }
        .timer-track { fill: none; stroke: rgba(201,168,76,0.15); stroke-width: 5; }
        .timer-progress { fill: none; stroke: var(--gold); stroke-width: 5; stroke-linecap: round; transition: stroke-dashoffset 1s linear, stroke 0.3s; }
        .timer-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Cinzel', serif; font-size: 16px; font-weight: 700; color: var(--gold-light); }
        .phase-badge { font-family: 'Cinzel', serif; font-size: 12px; letter-spacing: 2px; padding: 4px 14px; border-radius: 20px; font-weight: 700; }
        .phase-betting { background: rgba(50,200,100,0.2); border: 1px solid rgba(50,200,100,0.5); color: #6bff9e; animation: glow-green 1s ease infinite alternate; }
        .phase-waiting { background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.3); color: var(--gold); }
        .phase-closed { background: rgba(200,50,50,0.2); border: 1px solid rgba(200,50,50,0.4); color: #ff7a7a; }
        @keyframes glow-green { from { box-shadow: 0 0 5px rgba(50,200,100,0.3); } to { box-shadow: 0 0 15px rgba(50,200,100,0.6); } }
        .notification { position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px); background: linear-gradient(135deg, #1a3fa8, #0f2570); border: 2px solid var(--gold); border-radius: 12px; padding: 16px 32px; font-family: 'Cinzel', serif; color: var(--gold-light); font-size: 16px; letter-spacing: 2px; font-weight: 700; text-align: center; z-index: 1000; transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
        .notification.show { transform: translateX(-50%) translateY(0); }
        .notification.alert-bet { background: linear-gradient(135deg, #8b1a1a, #5c0f0f); border-color: #ff6b6b; color: #ffaaaa; animation: shake 0.3s ease; }
        @keyframes shake { 0%, 100% { transform: translateX(-50%) translateY(0); } 25% { transform: translateX(calc(-50% - 6px)) translateY(0); } 75% { transform: translateX(calc(-50% + 6px)) translateY(0); } }
        .bigroad-section { background: linear-gradient(145deg, #0d1a10, #0a1208); border: 1px solid rgba(201,168,76,0.3); border-radius: 12px; padding: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.6); }
        .bigroad-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .bigroad-title { font-family: 'Cinzel', serif; color: var(--gold); font-size: 14px; letter-spacing: 3px; font-weight: 700; }
        .bigroad-stats { display: flex; gap: 16px; font-family: 'Cinzel', serif; font-size: 11px; }
        .stat-bull { color: #7aadff; } .stat-bear { color: #ff7a7a; } .stat-total { color: rgba(201,168,76,0.7); }
        .bigroad-grid-wrapper { overflow-x: auto; overflow-y: hidden; padding-bottom: 4px; }
        .bigroad-grid { display: grid; grid-auto-columns: 36px; grid-template-rows: repeat(6, 36px); grid-auto-flow: column; gap: 2px; min-width: max-content; }
        .br-cell { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 3px; position: relative; }
        .br-circle { width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; animation: pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes pop-in { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .br-bull { border-color: #4169e1; background: radial-gradient(circle at 35% 35%, rgba(100,150,255,0.3), rgba(26,63,168,0.1)); box-shadow: 0 0 8px rgba(65,105,225,0.4), inset 0 1px 3px rgba(255,255,255,0.1); }
        .br-bear { border-color: #e74c3c; background: radial-gradient(circle at 35% 35%, rgba(255,100,100,0.3), rgba(192,57,43,0.1)); box-shadow: 0 0 8px rgba(231,76,60,0.4), inset 0 1px 3px rgba(255,255,255,0.1); }
        .ohlc-panel { background: rgba(0,0,0,0.4); border: 1px solid rgba(201,168,76,0.2); border-radius: 8px; padding: 12px 20px; display: flex; gap: 24px; align-items: center; font-family: 'Crimson Text', serif; font-size: 13px; }
        .ohlc-label { color: rgba(201,168,76,0.6); font-size: 10px; letter-spacing: 1px; display: block; }
        .ohlc-val { color: var(--cream); font-size: 15px; font-weight: 600; }
        .ohlc-val.up { color: #6bff9e; } .ohlc-val.dn { color: #ff7a7a; }
        .candle-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
        .candle-bar-fill { height: 100%; background: linear-gradient(90deg, var(--gold-dark), var(--gold)); border-radius: 3px; transition: width 1s linear; }
        .selected-bet-display { font-family: 'Cinzel', serif; font-size: 13px; padding: 4px 12px; border-radius: 6px; font-weight: 700; }
        .sel-bull { background: rgba(26,63,168,0.3); border: 1px solid rgba(65,105,225,0.5); color: #7aadff; }
        .sel-bear { background: rgba(192,57,43,0.3); border: 1px solid rgba(231,76,60,0.5); color: #ff7a7a; }
        .sel-none { background: rgba(100,100,100,0.2); border: 1px solid rgba(150,150,150,0.3); color: rgba(200,200,200,0.5); }
        .controls-row { display: flex; gap: 10px; align-items: center; justify-content: center; flex-wrap: wrap; }
        .btn { font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: 1px; padding: 8px 18px; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-weight: 700; }
        .btn-gold { background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: #0a0a0a; }
        .btn-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: rgba(200,200,200,0.7); }
        .btn:hover { filter: brightness(1.2); transform: translateY(-1px); }
        .pip-filter { display: flex; align-items: center; gap: 8px; font-family: 'Cinzel', serif; font-size: 10px; color: rgba(201,168,76,0.7); letter-spacing: 1px; }
        .pip-input { width: 60px; background: rgba(0,0,0,0.4); border: 1px solid rgba(201,168,76,0.3); border-radius: 4px; color: var(--gold-light); font-family: 'Cinzel', serif; font-size: 12px; padding: 4px 8px; text-align: center; }
        .bigroad-grid-wrapper::-webkit-scrollbar { height: 4px; }
        .bigroad-grid-wrapper::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .bigroad-grid-wrapper::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 2px; }
        .history-log { max-height: 100px; overflow-y: auto; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; padding: 8px; }
        .log-entry { font-size: 11px; color: rgba(200,200,200,0.5); padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.03); display: flex; gap: 8px; }
        .log-time { color: rgba(201,168,76,0.4); min-width: 100px; }
        .log-bull { color: #4169e1; font-weight: 700; }
        .log-bear { color: #e74c3c; font-weight: 700; }
        .log-skip { color: rgba(150,150,150,0.5); font-style: italic; }
        .loading-overlay { position: fixed; inset: 0; background: #0a0a0a; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2000; }
        .loading-text { font-family: 'Cinzel', serif; color: var(--gold-light); font-size: 18px; letter-spacing: 4px; animation: pulse-gold 1.5s ease infinite; }
        @keyframes pulse-gold { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        .logout-btn { position: fixed; top: 12px; right: 16px; z-index: 999; font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 1px; padding: 6px 14px; background: rgba(200,50,50,0.3); border: 1px solid rgba(200,50,50,0.4); border-radius: 6px; color: #ff7a7a; cursor: pointer; transition: all 0.2s; }
        .logout-btn:hover { background: rgba(200,50,50,0.5); }
        @media (max-width: 600px) {
          .table-inner { padding: 20px 16px; }
          .betting-layout { flex-direction: column; gap: 8px; }
          .bet-zone-bullish, .bet-zone-bearish { border-radius: 10px; min-width: 200px; }
        }
      `}</style>

      {/* Loading overlay */}
      <div className="loading-overlay" id="loadingOverlay">
        <div className="loading-text">LOADING DATA...</div>
      </div>

      {/* Logout */}
      <button className="logout-btn" id="logoutBtn">LOGOUT</button>

      <div className="casino-wrapper">
        <div className="notification" id="notification"></div>

        <div className="table-outer">
          <div className="table-inner">
            <div className="dragon-left">&#128009;</div>
            <div className="dragon-right">&#128009;</div>
            <div className="table-title">BACCARAT</div>
            <div className="table-subtitle">XAUUSD &middot; BIG ROAD EDITION</div>

            <div className="betting-layout">
              <div className="bet-zone bet-zone-bullish disabled" id="btnBull">
                <div className="zone-icon">&#128200;</div>
                <div className="zone-label">BULLISH</div>
                <div className="zone-sublabel">PLAYER &middot; BUY</div>
              </div>
              <div className="bet-zone-tie">
                <div className="zone-label">TIE</div>
                <div className="zone-sub">SKIP &middot; 8 TO 1</div>
              </div>
              <div className="bet-zone bet-zone-bearish disabled" id="btnBear">
                <div className="zone-icon">&#128201;</div>
                <div className="zone-label">BEARISH</div>
                <div className="zone-sublabel">BANKER &middot; SELL</div>
              </div>
            </div>

            <div className="status-bar">
              <div className="status-item">
                <div className="status-label">ROUND</div>
                <div className="status-value" id="roundNum">&mdash;</div>
              </div>
              <div className="status-item">
                <div className="status-label">PHASE</div>
                <div className="phase-badge phase-waiting" id="phaseBadge">LOADING</div>
              </div>
              <div className="timer-container">
                <svg className="timer-svg" width="70" height="70" viewBox="0 0 70 70">
                  <circle className="timer-track" cx="35" cy="35" r="30"/>
                  <circle className="timer-progress" id="timerRing" cx="35" cy="35" r="30" strokeDasharray="188.5" strokeDashoffset="0"/>
                </svg>
                <div className="timer-text" id="timerText">&mdash;</div>
              </div>
              <div className="status-item">
                <div className="status-label">CANDLE TIME</div>
                <div className="status-value" id="candleTime">&mdash;</div>
              </div>
              <div className="status-item">
                <div className="status-label">SELECTED</div>
                <div className="selected-bet-display sel-none" id="selectedDisplay">NONE</div>
              </div>
              <div className="status-item">
                <div className="status-label">PRICE</div>
                <div className="status-value" id="currentPrice">&mdash;</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ohlc-panel">
          <div><span className="ohlc-label">OPEN</span><span className="ohlc-val" id="ohlcO">&mdash;</span></div>
          <div><span className="ohlc-label">HIGH</span><span className="ohlc-val up" id="ohlcH">&mdash;</span></div>
          <div><span className="ohlc-label">LOW</span><span className="ohlc-val dn" id="ohlcL">&mdash;</span></div>
          <div><span className="ohlc-label">CLOSE</span><span className="ohlc-val" id="ohlcC">&mdash;</span></div>
          <div><span className="ohlc-label">BODY (PIPS)</span><span className="ohlc-val" id="ohlcPips">&mdash;</span></div>
          <div style={{flex:1}}><span className="ohlc-label">CANDLE PROGRESS</span><div className="candle-bar"><div className="candle-bar-fill" id="candleBarFill" style={{width:'0%'}}></div></div></div>
        </div>

        <div className="controls-row">
          <div className="pip-filter"><span>MIN BODY (PIPS):</span><input type="number" className="pip-input" id="pipFilter" defaultValue="1" min="0" max="100"/></div>
          <div className="pip-filter"><span>CANDLE (MIN):</span><input type="number" className="pip-input" id="candleMin" defaultValue="5" min="1" max="60"/></div>
          <div className="pip-filter"><span>BET TIME (MIN):</span><input type="number" className="pip-input" id="betTime" defaultValue="2" min="0.5" max="30" step="0.5"/></div>
          <div className="pip-filter"><span>BG TIME (MIN):</span><input type="number" className="pip-input" id="bgTime" defaultValue="10" min="1" max="60" step="1"/></div>
          <div className="pip-filter">
            <span>SPEED:</span>
            <select className="pip-input" id="speedSelect" style={{width:'auto',padding:'4px 6px'}}>
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="5">5x</option>
              <option value="10">10x</option>
              <option value="30">30x</option>
              <option value="60">60x</option>
              <option value="300">300x</option>
              <option value="0">MAX</option>
            </select>
          </div>
          <button className="btn btn-ghost" id="btnClear">&#128465; Clear</button>
          <button className="btn btn-ghost" id="btnLog">&#128203; Log</button>
        </div>

        <div className="bigroad-section">
          <div className="bigroad-header">
            <div className="bigroad-title">&#11044; BIG ROAD</div>
            <div className="bigroad-stats">
              <span className="stat-bull" id="statBull">WIN: 0</span>
              <span className="stat-bear" id="statBear">LOSS: 0</span>
              <span className="stat-total" id="statTotal">TOTAL: 0</span>
            </div>
          </div>
          <div className="bigroad-grid-wrapper">
            <div className="bigroad-grid" id="bigRoadGrid"></div>
          </div>
        </div>

        <div className="history-log" id="historyLog" style={{display:'none'}}></div>
      </div>

      <script dangerouslySetInnerHTML={{__html: GAME_SCRIPT}} />
    </>
  );
}

// ── All game logic as a string (runs client-side only) ──
const GAME_SCRIPT = `
(function(){
// ─── STATE ───────────────────────────────────────────────────
var allTicks = [];
var candles5m = [];
var currentCandleIdx = 0;
var gameRunning = false;
var tickSimInterval = null;
var countdownInterval = null;
var currentCandle = null;
var selectedBet = null;
var phaseTimer = 0;
var candleDuration = 300;
var bettingWindow = 30;
var roadEntries = [];
var gridMap = {};
var maxColUsed = -1;
var curCol = 0, curRow = 0;
var prevType = null;
var bullCount = 0, bearCount = 0;
var logEntries = [];
var ROWS = 6;

// ─── INIT ────────────────────────────────────────────────────
window.initGame = function() {
  renderBigRoad();
  enableBets(false);
  updatePhase('LOADING', false);

  // Bind click handlers
  document.getElementById('btnBull').addEventListener('click', function(){ placeBet('bull'); });
  document.getElementById('btnBear').addEventListener('click', function(){ placeBet('bear'); });
  document.getElementById('btnClear').addEventListener('click', clearRoad);
  document.getElementById('btnLog').addEventListener('click', toggleLog);
  document.getElementById('logoutBtn').addEventListener('click', function(){
    document.cookie = 'token=; Path=/; Max-Age=0';
    window.location.href = '/';
  });

  // Restart listeners
  document.getElementById('betTime').addEventListener('change', function(){ if(gameRunning){stopGame();startGame();} });
  document.getElementById('bgTime').addEventListener('change', function(){ if(gameRunning){stopGame();startGame();} });
  document.getElementById('candleMin').addEventListener('change', function(){ if(allTicks.length>0){buildCandles(); if(gameRunning){stopGame();startGame();}} });
  document.getElementById('speedSelect').addEventListener('change', function(){ if(gameRunning){clearInterval(tickSimInterval);clearInterval(countdownInterval);runNextCandle();} });

  // Fetch data from protected API
  fetch('/api/data', { credentials: 'same-origin' })
    .then(function(r){
      if(!r.ok) throw new Error('Unauthorized');
      return r.json();
    })
    .then(function(data){
      allTicks = data.ticks.map(function(t){
        return { ts: parseDate(t.t), price: t.p };
      }).filter(function(t){ return t.ts !== null; });

      document.getElementById('loadingOverlay').style.display = 'none';

      if(allTicks.length === 0){
        showNotif('No data', false);
        return;
      }
      buildCandles();
      startGame();
    })
    .catch(function(err){
      document.getElementById('loadingOverlay').style.display = 'none';
      showNotif('Failed to load data: ' + err.message, false);
      updatePhase('ERROR', false);
    });
};

function parseDate(s) {
  try {
    var parts = s.split(' ');
    var dp = parts[0].split('.');
    var tp = parts[1].split(':');
    return new Date(Date.UTC(+dp[0], +dp[1]-1, +dp[2], +tp[0], +tp[1], +tp[2])).getTime();
  } catch(e) { return null; }
}

function buildCandles() {
  candleDuration = parseInt(document.getElementById('candleMin').value) * 60 || 300;
  var ms = candleDuration * 1000;
  candles5m = [];
  if (allTicks.length === 0) return;
  var candle = null;
  for (var i = 0; i < allTicks.length; i++) {
    var tick = allTicks[i];
    var slot = Math.floor(tick.ts / ms) * ms;
    if (!candle || slot !== candle.startTs) {
      if (candle) candles5m.push(candle);
      candle = { open: tick.price, high: tick.price, low: tick.price, close: tick.price, startTs: slot, endTs: slot + ms };
    } else {
      candle.high = Math.max(candle.high, tick.price);
      candle.low = Math.min(candle.low, tick.price);
      candle.close = tick.price;
    }
  }
  if (candle) candles5m.push(candle);
  showNotif('Loaded: ' + allTicks.length.toLocaleString() + ' ticks -> ' + candles5m.length + ' candles', true);
}

// ─── GAME LOOP ───────────────────────────────────────────────
function startGame() {
  if (gameRunning) stopGame();
  currentCandleIdx = 0;
  roadEntries = []; gridMap = {}; maxColUsed = -1;
  curCol = 0; curRow = 0; prevType = null;
  bullCount = 0; bearCount = 0; logEntries = [];
  selectedBet = null; gameRunning = true;
  runNextCandle();
}

function stopGame() {
  clearInterval(tickSimInterval);
  clearInterval(countdownInterval);
  gameRunning = false;
}

function runNextCandle() {
  if (!gameRunning) return;
  if (currentCandleIdx >= candles5m.length) {
    updatePhase('FINISHED', false);
    showNotif('All data processed', true);
    return;
  }
  currentCandle = candles5m[currentCandleIdx];
  selectedBet = null;
  updateSelectedDisplay();

  var candleTicks = allTicks.filter(function(t){ return t.ts >= currentCandle.startTs && t.ts < currentCandle.endTs; });

  var bgMinutes = parseFloat(document.getElementById('bgTime').value) || 10;
  var betMinutes = parseFloat(document.getElementById('betTime').value) || 2;
  var speed = parseFloat(document.getElementById('speedSelect').value);
  var isMaxSpeed = (speed === 0);
  var replayDuration = isMaxSpeed ? 1 : (bgMinutes * 60 * 1000) / speed;
  var betEndAt = isMaxSpeed ? 1 : (betMinutes * 60 * 1000) / speed;
  var startReal = Date.now();

  updateRound(currentCandleIdx + 1);
  updateOHLC(currentCandle);
  document.getElementById('candleBarFill').style.width = '0%';

  var bettingClosed = false;
  var candleClosed = false;
  openBetting();

  clearInterval(tickSimInterval);
  clearInterval(countdownInterval);

  var tickRate = isMaxSpeed ? 10 : Math.max(10, 100 / Math.max(speed, 1));
  tickSimInterval = setInterval(function() {
    var elapsed = Date.now() - startReal;
    var progress = Math.min(elapsed / replayDuration, 1);
    document.getElementById('candleBarFill').style.width = (progress * 100) + '%';

    if (candleTicks.length > 0) {
      var tickPos = Math.floor(progress * (candleTicks.length - 1));
      var tick = candleTicks[Math.min(tickPos, candleTicks.length-1)];
      updatePrice(tick.price, currentCandle);
    }

    if (!bettingClosed && elapsed < betEndAt) {
      var betRemain = Math.max(0, betEndAt - elapsed);
      updateTimerRing(betRemain / betEndAt, isMaxSpeed ? 0 : betRemain / 1000, true);
    }
    if (!bettingClosed && elapsed >= betEndAt) {
      bettingClosed = true;
      enableBets(false);
      updatePhase('WAITING...', false);
      if (!isMaxSpeed) showNotif('Betting closed - waiting...', true);
    }
    if (bettingClosed && !candleClosed) {
      var waitRemain = Math.max(0, replayDuration - elapsed);
      var waitDuration = replayDuration - betEndAt;
      updateTimerRing(waitRemain / waitDuration, isMaxSpeed ? 0 : waitRemain / 1000, false);
    }
    if (progress >= 1 && !candleClosed) {
      candleClosed = true;
      clearInterval(tickSimInterval);
      closeCandle();
    }
  }, tickRate);
}

function openBetting() {
  updatePhase('PLACE YOUR BET!', true);
  enableBets(true);
  showNotif('Place your bet! BULLISH or BEARISH?', true, 'alert');
}

function closeCandle() {
  enableBets(false);
  updatePhase('RESULT', false);
  var c = currentCandle;
  var body = Math.abs(c.close - c.open);
  var bodyPips = body * 10;
  var minPips = parseFloat(document.getElementById('pipFilter').value) || 0;
  var result = null;
  if (bodyPips < minPips || body === 0) { result = null; }
  else if (c.close > c.open) { result = 'bull'; }
  else { result = 'bear'; }

  var timeStr = new Date(c.startTs).toUTCString().slice(5, 22);
  addLog(timeStr, result, bodyPips, selectedBet);

  if (selectedBet !== null && result !== null) {
    var isWin = (selectedBet === result);
    plotBigRoad(isWin ? 'bull' : 'bear');
  }

  selectedBet = null;
  updateSelectedDisplay();

  var spd = parseFloat(document.getElementById('speedSelect').value);
  var pause = spd === 0 ? 0 : Math.max(50, 1200 / (spd || 1));
  currentCandleIdx++;
  setTimeout(function(){ if(gameRunning) runNextCandle(); }, pause);
}

// ─── BIG ROAD (L-pattern / Dragon Tail) ─────────────────────
function plotBigRoad(type) {
  var col, row;
  if (roadEntries.length === 0) { col = 0; row = 0; }
  else if (type === prevType) {
    if (curRow + 1 < ROWS && !gridMap[curCol + "," + (curRow + 1)]) { col = curCol; row = curRow + 1; }
    else { col = curCol + 1; row = curRow; }
  } else { col = maxColUsed + 1; row = 0; }

  roadEntries.push({ type: type, col: col, row: row });
  gridMap[col + "," + row] = type;
  maxColUsed = Math.max(maxColUsed, col);
  curCol = col; curRow = row; prevType = type;
  if (type === 'bull') bullCount++; else bearCount++;
  renderBigRoad(); updateStats();
}

function renderBigRoad() {
  var grid = document.getElementById('bigRoadGrid');
  grid.innerHTML = '';
  var totalCols = Math.max(maxColUsed + 1, 20);
  for (var c = 0; c < totalCols; c++) {
    for (var r = 0; r < ROWS; r++) {
      var cell = document.createElement('div');
      cell.className = 'br-cell';
      cell.style.gridColumn = c + 1;
      cell.style.gridRow = r + 1;
      var type = gridMap[c + "," + r];
      if (type) {
        var circle = document.createElement('div');
        circle.className = 'br-circle ' + (type === 'bull' ? 'br-bull' : 'br-bear');
        circle.textContent = type === 'bull' ? '\\u25B2' : '\\u25BC';
        cell.appendChild(circle);
      }
      grid.appendChild(cell);
    }
  }
  var wrapper = document.querySelector('.bigroad-grid-wrapper');
  wrapper.scrollLeft = wrapper.scrollWidth;
}

// ─── UI HELPERS ──────────────────────────────────────────────
function placeBet(type) {
  var phase = document.getElementById('phaseBadge').textContent;
  if (!phase.includes('BET')) { showNotif('Not betting phase!', false); return; }
  if (!gameRunning) return;
  selectedBet = type;
  updateSelectedDisplay();
  document.getElementById('btnBull').classList.toggle('selected', type === 'bull');
  document.getElementById('btnBear').classList.toggle('selected', type === 'bear');
  showNotif(type === 'bull' ? 'Selected BULLISH!' : 'Selected BEARISH!', true);
}

function updateSelectedDisplay() {
  var el = document.getElementById('selectedDisplay');
  if (!selectedBet) { el.textContent = 'NONE'; el.className = 'selected-bet-display sel-none'; }
  else if (selectedBet === 'bull') { el.textContent = '\\u25B2 BULL'; el.className = 'selected-bet-display sel-bull'; }
  else { el.textContent = '\\u25BC BEAR'; el.className = 'selected-bet-display sel-bear'; }
}

function updateRound(n) { document.getElementById('roundNum').textContent = '#' + n; }

function updatePhase(text, isBetting) {
  var el = document.getElementById('phaseBadge');
  el.textContent = text;
  el.className = 'phase-badge ' + (isBetting ? 'phase-betting' : text === 'FINISHED' ? 'phase-closed' : 'phase-waiting');
}

function updateTimerRing(fraction, sec, isBetting) {
  var circumference = 188.5;
  var offset = circumference * (1 - Math.max(0, Math.min(1, fraction)));
  var ring = document.getElementById('timerRing');
  var text = document.getElementById('timerText');
  ring.style.strokeDashoffset = offset;
  ring.style.stroke = isBetting ? (sec <= 10 ? '#ff6b6b' : '#6bff9e') : '#c9a84c';
  var mins = Math.floor(sec / 60);
  var secs = Math.ceil(sec % 60);
  text.textContent = mins > 0 ? mins + ':' + String(secs).padStart(2, '0') : secs + 's';
  text.style.color = isBetting ? (sec <= 10 ? '#ff6b6b' : '#6bff9e') : '#c9a84c';
}

function updatePrice(price, candle) {
  var el = document.getElementById('currentPrice');
  el.textContent = price.toFixed(3);
  el.className = 'status-value ' + (price >= candle.open ? 'betting-open' : 'alert');
  document.getElementById('ohlcC').textContent = price.toFixed(3);
  document.getElementById('ohlcC').className = 'ohlc-val ' + (price >= candle.open ? 'up' : 'dn');
}

function updateOHLC(c) {
  document.getElementById('ohlcO').textContent = c.open.toFixed(3);
  document.getElementById('ohlcH').textContent = c.high.toFixed(3);
  document.getElementById('ohlcL').textContent = c.low.toFixed(3);
  document.getElementById('ohlcC').textContent = c.close.toFixed(3);
  var pips = (Math.abs(c.close - c.open) * 10).toFixed(1);
  var pipsEl = document.getElementById('ohlcPips');
  pipsEl.textContent = pips;
  pipsEl.className = 'ohlc-val ' + (c.close > c.open ? 'up' : 'dn');
  var dt = new Date(c.startTs);
  document.getElementById('candleTime').textContent = dt.toUTCString().slice(5, 17);
}

function updateStats() {
  document.getElementById('statBull').textContent = 'WIN: ' + bullCount;
  document.getElementById('statBear').textContent = 'LOSS: ' + bearCount;
  document.getElementById('statTotal').textContent = 'TOTAL: ' + (bullCount + bearCount);
}

function enableBets(on) {
  document.getElementById('btnBull').classList.toggle('disabled', !on);
  document.getElementById('btnBear').classList.toggle('disabled', !on);
}

var notifTimeout;
function showNotif(msg, isGood, style) {
  var el = document.getElementById('notification');
  el.textContent = msg;
  el.className = 'notification show' + (style === 'alert' ? ' alert-bet' : '');
  clearTimeout(notifTimeout);
  notifTimeout = setTimeout(function(){ el.classList.remove('show'); }, 3000);
}

function addLog(time, result, pips, bet) {
  logEntries.unshift({ time: time, result: result, pips: pips.toFixed(1), bet: bet });
  if (logEntries.length > 50) logEntries.pop();
  renderLog();
}

function renderLog() {
  var log = document.getElementById('historyLog');
  log.innerHTML = logEntries.map(function(e) {
    var resClass = e.result === 'bull' ? 'log-bull' : e.result === 'bear' ? 'log-bear' : 'log-skip';
    var resText = e.result === 'bull' ? '\\u25B2 BULL' : e.result === 'bear' ? '\\u25BC BEAR' : '\\u2014 SKIP';
    var betText = e.bet ? (e.bet === 'bull' ? '\\u25B2' : '\\u25BC') : '\\u2717';
    var plotted = e.bet && e.result ? '\\u2713 PLOT' : '\\u2717';
    return '<div class="log-entry"><span class="log-time">' + e.time + '</span><span class="' + resClass + '">' + resText + '</span><span style="color:rgba(200,200,200,0.4)">BODY:' + e.pips + 'p</span><span style="color:rgba(201,168,76,0.5)">BET:' + betText + '</span><span style="color:rgba(100,200,100,0.5)">' + plotted + '</span></div>';
  }).join('');
}

function clearRoad() {
  roadEntries = []; gridMap = {}; maxColUsed = -1;
  curCol = 0; curRow = 0; prevType = null;
  bullCount = 0; bearCount = 0;
  renderBigRoad(); updateStats();
}

function toggleLog() {
  var log = document.getElementById('historyLog');
  log.style.display = log.style.display === 'none' ? 'block' : 'none';
}

})();
`;
