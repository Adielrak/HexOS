// ============================================================
//  HEXOS — main.js
// ============================================================

// ── Audio ─────────────────────────────────────────────────
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function getAudioCtx() { if (!audioCtx) audioCtx = new AudioCtx(); return audioCtx; }

function playClick() {
  try {
    const ctx = getAudioCtx();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.setValueAtTime(1100, ctx.currentTime);
    g.gain.setValueAtTime(0.035, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
    o.start(); o.stop(ctx.currentTime + 0.035);
  } catch (_) {}
}

function playError() {
  try {
    const ctx = getAudioCtx();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'square';
    o.frequency.setValueAtTime(160, ctx.currentTime);
    g.gain.setValueAtTime(0.07, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    o.start(); o.stop(ctx.currentTime + 0.28);
  } catch (_) {}
}

function playBoot() {
  try {
    const ctx = getAudioCtx();
    [200, 300, 450, 600, 750, 500, 350, 1000].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.11);
      g.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.11);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.11 + 0.09);
      o.start(ctx.currentTime + i * 0.11);
      o.stop(ctx.currentTime + i * 0.11 + 0.11);
    });
  } catch (_) {}
}

// ── Boot sequence ─────────────────────────────────────────
const BOOT_LINES = [
  '██╗  ██╗███████╗██╗  ██╗ ██████╗ ███████╗',
  '██║  ██║██╔════╝╚██╗██╔╝██╔═══██╗██╔════╝',
  '███████║█████╗   ╚███╔╝ ██║   ██║███████╗',
  '██╔══██║██╔══╝   ██╔██╗ ██║   ██║╚════██║',
  '██║  ██║███████╗██╔╝ ██╗╚██████╔╝███████║',
  '╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝',
  '',
  'HEXOS v1.0 — CYBER TERMINAL ENVIRONMENT',
  '──────────────────────────────────────────',
  '[  OK  ] Initialising kernel modules...',
  '[  OK  ] Mounting encrypted partitions...',
  '[  OK  ] Loading neural interface drivers...',
  '[  OK  ] Connecting to shadow network...',
  '[  OK  ] Calibrating retinal scanners...',
  '[ WARN ] Anomalous signal detected on port 31337',
  '[  OK  ] Firewall rules applied (IPv6 tunnelled)',
  '[  OK  ] Allocating memory matrix...',
  '',
  '>>> ACCESS GRANTED <<<',
  '>>> WELCOME, OPERATIVE <<<',
  '',
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function typeText(el, text, delay = 20) {
  return new Promise(resolve => {
    let i = 0;
    function next() {
      if (i >= text.length) { resolve(); return; }
      el.textContent += text[i++];
      el.scrollTop = el.scrollHeight;
      setTimeout(next, delay + Math.random() * 6);
    }
    next();
  });
}

async function runBoot() {
  const el = document.getElementById('boot-text');
  playBoot();
  for (const line of BOOT_LINES) {
    await typeText(el, line + '\n', line.startsWith('█') ? 3 : 18);
  }
  await sleep(400);
  document.getElementById('boot-screen').classList.add('hidden');
  document.getElementById('terminal-input').focus();
  startClock();
  startMetrics();
  startIdleTimer();
  // show welcome window after a brief pause
  setTimeout(() => openApp('welcome'), 300);
}

// ── Clock ─────────────────────────────────────────────────
function startClock() {
  const el = document.getElementById('taskbar-time');
  function tick() {
    const n = new Date();
    el.textContent = n.toLocaleTimeString('en-GB', { hour12: false });
  }
  tick(); setInterval(tick, 1000);
}

// ── Fake CPU / NET metrics ────────────────────────────────
function startMetrics() {
  const cpuVal  = document.getElementById('metric-cpu-val');
  const cpuFill = document.getElementById('metric-cpu-fill');
  const netVal  = document.getElementById('metric-net-val');
  const netFill = document.getElementById('metric-net-fill');

  let cpu = 18, net = 32;

  setInterval(() => {
    // random walk
    cpu = Math.min(99, Math.max(4,  cpu + (Math.random() * 14 - 7)));
    net = Math.min(99, Math.max(2,  net + (Math.random() * 20 - 10)));

    if (cpuVal)  cpuVal.textContent  = `${Math.round(cpu)}%`;
    if (cpuFill) cpuFill.style.width = `${cpu}%`;
    if (netVal)  netVal.textContent  = `${Math.round(net * 1.3)}KB/s`;
    if (netFill) netFill.style.width = `${net}%`;
  }, 1200);
}

// ── Idle / screensaver ────────────────────────────────────
let idleTimer = null;
const IDLE_MS = 30_000;

function startIdleTimer() {
  ['mousemove','keydown','click','scroll'].forEach(e =>
    document.addEventListener(e, resetIdle));
  resetIdle();
}

function resetIdle() {
  clearTimeout(idleTimer);
  hideMatrix();
  idleTimer = setTimeout(showMatrix, IDLE_MS);
}

function showMatrix() {
  document.getElementById('matrix-canvas').classList.add('active');
  document.getElementById('screensaver-hint').classList.add('active');
  startMatrixRain();
}

function hideMatrix() {
  document.getElementById('matrix-canvas').classList.remove('active');
  document.getElementById('screensaver-hint').classList.remove('active');
  stopMatrixRain();
}

// ── Matrix rain ───────────────────────────────────────────
let matrixRafId = null;

function startMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const cols  = Math.floor(canvas.width / 16);
  const drops = Array(cols).fill(1);
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>[]{}|\\'.split('');

  function draw() {
    ctx.fillStyle = 'rgba(10,10,18,0.14)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.shadowBlur = 6; ctx.shadowColor = '#05d9e8';
      ctx.fillStyle = '#ffffff'; ctx.font = '14px monospace';
      ctx.fillText(char, i * 16, y * 16);
      ctx.fillStyle = '#05d9e8';
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, (y - 1) * 16);
      if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
    matrixRafId = requestAnimationFrame(draw);
  }
  draw();
}

