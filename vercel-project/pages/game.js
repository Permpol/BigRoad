import { useEffect } from 'react';
import Head from 'next/head';
import '../styles/game.css';

/* ═══════════════════════════════════════════════════════════════
   GAME PAGE  — protected by middleware.js (JWT cookie required)
   CSS        — styles/game.css
   Data       — fetched from /api/data (server-side CSV → JSON)
   ═══════════════════════════════════════════════════════════════ */
export default function GamePage() {

  /* ── mount: wire anti-copy + boot game ── */
  useEffect(() => {
    // block right-click
    const noCtx = e => e.preventDefault();
    document.addEventListener('contextmenu', noCtx);

    // block devtools / save / print shortcuts
    const noKey = e => {
      if (e.key === 'F12') { e.preventDefault(); return; }
      if (e.ctrlKey && e.shiftKey && 'IJC'.includes(e.key.toUpperCase())) { e.preventDefault(); return; }
      if (e.ctrlKey && 'USP'.includes(e.key.toUpperCase())) { e.preventDefault(); return; }
    };
    document.addEventListener('keydown', noKey);

    // block drag
    const noDrag = e => e.preventDefault();
    document.addEventListener('dragstart', noDrag);

    // devtools detector (debugger-timing trick)
    const dbg = setInterval(() => {
      const t = performance.now(); debugger;
      if (performance.now() - t > 100) {
        document.body.innerHTML = '<div style="color:#ff6b6b;font-size:24px;text-align:center;margin-top:40vh;font-family:monospace">Access Denied</div>';
        clearInterval(dbg);
      }
    }, 4000);

    // boot game engine
    if (typeof window !== 'undefined') window.__bootGame();

    return () => {
      clearInterval(dbg);
      document.removeEventListener('contextmenu', noCtx);
      document.removeEventListener('keydown', noKey);
      document.removeEventListener('dragstart', noDrag);
    };
  }, []);

  /* ── JSX (same HTML structure as original) ── */
  return (<>
    <Head>
      <title>XAUUSD Big Road — Baccarat Style</title>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
    </Head>

    {/* loading overlay */}
    <div className="loading-overlay" id="loadingOverlay">
      <div className="loading-text">LOADING DATA...</div>
    </div>

    {/* logout */}
    <button className="logout-btn" id="logoutBtn">LOGOUT</button>

    <div className="casino-wrapper">
      <div className="notification" id="notification"></div>

      {/* ── CASINO TABLE ── */}
      <div className="table-outer"><div className="table-inner">
        <div className="dragon-left">&#128009;</div>
        <div className="dragon-right">&#128009;</div>
        <div className="table-title">BACCARAT</div>
        <div className="table-subtitle">XAUUSD &middot; BIG ROAD EDITION</div>

        {/* betting */}
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

        {/* status bar */}
        <div className="status-bar">
          <div className="status-item"><div className="status-label">ROUND</div><div className="status-value" id="roundNum">&mdash;</div></div>
          <div className="status-item"><div className="status-label">PHASE</div><div className="phase-badge phase-waiting" id="phaseBadge">LOADING</div></div>
          <div className="timer-container">
            <svg className="timer-svg" width="70" height="70" viewBox="0 0 70 70">
              <circle className="timer-track" cx="35" cy="35" r="30"/>
              <circle className="timer-progress" id="timerRing" cx="35" cy="35" r="30" strokeDasharray="188.5" strokeDashoffset="0"/>
            </svg>
            <div className="timer-text" id="timerText">&mdash;</div>
          </div>
          <div className="status-item"><div className="status-label">CANDLE TIME</div><div className="status-value" id="candleTime">&mdash;</div></div>
          <div className="status-item"><div className="status-label">SELECTED</div><div className="selected-bet-display sel-none" id="selectedDisplay">NONE</div></div>
          <div className="status-item"><div className="status-label">PRICE</div><div className="status-value" id="currentPrice">&mdash;</div></div>
        </div>
      </div></div>

      {/* ── OHLC ── */}
      <div className="ohlc-panel">
        <div><span className="ohlc-label">OPEN</span><span className="ohlc-val" id="ohlcO">&mdash;</span></div>
        <div><span className="ohlc-label">HIGH</span><span className="ohlc-val up" id="ohlcH">&mdash;</span></div>
        <div><span className="ohlc-label">LOW</span><span className="ohlc-val dn" id="ohlcL">&mdash;</span></div>
        <div><span className="ohlc-label">CLOSE</span><span className="ohlc-val" id="ohlcC">&mdash;</span></div>
        <div><span className="ohlc-label">BODY (PIPS)</span><span className="ohlc-val" id="ohlcPips">&mdash;</span></div>
        <div style={{flex:1}}><span className="ohlc-label">CANDLE PROGRESS</span><div className="candle-bar"><div className="candle-bar-fill" id="candleBarFill" style={{width:'0%'}}></div></div></div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="controls-row">
        <div className="pip-filter"><span>MIN BODY (PIPS):</span><input type="number" className="pip-input" id="pipFilter" defaultValue="1" min="0" max="100"/></div>
        <div className="pip-filter"><span>CANDLE (MIN):</span><input type="number" className="pip-input" id="candleMin" defaultValue="5" min="1" max="60"/></div>
        <div className="pip-filter"><span>BET TIME (MIN):</span><input type="number" className="pip-input" id="betTime" defaultValue="2" min="0.5" max="30" step="0.5"/></div>
        <div className="pip-filter"><span>BG TIME (MIN):</span><input type="number" className="pip-input" id="bgTime" defaultValue="10" min="1" max="60" step="1"/></div>
        <div className="pip-filter">
          <span>SPEED:</span>
          <select className="pip-input" id="speedSelect" style={{width:'auto',padding:'4px 6px'}}>
            <option value="1">1x</option><option value="2">2x</option>
            <option value="5">5x</option><option value="10">10x</option>
            <option value="30">30x</option><option value="60">60x</option>
            <option value="300">300x</option><option value="0">MAX</option>
          </select>
        </div>
        <button className="btn btn-ghost" id="btnClear">Clear</button>
        <button className="btn btn-ghost" id="btnLog">Log</button>
      </div>

      {/* ── BIG ROAD ── */}
      <div className="bigroad-section">
        <div className="bigroad-header">
          <div className="bigroad-title">&#11044; BIG ROAD</div>
          <div className="bigroad-stats">
            <span className="stat-bull" id="statBull">WIN: 0</span>
            <span className="stat-bear" id="statBear">LOSS: 0</span>
            <span className="stat-total" id="statTotal">TOTAL: 0</span>
          </div>
        </div>
        <div className="bigroad-grid-wrapper"><div className="bigroad-grid" id="bigRoadGrid"></div></div>
      </div>

      {/* log */}
      <div className="history-log" id="historyLog" style={{display:'none'}}></div>
    </div>

    {/* ═══ GAME ENGINE (inline — Next.js will minify in production) ═══ */}
    <script dangerouslySetInnerHTML={{__html: ENGINE}} />
  </>);
}

