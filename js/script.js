document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. CONFIGURACIÓN ---
    const fotos = [
        { src: "img/cupidolyn.png", caption: "Uno de mis días favoritos contigo ♡" },
        { src: "img/img4.jpeg", caption: "Mi sonrisa favorita" },
        { src: "img/img5.jpeg", caption: "Un recuerdo que nunca quiero olvidar" },
       
        { src: "img/img9.jpeg", caption: "Y todavía nos faltan muchos más..." }
    ];

    const razones = [
        "Porque haces mis días mejores.", "Porque me desestresas.", "Por tu sonrisa que ilumina todo.",
        "Por cómo buscas a Dios.", "Por tu corazón noble.", "Por cómo me haces sentir.",
        "Porque puedo ser yo mismo.", "Por cada aventura juntos.", "Por tus locuras.",
        "Por tu risa contagiosa.", "Por tu inteligencia.", "Por la paz que me da abrazarte.",
        "Porque siempre me animas.", "Por lo especial que eres para mi 💕.", "Por tu fuerza y valentía.",
        "Porque a tu lado el tiempo vuela.", "Por las ganas de salir adelante.", "Por tu paciencia(aunque no sea mucha😂).",
        "Porque me haces ser mejor persona.", "Y simplemente... porque sos vos mi niña linda"
    ];

    const sobres = [
        { titulo: "Para cuando estés triste", mensaje: "Recuerda que Dios y las personas que te queremos estamos aquí para ti. Esta tristeza es pasajera. Te abrazo a la distancia. ♡" },
        { titulo: "Para cuando dudes de ti", mensaje: "Mírate con mis ojos. Eres increíble y capaz de lograr todo. Yo creo en ti." },
        { titulo: "Para cuando no estemos cerca", mensaje: "Cierra los ojos y recuerda mi voz. Mi corazón está contigo." },
        { titulo: "Para cuando tengas un mal día", mensaje: "Respira profundo. Dios tiene el control y yo estoy aquí para escucharte. Todo estará bien." },
        { titulo: "Para recordar el propósito", mensaje: "Dios no se equivoca. El lugar donde estás es parte de Su plan. Confía en Su tiempo. ✝" }
    ];

    const coloresParticulas = ['#35CFC4', '#BDF5F0', '#D9B96E', '#FFFFFF'];

    // --- 2. FONDO INTERACTIVO DE PANTALLA INICIAL ---
    const canvasBg = document.getElementById('particle-canvas');
    const ctxBg = canvasBg.getContext('2d');
    canvasBg.width = window.innerWidth; canvasBg.height = window.innerHeight;
    let particlesArray = [];
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvasBg.width;
            this.y = Math.random() * canvasBg.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
        }
        update() {
            this.x += this.speedX; this.y += this.speedY;
            if (this.size > 0.2) this.size -= 0.005;
        }
        draw() {
            ctxBg.fillStyle = 'rgba(255,255,255,0.5)';
            ctxBg.beginPath(); ctxBg.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctxBg.fill();
        }
    }
    function initParticles() { for (let i = 0; i < 50; i++) particlesArray.push(new Particle()); }
    function animateParticles() {
        ctxBg.clearRect(0, 0, canvasBg.width, canvasBg.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update(); particlesArray[i].draw();
            if (particlesArray[i].size <= 0.2) { particlesArray.splice(i, 1); i--; particlesArray.push(new Particle()); }
        }
        requestAnimationFrame(animateParticles);
    }
    initParticles(); animateParticles();

    // --- 3. APERTURA Y MÚSICA ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    const musicIcon = document.getElementById('music-icon');
    const updateMusicButton = () => {
        const isPlaying = !bgMusic.paused;
        musicIcon.textContent = isPlaying ? '⏸' : '🎵';
        musicBtn.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
    };
    const playMusic = async () => {
        bgMusic.volume = 0.4;
        try {
            await bgMusic.play();
        } catch (error) {
            if (error.name !== 'NotAllowedError') {
                console.error('No se pudo reproducir audio/CumpleVale.mp3:', error);
            }
        }
        updateMusicButton();
    };

    bgMusic.addEventListener('play', updateMusicButton);
    bgMusic.addEventListener('pause', updateMusicButton);
    bgMusic.addEventListener('ended', updateMusicButton);
    playMusic();

    document.getElementById('open-gift-btn').addEventListener('click', () => {
        playMusic();
        welcomeScreen.style.opacity = '0';
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
            mainContent.classList.remove('hidden-element');
            musicBtn.classList.remove('hidden-element');
            document.body.classList.remove('no-scroll');
        }, 1000);
    });

    musicBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            playMusic();
        } else {
            bgMusic.pause();
        }
    });

    // --- 4. MINIJUEGO 1: TOCA Y DESCUBRE ---
    const scratchPad = document.getElementById('scratch-pad');
    scratchPad.addEventListener('click', () => {
        scratchPad.disabled = true;
        scratchPad.parentElement.querySelector('.scratch-secret').setAttribute('aria-hidden', 'false');
        scratchPad.parentElement.classList.add('revealed');
    });

    // --- 5. MINIJUEGO 2: TABLERO DE MEMORIA ---
    const memorySymbols = ['🌷', '💍', '✝️', '✈️'];
    let gameCards = [...memorySymbols, ...memorySymbols]; // 4 pares (8 cartas)
    gameCards.sort(() => 0.5 - Math.random()); // Mezclar
    
    const memoryBoard = document.getElementById('memory-board');
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let matchesFound = 0;

    gameCards.forEach(symbol => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="memory-card-front">♡</div>
                <div class="memory-card-back">${symbol}</div>
            </div>
        `;
        card.addEventListener('click', flipCard);
        memoryBoard.appendChild(card);
    });

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;
        this.classList.add('flipped');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }
        secondCard = this;
        checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.innerHTML === secondCard.innerHTML;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        resetBoard();
        matchesFound++;
        if (matchesFound === 4) {
            setTimeout(() => {
                document.getElementById('memory-success').classList.remove('hidden-element');
                document.getElementById('gallery-section').classList.add('unlocked'); // Desbloquea la galería
            }, 500);
        }
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 1000);
    }

    function resetBoard() { [hasFlippedCard, lockBoard] = [false, false]; [firstCard, secondCard] = [null, null]; }

    // --- 6. GENERACIÓN DINÁMICA DE SECCIONES ---
    
    // Galería
    const carousel = document.getElementById('photo-carousel');
    fotos.forEach((foto, i) => {
        const div = document.createElement('div');
        div.className = 'photo-card';
        div.style.setProperty('--rot', Math.random() * 6 - 3);
        div.innerHTML = `<img src="${foto.src}" onerror="this.src='https://via.placeholder.com/300x400/BDF5F0/168F8A?text=Foto+${i+1}'"><p class="photo-caption">${foto.caption}</p>`;
        carousel.appendChild(div);
    });
    document.getElementById('gallery-prev').addEventListener('click', () => {
        carousel.scrollBy({ left: -carousel.clientWidth * 0.85, behavior: 'smooth' });
    });
    document.getElementById('gallery-next').addEventListener('click', () => {
        carousel.scrollBy({ left: carousel.clientWidth * 0.85, behavior: 'smooth' });
    });

    // 20 Razones
    const reasonsGrid = document.getElementById('reasons-grid');
    const modal = document.getElementById('reason-modal');
    razones.forEach((razon, i) => {
        const btn = document.createElement('div');
        btn.className = 'reason-item'; btn.textContent = i + 1;
        btn.addEventListener('click', () => {
            btn.classList.add('opened');
            document.getElementById('reason-text').textContent = razon;
            modal.style.display = 'flex';
        });
        reasonsGrid.appendChild(btn);
    });
    document.querySelector('.close-modal').addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // Sobres
    const envelopesContainer = document.getElementById('envelopes-container');
    sobres.forEach(sobre => {
        const div = document.createElement('div');
        div.className = 'envelope';
        div.innerHTML = `<div class="envelope-title">💌 ${sobre.titulo}</div><div class="envelope-msg">${sobre.mensaje}</div>`;
        div.addEventListener('click', () => div.classList.toggle('open'));
        envelopesContainer.appendChild(div);
    });

    // --- 7. MINIJUEGO 3: BOTONES ESCURRIDIZOS ---
    const moveBtn = (btn) => {
        const parent = btn.parentElement;
        btn.style.left = Math.floor(Math.random() * (parent.clientWidth - btn.clientWidth)) + 'px';
        btn.style.top = Math.floor(Math.random() * (parent.clientHeight - btn.clientHeight)) + 'px';
    };
    document.querySelectorAll('.runaway').forEach(btn => {
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); moveBtn(btn); });
        btn.addEventListener('mouseover', () => moveBtn(btn));
    });
    document.getElementById('btn-infinito').addEventListener('click', () => {
        document.getElementById('game-result').classList.remove('hidden-element');
        lanzarConfeti(15);
    });

    // --- 8. SORPRESA FINAL ---
    const surpriseBtn = document.getElementById('surprise-btn');
    const finalMessage = document.getElementById('final-message');
    surpriseBtn.addEventListener('click', () => {
        surpriseBtn.classList.add('hidden-element');
        finalMessage.classList.remove('hidden-element');
        finalMessage.classList.add('reveal-animation');
        lanzarConfeti(60);
        setTimeout(() => finalMessage.scrollIntoView({ behavior: 'smooth' }), 200);
    });

    // Utilidades comunes (Observer de scroll y Confeti)
    window.addEventListener('scroll', () => {
        const wScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        document.getElementById("progress-bar").style.width = (wScroll / height) * 100 + "%";
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.15 });
    document.querySelectorAll('.observe').forEach(sec => observer.observe(sec));

    function lanzarConfeti(cantidad) {
        for (let i = 0; i < cantidad; i++) {
            const p = document.createElement('div');
            p.classList.add('particle-confetti');
            const size = Math.random() * 8 + 6;
            p.style.width = `${size}px`; p.style.height = `${size}px`;
            p.style.background = coloresParticulas[Math.floor(Math.random() * coloresParticulas.length)];
            p.style.left = `${Math.random() * 100}vw`; p.style.top = `-10px`;
            p.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';
            p.style.animationDuration = `${Math.random() * 2 + 2}s`;
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 4000);
        }
    }
});

/* =====================================================================
   FELIZ CUMPLEAÑOS ♥  ·  HTML5 + CSS3 + JavaScript + Three.js
   ---------------------------------------------------------------------
   Escenas:  Intro  →  Túnel de estrellas  →  Corazón de partículas
   sobre un portal, frases flotando y cámara orbitando.
   ===================================================================== */

/* ============================ CONFIGURACIÓN ============================ */
const CONFIG = {
  // Frases que flotan alrededor del corazón (puedes cambiarlas o añadir más)
  phrases: [
    'Te amo',
    'Eres mi estrella favorita',
    'Contigo por siempre',
    'Mi razón de ser',
    'Mi corazón te eligió',
    'Hasta las estrellas',
    'Brillamos más juntos',
    'Nuestro amor infinito',
    'Amor sin final',
    'Eres mi todo',
    'Para toda la eternidad',
    'Mi universo eres tú',
    'Un amor eterno',
    'Mi lugar favorito eres tú'
  ],

  // Tus propias imágenes (PNG con fondo transparente funcionan mejor).
  // Ejemplo: ['img/sticker1.png', 'img/sticker2.png']
  images: [],

  // Cuántas veces aparece cada frase / sticker en el escenario
  phraseCopies: 2,
  stickerCopies: 4,

  // Duración (segundos) del recorrido completo de la cámara antes de repetirse
  loopSeconds: 36
};

(() => {
  'use strict';

  /* ------------------------------ Elementos ------------------------------ */
  const $ = (id) => document.getElementById(id);
  const stage = $('stage'), intro = $('intro'), titleEl = $('title');
  const flash = $('flash'), hint = $('hint'), soundBtn = $('sound'), bgm = $('bg-music');

  if (typeof THREE === 'undefined') {
    intro.querySelector('.tap-text').textContent = 'No se pudo cargar Three.js';
    return;
  }

  const LOW = /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent) || Math.min(innerWidth, innerHeight) < 600;
  const Q = LOW ? 0.65 : 1;                     // factor de calidad (menos partículas en móvil)
  const rand = Math.random;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  /* ------------------------- Bokeh de corazones (CSS) ------------------------- */
  (function bokeh() {
    const box = $('bokeh');
    for (let i = 0; i < 22; i++) {
      const s = document.createElement('span');
      s.textContent = '♥';
      s.style.cssText =
        `--x:${rand() * 100}%;--y:${rand() * 100}%;--s:${40 + rand() * 90}px;` +
        `--b:${5 + rand() * 10}px;--d:${6 + rand() * 8}s;` +
        `--dx:${(rand() - .5) * 60}px;--dy:${(rand() - .5) * 60}px;opacity:${.25 + rand() * .45}`;
      box.appendChild(s);
    }
  })();

  /* ------------------------------ Renderer ------------------------------ */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: 'high-performance' });
  } catch (e) {
    intro.querySelector('.tap-text').textContent = 'Tu navegador no soporta WebGL';
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LOW ? 1.75 : 2));
  renderer.setClearColor(0x000000, 1);
  $('gl').appendChild(renderer.domElement);
  const glEl = renderer.domElement;

  const camera = new THREE.PerspectiveCamera(60, 1, 0.05, 600);
  const scene = new THREE.Scene();       // escena principal
  const warpScene = new THREE.Scene();   // túnel de estrellas

  const timeU = { value: 0 };
  const pixelU = { value: renderer.getPixelRatio() };
  const scaleU = { value: 1 };
  let W = 1, H = 1;

  function updateScale() {
    scaleU.value = (H * renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  }
  function resize() {
    const r = stage.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    updateScale();
  }
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
  resize();

  /* ------------------------------ Utilidades ------------------------------ */
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return t;
  }

  const glowTex = canvasTex(256, 256, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(130,255,245,1)');
    gr.addColorStop(.35, 'rgba(115,90,255,.5)');
    gr.addColorStop(1, 'rgba(70,40,180,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });

  function galaxyColor(out, i) {
    if (rand() < .2) { out.set([.2, .95, .9], i); }
    else if (rand() < .12) { out.set([.85, .8, 1], i); }
    else { out.set([.5 + rand() * .25, .2 + rand() * .18, .95], i); }
  }

  /* --------------------- Puntos brillantes (shader propio) --------------------- */
  const pointVS = `
    attribute float aSeed; attribute vec3 aColor;
    uniform float uTime, uSize, uScale, uPixel, uDrift;
    varying vec3 vColor; varying float vTw;
    void main(){
      vec3 p = position;
      p += vec3(sin(uTime*.8+aSeed*20.), cos(uTime*.7+aSeed*13.), sin(uTime*.6+aSeed*9.)) * uDrift;
      vec4 mv = modelViewMatrix * vec4(p, 1.);
      gl_Position = projectionMatrix * mv;
      float tw = .55 + .45 * sin(uTime*(1.5+aSeed*3.) + aSeed*60.);
      float size = uSize * (.5 + aSeed) * uScale / max(.1, -mv.z);
      gl_PointSize = clamp(size, 1.2*uPixel, 48.*uPixel);
      vColor = aColor; vTw = tw;
    }`;
  const pointFS = `
    varying vec3 vColor; varying float vTw;
    void main(){
      float d = length(gl_PointCoord - .5);
      float a = smoothstep(.5, .0, d); a = a*a*1.4;
      gl_FragColor = vec4(vColor * (.6 + vTw*.7), a * (.4 + vTw*.6));
    }`;

  function makePoints(pos, col, seed, size, drift) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: pointVS, fragmentShader: pointFS,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: timeU, uSize: { value: size }, uScale: scaleU, uPixel: pixelU, uDrift: { value: drift || 0 } }
    });
    const p = new THREE.Points(g, m);
    p.frustumCulled = false;
    return p;
  }

  /* ===================================================================
     ESCENA 1 · TÚNEL DE ESTRELLAS (warp)
     =================================================================== */
  const WARP_DUR = 2.8;
  const NS = Math.round(900 * Q);
  const streaks = [];
  const wPos = new Float32Array(NS * 12), wCol = new Float32Array(NS * 12);
  const wIdx = new Uint16Array(NS * 6);

  for (let i = 0; i < NS; i++) {
    streaks.push({ a: rand() * 6.2832, r: .35 + Math.pow(rand(), .7) * 14, z: -rand() * 140, w: .02 + rand() * .035 });
    const white = rand() < .45;
    const head = white ? [.65, 1, .96] : [.58, .35 + rand() * .25, 1];
    const tail = [.08, .12, .38];
    for (let v = 0; v < 4; v++) {
      const c = v < 2 ? head : tail;
      wCol.set(c, i * 12 + v * 3);
    }
    const b = i * 4;
    wIdx.set([b, b + 1, b + 2, b + 1, b + 3, b + 2], i * 6);
  }
  const wGeo = new THREE.BufferGeometry();
  wGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3).setUsage(THREE.DynamicDrawUsage));
  wGeo.setAttribute('color', new THREE.BufferAttribute(wCol, 3));
  wGeo.setIndex(new THREE.BufferAttribute(wIdx, 1));
  const wMesh = new THREE.Mesh(wGeo, new THREE.MeshBasicMaterial({
    vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  }));
  wMesh.frustumCulled = false;
  warpScene.add(wMesh);

  /* ===================================================================
     ESCENA 2 · CORAZÓN + PORTAL + FRASES
     =================================================================== */

  /* ---- Estrellas de fondo ---- */
  (function stars() {
    const n = Math.round(1400 * Q);
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const u = rand() * 2 - 1, a = rand() * 6.2832, s = Math.sqrt(1 - u * u), R = 40 + rand() * 120;
      pos.set([Math.cos(a) * s * R, u * R, Math.sin(a) * s * R], i * 3);
      if (rand() < .6) col.set([.55, .95, 1], i * 3); else col.set([.62, .45, 1], i * 3);
      seed[i] = rand();
    }
    scene.add(makePoints(pos, col, seed, .32, 0));
  })();

  /* ---- Corazón de partículas (dos contornos) ---- */
  const heartGroup = new THREE.Group();
  scene.add(heartGroup);

  function heartXY(t) {
    const s = Math.sin(t);
    return [16 * s * s * s, 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)];
  }
  function buildHeart(n, scale, thick, size) {
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const [x, y] = heartXY(rand() * 6.2832);
      const a = rand() * 6.2832, r = Math.pow(rand(), .6) * thick;
      pos[i * 3]     = x * scale + Math.cos(a) * r;
      pos[i * 3 + 1] = (y + 17) * scale + 1.0 + Math.sin(a) * r;
      pos[i * 3 + 2] = (rand() - .5) * thick * 1.8;
      galaxyColor(col, i * 3);
      seed[i] = rand();
    }
    return makePoints(pos, col, seed, size, .012);
  }
  const heartA = buildHeart(Math.round(3400 * Q), .075, .03, .04);
  const heartB = buildHeart(Math.round(2400 * Q), .064, .028, .036);
  heartB.rotation.y = .55;
  heartGroup.add(heartA, heartB);

  /* ---- Partículas que suben desde el portal ---- */
  (function risers() {
    const n = Math.round(520 * Q);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) seed[i] = rand();
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: timeU, uScale: scaleU, uPixel: pixelU },
      vertexShader: `
        attribute float aSeed; uniform float uTime, uScale, uPixel; varying float vA;
        void main(){
          float t = fract(aSeed*7.13 + uTime*(.08 + aSeed*.08));
          float ang = aSeed*40. + t*5.;
          float rad = (.12 + fract(aSeed*91.7)*.5) * (1. - t*.7);
          vec3 p = vec3(cos(ang)*rad, .3 + t*2.7, sin(ang)*rad);
          vec4 mv = modelViewMatrix * vec4(p, 1.);
          gl_Position = projectionMatrix * mv;
          vA = sin(t*3.14159);
          float size = .05 * (.6 + fract(aSeed*13.)) * uScale / max(.1, -mv.z);
          gl_PointSize = clamp(size, 1.2*uPixel, 40.*uPixel);
        }`,
      fragmentShader: `
        varying float vA;
        void main(){
          float d = length(gl_PointCoord - .5);
          float a = smoothstep(.5, .0, d);
          gl_FragColor = vec4(.35, .18, 1., a*a*vA*1.3);
        }`
    });
    const p = new THREE.Points(g, m);
    p.frustumCulled = false;
    heartGroup.add(p);
  })();

  /* ---- Portal (anillo brillante + pedestal) ---- */
  const portal = new THREE.Group();
  scene.add(portal);

  const addFlat = (geo, mat, y) => {
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2; m.position.y = y; portal.add(m); return m;
  };
  addFlat(new THREE.RingGeometry(.6, .98, 96),
    new THREE.MeshBasicMaterial({ color: 0x8d5cff, side: THREE.DoubleSide }), .02);
  addFlat(new THREE.RingGeometry(.98, 1.08, 96),
    new THREE.MeshBasicMaterial({ color: 0x65f5e9, transparent: true, opacity: .75, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), .025);

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(.5, .58, .34, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000 }));
  pedestal.position.y = .17;
  portal.add(pedestal);

  const topRing = new THREE.Mesh(
    new THREE.TorusGeometry(.5, .018, 12, 64),
    new THREE.MeshBasicMaterial({ color: 0x66eee6 }));
  topRing.rotation.x = Math.PI / 2; topRing.position.y = .345;
  portal.add(topRing);

  const portalGlow = addFlat(new THREE.PlaneGeometry(5.2, 5.2),
    new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false }), .03);

  const floorGlow = addFlat(new THREE.PlaneGeometry(22, 22),
    new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: .28, blending: THREE.AdditiveBlending, depthWrite: false }), .005);

  const ripples = [0, 1, 2].map(() => {
    const m = addFlat(new THREE.RingGeometry(.985, 1, 128),
      new THREE.MeshBasicMaterial({ color: 0x9166ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), .012);
    return m;
  });

  /* ---- Polvo brillante sobre el suelo ---- */
  const dust = (() => {
    const n = Math.round(2800 * Q);
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = rand() * 6.2832, r = 1.25 + Math.pow(rand(), .75) * 11;
      pos.set([Math.cos(a) * r, rand() * rand() * .35, Math.sin(a) * r], i * 3);
      if (rand() < .5) col.set([.15, .85 + rand() * .15, .85 + rand() * .15], i * 3); else galaxyColor(col, i * 3);
      seed[i] = rand();
    }
    const p = makePoints(pos, col, seed, .05, .03);
    scene.add(p);
    return p;
  })();

  /* ---- Frases + stickers flotantes ---- */
  const floaters = new THREE.Group();
  scene.add(floaters);
  const sprites = [];
  let spot = 0;

  function nextSpot() {
    const i = spot++;
    const a = i * 2.39996 + rand() * .4;
    const rad = 2.1 + Math.sqrt(((i * 37) % 50) / 50) * 7.2 + rand() * .6;
    return [Math.cos(a) * rad, Math.sin(a) * rad];
  }

  function addSprite(tex, aspect, height, y, kind) {
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 });
    const s = new THREE.Sprite(mat);
    const [x, z] = nextSpot();
    s.scale.set(height * aspect, height, 1);
    s.position.set(x, y, z);
    s.userData = { base: y, ph: rand() * 6.28, amp: kind === 'text' ? .05 + rand() * .12 : .03 + rand() * .05, kind };
    floaters.add(s);
    sprites.push(s);
  }

  function textTexture(text, px) {
    const c = document.createElement('canvas'), g = c.getContext('2d');
    const font = `${px}px "Patrick Hand","Comic Sans MS",cursive`;
    g.font = font;
    const w = Math.ceil(g.measureText(text).width + px), h = Math.ceil(px * 1.7);
    c.width = w; c.height = h;
    g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(95, 245, 235, 0.95)'; g.shadowBlur = px * .3;
    g.fillStyle = '#ffffff';
    g.fillText(text, w / 2, h / 2);
    g.fillText(text, w / 2, h / 2);
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
    return { tex: t, aspect: w / h };
  }

  /* Stickers kawaii dibujados con canvas (puedes añadir tus propias imágenes en CONFIG.images) */
  function drawFace(g, y, s) {
    g.shadowBlur = 0; g.shadowColor = 'transparent';
    g.fillStyle = '#43128c';
    [-24, 24].forEach((x) => { g.beginPath(); g.ellipse(x * s, y, 6 * s, 9 * s, 0, 0, 6.2832); g.fill(); });
    g.strokeStyle = '#28164f'; g.lineWidth = 4 * s; g.lineCap = 'round';
    g.beginPath(); g.arc(0, y + 8 * s, 8 * s, .15 * Math.PI, .85 * Math.PI); g.stroke();
    g.fillStyle = 'rgba(70, 240, 225, 0.5)';
    [-42, 42].forEach((x) => { g.beginPath(); g.ellipse(x * s, y + 12 * s, 9 * s, 6 * s, 0, 0, 6.2832); g.fill(); });
  }
  function stickerTexture(kind) {
    return canvasTex(256, 256, (g) => {
      g.translate(128, 134); g.lineJoin = 'round'; g.lineCap = 'round';
      g.beginPath();
      let fill = '#55eee5';
      if (kind === 'heart') {
        g.moveTo(0, 78); g.bezierCurveTo(-120, 0, -70, -90, 0, -38); g.bezierCurveTo(70, -90, 120, 0, 0, 78); g.closePath();
      } else if (kind === 'star') {
        for (let i = 0; i < 10; i++) {
          const r = i % 2 ? 40 : 90, a = -Math.PI / 2 + i * Math.PI / 5;
          g[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r);
        }
        g.closePath(); fill = '#9a72ff';
      } else if (kind === 'bow') {
        g.moveTo(0, 0); g.quadraticCurveTo(-60, -85, -100, -22); g.quadraticCurveTo(-80, 62, 0, 0);
        g.moveTo(0, 0); g.quadraticCurveTo(60, -85, 100, -22); g.quadraticCurveTo(80, 62, 0, 0);
        fill = '#8752e8';
      } else { // flower
        for (let i = 0; i < 6; i++) {
          const a = i * Math.PI / 3, x = Math.cos(a) * 46, y = Math.sin(a) * 46;
          g.moveTo(x + 36, y); g.arc(x, y, 36, 0, 6.2832);
        }
        fill = '#ae91ff';
      }
      g.shadowColor = 'rgba(80, 235, 225, 0.9)'; g.shadowBlur = 20;
      g.strokeStyle = '#fff'; g.lineWidth = 16; g.stroke();
      g.shadowBlur = 0; g.fillStyle = fill; g.fill();

      if (kind === 'heart') drawFace(g, 4, 1);
      else if (kind === 'star') drawFace(g, 8, 1);
      else if (kind === 'bow') {
        g.beginPath(); g.arc(0, 0, 22, 0, 6.2832); g.fillStyle = '#8050d8'; g.fill();
        g.strokeStyle = '#fff'; g.lineWidth = 5; g.stroke();
      } else {
        g.beginPath(); g.arc(0, 0, 34, 0, 6.2832); g.fillStyle = '#62e9df'; g.fill();
        drawFace(g, -2, .7);
      }
    });
  }

  function buildFloaters() {
    // frases
    CONFIG.phrases.forEach((txt) => {
      const { tex, aspect } = textTexture(txt, 64);
      for (let c = 0; c < CONFIG.phraseCopies; c++) {
        const big = rand() < .1;
        const h = big ? .55 + rand() * .2 : .22 + rand() * .2;
        addSprite(tex, aspect, h, .2 + rand() * 1.7, 'text');
      }
    });
    // stickers dibujados
    ['heart', 'star', 'bow', 'flower'].forEach((k) => {
      const tex = stickerTexture(k);
      for (let c = 0; c < CONFIG.stickerCopies; c++) {
        const h = .8 + rand() * .6;
        addSprite(tex, 1, h, h / 2 + .03, 'sticker');
      }
    });
    // imágenes propias (opcional)
    CONFIG.images.forEach((src) => {
      new THREE.TextureLoader().load(src, (tex) => {
        tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
        const aspect = tex.image.width / tex.image.height;
        for (let c = 0; c < CONFIG.stickerCopies; c++) {
          const h = .9 + rand() * .6;
          addSprite(tex, aspect, h, h / 2 + .03, 'sticker');
        }
      }, undefined, () => console.warn('No se pudo cargar la imagen:', src));
    });
  }

  /* ===================================================================
     CÁMARA · recorrido automático + arrastre del usuario
     =================================================================== */
  // [tiempo, radio, ángulo desde la vertical (grados), altura del objetivo]
  const KEYS = [
    [0, 9, 82, 1.4], [4, 7.2, 89, 1.0], [8, 5.2, 76, 1.2], [11, 3.2, 68, 1.3],
    [15, 4.2, 72, 1.5], [19, 3.6, 52, 1.5], [23, 4.8, 40, 1.2], [27, 10.5, 16, .6], [31, 8, 55, 1.0]
  ];
  const LOOP = CONFIG.loopSeconds;
  const KEY_SCALE = LOOP / 36;
  const cr = (p0, p1, p2, p3, t) => {
    const t2 = t * t, t3 = t2 * t;
    return .5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  };
  function samplePath(time) {
    const t = ((time % LOOP) + LOOP) % LOOP, n = KEYS.length;
    let i = n - 1;
    for (let k = 0; k < n; k++) {
      const next = k + 1 < n ? KEYS[k + 1][0] * KEY_SCALE : LOOP;
      if (t >= KEYS[k][0] * KEY_SCALE && t < next) { i = k; break; }
    }
    const t0 = KEYS[i][0] * KEY_SCALE, t1 = i + 1 < n ? KEYS[i + 1][0] * KEY_SCALE : LOOP;
    const u = (t - t0) / (t1 - t0);
    const K = (j) => KEYS[(j + n) % n];
    return [1, 2, 3].map((c) => cr(K(i - 1)[c], K(i)[c], K(i + 1)[c], K(i + 2)[c], u));
  }

  const drag = { theta: 0, phi: 0, zoom: 1, active: false, x: 0, y: 0 };
  let hintHidden = false;
  function hideHint() { if (!hintHidden) { hintHidden = true; hint.classList.remove('show'); } }

  glEl.addEventListener('pointerdown', (e) => {
    drag.active = true; drag.x = e.clientX; drag.y = e.clientY;
    try { glEl.setPointerCapture(e.pointerId); } catch (_) {}
    hideHint();
  });
  glEl.addEventListener('pointermove', (e) => {
    if (!drag.active) return;
    drag.theta -= (e.clientX - drag.x) * .006;
    drag.phi = clamp(drag.phi - (e.clientY - drag.y) * .004, -.8, .8);
    drag.x = e.clientX; drag.y = e.clientY;
  });
  const endDrag = () => { drag.active = false; };
  glEl.addEventListener('pointerup', endDrag);
  glEl.addEventListener('pointercancel', endDrag);
  glEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    drag.zoom = clamp(drag.zoom * (1 + e.deltaY * .001), .6, 1.5);
    hideHint();
  }, { passive: false });

  /* ===================================================================
     FLUJO: intro → warp → principal
     =================================================================== */
  let state = 'idle', tWarp = 0, tMain = 0, flashed = false;
  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();

  function beginWarp() {
    state = 'warp'; tWarp = 0; flashed = false;
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, -1);
    camera.fov = 60; camera.updateProjectionMatrix();
    clock.getDelta();
    requestAnimationFrame(loop);
  }

  function updateWarp(dt) {
    tWarp += dt;
    const k = Math.min(tWarp / WARP_DUR, 1);
    const speed = 10 + 190 * Math.pow(k, 2.2);
    camera.fov = 60 + 45 * k * k; camera.updateProjectionMatrix();
    const len = .6 + speed * .07;

    for (let i = 0; i < NS; i++) {
      const s = streaks[i];
      s.z += speed * dt;
      if (s.z > 1.5) s.z = -140 - rand() * 20;
      const x = Math.cos(s.a) * s.r, y = Math.sin(s.a) * s.r;
      const w = s.w * (1 + Math.min(-s.z, 120) * .04);
      const px = -Math.sin(s.a) * w, py = Math.cos(s.a) * w;
      const zh = s.z, zt = s.z - len, o = i * 12;
      wPos[o]      = x - px; wPos[o + 1]  = y - py; wPos[o + 2]  = zh;
      wPos[o + 3]  = x + px; wPos[o + 4]  = y + py; wPos[o + 5]  = zh;
      wPos[o + 6]  = x - px; wPos[o + 7]  = y - py; wPos[o + 8]  = zt;
      wPos[o + 9]  = x + px; wPos[o + 10] = y + py; wPos[o + 11] = zt;
    }
    wGeo.attributes.position.needsUpdate = true;

    if (!flashed && tWarp > WARP_DUR - .45) {
      flashed = true;
      flash.style.transition = 'opacity .45s ease-in';
      flash.style.opacity = 1;
    }
    renderer.render(warpScene, camera);
    if (tWarp >= WARP_DUR) enterMain();
  }

  function enterMain() {
    state = 'main'; tMain = 0;
    camera.fov = 60; camera.updateProjectionMatrix(); updateScale();
    flash.style.transition = 'opacity 1.3s ease-out';
    flash.style.opacity = 0;
    setTimeout(() => titleEl.classList.add('show'), 700);
    setTimeout(() => { if (!hintHidden) hint.classList.add('show'); }, 3500);
    setTimeout(hideHint, 11000);
  }

  const backOut = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

  function updateMain(dt) {
    tMain += dt;
    const T = tMain;
    const reveal = Math.min(T / 2.8, 1), ease = 1 - Math.pow(1 - reveal, 3);
    const fit = camera.aspect < 1 ? 1 + (1 - camera.aspect) * .6 : 1;

    // arrastre: vuelve suavemente a la ruta automática
    if (!drag.active) {
      const f = Math.exp(-dt * .35);
      drag.theta *= f; drag.phi *= f;
      drag.zoom += (1 - drag.zoom) * (1 - Math.exp(-dt * .4));
    }

    const [r0, phiDeg, ty] = samplePath(T);
    const R = r0 * (1 + 2.2 * (1 - ease)) * fit * drag.zoom;
    const theta = T * .12 + .6 + drag.theta;
    const phi = clamp(THREE.MathUtils.degToRad(phiDeg) + drag.phi, .12, 1.62);
    camera.position.set(
      Math.sin(phi) * Math.cos(theta) * R,
      ty + Math.cos(phi) * R,
      Math.sin(phi) * Math.sin(theta) * R);
    camera.lookAt(0, ty, 0);

    // corazón
    heartGroup.rotation.y = T * .7;
    heartGroup.scale.setScalar(Math.max(.001, backOut(Math.min(T / 1.8, 1))));
    heartGroup.position.y = Math.sin(T * 1.5) * .04;

    // portal
    portalGlow.material.opacity = .7 + .18 * Math.sin(T * 2.2);
    floorGlow.material.opacity = .26 + .06 * Math.sin(T * 1.3);
    ripples.forEach((m, i) => {
      const p = ((T * .22) + i / 3) % 1;
      m.scale.setScalar(1.2 + p * 9);
      m.material.opacity = Math.pow(1 - p, 1.6) * .8;
    });
    dust.rotation.y = -T * .02;

    // frases y stickers
    floaters.rotation.y = T * .045;
    const appear = smooth(1.2, 3.8, T);
    for (let i = 0; i < sprites.length; i++) {
      const s = sprites[i], u = s.userData;
      s.position.y = u.base + Math.sin(T * .9 + u.ph) * u.amp;
      s.getWorldPosition(tmp);
      const near = smooth(.5, 1.8, tmp.distanceTo(camera.position));
      s.material.opacity = (u.kind === 'text' ? .97 : 1) * appear * near;
    }

    renderer.render(scene, camera);
  }

  function loop() {
    if (state === 'idle') return;
    requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), .05);
    timeU.value += dt;
    if (state === 'warp') updateWarp(dt); else updateMain(dt);
  }

  /* ------------------------------ Audio ------------------------------ */
  bgm.volume = 0;
  bgm.addEventListener('canplay', () => soundBtn.classList.add('on'));
  function startAudio() {
    const p = bgm.play();
    if (p && p.catch) p.catch(() => {});
    let v = 0;
    const iv = setInterval(() => {
      v = Math.min(v + .04, .85); bgm.volume = v;
      if (v >= .85) clearInterval(iv);
    }, 150);
  }
  soundBtn.addEventListener('click', () => {
    bgm.muted = !bgm.muted;
    soundBtn.textContent = bgm.muted ? '🔇' : '🔊';
  });

  /* ------------------------------ Arranque ------------------------------ */
  let ready = false, wantStart = false, started = false;

  function start() {
    if (started) return;
    started = true;
    intro.classList.add('hide');
    startAudio();
    setTimeout(() => { if (ready) beginWarp(); else wantStart = true; }, 450);
  }
  intro.addEventListener('pointerdown', start);
  intro.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') start(); });

  const fontsReady = document.fonts && document.fonts.load
    ? Promise.race([
        Promise.all([document.fonts.load('64px "Patrick Hand"'), document.fonts.load('700 24px "Playfair Display"')]),
        new Promise((r) => setTimeout(r, 2500))
      ])
    : Promise.resolve();

  fontsReady.then(() => {
    buildFloaters();
    ready = true;
    if (wantStart) beginWarp();
  });
})();

/*NUEVOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO V1.2*/
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
    <h1 class="g-title">para Valeria</h1>
    <p class="g-sub">Para entrar, dime...<b>¿Cuándo empezó nuestra historia?</b></p>
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