function stopMatrixRain() {
  if (matrixRafId) { cancelAnimationFrame(matrixRafId); matrixRafId = null; }
  const c = document.getElementById('matrix-canvas');
  c.getContext('2d').clearRect(0, 0, c.width, c.height);
}

// ── Window manager ────────────────────────────────────────
let zCounter = 10;
const windows = {};   // id → { el, minimised, title }

function updateTaskbarPills() {
  const bar = document.getElementById('taskbar-windows');
  bar.innerHTML = '';
  Object.entries(windows).forEach(([id, w]) => {
    const pill = document.createElement('button');
    pill.className = 'taskbar-pill';
    pill.textContent = w.title;
    pill.addEventListener('click', () => {
      if (w.minimised) {
        w.minimised = false;
        w.el.querySelector('.window-body').style.display = '';
        w.el.style.height = '';
      }
      focusWindow(id);
    });
    bar.appendChild(pill);
  });
}

function createWindow(id, title, content, { width = 480, height = 320, x, y } = {}) {
  if (windows[id]) { focusWindow(id); return; }

  const container = document.getElementById('window-container');
  const rect = container.getBoundingClientRect();
  const wx = x ?? 60 + Math.random() * Math.max(0, rect.width  - width  - 80);
  const wy = y ?? 40 + Math.random() * Math.max(0, rect.height - height - 60);

  const win = document.createElement('div');
  win.className = 'os-window';
  win.id = `win-${id}`;
  win.style.cssText = `width:${width}px;height:${height}px;left:${wx}px;top:${wy}px;z-index:${++zCounter}`;

  win.innerHTML = `
    <div class="window-titlebar" data-id="${id}">
      <div class="window-controls">
        <button class="win-btn close"    title="Close"></button>
        <button class="win-btn minimize" title="Minimise"></button>
        <button class="win-btn zoom"     title="Zoom"></button>
      </div>
      <span class="window-title">${title}</span>
    </div>
    <div class="window-body">${content}</div>
  `;

  container.appendChild(win);
  windows[id] = { el: win, minimised: false, title };

  makeDraggable(win.querySelector('.window-titlebar'), win);
  win.querySelector('.win-btn.close').addEventListener('click', () => closeWindow(id));
  win.querySelector('.win-btn.minimize').addEventListener('click', () => toggleMinimise(id));
  win.addEventListener('mousedown', () => focusWindow(id));

  updateTaskbarPills();
}

function focusWindow(id) {
  const w = windows[id];
  if (!w) return;
  w.el.style.zIndex = ++zCounter;
  document.querySelectorAll('.os-window').forEach(el => el.classList.remove('focused'));
  w.el.classList.add('focused');
}

