/* =====================================================================
   H + V · PARA SIEMPRE  ·  HTML5 + CSS3 + JavaScript + Three.js
   ---------------------------------------------------------------------
     1.0s  corazones morados y turquesas se dibujan en el vacío
     1.6s  corrientes de luz bajan y suben hacia el centro
     2.2s  el gran corazón se traza con una pluma de luz
     5.7s  aparecen las iniciales  H + V  (con glitch holográfico)
     6.9s  el corazón despierta y late
    12.0s  se materializa un candado (abierto)
    13.6s  una llave de luz baja por el haz y viaja hasta la cerradura
    18.0s  la llave gira → el candado se cierra → CLIC
    18.7s  anillos de sellado rodean el corazón · "Para siempre"
   ===================================================================== */

const CONFIG = {
  initials: ['H', 'V'],
  message: 'Para siempre ♥',
  autoStart: true,
  bpm: 70,
  purple:    [0.72, 0.38, 1.00],   // morado
  turquoise: [0.20, 0.95, 0.90]    // turquesa
};

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const msgEl = $('msg'), replayEl = $('replay'), flashEl = $('flash');

  if (typeof THREE === 'undefined') { msgEl.textContent = 'No se pudo cargar Three.js'; return; }

  const LOW = /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent) || Math.min(innerWidth, innerHeight) < 600;
  const Q = LOW ? 0.7 : 1;
  const rand = Math.random;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const ease = (x) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const prog = (t, s, d) => clamp((t - s) / d, 0, 1);
  const backOut = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const rgb2c = (a) => new THREE.Color(a[0], a[1], a[2]);
  const rgb2arr = (a) => [a[0], a[1], a[2]];
  const PURP = rgb2c(CONFIG.purple), TURQ = rgb2c(CONFIG.turquoise);

  /* ------------------------------ Renderer ------------------------------ */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: 'high-performance' });
  } catch (e) { msgEl.textContent = 'Tu navegador no soporta WebGL'; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LOW ? 1.75 : 2));
  renderer.setClearColor(0x01010a, 1);
  $('gl').appendChild(renderer.domElement);
  const glEl = renderer.domElement;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 800);

  const timeU = { value: 0 };
  const beatU = { value: 0 };
  const flashU = { value: 0 };
  const pixelU = { value: renderer.getPixelRatio() };
  const scaleU = { value: 1 };
  let W = 1, H = 1;
  const L = { dist: 9 };

  /* ------------------------------ Utilidades ------------------------------ */
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
    return t;
  }
  const glowTex = canvasTex(256, 256, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(.22, 'rgba(215,200,255,.55)');
    gr.addColorStop(.6, 'rgba(150,130,255,.14)');
    gr.addColorStop(1, 'rgba(120,110,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const ringTex = canvasTex(256, 256, (g, w, h) => {
    g.shadowColor = 'rgba(255,255,255,.9)'; g.shadowBlur = 14;
    g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 5;
    g.beginPath(); g.arc(w / 2, h / 2, w * .36, 0, 6.2832); g.stroke();
  });
  function hudTexture(rgb) {
    const col = (a) => `rgba(${rgb[0] * 255 | 0},${rgb[1] * 255 | 0},${rgb[2] * 255 | 0},${a})`;
    return canvasTex(1024, 1024, (g, w, h) => {
      g.translate(w / 2, h / 2);
      g.lineCap = 'round';
      g.strokeStyle = col(.9); g.lineWidth = 2;
      [488, 452].forEach((r) => { g.beginPath(); g.arc(0, 0, r, 0, 6.2832); g.stroke(); });
      for (let i = 0; i < 180; i++) {          // marcas tipo regla
        const a = (i / 180) * 6.2832, len = i % 5 ? 10 : 26;
        g.lineWidth = i % 5 ? 1.5 : 3;
        g.beginPath(); g.moveTo(Math.cos(a) * 440, Math.sin(a) * 440); g.lineTo(Math.cos(a) * (440 - len), Math.sin(a) * (440 - len)); g.stroke();
      }
      g.lineWidth = 9; g.strokeStyle = col(.85);
      [[.1, .9], [1.6, 2.3], [3.3, 4.4], [5.0, 5.6]].forEach(([a0, a1]) => { g.beginPath(); g.arc(0, 0, 395, a0, a1); g.stroke(); });
      g.lineWidth = 3; g.setLineDash([3, 14]); g.strokeStyle = col(.8);
      g.beginPath(); g.arc(0, 0, 350, 0, 6.2832); g.stroke(); g.setLineDash([]);
      g.lineWidth = 2; g.strokeStyle = col(.6);
      g.beginPath(); g.arc(0, 0, 300, .4, 2.6); g.stroke();
      g.beginPath(); g.arc(0, 0, 300, 3.6, 5.8); g.stroke();
      g.fillStyle = col(.95);
      for (let i = 0; i < 6; i++) {            // rombos
        const a = i * 1.0472 + .3; g.save(); g.translate(Math.cos(a) * 488, Math.sin(a) * 488); g.rotate(a + .785);
        g.fillRect(-7, -7, 14, 14); g.restore();
      }
    });
  }
  function makeSprite(tex, scale, opacity, color) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, color: color === undefined ? 0xffffff : color
    }));
    s.scale.set(scale, scale, 1);
    return s;
  }

  /* ------------------------------ Fondo: el vacío ------------------------------ */
  const backdrop = new THREE.Mesh(
    new THREE.SphereGeometry(300, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: { uTime: timeU, uA: { value: PURP }, uB: { value: TURQ } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `
        uniform float uTime; uniform vec3 uA, uB; varying vec3 vDir;
        float hash(vec3 p){ p = fract(p*.3183099 + .1); p *= 17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
        float noise(vec3 x){
          vec3 i = floor(x), f = fract(x); f = f*f*(3. - 2.*f);
          return mix(mix(mix(hash(i), hash(i+vec3(1.,0.,0.)), f.x), mix(hash(i+vec3(0.,1.,0.)), hash(i+vec3(1.,1.,0.)), f.x), f.y),
                     mix(mix(hash(i+vec3(0.,0.,1.)), hash(i+vec3(1.,0.,1.)), f.x), mix(hash(i+vec3(0.,1.,1.)), hash(i+vec3(1.,1.,1.)), f.x), f.y), f.z);
        }
        float fbm(vec3 p){ float a = .5, s = 0.; for(int i=0;i<5;i++){ s += a*noise(p); p *= 2.03; a *= .5; } return s; }
        void main(){
          vec3 d = normalize(vDir);
          float n = fbm(d*2.6 + vec3(uTime*.02, 0., uTime*.015));
          float n2 = fbm(d*4.2 - vec3(0., uTime*.025, 3.));
          vec3 c = vec3(.004,.004,.025);
          c += mix(uA, uB, n2) * smoothstep(.48, .9, n) * .10;
          c += uA * pow(max(0., 1. - abs(d.y)*1.6), 2.) * .035;
          gl_FragColor = vec4(c, 1.);
        }`
    }));
  backdrop.renderOrder = -10;
  scene.add(backdrop);

  function makePoints(pos, col, seed, size, drift) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: timeU, uSize: { value: size }, uScale: scaleU, uPixel: pixelU, uDrift: { value: drift || 0 } },
      vertexShader: `
        attribute float aSeed; attribute vec3 aColor;
        uniform float uTime, uSize, uScale, uPixel, uDrift;
        varying vec3 vColor; varying float vTw;
        void main(){
          vec3 p = position;
          p += vec3(sin(uTime*.5+aSeed*20.), cos(uTime*.45+aSeed*13.), sin(uTime*.4+aSeed*9.)) * uDrift;
          vec4 mv = modelViewMatrix * vec4(p, 1.);
          gl_Position = projectionMatrix * mv;
          float tw = .5 + .5 * sin(uTime*(1.2+aSeed*2.5) + aSeed*60.);
          float s = uSize * (.5 + aSeed) * uScale / max(.1, -mv.z);
          gl_PointSize = clamp(s, 1.2*uPixel, 40.*uPixel);
          vColor = aColor; vTw = tw;
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vTw;
        void main(){
          float d = length(gl_PointCoord - .5);
          float a = smoothstep(.5, .0, d); a = a*a*1.4;
          gl_FragColor = vec4(vColor * (.6 + vTw*.7), a * (.3 + vTw*.7));
        }`
    });
    const p = new THREE.Points(g, m);
    p.frustumCulled = false;
    return p;
  }

  (function stars() {
    const n = Math.round(1400 * Q);
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const u = rand() * 2 - 1, a = rand() * 6.2832, s = Math.sqrt(1 - u * u), R = 60 + rand() * 180;
      pos.set([Math.cos(a) * s * R, u * R, Math.sin(a) * s * R], i * 3);
      const k = rand();
      if (k < .5) col.set([.9, .93, 1], i * 3); else if (k < .75) col.set(rgb2arr(CONFIG.purple), i * 3); else col.set(rgb2arr(CONFIG.turquoise), i * 3);
      seed[i] = rand();
    }
    scene.add(makePoints(pos, col, seed, .34, 0));
  })();

  (function dust() {
    const n = Math.round(520 * Q);
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos.set([(rand() - .5) * 18, (rand() - .5) * 11, -5 + rand() * 8], i * 3);
      col.set(rand() < .5 ? rgb2arr(CONFIG.turquoise) : rgb2arr(CONFIG.purple), i * 3);
      seed[i] = rand();
    }
    scene.add(makePoints(pos, col, seed, .05, .25));
  })();

  const mists = [0, 1, 2].map((i) => {
    const m = makeSprite(glowTex, 18, .05, i === 1 ? PURP.getHex() : TURQ.getHex());
    m.position.set((i - 1) * 6, (i - 1) * 1.4, -4 - i);
    m.userData = { x0: (i - 1) * 6, sp: .1 + i * .04, ph: i * 2 };
    scene.add(m); return m;
  });

  /* ===================================================================
     PARTÍCULAS DINÁMICAS
     =================================================================== */
  const dynMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uScale: scaleU, uPixel: pixelU },
    vertexShader: `
      attribute float aAlpha, aSize; attribute vec3 aColor; uniform float uScale, uPixel;
      varying float vA; varying vec3 vC;
      void main(){
        vec4 mv = modelViewMatrix*vec4(position,1.);
        gl_Position = projectionMatrix*mv;
        float s = aSize * (.4 + .6*aAlpha) * uScale / max(.1, -mv.z);
        gl_PointSize = clamp(s, 1.*uPixel, 36.*uPixel);
        vA = aAlpha; vC = aColor;
      }`,
    fragmentShader: `
      varying float vA; varying vec3 vC;
      void main(){
        float d = length(gl_PointCoord - .5);
        float a = smoothstep(.5, .0, d); a *= a*1.5;
        gl_FragColor = vec4(vC*(.7 + .6*vA), a*vA);
      }`
  });
  function dyn(N) {
    const o = { N, pos: new Float32Array(N * 3), alpha: new Float32Array(N), size: new Float32Array(N), col: new Float32Array(N * 3) };
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(o.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(o.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(o.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aColor', new THREE.BufferAttribute(o.col, 3).setUsage(THREE.DynamicDrawUsage));
    o.mesh = new THREE.Points(g, dynMat);
    o.mesh.frustumCulled = false;
    o.flush = () => { ['position', 'aAlpha', 'aSize', 'aColor'].forEach((k) => { g.attributes[k].needsUpdate = true; }); };
    scene.add(o.mesh);
    return o;
  }
  const PN = Math.round(2400 * Q);
  const pool = dyn(PN);
  const pV = new Float32Array(PN * 3), pL = new Float32Array(PN), pM = new Float32Array(PN).fill(1);
  let pHead = 0;
  const PAL = [rgb2arr(CONFIG.turquoise), rgb2arr(CONFIG.purple), [1, 1, 1], [.7, .9, 1], [.85, .65, 1]];
  function emit(x, y, z, vx, vy, vz, life, size, c) {
    const i = pHead; pHead = (pHead + 1) % PN;
    pool.pos[i * 3] = x; pool.pos[i * 3 + 1] = y; pool.pos[i * 3 + 2] = z;
    pV[i * 3] = vx; pV[i * 3 + 1] = vy; pV[i * 3 + 2] = vz;
    pL[i] = pM[i] = life; pool.size[i] = size;
    pool.col.set(c || PAL[(rand() * PAL.length) | 0], i * 3);
  }
  function burst(cx, cy, cz, n, speed) {
    for (let i = 0; i < n; i++) {
      const u = rand() * 2 - 1, a = rand() * 6.2832, s = Math.sqrt(1 - u * u), sp = (.3 + rand()) * speed;
      emit(cx, cy, cz, Math.cos(a) * s * sp, u * sp * .9 + .3, Math.sin(a) * s * sp, 1.6 + rand() * 2.4, .06 + rand() * .1);
    }
  }
  function updatePool(dt) {
    const drag = Math.max(0, 1 - dt * .9);
    for (let i = 0; i < PN; i++) {
      if (pL[i] <= 0) { pool.alpha[i] = 0; continue; }
      pL[i] -= dt;
      const k = i * 3;
      pool.pos[k] += pV[k] * dt; pool.pos[k + 1] += pV[k + 1] * dt; pool.pos[k + 2] += pV[k + 2] * dt;
      pV[k] *= drag; pV[k + 1] = pV[k + 1] * drag + .2 * dt; pV[k + 2] *= drag;
      pool.alpha[i] = Math.max(0, pL[i] / pM[i]);
    }
    pool.flush();
  }

  // Ondas en forma de anillo
  const ringPool = [];
  for (let i = 0; i < 8; i++) {
    const s = makeSprite(ringTex, 1, 0, 0xffffff);
    s.visible = false; s.userData = { t0: -1, size: 2, dur: 1.2 };
    scene.add(s); ringPool.push(s);
  }
  function pulseRing(pos, size, color, dur) {
    const s = ringPool.find((r) => !r.visible) || ringPool[0];
    s.visible = true; s.position.copy(pos); s.material.color.set(color);
    s.userData.t0 = T; s.userData.size = size; s.userData.dur = dur || 1.2;
  }

  /* ===================================================================
     MATERIALES NEÓN / HOLOGRÁFICOS
     =================================================================== */
  const outlineVS = `
    attribute float aT; varying float vT; varying vec3 vN; varying vec3 vV;
    void main(){ vT = aT; vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`;
  const outlineFS = `
    uniform float uDraw, uAlpha, uBeat, uFlash; uniform vec3 uColor; varying float vT; varying vec3 vN; varying vec3 vV;
    void main(){
      if(vT > uDraw) discard;
      float rim = pow(1. - abs(dot(normalize(vN), normalize(vV))), 1.2);
      float head = 1. - smoothstep(0., .03, uDraw - vT);
      vec3 col = uColor * (.55 + .9*rim) + vec3(1.) * head * 1.5;
      col *= 1. + uBeat*.35 + uFlash*1.3;
      gl_FragColor = vec4(col, uAlpha);
    }`;
  function outlineMat(color, alpha) {
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uDraw: { value: 0 }, uAlpha: { value: alpha }, uBeat: beatU, uFlash: flashU, uColor: { value: color.clone() } },
      vertexShader: outlineVS, fragmentShader: outlineFS
    });
  }
  function tubeFor(curve, radius, alpha, color, N, RS, closed) {
    const geo = new THREE.TubeGeometry(curve, N, radius, RS, closed);
    const aT = new Float32Array((N + 1) * (RS + 1));
    for (let i = 0; i <= N; i++) for (let j = 0; j <= RS; j++) aT[i * (RS + 1) + j] = i / N;
    geo.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
    const mat = outlineMat(color, alpha);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    return { mesh, mat };
  }
  function holoMat(a, b, alpha, fres, y0, y1) {
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: {
        uReveal: { value: 0 }, uTime: timeU, uBeat: beatU, uFlash: flashU,
        uAlpha: { value: alpha }, uFres: { value: fres }, uY0: { value: y0 }, uY1: { value: y1 },
        uA: { value: a.clone() }, uB: { value: b.clone() }
      },
      vertexShader: `
        varying vec3 vP; varying vec3 vN; varying vec3 vV;
        void main(){ vP = position; vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `
        uniform float uReveal, uTime, uBeat, uFlash, uAlpha, uFres, uY0, uY1; uniform vec3 uA, uB;
        varying vec3 vP; varying vec3 vN; varying vec3 vV;
        void main(){
          float front = mix(uY0, uY1, uReveal);
          if(vP.y > front) discard;
          float head = (1. - smoothstep(0., .1, front - vP.y)) * step(uReveal, .999);
          vec3 N = normalize(vN);
          float fres = pow(1. - abs(dot(N, normalize(vV))), uFres);
          float t = smoothstep(uY0, uY1, vP.y);
          vec3 base = mix(uA, uB, t*.7 + fres*.3);
          float scan = .5 + .5*sin(vP.y*30. - uTime*2.4);
          vec3 col = base*(.15 + fres*1.5) + base*scan*.06 + vec3(1.)*head*1.2;
          float a = uAlpha*(.35 + fres*1.1) + head;
          col *= 1. + uBeat*.45 + uFlash*1.2;
          gl_FragColor = vec4(col, clamp(a, 0., 1.));
        }`
    });
  }
  function neonSolid(color) {
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: color.clone() }, uFlash: flashU, uBeat: beatU },
      vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `
        uniform vec3 uColor; uniform float uFlash, uBeat; varying vec3 vN; varying vec3 vV;
        void main(){
          float rim = pow(1. - abs(dot(normalize(vN), normalize(vV))), 1.3);
          vec3 col = uColor*(.6 + 1.1*rim) + vec3(.25);
          col *= 1. + uFlash*1.2 + uBeat*.2;
          gl_FragColor = vec4(col, 1.);
        }`
    });
  }

  /* ===================================================================
     CORAZONES
     =================================================================== */
  function heartXY(t) {
    const s = Math.sin(t);
    return [16 * s * s * s, 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)];
  }
  function heartCurve(s, z) {
    const pts = [], n = 64;
    for (let i = 0; i < n; i++) { const [x, y] = heartXY((i / n) * 6.2832); pts.push(new THREE.Vector3(x * s, (y + 2.5) * s, z || 0)); }
    return new THREE.CatmullRomCurve3(pts, true, 'centripetal');
  }
  function heartShape(s) {
    const pts = [];
    for (let i = 0; i < 90; i++) { const [x, y] = heartXY((i / 90) * 6.2832); pts.push(new THREE.Vector2(x * s, (y + 2.5) * s)); }
    return new THREE.Shape(pts);
  }

  /* ---- Corazones pequeños flotando (como en el dibujo) ---- */
  // [nx, ny, z, color(t|p), tamaño]  — nx, ny en pantalla (-1..1)
  const SK = [
    [-.46, .71, 0, 't', .62], [-.72, .29, 0, 'p', .82], [-.48, -.13, 0, 't', .7], [-.63, -.64, 0, 'p', .74],
    [.45, .65, 0, 'p', .6], [.66, .01, 0, 't', .74], [.50, -.71, 0, 'p', .82],
    [-.9, .62, -3, 'p', .5], [.88, .42, -3.5, 't', .46], [-.34, .9, -2, 't', .4], [.3, -.88, -2.5, 'p', .44],
    [-.88, -.2, -4, 't', .42], [.9, -.55, -3, 'p', .36], [.28, .93, -3, 'p', .38], [-.3, -.92, -3.5, 't', .4]
  ];
  const smalls = SK.map((d, i) => {
    const w = 1.5 * d[4], s = w / 32, col = d[3] === 't' ? TURQ : PURP;
    const curve = heartCurve(s, 0);
    const line = tubeFor(curve, .013, 1, col, 160, 5, true);
    const glow = tubeFor(curve, .05, .14, col, 160, 5, true);
    const fillMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const fill = new THREE.Mesh(new THREE.ShapeGeometry(heartShape(s)), fillMat);
    const halo = makeSprite(glowTex, w * 2.6, 0, col.getHex());
    const group = new THREE.Group();
    group.add(fill, glow.mesh, line.mesh, halo);
    scene.add(group);
    return { d, w, col, curve, line, glow, fillMat, halo, group, start: 1.0 + i * .36, ph: rand() * 6.28, base: new THREE.Vector3() };
  });

  /* ---- Gran corazón central ---- */
  const CS = .1;
  const cg = new THREE.Group();     // grupo del corazón central
  scene.add(cg);

  const glassGeo = new THREE.ExtrudeGeometry(heartShape(CS), { depth: .35, bevelEnabled: true, bevelThickness: .12, bevelSize: .07, bevelSegments: 5, curveSegments: 48 });
  glassGeo.translate(0, 0, -.175);
  const glassMat = holoMat(TURQ, PURP, .3, 2.2, -1.6, 1.6);
  cg.add(new THREE.Mesh(glassGeo, glassMat));

  const cFront = tubeFor(heartCurve(CS * 1.03, .31), .022, 1, TURQ, Math.round(300 * Q) + 60, 6, true);
  const cBack = tubeFor(heartCurve(CS * 1.03, -.31), .022, .7, TURQ, Math.round(300 * Q) + 60, 6, true);
  const cGlow = tubeFor(heartCurve(CS * 1.03, .31), .09, .15, TURQ, 200, 6, true);
  cg.add(cFront.mesh, cBack.mesh, cGlow.mesh);
  const cFrontCurve = heartCurve(CS * 1.03, .31);

  const cHalo = makeSprite(glowTex, 9, 0, PURP.getHex()); cHalo.position.z = -.9;
  const cHalo2 = makeSprite(glowTex, 6, 0, TURQ.getHex()); cHalo2.position.z = -.8;
  cg.add(cHalo, cHalo2);

  // Anillos HUD holográficos
  const hudMats = [], huds = [];
  [[7.2, TURQ, CONFIG.turquoise, 1], [9.6, PURP, CONFIG.purple, -1]].forEach(([size, , rgb, dir]) => {
    const m = new THREE.MeshBasicMaterial({ map: hudTexture(rgb), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(size, size), m);
    p.position.z = -1; p.userData.dir = dir; p.userData.size = size;
    cg.add(p); hudMats.push(m); huds.push(p);
  });

  // Iniciales  H + V
  const letters = [];
  function buildInitials() {
    const items = [[CONFIG.initials[0], PURP, -.8], ['+', TURQ, 0], [CONFIG.initials[1], PURP, .8]];
    items.forEach(([ch, col, x], i) => {
      const css = `rgb(${col.r * 255 | 0},${col.g * 255 | 0},${col.b * 255 | 0})`;
      const tex = canvasTex(256, 256, (g, w, h) => {
        g.font = '800 170px Orbitron, "Segoe UI", sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.shadowColor = css; g.shadowBlur = 34;
        g.strokeStyle = css; g.lineWidth = 12; g.lineJoin = 'round';
        g.strokeText(ch, w / 2, h / 2 + 6);
        g.shadowBlur = 8; g.fillStyle = '#f4eaff';
        g.fillText(ch, w / 2, h / 2 + 6);
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(.85, .85),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      m.position.set(x, .32, .05);
      m.userData = { x, start: 5.7 + i * .4 };
      cg.add(m); letters.push(m);
    });
  }

  /* ---- Corrientes de luz (arriba y abajo) ---- */
  const beamU = { uTime: timeU, uReveal: { value: 0 }, uBeat: beatU, uLock: { value: 0 }, uFlash: flashU, uA: { value: PURP }, uB: { value: TURQ } };
  function buildStreams(dir) {
    const nS = Math.round(26 * Q), nP = 40;
    const pos = new Float32Array(nS * nP * 2 * 3), aS = new Float32Array(nS * nP * 2), aSeed = new Float32Array(nS * nP * 2);
    const idx = [];
    const farY = 13, attach = 1.3;
    for (let s = 0; s < nS; s++) {
      const seed = rand();
      const xh = (s / (nS - 1) - .5) * 1.1 + (rand() - .5) * .08, xf = xh * .22;
      for (let p = 0; p < nP; p++) {
        const u = p / (nP - 1);
        const x = lerp(xf, xh, u * u) + .06 * Math.sin(u * 6 + seed * 9) * (1 - u);
        const y = dir * lerp(farY, attach, u);
        const w = .008, b = (s * nP + p) * 2;
        pos.set([x - w, y, 0], b * 3); pos.set([x + w, y, 0], (b + 1) * 3);
        aS[b] = aS[b + 1] = u; aSeed[b] = aSeed[b + 1] = seed;
        if (p < nP - 1) { const a = b, c = b + 2; idx.push(a, c, a + 1, a + 1, c, c + 1); }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aS', new THREE.BufferAttribute(aS, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
    g.setIndex(idx);
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: beamU,
      vertexShader: 'attribute float aS, aSeed; varying float vS, vSeed; void main(){ vS = aS; vSeed = aSeed; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `
        uniform float uTime, uReveal, uBeat, uLock, uFlash; uniform vec3 uA, uB; varying float vS, vSeed;
        void main(){
          if(vS < 1. - uReveal*1.05) discard;
          float sp = (.22 + vSeed*.25) * (1. + uLock);
          float p = fract(uTime*sp + vSeed*5.);
          float pulse = exp(-pow((vS - p)*9., 2.));
          float base = .12 + .3*vS*vS;
          float a = (base + pulse) * smoothstep(0., .12, vS);
          vec3 col = mix(uA, uB, vS) + vec3(1.)*pulse*.5;
          col = mix(col, vec3(.8,1.,1.), uLock*.3);
          col *= 1. + uBeat*.3 + uFlash;
          gl_FragColor = vec4(col, clamp(a, 0., 1.));
        }`
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.frustumCulled = false;
    scene.add(mesh);
  }
  buildStreams(1); buildStreams(-1);

  /* ===================================================================
     CANDADO + LLAVE + ANILLOS DE SELLADO
     =================================================================== */
  function roundedRect(w, h, r) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  }
  const lockG = new THREE.Group();
  lockG.position.set(0, -.78, .42);
  lockG.visible = false;
  scene.add(lockG);

  const bodyShape = roundedRect(.82, .66, .13);
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, { depth: .16, bevelEnabled: true, bevelThickness: .03, bevelSize: .025, bevelSegments: 3, curveSegments: 16 });
  bodyGeo.translate(0, 0, -.08);
  const bodyMat = holoMat(PURP, TURQ, .6, 1.6, -.4, .4);
  lockG.add(new THREE.Mesh(bodyGeo, bodyMat));

  const bodyCurve = new THREE.CatmullRomCurve3(bodyShape.getPoints(10).slice(0, -1).map((p) => new THREE.Vector3(p.x, p.y, .118)), true, 'centripetal');
  const bodyLine = tubeFor(bodyCurve, .014, 1, TURQ, 200, 5, true);
  const bodyGlow = tubeFor(bodyCurve, .05, .14, TURQ, 200, 5, true);
  lockG.add(bodyLine.mesh, bodyGlow.mesh);

  // cerradura
  const khMat = new THREE.MeshBasicMaterial({ color: 0xcffffa, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const kh1 = new THREE.Mesh(new THREE.CircleGeometry(.06, 24), khMat); kh1.position.set(0, .05, .125);
  const slot = new THREE.Shape(); slot.moveTo(-.028, .02); slot.lineTo(.028, .02); slot.lineTo(.05, -.17); slot.lineTo(-.05, -.17); slot.closePath();
  const kh2 = new THREE.Mesh(new THREE.ShapeGeometry(slot), khMat); kh2.position.z = .125;
  lockG.add(kh1, kh2);
  const lockHalo = makeSprite(glowTex, 2.4, 0, PURP.getHex()); lockHalo.position.z = -.2;
  lockG.add(lockHalo);

  // arco (grillete): pivota sobre la pata izquierda
  const shPts = [];
  for (let i = 0; i <= 6; i++) shPts.push(new THREE.Vector3(-.27, -.05 + (i / 6) * .27, 0));
  for (let i = 1; i < 24; i++) { const a = Math.PI - (i / 24) * Math.PI; shPts.push(new THREE.Vector3(Math.cos(a) * .27, .22 + Math.sin(a) * .27, 0)); }
  for (let i = 0; i <= 6; i++) shPts.push(new THREE.Vector3(.27, .22 - (i / 6) * .27, 0));
  const shackleTube = tubeFor(new THREE.CatmullRomCurve3(shPts), .05, 1, TURQ, 120, 8, false);
  const shackleGlow = tubeFor(new THREE.CatmullRomCurve3(shPts), .11, .14, TURQ, 120, 8, false);
  const pivot = new THREE.Group();
  pivot.position.set(-.27, .33, 0);
  shackleTube.mesh.position.x = .27; shackleGlow.mesh.position.x = .27;
  pivot.add(shackleTube.mesh, shackleGlow.mesh);
  lockG.add(pivot);
  const SH_OPEN_ROT = -1.3, SH_OPEN_Y = .17;

  // llave de luz (la punta está en el origen; el eje apunta a +z hacia la cámara)
  const keyG = new THREE.Group();
  keyG.visible = false;
  scene.add(keyG);
  const keyMat = neonSolid(TURQ);
  const keyRing = new THREE.Mesh(new THREE.TorusGeometry(.11, .028, 8, 28), keyMat); keyRing.position.z = .62;
  const keyShaft = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .5, 10), keyMat); keyShaft.rotation.x = Math.PI / 2; keyShaft.position.z = .3;
  const kt1 = new THREE.Mesh(new THREE.BoxGeometry(.1, .04, .04), keyMat); kt1.position.set(.05, 0, .06);
  const kt2 = new THREE.Mesh(new THREE.BoxGeometry(.07, .04, .04), keyMat); kt2.position.set(.04, 0, .16);
  const keyHalo = makeSprite(glowTex, 1, .9, TURQ.getHex()); keyHalo.position.z = .5;
  keyG.add(keyRing, keyShaft, kt1, kt2, keyHalo);
  const keyTarget = new THREE.Vector3(lockG.position.x, lockG.position.y + .05, lockG.position.z + .125);
  const keyCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(.6, 3.3, 1.0), new THREE.Vector3(2.0, 1.7, 1.4), new THREE.Vector3(2.1, -.3, 1.6),
    new THREE.Vector3(1.0, -1.15, 1.7), new THREE.Vector3(keyTarget.x, keyTarget.y, 1.55)
  ], false, 'centripetal');

  // anillos de sellado (cadena de luz alrededor del corazón)
  const seals = [[TURQ, 1, .38, .28], [PURP, -1, -.38, -.28]].map(([col, dir, tilt, roll]) => {
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uTime: timeU, uSeal: { value: 0 }, uBeat: beatU, uFlash: flashU, uColor: { value: col.clone() }, uDir: { value: dir } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `
        uniform float uTime, uSeal, uBeat, uFlash, uDir; uniform vec3 uColor; varying vec2 vUv;
        void main(){
          float d = abs(fract(vUv.x*34. - uTime*.35*uDir) - .5);
          float link = smoothstep(.34, .2, d);
          vec3 col = uColor*(.5 + 1.2*link) + vec3(1.)*link*.25*uFlash;
          col *= 1. + uBeat*.3 + uFlash;
          gl_FragColor = vec4(col, uSeal*(.35 + .65*link));
        }`
    });
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(1, .022, 8, 180), mat);
    const tiltG = new THREE.Group();
    tiltG.rotation.set(Math.PI / 2 - tilt, 0, roll);
    tiltG.add(mesh);
    tiltG.visible = false;
    scene.add(tiltG);
    return { mesh, mat, tiltG, dir };
  });

  const shock = makeSprite(ringTex, 1, 0, 0xcffffa);
  shock.visible = false; scene.add(shock);
  const penGlow = makeSprite(glowTex, .55, 0, 0xffffff), penCore = makeSprite(glowTex, .16, 0, 0xffffff);
  scene.add(penGlow, penCore);

  /* ===================================================================
     LAYOUT RESPONSIVE
     =================================================================== */
  function applyLayout() {
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), a = camera.aspect;
    L.dist = Math.max(9, 2.9 / (tanH * a));
    smalls.forEach((h) => {
      const z = h.d[2], hh = tanH * (L.dist - z), hw = hh * a;
      let x = h.d[0] * hw * .94;
      const minX = 2.0 + h.w * .5;
      if (Math.abs(x) < minX) x = Math.sign(x || 1) * minX;
      x = clamp(x, -hw * .94, hw * .94);
      h.base.set(x, h.d[1] * hh * .92, z);
    });
  }
  function resize() {
    W = Math.max(1, window.innerWidth); H = Math.max(1, window.innerHeight);
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    scaleU.value = (H * renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    applyLayout();
  }
  window.addEventListener('resize', resize);
  resize();

  /* ===================================================================
     INTERACCIÓN
     =================================================================== */
  const drag = { theta: 0, active: false, x: 0, moved: 0 };
  glEl.addEventListener('pointerdown', (e) => {
    drag.active = true; drag.x = e.clientX; drag.moved = 0;
    try { glEl.setPointerCapture(e.pointerId); } catch (_) {}
  });
  glEl.addEventListener('pointermove', (e) => {
    if (!drag.active) return;
    const dx = e.clientX - drag.x;
    drag.theta = clamp(drag.theta - dx * .004, -.5, .5); drag.moved += Math.abs(dx); drag.x = e.clientX;
  });
  glEl.addEventListener('pointerup', () => {
    const wasTap = drag.active && drag.moved < 8;
    drag.active = false;
    if (wasTap && T > 26) reset();
  });
  glEl.addEventListener('pointercancel', () => { drag.active = false; });

  /* ===================================================================
     LÍNEA DE TIEMPO
     =================================================================== */
  const TL = { lockIn: 12.0, keyIn: 13.6, flyStart: 14.6, flyDur: 2.0, insert: 16.6, turn: 17.4, closeA: 18.1, closeB: 18.5, click: 18.65, msg: 19.8, replay: 26 };
  const period = 60 / CONFIG.bpm;
  const beatAt = (t) => {
    const p = (((t / period) % 1) + 1) % 1;
    return Math.min(1.2, Math.exp(-Math.pow(p * 7, 2)) + .55 * Math.exp(-Math.pow((p - .27) * 8, 2)));
  };

  let T = 0, running = false;
  const st = { awake: false, clicked: false, msg: false, replay: false, lockRing: false, lastCycle: -1, shoot: 5 };
  const clock = new THREE.Clock();
  const tmpV = new THREE.Vector3(), tipV = new THREE.Vector3(), center = new THREE.Vector3(0, 0, .3);
  const shooters = [];

  function buildMessage() {
    msgEl.innerHTML = Array.from(CONFIG.message).map((ch, i) =>
      `<span style="animation-delay:${(i * .08).toFixed(2)}s">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
  }

  function reset() {
    T = 0; st.awake = st.clicked = st.msg = st.replay = st.lockRing = false; st.lastCycle = -1; st.shoot = 5;
    pL.fill(0); pool.alpha.fill(0);
    msgEl.classList.remove('show'); replayEl.classList.remove('show');
    flashEl.style.opacity = 0; flashU.value = 0; beatU.value = 0;
    smalls.forEach((h) => { h.line.mat.uniforms.uDraw.value = 0; h.glow.mat.uniforms.uDraw.value = 0; h.fillMat.opacity = 0; h.halo.material.opacity = 0; });
    [cFront, cBack, cGlow].forEach((c) => { c.mat.uniforms.uDraw.value = 0; });
    glassMat.uniforms.uReveal.value = 0;
    hudMats.forEach((m) => { m.opacity = 0; });
    letters.forEach((l) => { l.material.opacity = 0; });
    beamU.uReveal.value = 0; beamU.uLock.value = 0;
    lockG.visible = false; keyG.visible = false;
    [bodyLine, bodyGlow, shackleTube, shackleGlow].forEach((c) => { c.mat.uniforms.uDraw.value = 0; });
    bodyMat.uniforms.uReveal.value = 0; khMat.opacity = 0;
    pivot.rotation.y = SH_OPEN_ROT; pivot.position.y = .33 + SH_OPEN_Y;
    seals.forEach((s) => { s.tiltG.visible = false; s.mat.uniforms.uSeal.value = 0; });
    ringPool.forEach((r) => { r.visible = false; });
    shock.visible = false; shooters.length = 0; drag.theta = 0;
    cHalo.material.opacity = 0; cHalo2.material.opacity = 0;
  }

  function update(dt) {
    T += dt;
    timeU.value += dt;
    scene.updateMatrixWorld(true);

    const awake = smooth(TL.lockIn - 5.2, TL.lockIn - 4.4, T);   // ~6.8-7.6
    const bt = beatAt(T);
    const lockP = st.clicked ? 1 : 0;
    beatU.value = bt * awake * .75;
    flashU.value = st.clicked ? Math.exp(-(T - TL.click) * 3.2) * .8 : 0;
    const surge = st.clicked ? Math.exp(-(T - TL.click) * 1.1) : 0;

    /* --- nebulosa --- */
    mists.forEach((m) => {
      m.position.x = m.userData.x0 + Math.sin(T * m.userData.sp + m.userData.ph) * 3;
      m.material.opacity = .05 * smooth(0, 2, T);
    });

    /* --- corazones pequeños: se dibujan y flotan --- */
    const unify = smooth(TL.click, TL.click + 1.5, T);
    smalls.forEach((h, i) => {
      const d = ease(prog(T, h.start, 1.6));
      h.line.mat.uniforms.uDraw.value = d * 1.02; h.glow.mat.uniforms.uDraw.value = d * 1.02;
      const b = beatAt(T + h.ph * (1 - unify) * .3) * smooth(7, 8, T);
      h.fillMat.opacity = smooth(h.start + .9, h.start + 2.4, T) * (.07 + .05 * b);
      h.halo.material.opacity = smooth(h.start + .5, h.start + 2, T) * (.28 + .3 * b);
      h.group.position.set(h.base.x, h.base.y + Math.sin(T * .6 + h.ph) * .14, h.base.z);
      h.group.rotation.y = Math.sin(T * .4 + h.ph) * .5;
      h.group.rotation.z = Math.sin(T * .3 + h.ph) * .12;
      h.group.scale.setScalar(1 + .05 * b);
      if (d > 0 && d < 1 && rand() < .7) {
        tmpV.copy(h.curve.getPoint(d)); h.group.localToWorld(tmpV);
        emit(tmpV.x, tmpV.y, tmpV.z, (rand() - .5) * .3, (rand() - .2) * .3, 0, .6 + rand() * .8, .05 + rand() * .05, rgb2arr(h.col));
      }
    });

    /* --- corrientes de luz --- */
    beamU.uReveal.value = ease(prog(T, 1.6, 2.4));
    beamU.uLock.value = smooth(TL.click, TL.click + 1.5, T);

    /* --- gran corazón: trazo, cristal, halo, HUD --- */
    const cd = ease(prog(T, 2.2, 3.2));
    [cFront, cBack, cGlow].forEach((c) => { c.mat.uniforms.uDraw.value = cd * 1.02; });
    glassMat.uniforms.uReveal.value = ease(prog(T, 4.0, 2.0));
    cHalo.material.opacity = smooth(4.5, 7, T) * (.35 + .25 * bt * awake) + surge * .25;
    cHalo2.material.opacity = smooth(5, 8, T) * (.25 + .2 * bt * awake) + surge * .2;
    cg.scale.setScalar(1 + .06 * bt * awake + .05 * surge);
    cg.rotation.y = Math.sin(T * .35) * .18;
    cg.position.y = Math.sin(T * .7) * .05;

    huds.forEach((p, i) => {
      const o = smooth(5.0, 7.0, T);
      hudMats[i].opacity = o * (i ? .32 : .45) * (1 + surge * .6);
      const sc = lerp(.6, 1, ease(prog(T, 5.0, 2.2)));
      p.scale.setScalar(sc);
      p.rotation.z = T * .08 * p.userData.dir * (1 + surge * 2);
    });

    // pluma de luz
    if (cd > 0 && cd < 1) {
      tipV.copy(cFrontCurve.getPoint(clamp(cd, 0, 1))); cg.localToWorld(tipV);
      penGlow.position.copy(tipV); penCore.position.copy(tipV);
      penGlow.material.color.copy(TURQ);
      penGlow.material.opacity = Math.min(1, penGlow.material.opacity + dt * 6);
      penCore.material.opacity = penGlow.material.opacity;
      const s = .55 + .1 * Math.sin(T * 14); penGlow.scale.set(s, s, 1);
      for (let k = 0; k < 4; k++) {
        emit(tipV.x + (rand() - .5) * .06, tipV.y + (rand() - .5) * .06, tipV.z, (rand() - .5) * .35, (rand() - .2) * .35, (rand() - .5) * .2,
          .7 + rand() * 1.1, .05 + rand() * .06, rand() < .5 ? rgb2arr(CONFIG.turquoise) : [.9, 1, 1]);
      }
    } else {
      penGlow.material.opacity = Math.max(0, penGlow.material.opacity - dt * 3);
      penCore.material.opacity = penGlow.material.opacity;
    }

    // iniciales con glitch
    letters.forEach((l) => {
      const p = prog(T, l.userData.start, .7);
      let o = p;
      if (p > 0 && p < 1) { o = (rand() < .45 ? .15 : 1) * p; l.position.x = l.userData.x + (rand() - .5) * .08; }
      else l.position.x = l.userData.x;
      l.material.opacity = o * (.85 + .25 * bt * awake + .4 * surge);
      l.scale.setScalar(1 + .06 * bt * awake);
    });

    // despertar del corazón
    if (!st.awake && T > TL.lockIn - 5.1) {
      st.awake = true;
      burst(0, 0, .4, Math.round(450 * Q), 3);
      pulseRing(center, 6, 0x66fff0, 2);
      setTimeout(() => pulseRing(center, 5, 0xb982ff, 2), 300);
    }
    if (st.awake) {
      const cyc = Math.floor(T / period);
      if (cyc !== st.lastCycle) { st.lastCycle = cyc; pulseRing(center, 3.2, cyc % 2 ? 0x66fff0 : 0xb982ff, 1.3); }
    }

    /* --- candado: se materializa abierto --- */
    const lockOn = T >= TL.lockIn;
    lockG.visible = lockOn;
    if (lockOn) {
      const rb = ease(prog(T, TL.lockIn, 1.0)), rs = ease(prog(T, TL.lockIn + .7, .9));
      bodyMat.uniforms.uReveal.value = rb;
      [bodyLine, bodyGlow].forEach((c) => { c.mat.uniforms.uDraw.value = rb * 1.02; });
      [shackleTube, shackleGlow].forEach((c) => { c.mat.uniforms.uDraw.value = rs * 1.02; });
      khMat.opacity = smooth(TL.lockIn + 1, TL.lockIn + 1.8, T) * (.6 + .3 * Math.sin(T * 5));
      lockHalo.material.opacity = smooth(TL.lockIn, TL.lockIn + 1.5, T) * (.3 + .2 * bt) + surge * .5;
      if (T > TL.lockIn && T < TL.lockIn + .1 && !st.lockRing) { st.lockRing = true; pulseRing(lockG.position, 2.4, 0xb982ff, 1.4); }
      lockG.scale.setScalar(1 + .04 * bt + .12 * surge);

      // arco: abierto → cierra (gira y baja) → CLIC
      const a = ease(prog(T, TL.closeA, TL.closeB - TL.closeA));
      const b = ease(prog(T, TL.closeB, TL.click - TL.closeB));
      pivot.rotation.y = lerp(SH_OPEN_ROT, 0, a);
      pivot.position.y = .33 + lerp(SH_OPEN_Y, 0, b);
    }

    /* --- llave de luz --- */
    const keyOn = T >= TL.keyIn && !st.clicked;
    keyG.visible = keyOn;
    if (keyOn) {
      const pop = backOut(prog(T, TL.keyIn, .8));
      keyG.scale.setScalar(Math.max(.001, pop));
      const f = ease(prog(T, TL.flyStart, TL.flyDur));
      keyCurve.getPoint(f, tmpV);
      let zIns = 0;
      if (T >= TL.insert) zIns = ease(prog(T, TL.insert, .8));
      keyG.position.set(tmpV.x, tmpV.y, lerp(tmpV.z, keyTarget.z + .04, zIns));
      const spinIn = T < TL.flyStart ? T * 4 : 0;
      keyG.rotation.set(lerp(.55, 0, f), lerp(-.45, 0, f), (1 - f) * Math.PI * 6 + spinIn * (1 - f) + ease(prog(T, TL.turn, .7)) * Math.PI / 2);
      const hs = 1.0 + .2 * Math.sin(T * 10);
      keyHalo.scale.set(hs, hs, 1);
      if (rand() < .9) {
        const kp = keyG.localToWorld(tmpV.set(0, 0, .55));
        emit(kp.x + (rand() - .5) * .05, kp.y + (rand() - .5) * .05, kp.z, (rand() - .5) * .25, (rand() - .5) * .25, 0, .7 + rand() * .8, .05 + rand() * .05, rgb2arr(CONFIG.turquoise));
      }
    }

    /* --- CLIC: sellado --- */
    if (!st.clicked && T >= TL.click) {
      st.clicked = true;
      keyG.visible = false;
      burst(lockG.position.x, lockG.position.y, lockG.position.z + .2, Math.round(700 * Q), 3.6);
      burst(0, 0, .4, Math.round(300 * Q), 3);
      pulseRing(lockG.position, 5, 0xffffff, 1.4);
      pulseRing(center, 9, 0x66fff0, 2.2);
      setTimeout(() => pulseRing(center, 7, 0xb982ff, 2.0), 250);
      shock.visible = true;
      flashEl.style.transition = 'none'; flashEl.style.opacity = .8;
      requestAnimationFrame(() => { flashEl.style.transition = 'opacity 1.5s ease-out'; flashEl.style.opacity = 0; });
      seals.forEach((s) => { s.tiltG.visible = true; });
    }
    if (st.clicked) {
      const sp = (T - TL.click) / 2.0;
      if (sp < 1) {
        shock.position.copy(center); shock.scale.setScalar(.5 + sp * 16);
        shock.material.opacity = Math.pow(1 - sp, 1.5) * .9;
      } else shock.visible = false;

      const sealP = ease(prog(T, TL.click + .1, 1.7));
      seals.forEach((s, i) => {
        const R = lerp(4.2, 2.05, backOut(prog(T, TL.click + .1, 1.7)));
        s.mesh.scale.setScalar(R);
        s.tiltG.position.copy(cg.position);
        s.mat.uniforms.uSeal.value = sealP * .95;
        s.mesh.rotation.z = T * (.5 + (1 - sealP) * 3) * s.dir;
      });

      // lluvia de chispas desde el corazón sellado
      if (rand() < .6) {
        const a = rand() * 6.2832, r = 1 + rand() * 1.2;
        emit(Math.cos(a) * r, (rand() - .5) * 2.4, Math.sin(a) * .5, 0, .2 + rand() * .3, 0, 2.2 + rand() * 2.2, .04 + rand() * .06);
      }
    }

    /* --- estrellas fugaces --- */
    if (T > st.shoot) {
      st.shoot = T + 3 + rand() * 4;
      const d = rand() < .5 ? 1 : -1;
      shooters.push({ x: -d * (7 + rand() * 4), y: 3.5 + rand() * 3.5, z: -6 - rand() * 4, vx: d * (10 + rand() * 4), vy: -(2 + rand() * 2), life: 1.3 });
    }
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
      for (let k = 0; k < 4; k++) emit(s.x - s.vx * .03 * k, s.y - s.vy * .03 * k, s.z, 0, 0, 0, .6, .09, [.9, .93, 1]);
      if (s.life <= 0) shooters.splice(i, 1);
    }

    /* --- ondas --- */
    ringPool.forEach((r) => {
      if (!r.visible) return;
      const p = (T - r.userData.t0) / r.userData.dur;
      if (p >= 1) { r.visible = false; return; }
      r.scale.setScalar(.4 + p * r.userData.size);
      r.material.opacity = Math.pow(1 - p, 1.6) * .8;
    });

    /* --- textos --- */
    if (!st.msg && T > TL.msg) { st.msg = true; msgEl.classList.add('show'); }
    if (!st.replay && T > TL.replay) { st.replay = true; replayEl.classList.add('show'); }

    updatePool(dt);

    /* --- cámara --- */
    if (!drag.active) drag.theta *= Math.exp(-dt * .5);
    const open = ease(prog(T, 0, 6));
    const seq = smooth(TL.lockIn - .5, TL.lockIn + 2, T) * (1 - smooth(TL.click + 1, TL.click + 4, T));
    const dist = L.dist * lerp(.74, 1, open) * (1 - .14 * seq) * (1 - .06 * surge);
    const theta = -.3 * (1 - open) + .09 * Math.sin(T * .22) + drag.theta;
    const camY = lerp(-.2, .1, open) + .1 * Math.sin(T * .17) - .15 * seq;
    const shake = surge * .035;
    camera.position.set(Math.sin(theta) * dist + (rand() - .5) * shake, camY + (rand() - .5) * shake, Math.cos(theta) * dist);
    camera.lookAt(0, -.45 * seq, 0);

    renderer.render(scene, camera);
  }

  function loop() {
    requestAnimationFrame(loop);
    if (!running) return;
    update(Math.min(clock.getDelta(), .05));
  }

  buildMessage();
  const ready = (document.fonts && document.fonts.load)
    ? Promise.race([document.fonts.load('800 100px Orbitron'), new Promise((r) => setTimeout(r, 1500))])
    : Promise.resolve();

  ready.then(() => {
    buildInitials();
    reset();
    clock.getDelta();
    running = CONFIG.autoStart;
    loop();
  });

  // API opcional para integrarlo en tu página principal
  window.Candado = {
    start() { reset(); clock.getDelta(); running = true; },
    reset,
    stop() { running = false; }
  };
})();
