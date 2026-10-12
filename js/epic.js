document.addEventListener('DOMContentLoaded',()=>{

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