function closeWindow(id) {
  const w = windows[id];
  if (!w) return;
  w.el.remove();
  delete windows[id];
  updateTaskbarPills();
}

function toggleMinimise(id) {
  const w = windows[id];
  if (!w) return;
  w.minimised = !w.minimised;
  w.el.querySelector('.window-body').style.display = w.minimised ? 'none' : '';
  if (w.minimised) w.el.style.height = 'auto';
  updateTaskbarPills();
}

function makeDraggable(handle, target) {
  let ox = 0, oy = 0, mx = 0, my = 0;
  handle.addEventListener('mousedown', e => {
    if (e.target.classList.contains('win-btn')) return;
    e.preventDefault();
    mx = e.clientX; my = e.clientY;
    ox = target.offsetLeft; oy = target.offsetTop;
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
  });
  function drag(e) {
    target.style.left = `${ox + e.clientX - mx}px`;
    target.style.top  = `${oy + e.clientY - my}px`;
  }
  function stopDrag() {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
  }
}

// ── App factory ───────────────────────────────────────────
// Central function called by dock icons + terminal commands
function openApp(id, arg) {
  switch (id) {
    case 'welcome':  openWelcome(); break;
    case 'help':     openHelp(); break;
    case 'about':    openAbout(); break;
    case 'ls':       openLS(); break;
    case 'calc':     openCalc(); break;
    case 'music':    openMusic(); break;
    case 'snake':    openSnake(); break;
    case 'matrix':   toggleMatrix(); break;
    case 'hack':     openHack(arg); break;
    case 'neofetch': openNeofetch(); break;
  }
}

// ── App: Welcome ──────────────────────────────────────────
function openWelcome() {
  const html = `
<div style="line-height:1.8">
  <div class="neon-magenta" style="font-size:13px;letter-spacing:3px;margin-bottom:4px">// WELCOME TO HEXOS</div>
  <div class="dim" style="font-size:12px;letter-spacing:1px">
    Cyber Terminal Environment — click an app below or type a command.
  </div>
  <div class="welcome-grid">
    <button class="welcome-app-btn" data-app="calc">
      <span class="wa-icon"><i class="fa-solid fa-calculator"></i></span> CALCULATOR
    </button>
    <button class="welcome-app-btn" data-app="music">
      <span class="wa-icon"><i class="fa-solid fa-headphones"></i></span> MUSIC
    </button>
    <button class="welcome-app-btn" data-app="snake">
      <span class="wa-icon"><i class="fa-solid fa-gamepad"></i></span> SNAKE
    </button>
    <button class="welcome-app-btn" data-app="about">
      <span class="wa-icon"><i class="fa-solid fa-satellite-dish"></i></span> ABOUT
    </button>
    <button class="welcome-app-btn" data-app="ls">
      <span class="wa-icon"><i class="fa-solid fa-folder-open"></i></span> FILES
    </button>
    <button class="welcome-app-btn" data-app="neofetch">
      <span class="wa-icon"><i class="fa-solid fa-microchip"></i></span> NEOFETCH
    </button>
    <button class="welcome-app-btn" data-app="matrix">
      <span class="wa-icon"><i class="fa-solid fa-code"></i></span> MATRIX
    </button>
    <button class="welcome-app-btn" data-app="hack">
      <span class="wa-icon"><i class="fa-solid fa-skull-crossbones"></i></span> HACK
    </button>
  </div>
  <div class="welcome-hint">
    Type <span>help</span> in the terminal below for a full command list.
    Press <span>↑ / ↓</span> to cycle history.
  </div>
</div>`;

  createWindow('welcome', '// HEXOS — WELCOME', html, { width: 420, height: 380, x: 80, y: 60 });

  // wire up buttons after render
  setTimeout(() => {
    const win = document.getElementById('win-welcome');
    if (!win) return;
    win.querySelectorAll('.welcome-app-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        playClick();
        openApp(btn.dataset.app);
      });
    });
  }, 30);
}