/* ═══════════════════════════════════════════════════════════════════
   All game logic lives here as a single string so Next.js ships it
   as inline <script> and minifies in prod.  No separate .js to steal.
   ═══════════════════════════════════════════════════════════════════ */
const ENGINE = `(function(){
"use strict";

/* ─── STATE ─────────────────────────────────────── */
var allTicks=[], candles5m=[], currentCandleIdx=0,
    gameRunning=false, tickSimInterval=null, countdownInterval=null,
    currentCandle=null, selectedBet=null, candleDuration=300,
    roadEntries=[], gridMap={}, maxColUsed=-1,
    curCol=0, curRow=0, prevType=null,
    bullCount=0, bearCount=0, logEntries=[], ROWS=6, notifTO;

/* ─── BOOT ──────────────────────────────────────── */
window.__bootGame = function(){
  renderBigRoad(); enableBets(false);
  updatePhase('LOADING',false);

  $('btnBull').addEventListener('click',function(){ placeBet('bull'); });
  $('btnBear').addEventListener('click',function(){ placeBet('bear'); });
  $('btnClear').addEventListener('click', clearRoad);
  $('btnLog').addEventListener('click', toggleLog);
  $('logoutBtn').addEventListener('click',function(){
    document.cookie='token=; Path=/; Max-Age=0';
    location.href='/';
  });

  // restart on param change
  $('betTime').addEventListener('change',function(){ if(gameRunning){stopGame();startGame();} });
  $('bgTime').addEventListener('change',function(){ if(gameRunning){stopGame();startGame();} });
  $('candleMin').addEventListener('change',function(){ if(allTicks.length){buildCandles(); if(gameRunning){stopGame();startGame();}} });
  $('speedSelect').addEventListener('change',function(){ if(gameRunning){clearInterval(tickSimInterval);clearInterval(countdownInterval);runNextCandle();} });

  // fetch data from protected API
  fetch('/api/data',{credentials:'same-origin'})
    .then(function(r){ if(!r.ok) throw new Error('Unauthorized'); return r.json(); })
    .then(function(d){
      allTicks = d.ticks.map(function(t){ return {ts:parseDate(t.t), price:t.p}; })
                        .filter(function(t){ return t.ts!==null; });
      $('loadingOverlay').style.display='none';
      if(!allTicks.length){ showNotif('No data',false); return; }
      buildCandles(); startGame();
    })
    .catch(function(e){
      $('loadingOverlay').style.display='none';
      showNotif('Load failed: '+e.message,false);
      updatePhase('ERROR',false);
    });
};

function $(id){ return document.getElementById(id); }

/* ─── DATE PARSE ────────────────────────────────── */
function parseDate(s){
  try{
    var p=s.split(' '),d=p[0].split('.'),t=p[1].split(':');
    return new Date(Date.UTC(+d[0],+d[1]-1,+d[2],+t[0],+t[1],+t[2])).getTime();
  }catch(e){return null;}
}

/* ─── BUILD CANDLES ─────────────────────────────── */
function buildCandles(){
  candleDuration = parseInt($('candleMin').value)*60||300;
  var ms=candleDuration*1000; candles5m=[];
  if(!allTicks.length) return;
  var c=null;
  for(var i=0;i<allTicks.length;i++){
    var tk=allTicks[i], slot=Math.floor(tk.ts/ms)*ms;
    if(!c||slot!==c.startTs){
      if(c) candles5m.push(c);
      c={open:tk.price,high:tk.price,low:tk.price,close:tk.price,startTs:slot,endTs:slot+ms};
    } else {
      c.high=Math.max(c.high,tk.price);
      c.low=Math.min(c.low,tk.price);
      c.close=tk.price;
    }
  }
  if(c) candles5m.push(c);
  showNotif('Loaded: '+allTicks.length.toLocaleString()+' ticks \\u2192 '+candles5m.length+' candles',true);
}

/* ─── GAME LOOP ─────────────────────────────────── */
function startGame(){
  if(gameRunning) stopGame();
  currentCandleIdx=0; roadEntries=[]; gridMap={}; maxColUsed=-1;
  curCol=0; curRow=0; prevType=null;
  bullCount=0; bearCount=0; logEntries=[];
  selectedBet=null; gameRunning=true;
  runNextCandle();
}
function stopGame(){ clearInterval(tickSimInterval); clearInterval(countdownInterval); gameRunning=false; }

function runNextCandle(){
  if(!gameRunning) return;
  if(currentCandleIdx>=candles5m.length){ updatePhase('FINISHED',false); showNotif('All data processed',true); return; }

  currentCandle=candles5m[currentCandleIdx];
  selectedBet=null; updateSelectedDisplay();

  var candleTicks=allTicks.filter(function(t){ return t.ts>=currentCandle.startTs && t.ts<currentCandle.endTs; });

  var bgMin=parseFloat($('bgTime').value)||10,
      betMin=parseFloat($('betTime').value)||2,
      spd=parseFloat($('speedSelect').value),
      isMax=(spd===0),
      total=isMax?1:(bgMin*60000)/spd,
      betEnd=isMax?1:(betMin*60000)/spd,
      t0=Date.now();

  updateRound(currentCandleIdx+1); updateOHLC(currentCandle);
  $('candleBarFill').style.width='0%';

  var betClosed=false, done=false;
  openBetting();

  clearInterval(tickSimInterval); clearInterval(countdownInterval);

  var rate=isMax?10:Math.max(10,100/Math.max(spd,1));
  tickSimInterval=setInterval(function(){
    var el=Date.now()-t0, prog=Math.min(el/total,1);
    $('candleBarFill').style.width=(prog*100)+'%';

    if(candleTicks.length>0){
      var pos=Math.floor(prog*(candleTicks.length-1));
      updatePrice(candleTicks[Math.min(pos,candleTicks.length-1)].price, currentCandle);
    }

    // Phase 1: betting
    if(!betClosed && el<betEnd){
      var r=Math.max(0,betEnd-el);
      updateTimerRing(r/betEnd, isMax?0:r/1000, true);
    }
    // close betting
    if(!betClosed && el>=betEnd){
      betClosed=true; enableBets(false);
      updatePhase('WAITING...',false);
      if(!isMax) showNotif('Betting closed \\u2014 waiting...',true);
    }
    // Phase 2: waiting
    if(betClosed && !done){
      var wr=Math.max(0,total-el), wd=total-betEnd;
      updateTimerRing(wr/wd, isMax?0:wr/1000, false);
    }
    // result
    if(prog>=1 && !done){ done=true; clearInterval(tickSimInterval); closeCandle(); }
  }, rate);
}

function openBetting(){
  updatePhase('PLACE YOUR BET!',true); enableBets(true);
  showNotif('\\u26A1 Place your bet! BULLISH or BEARISH?',true,'alert');
}

function closeCandle(){
  enableBets(false); updatePhase('RESULT',false);
  var c=currentCandle, body=Math.abs(c.close-c.open),
      pips=body*10, minP=parseFloat($('pipFilter').value)||0,
      result=null;
  if(pips<minP||body===0) result=null;
  else if(c.close>c.open) result='bull';
  else result='bear';

  addLog(new Date(c.startTs).toUTCString().slice(5,22), result, pips, selectedBet);

  // plot WIN=bull / LOSS=bear
  if(selectedBet!==null && result!==null){
    plotBigRoad(selectedBet===result ? 'bull' : 'bear');
  }

  selectedBet=null; updateSelectedDisplay();

  var sp=parseFloat($('speedSelect').value),
      pause=sp===0?0:Math.max(50,1200/(sp||1));
  currentCandleIdx++;
  setTimeout(function(){ if(gameRunning) runNextCandle(); }, pause);
}

/* ─── BIG ROAD  (L-pattern / Dragon Tail) ───────── */
function plotBigRoad(type){
  var col,row;
  if(!roadEntries.length){ col=0; row=0; }
  else if(type===prevType){
    if(curRow+1<ROWS && !gridMap[curCol+','+(curRow+1)]){ col=curCol; row=curRow+1; }
    else { col=curCol+1; row=curRow; }
  } else { col=maxColUsed+1; row=0; }

  roadEntries.push({type:type,col:col,row:row});
  gridMap[col+','+row]=type;
  maxColUsed=Math.max(maxColUsed,col);
  curCol=col; curRow=row; prevType=type;
  if(type==='bull') bullCount++; else bearCount++;
  renderBigRoad(); updateStats();
}

function renderBigRoad(){
  var g=$('bigRoadGrid'); g.innerHTML='';
  var cols=Math.max(maxColUsed+1,20);
  for(var c=0;c<cols;c++) for(var r=0;r<ROWS;r++){
    var cell=document.createElement('div');
    cell.className='br-cell'; cell.style.gridColumn=c+1; cell.style.gridRow=r+1;
    var tp=gridMap[c+','+r];
    if(tp){
      var ci=document.createElement('div');
      ci.className='br-circle '+(tp==='bull'?'br-bull':'br-bear');
      ci.textContent=tp==='bull'?'\\u25B2':'\\u25BC';
      cell.appendChild(ci);
    }
    g.appendChild(cell);
  }
  document.querySelector('.bigroad-grid-wrapper').scrollLeft=99999;
}

/* ─── UI HELPERS ────────────────────────────────── */
function placeBet(type){
  if(!$('phaseBadge').textContent.includes('BET')){ showNotif('Not betting phase!',false); return; }
  if(!gameRunning) return;
  selectedBet=type; updateSelectedDisplay();
  $('btnBull').classList.toggle('selected',type==='bull');
  $('btnBear').classList.toggle('selected',type==='bear');
  showNotif(type==='bull'?'Selected BULLISH!':'Selected BEARISH!',true);
}

function updateSelectedDisplay(){
  var e=$('selectedDisplay');
  if(!selectedBet){ e.textContent='NONE'; e.className='selected-bet-display sel-none'; }
  else if(selectedBet==='bull'){ e.textContent='\\u25B2 BULL'; e.className='selected-bet-display sel-bull'; }
  else { e.textContent='\\u25BC BEAR'; e.className='selected-bet-display sel-bear'; }
}

function updateRound(n){ $('roundNum').textContent='#'+n; }
function updatePhase(t,b){
  var e=$('phaseBadge'); e.textContent=t;
  e.className='phase-badge '+(b?'phase-betting':t==='FINISHED'?'phase-closed':'phase-waiting');
}
function updateTimerRing(frac,sec,bet){
  var o=188.5*(1-Math.max(0,Math.min(1,frac))),
      ring=$('timerRing'), txt=$('timerText');
  ring.style.strokeDashoffset=o;
  ring.style.stroke=bet?(sec<=10?'#ff6b6b':'#6bff9e'):'#c9a84c';
  var m=Math.floor(sec/60), s=Math.ceil(sec%60);
  txt.textContent=m>0?m+':'+String(s).padStart(2,'0'):s+'s';
  txt.style.color=bet?(sec<=10?'#ff6b6b':'#6bff9e'):'#c9a84c';
}
function updatePrice(p,c){
  var e=$('currentPrice'); e.textContent=p.toFixed(3);
  e.className='status-value '+(p>=c.open?'betting-open':'alert');
  $('ohlcC').textContent=p.toFixed(3);
  $('ohlcC').className='ohlc-val '+(p>=c.open?'up':'dn');
}
function updateOHLC(c){
  $('ohlcO').textContent=c.open.toFixed(3);
  $('ohlcH').textContent=c.high.toFixed(3);
  $('ohlcL').textContent=c.low.toFixed(3);
  $('ohlcC').textContent=c.close.toFixed(3);
  var p=(Math.abs(c.close-c.open)*10).toFixed(1), pe=$('ohlcPips');
  pe.textContent=p; pe.className='ohlc-val '+(c.close>c.open?'up':'dn');
  $('candleTime').textContent=new Date(c.startTs).toUTCString().slice(5,17);
}
function updateStats(){
  $('statBull').textContent='WIN: '+bullCount;
  $('statBear').textContent='LOSS: '+bearCount;
  $('statTotal').textContent='TOTAL: '+(bullCount+bearCount);
}
function enableBets(on){
  $('btnBull').classList.toggle('disabled',!on);
  $('btnBear').classList.toggle('disabled',!on);
}
function showNotif(msg,ok,sty){
  var e=$('notification'); e.textContent=msg;
  e.className='notification show'+(sty==='alert'?' alert-bet':'');
  clearTimeout(notifTO);
  notifTO=setTimeout(function(){ e.classList.remove('show'); },3000);
}
function addLog(time,result,pips,bet){
  logEntries.unshift({time:time,result:result,pips:pips.toFixed(1),bet:bet});
  if(logEntries.length>50) logEntries.pop();
  renderLog();
}
function renderLog(){
  $('historyLog').innerHTML=logEntries.map(function(e){
    var rc=e.result==='bull'?'log-bull':e.result==='bear'?'log-bear':'log-skip',
        rt=e.result==='bull'?'\\u25B2 BULL':e.result==='bear'?'\\u25BC BEAR':'\\u2014 SKIP',
        bt=e.bet?(e.bet==='bull'?'\\u25B2':'\\u25BC'):'\\u2717',
        pl=e.bet&&e.result?'\\u2713 PLOT':'\\u2717';
    return '<div class="log-entry"><span class="log-time">'+e.time+'</span><span class="'+rc+'">'+rt+'</span><span style="color:rgba(200,200,200,.4)">BODY:'+e.pips+'p</span><span style="color:rgba(201,168,76,.5)">BET:'+bt+'</span><span style="color:rgba(100,200,100,.5)">'+pl+'</span></div>';
  }).join('');
}
function clearRoad(){
  roadEntries=[]; gridMap={}; maxColUsed=-1;
  curCol=0; curRow=0; prevType=null;
  bullCount=0; bearCount=0;
  renderBigRoad(); updateStats();
}
function toggleLog(){
  var l=$('historyLog');
  l.style.display=l.style.display==='none'?'block':'none';
}

})();`;
