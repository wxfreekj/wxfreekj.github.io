// App shell for Arrow Escape: animated intro, title screen, and a quick interactive tutorial.
// Loaded after the game script, so it can use the game's globals (S, pauseClock, resumeClock, tierName).
(function () {
  'use strict';

  const NAVY = '#242d48', MINT = '#58d6a3', GOLD = '#f5be54', LILAC = '#ad9bff';
  const COLORS = [MINT, '#86d98c', '#c3d36a', GOLD, LILAC];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  const $id = (id) => document.getElementById(id);

  // ---------------------------------------------------------------- styles
  const style = document.createElement('style');
  style.textContent = `
#aeShell{position:fixed;inset:0;z-index:50;background:${NAVY};color:#f3f6ff;overflow:hidden;
  font-family:system-ui,sans-serif;-webkit-user-select:none;user-select:none;transition:opacity .25s}
#aeShell.ae-out{opacity:0}
#aeBg{position:absolute;inset:0;width:100%;height:100%}
.ae-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:24px;gap:6px;pointer-events:none}
.ae-logo{width:min(30vw,128px);height:auto;opacity:0;transform:scale(.85);transition:opacity .4s,transform .6s cubic-bezier(.2,1.4,.4,1)}
.ae-logo path{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .7s ease-out}
.ae-logo path:nth-child(2){transition-delay:.25s}.ae-logo path:nth-child(3){transition-delay:.35s}.ae-logo path:nth-child(4){transition-delay:.45s}
.ae-title{margin:10px 0 0;text-align:center;line-height:.95;font-weight:900;letter-spacing:.06em}
.ae-title span{display:block;opacity:0;transform:translateY(18px);transition:opacity .45s,transform .55s cubic-bezier(.2,1.3,.4,1)}
.ae-w1{font-size:clamp(40px,13vw,72px);color:#f3f6ff}
.ae-w2{font-size:clamp(40px,13vw,72px);color:${MINT};transition-delay:.12s!important}
.ae-under{display:block;width:min(78vw,380px);height:auto;margin-top:6px}
.ae-under path{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .6s ease-in .35s}
.ae-under path+path{transition:stroke-dashoffset .2s linear .9s}
.ae-tag{margin:8px 0 0;font-size:15px;color:#aab8d5;opacity:0;transition:opacity .5s .5s}
#aeShell.ae-show-title .ae-logo{opacity:1;transform:none}
#aeShell.ae-show-title path{stroke-dashoffset:0}
#aeShell.ae-show-title .ae-title span{opacity:1;transform:none}
#aeShell.ae-show-title .ae-tag{opacity:1}
.ae-menu{display:flex;flex-direction:column;gap:10px;width:min(80vw,320px);margin-top:28px;
  opacity:0;transform:translateY(16px);transition:opacity .4s,transform .4s;pointer-events:none}
#aeShell.ae-show-menu .ae-menu{opacity:1;transform:none;pointer-events:auto}
.ae-menu button{font:inherit;border:0;border-radius:16px;padding:14px 18px;cursor:pointer}
.ae-menu .ae-play{background:${MINT};color:${NAVY};font-size:20px!important;font-weight:800;box-shadow:0 8px 24px #0005}
.ae-play,.ae-play span,.ae-play small{color:${NAVY}!important}
.ae-play small{display:block;font-size:14px;font-weight:700;margin-top:3px;opacity:1}
.ae-menu .ae-sec{background:#ffffff14;color:#f3f6ff;font-weight:700;font-size:16px}
.ae-play:active,.ae-sec:active{transform:scale(.97)}
.ae-skip{position:absolute;left:0;right:0;bottom:22px;text-align:center;font-size:13px;color:#aab8d570;transition:opacity .3s}
#aeShell.ae-show-menu .ae-skip{opacity:0}
#aeTut{position:fixed;inset:0;z-index:60;background:${NAVY};color:#f3f6ff;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:14px;padding:24px;font-family:system-ui,sans-serif;
  -webkit-user-select:none;user-select:none}
#aeTut[hidden]{display:none}
#aeTut{overflow:auto;justify-content:safe center;padding-top:54px;padding-bottom:18px}
#aeTutBoard{flex:none;max-height:32dvh;max-width:32dvh}
.ae-hint-cards{width:min(90vw,380px);display:grid;grid-template-columns:1fr 1fr;gap:8px}
#aeTut .ae-hint-card{display:flex;flex-direction:column;align-items:flex-start;text-align:left;padding:9px 10px;gap:4px;font-size:12px;line-height:1.3;background:#ffffff12;border:1px solid #ffffff25}
.ae-hint-card b{font-size:13px;color:#fff}.ae-hint-card span{font-weight:400;color:#dfe6f7}#aeTut .ae-hint-card[aria-pressed=true]{border-color:#58d6a3;background:#58d6a326}
.ae-hint-note{font-size:11px;color:#c8d2ea;text-align:center;max-width:380px}
#aeTut h2{margin:0;font-size:26px;text-align:center;color:#ffffff}
#aeTut p{margin:0;max-width:340px;text-align:center;font-size:15px;line-height:1.5;min-height:3.5em;color:#dfe6f7}
#aeTutBoard{width:min(78vw,300px);height:min(78vw,300px);border-radius:18px;background:#2f3a5c;touch-action:none;
  box-shadow:0 8px 28px #0006,inset 0 0 0 1px #ffffff14}
.ae-tut-step{font-size:12px;letter-spacing:.14em;color:${MINT};font-weight:800}
#aeTut .ae-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center} #aeTut button{min-height:48px} #aeTut button:focus-visible,#aeTutBoard:focus-visible{outline:3px solid ${MINT};outline-offset:3px}
#aeTut button{font:inherit;font-weight:700;border:0;border-radius:14px;padding:12px 22px;cursor:pointer;
  background:#ffffff1a;color:#f3f6ff}
#aeTut button.ae-go{background:${MINT};color:${NAVY}}
#aeTutSkip{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));right:16px;background:transparent!important;
  color:#c8d2ea!important;font-weight:600!important}
`;
  document.head.appendChild(style);

  // ---------------------------------------------------------------- title screen DOM
  const shell = document.createElement('div');
  shell.id = 'aeShell';
  shell.innerHTML = `
<canvas id="aeBg"></canvas>
<div class="ae-center">
  <svg class="ae-logo" viewBox="30 35 135 125" fill="none" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path pathLength="1" d="M38 145V55H85L125 95H155" stroke="${MINT}"/>
    <path pathLength="1" d="m137 77 18 18-18 18" stroke="${MINT}"/>
    <path pathLength="1" d="M65 150h55l30-30" stroke="${GOLD}"/>
    <path pathLength="1" d="M104 43h45v25" stroke="${LILAC}"/>
  </svg>
  <h1 class="ae-title"><span class="ae-w1">ARROW</span><span class="ae-w2">ESCAPE</span></h1>
  <svg class="ae-under" viewBox="0 0 380 28" fill="none" stroke="${GOLD}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path pathLength="1" d="M14 14H360"/><path pathLength="1" d="M346 3l14 11-14 11"/>
  </svg>
  <p class="ae-tag">Clear the board. One arrow at a time.</p>
  <div class="ae-menu">
    <button class="ae-play" id="aePlay"><span id="aePlayLabel">Play</span><small id="aeProgress"></small></button>
    <button class="ae-sec" id="aeHow">How to play</button>
    <button class="ae-sec" id="aeSettings">Settings</button>
  </div>
</div>
<div class="ae-skip">Tap to skip</div>`;
  document.body.appendChild(shell);

  // ---------------------------------------------------------------- background animation
  const bg = $id('aeBg'), g = bg.getContext('2d');
  let W = 0, H = 0, U = 32, raf = 0, snakes = [], lastSpawn = 0, introDone = false;

  function resizeBg() {
    const dpr = Math.min(3, devicePixelRatio || 1);
    W = bg.clientWidth; H = bg.clientHeight;
    bg.width = Math.round(W * dpr); bg.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    U = Math.max(26, Math.min(W, H) / 11);
  }
  addEventListener('resize', resizeBg);

  // A snake is an arrow path (tail..head, in pixels) that can slide out along its head direction.
  function makeSnake(pts, dir, color, opts = {}) {
    const ext = pts.slice();
    const head = pts[pts.length - 1], far = (W + H) * 1.2;
    ext.push([head[0] + dir[0] * far, head[1] + dir[1] * far]);
    const ds = [0];
    for (let i = 1; i < ext.length; i++) ds.push(ds[i - 1] + Math.hypot(ext[i][0] - ext[i - 1][0], ext[i][1] - ext[i - 1][1]));
    return { ext, ds, len: ds[pts.length - 1], color, t: 0, start: opts.start ?? 0, speed: opts.speed ?? 1.4,
      alpha: opts.alpha ?? 1, fadeIn: opts.fadeIn ?? 0, born: opts.born ?? 0, width: opts.width ?? U * 0.2 };
  }
  function at(s, x) {
    let i = 1; while (i < s.ds.length - 1 && s.ds[i] < x) i++;
    const f = Math.max(0, Math.min(1, (x - s.ds[i - 1]) / (s.ds[i] - s.ds[i - 1] || 1)));
    const a = s.ext[i - 1], b = s.ext[i];
    return [a[0] + f * (b[0] - a[0]), a[1] + f * (b[1] - a[1])];
  }
  function drawSnake(s, now) {
    const t = s.t, end = t + s.len, pts = [at(s, t)];
    for (let i = 1; i < s.ds.length; i++) if (s.ds[i] > t && s.ds[i] < end) pts.push(s.ext[i]);
    pts.push(at(s, end));
    const fade = s.fadeIn ? Math.min(1, (now - s.born) / s.fadeIn) : 1;
    g.globalAlpha = s.alpha * fade;
    g.strokeStyle = g.fillStyle = s.color; g.lineWidth = s.width; g.lineCap = g.lineJoin = 'round';
    g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.stroke();
    const p = pts[pts.length - 1], q = pts[pts.length - 2] || p, ang = Math.atan2(p[1] - q[1], p[0] - q[0]), r = s.width * 1.9;
    g.beginPath();
    g.moveTo(p[0] + r * .95 * Math.cos(ang), p[1] + r * .95 * Math.sin(ang));
    for (const k of [-1, 1]) g.lineTo(p[0] - r * Math.cos(ang) + k * r * .8 * Math.sin(ang), p[1] - r * Math.sin(ang) - k * r * .8 * Math.cos(ang));
    g.closePath(); g.fill();
    g.globalAlpha = 1;
  }
  function offscreen(s) {
    const m = U * 2, out = (p) => p[0] < -m || p[0] > W + m || p[1] < -m || p[1] > H + m;
    return out(at(s, s.t)) && out(at(s, s.t + s.len));
  }

  // Intro: a packed puzzle of arrows in the middle that escapes outward, revealing the title.
  function buildIntro(now) {
    const C = 8, R = 7, ox = W / 2 - (C - 1) * U / 2, oy = H * 0.42 - (R - 1) * U / 2;
    const P = (x, y) => [ox + x * U, oy + y * U];
    const list = [];
    for (let y = 0; y < R; y++) {
      const split = 2 + Math.floor(Math.random() * (C - 3));
      const left = [], right = [];
      for (let x = split - 1; x >= 0; x--) left.push(P(x, y));
      for (let x = split; x < C; x++) right.push(P(x, y));
      const col = COLORS[y % COLORS.length];
      if (left.length > 1) list.push(makeSnake(left, [-1, 0], col, { speed: 1.9 }));
      if (right.length > 1) list.push(makeSnake(right, [1, 0], COLORS[(y + 2) % COLORS.length], { speed: 1.9 }));
    }
    list.sort(() => Math.random() - 0.5).forEach((s, i) => { s.start = now + 220 + i * 55; });
    return list;
  }

  // Ambient: faint arrows appear around the edges and slip away.
  function spawnAmbient(now) {
    const cols = Math.ceil(W / U), rows = Math.ceil(H / U);
    let x = Math.floor(Math.random() * cols), y = Math.floor(Math.random() * rows);
    const cx = W / 2, cy = H / 2;
    if (Math.abs(x * U - cx) < W * 0.3 && Math.abs(y * U - cy) < H * 0.32) y = Math.random() < 0.5 ? 1 : rows - 2;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let d = dirs[Math.floor(Math.random() * 4)];
    const pts = [[x * U, y * U]], n = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) {
      if (i && Math.random() < 0.35) { const turn = d[0] ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]]; d = turn[Math.floor(Math.random() * 2)]; }
      x += d[0]; y += d[1]; pts.push([x * U, y * U]);
    }
    const s = makeSnake(pts, d, COLORS[Math.floor(Math.random() * COLORS.length)],
      { start: now + 900, speed: 0.55, alpha: 0.32, fadeIn: 700, born: now, width: U * 0.16 });
    snakes.push(s);
  }

  let lastFrame = 0;
  function frame(now) {
    const dt = Math.min(48, now - (lastFrame || now)); lastFrame = now;
    g.clearRect(0, 0, W, H);
    // faint dot grid
    g.fillStyle = '#ffffff0d';
    for (let x = (W / 2) % U; x < W; x += U) for (let y = (H / 2) % U; y < H; y += U) g.fillRect(x - 1, y - 1, 2, 2);
    if (introDone && now - lastSpawn > 800 && snakes.length < 8) { lastSpawn = now; spawnAmbient(now); }
    for (const s of snakes) { if (now >= s.start) s.t += s.speed * dt * (U / 32); drawSnake(s, now); }
    snakes = snakes.filter((s) => !(now >= s.start && offscreen(s)));
    raf = requestAnimationFrame(frame);
  }
  function startBg() { cancelAnimationFrame(raf); lastFrame = 0; raf = requestAnimationFrame(frame); }
  function stopBg() { cancelAnimationFrame(raf); raf = 0; }

  // ---------------------------------------------------------------- title screen logic
  let titleOpen = true, fromTitleStart = false;

  function progressText() {
    try {
      if (S.mode === 'timed') return S.timed?.finished?'Competition finished':'Timed competition · '+S.competitionMinutes+' min';
      if (S.mode === 'daily') return 'Daily challenge';
      if (S.mode === 'custom') return 'Custom puzzle';
      return 'Level ' + S.level + ' · ' + tierName(S.tier);
    } catch { return ''; }
  }
  function refreshMenu() {
    const firstTime = !store.get('ae-tutorial-done');
    $id('aePlayLabel').textContent = firstTime ? 'Start' : 'Continue';
    $id('aeProgress').textContent = firstTime ? 'Tutorial or optional practice' : progressText();
  }

  function showTitle(intro) {
    titleOpen = true; window.AE_titlePaused=true;
    try { pauseClock(); } catch {}
    shell.hidden = false; shell.classList.remove('ae-out');
    resizeBg(); refreshMenu();
    if (intro && !reduceMotion) {
      snakes = buildIntro(performance.now()); introDone = false;
      setTimeout(() => shell.classList.add('ae-show-title'), 650);
      setTimeout(finishIntro, 1700);
    } else finishIntro();
    startBg();
  }
  function finishIntro() {
    if (introDone) return;
    introDone = true;
    shell.classList.add('ae-show-title', 'ae-show-menu');
    lastSpawn = performance.now() - 800;
  }
  function hideTitle() {
    titleOpen = false; window.AE_titlePaused=false;
    shell.classList.add('ae-out');
    setTimeout(() => { if (!titleOpen) { shell.hidden = true; stopBg(); } }, 260);
    try { resumeClock(); } catch {}
  }

  shell.addEventListener('pointerdown', () => { if (!introDone) { snakes.forEach((s) => (s.start = Math.min(s.start, performance.now()))); finishIntro(); } });
  $id('aePlay').onclick = () => { if (!store.get('ae-tutorial-done')) openTutorial(true); else hideTitle(); };
  $id('aeHow').onclick = () => openTutorial(false);
  $id('aeSettings').onclick = () => { fromTitleStart = false; $id('menu').click(); };
  // "Start / resume" inside settings means the player wants to play now.
  $id('start').addEventListener('click', () => { if (titleOpen) fromTitleStart = true; });
  $id('settings').addEventListener('close', () => {
    if (!titleOpen) return;
    if (fromTitleStart) { fromTitleStart = false; hideTitle(); }
    else { try { pauseClock(); } catch {} refreshMenu(); }
  });

  // Keep the game clock stopped while the title screen or tutorial is up.
  const gameResume = window.resumeClock;
  if (typeof gameResume === 'function') {
    window.resumeClock = function () { if (titleOpen || tutOpen) return; return gameResume.apply(this, arguments); };
  }

  // The game opens its settings on first launch; the title screen and tutorial replace that.
  const settings = $id('settings');
  if (settings.open) settings.close();

  // ---------------------------------------------------------------- tutorial
  const tut = document.createElement('div');
  tut.id = 'aeTut'; tut.hidden = true;
  tut.innerHTML = `
<button id="aeTutSkip">Skip</button>
<div class="ae-tut-step" id="aeTutStep">HOW TO PLAY</div>
<h2 id="aeTutHead">Tap an arrow</h2>
<canvas id="aeTutBoard"></canvas><span id="aeTutBoardStatus" class="sr-only" role="status"></span>
<p id="aeTutText" role="status" aria-live="polite"></p><div class="ae-hint-cards"><button type="button" class="ae-hint-card" id="aeTutArrowHint" aria-pressed="false"><b>💡 Arrow hint</b><span>Highlights an arrow that can escape now. Try it!</span></button><button type="button" class="ae-hint-card" id="aeTutGridHint" aria-pressed="false"><b># Grid hint</b><span>Shows faint lines from arrowheads so you can trace their exits.</span></button></div><div class="ae-hint-note">Tutorial hints are free. Enable unlimited hints in Settings for the real game.</div>
<div class="ae-row"><button class="ae-go" id="aeTutGo">Play real game</button><button id="aePractice" type="button">Practice levels</button></div>`;
  document.body.appendChild(tut);

  const tb = $id('aeTutBoard'), tg = tb.getContext('2d');
  const N = 5;
  const PUZZLE = [ // path runs tail -> head; v is the direction the head points
    { p: [[3, 3], [3, 2], [3, 1]], v: [0, -1] },
    { p: [[0, 2], [1, 2], [2, 2]], v: [1, 0] },
    { p: [[0, 4], [1, 4], [1, 3]], v: [0, -1] },
    { p: [[4, 4], [3, 4], [2, 4], [2, 3]], v: [0, -1] },
  ];
  let tutorialGrid=false,tutorialHint=false;
  let tutOpen = false, tutThenPlay = false, live = [], anim = null, flash = null, cleared = 0, tutRaf = 0;

  function tutColor(a, i) {
    return [MINT, '#86d98c', GOLD, LILAC][i % 4]; // bright on the navy board
  }
  function sizeBoard() {
    const dpr = Math.min(3, devicePixelRatio || 1), s = tb.clientWidth;
    tb.width = tb.height = Math.round(s * dpr);
    tg.setTransform(dpr, 0, 0, dpr, 0, 0);
    return s;
  }
  function cellPx() { return tb.clientWidth / N; }
  function toPx(c) { const k = cellPx(); return [(c[0] + 0.5) * k, (c[1] + 0.5) * k]; }

  function blockersOf(a) {
    const occ = new Set();
    for (const b of live) if (b !== a) for (const c of b.p) occ.add(c[0] + ',' + c[1]);
    let [x, y] = a.p[a.p.length - 1];
    for (;;) { x += a.v[0]; y += a.v[1]; if (x < 0 || y < 0 || x >= N || y >= N) return false; if (occ.has(x + ',' + y)) return true; }
  }

  function drawArrowPx(pts, color, width) {
    tg.strokeStyle = tg.fillStyle = color; tg.lineWidth = width; tg.lineCap = tg.lineJoin = 'round';
    tg.beginPath(); tg.moveTo(...pts[0]); for (const p of pts.slice(1)) tg.lineTo(...p); tg.stroke();
    const p = pts[pts.length - 1], q = pts[pts.length - 2], ang = Math.atan2(p[1] - q[1], p[0] - q[0]), r = width * 1.9;
    tg.beginPath();
    tg.moveTo(p[0] + r * .95 * Math.cos(ang), p[1] + r * .95 * Math.sin(ang));
    for (const k of [-1, 1]) tg.lineTo(p[0] - r * Math.cos(ang) + k * r * .8 * Math.sin(ang), p[1] - r * Math.sin(ang) - k * r * .8 * Math.cos(ang));
    tg.closePath(); tg.fill();
  }

  function trailPx(a, t) { // slide the arrow t pixels along its path and out
    const k = cellPx(), pts = a.p.map(toPx), h = pts[pts.length - 1];
    for (let i = 1; i <= N + 3; i++) pts.push([h[0] + a.v[0] * k * i, h[1] + a.v[1] * k * i]);
    const ds = [0]; for (let i = 1; i < pts.length; i++) ds.push(ds[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const len = ds[a.p.length - 1];
    const f = (x) => { let i = 1; while (i < ds.length - 1 && ds[i] < x) i++; const u = Math.max(0, Math.min(1, (x - ds[i - 1]) / (ds[i] - ds[i - 1]))); return [pts[i - 1][0] + u * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + u * (pts[i][1] - pts[i - 1][1])]; };
    const out = [f(t)]; for (let i = 1; i < ds.length; i++) if (ds[i] > t && ds[i] < t + len) out.push(pts[i]); out.push(f(t + len));
    return { out, total: ds[ds.length - 1] - len };
  }

  function drawTut(now) {
    const s = tb.clientWidth, k = s / N, w = Math.max(3, k * 0.17);
    tg.clearRect(0, 0, s, s);
    tg.fillStyle = '#ffffff30';
    for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) { tg.beginPath(); tg.arc((x + .5) * k, (y + .5) * k, 2, 0, 7); tg.fill(); }
    if(tutorialGrid){tg.strokeStyle='#9cd9ef65';tg.lineWidth=1;for(const a of live){const p=toPx(a.p.at(-1));tg.beginPath();tg.moveTo(p[0]-a.v[0]*s*2,p[1]-a.v[1]*s*2);tg.lineTo(p[0]+a.v[0]*s*2,p[1]+a.v[1]*s*2);tg.stroke();}}
    const suggested=tutorialHint?live.find(a=>!blockersOf(a)):null;
    for (const a of live) {
      if (anim && anim.a === a) continue;
      const red = flash && flash.a === a && now < flash.end;
      drawArrowPx(a.p.map(toPx), red ? '#e53946' : a===suggested ? '#f7aaff' : tutColor(a, a.i), w);
    }
    if(tutKey>=0&&live[tutKey]){const p=toPx(live[tutKey].p.at(-1));tg.save();tg.strokeStyle='#fff';tg.lineWidth=2;tg.setLineDash([3,3]);tg.beginPath();tg.arc(p[0],p[1],k*.45,0,Math.PI*2);tg.stroke();tg.restore()}
    if (anim) {
      const prog = reduceMotion?1:Math.min(1, (now - anim.start) / 420), tr = trailPx(anim.a, 0);
      drawArrowPx(trailPx(anim.a, prog * tr.total).out, tutColor(anim.a, anim.a.i), w);
      if (prog >= 1) { live = live.filter((b) => b !== anim.a); anim = null; afterEscape(); }
    }
    if (anim || (flash && now < flash.end + 30)) tutRaf = requestAnimationFrame(drawTut);
  }

  function setText(head, text) { $id('aeTutHead').textContent = head; $id('aeTutText').textContent = text; }

  function afterEscape() {
    cleared++;
    if (!live.length) {
      $id('aeTutStep').textContent = 'ALL CLEAR';
      setText('You’ve got it!',
        'Clear every arrow to finish a level. You have 3 lives ♥. Use the two hint buttons below when stuck. Pinch inward to shrink the puzzle and outward to zoom in.');
      $id('aeTutGo').hidden = false;
      $id('aeTutGo').textContent = 'Play real game';
    } else if (cleared === 1) {
      setText('Nice escape!', 'Moving one arrow often clears the way for another. Keep going.');
    } else {
      setText('Keep going', live.length === 1 ? 'Last one!' : live.length + ' arrows left.');
    }
    drawTut(performance.now());
  }

  function pickAt(px,py,type){const k=cellPx();return arrowHit(live,px/k-.5,py/k-.5,k,type).arrow}
  const tutTap=createTapGuard();
  function tutLocal(e){const r=tb.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]}
  function activateTut(a){if(!a||anim||!live.length||!live.includes(a))return;if(blockersOf(a)){flash={a,end:performance.now()+(reduceMotion?1:450)};try{if(navigator.vibrate)navigator.vibrate(50)}catch{}setText('Blocked!','Something is in its way. In the real game that costs a life, so check the path before you tap.')}else anim={a,start:performance.now()};cancelAnimationFrame(tutRaf);tutRaf=requestAnimationFrame(drawTut)}
  tb.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;const p=tutLocal(e);tutTap.down(e.pointerId,p,anim?null:pickAt(...p,e.pointerType),e.pointerType);try{tb.setPointerCapture(e.pointerId)}catch{}});
  tb.addEventListener('pointermove',e=>tutTap.move(e.pointerId,tutLocal(e)));
  tb.addEventListener('pointerup',e=>{const p=tutLocal(e);activateTut(tutTap.up(e.pointerId,p,pickAt(...p,e.pointerType)))});
  tb.addEventListener('pointercancel',()=>tutTap.cancel());
  tb.addEventListener('lostpointercapture',e=>{if(tutTap.has(e.pointerId))tutTap.cancel()});
  let tutKey=-1;
  tb.tabIndex=0;tb.setAttribute('aria-label','Practice arrow board. Use arrow keys to select, Enter to attempt escape.');
  tb.addEventListener('keydown',e=>{if(anim||!live.length||!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Enter',' '].includes(e.key))return;e.preventDefault();if(e.key==='Enter'||e.key===' '){if(tutKey<0)tutKey=0;else{const a=live[tutKey%live.length];tutKey=-1;activateTut(a)}}else tutKey=(tutKey<0?0:(tutKey+(e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1)+live.length)%live.length);if(tutKey>=0){$id('aeTutBoardStatus').textContent='Selected arrow '+(tutKey+1)+' of '+live.length+'. Enter to attempt escape.';drawTut(performance.now())}});
  tb.addEventListener('blur',()=>{tutKey=-1;if(tutOpen&&!anim)drawTut(performance.now())});
  $id('aeTutArrowHint').onclick=()=>{tutorialHint=!tutorialHint;$id('aeTutArrowHint').setAttribute('aria-pressed',String(tutorialHint));if(!anim)drawTut(performance.now());};
  $id('aeTutGridHint').onclick=()=>{tutorialGrid=!tutorialGrid;$id('aeTutGridHint').setAttribute('aria-pressed',String(tutorialGrid));if(!anim)drawTut(performance.now());};
  function openTutorial(thenPlay) {
    tutTap.cancel();tutKey=-1;tutorialGrid=tutorialHint=false;for(const id of ['aeTutArrowHint','aeTutGridHint'])$id(id).setAttribute('aria-pressed','false');
    tutThenPlay = thenPlay; tutOpen = true;
    live = PUZZLE.map((a, i) => ({ ...a, i })); anim = null; flash = null; cleared = 0;
    tut.hidden = false;
    $id('aeTutGo').hidden = false;$id('aeTutGo').textContent='Play real game';
    $id('aeTutStep').textContent = 'HOW TO PLAY';
    setText('Tap an arrow', 'Each arrow slides out the way its head points. Tap directly on one whose exit is clear, then release.');
    sizeBoard(); drawTut(performance.now());
  }
  function closeTutorial(done) {
    tutTap.cancel();tutKey=-1;tutOpen = false; tut.hidden = true; cancelAnimationFrame(tutRaf);
    if (done) store.set('ae-tutorial-done', '1');
    refreshMenu();
    if (tutThenPlay) hideTitle();
  }
  $id('aeTutGo').onclick = () => {tutThenPlay=true;closeTutorial(true);};
  $id('aePractice').onclick=()=>{if(startPractice()){tutThenPlay=true;closeTutorial(true);}};
  $id('aeTutSkip').onclick = () => closeTutorial(true);
  addEventListener('resize', () => { if (tutOpen) { sizeBoard(); drawTut(performance.now()); } });

  // ---------------------------------------------------------------- back button
  const prevBack = window.AE_back;
  window.AE_back = function () {
    if (tutOpen) { tutThenPlay = false; closeTutorial(false); return true; }
    if (S.mode==='training'){endPractice();return true;}
    if (document.querySelector('dialog[open]')) return prevBack ? prevBack() : false;
    if (titleOpen) return false; // on the title screen, Back leaves the app
    if (prevBack && prevBack()) return true;
    showTitle(false); // from the game, Back returns to the title screen
    return true;
  };

  const home = $id('aeHome');
  if (home) home.onclick = () => { showTitle(false); $id('quickControls').close(); pauseClock(); };
  // ---------------------------------------------------------------- go
  if ($id('result').open) $id('result').close();
  showTitle(true);
})();