// ── App: Help ─────────────────────────────────────────────
function openHelp() {
  const cmds = [
    ['help',          'Show this message'],
    ['about',         'About HEXOS'],
    ['ls',            'List filesystem'],
    ['calc',          'Calculator'],
    ['music',         'Music player'],
    ['snake',         'Play snake'],
    ['matrix',        'Toggle matrix screensaver'],
    ['neofetch',      'System info'],
    ['hack <target>', 'Initiate a "hack"'],
    ['date',          'Show date/time'],
    ['whoami',        'Identify operative'],
    ['echo <text>',   'Print text'],
    ['clear',         'Clear terminal output'],
    ['close <id>',    'Close a window by id'],
  ];
  const rows = cmds.map(([cmd, desc]) =>
    `<div class="help-row"><span class="help-cmd">${cmd}</span><span class="help-desc">${desc}</span></div>`
  ).join('');
  createWindow('help', '// HELP', `<div>${rows}</div>`, { width: 500, height: 420 });
}

// ── App: About ────────────────────────────────────────────
function openAbout() {
  const html = `
<div class="about-ascii">
  _   ________  ___  _____
 | | | | ____| / _ \\/ ____|
 | |_| |  _|  | |_| \\___  \\
 |  _  | |___ |  _  |___| |
 |_| |_|_____||_| |_|_____/
</div>
<div class="about-tagline">CYBER TERMINAL ENVIRONMENT</div>
<div style="margin-top:16px">
  <div class="about-row"><span class="about-key">Version</span> <span class="about-val neon-cyan">1.0.0</span></div>
  <div class="about-row"><span class="about-key">Kernel</span>  <span class="about-val neon-cyan">HEX-KERNEL 5.15-neon</span></div>
  <div class="about-row"><span class="about-key">Host</span>    <span class="about-val neon-cyan">SHADOW-RIG-7749</span></div>
  <div class="about-row"><span class="about-key">Author</span>  <span class="about-val neon-magenta">operative // classified</span></div>
  <div class="about-row"><span class="about-key">Built for</span><span class="about-val neon-yellow">Hack Club Stardance 2025</span></div>
</div>`;
  createWindow('about', '// ABOUT HEXOS', html, { width: 400, height: 330 });
}

// ── App: LS ───────────────────────────────────────────────
function openLS() {
  const tree = [
    { name: '/home/operative/',      type: 'dir'  },
    { name: '  docs/',               type: 'dir'  },
    { name: '    mission_brief.enc', type: 'file' },
    { name: '    targets.csv',       type: 'file' },
    { name: '  music/',              type: 'dir'  },
    { name: '    synthwave.ogg',     type: 'file' },
    { name: '    lofi_hack.ogg',     type: 'file' },
    { name: '  .shadow_config',      type: 'file' },
    { name: '  .neural_keys',        type: 'file' },
  ];
  const items = tree.map(f =>
    f.type === 'dir'
      ? `<li><span class="dim"><i class="fa-solid fa-folder"></i></span><span class="dir">${f.name}</span></li>`
      : `<li><span class="dim"><i class="fa-solid fa-file-code"></i></span><span class="file-item">${f.name}</span></li>`
  ).join('');
  createWindow('ls', '// FILESYSTEM', `<ul class="file-tree">${items}</ul>`, { width: 360, height: 280 });
}

// ── App: Calculator ───────────────────────────────────────
function openCalc() {
  const html = `
<div class="calc-grid">
  <div class="calc-display" id="calc-display">0</div>
  <button class="calc-btn" data-v="7">7</button>
  <button class="calc-btn" data-v="8">8</button>
  <button class="calc-btn" data-v="9">9</button>
  <button class="calc-btn op" data-v="/">÷</button>
  <button class="calc-btn" data-v="4">4</button>
  <button class="calc-btn" data-v="5">5</button>
  <button class="calc-btn" data-v="6">6</button>
  <button class="calc-btn op" data-v="*">×</button>
  <button class="calc-btn" data-v="1">1</button>
  <button class="calc-btn" data-v="2">2</button>
  <button class="calc-btn" data-v="3">3</button>
  <button class="calc-btn op" data-v="-">−</button>
  <button class="calc-btn" data-v="0">0</button>
  <button class="calc-btn" data-v=".">.</button>
  <button class="calc-btn op" data-v="+">+</button>
  <button class="calc-btn op" data-v="C">C</button>
  <button class="calc-btn eq wide" data-v="=">=</button>
  <button class="calc-btn op" data-v="⌫">⌫</button>
</div>`;

  createWindow('calc', '// CALCULATOR', html, { width: 270, height: 340 });

  setTimeout(() => {
    const win = document.getElementById('win-calc');
    if (!win) return;
    let expr = '';
    const display = win.querySelector('#calc-display');
    win.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        playClick();
        const v = btn.dataset.v;
        if (v === 'C')  { expr = ''; display.textContent = '0'; return; }
        if (v === '⌫') { expr = expr.slice(0, -1); display.textContent = expr || '0'; return; }
        if (v === '=')  {
          try {
            // eslint-disable-next-line no-new-func
            const result = Function('"use strict"; return (' + expr + ')')();
            display.textContent = result;
            expr = String(result);
          } catch { display.textContent = 'ERR'; expr = ''; }
          return;
        }
        expr += v;
        display.textContent = expr;
      });
    });
  }, 30);
}

