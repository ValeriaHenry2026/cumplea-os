/* ============ CONFIGURA AQUÍ ============ */
const GATE_CFG = {
  fechas: ['21/03/2026'],                 // fecha(s) válidas, formato DD/MM/AAAA
  voz: 'audio/mensaje-henry.mp3',         // tu nota de voz (usa mp3 o m4a)
  sobreVoz: /no estemos cerca/i           // título del sobre que lleva tu voz
};

(() => {
  const CFG = GATE_CFG;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)], R = (a, b) => a + Math.random() * (b - a);
  const V = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  window.vibra = V;
  const MES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  /* ---------- 1. CANDADO ---------- */
  const welcome = $('#welcome-screen'), bgm = $('#bg-music');
  if (welcome) welcome.style.display = 'none';
  const g = document.createElement('div');
  g.id = 'gate';
  g.innerHTML = `<canvas id="gate-cv"></canvas>
  <div class="gate-card">
    <div class="lock-wrap">
      <div class="orb"><i>✦</i><i>✧</i><i>✦</i></div>
      <svg class="lock" viewBox="0 0 120 150" aria-hidden="true">
        <defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0bd"/><stop offset=".5" stop-color="#D9B96E"/><stop offset="1" stop-color="#a8832f"/></linearGradient></defs>
        <path class="shackle" d="M36 68V50a24 24 0 0 1 48 0v18" fill="none" stroke="url(#gold)" stroke-width="10" stroke-linecap="round"/>
        <rect x="18" y="66" width="84" height="66" rx="16" fill="url(#gold)"/>
        <text x="60" y="110" text-anchor="middle" font-size="36" fill="#7a5a14">♥</text>
      </svg>
    </div>
    <h1 class="g-title">Solo para Valeria</h1>
    <p class="g-sub">Para abrir este regalo, dime...<b>¿Cuándo empezó nuestra historia?</b></p>
    <div class="g-date">
      <input inputmode="numeric" maxlength="2" placeholder="DD" aria-label="Día"><span>/</span>
      <input inputmode="numeric" maxlength="2" placeholder="MM" aria-label="Mes"><span>/</span>
      <input inputmode="numeric" maxlength="4" placeholder="AAAA" aria-label="Año">
    </div>
    <p class="g-msg"></p>
    <button class="elegant-btn g-btn" type="button">Abrir ♡</button>
  </div>`;
  document.body.appendChild(g);

  const card = $('.gate-card'), msg = $('.g-msg'), ins = $$('.g-date input');
  const [D, M] = CFG.fechas[0].split('/').map(Number);
  let n = 0, done = 0, go = 1;

  /* estrellas, estrellas fugaces y explosión de corazones */
  const cv = $('#gate-cv'), c = cv.getContext('2d');
  let W, H;
  const fit = () => { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0); };
  fit(); addEventListener('resize', fit);
  const st = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random(), r: R(.4, 1.6), p: R(0, 6), s: R(.5, 2) }));
  const B = [], GL = ['♥', '✦', '♡', '✧'], GC = ['#D9B96E', '#35CFC4', '#fff', '#ff9ec4', '#BDF5F0'];
  let sh = null;
  const burst = (x, y) => { for (let i = 0; i < 110; i++) { const a = R(0, 6.28), v = R(2, 9); B.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, l: 1, s: R(10, 24), c: GL[Math.random() * 4 | 0], k: GC[Math.random() * 5 | 0] }); } };
  const lp = t => {
    c.clearRect(0, 0, W, H);
    st.forEach(s => { c.globalAlpha = .3 + .7 * Math.abs(Math.sin(t / 1000 * s.s + s.p)); c.fillStyle = s.r > 1.3 ? '#D9B96E' : '#fff'; c.beginPath(); c.arc(s.x * W, s.y * H, s.r, 0, 6.28); c.fill(); });
    if (!sh && Math.random() < .005) sh = { x: R(.3, 1) * W, y: R(0, .4) * H, l: 1 };
    if (sh) { c.globalAlpha = sh.l; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(sh.x, sh.y); c.lineTo(sh.x + 70, sh.y - 35); c.stroke(); sh.x -= 9; sh.y += 4.5; sh.l -= .03; if (sh.l <= 0) sh = null; }
    for (let i = B.length - 1; i >= 0; i--) {
      const b = B[i]; b.x += b.vx; b.y += b.vy; b.vx *= .98; b.vy = b.vy * .98 + .12; b.l -= .012;
      if (b.l <= 0) { B.splice(i, 1); continue; }
      c.globalAlpha = b.l; c.fillStyle = b.k; c.font = b.s + 'px serif'; c.fillText(b.c, b.x, b.y);
    }
    c.globalAlpha = 1;
    if (go) requestAnimationFrame(lp);
  };
  requestAnimationFrame(lp);

  /* campos de fecha: solo números, salto automático */
  ins.forEach((el, i) => {
    el.addEventListener('input', () => { el.value = el.value.replace(/\D/g, ''); if (el.value.length === el.maxLength && ins[i + 1]) ins[i + 1].focus(); V(8); });
    el.addEventListener('keydown', e => { if (e.key === 'Backspace' && !el.value && ins[i - 1]) ins[i - 1].focus(); if (e.key === 'Enter') check(); });
  });

  const ok = () => {
    done = 1; ins.forEach(i => i.disabled = true);
    g.classList.add('open'); V([80, 50, 80, 50, 220]);
    const r = $('.lock').getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height * .55);
    setTimeout(() => burst(innerWidth / 2, innerHeight * .4), 500);
    msg.className = 'g-msg'; msg.textContent = 'Bienvenida, mi amor ♡';
    if (bgm) { bgm.volume = .4; bgm.play().catch(() => {}); }
    setTimeout(() => g.classList.add('out'), 1800);
    setTimeout(() => { go = 0; g.remove(); if (welcome) welcome.style.display = ''; }, 2800);
  };
  const bad = (txt) => {
    n++; card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); V([120, 60, 120]);
    msg.className = 'g-msg err';
    msg.textContent = txt || (n >= 4 ? `Pista: fue el ${D} de ${MES[M - 1]} ♡` : n >= 2 ? `Pista: fue en ${MES[M - 1]} ♡` : 'Mmm... esa no es 🥺 piénsalo con el corazón');
    ins.forEach(i => i.value = ''); ins[0].focus();
  };
  const check = () => {
    if (done) return;
    if (ins.some(i => !i.value)) { msg.className = 'g-msg err'; msg.textContent = 'Escribe día, mes y año ♡'; V(40); return; }
    const v = ins.map(i => +i.value);
    CFG.fechas.some(f => { const [a, b, y] = f.split('/').map(Number); return a === v[0] && b === v[1] && y === v[2]; }) ? ok() : bad();
  };
  $('.g-btn').addEventListener('click', check);

  /* ---------- 2. VIBRACIÓN + VOZ (cuando la página ya cargó) ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const latido = k => { let i = 0; const t = setInterval(() => { V([70, 90, 110]); if (++i >= k) clearInterval(t); }, 1000); };
    document.addEventListener('click', e => {
      const t = e.target;
      if (t.closest('.voz')) return;
      if (t.closest('.reason-item')) V(35);
      else if (t.closest('.envelope')) V([25, 40, 25]);
      else if (t.closest('.memory-card')) V(18);
      else if (t.closest('#scratch-pad')) V([40, 30, 90]);
      else if (t.closest('#btn-infinito')) V([60, 40, 60, 40, 200]);
      else if (t.closest('#open-gift-btn')) V([30, 40, 120]);
      else if (t.closest('#music-btn')) V(15);
      else if (t.closest('#surprise-btn')) latido(7);
    }, true);
    document.addEventListener('touchstart', e => { if (e.target.closest('.runaway')) V(25); }, { passive: true, capture: true });
    const intro = $('#intro'); if (intro) intro.addEventListener('pointerdown', () => V([50, 60, 50, 60, 300]));
    const gal = $('#gallery-section'); let un = 0;
    if (gal) new MutationObserver(() => { if (!un && gal.classList.contains('unlocked')) { un = 1; V([100, 60, 100, 60, 300]); } }).observe(gal, { attributes: true, attributeFilter: ['class'] });

    /* mensaje de voz dentro del sobre */
    const envs = $$('.envelope');
    const env = envs.find(e => CFG.sobreVoz.test(e.textContent)) || envs[2];
    if (!env) return;
    const bars = Array.from({ length: 28 }, () => `<i style="--h:${R(25, 100) | 0};--d:${R(0, .8).toFixed(2)}s"></i>`).join('');
    const box = document.createElement('div');
    box.innerHTML = `<div class="voz"><button class="voz-btn" type="button" aria-label="Reproducir mensaje">▶</button><div class="voz-mid"><div class="voz-bars">${bars}</div><div class="voz-bar"><b></b></div></div><span class="voz-t">0:00</span></div><p class="voz-cap">🎙️ Un mensaje de Henry, solo para ti</p>`;
    env.querySelector('.envelope-msg').appendChild(box);
    const voz = box.querySelector('.voz'), btn = box.querySelector('.voz-btn'), prog = box.querySelector('.voz-bar b'), tm = box.querySelector('.voz-t');
    voz.addEventListener('click', e => e.stopPropagation());
    const au = new Audio(CFG.voz); au.preload = 'metadata';
    const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    let pv = .4, tw;
    const fade = to => { clearInterval(tw); tw = setInterval(() => { if (!bgm) return clearInterval(tw); const d = to - bgm.volume; if (Math.abs(d) < .03) { bgm.volume = to; clearInterval(tw); } else bgm.volume = Math.max(0, Math.min(1, bgm.volume + Math.sign(d) * .03)); }, 60); };
    au.addEventListener('loadedmetadata', () => tm.textContent = fmt(au.duration));
    au.addEventListener('timeupdate', () => { if (au.duration) { prog.style.width = au.currentTime / au.duration * 100 + '%'; tm.textContent = fmt(au.currentTime); } });
    au.addEventListener('play', () => { voz.classList.add('playing'); btn.textContent = '⏸'; V(30); if (bgm) { pv = bgm.volume || .4; fade(.08); } });
    const stop = () => { voz.classList.remove('playing'); btn.textContent = '▶'; if (bgm) fade(pv); };
    au.addEventListener('pause', stop);
    au.addEventListener('ended', () => { stop(); prog.style.width = '0'; tm.textContent = fmt(au.duration); });
    au.addEventListener('error', () => { tm.textContent = '—'; console.warn('No se encontró', CFG.voz); });
    btn.addEventListener('click', () => { au.paused ? au.play().catch(() => {}) : au.pause(); });
    box.querySelector('.voz-bar').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(); if (au.duration) au.currentTime = (e.clientX - r.left) / r.width * au.duration; });
    new MutationObserver(() => { if (!env.classList.contains('open')) au.pause(); }).observe(env, { attributes: true, attributeFilter: ['class'] });
  });
})();
