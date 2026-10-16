/* =====================================================================
   UN TULIPÁN QUE SE DIBUJA  ·  HTML5 + CSS3 + JavaScript + Three.js
   ---------------------------------------------------------------------
   Línea de tiempo:
     0.0s  la noche, polvo de luz y la tierra se ilumina
     0.9s  el tallo se dibuja con una pluma de luz
     3.4s  las hojas se trazan y se rellenan
     4.6s  pétalos exteriores: boceto → color turquesa
     6.4s  pétalos interiores
     9.8s  FLORACIÓN: el tulipán se abre, explosión de luz y rayos
    11.5s  mensaje final
   ===================================================================== */

(() => {
  'use strict';

  const CONFIG = {
    message: 'Para ti, mi amor ♥',
    autoStart: false,
    petalBase: [0.00, 0.40, 0.46],
    petalTip: [0.60, 1.00, 0.96],
    petalLine: [0.45, 1.00, 0.98]
  };

  const $ = (id) => document.getElementById(id);
  const msgEl = $('msg'), replayEl = $('replay'), stageEl = $('tulip-stage');

  if (typeof THREE === 'undefined') {
    msgEl.textContent = 'No se pudo cargar Three.js';
    return;
  }

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
  } catch (e) {
    msgEl.textContent = 'Tu navegador no soporta WebGL';
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LOW ? 1.75 : 2));
  renderer.setClearColor(0x01060b, 1);
  $('tulip-gl').appendChild(renderer.domElement);
  const glEl = renderer.domElement;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 800);

  const timeU = { value: 0 };
  const glowU = { value: 0 };
  const pixelU = { value: renderer.getPixelRatio() };
  const scaleU = { value: 1 };
  let W = 1, H = 1;

  function resize() {
    W = Math.max(1, stageEl.clientWidth); H = Math.max(1, stageEl.clientHeight);
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    scaleU.value = (H * renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  }
  window.addEventListener('resize', resize);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(stageEl);
  resize();

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
    gr.addColorStop(.22, 'rgba(160,255,245,.55)');
    gr.addColorStop(.6, 'rgba(0,200,210,.14)');
    gr.addColorStop(1, 'rgba(0,180,200,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  const raysTex = canvasTex(512, 512, (g, w, h) => {
    g.translate(w / 2, h / 2);
    const n = 16;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand() * .25, half = .035 + rand() * .06, R = w / 2;
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
      gr.addColorStop(0, 'rgba(180,255,248,.55)');
      gr.addColorStop(1, 'rgba(120,255,240,0)');
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(0, 0);
      g.lineTo(Math.cos(a - half) * R, Math.sin(a - half) * R);
      g.lineTo(Math.cos(a + half) * R, Math.sin(a + half) * R);
      g.closePath(); g.fill();
    }
  });

  function makeSprite(tex, scale, opacity, color) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, color: color || 0xffffff
    }));
    s.scale.set(scale, scale, 1);
    return s;
  }

  /* ------------------------------ Fondo ------------------------------ */
  const backdrop = new THREE.Mesh(
    new THREE.SphereGeometry(300, 24, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `
        varying vec3 vDir;
        void main(){
          vec3 d = normalize(vDir);
          float h = d.y*.5 + .5;
          vec3 c = mix(vec3(.0,.085,.105), vec3(.0,.012,.04), smoothstep(.25,.8,h));
          c += vec3(.0,.12,.14) * pow(max(0., 1. - abs(d.y+.05)*2.2), 2.) * .8;
          gl_FragColor = vec4(c, 1.);
        }`
    }));
  backdrop.renderOrder = -10;
  scene.add(backdrop);

  /* --------------------- Puntos brillantes (shader propio) --------------------- */
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

  // Estrellas lejanas
  (function stars() {
    const n = Math.round(1300 * Q);
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const u = rand() * 2 - 1, a = rand() * 6.2832, s = Math.sqrt(1 - u * u), R = 60 + rand() * 180;
      pos.set([Math.cos(a) * s * R, u * R, Math.sin(a) * s * R], i * 3);
      if (rand() < .6) col.set([.85, 1, 1], i * 3); else col.set([.5, 1, .95], i * 3);
      seed[i] = rand();
    }
    scene.add(makePoints(pos, col, seed, .34, 0));
  })();

  // Luciérnagas / polvo de luz cerca de la flor
  (function dustField() {
    const n = Math.round(420 * Q);
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = rand() * 6.2832, r = 1 + rand() * 5;
      pos.set([Math.cos(a) * r, -2.2 + rand() * 6, Math.sin(a) * r], i * 3);
      col.set(rand() < .5 ? [.35, 1, .95] : [.7, 1, 1], i * 3);
      seed[i] = rand();
    }
    scene.add(makePoints(pos, col, seed, .05, .22));
  })();

  /* ===================================================================
     SUELO MÁGICO
     =================================================================== */
  const ground = new THREE.Group();
  ground.position.y = -2;
  scene.add(ground);

  const flat = (geo, mat, y) => {
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2; m.position.y = y; ground.add(m); return m;
  };
  const groundGlow = flat(new THREE.PlaneGeometry(16, 16),
    new THREE.MeshBasicMaterial({ map: glowTex, color: 0x33ffe6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }), .005);
  const baseRing = flat(new THREE.RingGeometry(.55, .6, 96),
    new THREE.MeshBasicMaterial({ color: 0x7dfff0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), .01);

  const ripples = [0, 1, 2, 3].map(() => {
    const m = flat(new THREE.RingGeometry(.985, 1, 128),
      new THREE.MeshBasicMaterial({ color: 0x5ffff0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), .012);
    m.visible = false;
    m.userData = { t0: -1, size: 8, dur: 3 };
    return m;
  });
  function ripple(size, dur) {
    const m = ripples.find((r) => !r.visible) || ripples[0];
    m.visible = true; m.userData.t0 = T; m.userData.size = size; m.userData.dur = dur;
  }

  /* ===================================================================
     TALLO (se dibuja con un frente de luz)
     =================================================================== */
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -2, 0), new THREE.Vector3(.09, -1.3, .03),
    new THREE.Vector3(-.07, -.6, -.02), new THREE.Vector3(0, 0, 0)
  ]);
  const TS = 120, RS = 8;
  const stemGeo = new THREE.TubeGeometry(stemCurve, TS, .04, RS, false);
  const aT = new Float32Array((TS + 1) * (RS + 1));
  for (let i = 0; i <= TS; i++) for (let j = 0; j <= RS; j++) aT[i * (RS + 1) + j] = i / TS;
  stemGeo.setAttribute('aT', new THREE.BufferAttribute(aT, 1));

  const stemMat = new THREE.ShaderMaterial({
    uniforms: { uDraw: { value: 0 }, uA: { value: new THREE.Color(.02, .35, .33) }, uB: { value: new THREE.Color(.45, 1, .85) }, uLine: { value: new THREE.Color(.8, 1, .95) } },
    vertexShader: `
      attribute float aT; varying float vT; varying vec3 vN; varying vec3 vV;
      void main(){ vT = aT; vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `
      uniform float uDraw; uniform vec3 uA, uB, uLine; varying float vT; varying vec3 vN; varying vec3 vV;
      void main(){
        if(vT > uDraw) discard;
        float rim = pow(1. - abs(dot(normalize(vN), normalize(vV))), 1.5);
        float head = 1. - smoothstep(0., .05, uDraw - vT);
        vec3 col = mix(uA, uB, rim) + uLine * head * 2.;
        gl_FragColor = vec4(col, 1.);
      }`
  });
  scene.add(new THREE.Mesh(stemGeo, stemMat));

  /* ===================================================================
     SUPERFICIES: pétalos y hojas (boceto → relleno)
     =================================================================== */
  function makeSurface(nu, nv, center, width, cup) {
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= nu; i++) {
      const u = i / nu, c = center(u), w = width(u);
      for (let j = 0; j <= nv; j++) {
        const v = (j / nv) * 2 - 1, x = v * w;
        pos.push(c.x + x, c.y, c.z - cup * x * x);
        uv.push(u, v);
      }
    }
    for (let i = 0; i < nu; i++) {
      for (let j = 0; j < nv; j++) {
        const a = i * (nv + 1) + j, b = a + 1, c = a + nv + 1, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  const surfVS = `
    varying vec2 vUV; varying vec3 vN; varying vec3 vV;
    void main(){
      vUV = uv; vN = normalize(normalMatrix*normal);
      vec4 mv = modelViewMatrix*vec4(position,1.); vV = -mv.xyz;
      gl_Position = projectionMatrix*mv;
    }`;
  const surfFS = `
    uniform float uDraw, uFill, uTime, uGlow; uniform vec3 uA, uB, uLine;
    varying vec2 vUV; varying vec3 vN; varying vec3 vV;
    void main(){
      float u = vUV.x, v = vUV.y;
      float front = uDraw + sin(v*3. + uTime*2.)*.012;
      if(u > front) discard;

      float edge = smoothstep(.9, 1., abs(v));
      float lu = abs(fract(u*14.) - .5), lv = abs(fract((v*.5+.5)*7.) - .5);
      float lines = max(1. - smoothstep(0., .035, lu), 1. - smoothstep(0., .05, lv));
      float rib = 1. - smoothstep(0., .03, abs(v));
      float sketch = max(max(edge, lines*.55), rib*.5);
      float head = 1. - smoothstep(0., .05, front - u);

      vec3 N = normalize(vN); if(!gl_FrontFacing) N = -N;
      float rim = pow(1. - abs(dot(N, normalize(vV))), 2.);
      float diff = .6 + .4*dot(N, normalize(vec3(.4,.6,.7)));

      float fillMask = 1. - smoothstep(uFill - .14, uFill, u);
      vec3 fillCol = mix(uA, uB, smoothstep(0., 1., u));
      float veins = (1. - smoothstep(0., .05, abs(fract(v*4. + .5) - .5))) * .12;
      fillCol = fillCol * diff + uB*veins + uLine*rim*.55 + uB*pow(1. - abs(v), 2.)*.12;
      fillCol *= 1. + uGlow*.5;
      if(!gl_FrontFacing) fillCol *= .8;

      vec3 col = fillCol * fillMask + uLine * sketch * (1. - fillMask*.65) * 1.25 + uLine * head * 1.8;
      float a = max(fillMask, max(sketch, head));
      if(a < .05) discard;
      gl_FragColor = vec4(col, 1.);
    }`;

  function surfMat(a, b, line) {
    return new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        uDraw: { value: 0 }, uFill: { value: 0 }, uTime: timeU, uGlow: glowU,
        uA: { value: new THREE.Color(a[0], a[1], a[2]) },
        uB: { value: new THREE.Color(b[0], b[1], b[2]) },
        uLine: { value: new THREE.Color(line[0], line[1], line[2]) }
      },
      vertexShader: surfVS, fragmentShader: surfFS
    });
  }

  /* ---- Cabeza del tulipán ---- */
  const head = new THREE.Group();
  scene.add(head);
  const items = [];   // elementos que se dibujan: tallo, hojas, pétalos

  items.push({
    kind: 'stem', start: .9, dur: 3.4, fillStart: 0, fillDur: 1,
    setDraw: (d) => { stemMat.uniforms.uDraw.value = d * 1.02; },
    setFill: () => {},
    tip: (d, out) => { out.copy(stemCurve.getPoint(clamp(d, 0, 1))); }
  });

  function addSurfaceItem(parent, geo, mat, start, dur, fillOffset, fillDur, tipFn) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    parent.add(mesh);
    const it = {
      kind: 'surf', mesh, start, dur, fillStart: start + fillOffset, fillDur,
      setDraw: (d) => { mat.uniforms.uDraw.value = d * 1.06; },
      setFill: (f) => { mat.uniforms.uFill.value = f * 1.2; },
      tip: (d, out) => { out.copy(tipFn(clamp(d, 0, 1))); mesh.localToWorld(out); }
    };
    items.push(it);
    return it;
  }

  /* ---- Hojas ---- */
  const leafMatArgs = [[0, .28, .27], [.3, .95, .72], [.6, 1, .92]];
  function addLeaf(yaw, L, start) {
    const center = (u) => new THREE.Vector3(0, L * (u - .42 * u * u), .95 * Math.pow(u, 1.8));
    const width = (u) => .2 * Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(u, .75))), .9);
    const geo = makeSurface(30, 12, center, width, .8);
    const holder = new THREE.Group();
    holder.position.y = -2; holder.rotation.y = yaw;
    scene.add(holder);
    addSurfaceItem(holder, geo, surfMat(...leafMatArgs), start, 2.0, .5, 2.2, center);
  }
  addLeaf(.4, 2.3, 3.4);
  addLeaf(Math.PI + .55, 2.0, 3.9);

  /* ---- Pétalos ---- */
  const petals = [];   // { pivot, tilt, closed, open, delay }
  function addPetal(angle, L, Wm, Rm, closedTilt, openTilt, start, openDelay) {
    const center = (u) => new THREE.Vector3(0, u * L, Rm * Math.sin(Math.PI * Math.pow(u, .8)));
    const width = (u) => Wm * Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(u, .62))), .85);
    const geo = makeSurface(32, 18, center, width, .35);
    const pivot = new THREE.Object3D();
    pivot.rotation.y = Math.PI / 2 - angle;
    const tilt = new THREE.Object3D();
    tilt.rotation.x = closedTilt;
    pivot.add(tilt); head.add(pivot);
    addSurfaceItem(tilt, geo, surfMat(CONFIG.petalBase, CONFIG.petalTip, CONFIG.petalLine), start, 1.6, .7, 1.6, center);
    petals.push({ tilt, closed: closedTilt, open: openTilt, delay: openDelay });
  }
  for (let k = 0; k < 3; k++) addPetal(k * Math.PI * 2 / 3, 1.6, .52, .5, .04, .58, 4.6 + k * .45, k * .09);
  for (let k = 0; k < 3; k++) addPetal(Math.PI / 3 + k * Math.PI * 2 / 3, 1.5, .46, .42, .02, .34, 6.4 + k * .45, .25 + k * .09);

  /* ---- Halo, rayos y pluma de luz ---- */
  const halo = makeSprite(glowTex, 1, 0, 0x66fff0);
  halo.position.set(0, .7, -.5);
  scene.add(halo);
  const rays = makeSprite(raysTex, 1, 0, 0x88fff4);
  rays.position.set(0, .7, -.7);
  scene.add(rays);
  const penGlow = makeSprite(glowTex, .55, 0, 0x7dfff2);
  const penCore = makeSprite(glowTex, .16, 0, 0xffffff);
  scene.add(penGlow, penCore);

  /* ===================================================================
     PARTÍCULAS (estela de la pluma, explosión, chispas ascendentes)
     =================================================================== */
  const PN = Math.round(1800 * Q);
  const pP = new Float32Array(PN * 3), pV = new Float32Array(PN * 3);
  const pL = new Float32Array(PN), pM = new Float32Array(PN).fill(1);
  const pS = new Float32Array(PN), pC = new Float32Array(PN * 3), pA = new Float32Array(PN);
  let pHead = 0;
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pP, 3).setUsage(THREE.DynamicDrawUsage));
  pGeo.setAttribute('aAlpha', new THREE.BufferAttribute(pA, 1).setUsage(THREE.DynamicDrawUsage));
  pGeo.setAttribute('aSize', new THREE.BufferAttribute(pS, 1));
  pGeo.setAttribute('aColor', new THREE.BufferAttribute(pC, 3));
  const pts = new THREE.Points(pGeo, new THREE.ShaderMaterial({
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
  }));
  pts.frustumCulled = false;
  scene.add(pts);

  const PALETTE = [[.3, 1, .95], [.6, 1, 1], [1, 1, 1], [0, .85, .9], [.45, 1, .8]];
  function emit(x, y, z, vx, vy, vz, life, size) {
    const i = pHead; pHead = (pHead + 1) % PN;
    pP[i * 3] = x; pP[i * 3 + 1] = y; pP[i * 3 + 2] = z;
    pV[i * 3] = vx; pV[i * 3 + 1] = vy; pV[i * 3 + 2] = vz;
    pL[i] = pM[i] = life; pS[i] = size;
    pC.set(PALETTE[(rand() * PALETTE.length) | 0], i * 3);
  }
  function burst(cx, cy, cz, n, speed) {
    for (let i = 0; i < n; i++) {
      const u = rand() * 2 - 1, a = rand() * 6.2832, s = Math.sqrt(1 - u * u), sp = (.3 + rand()) * speed;
      emit(cx, cy, cz, Math.cos(a) * s * sp, u * sp * .9 + .6, Math.sin(a) * s * sp, 1.6 + rand() * 2.2, .06 + rand() * .1);
    }
  }
  function updateParticles(dt) {
    const drag = Math.max(0, 1 - dt * .9);
    for (let i = 0; i < PN; i++) {
      if (pL[i] <= 0) { pA[i] = 0; continue; }
      pL[i] -= dt;
      const k = i * 3;
      pP[k] += pV[k] * dt; pP[k + 1] += pV[k + 1] * dt; pP[k + 2] += pV[k + 2] * dt;
      pV[k] *= drag; pV[k + 1] = pV[k + 1] * drag + .25 * dt; pV[k + 2] *= drag;
      pA[i] = Math.max(0, pL[i] / pM[i]);
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.aAlpha.needsUpdate = true;
    pGeo.attributes.aSize.needsUpdate = true;
    pGeo.attributes.aColor.needsUpdate = true;
  }

  /* ===================================================================
     CÁMARA
     =================================================================== */
  // [tiempo, radio, altura de cámara, altura del objetivo]
  const KEYS = [
    [0, 6.5, -1.3, -1.7], [2.5, 6.4, -.6, -1.0], [4.5, 6.3, -.1, -.4], [7.5, 5.8, .5, .45],
    [10, 5.4, .6, .55], [12.5, 7.4, .5, .4], [16, 8.0, .9, .45], [22, 7.2, .4, .4]
  ];
  const cr = (p0, p1, p2, p3, t) => {
    const t2 = t * t, t3 = t2 * t;
    return .5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  };
  function samplePath(time) {
    const n = KEYS.length, t = clamp(time, 0, KEYS[n - 1][0] - .001);
    let i = 0;
    while (i < n - 2 && t >= KEYS[i + 1][0]) i++;
    const u = (t - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0]);
    const K = (j) => KEYS[clamp(j, 0, n - 1)];
    return [1, 2, 3].map((c) => cr(K(i - 1)[c], K(i)[c], K(i + 1)[c], K(i + 2)[c], u));
  }

  const drag = { theta: 0, active: false, x: 0, moved: 0 };
  glEl.addEventListener('pointerdown', (e) => {
    drag.active = true; drag.x = e.clientX; drag.moved = 0;
    try { glEl.setPointerCapture(e.pointerId); } catch (_) {}
  });
  glEl.addEventListener('pointermove', (e) => {
    if (!drag.active) return;
    const dx = e.clientX - drag.x;
    drag.theta -= dx * .006; drag.moved += Math.abs(dx); drag.x = e.clientX;
  });
  const endDrag = () => {
    const wasTap = drag.active && drag.moved < 8;
    drag.active = false;
    if (wasTap && T > 16) reset();
  };
  glEl.addEventListener('pointerup', endDrag);
  glEl.addEventListener('pointercancel', () => { drag.active = false; });

  /* ===================================================================
     LÍNEA DE TIEMPO
     =================================================================== */
  let T = 0, running = false, burstDone = false, msgShown = false, replayShown = false, rippled = false;
  const clock = new THREE.Clock();
  const tip = new THREE.Vector3();
  let lastPen = null;

  function buildMessage() {
    msgEl.innerHTML = Array.from(CONFIG.message).map((ch, i) =>
      `<span style="animation-delay:${(i * .07).toFixed(2)}s">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
  }

  function reset() {
    T = 0; burstDone = false; msgShown = false; replayShown = false; rippled = false;
    pL.fill(0); pA.fill(0);
    glowU.value = 0;
    msgEl.classList.remove('show'); replayEl.classList.remove('show');
    petals.forEach((p) => { p.tilt.rotation.x = p.closed; });
    items.forEach((it) => { it.setDraw(0); it.setFill(0); });
    ripples.forEach((r) => { r.visible = false; });
    drag.theta = 0;
  }

  function update(dt) {
    T += dt;
    timeU.value += dt;

    /* --- dibujo de cada elemento --- */
    head.updateMatrixWorld(true);
    let active = null;
    for (const it of items) {
      const d = ease(prog(T, it.start, it.dur));
      it.setDraw(d);
      it.setFill(ease(prog(T, it.fillStart, it.fillDur)));
      if (d > 0 && d < 1) active = it;
    }
    if (!rippled && T > .6) { rippled = true; ripple(7, 3.2); }

    // pluma de luz + estela
    if (active) {
      const d = ease(prog(T, active.start, active.dur));
      active.tip(d, tip);
      lastPen = active;
      penGlow.position.copy(tip); penCore.position.copy(tip);
      penGlow.material.opacity = Math.min(1, penGlow.material.opacity + dt * 6);
      penCore.material.opacity = penGlow.material.opacity;
      const s = .45 + .1 * Math.sin(T * 14);
      penGlow.scale.set(s, s, 1);
      for (let k = 0; k < 3; k++) {
        emit(tip.x + (rand() - .5) * .06, tip.y + (rand() - .5) * .06, tip.z + (rand() - .5) * .06,
          (rand() - .5) * .35, (rand() - .2) * .35, (rand() - .5) * .35, .7 + rand() * 1.1, .05 + rand() * .06);
      }
    } else {
      penGlow.material.opacity = Math.max(0, penGlow.material.opacity - dt * 3);
      penCore.material.opacity = penGlow.material.opacity;
    }

    /* --- suelo --- */
    const gp = smooth(0, 1.5, T);
    groundGlow.material.opacity = gp * (.32 + .06 * Math.sin(T * 1.3));
    baseRing.material.opacity = gp * (.55 + .25 * Math.sin(T * 2));
    baseRing.scale.setScalar(1 + .04 * Math.sin(T * 2));
    for (const r of ripples) {
      if (!r.visible) continue;
      const p = (T - r.userData.t0) / r.userData.dur;
      if (p >= 1) { r.visible = false; continue; }
      r.scale.setScalar(.8 + p * r.userData.size);
      r.material.opacity = Math.pow(1 - p, 1.7) * .85;
    }

    /* --- floración --- */
    const BT = 9.8;
    const bp = prog(T, BT, 3.4);
    petals.forEach((p, i) => {
      const e = backOut(prog(T, BT + p.delay, 3.0));
      let tilt = lerp(p.closed, p.open, e);
      if (T > 13.5) tilt += Math.sin(T * 1.1 + i) * .015 * smooth(13.5, 15, T);
      p.tilt.rotation.x = tilt;
    });
    if (!burstDone && T >= BT + .15) {
      burstDone = true;
      burst(0, .6, 0, Math.round(650 * Q), 3.2);
      ripple(11, 3.6);
      setTimeout(() => ripple(8, 3.2), 450);
    }
    const g = smooth(BT, BT + 2.6, T);
    glowU.value = T > BT ? Math.exp(-(T - BT - .3) * 1.1) * .9 + .12 * Math.sin(T * 1.5) * g : 0;
    halo.scale.setScalar(lerp(.1, 6.2, g));
    halo.material.opacity = g * (.55 + .12 * Math.sin(T * 1.7));
    rays.scale.setScalar(lerp(.1, 11, g));
    rays.material.opacity = g * .32;
    rays.material.rotation = T * .12;

    if (T > BT + 1.5 && rand() < .55) {      // chispas que suben después de florecer
      const a = rand() * 6.2832, r = .2 + rand() * 1.6;
      emit(Math.cos(a) * r, -1.7 + rand() * 2.8, Math.sin(a) * r, 0, .15 + rand() * .3, 0, 2.5 + rand() * 2.5, .04 + rand() * .06);
    }

    if (!msgShown && T > 11.5) { msgShown = true; msgEl.classList.add('show'); }
    if (!replayShown && T > 16) { replayShown = true; replayEl.classList.add('show'); }

    updateParticles(dt);

    /* --- cámara --- */
    if (!drag.active) drag.theta *= Math.exp(-dt * .3);
    const [r0, camY, ty] = samplePath(T);
    const fit = camera.aspect < 1 ? 1 + (1 - camera.aspect) * .55 : 1;
    const R = r0 * fit;
    const theta = -.6 * (1 - ease(prog(T, 0, 5))) + .35 * Math.sin(T * .22) + drag.theta;
    const shake = T > BT ? Math.exp(-(T - BT) * 3) * .02 : 0;
    camera.position.set(
      Math.sin(theta) * R + (rand() - .5) * shake,
      camY + (rand() - .5) * shake,
      Math.cos(theta) * R);
    camera.lookAt(0, ty, 0);

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
  window.Tulipan = {
    start() { reset(); clock.getDelta(); running = true; },
    reset,
    stop() { running = false; }
  };
  $('tulip-start').addEventListener('click', () => {
    resize();
    window.Tulipan.start();
  });
})();