// ── App: Music ────────────────────────────────────────────
const PLAYLIST = [
  { title: 'Neon_Drift.exe',  artist: 'GHOST_SIGNAL',  dur: 210 },
  { title: 'Shadow_Protocol', artist: 'DATAVOID',       dur: 187 },
  { title: 'Cyber_Ghost.wav', artist: 'HEXBYTE',        dur: 243 },
  { title: 'System_Breach',   artist: 'NULL_POINTER',   dur: 195 },
];
let musicState = { playing: false, trackIdx: 0, progress: 0, interval: null };

function openMusic() {
  const t = PLAYLIST[musicState.trackIdx];
  const bars = Array.from({ length: 20 }, (_, i) =>
    `<div class="viz-bar${musicState.playing ? ' playing' : ''}"
       style="--h:${8 + Math.random() * 32}px;animation-delay:${(i * 0.055).toFixed(2)}s"></div>`
  ).join('');

  const html = `
<div class="music-player">
  <div class="music-track-info">
    <div class="music-track-title" id="music-title">${t.title}</div>
    <div class="music-track-artist" id="music-artist">${t.artist}</div>
  </div>
  <div class="music-viz" id="music-viz">${bars}</div>
  <div class="music-progress-wrap">
    <div class="music-progress-bar" id="music-progress-bar"></div>
  </div>
  <div class="music-controls">
    <button class="music-btn" id="music-prev">⏮</button>
    <button class="music-btn" id="music-play">${musicState.playing ? '⏸' : '▶'}</button>
    <button class="music-btn" id="music-next">⏭</button>
  </div>
</div>`;

  createWindow('music', '// MUSIC PLAYER', html, { width: 340, height: 270 });

  setTimeout(() => {
    const win = document.getElementById('win-music');
    if (!win) return;

    const syncUI = () => {
      const t = PLAYLIST[musicState.trackIdx];
      const title  = win.querySelector('#music-title');
      const artist = win.querySelector('#music-artist');
      const bar    = win.querySelector('#music-progress-bar');
      const playBtn= win.querySelector('#music-play');
      const viz    = win.querySelector('#music-viz');
      if (title)  title.textContent  = t.title;
      if (artist) artist.textContent = t.artist;
      if (bar)    bar.style.width    = `${(musicState.progress / t.dur) * 100}%`;
      if (playBtn) playBtn.textContent = musicState.playing ? '⏸' : '▶';
      if (viz) viz.querySelectorAll('.viz-bar').forEach(b =>
        b.classList.toggle('playing', musicState.playing));
    };

    const play = () => {
      if (musicState.interval) return;
      musicState.playing = true;
      musicState.interval = setInterval(() => {
        const t = PLAYLIST[musicState.trackIdx];
        musicState.progress++;
        if (musicState.progress >= t.dur) {
          musicState.progress = 0;
          musicState.trackIdx = (musicState.trackIdx + 1) % PLAYLIST.length;
        }
        syncUI();
      }, 1000);
      syncUI();
    };

    const pause = () => {
      musicState.playing = false;
      clearInterval(musicState.interval);
      musicState.interval = null;
      syncUI();
    };

    win.querySelector('#music-play').addEventListener('click', () => { playClick(); musicState.playing ? pause() : play(); });
    win.querySelector('#music-prev').addEventListener('click', () => {
      playClick();
      musicState.trackIdx = (musicState.trackIdx - 1 + PLAYLIST.length) % PLAYLIST.length;
      musicState.progress = 0; syncUI();
    });
    win.querySelector('#music-next').addEventListener('click', () => {
      playClick();
      musicState.trackIdx = (musicState.trackIdx + 1) % PLAYLIST.length;
      musicState.progress = 0; syncUI();
    });

    syncUI();
  }, 30);
}

