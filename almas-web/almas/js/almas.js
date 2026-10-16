/* =====================================================================
   DOS ALMAS  ·  HTML5 + CSS3 + JavaScript + Three.js
   ---------------------------------------------------------------------
     0.3s  sale la luna y se enciende el cielo
     2.6s  la silueta turquesa se dibuja con una pluma de luz
     3.6s  la silueta morada se dibuja
     7.4s  los corazones despiertan y empiezan a latir
     9.0s  de cada pecho se desprende un alma de luz
    11.6s  las almas se encuentran: explosión de magia, nace un corazón
    12.2s  hilos entrelazados unen sus latidos (ya laten al mismo ritmo)
    13.0s  mensaje final
   ===================================================================== */

const CONFIG = {
  message: 'Dos almas, un solo latido ♥',  // texto final
  title: '',                                // ej. 'Luna' (pequeño, arriba). Vacío = sin título
  autoStart: true,
  bpm: 66,                                  // latidos por minuto
  womanColor: [0.15, 0.95, 0.90],           // turquesa
  manColor:   [0.72, 0.38, 1.00]            // morado
};

(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const msgEl = $('msg'), replayEl = $('replay'), titleEl = $('title'), flashEl = $('flash');

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

  /* ------------------------------ Renderer ------------------------------ */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !LOW, powerPreference: 'high-performance' });
  } catch (e) { msgEl.textContent = 'Tu navegador no soporta WebGL'; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LOW ? 1.75 : 2));
  renderer.setClearColor(0x02040c, 1);
  $('gl').appendChild(renderer.domElement);
  const glEl = renderer.domElement;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 800);

  const timeU = { value: 0 };
  const beatU = { value: 0 };
  const pixelU = { value: renderer.getPixelRatio() };
  const scaleU = { value: 1 };
  let W = 1, H = 1;

  /* ------------------------------ Composición (responsive) ------------------------------ */
  const L = { charX: 3.3, charS: 1, moonRapp: 2.4, moonYapp: .6, dist: 8.6, groundY: -1.9 };
  function computeLayout() {
    const a = camera.aspect, t = smooth(.55, 1.3, a);
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    L.charX = lerp(1.35, 3.3, t);
    L.charS = lerp(.8, 1, t);
    L.moonRapp = lerp(1.8, 2.4, t);
    L.moonYapp = lerp(2.0, .6, t);
    const halfW = (L.charX + .95 * L.charS) * 1.12;
    L.dist = Math.max(8.2, halfW / (tanH * a));
    L.groundY = -1.9 * L.charS;
  }
  function resize() {
    W = Math.max(1, window.innerWidth); H = Math.max(1, window.innerHeight);
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    scaleU.value = (H * renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    computeLayout();
    if (typeof applyLayout === 'function') applyLayout();
  }
  window.addEventListener('resize', resize);

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
    gr.addColorStop(.22, 'rgba(210,220,255,.55)');
    gr.addColorStop(.6, 'rgba(150,170,255,.14)');
    gr.addColorStop(1, 'rgba(120,150,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const raysTex = canvasTex(512, 512, (g, w, h) => {
    g.translate(w / 2, h / 2);
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand() * .25, half = .03 + rand() * .05, R = w / 2;
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
      gr.addColorStop(0, 'rgba(210,220,255,.5)');
      gr.addColorStop(1, 'rgba(180,200,255,0)');
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(0, 0);
      g.lineTo(Math.cos(a - half) * R, Math.sin(a - half) * R);
      g.lineTo(Math.cos(a + half) * R, Math.sin(a + half) * R);
      g.closePath(); g.fill();
    }
  });
  const ringTex = canvasTex(256, 256, (g, w, h) => {
    g.shadowColor = 'rgba(255,255,255,.9)'; g.shadowBlur = 14;
    g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 5;
    g.beginPath(); g.arc(w / 2, h / 2, w * .36, 0, 6.2832); g.stroke();
  });

  function makeSprite(tex, scale, opacity, color) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, color: color === undefined ? 0xffffff : color
    }));
    s.scale.set(scale, scale, 1);
    return s;
  }
  const rgb2c = (a) => new THREE.Color(a[0], a[1], a[2]);

  /* ------------------------------ Fondo y estrellas ------------------------------ */
  const backdrop = new THREE.Mesh(
    new THREE.SphereGeometry(300, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, uniforms: { uTime: timeU },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `
        uniform float uTime; varying vec3 vDir;
        void main(){
          vec3 d = normalize(vDir);
          float h = d.y*.5 + .5;
          vec3 c = mix(vec3(.02,.03,.07), vec3(.012,.012,.05), smoothstep(.3,.85,h));
          c += vec3(.12,.06,.22) * pow(max(0., 1. - abs(d.y-.05)*2.4), 2.) * .55;
          c += vec3(.0,.10,.14) * pow(max(0., 1. - abs(d.y-.25)*3.), 2.) * (.35 + .15*sin(uTime*.2 + d.x*4.));
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
    const n = Math.round(1500 * Q);
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const u = rand() * 2 - 1, a = rand() * 6.2832, s = Math.sqrt(1 - u * u), R = 60 + rand() * 180;
      pos.set([Math.cos(a) * s * R, Math.abs(u) * R * .9 + 5, Math.sin(a) * s * R], i * 3);
      const k = rand();
      if (k < .6) col.set([.9, .93, 1], i * 3); else if (k < .8) col.set([.75, .6, 1], i * 3); else col.set([.5, 1, .95], i * 3);
      seed[i] = rand();
    }
    scene.add(makePoints(pos, col, seed, .36, 0));
  })();

  /* ===================================================================
     LA LUNA
     =================================================================== */
  const MOON_Z = -4;
  const moonMat = new THREE.ShaderMaterial({
    uniforms: { uTime: timeU, uFade: { value: 0 }, uSurge: { value: 0 } },
    vertexShader: `
      varying vec3 vPos; varying vec3 vN;
      void main(){ vPos = position; vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `
      uniform float uTime, uFade, uSurge; varying vec3 vPos; varying vec3 vN;
      float hash(vec3 p){ p = fract(p*.3183099 + .1); p *= 17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
      float noise(vec3 x){
        vec3 i = floor(x), f = fract(x); f = f*f*(3. - 2.*f);
        return mix(mix(mix(hash(i), hash(i+vec3(1.,0.,0.)), f.x), mix(hash(i+vec3(0.,1.,0.)), hash(i+vec3(1.,1.,0.)), f.x), f.y),
                   mix(mix(hash(i+vec3(0.,0.,1.)), hash(i+vec3(1.,0.,1.)), f.x), mix(hash(i+vec3(0.,1.,1.)), hash(i+vec3(1.,1.,1.)), f.x), f.y), f.z);
      }
      float fbm(vec3 p){ float a = .5, s = 0.; for(int i=0;i<5;i++){ s += a*noise(p); p *= 2.03; a *= .5; } return s; }
      float crater(vec3 p, float sc){
        vec3 q = p*sc, i = floor(q), f = fract(q);
        vec3 c = .35 + .3*vec3(hash(i), hash(i+7.1), hash(i+13.3));
        float d = length(f - c), rad = .14 + .17*hash(i+3.7);
        float rim = smoothstep(rad-.05, rad, d) - smoothstep(rad, rad+.07, d);
        float bowl = 1. - smoothstep(0., rad, d);
        return rim*.55 - bowl*.4;
      }
      void main(){
        vec3 p = vPos;
        float base = .74 + .16*fbm(p*3.);
        float maria = smoothstep(.45, .68, fbm(p*1.6 + 3.)) * .3;
        float cr = crater(p, 5.) + .7*crater(p+10., 9.) + .5*crater(p+20., 16.);
        float v = base - maria + cr*.45;
        vec3 N = normalize(vN);
        float l = dot(N, normalize(vec3(-.5,.4,.8)))*.45 + .6;
        vec3 col = vec3(.86,.9,1.) * v * l;
        float fres = pow(1. - abs(N.z), 3.);
        col += vec3(.5,.62,1.) * fres * .55;
        col *= 1. + uSurge*.35;
        gl_FragColor = vec4(col * uFade, 1.);
      }`
  });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), moonMat);
  scene.add(moon);

  const moonHalo = makeSprite(glowTex, 1, 0, 0x9fb4ff);
  const moonHalo2 = makeSprite(glowTex, 1, 0, 0xb59cff);
  const moonRays = makeSprite(raysTex, 1, 0, 0xbfd0ff);
  scene.add(moonHalo2, moonHalo, moonRays);

  // Anillos mágicos alrededor de la luna (aparecen cuando se encuentran las almas)
  const runeRing = new THREE.Group();
  runeRing.position.z = MOON_Z + .2;
  scene.add(runeRing);
  const rings = [];
  [[1, 150, .05], [1.16, 100, .04]].forEach(([r, n, size], k) => {
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.2832 + rand() * .02, rr = r * (1 + (rand() - .5) * .015);
      pos.set([Math.cos(a) * rr, Math.sin(a) * rr, 0], i * 3);
      col.set(rand() < .5 ? [.7, .8, 1] : (rand() < .5 ? [.6, 1, .95] : [.8, .6, 1]), i * 3);
      seed[i] = rand();
    }
    const p = makePoints(pos, col, seed, size, .01);
    p.userData.dir = k ? -1 : 1;
    runeRing.add(p); rings.push(p);
  });
  runeRing.visible = false;

  /* ---- Reflejo de la luna sobre el agua ---- */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 40),
    new THREE.ShaderMaterial({
      depthTest: false, depthWrite: false, uniforms: { uTime: timeU, uMoon: { value: 0 } },
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }',
      fragmentShader: `
        uniform float uTime, uMoon; varying vec3 vW;
        void main(){
          float fade = smoothstep(-16., -2., vW.z) * (1. - smoothstep(1., 9., vW.z));
          float path = exp(-pow(vW.x*.42, 2.));
          float sh = .5 + .5*sin(vW.z*6. - uTime*1.3 + sin(vW.x*3. + uTime)*2.);
          float n = .5 + .5*sin(vW.x*9. + vW.z*4. + uTime*2.);
          vec3 c = vec3(.02,.03,.07) + vec3(.03,.05,.12)*fade + vec3(.6,.72,1.)*path*sh*n*.3*fade*uMoon;
          gl_FragColor = vec4(c, 1.);
        }`
    }));
  floor.rotation.x = -Math.PI / 2;
  floor.renderOrder = -5;
  scene.add(floor);

  // Neblina suave
  const mists = [0, 1, 2].map((i) => {
    const m = makeSprite(glowTex, 16, .05, i === 1 ? 0x9a86ff : 0x7fa0ff);
    m.position.set((i - 1) * 6, -1.2 + i * .4, -2 - i);
    m.userData = { x0: (i - 1) * 6, sp: .12 + i * .05, ph: i * 2 };
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
    o.geo = g;
    o.mesh = new THREE.Points(g, dynMat);
    o.mesh.frustumCulled = false;
    o.flush = () => { ['position', 'aAlpha', 'aSize', 'aColor'].forEach((k) => { g.attributes[k].needsUpdate = true; }); };
    scene.add(o.mesh);
    return o;
  }

  // Pool general (estelas, explosiones, chispas)
  const PN = Math.round(2200 * Q);
  const pool = dyn(PN);
  const pV = new Float32Array(PN * 3), pL = new Float32Array(PN), pM = new Float32Array(PN).fill(1);
  let pHead = 0;
  const PAL = [[.4, 1, .95], [.78, .5, 1], [1, 1, 1], [.65, .8, 1], [1, .5, .8]];
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
      const c = rand() < .4 ? rgb2arr(CONFIG.womanColor) : (rand() < .6 ? rgb2arr(CONFIG.manColor) : [1, 1, 1]);
      emit(cx, cy, cz, Math.cos(a) * s * sp, u * sp * .9 + .4, Math.sin(a) * s * sp, 1.6 + rand() * 2.4, .06 + rand() * .1, c);
    }
  }
  function rgb2arr(a) { return [a[0], a[1], a[2]]; }
  function updatePool(dt) {
    const drag = Math.max(0, 1 - dt * .9);
    for (let i = 0; i < PN; i++) {
      if (pL[i] <= 0) { pool.alpha[i] = 0; continue; }
      pL[i] -= dt;
      const k = i * 3;
      pool.pos[k] += pV[k] * dt; pool.pos[k + 1] += pV[k + 1] * dt; pool.pos[k + 2] += pV[k + 2] * dt;
      pV[k] *= drag; pV[k + 1] = pV[k + 1] * drag + .22 * dt; pV[k + 2] *= drag;
      pool.alpha[i] = Math.max(0, pL[i] / pM[i]);
    }
    pool.flush();
  }

  /* ===================================================================
     PERSONAJES (siluetas que se dibujan)
     =================================================================== */
  const outlineVS = `
    attribute float aT; varying float vT; varying vec3 vN; varying vec3 vV;
    void main(){ vT = aT; vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`;
  const outlineFS = `
    uniform float uDraw, uAlpha, uBeat; uniform vec3 uColor; varying float vT; varying vec3 vN; varying vec3 vV;
    void main(){
      if(vT > uDraw) discard;
      float rim = pow(1. - abs(dot(normalize(vN), normalize(vV))), 1.2);
      float head = 1. - smoothstep(0., .03, uDraw - vT);
      vec3 col = uColor * (.55 + .9*rim) + vec3(1.) * head * 1.5;
      col *= 1. + uBeat*.35;
      gl_FragColor = vec4(col, uAlpha);
    }`;
  function outlineMat(color, alpha) {
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uDraw: { value: 0 }, uAlpha: { value: alpha }, uBeat: beatU, uColor: { value: color } },
      vertexShader: outlineVS, fragmentShader: outlineFS
    });
  }

  function heartXY(t) {
    const s = Math.sin(t);
    return [16 * s * s * s, 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)];
  }
  const heartShapeGeo = (() => {
    const pts = [], sc = .011;
    for (let i = 0; i < 90; i++) { const [x, y] = heartXY((i / 90) * 6.2832); pts.push(new THREE.Vector2(x * sc, (y + 2.5) * sc)); }
    return new THREE.ShapeGeometry(new THREE.Shape(pts));
  })();

  function buildChar(pts, rgb, heartPos, ph) {
    const col = rgb2c(rgb);
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], 0)), true, 'centripetal');
    const poly = curve.getPoints(240).map((v) => new THREE.Vector2(v.x, v.y));

    const fillMat = new THREE.ShaderMaterial({
      side: THREE.DoubleSide, uniforms: { uFillH: { value: -1 }, uColor: { value: col } },
      vertexShader: 'varying float vY; void main(){ vY = position.y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `
        uniform float uFillH; uniform vec3 uColor; varying float vY;
        void main(){
          if(vY > uFillH) discard;
          float g = 1. - clamp(vY/3.3, 0., 1.);
          vec3 c = vec3(.004,.006,.016) + uColor*.05*g*g;
          gl_FragColor = vec4(c, 1.);
        }`
    });
    const fill = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(poly)), fillMat);

    const N = 360, RS = 6;
    const tube = (r, alpha) => {
      const geo = new THREE.TubeGeometry(curve, N, r, RS, true);
      const aT = new Float32Array((N + 1) * (RS + 1));
      for (let i = 0; i <= N; i++) for (let j = 0; j <= RS; j++) aT[i * (RS + 1) + j] = i / N;
      geo.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
      const mat = outlineMat(col, alpha);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.z = .01; mesh.frustumCulled = false;
      return { mesh, mat };
    };
    const line = tube(.016, 1), glow = tube(.07, .16);

    const group = new THREE.Group();
    group.add(fill, glow.mesh, line.mesh);

    // corazón del pecho
    const hg = new THREE.Group();
    hg.position.set(heartPos[0], heartPos[1], .03);
    const heart = new THREE.Mesh(heartShapeGeo, new THREE.MeshBasicMaterial({ color: 0xff2e50 }));
    const hHalo = makeSprite(glowTex, 1.1, 0, 0xff4a70);
    hg.add(hHalo, heart);
    hg.scale.setScalar(0.001);
    group.add(hg);
    scene.add(group);

    return {
      rgb, col, curve, group, fillMat, line, glow, hg, heart, hHalo, ph, heartPos,
      draws: 0, lastCycle: -1, ripples: []
    };
  }

  const womanPts = [[-.8, 0], [-.6, .5], [-.4, 1.2], [-.32, 1.75], [-.3, 1.85], [-.5, 1.9], [-.52, 2.3], [-.42, 2.75], [-.2, 3.0],
    [.05, 3.05], [.3, 2.95], [.45, 2.7], [.5, 2.3], [.5, 1.9], [.3, 1.85], [.32, 1.75], [.4, 1.2], [.6, .5], [.8, 0], [0, -.03]];
  const manPts = [[-.45, 0], [-.45, .8], [-.44, 1.6], [-.42, 2.15], [-.2, 2.3], [-.14, 2.4], [-.34, 2.55], [-.38, 2.85], [-.25, 3.1],
    [0, 3.18], [.25, 3.1], [.38, 2.85], [.34, 2.55], [.14, 2.4], [.2, 2.3], [.42, 2.15], [.44, 1.6], [.45, .8], [.45, 0], [0, -.02]];

  const woman = buildChar(womanPts, CONFIG.womanColor, [0, 1.38], 0);
  const man = buildChar(manPts, CONFIG.manColor, [0, 1.72], 1.7);
  const chars = [woman, man];
  woman.timing = { draw: [2.6, 3.6], fill: [5.0, 2.2], heart: 7.4 };
  man.timing = { draw: [3.6, 3.6], fill: [6.0, 2.2], heart: 7.9 };

  // luz bajo los pies y aura
  chars.forEach((c) => {
    c.aura = makeSprite(glowTex, 6, 0, c.col.getHex());
    c.aura.position.set(0, 1.6, -.3);
    c.group.add(c.aura);
    c.foot = makeSprite(glowTex, 3.4, 0, c.col.getHex());
    c.foot.position.set(0, .05, .1);
    c.foot.scale.set(3.4, 1.0, 1);
    c.group.add(c.foot);
  });

  /* Onda expansiva de cada latido */
  const ringPool = [];
  for (let i = 0; i < 6; i++) {
    const s = makeSprite(ringTex, 1, 0, 0xff5c80);
    s.visible = false; s.userData = { t0: -1, size: 2 };
    scene.add(s); ringPool.push(s);
  }
  function pulseRing(pos, size, color, dur) {
    const s = ringPool.find((r) => !r.visible) || ringPool[0];
    s.visible = true; s.position.copy(pos); s.material.color.set(color);
    s.userData.t0 = T; s.userData.size = size; s.userData.dur = dur || 1.1;
  }

  /* ---- Almas (orbes) y corazón unido ---- */
  const orbs = chars.map((c) => {
    const halo = makeSprite(glowTex, .9, 0, c.col.getHex());
    const core = makeSprite(glowTex, .26, 0, 0xffffff);
    halo.visible = core.visible = false;
    scene.add(halo, core);
    return { halo, core, p0: new THREE.Vector3(), p1: new THREE.Vector3(), c };
  });

  const merged = (() => {
    const g = new THREE.Group();
    const build = (n, sc, thick, size) => {
      const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), seed = new Float32Array(n);
      const A = CONFIG.womanColor, B = CONFIG.manColor;
      for (let i = 0; i < n; i++) {
        const [x, y] = heartXY(rand() * 6.2832);
        const a = rand() * 6.2832, r = Math.pow(rand(), .6) * thick;
        pos[i * 3] = x * sc + Math.cos(a) * r;
        pos[i * 3 + 1] = (y + 2.5) * sc + Math.sin(a) * r;
        pos[i * 3 + 2] = (rand() - .5) * thick * 1.8;
        const t = clamp((x / 16 + 1) / 2 + (rand() - .5) * .15, 0, 1);
        if (rand() < .12) col.set([1, .95, 1], i * 3);
        else col.set([lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)], i * 3);
        seed[i] = rand();
      }
      return makePoints(pos, col, seed, size, .012);
    };
    const a = build(Math.round(3000 * Q), .046, .028, .045);
    const b = build(Math.round(1800 * Q), .038, .026, .04);
    b.rotation.y = .5;
    g.add(a, b);
    const halo = makeSprite(glowTex, 3.2, 0, 0xd0a8ff);
    g.add(halo);
    g.visible = false;
    scene.add(g);
    return { g, halo };
  })();

  /* ---- Hilos entrelazados entre los dos corazones ---- */
  const TN = Math.round(170 * Q);
  const threads = dyn(TN * 2);

  /* ---- Estrellas fugaces ---- */
  const shooters = [];
  function spawnShooter() {
    const dir = rand() < .5 ? 1 : -1;
    shooters.push({ x: -dir * (6 + rand() * 4), y: 3.5 + rand() * 3, z: -6 - rand() * 4, vx: dir * (9 + rand() * 4), vy: -(2 + rand() * 2), life: 1.3 });
  }

  /* ===================================================================
     LAYOUT
     =================================================================== */
  const moonPos = new THREE.Vector3(), centerPos = new THREE.Vector3();
  let moonWR = 2.4;
  function applyLayout() {
    woman.group.position.set(-L.charX, L.groundY, 0);
    man.group.position.set(L.charX, L.groundY, 0);
    woman.group.scale.setScalar(L.charS);
    man.group.scale.setScalar(L.charS);
    const s = (L.dist + Math.abs(MOON_Z)) / L.dist;
    moonPos.set(0, L.moonYapp * s, MOON_Z);
    moonWR = L.moonRapp * s;
    floor.position.y = L.groundY;
  }
  resize();

  /* ===================================================================
     CÁMARA / INTERACCIÓN
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
    if (wasTap && T > 20) reset();
  });
  glEl.addEventListener('pointercancel', () => { drag.active = false; });

  /* ===================================================================
     LÍNEA DE TIEMPO
     =================================================================== */
  const period = 60 / CONFIG.bpm;
  const beatAt = (t) => {
    const p = (((t / period) % 1) + 1) % 1;
    return Math.min(1.2, Math.exp(-Math.pow(p * 7, 2)) + .55 * Math.exp(-Math.pow((p - .27) * 8, 2)));
  };

  let T = 0, running = false;
  const st = { released: false, merged: false, msg: false, replay: false, shoot: 4 };
  const clock = new THREE.Clock();
  const tmpV = new THREE.Vector3(), tipV = new THREE.Vector3(), A = new THREE.Vector3(), B = new THREE.Vector3();
  const penGlow = makeSprite(glowTex, .5, 0, 0xffffff), penCore = makeSprite(glowTex, .15, 0, 0xffffff);
  scene.add(penGlow, penCore);
  const shock = makeSprite(ringTex, 1, 0, 0xe6d6ff);
  shock.visible = false;
  scene.add(shock);

  function buildMessage() {
    msgEl.innerHTML = Array.from(CONFIG.message).map((ch, i) =>
      `<span style="animation-delay:${(i * .07).toFixed(2)}s">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
    titleEl.textContent = CONFIG.title || '';
  }

  function reset() {
    T = 0; st.released = st.merged = st.msg = st.replay = false; st.shoot = 4;
    pL.fill(0); pool.alpha.fill(0);
    msgEl.classList.remove('show'); replayEl.classList.remove('show'); titleEl.classList.remove('show');
    chars.forEach((c) => {
      c.line.mat.uniforms.uDraw.value = 0; c.glow.mat.uniforms.uDraw.value = 0;
      c.fillMat.uniforms.uFillH.value = -1; c.hg.scale.setScalar(.001); c.lastCycle = -1;
      c.group.rotation.z = 0;
    });
    orbs.forEach((o) => { o.halo.visible = o.core.visible = false; });
    merged.g.visible = false; runeRing.visible = false; shock.visible = false;
    ringPool.forEach((r) => { r.visible = false; });
    threads.alpha.fill(0); threads.flush();
    shooters.length = 0; drag.theta = 0; flashEl.style.opacity = 0;
  }

  function worldHeart(c, out) { out.set(c.heartPos[0], c.heartPos[1], .03); return c.group.localToWorld(out); }

  function update(dt) {
    T += dt;
    timeU.value += dt;

    /* --- balanceo suave y matrices --- */
    const connect = smooth(10.8, 13.5, T);
    woman.group.rotation.z = Math.sin(T * .7) * .006 - .035 * connect;
    man.group.rotation.z = Math.sin(T * .7 + 1.7) * .006 + .035 * connect;
    scene.updateMatrixWorld(true);

    /* --- latido (sincroniza poco a poco) --- */
    const off = lerp(.14, 0, connect);
    const bW = beatAt(T), bM = beatAt(T - off);
    const hearts = [bW, bM];
    beatU.value = Math.max(0, ((bW + bM) / 2) * smooth(7.2, 8.4, T)) * .8;

    /* --- luna --- */
    const mIn = ease(prog(T, .3, 3.4));
    const surge = st.merged ? Math.exp(-(T - 11.6) * 1.0) : 0;
    moon.position.set(moonPos.x, moonPos.y - (1 - mIn) * 3.2 * (L.dist / 8.6), moonPos.z);
    moon.scale.setScalar(moonWR * lerp(.75, 1, mIn));
    moon.rotation.y = T * .015; moon.rotation.x = .15;
    moonMat.uniforms.uFade.value = mIn;
    moonMat.uniforms.uSurge.value = surge + (st.merged ? .05 * (bW + bM) : 0);
    floor.material.uniforms.uMoon.value = mIn * (1 + surge * .8);
    const mh = lerp(.4, 1, connect);
    [[moonHalo, 6.2, .5], [moonHalo2, 12, .2]].forEach(([s, k, o]) => {
      s.position.copy(moon.position); s.position.z -= .2;
      s.scale.setScalar(moonWR * k * (1 + .03 * Math.sin(T * 1.2)) * lerp(.7, 1, mIn));
      s.material.opacity = mIn * o * (mh + surge * .6);
    });
    moonRays.position.copy(moon.position); moonRays.position.z -= .3;
    moonRays.scale.setScalar(moonWR * 8.5);
    moonRays.material.opacity = mIn * (.1 + .16 * connect + .2 * surge);
    moonRays.material.rotation = T * .05;

    mists.forEach((m) => {
      m.position.x = m.userData.x0 + Math.sin(T * m.userData.sp + m.userData.ph) * 3;
      m.material.opacity = .045 * mIn;
    });

    /* --- siluetas: dibujo, relleno y corazones --- */
    let activePen = null;
    chars.forEach((c, idx) => {
      const tm = c.timing;
      const d = ease(prog(T, tm.draw[0], tm.draw[1]));
      c.line.mat.uniforms.uDraw.value = d * 1.02; c.glow.mat.uniforms.uDraw.value = d * 1.02;
      c.fillMat.uniforms.uFillH.value = ease(prog(T, tm.fill[0], tm.fill[1])) * 3.6 - .2;
      if (d > 0 && d < 1) { activePen = activePen || []; activePen.push([c, d]); }

      // corazón
      const hp = backOut(prog(T, tm.heart, .9));
      const bt = hearts[idx];
      c.hg.scale.setScalar(Math.max(.001, hp * (1 + .3 * bt)));
      c.hHalo.material.opacity = clamp(hp, 0, 1) * (.45 + .5 * bt);
      c.hHalo.scale.setScalar(1.1 + .7 * bt);
      c.aura.material.opacity = smooth(tm.heart, tm.heart + 2, T) * (.08 + .1 * connect + .05 * bt);
      c.foot.material.opacity = smooth(tm.fill[0], tm.fill[0] + 2, T) * (.28 + .1 * bt);

      // onda por latido
      if (T > tm.heart + .3) {
        const cyc = Math.floor((idx ? T - off : T) / period);
        if (cyc !== c.lastCycle) {
          c.lastCycle = cyc;
          pulseRing(worldHeart(c, tmpV), 2.2 * L.charS, 0xff5c80, 1.2);
        }
      }

      // chispas del contorno
      if (T > tm.fill[0] + 1.2 && rand() < .35) {
        tmpV.copy(c.curve.getPoint(rand())); c.group.localToWorld(tmpV);
        emit(tmpV.x, tmpV.y, tmpV.z + .05, (rand() - .5) * .1, .15 + rand() * .25, 0, 2 + rand() * 2, .04 + rand() * .05, rgb2arr(c.rgb));
      }
    });

    // pluma de luz + estela
    if (activePen) {
      const [c, d] = activePen[activePen.length - 1];
      tipV.copy(c.curve.getPoint(clamp(d, 0, 1))); c.group.localToWorld(tipV);
      penGlow.position.copy(tipV); penCore.position.copy(tipV);
      penGlow.material.color.copy(c.col);
      penGlow.material.opacity = Math.min(1, penGlow.material.opacity + dt * 6);
      penCore.material.opacity = penGlow.material.opacity;
      const s = .5 + .1 * Math.sin(T * 14); penGlow.scale.set(s, s, 1);
      for (let k = 0; k < 3; k++) {
        emit(tipV.x + (rand() - .5) * .06, tipV.y + (rand() - .5) * .06, tipV.z + .05,
          (rand() - .5) * .3, (rand() - .2) * .3, (rand() - .5) * .2, .7 + rand() * 1.0, .05 + rand() * .06, rgb2arr(c.rgb));
      }
    } else {
      penGlow.material.opacity = Math.max(0, penGlow.material.opacity - dt * 3);
      penCore.material.opacity = penGlow.material.opacity;
    }

    /* --- almas: salen del pecho y se buscan --- */
    A.copy(worldHeart(woman, new THREE.Vector3())); B.copy(worldHeart(man, new THREE.Vector3()));
    centerPos.set(0, (A.y + B.y) / 2 + 1.15 * L.charS, .4);
    const REL = 9.0, ARR = 11.6;
    if (!st.released && T >= REL) {
      st.released = true;
      orbs[0].p0.copy(A); orbs[1].p0.copy(B);
      orbs.forEach((o) => {
        o.p1.set(o.p0.x * .35, o.p0.y + 2.4 * L.charS, .9);
        o.halo.visible = o.core.visible = true;
      });
      pulseRing(A, 3, woman.col.getHex(), 1.6); pulseRing(B, 3, man.col.getHex(), 1.6);
      burst(A.x, A.y, A.z, 40, 1.2); burst(B.x, B.y, B.z, 40, 1.2);
    }
    if (st.released && !st.merged) {
      const s = ease(prog(T, REL, ARR - REL));
      orbs.forEach((o, i) => {
        const u = 1 - s;
        const x = u * u * o.p0.x + 2 * u * s * o.p1.x + s * s * centerPos.x;
        const y = u * u * o.p0.y + 2 * u * s * o.p1.y + s * s * centerPos.y;
        const z = u * u * o.p0.z + 2 * u * s * o.p1.z + s * s * centerPos.z;
        const a = s * 14 + i * 3.14, w = .2 * Math.sin(Math.PI * s);
        tmpV.set(x, y + Math.cos(a) * w, z + Math.sin(a) * w);
        o.halo.position.copy(tmpV); o.core.position.copy(tmpV);
        const sc = (.7 + .4 * hearts[i]) * (1 + s * .5);
        o.halo.scale.set(sc, sc, 1);
        o.halo.material.opacity = Math.min(1, s * 8 + .3);
        o.core.material.opacity = o.halo.material.opacity;
        for (let k = 0; k < 4; k++) {
          emit(tmpV.x + (rand() - .5) * .08, tmpV.y + (rand() - .5) * .08, tmpV.z + (rand() - .5) * .08,
            (rand() - .5) * .3, (rand() - .5) * .3, (rand() - .5) * .3, .8 + rand() * 1.1, .05 + rand() * .07, rgb2arr(o.c.rgb));
        }
      });
    }
    if (!st.merged && T >= ARR) {
      st.merged = true;
      orbs.forEach((o) => { o.halo.visible = o.core.visible = false; });
      burst(centerPos.x, centerPos.y, centerPos.z, Math.round(750 * Q), 3.4);
      merged.g.visible = true; runeRing.visible = true;
      shock.visible = true;
      flashEl.style.transition = 'none'; flashEl.style.opacity = .85;
      requestAnimationFrame(() => { flashEl.style.transition = 'opacity 1.4s ease-out'; flashEl.style.opacity = 0; });
      pulseRing(centerPos, 6 * L.charS, 0xe6d6ff, 2.0);
      setTimeout(() => pulseRing(centerPos, 4 * L.charS, 0x7ffff0, 1.8), 350);
    }

    /* --- corazón unido --- */
    if (st.merged) {
      const e = backOut(prog(T, ARR, 1.6));
      const b = (bW + bM) / 2;
      merged.g.position.set(centerPos.x, centerPos.y + .05 * Math.sin(T * 1.4), centerPos.z);
      merged.g.scale.setScalar(Math.max(.001, e * L.charS * (1 + .13 * b)));
      merged.g.rotation.y = Math.sin(T * .7) * .55;
      merged.halo.material.opacity = clamp(e, 0, 1) * (.4 + .35 * b);

      // onda expansiva
      const sp = (T - ARR) / 2.0;
      if (sp < 1) {
        shock.position.copy(centerPos); shock.scale.setScalar(.5 + sp * 14 * L.charS);
        shock.material.opacity = Math.pow(1 - sp, 1.5) * .9;
      } else shock.visible = false;

      // anillos mágicos alrededor de la luna
      const rg = ease(prog(T, ARR + .2, 2.4));
      runeRing.position.x = moon.position.x; runeRing.position.y = moon.position.y;
      runeRing.scale.setScalar(Math.max(.001, moonWR * 1.32 * rg));
      rings.forEach((r) => { r.rotation.z = T * .08 * r.userData.dir; });
    }

    /* --- hilos entrelazados --- */
    const reach = ease(prog(T, 12.2, 2.2));
    const bAvg = (bW + bM) / 2;
    const cyc = ((T / period) % 1) * 1.3;
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < TN; i++) {
        const idx = k * TN + i, s = i / (TN - 1);
        const ang = s * Math.PI * 5 + k * Math.PI + T * 1.2;
        const env = Math.sin(Math.PI * s) * .3 * L.charS;
        const px = lerp(A.x, B.x, s);
        const py = lerp(A.y, B.y, s) + Math.sin(Math.PI * s) * .75 * L.charS + Math.cos(ang) * env;
        const pz = lerp(A.z, B.z, s) + Math.sin(ang) * env;
        threads.pos[idx * 3] = px; threads.pos[idx * 3 + 1] = py; threads.pos[idx * 3 + 2] = pz;
        const dEnd = Math.min(s, 1 - s);
        const vis = clamp((reach * .5 - dEnd) / .04, 0, 1);
        const q = dEnd * 2;
        const pulse = Math.exp(-Math.pow((q - cyc) * 6, 2));
        threads.alpha[idx] = vis * (.55 + .6 * pulse);
        threads.size[idx] = (.05 + .07 * pulse + .02 * bAvg) * (.8 + .4 * Math.sin(i * 1.7 + k));
        const t = k ? 1 - s : s, A2 = CONFIG.womanColor, B2 = CONFIG.manColor;
        threads.col[idx * 3] = lerp(A2[0], B2[0], t); threads.col[idx * 3 + 1] = lerp(A2[1], B2[1], t); threads.col[idx * 3 + 2] = lerp(A2[2], B2[2], t);
      }
    }
    threads.flush();

    /* --- chispas del corazón unido y estrellas fugaces --- */
    if (st.merged && T > ARR + 1 && rand() < .5) {
      const a = rand() * 6.2832, r = .3 + rand() * 1.1 * L.charS;
      emit(centerPos.x + Math.cos(a) * r, centerPos.y + (rand() - .5) * 1.2, centerPos.z + Math.sin(a) * r * .5,
        0, .2 + rand() * .3, 0, 2.2 + rand() * 2.2, .04 + rand() * .06);
    }
    if (T > st.shoot) { st.shoot = T + 3 + rand() * 4; spawnShooter(); }
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
      for (let k = 0; k < 4; k++) emit(s.x - s.vx * .03 * k, s.y - s.vy * .03 * k, s.z, 0, 0, 0, .6, .09, [.9, .93, 1]);
      if (s.life <= 0) shooters.splice(i, 1);
    }

    /* --- ondas de latido --- */
    ringPool.forEach((r) => {
      if (!r.visible) return;
      const p = (T - r.userData.t0) / (r.userData.dur || 1.1);
      if (p >= 1) { r.visible = false; return; }
      r.scale.setScalar(.4 + p * r.userData.size);
      r.material.opacity = Math.pow(1 - p, 1.6) * .8;
    });

    /* --- textos --- */
    if (!st.msg && T > 13) { st.msg = true; msgEl.classList.add('show'); if (CONFIG.title) titleEl.classList.add('show'); }
    if (!st.replay && T > 20) { st.replay = true; replayEl.classList.add('show'); }

    updatePool(dt);

    /* --- cámara --- */
    if (!drag.active) drag.theta *= Math.exp(-dt * .5);
    const open = ease(prog(T, 0, 6));
    const dolly = 1 - .07 * surge;
    const dist = L.dist * lerp(.66, 1, open) * dolly;
    const theta = -.32 * (1 - open) + .1 * Math.sin(T * .2) + drag.theta;
    const camY = lerp(-.9, .2, open) + .12 * Math.sin(T * .17);
    const shake = surge * .03;
    camera.position.set(Math.sin(theta) * dist + (rand() - .5) * shake, camY + (rand() - .5) * shake, Math.cos(theta) * dist);
    camera.lookAt(0, lerp(L.moonYapp * .9, .1, open), 0);

    renderer.render(scene, camera);
  }

  function loop() {
    requestAnimationFrame(loop);
    if (!running) return;
    update(Math.min(clock.getDelta(), .05));
  }

  buildMessage();
  const ready = (document.fonts && document.fonts.load)
    ? Promise.race([document.fonts.load('italic 600 40px "Playfair Display"'), new Promise((r) => setTimeout(r, 1500))])
    : Promise.resolve();

  ready.then(() => {
    reset();
    clock.getDelta();
    running = CONFIG.autoStart;
    loop();
  });

  // API opcional para integrarlo en tu página principal
  window.Almas = {
    start() { reset(); clock.getDelta(); running = true; },
    reset,
    stop() { running = false; }
  };
})();
