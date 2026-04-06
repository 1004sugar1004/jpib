import React, { useEffect, useRef } from 'react';

interface RhythmTrainingGameProps {
  soundEnabled: boolean;
}

export const RhythmTrainingGame = ({ soundEnabled }: RhythmTrainingGameProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = ''; // Clear previous content to prevent duplication
    
    // Inject Styles
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
      .rhythm-game-container {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        background: #000;
        font-family: 'Orbitron', monospace;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
        user-select: none;
        position: relative;
      }
      .rhythm-game-wrap {
        position: relative;
        width: 440px;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: scale(var(--base-scale, 0.75));
        transform-origin: center center;
      }
      @media (min-width: 768px) and (min-height: 800px) {
        .rhythm-game-wrap {
          --base-scale: 1;
        }
      }
      @media (max-height: 640px) {
        .rhythm-game-wrap {
          --base-scale: 0.65;
        }
      }
      .rhythm-game-wrap::before {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,200,.01) 2px,rgba(0,255,200,.01) 4px);
        pointer-events: none;
        z-index: 100;
      }

      .screen {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,.97);
        z-index: 50;
        gap: 4px;
        padding: 10px 0;
      }
      .gtitle {
        font-size: 32px;
        font-weight: 900;
        background: linear-gradient(135deg,#f0f,#0ff,#ff0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: 4px;
        text-align: center;
        animation: tp 2s ease-in-out infinite;
        margin-bottom: 0px;
      }
      @keyframes tp {
        0%,100% { filter:brightness(1) }
        50% { filter:brightness(1.5) }
      }
      .sub {
        color: #888;
        font-size: 12px;
        letter-spacing: 4px;
        font-family: 'Share Tech Mono', monospace;
        margin-bottom: 4px;
      }

      .song-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 390px;
        margin-top: 0px;
      }
      .sc {
        padding: 8px 14px;
        border: 1px solid #1a1a1a;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: all .2s;
        background: rgba(255,255,255,.02);
      }
      .sc.sel {
        border-color: #0ff;
        background: rgba(0,255,255,.06);
        box-shadow: 0 0 14px rgba(0,255,255,.12);
      }
      .sc:hover:not(.sel) {
        border-color: #333;
      }
      .sn {
        font-size: 18px;
        font-weight: 900;
        color: #222;
        min-width: 26px;
      }
      .sc.sel .sn {
        color: #0ff;
      }
      .si {
        flex: 1;
      }
      .sname {
        font-size: 16px;
        font-weight: 700;
        color: #aaa;
        letter-spacing: 2px;
        margin-bottom: 2px;
      }
      .sc.sel .sname {
        color: #fff;
      }
      .smeta {
        font-size: 12px;
        color: #444;
        letter-spacing: 2px;
        font-family: 'Share Tech Mono', monospace;
      }
      .sc.sel .smeta {
        color: #0ff6;
      }

      .diff-section {
        width: 390px;
      }
      .diff-title {
        font-size: 12px;
        letter-spacing: 4px;
        color: #666;
        margin-bottom: 12px;
        font-family: 'Share Tech Mono', monospace;
      }
      .diff-row {
        display: flex;
        gap: 5px;
        width: 100%;
      }
      .dbtn {
        flex: 1;
        padding: 10px 4px;
        background: transparent;
        border: 1px solid #222;
        color: #444;
        font-family: 'Orbitron', monospace;
        font-size: 8px;
        letter-spacing: 1px;
        cursor: pointer;
        transition: all .2s;
        text-align: center;
      }
      .dbtn .dlabel {
        font-size: 14px;
        font-weight: 700;
        display: block;
        margin-bottom: 3px;
      }
      .dbtn .dstars {
        font-size: 14px;
        display: block;
        letter-spacing: 1px;
      }
      .dbtn .ddesc {
        font-size: 11px;
        display: block;
        margin-top: 3px;
        opacity: .6;
        font-family: 'Share Tech Mono', monospace;
      }

      .dbtn[data-d="beginner"].act { border-color: #4af; color: #4af; background: rgba(68,170,255,.08); box-shadow: 0 0 10px rgba(68,170,255,.3); }
      .dbtn[data-d="easy"].act { border-color: #4f8; color: #4f8; background: rgba(68,255,136,.08); box-shadow: 0 0 10px rgba(68,255,136,.3); }
      .dbtn[data-d="normal"].act { border-color: #ff0; color: #ff0; background: rgba(255,255,0,.06); box-shadow: 0 0 10px rgba(255,255,0,.3); }
      .dbtn[data-d="hard"].act { border-color: #f80; color: #f80; background: rgba(255,136,0,.08); box-shadow: 0 0 10px rgba(255,136,0,.3); }
      .dbtn[data-d="expert"].act { border-color: #f44; color: #f44; background: rgba(255,68,68,.08); box-shadow: 0 0 10px rgba(255,68,68,.3); }

      #diff-info {
        width: 390px;
        padding: 12px 16px;
        background: rgba(255,255,255,.03);
        border: 1px solid #1a1a1a;
        font-family: 'Share Tech Mono', monospace;
        font-size: 13px;
        letter-spacing: 2px;
        color: #666;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      #diff-info .di-left { display: flex; flex-direction: column; gap: 3px; }
      #diff-info .di-name { font-size: 16px; font-weight: 700; }
      #diff-info .di-bar { height: 3px; background: #111; width: 120px; border-radius: 2px; margin-top: 4px; }
      #diff-info .di-fill { height: 100%; border-radius: 2px; transition: width .3s; }

      .sbtn {
        padding: 14px 40px;
        background: transparent;
        border: 2px solid #0ff;
        color: #0ff;
        font-family: 'Orbitron', monospace;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: 4px;
        cursor: pointer;
        transition: all .2s;
        animation: bp 1.5s ease-in-out infinite;
      }
      @keyframes bp {
        0%,100% { box-shadow: 0 0 8px #0ff, inset 0 0 8px rgba(0,255,255,.1) }
        50% { box-shadow: 0 0 24px #0ff, inset 0 0 20px rgba(0,255,255,.2) }
      }
      .sbtn:hover { background: rgba(0,255,255,.1); transform: scale(1.04); }
      .sbtn.mag { border-color: #f0f; color: #f0f; animation: none; }
      .sbtn.mag:hover { background: rgba(255,0,255,.1); }

      #statusBar { font-family: 'Share Tech Mono', monospace; font-size: 14px; letter-spacing: 2px; height: 18px; color: #666; }
      #statusBar.ok { color: #4f4; }

      #np {
        width: 100%;
        padding: 8px 12px;
        background: linear-gradient(90deg,rgba(255,0,255,.08),rgba(0,255,255,.08));
        border: 1px solid #111;
        border-bottom: none;
        display: none;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        letter-spacing: 2px;
        color: #666;
        font-family: 'Share Tech Mono', monospace;
      }
      .npdot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #f0f;
        box-shadow: 0 0 5px #f0f;
        animation: nb 1s ease-in-out infinite;
      }
      @keyframes nb { 0%,100% { opacity: 1 } 50% { opacity: .2 } }
      #npt { color: #fff; font-size: 14px; font-weight: 700; flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
      #diff-badge { font-size: 11px; letter-spacing: 2px; padding: 3px 8px; border: 1px solid currentColor; }
      #backInGame { padding: 6px 12px; background: transparent; border: 1px solid #2a2a2a; color: #666; font-family: 'Orbitron', monospace; font-size: 10px; letter-spacing: 2px; cursor: pointer; transition: all .2s; white-space: nowrap; }
      #backInGame:hover { border-color: #f44; color: #f44; }

      #hud { width: 100%; display: flex; justify-content: space-between; align-items: flex-end; padding: 8px 8px 4px; background: #000; }
      .hl { font-size: 8px; letter-spacing: 3px; color: #333; margin-bottom: 2px; }
      .hv { font-size: 26px; font-weight: 900; text-shadow: 0 0 10px currentColor; }
      #sd .hv { color: #0ff; }
      #cd { text-align: center; }
      #cd .hv { color: #f0f; font-size: 34px; }
      #md { text-align: right; }
      #md .hv { color: #fa0; font-size: 20px; }

      #pb { width: 100%; height: 3px; background: #111; }
      #pf { height: 100%; width: 0%; transition: width .08s linear; }

      #field { position: relative; width: 440px; height: 500px; background: linear-gradient(180deg,#000 0%,#050510 60%,#000008 100%); border: 1px solid #0a0a1a; overflow: hidden; }
      .ll { position: absolute; top: 0; bottom: 0; width: 1px; background: #0d0d1a; }
      .hz { position: absolute; bottom: 70px; left: 0; right: 0; height: 2px; background: rgba(255,255,255,.08); }

      .tgt { 
        position: absolute; 
        bottom: 50px; 
        width: 86px; 
        height: 80px; 
        display: flex; 
        flex-direction: column;
        align-items: center; 
        justify-content: center; 
        opacity: .3; 
        font-size: 44px; 
        transition: opacity .06s, transform .06s, background .1s; 
        filter: drop-shadow(0 0 4px currentColor);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .tgt.act { opacity: 1; transform: scale(1.1); background: rgba(255, 255, 255, 0.15); }
      .key-label {
        position: absolute;
        bottom: -20px;
        font-size: 12px;
        font-weight: bold;
        opacity: 0.6;
      }
      .tgt[data-k="L"] { left: 8px; color: #f4f; }
      .tgt[data-k="D"] { left: 118px; color: #4ff; }
      .tgt[data-k="U"] { left: 228px; color: #4f8; }
      .tgt[data-k="R"] { left: 338px; color: #fd4; }

      .arr { position: absolute; width: 78px; height: 54px; display: flex; align-items: center; justify-content: center; font-size: 42px; pointer-events: none; }
      .arr[data-k="L"] { left: 12px; color: #f4f; filter: drop-shadow(0 0 8px #f0f); }
      .arr[data-k="D"] { left: 122px; color: #4ff; filter: drop-shadow(0 0 8px #0ff); }
      .arr[data-k="U"] { left: 232px; color: #4f8; filter: drop-shadow(0 0 8px #0f8); }
      .arr[data-k="R"] { left: 342px; color: #fd4; filter: drop-shadow(0 0 8px #fa0); }

      .lf { position: absolute; top: 0; bottom: 0; width: 108px; opacity: 0; pointer-events: none; transition: opacity .07s; }
      .lf[data-k="L"] { left: 0; background: radial-gradient(ellipse,rgba(255,68,255,.2),transparent); }
      .lf[data-k="D"] { left: 110px; background: radial-gradient(ellipse,rgba(68,255,255,.2),transparent); }
      .lf[data-k="U"] { left: 220px; background: radial-gradient(ellipse,rgba(68,255,136,.2),transparent); }
      .lf[data-k="R"] { left: 330px; background: radial-gradient(ellipse,rgba(255,221,68,.2),transparent); }
      .lf.act { opacity: 1; }

      #judge { position: absolute; bottom: 135px; left: 0; right: 0; text-align: center; font-size: 24px; font-weight: 900; letter-spacing: 4px; pointer-events: none; opacity: 0; z-index: 10; }
      #judge.perfect { color: #ff0; text-shadow: 0 0 20px #ff0; }
      #judge.great { color: #0ff; text-shadow: 0 0 20px #0ff; }
      #judge.good { color: #0f8; text-shadow: 0 0 20px #0f8; }
      #judge.miss { color: #f44; text-shadow: 0 0 20px #f44; }
      @keyframes ja { 0% { opacity: 1; transform: scale(1.3) translateY(0) } 70% { opacity: 1; transform: scale(1) translateY(-8px) } 100% { opacity: 0; transform: scale(.9) translateY(-18px) } }
      #judge.show { animation: ja .5s ease forwards; }
      
      #ready-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.5);
        z-index: 20;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s;
      }
      #ready-text {
        font-family: 'Orbitron', sans-serif;
        font-size: 60px;
        font-weight: 900;
        color: #0ff;
        text-shadow: 0 0 20px #0ff;
        transform: scale(0.5);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      #ready-overlay.show { opacity: 1; }
      #ready-overlay.show #ready-text { transform: scale(1); }
      #ready-overlay.show ~ .game-key-hint { 
        opacity: 1 !important; 
        transform: scale(1.2); 
        color: #fff;
        text-shadow: 0 0 10px #0ff;
      }

      .game-key-hint {
        position: absolute;
        bottom: 10px;
        left: 0;
        right: 0;
        text-align: center;
        font-family: 'Share Tech Mono', monospace;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.3);
        letter-spacing: 2px;
        pointer-events: none;
        z-index: 5;
        animation: hint-fade 3s ease-in-out infinite;
        transition: all 0.3s;
      }
      @keyframes hint-fade {
        0%, 100% { opacity: 0.1; }
        50% { opacity: 0.4; }
      }

      #sr { width: 100%; display: flex; justify-content: space-around; padding: 5px 0; font-size: 9px; letter-spacing: 2px; color: #222; font-family: 'Share Tech Mono', monospace; background: #000; }
      .sp { color: #ff06 } .sg { color: #0ff6 } .so { color: #0f86 } .sm { color: #f446 }

      .got { font-size: 40px; font-weight: 900; color: #f0f; letter-spacing: 6px; text-shadow: 0 0 30px #f0f; }
      .gosong { font-family: 'Share Tech Mono', monospace; font-size: 14px; color: #666; letter-spacing: 2px; margin-top: 8px; }
      .go-diff-badge { font-size: 12px; letter-spacing: 3px; padding: 4px 12px; border: 1px solid currentColor; font-family: 'Orbitron', monospace; margin-top: 8px; }
      .gosc { font-size: 52px; font-weight: 900; color: #fff; text-shadow: 0 0 20px #0ff; margin: 10px 0; }
      .gograde { font-size: 84px; font-weight: 900; animation: gg 1s ease-in-out infinite alternate; }
      @keyframes gg { from { text-shadow: 0 0 20px currentColor; filter: brightness(1) } to { text-shadow: 0 0 60px currentColor; filter: brightness(1.5) } }
      .gS { color: #fd0 } .gA { color: #0fc } .gB { color: #48f } .gC { color: #f80 } .gD { color: #f44 }
      
      @keyframes msgIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      #go-message.show { animation: msgIn 0.5s ease forwards; }
      .gost { font-family: 'Share Tech Mono', monospace; font-size: 13px; color: #777; text-align: center; line-height: 1.6; letter-spacing: 1px; margin-bottom: 15px; }
      .gost span { color: #fff }

      .kg { display: flex; gap: 10px; margin-top: 4px; }
      .key-instruction {
        margin-top: 8px;
        padding: 6px 12px;
        background: rgba(0, 255, 255, 0.05);
        border: 1px dashed rgba(0, 255, 255, 0.3);
        border-radius: 12px;
        color: #0ff;
        font-family: 'Share Tech Mono', monospace;
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        animation: pulse-glow 2s infinite;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.1);
      }
      @keyframes pulse-glow {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.02); }
      }
      .ki { display: flex; align-items: center; gap: 6px; font-family: 'Share Tech Mono', monospace; font-size: 13px; color: #555; }
      .kb { padding: 4px 8px; border: 1px solid #1e1e1e; font-size: 15px; color: #777; }
      #bd { width: 7px; height: 7px; border-radius: 50%; background: #f0f; box-shadow: 0 0 5px #f0f; display: inline-block; margin-left: 4px; vertical-align: middle; opacity: .2; transition: opacity .05s; }

      /* Visual Enhancements */
      @keyframes comboPop {
        0% { transform: scale(1); }
        50% { transform: scale(1.4); color: #fff; }
        100% { transform: scale(1); }
      }
      .combo-pop { animation: comboPop 0.15s ease-out; }

      @keyframes feverPulse {
        0% { box-shadow: inset 0 0 20px rgba(255,0,255,0.2); }
        50% { box-shadow: inset 0 0 60px rgba(255,0,255,0.5), 0 0 20px rgba(0,255,255,0.3); }
        100% { box-shadow: inset 0 0 20px rgba(255,0,255,0.2); }
      }
      #field.fever { animation: feverPulse 1s infinite; border-color: #f0f; }

      @keyframes shake {
        0% { transform: translate(0,0) scale(var(--base-scale, 0.75)); }
        25% { transform: translate(-4px, 4px) scale(var(--base-scale, 0.75)); }
        50% { transform: translate(4px, -4px) scale(var(--base-scale, 0.75)); }
        75% { transform: translate(-4px, -4px) scale(var(--base-scale, 0.75)); }
        100% { transform: translate(0,0) scale(var(--base-scale, 0.75)); }
      }
      .shake-anim { animation: shake 0.15s ease-in-out; }

      .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 20;
        animation: partFade 0.6s ease-out forwards;
      }
      @keyframes partFade {
        to { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
      }

      @keyframes splash {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(2); opacity: 0; }
      }
      .splash {
        position: absolute;
        inset: 0;
        border: 4px solid #f0f;
        border-radius: 50%;
        pointer-events: none;
        animation: splash 0.5s ease-out forwards;
        z-index: 30;
      }
    `;
    container.appendChild(style);

    // Inject HTML
    const wrap = document.createElement('div');
    wrap.className = 'rhythm-game-wrap';
    wrap.innerHTML = `
      <div class="screen" id="ts">
        <div class="gtitle">DDR<br>REMIX</div>
        <div class="sub">증평초 스페셜 에디션</div>
        <div class="song-list" id="sl"></div>
        <div class="diff-section">
          <div class="diff-title">▸ DIFFICULTY SELECT</div>
          <div class="diff-row">
            <button class="dbtn" data-d="beginner"><span class="dlabel">BEGINNER</span><span class="dstars" style="color:#4af">★☆☆☆☆</span><span class="ddesc">처음이에요</span></button>
            <button class="dbtn act" data-d="easy"><span class="dlabel">EASY</span><span class="dstars" style="color:#4f8">★★☆☆☆</span><span class="ddesc">한 번 해봤어요</span></button>
            <button class="dbtn" data-d="normal"><span class="dlabel">NORMAL</span><span class="dstars" style="color:#ff0">★★★☆☆</span><span class="ddesc">자신 있어요</span></button>
            <button class="dbtn" data-d="hard"><span class="dlabel">HARD</span><span class="dstars" style="color:#f80">★★★★☆</span><span class="ddesc">빠르게!</span></button>
            <button class="dbtn" data-d="expert"><span class="dlabel">EXPERT</span><span class="dstars" style="color:#f44">★★★★★</span><span class="ddesc">😈 각오해</span></button>
          </div>
        </div>
        <div id="diff-info">
          <div class="di-left">
            <span id="di-name" class="di-name" style="color:#4f8">EASY</span>
            <span id="di-desc" style="font-size:9px;">단독 노트 위주 · 여유있는 속도</span>
            <div class="di-bar"><div class="di-fill" id="di-fill" style="width:40%;background:#4f8"></div></div>
          </div>
          <span id="di-speed" style="font-size:11px;color:#555;">속도 ★★</span>
        </div>
        <div id="statusBar">곡을 선택하세요</div>
        <button class="sbtn" id="startBtn">▶ START</button>
        <div class="key-instruction">
          ⌨️ 키보드(방향키 또는 WASD)나 📱 화면을 터치하여 플레이하세요!
        </div>
        <div class="kg">
          <div class="ki"><span class="kb">←/A</span><span style="color:#f4f">LEFT</span></div>
          <div class="ki"><span class="kb">↓/S</span><span style="color:#4ff">DOWN</span></div>
          <div class="ki"><span class="kb">↑/W</span><span style="color:#4f8">UP</span></div>
          <div class="ki"><span class="kb">→/D</span><span style="color:#fd4">RIGHT</span></div>
        </div>
      </div>
      <div class="screen" id="gs" style="display:none">
        <div class="got">STAGE CLEAR</div>
        <div id="gosong" class="gosong"></div>
        <div id="go-diff-badge" class="go-diff-badge" style="color:#4f8">EASY</div>
        <div id="gograde" class="gograde gS">S</div>
        <div id="go-message" style="font-size: 18px; font-weight: bold; margin-bottom: 10px; text-align: center; font-family: 'Share Tech Mono', monospace;"></div>
        <div id="gosc" class="gosc">000000</div>
        <div id="gost" class="gost"></div>
        <button class="sbtn" id="retryBtn">▶ RETRY</button>
        <button class="sbtn mag" id="backBtn">◀ SONG SELECT</button>
      </div>
      <div id="np">
        <div class="npdot"></div>
        <div>NOW PLAYING</div>
        <div id="npt">-</div>
        <div id="diff-badge" style="color:#4f8">EASY</div>
        <button id="backInGame">✕ 나가기</button>
      </div>
      <div id="hud">
        <div id="sd"><div class="hl">SCORE</div><div class="hv" id="sv">000000</div></div>
        <div id="cd"><div class="hl">COMBO <span id="bd"></span></div><div class="hv" id="cv">0</div></div>
        <div id="md"><div class="hl">MAX</div><div class="hv" id="mv">0</div></div>
      </div>
      <div id="pb"><div id="pf"></div></div>
      <div id="field">
        <div class="ll" style="left:110px"></div>
        <div class="ll" style="left:220px"></div>
        <div class="ll" style="left:330px"></div>
        <div class="lf" data-k="L"></div>
        <div class="lf" data-k="D"></div>
        <div class="lf" data-k="U"></div>
        <div class="lf" data-k="R"></div>
        <div class="hz"></div>
        <div class="tgt" data-k="L">◄<span class="key-label">L</span></div>
        <div class="tgt" data-k="D">▼<span class="key-label">D</span></div>
        <div class="tgt" data-k="U">▲<span class="key-label">U</span></div>
        <div class="tgt" data-k="R">►<span class="key-label">R</span></div>
        <div id="ready-overlay"><div id="ready-text">READY</div></div>
        <div class="game-key-hint">⌨️ 방향키/WASD 또는 📱 터치</div>
        <div id="judge"></div>
      </div>
      <div id="sr">
        <span class="sp">PERFECT <span id="cp">0</span></span>
        <span class="sg">GREAT <span id="cg">0</span></span>
        <span class="so">GOOD <span id="co">0</span></span>
        <span class="sm">MISS <span id="cm">0</span></span>
      </div>
    `;
    container.appendChild(wrap);

    // Game Logic
    const DIFFS: any = {
      beginner: { label:'BEGINNER', color:'#4af', speedLabel:'속도 ★', desc:'단독 노트만 · 아주 느린 속도', barW:'20%', barColor:'#4af', speed:3.0, density:0.28, subdivision:1, maxSimul:1, win:{perfect:60,great:100,good:160} },
      easy: { label:'EASY', color:'#4f8', speedLabel:'속도 ★★', desc:'단독 노트 위주 · 여유있는 속도', barW:'40%', barColor:'#4f8', speed:4.5, density:0.38, subdivision:1, maxSimul:1, win:{perfect:45,great:80,good:130} },
      normal: { label:'NORMAL', color:'#ff0', speedLabel:'속도 ★★★', desc:'점프 포함 · 중간 속도 · 8분음표 일부', barW:'60%', barColor:'#ff0', speed:6.0, density:0.55, subdivision:0.75, maxSimul:2, win:{perfect:35,great:65,good:110} },
      hard: { label:'HARD', color:'#f80', speedLabel:'속도 ★★★★', desc:'빠른 속도 · 8분음표 다수 · 3노트 동시', barW:'80%', barColor:'#f80', speed:7.8, density:0.70, subdivision:0.5, maxSimul:3, win:{perfect:28,great:52,good:90} },
      expert: { label:'EXPERT', color:'#f44', speedLabel:'속도 ★★★★★', desc:'최고속 · 16분음표 · 풀콤보 각오', barW:'100%', barColor:'#f44', speed:10.5, density:0.85, subdivision:0.25, maxSimul:4, win:{perfect:20,great:40,good:70} },
    };

    const SONGS = [
      { name:'우리들의 Super Power', bpm:93.8, offset:550, url:'https://ik.imagekit.io/foefnjeua/%EC%9A%B0%EB%A6%AC%EB%93%A4%EC%9D%98%20Super%20Power.mp3?updatedAt=1773797977356' },
      { name:'개념송 (Remastered)', bpm:111.9, offset:450, url:'https://ik.imagekit.io/foefnjeua/%EA%B0%9C%EB%85%90%EC%86%A1%20(Remastered).mp3?updatedAt=1774403985367' },
      { name:'ATL 기능', bpm:90, offset:350, url:'https://ik.imagekit.io/foefnjeua/ATL%20%EB%8B%A4%EC%84%AF%20%EA%B0%80%EC%A7%80%20%ED%9E%98.mp3?updatedAt=1774403985153' },
    ];

    const GLOBAL_OFFSET = -15; // Fine-tune sync (negative means notes come earlier)

    const KMAP: any = {
      ArrowLeft: 'L', ArrowDown: 'D', ArrowUp: 'U', ArrowRight: 'R',
      a: 'L', s: 'D', w: 'U', d: 'R',
      A: 'L', S: 'D', W: 'U', D: 'R',
      f: 'D', j: 'U', k: 'R',
      F: 'D', J: 'U', K: 'R'
    };
    const KSYM: any = {L:'◄',D:'▼',U:'▲',R:'►'};
    const FIELD_H = 500, HIT_Y = 430;

    let diff = 'easy', selIdx = 0;
    let audio: any = null, songDur = 90;
    let running = false, noteQ: any[] = [], animId: any = null;
    let score = 0, combo = 0, maxCombo = 0;
    let cnt = {perfect:0,great:0,good:0,miss:0};
    let audioStartTime = 0, lastBeat = -1;
    let lastAudioTime = 0, lastAudioUpdate = 0;

    const sl = wrap.querySelector('#sl')!;
    SONGS.forEach((s,i) => {
      const d = document.createElement('div');
      d.className = 'sc' + (i===0 ? ' sel' : '');
      d.innerHTML = `<div class="sn">${String(i+1).padStart(2,'0')}</div>
        <div class="si"><div class="sname">${s.name}</div>
        <div class="smeta">BPM ${s.bpm} · 증평초 스페셜</div></div>`;
      d.addEventListener('click', () => selectSong(i));
      sl.appendChild(d);
    });

    function selectSong(i: number) {
      selIdx = i;
      wrap.querySelectorAll('.sc').forEach((c,j) => c.classList.toggle('sel', j===i));
      wrap.querySelector('#statusBar')!.className = 'ok';
      wrap.querySelector('#statusBar')!.textContent = '▶ ' + SONGS[i].name + ' 선택됨';
    }

    function updateDiffInfo(d: string) {
      const cfg = DIFFS[d];
      (wrap.querySelector('#di-name') as HTMLElement).textContent = cfg.label;
      (wrap.querySelector('#di-name') as HTMLElement).style.color = cfg.color;
      (wrap.querySelector('#di-desc') as HTMLElement).textContent = cfg.desc;
      (wrap.querySelector('#di-fill') as HTMLElement).style.width = cfg.barW;
      (wrap.querySelector('#di-fill') as HTMLElement).style.background = cfg.barColor;
      (wrap.querySelector('#di-speed') as HTMLElement).textContent = cfg.speedLabel;
      (wrap.querySelector('#di-speed') as HTMLElement).style.color = cfg.color;
    }

    wrap.querySelectorAll('.dbtn').forEach(b => {
      b.addEventListener('click', () => {
        wrap.querySelectorAll('.dbtn').forEach(x => x.classList.remove('act'));
        b.classList.add('act');
        diff = (b as HTMLElement).dataset.d!;
        updateDiffInfo(diff);
      });
    });

    function getSongMs() {
      if (audio && !audio.paused && audio.currentTime > 0) {
        if (audio.currentTime !== lastAudioTime) {
          lastAudioTime = audio.currentTime;
          lastAudioUpdate = performance.now();
        }
        return (lastAudioTime * 1000) + (performance.now() - lastAudioUpdate) + GLOBAL_OFFSET;
      }
      return (performance.now() - audioStartTime) + GLOBAL_OFFSET;
    }

    function genNotes(song: any, dur: number, d: string) {
      const cfg = DIFFS[d];
      const beatMs = 60000 / song.bpm;
      const offset = song.offset;
      const totalBeats = Math.floor((dur * 1000 - offset) / beatMs);
      const travelMs = (FIELD_H / cfg.speed) * (1000 / 60);
      const ks = ['L','D','U','R'];
      const notes = [];
      let b = 4;

      while (b < totalBeats - 4) {
        if (Math.random() < cfg.density) {
          let lanes = [];
          const r = Math.random();
          if (cfg.maxSimul === 1) lanes = [Math.floor(Math.random() * 4)];
          else if (cfg.maxSimul === 2) {
            if (r < 0.70) lanes = [Math.floor(Math.random() * 4)];
            else { const a = Math.floor(Math.random() * 4); lanes = [a, (a+2)%4]; }
          } else if (cfg.maxSimul === 3) {
            if (r < 0.40) lanes = [Math.floor(Math.random() * 4)];
            else if (r < 0.80) { const a = Math.floor(Math.random() * 4); lanes = [a, (a+1)%4]; }
            else { const skip = Math.floor(Math.random() * 4); lanes = [0,1,2,3].filter(x => x!==skip); }
          } else {
            if (r < 0.20) lanes = [Math.floor(Math.random() * 4)];
            else if (r < 0.50) { const a = Math.floor(Math.random() * 4); lanes = [a, (a+1)%4]; }
            else if (r < 0.80) { const skip = Math.floor(Math.random() * 4); lanes = [0,1,2,3].filter(x => x!==skip); }
            else lanes = [0,1,2,3];
          }
          const hitAt = offset + b * beatMs;
          const spawnAt = hitAt - travelMs;
          for (const ln of lanes)
            notes.push({k:ks[ln], spawnAt, hitAt, hit:false, missed:false, el:null});
        }
        const step = cfg.subdivision;
        if (step >= 1) b += 1;
        else if (step >= 0.5) b += (Math.random() < 0.5 ? 0.5 : 1);
        else b += (Math.random() < 0.6 ? 0.5 : Math.random() < 0.5 ? 0.25 : 1);
      }
      return notes;
    }

    function spawnArrow(n: any) {
      const el = document.createElement('div');
      el.className = 'arr'; el.dataset.k = n.k;
      el.textContent = KSYM[n.k]; el.style.top = '-60px';
      wrap.querySelector('#field')!.appendChild(el);
      n.el = el;
    }

    function spawnParticles(k: string, color: string) {
      const field = wrap.querySelector('#field')!;
      const tgt = wrap.querySelector(`.tgt[data-k="${k}"]`) as HTMLElement;
      if (!tgt) return;
      const rect = tgt.getBoundingClientRect();
      const fRect = field.getBoundingClientRect();
      const centerX = rect.left - fRect.left + rect.width / 2;
      const centerY = rect.top - fRect.top + rect.height / 2;

      for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.backgroundColor = color;
        p.style.left = centerX + 'px';
        p.style.top = centerY + 'px';
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 60;
        p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        field.appendChild(p);
        setTimeout(() => p.remove(), 600);
      }
    }

    function showJudge(type: string) {
      const j = wrap.querySelector('#judge')!;
      j.className = ''; j.textContent = ''; void (j as HTMLElement).offsetWidth;
      (j as HTMLElement).textContent = ({perfect:'PERFECT!',great:'GREAT',good:'GOOD',miss:'MISS'} as any)[type];
      j.className = type + ' show';

      if (type === 'perfect') {
        wrap.classList.add('shake-anim');
        setTimeout(() => wrap.classList.remove('shake-anim'), 150);
      }
    }

    function flashLane(k: string) {
      const fl = wrap.querySelector(`.lf[data-k="${k}"]`);
      const tg = wrap.querySelector(`.tgt[data-k="${k}"]`);
      if (fl) { fl.classList.add('act'); setTimeout(() => fl.classList.remove('act'), 100); }
      if (tg) { tg.classList.add('act'); setTimeout(() => tg.classList.remove('act'), 100); }
    }

    function addScore(type: string, k?: string) {
      const pts: any = {perfect:1000, great:700, good:300, miss:0};
      const colors: any = {perfect:'#ff0', great:'#0ff', good:'#0f8', miss:'#f44'};
      (cnt as any)[type]++;
      
      const field = wrap.querySelector('#field')!;
      const comboEl = wrap.querySelector('#cv')!;

      if (type === 'miss') {
        combo = 0;
        field.classList.remove('fever');
      } else {
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        score += pts[type] * (1 + Math.floor(combo/10) * .1);
        
        // Combo Effects
        comboEl.classList.remove('combo-pop');
        void (comboEl as HTMLElement).offsetWidth;
        comboEl.classList.add('combo-pop');

        if (k) spawnParticles(k, colors[type]);

        if (combo >= 10) field.classList.add('fever');
        
        if (combo > 0 && combo % 5 === 0) {
          const splash = document.createElement('div');
          splash.className = 'splash';
          field.appendChild(splash);
          setTimeout(() => splash.remove(), 500);
        }
      }
      updateHUD(); showJudge(type);
    }

    function updateHUD() {
      wrap.querySelector('#sv')!.textContent = String(Math.floor(score)).padStart(6,'0');
      wrap.querySelector('#cv')!.textContent = String(combo);
      wrap.querySelector('#mv')!.textContent = String(maxCombo);
      wrap.querySelector('#cp')!.textContent = String(cnt.perfect);
      wrap.querySelector('#cg')!.textContent = String(cnt.great);
      wrap.querySelector('#co')!.textContent = String(cnt.good);
      wrap.querySelector('#cm')!.textContent = String(cnt.miss);
    }

    const handleInput = (k: string) => {
      if (!running || !k) return;
      flashLane(k);
      const nowMs = getSongMs();
      const cfg = DIFFS[diff];
      let best = null, bDiff = Infinity;
      for (const n of noteQ) {
        if (n.k !== k || n.hit || n.missed) continue;
        const dd = Math.abs(n.hitAt - nowMs);
        if (dd < bDiff) { bDiff = dd; best = n; }
      }
      if (!best) return;
      if (bDiff <= cfg.win.perfect) { best.hit=true; addScore('perfect', k); if(best.el) best.el.remove(); }
      else if (bDiff <= cfg.win.great) { best.hit=true; addScore('great', k); if(best.el) best.el.remove(); }
      else if (bDiff <= cfg.win.good) { best.hit=true; addScore('good', k); if(best.el) best.el.remove(); }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = KMAP[e.key];
      if (k) {
        e.preventDefault();
        handleInput(k);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Add touch support to target elements
    wrap.querySelectorAll('.tgt').forEach(el => {
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const k = (el as HTMLElement).dataset.k;
        if (k) handleInput(k);
      });
      // Also add click for mouse users on tablet-like devices
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const k = (el as HTMLElement).dataset.k;
        if (k) handleInput(k);
      });
    });

    function loop() {
      const nowMs = getSongMs();
      const durMs = songDur * 1000;
      (wrap.querySelector('#pf') as HTMLElement).style.width = Math.min(nowMs / durMs * 100, 100) + '%';

      const song = SONGS[selIdx];
      const beatMs = 60000 / song.bpm;
      const curBeat = Math.floor((nowMs - song.offset) / beatMs);
      if (curBeat !== lastBeat && curBeat >= 0) {
        lastBeat = curBeat;
        const dot = wrap.querySelector('#bd') as HTMLElement;
        dot.style.opacity = '1';
        setTimeout(() => dot.style.opacity = '.2', 80);
      }

      const cfg = DIFFS[diff];
      const trav = (FIELD_H / cfg.speed) * (1000 / 60);
      for (const n of noteQ) {
        if (n.hit || n.missed) continue;
        if (!n.el && nowMs >= n.spawnAt) spawnArrow(n);
        if (n.el) {
          const frac = 1 - (n.hitAt - nowMs) / trav;
          n.el.style.top = (frac * (HIT_Y + 60) - 60) + 'px';
          if (nowMs > n.hitAt + cfg.win.good) {
            n.missed = true;
            n.el.style.opacity = '0';
            setTimeout(() => { if (n.el) n.el.remove(); }, 150);
            addScore('miss');
          }
        }
      }

      const ended = audio
        ? (audio.ended || (isFinite(audio.duration) && audio.currentTime >= audio.duration - 0.3))
        : nowMs >= durMs;
      if (ended || nowMs >= durMs + 500) { endGame(); return; }
      animId = requestAnimationFrame(loop);
    }

    function startGame() {
      score=0; combo=0; maxCombo=0; lastBeat=-1;
      lastAudioTime=0; lastAudioUpdate=0;
      cnt = {perfect:0, great:0, good:0, miss:0};
      wrap.querySelectorAll('.arr').forEach(e => e.remove());
      wrap.querySelector('#judge')!.className = '';
      wrap.querySelector('#judge')!.textContent = '';
      (wrap.querySelector('#pf') as HTMLElement).style.width = '0%';

      // Ready Overlay
      const readyOverlay = wrap.querySelector('#ready-overlay')!;
      const readyText = wrap.querySelector('#ready-text')!;
      readyOverlay.classList.add('show');
      readyText.textContent = 'READY';
      setTimeout(() => {
        readyText.textContent = 'GO!';
        setTimeout(() => {
          readyOverlay.classList.remove('show');
        }, 800);
      }, 1200);

      const cfg = DIFFS[diff];
      (wrap.querySelector('#pf') as HTMLElement).style.background = `linear-gradient(90deg,${cfg.color},#0ff)`;
      (wrap.querySelector('#pf') as HTMLElement).style.boxShadow = `0 0 6px ${cfg.color}`;
      updateHUD();

      const song = SONGS[selIdx];
      if (audio) { try { audio.pause(); audio.src = ''; } catch(e) {} }
      audio = new Audio(song.url);
      audio.volume = soundEnabled ? 0.9 : 0;

      songDur = 180; // Default estimate
      let played = false;
      const doPlay = () => {
        if (played) return; played = true;
        audio.play().then(() => {
          audioStartTime = performance.now() - audio.currentTime * 1000;
        }).catch(() => { audioStartTime = performance.now(); });
        if (isFinite(audio.duration) && audio.duration > 0) songDur = audio.duration;
        audio.addEventListener('durationchange', () => { if (audio.duration > 0) songDur = audio.duration; });
      };
      if (audio.readyState >= 3) doPlay();
      else audio.addEventListener('canplay', doPlay, {once:true});
      setTimeout(() => { if (!played) doPlay(); }, 1200);

      audioStartTime = performance.now();
      // Generate notes for a long duration (600s) to ensure they don't stop early
      noteQ = genNotes(song, 600, diff); 

      wrap.querySelector('#diff-badge')!.textContent = cfg.label;
      (wrap.querySelector('#diff-badge') as HTMLElement).style.color = cfg.color;
      (wrap.querySelector('#ts') as HTMLElement).style.display = 'none';
      (wrap.querySelector('#gs') as HTMLElement).style.display = 'none';
      (wrap.querySelector('#np') as HTMLElement).style.display = 'flex';
      wrap.querySelector('#npt')!.textContent = song.name;

      running = true;
      if (animId) cancelAnimationFrame(animId);
      animId = requestAnimationFrame(loop);
    }

    function endGame() {
      running = false;
      if (animId) cancelAnimationFrame(animId);
      if (audio) { try { audio.pause(); audio.src = ''; } catch(e) {} }
      (wrap.querySelector('#np') as HTMLElement).style.display = 'none';

      const total = cnt.perfect + cnt.great + cnt.good + cnt.miss;
      const pct = total > 0 ? ((cnt.perfect + cnt.great + cnt.good) / total * 100) : 0;
      let grade, cls, msg;
      if (pct >= 95) { grade='S'; cls='gS'; msg='PERFECT! 당신은 리듬의 신!'; }
      else if (pct >= 85) { grade='A'; cls='gA'; msg='GREAT! 대단한 실력이에요!'; }
      else if (pct >= 70) { grade='B'; cls='gB'; msg='GOOD! 조금만 더 연습해봐요!'; }
      else if (pct >= 50) { grade='C'; cls='gC'; msg='NICE! 나쁘지 않은 실력이에요!'; }
      else { grade='D'; cls='gD'; msg='BAD! 다시 한번 도전해볼까요?'; }

      const cfg = DIFFS[diff];
      (wrap.querySelector('#go-diff-badge') as HTMLElement).textContent = cfg.label;
      (wrap.querySelector('#go-diff-badge') as HTMLElement).style.color = cfg.color;
      wrap.querySelector('#gograde')!.textContent = grade;
      wrap.querySelector('#gograde')!.className = 'gograde ' + cls;
      wrap.querySelector('#go-message')!.textContent = msg;
      wrap.querySelector('#go-message')!.className = cls + ' show';
      wrap.querySelector('#gosc')!.textContent = String(Math.floor(score)).padStart(6,'0');
      wrap.querySelector('#gosong')!.textContent = '♫ ' + SONGS[selIdx].name;
      wrap.querySelector('#gost')!.innerHTML =
        `PERFECT: <span>${cnt.perfect}</span> &nbsp; GREAT: <span>${cnt.great}</span><br>` +
        `GOOD: <span>${cnt.good}</span> &nbsp;&nbsp; MISS: <span>${cnt.miss}</span><br>` +
        `MAX COMBO: <span>${maxCombo}</span> &nbsp; ACCURACY: <span>${pct.toFixed(1)}%</span>`;
      (wrap.querySelector('#gs') as HTMLElement).style.display = 'flex';
    }

    function goTitle() {
      running = false;
      if (animId) cancelAnimationFrame(animId);
      if (audio) { try { audio.pause(); audio.src = ''; } catch(e) {} audio = null; }
      wrap.querySelectorAll('.arr').forEach(e => e.remove());
      (wrap.querySelector('#np') as HTMLElement).style.display = 'none';
      (wrap.querySelector('#gs') as HTMLElement).style.display = 'none';
      (wrap.querySelector('#ts') as HTMLElement).style.display = 'flex';
      (wrap.querySelector('#pf') as HTMLElement).style.width = '0%';
    }

    wrap.querySelector('#startBtn')!.addEventListener('click', startGame);
    wrap.querySelector('#retryBtn')!.addEventListener('click', () => { (wrap.querySelector('#gs') as HTMLElement).style.display='none'; startGame(); });
    wrap.querySelector('#backBtn')!.addEventListener('click', goTitle);
    wrap.querySelector('#backInGame')!.addEventListener('click', () => {
      if (confirm('게임을 종료하고 곡 선택으로 돌아갈까요?')) goTitle();
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animId) cancelAnimationFrame(animId);
      if (audio) { try { audio.pause(); audio.src = ''; } catch(e) {} }
      container.innerHTML = '';
    };
  }, [soundEnabled]);

  return (
    <div ref={containerRef} className="rhythm-game-container" />
  );
};