// ── App: Snake ────────────────────────────────────────────
function openSnake() {
  const html = `
<div style="display:flex;flex-direction:column;align-items:center;gap:8px;height:100%">
  <div class="dim" style="font-size:10px;letter-spacing:2px">WASD / ARROW KEYS &nbsp;·&nbsp; R = RESTART</div>
  <canvas id="snake-canvas" width="300" height="240"
    style="border:1px solid var(--cyan);box-shadow:0 0 12px rgba(5,217,232,0.5)"></canvas>
  <div id="snake-score" class="neon-cyan" style="font-size:11px;letter-spacing:3px">SCORE: 0</div>
</div>`;

  createWindow('snake', '// SNAKE.EXE', html, { width: 350, height: 330 });

  setTimeout(() => {
    const win = document.getElementById('win-snake');
    if (!win) return;
    const canvas  = win.querySelector('#snake-canvas');
    const ctx     = canvas.getContext('2d');
    const scoreEl = win.querySelector('#snake-score');
    const CELL = 20, COLS = Math.floor(canvas.width / CELL), ROWS = Math.floor(canvas.height / CELL);
    let snake, dir, food, score, running, intervalId;

    function reset() {
      snake = [{ x: 5, y: 5 }];
      dir   = { x: 1, y: 0 };
      food  = rndFood();
      score = 0; running = true;
      scoreEl.textContent = 'SCORE: 0';
      clearInterval(intervalId);
      intervalId = setInterval(tick, 120);
    }

    function rndFood() {
      return { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    }

    function tick() {
      const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (h.x < 0 || h.x >= COLS || h.y < 0 || h.y >= ROWS ||
          snake.some(s => s.x === h.x && s.y === h.y)) {
        clearInterval(intervalId); running = false;
        ctx.fillStyle = 'rgba(255,42,109,0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff2a6d'; ctx.shadowColor = '#ff2a6d'; ctx.shadowBlur = 16;
        ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        ctx.shadowBlur = 0; ctx.font = '11px monospace';
        ctx.fillStyle = '#d1f7ff';
        ctx.fillText('press R to restart', canvas.width / 2, canvas.height / 2 + 22);
        return;
      }
      snake.unshift(h);
      if (h.x === food.x && h.y === food.y) {
        score++; scoreEl.textContent = `SCORE: ${score}`;
        food = rndFood(); playClick();
      } else { snake.pop(); }
      draw();
    }

    function draw() {
      ctx.fillStyle = '#0a0a12'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(5,217,232,0.04)';
      for (let gx = 0; gx < COLS; gx++)
        for (let gy = 0; gy < ROWS; gy++)
          ctx.fillRect(gx * CELL + CELL / 2 - 1, gy * CELL + CELL / 2 - 1, 2, 2);
      ctx.fillStyle = '#ff2a6d'; ctx.shadowColor = '#ff2a6d'; ctx.shadowBlur = 14;
      ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
      snake.forEach((s, i) => {
        ctx.shadowColor = '#05d9e8'; ctx.shadowBlur = i === 0 ? 16 : 5;
        ctx.fillStyle = i === 0 ? '#ffffff' : '#05d9e8';
        ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      });
      ctx.shadowBlur = 0;
    }

    const onKey = e => {
      const map = { ArrowUp:'U', ArrowDown:'D', ArrowLeft:'L', ArrowRight:'R', w:'U', s:'D', a:'L', d:'R', W:'U', S:'D', A:'L', D:'R' };
      const d = map[e.key];
      if (!running && e.key === 'r') { reset(); return; }
      if (!d) return; e.preventDefault();
      if (d === 'U' && dir.y !== 1)  dir = { x: 0,  y: -1 };
      if (d === 'D' && dir.y !== -1) dir = { x: 0,  y: 1  };
      if (d === 'L' && dir.x !== 1)  dir = { x: -1, y: 0  };
      if (d === 'R' && dir.x !== -1) dir = { x: 1,  y: 0  };
    };
    window.addEventListener('keydown', onKey);

    // cleanup when window is removed
    new MutationObserver(() => {
      if (!document.contains(canvas)) {
        clearInterval(intervalId);
        window.removeEventListener('keydown', onKey);
      }
    }).observe(document.getElementById('window-container'), { childList: true, subtree: true });

    reset();
  }, 30);
}

// ── App: Hack ─────────────────────────────────────────────
function openHack(target = 'mainframe') {
  const steps = [
    `Scanning ${target}...`,
    'Found open ports: 22, 80, 443, 31337',
    'Attempting SSH brute force... [▓▓▓░░░░░░░]',
    'Dictionary attack in progress...',
    'Password cracked: <span class="neon-yellow">hunter2</span>',
    'Privilege escalation via CVE-2099-00001...',
    'Injecting payload into kernel buffer...',
    'Disabling IDS sensors...',
    `<span class="neon-magenta">ACCESS GRANTED to ${target.toUpperCase()}</span>`,
    '<span class="dim">⚠ Purely fictional. Hacking real systems is illegal.</span>',
  ];

  createWindow('hack', `// HACK: ${target.toUpperCase()}`, '<div id="hack-log"></div>', { width: 440, height: 300 });

  setTimeout(() => {
    const log = document.querySelector('#win-hack #hack-log');
    if (!log) return;
    steps.forEach((line, i) => {
      setTimeout(() => {
        if (!log) return;
        const div = document.createElement('div');
        div.innerHTML = line; div.style.padding = '2px 0';
        log.appendChild(div); log.scrollTop = log.scrollHeight;
      }, i * 480);
    });
  }, 50);
}

// ── App: Neofetch ─────────────────────────────────────────
function openNeofetch() {
  const info = [
    ['OS',      'HEXOS 1.0 neon-kernel'],
    ['Host',    'SHADOW-RIG-7749'],
    ['Kernel',  '5.15.0-neon'],
    ['Uptime',  '∞ days, still running'],
    ['Shell',   'hexsh 2.1'],
    ['CPU',     'Neural Processor X — 128 cores'],
    ['GPU',     'CyberVision RTX NEON'],
    ['Memory',  '64 GiB / 128 GiB'],
    ['Network', 'TOR → shadow-mesh → clearnet'],
  ];
  const rows = info.map(([k, v]) =>
    `<div class="nf-row"><span class="nf-key">${k}</span><span class="dim">: </span><span class="nf-val">${v}</span></div>`
  ).join('');

  const html = `
<pre class="nf-ascii" style="font-size:9px;line-height:1.5">
    /\\      /\\
   /  \\    /  \\
  / /\\ \\  / /\\ \\
 / /  \\ \\/ /  \\ \\
/_/    \\__/    \\_\\
</pre>
<div style="margin-top:10px">${rows}</div>`;

  createWindow('neofetch', '// NEOFETCH', html, { width: 440, height: 340 });
}

// ── Toggle matrix ─────────────────────────────────────────
function toggleMatrix() {
  if (document.getElementById('matrix-canvas').classList.contains('active')) {
    hideMatrix();
    termPrint('Matrix screensaver <span class="neon-magenta">OFF</span>.', 'success');
  } else {
    showMatrix();
    termPrint('Matrix screensaver <span class="neon-cyan">ON</span> — move mouse to exit.', 'success');
  }
}

// ── Terminal ──────────────────────────────────────────────
const cmdHistory = [];
let histIdx = -1;

const termInput  = document.getElementById('terminal-input');
const termOutput = document.getElementById('terminal-output');

function termPrint(html, cls = '') {
  const div = document.createElement('div');
  div.className = `out-line ${cls}`;
  div.innerHTML = html;
  termOutput.appendChild(div);
  termOutput.scrollTop = termOutput.scrollHeight;
}

function handleCommand(raw) {
  const parts = raw.trim().split(/\s+/);
  const cmd   = parts[0].toLowerCase();
  const args  = parts.slice(1);

  termPrint(`<span class="prompt-seg prompt-seg-user">operative</span><span class="prompt-seg prompt-seg-path">~/hexos</span><span class="prompt-arrow">❯</span> <span style="color:var(--text-term)">${raw}</span>`, 'echo');

  switch (cmd) {
    case '': break;

    case 'help':
      openApp('help');
      termPrint('Opened <span class="neon-cyan">help</span>.', 'success');
      break;

    case 'about':
      openApp('about');
      termPrint('Opened <span class="neon-cyan">about</span>.', 'success');
      break;

    case 'ls':
      openApp('ls');
      termPrint('Opened <span class="neon-cyan">filesystem</span>.', 'success');
      break;

    case 'calc':
      openApp('calc');
      termPrint('Opened <span class="neon-cyan">calculator</span>.', 'success');
      break;

    case 'music':
      openApp('music');
      termPrint('Opened <span class="neon-cyan">music player</span>.', 'success');
      break;

    case 'snake':
      openApp('snake');
      termPrint('Opened <span class="neon-cyan">snake</span>. Use WASD / arrow keys.', 'success');
      break;

    case 'matrix':
      openApp('matrix');
      break;

    case 'hack':
      openApp('hack', args[0] || 'mainframe');
      termPrint(`Initiating hack on <span class="neon-magenta">${args[0] || 'mainframe'}</span>...`, 'success');
      break;

    case 'neofetch':
      openApp('neofetch');
      termPrint('Opened <span class="neon-cyan">neofetch</span>.', 'success');
      break;

    case 'date':
      termPrint(`<span class="neon-cyan">${new Date().toString()}</span>`, 'success');
      break;

    case 'whoami':
      termPrint('<span class="neon-magenta">operative // clearance level: SHADOW</span>', 'success');
      break;

    case 'clear':
      termOutput.innerHTML = '';
      break;

    case 'echo':
      termPrint(args.join(' ') || '');
      break;

    case 'close': {
      const wid = args[0];
      if (!wid) { termPrint('Usage: close &lt;window-id&gt;', 'error'); break; }
      if (windows[wid]) { closeWindow(wid); termPrint(`Closed <span class="neon-cyan">${wid}</span>.`, 'success'); }
      else termPrint(`No open window: <span class="neon-magenta">${wid}</span>`, 'error');
      break;
    }

    default:
      playError();
      termPrint(
        `<span class="neon-magenta">command not found: ${cmd}</span> — type <span class="neon-cyan">help</span>, genius.`,
        'error'
      );
  }
}

termInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = termInput.value;
    if (val.trim()) { cmdHistory.unshift(val); histIdx = -1; }
    handleCommand(val);
    termInput.value = '';
    playClick();
    return;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (histIdx < cmdHistory.length - 1) histIdx++;
    termInput.value = cmdHistory[histIdx] ?? '';
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (histIdx > 0) histIdx--;
    else { histIdx = -1; termInput.value = ''; return; }
    termInput.value = cmdHistory[histIdx] ?? '';
    return;
  }
  playClick();
});

