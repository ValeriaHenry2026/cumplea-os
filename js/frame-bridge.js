/* =====================================================================
   PUENTE IFRAME ⇄ PÁGINA PRINCIPAL
   Se carga dentro de almas.html y candado.html.
   - Espera a que la animación esté lista y se lo avisa a la página.
   - Escucha "play" / "stop" para arrancar la animación solo cuando
     está centrada en pantalla (y pausarla cuando se sale).
   - Avisa "done" cuando termina para mostrar "Sigue bajando".
   ===================================================================== */
(() => {
  const cls = document.body.className;
  const name = /page-almas/.test(cls) ? 'almas' : /page-candado/.test(cls) ? 'candado' : null;
  if (!name) return;
  const api = () => (name === 'almas' ? window.Almas : window.Candado);
  const alone = window.parent === window;              // abierto suelto, sin la página principal
  const send = (type) => { if (alone) return; try { window.parent.postMessage({ epic: true, frame: name, type }, '*'); } catch (_) {} };

  let pending = false;
  const sayReady = () => {
    send('ready');
    if (alone) { const a = api(); if (a) a.start(); return; }
    if (pending) { pending = false; const a = api(); if (a) a.start(); }
  };
  if (window.__epicReady) sayReady();
  else window.addEventListener('epic:ready', sayReady, { once: true });

  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || !d.epic) return;
    const a = api();
    if (!a) return;
    if (d.type === 'play') { if (window.__epicReady) a.start(); else pending = true; }
    if (d.type === 'stop') { a.stop(); }
  });

  // "done" = aparece el letrerito de "toca para verlo otra vez"
  const replay = document.getElementById('replay');
  if (replay) {
    new MutationObserver(() => { if (replay.classList.contains('show')) send('done'); })
      .observe(replay, { attributes: true, attributeFilter: ['class'] });
  }
})();
