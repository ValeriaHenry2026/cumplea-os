document.addEventListener('DOMContentLoaded',()=>{
if (!document.body.classList.contains('page-main')) return;

const CFG={inicio:new Date('2026-03-21T00:00:00')};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],R=(a,b)=>a+Math.random()*(b-a);
const COL=['#35CFC4','#BDF5F0','#D9B96E','#fff','#168F8A'],FC=['#35CFC4','#168F8A','#D9B96E','#00fff7','#8f7bff'];

/* canvas: corazones flotantes + estela + fuegos artificiales */
const fit=c=>{const d=Math.min(devicePixelRatio||1,2);c.width=innerWidth*d;c.height=innerHeight*d;c.getContext('2d').setTransform(d,0,0,d,0,0)};
const mk=id=>{const c=document.createElement('canvas');c.id=id;document.body.appendChild(c);fit(c);return c};
const fx=mk('fx'),fw=mk('fw'),x=fx.getContext('2d'),w=fw.getContext('2d');
addEventListener('resize',()=>{fit(fx);fit(fw)});
const G=['♡','✦','✿','✧'],P=[],S=[],F=[],K=[];
const fl=r=>({x:R(0,innerWidth),y:r?innerHeight+20:R(0,innerHeight),vy:-R(.2,.7),ph:R(0,6),s:R(10,22),c:G[Math.random()*4|0],col:COL[Math.random()*5|0],a:R(.12,.35)});
for(let i=0;i<26;i++)P.push(fl());
const spark=(px,py,n=1,sp=2)=>{for(let i=0;i<n;i++){const a=R(0,6.28),v=R(.3,sp);S.push({x:px,y:py,vx:Math.cos(a)*v,vy:Math.sin(a)*v-.5,l:1,s:R(8,16),c:G[Math.random()*4|0],col:FC[Math.random()*5|0]})}};
const draw=(a,col,s,c,px,py)=>{x.globalAlpha=a;x.fillStyle=col;x.font=s+'px serif';x.fillText(c,px,py)};
const loop=t=>{x.clearRect(0,0,innerWidth,innerHeight);
 P.forEach(p=>{p.y+=p.vy;p.x+=Math.sin(t/1500+p.ph)*.4;if(p.y<-30)Object.assign(p,fl(1));draw(p.a,p.col,p.s,p.c,p.x,p.y)});
 for(let i=S.length-1;i>=0;i--){const s=S[i];s.x+=s.vx;s.y+=s.vy;s.vy+=.04;s.l-=.02;if(s.l<=0){S.splice(i,1);continue}draw(s.l,s.col,s.s,s.c,s.x,s.y)}
 x.globalAlpha=1;requestAnimationFrame(loop)};requestAnimationFrame(loop);
let lt=0;addEventListener('pointermove',e=>{const n=Date.now();if(n-lt>45){lt=n;spark(e.clientX,e.clientY,1,1)}});
addEventListener('click',e=>spark(e.clientX,e.clientY,10,3));

const boom=(bx,by)=>{const c=FC[Math.random()*5|0];for(let i=0;i<70;i++){const a=i/70*6.28,v=R(1,5);F.push({x:bx,y:by,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:Math.random()<.3?FC[2]:c})}};
const shoot=()=>K.push({x:R(.15,.85)*innerWidth,y:innerHeight,t:R(.15,.5)*innerHeight});
const show=(n=6,gap=450)=>{for(let i=0;i<n;i++)setTimeout(shoot,i*gap)};
const fwl=()=>{w.globalCompositeOperation='destination-out';w.fillStyle='rgba(0,0,0,.18)';w.fillRect(0,0,innerWidth,innerHeight);w.globalCompositeOperation='source-over';
 for(let i=K.length-1;i>=0;i--){const k=K[i];k.y-=10;w.fillStyle='#D9B96E';w.fillRect(k.x,k.y,3,10);if(k.y<=k.t){boom(k.x,k.y);K.splice(i,1)}}
 for(let i=F.length-1;i>=0;i--){const f=F[i];f.x+=f.vx;f.y+=f.vy;f.vx*=.97;f.vy=f.vy*.97+.05;f.l-=.014;if(f.l<=0){F.splice(i,1);continue}w.globalAlpha=f.l;w.fillStyle=f.c;w.beginPath();w.arc(f.x,f.y,2.4,0,6.28);w.fill()}
 w.globalAlpha=1;requestAnimationFrame(fwl)};fwl();

/* typewriter sin saltos de layout */
const pre=e=>{e.dataset.t=e.textContent.trim();e.innerHTML='<span></span><span style="visibility:hidden"></span>';e.lastChild.textContent=e.dataset.t;return e};
const ty=e=>new Promise(r=>{const[a,b]=e.children,t=e.dataset.t;let i=0;a.className='tc';(function g(){a.textContent=t.slice(0,++i);b.textContent=t.slice(i);if(i<t.length)setTimeout(g,24);else{a.className='';r()}})()});
const tw=$$('.hero-text,.bible-verse p,.prayer-text').map(pre),fp=$$('#final-message p').map(pre);
const io=new IntersectionObserver(es=>es.forEach(async e=>{if(!e.isIntersecting)return;io.unobserve(e.target);for(const t of tw.filter(t=>t.closest('section')===e.target))await ty(t)}),{threshold:.4});
new Set(tw.map(t=>t.closest('section'))).forEach(s=>io.observe(s));

/* el 20 cuenta de 0 a 20 y estallan fuegos artificiales */
const n20=$('.number-20');n20.textContent='0';
$('#open-gift-btn').addEventListener('click',()=>setTimeout(()=>{let s=null;const f=t=>{s=s||t;const p=Math.min((t-s)/1800,1);n20.textContent=Math.round(20*(1-Math.pow(1-p,3)));p<1?requestAnimationFrame(f):show(3,350)};requestAnimationFrame(f)},1300));

/* contador en vivo */
const upd=()=>{const d=Math.max(0,Date.now()-CFG.inicio),v=[Math.floor(d/864e5),Math.floor(d/36e5)%24,Math.floor(d/6e4)%60,Math.floor(d/1e3)%60];$$('#time-grid b').forEach((b,i)=>b.textContent=v[i])};upd();setInterval(upd,1000);

/* tilt 3D en tarjetas (solo mouse) */
$$('.glass-card:not(.modal)').forEach(c=>{c.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=c.getBoundingClientRect();c.style.transform=`perspective(700px) rotateY(${((e.clientX-r.left)/r.width-.5)*8}deg) rotateX(${-((e.clientY-r.top)/r.height-.5)*8}deg)`});c.addEventListener('pointerleave',()=>c.style.transform='')});

