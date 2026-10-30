/* =====================================================================
   MEJORAS DE EXPERIENCIA (pensadas para celular)
   1. Las animaciones se CENTRAN solas en pantalla y arrancan ahí.
   2. Al terminar aparece "Sigue bajando ↓" + "↻ Ver otra vez".
   3. Aviso flotante "Sigue bajando" si la persona se queda quieta.
   4. Decoración: capítulos, divisores, pétalos, destellos, contadores…
   ===================================================================== */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const R = (a, b) => a + Math.random() * (b - a);
  const V = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (_) {} };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = reduce ? 'auto' : 'smooth';

  function init() {
    const main = $('#main-content');
    if (!main) return;
    const mainVisible = () => !main.classList.contains('hidden-element') && !$('#gate');
    const sections = () => $$('#main-content > section');

    /* ---------------------------------------------------------------
       Utilidades: centrar, destellos
       --------------------------------------------------------------- */
    function centerOn(el) {
      const r = el.getBoundingClientRect(), vh = innerHeight;
      const top = r.height >= vh - 8
        ? scrollY + r.top - 6                       // más alta que la pantalla: alinear arriba
        : scrollY + r.top + r.height / 2 - vh / 2;  // si cabe: centrar
      scrollTo({ top: Math.max(0, top), behavior });
    }

    const COLORS = ['#35CFC4', '#D9B96E', '#BDF5F0', '#ffffff', '#ff9ec4'];
    function pop(x, y, n = 14) {
      if (reduce) return;
      const G = ['♡', '✦', '✿', '♥', '✧'];
      for (let i = 0; i < n; i++) {
        const s = document.createElement('span');
        s.className = 'pop';
        s.textContent = G[Math.random() * G.length | 0];
        s.style.cssText = `left:${x}px;top:${y}px;--dx:${R(-110, 110)}px;--dy:${R(-190, -40)}px;--r:${R(-70, 70)}deg;` +
          `color:${COLORS[Math.random() * COLORS.length | 0]};font-size:${R(13, 28)}px`;
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1500);
      }
    }
    const popOn = (el, n) => { const r = el.getBoundingClientRect(); pop(r.left + r.width / 2, r.top + r.height / 2, n); };

    /* ---------------------------------------------------------------
       Decoración: capítulos + divisores
       --------------------------------------------------------------- */
    const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const noChapter = ['hero', 'surprise-section', 'galaxy-section', 'minigame-section'];
    const noDivider = ['souls-section', 'time-section', 'lock-section', 'tulip-section', 'surprise-section', 'galaxy-section'];
    let ch = 0;
    sections().forEach((sec) => {
      if (!noChapter.includes(sec.id)) {
        const t = $('.script-title', sec);
        if (t) {
          const label = document.createElement('span');
          label.className = 'chapter';
          label.textContent = 'Capítulo ' + (ROMAN[ch++] || ch);
          t.parentNode.insertBefore(label, t);
        }
      }
      if (!noDivider.includes(sec.id)) {
        const d = document.createElement('div');
        d.className = 'divider';
        d.setAttribute('aria-hidden', 'true');
        d.innerHTML = '<div><span></span><i>✦</i><svg viewBox="0 0 24 32" width="18" height="24"><path d="M12 31V15" stroke="#D9B96E" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M12 22c-4 0-6-2-7-5 3 0 6 1 7 5Zm0 0c4 0 6-2 7-5-3 0-6 1-7 5Z" fill="#35CFC4" opacity=".7"/><path d="M12 15C5 15 3.5 7 5 2c3 2 5 3 7 5 2-2 4-3 7-5 1.5 5 0 13-7 13Z" fill="#35CFC4"/><path d="M12 15C9 12 9 8 12 7c3 1 3 5 0 8Z" fill="#BDF5F0"/></svg><i>✦</i><span></span></div>';
        sec.after(d);
      }
    });

    /* pétalos que caen suavemente por toda la página */
    if (!reduce) {
      const layer = document.createElement('div');
      layer.id = 'petals';
      layer.setAttribute('aria-hidden', 'true');
      const PC = ['rgba(189,245,240,.95)', 'rgba(53,207,196,.75)', 'rgba(217,185,110,.7)', 'rgba(255,255,255,.95)'];
      for (let i = 0; i < 16; i++) {
        const p = document.createElement('i');
        p.style.cssText = `--x:${R(0, 100)}vw;--s:${R(9, 17)}px;--d:${R(15, 27)}s;--dl:${-R(0, 27)}s;--sw:${R(30, 90)}px;--c:${PC[i % PC.length]}`;
        layer.appendChild(p);
      }
      document.body.appendChild(layer);
    }

    /* ---------------------------------------------------------------
       ANIMACIONES: centrar al llegar, arrancar ahí, "Sigue bajando"
       --------------------------------------------------------------- */
    const makeRow = (after, replayBtn) => {
      const row = document.createElement('div');
      row.className = 'next-row';
      const rb = replayBtn || document.createElement('button');
      rb.type = 'button';
      rb.className = 'ghost-btn replay-btn';
      rb.textContent = '↻ Ver otra vez';
      const nb = document.createElement('button');
      nb.type = 'button';
      nb.className = 'next-btn';
      nb.innerHTML = 'Sigue bajando <span>↓</span>';
      row.append(rb, nb);
      after.after(row);
      return { row, rb, nb };
    };

    const items = [];

    // dos iframes 3D (almas y candado)
    [['#souls-section', '#souls-frame'], ['#lock-section', '#lock-frame']].forEach(([s, f]) => {
      const sec = $(s), el = $(f);
      if (!sec || !el) return;
      const it = { kind: 'frame', sec, el, ready: false, want: false, entered: false, done: false, v: 0 };
      Object.assign(it, makeRow(el));
      it.rb.addEventListener('click', () => { centerOn(sec); startItem(it); });
      items.push(it);
    });

    // tulipán (dentro de la página)
    const tSec = $('#tulip-section'), tStage = $('#tulip-stage'), tBtn = $('#tulip-start');
    if (tSec && tStage && tBtn) {
      const it = { kind: 'tulip', sec: tSec, el: tStage, entered: false, done: false, v: 0 };
      Object.assign(it, makeRow(tStage, tBtn));   // el botón original pasa a ser "Ver otra vez"
      const rep = $('.replay', tStage);
      if (rep) new MutationObserver(() => { rep.classList.contains('show') ? markDone(it) : unmarkDone(it); })
        .observe(rep, { attributes: true, attributeFilter: ['class'] });
      items.push(it);
    }

    // galaxia: solo se centra (arranca con su propio "Toca para empezar")
    const gSec = $('#galaxy-section');
    if (gSec) items.push({ kind: 'galaxy', sec: gSec, entered: false, v: 0 });

    const nextSection = (sec) => { const l = sections(); return l[l.indexOf(sec) + 1]; };
    items.forEach((it) => { if (it.nb) it.nb.addEventListener('click', () => goNext(it.sec)); });

    function markDone(it) {
      if (it.done) return;
      it.done = true; clearTimeout(it.fb);
      it.row.classList.add('done');
      V(14);
    }
    function unmarkDone(it) { it.done = false; it.row.classList.remove('done'); }

    function startItem(it) {
      if (it.kind === 'galaxy') return;
      unmarkDone(it);
      clearTimeout(it.fb);
      it.fb = setTimeout(() => markDone(it), it.kind === 'frame' ? 28000 : 24000); // por si acaso
      if (it.kind === 'frame') {
        if (!it.ready) { it.want = true; return; }
        try { it.el.contentWindow.postMessage({ epic: true, type: 'play' }, '*'); } catch (_) {}
      } else if (it.kind === 'tulip') {
        it.rb.click();                       // usa el manejador original (resize + start)
      }
    }
    function stopItem(it) {
      clearTimeout(it.fb);
      if (it.kind === 'frame') {
        it.want = false;
        try { it.el.contentWindow.postMessage({ epic: true, type: 'stop' }, '*'); } catch (_) {}
      } else if (it.kind === 'tulip') {
        try { window.Tulipan && window.Tulipan.stop(); } catch (_) {}
      }
    }

    window.addEventListener('message', (e) => {
      const d = e.data;
      if (!d || !d.epic) return;
      const it = items.find((x) => x.kind === 'frame' && x.el.contentWindow === e.source);
      if (!it) return;
      if (d.type === 'ready') { it.ready = true; if (it.want) { it.want = false; startItem(it); } }
      if (d.type === 'done') markDone(it);
    });

    /* detector de "se quedó quieto": ahí centramos y arrancamos */
    let touching = false, idleT;
    const schedule = () => { clearTimeout(idleT); idleT = setTimeout(evaluate, 150); };
    addEventListener('touchstart', () => { touching = true; }, { passive: true });
    const release = () => { touching = false; schedule(); };
    addEventListener('touchend', release, { passive: true });
    addEventListener('touchcancel', release, { passive: true });
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);

    function evaluate() {
      if (touching || !mainVisible()) return;
      const vh = innerHeight;
      let best = null, bv = 0;
      items.forEach((it) => {
        const r = it.sec.getBoundingClientRect();
        it.v = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / Math.min(r.height, vh);
        if (it.v > bv) { bv = it.v; best = it; }
      });
      items.forEach((it) => {
        if (it !== best && it.entered && it.v < .15) { it.entered = false; stopItem(it); }
      });
      if (best && bv >= .5 && !best.entered) {
        best.entered = true;
        centerOn(best.sec);
        if (best.kind !== 'galaxy') setTimeout(() => { if (best.entered) startItem(best); }, 700);
      }
    }

    // la galaxia se centra también al tocar "Toca para empezar"
    const intro = $('#intro');
    if (intro && gSec) intro.addEventListener('pointerdown', () => centerOn(gSec), true);

    /* ---------------------------------------------------------------
       "Sigue bajando" flotante cuando se queda quieta un rato
       --------------------------------------------------------------- */
    function currentSection() {
      const mid = innerHeight / 2;
      let best = null, bd = Infinity;
      sections().forEach((s) => {
        const r = s.getBoundingClientRect();
        const d = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
        if (d < bd) { bd = d; best = s; }
      });
      return best;
    }
    function goNext(from) {
      const cur = from || currentSection();
      const nxt = cur && nextSection(cur);
      if (nxt) centerOn(nxt);
      else scrollTo({ top: document.documentElement.scrollHeight, behavior });
      V(10);
    }

    const hint = document.createElement('button');
    hint.id = 'next-hint';
    hint.type = 'button';
    hint.innerHTML = 'Sigue bajando <span>↓</span>';
    document.body.appendChild(hint);
    hint.addEventListener('click', () => { hint.classList.remove('show'); goNext(); });

    const needs = {
      'scratch-section': () => $('.scratch-container')?.classList.contains('revealed'),
      'memory-section': () => !$('#memory-success')?.classList.contains('hidden-element'),
      'minigame-section': () => !$('#game-result')?.classList.contains('hidden-element'),
      'surprise-section': () => !$('#final-message')?.classList.contains('hidden-element')
    };
    let lastAct = Date.now();
    const bump = () => { lastAct = Date.now(); hint.classList.remove('show'); };
    ['scroll', 'touchstart', 'touchmove', 'pointerdown', 'keydown', 'wheel'].forEach((ev) => addEventListener(ev, bump, { passive: true }));
    setInterval(() => {
      if (Date.now() - lastAct < 7000 || hint.classList.contains('show') || !mainVisible()) return;
      const modal = $('#reason-modal');
      if (modal && getComputedStyle(modal).display !== 'none') return;
      if (scrollY + innerHeight >= document.documentElement.scrollHeight - 60) return;
      const cur = currentSection();
      if (!cur || cur.id === 'galaxy-section') return;
      if (needs[cur.id] && !needs[cur.id]()) return;                 // todavía tiene algo que hacer ahí
      const it = items.find((x) => x.sec === cur);
      if (it && it.kind !== 'galaxy' && !it.done) return;            // la animación sigue corriendo
      hint.classList.add('show');
    }, 1000);

    /* ---------------------------------------------------------------
       Detallitos
       --------------------------------------------------------------- */
    // Galería: aviso de candado, puntitos y contador
    const gal = $('#gallery-section'), car = $('#photo-carousel');
    if (gal) {
      const note = document.createElement('div');
      note.className = 'lock-note';
      note.innerHTML = '🔒 Encuentra todas las parejas<br>para desbloquear tus recuerdos';
      gal.appendChild(note);
    }
    if (car) {
      const cards = $$('.photo-card', car);
      const dots = document.createElement('div');
      dots.className = 'dots';
      cards.forEach((c, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Foto ' + (i + 1));
        b.addEventListener('click', () => c.scrollIntoView({ behavior, inline: 'center', block: 'nearest' }));
        dots.appendChild(b);
      });
      car.after(dots);
      const paint = () => {
        const cr = car.getBoundingClientRect(), mid = cr.left + cr.width / 2;
        let bi = 0, bd = Infinity;
        cards.forEach((c, i) => {
          const r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid);
          if (d < bd) { bd = d; bi = i; }
        });
        $$('button', dots).forEach((b, i) => b.classList.toggle('on', i === bi));
      };
      car.addEventListener('scroll', () => requestAnimationFrame(paint), { passive: true });
      paint();
      setTimeout(paint, 600);
    }

    // 20 razones: contador + celebración al descubrir todas
    const grid = $('#reasons-grid');
    if (grid) {
      const total = $$('.reason-item', grid).length;
      const meter = document.createElement('div');
      meter.className = 'reasons-meter';
      meter.innerHTML = `<div class="bar"><b></b></div><p><span>0</span> / ${total} descubiertas</p>`;
      grid.after(meter);
      let all = false;
      grid.addEventListener('click', (e) => {
        if (!e.target.closest('.reason-item')) return;
        setTimeout(() => {
          const n = $$('.reason-item.opened', grid).length;
          $('b', meter).style.width = (n / total * 100) + '%';
          if (!all) $('p', meter).innerHTML = `<span>${n}</span> / ${total} descubiertas`;
          if (n === total && !all) {
            all = true;
            $('p', meter).textContent = '¡Las 20! Y siempre habrá una más ♡';
            meter.classList.add('complete');
            popOn(meter, 28); V([60, 40, 60, 40, 200]);
          }
        }, 60);
      });
    }

    // Sobres: que el mensaje abierto siempre quede a la vista
    document.addEventListener('click', (e) => {
      const env = e.target.closest('.envelope');
      if (!env) return;
      setTimeout(() => {
        if (!env.classList.contains('open')) return;
        const r = env.getBoundingClientRect();
        if (r.bottom > innerHeight - 24 || r.top < 70) {
          scrollTo({ top: scrollY + r.top + r.height / 2 - innerHeight / 2, behavior });
        }
      }, 340);
    });

    // Tarjeta secreta: lluvia de destellos al descubrirla
    const sp = $('#scratch-pad');
    if (sp) sp.addEventListener('click', () => popOn(sp, 22));

    // Contador: "latido" cada segundo
    const sec = $('#time-grid .time-box:last-child b');
    if (sec) new MutationObserver(() => {
      sec.classList.remove('tick'); void sec.offsetWidth; sec.classList.add('tick');
    }).observe(sec, { childList: true, characterData: true, subtree: true });

    // Música: anillo que late mientras suena
    const bgm = $('#bg-music'), mb = $('#music-btn');
    if (bgm && mb) {
      const sync = () => mb.classList.toggle('playing', !bgm.paused);
      ['play', 'pause', 'ended'].forEach((ev) => bgm.addEventListener(ev, sync));
      sync();
    }

    // Final: lluvia de corazones al llegar al pie de página
    const foot = $('.site-footer');
    if (foot && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => {
        if (es.some((x) => x.isIntersecting)) {
          io.disconnect();
          [0, 500, 1000].forEach((t) => setTimeout(() => pop(R(.2, .8) * innerWidth, innerHeight * .7, 16), t));
          V([80, 50, 80, 50, 220]);
        }
      }, { threshold: .6 });
      io.observe(foot);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