document.getElementById('desktop').addEventListener('click', e => {
  if (!e.target.closest('.os-window') && !e.target.closest('#taskbar') && !e.target.closest('#dock')) {
    termInput.focus();
  }
});

// ── Screensaver hint ──────────────────────────────────────
const hint = document.createElement('div');
hint.id = 'screensaver-hint';
hint.textContent = '[ MOVE MOUSE OR PRESS ANY KEY TO EXIT ]';
document.body.appendChild(hint);

// ── Dock wiring + magnify ─────────────────────────────────
const dockEl    = document.getElementById('dock');
const dockIcons = [...document.querySelectorAll('.dock-icon')];

dockIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    playClick();
    openApp(icon.dataset.app);
  });
});

// Proximity magnify: icons near the cursor scale up
dockEl.addEventListener('mousemove', e => {
  const dockRect = dockEl.getBoundingClientRect();
  const mouseX   = e.clientX;

  dockIcons.forEach(icon => {
    const r    = icon.getBoundingClientRect();
    const cx   = r.left + r.width / 2;
    const dist = Math.abs(mouseX - cx);
    const max  = 90;  // px — influence radius
    const s    = dist < max ? 1 + 0.45 * (1 - dist / max) : 1;
    icon.style.transform = `scale(${s.toFixed(3)}) translateY(${dist < max ? -4 * (1 - dist / max) : 0}px)`;
  });
});

dockEl.addEventListener('mouseleave', () => {
  dockIcons.forEach(icon => { icon.style.transform = ''; });
});

// ── Boot ──────────────────────────────────────────────────
window.addEventListener('load', () => {
  document.addEventListener('click', () => getAudioCtx(), { once: true });
  runBoot();
});