/* fotos: placeholder local (el de via.placeholder.com ya no existe) */
$$('.photo-card img').forEach((im,i)=>{const ph=()=>{im.onerror=null;im.src='data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="#BDF5F0"/><stop offset="1" stop-color="#35CFC4"/></linearGradient></defs><rect width="300" height="400" fill="url(#g)"/><text x="150" y="210" font-size="26" text-anchor="middle" fill="#fff" font-family="sans-serif">Foto ${i+1} ♡</text></svg>`)};im.onerror=ph;if(im.complete&&!im.naturalWidth)ph()});

/* momentos especiales */
$$('.reason-item').forEach(b=>b.addEventListener('click',e=>spark(e.clientX,e.clientY,22,4)));
const gal=$('#gallery-section');let un=0;
new MutationObserver(()=>{if(!un&&gal.classList.contains('unlocked')){un=1;show(4,300);setTimeout(()=>gal.scrollIntoView({behavior:'smooth',block:'center'}),1500)}}).observe(gal,{attributes:true,attributeFilter:['class']});
$('#btn-infinito').addEventListener('click',()=>show(3,300));
$('#surprise-btn').addEventListener('click',async()=>{show(16,500);await new Promise(r=>setTimeout(r,900));for(const p of fp)await ty(p);spark(innerWidth/2,innerHeight/2,60,6);show(6,400)});
});

if (document.body.classList.contains('page-almas')) {
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
  autoStart: false,
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
    window.__epicReady = true; window.dispatchEvent(new Event('epic:ready'));
  });

  // API opcional para integrarlo en tu página principal
  window.Almas = {
    start() { reset(); clock.getDelta(); running = true; },
    reset,
    stop() { running = false; }
  };
})();
}

if (document.body.classList.contains('page-candado')) {
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
  autoStart: false,
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
    window.__epicReady = true; window.dispatchEvent(new Event('epic:ready'));
  });

  // API opcional para integrarlo en tu página principal
  window.Candado = {
    start() { reset(); clock.getDelta(); running = true; },
    reset,
    stop() { running = false; }
  };
})();
}

if (document.body.classList.contains('page-tulipan') || document.body.classList.contains('page-main')) {
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
    window.__epicReady = true; window.dispatchEvent(new Event('epic:ready'));
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
}
